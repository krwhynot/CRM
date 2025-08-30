import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { restoreUrlHash, clearPreservedHash, hasPreservedHash } from '@/utils/url-hash-recovery'

interface AuthCallbackHandlerProps {
  children?: React.ReactNode
}

/**
 * Component that handles various Supabase auth callbacks
 * Automatically processes URL fragments and redirects appropriately
 */
export function AuthCallbackHandler({ children }: AuthCallbackHandlerProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const processAuthCallback = async () => {
      // Try to restore hash if it was preserved during redirects
      restoreUrlHash()
      // Hash restoration attempted
      
      const hash = window.location.hash
      const search = window.location.search
      
      // Skip processing if no auth parameters are present and none were restored
      if (!hash && !search && !hasPreservedHash()) {
        return
      }

      // Skip if we're already processing
      if (isProcessing) {
        return
      }

      // Development debugging removed for production build optimization

      setIsProcessing(true)

      try {
        let authParams = new URLSearchParams()
        
        // Check hash first (most common for Supabase)
        if (hash) {
          authParams = new URLSearchParams(hash.substring(1))
        }
        
        // Fallback to search params
        if (!authParams.toString() && search) {
          authParams = new URLSearchParams(search)
        }

        const type = authParams.get('type')
        const accessToken = authParams.get('access_token')
        const refreshToken = authParams.get('refresh_token')
        const error = authParams.get('error')
        
        // Auth params logged in development builds

        if (error) {
          // Auth error handling
          // Clear any preserved hash to prevent infinite loops with test data
          clearPreservedHash()
          // Let the specific page handle the error
          return
        }

        // Handle different types of auth callbacks
        switch (type) {
          case 'recovery':
            // Password recovery handling
            // The ResetPasswordPage will handle this
            break
            
          case 'signup':
            // Email confirmation handling
            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              
              if (!sessionError) {
                // Clean URL and redirect to dashboard
                window.history.replaceState({}, '', window.location.pathname)
                navigate('/dashboard')
              }
            }
            break
            
          case 'invite':
            // Team invite handling
            // Handle team invites if applicable
            break
            
          default:
            if (accessToken && refreshToken) {
              // Generic auth token handling
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              
              if (!sessionError) {
                // Clean URL and redirect to dashboard
                window.history.replaceState({}, '', window.location.pathname)
                navigate('/dashboard')
              }
            }
            break
        }
      } catch (err) {
        // Error handling for auth callback processing
      } finally {
        // Clear any preserved hash after processing
        clearPreservedHash()
        setIsProcessing(false)
      }
    }

    processAuthCallback()
  }, [location, navigate, isProcessing])

  return <>{children}</>
}