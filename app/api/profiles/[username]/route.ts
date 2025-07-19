import { NextRequest, NextResponse } from 'next/server'
import { getProfileByUsername, getFollowCounts } from '@/lib/profileStore'
import { getUserPublicTodos } from '@/lib/todoStore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    const profile = await getProfileByUsername(username)
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const [todos, followCounts] = await Promise.all([
      getUserPublicTodos(profile.id),
      getFollowCounts(profile.id)
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