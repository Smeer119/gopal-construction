"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
  ArrowLeft, Check, X, FileText,
  Calendar as CalendarIcon
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { constructionData } from "./data";

// Types
type ChecklistItem = { task: string; completed: boolean | null; };
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
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tempMainTopic, setTempMainTopic] = useState("");
  const [tempSubTopic, setTempSubTopic] = useState("");
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

          const fullName = profile?.full_name || user.email || "";
          setUserName(fullName);
        }
        const saved = localStorage.getItem("multiChecklists");
        if (saved) setMultiSelectedChecklists(JSON.parse(saved));
      } catch (err) {
        toast({ title: "Error", description: "Failed to load", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem("multiChecklists", JSON.stringify(multiSelectedChecklists));
  }, [multiSelectedChecklists]);

  const handleAddChecklist = () => {
    let tasks: string[] = [];

    if (tempSubTopic) {
      tasks = constructionData[tempMainTopic]?.[tempSubTopic] || [];
    } else {
      tasks = constructionData[tempMainTopic] as string[];
    }

    if (!tasks || tasks.length === 0) return;

    const newChecklist: ChecklistData = {
      mainTopic: tempMainTopic,
      subTopic: tempSubTopic || undefined,
      items: tasks.map(task => ({ task, completed: null })),
      generatedBy: userName,
      date: format(new Date(), "yyyy-MM-dd"),
      description: ""
    };

    setMultiSelectedChecklists(prev => [...prev, newChecklist]);
    setTempMainTopic("");
    setTempSubTopic("");
  };

  const updateChecklistItem = (checklistIndex: number, itemIndex: number, status: boolean) => {
    const updated = [...multiSelectedChecklists];
    updated[checklistIndex].items[itemIndex].completed = status;
    setMultiSelectedChecklists(updated);
  };

  return (
    <DashboardLayout role="worker">
      <div className="p-4">
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

        {/* Selection UI */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Checklist Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Main Topic */}
              <div className="space-y-2">
                <Label>Main Topic</Label>
                <Select onValueChange={setTempMainTopic} value={tempMainTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a main topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(constructionData).map(topic => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub-Topic */}
              {tempMainTopic && typeof constructionData[tempMainTopic] === "object" &&
                !Array.isArray(constructionData[tempMainTopic]) && (
                  <div className="space-y-2">
                    <Label>Sub-Topic</Label>
                    <Select onValueChange={setTempSubTopic} value={tempSubTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sub-topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(constructionData[tempMainTopic]).map(subTopic => (
                          <SelectItem key={subTopic} value={subTopic}>
                            {subTopic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {/* Add Button */}
              <div className="mt-4 md:mt-0">
                <Button onClick={handleAddChecklist}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render All Selected Checklists */}
        {multiSelectedChecklists.map((checklist, idx) => (
          <Card className="mb-6" key={idx}>
            <CardHeader>
              <CardTitle>
                {checklist.mainTopic}
                {checklist.subTopic && ` > ${checklist.subTopic}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
