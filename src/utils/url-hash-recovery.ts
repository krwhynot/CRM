/**
 * Utility functions for handling URL hash recovery in cases where
 * server redirects might cause loss of hash fragments
 */

import { safeGetString, safeSetString, safeRemoveItem } from '@/lib/secure-storage'

const HASH_STORAGE_KEY = 'supabase_auth_hash'

/**
 * Store hash fragment in sessionStorage before potential redirects
 */
export function preserveUrlHash() {
  if (typeof window !== 'undefined' && window.location.hash) {
    const success = safeSetString(HASH_STORAGE_KEY, window.location.hash, 'sessionStorage')
    if (!success) {
      console.warn('Failed to preserve URL hash - sessionStorage not available')
    }
  }
}

/**
 * Restore hash fragment from sessionStorage after redirect
 * Returns true if hash was restored, false otherwise
 */
export function restoreUrlHash(): boolean {
  if (typeof window !== 'undefined') {
    const preservedHash = safeGetString(HASH_STORAGE_KEY, '', 'sessionStorage')
    if (preservedHash && !window.location.hash) {
      // Check if we're on a page that should handle auth callbacks
      const currentPath = window.location.pathname
      const validAuthPaths = ['/reset-password', '/login', '/forgot-password', '/']

      if (validAuthPaths.includes(currentPath)) {
        // Only restore if current URL doesn't have a hash and we're on a valid auth page
        window.location.hash = preservedHash
        safeRemoveItem(HASH_STORAGE_KEY, 'sessionStorage')
        return true
      } else {
        // Clear hash if we're on a non-auth page
        safeRemoveItem(HASH_STORAGE_KEY, 'sessionStorage')
      }
    }
  }
  return false
}

/**
 * Clear preserved hash (call after successful processing)
 */
export function clearPreservedHash() {
  if (typeof window !== 'undefined') {
    safeRemoveItem(HASH_STORAGE_KEY, 'sessionStorage')
  }
}

/**
 * Check if there's a preserved hash that needs to be processed
 */
export function hasPreservedHash(): boolean {
  if (typeof window !== 'undefined') {
    return !!safeGetString(HASH_STORAGE_KEY, '', 'sessionStorage')
  }
  return false
}

/**
 * Force clear all preserved hashes and current URL hash - useful for testing
 */
export function forceCleanState() {
  if (typeof window !== 'undefined') {
    // Clear stored hash
    safeRemoveItem(HASH_STORAGE_KEY, 'sessionStorage')

    // Clear current URL hash if it exists
    if (window.location.hash) {
      try {
        window.history.replaceState({}, '', window.location.pathname + window.location.search)
      } catch (error) {
        console.warn('Failed to clear URL hash:', error)
      }
    }
    // Hash not found in storage - nothing to clear
  }
}
