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
import { Textarea } from '@/components/ui/textarea'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [industryMode, setIndustryMode] = useState<boolean>(false)
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [industryData, setIndustryData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const router = useRouter()
  // no searchParams hook to avoid Suspense requirement in Next 15

  useEffect(() => {
    checkExistingAuth()
  }, [])

  // Auto-enable industry mode if URL has ?mode=industry (read from window)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const mode = params.get('mode')
      if (mode === 'industry') setIndustryMode(true)
    } catch {}
  }, [])

  const checkExistingAuth = async () => {
    const user = await getCurrentUser()
    if (!user) return

    // Instead of redirecting, show an info message and allow user to navigate or logout
    setAlreadyLoggedIn(true)
    setInfo(`User found: ${user.email || 'current session active'}. You can continue to your dashboard or log out to switch accounts.`)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleIndustryChange = (field: keyof typeof industryData, value: string) => {
    setIndustryData(prev => ({ ...prev, [field]: value }))
    setError('')
    setInfo('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (industryMode) {
        // Submit industry interest form
        if (!industryData.name || !industryData.email || !industryData.phone || !industryData.description) {
          throw new Error('Please fill all fields: name, email, phone, description')
        }

        const res = await fetch('/api/industry-interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(industryData)
        })

        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || 'Failed to send your request')
        }

        setInfo('Thanks! We received your request. For now, please sign up or log in as an Individual. We will reach out to you shortly.')
        setIndustryData({ name: '', email: '', phone: '', description: '' })
        return
      }

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
          router.push('/')
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
                {industryMode ? 'Industry access is coming soon. Tell us about your needs.' : 'Sign in to your account to continue'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alreadyLoggedIn && (
                <div className="p-3 mb-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                  {info || 'You are already logged in. You can go to your dashboard or log out to switch accounts.'}
                  <div className="flex gap-2 mt-3">
                    <Button type="button" onClick={() => router.push('/')}>Go to Home</Button>
                    <Button type="button" variant="outline" onClick={async () => { await supabase.auth.signOut(); setAlreadyLoggedIn(false); setInfo('Logged out. You can sign in now.'); }}>Logout</Button>
                  </div>
                </div>
              )}
              {/* Mode Toggle */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button type="button" variant={industryMode ? 'outline' : 'default'} onClick={() => setIndustryMode(false)}>
                  Individual
                </Button>
                <Button type="button" variant={industryMode ? 'default' : 'outline'} onClick={() => setIndustryMode(true)}>
                  Industry
                </Button>
              </div>

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

                {industryMode ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="iname">Name</Label>
                      <Input
                        id="iname"
                        placeholder="Your full name"
                        value={industryData.name}
                        onChange={(e) => handleIndustryChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iemail">Email</Label>
                      <Input
                        id="iemail"
                        type="email"
                        placeholder="your@email.com"
                        value={industryData.email}
                        onChange={(e) => handleIndustryChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iphone">Phone</Label>
                      <Input
                        id="iphone"
                        type="tel"
                        placeholder="Your phone number"
                        value={industryData.phone}
                        onChange={(e) => handleIndustryChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idesc">Tell us what you need</Label>
                      <Textarea
                        id="idesc"
                        placeholder="Describe the features you need or the problems you're solving"
                        value={industryData.description}
                        onChange={(e) => handleIndustryChange('description', e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending…' : 'Send Request'}
                    </Button>
                    <p className="text-xs text-gray-600 text-center">
                      Industry access is an upcoming feature. After sending, please use the Individual option for now.
                    </p>
                  </>
                ) : (
                  <>
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
                  </>
                )}

              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {industryMode ? (
                    <>
                      For now, please{' '}
                      <Link href="/signup" className="text-black hover:underline font-medium">sign up</Link>
                      {' '}or{' '}
                      <Link href="/login" className="text-black hover:underline font-medium">log in</Link>
                      {' '}as <span className="font-medium">Individual</span>.
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <Link href="/signup" className="text-black hover:underline font-medium">
                        Sign up
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}