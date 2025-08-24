import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthData {
  accessToken?: string
  refreshToken?: string
  type?: string
}

interface UseSessionInitializationProps {
  authData: AuthData
  isAuthLoading: boolean
  hasValidToken: boolean
  hasError: boolean
}

interface UseSessionInitializationReturn {
  sessionInitialized: boolean
  sessionError: string | null
}

export const useSessionInitialization = ({
  authData,
  isAuthLoading,
  hasValidToken,
  hasError
}: UseSessionInitializationProps): UseSessionInitializationReturn => {
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSession = async () => {
      if (authData.accessToken && authData.type === 'recovery' && !hasError) {
        console.log('Initializing Supabase session for password reset')
        
        try {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: authData.accessToken,
            refresh_token: authData.refreshToken || ''
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setSessionError('Invalid or expired reset link')
          } else {
            console.log('Session initialized successfully')
            setSessionInitialized(true)
          }
        } catch (err) {
          console.error('Error initializing session:', err)
          setSessionError('Failed to initialize password reset session')
        }
      }
    }

    if (!isAuthLoading && hasValidToken) {
      initializeSession()
    }
  }, [isAuthLoading, authData, hasValidToken, hasError])

  return {
    sessionInitialized,
    sessionError
  }
}