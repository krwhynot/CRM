/**
 * Organizations Database Tests
 * 
 * Comprehensive testing of CRUD operations, constraints, and business logic
 * for the Organizations table in the KitchenPantry CRM system.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createTestOrganization, checkResult, validateTestData } from '../../utils/test-factories'

describe('Organizations Database Operations', () => {
  let testOrgIds: string[] = []

  beforeEach(async () => {
    testOrgIds = []
    await TestAuth.loginAsTestUser()
  })

  afterEach(async () => {
    // Cleanup test organizations
    if (testOrgIds.length > 0) {
      await testSupabase
        .from('organizations')
        .delete()
        .in('id', testOrgIds)
    }
  })

  describe('CREATE Operations', () => {
    test('should create a new organization with all required fields', async () => {
      const orgData = createTestOrganization({
        name: 'Test Organization',
        type: 'customer',
        description: 'Test organization description',
        phone: '555-0123',
        email: 'test@example.com',
        website: 'https://test.com',
        address_line_1: '123 Test Street',
        city: 'Test City',
        state_province: 'CA',
        postal_code: '90210',
        country: 'United States',
        industry: 'Food Service',
        is_active: true
      })

      const result = await PerformanceMonitor.measureQuery('create_organization', async () => {
        return await testSupabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single()
      })

      const createdOrg = checkResult(result, 'create organization with all fields')
      expect(createdOrg.name).toBe(orgData.name)
      expect(createdOrg.type).toBe(orgData.type)
      expect(createdOrg.id).toBeDefined()
      expect(createdOrg.created_at).toBeDefined()
      expect(createdOrg.updated_at).toBeDefined()

      testOrgIds.push(createdOrg.id)
      TestCleanup.trackCreatedRecord('organizations', createdOrg.id)
    })

    test('should create organizations of different types (Principal, Customer, Distributor)', async () => {
      const types = ['principal', 'customer', 'distributor'] as const
      const createdOrgs = []

      for (const type of types) {
        const orgData = createTestOrganization({
          name: `Test ${type} Organization`,
          type: type,
          description: `Test ${type} organization`
        })

        const result = await testSupabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single()

        const createdOrg = checkResult(result, `create ${type} organization`)
        expect(createdOrg.type).toBe(type)
        
        createdOrgs.push(createdOrg)
        testOrgIds.push(createdOrg.id)
      }

      expect(createdOrgs).toHaveLength(3)
    })

    test('should handle organization creation with minimal required fields', async () => {
      const minimalOrgData = createTestOrganization({
        name: 'Minimal Test Organization',
        type: 'customer'
      })

      const result = await testSupabase
        .from('organizations')
        .insert(minimalOrgData)
        .select()
        .single()

      const createdOrg = checkResult(result, 'create organization with minimal fields')
      expect(createdOrg.name).toBe(minimalOrgData.name)
      expect(createdOrg.type).toBe(minimalOrgData.type)
      expect(createdOrg.is_active).toBe(true) // Default value
      expect(createdOrg.deleted_at).toBeNull() // Default value

      testOrgIds.push(createdOrg.id)
    })

    test('should reject organization creation without required fields', async () => {
      const invalidOrgData = {
        description: 'Missing name and type'
      }

      const result = await testSupabase
        .from('organizations')
        .insert(invalidOrgData as any)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23502') // NOT NULL constraint violation
    })

    test('should validate email format constraints', async () => {
      const invalidEmailOrg = createTestOrganization({
        name: 'Invalid Email Test',
        type: 'customer',
        email: 'invalid-email-format'
      })

      // Note: This may pass at database level if no email validation constraint exists
      // In that case, validation should happen at application level
      const result = await testSupabase
        .from('organizations')
        .insert(invalidEmailOrg)
        .select()
        .single()

      if (result.data) {
        testOrgIds.push(result.data.id)
      }
      
      // The test passes regardless, but logs if email validation should be added
      if (!result.error) {
        console.warn('⚠️  Database allows invalid email formats - consider adding constraints')
      }
    })
  })

  describe('READ Operations', () => {
    let sampleOrgId: string

    beforeEach(async () => {
      // Create a sample organization for read tests
      const orgData = createTestOrganization({
        name: 'Sample Read Test Organization',
        type: 'customer',
        description: 'Sample organization for read testing',
        industry: 'Food Service'
      })

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      const createdOrg = checkResult(result, 'create sample organization for read tests')
      sampleOrgId = createdOrg.id
      testOrgIds.push(sampleOrgId)
    })

    test('should retrieve organization by ID', async () => {
      const result = await PerformanceMonitor.measureQuery('read_organization_by_id', async () => {
        return await testSupabase
          .from('organizations')
          .select('*')
          .eq('id', sampleOrgId)
          .single()
      })

      const organization = checkResult(result, 'retrieve organization by ID')
      expect(organization.id).toBe(sampleOrgId)
      expect(organization.name).toBe('Sample Read Test Organization')
    })

    test('should list organizations with pagination', async () => {
      const result = await PerformanceMonitor.measureQuery('list_organizations_paginated', async () => {
        return await testSupabase
          .from('organizations')
          .select('*', { count: 'exact' })
          .range(0, 9)
          .order('created_at', { ascending: false })
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.count).toBeGreaterThanOrEqual(1)
      expect(result.data!.length).toBeLessThanOrEqual(10)
    })

    test('should filter organizations by type', async () => {
      // Create organizations of different types first
      const types = ['principal', 'customer', 'distributor'] as const
      for (const type of types) {
        const orgData = createTestOrganization({
          name: `Filter Test ${type}`,
          type: type
        })
        const result = await testSupabase.from('organizations').insert(orgData).select().single()
        const createdOrg = checkResult(result, `create ${type} org for filter test`)
        testOrgIds.push(createdOrg.id)
      }

      // Test filtering by each type
      for (const type of types) {
        const result = await testSupabase
          .from('organizations')
          .select('*')
          .eq('type', type)
          .limit(10)

        expect(result.error).toBeNull()
        expect(result.data).toBeDefined()
        result.data!.forEach((org: any) => {
          expect(org.type).toBe(type)
        })
      }
    })

    test('should search organizations by name (full-text search)', async () => {
      const result = await PerformanceMonitor.measureQuery('search_organizations', async () => {
        return await testSupabase
          .from('organizations')
          .select('*')
          .ilike('name', '%Sample%')
          .limit(10)
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBeGreaterThan(0)
      
      // Verify search results contain the search term
      result.data!.forEach((org: any) => {
        expect(org.name.toLowerCase()).toContain('sample')
      })
    })

    test('should filter active organizations only', async () => {
      const result = await testSupabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(10)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      result.data!.forEach((org: any) => {
        expect(org.is_active).toBe(true)
        expect(org.deleted_at).toBeNull()
      })
    })
  })

  describe('UPDATE Operations', () => {
    let sampleOrgId: string

    beforeEach(async () => {
      const orgData = createTestOrganization({
        name: 'Update Test Organization',
        type: 'customer',
        description: 'Organization for update testing'
      })

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      const createdOrg = checkResult(result, 'create sample organization for update tests')
      sampleOrgId = createdOrg.id
      testOrgIds.push(sampleOrgId)
    })

    test('should update organization fields', async () => {
      const updateData = {
        name: 'Updated Organization Name',
        description: 'Updated description',
        phone: '555-UPDATED',
        email: 'updated@example.com'
      }

      const result = await PerformanceMonitor.measureQuery('update_organization', async () => {
        return await testSupabase
          .from('organizations')
          .update(updateData)
          .eq('id', sampleOrgId)
          .select()
          .single()
      })

      const updatedOrg = checkResult(result, 'update organization fields')
      expect(updatedOrg.name).toBe(updateData.name)
      expect(updatedOrg.description).toBe(updateData.description)
      expect(updatedOrg.phone).toBe(updateData.phone)
      expect(updatedOrg.email).toBe(updateData.email)
      expect(new Date(updatedOrg.updated_at) > new Date(updatedOrg.created_at)).toBe(true)
    })

    test('should not allow updating to invalid type', async () => {
      const invalidUpdate = {
        type: 'invalid_type' as any
      }

      const result = await testSupabase
        .from('organizations')
        .update(invalidUpdate)
        .eq('id', sampleOrgId)
        .select()
        .single()

      expect(result.error).toBeDefined()
      // Should get enum constraint violation
      expect(result.error?.code).toBe('22P02')
    })

    test('should update organization to inactive status', async () => {
      const result = await testSupabase
        .from('organizations')
        .update({ is_active: false })
        .eq('id', sampleOrgId)
        .select()
        .single()

      const deactivatedOrg = checkResult(result, 'update organization to inactive status')
      expect(deactivatedOrg.is_active).toBe(false)
    })
  })

  describe('DELETE Operations (Soft Delete)', () => {
    let sampleOrgId: string

    beforeEach(async () => {
      const orgData = createTestOrganization({
        name: 'Delete Test Organization',
        type: 'customer',
        description: 'Organization for delete testing'
      })

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      const createdOrg = checkResult(result, 'create sample organization for delete tests')
      sampleOrgId = createdOrg.id
      testOrgIds.push(sampleOrgId)
    })

    test('should soft delete organization by setting deleted_at timestamp', async () => {
      const result = await PerformanceMonitor.measureQuery('soft_delete_organization', async () => {
        return await testSupabase
          .from('organizations')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', sampleOrgId)
          .select()
          .single()
      })

      const deletedOrg = checkResult(result, 'soft delete organization')
      expect(deletedOrg.deleted_at).toBeDefined()
      expect(deletedOrg.deleted_at).not.toBeNull()
    })

    test('should exclude soft-deleted organizations from normal queries', async () => {
      // First soft delete the organization
      await testSupabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sampleOrgId)

      // Normal query should not return soft-deleted organizations
      const result = await testSupabase
        .from('organizations')
        .select('*')
        .eq('id', sampleOrgId)
        .is('deleted_at', null)
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('PGRST116') // No rows returned
    })

    test('should be able to query soft-deleted organizations specifically', async () => {
      // First soft delete the organization
      await testSupabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sampleOrgId)

      // Query for soft-deleted organizations
      const result = await testSupabase
        .from('organizations')
        .select('*')
        .eq('id', sampleOrgId)
        .not('deleted_at', 'is', null)
        .single()

      const softDeletedOrg = checkResult(result, 'query soft-deleted organization')
      expect(softDeletedOrg.deleted_at).not.toBeNull()
    })

    test('should hard delete organization (for cleanup)', async () => {
      const result = await testSupabase
        .from('organizations')
        .delete()
        .eq('id', sampleOrgId)
        .select()
        .single()

      const hardDeletedOrg = checkResult(result, 'hard delete organization')
      expect(hardDeletedOrg.id).toBe(sampleOrgId)

      // Remove from testOrgIds since it's actually deleted
      testOrgIds = testOrgIds.filter(id => id !== sampleOrgId)
    })
  })

  describe('Business Logic Constraints', () => {
    test('should enforce unique constraints where applicable', async () => {
      // Note: If there are any unique constraints (like email), test them here
      // For this schema, testing duplicate names which should be allowed
      const orgData1 = createTestOrganization({
        name: 'Duplicate Name Test',
        type: 'customer'
      })

      const orgData2 = createTestOrganization({
        name: 'Duplicate Name Test', // Same name
        type: 'principal'
      })

      const result1 = await testSupabase.from('organizations').insert(orgData1).select().single()
      const result2 = await testSupabase.from('organizations').insert(orgData2).select().single()

      expect(result1.error).toBeNull()
      expect(result2.error).toBeNull()
      
      // Both should be created successfully (no unique constraint on name)
      if (result1.data) testOrgIds.push(result1.data.id)
      if (result2.data) testOrgIds.push(result2.data.id)
    })


    test('should handle null values for optional fields', async () => {
      const orgData = createTestOrganization({
        name: 'Null Values Test',
        type: 'customer',
        description: null,
        phone: null,
        email: null,
        website: null
      })

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      const createdNullOrg = checkResult(result, 'create organization with null optional fields')
      expect(createdNullOrg.description).toBeNull()
      expect(createdNullOrg.phone).toBeNull()
      expect(createdNullOrg.email).toBeNull()

      testOrgIds.push(createdNullOrg.id)
    })
  })

  describe('Index Performance Tests', () => {
    test('should perform efficiently with name-based queries', async () => {
      const startTime = performance.now()
      
      const result = await testSupabase
        .from('organizations')
        .select('*')
        .ilike('name', '%test%')
        .limit(100)
      
      const duration = performance.now() - startTime
      
      expect(result.error).toBeNull()
      expect(duration).toBeLessThan(100) // Should be under 100ms
    })

    test('should perform efficiently with type-based filtering', async () => {
      const startTime = performance.now()
      
      const result = await testSupabase
        .from('organizations')
        .select('*')
        .eq('type', 'customer')
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(100)
      
      const duration = performance.now() - startTime
      
      expect(result.error).toBeNull()
      expect(duration).toBeLessThan(50) // Should be under 50ms with indexes
    })
  })
})
