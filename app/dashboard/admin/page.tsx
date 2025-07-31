'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Users, Shield, Key, BarChart3, Database, Plus, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/supabase'

export default function AdminDashboard() {
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    defaultRole: '' as UserRole | ''
  })
  const [generatedKey, setGeneratedKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreateProject = async () => {
    if (!projectForm.projectName || !projectForm.defaultRole) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Create project first
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectForm.projectName,
          description: `Project created for ${projectForm.projectName}`
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Generate project key
      const { data: keyData, error: keyError } = await supabase.rpc('generate_project_key')
      if (keyError) throw keyError

      // Create project key
      const { error: keyInsertError } = await supabase
        .from('project_keys')
        .insert({
          key_value: keyData,
          project_id: project.id,
          project_name: projectForm.projectName,
          default_role: projectForm.defaultRole
        })

      if (keyInsertError) throw keyInsertError

      setGeneratedKey(keyData)
      setSuccess('Project and key created successfully!')
      setProjectForm({ projectName: '', defaultRole: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey)
    setSuccess('Key copied to clipboard!')
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrator Dashboard</h2>
          <p className="text-gray-600">
            Manage platform-level settings, users, and system configurations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+20% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Excellent</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>System Management</span>
              </CardTitle>
              <CardDescription>
                Configure platform settings and system parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Database Management
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Security Configuration
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Manage users, roles, and access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Key className="w-4 h-4 mr-2" />
                Generate Special Keys
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Role Permissions
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Project Key</span>
            </CardTitle>
            <CardDescription>
              Generate special keys for new users to join projects with assigned roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={projectForm.projectName}
                  onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultRole">Default Role</Label>
                <Select onValueChange={(value) => setProjectForm({ ...projectForm, defaultRole: value as UserRole })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleCreateProject} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Project & Generate Key'}
            </Button>

            {generatedKey && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium">Generated Project Key:</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input value={generatedKey} readOnly className="font-mono" />
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Share this key with new users to automatically assign them to the project with the {projectForm.defaultRole} role.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}