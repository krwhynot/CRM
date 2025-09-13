// Principal CRM Validation Schemas
// This file imports and re-exports validation schemas from individual entity type files
// to maintain backward compatibility while supporting the new Principal CRM structure

import { contactSchema } from './contact.types'
import { organizationSchema } from './organization.types'
import { opportunitySchema, multiPrincipalOpportunitySchema } from './opportunity.types'
import { interactionSchema, interactionWithOpportunitySchema } from './interaction.types'
import { PRODUCT_CATEGORIES } from '@/constants/product.constants'
import { z } from 'zod'
import { ZodTransforms } from '@/lib/form-transforms'

// Re-export schemas for easy access
export {
  contactSchema,
  organizationSchema,
  opportunitySchema,
  multiPrincipalOpportunitySchema,
  interactionSchema,
  interactionWithOpportunitySchema,
}

// Product validation schema - enhanced with principal mode selection
export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(255, 'Name must be 255 characters or less'),
    principal_id: z
      .string()
      .uuid('Invalid principal ID')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
    category: z
      .string()
      .min(1, 'Category is required')
      .refine((val) => PRODUCT_CATEGORIES.includes(val as (typeof PRODUCT_CATEGORIES)[number]), 'Invalid category'),
    description: z
      .string()
      .max(1000, 'Description must be 1000 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
    sku: z
      .string()
      .max(100, 'SKU must be 100 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
    unit_of_measure: z
      .string()
      .max(50, 'Unit of measure must be 50 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
    unit_cost: z
      .union([z.number().positive('Unit cost must be positive'), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === '') return null
        const num = typeof val === 'string' ? Number(val) : val
        return isNaN(num) ? null : num
      }),
    list_price: z
      .union([z.number().positive('List price must be positive'), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === '') return null
        const num = typeof val === 'string' ? Number(val) : val
        return isNaN(num) ? null : num
      }),
    min_order_quantity: z
      .union([z.number().positive('Minimum order quantity must be positive').int('Minimum order quantity must be a whole number'), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === '') return null
        const num = typeof val === 'string' ? Number(val) : val
        return isNaN(num) ? null : num
      }),
    season_start: z
      .union([z.number().int('Season start must be a month (1-12)').min(1, 'Season start must be between 1-12').max(12, 'Season start must be between 1-12'), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === '') return null
        const num = typeof val === 'string' ? Number(val) : val
        return isNaN(num) ? null : num
      }),
    season_end: z
      .union([z.number().int('Season end must be a month (1-12)').min(1, 'Season end must be between 1-12').max(12, 'Season end must be between 1-12'), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === '') return null
        const num = typeof val === 'string' ? Number(val) : val
        return isNaN(num) ? null : num
      }),
    shelf_life_days: z
      .union([z.number().positive('Shelf life must be positive').int('Shelf life must be a whole number'), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === '') return null
        const num = typeof val === 'string' ? Number(val) : val
        return isNaN(num) ? null : num
      }),
    storage_requirements: z
      .string()
      .max(500, 'Storage requirements must be 500 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
    specifications: z
      .string()
      .max(1000, 'Specifications must be 1000 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),

    // PRINCIPAL MODE FIELDS for new principal creation
    principal_mode: z
      .enum(['existing', 'new'] as const, {
        errorMap: () => ({ message: 'Invalid principal mode' })
      })
      .default('existing'),
    principal_name: z
      .string()
      .max(255, 'Principal name must be 255 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
    principal_segment: z
      .string()
      .max(100, 'Principal segment must be 100 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
    principal_phone: z
      .string()
      .max(50, 'Phone must be 50 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
    principal_email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email must be 255 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.normalizeEmail),
    principal_website: z
      .string()
      .url('Invalid website URL')
      .max(255, 'Website must be 255 characters or less')
      .optional()
      .or(z.literal(''))
      .transform(ZodTransforms.emptyStringToNull),
  })
  .refine(
    (data) => {
      if (data.principal_mode === 'existing') {
        return data.principal_id !== null && data.principal_id !== ''
      }
      return true
    },
    {
      message: 'Principal organization is required',
      path: ['principal_id'],
    }
  )
  .refine(
    (data) => {
      if (data.principal_mode === 'new') {
        return data.principal_name !== null && data.principal_name !== ''
      }
      return true
    },
    {
      message: 'Principal name is required',
      path: ['principal_name'],
    }
  )

// Supporting schemas for junction tables and relationships
export const opportunityProductSchema = z.object({
  opportunity_id: z
    .string()
    .uuid('Invalid opportunity ID')
    .min(1, 'Opportunity is required'),
  product_id: z
    .string()
    .uuid('Invalid product ID')
    .min(1, 'Product is required'),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .min(1, 'Quantity is required'),
  unit_price: z
    .union([z.number().positive('Unit price must be positive'), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return null
      const num = typeof val === 'string' ? Number(val) : val
      return isNaN(num) ? null : num
    }),
  extended_price: z
    .union([z.number().positive('Extended price must be positive'), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return null
      const num = typeof val === 'string' ? Number(val) : val
      return isNaN(num) ? null : num
    }),
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),
})

export const contactPreferredPrincipalSchema = z.object({
  contact_id: z
    .string()
    .uuid('Invalid contact ID')
    .min(1, 'Contact is required'),
  principal_organization_id: z
    .string()
    .uuid('Invalid principal organization ID')
    .min(1, 'Principal organization is required'),
  advocacy_strength: z
    .union([z.number().min(1, 'Advocacy strength must be between 1-10').max(10, 'Advocacy strength must be between 1-10'), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return null
      const num = typeof val === 'string' ? Number(val) : val
      return isNaN(num) ? null : num
    }),
  relationship_type: z
    .string()
    .max(100, 'Relationship type must be 100 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),
  advocacy_notes: z
    .string()
    .max(500, 'Advocacy notes must be 500 characters or less')
    .optional()
    .or(z.literal(''))
    .transform(ZodTransforms.emptyStringToNull),
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
  contactPreferredPrincipal: contactPreferredPrincipalSchema,
}

// Re-export type inferences from individual entity files
export type { ContactFormData } from './contact.types'
export type { OrganizationFormData } from './organization.types'
export type { OpportunityFormData, MultiPrincipalOpportunityFormData } from './opportunity.types'
export type { InteractionFormData, InteractionWithOpportunityFormData } from './interaction.types'

// Supporting form data types
export type ProductFormData = z.infer<typeof productSchema>
export type OpportunityProductFormData = z.infer<typeof opportunityProductSchema>
export type ContactPreferredPrincipalFormData = z.infer<typeof contactPreferredPrincipalSchema>
