/**
 * Interaction Constants
 *
 * Extracted constants to prevent react-refresh violations and improve maintainability
 */

export const INTERACTION_TYPES = [
  'call',
  'email',
  'meeting',
  'demo',
  'proposal',
  'follow_up',
  'trade_show',
  'site_visit',
  'contract_review',
] as const

export type InteractionType = (typeof INTERACTION_TYPES)[number]
