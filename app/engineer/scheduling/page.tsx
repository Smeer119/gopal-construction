"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO, addDays, differenceInDays } from "date-fns";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { constructionData } from "./data";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

// Recharts components for data visualization
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  Label as RechartsLabel
} from "recharts";

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
  BarChart2,
  Table as TableIcon,
  Edit,
  Save,
} from "lucide-react";

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

type ChartData = {
  name: string;
  value: number;
  fill?: string;
};

type TaskWithId = Omit<Task, 'id'> & { id?: string };

type SchedulingReport = {
  id: string;
  user_id: string;
  special_code: string | null;
  pdf_url: string;
  created_at: string;
};

export default function ConstructionSchedulingPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasksInProgress, setTasksInProgress] = useState<Array<Task>>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState<number | null>(null);
  const [showGeneratedPDFs, setShowGeneratedPDFs] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: "100%", height: "600px" });
  const [activeView, setActiveView] = useState<"chart" | "table">("chart");
  const [notes, setNotes] = useState<string>("");
  const [reports, setReports] = useState<SchedulingReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);

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

  // Load user's generated scheduling PDFs
  useEffect(() => {
    const fetchReports = async () => {
      if (!currentUser) return;
      try {
        setReportsLoading(true);
        const { data, error } = await supabase
          .from('scheduling_report')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReports((data || []) as SchedulingReport[]);
      } catch (err) {
        console.error('Error fetching scheduling reports:', err);
        toast({
          title: 'Error',
          description: 'Failed to load your generated reports',
          variant: 'destructive',
        });
      } finally {
        setReportsLoading(false);
      }
    };

    fetchReports();
  }, [currentUser, toast]);

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
    setSelectedTasks([]);
  };

  // Handle sub-category selection
  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategory(value);
    setSelectedTasks([]);
  };

  // Toggle task selection
  const toggleTaskSelection = (taskName: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskName)
        ? prev.filter(t => t !== taskName)
        : [...prev, taskName]
    );
  };

  // Add selected tasks to in-progress list
  const addSelectedTasks = () => {
    if (selectedTasks.length === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to add",
        variant: "destructive",
      });
      return;
    }

    const newTasks: Task[] = selectedTasks.map(taskName => ({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mainCategory: selectedMainCategory,
      subCategory: selectedSubCategory || undefined,
      task: taskName,
      duration: 1,
      startDate: format(new Date(), "yyyy-MM-dd"),
      finishDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      status: "pending" as const,
      remarks: "",
    }));

    setTasksInProgress(prev => [...prev, ...newTasks]);
    setSelectedTasks([]);
    
    toast({
      title: "Tasks added",
      description: `${newTasks.length} task(s) added to your schedule`,
    });
  };

  // Update a task in the in-progress list
  const updateTaskInProgress = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasksInProgress(prev =>
      prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  // Save tasks to the main list
  const saveTasks = () => {
    if (tasksInProgress.length === 0) {
      toast({
        title: "No tasks to save",
        description: "Please add tasks to your schedule first",
        variant: "destructive",
      });
      return;
    }

    setTasks(prev => [...prev, ...tasksInProgress]);
    setTasksInProgress([]);
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    
    toast({
      title: "Tasks saved",
      description: `${tasksInProgress.length} task(s) added to your schedule`,
    });
  };

  // State for date filter
  const [showAllTasks, setShowAllTasks] = useState(false);
  // Get current date in YYYY-MM-DD format for filtering
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  // Prepare data for charts
  const chartData = useMemo(() => {
    const allTasks = [...tasks, ...tasksInProgress];
    
    // Filter tasks for current day
    const todaysTasks = allTasks.filter(task => 
      task.startDate === currentDate
    );
    
    // Use filtered tasks based on showAllTasks state
    const tasksToShow = showAllTasks ? allTasks : todaysTasks;
    
    // Return empty state if no tasks
    if (tasksToShow.length === 0) {
      return { 
        statusData: [], 
        durationData: [], 
        isEmpty: true, 
        isFiltered: !showAllTasks, 
        currentDate 
      };
    }

    // Status distribution data
    const statusCounts = tasksToShow.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = [
      { name: 'Pending', value: statusCounts['pending'] || 0, color: '#f97316' },
      { name: 'Completed', value: statusCounts['completed'] || 0, color: '#10b981' },
    ];

    // Top 5 tasks by duration
    const durationData = [...tasksToShow]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5)
      .map(task => ({
        name: task.task.length > 15 ? `${task.task.substring(0, 15)}...` : task.task,
        duration: task.duration || 1,
        status: task.status,
      }));

    return { statusData, durationData, isEmpty: false, isFiltered: !showAllTasks, currentDate };
  }, [tasks, tasksInProgress]);

  // Calculate project timeline
  const projectTimeline = useMemo(() => {
    const allTasks = [...tasks, ...tasksInProgress];
    if (allTasks.length === 0) return null;

    const startDates = allTasks.map(task => new Date(task.startDate).getTime());
    const endDates = allTasks.map(task => new Date(task.finishDate).getTime());
    
    const projectStart = new Date(Math.min(...startDates));
    const projectEnd = new Date(Math.max(...endDates));
    
    const totalDays = differenceInDays(projectEnd, projectStart) + 1;
    
    if (isNaN(totalDays) || totalDays <= 0) return null;

    return {
      startDate: format(projectStart, 'MMM dd, yyyy'),
      endDate: format(projectEnd, 'MMM dd, yyyy'),
      totalDays,
      completedTasks: allTasks.filter(t => t.status === 'completed').length,
      totalTasks: allTasks.length,
      completionRate: Math.round((allTasks.filter(t => t.status === 'completed').length / allTasks.length) * 100) || 0,
    };
  }, [tasks, tasksInProgress]);

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

      // Include additional notes (if any)
      if (notes && notes.trim().length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        const maxWidth = doc.internal.pageSize.getWidth() - 20; // margins
        doc.text('Notes:', 10, 20);
        doc.setFontSize(11);
        const splitNotes = doc.splitTextToSize(notes.trim(), maxWidth);
        doc.text(splitNotes, 10, 28);
      }

      // Add title and metadata
      doc.setFontSize(18);
      doc.text(
        "Construction Project Schedule",
        doc.internal.pageSize.getWidth() / 2,
        40,
        { align: "center" }
      );

      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), "PPPP")}`, 20, 50);
      doc.text(`Total Tasks: ${tasks.length}`, 20, 57);

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
        startY: 60,
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

      // Fetch user's special_code from profiles and insert metadata into scheduling_report
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('special_code')
          .eq('id', currentUser.id)
          .single();
        if (profileError) throw profileError;

        const { data: inserted, error: insertError } = await supabase
          .from('scheduling_report')
          .insert([
            {
              user_id: currentUser.id,
              special_code: profile?.special_code ?? null,
              pdf_url: urlData.publicUrl,
            },
          ])
          .select()
          .single();
        if (insertError) throw insertError;

        // Optimistically update local list
        if (inserted) {
          setReports((prev) => [inserted as SchedulingReport, ...prev]);
        }
      } catch (metaErr) {
        console.error('Error saving scheduling report metadata:', metaErr);
        // Non-blocking toast, since PDF is already generated & uploaded
        toast({
          title: 'Warning',
          description: 'PDF saved, but failed to record metadata',
          variant: 'destructive',
        });
      }

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
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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


          <div className="space-y-2">
            <Label>Notes for this report</Label>
            <Textarea
              placeholder="Add any additional notes to include in the PDF..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* View Generated PDFs Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowGeneratedPDFs(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Generated PDFs
          </Button>
        </div>

        {/* Generated PDFs Dialog */}
        <Dialog open={showGeneratedPDFs} onOpenChange={setShowGeneratedPDFs}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Generated Schedule PDFs</DialogTitle>
            </DialogHeader>
            {reportsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports found.</p>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created</TableHead>
                      <TableHead>Special Code</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{format(new Date(r.created_at), 'PPpp')}</TableCell>
                        <TableCell>{r.special_code ?? '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <a href={r.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline">View</Button>
                            </a>
                            <a href={r.pdf_url} download>
                              <Button size="sm">Download</Button>
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      {/* Task Selection */}
{selectedMainCategory && (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Select Tasks</CardTitle>
      <p className="text-sm text-muted-foreground">
        {selectedTasks.length} task(s) selected
      </p>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-64 rounded-md border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {(
            selectedSubCategory
              ? (
                  (constructionData as Record<
                    string,
                    Record<string, string[]> | string[]
                  >)[selectedMainCategory] as Record<string, string[]>
                )?.[selectedSubCategory] ?? []
              : Array.isArray(
                  (constructionData as Record<
                    string,
                    string[] | Record<string, string[]>
                  >)[selectedMainCategory]
                )
              ? (constructionData[selectedMainCategory as keyof typeof constructionData] as string[])
              : []
          )?.map((taskName: string) => {
            const isSelected = selectedTasks.includes(taskName);
            return (
              <Button
                key={taskName}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto min-h-[40px] py-2 justify-start text-left whitespace-normal ${isSelected ? 'bg-primary/10 border-primary' : ''}`}
                onClick={() => toggleTaskSelection(taskName)}
              >
                <div className="flex items-center gap-2 w-full">
                  {isSelected ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border flex-shrink-0" />
                  )}
                  <span className="text-sm">{taskName}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setSelectedTasks([])}
          disabled={selectedTasks.length === 0}
        >
          Clear Selection
        </Button>
        <Button
          onClick={addSelectedTasks}
          disabled={selectedTasks.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Selected Tasks
        </Button>
      </div>
    </CardContent>
  </Card>
)}



        {/* Tasks in Progress */}
        {tasksInProgress.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tasks in Progress</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {tasksInProgress.length} task(s) to be scheduled
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tasksInProgress.map((task, index) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{task.task}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setTasksInProgress(prev => 
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Duration (days)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={task.duration}
                          onChange={(e) => {
                            const duration = parseInt(e.target.value) || 1;
                            updateTaskInProgress(task.id, {
                              duration,
                              finishDate: format(
                                addDays(new Date(task.startDate), duration),
                                "yyyy-MM-dd"
                              )
                            });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={task.startDate}
                            onChange={(e) => {
                              const startDate = e.target.value;
                              updateTaskInProgress(task.id, {
                                startDate,
                                finishDate: format(
                                  addDays(new Date(startDate), task.duration),
                                  "yyyy-MM-dd"
                                )
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
                            value={task.finishDate}
                            onChange={(e) => {
                              const finishDate = e.target.value;
                              const startDate = new Date(task.startDate);
                              const endDate = new Date(finishDate);
                              const duration = Math.ceil(
                                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                              ) || 1;
                              
                              updateTaskInProgress(task.id, {
                                finishDate,
                                duration
                              });
                            }}
                          />
                          <CalendarIcon className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={task.status}
                          onValueChange={(value: "completed" | "pending") => 
                            updateTaskInProgress(task.id, { status: value })
                          }
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
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label>Remarks</Label>
                        <Textarea
                          value={task.remarks || ""}
                          onChange={(e) => 
                            updateTaskInProgress(task.id, { remarks: e.target.value })
                          }
                          placeholder="Add any notes or details..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setTasksInProgress([])}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveTasks}>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Tasks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Tasks Table */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center ">
            <CardTitle>Scheduled Tasks</CardTitle>
            <Button onClick={generatePDF} disabled={tasks.length === 0 || loading}>
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate PDF"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
             <div className="overflow-auto max-h-[500px]">
                <div className="min-w-[1000px]">
                  <Table >
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
              
         </div>
            </div>
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

{/* Visual Summary Preview Modal */}
<Dialog open={showPreview} onOpenChange={setShowPreview}>
  <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
    <DialogHeader>
      <div className="flex justify-between items-center">
        <DialogTitle>Project Summary</DialogTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {chartData.isFiltered
              ? `Showing tasks for ${format(new Date(chartData.currentDate), 'MMMM d, yyyy')}`
              : 'Showing all tasks'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="ml-2"
          >
            {showAllTasks ? "Show Today's Tasks" : 'Show All Tasks'}
          </Button>
        </div>
      </div>
    </DialogHeader>

    <div className="flex-1 overflow-hidden">
      {chartData.isEmpty ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">
            {showAllTasks ? 'No tasks found' : 'No tasks scheduled for today'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {showAllTasks
              ? 'Add tasks to see them in the summary.'
              : 'Tasks for other days are not shown. Use "Show All Tasks" to view all tasks.'}
          </p>
          <Button onClick={() => setShowAllTasks(!showAllTasks)} variant="outline">
            {showAllTasks ? "Show Today's Tasks" : 'Show All Tasks'}
          </Button>
        </div>
      ) : (
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as 'chart' | 'table')}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto mb-4">
            <TabsTrigger value="chart">
              <BarChart2 className="w-4 h-4 mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="w-4 h-4 mr-2" />
              Task List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projectTimeline && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription>
                      {projectTimeline.startDate} - {projectTimeline.endDate}
                      <span className="block text-sm text-muted-foreground mt-1">
                        {projectTimeline.totalDays} days total • {projectTimeline.completedTasks} of {projectTimeline.totalTasks} tasks completed
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${projectTimeline.completionRate}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-right">
                      {projectTimeline.completionRate}% Complete
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Task Status</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {chartData.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList dataKey="value" position="inside" fill="#fff" style={{ fontSize: '12px' }} />
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} tasks`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Task Duration (Top 5 by Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData.durationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value} days`, 'Duration']} />
                      <Legend />
                      <Bar
                        dataKey="duration"
                        name="Duration (days)"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      >
                        <LabelList dataKey="duration" position="top" fill="#8884d8" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="table" className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Finish Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...tasks, ...tasksInProgress]
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.task}</TableCell>
                      <TableCell>{task.duration} days</TableCell>
                      <TableCell>{format(new Date(task.startDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(task.finishDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      )}
    </div>

    {/* Close Button */}
    <div className="flex justify-end pt-4 border-t">
      <Button onClick={() => setShowPreview(false)}>Close</Button>
    </div>
  </DialogContent>
</Dialog>

{/* Preview Trigger Button */}
<div className="fixed bottom-6 right-6 z-10">
  <Button
    onClick={() => setShowPreview(true)}
    className="rounded-full w-12 h-12 p-0 shadow-lg"
    size="icon"
    variant="default"
    disabled={tasks.length === 0 && tasksInProgress.length === 0}
  >
    <BarChart2 className="w-5 h-5" />
    <span className="sr-only">View Summary</span>
  </Button>
</div>

      
      {/* Preview Button - Fixed at bottom right */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button 
          onClick={() => setShowPreview(true)}
          className="rounded-full w-12 h-12 p-0 shadow-lg"
          size="icon"
          variant="default"
          disabled={tasks.length === 0 && tasksInProgress.length === 0}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="sr-only">View Summary</span>
        </Button>
      </div>
    </DashboardLayout>
  );
}