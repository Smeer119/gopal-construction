'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, Wrench, HardHat } from 'lucide-react'
import type { UserRole } from '@/lib/supabase'

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void
  loading?: boolean
}

const roleConfig = {
  admin: {
    icon: Settings,
    title: 'Administrator',
    description: 'Manage platform settings, users, and system configurations',
    color: 'border-red-200 hover:border-red-300'
  },
  engineer: {
    icon: Wrench,
    title: 'Engineer',
    description: 'Review site logs, manage technical tasks, and system maintenance',
    color: 'border-blue-200 hover:border-blue-300'
  },
  contractor: {
    icon: User,
    title: 'Contractor',
    description: 'View project timelines, manage tasks, and coordinate teams',
    color: 'border-green-200 hover:border-green-300'
  },
  worker: {
    icon: HardHat,
    title: 'Worker',
    description: 'Mark attendance, check schedules, and view daily tasks',
    color: 'border-yellow-200 hover:border-yellow-300'
  }
}

export default function RoleSelector({ onRoleSelect, loading }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(roleConfig).map(([role, config]) => {
        const Icon = config.icon
        return (
          <Card
            key={role}
            className={`cursor-pointer transition-all duration-200 ${config.color} hover:shadow-md`}
            onClick={() => onRoleSelect(role as UserRole)}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon className="w-8 h-8 text-gray-700" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold">{config.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                {config.description}
              </CardDescription>
              <Button
                className="w-full"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation()
                  onRoleSelect(role as UserRole)
                }}
              >
                {loading ? 'Selecting...' : 'Select Role'}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}