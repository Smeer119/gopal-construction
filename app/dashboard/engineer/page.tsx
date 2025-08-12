'use client'

import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wrench, AlertTriangle, CheckCircle, Clock, Server, Code, Bug, FileText, Calendar, TrendingUp } from 'lucide-react'

export default function EngineerDashboard() {
  return (
    <DashboardLayout role="engineer">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Engineer Dashboard</h2>
          <p className="text-gray-600">
          Create, Review , Share And Save All Daily Site Progress , Task Scheduling , Checklist And Pourcard
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/engineer/dpr">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">DPR</CardTitle>
                <CardDescription>Daily Progress Report</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                Fill, Share, Save & Download Reports Instantly.
                </p>
                <Button className="w-full">
                  View DPR
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/engineer/scheduling">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Scheduling</CardTitle>
                <CardDescription>Project Scheduling</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                Plan, Assign And Track Project Stages.
                </p>
                <Button className="w-full">
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/engineer/forecasting">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Checklist  </CardTitle>
                <CardDescription>Project Checklist</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                Fill ,Check And Share Pourcards.
                </p>
                <Button className="w-full">
                  View Forecasts
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
  
  
}