import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          text: string
          task: string | null
          completed: boolean
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          text: string
          task?: string | null
          completed?: boolean
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          text?: string
          task?: string | null
          completed?: boolean
          created_at?: string
          user_id?: string
        }
      }
    }
  }
}