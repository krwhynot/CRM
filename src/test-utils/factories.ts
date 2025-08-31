/**
 * Test data factories for creating valid test objects
 */

import type { Organization } from '@/types/entities'

/**
 * Creates a valid Organization object for testing
 */
export const createTestOrganization = (overrides: Partial<Organization> = {}): Organization => {
  const defaultOrg: Organization = {
    id: '1',
    name: 'Test Organization',
    type: 'customer',
    priority: 'A',
    segment: 'Enterprise',
    phone: '(555) 123-4567',
    email: 'test@example.com',
    address_line_1: '123 Test St',
    address_line_2: null,
    city: 'Test City',
    state_province: 'Test State',
    postal_code: '12345',
    country: 'United States',
    website: 'https://example.com',
    description: 'A test organization',
    notes: null,
    industry: 'Technology',
    is_active: true,
    is_distributor: false,
    is_principal: false,
    primary_manager_name: 'John Doe',
    secondary_manager_name: null,
    parent_organization_id: null,
    import_notes: null,
    search_tsv: null,
    created_at: new Date().toISOString(),
    created_by: 'test-user',
    updated_at: new Date().toISOString(),
    updated_by: null,
    deleted_at: null,
  }

  return { ...defaultOrg, ...overrides }
}

/**
 * Creates a minimal valid Organization object for testing
 */
export const createMinimalTestOrganization = (
  overrides: Partial<Organization> = {}
): Organization => {
  return createTestOrganization({
    address_line_1: null,
    email: null,
    city: null,
    state_province: null,
    postal_code: null,
    country: null,
    website: null,
    description: null,
    industry: null,
    ...overrides,
  })
}
