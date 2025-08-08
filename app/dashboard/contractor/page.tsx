"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  ClipboardList,
  TrendingUp,
  User,
  Clock,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Server,
  Code,
  Bug,
  FileText,
} from "lucide-react";

export default function ContractorDashboard() {
  return (
    <DashboardLayout role="contractor">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Contractor Dashboard
          </h2>
          <p className="text-gray-600">
            View project timelines, manage task assignments, and coordinate team
            activities
          </p>
        </div>
        <Link href="/dashboard/contractor/material-management">

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Material Management</CardTitle>
              <CardDescription>Daily Progress Report</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Track daily project progress and milestones
              </p>
              <Button className="w-full">View Materials</Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/contractor/daily">

<Card className="cursor-pointer hover:shadow-md transition-shadow">
  <CardHeader className="text-center">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <FileText className="w-8 h-8 text-blue-600" />
    </div>
    <CardTitle className="text-xl"> Daily Material Management</CardTitle>
    <CardDescription>Daily Progress Report</CardDescription>
  </CardHeader>
  <CardContent className="text-center">
    <p className="text-sm text-gray-600 mb-4">
      Track daily project progress and milestones
    </p>
    <Button className="w-full">View Materials</Button>
  </CardContent>
</Card>
</Link>
      </div>
    </DashboardLayout>
  );
}