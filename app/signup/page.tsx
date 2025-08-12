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
import { Textarea } from '@/components/ui/textarea'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [showEmailSent, setShowEmailSent] = useState(false)
  const [userType, setUserType] = useState<'individual' | 'industry'>('individual')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
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
    setInfo('')

    try {
      if (userType === 'industry') {
        // Industry upcoming: collect interest instead of creating account
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
                {info && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 text-sm">{info}</p>
                  </div>
                )}

                <div className="mb-2">
                  <div className="grid w-full grid-cols-2 bg-muted rounded-md p-1">
                    <button type="button" onClick={() => setUserType('individual')} className={`py-2 rounded ${userType==='individual' ? 'bg-background shadow' : ''}`}>Individual</button>
                    <button type="button" onClick={() => setUserType('industry')} className={`py-2 rounded ${userType==='industry' ? 'bg-background shadow' : ''}`}>Industry</button>
                  </div>
                </div>

                {userType === 'industry' ? (
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
                  </>
                )}
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