"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Check, X, FileText, Trash2, Eye, Download
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import { constructionData, ConstructionData } from "./data";

// Types
type ChecklistItem = { task: string; completed: boolean | null };
type ChecklistData = {
  mainTopic: string;
  subTopic?: string;
  items: ChecklistItem[];
  generatedBy: string;
  date: string;
  description: string;
};

export default function ConstructionChecklistPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tempMainTopic, setTempMainTopic] = useState("");
  const [tempSubTopic, setTempSubTopic] = useState("");
  const [tempDate, setTempDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [tempDescription, setTempDescription] = useState("");
  const [multiSelectedChecklists, setMultiSelectedChecklists] = useState<ChecklistData[]>([]);
  const [generatedPdfs, setGeneratedPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          const fullName = profile?.full_name || user.email || "Anonymous User";
          setUserName(fullName);
        } else {
          setUserName("Anonymous User");
        }

        const saved = localStorage.getItem("multiChecklists");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setMultiSelectedChecklists(parsed);
            } else {
              throw new Error("Invalid checklist data in localStorage");
            }
          } catch (parseError) {
            toast({ title: "Error", description: "Failed to load saved checklists", variant: "destructive" });
          }
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  useEffect(() => {
    localStorage.setItem("multiChecklists", JSON.stringify(multiSelectedChecklists));
  }, [multiSelectedChecklists]);

  // Load current user's generated PDFs
  const loadGeneratedPdfs = async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("pourcards")
      .select("id, file_path, date, description, created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("Failed to load PDFs", error);
      return;
    }
    setGeneratedPdfs(data || []);
  };

  useEffect(() => {
    // when auth state is ready, fetch user's PDFs
    if (currentUser) {
      loadGeneratedPdfs();
    }
  }, [currentUser]);

  const viewPdf = async (filePath: string) => {
    // Use signed URL so bucket can remain private
    const { data, error } = await supabase.storage
      .from("pourcards")
      .createSignedUrl(filePath, 60 * 60); // 1 hour
    if (error || !data?.signedUrl) {
      toast({ title: "Error", description: "Failed to create view link", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const downloadPdf = async (filePath: string) => {
    const { data, error } = await supabase.storage.from("pourcards").download(filePath);
    if (error || !data) {
      toast({ title: "Error", description: "Failed to download PDF", variant: "destructive" });
      return;
    }
    const blobUrl = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filePath.split("/").pop() || "pourcard.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handleAddChecklist = () => {
    let tasks: string[] = [];

    if (!tempMainTopic) {
      toast({ title: "Error", description: "Please select a main topic", variant: "destructive" });
      return;
    }

    if (!tempDate) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }

    const mainTopicData = constructionData[tempMainTopic];

    if (tempSubTopic) {
      if (typeof mainTopicData === "object" && !Array.isArray(mainTopicData)) {
        tasks = mainTopicData[tempSubTopic] || [];
      } else {
        toast({
          title: "Error",
          description: "Selected main topic does not support sub-topics",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (Array.isArray(mainTopicData)) {
        tasks = mainTopicData;
      } else {
        toast({
          title: "Error",
          description: "Selected main topic requires a sub-topic",
          variant: "destructive",
        });
        return;
      }
    }

    if (tasks.length === 0) {
      toast({ title: "Error", description: "No tasks found for the selected topic", variant: "destructive" });
      return;
    }

    const newChecklist: ChecklistData = {
      mainTopic: tempMainTopic,
      subTopic: tempSubTopic || undefined,
      items: tasks.map((task) => ({ task, completed: null })),
      generatedBy: userName,
      date: tempDate,
      description: tempDescription,
    };

    setMultiSelectedChecklists((prev) => [...prev, newChecklist]);
    setTempMainTopic("");
    setTempSubTopic("");
    setTempDescription("");
  };

  const updateChecklistItem = (checklistIndex: number, itemIndex: number, status: boolean) => {
    const updated = [...multiSelectedChecklists];
    updated[checklistIndex].items[itemIndex].completed = status;
    setMultiSelectedChecklists(updated);
  };

  const updateChecklistDetails = (checklistIndex: number, field: "date" | "description", value: string) => {
    const updated = [...multiSelectedChecklists];
    updated[checklistIndex][field] = value;
    if (field === "date") {
      updated[checklistIndex].items = updated[checklistIndex].items.map((item) => ({
        ...item,
        completed: null,
      }));
    }
    setMultiSelectedChecklists(updated);
  };

  const removeChecklist = (checklistIndex: number) => {
    const updated = multiSelectedChecklists.filter((_, index) => index !== checklistIndex);
    setMultiSelectedChecklists(updated);
    toast({ title: "Success", description: "Checklist removed", variant: "default" });
  };

  const generatePDF = async () => {
    if (multiSelectedChecklists.length === 0) {
      toast({ title: "Error", description: "No checklists to generate PDF", variant: "destructive" });
      return;
    }

    try {
      const doc = new jsPDF();
      let yOffset = 10;

      multiSelectedChecklists.forEach((checklist, index) => {
        if (index > 0) {
          doc.addPage();
          yOffset = 10;
        }

        const title = `${checklist.mainTopic}${checklist.subTopic ? ` - ${checklist.subTopic}` : ""} Pourcard`;
        doc.text(title, 10, yOffset);
        yOffset += 10;
        doc.text(`Generated by: ${checklist.generatedBy}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Date: ${checklist.date}`, 10, yOffset);
        yOffset += 10;
        if (checklist.description) {
          doc.text(`Description: ${checklist.description}`, 10, yOffset);
          yOffset += 10;
        }

        autoTable(doc, {
          startY: yOffset,
          head: [["Task", "Status"]],
          body: checklist.items.map((item) => [
            item.task,
            item.completed === true ? "Yes" : item.completed === false ? "No" : "N/A",
          ]),
        });

        yOffset = (doc as any).lastAutoTable.finalY + 10;
      });

      const pdfDate = multiSelectedChecklists[0]?.date || format(new Date(), "yyyy-MM-dd");
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      // Store under a per-user folder to avoid collisions and simplify RLS
      const pdfFileName = `${currentUser.id}/pourcards_${pdfDate}.pdf`;

      // Upload PDF to Supabase Storage (build a robust Blob)
      const arrayBuffer = doc.output("arraybuffer");
      const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
      const { error: uploadError } = await supabase.storage
        .from("pourcards")
        .upload(pdfFileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }

      // Save a single metadata row per generated PDF
      const { error: insertError } = await supabase
        .from("pourcards")
        .insert({
          user_id: currentUser.id,
          file_path: pdfFileName,
          date: pdfDate,
          description: tempDescription || `${multiSelectedChecklists.length} checklist(s)`,
        });

      if (insertError) {
        throw new Error(`Failed to save pourcard metadata: ${insertError.message}`);
      }

      // Optional local download for the user
      doc.save(`pourcard_${pdfDate}.pdf`);
      toast({ title: "Success", description: "PDF generated and saved", variant: "default" });

      // refresh list
      loadGeneratedPdfs();
    } catch (err) {
    toast({
  title: "Error",
  description: `Failed to generate or save PDF: ${
    err instanceof Error ? err.message : String(err)
  }`,
  variant: "destructive",
});

    }
  };

  if (loading) {
    return (
      <DashboardLayout role="engineer">
        <div className="p-4 flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="engineer">
      <div className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Construction Checklist</h1>
            <p className="text-sm text-gray-600">Create and manage construction checklists</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/engineer">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button onClick={() => router.push("/pourcards")}>
              <FileText className="w-4 h-4 mr-2" />
              View Generated Pourcards
            </Button>
          </div>
        </div>

    <Card className="mb-6">
  <CardHeader>
    <CardTitle>Select Checklist Topic</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end overflow-visible">
      {/* Main Topic */}
      <div className="space-y-2 relative">
        <Label>Main Topic</Label>
        <Select onValueChange={setTempMainTopic} value={tempMainTopic}>
          <SelectTrigger>
            <SelectValue placeholder="Select a main topic" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {Object.keys(constructionData).map((topic) => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}

        {/* Generated PDFs list */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generated PDFs</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedPdfs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No PDFs yet. Generate one to see it here.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedPdfs.map((pdf: any) => (
                      <TableRow key={pdf.id}>
                        <TableCell>{pdf.date}</TableCell>
                        <TableCell className="max-w-[360px] truncate">{pdf.description || "-"}</TableCell>
                        <TableCell>{pdf.file_path}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="secondary" size="sm" onClick={() => viewPdf(pdf.file_path)}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => downloadPdf(pdf.file_path)}>
                            <Download className="w-4 h-4 mr-2" /> Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </SelectContent>
        </Select>
      </div>

      {/* Sub-Topic */}
      {tempMainTopic &&
        typeof constructionData[tempMainTopic] === "object" &&
        !Array.isArray(constructionData[tempMainTopic]) && (
          <div className="space-y-2 relative">
            <Label>Sub-Topic</Label>
            <Select onValueChange={setTempSubTopic} value={tempSubTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sub-topic" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {Object.keys(constructionData[tempMainTopic] as { [subTopic: string]: string[] }).map(
                  (subTopic) => (
                    <SelectItem key={subTopic} value={subTopic}>
                      {subTopic}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        )}




              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>

              <div className="mt-4 md:mt-0 flex gap-2">
                <Button onClick={handleAddChecklist}>Add</Button>
                <Button onClick={generatePDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {multiSelectedChecklists.map((checklist, idx) => (
          <Card className="mb-6" key={idx}>
            <CardHeader>
              <CardTitle>
                {checklist.mainTopic}
                {checklist.subTopic && ` > ${checklist.subTopic}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeChecklist(idx)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <h3 className="font-medium">Task</h3>
                    <div className="flex gap-8">
                      <span className="w-16 text-center">Yes</span>
                      <span className="w-16 text-center">No</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {checklist.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx} 
                        className="flex items-center justify-between p-3 bg-white border rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-800">{item.task}</span>
                        <div className="flex gap-4">
                          <Button
                            variant={item.completed === true ? "default" : "outline"}
                            size="sm"
                            className={`w-16 h-9 ${item.completed === true ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={() => updateChecklistItem(idx, itemIdx, true)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Yes
                          </Button>
                          <Button
                            variant={item.completed === false ? "destructive" : "outline"}
                            size="sm"
                            className={`w-16 h-9 ${item.completed === false ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            onClick={() => updateChecklistItem(idx, itemIdx, false)}
                          >
                            <X className="h-4 w-4 mr-1" /> No
                          </Button>
                        </div>
                      </div>
                    ))}
          </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}




