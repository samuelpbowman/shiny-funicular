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

export async function createTodo(text: string, userId: string, task?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .insert({ text, task, user_id: userId })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createManyTodos(texts: string[], userId: string, task?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('todos')
    .insert(texts.map(text => ({ text, task, user_id: userId })))
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