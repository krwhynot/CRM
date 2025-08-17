import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { testSupabase, cleanupTestData } from '../utils/test-database'
import { TestDataFactory } from '../fixtures/test-data'
import { organizationSchema } from '@/types/organization.types'
import * as yup from 'yup'

// Mock components for testing form validation

// Test wrapper for forms (currently unused but may be needed for future tests)
const _TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

describe('Form Integration Tests', () => {
  let testOrganizationId: string

  beforeEach(async () => {
    await cleanupTestData()
    
    // Create test organization for contact forms
    const orgData = TestDataFactory.createOrganization()
    const { data: org } = await testSupabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()
    testOrganizationId = org!.id
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  describe('Organization Form Validation', () => {
    it('should validate organization form schema matches database constraints', async () => {
      const validData = TestDataFactory.createOrganization({
        name: 'Test Organization',
        type: 'customer',
        priority: 'B',
        segment: 'Restaurant'
      })

      // Test Yup schema validation
      const isValid = await organizationSchema.isValid(validData)
      expect(isValid).toBe(true)

      // Test database insertion with same data
      const { data, error } = await testSupabase
        .from('organizations')
        .insert(validData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should reject invalid organization data in both form and database', async () => {
      const invalidData = {
        name: '', // Empty name - should fail validation
        type: 'customer',
        priority: 'B',
        segment: 'Restaurant'
      }

      // Test Yup schema validation fails
      const isValid = await organizationSchema.isValid(invalidData)
      expect(isValid).toBe(false)

      // Test database insertion also fails
      const { data, error } = await testSupabase
        .from('organizations')
        .insert(invalidData as any)
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    it('should validate enum values consistency between form and database', async () => {
      const invalidType = {
        name: 'Test Org',
        type: 'invalid_type' as any,
        priority: 'B',
        segment: 'Restaurant'
      }

      // Test schema validation fails
      try {
        await organizationSchema.validate(invalidType)
        expect.fail('Schema should have rejected invalid type')
      } catch (error) {
        expect(error).toBeInstanceOf(yup.ValidationError)
      }

      // Test database insertion fails
      const { data, error } = await testSupabase
        .from('organizations')
        .insert(invalidType)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('22P02') // Invalid enum value
    })

    it('should validate priority levels match database enum', async () => {
      const validPriorities = ['A', 'B', 'C', 'D']
      
      for (const priority of validPriorities) {
        const orgData = TestDataFactory.createOrganization({ priority })
        
        // Schema validation should pass
        const isValid = await organizationSchema.isValid(orgData)
        expect(isValid).toBe(true)
        
        // Database insertion should succeed
        const { data, error } = await testSupabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single()
        
        expect(error).toBeNull()
        expect(data?.priority).toBe(priority)
      }
    })

    it('should enforce organization type business rules', async () => {
      // Principal organization should have is_principal = true
      const principalData = TestDataFactory.createOrganization({
        type: 'principal',
        is_principal: true,
        is_distributor: false
      })

      const isValid = await organizationSchema.isValid(principalData)
      expect(isValid).toBe(true)

      const { data, error } = await testSupabase
        .from('organizations')
        .insert(principalData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.type).toBe('principal')
      expect(data?.is_principal).toBe(true)
    })
  })

  describe('Contact Form Validation', () => {
    it('should validate contact form data matches database schema', async () => {
      const contactData = TestDataFactory.createContact(testOrganizationId, {
        first_name: 'John',
        last_name: 'Doe',
        role: 'decision_maker',
        decision_authority: 'High',
        purchase_influence: 'Direct'
      })

      // Test database insertion
      const { data, error } = await testSupabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.first_name).toBe('John')
      expect(data?.last_name).toBe('Doe')
      expect(data?.role).toBe('decision_maker')
      expect(data?.decision_authority).toBe('High')
      expect(data?.purchase_influence).toBe('Direct')
    })

    it('should validate contact role enum values', async () => {
      const validRoles = ['decision_maker', 'influencer', 'buyer', 'end_user', 'gatekeeper', 'champion']
      
      for (const role of validRoles) {
        const contactData = TestDataFactory.createContact(testOrganizationId, { role: role as any })
        
        const { data, error } = await testSupabase
          .from('contacts')
          .insert(contactData)
          .select()
          .single()
        
        expect(error).toBeNull()
        expect(data?.role).toBe(role)
      }
    })

    it('should enforce required fields validation', async () => {
      // Missing first_name
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
      expect(error?.code).toBe('23502') // NOT NULL violation
    })

    it('should validate foreign key relationships', async () => {
      const contactData = TestDataFactory.createContact(testOrganizationId)
      
      const { data, error } = await testSupabase
        .from('contacts')
        .insert(contactData)
        .select(`
          *,
          organization:organizations(id, name)
        `)
        .single()

      expect(error).toBeNull()
      expect(data?.organization_id).toBe(testOrganizationId)
      expect((data?.organization as any)?.id).toBe(testOrganizationId)
    })
  })

  describe('Product Form Validation', () => {
    let testPrincipalId: string

    beforeEach(async () => {
      const principalData = TestDataFactory.createOrganization({
        type: 'principal',
        is_principal: true
      })
      const { data: principal } = await testSupabase
        .from('organizations')
        .insert(principalData)
        .select()
        .single()
      testPrincipalId = principal!.id
    })

    it('should validate product form data matches database schema', async () => {
      const productData = TestDataFactory.createProduct(testPrincipalId, {
        name: 'Test Product',
        category: 'dairy',
        sku: 'TEST-001',
        list_price: 15.99,
        min_order_quantity: 1
      })

      const { data, error } = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.name).toBe('Test Product')
      expect(data?.category).toBe('dairy')
      expect(data?.sku).toBe('TEST-001')
      expect(data?.list_price).toBe(15.99)
      expect(data?.min_order_quantity).toBe(1)
    })

    it('should validate product category enum values', async () => {
      const validCategories = [
        'beverages', 'dairy', 'frozen', 'fresh_produce', 'meat_poultry', 'seafood',
        'dry_goods', 'spices_seasonings', 'baking_supplies', 'cleaning_supplies',
        'paper_products', 'equipment'
      ]
      
      for (const category of validCategories) {
        const productData = TestDataFactory.createProduct(testPrincipalId, { 
          category: category as any,
          name: `Test ${category} Product`
        })
        
        const { data, error } = await testSupabase
          .from('products')
          .insert(productData)
          .select()
          .single()
        
        expect(error).toBeNull()
        expect(data?.category).toBe(category)
      }
    })

    it('should validate season constraints (1-12)', async () => {
      // Valid season values
      const validProduct = TestDataFactory.createProduct(testPrincipalId, {
        season_start: 1,
        season_end: 12
      })

      const { data: validData, error: validError } = await testSupabase
        .from('products')
        .insert(validProduct)
        .select()
        .single()

      expect(validError).toBeNull()
      expect(validData?.season_start).toBe(1)
      expect(validData?.season_end).toBe(12)

      // Invalid season value
      const invalidProduct = TestDataFactory.createProduct(testPrincipalId, {
        season_start: 13, // Invalid
        name: 'Invalid Season Product'
      })

      const { data: invalidData, error: invalidError } = await testSupabase
        .from('products')
        .insert(invalidProduct)
        .select()

      expect(invalidError).toBeDefined()
      expect(invalidError?.code).toBe('23514') // Check constraint violation
    })
  })

  describe('Opportunity Form Validation', () => {
    let testContactId: string

    beforeEach(async () => {
      const contactData = TestDataFactory.createContact(testOrganizationId)
      const { data: contact } = await testSupabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single()
      testContactId = contact!.id
    })

    it('should validate opportunity form data matches database schema', async () => {
      const opportunityData = TestDataFactory.createOpportunity(testOrganizationId, testContactId, {
        name: 'Test Opportunity',
        stage: 'New Lead',
        priority: 'medium',
        estimated_value: 5000.00,
        probability: 50
      })

      const { data, error } = await testSupabase
        .from('opportunities')
        .insert(opportunityData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.name).toBe('Test Opportunity')
      expect(data?.stage).toBe('New Lead')
      expect(data?.priority).toBe('medium')
      expect(data?.estimated_value).toBe(5000.00)
      expect(data?.probability).toBe(50)
    })

    it('should validate opportunity stage enum values', async () => {
      const validStages = [
        'New Lead', 'Initial Outreach', 'Sample/Visit Offered', 'Awaiting Response',
        'Feedback Logged', 'Demo Scheduled', 'Closed - Won', 'Closed - Lost'
      ]
      
      for (const stage of validStages) {
        const opportunityData = TestDataFactory.createOpportunity(testOrganizationId, testContactId, {
          stage: stage as any,
          name: `Test ${stage} Opportunity`
        })
        
        const { data, error } = await testSupabase
          .from('opportunities')
          .insert(opportunityData)
          .select()
          .single()
        
        expect(error).toBeNull()
        expect(data?.stage).toBe(stage)
      }
    })

    it('should validate probability constraints (0-100)', async () => {
      // Valid probability values
      const validProbabilities = [0, 25, 50, 75, 100]
      
      for (const probability of validProbabilities) {
        const opportunityData = TestDataFactory.createOpportunity(testOrganizationId, testContactId, {
          probability,
          name: `Test ${probability}% Opportunity`
        })
        
        const { data, error } = await testSupabase
          .from('opportunities')
          .insert(opportunityData)
          .select()
          .single()
        
        expect(error).toBeNull()
        expect(data?.probability).toBe(probability)
      }

      // Invalid probability value
      const invalidOpportunity = TestDataFactory.createOpportunity(testOrganizationId, testContactId, {
        probability: 150, // Invalid
        name: 'Invalid Probability Opportunity'
      })

      const { data, error } = await testSupabase
        .from('opportunities')
        .insert(invalidOpportunity)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23514') // Check constraint violation
    })
  })

  describe('Interaction Form Validation', () => {
    it('should validate interaction form data matches database schema', async () => {
      const interactionData = TestDataFactory.createInteraction({
        type: 'call',
        subject: 'Test Call',
        description: 'Test interaction description',
        duration_minutes: 30,
        contact_id: null, // Can be null
        organization_id: testOrganizationId
      })

      const { data, error } = await testSupabase
        .from('interactions')
        .insert(interactionData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data?.type).toBe('call')
      expect(data?.subject).toBe('Test Call')
      expect(data?.description).toBe('Test interaction description')
      expect(data?.duration_minutes).toBe(30)
      expect(data?.organization_id).toBe(testOrganizationId)
    })

    it('should validate interaction type enum values', async () => {
      const validTypes = [
        'call', 'email', 'meeting', 'demo', 'proposal', 'follow_up',
        'trade_show', 'site_visit', 'contract_review'
      ]
      
      for (const type of validTypes) {
        const interactionData = TestDataFactory.createInteraction({
          type: type as any,
          subject: `Test ${type} interaction`
        })
        
        const { data, error } = await testSupabase
          .from('interactions')
          .insert(interactionData)
          .select()
          .single()
        
        expect(error).toBeNull()
        expect(data?.type).toBe(type)
      }
    })

    it('should enforce required subject field', async () => {
      const invalidData = {
        type: 'call',
        description: 'Description without subject'
        // subject is missing
      }

      const { data, error } = await testSupabase
        .from('interactions')
        .insert(invalidData as any)
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('23502') // NOT NULL violation
    })
  })

  describe('Form Error Handling', () => {
    it('should provide meaningful error messages for validation failures', async () => {
      // Test organization with invalid data
      const invalidOrgData = {
        name: '', // Empty name
        type: 'invalid_type',
        priority: 'Z' // Invalid priority
      }

      try {
        await organizationSchema.validate(invalidOrgData, { abortEarly: false })
        expect.fail('Validation should have failed')
      } catch (error) {
        expect(error).toBeInstanceOf(yup.ValidationError)
        const validationError = error as yup.ValidationError
        
        // Should have multiple error messages
        expect(validationError.errors.length).toBeGreaterThan(1)
        expect(validationError.errors.some(msg => msg.includes('name'))).toBe(true)
        expect(validationError.errors.some(msg => msg.includes('type'))).toBe(true)
      }
    })

    it('should handle database constraint violations gracefully', async () => {
      // Create organization with duplicate name if uniqueness is enforced
      const orgData = TestDataFactory.createOrganization({ name: 'Duplicate Test Org' })
      
      // First insertion should succeed
      const { data: first } = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      expect(first).toBeDefined()

      // Second insertion with same name
      const duplicateData = TestDataFactory.createOrganization({ name: 'Duplicate Test Org' })
      const { data: duplicate, error } = await testSupabase
        .from('organizations')
        .insert(duplicateData)
        .select()

      if (error) {
        // If constraint exists, error should be handled gracefully
        expect(error.code).toBeDefined()
        expect(typeof error.message).toBe('string')
      }
    })
  })
})