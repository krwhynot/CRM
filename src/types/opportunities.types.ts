/**
 * Opportunity-specific type definitions and utilities
 * 
 * This file provides specialized types for opportunity-related functionality
 * including validation schemas, form types, and business logic interfaces.
 */

import type { 
  Opportunity, 
  OpportunityWithRelations,
  OpportunityListItem,
  OpportunityFilter,
  OpportunityStage,
  PriorityLevel,
  Organization,
  Contact,
  Product,
  OpportunityProduct
} from './entities'

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

/**
 * Opportunity creation form validation schema type
 */
export interface CreateOpportunitySchema {
  organization_id: string
  contact_id: string
  name: string
  description?: string | null
  stage?: OpportunityStage
  priority?: PriorityLevel | null
  estimated_value?: number | null
  probability?: number | null
  estimated_close_date?: string | null
  principal_organization_id?: string | null
  distributor_organization_id?: string | null
  competition?: string | null
  decision_criteria?: string | null
  next_action?: string | null
  next_action_date?: string | null
  notes?: string | null
}

/**
 * Opportunity update form validation schema type
 */
export interface UpdateOpportunitySchema {
  organization_id?: string
  contact_id?: string
  name?: string
  description?: string | null
  stage?: OpportunityStage
  priority?: PriorityLevel | null
  estimated_value?: number | null
  probability?: number | null
  estimated_close_date?: string | null
  actual_close_date?: string | null
  principal_organization_id?: string | null
  distributor_organization_id?: string | null
  competition?: string | null
  decision_criteria?: string | null
  next_action?: string | null
  next_action_date?: string | null
  notes?: string | null
}

// =============================================================================
// BUSINESS LOGIC TYPES
// =============================================================================

/**
 * Opportunity summary for dashboard views
 */
export interface OpportunitySummary {
  id: string
  name: string
  stage: OpportunityStage
  priority: PriorityLevel
  estimated_value: number | null
  weighted_value: number
  probability: number
  expected_close_date: string | null
  organization_name: string
  primary_contact_name: string | null
  days_in_stage: number
  last_activity_date: string | null
  next_steps: string | null
  is_overdue: boolean
}

/**
 * Opportunity with full sales context
 */
export interface OpportunityWithSalesContext extends OpportunityWithRelations {
  sales_metrics?: OpportunitySalesMetrics
  stage_history?: OpportunityStageHistory[]
  competitors?: OpportunityCompetitor[]
  decision_factors?: OpportunityDecisionCriteria[]
  timeline?: OpportunityTimeline[]
}

/**
 * Opportunity sales metrics
 */
export interface OpportunitySalesMetrics {
  opportunity_id: string
  days_in_pipeline: number
  stage_velocity: Record<OpportunityStage, number>
  activity_score: number
  engagement_score: number
  close_probability_score: number
  deal_momentum: 'accelerating' | 'steady' | 'stalling' | 'declining'
  risk_factors: string[]
}

/**
 * Opportunity stage history tracking
 */
export interface OpportunityStageHistory {
  id: string
  opportunity_id: string
  previous_stage: OpportunityStage | null
  new_stage: OpportunityStage
  changed_at: string
  changed_by: string
  days_in_previous_stage: number | null
  notes?: string
  probability_change: number | null
  value_change: number | null
}

/**
 * Competitor tracking for opportunities
 */
export interface OpportunityCompetitor {
  id: string
  opportunity_id: string
  competitor_name: string
  competitor_type: 'direct' | 'indirect' | 'substitute'
  strengths: string[]
  weaknesses: string[]
  estimated_price: number | null
  win_probability: number // 0-100
  status: 'active' | 'eliminated' | 'unknown'
  notes?: string
  last_updated: string
}

/**
 * Decision criteria for opportunity evaluation
 */
export interface OpportunityDecisionCriteria {
  id: string
  opportunity_id: string
  criteria_name: string
  importance_weight: number // 1-10 scale
  our_score: number // 1-10 scale
  competitor_score: number | null // 1-10 scale
  decision_maker: string | null
  notes?: string
  evidence?: string[]
}

/**
 * Opportunity timeline and milestones
 */
export interface OpportunityTimeline {
  id: string
  opportunity_id: string
  milestone_type: 'discovery' | 'demo' | 'proposal' | 'negotiation' | 'decision' | 'closing' | 'other'
  milestone_name: string
  planned_date: string | null
  actual_date: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  description?: string
  responsible_person: string | null
  dependencies?: string[]
}

// =============================================================================
// PIPELINE AND FORECASTING
// =============================================================================

/**
 * Sales pipeline summary
 */
export interface SalesPipeline {
  total_opportunities: number
  total_value: number
  weighted_value: number
  by_stage: Record<OpportunityStage, PipelineStageMetrics>
  by_priority: Record<PriorityLevel, PipelineStageMetrics>
  conversion_rates: Record<OpportunityStage, number>
  average_deal_size: number
  average_sales_cycle: number
  win_rate: number
}

/**
 * Pipeline stage metrics
 */
export interface PipelineStageMetrics {
  count: number
  total_value: number
  weighted_value: number
  average_value: number
  average_days_in_stage: number
  conversion_rate_to_next: number
  conversion_rate_to_closed_won: number
}

/**
 * Sales forecast data
 */
export interface SalesForecast {
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string
  forecasted_revenue: number
  committed_revenue: number
  upside_revenue: number
  pipeline_coverage: number
  confidence_level: 'low' | 'medium' | 'high'
  opportunities_by_stage: Record<OpportunityStage, OpportunityListItem[]>
  risk_factors: string[]
  assumptions: string[]
}

/**
 * Opportunity scoring model
 */
export interface OpportunityScore {
  opportunity_id: string
  total_score: number // 0-100
  components: {
    fit_score: number // Product-market fit
    engagement_score: number // Customer engagement level
    authority_score: number // Decision maker access
    need_score: number // Urgency and pain level
    timeline_score: number // Realistic timeline
    budget_score: number // Budget availability
  }
  recommendations: string[]
  risk_level: 'low' | 'medium' | 'high'
  next_best_actions: string[]
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

/**
 * Opportunity card display props
 */
export interface OpportunityCardProps {
  opportunity: OpportunityListItem
  showOrganization?: boolean
  showProducts?: boolean
  showActions?: boolean
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onDelete?: (id: string) => void
  onStageChange?: (id: string, stage: OpportunityStage) => void
}

/**
 * Opportunity table column configuration
 */
export interface OpportunityTableColumn {
  key: keyof OpportunityListItem | 'actions'
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any, row: OpportunityListItem) => string | number
}

/**
 * Opportunity form section configuration
 */
export interface OpportunityFormSection {
  id: string
  title: string
  description?: string
  fields: Array<keyof CreateOpportunitySchema>
  collapsible?: boolean
  defaultOpen?: boolean
  conditional?: (data: Partial<CreateOpportunitySchema>) => boolean
}

/**
 * Kanban board configuration for opportunity pipeline
 */
export interface OpportunityKanbanColumn {
  stage: OpportunityStage
  title: string
  color: string
  opportunities: OpportunityListItem[]
  metrics: {
    count: number
    total_value: number
    average_days: number
  }
  allowDrop?: boolean
}

/**
 * Opportunity timeline view props
 */
export interface OpportunityTimelineProps {
  opportunities: OpportunityWithSalesContext[]
  groupBy: 'stage' | 'priority' | 'principal' | 'close_date'
  showMilestones?: boolean
  showActivities?: boolean
  dateRange: { start: string; end: string }
}

// =============================================================================
// API SERVICE TYPES
// =============================================================================

/**
 * Opportunity service method signatures
 */
export interface OpportunityService {
  // CRUD operations
  getAll: (filter?: OpportunityFilter) => Promise<OpportunityListItem[]>
  getById: (id: string) => Promise<OpportunityWithSalesContext | null>
  create: (data: CreateOpportunitySchema) => Promise<Opportunity>
  update: (id: string, data: UpdateOpportunitySchema) => Promise<Opportunity>
  delete: (id: string) => Promise<void>
  
  // Stage management
  updateStage: (id: string, stage: OpportunityStage, notes?: string) => Promise<Opportunity>
  getStageHistory: (id: string) => Promise<OpportunityStageHistory[]>
  
  // Product relationships
  addProduct: (opportunityId: string, productData: Omit<OpportunityProduct, 'id' | 'opportunity_id'>) => Promise<OpportunityProduct>
  updateProduct: (opportunityId: string, productId: string, data: Partial<OpportunityProduct>) => Promise<OpportunityProduct>
  removeProduct: (opportunityId: string, productId: string) => Promise<void>
  
  // Timeline and activities
  getTimeline: (id: string) => Promise<OpportunityTimeline[]>
  addMilestone: (data: Omit<OpportunityTimeline, 'id'>) => Promise<OpportunityTimeline>
  updateMilestone: (id: string, data: Partial<OpportunityTimeline>) => Promise<OpportunityTimeline>
  
  // Competitor tracking
  getCompetitors: (id: string) => Promise<OpportunityCompetitor[]>
  addCompetitor: (data: Omit<OpportunityCompetitor, 'id'>) => Promise<OpportunityCompetitor>
  updateCompetitor: (id: string, data: Partial<OpportunityCompetitor>) => Promise<OpportunityCompetitor>
  
  // Business operations
  getSummary: (id: string) => Promise<OpportunitySummary>
  getScore: (id: string) => Promise<OpportunityScore>
  getPipeline: (filter?: OpportunityFilter) => Promise<SalesPipeline>
  getForecast: (period: 'monthly' | 'quarterly' | 'yearly', range?: { start: string; end: string }) => Promise<SalesForecast>
  
  // Search and filter
  search: (query: string) => Promise<OpportunityListItem[]>
  filter: (filter: OpportunityFilter) => Promise<OpportunityListItem[]>
  
  // Bulk operations
  bulkStageUpdate: (updates: Array<{ id: string; stage: OpportunityStage; notes?: string }>) => Promise<Opportunity[]>
  bulkDelete: (ids: string[]) => Promise<void>
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Opportunity stage validation
 */
export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
] as const

/**
 * Priority level validation
 */
export const PRIORITY_LEVELS: PriorityLevel[] = [
  'low',
  'medium',
  'high',
  'critical'
] as const

/**
 * Required fields for opportunity creation
 */
export const REQUIRED_OPPORTUNITY_FIELDS: Array<keyof CreateOpportunitySchema> = [
  'organization_id',
  'name'
]

/**
 * Stage progression rules
 */
export const STAGE_PROGRESSION_RULES: Record<OpportunityStage, OpportunityStage[]> = {
  lead: ['qualified', 'closed_lost'],
  qualified: ['proposal', 'closed_lost'],
  proposal: ['negotiation', 'closed_lost'],
  negotiation: ['closed_won', 'closed_lost'],
  closed_won: [], // Terminal state
  closed_lost: [] // Terminal state
}

/**
 * Default probability by stage
 */
export const DEFAULT_STAGE_PROBABILITY: Record<OpportunityStage, number> = {
  lead: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Opportunity stage type guard function
 */
export const isOpportunityStage = (value: string): value is OpportunityStage => {
  return OPPORTUNITY_STAGES.includes(value as OpportunityStage)
}

/**
 * Priority level type guard function
 */
export const isPriorityLevel = (value: string): value is PriorityLevel => {
  return PRIORITY_LEVELS.includes(value as PriorityLevel)
}

/**
 * Opportunity display utilities
 */
export interface OpportunityDisplayUtils {
  formatValue: (value: number | null, currency?: string) => string
  formatProbability: (probability: number) => string
  getStageColor: (stage: OpportunityStage) => string
  getStageIcon: (stage: OpportunityStage) => string
  getPriorityColor: (priority: PriorityLevel) => string
  getPriorityIcon: (priority: PriorityLevel) => string
  getDaysInStage: (stageChangedDate: string) => number
  isOverdue: (expectedCloseDate: string | null) => boolean
  getHealthScore: (opportunity: OpportunityListItem) => 'healthy' | 'at_risk' | 'stalled'
}

/**
 * Opportunity workflow automation
 */
export interface OpportunityWorkflowRule {
  id: string
  name: string
  trigger: 'stage_change' | 'date_reached' | 'value_change' | 'inactivity'
  conditions: Record<string, any>
  actions: OpportunityWorkflowAction[]
  is_active: boolean
}

export interface OpportunityWorkflowAction {
  type: 'create_task' | 'send_notification' | 'update_field' | 'create_activity'
  parameters: Record<string, any>
  delay_hours?: number
}

// =============================================================================
// FORM STATE MANAGEMENT
// =============================================================================

/**
 * Opportunity form state
 */
export interface OpportunityFormState {
  data: Partial<CreateOpportunitySchema>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  selectedOrganization?: Organization
  selectedContact?: Contact
  selectedProducts?: Product[]
  availableOrganizations?: Organization[]
  availableContacts?: Contact[]
  availableProducts?: Product[]
  currentSection?: string
}

/**
 * Opportunity form actions
 */
export type OpportunityFormAction =
  | { type: 'SET_FIELD'; field: keyof CreateOpportunitySchema; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_ORGANIZATION'; organization: Organization }
  | { type: 'SET_CONTACT'; contact: Contact }
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'REMOVE_PRODUCT'; productId: string }
  | { type: 'SET_AVAILABLE_ORGANIZATIONS'; organizations: Organization[] }
  | { type: 'SET_AVAILABLE_CONTACTS'; contacts: Contact[] }
  | { type: 'SET_AVAILABLE_PRODUCTS'; products: Product[] }
  | { type: 'SET_SECTION'; section: string }
  | { type: 'RESET_FORM' }

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Opportunity analytics metrics
 */
export interface OpportunityMetrics {
  total_opportunities: number
  open_opportunities: number
  closed_won: number
  closed_lost: number
  win_rate: number
  average_deal_size: number
  total_pipeline_value: number
  weighted_pipeline_value: number
  average_sales_cycle: number
  by_stage: Record<OpportunityStage, number>
  by_priority: Record<PriorityLevel, number>
  by_source: Record<string, number>
}

/**
 * Opportunity performance tracking
 */
export interface OpportunityPerformance {
  period: string
  new_opportunities: number
  closed_opportunities: number
  revenue_generated: number
  pipeline_growth: number
  stage_conversion_rates: Record<OpportunityStage, number>
  average_days_by_stage: Record<OpportunityStage, number>
  top_performers: string[]
  bottlenecks: string[]
}

/**
 * Opportunity import/export types
 */
export interface OpportunityImportRow extends Omit<CreateOpportunitySchema, 'organization_id' | 'stage' | 'priority'> {
  organization_name?: string
  organization_id?: string
  primary_contact_name?: string
  stage?: string // String version for CSV import
  priority?: string // String version for CSV import
  row_number: number
  validation_errors?: string[]
}

export interface OpportunityExportRow extends OpportunityListItem {
  description: string | null
  source: string | null
  reason_lost: string | null
  actual_close_date: string | null
}