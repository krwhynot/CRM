/**
 * Principal CRM Validation Schemas - Central Exports
 *
 * Simplified validation exports using Zod schemas from consolidated schema files.
 * Migration from Yup to Zod has been completed.
 */

// Direct Zod schema imports from consolidated schema files
export {
  productZodSchema,
  opportunityProductZodSchema,
} from './product.types'

export {
  organizationZodSchema,
  organizationCreateSchema,
  organizationUpdateSchema,
} from './organization.types'

export {
  contactZodSchema,
  contactCreateSchema,
  contactUpdateSchema,
  contactPreferredPrincipalZodSchema,
} from './contact.types'

export {
  opportunityZodSchema,
  multiPrincipalOpportunityZodSchema,
} from './opportunity.types'

export {
  interactionSchema,
  interactionWithOpportunitySchema,
} from './interaction.types'

// Re-export Zod types for development
export type { ProductZodFormData, OpportunityProductZodFormData } from './product.types'
export type {
  OrganizationZodFormData,
  OrganizationCreateFormData,
  OrganizationUpdateFormData,
} from './organization.types'
export type {
  ContactZodFormData,
  ContactCreateFormData,
  ContactUpdateFormData,
  ContactPreferredPrincipalFormData,
} from './contact.types'
export type {
  OpportunityZodFormData,
  MultiPrincipalOpportunityZodFormData,
} from './opportunity.types'
export type {
  InteractionFormData,
  InteractionWithOpportunityFormData,
} from './interaction.types'

// Legacy type aliases for backward compatibility
export type { ContactZodFormData as ContactFormData } from './contact.types'
export type { OrganizationZodFormData as OrganizationFormData } from './organization.types'
export type { OpportunityZodFormData as OpportunityFormData, MultiPrincipalOpportunityZodFormData as MultiPrincipalOpportunityFormData } from './opportunity.types'
// InteractionFormData and InteractionWithOpportunityFormData are already exported above
export type { ProductZodFormData as ProductFormData } from './product.types'
export type { OpportunityProductZodFormData as OpportunityProductFormData } from './product.types'
// Convenience schema aliases
export { productZodSchema as productSchema } from './product.types'
export { opportunityProductZodSchema as opportunityProductSchema } from './product.types'
export { organizationZodSchema as organizationSchema } from './organization.types'
export { contactZodSchema as contactSchema } from './contact.types'
export { opportunityZodSchema as opportunitySchema } from './opportunity.types'
export { multiPrincipalOpportunityZodSchema as multiPrincipalOpportunitySchema } from './opportunity.types'
// interactionSchema and interactionWithOpportunitySchema already exported above
export { contactPreferredPrincipalZodSchema as contactPreferredPrincipalSchema } from './contact.types'
