'use client'

import { useState, useEffect } from 'react'

import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Users, Shield, Key, BarChart3, Database, Plus, Copy, FileText, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/supabase'

export default function AdminDashboard() {
  // PDF report state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [currentSpecialCode, setCurrentSpecialCode] = useState<string | null>(null)
  // Selected date (defaults to today's system date)
  const [reportDate, setReportDate] = useState<string>(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })
  const [reports, setReports] = useState<Array<{
    id?: string
    user_id?: string
    special_code?: string
    date?: string
    created_at?: string
    pdf_url: string
  }>>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [projectForm, setProjectForm] = useState({
    projectName: '',
    defaultRole: '' as UserRole | ''
  })
  const [generatedKey, setGeneratedKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load current user + profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser()
        const uid = auth?.user?.id || null
        setCurrentUserId(uid)
        if (uid) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role, special_code')
            .eq('id', uid)
            .single()
          if (!error && data) {
            setCurrentRole((data as any).role || null)
            setCurrentSpecialCode((data as any).special_code || null)
          }
        }
      } catch {}
    }
    loadProfile()
  }, [])

  // Fetch reports whenever filters change (filter by selected date + role)
  useEffect(() => {
    const fetchReports = async () => {
      setReportsLoading(true)
      setReportsError('')
      try {
        // Build date range [startOfDay, startOfNextDay) in UTC from selected date
        const start = new Date(`${reportDate}T00:00:00.000Z`)
        const end = new Date(start)
        end.setUTCDate(end.getUTCDate() + 1)

        let query = supabase
          .from('pdf_reports')
          .select('id, user_id, special_code, date, created_at, pdf_url')
          .gte('date', start.toISOString())
          .lt('date', end.toISOString())
          .order('created_at', { ascending: false })

        // Role-based filtering
        if (currentRole === 'industry' && currentSpecialCode) {
          query = query.eq('special_code', currentSpecialCode)
        } else if (currentRole && currentRole !== 'admin' && currentUserId) {
          query = query.eq('user_id', currentUserId)
        }

        const { data, error } = await query
        if (error) throw error
        setReports(data || [])
      } catch (e: any) {
        setReportsError(e?.message || 'Failed to load reports')
        setReports([])
      } finally {
        setReportsLoading(false)
      }
    }
    fetchReports()
  }, [reportDate, currentRole, currentSpecialCode, currentUserId])

  // Resolve a signed URL if the file appears to be in a private bucket
  const getSignedUrlIfPossible = async (url: string): Promise<string> => {
    try {
      // Expect pattern: .../storage/v1/object/public/materials/<path>
      // If already public, return as-is. If we can extract a path, create a short-lived signed URL.
      const marker = '/storage/v1/object/public/materials/'
      const idx = url.indexOf(marker)
      if (idx >= 0) {
        const path = url.substring(idx + marker.length)
        const { data, error } = await supabase.storage
          .from('materials')
          .createSignedUrl(path, 300)
        if (!error && data?.signedUrl) return data.signedUrl
      }
      return url
    } catch {
      return url
    }
  }

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

        {false && (
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

        {/* PDF Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={(o) => { if (!o) { setPreviewOpen(false); setPreviewUrl(null); } }}>
          <DialogContent className="max-w-5xl w-[90vw] h-[85vh] p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center justify-between w-full gap-3">
                <span>PDF Preview</span>
                <div className="flex items-center gap-2">
                  {previewUrl && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        const a = document.createElement('a');
                        a.href = previewUrl ?? "";
                        a.download = 'report.pdf';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setPreviewOpen(false); setPreviewUrl(null); }}>
                    Close
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="w-full h-full p-4">
              {previewUrl ? (
                <iframe
                  src={previewUrl ?? undefined}
                  className="w-full h-full border rounded"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-sm text-gray-600 p-4">No PDF selected</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
        )}

        {false && (
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
        )}

        {false && (
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
        )}

        {/* PDF Reports Section only */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>PDF Reports</span>
            </CardTitle>
            <CardDescription>
              PDFs for the selected date{currentRole === 'industry' ? ' (filtered by special code)' : currentRole && currentRole !== 'admin' ? ' (your reports)' : ''}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="reportDate">Date</Label>
                <Input
                  id="reportDate"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </div>
            </div>
            {reportsLoading ? (
              <div className="text-sm text-gray-600">Loading reports...</div>
            ) : reportsError ? (
              <div className="text-sm text-red-600">{reportsError}</div>
            ) : reports.length === 0 ? (
              <div className="text-sm text-gray-600">No reports found for the selected date</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="text-left p-2 border">Created At</th>
                      <th className="text-left p-2 border">User</th>
                      <th className="text-left p-2 border">Special Code</th>
                      <th className="text-left p-2 border">Date</th>
                      <th className="text-left p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, idx) => (
                      <tr key={(r.id as string) || idx} className="border-b hover:bg-gray-50">
                        <td className="p-2 border">{r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}</td>
                        <td className="p-2 border">{r.user_id || 'N/A'}</td>
                        <td className="p-2 border">{r.special_code || 'N/A'}</td>
                        <td className="p-2 border">{r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-2 border">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const u = await getSignedUrlIfPossible(r.pdf_url)
                                setPreviewUrl(u)
                                setPreviewOpen(true)
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                const u = await getSignedUrlIfPossible(r.pdf_url)
                                const a = document.createElement('a')
                                a.href = u
                                a.download = 'report.pdf'
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}