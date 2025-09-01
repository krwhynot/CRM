// Test Helper Types
// Type definitions for test data and mocking across the CRM system

// Base interface for all test entities - includes common database fields
interface TestEntityBase {
  created_by: string
  created_at?: string
  updated_at?: string
  updated_by?: string
  deleted_at?: string | null
}

// Contact test data interface
export interface TestContact extends TestEntityBase {
  id: string
  first_name: string
  last_name: string
  email?: string | null
  title?: string | null
  department?: string | null
  phone?: string | null
  mobile_phone?: string | null
  linkedin_url?: string | null
  organization_id?: string
  purchase_influence?: 'High' | 'Medium' | 'Low' | 'Unknown'
  decision_authority?: 'Decision Maker' | 'Influencer' | 'End User' | 'Gatekeeper'
  role?: 'decision_maker' | 'influencer' | 'buyer' | 'end_user' | 'gatekeeper' | 'champion' | null
  is_primary_contact?: boolean | null
  notes?: string | null
  opportunity_id?: string | null
}

// Organization test data interface
export interface TestOrganization extends TestEntityBase {
  id: string
  name: string
  type: 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor'
  segment?:
    | 'healthcare'
    | 'education'
    | 'corporate_dining'
    | 'senior_living'
    | 'quick_service'
    | 'fine_dining'
    | 'catering'
    | 'other'
    | null
  priority?: 'high' | 'medium' | 'low' | null
  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  phone?: string | null
  website?: string | null
  annual_revenue?: number | null
  employee_count?: number | null
  notes?: string | null
  parent_organization_id?: string | null
}

// Product test data interface
export interface TestProduct extends TestEntityBase {
  id: string
  name: string
  category: 'protein' | 'dairy' | 'produce' | 'dry_goods' | 'frozen' | 'beverages' | 'other'
  brand?: string | null
  package_size?: string | null
  unit_measure?: string | null
  description?: string | null
  specifications?: string | null
  storage_requirements?: string | null
  shelf_life?: string | null
  allergens?: string[] | null
  nutritional_info?: Record<string, unknown> | null
  cost_per_unit?: number | null
  suggested_price?: number | null
  minimum_order_quantity?: number | null
  is_active?: boolean | null
  principal_id?: string
}

// Opportunity test data interface
export interface TestOpportunity extends TestEntityBase {
  id: string
  name: string
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  value?: number | null
  probability?: number | null
  expected_close_date?: string | null
  actual_close_date?: string | null
  organization_id: string
  contact_id?: string | null
  principal_organization_id?: string | null
  description?: string | null
  next_steps?: string | null
  loss_reason?: string | null
  notes?: string | null
  founding_interaction_id?: string | null
}

// Interaction test data interface
export interface TestInteraction extends TestEntityBase {
  id: string
  type: 'call' | 'email' | 'meeting' | 'demo' | 'note'
  subject: string
  description?: string | null
  interaction_date: string
  duration_minutes?: number | null
  outcome?: string | null
  follow_up_required?: boolean | null
  follow_up_date?: string | null
  attachments?: string[] | null
  organization_id: string
  contact_id?: string | null
  opportunity_id?: string | null
  notes?: string | null
}

// Junction table test interfaces
export interface TestOpportunityProduct extends TestEntityBase {
  id: string
  opportunity_id: string
  product_id: string
  quantity?: number | null
  unit_price?: number | null
  total_value?: number | null
  notes?: string | null
}

export interface TestContactPreferredPrincipal extends TestEntityBase {
  id: string
  contact_id: string
  principal_organization_id: string
  advocacy_strength?: number | null
  advocacy_notes?: string | null
  last_interaction_date?: string | null
}

// Utility types for test data generation
export type TestEntityType =
  | TestContact
  | TestOrganization
  | TestProduct
  | TestOpportunity
  | TestInteraction
  | TestOpportunityProduct
  | TestContactPreferredPrincipal

// Test data factory interfaces
export interface TestDataFactory<T extends TestEntityBase> {
  create(overrides?: Partial<T>): T
  createMany(count: number, overrides?: Partial<T>): T[]
  build(overrides?: Partial<T>): Omit<T, 'id' | 'created_at' | 'updated_at'>
}

// Test scenario types for complex test cases
export interface TestScenario {
  name: string
  description: string
  entities: {
    organizations?: TestOrganization[]
    contacts?: TestContact[]
    products?: TestProduct[]
    opportunities?: TestOpportunity[]
    interactions?: TestInteraction[]
  }
  expectedOutcomes?: Record<string, unknown>
}

// Mock user types for authentication testing
export interface TestUser {
  id: string
  email: string
  name?: string | null
  role?: 'admin' | 'sales_manager' | 'sales_rep' | null
  created_at?: string
  updated_at?: string
}

// Test helper utilities
export interface TestHelpers {
  generateUUID(): string
  generateTestEmail(): string
  generateTestPhone(): string
  generatePastDate(daysAgo?: number): string
  generateFutureDate(daysFromNow?: number): string
  createTestUser(overrides?: Partial<TestUser>): TestUser
}

// Export the base interface for use in other test files
export type { TestEntityBase }
