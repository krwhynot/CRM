import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export interface AuthCallbackData {
  accessToken?: string
  refreshToken?: string
  type?: string
  error?: string
  errorCode?: string
  errorDescription?: string
}

/**
 * Hook to handle Supabase auth callbacks from URL fragments
 * Used for password reset, email confirmation, etc.
 */
export function useAuthCallback() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<AuthCallbackData>({})
  const location = useLocation()

  useEffect(() => {
    const parseAuthCallback = () => {
      try {
        // Check both hash and search params for auth data
        let authParams = new URLSearchParams()

        // First, check URL hash (most common for Supabase)
        if (window.location.hash) {
          const hash = window.location.hash.substring(1)
          authParams = new URLSearchParams(hash)
        }

        // Also check search params as fallback
        if (!authParams.toString() && window.location.search) {
          authParams = new URLSearchParams(window.location.search)
        }

        const authData: AuthCallbackData = {
          accessToken: authParams.get('access_token') || undefined,
          refreshToken: authParams.get('refresh_token') || undefined,
          type: authParams.get('type') || undefined,
          error: authParams.get('error') || undefined,
          errorCode: authParams.get('error_code') || undefined,
          errorDescription: authParams.get('error_description') || undefined,
        }

        // Auth callback data parsed successfully
        setData(authData)

        // Clear the URL hash/params after parsing to clean up the URL
        if (window.location.hash || window.location.search) {
          const cleanUrl = `${window.location.origin}${window.location.pathname}`
          window.history.replaceState({}, '', cleanUrl)
        }
      } catch (error) {
        // Error parsing auth callback handled
        setData({ error: 'parsing_error' })
      } finally {
        setIsLoading(false)
      }
    }

    parseAuthCallback()
  }, [location])

  return {
    isLoading,
    data,
    hasValidToken: !!(data.accessToken && data.type && !data.error),
    hasError: !!(data.error || data.errorCode),
  }
}
