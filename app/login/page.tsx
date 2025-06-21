'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>📝</div>
            <span className={styles.logoText}>TODO</span>
          </div>
          <h1 className={styles.title}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className={styles.subtitle}>
            {isSignUp 
              ? 'Start organizing your tasks today' 
              : 'Sign in to access your todos'
            }
          </p>
        </div>

        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              <div className={styles.spinner}></div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {message && (
          <div className={styles.message}>
            <div className={styles.messageIcon}>
              {message.includes('error') || message.includes('Error') ? '⚠️' : 'ℹ️'}
            </div>
            <p>{message}</p>
          </div>
        )}

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className={styles.toggleButton}
        >
          {isSignUp 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>
    </div>
  )
}