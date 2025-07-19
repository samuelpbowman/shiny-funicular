'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import styles from './feed.module.css'

type Todo = {
  id: string
  text: string
  completed: boolean
  created_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export default function FeedPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [feedType, setFeedType] = useState<'feed' | 'public'>('feed')
  const supabase = createClient()

  useEffect(() => {
    fetchTodos()
  }, [feedType])

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/feed?type=${feedType}`)
      const data = await response.json()
      
      if (response.ok) {
        setTodos(data.todos || [])
      }
    } catch (error) {
      console.error('Error fetching feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Social Todo Feed</h1>
        <div className={styles.feedToggle}>
          <button
            className={`${styles.toggleButton} ${feedType === 'feed' ? styles.active : ''}`}
            onClick={() => setFeedType('feed')}
          >
            Following
          </button>
          <button
            className={`${styles.toggleButton} ${feedType === 'public' ? styles.active : ''}`}
            onClick={() => setFeedType('public')}
          >
            Discover
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading feed...</div>
      ) : todos.length === 0 ? (
        <div className={styles.empty}>
          {feedType === 'feed' ? (
            <div>
              <p>No todos from people you follow yet.</p>
              <p>Try following some users or switch to the Discover tab!</p>
            </div>
          ) : (
            <p>No public todos available.</p>
          )}
        </div>
      ) : (
        <div className={styles.feed}>
          {todos.map((todo) => (
            <div key={todo.id} className={styles.todoCard}>
              <div className={styles.todoHeader}>
                <Link href={`/profile/${todo.profiles.username}`} className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {todo.profiles.avatar_url ? (
                      <img src={todo.profiles.avatar_url} alt={todo.profiles.username} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {(todo.profiles.display_name || todo.profiles.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.userDetails}>
                    <span className={styles.displayName}>
                      {todo.profiles.display_name || todo.profiles.username}
                    </span>
                    <span className={styles.username}>@{todo.profiles.username}</span>
                  </div>
                </Link>
                <span className={styles.timestamp}>{formatDate(todo.created_at)}</span>
              </div>
              
              <div className={styles.todoContent}>
                <span className={`${styles.todoText} ${todo.completed ? styles.completed : ''}`}>
                  {todo.text}
                </span>
                {todo.completed && (
                  <span className={styles.completedBadge}>Completed ✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}