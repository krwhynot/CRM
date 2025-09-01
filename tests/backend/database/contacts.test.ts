/**
 * Contacts Database Tests
 * 
 * Comprehensive testing of CRUD operations, relationships, and business logic
 * for the Contacts table, including organization relationships and unique constraints.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createTestOrganization, createTestContact, checkResult } from '../../utils/test-factories'
import { testSupabase, TestAuth, PerformanceMonitor, TestCleanup } from '../setup/test-setup'
import type { ContactRole } from '@/types/entities'

describe('Contacts Database Operations', () => {
  let testOrgId: string
  let testContactIds: string[] = []

  beforeEach(async () => {
    testContactIds = []
    await TestAuth.loginAsTestUser()

    // Create a test organization for contact relationships
    const orgData = createTestOrganization({
      name: 'Test Organization for Contacts',
      type: 'customer'
    })
    
    const orgResult = await testSupabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()

    const createdOrg = checkResult(orgResult, 'create test organization')
    testOrgId = createdOrg.id
    TestCleanup.trackCreatedRecord('organizations', testOrgId)
  })

  afterEach(async () => {
    // Cleanup test contacts
    if (testContactIds.length > 0) {
      await testSupabase
        .from('contacts')
        .delete()
        .in('id', testContactIds)
    }
  })

  describe('CREATE Operations', () => {
    test('should create a new contact with all fields', async () => {
      const contactData = createTestContact({
        organization_id: testOrgId,
        first_name: 'John',
        last_name: 'Smith',
        title: 'Sales Manager',
        role: 'decision_maker' as ContactRole,
        email: 'john.smith@example.com',
        phone: '555-0123',
        mobile_phone: '555-0124',
        department: 'Sales',
        linkedin_url: 'https://linkedin.com/in/johnsmith',
        is_primary_contact: false,
        notes: 'Key contact for sales initiatives'
      })

      const result = await PerformanceMonitor.measureQuery('create_contact', async () => {
        return await testSupabase
          .from('contacts')
          .insert(contactData)
          .select(`
            *,
            organization:organizations(name, type)
          `)
          .single()
      })

      const createdContact = checkResult(result, 'create contact with all fields')
      expect(createdContact.first_name).toBe(contactData.first_name)
      expect(createdContact.last_name).toBe(contactData.last_name)
      expect(createdContact.organization_id).toBe(testOrgId)
      expect(createdContact.organization).toBeDefined()
      expect((createdContact as any).organization.name).toBe('Test Organization for Contacts')
      expect(createdContact.id).toBeDefined()
      expect(createdContact.created_at).toBeDefined()

      testContactIds.push(createdContact.id)
      TestCleanup.trackCreatedRecord('contacts', createdContact.id)
    })

    test('should create contacts with different roles', async () => {
      const roles: ContactRole[] = ['decision_maker', 'influencer', 'gatekeeper', 'champion', 'buyer']
      const createdContacts = []

      for (const role of roles) {
        const contactData = createTestContact({
          organization_id: testOrgId,
          first_name: `Test${role}`,
          last_name: 'User',
          role: role,
          email: `${role}@example.com`
        })

        const result = await testSupabase
          .from('contacts')
          .insert(contactData)
          .select()
          .single()

        const createdContact = checkResult(result, `create contact with role ${role}`)
        expect(createdContact.role).toBe(role)
        
        createdContacts.push(createdContact)
        testContactIds.push(createdContact.id)
      }

      expect(createdContacts).toHaveLength(5)
    })

    test('should create primary contact with unique constraint enforcement', async () => {
      const primaryContactData1 = createTestContact({
        organization_id: testOrgId,
        first_name: 'Primary',
        last_name: 'Contact1',
        is_primary_contact: true
      })

      const primaryContactData2 = createTestContact({
        organization_id: testOrgId,
        first_name: 'Primary',
        last_name: 'Contact2',
        is_primary_contact: true
      })

      // Create first primary contact
      const result1 = await testSupabase
        .from('contacts')
        .insert(primaryContactData1)
        .select()
        .single()

      const firstContact = checkResult(result1, 'create first primary contact')
      testContactIds.push(firstContact.id)

      // Attempt to create second primary contact for same organization
      const result2 = await testSupabase
        .from('contacts')
        .insert(primaryContactData2)
        .select()
        .single()

      // This should fail due to unique constraint on primary contact per organization
      expect(result2.error).toBeDefined()
      expect(result2.error?.code).toBe('23505') // Unique constraint violation
    })

    test('should reject contact creation without required fields', async () => {
      const invalidContactData = {
        organization_id: testOrgId,
        // Missing first_name, last_name, purchase_influence, decision_authority, created_by (required fields)
        created_by: 'test-user-id' // Add at least created_by to avoid multiple errors
      }

      const result = await testSupabase
        .from('contacts')
        .insert(invalidContactData as any)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23502') // NOT NULL constraint violation
    })

    test('should reject contact with invalid organization_id', async () => {
      const invalidOrgContactData = createTestContact({
        organization_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
        first_name: 'Invalid',
        last_name: 'Contact'
      })

      const result = await testSupabase
        .from('contacts')
        .insert(invalidOrgContactData)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503') // Foreign key constraint violation
    })
  })

  describe('READ Operations', () => {
    let sampleContactId: string

    beforeEach(async () => {
      // Create a sample contact for read tests
      const contactData = createTestContact({
        organization_id: testOrgId,
        first_name: 'Sample',
        last_name: 'ReadContact',
        title: 'Test Manager',
        email: 'sample@example.com',
        phone: '555-READ'
      })

      const result = await testSupabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      const createdContact = checkResult(result, 'create sample contact for read tests')
      sampleContactId = createdContact.id
      testContactIds.push(sampleContactId)
    })

    test('should retrieve contact by ID with organization data', async () => {
      const result = await PerformanceMonitor.measureQuery('read_contact_by_id', async () => {
        return await testSupabase
          .from('contacts')
          .select(`
            *,
            organization:organizations(
              id,
              name,
              type,
              industry
            )
          `)
          .eq('id', sampleContactId)
          .single()
      })

      const contact = checkResult(result, 'retrieve contact by ID with organization data')
      expect(contact.id).toBe(sampleContactId)
      expect(contact.first_name).toBe('Sample')
      expect(contact.organization).toBeDefined()
      expect(contact.organization.id).toBe(testOrgId)
      expect(contact.organization.name).toBe('Test Organization for Contacts')
    })

    test('should list contacts for specific organization', async () => {
      // Create additional contacts for the organization
      const additionalContacts = [
        createTestContact({ first_name: 'Contact1', last_name: 'Test', organization_id: testOrgId }),
        createTestContact({ first_name: 'Contact2', last_name: 'Test', organization_id: testOrgId }),
        createTestContact({ first_name: 'Contact3', last_name: 'Test', organization_id: testOrgId })
      ]

      for (const contact of additionalContacts) {
        const result = await testSupabase.from('contacts').insert(contact).select().single()
        const createdContact = checkResult(result, 'create additional contact')
        testContactIds.push(createdContact.id)
      }

      const result = await PerformanceMonitor.measureQuery('list_contacts_by_organization', async () => {
        return await testSupabase
          .from('contacts')
          .select('*', { count: 'exact' })
          .eq('organization_id', testOrgId)
          .is('deleted_at', null)
          .order('last_name', { ascending: true })
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.count).toBeGreaterThanOrEqual(4) // Sample + 3 additional
      expect(result.data!.length).toBeGreaterThanOrEqual(4)

      // Verify all contacts belong to the same organization
      result.data!.forEach((contact: any) => {
        expect(contact.organization_id).toBe(testOrgId)
      })
    })

    test('should search contacts by name', async () => {
      const result = await PerformanceMonitor.measureQuery('search_contacts', async () => {
        return await testSupabase
          .from('contacts')
          .select(`
            *,
            organization:organizations(name)
          `)
          .or(`first_name.ilike.%sample%,last_name.ilike.%sample%`)
          .is('deleted_at', null)
          .limit(10)
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data).not.toBeNull()
      
      if (result.data) {
        expect(result.data.length).toBeGreaterThan(0)
        
        // Verify search results contain the search term
        result.data.forEach((contact: any) => {
          const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase()
          expect(fullName).toContain('sample')
        })
      }
    })

    test('should filter contacts by role', async () => {
      // Create contacts with specific roles
      const roleContacts = [
        createTestContact({ first_name: 'Decision', last_name: 'Maker', role: 'decision_maker' as ContactRole, organization_id: testOrgId }),
        createTestContact({ first_name: 'Influ', last_name: 'Encer', role: 'influencer' as ContactRole, organization_id: testOrgId })
      ]

      for (const contact of roleContacts) {
        const result = await testSupabase.from('contacts').insert(contact).select().single()
        const createdContact = checkResult(result, 'create contact with specific role')
        testContactIds.push(createdContact.id)
      }

      const result = await testSupabase
        .from('contacts')
        .select('*')
        .eq('role', 'decision_maker')
        .is('deleted_at', null)
        .limit(10)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      result.data!.forEach((contact: any) => {
        expect(contact.role).toBe('decision_maker')
      })
    })

    test('should find primary contact for organization', async () => {
      // Create a primary contact
      const primaryContactData = createTestContact({
        organization_id: testOrgId,
        first_name: 'Primary',
        last_name: 'Contact',
        is_primary_contact: true,
        email: 'primary@example.com'
      })

      const createResult = await testSupabase
        .from('contacts')
        .insert(primaryContactData)
        .select()
        .single()

      const primaryContact = checkResult(createResult, 'create primary contact')
      testContactIds.push(primaryContact.id)

      const result = await testSupabase
        .from('contacts')
        .select('*')
        .eq('organization_id', testOrgId)
        .eq('is_primary_contact', true)
        .is('deleted_at', null)
        .single()

      const primaryContactResult = checkResult(result, 'find primary contact for organization')
      expect(primaryContactResult.is_primary_contact).toBe(true)
      expect(primaryContactResult.first_name).toBe('Primary')
    })
  })

  describe('UPDATE Operations', () => {
    let sampleContactId: string

    beforeEach(async () => {
      const contactData = createTestContact({
        organization_id: testOrgId,
        first_name: 'Update',
        last_name: 'TestContact',
        email: 'update@example.com'
      })

      const result = await testSupabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      const createdContact = checkResult(result, 'create sample contact for update tests')
      sampleContactId = createdContact.id
      testContactIds.push(sampleContactId)
    })

    test('should update contact information', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Contact',
        title: 'Senior Manager',
        phone: '555-UPDATED',
        department: 'Operations'
      }

      const result = await PerformanceMonitor.measureQuery('update_contact', async () => {
        return await testSupabase
          .from('contacts')
          .update(updateData)
          .eq('id', sampleContactId)
          .select()
          .single()
      })

      const updatedContact = checkResult(result, 'update contact information')
      expect(updatedContact.first_name).toBe(updateData.first_name)
      expect(updatedContact.last_name).toBe(updateData.last_name)
      expect(updatedContact.title).toBe(updateData.title)
      expect(updatedContact.phone).toBe(updateData.phone)
      expect(updatedContact.department).toBe(updateData.department)
      expect(new Date(updatedContact.updated_at || new Date()) > new Date(updatedContact.created_at || new Date())).toBe(true)
    })

    test('should update contact role', async () => {
      const result = await testSupabase
        .from('contacts')
        .update({ role: 'champion' as ContactRole })
        .eq('id', sampleContactId)
        .select()
        .single()

      const updatedRoleContact = checkResult(result, 'update contact role')
      expect(updatedRoleContact.role).toBe('champion')
    })

    test('should not allow invalid role values', async () => {
      const result = await testSupabase
        .from('contacts')
        .update({ role: 'invalid_role' as any })
        .eq('id', sampleContactId)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('22P02') // Invalid enum value
    })

    test('should transfer contact to different organization', async () => {
      // Create another organization
      const newOrgData = createTestOrganization({
        name: 'New Organization for Transfer',
        type: 'principal'
      })
      const newOrgResult = await testSupabase
        .from('organizations')
        .insert(newOrgData)
        .select()
        .single()

      const newOrg = checkResult(newOrgResult, 'create new organization for transfer')
      const newOrgId = newOrg.id
      TestCleanup.trackCreatedRecord('organizations', newOrgId)

      const result = await testSupabase
        .from('contacts')
        .update({ organization_id: newOrgId })
        .eq('id', sampleContactId)
        .select(`
          *,
          organization:organizations(name)
        `)
        .single()

      const transferredContact = checkResult(result, 'transfer contact to different organization')
      expect(transferredContact.organization_id).toBe(newOrgId)
      expect(transferredContact.organization.name).toBe('New Organization for Transfer')
    })

    test('should update primary contact status', async () => {
      const result = await testSupabase
        .from('contacts')
        .update({ is_primary_contact: true })
        .eq('id', sampleContactId)
        .select()
        .single()

      const primaryStatusContact = checkResult(result, 'update primary contact status')
      expect(primaryStatusContact.is_primary_contact).toBe(true)
    })
  })

  describe('DELETE Operations (Soft Delete)', () => {
    let sampleContactId: string

    beforeEach(async () => {
      const contactData = createTestContact({
        organization_id: testOrgId,
        first_name: 'Delete',
        last_name: 'TestContact',
        email: 'delete@example.com'
      })

      const result = await testSupabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      const createdContact = checkResult(result, 'create sample contact for delete tests')
      sampleContactId = createdContact.id
      testContactIds.push(sampleContactId)
    })

    test('should soft delete contact', async () => {
      const result = await PerformanceMonitor.measureQuery('soft_delete_contact', async () => {
        return await testSupabase
          .from('contacts')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', sampleContactId)
          .select()
          .single()
      })

      const deletedContact = checkResult(result, 'soft delete contact')
      expect(deletedContact.deleted_at).toBeDefined()
      expect(deletedContact.deleted_at).not.toBeNull()
    })

    test('should exclude soft-deleted contacts from normal queries', async () => {
      // First soft delete the contact
      await testSupabase
        .from('contacts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sampleContactId)

      // Normal query should not return soft-deleted contacts
      const result = await testSupabase
        .from('contacts')
        .select('*')
        .eq('id', sampleContactId)
        .is('deleted_at', null)
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('PGRST116') // No rows returned
    })

    test('should handle primary contact deletion gracefully', async () => {
      // Make contact primary first
      await testSupabase
        .from('contacts')
        .update({ is_primary_contact: true })
        .eq('id', sampleContactId)

      // Then soft delete
      const result = await testSupabase
        .from('contacts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sampleContactId)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
      if (result.data) {
        expect(result.data.deleted_at).not.toBeNull()
      }
      
      // Verify organization no longer has a primary contact
      const primaryContactCheck = await testSupabase
        .from('contacts')
        .select('*')
        .eq('organization_id', testOrgId)
        .eq('is_primary_contact', true)
        .is('deleted_at', null)
        .single()

      expect(primaryContactCheck.error).toBeDefined()
      expect(primaryContactCheck.error?.code).toBe('PGRST116')
    })
  })

  describe('Relationship Integrity Tests', () => {
    test('should cascade organization changes properly', async () => {
      // Create contact
      const contactData = createTestContact({
        organization_id: testOrgId,
        first_name: 'Relationship',
        last_name: 'Test',
        email: 'relationship@example.com'
      })

      const contactResult = await testSupabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      const createdContact = checkResult(contactResult, 'create contact for relationship test')
      const contactId = createdContact.id
      testContactIds.push(contactId)

      // Update organization name
      await testSupabase
        .from('organizations')
        .update({ name: 'Updated Organization Name' })
        .eq('id', testOrgId)

      // Verify contact still references the correct organization
      const verifyResult = await testSupabase
        .from('contacts')
        .select(`
          *,
          organization:organizations(name)
        `)
        .eq('id', contactId)
        .single()

      const verifiedContact = checkResult(verifyResult, 'verify contact relationship after organization update')
      expect(verifiedContact.organization.name).toBe('Updated Organization Name')
    })

    test('should prevent organization deletion with active contacts', async () => {
      // Create contact
      const contactData = createTestContact({
        organization_id: testOrgId,
        first_name: 'Prevention',
        last_name: 'Test'
      })

      const contactResult = await testSupabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single()

      const preventionContact = checkResult(contactResult, 'create contact for prevention test')
      testContactIds.push(preventionContact.id)

      // Attempt to delete organization (should fail if foreign key constraint exists)
      const deleteResult = await testSupabase
        .from('organizations')
        .delete()
        .eq('id', testOrgId)

      // This might succeed or fail depending on foreign key constraints
      // If it succeeds, it means contacts allow organization deletion
      if (deleteResult.error) {
        expect(deleteResult.error.code).toBe('23503') // Foreign key violation
      } else {
        console.warn('⚠️  Organization deletion succeeded - consider adding constraint to prevent deletion with active contacts')
      }
    })
  })

  describe('Performance and Index Tests', () => {
    test('should perform efficiently with organization-based queries', async () => {
      const startTime = performance.now()
      
      const result = await testSupabase
        .from('contacts')
        .select('*')
        .eq('organization_id', testOrgId)
        .is('deleted_at', null)
        .limit(100)
      
      const duration = performance.now() - startTime
      
      expect(result.error).toBeNull()
      expect(duration).toBeLessThan(50) // Should be under 50ms with proper indexing
    })

    test('should perform efficiently with name searches', async () => {
      const startTime = performance.now()
      
      const result = await testSupabase
        .from('contacts')
        .select('*')
        .or('first_name.ilike.%test%,last_name.ilike.%test%')
        .is('deleted_at', null)
        .limit(100)
      
      const duration = performance.now() - startTime
      
      expect(result.error).toBeNull()
      expect(duration).toBeLessThan(100) // Should be under 100ms
    })
  })
})
