import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export type Database = {
  public: {
    Tables: {
      contracts: {
        Row: {
          id: string
          title: string
          content: any
          user_id: string
          paid: boolean
          downloaded: boolean
          created_at: string
          updated_at: string
          version_number: number
        }
        Insert: {
          id?: string
          title: string
          content: any
          user_id: string
          paid?: boolean
          downloaded?: boolean
          created_at?: string
          updated_at?: string
          version_number?: number
        }
        Update: {
          id?: string
          title?: string
          content?: any
          user_id?: string
          paid?: boolean
          downloaded?: boolean
          created_at?: string
          updated_at?: string
          version_number?: number
        }
      }
      contract_versions: {
        Row: {
          id: string
          contract_id: string
          content: any
          version_number: number
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          contract_id: string
          content: any
          version_number: number
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          contract_id?: string
          content?: any
          version_number?: number
          created_at?: string
          created_by?: string
        }
      }
      payments: {
        Row: {
          id: string
          contract_id: string
          user_id: string
          amount: number
          status: 'pending' | 'confirmed' | 'failed'
          pix_code: string | null
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          contract_id: string
          user_id: string
          amount: number
          status?: 'pending' | 'confirmed' | 'failed'
          pix_code?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          id?: string
          contract_id?: string
          user_id?: string
          amount?: number
          status?: 'pending' | 'confirmed' | 'failed'
          pix_code?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
      }
      user_presence: {
        Row: {
          id: string
          user_id: string
          contract_id: string
          cursor_position: any
          last_seen: string
          color: string
          name: string
        }
        Insert: {
          id?: string
          user_id: string
          contract_id: string
          cursor_position?: any
          last_seen?: string
          color: string
          name: string
        }
        Update: {
          id?: string
          user_id?: string
          contract_id?: string
          cursor_position?: any
          last_seen?: string
          color?: string
          name?: string
        }
      }
    }
  }
}
