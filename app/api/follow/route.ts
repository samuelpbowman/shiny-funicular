import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { followUser, unfollowUser, isFollowing } from '@/lib/profileStore'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action } = await request.json()
    
    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 })
    }

    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    let result
    if (action === 'follow') {
      // Check if already following
      const alreadyFollowing = await isFollowing(user.id, userId)
      if (alreadyFollowing) {
        return NextResponse.json({ error: 'Already following this user' }, { status: 400 })
      }
      result = await followUser(user.id, userId)
    } else if (action === 'unfollow') {
      result = await unfollowUser(user.id, userId)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Follow action error:', error)
    return NextResponse.json({ error: 'Failed to perform follow action' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const following = await isFollowing(user.id, userId)
    return NextResponse.json({ following })
  } catch (error) {
    console.error('Follow check error:', error)
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 })
  }
}