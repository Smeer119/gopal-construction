"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  X,
  FileText,
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  User,
  PenLine,
  HardHat,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

// Define your construction data structure
const constructionData = {
  "**Site Analysis & Preparation": [
    "Site Location And Access",
    "Road & Transportation Accessibility",
    "Water & Electricity Accessibility", 
    "Land Surveying",
    "Topographical Survey (Contour,Slopes Map)",
    "Soil Investigation",
    "Site Clearance"
  ],
  "**Design & Planning": [
    "Authorization & Sanctions From Government Bodies",
    "Contour Maps/Topographical Designs",
    "Architectural Designs",
    "Structural Designs",
    "3D Elevation Designs",
    "PEB/Fabrication Drawings",
    "Interior Design",
    "Electrical Drawings",
    "Plumbing & Sanitary Drawings",
    "HVAC Drawings",
    "Fire Fighting & Safety Drawings"
  ],
  "**Foundation": {
    "***Footing Schedule": [
      "Sight Out, Boundary Alignment & Dimensions Of Footing",
      "Excavation (Footing)",
      "Lead & Lift (Footing)",
      "Dewatering (Footing) If Needed",
      "Base Clearance (Footing)",
      "Soling & Compaction (Footing)",
      "P.C.C (Footing)",
      "Centerline Lineout (Footing)",
      "Footing B.B.S (Footing)",
      "Shuttering Of (Footing)",
      "Pedestal B.B.S & Erection On Footing",
      "Consultation Checking (Footing)",
      "Footing Casting (Footing)",
      "Footing De-shuttering (Footing)",
      "Centerline & Column Starter (Footing)",
      "Pedestal Shuttering (Footing)",
      "Pedestal Casting (Footing)",
      "Backfilling & Ground Levelling (Footing)",
      "Curing (Footing)",
      "Other (Footing)"
    ],
    "***Raft/Mat Foundation Schedule": [
      "Sight Out, Boundary Alignment & Dimensions Of (Raft Foundation)",
      "Excavation (Raft Foundation)",
      "Lead & Lift (Raft Foundation)",
      "Dewatering (Raft Foundation) If Needed",
      "Base Clearance (Raft Foundation)",
      "Soling & Compaction (Raft Foundation)",
      "P.C.C/ Blinding Layer (Raft Foundation)",
      "Waterproofing (Raft Foundation)",
      "Centerline Lineout (Raft Foundation)",
      "Reinforcement Mesh (Raft Foundation)",
      "Shuttering/ Edges Or Boundaries Formwork (Raft Foundation)",
      "Consultation Checking (Raft Foundation)",
      "Casting (Raft Foundation)",
      "De-shuttering (Raft Foundation)",
      "Backfilling & Ground Levelling (Raft Foundation)",
      "Curing (Raft Foundation)",
      "Other (Raft Foundation)"
    ]
  }
};

type ChecklistItem = {
  task: string;
  completed: boolean | null; // null = not answered
};

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [selectedMainTopic, setSelectedMainTopic] = useState("");
  const [selectedSubTopic, setSelectedSubTopic] = useState("");
  const [checklistData, setChecklistData] = useState<ChecklistData>({
    mainTopic: "",
    subTopic: "",
    items: [],
    generatedBy: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: ""
  });
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [generatedPdfs, setGeneratedPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user data and saved checklists
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (user) {
          // Get user's name from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          
          setUserName(profile?.full_name || user.email || "");
          setChecklistData(prev => ({
            ...prev,
            generatedBy: profile?.full_name || user.email || ""
          }));

          // Load generated PDFs for this user
          const { data: pdfs } = await supabase
            .storage
            .from("scheduling")
            .list("reports", {
              limit: 100,
              offset: 0,
              sortBy: { column: "created_at", order: "desc" }
            });
          
          setGeneratedPdfs(pdfs || []);
        }

        // Load saved checklist from localStorage
        const savedChecklist = localStorage.getItem("constructionChecklist");
        if (savedChecklist) {
          setChecklistData(JSON.parse(savedChecklist));
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Save checklist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("constructionChecklist", JSON.stringify(checklistData));
  }, [checklistData]);

  // Handle main topic selection
  const handleMainTopicChange = (value: string) => {
    const cleanValue = value.replace("**", "").trim();
    setSelectedMainTopic(cleanValue);
    setSelectedSubTopic("");
    
    // Initialize checklist items if no subtopics
    if (typeof constructionData[value as keyof typeof constructionData] !== "object" || 
        Array.isArray(constructionData[value as keyof typeof constructionData])) {
      const items = (constructionData[value as keyof typeof constructionData] as string[]).map(task => ({
        task,
        completed: null
      }));
      
      setChecklistData({
        ...checklistData,
        mainTopic: cleanValue,
        subTopic: undefined,
        items
      });
    } else {
      setChecklistData({
        ...checklistData,
        mainTopic: cleanValue,
        subTopic: undefined,
        items: []
      });
    }
  };

  // Handle sub-topic selection
  const handleSubTopicChange = (value: string) => {
    const cleanValue = value.replace("***", "").trim();
    setSelectedSubTopic(cleanValue);
    
    // Initialize checklist items
    const mainTopicKey = `**${selectedMainTopic}` as keyof typeof constructionData;
    if (typeof constructionData[mainTopicKey] === "object" && !Array.isArray(constructionData[mainTopicKey])) {
      const subTopicKey = `***${cleanValue}` as keyof typeof constructionData[typeof mainTopicKey];
      const items = (constructionData[mainTopicKey][subTopicKey] as string[]).map(task => ({
        task,
        completed: null
      }));
      
      setChecklistData({
        ...checklistData,
        subTopic: cleanValue,
        items
      });
    }
  };

  // Update checklist item status
  const updateChecklistItem = (index: number, completed: boolean) => {
    const newItems = [...checklistData.items];
    newItems[index].completed = completed;
    setChecklistData({
      ...checklistData,
      items: newItems
    });
  };

  // Generate PDF report
  const generatePDF = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Create PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Add header information
      doc.setFontSize(16);
      doc.text("Construction Checklist Report", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Generated by: ${checklistData.generatedBy}`, 20, 30);
      doc.text(`Date: ${format(new Date(checklistData.date), "PPPP")}`, 20, 37);
      
      if (checklistData.description) {
        doc.text(`Description: ${checklistData.description}`, 20, 44);
      }

      // Add main topic and sub-topic
      doc.setFontSize(14);
      let yPos = checklistData.description ? 54 : 50;
      doc.text(`Main Topic: ${checklistData.mainTopic}`, 20, yPos);
      
      if (checklistData.subTopic) {
        doc.text(`Sub-Topic: ${checklistData.subTopic}`, 20, yPos + 7);
        yPos += 7;
      }

      yPos += 10;

      // Add checklist table
      const tableData = checklistData.items.map(item => [
        item.task,
        item.completed === true ? "✅ Yes" : item.completed === false ? "❌ No" : "⬜ Not Answered"
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Task", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold"
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 30 }
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        }
      });

      // Add signature placeholders
      const lastPageHeight = doc.lastAutoTable?.finalY ?? 100;

      const signatureY = Math.max(lastPageHeight + 20, 180);
      
      doc.setFontSize(12);
      doc.text("Engineer:", 30, signatureY);
      doc.line(30, signatureY + 2, 80, signatureY + 2);
      
      doc.text("PMC / Consultant / Client:", 90, signatureY);
      doc.line(90, signatureY + 2, 140, signatureY + 2);
      
      doc.text("Contractor:", 150, signatureY);
      doc.line(150, signatureY + 2, 180, signatureY + 2);

      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        "Construction Project Management System",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );

      // Generate PDF file name
      const fileName = `checklist_${checklistData.mainTopic}_${Date.now()}.pdf`;
      const pdfBlob = doc.output("blob");

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("scheduling")
        .upload(`reports/${fileName}`, pdfBlob, {
          contentType: "application/pdf",
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("scheduling")
        .getPublicUrl(`reports/${fileName}`);

      // Save to database (optional)
      await supabase.from("construction_checklists").insert({
        user_id: currentUser.id,
        main_topic: checklistData.mainTopic,
        sub_topic: checklistData.subTopic,
        checklist_data: checklistData,
        pdf_url: urlData.publicUrl
      });

      // Download PDF
      doc.save(fileName);

      toast({
        title: "Success",
        description: "Checklist PDF generated and saved",
      });

      // Refresh PDF list
      const { data: pdfs } = await supabase
        .storage
        .from("scheduling")
        .list("reports", {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" }
        });
      
      setGeneratedPdfs(pdfs || []);

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="worker">
      <div className="p-4">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Construction Checklist</h1>
            <p className="text-sm text-gray-600">Create and manage construction checklists</p>
          </div>
          <Link href="/dashboard/engineer">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Topic Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Checklist Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Main Topic</Label>
                <Select onValueChange={handleMainTopicChange} value={`**${selectedMainTopic}`}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a main topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(constructionData).map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic.replace("**", "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMainTopic && 
                typeof constructionData[`**${selectedMainTopic}` as keyof typeof constructionData] === "object" &&
                !Array.isArray(constructionData[`**${selectedMainTopic}` as keyof typeof constructionData]) && (
                  <div className="space-y-2">
                    <Label>Sub-Topic</Label>
                    <Select onValueChange={handleSubTopicChange} value={`***${selectedSubTopic}`}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sub-topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(
                          constructionData[`**${selectedMainTopic}` as keyof typeof constructionData] as object
                        ).map((subTopic) => (
                          <SelectItem key={subTopic} value={subTopic}>
                            {subTopic.replace("***", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Checklist Display */}
        {checklistData.items.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {checklistData.mainTopic}
                {checklistData.subTopic && ` > ${checklistData.subTopic}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70%]">Task</TableHead>
                      <TableHead className="text-center">Yes</TableHead>
                      <TableHead className="text-center">No</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checklistData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.task}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={item.completed === true ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateChecklistItem(index, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={item.completed === false ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => updateChecklistItem(index, false)}
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
        )}

        {/* PDF Generation Form */}
        {checklistData.items.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generate PDF Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Generated by</Label>
                  <Input
                    value={checklistData.generatedBy}
                    onChange={(e) =>
                      setChecklistData({
                        ...checklistData,
                        generatedBy: e.target.value
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={checklistData.date}
                      onChange={(e) =>
                        setChecklistData({
                          ...checklistData,
                          date: e.target.value
                        })
                      }
                    />
                    <CalendarIcon className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={checklistData.description}
                    onChange={(e) =>
                      setChecklistData({
                        ...checklistData,
                        description: e.target.value
                      })
                    }
                    placeholder="Enter any additional description..."
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={generatePDF} disabled={loading}>
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? "Generating..." : "Generate PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated PDFs Section */}
        <Card>
          <CardHeader>
            <CardTitle>Previously Generated PDFs</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedPdfs.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PDF Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedPdfs.map((pdf) => (
                      <TableRow key={pdf.name}>
                        <TableCell>{pdf.name}</TableCell>
                        <TableCell>
                          {new Date(pdf.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = supabase.storage
                                .from("scheduling")
                                .getPublicUrl(`reports/${pdf.name}`).data.publicUrl;
                              window.open(url, "_blank");
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No PDFs generated yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}