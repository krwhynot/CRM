/**
 * Constants Index
 *
 * Centralized exports for all constants in the CRM system.
 * Provides clean imports and prevents react-refresh violations.
 */

// Opportunity constants
export {
  OPPORTUNITY_CONTEXTS,
  OPPORTUNITY_STAGES,
  VALID_DB_STAGES,
  type OpportunityContext,
  type OpportunityStageValue,
  type DatabaseOpportunityStage,
} from './opportunity.constants'

// Organization constants
export {
  ORGANIZATION_TYPES,
  PRIORITY_VALUES,
  VALID_ORGANIZATION_TYPES,
  type OrganizationType,
  type PriorityValue,
} from './organization.constants'

// Product constants
export { PRODUCT_CATEGORIES, type ProductCategory } from './product.constants'

// Interaction constants
export { INTERACTION_TYPES, type InteractionType } from './interaction.constants'
