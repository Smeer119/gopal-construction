'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserRole } from '@/lib/supabase'

interface DashboardSwitcherProps {
  currentRole: UserRole
  userType: 'individual' | 'industry'
}

const roleLabels = {
  admin: 'Administrator',
  engineer: 'Engineer', 
  contractor: 'Contractor',
  worker: 'Worker'
}

export default function DashboardSwitcher({ currentRole, userType }: DashboardSwitcherProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = async (role: UserRole) => {
    setIsLoading(true)
    router.push(`/dashboard/${role}`)
    setIsLoading(false)
  }

  // Industry users can't switch roles
  if (userType === 'industry') {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Role:</span>
        <span className="font-medium capitalize">{roleLabels[currentRole]}</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2" disabled={isLoading}>
          <span>{roleLabels[currentRole]}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(roleLabels).map(([role, label]) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleChange(role as UserRole)}
            className={currentRole === role ? 'bg-gray-100' : ''}
          >
            {label}
            {currentRole === role && <span className="ml-auto text-xs text-gray-500">Current</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}