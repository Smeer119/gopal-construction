import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'engineer' | 'contractor' | 'worker'
export type UserType = 'individual' | 'industry'

export interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  user_type: UserType
  role?: UserRole
  special_key?: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectKey {
  id: string
  key_value: string
  project_id: string
  project_name: string
  default_role?: UserRole
  created_by: string
  is_active: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface UserProject {
  id: string
  user_id: string
  project_id: string
  role: UserRole
  joined_at: string
  project?: Project
}