/**
 * Explicit Form Interfaces
 * 
 * These interfaces are designed to work perfectly with React Hook Form
 * while maintaining compatibility with Yup validation schemas.
 * They handle the optionality/nullability differences between Yup and RHF.
 */

/**
 * Contact form interface optimized for React Hook Form
 * Handles nullable vs optional field differences
 */
export interface ContactFormInterface {
  // Required fields
  first_name: string
  last_name: string
  organization_id: string
  purchase_influence: 'High' | 'Medium' | 'Low' | 'Unknown'
  decision_authority: 'Decision Maker' | 'Influencer' | 'End User' | 'Gatekeeper'
  position: string

  // Conditionally required
  custom_position?: string | null

  // Optional fields (can be undefined, null, or value)
  email?: string | null
  title?: string | null
  department?: string | null
  phone?: string | null
  mobile_phone?: string | null
  linkedin_url?: string | null
  is_primary_contact?: boolean
  notes?: string | null

  // Virtual fields
  preferred_principals?: string[]
}

/**
 * Organization form interface optimized for React Hook Form
 */
export interface OrganizationFormInterface {
  // Required fields
  name: string
  type: 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor'
  priority: 'A' | 'B' | 'C' | 'D'
  segment: string

  // Boolean fields (auto-derived from type, but kept for database compatibility)
  is_principal?: boolean
  is_distributor?: boolean

  // Optional fields
  city?: string | null
  state_province?: string | null
  phone?: string | null
  website?: string | null
  account_manager?: string | null
  notes?: string | null
}

/**
 * Opportunity form interface optimized for React Hook Form
 */
export interface OpportunityFormInterface {
  // Required fields
  name: string
  organization_id: string
  estimated_value: number
  stage: string

  // Optional fields
  contact_id?: string | null
  estimated_close_date?: string | null
  description?: string | null
  notes?: string | null

  // Principal CRM fields (optional)
  principals?: string[]
  product_id?: string | null
  opportunity_context?: string | null
  auto_generated_name?: boolean
  principal_id?: string | null
  probability?: number | null
  deal_owner?: string | null
}

/**
 * Default values factory for Contact form interface
 */
export const createContactFormInterfaceDefaults = (
  preselectedOrganization?: string,
  initialData?: Partial<ContactFormInterface>
): ContactFormInterface => ({
  first_name: '',
  last_name: '',
  organization_id: preselectedOrganization || '',
  purchase_influence: 'Unknown',
  decision_authority: 'Gatekeeper',
  position: '',
  custom_position: null,
  email: null,
  title: null,
  department: null,
  phone: null,
  mobile_phone: null,
  linkedin_url: null,
  is_primary_contact: false,
  notes: null,
  preferred_principals: [],
  ...initialData
})

/**
 * Default values factory for Organization form interface
 */
export const createOrganizationFormInterfaceDefaults = (
  initialData?: Partial<OrganizationFormInterface>
): OrganizationFormInterface => {
  // Start with base data including any provided initial data
  const baseData = {
    name: '',
    type: 'customer' as const,
    priority: 'C' as const,
    segment: '',
    city: null,
    state_province: null,
    phone: null,
    website: null,
    account_manager: null,
    notes: null,
    ...initialData
  }
  
  // Auto-derive boolean flags from the type
  // Import the function dynamically to avoid circular dependencies
  const deriveFlags = (type: string) => ({
    is_principal: type === 'principal',
    is_distributor: type === 'distributor'
  })
  
  const derivedFlags = deriveFlags(baseData.type)
  
  return { ...baseData, ...derivedFlags }
}

/**
 * Default values factory for Opportunity form interface
 */
export const createOpportunityFormInterfaceDefaults = (
  preselectedOrganization?: string,
  initialData?: Partial<OpportunityFormInterface>
): OpportunityFormInterface => ({
  name: '',
  organization_id: preselectedOrganization || '',
  estimated_value: 0,
  stage: 'Discovery',
  contact_id: null,
  estimated_close_date: null,
  description: null,
  notes: null,
  principals: [],
  product_id: null,
  opportunity_context: null,
  auto_generated_name: false,
  principal_id: null,
  probability: null,
  deal_owner: null,
  ...initialData
})

/**
 * Type guards for form interfaces
 */
export const isContactFormInterface = (data: unknown): data is ContactFormInterface => {
  return (
    data &&
    typeof data === 'object' &&
    data !== null &&
    'first_name' in data &&
    'last_name' in data &&
    'organization_id' in data &&
    typeof (data as Record<string, unknown>).first_name === 'string' &&
    typeof (data as Record<string, unknown>).last_name === 'string' &&
    typeof (data as Record<string, unknown>).organization_id === 'string'
  )
}

export const isOrganizationFormInterface = (data: unknown): data is OrganizationFormInterface => {
  return (
    data &&
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'type' in data &&
    'priority' in data &&
    typeof (data as Record<string, unknown>).name === 'string' &&
    typeof (data as Record<string, unknown>).type === 'string' &&
    typeof (data as Record<string, unknown>).priority === 'string'
  )
}

export const isOpportunityFormInterface = (data: unknown): data is OpportunityFormInterface => {
  return (
    data &&
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'organization_id' in data &&
    'estimated_value' in data &&
    typeof (data as Record<string, unknown>).name === 'string' &&
    typeof (data as Record<string, unknown>).organization_id === 'string' &&
    typeof (data as Record<string, unknown>).estimated_value === 'number'
  )
}