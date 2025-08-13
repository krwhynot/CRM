import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabase } from '@/config/supabase'
import type { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || null)
  const userId = computed(() => user.value?.id || null)

  // Actions
  const clearError = () => {
    error.value = null
  }


  const setSession = (sessionData: Session | null) => {
    session.value = sessionData
    user.value = sessionData?.user || null
  }

  const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      clearError()
      loading.value = true
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        error.value = signInError.message
        throw signInError
      }

      setSession(data.session)
      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      throw authError
    } finally {
      loading.value = false
    }
  }

  const signUpWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      clearError()
      loading.value = true

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        error.value = signUpError.message
        throw signUpError
      }

      // Note: User might need to confirm email before session is available
      if (data.session) {
        setSession(data.session)
      }

      return { data, error: null }
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      throw authError
    } finally {
      loading.value = false
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      clearError()
      loading.value = true

      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        error.value = signOutError.message
        throw signOutError
      }

      setSession(null)
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      throw authError
    } finally {
      loading.value = false
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const { data: { session: currentSession }, error: sessionError } = 
        await supabase.auth.getSession()

      if (sessionError) {
        error.value = sessionError.message
        throw sessionError
      }

      setSession(currentSession)
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      console.error('Error refreshing session:', authError.message)
    }
  }

  const initializeAuth = async (): Promise<void> => {
    try {
      loading.value = true
      
      // Get initial session
      await refreshSession()

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, sessionData) => {
        console.log('Auth state changed:', event)
        
        setSession(sessionData)
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Handle sign out or token refresh
        }
      })
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      console.error('Error initializing auth:', authError.message)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    isAuthenticated,
    userEmail,
    userId,
    
    // Actions
    clearError,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshSession,
    initializeAuth,
  }
})