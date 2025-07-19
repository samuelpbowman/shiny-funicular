'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import styles from './Navbar.module.css'

type Profile = {
  username: string
  display_name: string | null
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Fetch user profile
        try {
          const response = await fetch('/api/profiles')
          const data = await response.json()
          if (response.ok && data.profile) {
            setProfile(data.profile)
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      }
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (!session?.user) {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null
  }

  // Don't show navbar if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logo}>
            TODO App
          </Link>
          <div className={styles.navLinks}>
            <Link 
              href="/dashboard" 
              className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/feed" 
              className={`${styles.navLink} ${pathname === '/feed' ? styles.active : ''}`}
            >
              Feed
            </Link>
            <Link 
              href="/chat" 
              className={`${styles.navLink} ${pathname === '/chat' ? styles.active : ''}`}
            >
              Chat
            </Link>
          </div>
        </div>
        <div className={styles.navRight}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>
          <div className={styles.userInfo}>
            {profile && (
              <Link href={`/profile/${profile.username}`} className={styles.profileLink}>
                {profile.display_name || profile.username}
              </Link>
            )}
            <button onClick={handleLogout} className={styles.logoutButton}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}