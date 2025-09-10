/**
 * Form Placeholders Configuration
 * 
 * Centralized configuration for all form placeholders, validation messages,
 * and default values used throughout the application. This ensures consistency
 * and makes internationalization easier in the future.
 */

// URL Placeholders
export const urlPlaceholders = {
  website: 'https://www.organization.com',
  linkedin: 'https://linkedin.com/in/profile',
  companyLinkedin: 'https://linkedin.com/company/company-name',
  principal: 'https://www.principal.com',
  generic: 'https://example.com',
} as const

// Contact Form Placeholders
export const contactPlaceholders = {
  firstName: 'John',
  lastName: 'Smith',
  title: 'Sales Manager',
  email: 'john.smith@organization.com',
  phone: '+1 (555) 123-4567',
  mobilePhone: '+1 (555) 987-6543',
  officePhone: '+1 (555) 123-4567 ext. 123',
  linkedin: urlPlaceholders.linkedin,
  notes: 'Additional notes about this contact...',
} as const

// Organization Form Placeholders
export const organizationPlaceholders = {
  name: 'Acme Food Services',
  description: 'Leading food service provider...',
  website: urlPlaceholders.website,
  email: 'info@organization.com',
  phone: '+1 (555) 123-4567',
  fax: '+1 (555) 123-4568',
  notes: 'Additional notes about this organization...',
} as const

// Address Placeholders
export const addressPlaceholders = {
  street: '123 Business Ave',
  city: 'Business City',
  state: 'CA',
  postalCode: '12345',
  country: 'United States',
  fullAddress: '123 Business Ave, Business City, CA 12345',
} as const

// Product Form Placeholders
export const productPlaceholders = {
  name: 'Premium Product Name',
  description: 'High-quality product description...',
  sku: 'PRD-001-2024',
  category: 'Food & Beverage',
  principal: urlPlaceholders.principal,
  notes: 'Additional product information...',
} as const

// Opportunity Form Placeholders
export const opportunityPlaceholders = {
  title: 'Q1 2024 Supply Agreement',
  description: 'Comprehensive supply agreement opportunity...',
  value: '50000',
  probability: '75',
  expectedCloseDate: 'Select expected close date',
  notes: 'Additional opportunity details...',
} as const

// Search and Filter Placeholders
export const searchPlaceholders = {
  general: 'Search...',
  organizations: 'Search organizations...',
  contacts: 'Search contacts...',
  products: 'Search products...',
  opportunities: 'Search opportunities...',
  interactions: 'Search interactions...',
  globalSearch: 'Search across all records...',
} as const

// Validation Messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  linkedin: 'Please enter a valid LinkedIn URL',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must not exceed ${max} characters`,
  numeric: 'Please enter a valid number',
  currency: 'Please enter a valid amount',
  percentage: 'Please enter a value between 0 and 100',
  date: 'Please select a valid date',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
} as const

// Form Field Labels (for consistency)
export const fieldLabels = {
  // Common fields
  name: 'Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  website: 'Website',
  description: 'Description',
  notes: 'Notes',
  
  // Organization specific
  organizationType: 'Organization Type',
  industry: 'Industry',
  
  // Contact specific
  title: 'Job Title',
  mobilePhone: 'Mobile Phone',
  officePhone: 'Office Phone',
  linkedin: 'LinkedIn Profile',
  
  // Address fields
  street: 'Street Address',
  city: 'City',
  state: 'State/Province',
  postalCode: 'Postal Code',
  country: 'Country',
  
  // Opportunity specific
  opportunityValue: 'Opportunity Value',
  probability: 'Probability (%)',
  expectedCloseDate: 'Expected Close Date',
  stage: 'Stage',
  
  // Product specific
  sku: 'SKU',
  category: 'Category',
  principal: 'Principal',
} as const

// Default Form Values
export const defaultValues = {
  probability: 50,
  currency: 'USD',
  country: 'United States',
  stage: 'New Lead',
  priority: 'B',
  organizationType: 'Customer',
} as const

// Helper functions for placeholder management
export const getPlaceholder = (field: string, context: 'contact' | 'organization' | 'product' | 'opportunity' | 'search' = 'contact'): string => {
  const placeholderMaps = {
    contact: contactPlaceholders,
    organization: organizationPlaceholders,
    product: productPlaceholders,
    opportunity: opportunityPlaceholders,
    search: searchPlaceholders,
  }
  
  const contextPlaceholders = placeholderMaps[context] as Record<string, string>
  return contextPlaceholders[field] || `Enter ${field}...`
}

export const getValidationMessage = (rule: keyof typeof validationMessages, ...params: unknown[]): string => {
  const message = validationMessages[rule]
  return typeof message === 'function' ? (message as Function)(...params) : message
}