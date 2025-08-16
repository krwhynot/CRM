import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { testSupabase, cleanupTestData } from '../utils/test-database'
import { TestDataFactory, TestDataSets } from '../fixtures/test-data'
import type { Database } from '@/lib/database.types'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']

describe('Organizations CRUD Operations', () => {
  let testOrganizationId: string

  beforeEach(async () => {
    // Start with clean state
    await cleanupTestData()
  })

  afterEach(async () => {
    // Clean up after each test
    await cleanupTestData()
  })

  describe('CREATE Operations', () => {
    it('should create a new organization with valid data', async () => {
      const orgData = TestDataFactory.createOrganization({
        name: 'Test Create Organization',
        type: 'customer',
        priority: 'B',
        segment: 'Restaurant'
      })

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.name).toBe('Test Create Organization')
      expect(data?.type).toBe('customer')
      expect(data?.priority).toBe('B')
      expect(data?.segment).toBe('Restaurant')
      expect(data?.id).toBeDefined()
      expect(data?.created_at).toBeDefined()
      expect(data?.updated_at).toBeDefined()

      testOrganizationId = data!.id
    })

    it('should create a principal organization', async () => {
      const principalData = TestDataSets.principalDistributorCustomer.principal

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(principalData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.type).toBe('principal')
      expect(data?.is_principal).toBe(true)
      expect(data?.priority).toBe('A')
    })

    it('should create a distributor organization', async () => {
      const distributorData = TestDataSets.principalDistributorCustomer.distributor

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(distributorData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.type).toBe('distributor')
      expect(data?.is_distributor).toBe(true)
    })

    it('should fail to create organization with invalid data', async () => {
      // Test empty name
      const invalidData = TestDataFactory.createOrganization({ name: '' })

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    it('should fail to create organization with invalid type', async () => {
      const invalidData = {
        ...TestDataFactory.createOrganization(),
        type: 'invalid_type' as any
      }

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })
  })

  describe('READ Operations', () => {
    beforeEach(async () => {
      // Create test organization
      const orgData = TestDataFactory.createOrganization()
      const { data } = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()
      
      testOrganizationId = data!.id
    })

    it('should read organization by id', async () => {
      const { data, error } = await testSupabase
        .from('organizations')
        .select('*')
        .eq('id', testOrganizationId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.id).toBe(testOrganizationId)
    })

    it('should read organizations with filtering', async () => {
      // Create multiple organizations
      await testSupabase.from('organizations').insert([
        TestDataFactory.createOrganization({ type: 'customer', priority: 'A' }),
        TestDataFactory.createOrganization({ type: 'principal', priority: 'B' }),
        TestDataFactory.createOrganization({ type: 'distributor', priority: 'A' })
      ])

      // Filter by type
      const { data: customers, error } = await testSupabase
        .from('organizations')
        .select('*')
        .eq('type', 'customer')
        .is('deleted_at', null)

      expect(error).toBeNull()
      expect(customers?.length).toBeGreaterThan(0)
      customers?.forEach(org => {
        expect(org.type).toBe('customer')
      })
    })

    it('should read organizations with pagination', async () => {
      // Create multiple organizations
      const orgs = Array.from({ length: 5 }, () => TestDataFactory.createOrganization())
      await testSupabase.from('organizations').insert(orgs)

      const { data, error } = await testSupabase
        .from('organizations')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(3)

      expect(error).toBeNull()
      expect(data?.length).toBeLessThanOrEqual(3)
    })

    it('should exclude soft-deleted organizations', async () => {
      // Soft delete the test organization
      await testSupabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', testOrganizationId)

      // Try to read it
      const { data, error } = await testSupabase
        .from('organizations')
        .select('*')
        .eq('id', testOrganizationId)
        .is('deleted_at', null)
        .single()

      expect(error).toBeDefined() // Should not find the record
      expect(data).toBeNull()
    })
  })

  describe('UPDATE Operations', () => {
    beforeEach(async () => {
      // Create test organization
      const orgData = TestDataFactory.createOrganization()
      const { data } = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()
      
      testOrganizationId = data!.id
    })

    it('should update organization with valid data', async () => {
      const updateData = {
        name: 'Updated Organization Name',
        priority: 'A' as const,
        segment: 'Updated Segment',
        updated_at: new Date().toISOString()
      }

      const { data, error } = await testSupabase
        .from('organizations')
        .update(updateData)
        .eq('id', testOrganizationId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.name).toBe('Updated Organization Name')
      expect(data?.priority).toBe('A')
      expect(data?.segment).toBe('Updated Segment')
    })

    it('should fail to update with invalid data', async () => {
      const invalidUpdate = {
        type: 'invalid_type' as any
      }

      const { data, error } = await testSupabase
        .from('organizations')
        .update(invalidUpdate)
        .eq('id', testOrganizationId)
        .select()

      expect(error).toBeDefined()
    })

    it('should update audit fields correctly', async () => {
      const beforeUpdate = await testSupabase
        .from('organizations')
        .select('updated_at')
        .eq('id', testOrganizationId)
        .single()

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100))

      const { data, error } = await testSupabase
        .from('organizations')
        .update({ 
          name: 'Updated Name',
          updated_at: new Date().toISOString()
        })
        .eq('id', testOrganizationId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(new Date(data!.updated_at!).getTime()).toBeGreaterThan(
        new Date(beforeUpdate.data!.updated_at!).getTime()
      )
    })
  })

  describe('DELETE Operations (Soft Delete)', () => {
    beforeEach(async () => {
      // Create test organization
      const orgData = TestDataFactory.createOrganization()
      const { data } = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()
      
      testOrganizationId = data!.id
    })

    it('should soft delete organization', async () => {
      const deleteDate = new Date().toISOString()

      const { data, error } = await testSupabase
        .from('organizations')
        .update({ deleted_at: deleteDate })
        .eq('id', testOrganizationId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.deleted_at).toBe(deleteDate)

      // Verify it's excluded from normal queries
      const { data: readData, error: readError } = await testSupabase
        .from('organizations')
        .select('*')
        .eq('id', testOrganizationId)
        .is('deleted_at', null)
        .single()

      expect(readError).toBeDefined()
      expect(readData).toBeNull()
    })

    it('should restore soft-deleted organization', async () => {
      // First soft delete
      await testSupabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', testOrganizationId)

      // Then restore
      const { data, error } = await testSupabase
        .from('organizations')
        .update({ deleted_at: null })
        .eq('id', testOrganizationId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.deleted_at).toBeNull()

      // Verify it's included in normal queries again
      const { data: readData, error: readError } = await testSupabase
        .from('organizations')
        .select('*')
        .eq('id', testOrganizationId)
        .is('deleted_at', null)
        .single()

      expect(readError).toBeNull()
      expect(readData).toBeDefined()
    })
  })

  describe('Business Logic Validation', () => {
    it('should validate organization type flags consistency', async () => {
      // Principal organization should have is_principal = true
      const principalData = TestDataFactory.createOrganization({
        type: 'principal',
        is_principal: true,
        is_distributor: false
      })

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(principalData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.type).toBe('principal')
      expect(data?.is_principal).toBe(true)
      expect(data?.is_distributor).toBe(false)
    })

    it('should handle organization priority-segment combinations', async () => {
      // Test various priority-segment combinations
      const combinations = [
        { priority: 'A', segment: 'Key Account' },
        { priority: 'B', segment: 'Restaurant' },
        { priority: 'C', segment: 'Small Business' },
        { priority: 'D', segment: 'Prospect' }
      ]

      for (const combo of combinations) {
        const orgData = TestDataFactory.createOrganization(combo)
        
        const { data, error } = await testSupabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data?.priority).toBe(combo.priority)
        expect(data?.segment).toBe(combo.segment)
      }
    })
  })
})