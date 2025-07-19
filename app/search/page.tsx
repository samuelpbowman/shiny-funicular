'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './search.module.css'

type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

function SearchContent() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  useEffect(() => {
    if (query) {
      searchProfiles(query)
    }
  }, [query])

  const searchProfiles = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/profiles?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (response.ok) {
        setProfiles(data.profiles || [])
      }
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {query ? `Search results for "${query}"` : 'Search Users'}
      </h1>

      {loading ? (
        <div className={styles.loading}>Searching...</div>
      ) : !query ? (
        <div className={styles.empty}>Use the search bar above to find users</div>
      ) : profiles.length === 0 ? (
        <div className={styles.empty}>No users found for &quot;{query}&quot;</div>
      ) : (
        <div className={styles.results}>
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.username}`}
              className={styles.profileCard}
            >
              <div className={styles.avatar}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.profileInfo}>
                <h3 className={styles.displayName}>
                  {profile.display_name || profile.username}
                </h3>
                <p className={styles.username}>@{profile.username}</p>
                {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}