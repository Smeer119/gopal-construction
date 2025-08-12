'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [showEmailSent, setShowEmailSent] = useState(false)
  const [userType, setUserType] = useState<'individual' | 'industry'>('individual')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
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
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Please fill in all fields')
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { user_type: userType },
        },
      })

      if (error) throw error

      // Ask user to confirm email before proceeding
      setShowEmailSent(true)

      // Redirect to landing page after signup
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
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
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>Join Gopal Construction</CardDescription>
            </CardHeader>
            <CardContent>
              {showEmailSent ? (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Check Your Email</h2>
                    <p className="text-sm text-gray-600 mt-1">We've sent a confirmation link to <strong>{formData.email}</strong>.</p>
                    <p className="text-sm text-gray-600">Please confirm your email, then come back to login.</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link href="/login">
                      <Button className="w-full">Go to Login</Button>
                    </Link>
                    <Button variant="outline" onClick={() => setShowEmailSent(false)} className="w-full">Back</Button>
                  </div>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="mb-2">
                  <div className="grid w-full grid-cols-2 bg-muted rounded-md p-1">
                    <button type="button" onClick={() => setUserType('individual')} className={`py-2 rounded ${userType==='individual' ? 'bg-background shadow' : ''}`}>Individual</button>
                    <button type="button" onClick={() => setUserType('industry')} className={`py-2 rounded ${userType==='industry' ? 'bg-background shadow' : ''}`}>Industry</button>
                  </div>
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
              )}

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