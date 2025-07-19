import { createClient } from './supabase/server'
import { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error) throw error
  return data
}

export async function createProfile(userId: string, username: string, displayName?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .insert({ 
      id: userId, 
      username, 
      display_name: displayName,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string, 
  updates: Partial<Pick<Profile, 'username' | 'display_name' | 'bio' | 'avatar_url'>>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function followUser(followerId: string, followingId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function unfollowUser(followerId: string, followingId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getFollowers(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .select(`
      *,
      follower:profiles!follows_follower_id_fkey(*)
    `)
    .eq('following_id', userId)
  
  if (error) throw error
  return data || []
}

export async function getFollowing(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .select(`
      *,
      following:profiles!follows_following_id_fkey(*)
    `)
    .eq('follower_id', userId)
  
  if (error) throw error
  return data || []
}

export async function isFollowing(followerId: string, followingId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()
  
  return !!data && !error
}

export async function searchProfiles(query: string, limit = 10) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getFollowCounts(userId: string) {
  const supabase = await createClient()
  
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .eq('follower_id', userId)
  ])
  
  return {
    followers: followersResult.count || 0,
    following: followingResult.count || 0
  }
}