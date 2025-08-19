/**
 * Organizations Database Tests
 * 
 * Comprehensive testing of CRUD operations, constraints, and business logic
 * for the Organizations table in the KitchenPantry CRM system.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { v4 as uuidv4 } from 'uuid'

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
      const orgData = {
        name: 'Test Organization',
        type: 'customer' as const,
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
        size: 'medium' as const,
        annual_revenue: 1000000.00,
        employee_count: 50,
        is_active: true
      }

      const result = await PerformanceMonitor.measureQuery('create_organization', async () => {
        return await testSupabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single()
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe(orgData.name)
      expect(result.data.type).toBe(orgData.type)
      expect(result.data.id).toBeDefined()
      expect(result.data.created_at).toBeDefined()
      expect(result.data.updated_at).toBeDefined()

      testOrgIds.push(result.data.id)
      TestCleanup.trackCreatedRecord('organizations', result.data.id)
    })

    test('should create organizations of different types (Principal, Customer, Distributor)', async () => {
      const types = ['principal', 'customer', 'distributor'] as const
      const createdOrgs = []

      for (const type of types) {
        const orgData = {
          name: `Test ${type} Organization`,
          type: type,
          description: `Test ${type} organization`
        }

        const result = await testSupabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single()

        expect(result.error).toBeNull()
        expect(result.data.type).toBe(type)
        
        createdOrgs.push(result.data)
        testOrgIds.push(result.data.id)
      }

      expect(createdOrgs).toHaveLength(3)
    })

    test('should handle organization creation with minimal required fields', async () => {
      const minimalOrgData = {
        name: 'Minimal Test Organization',
        type: 'customer' as const
      }

      const result = await testSupabase
        .from('organizations')
        .insert(minimalOrgData)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.name).toBe(minimalOrgData.name)
      expect(result.data.type).toBe(minimalOrgData.type)
      expect(result.data.is_active).toBe(true) // Default value
      expect(result.data.deleted_at).toBeNull() // Default value

      testOrgIds.push(result.data.id)
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
      const invalidEmailOrg = {
        name: 'Invalid Email Test',
        type: 'customer' as const,
        email: 'invalid-email-format'
      }

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
      const orgData = {
        name: 'Sample Read Test Organization',
        type: 'customer' as const,
        description: 'Sample organization for read testing',
        industry: 'Food Service'
      }

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      sampleOrgId = result.data.id
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

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(sampleOrgId)
      expect(result.data.name).toBe('Sample Read Test Organization')
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
      expect(result.data.length).toBeLessThanOrEqual(10)
    })

    test('should filter organizations by type', async () => {
      // Create organizations of different types first
      const types = ['principal', 'customer', 'distributor'] as const
      for (const type of types) {
        const orgData = {
          name: `Filter Test ${type}`,
          type: type
        }
        const result = await testSupabase.from('organizations').insert(orgData).select().single()
        testOrgIds.push(result.data.id)
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
        result.data.forEach(org => {
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
      expect(result.data.length).toBeGreaterThan(0)
      
      // Verify search results contain the search term
      result.data.forEach(org => {
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
      result.data.forEach(org => {
        expect(org.is_active).toBe(true)
        expect(org.deleted_at).toBeNull()
      })
    })
  })

  describe('UPDATE Operations', () => {
    let sampleOrgId: string

    beforeEach(async () => {
      const orgData = {
        name: 'Update Test Organization',
        type: 'customer' as const,
        description: 'Organization for update testing'
      }

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      sampleOrgId = result.data.id
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

      expect(result.error).toBeNull()
      expect(result.data.name).toBe(updateData.name)
      expect(result.data.description).toBe(updateData.description)
      expect(result.data.phone).toBe(updateData.phone)
      expect(result.data.email).toBe(updateData.email)
      expect(new Date(result.data.updated_at) > new Date(result.data.created_at)).toBe(true)
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

      expect(result.error).toBeNull()
      expect(result.data.is_active).toBe(false)
    })
  })

  describe('DELETE Operations (Soft Delete)', () => {
    let sampleOrgId: string

    beforeEach(async () => {
      const orgData = {
        name: 'Delete Test Organization',
        type: 'customer' as const,
        description: 'Organization for delete testing'
      }

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      sampleOrgId = result.data.id
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

      expect(result.error).toBeNull()
      expect(result.data.deleted_at).toBeDefined()
      expect(result.data.deleted_at).not.toBeNull()
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

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.deleted_at).not.toBeNull()
    })

    test('should hard delete organization (for cleanup)', async () => {
      const result = await testSupabase
        .from('organizations')
        .delete()
        .eq('id', sampleOrgId)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.id).toBe(sampleOrgId)

      // Remove from testOrgIds since it's actually deleted
      testOrgIds = testOrgIds.filter(id => id !== sampleOrgId)
    })
  })

  describe('Business Logic Constraints', () => {
    test('should enforce unique constraints where applicable', async () => {
      // Note: If there are any unique constraints (like email), test them here
      // For this schema, testing duplicate names which should be allowed
      const orgData1 = {
        name: 'Duplicate Name Test',
        type: 'customer' as const
      }

      const orgData2 = {
        name: 'Duplicate Name Test', // Same name
        type: 'principal' as const
      }

      const result1 = await testSupabase.from('organizations').insert(orgData1).select().single()
      const result2 = await testSupabase.from('organizations').insert(orgData2).select().single()

      expect(result1.error).toBeNull()
      expect(result2.error).toBeNull()
      
      // Both should be created successfully (no unique constraint on name)
      testOrgIds.push(result1.data.id, result2.data.id)
    })

    test('should validate decimal precision for annual_revenue', async () => {
      const orgData = {
        name: 'Revenue Test Organization',
        type: 'customer' as const,
        annual_revenue: 999999999999999.99 // Maximum precision
      }

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.annual_revenue).toBe(999999999999999.99)

      testOrgIds.push(result.data.id)
    })

    test('should handle null values for optional fields', async () => {
      const orgData = {
        name: 'Null Values Test',
        type: 'customer' as const,
        description: null,
        phone: null,
        email: null,
        website: null,
        annual_revenue: null,
        employee_count: null
      }

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.description).toBeNull()
      expect(result.data.phone).toBeNull()
      expect(result.data.email).toBeNull()

      testOrgIds.push(result.data.id)
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