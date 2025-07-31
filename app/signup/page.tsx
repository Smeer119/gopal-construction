'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { signUp } from '@/lib/auth'
import { Mail, ArrowLeft } from 'lucide-react'
import type { UserRole, UserType } from '@/lib/supabase'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [showEmailSent, setShowEmailSent] = useState(false)
  const [userType, setUserType] = useState<UserType>('individual')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '' as UserRole | '',
    specialKey: '',
    projectKey: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        throw new Error('Please fill in all required fields')
      }

      if (userType === 'industry') {
        if (!formData.role) {
          throw new Error('Please select a role')
        }
        if (formData.role === 'admin' && !formData.specialKey) {
          throw new Error('Special key is required for Admin role')
        }
      }

      // Validate project key if provided
      if (formData.projectKey) {
        // This validation will be handled in the signUp function
      }

      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        userType,
        userType === 'industry' ? formData.role as UserRole : undefined,
        formData.specialKey || undefined,
        formData.projectKey || undefined
      )

      if (error) throw error

      setShowEmailSent(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  if (showEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a confirmation link to <strong>{formData.email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Please check your email and click the confirmation link to complete your registration.
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/login">
                  <Button className="w-full">
                    Go to Login
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailSent(false)}
                  className="w-full"
                >
                  Back to Signup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/" className="flex items-center text-gray-600 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Choose your account type and get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={userType} onValueChange={(value) => setUserType(value as UserType)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual">Individual</TabsTrigger>
                  <TabsTrigger value="industry">Industry</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Common fields */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>

            

                  <TabsContent value="individual" className="mt-0">
                    <p className="text-sm text-gray-600 mt-4">
                      As an individual user, you'll be able to select your role after signup.
                    </p>
                  </TabsContent>

                  <TabsContent value="industry" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="engineer">Engineer</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="worker">Worker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.role === 'admin' && (
                      <div className="space-y-2">
                        <Label htmlFor="specialKey">Special Key</Label>
                        <Input
                          id="specialKey"
                          type="text"
                          placeholder="Enter admin special key"
                          value={formData.specialKey}
                          onChange={(e) => handleInputChange('specialKey', e.target.value)}
                          required
                        />
                        <p className="text-xs text-gray-600">
                          Special key is required for Administrator access
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-black hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}