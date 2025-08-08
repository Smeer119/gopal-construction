"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Eye, Loader2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

// react-pdf - dynamically import to avoid SSR issues
const PDFDocument = dynamic(() => import("@react-pdf/renderer").then(m => m.Document) as any, { ssr: false });
const PDFPage = dynamic(() => import("@react-pdf/renderer").then(m => m.Page) as any, { ssr: false });

// We'll use react-pdf/renderer only to provide a basic inline viewer when possible.
// Alternatively, we can use an iframe for reliability across browsers.

interface ReportRow {
  id: string;
  user_id: string;
  special_code: string | null;
  date: string | null; // yyyy-mm-dd
  pdf_url: string;
  created_at: string;
}

export default function MyReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authData?.user) {
          setReports([]);
          return;
        }
        const uid = authData.user.id;
        const { data, error } = await supabase
          .from("pdf_reports")
          .select("id,user_id,special_code,date,pdf_url,created_at")
          .eq("user_id", uid)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setReports((data || []) as ReportRow[]);
      } catch (e: any) {
        console.error(e);
        toast({ title: "Failed to load reports", description: e.message ?? "", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
      const site = (r.special_code || "").toLowerCase();
      const dateStr = r.date || "";
      return site.includes(q) || dateStr.includes(q);
    });
  }, [reports, search]);

  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    try {
      const date = new Date(d);
      // If it's yyyy-mm-dd string, new Date() will parse as UTC; we only display date
      return date.toLocaleDateString();
    } catch {
      return d;
    }
  };

  const openPreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const parseStoragePathFromPublicUrl = (url: string): string | null => {
    // public URL shape: .../storage/v1/object/public/materials/<path>
    const marker = "/storage/v1/object/public/materials/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.substring(idx + marker.length);
  };

  const onDelete = async (row: ReportRow) => {
    if (!confirm("Delete this report permanently? This cannot be undone.")) return;
    try {
      setDeletingId(row.id);
      const path = parseStoragePathFromPublicUrl(row.pdf_url);
      if (path) {
        const { error: removeErr } = await supabase.storage.from("materials").remove([path]);
        if (removeErr) throw removeErr;
      }
      const { error: dbErr } = await supabase.from("pdf_reports").delete().eq("id", row.id);
      if (dbErr) throw dbErr;
      setReports((prev) => prev.filter((r) => r.id !== row.id));
      toast({ title: "Deleted", description: "Report deleted successfully." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Delete failed", description: e.message ?? "", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 w-full">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-xl md:text-2xl font-semibold">My Reports</h1>
        </div>
        <div className="mb-4">
          <Input
            placeholder="Search by site name or date (yyyy-mm-dd)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">No reports found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Card key={r.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    <span className="font-bold">{r.special_code || "Unnamed Site"}</span>
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">{formatDate(r.date)} • {new Date(r.created_at).toLocaleString()}</div>
                </CardHeader>
                <CardContent className="pt-2 flex-1 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(r.pdf_url, "_blank")}> 
                      <ExternalLink className="w-4 h-4 mr-1" /> View PDF
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => openPreview(r.pdf_url)}>
                      <Eye className="w-4 h-4 mr-1" /> Preview
                    </Button>
                  </div>
                  <div className="mt-auto flex justify-end">
                    <Button variant="destructive" size="sm" onClick={() => onDelete(r)} disabled={deletingId === r.id}>
                      {deletingId === r.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            {previewUrl ? (
              // Using iframe for robust cross-browser inline preview
              <iframe src={previewUrl} className="w-full h-[70vh] border" />
            ) : (
              <div className="text-sm text-muted-foreground">No preview available</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
