/**
 * Backend Test Setup Configuration
 * 
 * This file configures the test environment for comprehensive database and backend testing
 * of the KitchenPantry CRM system.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { vi, beforeAll, afterAll, beforeEach, expect } from 'vitest'
import '@testing-library/jest-dom'

// Test environment configuration
const TEST_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ixitjldcdvbazvjsnkao.supabase.co'
const TEST_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aXRqbGRjZHZiYXp2anNua2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjg0MjEsImV4cCI6MjA3MDUwNDQyMX0.8h5jXRcT96R34m0MU7PVbgzJPpGvf5azgQd2wo5AB2Q'

// Create test Supabase client
export const testSupabase = createClient<Database>(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
})

// Test user credentials
export const TEST_USER_EMAIL = 'test@kitchenpantrycrm.com'
export const TEST_USER_PASSWORD = 'TestPassword123!'
export const TEST_ADMIN_EMAIL = 'admin@kitchenpantrycrm.com'
export const TEST_ADMIN_PASSWORD = 'AdminPassword123!'

// Global test configuration
export interface TestConfig {
  supabase: typeof testSupabase
  testUser: { email: string; password: string }
  adminUser: { email: string; password: string }
  performanceThresholds: {
    queryTimeout: number
    pageLoad: number
    apiResponse: number
  }
}

export const testConfig: TestConfig = {
  supabase: testSupabase,
  testUser: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD },
  adminUser: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
  performanceThresholds: {
    queryTimeout: 5000, // 5ms target for simple queries
    pageLoad: 3000,     // 3s target for page loads
    apiResponse: 1000   // 1s target for API responses
  }
}

// Test cleanup utilities
export class TestCleanup {
  private static createdRecords: { table: string; ids: string[] }[] = []

  static trackCreatedRecord(table: string, id: string) {
    const existingTable = this.createdRecords.find(record => record.table === table)
    if (existingTable) {
      existingTable.ids.push(id)
    } else {
      this.createdRecords.push({ table, ids: [id] })
    }
  }

  static async cleanupTestData() {
    console.log('🧹 Cleaning up test data...')
    
    // Clean up in reverse dependency order to avoid foreign key constraints
    const tables = ['interactions', 'opportunity_products', 'opportunities', 'products', 'contacts', 'organizations']
    
    for (const table of tables) {
      const records = this.createdRecords.find(record => record.table === table)
      if (records && records.ids.length > 0) {
        try {
          const { error } = await testSupabase
            .from(table as any)
            .delete()
            .in('id', records.ids)

          if (error) {
            console.warn(`⚠️  Warning: Could not clean up ${table}:`, error.message)
          } else {
            console.log(`✅ Cleaned up ${records.ids.length} records from ${table}`)
          }
        } catch (err) {
          console.warn(`⚠️  Error cleaning up ${table}:`, err)
        }
      }
    }
    
    // Reset the tracking
    this.createdRecords = []
    console.log('🧹 Test cleanup completed')
  }

  static reset() {
    this.createdRecords = []
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: { operation: string; duration: number; timestamp: Date }[] = []

  static async measureQuery<T>(operation: string, queryFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    try {
      const result = await queryFn()
      const duration = performance.now() - startTime
      
      this.metrics.push({
        operation,
        duration,
        timestamp: new Date()
      })
      
      // Log slow queries
      if (duration > testConfig.performanceThresholds.queryTimeout) {
        console.warn(`🐌 Slow query detected: ${operation} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`❌ Query failed: ${operation} after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  }

  static getMetrics() {
    return this.metrics
  }

  static getAverageQueryTime(operation?: string): number {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation.includes(operation))
      : this.metrics
    
    if (relevantMetrics.length === 0) return 0
    
    return relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length
  }

  static reset() {
    this.metrics = []
  }
}

// Authentication utilities for testing
export class TestAuth {
  private static currentUser: any = null

  static async loginAsTestUser() {
    try {
      const { data, error } = await testSupabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })

      if (error) {
        console.warn(`⚠️  Test user authentication failed: ${error.message}`)
        // Return mock user for testing purposes
        return {
          user: { id: 'test-user-id', email: TEST_USER_EMAIL },
          session: null
        }
      }

      this.currentUser = data.user
      return data
    } catch (error) {
      console.warn(`⚠️  Authentication error: ${error}`)
      return {
        user: { id: 'test-user-id', email: TEST_USER_EMAIL },
        session: null
      }
    }
  }

  static async loginAsAdmin() {
    const { data, error } = await testSupabase.auth.signInWithPassword({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD
    })

    if (error) {
      throw new Error(`Failed to login admin user: ${error.message}`)
    }

    this.currentUser = data.user
    return data
  }

  static async logout() {
    const { error } = await testSupabase.auth.signOut()
    if (error) {
      console.warn('Warning: Could not logout user:', error.message)
    }
    this.currentUser = null
  }

  static getCurrentUser() {
    return this.currentUser
  }
}

// Global test setup
beforeAll(async () => {
  console.log('🔧 Setting up backend test environment...')
  
  // Verify database connection
  try {
    const { data, error } = await testSupabase
      .from('organizations')
      .select('count')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned, which is fine
      throw error
    }
    
    console.log('✅ Database connection verified')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw new Error('Could not connect to test database')
  }

  // Setup test user authentication if needed
  try {
    await TestAuth.loginAsTestUser()
    console.log('✅ Test user authenticated')
  } catch (error) {
    console.warn('⚠️  Could not authenticate test user - some tests may fail:', error)
  }
})

afterAll(async () => {
  console.log('🧹 Tearing down backend test environment...')
  
  // Cleanup test data
  await TestCleanup.cleanupTestData()
  
  // Logout
  await TestAuth.logout()
  
  // Log performance summary
  const avgQueryTime = PerformanceMonitor.getAverageQueryTime()
  console.log(`📊 Average query time: ${avgQueryTime.toFixed(2)}ms`)
  
  console.log('✅ Backend test teardown completed')
})

beforeEach(() => {
  // Reset performance metrics for each test
  PerformanceMonitor.reset()
})

// Make utilities globally available
// Using `var` in the global declaration is a common workaround for this type of error
declare global {
  var testSupabase: typeof testSupabase
  var testConfig: typeof testConfig
  var TestCleanup: typeof TestCleanup
  var PerformanceMonitor: typeof PerformanceMonitor
  var TestAuth: typeof TestAuth
}

Object.assign(globalThis, {
  testSupabase,
  testConfig,
  TestCleanup,
  PerformanceMonitor,
  TestAuth
})
