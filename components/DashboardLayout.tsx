'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './Navbar'
import DashboardSwitcher from './DashboardSwitcher'
import { getCurrentUser } from '@/lib/auth'
import type { UserRole } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userType = user.user_metadata?.user_type || 'individual'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {userName}
              </h1>
              <p className="text-gray-600 capitalize">
                {role} Dashboard
              </p>
            </div>
            <DashboardSwitcher currentRole={role} userType={userType} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  )
}