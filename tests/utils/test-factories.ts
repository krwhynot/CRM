/**
 * Test Data Factories
 * 
 * Factory pattern for creating test data with all required fields and sensible defaults.
 * Ensures consistent test data creation across all test files.
 */

import type {
  Organization,
  OrganizationInsert,
  Contact,
  ContactInsert,
  Product,
  ProductInsert,
  Opportunity,
  OpportunityInsert,
  Interaction,
  InteractionInsert,
} from '@/types/entities'
import type { Database } from '@/types/database.types'

// Test User ID - matches test authentication setup
const TEST_USER_ID = 'test-user-id-12345'

// Helper function to generate unique identifiers
const generateUniqueId = () => crypto.randomUUID()
const generateTimestamp = () => new Date().toISOString()
const generateUniqueName = (prefix: string) => `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2)}`

/**
 * Organization Factory
 */
export interface TestOrganizationOverrides {
  id?: string
  name?: string
  type?: Database['public']['Enums']['organization_type']
  priority?: string
  segment?: string
  created_by?: string
  created_at?: string
  is_active?: boolean
  is_distributor?: boolean
  is_principal?: boolean
  description?: string
  email?: string
  phone?: string
  website?: string
  address_line_1?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  industry?: string
  notes?: string
}

export const createTestOrganization = (overrides: TestOrganizationOverrides = {}): OrganizationInsert => {
  const baseOrganization = {
    id: overrides.id || generateUniqueId(),
    name: overrides.name || generateUniqueName('Test Organization'),
    type: overrides.type || 'customer',
    priority: overrides.priority || 'B', // Required field
    segment: overrides.segment || 'Restaurant', // Required field
    created_by: overrides.created_by || TEST_USER_ID, // Required field
    created_at: overrides.created_at || generateTimestamp(),
    is_active: overrides.is_active ?? true,
    is_distributor: overrides.is_distributor ?? false,
    is_principal: overrides.is_principal ?? false,
    description: overrides.description ?? null,
    email: overrides.email ?? null,
    phone: overrides.phone ?? null,
    website: overrides.website ?? null,
    address_line_1: overrides.address_line_1 ?? null,
    city: overrides.city ?? null,
    state_province: overrides.state_province ?? null,
    postal_code: overrides.postal_code ?? null,
    country: overrides.country ?? null,
    industry: overrides.industry ?? null,
    notes: overrides.notes ?? null
  }

  // Auto-set distributor/principal flags based on type
  const finalType = overrides.type || baseOrganization.type
  if (finalType === 'distributor' || finalType === 'principal') {
    baseOrganization.is_distributor = finalType === 'distributor'
    baseOrganization.is_principal = finalType === 'principal'
  }

  return {
    ...baseOrganization,
    ...overrides
  }
}

/**
 * Contact Factory
 */
export interface TestContactOverrides {
  id?: string
  first_name?: string
  last_name?: string
  organization_id?: string
  purchase_influence?: string
  decision_authority?: string
  created_by?: string
  created_at?: string
  email?: string
  phone?: string
  mobile_phone?: string
  title?: string
  department?: string
  role?: Database['public']['Enums']['contact_role']
  linkedin_url?: string
  is_primary_contact?: boolean
  notes?: string
}

export const createTestContact = (overrides: TestContactOverrides = {}): ContactInsert => ({
  id: overrides.id || generateUniqueId(),
  first_name: overrides.first_name || 'Test',
  last_name: overrides.last_name || generateUniqueName('Contact').split(' ').pop() || 'Contact',
  organization_id: overrides.organization_id || generateUniqueId(), // Required - FK to organizations
  purchase_influence: overrides.purchase_influence || 'Medium', // Required field
  decision_authority: overrides.decision_authority || 'Influencer', // Required field
  created_by: overrides.created_by || TEST_USER_ID, // Required field
  created_at: overrides.created_at || generateTimestamp(),
  email: overrides.email ?? null,
  phone: overrides.phone ?? null,
  mobile_phone: overrides.mobile_phone ?? null,
  title: overrides.title ?? null,
  department: overrides.department ?? null,
  role: overrides.role ?? null,
  linkedin_url: overrides.linkedin_url ?? null,
  is_primary_contact: overrides.is_primary_contact ?? false,
  notes: overrides.notes ?? null,
  ...overrides
})

/**
 * Product Factory
 */
export interface TestProductOverrides {
  id?: string
  name?: string
  category?: Database['public']['Enums']['product_category']
  principal_id?: string
  created_by?: string
  created_at?: string
  description?: string
  sku?: string
  list_price?: number
  unit_cost?: number
  unit_of_measure?: string
  min_order_quantity?: number
  shelf_life_days?: number
  storage_requirements?: string
  season_start?: number
  season_end?: number
  specifications?: string
}

export const createTestProduct = (overrides: TestProductOverrides = {}): ProductInsert => ({
  id: overrides.id || generateUniqueId(),
  name: overrides.name || generateUniqueName('Test Product'),
  category: overrides.category || 'dry_goods',
  principal_id: overrides.principal_id || generateUniqueId(), // Required - FK to organizations (type='principal')
  created_by: overrides.created_by || TEST_USER_ID, // Required field
  created_at: overrides.created_at || generateTimestamp(),
  description: overrides.description ?? null,
  sku: overrides.sku ?? null,
  list_price: overrides.list_price ?? null,
  unit_cost: overrides.unit_cost ?? null,
  unit_of_measure: overrides.unit_of_measure ?? null,
  min_order_quantity: overrides.min_order_quantity ?? null,
  shelf_life_days: overrides.shelf_life_days ?? null,
  storage_requirements: overrides.storage_requirements ?? null,
  season_start: overrides.season_start ?? null,
  season_end: overrides.season_end ?? null,
  specifications: overrides.specifications ?? null,
  is_active: overrides.is_active ?? true, // Add default active state
  ...overrides
})

/**
 * Opportunity Factory
 */
export interface TestOpportunityOverrides {
  id?: string
  name?: string
  organization_id?: string
  stage?: Database['public']['Enums']['opportunity_stage']
  status?: Database['public']['Enums']['opportunity_status']
  created_by?: string
  created_at?: string
  contact_id?: string
  principal_organization_id?: string
  distributor_organization_id?: string
  description?: string
  estimated_value?: number
  probability?: number
  estimated_close_date?: string
  priority?: Database['public']['Enums']['priority_level']
  next_action?: string
  next_action_date?: string
  competition?: string
  decision_criteria?: string
  opportunity_context?: string
  stage_manual?: boolean
  status_manual?: boolean
  notes?: string
}

export const createTestOpportunity = (overrides: TestOpportunityOverrides = {}): OpportunityInsert => ({
  id: overrides.id || generateUniqueId(),
  name: overrides.name || generateUniqueName('Test Opportunity'),
  organization_id: overrides.organization_id || generateUniqueId(), // Required - FK to organizations
  stage: overrides.stage || 'lead',
  status: overrides.status || 'active',
  created_by: overrides.created_by || TEST_USER_ID, // Required field
  created_at: overrides.created_at || generateTimestamp(),
  contact_id: overrides.contact_id ?? null,
  principal_organization_id: overrides.principal_organization_id ?? null,
  distributor_organization_id: overrides.distributor_organization_id ?? null,
  description: overrides.description ?? null,
  estimated_value: overrides.estimated_value ?? null,
  probability: overrides.probability ?? null,
  estimated_close_date: overrides.estimated_close_date ?? null,
  priority: overrides.priority ?? null,
  next_action: overrides.next_action ?? null,
  next_action_date: overrides.next_action_date ?? null,
  competition: overrides.competition ?? null,
  decision_criteria: overrides.decision_criteria ?? null,
  opportunity_context: overrides.opportunity_context ?? null,
  stage_manual: overrides.stage_manual ?? false,
  status_manual: overrides.status_manual ?? false,
  notes: overrides.notes ?? null,
  ...overrides
})

/**
 * Interaction Factory
 */
export interface TestInteractionOverrides {
  id?: string
  subject?: string
  type?: Database['public']['Enums']['interaction_type']
  opportunity_id?: string
  created_by?: string
  created_at?: string
  interaction_date?: string
  contact_id?: string
  organization_id?: string
  description?: string
  outcome?: string
  follow_up_required?: boolean
  follow_up_date?: string
  follow_up_notes?: string
  duration_minutes?: number
  attachments?: string[]
}

export const createTestInteraction = (overrides: TestInteractionOverrides = {}): InteractionInsert => ({
  id: overrides.id || generateUniqueId(),
  subject: overrides.subject || generateUniqueName('Test Interaction'),
  type: overrides.type || 'email',
  opportunity_id: overrides.opportunity_id || generateUniqueId(), // Required - FK to opportunities
  created_by: overrides.created_by || TEST_USER_ID, // Required field
  created_at: overrides.created_at || generateTimestamp(),
  interaction_date: overrides.interaction_date || generateTimestamp(),
  contact_id: overrides.contact_id ?? null,
  organization_id: overrides.organization_id ?? null,
  description: overrides.description ?? null,
  outcome: overrides.outcome ?? null,
  follow_up_required: overrides.follow_up_required ?? false,
  follow_up_date: overrides.follow_up_date ?? null,
  follow_up_notes: overrides.follow_up_notes ?? null,
  duration_minutes: overrides.duration_minutes ?? null,
  attachments: overrides.attachments ?? null,
  ...overrides
})

/**
 * Helper Factory Functions
 */

/**
 * Creates a complete organization with contact relationship
 */
export const createTestOrganizationWithContact = (
  orgOverrides: TestOrganizationOverrides = {},
  contactOverrides: TestContactOverrides = {}
) => {
  const org = createTestOrganization(orgOverrides)
  const contact = createTestContact({
    organization_id: org.id,
    ...contactOverrides
  })
  
  return { organization: org, contact }
}

/**
 * Creates a complete opportunity chain with org, contact, and opportunity
 */
export const createTestOpportunityChain = (
  orgOverrides: TestOrganizationOverrides = {},
  contactOverrides: TestContactOverrides = {},
  opportunityOverrides: TestOpportunityOverrides = {}
) => {
  const org = createTestOrganization(orgOverrides)
  const contact = createTestContact({
    organization_id: org.id,
    ...contactOverrides
  })
  const opportunity = createTestOpportunity({
    organization_id: org.id,
    contact_id: contact.id,
    ...opportunityOverrides
  })
  
  return { organization: org, contact, opportunity }
}

/**
 * Creates a principal organization with products
 */
export const createTestPrincipalWithProducts = (
  principalOverrides: TestOrganizationOverrides = {},
  productOverrides: TestProductOverrides[] = [{}]
) => {
  const principal = createTestOrganization({
    type: 'principal',
    is_principal: true,
    ...principalOverrides
  })
  
  const products = productOverrides.map((overrides, index) => 
    createTestProduct({
      principal_id: principal.id,
      name: `Test Product ${index + 1} - ${Date.now()}`,
      ...overrides
    })
  )
  
  return { principal, products }
}

/**
 * Utility function to create minimal valid test data
 */
export const createMinimalTestData = () => ({
  organization: createTestOrganization({
    name: 'Minimal Test Org',
    type: 'customer',
    priority: 'C',
    segment: 'Test Segment'
  }),
  
  contact: createTestContact({
    first_name: 'Test',
    last_name: 'User',
    purchase_influence: 'Low',
    decision_authority: 'End User'
  }),
  
  product: createTestProduct({
    name: 'Minimal Test Product',
    category: 'dry_goods'
  }),
  
  opportunity: createTestOpportunity({
    name: 'Minimal Test Opportunity',
    stage: 'lead',
    status: 'active'
  }),
  
  interaction: createTestInteraction({
    subject: 'Minimal Test Interaction',
    type: 'email'
  })
})

/**
 * Validation helpers for test data
 */
export const validateTestData = {
  hasRequiredFields: (data: any, requiredFields: string[]) => {
    const missing = requiredFields.filter(field => data[field] === undefined || data[field] === null)
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
    return true
  },

  isValidUUID: (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  organization: (data: OrganizationInsert) => {
    validateTestData.hasRequiredFields(data, ['name', 'type', 'priority', 'segment', 'created_by'])
    return data
  },

  contact: (data: ContactInsert) => {
    validateTestData.hasRequiredFields(data, ['first_name', 'last_name', 'organization_id', 'purchase_influence', 'decision_authority', 'created_by'])
    return data
  },

  product: (data: ProductInsert) => {
    validateTestData.hasRequiredFields(data, ['name', 'category', 'principal_id', 'created_by'])
    return data
  }
}

/**
 * Null-safe result checker for database queries
 */
export const checkResult = <T>(result: { data: T | null; error: any }, operation: string) => {
  if (result.error) {
    throw new Error(`Database error in ${operation}: ${result.error.message}`)
  }
  if (!result.data) {
    throw new Error(`No data returned from ${operation}`)
  }
  return result.data
}

/**
 * Export all factory functions for easy import
 */
export const TestFactories = {
  createTestOrganization,
  createTestContact,
  createTestProduct,
  createTestOpportunity,
  createTestInteraction,
  createTestOrganizationWithContact,
  createTestOpportunityChain,
  createTestPrincipalWithProducts,
  createMinimalTestData,
  validateTestData,
  checkResult,
  TEST_USER_ID
}

export default TestFactories