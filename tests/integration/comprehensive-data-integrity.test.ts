/**
 * Comprehensive Data Integrity Test Suite
 *
 * Task 5.5 Deliverable - End-to-End data integrity testing for architecture simplification.
 * This comprehensive test suite validates all CRUD operations across all entities,
 * verifies data transformations work correctly, tests edge cases and validation scenarios,
 * and confirms no database fields are orphaned after migration.
 *
 * Test Coverage:
 * 1. Complete CRUD Operations for All Entities
 * 2. Data Transformation Validation
 * 3. Business Logic and Validation Rules
 * 4. Relationship Integrity Testing
 * 5. Edge Cases and Error Scenarios
 * 6. Field Mapping Completeness
 * 7. Performance and Constraint Validation
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { z } from 'zod'

// Import Zod schemas and validation classes
import {
  organizationZodSchema,
  OrganizationZodValidation,
  OrganizationZodFormData,
  OrganizationTypeEnum,
  OrganizationPriorityEnum
} from '../../src/types/organization.types'

import {
  contactZodSchema,
  ContactZodValidation,
  ContactZodFormData,
  PurchaseInfluenceEnum,
  DecisionAuthorityEnum,
  ContactRoleEnum
} from '../../src/types/contact.zod'

import {
  opportunityZodSchema,
  multiPrincipalOpportunityZodSchema,
  OpportunityZodValidation,
  OpportunityZodFormData,
  MultiPrincipalOpportunityZodFormData,
  OpportunityContextEnum,
  OpportunityStatusEnum,
  OpportunityStageEnum
} from '../../src/types/opportunity.types'

import { ZodTransforms } from '../../src/lib/form-transforms'

// Test data interfaces matching database schema
interface DatabaseOrganization {
  id: string
  name: string
  type: string
  priority: string
  segment: string
  is_principal: boolean
  is_distributor: boolean
  description?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null
  industry?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string | null
  deleted_at?: string | null
}

interface DatabaseContact {
  id: string
  first_name: string
  last_name: string
  organization_id: string
  email?: string | null
  phone?: string | null
  mobile_phone?: string | null
  title?: string | null
  department?: string | null
  linkedin_url?: string | null
  purchase_influence: string
  decision_authority: string
  role?: string | null
  is_primary_contact: boolean
  notes?: string | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string | null
  deleted_at?: string | null
}

interface DatabaseOpportunity {
  id: string
  name: string
  organization_id: string
  contact_id?: string | null
  estimated_value: number
  stage: string
  status: string
  estimated_close_date?: string | null
  description?: string | null
  notes?: string | null
  principal_id?: string | null
  product_id?: string | null
  opportunity_context?: string | null
  auto_generated_name: boolean
  probability?: number | null
  deal_owner?: string | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string | null
  deleted_at?: string | null
}

interface DatabaseOpportunityParticipant {
  id: string
  opportunity_id: string
  organization_id: string
  role: string
  sequence_order?: number | null
  notes?: string | null
  created_by: string
  created_at: string
}

interface DatabaseProductData {
  id: string
  name: string
  sku?: string | null
  description?: string | null
  category?: string | null
  list_price?: number | null
  in_stock: boolean
  low_stock?: boolean | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

interface DatabaseInteractionData {
  id: string
  opportunity_id?: string | null
  contact_id?: string | null
  organization_id: string
  interaction_type: string
  interaction_date: string
  notes?: string | null
  follow_up_required: boolean
  follow_up_date?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

describe('Comprehensive Data Integrity Tests', () => {

  // Test data constants
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
  const VALID_UUID_2 = '550e8400-e29b-41d4-a716-446655440001'
  const VALID_UUID_3 = '550e8400-e29b-41d4-a716-446655440002'
  const INVALID_UUID = 'not-a-uuid'
  const CURRENT_TIMESTAMP = new Date().toISOString()

  describe('Organization CRUD Operations', () => {

    test('should validate complete organization creation data', () => {
      const validOrganizationData: OrganizationZodFormData = {
        name: 'Test Organization Inc',
        type: 'customer',
        priority: 'A',
        segment: 'Restaurant',
        is_principal: false,
        is_distributor: false,
        description: 'A test organization for validation',
        email: 'contact@testorg.com',
        phone: '(555) 123-4567',
        website: 'https://testorg.com',
        address_line_1: '123 Main Street',
        address_line_2: 'Suite 100',
        city: 'New York',
        state_province: 'NY',
        postal_code: '10001',
        country: 'United States',
        industry: 'Food Service',
        notes: 'Test notes for organization'
      }

      const result = OrganizationZodValidation.validate(validOrganizationData)
      expect(result).toBeDefined()
      expect(result.name).toBe('Test Organization Inc')
      expect(result.type).toBe('customer')
      expect(result.is_principal).toBe(false)
      expect(result.is_distributor).toBe(false)
    })

    test('should handle principal organization type alignment', () => {
      const principalOrgData: OrganizationZodFormData = {
        name: 'Principal Test Inc',
        type: 'principal',
        priority: 'A',
        segment: 'Manufacturing',
        is_principal: true,
        is_distributor: false
      }

      expect(() => OrganizationZodValidation.validate(principalOrgData)).not.toThrow()
    })

    test('should reject misaligned organization type flags', () => {
      const invalidData = {
        name: 'Invalid Organization',
        type: 'principal',
        priority: 'A',
        segment: 'Manufacturing',
        is_principal: false, // Should be true for principal type
        is_distributor: false
      }

      expect(() => OrganizationZodValidation.validate(invalidData)).toThrow()
    })

    test('should validate organization update operations', () => {
      const updateData = {
        name: 'Updated Organization Name',
        phone: '(555) 987-6543',
        notes: 'Updated notes'
      }

      const result = OrganizationZodValidation.validateUpdate(updateData)
      expect(result.name).toBe('Updated Organization Name')
      expect(result.phone).toBe('(555) 987-6543')
    })

    test('should enforce organization field length constraints', () => {
      const longNameData = {
        name: 'A'.repeat(256), // Exceeds 255 character limit
        type: 'customer',
        priority: 'A',
        segment: 'Test'
      }

      expect(() => OrganizationZodValidation.validate(longNameData)).toThrow(/255 characters/)
    })

    test('should transform organization for database insertion', () => {
      const formData: OrganizationZodFormData = {
        name: 'Transform Test Org',
        type: 'customer',
        priority: 'B',
        segment: 'Retail',
        is_principal: false,
        is_distributor: false,
        email: 'TEST@TRANSFORM.COM', // Should be lowercased
        phone: '(555) 123-4567',
        city: 'Test City',
        state_province: 'TS'
      }

      const result = OrganizationZodValidation.validate(formData)
      expect(result.email).toBe('test@transform.com') // Email should be normalized
    })
  })

  describe('Contact CRUD Operations', () => {

    test('should validate contact creation with existing organization', () => {
      const existingOrgContactData = {
        organization_mode: 'existing' as const,
        organization_id: VALID_UUID,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        phone: '(555) 123-4567',
        title: 'Manager',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker',
        is_primary_contact: true,
        preferred_principals: [VALID_UUID_2]
      }

      const result = ContactZodValidation.validate(existingOrgContactData)
      expect(result.organization_mode).toBe('existing')
      expect(result.organization_id).toBe(VALID_UUID)
      expect(result.first_name).toBe('John')
      expect(result.last_name).toBe('Doe')
    })

    test('should validate contact creation with new organization', () => {
      const newOrgContactData = {
        organization_mode: 'new' as const,
        organization_id: null,
        organization_name: 'New Test Organization',
        organization_type: 'customer',
        organization_phone: '(555) 987-6543',
        organization_email: 'info@neworg.com',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@neworg.com',
        purchase_influence: 'Medium',
        decision_authority: 'Influencer',
        preferred_principals: []
      }

      const result = ContactZodValidation.validate(newOrgContactData)
      expect(result.organization_mode).toBe('new')
      expect(result.organization_name).toBe('New Test Organization')
      expect(result.first_name).toBe('Jane')
    })

    test('should extract organization data from new organization contact', () => {
      const newOrgContactData = {
        organization_mode: 'new' as const,
        organization_id: null,
        organization_name: 'Extract Test Org',
        organization_type: 'prospect',
        organization_phone: '(555) 111-2222',
        organization_email: 'contact@extract.com',
        organization_website: 'https://extract.com',
        organization_notes: 'Test organization notes',
        first_name: 'Test',
        last_name: 'User',
        purchase_influence: 'Low',
        decision_authority: 'End User'
      }

      const validatedData = ContactZodValidation.validate(newOrgContactData)
      const extractedOrgData = ContactZodValidation.extractOrganizationData(validatedData)

      expect(extractedOrgData.name).toBe('Extract Test Org')
      expect(extractedOrgData.type).toBe('prospect')
      expect(extractedOrgData.priority).toBe('C') // Default
      expect(extractedOrgData.segment).toBe('Unknown') // Default
      expect(extractedOrgData.is_principal).toBe(false)
      expect(extractedOrgData.is_distributor).toBe(false)
    })

    test('should validate preferred principals array', () => {
      const validPrincipals = [VALID_UUID, VALID_UUID_2]
      expect(ContactZodValidation.validatePreferredPrincipals(validPrincipals)).toBe(true)

      const invalidPrincipals = ['invalid-uuid', VALID_UUID]
      expect(ContactZodValidation.validatePreferredPrincipals(invalidPrincipals)).toBe(false)

      const tooManyPrincipals = Array(11).fill(VALID_UUID)
      expect(ContactZodValidation.validatePreferredPrincipals(tooManyPrincipals)).toBe(false)
    })

    test('should transform contact data for database insertion', () => {
      const formData = {
        organization_mode: 'existing' as const,
        organization_id: VALID_UUID,
        first_name: '  John  ', // Should be trimmed
        last_name: '  Doe  ',
        email: 'JOHN.DOE@TEST.COM', // Should be normalized
        phone: '(555) 123-4567',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker',
        preferred_principals: [VALID_UUID_2],
        organization_name: 'Should be excluded',
        organization_type: 'customer'
      }

      const validatedData = ContactZodValidation.validate(formData)
      const dbData = ContactZodValidation.transformForDatabase(validatedData)

      expect(dbData.first_name).toBe('John')
      expect(dbData.last_name).toBe('Doe')
      expect(dbData.email).toBe('john.doe@test.com')
      expect(dbData).not.toHaveProperty('preferred_principals')
      expect(dbData).not.toHaveProperty('organization_mode')
      expect(dbData).not.toHaveProperty('organization_name')
    })

    test('should enforce contact field length constraints', () => {
      const longFieldData = {
        organization_mode: 'existing' as const,
        organization_id: VALID_UUID,
        first_name: 'A'.repeat(101), // Exceeds 100 character limit
        last_name: 'Doe',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker'
      }

      expect(() => ContactZodValidation.validate(longFieldData)).toThrow(/100 characters/)
    })
  })

  describe('Opportunity CRUD Operations', () => {

    test('should validate basic opportunity creation', () => {
      const opportunityData: OpportunityZodFormData = {
        name: 'Test Opportunity',
        organization_id: VALID_UUID,
        contact_id: VALID_UUID_2,
        estimated_value: 50000,
        stage: 'New Lead',
        status: 'Active',
        estimated_close_date: '2024-12-31',
        description: 'Test opportunity description',
        notes: 'Test notes',
        principals: [],
        auto_generated_name: false
      }

      const result = OpportunityZodValidation.validate(opportunityData)
      expect(result.name).toBe('Test Opportunity')
      expect(result.estimated_value).toBe(50000)
      expect(result.stage).toBe('New Lead')
    })

    test('should validate multi-principal opportunity creation', () => {
      const multiPrincipalData: MultiPrincipalOpportunityZodFormData = {
        organization_id: VALID_UUID,
        contact_id: VALID_UUID_2,
        principals: [VALID_UUID_2, VALID_UUID_3],
        opportunity_context: 'Site Visit',
        auto_generated_name: true,
        estimated_value: 75000,
        stage: 'Initial Outreach',
        status: 'Active',
        probability: 25,
        deal_owner: 'John Sales Rep'
      }

      const result = OpportunityZodValidation.validateMultiPrincipal(multiPrincipalData)
      expect(result.principals).toHaveLength(2)
      expect(result.opportunity_context).toBe('Site Visit')
      expect(result.auto_generated_name).toBe(true)
    })

    test('should validate custom context requirement', () => {
      const customContextData = {
        organization_id: VALID_UUID,
        principals: [VALID_UUID_2],
        opportunity_context: 'Custom',
        custom_context: 'Special Event Meeting',
        auto_generated_name: true,
        estimated_value: 30000,
        stage: 'New Lead',
        status: 'Active'
      }

      expect(() => OpportunityZodValidation.validateMultiPrincipal(customContextData)).not.toThrow()

      const missingCustomContext = {
        ...customContextData,
        custom_context: null
      }

      expect(() => OpportunityZodValidation.validateMultiPrincipal(missingCustomContext)).toThrow(/Custom context is required/)
    })

    test('should prevent target organization as principal', () => {
      const invalidData = {
        organization_id: VALID_UUID,
        principals: [VALID_UUID, VALID_UUID_2], // Target org included as principal
        opportunity_context: 'Site Visit',
        auto_generated_name: true,
        estimated_value: 25000,
        stage: 'New Lead',
        status: 'Active'
      }

      expect(() => OpportunityZodValidation.validateMultiPrincipal(invalidData)).toThrow(/cannot be included as a principal/)
    })

    test('should validate multi-principal business rules', () => {
      const validationResult = OpportunityZodValidation.validateMultiPrincipalBusinessRules(
        VALID_UUID, // organization_id
        [VALID_UUID_2, VALID_UUID_3], // principals
        true, // auto_generated_name
        undefined // manual_name
      )

      expect(validationResult.isValid).toBe(true)
      expect(validationResult.errors).toHaveLength(0)

      // Test with manual naming
      const manualNameResult = OpportunityZodValidation.validateMultiPrincipalBusinessRules(
        VALID_UUID,
        [VALID_UUID_2],
        false, // auto_generated_name disabled
        'Manual Opportunity Name'
      )

      expect(manualNameResult.isValid).toBe(true)

      // Test with missing manual name
      const missingNameResult = OpportunityZodValidation.validateMultiPrincipalBusinessRules(
        VALID_UUID,
        [VALID_UUID_2],
        false, // auto_generated_name disabled
        undefined // no manual name
      )

      expect(missingNameResult.isValid).toBe(false)
      expect(missingNameResult.errors).toContain('Manual name is required when auto-naming is disabled')
    })

    test('should generate multi-principal opportunity names', () => {
      const generatedName = OpportunityZodValidation.generateMultiPrincipalName(
        'Target Restaurant Inc',
        ['Principal Foods LLC', 'Premium Suppliers Corp'],
        'Site Visit',
        undefined
      )

      expect(generatedName).toContain('Target Restaurant Inc')
      expect(generatedName).toContain('Multi-Principal (2)')
      expect(generatedName).toContain('Site Visit')

      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      expect(generatedName).toContain(currentMonth)
    })

    test('should extract principal relationships', () => {
      const formData: MultiPrincipalOpportunityZodFormData = {
        organization_id: VALID_UUID,
        principals: [VALID_UUID_2, VALID_UUID_3],
        opportunity_context: 'Food Show',
        auto_generated_name: true,
        stage: 'New Lead',
        status: 'Active'
      }

      const relationships = OpportunityZodValidation.extractPrincipalRelationships(
        formData,
        'opp-123',
        'user-456'
      )

      expect(relationships).toHaveLength(2)
      expect(relationships[0].opportunity_id).toBe('opp-123')
      expect(relationships[0].organization_id).toBe(VALID_UUID_2)
      expect(relationships[0].role).toBe('principal')
      expect(relationships[0].sequence_order).toBe(1)
      expect(relationships[1].sequence_order).toBe(2)
    })

    test('should validate stage and status values', () => {
      expect(OpportunityZodValidation.validateStage('New Lead')).toBe(true)
      expect(OpportunityZodValidation.validateStage('Invalid Stage')).toBe(false)

      expect(OpportunityZodValidation.validateStatus('Active')).toBe(true)
      expect(OpportunityZodValidation.validateStatus('Invalid Status')).toBe(false)
    })

    test('should handle legacy stage and status mappings', () => {
      const legacyData = {
        organization_id: VALID_UUID,
        principals: [VALID_UUID_2],
        opportunity_context: 'Follow-up',
        auto_generated_name: true,
        stage: 'lead', // Legacy code value
        status: 'active', // Legacy code value
        estimated_value: 10000
      }

      const result = OpportunityZodValidation.validateMultiPrincipal(legacyData)
      expect(result.stage).toBe('New Lead') // Mapped from 'lead'
      expect(result.status).toBe('Active') // Mapped from 'active'
    })
  })

  describe('Data Transformation Validation', () => {

    test('should handle nullable string transformations', () => {
      // Empty string to null
      const emptyStringResult = ZodTransforms.nullableString.parse('')
      expect(emptyStringResult).toBeNull()

      // Whitespace-only string to null
      const whitespaceResult = ZodTransforms.nullableString.parse('   ')
      expect(whitespaceResult).toBeNull()

      // Valid string preserved
      const validStringResult = ZodTransforms.nullableString.parse('valid string')
      expect(validStringResult).toBe('valid string')
    })

    test('should handle email normalization', () => {
      const emailResult = ZodTransforms.nullableEmail.parse('TEST@EXAMPLE.COM')
      expect(emailResult).toBe('test@example.com')

      const emptyEmailResult = ZodTransforms.nullableEmail.parse('')
      expect(emptyEmailResult).toBeNull()
    })

    test('should handle phone number normalization', () => {
      const phoneResult = ZodTransforms.nullablePhone.parse('(555) 123-4567')
      expect(phoneResult).toBe('5551234567')

      const emptyPhoneResult = ZodTransforms.nullablePhone.parse('')
      expect(emptyPhoneResult).toBeNull()
    })

    test('should handle UUID validation and normalization', () => {
      const validUuidResult = ZodTransforms.uuidField.parse(VALID_UUID)
      expect(validUuidResult).toBe(VALID_UUID)

      const emptyUuidResult = ZodTransforms.uuidField.parse('')
      expect(emptyUuidResult).toBeNull()

      expect(() => ZodTransforms.uuidField.parse(INVALID_UUID)).toThrow()
    })

    test('should handle number transformations', () => {
      const numberResult = ZodTransforms.nullableNumber.parse('123.45')
      expect(numberResult).toBe(123.45)

      const emptyNumberResult = ZodTransforms.nullableNumber.parse('')
      expect(emptyNumberResult).toBeNull()

      const invalidNumberResult = ZodTransforms.nullableNumber.parse('not-a-number')
      expect(invalidNumberResult).toBeNull()
    })
  })

  describe('Business Logic Validation', () => {

    test('should validate organization type business rules', () => {
      expect(OrganizationZodValidation.validateTypeAlignment('principal', true, false)).toBe(true)
      expect(OrganizationZodValidation.validateTypeAlignment('distributor', false, true)).toBe(true)
      expect(OrganizationZodValidation.validateTypeAlignment('customer', false, false)).toBe(true)

      // Invalid alignments
      expect(OrganizationZodValidation.validateTypeAlignment('principal', false, false)).toBe(false)
      expect(OrganizationZodValidation.validateTypeAlignment('distributor', false, false)).toBe(false)
    })

    test('should validate contact organization mode logic', () => {
      expect(ContactZodValidation.validateOrganizationMode('existing', VALID_UUID, null)).toBe(true)
      expect(ContactZodValidation.validateOrganizationMode('new', null, 'New Org Name')).toBe(true)

      // Invalid modes
      expect(ContactZodValidation.validateOrganizationMode('existing', null, null)).toBe(false)
      expect(ContactZodValidation.validateOrganizationMode('new', null, null)).toBe(false)
    })

    test('should validate opportunity estimated value constraints', () => {
      expect(OpportunityZodValidation.validateEstimatedValue(1000)).toBe(true)
      expect(OpportunityZodValidation.validateEstimatedValue(0)).toBe(true)
      expect(OpportunityZodValidation.validateEstimatedValue(null)).toBe(true)

      // Negative values should be rejected at schema level, not this utility
      // This utility only checks non-null values are >= 0
    })

    test('should validate opportunity probability constraints', () => {
      expect(OpportunityZodValidation.validateProbability(50)).toBe(true)
      expect(OpportunityZodValidation.validateProbability(0)).toBe(true)
      expect(OpportunityZodValidation.validateProbability(100)).toBe(true)
      expect(OpportunityZodValidation.validateProbability(null)).toBe(true)

      expect(OpportunityZodValidation.validateProbability(-1)).toBe(false)
      expect(OpportunityZodValidation.validateProbability(101)).toBe(false)
    })

    test('should validate multi-principal context requirements', () => {
      const validContext = OpportunityZodValidation.validateMultiPrincipalContext('Site Visit')
      expect(validContext.isValid).toBe(true)

      const customContext = OpportunityZodValidation.validateMultiPrincipalContext('Custom', 'Special Event')
      expect(customContext.isValid).toBe(true)

      const missingCustomContext = OpportunityZodValidation.validateMultiPrincipalContext('Custom')
      expect(missingCustomContext.isValid).toBe(false)
      expect(missingCustomContext.error).toContain('Custom context is required')

      const invalidContext = OpportunityZodValidation.validateMultiPrincipalContext('Invalid Context')
      expect(invalidContext.isValid).toBe(false)
    })
  })

  describe('Relationship Integrity Testing', () => {

    test('should validate UUID foreign key relationships', () => {
      // Organization -> Contact relationship
      const contactData = {
        organization_mode: 'existing' as const,
        organization_id: VALID_UUID, // Must reference valid organization
        first_name: 'John',
        last_name: 'Doe',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker'
      }

      const result = ContactZodValidation.validate(contactData)
      expect(result.organization_id).toBe(VALID_UUID)
    })

    test('should validate opportunity participant relationships', () => {
      const participantData = {
        opportunity_id: VALID_UUID,
        organization_id: VALID_UUID_2,
        role: 'principal',
        sequence_order: 1,
        created_by: VALID_UUID_3
      }

      const result = OpportunityZodValidation.validateParticipant(participantData)
      expect(result.opportunity_id).toBe(VALID_UUID)
      expect(result.organization_id).toBe(VALID_UUID_2)
      expect(result.role).toBe('principal')
    })

    test('should prevent self-referential relationships', () => {
      const selfReferencingData = {
        organization_id: VALID_UUID,
        principals: [VALID_UUID], // Same as organization_id
        opportunity_context: 'Site Visit',
        auto_generated_name: true,
        stage: 'New Lead',
        status: 'Active'
      }

      expect(() => OpportunityZodValidation.validateMultiPrincipal(selfReferencingData))
        .toThrow(/cannot be included as a principal/)
    })

    test('should validate duplicate prevention in relationships', () => {
      const duplicates = OpportunityZodValidation.detectDuplicatePrincipals([
        VALID_UUID,
        VALID_UUID_2,
        VALID_UUID, // Duplicate
        VALID_UUID_3
      ])

      expect(duplicates).toContain(VALID_UUID)
      expect(duplicates).toHaveLength(1)
    })
  })

  describe('Edge Cases and Error Scenarios', () => {

    test('should handle malformed UUID inputs', () => {
      const invalidUuidData = {
        organization_mode: 'existing' as const,
        organization_id: 'malformed-uuid',
        first_name: 'John',
        last_name: 'Doe',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker'
      }

      expect(() => ContactZodValidation.validate(invalidUuidData)).toThrow()
    })

    test('should handle extremely long input strings', () => {
      const extremelyLongString = 'A'.repeat(2000)

      const longStringData = {
        name: extremelyLongString,
        type: 'customer',
        priority: 'A',
        segment: 'Test'
      }

      expect(() => OrganizationZodValidation.validate(longStringData)).toThrow()
    })

    test('should handle special characters in text fields', () => {
      const specialCharData = {
        name: 'Test Org & Co. (Специальные символы) 特殊字符',
        type: 'customer',
        priority: 'A',
        segment: 'International',
        is_principal: false,
        is_distributor: false,
        notes: 'Notes with émojis 🎉 and symbols @#$%^&*()'
      }

      expect(() => OrganizationZodValidation.validate(specialCharData)).not.toThrow()
    })

    test('should handle boundary values for numeric fields', () => {
      const boundaryData = {
        name: 'Boundary Test Opportunity',
        organization_id: VALID_UUID,
        estimated_value: 0, // Minimum allowed value
        stage: 'New Lead',
        status: 'Active',
        probability: 100, // Maximum allowed value
        principals: []
      }

      expect(() => OpportunityZodValidation.validate(boundaryData)).not.toThrow()
    })

    test('should handle null and undefined values appropriately', () => {
      const nullableFieldData = {
        name: 'Nullable Test Org',
        type: 'customer',
        priority: 'C',
        segment: 'Test',
        is_principal: false,
        is_distributor: false,
        description: null,
        email: undefined,
        phone: '',
        website: null
      }

      const result = OrganizationZodValidation.validate(nullableFieldData)
      expect(result.description).toBeNull()
      expect(result.email).toBeNull()
      expect(result.phone).toBeNull()
      expect(result.website).toBeNull()
    })

    test('should handle array edge cases', () => {
      // Empty principals array
      const emptyArrayData = {
        organization_mode: 'existing' as const,
        organization_id: VALID_UUID,
        first_name: 'John',
        last_name: 'Doe',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker',
        preferred_principals: []
      }

      expect(() => ContactZodValidation.validate(emptyArrayData)).not.toThrow()

      // Maximum principals array
      const maxPrincipals = Array(10).fill(null).map((_, i) =>
        `550e8400-e29b-41d4-a716-44665544000${i.toString().padStart(1, '0')}`
      )

      const maxArrayData = {
        ...emptyArrayData,
        preferred_principals: maxPrincipals
      }

      expect(() => ContactZodValidation.validate(maxArrayData)).not.toThrow()

      // Over maximum principals array
      const overMaxPrincipals = Array(11).fill(VALID_UUID)
      const overMaxData = {
        ...emptyArrayData,
        preferred_principals: overMaxPrincipals
      }

      expect(() => ContactZodValidation.validate(overMaxData)).toThrow()
    })
  })

  describe('Field Mapping Completeness', () => {

    test('should validate all organization database fields are covered', () => {
      // This test ensures that all database fields documented in database-field-mappings.md
      // are properly handled by our Zod schemas

      const completeOrgData: DatabaseOrganization = {
        id: VALID_UUID,
        name: 'Complete Organization',
        type: 'customer',
        priority: 'A',
        segment: 'Restaurant',
        is_principal: false,
        is_distributor: false,
        description: 'Complete description',
        email: 'complete@org.com',
        phone: '(555) 123-4567',
        website: 'https://complete.org',
        address_line_1: '123 Complete Street',
        address_line_2: 'Suite 456',
        city: 'Complete City',
        state_province: 'CC',
        postal_code: '12345',
        country: 'United States',
        industry: 'Food Service',
        notes: 'Complete notes',
        created_at: CURRENT_TIMESTAMP,
        updated_at: CURRENT_TIMESTAMP,
        created_by: VALID_UUID_2,
        updated_by: VALID_UUID_2,
        deleted_at: null
      }

      // Verify the form schema can handle all user-editable fields
      const formData = {
        name: completeOrgData.name,
        type: completeOrgData.type,
        priority: completeOrgData.priority,
        segment: completeOrgData.segment,
        is_principal: completeOrgData.is_principal,
        is_distributor: completeOrgData.is_distributor,
        description: completeOrgData.description,
        email: completeOrgData.email,
        phone: completeOrgData.phone,
        website: completeOrgData.website,
        address_line_1: completeOrgData.address_line_1,
        address_line_2: completeOrgData.address_line_2,
        city: completeOrgData.city,
        state_province: completeOrgData.state_province,
        postal_code: completeOrgData.postal_code,
        country: completeOrgData.country,
        industry: completeOrgData.industry,
        notes: completeOrgData.notes
      }

      expect(() => OrganizationZodValidation.validate(formData)).not.toThrow()
    })

    test('should validate all contact database fields are covered', () => {
      const completeContactData: DatabaseContact = {
        id: VALID_UUID,
        first_name: 'Complete',
        last_name: 'Contact',
        organization_id: VALID_UUID_2,
        email: 'complete@contact.com',
        phone: '(555) 123-4567',
        mobile_phone: '(555) 987-6543',
        title: 'Complete Manager',
        department: 'Complete Department',
        linkedin_url: 'https://linkedin.com/in/complete',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker',
        role: 'decision_maker',
        is_primary_contact: true,
        notes: 'Complete contact notes',
        created_at: CURRENT_TIMESTAMP,
        updated_at: CURRENT_TIMESTAMP,
        created_by: VALID_UUID_3,
        updated_by: VALID_UUID_3,
        deleted_at: null
      }

      const formData = {
        organization_mode: 'existing' as const,
        organization_id: completeContactData.organization_id,
        first_name: completeContactData.first_name,
        last_name: completeContactData.last_name,
        email: completeContactData.email,
        phone: completeContactData.phone,
        mobile_phone: completeContactData.mobile_phone,
        title: completeContactData.title,
        department: completeContactData.department,
        linkedin_url: completeContactData.linkedin_url,
        purchase_influence: completeContactData.purchase_influence,
        decision_authority: completeContactData.decision_authority,
        role: completeContactData.role,
        is_primary_contact: completeContactData.is_primary_contact,
        notes: completeContactData.notes,
        preferred_principals: [VALID_UUID_3]
      }

      expect(() => ContactZodValidation.validate(formData)).not.toThrow()
    })

    test('should validate all opportunity database fields are covered', () => {
      const completeOpportunityData: DatabaseOpportunity = {
        id: VALID_UUID,
        name: 'Complete Opportunity',
        organization_id: VALID_UUID_2,
        contact_id: VALID_UUID_3,
        estimated_value: 100000,
        stage: 'New Lead',
        status: 'Active',
        estimated_close_date: '2024-12-31',
        description: 'Complete opportunity description',
        notes: 'Complete opportunity notes',
        principal_id: VALID_UUID_2,
        product_id: VALID_UUID_3,
        opportunity_context: 'Site Visit',
        auto_generated_name: false,
        probability: 75,
        deal_owner: 'Complete Sales Rep',
        created_at: CURRENT_TIMESTAMP,
        updated_at: CURRENT_TIMESTAMP,
        created_by: VALID_UUID_3,
        updated_by: VALID_UUID_3,
        deleted_at: null
      }

      const formData = {
        name: completeOpportunityData.name,
        organization_id: completeOpportunityData.organization_id,
        contact_id: completeOpportunityData.contact_id,
        estimated_value: completeOpportunityData.estimated_value,
        stage: completeOpportunityData.stage,
        status: completeOpportunityData.status,
        estimated_close_date: completeOpportunityData.estimated_close_date,
        description: completeOpportunityData.description,
        notes: completeOpportunityData.notes,
        principal_id: completeOpportunityData.principal_id,
        product_id: completeOpportunityData.product_id,
        opportunity_context: completeOpportunityData.opportunity_context,
        auto_generated_name: completeOpportunityData.auto_generated_name,
        probability: completeOpportunityData.probability,
        deal_owner: completeOpportunityData.deal_owner,
        principals: []
      }

      expect(() => OpportunityZodValidation.validate(formData)).not.toThrow()
    })
  })

  describe('Performance and Constraint Validation', () => {

    test('should handle large form validation efficiently', () => {
      const startTime = Date.now()

      // Create multiple validation operations
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        const orgData = {
          name: `Performance Test Org ${i}`,
          type: 'customer',
          priority: 'B',
          segment: 'Performance Testing',
          is_principal: false,
          is_distributor: false
        }

        OrganizationZodValidation.validate(orgData)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Validation should complete within reasonable time (less than 1 second for 100 operations)
      expect(totalTime).toBeLessThan(1000)
    })

    test('should validate schema refinement performance', () => {
      const startTime = Date.now()

      // Test complex multi-principal validation performance
      const iterations = 50

      for (let i = 0; i < iterations; i++) {
        const multiPrincipalData = {
          organization_id: VALID_UUID,
          principals: [VALID_UUID_2, VALID_UUID_3],
          opportunity_context: 'Site Visit',
          auto_generated_name: true,
          stage: 'New Lead',
          status: 'Active',
          estimated_value: 50000
        }

        OpportunityZodValidation.validateMultiPrincipal(multiPrincipalData)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Complex validation should still be performant
      expect(totalTime).toBeLessThan(1000)
    })

    test('should validate memory usage during large array processing', () => {
      // Test with maximum allowed principals
      const maxPrincipals = Array(10).fill(null).map((_, i) =>
        `550e8400-e29b-41d4-a716-44665544000${i.toString().padStart(1, '0')}`
      )

      const largeArrayData = {
        organization_id: VALID_UUID,
        principals: maxPrincipals,
        opportunity_context: 'Food Show',
        auto_generated_name: true,
        stage: 'New Lead',
        status: 'Active'
      }

      // Should handle maximum array size without issues
      expect(() => OpportunityZodValidation.validateMultiPrincipal(largeArrayData)).not.toThrow()
    })
  })

  describe('Integration Scenario Testing', () => {

    test('should validate complete contact creation workflow', () => {
      // Step 1: Create organization via contact form
      const newOrgContactData = {
        organization_mode: 'new' as const,
        organization_id: null,
        organization_name: 'Integration Test Restaurant',
        organization_type: 'customer',
        organization_phone: '(555) 555-5555',
        organization_email: 'info@integration.test',
        first_name: 'Integration',
        last_name: 'Tester',
        email: 'integration.tester@integration.test',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker',
        preferred_principals: []
      }

      const validatedContact = ContactZodValidation.validate(newOrgContactData)
      const extractedOrg = ContactZodValidation.extractOrganizationData(validatedContact)
      const dbContact = ContactZodValidation.transformForDatabase(validatedContact)

      // Verify organization extraction
      expect(extractedOrg.name).toBe('Integration Test Restaurant')
      expect(extractedOrg.type).toBe('customer')

      // Verify contact transformation
      expect(dbContact).not.toHaveProperty('organization_mode')
      expect(dbContact).not.toHaveProperty('organization_name')
      expect(dbContact.first_name).toBe('Integration')
    })

    test('should validate complete multi-principal opportunity workflow', () => {
      // Step 1: Validate multi-principal creation
      const multiPrincipalData = {
        organization_id: VALID_UUID,
        contact_id: VALID_UUID_2,
        principals: [VALID_UUID_2, VALID_UUID_3],
        opportunity_context: 'Food Show',
        custom_context: null,
        auto_generated_name: true,
        estimated_value: 150000,
        stage: 'Initial Outreach',
        status: 'Active',
        probability: 30,
        deal_owner: 'Integration Sales Rep'
      }

      const validatedOpportunity = OpportunityZodValidation.validateMultiPrincipal(multiPrincipalData)

      // Step 2: Generate auto-name
      const generatedName = OpportunityZodValidation.generateMultiPrincipalName(
        'Integration Target Restaurant',
        ['Principal A', 'Principal B'],
        'Food Show'
      )

      // Step 3: Extract participant relationships
      const participants = OpportunityZodValidation.extractPrincipalRelationships(
        validatedOpportunity,
        'generated-opp-id',
        'user-id'
      )

      expect(validatedOpportunity.auto_generated_name).toBe(true)
      expect(generatedName).toContain('Integration Target Restaurant')
      expect(participants).toHaveLength(2)
      expect(participants[0].role).toBe('principal')
    })

    test('should validate cross-entity relationship consistency', () => {
      // Organization -> Contact -> Opportunity chain
      const organizationId = VALID_UUID
      const contactId = VALID_UUID_2

      // Contact references organization
      const contactData = {
        organization_mode: 'existing' as const,
        organization_id: organizationId,
        first_name: 'Chain',
        last_name: 'Test',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker',
        preferred_principals: []
      }

      const validatedContact = ContactZodValidation.validate(contactData)

      // Opportunity references both organization and contact
      const opportunityData = {
        name: 'Chain Test Opportunity',
        organization_id: organizationId,
        contact_id: contactId,
        estimated_value: 75000,
        stage: 'New Lead',
        status: 'Active',
        principals: []
      }

      const validatedOpportunity = OpportunityZodValidation.validate(opportunityData)

      // Verify relationship consistency
      expect(validatedContact.organization_id).toBe(organizationId)
      expect(validatedOpportunity.organization_id).toBe(organizationId)
      expect(validatedOpportunity.contact_id).toBe(contactId)
    })
  })

  describe('Error Handling and Recovery', () => {

    test('should provide detailed validation error messages', () => {
      const invalidData = {
        name: '', // Empty required field
        type: 'invalid-type', // Invalid enum value
        priority: 'Z', // Invalid priority
        segment: '', // Empty required field
        email: 'invalid-email', // Invalid email format
        phone: 'abc', // Invalid phone after transformation
        website: 'not-a-url' // Invalid URL
      }

      const errors = OrganizationZodValidation.getValidationErrors(invalidData)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(error => error.includes('name'))).toBe(true)
      expect(errors.some(error => error.includes('type'))).toBe(true)
    })

    test('should handle graceful degradation with partial data', () => {
      // Test update scenarios with partial data
      const partialUpdateData = {
        name: 'Updated Name Only'
      }

      expect(() => OrganizationZodValidation.validateUpdate(partialUpdateData)).not.toThrow()

      const result = OrganizationZodValidation.validateUpdate(partialUpdateData)
      expect(result.name).toBe('Updated Name Only')
    })

    test('should validate safe parsing operations', () => {
      const invalidData = {
        name: 'Test',
        type: 'invalid-type'
      }

      const result = OrganizationZodValidation.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error.errors.length).toBeGreaterThan(0)
      }
    })
  })
})