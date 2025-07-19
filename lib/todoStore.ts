import { createClient } from './supabase/server'
import { Database } from './supabase'

export type Todo = Database['public']['Tables']['todos']['Row']

export async function listTodos(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getTodo(id: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function createTodo(text: string, userId: string, task?: string, isPublic = false) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .insert({ text, task, user_id: userId, is_public: isPublic })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createManyTodos(texts: string[], userId: string, task?: string, isPublic = false) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .insert(texts.map(text => ({ text, task, user_id: userId, is_public: isPublic })))
    .select()
  
  if (error) throw error
  return data || []
}

export async function updateTodo(
  id: string,
  userId: string,
  updates: Partial<Pick<Todo, 'text' | 'task' | 'completed'>>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTodo(id: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getFeedTodos(userId: string, limit = 50) {
  const supabase = await createClient()
  
  // First get the user IDs that the current user follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
  
  const followingIds = follows?.map(f => f.following_id) || []
  const userIds = [...followingIds, userId] // Include user's own todos
  
  // Get todos from followed users plus their own public todos
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      profiles!todos_user_id_fkey(username, display_name, avatar_url)
    `)
    .eq('is_public', true)
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getPublicTodos(limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      profiles!todos_user_id_fkey(username, display_name, avatar_url)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getUserPublicTodos(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      profiles!todos_user_id_fkey(username, display_name, avatar_url)
    `)
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}