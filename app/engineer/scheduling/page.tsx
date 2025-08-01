"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Icons
import {
  Plus,
  Download,
  X,
  FileText,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, addDays } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { constructionData } from "./data";

type Task = {
  id: string;
  mainCategory: string;
  subCategory?: string;
  task: string;
  duration: number;
  startDate: string;
  finishDate: string;
  status: "completed" | "pending";
  remarks: string;
  pdf_url?: string;
};

export default function ConstructionSchedulingPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    mainCategory: "",
    subCategory: "",
    task: "",
    duration: 1,
    startDate: format(new Date(), "yyyy-MM-dd"),
    finishDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    status: "pending",
    remarks: "",
  });
  const [showGeneratedPDFs, setShowGeneratedPDFs] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: "100%", height: "600px" });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Load tasks from localStorage
        const savedTasks = localStorage.getItem("constructionTasks");
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
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

  // Adjust PDF viewer dimensions based on window size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setPdfDimensions({
        width: isMobile ? "100%" : "800px",
        height: isMobile ? "400px" : "600px",
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("constructionTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Handle main category selection
  const handleMainCategoryChange = (value: string) => {
    setSelectedMainCategory(value);
    setSelectedSubCategory("");
    setSelectedTask("");
    setNewTask({
      ...newTask,
      mainCategory: value,
      subCategory: "",
      task: "",
    });
  };

  // Handle sub-category selection
  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategory(value);
    setSelectedTask("");
    setNewTask({
      ...newTask,
      subCategory: value,
      task: "",
    });
  };

  // Handle task selection from list
  const handleTaskSelect = (taskName: string) => {
    setSelectedTask(taskName);
    setNewTask({
      ...newTask,
      task: taskName,
      startDate: format(new Date(), "yyyy-MM-dd"),
      finishDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    });
  };

  // Add new task to schedule
  const addTask = () => {
    if (!newTask.task || !newTask.startDate) {
      toast({
        title: "Error",
        description: "Task name and start date are required",
        variant: "destructive",
      });
      return;
    }

    // Calculate finish date if duration changes
    const finishDate = newTask.duration
      ? format(
          addDays(new Date(newTask.startDate), newTask.duration),
          "yyyy-MM-dd"
        )
      : newTask.finishDate;

    const task: Task = {
      id: `task_${Date.now()}`,
      mainCategory: newTask.mainCategory,
      subCategory: newTask.subCategory,
      task: newTask.task,
      duration: newTask.duration,
      startDate: newTask.startDate,
      finishDate,
      status: newTask.status,
      remarks: newTask.remarks,
    };

    setTasks([...tasks, task]);
    setSelectedTask("");
    toast({
      title: "Success",
      description: "Task added to schedule",
    });
  };

  // Update task status
  const updateTaskStatus = (taskId: string, status: "completed" | "pending") => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast({
      title: "Success",
      description: "Task removed from schedule",
    });
  };

  // Generate and save PDF report
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

      // Create PDF with proper margins
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
      });

      // Set document properties
      doc.setProperties({
        title: `Construction Schedule Report - ${format(new Date(), "PP")}`,
        subject: "Construction Schedule",
        author: currentUser.email || "System",
      });

      // Add title and metadata
      doc.setFontSize(18);
      doc.text(
        "Construction Project Schedule",
        doc.internal.pageSize.getWidth() / 2,
        20,
        { align: "center" }
      );

      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), "PPPP")}`, 20, 30);
      doc.text(`Total Tasks: ${tasks.length}`, 20, 37);

      // Prepare table data
      const taskData = tasks.map((task) => [
        task.mainCategory,
        task.subCategory || "N/A",
        task.task,
        task.duration,
        format(parseISO(task.startDate), "PP"),
        format(parseISO(task.finishDate), "PP"),
        task.status === "completed" ? "✅ Completed" : "🟡 Pending",
        task.remarks || "N/A",
      ]);

      // Add table
      autoTable(doc, {
        startY: 45,
        head: [
          [
            "Main Category",
            "Sub-Category",
            "Task",
            "Days",
            "Start",
            "Finish",
            "Status",
            "Remarks",
          ],
        ],
        body: taskData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: "auto" },
        },
        styles: {
          overflow: "linebreak",
          cellPadding: 3,
          fontSize: 10,
        },
        didDrawPage: (data) => {
          // Footer on each page
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        },
      });

      // Final document footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        "Construction Project Management System",
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );

      // Generate PDF file name
      const fileName = `construction_schedule_${Date.now()}.pdf`;
      const pdfBlob = doc.output("blob");

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("scheduling")
        .upload(`reports/${fileName}`, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL of the uploaded PDF
      const { data: urlData } = supabase.storage
        .from("scheduling")
        .getPublicUrl(`reports/${fileName}`);

      // Update tasks with PDF URL
      setTasks(
        tasks.map((task) => ({
          ...task,
          pdf_url: urlData.publicUrl,
        }))
      );

      // Download PDF automatically
      doc.save(fileName);

      toast({
        title: "Success",
        description: "Schedule PDF generated and saved",
      });
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

  // Get all unique PDF dates
  const pdfDates = Array.from(
    new Set(tasks.filter((t) => t.pdf_url).map((t) => t.startDate))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <DashboardLayout role="worker">
      <div className="p-4">
        {/* Header Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Construction Project Scheduling</h2>
          <p className="text-sm text-gray-600">
            Plan and track all construction activities
          </p>
            <Link href="/dashboard/engineer">
                      <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </Link>
        </div>
        

        {/* Scheduling Controls */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Main Category</Label>
            <Select onValueChange={handleMainCategoryChange} value={selectedMainCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select main category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(constructionData).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

         {selectedMainCategory &&
  selectedMainCategory in constructionData &&
  typeof constructionData[selectedMainCategory as keyof typeof constructionData] === "object" &&
  !Array.isArray(constructionData[selectedMainCategory as keyof typeof constructionData]) && (
    <div className="space-y-2">
      <Label>Sub-Category</Label>
      <Select
        onValueChange={handleSubCategoryChange}
        value={selectedSubCategory}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select sub-category" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(
            constructionData[selectedMainCategory as keyof typeof constructionData]
          ).map((subCategory) => (
            <SelectItem key={subCategory} value={subCategory}>
              {subCategory}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
)}


          <div className="flex items-end">
            <Button
              onClick={() => setShowGeneratedPDFs(true)}
              variant="outline"
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Generated PDFs
            </Button>
          </div>
        </div>
      {/* Task Selection */}
{selectedMainCategory && (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Select Task</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="w-full">
        <Select
          onValueChange={(value) => handleTaskSelect(value)}
          value={selectedTask || ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a task" />
          </SelectTrigger>
          <SelectContent>
            {(
              selectedSubCategory
                ? (
                    (constructionData as Record<
                      string,
                      Record<string, string[]> | string[]
                    >)[selectedMainCategory] as Record<string, string[]>
                  )[selectedSubCategory] ?? []
                : Array.isArray(
                    (constructionData as Record<
                      string,
                      string[] | Record<string, string[]>
                    >)[selectedMainCategory]
                  )
                ? ((constructionData as Record<
                    string,
                    string[] | Record<string, string[]>
                  >)[selectedMainCategory] as string[])
                : []
            )?.map((taskName: string) => (
              <SelectItem key={taskName} value={taskName}>
                {taskName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
)}



        {/* Task Details Form */}
        {selectedTask && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Schedule Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Name</Label>
                  <Input value={selectedTask} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newTask.duration}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value) || 1;
                      setNewTask({
                        ...newTask,
                        duration,
                        finishDate: format(
                          addDays(
                            new Date(newTask.startDate),
                            duration
                          ),
                          "yyyy-MM-dd"
                        ),
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={newTask.startDate}
                      onChange={(e) => {
                        setNewTask({
                          ...newTask,
                          startDate: e.target.value,
                          finishDate: format(
                            addDays(
                              new Date(e.target.value),
                              newTask.duration
                            ),
                            "yyyy-MM-dd"
                          ),
                        });
                      }}
                    />
                    <CalendarIcon className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Finish Date</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={newTask.finishDate}
                      onChange={(e) => {
                        const startDate = new Date(newTask.startDate);
                        const finishDate = new Date(e.target.value);
                        const duration = Math.ceil(
                          (finishDate.getTime() - startDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        setNewTask({
                          ...newTask,
                          finishDate: e.target.value,
                          duration: duration > 0 ? duration : 1,
                        });
                      }}
                    />
                    <CalendarIcon className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    onValueChange={(value: "completed" | "pending") =>
                      setNewTask({ ...newTask, status: value })
                    }
                    value={newTask.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Textarea
                    value={newTask.remarks}
                    onChange={(e) =>
                      setNewTask({ ...newTask, remarks: e.target.value })
                    }
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={addTask}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Tasks Table */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Scheduled Tasks</CardTitle>
            <Button onClick={generatePDF} disabled={tasks.length === 0 || loading}>
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate PDF"}
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Main Category</TableHead>
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Finish Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.length > 0 ? (
                      tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.mainCategory}</TableCell>
                          <TableCell>{task.subCategory || "N/A"}</TableCell>
                          <TableCell className="font-medium">
                            {task.task}
                          </TableCell>
                          <TableCell>{task.duration}</TableCell>
                          <TableCell>
                            {format(parseISO(task.startDate), "PP")}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(task.finishDate), "PP")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={
                                task.status === "completed"
                                  ? "outline"
                                  : "secondary"
                              }
                              size="sm"
                              onClick={() =>
                                updateTaskStatus(
                                  task.id,
                                  task.status === "completed"
                                    ? "pending"
                                    : "completed"
                                )
                              }
                              className="flex items-center gap-2"
                            >
                              {task.status === "completed" ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                  Pending
                                </>
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {task.remarks || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-gray-500"
                        >
                          No tasks scheduled yet. Select a task above to add to
                          the schedule.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Generated PDFs Modal */}
        {showGeneratedPDFs && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
              <CardHeader className="flex flex-row justify-between items-center border-b">
                <CardTitle>Generated Schedule PDFs</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowGeneratedPDFs(false);
                    setSelectedPdf(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                {selectedPdf ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPdf(null)}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to list
                      </Button>
                      <Button
                        onClick={() => window.open(selectedPdf, "_blank")}
                        variant="default"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <iframe
                        src={selectedPdf}
                        className="w-full h-full border-0"
                        style={{
                          minHeight: pdfDimensions.height,
                          width: pdfDimensions.width,
                        }}
                        title="PDF Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[70vh]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>PDF</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pdfDates.length > 0 ? (
                          pdfDates.map((date) => {
                            const pdfTask = tasks.find(
                              (t) => t.startDate === date && t.pdf_url
                            );
                            return (
                              <TableRow key={date}>
                                <TableCell>
                                  {format(parseISO(date), "PPPP")}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedPdf(pdfTask?.pdf_url || null)
                                    }
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View/Download
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center py-8 text-gray-500"
                            >
                              No PDFs generated yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}