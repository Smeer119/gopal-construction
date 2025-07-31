'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import RoleSelector from '@/components/RoleSelector'
import { getCurrentUser, updateUserRole } from '@/lib/auth'
import type { UserRole } from '@/lib/supabase'

export default function SelectRolePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
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

      // If industry user, redirect to their dashboard
      if (currentUser.user_metadata?.user_type === 'industry') {
        const role = currentUser.user_metadata?.role
        if (role) {
          router.push(`/dashboard/${role}`)
          return
        }
      }

      setUser(currentUser)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = async (role: UserRole) => {
    if (!user) return

    setUpdating(true)
    
    try {
      const { error } = await updateUserRole(user.id, role)
      
      if (error) throw error

      router.push(`/dashboard/${role}`)
    } catch (error) {
      console.error('Failed to update role:', error)
      // Handle error - maybe show a toast
    } finally {
      setUpdating(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Welcome, {userName}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access your personalized dashboard and tools
          </p>
        </div>

        <RoleSelector onRoleSelect={handleRoleSelect} loading={updating} />

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            You can switch between roles anytime from your dashboard
          </p>
        </div>
      </div>
    </div>
  )
}