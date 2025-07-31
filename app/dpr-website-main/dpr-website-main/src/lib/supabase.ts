export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          created_at: string
          site_name: string
          date: string
          weather: string
          temperature: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          site_name: string
          date: string
          weather: string
          temperature: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          site_name?: string
          date?: string
          weather?: string
          temperature?: string
          user_id?: string
        }
      }
      contractors: {
        Row: {
          id: string
          report_id: string
          name: string
          role: string
          manpower: number
          working_description: string
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          name: string
          role: string
          manpower: number
          working_description: string
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          name?: string
          role?: string
          manpower?: number
          working_description?: string
          created_at?: string
        }
      }
      department_labours: {
        Row: {
          id: string
          report_id: string
          role: string
          skilled_workers: string[]
          manpower: number
          working_description: string
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          role: string
          skilled_workers: string[]
          manpower: number
          working_description: string
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          role?: string
          skilled_workers?: string[]
          manpower?: number
          working_description?: string
          created_at?: string
        }
      }
      equipment_machinery: {
        Row: {
          id: string
          report_id: string
          machine_type: string
          from_time: string
          to_time: string
          working_description: string
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          machine_type: string
          from_time: string
          to_time: string
          working_description: string
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          machine_type?: string
          from_time?: string
          to_time?: string
          working_description?: string
          created_at?: string
        }
      }
      visitors: {
        Row: {
          id: string
          report_id: string
          visitor_types: string[]
          visit_description: string
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          visitor_types: string[]
          visit_description: string
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          visitor_types?: string[]
          visit_description?: string
          created_at?: string
        }
      }
      critical_issues: {
        Row: {
          id: string
          report_id: string
          description: string
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          description: string
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          description?: string
          photo_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Note: Remember to set up Supabase connection by clicking "Connect to Supabase" button
export const supabase = null; // Will be configured when Supabase is connected