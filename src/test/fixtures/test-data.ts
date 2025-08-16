import type { Database } from '@/lib/database.types'

// Test data factories for consistent test data generation
export const TestDataFactory = {
  
  // Organization test data
  createOrganization: (overrides: Partial<Database['public']['Tables']['organizations']['Insert']> = {}) => ({
    name: `Test Organization ${Date.now()}`,
    type: 'customer' as const,
    priority: 'B',
    segment: 'Restaurant',
    description: 'Test organization for automated testing',
    phone: '555-0123',
    email: 'test@example.com',
    website: 'https://test.example.com',
    address_line_1: '123 Test St',
    city: 'Test City',
    state_province: 'TS',
    postal_code: '12345',
    country: 'US',
    industry: 'Food Service',
    is_active: true,
    ...overrides
  }),

  // Contact test data
  createContact: (organizationId: string, overrides: Partial<Database['public']['Tables']['contacts']['Insert']> = {}) => ({
    organization_id: organizationId,
    first_name: 'Test',
    last_name: `Contact ${Date.now()}`,
    title: 'Test Manager',
    role: 'decision_maker' as const,
    email: `test.contact.${Date.now()}@example.com`,
    phone: '555-0124',
    mobile_phone: '555-0125',
    department: 'Operations',
    decision_authority: 'High',
    purchase_influence: 'Direct',
    is_primary_contact: false,
    ...overrides
  }),

  // Product test data
  createProduct: (principalId: string, overrides: Partial<Database['public']['Tables']['products']['Insert']> = {}) => ({
    principal_id: principalId,
    name: `Test Product ${Date.now()}`,
    category: 'dairy' as const,
    description: 'Test product for automated testing',
    sku: `TEST-${Date.now()}`,
    unit_of_measure: 'each',
    unit_cost: 10.50,
    list_price: 15.75,
    min_order_quantity: 1,
    season_start: 1,
    season_end: 12,
    shelf_life_days: 30,
    storage_requirements: 'Refrigerated',
    specifications: 'Test specifications',
    ...overrides
  }),

  // Opportunity test data
  createOpportunity: (
    organizationId: string, 
    contactId: string, 
    overrides: Partial<Database['public']['Tables']['opportunities']['Insert']> = {}
  ) => ({
    name: `Test Opportunity ${Date.now()}`,
    organization_id: organizationId,
    contact_id: contactId,
    stage: 'New Lead' as const,
    priority: 'medium' as const,
    estimated_value: 5000.00,
    estimated_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    probability: 50,
    description: 'Test opportunity for automated testing',
    next_action: 'Schedule follow-up call',
    next_action_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    notes: 'Created during automated testing',
    ...overrides
  }),

  // Interaction test data
  createInteraction: (overrides: Partial<Database['public']['Tables']['interactions']['Insert']> = {}) => ({
    type: 'call' as const,
    subject: `Test Interaction ${Date.now()}`,
    description: 'Test interaction for automated testing',
    interaction_date: new Date().toISOString(),
    duration_minutes: 30,
    follow_up_required: false,
    outcome: 'Successful test interaction',
    ...overrides
  }),
}

// Pre-defined test datasets for specific scenarios
export const TestDataSets = {
  
  // Principal-Distributor-Customer relationship
  principalDistributorCustomer: {
    principal: TestDataFactory.createOrganization({
      name: 'Test Principal Co',
      type: 'principal',
      is_principal: true,
      priority: 'A',
      segment: 'Manufacturer'
    }),
    
    distributor: TestDataFactory.createOrganization({
      name: 'Test Distributor Inc',
      type: 'distributor',
      is_distributor: true,
      priority: 'B',
      segment: 'Distribution'
    }),
    
    customer: TestDataFactory.createOrganization({
      name: 'Test Customer Restaurant',
      type: 'customer',
      priority: 'B',
      segment: 'Restaurant'
    })
  },

  // Form validation test cases
  invalidData: {
    organization: {
      empty_name: TestDataFactory.createOrganization({ name: '' }),
      invalid_type: { ...TestDataFactory.createOrganization(), type: 'invalid_type' as any },
      invalid_priority: { ...TestDataFactory.createOrganization(), priority: 'Z' as any },
      long_name: TestDataFactory.createOrganization({ name: 'A'.repeat(256) }),
    },
    
    contact: {
      empty_first_name: (orgId: string) => TestDataFactory.createContact(orgId, { first_name: '' }),
      empty_last_name: (orgId: string) => TestDataFactory.createContact(orgId, { last_name: '' }),
      invalid_email: (orgId: string) => TestDataFactory.createContact(orgId, { email: 'invalid-email' }),
      invalid_role: (orgId: string) => ({ ...TestDataFactory.createContact(orgId), role: 'invalid_role' as any }),
    },
    
    product: {
      empty_name: (principalId: string) => TestDataFactory.createProduct(principalId, { name: '' }),
      invalid_category: (principalId: string) => ({ ...TestDataFactory.createProduct(principalId), category: 'invalid_category' as any }),
      negative_price: (principalId: string) => TestDataFactory.createProduct(principalId, { list_price: -10 }),
      invalid_season: (principalId: string) => TestDataFactory.createProduct(principalId, { season_start: 13 }),
    },
    
    opportunity: {
      empty_name: (orgId: string, contactId: string) => TestDataFactory.createOpportunity(orgId, contactId, { name: '' }),
      invalid_stage: (orgId: string, contactId: string) => ({ ...TestDataFactory.createOpportunity(orgId, contactId), stage: 'invalid_stage' as any }),
      invalid_probability: (orgId: string, contactId: string) => TestDataFactory.createOpportunity(orgId, contactId, { probability: 150 }),
      negative_value: (orgId: string, contactId: string) => TestDataFactory.createOpportunity(orgId, contactId, { estimated_value: -1000 }),
    },
    
    interaction: {
      empty_subject: TestDataFactory.createInteraction({ subject: '' }),
      invalid_type: { ...TestDataFactory.createInteraction(), type: 'invalid_type' as any },
      negative_duration: TestDataFactory.createInteraction({ duration_minutes: -30 }),
    }
  }
}

// Expected enum values for validation
export const ExpectedEnums = {
  organization_type: ['customer', 'principal', 'distributor', 'prospect', 'vendor'],
  organization_size: ['small', 'medium', 'large', 'enterprise'],
  contact_role: ['decision_maker', 'influencer', 'buyer', 'end_user', 'gatekeeper', 'champion'],
  product_category: [
    'beverages', 'dairy', 'frozen', 'fresh_produce', 'meat_poultry', 'seafood', 
    'dry_goods', 'spices_seasonings', 'baking_supplies', 'cleaning_supplies', 
    'paper_products', 'equipment'
  ],
  opportunity_stage: [
    'New Lead', 'Initial Outreach', 'Sample/Visit Offered', 'Awaiting Response',
    'Feedback Logged', 'Demo Scheduled', 'Closed - Won', 'Closed - Lost'
  ],
  priority_level: ['low', 'medium', 'high', 'critical'],
  interaction_type: [
    'call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 
    'trade_show', 'site_visit', 'contract_review'
  ]
}

// Expected table schemas
export const ExpectedSchemas = {
  organizations: [
    'id', 'name', 'type', 'description', 'phone', 'email', 'website',
    'address_line_1', 'address_line_2', 'city', 'state_province', 'postal_code', 'country',
    'industry', 'size', 'annual_revenue', 'employee_count', 'is_active', 'notes',
    'priority', 'segment', 'is_principal', 'is_distributor', 'parent_organization_id',
    'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
  ],
  
  contacts: [
    'id', 'organization_id', 'first_name', 'last_name', 'title', 'role',
    'email', 'phone', 'mobile_phone', 'department', 'linkedin_url',
    'decision_authority', 'purchase_influence', 'is_primary_contact', 'notes',
    'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
  ],
  
  products: [
    'id', 'principal_id', 'name', 'category', 'description', 'sku',
    'unit_of_measure', 'unit_cost', 'list_price', 'min_order_quantity',
    'season_start', 'season_end', 'shelf_life_days', 'storage_requirements',
    'specifications', 'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
  ],
  
  opportunities: [
    'id', 'name', 'organization_id', 'contact_id', 'principal_organization_id',
    'distributor_organization_id', 'stage', 'priority', 'estimated_value',
    'estimated_close_date', 'actual_close_date', 'probability', 'description',
    'next_action', 'next_action_date', 'competition', 'decision_criteria',
    'opportunity_context', 'founding_interaction_id', 'auto_generated_name',
    'notes', 'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
  ],
  
  interactions: [
    'id', 'type', 'subject', 'description', 'interaction_date', 'duration_minutes',
    'contact_id', 'organization_id', 'opportunity_id', 'follow_up_required',
    'follow_up_date', 'follow_up_notes', 'outcome', 'attachments',
    'deleted_at', 'created_at', 'updated_at', 'created_by', 'updated_by'
  ]
}