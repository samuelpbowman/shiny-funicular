import { NextRequest, NextResponse } from 'next/server'
import { getProfileByUsername, getFollowCounts } from '@/lib/profileStore'
import { getUserPublicTodos } from '@/lib/todoStore'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params
    
    const [profile, todos, followCounts] = await Promise.all([
      getProfileByUsername(username),
      getUserPublicTodos(profile?.id || ''),
      getFollowCounts(profile?.id || '')
    ])

    return NextResponse.json({ 
      profile, 
      todos,
      followCounts 
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
}