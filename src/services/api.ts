// API service layer for centralized HTTP requests and error handling
import { supabase } from '@/config/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: PostgrestError
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic API response handler
export const handleSupabaseResponse = <T>(
  data: T | null,
  error: PostgrestError | null
): T => {
  if (error) {
    console.error('Supabase error:', error)
    throw new ApiError(
      error.message || 'An error occurred',
      parseInt(error.code) || 500,
      error
    )
  }
  
  if (data === null) {
    throw new ApiError('No data returned', 404)
  }
  
  return data
}

// Authentication utilities
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const signOut = () => {
  return supabase.auth.signOut()
}

// Export supabase client for direct use in specific services
export { supabase }