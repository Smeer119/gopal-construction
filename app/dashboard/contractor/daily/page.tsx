"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type React from "react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import {
  Plus,
  Download,
  X,
  FileText,
  ArrowLeft,
  CheckCircle,
  Clock,
  Trash2,
  BarChart2,
  Table as TableIcon,
  Upload,
  Image as ImageIcon,
  PackageOpen,
  Loader2,
} from "lucide-react";

// Import material categories from data.ts
import { materialCategories } from "./data";

interface Material {
  id: string;
  date: string;
  category: string;
  subCategory: string;
  item: string;
  poNumber: string;
  size: string;
  quantity: number;
  unit: string;
  grade: string;
  brand: string;
  supplier: string;
  vehicleNo: string;
  qrCode: string;
  barcode: string;
  remarks: string;
  photos: string[];
  pdf_url?: string;
  [key: string]: any; // Allow dynamic property access
}

interface User {
  id: string;
  email?: string;
  // Add other user properties as needed
}

export default function MaterialManagementPage() {
  const { toast } = useToast();
  // Import materialData from the data file
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [materialsInProgress, setMaterialsInProgress] = useState<Material[]>(
    []
  );
  const [activeMaterialIndex, setActiveMaterialIndex] = useState<number | null>(
    null
  );
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
    null
  );
  const [showGeneratedPDFs, setShowGeneratedPDFs] = useState<boolean>(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [savedMaterials, setSavedMaterials] = useState<Material[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: string;
    height: string;
  }>({
    width: "100%",
    height: "600px",
  });
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    undefined
  );
  const [pdfFiles, setPdfFiles] = useState<
    { name: string; url: string; createdAt?: string }[]
  >([]);
  // Row-specific photos state: materialId -> previews/files
  const [photoPreviewsByRow, setPhotoPreviewsByRow] = useState<
    Record<string, string[]>
  >({});
  const [photoFilesByRow, setPhotoFilesByRow] = useState<
    Record<string, File[]>
  >({});

  // Get unique dates from materials with PDFs for the PDFs modal
  const pdfDates = useMemo(() => {
    const dates = new Set<string>();
    materials.forEach((material) => {
      if (material.pdf_url) {
        dates.add(material.date);
      }
    });
    return Array.from(dates).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [materials]);

  // Return list of item names for the currently selected category
  const getCurrentCategoryItems = useCallback((): string[] => {
    if (!selectedCategory) return [];
    const category = (
      materialCategories as Record<
        string,
        Record<string, string[] | string | unknown>
      >
    )[selectedCategory];
    if (!category) return [];

    // If category has subcategories, return items from selected subcategory
    if (selectedSubCategory) {
      const sub = category[selectedSubCategory];
      if (Array.isArray(sub)) return sub as string[];
      if (sub && typeof sub === "object")
        return Object.keys(sub as Record<string, unknown>);
    }

    // If no subcategories, return empty array to show direct input
    return [];
  }, [selectedCategory, selectedSubCategory]);

  // Is a specific item selected?
  const isItemSelected = (itemName: string): boolean =>
    selectedItems.includes(itemName);

  // Check if the selected category has any subcategories
  const hasSubcategories = useCallback((): boolean => {
    if (!selectedCategory) return false;
    const category =
      materialCategories[selectedCategory as keyof typeof materialCategories];
    return category && Object.keys(category).length > 0;
  }, [selectedCategory]);

  // Toggle single item selection
  const toggleItemSelection = (itemName: string): void => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((i) => i !== itemName)
        : [...prev, itemName]
    );
  };

  // Are all items in current category selected?
  const isAllSelected = (): boolean => {
    const items = getCurrentCategoryItems();
    return items.length > 0 && items.every((i) => selectedItems.includes(i));
  };

  // Toggle select/deselect all
  const toggleSelectAll = (): void => {
    const items = getCurrentCategoryItems();
    if (items.length === 0) return;
    if (isAllSelected()) {
      // deselect all current items
      setSelectedItems((prev) => prev.filter((i) => !items.includes(i)));
    } else {
      // add all current items
      setSelectedItems((prev) => Array.from(new Set([...prev, ...items])));
    }
  };

  // Remove a material from in-progress list
  const removeMaterial = (id: string): void => {
    setMaterialsInProgress((prev) => prev.filter((m) => m.id !== id));
  };

  // Update a field of a material in-progress
  const handleMaterialChange = (
    id: string,
    field: keyof Material,
    value: any
  ): void => {
    setMaterialsInProgress((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Add selected items as new materials to in-progress list
  const addSelectedMaterials = (): void => {
    if (!selectedCategory || selectedItems.length === 0) return;

    // For categories without subcategories, use an empty string as subCategory
    const subCategoryValue = hasSubcategories() ? selectedSubCategory : "";

    const newMaterials: Material[] = selectedItems.map((itemName) => ({
      id: `${Date.now()}-${itemName}`,
      date: new Date().toISOString().split("T")[0],
      category: selectedCategory,
      subCategory: subCategoryValue,
      item: itemName,
      poNumber: "",
      size: "",
      quantity: 0,
      unit: "",
      grade: "",
      brand: "",
      supplier: "",
      vehicleNo: "",
      qrCode: "",
      barcode: "",
      remarks: "",
      photos: [],
    }));
    setMaterialsInProgress((prev) => [...prev, ...newMaterials]);
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory("");
  };

  // Handle sub-category change
  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategory(value);
  };

  // Delete a material from the saved list
  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((material) => material.id !== id));

    // Also remove from in-progress if it exists there
    setMaterialsInProgress((prev) =>
      prev.filter((material) => material.id !== id)
    );

    // If we're deleting the currently edited material, clear the editing state
    if (editingMaterialId === id) {
      setEditingMaterialId(null);
    }

    toast({
      title: "Material Deleted",
      description: "The material has been removed from your records.",
    });
  };

  // Helper: fetch user's display name from profiles
  const getUserName = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, name, username")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error fetching user name:", error);
        return null;
      }
      // Choose best available field
      return (
        (data?.full_name as string) ||
        (data?.name as string) ||
        (data?.username as string) ||
        null
      );
    } catch (err) {
      console.error("Unexpected error fetching user name:", err);
      return null;
    }
  };

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      try {
        Object.values(photoPreviewsByRow).forEach((arr) =>
          arr.forEach((u) => URL.revokeObjectURL(u))
        );
      } catch {}
    };
  }, [photoPreviewsByRow]);

  // Handle photo upload: build previews and stage files for upload (row-specific)
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    materialId: string
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoFilesByRow((prev) => ({
      ...prev,
      [materialId]: [...(prev[materialId] || []), ...files],
    }));
    setPhotoPreviewsByRow((prev) => ({
      ...prev,
      [materialId]: [...(prev[materialId] || []), ...newPreviews],
    }));
    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  // Remove a staged photo (preview + file) by index for a specific row
  const removePhoto = (materialId: string, index: number) => {
    setPhotoFilesByRow((prev) => {
      const list = prev[materialId] || [];
      const next = list.filter((_, i) => i !== index);
      return { ...prev, [materialId]: next };
    });
    setPhotoPreviewsByRow((prev) => {
      const list = prev[materialId] || [];
      const toRevoke = list[index];
      if (toRevoke) URL.revokeObjectURL(toRevoke);
      const next = list.filter((_, i) => i !== index);
      return { ...prev, [materialId]: next };
    });
  };

  // Export the current Materials table (as displayed) into a clean PDF table in the same order
  const exportMaterialsTablePDF = (): void => {
    try {
      if (materials.length === 0) {
        toast({
          title: "No materials to export",
          description: "There are no records in the table to download.",
          variant: "destructive",
        });
        return;
      }

      // Create a landscape PDF for wider tables
      const doc = new jsPDF({ orientation: "landscape" });

      // Title
      doc.setFontSize(16);
      doc.text("Material Records", 14, 14);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 20);

      // Define columns to match the on-screen table (show everything)
      const columns = [
        { header: "Date", key: "date" },
        { header: "Category", key: "category" },
        { header: "Sub-Category", key: "subCategory" },
        { header: "Item", key: "item" },
        { header: "P.O/Invoice/Challan No", key: "poNumber" },
        { header: "Size", key: "size" },
        { header: "Quantity", key: "quantity" },
        { header: "Unit", key: "unit" },
        { header: "Grade", key: "grade" },
        { header: "Brand", key: "brand" },
        { header: "Supplier/Vendor", key: "supplier" },
        { header: "Vehicle No", key: "vehicleNo" },
        { header: "QR Code", key: "qrCode" },
        { header: "Barcode", key: "barcode" },
        { header: "Remarks", key: "remarks" },
      ];

      // Build rows with N/A fallback to keep layout consistent
      const rows = materials.map((m) => ({
        date: m.date
          ? (() => {
              try {
                return format(parseISO(m.date), "yyyy-MM-dd");
              } catch {
                return m.date;
              }
            })()
          : "N/A",
        category: m.category || "N/A",
        subCategory: m.subCategory || "N/A",
        item: m.item || "N/A",
        poNumber: m.poNumber || "N/A",
        size: m.size || "N/A",
        quantity:
          m.quantity === undefined || m.quantity === null
            ? "N/A"
            : String(m.quantity),
        unit: m.unit || "N/A",
        grade: m.grade || "N/A",
        brand: m.brand || "N/A",
        supplier: m.supplier || "N/A",
        vehicleNo: m.vehicleNo || "N/A",
        qrCode: m.qrCode || "N/A",
        barcode: m.barcode || "N/A",
        remarks: m.remarks || "N/A",
      }));

      autoTable(doc, {
        head: [columns.map((c) => c.header)],
        body: rows.map((row) => columns.map((c) => (row as any)[c.key])),
        startY: 80,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [33, 33, 33], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        tableWidth: "wrap",
        margin: { left: 40, right: 40 },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          const pageCount = doc.getNumberOfPages();
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.getHeight() - 10
          );
        },
      });

      // Note: we keep exportMaterialsTablePDF synchronous and focused on the table only.

      const fileName = `material-records-table-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: `Exported ${materials.length} row(s) from the table.`,
      });
    } catch (error) {
      console.error("Error exporting table PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Upload staged photos for a given material row to storage
  const uploadPhotos = async (materialId: string): Promise<string[]> => {
    const files = photoFilesByRow[materialId] || [];
    if (files.length === 0) return [];

    const uploaded: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${materialId}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `dailymaterialk/${materialId}/${fileName}`;

      const { error } = await supabase.storage
        .from("dailymaterialk")
        .upload(filePath, file);
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("dailymaterialk").getPublicUrl(filePath);
      uploaded.push(publicUrl);
    }
    return uploaded;
  };

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email || undefined,
        });
      }

      // Load materials data
      const { data: materialsData, error: materialsError } = await supabase
        .from("materials")
        .select("*")
        .order("date", { ascending: false });

      if (materialsError) throw materialsError;

      if (materialsData) {
        setMaterials(materialsData);
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
  }, []);

  // Initialize data
  useEffect(() => {
    // Load materials from localStorage on component mount
    try {
      const savedMaterials = localStorage.getItem("savedMaterials");
      if (savedMaterials) {
        const parsedMaterials = JSON.parse(savedMaterials);
        setMaterials(parsedMaterials);
        setSavedMaterials(parsedMaterials);
      }
    } catch (error) {
      console.error("Error loading materials from localStorage:", error);
    }
  }, []);

  // Check if user is authenticated, if not redirect to landing page
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
      }
      // If user IS authenticated, also redirect to landing page
      else {
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  const saveMaterials = async (): Promise<void> => {
    if (materialsInProgress.length === 0) return;

    setLoading(true);
    try {
      // Ensure each material has an id and date before saving
      const normalized = materialsInProgress.map((material: Material) => ({
        ...material,
        date: material.date
          ? material.date
          : new Date().toISOString().split("T")[0],
        id:
          material.id && material.id.trim() !== ""
            ? material.id
            : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      }));

      // Get existing materials from localStorage
      const existingMaterials: Material[] = JSON.parse(
        localStorage.getItem("savedMaterials") || "[]"
      );

      const materialMap = new Map<string, Material>(
        existingMaterials.map((m) => [m.id, m])
      );
      normalized.forEach((material) => materialMap.set(material.id, material));

      const updatedMaterials: Material[] = Array.from(materialMap.values());

      // Save to localStorage
      localStorage.setItem("savedMaterials", JSON.stringify(updatedMaterials));

      // Update state
      setMaterials(updatedMaterials);
      setSavedMaterials(updatedMaterials);

      // Clear in-progress state
      setMaterialsInProgress([]);
      setSelectedItems([]);

      // Clear photo previews and files
      setPhotoPreviewsByRow({});
      setPhotoFilesByRow({});

      toast({
        title: "Success",
        description: `Successfully saved ${normalized.length} material(s) to local storage`,
      });
    } catch (error) {
      console.error("Error saving materials:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload a PDF blob to Supabase Storage and return its public URL
  const uploadPdfToStorage = async (
    blob: Blob,
    fileName: string
  ): Promise<{ url: string; path: string } | null> => {
    try {
      if (!currentUser?.id) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return null;
      }

      // Create a sanitized file path with user ID and timestamp
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `reports/user_${currentUser.id}/${timestamp}_${safeFileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("dailymaterialk")
        .upload(filePath, blob, {
          contentType: "application/pdf",
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("dailymaterialk").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }

      return {
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error("Error in uploadPdfToStorage:", error);
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "Failed to upload PDF",
        variant: "destructive",
      });
      return null;
    }
  };

  // Helper: fetch user's special code from profiles
  const getUserSpecialCode = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("special_code")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error fetching special code:", error);
        return null;
      }
      return (data?.special_code as string) || null;
    } catch (err) {
      console.error("Unexpected error fetching special code:", err);
      return null;
    }
  };

  // Save PDF metadata to the database
  const savePdfReportMetadata = async (
    pdfUrl: string,
    fileName: string,
    fileSize: number
  ): Promise<boolean> => {
    try {
      if (!currentUser?.id) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return false;
      }

      // Get the user's special code from their profile
      const specialCode = await getUserSpecialCode(currentUser.id);

      // Insert the PDF metadata into the database
      const { error } = await supabase.from("daily_material_report").insert([
        {
          user_id: currentUser.id,
          special_code: specialCode,
          pdf_url: pdfUrl,
          file_name: fileName,
          file_size: fileSize,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error saving PDF metadata:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error in savePdfReportMetadata:", error);
      toast({
        title: "Save Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save PDF metadata",
        variant: "destructive",
      });
      return false;
    }
  };

  const generateBulkPDF = async (): Promise<void> => {
    setLoading(true);

    try {
      if (materials.length === 0) {
        toast({
          title: "No materials to export",
          description: "Please add some materials before generating a PDF.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create a new PDF document
      const doc = new jsPDF("l", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 40;
      let cursorY = 40;

      // Title and metadata (tighter spacing)
      doc.setFontSize(18);
      doc.text("Daily Material Report", marginX, cursorY);

      // Add date
      cursorY += 8;
      doc.setFontSize(10);
      doc.setTextColor(100);
      const generatedOn = new Date().toLocaleString();
      doc.text(`Generated on: ${generatedOn}`, marginX, cursorY);
      cursorY += 14;
      doc.setTextColor(0);

      // Add summary section
      doc.setFontSize(12);
      const totalRecords = materials.length;
      const totalPhotos = materials.reduce(
        (acc, m) => acc + (m.photos || []).length,
        0
      );

      // Get user info for the report
      const userName = currentUser?.id
        ? await getUserName(currentUser.id)
        : null;
      const specialCode = currentUser?.id
        ? await getUserSpecialCode(currentUser.id)
        : null;

      const summaryLines = [
        `Prepared By: ${userName || "N/A"}`,
        `Special Code: ${specialCode || "N/A"}`,
        `Total Records: ${totalRecords}`,
        `Total Photos: ${totalPhotos}`,
      ];
      summaryLines.forEach((line) => {
        doc.text(line, marginX, cursorY);
        cursorY += 12;
      });
      cursorY += 2;

      // Table
      const columns = [
        { header: "Date", dataKey: "date" },
        { header: "Category", dataKey: "category" },
        { header: "Sub-Category", dataKey: "subCategory" },
        { header: "Item", dataKey: "item" },
        { header: "P.O/Invoice/Challan No", dataKey: "poNumber" },
        { header: "Size", dataKey: "size" },
        { header: "Quantity", dataKey: "quantity" },
        { header: "Unit", dataKey: "unit" },
        { header: "Grade", dataKey: "grade" },
        { header: "Brand", dataKey: "brand" },
        { header: "Supplier/Vendor", dataKey: "supplier" },
        { header: "Vehicle No", dataKey: "vehicleNo" },
        { header: "QR Code", dataKey: "qrCode" },
        { header: "Barcode", dataKey: "barcode" },
        { header: "Remarks", dataKey: "remarks" },
        { header: "Photos", dataKey: "photosCount" },
      ] as const;

      const rows = materials.map((m) => ({
        date: m.date
          ? (() => {
              try {
                return format(parseISO(m.date), "PP");
              } catch {
                return m.date;
              }
            })()
          : "N/A",
        category: m.category || "N/A",
        subCategory: m.subCategory || "N/A",
        item: m.item || "N/A",
        poNumber: m.poNumber || "N/A",
        size: m.size || "N/A",
        quantity:
          m.quantity === undefined || m.quantity === null ? "N/A" : m.quantity,
        unit: m.unit || "N/A",
        grade: m.grade || "N/A",
        brand: m.brand || "N/A",
        supplier: m.supplier || "N/A",
        vehicleNo: m.vehicleNo || "N/A",
        qrCode: m.qrCode || "N/A",
        barcode: m.barcode || "N/A",
        remarks: m.remarks || "N/A",
        photosCount: (m.photos || []).length,
      }));

      autoTable(doc, {
        head: [columns.map((c) => c.header)],
        body: rows.map((r) => columns.map((c) => (r as any)[c.dataKey])),
        startY: cursorY + 4,
        styles: { fontSize: 9, cellPadding: 6, valign: 'middle', overflow: 'linebreak' },
        headStyles: { fillColor: [33, 33, 33], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: 'grid',
        margin: { top: 20, bottom: 20, left: 20, right: 20 },
      });

      // Images section header
      let afterTableY = (doc as any).lastAutoTable?.finalY || cursorY + 20;
      if (afterTableY + 30 > pageHeight - 40) {
        doc.addPage();
        afterTableY = 40;
      }
      doc.setFontSize(14);
      doc.text("Photos", marginX, afterTableY + 24);
      let imgY = afterTableY + 36;

      // Flatten all images, keep some context
      const allImages = materials.flatMap((m) =>
        (m.photos || []).map((url) => ({ url, item: m.item || "", id: m.id }))
      );
      const imgMaxW = pageWidth - marginX * 2 - 16; // single per row; adjust if wanting grid
      const imgMaxH = 180;

      for (let i = 0; i < allImages.length; i++) {
        const { url, item, id } = allImages[i];
        // Add caption
        const caption = `Material: ${item || "N/A"}  |  ID: ${id}`;
        doc.setFontSize(10);
        if (imgY + imgMaxH + 40 > pageHeight - 40) {
          doc.addPage();
          imgY = 40;
        }
        doc.text(caption, marginX, imgY);
        const dataUrl = await toDataURL(url);
        if (dataUrl) {
          try {
            doc.addImage(
              dataUrl,
              "JPEG",
              marginX,
              imgY + 8,
              imgMaxW,
              imgMaxH,
              undefined,
              "FAST"
            );
            imgY += imgMaxH + 32;
          } catch (err) {
            console.error("Failed to add image to PDF:", err);
            imgY += 24;
          }
        } else {
          // If failed, at least leave a placeholder line
          doc.text("(image failed to load)", marginX, imgY + 14);
          imgY += 32;
        }
      }

      // Footer on every page
      const addFooter = () => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let p = 1; p <= pageCount; p++) {
          doc.setPage(p);
          doc.setFontSize(9);
          doc.setTextColor(120);
          const footerText = "Generated from BUILD KAAM";
          doc.text(footerText, marginX, pageHeight - 16);
          const pageStr = `Page ${p} of ${pageCount}`;
          doc.text(pageStr, pageWidth - marginX - 80, pageHeight - 16);
        }
        doc.setTextColor(0);
      };
      addFooter();

      // Upload to storage and store metadata
      const fileName = `daily-report-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.pdf`;
      const blob = doc.output("blob");
      const fileSize = blob.size;

      // Upload PDF to storage
      const uploadResult = await uploadPdfToStorage(blob, fileName);

      if (uploadResult?.url) {
        // Save metadata to database
        const success = await savePdfReportMetadata(
          uploadResult.url,
          fileName,
          fileSize
        );

        if (success) {
          setSelectedPdf(uploadResult.url);
          toast({
            title: "PDF Saved",
            description: "Your daily report has been saved successfully.",
          });
          // Refresh the PDF list
          await fetchPdfList();
        } else {
          toast({
            title: "Error",
            description: "Failed to save PDF metadata",
            variant: "destructive",
          });
          // Still download the PDF even if metadata save failed
          doc.save(fileName);
        }
      } else {
        // Fallback to client download if upload fails
        toast({
          title: "Warning",
          description:
            "Failed to upload PDF to storage. Downloading locally instead.",
          variant: "default",
        });
        doc.save(fileName);
      }
    } catch (error) {
      console.error("Error generating bulk PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  // Fetch list of generated PDFs from daily_material_report for current user
  const fetchPdfList = async (): Promise<void> => {
    try {
      if (!currentUser?.id) return;

      const { data, error } = await supabase
        .from("daily_material_report")
        .select("id, pdf_url, file_name, file_size, created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching PDF list:", error);
        toast({
          title: "Error",
          description: "Failed to load PDF list",
          variant: "destructive",
        });
        return;
      }

      const mapped = (data || []).map((item) => ({
        id: item.id,
        name:
          item.file_name ||
          `Report_${new Date(item.created_at).toLocaleDateString()}`,
        url: item.pdf_url,
        size: item.file_size,
        createdAt: item.created_at,
      }));

      setPdfFiles(mapped);
    } catch (error) {
      console.error("Error fetching PDF list:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading PDFs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfList();
    // re-fetch when user changes
  }, [currentUser?.id]);

  // Helper: Convert image URL to data URL (base64)
  async function toDataURL(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  return (
    <DashboardLayout role="worker">
      <div className="p-4">
        {/* Materials Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Material Records
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={generateBulkPDF}
                disabled={savedMaterials.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export All ({savedMaterials.length})
                </span>
              </Button>
            </div>
          </div>

          {/* Material Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                onValueChange={handleCategoryChange}
                value={selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(materialCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && !hasSubcategories() && (
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  type="text"
                  placeholder="Enter item name"
                  value={selectedItems[0] || ""}
                  onChange={(e) =>
                    setSelectedItems(e.target.value ? [e.target.value] : [])
                  }
                />
              </div>
            )}

            {selectedCategory && hasSubcategories() && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="text-xs h-6"
                  >
                    {isAllSelected() ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 border rounded-md max-h-60 overflow-y-auto">
                  {getCurrentCategoryItems().map((item) => (
                    <Button
                      key={item}
                      type="button"
                      variant={isItemSelected(item) ? "default" : "outline"}
                      className="h-auto py-2 whitespace-normal text-left justify-start"
                      onClick={() => toggleItemSelection(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Material Button */}
          {selectedItems.length > 0 && (
            <div className="mb-6 flex justify-end">
              <Button
                type="button"
                onClick={addSelectedMaterials}
                className="w-full mt-4"
                disabled={selectedItems.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                {selectedItems.length > 0
                  ? `Add ${selectedItems.length} Material${
                      selectedItems.length > 1 ? "s" : ""
                    }`
                  : "Add Materials"}
              </Button>
            </div>
          )}

          {/* Material Details Form */}
          {materialsInProgress.length > 0 && (
            <div className="space-y-6 mb-6">
              <h3 className="text-lg font-medium">Material Details</h3>

              {materialsInProgress.map((material, index) => (
                <Card key={material.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{material.item}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeMaterial(material.id)}
                        title="Remove material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                      {material.category} &gt; {material.subCategory}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={material.date}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "date",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>P.O/Invoice/Challan No</Label>
                          <Input
                            value={material.poNumber}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "poNumber",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <Input
                            value={material.size}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "size",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={material.quantity}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Input
                            value={material.unit}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "unit",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Grade</Label>
                          <Input
                            value={material.grade}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "grade",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Brand</Label>
                          <Input
                            value={material.brand}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "brand",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Supplier/Vendor</Label>
                          <Input
                            value={material.supplier}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "supplier",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Vehicle No</Label>
                          <Input
                            value={material.vehicleNo}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "vehicleNo",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>QR Code</Label>
                          <Input
                            value={material.qrCode}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "qrCode",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Barcode</Label>
                          <Input
                            value={material.barcode}
                            onChange={(e) =>
                              handleMaterialChange(
                                material.id,
                                "barcode",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Remarks</Label>
                        <Textarea
                          value={material.remarks}
                          onChange={(e) =>
                            handleMaterialChange(
                              material.id,
                              "remarks",
                              e.target.value
                            )
                          }
                          placeholder="Any additional notes or comments"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Photos</Label>
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`photo-upload-${material.id}`}
                            className="cursor-pointer border border-dashed rounded-md p-4 flex flex-col items-center justify-center w-full hover:bg-accent/50"
                          >
                            <Upload className="h-6 w-6 mb-2" />
                            <span className="text-sm text-muted-foreground">
                              Click or drag to upload photos
                            </span>
                            <Input
                              id={`photo-upload-${material.id}`}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) =>
                                handlePhotoUpload(e, material.id)
                              }
                            />
                          </Label>
                        </div>
                        {/* Unsaved staged photo previews (row-specific) */}
                        {Array.isArray(photoPreviewsByRow[material.id]) &&
                          photoPreviewsByRow[material.id].length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                              {photoPreviewsByRow[material.id].map(
                                (preview, index) => (
                                  <div
                                    key={`staged-${index}`}
                                    className="relative"
                                  >
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="h-24 w-full object-cover rounded-md"
                                      onClick={() => {
                                        setPreviewImage(preview);
                                        setIsPreviewOpen(true);
                                      }}
                                    />
                                    <div className="absolute top-1 right-1 flex gap-1">
                                      <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-6 w-6 rounded-full"
                                        onClick={() => {
                                          setPreviewImage(preview);
                                          setIsPreviewOpen(true);
                                        }}
                                        title="Preview"
                                      >
                                        <ImageIcon className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-6 w-6 rounded-full"
                                        onClick={() =>
                                          removePhoto(material.id, index)
                                        }
                                        title="Delete photo"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="absolute bottom-1 left-1">
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] py-0.5 px-1"
                                      >
                                        OK
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        {/* Already saved photos for this material (URLs) */}
                        {material.photos && material.photos.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {material.photos.map((photo, index) => (
                              <div
                                key={`saved-${index}`}
                                className="relative group"
                              >
                                <img
                                  src={photo}
                                  alt={`Photo ${index + 1}`}
                                  className="h-24 w-full object-cover rounded-md"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() =>
                                    removePhoto(material.id, index)
                                  }
                                  title="Delete photo"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                // ...
              ))}

              <div className="flex justify-end gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMaterialsInProgress([]);
                    setPhotoPreviews([]);
                    setPhotoFiles([]);
                    setSelectedItems([]);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveMaterials}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    `Save All (${materialsInProgress.length})`
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Materials Table */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Material Records</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={exportMaterialsTablePDF}
                  variant="default"
                  disabled={materials.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={() => setShowGeneratedPDFs(true)}
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Generated PDFs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="overflow-auto max-h-[520px]">
                  <div className="min-w-[2000px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Sub-Category</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>P.O/Invoice/Challan No</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Supplier/Vendor</TableHead>
                          <TableHead>Vehicle No</TableHead>
                          <TableHead>QR Code</TableHead>
                          <TableHead>Barcode</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead>Photos</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materials.length > 0 ? (
                          materials.map((material) => (
                            <TableRow key={material.id}>
                              <TableCell>
                                {material?.date
                                  ? (() => {
                                      try {
                                        return format(
                                          parseISO(material.date),
                                          "PP"
                                        );
                                      } catch {
                                        return material.date || "N/A";
                                      }
                                    })()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {material.category || "N/A"}
                              </TableCell>
                              <TableCell>
                                {material.subCategory || "N/A"}
                              </TableCell>
                              <TableCell className="font-medium">
                                {material.item || "N/A"}
                              </TableCell>
                              <TableCell>
                                {material.poNumber || "N/A"}
                              </TableCell>
                              <TableCell>{material.size || "N/A"}</TableCell>
                              <TableCell>
                                {material.quantity === undefined ||
                                material.quantity === null
                                  ? "N/A"
                                  : material.quantity}
                              </TableCell>
                              <TableCell>{material.unit || "N/A"}</TableCell>
                              <TableCell>{material.grade || "N/A"}</TableCell>
                              <TableCell>{material.brand || "N/A"}</TableCell>
                              <TableCell>
                                {material.supplier || "N/A"}
                              </TableCell>
                              <TableCell>
                                {material.vehicleNo || "N/A"}
                              </TableCell>
                              <TableCell>{material.qrCode || "N/A"}</TableCell>
                              <TableCell>{material.barcode || "N/A"}</TableCell>
                              <TableCell
                                className="max-w-[240px] truncate"
                                title={material.remarks || "N/A"}
                              >
                                {material.remarks || "N/A"}
                              </TableCell>
                              <TableCell>
                                {(material.photos || []).length}
                              </TableCell>
                              <TableCell className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    // Move material to edit mode
                                    setMaterialsInProgress((prev) => [
                                      ...prev.filter(
                                        (m) => m.id !== material.id
                                      ),
                                      material,
                                    ]);
                                    setActiveMaterialIndex(
                                      materialsInProgress.length
                                    );
                                    // Scroll to the form
                                    document
                                      .getElementById("material-form")
                                      ?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  title="Edit material"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteMaterial(material.id)}
                                  title="Delete material"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={17}
                              className="text-center py-8 text-gray-500"
                            >
                              No material records yet. Add materials to see them
                              here.
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
                  <CardTitle>Generated Material PDFs</CardTitle>
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
                      <div className="p-4 border-b flex justify-between items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedPdf(null)}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to list
                        </Button>
                        <Button
                          onClick={generateBulkPDF}
                          variant="default"
                          className="flex items-center gap-2"
                        >
                          <TableIcon className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                      <div className="flex-1 overflow-auto p-4">
                        <iframe
                          src={selectedPdf}
                          className="w-full h-full border rounded"
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
                            <TableHead>Created</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pdfFiles && pdfFiles.length > 0 ? (
                            pdfFiles.map((file) => (
                              <TableRow key={file.name}>
                                <TableCell>
                                  {file.createdAt
                                    ? new Date(file.createdAt).toLocaleString()
                                    : "-"}
                                </TableCell>
                                <TableCell className="truncate max-w-[300px]">
                                  {file.name}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPdf(file.url)}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          : (
                            <TableRow>
                              <TableCell
                                colSpan={3}
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
      </div>
      {/* Image Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="w-full">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
