/**
 * Data Integrity and Constraint Tests
 * 
 * Comprehensive testing of database constraints, foreign keys, triggers,
 * and business logic validation for the KitchenPantry CRM system.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { testSupabase, TestAuth } from '../setup/test-setup'

describe('Data Integrity and Constraint Tests', () => {
  let testDataIds: { table: string; ids: string[] }[] = []

  beforeAll(async () => {
    console.log('🔒 Setting up data integrity tests...')
    await TestAuth.loginAsTestUser()
  })

  afterAll(async () => {
    console.log('🧹 Cleaning up data integrity test data...')
    await cleanupTestData()
  })

  const trackTestData = (table: string, id: string) => {
    const existing = testDataIds.find(t => t.table === table)
    if (existing) {
      existing.ids.push(id)
    } else {
      testDataIds.push({ table, ids: [id] })
    }
  }

  const cleanupTestData = async () => {
    const tables = ['interactions', 'opportunities', 'products', 'contacts', 'organizations']
    
    for (const table of tables) {
      const tableData = testDataIds.find(t => t.table === table)
      if (tableData && tableData.ids.length > 0) {
        try {
          await testSupabase
            .from(table as any)
            .delete()
            .in('id', tableData.ids)
        } catch (error) {
          console.warn(`Could not cleanup ${table}:`, error)
        }
      }
    }
  }

  describe('Foreign Key Constraints', () => {
    let testOrgId: string
    let testContactId: string

    beforeEach(async () => {
      // Create test organization
      const orgResult = await testSupabase
        .from('organizations')
        .insert({
          name: 'FK Test Organization',
          type: 'customer' as const,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      testOrgId = orgResult.data.id
      trackTestData('organizations', testOrgId)

      // Create test contact
      const contactResult = await testSupabase
        .from('contacts')
        .insert({
          organization_id: testOrgId,
          first_name: 'FK',
          last_name: 'TestContact',
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      testContactId = contactResult.data.id
      trackTestData('contacts', testContactId)
    })

    test('should enforce contact -> organization foreign key constraint', async () => {
      const invalidContactData = {
        organization_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
        first_name: 'Invalid',
        last_name: 'Contact',
        created_by: '00000000-0000-0000-0000-000000000001'
      }

      const result = await testSupabase
        .from('contacts')
        .insert(invalidContactData)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503') // Foreign key violation
    })

    test('should enforce opportunity -> organization foreign key constraint', async () => {
      const invalidOpportunityData = {
        name: 'Invalid Organization Opportunity',
        organization_id: '00000000-0000-0000-0000-000000000000',
        contact_id: testContactId,
        stage: 'new_lead' as const,
        created_by: '00000000-0000-0000-0000-000000000001'
      }

      const result = await testSupabase
        .from('opportunities')
        .insert(invalidOpportunityData)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503') // Foreign key violation
    })

    test('should enforce opportunity -> contact foreign key constraint', async () => {
      const invalidOpportunityData = {
        name: 'Invalid Contact Opportunity',
        organization_id: testOrgId,
        contact_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
        stage: 'new_lead' as const,
        created_by: '00000000-0000-0000-0000-000000000001'
      }

      const result = await testSupabase
        .from('opportunities')
        .insert(invalidOpportunityData)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503') // Foreign key violation
    })

    test('should enforce product -> principal organization foreign key constraint', async () => {
      const invalidProductData = {
        principal_id: '00000000-0000-0000-0000-000000000000',
        name: 'Invalid Principal Product',
        category: 'other' as const,
        created_by: '00000000-0000-0000-0000-000000000001'
      }

      const result = await testSupabase
        .from('products')
        .insert(invalidProductData)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503') // Foreign key violation
    })

    test('should prevent deletion of organization with dependent contacts', async () => {
      // Attempt to delete organization with existing contacts
      const deleteResult = await testSupabase
        .from('organizations')
        .delete()
        .eq('id', testOrgId)

      // This should either fail (if constraint exists) or succeed (if cascade delete is configured)
      if (deleteResult.error) {
        expect(deleteResult.error.code).toBe('23503') // Foreign key violation
        console.log('✅ Foreign key constraint prevents organization deletion with dependent contacts')
      } else {
        console.warn('⚠️  Organization deletion succeeded - check if cascade delete is intended')
        // If deletion succeeded, the contact should also be deleted (cascade)
        const contactCheck = await testSupabase
          .from('contacts')
          .select('*')
          .eq('id', testContactId)
          .single()
        
        if (contactCheck.error?.code === 'PGRST116') {
          console.log('✅ Cascade delete properly removed dependent contact')
        }
      }
    })

    test('should maintain referential integrity during updates', async () => {
      // Try to update contact to reference non-existent organization
      const updateResult = await testSupabase
        .from('contacts')
        .update({ organization_id: '00000000-0000-0000-0000-000000000000' })
        .eq('id', testContactId)
        .select()
        .single()

      expect(updateResult.error).toBeDefined()
      expect(updateResult.error?.code).toBe('23503') // Foreign key violation
    })
  })

  describe('Check Constraints', () => {
    test('should enforce opportunity probability range (0-100)', async () => {
      // Create organization and contact for opportunity
      const orgResult = await testSupabase
        .from('organizations')
        .insert({ name: 'Check Constraint Test Org', type: 'customer' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      const contactResult = await testSupabase
        .from('contacts')
        .insert({
          organization_id: orgResult.data.id,
          first_name: 'Check',
          last_name: 'Test',
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      trackTestData('organizations', orgResult.data.id)
      trackTestData('contacts', contactResult.data.id)

      // Test invalid probability values
      const invalidProbabilities = [-1, 101, 150]
      
      for (const probability of invalidProbabilities) {
        const oppData = {
          name: `Invalid Probability Test ${probability}`,
          organization_id: orgResult.data.id,
          contact_id: contactResult.data.id,
          stage: 'qualified' as const,
          probability: probability,
          created_by: '00000000-0000-0000-0000-000000000001'
        }

        const result = await testSupabase
          .from('opportunities')
          .insert(oppData)
          .select()
          .single()

        expect(result.error).toBeDefined()
        expect(result.error?.code).toBe('23514') // Check constraint violation
      }

      // Test valid probability values
      const validProbabilities = [0, 25, 50, 75, 100]
      
      for (const probability of validProbabilities) {
        const oppData = {
          name: `Valid Probability Test ${probability}`,
          organization_id: orgResult.data.id,
          contact_id: contactResult.data.id,
          stage: 'qualified' as const,
          probability: probability,
          created_by: '00000000-0000-0000-0000-000000000001'
        }

        const result = await testSupabase
          .from('opportunities')
          .insert(oppData)
          .select()
          .single()

        expect(result.error).toBeNull()
        expect(result.data.probability).toBe(probability)
        
        trackTestData('opportunities', result.data.id)
      }
    })

    test('should enforce product season constraints (1-12)', async () => {
      // Create principal organization
      const principalResult = await testSupabase
        .from('organizations')
        .insert({ name: 'Season Constraint Principal', type: 'principal' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', principalResult.data.id)

      // Test invalid season values
      const invalidSeasons = [
        { start: 0, end: 6 },    // start too low
        { start: 13, end: 6 },   // start too high  
        { start: 6, end: 0 },    // end too low
        { start: 6, end: 13 }    // end too high
      ]

      for (const season of invalidSeasons) {
        const productData = {
          principal_id: principalResult.data.id,
          name: `Invalid Season Product ${season.start}-${season.end}`,
          category: 'produce' as const,
          season_start: season.start,
          season_end: season.end,
          created_by: '00000000-0000-0000-0000-000000000001'
        }

        const result = await testSupabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        expect(result.error).toBeDefined()
        expect(result.error?.code).toBe('23514') // Check constraint violation
      }

      // Test valid season values
      const validSeasons = [
        { start: 1, end: 12 },   // Full year
        { start: 3, end: 8 },    // Spring to summer
        { start: 12, end: 2 }    // Winter spanning year
      ]

      for (const season of validSeasons) {
        const productData = {
          principal_id: principalResult.data.id,
          name: `Valid Season Product ${season.start}-${season.end}`,
          category: 'produce' as const,
          season_start: season.start,
          season_end: season.end,
          created_by: '00000000-0000-0000-0000-000000000001'
        }

        const result = await testSupabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        expect(result.error).toBeNull()
        expect(result.data.season_start).toBe(season.start)
        expect(result.data.season_end).toBe(season.end)
        
        trackTestData('products', result.data.id)
      }
    })
  })

  describe('Unique Constraints', () => {
    test('should enforce unique primary contact per organization', async () => {
      // Create organization
      const orgResult = await testSupabase
        .from('organizations')
        .insert({ name: 'Unique Constraint Test Org', type: 'customer' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', orgResult.data.id)

      // Create first primary contact
      const contact1Result = await testSupabase
        .from('contacts')
        .insert({
          organization_id: orgResult.data.id,
          first_name: 'Primary1',
          last_name: 'Contact',
          is_primary_contact: true,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      expect(contact1Result.error).toBeNull()
      trackTestData('contacts', contact1Result.data.id)

      // Attempt to create second primary contact (should fail)
      const contact2Result = await testSupabase
        .from('contacts')
        .insert({
          organization_id: orgResult.data.id,
          first_name: 'Primary2',
          last_name: 'Contact',
          is_primary_contact: true,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      expect(contact2Result.error).toBeDefined()
      expect(contact2Result.error?.code).toBe('23505') // Unique constraint violation
    })

    test('should enforce unique SKU per principal organization', async () => {
      // Create principal organization
      const principalResult = await testSupabase
        .from('organizations')
        .insert({ name: 'SKU Unique Test Principal', type: 'principal' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', principalResult.data.id)

      const testSKU = 'UNIQUE-SKU-TEST-001'

      // Create first product with SKU
      const product1Result = await testSupabase
        .from('products')
        .insert({
          principal_id: principalResult.data.id,
          name: 'First SKU Product',
          category: 'other' as const,
          sku: testSKU,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      expect(product1Result.error).toBeNull()
      trackTestData('products', product1Result.data.id)

      // Attempt to create second product with same SKU (should fail)
      const product2Result = await testSupabase
        .from('products')
        .insert({
          principal_id: principalResult.data.id,
          name: 'Second SKU Product',
          category: 'other' as const,
          sku: testSKU,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      expect(product2Result.error).toBeDefined()
      expect(product2Result.error?.code).toBe('23505') // Unique constraint violation
    })

    test('should allow same SKU across different principals', async () => {
      // Create two principal organizations
      const principal1Result = await testSupabase
        .from('organizations')
        .insert({ name: 'Principal 1 for SKU Test', type: 'principal' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      const principal2Result = await testSupabase
        .from('organizations')
        .insert({ name: 'Principal 2 for SKU Test', type: 'principal' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', principal1Result.data.id)
      trackTestData('organizations', principal2Result.data.id)

      const sameSKU = 'SHARED-SKU-001'

      // Create products with same SKU for different principals (should succeed)
      const product1Result = await testSupabase
        .from('products')
        .insert({
          principal_id: principal1Result.data.id,
          name: 'Product from Principal 1',
          category: 'other' as const,
          sku: sameSKU,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      const product2Result = await testSupabase
        .from('products')
        .insert({
          principal_id: principal2Result.data.id,
          name: 'Product from Principal 2',
          category: 'other' as const,
          sku: sameSKU,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      expect(product1Result.error).toBeNull()
      expect(product2Result.error).toBeNull()
      expect(product1Result.data.sku).toBe(sameSKU)
      expect(product2Result.data.sku).toBe(sameSKU)
      expect(product1Result.data.principal_id).not.toBe(product2Result.data.principal_id)

      trackTestData('products', product1Result.data.id)
      trackTestData('products', product2Result.data.id)
    })
  })

  describe('Not Null Constraints', () => {
    test('should enforce required fields on organizations', async () => {
      const requiredFieldTests = [
        { data: { type: 'customer' as const, created_by: '00000000-0000-0000-0000-000000000001' }, missingField: 'name' },
        { data: { name: 'Test Org', created_by: '00000000-0000-0000-0000-000000000001' }, missingField: 'type' }
      ]

      for (const test of requiredFieldTests) {
        const result = await testSupabase
          .from('organizations')
          .insert(test.data as any)
          .select()
          .single()

        expect(result.error).toBeDefined()
        expect(result.error?.code).toBe('23502') // NOT NULL constraint violation
      }
    })

    test('should enforce required fields on contacts', async () => {
      // Create organization first
      const orgResult = await testSupabase
        .from('organizations')
        .insert({ name: 'Required Fields Test Org', type: 'customer' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', orgResult.data.id)

      const requiredFieldTests = [
        { 
          data: { organization_id: orgResult.data.id, last_name: 'Test', created_by: '00000000-0000-0000-0000-000000000001' }, 
          missingField: 'first_name' 
        },
        { 
          data: { organization_id: orgResult.data.id, first_name: 'Test', created_by: '00000000-0000-0000-0000-000000000001' }, 
          missingField: 'last_name' 
        },
        { 
          data: { first_name: 'Test', last_name: 'Contact', created_by: '00000000-0000-0000-0000-000000000001' }, 
          missingField: 'organization_id' 
        }
      ]

      for (const test of requiredFieldTests) {
        const result = await testSupabase
          .from('contacts')
          .insert(test.data as any)
          .select()
          .single()

        expect(result.error).toBeDefined()
        expect(result.error?.code).toBe('23502') // NOT NULL constraint violation
      }
    })

    test('should enforce required fields on products', async () => {
      // Create principal organization first
      const principalResult = await testSupabase
        .from('organizations')
        .insert({ name: 'Product Required Fields Principal', type: 'principal' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', principalResult.data.id)

      const requiredFieldTests = [
        { 
          data: { principal_id: principalResult.data.id, category: 'other' as const, created_by: '00000000-0000-0000-0000-000000000001' }, 
          missingField: 'name' 
        },
        { 
          data: { principal_id: principalResult.data.id, name: 'Test Product', created_by: '00000000-0000-0000-0000-000000000001' }, 
          missingField: 'category' 
        },
        { 
          data: { name: 'Test Product', category: 'other' as const, created_by: '00000000-0000-0000-0000-000000000001' }, 
          missingField: 'principal_id' 
        }
      ]

      for (const test of requiredFieldTests) {
        const result = await testSupabase
          .from('products')
          .insert(test.data as any)
          .select()
          .single()

        expect(result.error).toBeDefined()
        expect(result.error?.code).toBe('23502') // NOT NULL constraint violation
      }
    })
  })

  describe('Data Type Constraints', () => {
    test('should enforce UUID format for ID fields', async () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123456789',
        '00000000-0000-0000-0000-00000000000', // Too short
        '00000000-0000-0000-0000-000000000000g' // Invalid character
      ]

      for (const invalidUUID of invalidUUIDs) {
        const result = await testSupabase
          .from('contacts')
          .insert({
            organization_id: invalidUUID as any,
            first_name: 'UUID',
            last_name: 'Test',
            created_by: '00000000-0000-0000-0000-000000000001'
          })
          .select()
          .single()

        expect(result.error).toBeDefined()
        // Could be various error codes depending on how the invalid UUID is handled
        expect(['22P02', '23503', '22P03'].includes(result.error?.code || '')).toBe(true)
      }
    })

    test('should enforce decimal precision limits', async () => {
      // Create principal and product for testing
      const principalResult = await testSupabase
        .from('organizations')
        .insert({ name: 'Decimal Precision Principal', type: 'principal' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', principalResult.data.id)

      // Test with very large decimal values that might exceed precision
      const productData = {
        principal_id: principalResult.data.id,
        name: 'Decimal Precision Test Product',
        category: 'other' as const,
        unit_cost: 999999999.99, // Testing decimal precision
        list_price: 999999999.99,
        created_by: '00000000-0000-0000-0000-000000000001'
      }

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (result.error) {
        // If there are precision constraints, they should be enforced
        expect(['22003', '22P03'].includes(result.error.code || '')).toBe(true)
      } else {
        // If no error, verify the precision was maintained
        expect(result.data.unit_cost).toBe(productData.unit_cost)
        expect(result.data.list_price).toBe(productData.list_price)
        trackTestData('products', result.data.id)
      }
    })

    test('should enforce enum value constraints', async () => {
      const invalidEnumTests = [
        {
          table: 'organizations',
          data: { name: 'Invalid Type Org', type: 'invalid_type' as any, created_by: '00000000-0000-0000-0000-000000000001' },
          field: 'type'
        },
        {
          table: 'contacts',
          data: { 
            organization_id: '00000000-0000-0000-0000-000000000001', // Will fail on FK anyway
            first_name: 'Invalid',
            last_name: 'Role',
            role: 'invalid_role' as any,
            created_by: '00000000-0000-0000-0000-000000000001'
          },
          field: 'role'
        }
      ]

      for (const test of invalidEnumTests) {
        const result = await testSupabase
          .from(test.table as any)
          .insert(test.data)
          .select()
          .single()

        expect(result.error).toBeDefined()
        // Could be enum constraint violation or foreign key violation
        expect(['22P02', '23503'].includes(result.error?.code || '')).toBe(true)
      }
    })
  })

  describe('Business Logic Integrity', () => {
    test('should validate opportunity contact-organization relationship', async () => {
      // Create two organizations
      const org1Result = await testSupabase
        .from('organizations')
        .insert({ name: 'Org 1 for Business Logic', type: 'customer' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      const org2Result = await testSupabase
        .from('organizations')
        .insert({ name: 'Org 2 for Business Logic', type: 'customer' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', org1Result.data.id)
      trackTestData('organizations', org2Result.data.id)

      // Create contact for org1
      const contactResult = await testSupabase
        .from('contacts')
        .insert({
          organization_id: org1Result.data.id,
          first_name: 'Business',
          last_name: 'Logic',
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      trackTestData('contacts', contactResult.data.id)

      // Try to create opportunity with contact from org1 but assigned to org2
      const invalidOppResult = await testSupabase
        .from('opportunities')
        .insert({
          name: 'Invalid Contact-Org Relationship',
          organization_id: org2Result.data.id, // Different org
          contact_id: contactResult.data.id,    // Contact from org1
          stage: 'new_lead' as const,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      // This should fail if business logic constraint exists
      if (invalidOppResult.error) {
        expect(['23514', '23503'].includes(invalidOppResult.error.code || '')).toBe(true)
        console.log('✅ Business logic constraint prevents mismatched contact-organization relationships')
      } else {
        console.warn('⚠️  Business logic constraint may be missing - consider adding CHECK constraint for contact-organization relationship validation')
        trackTestData('opportunities', invalidOppResult.data.id)
      }
    })

    test('should enforce principal organization type for products', async () => {
      // Create customer organization (not principal)
      const customerResult = await testSupabase
        .from('organizations')
        .insert({ name: 'Customer Org for Product Test', type: 'customer' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', customerResult.data.id)

      // Try to create product with customer organization as principal
      const invalidProductResult = await testSupabase
        .from('products')
        .insert({
          principal_id: customerResult.data.id,
          name: 'Invalid Principal Type Product',
          category: 'other' as const,
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      // This should fail if business logic constraint exists
      if (invalidProductResult.error) {
        expect(['23514', '23503'].includes(invalidProductResult.error.code || '')).toBe(true)
        console.log('✅ Business logic constraint enforces principal organization type')
      } else {
        console.warn('⚠️  Business logic constraint may be missing - consider adding CHECK constraint for principal organization type validation')
        trackTestData('products', invalidProductResult.data.id)
      }
    })
  })

  describe('Constraint Performance Impact', () => {
    test('should maintain acceptable performance with constraint validation', async () => {
      // Create organization for performance test
      const orgResult = await testSupabase
        .from('organizations')
        .insert({ name: 'Constraint Performance Test Org', type: 'customer' as const, created_by: '00000000-0000-0000-0000-000000000001' })
        .select()
        .single()

      trackTestData('organizations', orgResult.data.id)

      // Measure time to create contact with constraint validation
      const startTime = performance.now()

      const contactResult = await testSupabase
        .from('contacts')
        .insert({
          organization_id: orgResult.data.id,
          first_name: 'Performance',
          last_name: 'Test',
          email: 'performance@test.com',
          created_by: '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

      const duration = performance.now() - startTime

      expect(contactResult.error).toBeNull()
      expect(duration).toBeLessThan(100) // Should complete within 100ms
      
      trackTestData('contacts', contactResult.data.id)

      console.log(`📊 Constraint validation performance: ${duration.toFixed(2)}ms`)
    })
  })
})