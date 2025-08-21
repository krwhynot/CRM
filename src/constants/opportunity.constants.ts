/**
 * Opportunity Constants
 * 
 * Extracted constants to prevent react-refresh violations and improve maintainability
 */

export const OPPORTUNITY_CONTEXTS = [
  'Site Visit',
  'Food Show', 
  'New Product Interest',
  'Follow-up',
  'Demo Request',
  'Sampling',
  'Custom'
] as const

export const OPPORTUNITY_STAGES = [
  { display: 'New Lead', value: 'lead' },
  { display: 'Qualified', value: 'qualified' },
  { display: 'Proposal', value: 'proposal' },
  { display: 'Negotiation', value: 'negotiation' },
  { display: 'Closed - Won', value: 'closed_won' },
  { display: 'Closed - Lost', value: 'closed_lost' }
] as const

export type OpportunityContext = typeof OPPORTUNITY_CONTEXTS[number]
export type OpportunityStageValue = typeof OPPORTUNITY_STAGES[number]['value']

export const VALID_DB_STAGES = [
  'lead',
  'qualified', 
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
] as const

export type DatabaseOpportunityStage = typeof VALID_DB_STAGES[number]