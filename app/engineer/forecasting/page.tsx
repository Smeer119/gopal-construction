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
  ArrowLeft, Check, X, FileText, Trash2
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
      const pdfFileName = `pourcards_${pdfDate}.pdf`; // Fixed path: no nested folder

      // Upload PDF to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("pourcards")
        .upload(pdfFileName, doc.output("blob"), {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }

      // Save PDF metadata to pourcards table (one entry per checklist)
      const inserts = multiSelectedChecklists.map((checklist) => ({
        user_id: currentUser?.id,
        file_path: pdfFileName, // Use corrected path
        main_topic: checklist.mainTopic,
        sub_topic: checklist.subTopic,
        date: checklist.date,
        description: checklist.description,
      }));

      const { error: insertError } = await supabase
        .from("pourcards")
        .insert(inserts);

      if (insertError) {
        throw new Error(`Failed to save pourcard metadata: ${insertError.message}`);
      }

      // Download the PDF
      doc.save(`pourcard_${pdfDate}.pdf`);
      toast({ title: "Success", description: "PDF generated and saved to Supabase", variant: "default" });
    } catch (err) {
  const errorMessage = err instanceof Error ? err.message : String(err);
  toast({
    title: "Error",
    description: `Failed to generate or save PDF: ${errorMessage}`,
    variant: "destructive"
  });
}

  };

  if (loading) {
    return (
      <DashboardLayout role="worker">
        <div className="p-4 flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="worker">
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

        {/* Selection UI */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Checklist Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label>Main Topic</Label>
                <Select onValueChange={setTempMainTopic} value={tempMainTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a main topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(constructionData).map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tempMainTopic &&
                typeof constructionData[tempMainTopic] === "object" &&
                !Array.isArray(constructionData[tempMainTopic]) && (
                  <div className="space-y-2">
                    <Label>Sub-Topic</Label>
                    <Select onValueChange={setTempSubTopic} value={tempSubTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sub-topic" />
                      </SelectTrigger>
                      <SelectContent>
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
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70%]">Task</TableHead>
                      <TableHead className="text-center">Yes</TableHead>
                      <TableHead className="text-center">No</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checklist.items.map((item, itemIdx) => (
                      <TableRow key={itemIdx}>
                        <TableCell>{item.task}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={item.completed === true ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateChecklistItem(idx, itemIdx, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={item.completed === false ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => updateChecklistItem(idx, itemIdx, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

