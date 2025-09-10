import { z } from 'zod'

// Common validation patterns
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/
const zipCodeRegex = /^[0-9]{5}(-[0-9]{4})?$/

// Base address schema
const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Address line 1 is required').max(100, 'Address line 1 must be less than 100 characters'),
  addressLine2: z.string().max(100, 'Address line 2 must be less than 100 characters').optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
  state: z.string().min(2, 'State is required').max(3, 'State must be 2-3 characters'),
  zipCode: z.string().regex(zipCodeRegex, 'Invalid ZIP code format').optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required').max(50, 'Country must be less than 50 characters').default('United States')
})

// Contact validation schema
export const contactFormSchema = z.object({
  // Basic Information
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  title: z.string()
    .max(100, 'Title must be less than 100 characters')
    .optional().or(z.literal('')),
  
  department: z.string()
    .max(50, 'Department must be less than 50 characters')
    .optional().or(z.literal('')),

  // Contact Information
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: z.string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional().or(z.literal('')),
  
  mobilePhone: z.string()
    .regex(phoneRegex, 'Invalid mobile phone number format')
    .optional().or(z.literal('')),

  // Organization Association
  organizationId: z.string().uuid('Invalid organization ID').optional(),
  
  // Status and Priority
  status: z.enum(['active', 'inactive', 'pending'], {
    required_error: 'Status is required'
  }),
  
  priority: z.enum(['a-plus', 'a', 'b', 'c', 'd'], {
    required_error: 'Priority is required'
  }),

  // Additional Information
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional().or(z.literal('')),
  
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),

  // Communication Preferences
  preferredContactMethod: z.enum(['email', 'phone', 'mobile'], {
    required_error: 'Preferred contact method is required'
  }).optional(),
  
  marketingOptIn: z.boolean().default(false),
  
  // Social Media
  linkedinUrl: z.string()
    .regex(urlRegex, 'Invalid LinkedIn URL')
    .optional().or(z.literal('')),

  // Address
  address: addressSchema.optional(),

  // System fields
  createdBy: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional()
})

// Organization validation schema
export const organizationFormSchema = z.object({
  // Basic Information
  name: z.string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters'),
  
  type: z.enum(['customer', 'distributor', 'principal', 'supplier'], {
    required_error: 'Organization type is required'
  }),

  industry: z.string()
    .max(50, 'Industry must be less than 50 characters')
    .optional().or(z.literal('')),

  // Contact Information
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters')
    .optional().or(z.literal('')),
  
  phone: z.string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional().or(z.literal('')),
  
  website: z.string()
    .regex(urlRegex, 'Invalid website URL')
    .optional().or(z.literal('')),

  // Business Information
  taxId: z.string()
    .max(20, 'Tax ID must be less than 20 characters')
    .optional().or(z.literal('')),
  
  employeeCount: z.number()
    .int('Employee count must be a whole number')
    .min(1, 'Employee count must be at least 1')
    .max(1000000, 'Employee count seems unrealistic')
    .optional(),

  annualRevenue: z.number()
    .min(0, 'Annual revenue cannot be negative')
    .max(1000000000000, 'Annual revenue seems unrealistic')
    .optional(),

  // Status and Priority
  status: z.enum(['active', 'inactive', 'pending', 'archived'], {
    required_error: 'Status is required'
  }),
  
  priority: z.enum(['a-plus', 'a', 'b', 'c', 'd'], {
    required_error: 'Priority is required'
  }),

  // Relationship Information
  primaryManagerId: z.string().uuid('Invalid primary manager ID').optional(),
  secondaryManagerId: z.string().uuid('Invalid secondary manager ID').optional(),
  
  parentOrganizationId: z.string().uuid('Invalid parent organization ID').optional(),

  // Additional Information
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional().or(z.literal('')),
  
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional().or(z.literal('')),
  
  tags: z.array(z.string())
    .max(15, 'Maximum 15 tags allowed')
    .optional()
    .default([]),

  // Address
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),

  // System fields
  createdBy: z.string().uuid().optional()
})

// Product validation schema
export const productFormSchema = z.object({
  // Basic Information
  name: z.string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters'),
  
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores'),

  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),

  subcategory: z.string()
    .max(50, 'Subcategory must be less than 50 characters')
    .optional().or(z.literal('')),

  // Pricing
  unitPrice: z.number()
    .min(0.01, 'Unit price must be greater than $0.00')
    .max(1000000, 'Unit price seems unrealistic'),

  costPrice: z.number()
    .min(0, 'Cost price cannot be negative')
    .max(1000000, 'Cost price seems unrealistic')
    .optional(),

  currency: z.string()
    .length(3, 'Currency must be 3 characters (e.g., USD)')
    .default('USD'),

  // Inventory
  stockQuantity: z.number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative')
    .optional(),

  lowStockThreshold: z.number()
    .int('Low stock threshold must be a whole number')
    .min(0, 'Low stock threshold cannot be negative')
    .optional(),

  // Product Details
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),

  specifications: z.string()
    .max(2000, 'Specifications must be less than 2000 characters')
    .optional().or(z.literal('')),

  // Classification
  unit: z.string()
    .min(1, 'Unit is required')
    .max(20, 'Unit must be less than 20 characters'),

  weight: z.number()
    .min(0, 'Weight cannot be negative')
    .optional(),

  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    unit: z.enum(['in', 'cm', 'ft', 'm']).optional()
  }).optional(),

  // Status
  status: z.enum(['active', 'inactive', 'discontinued'], {
    required_error: 'Status is required'
  }),

  // Supplier Information
  supplierId: z.string().uuid('Invalid supplier ID').optional(),
  supplierSku: z.string()
    .max(50, 'Supplier SKU must be less than 50 characters')
    .optional().or(z.literal('')),

  // Additional Information
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),

  // System fields
  createdBy: z.string().uuid().optional()
})

// Opportunity validation schema
export const opportunityFormSchema = z.object({
  // Basic Information
  name: z.string()
    .min(1, 'Opportunity name is required')
    .max(100, 'Opportunity name must be less than 100 characters'),

  organizationId: z.string()
    .uuid('Invalid organization ID')
    .min(1, 'Organization is required'),

  contactId: z.string()
    .uuid('Invalid contact ID')
    .optional(),

  // Financial Information
  value: z.number()
    .min(0.01, 'Opportunity value must be greater than $0.00')
    .max(100000000, 'Opportunity value seems unrealistic'),

  currency: z.string()
    .length(3, 'Currency must be 3 characters (e.g., USD)')
    .default('USD'),

  // Timeline
  expectedCloseDate: z.string()
    .min(1, 'Expected close date is required')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Expected close date must be in the future'
    }),

  // Sales Process
  stage: z.enum([
    'prospecting',
    'qualification', 
    'needs-analysis',
    'proposal',
    'negotiation',
    'closed-won',
    'closed-lost'
  ], {
    required_error: 'Stage is required'
  }),

  probability: z.number()
    .min(0, 'Probability cannot be less than 0%')
    .max(100, 'Probability cannot be more than 100%')
    .int('Probability must be a whole number'),

  // Classification
  type: z.enum(['new-business', 'existing-business', 'renewal', 'upsell'], {
    required_error: 'Opportunity type is required'
  }),

  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Priority is required'
  }),

  source: z.string()
    .max(50, 'Source must be less than 50 characters')
    .optional().or(z.literal('')),

  // Product/Service Information
  products: z.array(z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0.01, 'Unit price must be greater than $0.00'),
    discount: z.number().min(0).max(100).optional()
  })).min(1, 'At least one product is required'),

  // Assignment
  assignedTo: z.string()
    .uuid('Invalid user ID')
    .min(1, 'Sales representative is required'),

  // Additional Information
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional().or(z.literal('')),

  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional().or(z.literal('')),

  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),

  // Competitor Information
  competitors: z.array(z.string())
    .max(5, 'Maximum 5 competitors allowed')
    .optional()
    .default([]),

  // System fields
  createdBy: z.string().uuid().optional()
})

// Interaction validation schema
export const interactionFormSchema = z.object({
  // Basic Information
  type: z.enum([
    'call',
    'email',
    'meeting',
    'demo',
    'proposal',
    'contract',
    'support',
    'follow-up',
    'other'
  ], {
    required_error: 'Interaction type is required'
  }),

  subject: z.string()
    .min(1, 'Subject is required')
    .max(100, 'Subject must be less than 100 characters'),

  // Relationships
  organizationId: z.string()
    .uuid('Invalid organization ID')
    .optional(),

  contactId: z.string()
    .uuid('Invalid contact ID')
    .optional(),

  opportunityId: z.string()
    .uuid('Invalid opportunity ID')
    .optional(),

  // Ensure at least one relationship is specified
}).refine((data) => data.organizationId || data.contactId || data.opportunityId, {
  message: "At least one of organization, contact, or opportunity must be specified",
  path: ['organizationId']
})

export const interactionFormSchemaExtended = interactionFormSchema.extend({
  // Content
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),

  // Outcome
  outcome: z.enum(['positive', 'neutral', 'negative', 'pending'], {
    required_error: 'Outcome is required'
  }),

  // Follow-up
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  followUpNotes: z.string()
    .max(500, 'Follow-up notes must be less than 500 characters')
    .optional().or(z.literal('')),

  // Classification
  direction: z.enum(['inbound', 'outbound'], {
    required_error: 'Direction is required'
  }),

  duration: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(600, 'Duration cannot exceed 600 minutes')
    .optional(),

  // Tags
  tags: z.array(z.string())
    .max(8, 'Maximum 8 tags allowed')
    .optional()
    .default([]),

  // System fields
  createdBy: z.string().uuid().optional(),
  interactionDate: z.string().min(1, 'Interaction date is required')
})

// Form step validation for multi-step forms
export const createFormStepSchema = <T extends z.ZodTypeAny>(
  fullSchema: T,
  stepFields: Array<keyof z.infer<T>>
) => {
  const shape = fullSchema.shape as Record<string, z.ZodTypeAny>
  const stepShape: Record<string, z.ZodTypeAny> = {}
  
  stepFields.forEach(field => {
    if (shape[field as string]) {
      stepShape[field as string] = shape[field as string]
    }
  })
  
  return z.object(stepShape)
}

// Type exports
export type ContactFormData = z.infer<typeof contactFormSchema>
export type OrganizationFormData = z.infer<typeof organizationFormSchema>  
export type ProductFormData = z.infer<typeof productFormSchema>
export type OpportunityFormData = z.infer<typeof opportunityFormSchema>
export type InteractionFormData = z.infer<typeof interactionFormSchemaExtended>
export type AddressData = z.infer<typeof addressSchema>

// Common validation utilities
export const validateEmail = (email: string): boolean => emailRegex.test(email)
export const validatePhone = (phone: string): boolean => phoneRegex.test(phone)
export const validateUrl = (url: string): boolean => urlRegex.test(url)

// Form field options
export const ORGANIZATION_TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'principal', label: 'Principal' },
  { value: 'supplier', label: 'Supplier' }
] as const

export const PRIORITY_LEVELS = [
  { value: 'a-plus', label: 'A+ Priority' },
  { value: 'a', label: 'A Priority' },
  { value: 'b', label: 'B Priority' },
  { value: 'c', label: 'C Priority' },
  { value: 'd', label: 'D Priority' }
] as const

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' }
] as const

export const OPPORTUNITY_STAGES = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'needs-analysis', label: 'Needs Analysis' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' }
] as const

export const INTERACTION_TYPES = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'demo', label: 'Demo/Presentation' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'contract', label: 'Contract' },
  { value: 'support', label: 'Support' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'other', label: 'Other' }
] as const