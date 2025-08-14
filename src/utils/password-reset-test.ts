/**
 * Development utility for testing password reset flow
 * Use this in browser console to simulate Supabase redirect scenarios
 */

import { forceCleanState } from './url-hash-recovery'

// Example usage in browser console:
// testPasswordResetUrl()

export function testPasswordResetUrl() {
  // Simulate a Supabase password reset URL
  const testUrl = `${window.location.origin}/reset-password#access_token=test-token-123&type=recovery&expires_in=3600&refresh_token=test-refresh-123`
  
  console.log('Testing password reset URL:', testUrl)
  window.location.href = testUrl
}

export function testPasswordResetWithError() {
  // Simulate an expired/invalid reset link
  const testUrl = `${window.location.origin}/reset-password#error=access_denied&error_code=otp_expired&error_description=The+reset+link+has+expired`
  
  console.log('Testing password reset URL with error:', testUrl)
  window.location.href = testUrl
}

export function simulateServerRedirectLoss() {
  // Simulate what happens when a server redirect loses the hash
  const hash = window.location.hash
  if (hash) {
    // Store hash in sessionStorage (simulating preservation)
    sessionStorage.setItem('supabase_auth_hash', hash)
    
    // Remove hash from URL (simulating server redirect)
    window.history.replaceState({}, '', window.location.pathname)
    
    console.log('Simulated hash loss - stored in sessionStorage:', hash)
    
    // Reload page to test recovery
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } else {
    console.log('No hash to test with - navigate to a URL with hash fragment first')
  }
}

// Make functions available in development
if (process.env.NODE_ENV === 'development') {
  (window as any).testPasswordResetUrl = testPasswordResetUrl
  ;(window as any).testPasswordResetWithError = testPasswordResetWithError
  ;(window as any).simulateServerRedirectLoss = simulateServerRedirectLoss
  ;(window as any).forceCleanState = forceCleanState
  
  console.log('Password reset testing utilities loaded:')
  console.log('- testPasswordResetUrl()')
  console.log('- testPasswordResetWithError()')  
  console.log('- simulateServerRedirectLoss()')
  console.log('- forceCleanState() - Clear all auth state for fresh testing')
}