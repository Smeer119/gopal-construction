'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Users, ClipboardList, TrendingUp, User, Clock, CheckSquare } from 'lucide-react'

export default function ContractorDashboard() {
  return (
    <DashboardLayout role="contractor">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contractor Dashboard</h2>
          <p className="text-gray-600">
            View project timelines, manage task assignments, and coordinate team activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">2 ending this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">22 active today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+18% this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Schedule</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">87%</div>
              <p className="text-xs text-muted-foreground">Above target (85%)</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5" />
                <span>Current Projects</span>
              </CardTitle>
              <CardDescription>
                Overview of active projects and their progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Office Building Renovation</p>
                    <p className="text-sm text-gray-600">Due: March 15, 2025</p>
                  </div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-sm text-gray-600">75% complete</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Warehouse Construction</p>
                    <p className="text-sm text-gray-600">Due: April 30, 2025</p>
                  </div>
                  <Badge variant="secondary">Planning</Badge>
                </div>
                <Progress value={25} className="h-2" />
                <p className="text-sm text-gray-600">25% complete</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Shopping Center Upgrade</p>
                    <p className="text-sm text-gray-600">Due: February 28, 2025</p>
                  </div>
                  <Badge className="bg-green-600">Nearly Done</Badge>
                </div>
                <Progress value={95} className="h-2" />
                <p className="text-sm text-gray-600">95% complete</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Team Management</span>
              </CardTitle>
              <CardDescription>
                Manage your team and assign tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View Team Members
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ClipboardList className="w-4 h-4 mr-2" />
                Assign Tasks
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Management
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Time Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}