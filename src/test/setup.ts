import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Extend Vitest's expect with React Testing Library matchers
expect.extend(matchers)

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Global test configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'test-key'

// Test database client
export const testSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Test user credentials for authentication tests
export const testCredentials = {
  email: 'test@example.com',
  password: 'TestPassword123!',
}

// Global test setup
beforeAll(async () => {
  // Set up test environment
  console.log('Setting up test environment...')
  
  // Verify database connection
  const { data, error } = await testSupabase.from('organizations').select('count').limit(1).single()
  if (error && error.code !== 'PGRST116') {
    console.warn('Database connection test failed:', error.message)
  }
})

// Global test cleanup
afterAll(async () => {
  console.log('Cleaning up test environment...')
})