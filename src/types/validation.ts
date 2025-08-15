// Principal CRM Validation Schemas
// This file imports and re-exports validation schemas from individual entity type files
// to maintain backward compatibility while supporting the new Principal CRM structure

import { contactSchema } from './contact.types'
import { organizationSchema } from './organization.types'
import { opportunitySchema, multiPrincipalOpportunitySchema } from './opportunity.types'
import { interactionSchema, interactionWithOpportunitySchema } from './interaction.types'
import * as yup from 'yup'

// Re-export schemas for easy access
export { contactSchema, organizationSchema, opportunitySchema, multiPrincipalOpportunitySchema, interactionSchema, interactionWithOpportunitySchema }

// Product validation schema - kept as-is since products weren't changed in Principal CRM transformation
export const productSchema = yup.object({
  name: yup.string().required('Product name is required').max(255, 'Name must be 255 characters or less'),
  principal_id: yup.string().uuid('Invalid principal ID').required('Principal organization is required'),
  category: yup.string().required('Category is required'),
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





// Supporting schemas for junction tables and relationships
export const opportunityProductSchema = yup.object({
  opportunity_id: yup.string().uuid('Invalid opportunity ID').required('Opportunity is required'),
  product_id: yup.string().uuid('Invalid product ID').required('Product is required'),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  unit_price: yup.number().positive('Unit price must be positive').nullable(),
  extended_price: yup.number().positive('Extended price must be positive').nullable(),
  notes: yup.string().max(500, 'Notes must be 500 characters or less')
})

export const contactPreferredPrincipalSchema = yup.object({
  contact_id: yup.string().uuid('Invalid contact ID').required('Contact is required'),
  principal_organization_id: yup.string().uuid('Invalid principal organization ID').required('Principal organization is required'),
  advocacy_strength: yup.number().min(1, 'Advocacy strength must be between 1-10').max(10, 'Advocacy strength must be between 1-10').nullable(),
  relationship_type: yup.string().max(100, 'Relationship type must be 100 characters or less').nullable(),
  advocacy_notes: yup.string().max(500, 'Advocacy notes must be 500 characters or less').nullable()
})

// Export all schemas for easy use - Principal CRM aligned
export const validationSchemas = {
  // Main entity schemas (from individual type files)
  organization: organizationSchema,
  contact: contactSchema,
  opportunity: opportunitySchema,
  multiPrincipalOpportunity: multiPrincipalOpportunitySchema,
  interaction: interactionSchema,
  interactionWithOpportunity: interactionWithOpportunitySchema,
  
  // Supporting schemas
  product: productSchema,
  opportunityProduct: opportunityProductSchema,
  contactPreferredPrincipal: contactPreferredPrincipalSchema
}

// Re-export type inferences from individual entity files
export type { ContactFormData } from './contact.types'
export type { OrganizationFormData } from './organization.types'
export type { OpportunityFormData, MultiPrincipalOpportunityFormData } from './opportunity.types'
export type { InteractionFormData, InteractionWithOpportunityFormData } from './interaction.types'

// Supporting form data types
export type ProductFormData = yup.InferType<typeof productSchema>
export type OpportunityProductFormData = yup.InferType<typeof opportunityProductSchema>
export type ContactPreferredPrincipalFormData = yup.InferType<typeof contactPreferredPrincipalSchema>