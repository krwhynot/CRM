/**
 * Security test for AuthContext password reset vulnerability fix
 * Tests that the resetPassword function no longer uses client-side URL construction
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { supabase } from '@/lib/supabase'
import { AuthProvider, useAuth } from '../AuthContext'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

// Mock environment variables
const originalEnv = import.meta.env

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext - Security Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock getSession to return null
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })
    // Reset environment to clean state
    import.meta.env.VITE_PASSWORD_RESET_URL = undefined
  })

  afterEach(() => {
    // Restore original environment
    Object.assign(import.meta.env, originalEnv)
  })

  it('should not use window.location in resetPassword function', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    // Mock resetPasswordForEmail to return success
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    })

    await act(async () => {
      await result.current.resetPassword('test@example.com')
    })

    // Verify that resetPasswordForEmail was called with only email parameter
    // (since no environment variable is set)
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('window.location'),
      })
    )
  })

  it('should use environment variable when VITE_PASSWORD_RESET_URL is set', async () => {
    // Set environment variable for this test
    import.meta.env.VITE_PASSWORD_RESET_URL = 'https://example.com/reset-password'

    const { result } = renderHook(() => useAuth(), { wrapper })

    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    })

    await act(async () => {
      await result.current.resetPassword('test@example.com')
    })

    // Verify that resetPasswordForEmail was called with the environment variable
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo: 'https://example.com/reset-password',
    })
  })

  it('should handle resetPasswordForEmail errors correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    const mockError = { message: 'Invalid email', name: 'AuthError', status: 400 }
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: mockError,
    })

    let response: { success: boolean; error?: Error }
    await act(async () => {
      response = await result.current.resetPassword('invalid@example.com')
    })

    expect(response.error).toEqual(mockError)
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('invalid@example.com')
  })
})
