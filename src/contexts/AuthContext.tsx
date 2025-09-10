import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { appConfig, isDevelopment } from '@/config/environment'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* eslint-disable react-refresh/only-export-components */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Development auth bypass for localhost
    // ⚠️  WARNING: This bypass should only be used for development testing
    // ⚠️  Set VITE_DEV_BYPASS_AUTH=false in .env.development to disable
    // ⚠️  This bypass is automatically disabled in production builds
    const bypassAuth = appConfig.devBypassAuth
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    if (isDevelopment && bypassAuth && isLocalhost) {
      console.warn('🚨 AUTH BYPASS ACTIVE: Development mode with bypassed authentication')
      console.warn('🔓 This should NEVER be enabled in production!')
      console.warn('🔧 To disable: Set VITE_DEV_BYPASS_AUTH=false in .env.development')
      
      // Create a mock user for development
      const mockUser: User = {
        id: 'dev-user-mock-id',
        email: 'dev@localhost.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }
      
      // Create a mock session
      const mockSession: Session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: mockUser,
      }
      
      setUser(mockUser)
      setSession(mockSession)
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        // Auth errors handled by UI error boundaries
        // Initial session error handling
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    // Use Supabase-configured Site URL for security (no client-side redirect URL construction)
    // This prevents open redirect vulnerabilities by relying on server-side configuration
    // Optional: Allow environment variable override for explicit control
    const redirectUrl = appConfig.passwordResetUrl
    const { error } =
      redirectUrl && redirectUrl !== 'undefined'
        ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl })
        : await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
