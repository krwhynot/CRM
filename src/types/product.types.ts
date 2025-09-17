import { z } from 'zod'
import { ZodTransforms } from '@/lib/form-transforms'
import { PRODUCT_CATEGORIES } from '@/constants/product.constants'
import type { Database } from '../lib/database.types'

// Base product types from database
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

// Product category type
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

// Base product schema without principal mode logic
const baseProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Name must be 255 characters or less'),

  category: z.enum(PRODUCT_CATEGORIES as readonly [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),

  description: ZodTransforms.nullableString.refine((val) => !val || val.length <= 1000, {
    message: 'Description must be 1000 characters or less',
  }),

  sku: ZodTransforms.nullableString.refine((val) => !val || val.length <= 100, {
    message: 'SKU must be 100 characters or less',
  }),

  unit_of_measure: ZodTransforms.nullableString.refine((val) => !val || val.length <= 50, {
    message: 'Unit of measure must be 50 characters or less',
  }),

  unit_cost: ZodTransforms.nullableNumber.refine((val) => val === null || val > 0, {
    message: 'Unit cost must be positive',
  }),

  list_price: ZodTransforms.nullableNumber.refine((val) => val === null || val > 0, {
    message: 'List price must be positive',
  }),

  min_order_quantity: ZodTransforms.nullableNumber.refine(
    (val) => val === null || (val > 0 && Number.isInteger(val)),
    { message: 'Minimum order quantity must be a positive whole number' }
  ),

  season_start: ZodTransforms.nullableNumber.refine(
    (val) => val === null || (Number.isInteger(val) && val >= 1 && val <= 12),
    { message: 'Season start must be a month (1-12)' }
  ),

  season_end: ZodTransforms.nullableNumber.refine(
    (val) => val === null || (Number.isInteger(val) && val >= 1 && val <= 12),
    { message: 'Season end must be a month (1-12)' }
  ),

  shelf_life_days: ZodTransforms.nullableNumber.refine(
    (val) => val === null || (val > 0 && Number.isInteger(val)),
    { message: 'Shelf life must be a positive whole number' }
  ),

  storage_requirements: ZodTransforms.nullableString.refine((val) => !val || val.length <= 500, {
    message: 'Storage requirements must be 500 characters or less',
  }),

  specifications: ZodTransforms.nullableString.refine((val) => !val || val.length <= 1000, {
    message: 'Specifications must be 1000 characters or less',
  }),
})

// Existing principal mode - only requires principal_id
const existingPrincipalSchema = z.object({
  principal_mode: z.literal('existing'),
  principal_id: z.string().uuid('Invalid principal ID'),

  // Optional fields for existing mode (all nullable)
  principal_name: z.null().optional(),
  principal_segment: z.null().optional(),
  principal_phone: z.null().optional(),
  principal_email: z.null().optional(),
  principal_website: z.null().optional(),
})

// New principal mode - requires principal_name, others optional
const newPrincipalSchema = z.object({
  principal_mode: z.literal('new'),
  principal_id: z.null().optional(),

  principal_name: z
    .string()
    .min(1, 'Principal name is required')
    .max(255, 'Principal name must be 255 characters or less'),

  principal_segment: ZodTransforms.nullableString.refine((val) => !val || val.length <= 100, {
    message: 'Principal segment must be 100 characters or less',
  }),

  principal_phone: ZodTransforms.nullableString.refine((val) => !val || val.length <= 50, {
    message: 'Phone must be 50 characters or less',
  }),

  principal_email: ZodTransforms.nullableEmail.refine((val) => !val || val.length <= 255, {
    message: 'Email must be 255 characters or less',
  }),

  principal_website: ZodTransforms.nullableUrl.refine((val) => !val || val.length <= 255, {
    message: 'Website must be 255 characters or less',
  }),
})

// Product schema using discriminated union for principal mode switching
export const productZodSchema = z.intersection(
  baseProductSchema,
  z.discriminatedUnion('principal_mode', [existingPrincipalSchema, newPrincipalSchema])
)

// Type inference from Zod schema
export type ProductZodFormData = z.infer<typeof productZodSchema>

// Supporting schemas for junction tables and relationships
export const opportunityProductZodSchema = z.object({
  opportunity_id: z.string().uuid('Invalid opportunity ID'),
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: ZodTransforms.nullableNumber.refine((val) => val === null || val > 0, {
    message: 'Unit price must be positive',
  }),
  notes: ZodTransforms.nullableString.refine((val) => !val || val.length <= 500, {
    message: 'Notes must be 500 characters or less',
  }),
})

export type OpportunityProductZodFormData = z.infer<typeof opportunityProductZodSchema>

// Product constants
export { PRODUCT_CATEGORIES } from '@/constants/product.constants'

// Export default schema for backward compatibility
export default productZodSchema
