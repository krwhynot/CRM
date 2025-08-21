/**
 * Enhanced error handling utilities for database operations
 * Provides detailed error surfacing for PostgREST and Supabase errors
 */

export interface DatabaseError extends Error {
  code?: string
  details?: string
  hint?: string
  status?: number
}

/**
 * Surface detailed error information from PostgREST/Supabase errors
 */
export function surfaceError(err: any): string {
  // Log the full error structure for debugging
  console.error('DB ERROR DETAILS', {
    code: err?.code,
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
    status: err?.status
  })

  // Return user-friendly error message
  if (err?.code === '23505') {
    // Unique constraint violation
    if (err?.details?.includes('organizations')) {
      return 'An organization with this name and type already exists'
    }
    return 'This record already exists'
  }

  if (err?.code === '23502') {
    // NOT NULL constraint violation
    if (err?.details?.includes('organization_id')) {
      return 'Organization selection is required'
    }
    if (err?.details?.includes('created_by')) {
      return 'Authentication required - please log in again'
    }
    return 'Required field is missing'
  }

  if (err?.code === '42501') {
    // RLS policy violation
    return 'You do not have permission to perform this action'
  }

  // Return the most informative available message
  return err?.details || err?.message || 'An unexpected error occurred'
}

/**
 * Check if user is authenticated and session is valid
 */
export async function validateAuthentication(supabase: any): Promise<{ user: any; error?: string }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return { user: null, error: 'Session validation failed' }
    }
    
    if (!session?.user) {
      return { user: null, error: 'No active session found' }
    }
    
    return { user: session.user }
  } catch (error) {
    return { user: null, error: 'Authentication check failed' }
  }
}

/**
 * Enhanced error wrapper for database mutations
 */
export function wrapDatabaseError<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const friendlyMessage = surfaceError(error)
      throw new Error(friendlyMessage)
    }
  }
}