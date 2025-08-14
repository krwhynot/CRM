/**
 * Utility functions for handling URL hash recovery in cases where
 * server redirects might cause loss of hash fragments
 */

const HASH_STORAGE_KEY = 'supabase_auth_hash'

/**
 * Store hash fragment in sessionStorage before potential redirects
 */
export function preserveUrlHash() {
  if (typeof window !== 'undefined' && window.location.hash) {
    try {
      sessionStorage.setItem(HASH_STORAGE_KEY, window.location.hash)
      console.log('URL hash preserved:', window.location.hash)
    } catch (error) {
      console.warn('Failed to preserve URL hash:', error)
    }
  }
}

/**
 * Restore hash fragment from sessionStorage after redirect
 * Returns true if hash was restored, false otherwise
 */
export function restoreUrlHash(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const preservedHash = sessionStorage.getItem(HASH_STORAGE_KEY)
      if (preservedHash && !window.location.hash) {
        // Check if we're on a page that should handle auth callbacks
        const currentPath = window.location.pathname
        const validAuthPaths = ['/reset-password', '/login', '/forgot-password', '/']
        
        if (validAuthPaths.includes(currentPath)) {
          // Only restore if current URL doesn't have a hash and we're on a valid auth page
          window.location.hash = preservedHash
          sessionStorage.removeItem(HASH_STORAGE_KEY)
          console.log('URL hash restored:', preservedHash)
          return true
        } else {
          // Clear hash if we're on a non-auth page
          sessionStorage.removeItem(HASH_STORAGE_KEY)
          console.log('Cleared preserved hash for non-auth page:', currentPath)
        }
      }
    } catch (error) {
      console.warn('Failed to restore URL hash:', error)
    }
  }
  return false
}

/**
 * Clear preserved hash (call after successful processing)
 */
export function clearPreservedHash() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(HASH_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear preserved hash:', error)
    }
  }
}

/**
 * Check if there's a preserved hash that needs to be processed
 */
export function hasPreservedHash(): boolean {
  if (typeof window !== 'undefined') {
    try {
      return !!sessionStorage.getItem(HASH_STORAGE_KEY)
    } catch (error) {
      return false
    }
  }
  return false
}

/**
 * Force clear all preserved hashes and current URL hash - useful for testing
 */
export function forceCleanState() {
  if (typeof window !== 'undefined') {
    try {
      // Clear stored hash
      sessionStorage.removeItem(HASH_STORAGE_KEY)
      
      // Clear current URL hash if it exists
      if (window.location.hash) {
        window.history.replaceState({}, '', window.location.pathname + window.location.search)
      }
      
      console.log('Forced clean state - all hashes cleared')
    } catch (error) {
      console.warn('Failed to force clean state:', error)
    }
  }
}