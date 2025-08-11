"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Trash2, Loader2, FileText, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportRow {
  id: string;
  user_id: string;
  special_code: string | null;
  date: string | null;
  pdf_url: string;
  created_at: string;
}

export default function MyReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        setReports([]);
        return;
      }
      
      const { data } = await supabase
        .from("dpr_reports")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .throwOnError();

      setReports(data || []);
    } catch (e: any) {
      // Surface more helpful diagnostics
      const msg = e?.message || e?.error_description || "Unexpected error while loading reports";
      try {
        console.error("fetchReports error:", e, "message:", e?.message, "as json:", JSON.stringify(e));
      } catch {
        console.error("fetchReports error (stringified failed):", e);
      }
      toast({ 
        title: "Failed to load reports", 
        description: msg, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (report.special_code?.toLowerCase().includes(searchLower)) ||
      (report.date?.includes(searchLower)) ||
      (new Date(report.created_at).toLocaleDateString().includes(searchLower))
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const onDelete = async (row: ReportRow) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    
    try {
      setDeletingId(row.id);
      
      // Delete from storage if URL is from our bucket
      if (row.pdf_url?.includes("/storage/v1/object/public/dpr/")) {
        const path = row.pdf_url.split("/dpr/")[1];
        if (path) {
          const { error: storageError } = await supabase.storage
            .from("dpr")
            .remove([path]);
          if (storageError) throw storageError;
        }
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from("dpr_reports")
        .delete()
        .eq("id", row.id);
        
      if (dbError) throw dbError;
      
      setReports(reports.filter((r) => r.id !== row.id));
      toast({ title: "Success", description: "Report deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete report",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout role="worker">
      <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Progress Reports</h1>
            <p className="text-sm text-muted-foreground">View and manage your generated reports</p>
          </div>
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by site or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {search ? "No matching reports found" : "No reports generated yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {report.date ? formatDate(report.date) : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.special_code || "No site specified"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(report.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => window.open(report.pdf_url, "_blank")}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => window.open(report.pdf_url, "_blank", "noopener,noreferrer")}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(report)}
                          disabled={deletingId === report.id}
                        >
                          {deletingId === report.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
