import * as yup from 'yup'
import { Constants } from './database.types'

// Organization validation schema
export const organizationSchema = yup.object({
  name: yup.string().required('Organization name is required').max(255, 'Name must be 255 characters or less'),
  type: yup.string().oneOf(Constants.public.Enums.organization_type, 'Invalid organization type').required('Organization type is required'),
  description: yup.string().max(500, 'Description must be 500 characters or less').nullable(),
  phone: yup.string().max(50, 'Phone must be 50 characters or less').nullable(),
  email: yup.string().email('Invalid email format').max(255, 'Email must be 255 characters or less').nullable(),
  website: yup.string().url('Invalid website URL').max(255, 'Website must be 255 characters or less').nullable(),
  address_line_1: yup.string().max(255, 'Address line 1 must be 255 characters or less').nullable(),
  address_line_2: yup.string().max(255, 'Address line 2 must be 255 characters or less').nullable(),
  city: yup.string().max(100, 'City must be 100 characters or less').nullable(),
  state_province: yup.string().max(100, 'State/Province must be 100 characters or less').nullable(),
  postal_code: yup.string().max(20, 'Postal code must be 20 characters or less').nullable(),
  country: yup.string().max(100, 'Country must be 100 characters or less').nullable(),
  industry: yup.string().max(100, 'Industry must be 100 characters or less').nullable(),
  size: yup.string().oneOf([...Constants.public.Enums.organization_size, 'not_specified'], 'Invalid organization size').nullable(),
  annual_revenue: yup.number().positive('Annual revenue must be positive').nullable(),
  employee_count: yup.number().positive('Employee count must be positive').integer('Employee count must be a whole number').nullable(),
  notes: yup.string().max(1000, 'Notes must be 1000 characters or less').nullable()
})

// Contact validation schema
export const contactSchema = yup.object({
  first_name: yup.string().required('First name is required').max(100, 'First name must be 100 characters or less'),
  last_name: yup.string().required('Last name is required').max(100, 'Last name must be 100 characters or less'),
  organization_id: yup.string().uuid('Invalid organization ID').required('Organization is required'),
  title: yup.string().max(100, 'Title must be 100 characters or less').nullable(),
  role: yup.string().oneOf(Constants.public.Enums.contact_role, 'Invalid contact role').nullable(),
  email: yup.string().email('Invalid email format').max(255, 'Email must be 255 characters or less').nullable(),
  phone: yup.string().max(50, 'Phone must be 50 characters or less').nullable(),
  mobile_phone: yup.string().max(50, 'Mobile phone must be 50 characters or less').nullable(),
  department: yup.string().max(100, 'Department must be 100 characters or less').nullable(),
  linkedin_url: yup.string().url('Invalid LinkedIn URL').max(255, 'LinkedIn URL must be 255 characters or less').nullable(),
  is_primary_contact: yup.boolean().default(false),
  notes: yup.string().max(1000, 'Notes must be 1000 characters or less').nullable()
})

// Product validation schema
export const productSchema = yup.object({
  name: yup.string().required('Product name is required').max(255, 'Name must be 255 characters or less'),
  principal_id: yup.string().uuid('Invalid principal ID').required('Principal organization is required'),
  category: yup.string().oneOf(Constants.public.Enums.product_category, 'Invalid product category').required('Category is required'),
  description: yup.string().max(1000, 'Description must be 1000 characters or less').nullable(),
  sku: yup.string().max(100, 'SKU must be 100 characters or less').nullable(),
  unit_of_measure: yup.string().max(50, 'Unit of measure must be 50 characters or less').nullable(),
  unit_cost: yup.number().positive('Unit cost must be positive').nullable(),
  list_price: yup.number().positive('List price must be positive').nullable(),
  min_order_quantity: yup.number().positive('Minimum order quantity must be positive').integer('Minimum order quantity must be a whole number').nullable(),
  season_start: yup.number().integer('Season start must be a month (1-12)').min(1, 'Season start must be between 1-12').max(12, 'Season start must be between 1-12').nullable(),
  season_end: yup.number().integer('Season end must be a month (1-12)').min(1, 'Season end must be between 1-12').max(12, 'Season end must be between 1-12').nullable(),
  shelf_life_days: yup.number().positive('Shelf life must be positive').integer('Shelf life must be a whole number').nullable(),
  storage_requirements: yup.string().max(500, 'Storage requirements must be 500 characters or less').nullable(),
  specifications: yup.string().max(1000, 'Specifications must be 1000 characters or less').nullable()
})

// Opportunity validation schema
export const opportunitySchema = yup.object({
  name: yup.string().required('Opportunity name is required').max(255, 'Name must be 255 characters or less'),
  organization_id: yup.string().uuid('Invalid organization ID').required('Organization is required'),
  contact_id: yup.string().uuid('Invalid contact ID').nullable(),
  stage: yup.string().oneOf(Constants.public.Enums.opportunity_stage, 'Invalid opportunity stage').required('Stage is required'),
  priority: yup.string().oneOf(Constants.public.Enums.priority_level, 'Invalid priority level').nullable(),
  estimated_value: yup.number().positive('Value must be positive').nullable(),
  probability: yup.number().min(0, 'Probability must be between 0-100').max(100, 'Probability must be between 0-100').nullable(),
  estimated_close_date: yup.string().nullable(),
  actual_close_date: yup.string().nullable(),
  description: yup.string().max(1000, 'Description must be 1000 characters or less').nullable(),
  competition: yup.string().max(500, 'Competition must be 500 characters or less').nullable(),
  decision_criteria: yup.string().max(1000, 'Decision criteria must be 1000 characters or less').nullable(),
  next_action: yup.string().max(500, 'Next action must be 500 characters or less').nullable(),
  next_action_date: yup.string().nullable(),
  notes: yup.string().max(1000, 'Notes must be 1000 characters or less').nullable(),
  principal_organization_id: yup.string().uuid('Invalid principal organization ID').nullable(),
  distributor_organization_id: yup.string().uuid('Invalid distributor organization ID').nullable(),
  founding_interaction_id: yup.string().uuid('Invalid founding interaction ID').nullable()
})

// Interaction validation schema
export const interactionSchema = yup.object({
  subject: yup.string().required('Subject is required').max(255, 'Subject must be 255 characters or less'),
  type: yup.string().oneOf(Constants.public.Enums.interaction_type, 'Invalid interaction type').required('Interaction type is required'),
  organization_id: yup.string().uuid('Invalid organization ID').nullable(),
  contact_id: yup.string().uuid('Invalid contact ID').nullable(),
  opportunity_id: yup.string().uuid('Invalid opportunity ID').nullable(),
  interaction_date: yup.string().required('Interaction date is required'),
  duration_minutes: yup.number().positive('Duration must be positive').integer('Duration must be a whole number').nullable(),
  description: yup.string().max(1000, 'Description must be 1000 characters or less').nullable(),
  outcome: yup.string().max(500, 'Outcome must be 500 characters or less').nullable(),
  follow_up_required: yup.boolean().default(false),
  follow_up_date: yup.string().nullable(),
  follow_up_notes: yup.string().max(500, 'Follow up notes must be 500 characters or less').nullable(),
  attachments: yup.array().of(yup.string()).nullable()
})

// Interaction with Opportunity Creation validation schema
export const interactionWithOpportunitySchema = yup.object({
  ...interactionSchema.fields,
  create_opportunity: yup.boolean().default(false),
  opportunity_name: yup.string()
    .max(255, 'Opportunity name must be 255 characters or less')
    .when('create_opportunity', {
      is: true,
      then: (schema) => schema.required('Opportunity name is required when creating opportunity'),
      otherwise: (schema) => schema.nullable()
    }),
  opportunity_stage: yup.string()
    .oneOf(Constants.public.Enums.opportunity_stage, 'Invalid opportunity stage')
    .when('create_opportunity', {
      is: true,
      then: (schema) => schema.required('Opportunity stage is required when creating opportunity'),
      otherwise: (schema) => schema.nullable()
    }),
  opportunity_priority: yup.string()
    .oneOf(Constants.public.Enums.priority_level, 'Invalid priority level')
    .nullable(),
  opportunity_estimated_value: yup.number()
    .positive('Estimated value must be positive')
    .nullable(),
  opportunity_description: yup.string()
    .max(1000, 'Opportunity description must be 1000 characters or less')
    .nullable()
})

// Opportunity Product validation schema (for opportunity-product junction)
export const opportunityProductSchema = yup.object({
  opportunity_id: yup.string().uuid('Invalid opportunity ID').required('Opportunity is required'),
  product_id: yup.string().uuid('Invalid product ID').required('Product is required'),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  unit_price: yup.number().positive('Unit price must be positive').nullable(),
  extended_price: yup.number().positive('Extended price must be positive').nullable(),
  notes: yup.string().max(500, 'Notes must be 500 characters or less')
})

// Principal-Distributor Relationship validation schema
export const principalDistributorRelationshipSchema = yup.object({
  principal_id: yup.string().uuid('Invalid principal ID').required('Principal organization is required'),
  distributor_id: yup.string().uuid('Invalid distributor ID').required('Distributor organization is required'),
  territory: yup.string().max(255, 'Territory must be 255 characters or less'),
  commission_rate: yup.number().min(0, 'Commission rate must be between 0-100').max(100, 'Commission rate must be between 0-100').nullable(),
  contract_start_date: yup.date().nullable(),
  contract_end_date: yup.date().min(yup.ref('contract_start_date'), 'Contract end date must be after start date').nullable(),
  is_active: yup.boolean().default(true),
  terms: yup.string().max(1000, 'Terms must be 1000 characters or less')
})

// Export all schemas for easy use
export const validationSchemas = {
  organization: organizationSchema,
  contact: contactSchema,
  product: productSchema,
  opportunity: opportunitySchema,
  interaction: interactionSchema,
  interactionWithOpportunity: interactionWithOpportunitySchema,
  opportunityProduct: opportunityProductSchema,
  principalDistributorRelationship: principalDistributorRelationshipSchema
}

// Type inference for form data
export type OrganizationFormData = yup.InferType<typeof organizationSchema>
export type ContactFormData = yup.InferType<typeof contactSchema>
export type ProductFormData = yup.InferType<typeof productSchema>
export type OpportunityFormData = yup.InferType<typeof opportunitySchema>
export type InteractionFormData = yup.InferType<typeof interactionSchema>
export type InteractionWithOpportunityFormData = yup.InferType<typeof interactionWithOpportunitySchema>
export type OpportunityProductFormData = yup.InferType<typeof opportunityProductSchema>
export type PrincipalDistributorRelationshipFormData = yup.InferType<typeof principalDistributorRelationshipSchema>