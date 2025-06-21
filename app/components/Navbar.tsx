'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
              href="/chat" 
              className={`${styles.navLink} ${pathname === '/chat' ? styles.active : ''}`}
            >
              Chat
            </Link>
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}