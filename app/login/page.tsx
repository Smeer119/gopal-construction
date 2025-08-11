'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn, getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkExistingAuth()
  }, [])

  const checkExistingAuth = async () => {
    const user = await getCurrentUser()
    if (!user) return

    // Fetch profile to check completeness
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone, role, special_code')
      .eq('id', user.id)
      .single()

    const userType = user.user_metadata?.user_type as 'individual' | 'industry' | undefined
    const role = (profile as any)?.role as string | null
    const nameOk = Boolean((profile as any)?.name)
    const phoneOk = Boolean((profile as any)?.phone)
    const specialOk = role === 'admin' || !role ? true : Boolean((profile as any)?.special_code)

    // Enforce completion
    const individualComplete = userType !== 'industry' && nameOk && phoneOk
    const industryComplete = userType === 'industry' && nameOk && phoneOk && Boolean(role) && specialOk
    const isComplete = individualComplete || industryComplete

    if (!isComplete) {
      router.replace('/complete-profile')
      return
    }

    // Redirect based on role if present, else generic dashboard
    if (userType === 'industry' && role) {
      router.push(`/dashboard/${role}`)
    } else {
      router.push('/dashboard')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password')
      }

      const { data, error } = await signIn(formData.email, formData.password)
      
      if (error) throw error

      if (data?.user) {
        // After login, enforce profile completion before dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, phone, role, special_code')
          .eq('id', data.user.id)
          .single()

        const userType = data.user.user_metadata?.user_type as 'individual' | 'industry' | undefined
        const role = (profile as any)?.role as string | null
        const nameOk = Boolean((profile as any)?.name)
        const phoneOk = Boolean((profile as any)?.phone)
        const specialOk = role === 'admin' || !role ? true : Boolean((profile as any)?.special_code)

        const individualComplete = userType !== 'industry' && nameOk && phoneOk
        const industryComplete = userType === 'industry' && nameOk && phoneOk && Boolean(role) && specialOk
        const isComplete = individualComplete || industryComplete

        if (!isComplete) {
          router.replace('/complete-profile')
          return
        }

        if (userType === 'industry' && role) {
          router.push(`/dashboard/${role}`)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setInfo('')
    try {
      if (!formData.email) {
        throw new Error('Enter your email above to receive a reset link')
      }
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      setInfo('Password reset email sent. Check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
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
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                {info && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 text-sm">{info}</p>
                  </div>
                )}

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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div />
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-black hover:underline font-medium">
                    Sign up
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