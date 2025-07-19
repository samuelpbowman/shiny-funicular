import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFeedTodos, getPublicTodos } from '@/lib/todoStore'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'feed'
    const limit = parseInt(searchParams.get('limit') || '50')

    let todos
    if (type === 'public') {
      todos = await getPublicTodos(limit)
    } else {
      todos = await getFeedTodos(user.id, limit)
    }

    return NextResponse.json({ todos })
  } catch (error) {
    console.error('Feed fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
  }
}