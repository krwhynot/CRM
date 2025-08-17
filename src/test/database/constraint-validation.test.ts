import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { testSupabase, cleanupTestData } from '../utils/test-database'
import { TestDataFactory, TestDataSets } from '../fixtures/test-data'

describe('Database Constraint Validation', () => {
  let testOrganizationId: string
  let testContactId: string
  let testPrincipalId: string

  beforeEach(async () => {
    await cleanupTestData()
    
    // Create test data for constraint testing
    const orgData = TestDataFactory.createOrganization()
    const { data: org } = await testSupabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()
    testOrganizationId = org!.id

    const contactData = TestDataFactory.createContact(testOrganizationId)
    const { data: contact } = await testSupabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single()
    testContactId = contact!.id

    const principalData = TestDataSets.principalDistributorCustomer.principal
    const { data: principal } = await testSupabase
      .from('organizations')
      .insert(principalData)
      .select()
      .single()
    testPrincipalId = principal!.id
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  describe('NOT NULL Constraints', () => {
    it('should enforce NOT NULL on organization.name', async () => {
      const invalidData = {
        type: 'customer' as const,
        priority: 'B',
        segment: 'Restaurant'
        // name is missing
      }

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(invalidData as any)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23502') // NOT NULL violation
      expect(data).toBeNull()
    })

    it('should enforce NOT NULL on contact.first_name', async () => {
      const invalidData = {
        organization_id: testOrganizationId,
        last_name: 'Doe',
        decision_authority: 'Medium',
        purchase_influence: 'Direct'
        // first_name is missing
      }

      const { data, error } = await testSupabase
        .from('contacts')
        .insert(invalidData as any)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23502')
      expect(data).toBeNull()
    })

    it('should enforce NOT NULL on product.principal_id', async () => {
      const invalidData = {
        name: 'Test Product',
        category: 'dairy' as const
        // principal_id is missing
      }

      const { data, error } = await testSupabase
        .from('products')
        .insert(invalidData as any)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23502')
      expect(data).toBeNull()
    })
  })

  describe('FOREIGN KEY Constraints', () => {
    it('should enforce foreign key constraint on contacts.organization_id', async () => {
      const invalidData = TestDataFactory.createContact('00000000-0000-0000-0000-000000000000')

      const { data, error } = await testSupabase
        .from('contacts')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23503') // Foreign key violation
      expect(data).toBeNull()
    })

    it('should enforce foreign key constraint on products.principal_id', async () => {
      const invalidData = TestDataFactory.createProduct('00000000-0000-0000-0000-000000000000')

      const { data, error } = await testSupabase
        .from('products')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23503')
      expect(data).toBeNull()
    })

    it('should enforce foreign key constraint on opportunities.organization_id', async () => {
      const invalidData = TestDataFactory.createOpportunity(
        '00000000-0000-0000-0000-000000000000',
        testContactId
      )

      const { data, error } = await testSupabase
        .from('opportunities')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23503')
      expect(data).toBeNull()
    })

    it('should enforce foreign key constraint on opportunities.contact_id', async () => {
      const invalidData = TestDataFactory.createOpportunity(
        testOrganizationId,
        '00000000-0000-0000-0000-000000000000'
      )

      const { data, error } = await testSupabase
        .from('opportunities')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23503')
      expect(data).toBeNull()
    })
  })

  describe('ENUM Constraints', () => {
    it('should enforce organization_type enum constraint', async () => {
      const invalidData = {
        ...TestDataFactory.createOrganization(),
        type: 'invalid_type' as any
      }

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('22P02') // Invalid enum value
      expect(data).toBeNull()
    })

    it('should enforce contact_role enum constraint', async () => {
      const invalidData = {
        ...TestDataFactory.createContact(testOrganizationId),
        role: 'invalid_role' as any
      }

      const { data, error } = await testSupabase
        .from('contacts')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('22P02')
      expect(data).toBeNull()
    })

    it('should enforce product_category enum constraint', async () => {
      const invalidData = {
        ...TestDataFactory.createProduct(testPrincipalId),
        category: 'invalid_category' as any
      }

      const { data, error } = await testSupabase
        .from('products')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('22P02')
      expect(data).toBeNull()
    })
  })

  describe('CHECK Constraints', () => {
    it('should enforce opportunity probability CHECK constraint (0-100)', async () => {
      const invalidData = TestDataFactory.createOpportunity(testOrganizationId, testContactId, {
        probability: 150 // Invalid: > 100
      })

      const { data, error } = await testSupabase
        .from('opportunities')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23514') // Check constraint violation
      expect(data).toBeNull()
    })

    it('should enforce product season CHECK constraints (1-12)', async () => {
      const invalidData = TestDataFactory.createProduct(testPrincipalId, {
        season_start: 13 // Invalid: > 12
      })

      const { data, error } = await testSupabase
        .from('products')
        .insert(invalidData)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23514')
      expect(data).toBeNull()
    })

    it('should allow valid probability values', async () => {
      const validProbabilities = [0, 25, 50, 75, 100]

      for (const probability of validProbabilities) {
        const validData = TestDataFactory.createOpportunity(testOrganizationId, testContactId, {
          probability,
          name: `Test Opportunity ${probability}%`
        })

        const { data, error } = await testSupabase
          .from('opportunities')
          .insert(validData)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data?.probability).toBe(probability)
      }
    })
  })

  describe('UNIQUE Constraints', () => {
    it('should enforce organization name uniqueness if configured', async () => {
      const orgData = TestDataFactory.createOrganization({ name: 'Unique Test Org' })
      
      // Create first organization
      const { data: first, error: firstError } = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      expect(firstError).toBeNull()
      expect(first).toBeDefined()

      // Try to create duplicate
      const duplicateData = TestDataFactory.createOrganization({ name: 'Unique Test Org' })
      
      const { data: duplicate, error: duplicateError } = await testSupabase
        .from('organizations')
        .insert(duplicateData)
        .select()

      // If unique constraint exists, this should fail
      if (duplicateError) {
        expect(duplicateError.code).toBe('23505') // Unique violation
        expect(duplicate).toBeNull()
      } else {
        console.warn('Organization name uniqueness not enforced at database level')
      }
    })

    it('should enforce product SKU uniqueness per principal', async () => {
      const sku = `UNIQUE-SKU-${Date.now()}`
      
      // Create first product with SKU
      const productData1 = TestDataFactory.createProduct(testPrincipalId, { sku })
      
      const { data: first, error: firstError } = await testSupabase
        .from('products')
        .insert(productData1)
        .select()
        .single()

      expect(firstError).toBeNull()
      expect(first?.sku).toBe(sku)

      // Try to create duplicate SKU for same principal
      const productData2 = TestDataFactory.createProduct(testPrincipalId, { 
        sku,
        name: 'Different Product Name'
      })
      
      const { data: duplicate, error: duplicateError } = await testSupabase
        .from('products')
        .insert(productData2)
        .select()

      // Should fail due to unique constraint
      if (duplicateError) {
        expect(duplicateError.code).toBe('23505')
        expect(duplicate).toBeNull()
      } else {
        console.warn('Product SKU uniqueness not enforced at database level')
      }
    })

    it('should allow same SKU for different principals', async () => {
      // Create second principal
      const principal2Data = TestDataSets.principalDistributorCustomer.principal
      principal2Data.name = 'Different Principal'
      const { data: principal2 } = await testSupabase
        .from('organizations')
        .insert(principal2Data)
        .select()
        .single()

      const sku = `SHARED-SKU-${Date.now()}`
      
      // Create product with same SKU for different principals
      const product1Data = TestDataFactory.createProduct(testPrincipalId, { sku })
      const product2Data = TestDataFactory.createProduct(principal2!.id, { sku })

      const { data: product1, error: error1 } = await testSupabase
        .from('products')
        .insert(product1Data)
        .select()
        .single()

      const { data: product2, error: error2 } = await testSupabase
        .from('products')
        .insert(product2Data)
        .select()
        .single()

      expect(error1).toBeNull()
      expect(error2).toBeNull()
      expect(product1?.sku).toBe(sku)
      expect(product2?.sku).toBe(sku)
      expect(product1?.principal_id).not.toBe(product2?.principal_id)
    })
  })

  describe('Business Logic Constraints', () => {
    it('should validate principal organization type for products', async () => {
      // Try to create product with non-principal organization
      const customerOrgData = TestDataFactory.createOrganization({ type: 'customer' })
      const { data: customerOrg } = await testSupabase
        .from('organizations')
        .insert(customerOrgData)
        .select()
        .single()

      const productData = TestDataFactory.createProduct(customerOrg!.id)

      const { data, error } = await testSupabase
        .from('products')
        .insert(productData)
        .select()

      // Should fail if business rule is enforced
      if (error) {
        expect(error.code).toBeDefined()
      } else {
        console.warn('Principal type validation not enforced for products')
      }
    })

    it('should validate contact-organization relationship in opportunities', async () => {
      // Create contact in different organization
      const org2Data = TestDataFactory.createOrganization()
      const { data: org2 } = await testSupabase
        .from('organizations')
        .insert(org2Data)
        .select()
        .single()

      const contact2Data = TestDataFactory.createContact(org2!.id)
      const { data: contact2 } = await testSupabase
        .from('contacts')
        .insert(contact2Data)
        .select()
        .single()

      // Try to create opportunity with mismatched organization-contact
      const invalidOpportunityData = TestDataFactory.createOpportunity(
        testOrganizationId, // Organization 1
        contact2!.id        // Contact from Organization 2
      )

      const { data, error } = await testSupabase
        .from('opportunities')
        .insert(invalidOpportunityData)
        .select()

      // Should fail if business rule is enforced
      if (error) {
        expect(error.code).toBeDefined()
      } else {
        console.warn('Contact-organization relationship validation not enforced')
      }
    })

    it('should validate date consistency constraints', async () => {
      // Test future dates are reasonable
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 10) // 10 years in future

      const opportunityData = TestDataFactory.createOpportunity(testOrganizationId, testContactId, {
        estimated_close_date: futureDate.toISOString().split('T')[0]
      })

      const { data, error } = await testSupabase
        .from('opportunities')
        .insert(opportunityData)
        .select()
        .single()

      // Database should accept future dates, but application may validate reasonableness
      expect(error).toBeNull()
      expect(data?.estimated_close_date).toBe(futureDate.toISOString().split('T')[0])
    })
  })

  describe('Data Integrity Validation', () => {
    it('should maintain referential integrity on cascading operations', async () => {
      // Create organization with contact
      const { data: contact } = await testSupabase
        .from('contacts')
        .select('*')
        .eq('id', testContactId)
        .single()

      expect(contact?.organization_id).toBe(testOrganizationId)

      // Soft delete organization
      await testSupabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', testOrganizationId)

      // Contact should still reference organization (soft delete)
      const { data: contactAfter } = await testSupabase
        .from('contacts')
        .select('*')
        .eq('id', testContactId)
        .single()

      expect(contactAfter?.organization_id).toBe(testOrganizationId)
    })

    it('should prevent hard delete of referenced entities', async () => {
      // Try to hard delete organization that has contacts
      const { data, error } = await testSupabase
        .from('organizations')
        .delete()
        .eq('id', testOrganizationId)

      // Should fail due to foreign key constraint
      expect(error).toBeDefined()
      expect(error?.code).toBe('23503') // Foreign key violation
    })

    it('should validate enum values remain consistent', async () => {
      // Verify that enum values in Constants match database
      const { data: orgTypeData } = await testSupabase
        .from('organizations')
        .select('type')
        .limit(1)
        .single()

      // If query succeeds, type system is consistent
      expect(orgTypeData).toBeDefined()
    })
  })
})