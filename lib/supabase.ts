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
          is_public: boolean
        }
        Insert: {
          id?: string
          text: string
          task?: string | null
          completed?: boolean
          created_at?: string
          user_id: string
          is_public?: boolean
        }
        Update: {
          id?: string
          text?: string
          task?: string | null
          completed?: boolean
          created_at?: string
          user_id?: string
          is_public?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
        }
      }
    }
  }
}