'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './profile.module.css'

type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

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

type FollowCounts = {
  followers: number
  following: number
}

export default function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 })
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
    getCurrentUser()
  }, [username])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${username}`)
      const data = await response.json()
      
      if (response.ok) {
        setProfile(data.profile)
        setTodos(data.todos || [])
        setFollowCounts(data.followCounts || { followers: 0, following: 0 })
        
        // Check if current user is following this profile
        if (data.profile) {
          checkFollowStatus(data.profile.id)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkFollowStatus = async (profileId: string) => {
    try {
      const response = await fetch(`/api/follow?userId=${profileId}`)
      const data = await response.json()
      if (response.ok) {
        setIsFollowing(data.following)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    if (!profile || !currentUserId) return
    
    setFollowLoading(true)
    try {
      const action = isFollowing ? 'unfollow' : 'follow'
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          action
        })
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setFollowCounts(prev => ({
          ...prev,
          followers: prev.followers + (isFollowing ? -1 : 1)
        }))
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>
  }

  if (!profile) {
    return <div className={styles.error}>Profile not found</div>
  }

  const isOwnProfile = currentUserId === profile.id

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.details}>
            <h1 className={styles.displayName}>
              {profile.display_name || profile.username}
            </h1>
            <p className={styles.username}>@{profile.username}</p>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            <div className={styles.stats}>
              <span className={styles.stat}>
                <strong>{followCounts.followers}</strong> followers
              </span>
              <span className={styles.stat}>
                <strong>{followCounts.following}</strong> following
              </span>
              <span className={styles.stat}>
                <strong>{todos.length}</strong> public todos
              </span>
            </div>
          </div>
        </div>
        {!isOwnProfile && currentUserId && (
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
          >
            {followLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <div className={styles.todosSection}>
        <h2 className={styles.sectionTitle}>Public Todos</h2>
        {todos.length === 0 ? (
          <p className={styles.noTodos}>No public todos yet</p>
        ) : (
          <div className={styles.todosList}>
            {todos.map((todo) => (
              <div key={todo.id} className={styles.todoItem}>
                <div className={styles.todoContent}>
                  <span className={`${styles.todoText} ${todo.completed ? styles.completed : ''}`}>
                    {todo.text}
                  </span>
                  <span className={styles.todoDate}>
                    {new Date(todo.created_at).toLocaleDateString()}
                  </span>
                </div>
                {todo.completed && (
                  <span className={styles.completedBadge}>✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}