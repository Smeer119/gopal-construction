'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { User, Mail, Phone, Shield, Building, Edit, Save, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [userProject, setUserProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    phone: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)
      await fetchProfile(currentUser.id)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)
      setEditData({
        name: profileData.name || '',
        phone: profileData.phone || ''
      })

      // Fetch user's project assignment
      const { data: projectData, error: projectError } = await supabase
        .from('user_projects')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('user_id', userId)
        .single()

      if (!projectError && projectData) {
        setUserProject(projectData)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editData.name,
          phone: editData.phone
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, ...editData })
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: profile?.name || '',
      phone: profile?.phone || ''
    })
    setEditing(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'engineer': return 'bg-blue-100 text-blue-800'
      case 'contractor': return 'bg-green-100 text-green-800'
      case 'worker': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)} className="flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex items-center space-x-2">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{profile.name || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{profile.email}</span>
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{profile.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Role & Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <Badge variant="outline" className="capitalize">
                      {profile.user_type}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {profile.role ? (
                      <Badge className={`capitalize ${getRoleColor(profile.role)}`}>
                        {profile.role}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">No role assigned</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Project</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span>
                      {userProject?.project?.name || 'No project assigned'}
                    </span>
                  </div>
                  {userProject?.project && (
                    <p className="text-xs text-gray-500">
                      Joined on {new Date(userProject.joined_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <p className="text-sm text-gray-600">
                  Account created on {new Date(profile.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Last updated on {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
              <Link href={profile.role ? `/dashboard/${profile.role}` : '/select-role'}>
                <Button variant="outline">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}