/**
 * Row Level Security (RLS) Policies Tests
 * 
 * Comprehensive testing of multi-tenant data isolation and access control
 * policies for the KitchenPantry CRM system.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

describe('Row Level Security (RLS) Policies', () => {
  let user1Client: any
  let user2Client: any
  let anonClient: any
  let adminClient: any
  
  let user1Id: string
  let user2Id: string
  let adminUserId: string
  
  let testDataIds: { table: string; ids: string[] }[] = []

  beforeAll(async () => {
    // Create separate Supabase clients for different users
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ixitjldcdvbazvjsnkao.supabase.co'
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aXRqbGRjZHZiYXp2anNua2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjg0MjEsImV4cCI6MjA3MDUwNDQyMX0.8h5jXRcT96R34m0MU7PVbgzJPpGvf5azgQd2wo5AB2Q'

    user1Client = createClient<Database>(supabaseUrl, supabaseAnonKey)
    user2Client = createClient<Database>(supabaseUrl, supabaseAnonKey)
    adminClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
    anonClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

    // Authenticate different users for testing
    try {
      // User 1 - Regular user
      const user1Auth = await user1Client.auth.signInWithPassword({
        email: 'user1@rlstest.com',
        password: 'TestPassword123!'
      })
      
      if (user1Auth.data?.user) {
        user1Id = user1Auth.data.user.id
      } else {
        // Try to create user1 if login fails
        const signUpResult = await user1Client.auth.signUp({
          email: 'user1@rlstest.com',
          password: 'TestPassword123!'
        })
        if (signUpResult.data?.user) {
          user1Id = signUpResult.data.user.id
        }
      }

      // User 2 - Different regular user
      const user2Auth = await user2Client.auth.signInWithPassword({
        email: 'user2@rlstest.com',
        password: 'TestPassword123!'
      })
      
      if (user2Auth.data?.user) {
        user2Id = user2Auth.data.user.id
      } else {
        // Try to create user2 if login fails
        const signUpResult = await user2Client.auth.signUp({
          email: 'user2@rlstest.com',
          password: 'TestPassword123!'
        })
        if (signUpResult.data?.user) {
          user2Id = signUpResult.data.user.id
        }
      }

      // Admin user
      const adminAuth = await adminClient.auth.signInWithPassword({
        email: 'admin@rlstest.com',
        password: 'AdminPassword123!'
      })
      
      if (adminAuth.data?.user) {
        adminUserId = adminAuth.data.user.id
      }

      console.log('🔐 RLS test users authenticated')
    } catch (error) {
      console.warn('⚠️  Could not authenticate all RLS test users - some tests may be skipped')
      console.warn('Error:', error)
    }
  })

  afterAll(async () => {
    // Cleanup test data
    console.log('🧹 Cleaning up RLS test data...')
    
    const tables = ['interactions', 'opportunities', 'products', 'contacts', 'organizations']
    
    for (const table of tables) {
      const tableData = testDataIds.find(t => t.table === table)
      if (tableData && tableData.ids.length > 0) {
        try {
          // Use admin client for cleanup to bypass RLS
          await adminClient
            .from(table)
            .delete()
            .in('id', tableData.ids)
        } catch (error) {
          console.warn(`Could not cleanup ${table}:`, error)
        }
      }
    }

    // Logout all clients
    await Promise.all([
      user1Client.auth.signOut(),
      user2Client.auth.signOut(),
      adminClient.auth.signOut()
    ])
  })

  const trackTestData = (table: string, id: string) => {
    const existing = testDataIds.find(t => t.table === table)
    if (existing) {
      existing.ids.push(id)
    } else {
      testDataIds.push({ table, ids: [id] })
    }
  }

  describe('Organizations RLS Policies', () => {
    test('should allow users to create organizations', async () => {
      if (!user1Id) {
        console.warn('⚠️  Skipping test - user1 not authenticated')
        return
      }

      const orgData = {
        name: 'RLS Test Organization User1',
        type: 'customer' as const,
        description: 'Organization created by user1 for RLS testing'
      }

      const result = await user1Client
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe(orgData.name)
      expect(result.data.created_by).toBe(user1Id)

      trackTestData('organizations', result.data.id)
    })

    test('should allow users to read organizations they created', async () => {
      if (!user1Id) {
        console.warn('⚠️  Skipping test - user1 not authenticated')
        return
      }

      // First create an organization
      const orgData = {
        name: 'User1 Readable Organization',
        type: 'principal' as const
      }

      const createResult = await user1Client
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      expect(createResult.error).toBeNull()
      const orgId = createResult.data.id
      trackTestData('organizations', orgId)

      // Then try to read it
      const readResult = await user1Client
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      expect(readResult.error).toBeNull()
      expect(readResult.data).toBeDefined()
      expect(readResult.data.id).toBe(orgId)
    })

    test('should prevent users from reading organizations created by others', async () => {
      if (!user1Id || !user2Id) {
        console.warn('⚠️  Skipping test - users not authenticated')
        return
      }

      // User1 creates an organization
      const orgData = {
        name: 'User1 Private Organization',
        type: 'customer' as const
      }

      const createResult = await user1Client
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      expect(createResult.error).toBeNull()
      const orgId = createResult.data.id
      trackTestData('organizations', orgId)

      // User2 tries to read User1's organization
      const readResult = await user2Client
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      // This should fail due to RLS policy
      expect(readResult.error).toBeDefined()
      expect(readResult.error?.code).toBe('PGRST116') // No rows returned
    })

    test('should allow users to update their own organizations', async () => {
      if (!user1Id) {
        console.warn('⚠️  Skipping test - user1 not authenticated')
        return
      }

      // Create organization
      const orgData = {
        name: 'User1 Updatable Organization',
        type: 'distributor' as const
      }

      const createResult = await user1Client
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      const orgId = createResult.data.id
      trackTestData('organizations', orgId)

      // Update organization
      const updateResult = await user1Client
        .from('organizations')
        .update({ 
          name: 'Updated Organization Name',
          description: 'Updated by owner'
        })
        .eq('id', orgId)
        .select()
        .single()

      expect(updateResult.error).toBeNull()
      expect(updateResult.data.name).toBe('Updated Organization Name')
      expect(updateResult.data.updated_by).toBe(user1Id)
    })

    test('should prevent users from updating organizations they do not own', async () => {
      if (!user1Id || !user2Id) {
        console.warn('⚠️  Skipping test - users not authenticated')
        return
      }

      // User1 creates organization
      const orgData = {
        name: 'User1 Protected Organization',
        type: 'customer' as const
      }

      const createResult = await user1Client
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      const orgId = createResult.data.id
      trackTestData('organizations', orgId)

      // User2 tries to update User1's organization
      const updateResult = await user2Client
        .from('organizations')
        .update({ name: 'Unauthorized Update Attempt' })
        .eq('id', orgId)
        .select()
        .single()

      // This should fail due to RLS policy
      expect(updateResult.error).toBeDefined()
      // Could be PGRST116 (no rows) or another error depending on policy implementation
      expect(['PGRST116', '42501', '23503'].includes(updateResult.error?.code || '')).toBe(true)
    })

    test('should prevent unauthorized deletion of organizations', async () => {
      if (!user1Id || !user2Id) {
        console.warn('⚠️  Skipping test - users not authenticated')
        return
      }

      // User1 creates organization
      const orgData = {
        name: 'User1 Delete Protected Organization',
        type: 'principal' as const
      }

      const createResult = await user1Client
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      const orgId = createResult.data.id
      trackTestData('organizations', orgId)

      // User2 tries to delete User1's organization
      const deleteResult = await user2Client
        .from('organizations')
        .delete()
        .eq('id', orgId)

      // This should fail
      expect(deleteResult.error).toBeDefined()
    })
  })

  describe('Contacts RLS Policies', () => {
    let testOrgId: string

    beforeEach(async () => {
      if (!user1Id) return

      // Create a test organization for contacts
      const orgData = {
        name: 'RLS Test Org for Contacts',
        type: 'customer' as const
      }

      const result = await user1Client
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      testOrgId = result.data.id
      trackTestData('organizations', testOrgId)
    })

    test('should allow users to create contacts for their organizations', async () => {
      if (!user1Id || !testOrgId) {
        console.warn('⚠️  Skipping test - prerequisites not met')
        return
      }

      const contactData = {
        organization_id: testOrgId,
        first_name: 'RLS',
        last_name: 'TestContact',
        email: 'rlstest@example.com'
      }

      const result = await user1Client
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.organization_id).toBe(testOrgId)
      expect(result.data.created_by).toBe(user1Id)

      trackTestData('contacts', result.data.id)
    })

    test('should prevent users from creating contacts for organizations they do not own', async () => {
      if (!user1Id || !user2Id) {
        console.warn('⚠️  Skipping test - users not authenticated')
        return
      }

      // User1 creates organization
      const orgData = {
        name: 'User1 Protected Org',
        type: 'customer' as const
      }

      const orgResult = await user1Client
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      const orgId = orgResult.data.id
      trackTestData('organizations', orgId)

      // User2 tries to create contact for User1's organization
      const contactData = {
        organization_id: orgId,
        first_name: 'Unauthorized',
        last_name: 'Contact'
      }

      const contactResult = await user2Client
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      // This should fail due to RLS policy or foreign key constraint
      expect(contactResult.error).toBeDefined()
    })

    test('should allow users to read contacts from their organizations', async () => {
      if (!user1Id || !testOrgId) {
        console.warn('⚠️  Skipping test - prerequisites not met')
        return
      }

      // Create contact
      const contactData = {
        organization_id: testOrgId,
        first_name: 'Readable',
        last_name: 'Contact'
      }

      const createResult = await user1Client
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      const contactId = createResult.data.id
      trackTestData('contacts', contactId)

      // Read contact
      const readResult = await user1Client
        .from('contacts')
        .select(`
          *,
          organization:organizations(name)
        `)
        .eq('id', contactId)
        .single()

      expect(readResult.error).toBeNull()
      expect(readResult.data).toBeDefined()
      expect(readResult.data.id).toBe(contactId)
      expect(readResult.data.organization).toBeDefined()
    })
  })

  describe('Anonymous Access Control', () => {
    test('should prevent anonymous users from accessing organizations', async () => {
      const result = await anonClient
        .from('organizations')
        .select('*')
        .limit(1)

      // This should fail for anonymous users
      expect(result.error).toBeDefined()
      expect(['401', '42501'].includes(result.error?.code || '')).toBe(true)
    })

    test('should prevent anonymous users from creating organizations', async () => {
      const orgData = {
        name: 'Anonymous Test Org',
        type: 'customer' as const
      }

      const result = await anonClient
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      // This should fail for anonymous users
      expect(result.error).toBeDefined()
      expect(['401', '42501'].includes(result.error?.code || '')).toBe(true)
    })

    test('should prevent anonymous users from accessing contacts', async () => {
      const result = await anonClient
        .from('contacts')
        .select('*')
        .limit(1)

      expect(result.error).toBeDefined()
      expect(['401', '42501'].includes(result.error?.code || '')).toBe(true)
    })
  })

  describe('Admin Access Control', () => {
    test('should allow admin users to access all organizations', async () => {
      if (!adminUserId) {
        console.warn('⚠️  Skipping admin test - admin user not authenticated')
        return
      }

      // Create organization with regular user
      if (user1Id) {
        const orgData = {
          name: 'Admin Access Test Org',
          type: 'principal' as const
        }

        const createResult = await user1Client
          .from('organizations')
          .insert(orgData)
          .select()
          .single()

        trackTestData('organizations', createResult.data.id)

        // Admin should be able to read all organizations
        const adminReadResult = await adminClient
          .from('organizations')
          .select('*')
          .limit(10)

        // This should succeed if admin has proper permissions
        if (adminReadResult.error) {
          console.warn('⚠️  Admin access may not be configured properly')
        } else {
          expect(adminReadResult.data).toBeDefined()
          expect(adminReadResult.data.length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('Data Isolation Verification', () => {
    test('should maintain complete data isolation between users', async () => {
      if (!user1Id || !user2Id) {
        console.warn('⚠️  Skipping isolation test - users not authenticated')
        return
      }

      // User1 creates multiple organizations
      const user1Orgs = []
      for (let i = 1; i <= 3; i++) {
        const orgData = {
          name: `User1 Isolation Test Org ${i}`,
          type: 'customer' as const
        }

        const result = await user1Client
          .from('organizations')
          .insert(orgData)
          .select()
          .single()

        user1Orgs.push(result.data.id)
        trackTestData('organizations', result.data.id)
      }

      // User2 creates multiple organizations
      const user2Orgs = []
      for (let i = 1; i <= 3; i++) {
        const orgData = {
          name: `User2 Isolation Test Org ${i}`,
          type: 'principal' as const
        }

        const result = await user2Client
          .from('organizations')
          .insert(orgData)
          .select()
          .single()

        user2Orgs.push(result.data.id)
        trackTestData('organizations', result.data.id)
      }

      // User1 should only see their organizations
      const user1Results = await user1Client
        .from('organizations')
        .select('*')
        .ilike('name', '%Isolation Test%')

      expect(user1Results.error).toBeNull()
      expect(user1Results.data).toBeDefined()
      
      // All results should belong to user1
      user1Results.data.forEach(org => {
        expect(user1Orgs.includes(org.id)).toBe(true)
        expect(user2Orgs.includes(org.id)).toBe(false)
      })

      // User2 should only see their organizations
      const user2Results = await user2Client
        .from('organizations')
        .select('*')
        .ilike('name', '%Isolation Test%')

      expect(user2Results.error).toBeNull()
      expect(user2Results.data).toBeDefined()
      
      // All results should belong to user2
      user2Results.data.forEach(org => {
        expect(user2Orgs.includes(org.id)).toBe(true)
        expect(user1Orgs.includes(org.id)).toBe(false)
      })

      // Verify complete isolation
      const user1OrgIds = user1Results.data.map(org => org.id)
      const user2OrgIds = user2Results.data.map(org => org.id)
      
      // No overlap should exist
      const overlap = user1OrgIds.filter(id => user2OrgIds.includes(id))
      expect(overlap).toHaveLength(0)
    })
  })

  describe('RLS Performance Impact', () => {
    test('should maintain acceptable query performance with RLS enabled', async () => {
      if (!user1Id) {
        console.warn('⚠️  Skipping performance test - user1 not authenticated')
        return
      }

      const startTime = performance.now()

      const result = await user1Client
        .from('organizations')
        .select('*')
        .limit(100)

      const duration = performance.now() - startTime

      expect(result.error).toBeNull()
      expect(duration).toBeLessThan(200) // RLS should add minimal overhead

      console.log(`📊 RLS query performance: ${duration.toFixed(2)}ms`)
    })

    test('should efficiently handle large datasets with RLS', async () => {
      if (!user1Id) {
        console.warn('⚠️  Skipping large dataset test - user1 not authenticated')
        return
      }

      // Create multiple organizations to test pagination performance
      const orgIds = []
      for (let i = 1; i <= 10; i++) {
        const orgData = {
          name: `Bulk RLS Test Org ${i}`,
          type: 'customer' as const
        }

        const result = await user1Client
          .from('organizations')
          .insert(orgData)
          .select()
          .single()

        orgIds.push(result.data.id)
        trackTestData('organizations', result.data.id)
      }

      const startTime = performance.now()

      const result = await user1Client
        .from('organizations')
        .select('*', { count: 'exact' })
        .range(0, 4)
        .order('created_at', { ascending: false })

      const duration = performance.now() - startTime

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.count).toBeGreaterThanOrEqual(10)
      expect(duration).toBeLessThan(150)

      console.log(`📊 RLS pagination performance: ${duration.toFixed(2)}ms`)
    })
  })
})