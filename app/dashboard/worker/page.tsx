"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  X,
  FileText,
  ArrowLeft,
  Clock,
  Calendar,
  IndianRupee,
  Edit,
  Trash2,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { format, parseISO } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

type Worker = {
  id: string;
  name: string;
  phone_number: string;
};

type Payment = {
  amount: number;
  description: string;
};

type Attendance = {
  id: string;
  worker_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: "present" | "absent";
  payment?: Payment;
  pdf_url?: string;
};

export default function WorkerAttendancePage() {
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: "", phone_number: "" });
  const [dateFilter, setDateFilter] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showGeneratedPDFs, setShowGeneratedPDFs] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [editPayment, setEditPayment] = useState<{
    workerId: string;
    amount: string;
    description: string;
  } | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: '100%', height: '600px' });

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

        // Fetch user's name from profiles table
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          setUserName(profile?.full_name || "");
        }

        // Load company name from localStorage
        const savedCompany = localStorage.getItem("companyName");
        if (savedCompany) setCompanyName(savedCompany);

        // Load workers from Supabase
        const { data: workersData, error } = await supabase
          .from("workers")
          .select("*");
        if (!error && workersData) {
          setWorkers(workersData);
        }

        // Load today's attendance from localStorage
        const savedAttendance = localStorage.getItem(
          `attendance_${dateFilter}`
        );
        if (savedAttendance) {
          setAttendance(JSON.parse(savedAttendance));
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
  }, [dateFilter, toast]);

  // Adjust PDF viewer dimensions based on window size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setPdfDimensions({
        width: isMobile ? '100%' : '800px',
        height: isMobile ? '400px' : '600px'
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save attendance to localStorage whenever it changes
  useEffect(() => {
    if (attendance.length > 0) {
      localStorage.setItem(
        `attendance_${dateFilter}`,
        JSON.stringify(attendance)
      );
    }
  }, [attendance, dateFilter]);

  // Save company name
  const saveCompanyName = () => {
    localStorage.setItem("companyName", companyName);
    setShowCompanyDialog(false);
    toast({
      title: "Success",
      description: "Company name saved",
    });
  };

  // Delete company name
  const deleteCompanyName = () => {
    localStorage.removeItem("companyName");
    setCompanyName("");
    toast({
      title: "Success",
      description: "Company name removed",
    });
  };

  // Add new worker to Supabase
  const addWorker = async () => {
    if (!newWorker.name || !newWorker.phone_number) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("workers")
        .insert([newWorker])
        .select()
        .single();

      if (error) throw error;

      setWorkers([...workers, data]);
      setNewWorker({ name: "", phone_number: "" });
      setShowAddWorker(false);
      toast({
        title: "Success",
        description: "Worker added successfully",
      });
    } catch (error) {
      console.error("Error adding worker:", error);
      const err = error as { message?: string };
      toast({
        title: "Error",
        description: err.message || "Failed to add worker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update worker in Supabase
  const updateWorker = async () => {
    if (!editingWorker) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("workers")
        .update(editingWorker)
        .eq("id", editingWorker.id);

      if (error) throw error;

      setWorkers(
        workers.map((w) => (w.id === editingWorker.id ? editingWorker : w))
      );
      setEditingWorker(null);
      toast({
        title: "Success",
        description: "Worker updated successfully",
      });
    } catch (error) {
      console.error("Error updating worker:", error);
      toast({
        title: "Error",
        description: "Failed to update worker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete worker from database
  const deleteWorker = async (workerId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("workers")
        .delete()
        .eq("id", workerId);

      if (error) throw error;

      setWorkers(workers.filter((w) => w.id !== workerId));
      setAttendance(attendance.filter((a) => a.worker_id !== workerId));
      toast({
        title: "Success",
        description: "Worker deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting worker:", error);
      toast({
        title: "Error",
        description: "Failed to delete worker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update worker attendance status with automatic clock-in
  const updateAttendanceStatus = (
    workerId: string,
    status: "present" | "absent"
  ) => {
    const now = format(new Date(), "HH:mm");
    const existingRecordIndex = attendance.findIndex(
      (a) => a.worker_id === workerId && a.date === dateFilter
    );

    const newAttendance = {
      id: `temp_${Date.now()}`,
      worker_id: workerId,
      date: dateFilter,
      status,
      clock_in: now, // Always set clock_in time
      clock_out: undefined,
    };

    if (existingRecordIndex >= 0) {
      // Update existing record
      const updatedAttendance = [...attendance];
      updatedAttendance[existingRecordIndex] = {
        ...updatedAttendance[existingRecordIndex],
        ...newAttendance,
        payment: updatedAttendance[existingRecordIndex].payment,
      };
      setAttendance(updatedAttendance);
    } else {
      // Add new record
      setAttendance([...attendance, newAttendance]);
    }

    if (status === "absent") {
      // Auto-set payment for absent workers
      setEditPayment({
        workerId,
        amount: "0",
        description: "Marked absent on " + format(new Date(), "PP"),
      });
    }
  };

  // Update clock in/out times
  const updateClockTime = (
    workerId: string,
    field: "clock_in" | "clock_out",
    value: string
  ) => {
    const existingRecordIndex = attendance.findIndex(
      (a) => a.worker_id === workerId && a.date === dateFilter
    );

    if (existingRecordIndex >= 0) {
      const updatedAttendance = [...attendance];
      updatedAttendance[existingRecordIndex] = {
        ...updatedAttendance[existingRecordIndex],
        [field]: value || undefined,
        status: value
          ? "present"
          : updatedAttendance[existingRecordIndex].status,
      };
      setAttendance(updatedAttendance);
    } else if (value) {
      setAttendance([
        ...attendance,
        {
          id: `temp_${Date.now()}`,
          worker_id: workerId,
          date: dateFilter,
          status: "present",
          [field]: value,
        },
      ]);
    }
  };

  // Update payment information
  const updatePayment = (workerId: string) => {
    if (!editPayment) return;

    const existingRecordIndex = attendance.findIndex(
      (a) => a.worker_id === workerId && a.date === dateFilter
    );

    const paymentData = {
      amount: parseFloat(editPayment.amount) || 0,
      description: editPayment.description,
    };

    if (existingRecordIndex >= 0) {
      const updatedAttendance = [...attendance];
      updatedAttendance[existingRecordIndex] = {
        ...updatedAttendance[existingRecordIndex],
        payment: paymentData,
      };
      setAttendance(updatedAttendance);
    } else {
      setAttendance([
        ...attendance,
        {
          id: `temp_${Date.now()}`,
          worker_id: workerId,
          date: dateFilter,
          status: "absent",
          payment: paymentData,
        },
      ]);
    }

    setEditPayment(null);
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

    if (!companyName) {
      setShowCompanyDialog(true);
      toast({
        title: "Required",
        description: "Please enter your company name first",
      });
      return;
    }

    try {
      setLoading(true);

      // Create PDF with proper margins
      const doc = new jsPDF({
        orientation: "landscape", // Better for tables
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true
      });

      // Set document properties
      doc.setProperties({
        title: `Attendance Report - ${format(new Date(dateFilter), "PP")}`,
        subject: "Worker Attendance",
        author: userName || "System",
        creator: companyName || "Unknown Company"
      });

      // Add title and metadata with proper spacing
      doc.setFontSize(18);
      doc.text("Worker Attendance Report", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
      
      doc.setFontSize(12);
      let yPosition = 30;
      
      if (companyName) {
        doc.text(`Company: ${companyName}`, 20, yPosition);
        yPosition += 7;
      }
      
      if (userName) {
        doc.text(`Generated by: ${userName}`, 20, yPosition);
        yPosition += 7;
      }
      
      doc.text(`Date: ${format(new Date(dateFilter), "MMMM dd, yyyy")}`, 20, yPosition);
      yPosition += 10;

      // Calculate totals
      const presentCount = attendance.filter(a => a.status === "present").length;
      const absentCount = attendance.filter(a => a.status === "absent").length;
      const totalAmount = attendance.reduce((sum, a) => sum + (a.payment?.amount || 0), 0);

      // Add attendance summary with proper formatting
      doc.setFontSize(14);
      doc.text("Attendance Summary", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.text(`Total Present: ${presentCount}`, 20, yPosition);
      yPosition += 7;
      
      doc.text(`Total Absent: ${absentCount}`, 20, yPosition);
      yPosition += 7;
      
      // Fixed amount formatting (removes the '1' issue)
      doc.text(`Total Amount Paid: ₹${totalAmount.toLocaleString("en-IN")}`, 20, yPosition);
      yPosition += 15;

      // Prepare table data with proper amount formatting
      const attendanceData = workers.map(worker => {
        const workerAttendance = attendance.find(a => a.worker_id === worker.id && a.date === dateFilter);
        return [
          worker.name,
          worker.phone_number,
          workerAttendance?.clock_in || "N/A",
          workerAttendance?.clock_out || "N/A",
          workerAttendance?.status 
            ? workerAttendance.status.charAt(0).toUpperCase() + workerAttendance.status.slice(1)
            : "N/A",
          workerAttendance?.payment
            ? `₹${workerAttendance.payment.amount.toLocaleString("en-IN")}` // Proper formatting
            : "N/A",
          workerAttendance?.payment?.description || "N/A"
        ];
      });

      // Add table with proper column widths
      autoTable(doc, {
        startY: yPosition,
        head: [
          ["Name", "Phone", "Clock In", "Clock Out", "Status", "Amount", "Description"]
        ],
        body: attendanceData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold"
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Name
          1: { cellWidth: 25 }, // Phone
          2: { cellWidth: 20 }, // Clock In
          3: { cellWidth: 20 }, // Clock Out
          4: { cellWidth: 20 }, // Status
          5: { cellWidth: 25 }, // Amount (fixed width)
          6: { cellWidth: "auto" } // Description
        },
        margin: { top: yPosition },
        styles: {
          overflow: "linebreak",
          cellPadding: 3,
          fontSize: 10,
          minCellHeight: 8
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
        }
      });

      // Final document footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `${companyName || "Company"} - Worker Management System`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );

      // Generate PDF file name
      const fileName = `attendance_${dateFilter}_${Date.now()}.pdf`;
      const pdfBlob = doc.output("blob");

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("worker.pdf")
        .upload(`reports/${fileName}`, pdfBlob, {
          contentType: "application/pdf",
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL of the uploaded PDF
      const { data: urlData } = supabase.storage
        .from("worker.pdf")
        .getPublicUrl(`reports/${fileName}`);

      // Update attendance records with PDF URL
      const updatedAttendance = attendance.map((record) => ({
        ...record,
        pdf_url: record.date === dateFilter ? urlData.publicUrl : record.pdf_url,
      }));
      setAttendance(updatedAttendance);

      // Download PDF automatically
      doc.save(fileName);

      toast({
        title: "Success",
        description: "PDF generated and saved successfully",
      });

    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary counts
  const calculateSummary = () => {
    const present = attendance.filter((a) => a.status === "present");
    const absent = attendance.filter((a) => a.status === "absent");

    return {
      present: present.length,
      absent: absent.length,
    };
  };

  const summary = calculateSummary();

  // Get all unique dates with PDFs for the calendar filter
  const pdfDates = Array.from(
    new Set(attendance.filter((a) => a.pdf_url).map((a) => a.date))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <DashboardLayout role="worker">
      <div className="p-4">
        {/* Header Section */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <h2 className="text-xl font-bold">Worker Attendance</h2>
            <p className="text-sm text-gray-600">
              Manage daily worker attendance
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={showAddWorker} onOpenChange={setShowAddWorker}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Worker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Worker</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={newWorker.name}
                      onChange={(e) =>
                        setNewWorker({ ...newWorker, name: e.target.value })
                      }
                      placeholder="Worker name"
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={newWorker.phone_number}
                      onChange={(e) =>
                        setNewWorker({
                          ...newWorker,
                          phone_number: e.target.value,
                        })
                      }
                      placeholder="Phone number"
                      type="tel"
                    />
                  </div>
                  <Button
                    onClick={addWorker}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Worker"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={() => setShowGeneratedPDFs(true)}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <FileText className="w-4 h-4 mr-1" />
              View PDFs
            </Button>
          </div>
        </div>

        {/* Date Filter and Summary */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-1">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => setDateFilter(format(new Date(), "yyyy-MM-dd"))}
              variant="outline"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Today
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:w-48">
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.present}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.absent}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Company Name Dialog */}
        <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Company Name</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                />
              </div>
              <DialogFooter>
                <Button onClick={saveCompanyName} className="w-full">
                  Save
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate PDF Button and Company Info */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
          <Button onClick={generatePDF} className="w-full sm:w-auto" disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            {loading ? "Generating PDF..." : "Generate & Download PDF"}
          </Button>
          {companyName && (
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
              <span className="font-medium">{companyName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompanyDialog(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteCompanyName}
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Attendance Table */}
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] w-full">
              <div className="min-w-[800px] overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead className="w-[150px]">Phone</TableHead>
                      <TableHead className="w-[120px]">Clock In</TableHead>
                      <TableHead className="w-[120px]">Clock Out</TableHead>
                      <TableHead className="w-[150px]">Status</TableHead>
                      <TableHead className="w-[150px]">Amount</TableHead>
                      <TableHead className="w-[200px]">Description</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => {
                      const workerAttendance = attendance.find(
                        (a) =>
                          a.worker_id === worker.id && a.date === dateFilter
                      );
                      return (
                        <TableRow key={worker.id}>
                          <TableCell className="font-medium">
                            {editingWorker?.id === worker.id ? (
                              <Input
                                value={editingWorker.name}
                                onChange={(e) =>
                                  setEditingWorker({
                                    ...editingWorker,
                                    name: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              worker.name
                            )}
                          </TableCell>
                          <TableCell>
                            {editingWorker?.id === worker.id ? (
                              <Input
                                value={editingWorker.phone_number}
                                onChange={(e) =>
                                  setEditingWorker({
                                    ...editingWorker,
                                    phone_number: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              worker.phone_number
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={workerAttendance?.clock_in || ""}
                              onChange={(e) =>
                                updateClockTime(
                                  worker.id,
                                  "clock_in",
                                  e.target.value
                                )
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={workerAttendance?.clock_out || ""}
                              onChange={(e) =>
                                updateClockTime(
                                  worker.id,
                                  "clock_out",
                                  e.target.value
                                )
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant={
                                  workerAttendance?.status === "present"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  updateAttendanceStatus(worker.id, "present")
                                }
                                className="flex-1"
                              >
                                Present
                              </Button>
                              <Button
                                variant={
                                  workerAttendance?.status === "absent"
                                    ? "destructive"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  updateAttendanceStatus(worker.id, "absent")
                                }
                                className="flex-1"
                              >
                                Absent
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditPayment({
                                  workerId: worker.id,
                                  amount:
                                    workerAttendance?.payment?.amount.toString() ||
                                    "",
                                  description:
                                    workerAttendance?.payment?.description ||
                                    "",
                                })
                              }
                              className="w-full text-left"
                            >
                              {workerAttendance?.payment ? (
                                <span className="flex items-center">
                                  <IndianRupee className="w-4 h-4 mr-1" />
                                  {workerAttendance.payment.amount}
                                </span>
                              ) : (
                                "Add Payment"
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            {workerAttendance?.payment?.description || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {editingWorker?.id === worker.id ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={updateWorker}
                                  className="text-green-500"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingWorker(worker)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteWorker(worker.id)}
                                className="text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Payment Edit Dialog */}
        <Dialog open={!!editPayment} onOpenChange={() => setEditPayment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={editPayment?.amount || ""}
                  onChange={(e) =>
                    editPayment &&
                    setEditPayment({
                      ...editPayment,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editPayment?.description || ""}
                  onChange={(e) =>
                    editPayment &&
                    setEditPayment({
                      ...editPayment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Payment description"
                />
              </div>
              <Button
                onClick={() =>
                  editPayment && updatePayment(editPayment.workerId)
                }
                className="w-full"
              >
                Save Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generated PDFs Modal */}
        {showGeneratedPDFs && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
              <CardHeader className="flex flex-row justify-between items-center border-b">
                <CardTitle>Generated PDF Reports</CardTitle>
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
                          width: pdfDimensions.width
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
                        {pdfDates.map((date) => {
                          const pdfRecord = attendance.find(
                            (a) => a.date === date && a.pdf_url
                          );
                          return (
                            <TableRow key={date}>
                              <TableCell>
                                {format(parseISO(date), "MMMM dd, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedPdf(pdfRecord?.pdf_url || null)
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  View/Download
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
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