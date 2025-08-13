/**
 * Interaction-specific type definitions and utilities
 * 
 * This file provides specialized types for interaction-related functionality
 * including validation schemas, form types, and business logic interfaces.
 */

import type { 
  Interaction, 
  InteractionWithRelations,
  InteractionListItem,
  InteractionFilter,
  InteractionType,
  PriorityLevel,
  Organization,
  Contact,
  Opportunity
} from './entities'

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

/**
 * Interaction creation form validation schema type
 */
export interface CreateInteractionSchema {
  organization_id?: string | null
  opportunity_id?: string | null
  contact_id?: string | null
  type: InteractionType
  subject: string
  description?: string | null
  interaction_date?: string
  duration_minutes?: number | null
  follow_up_required?: boolean | null
  follow_up_date?: string | null
  follow_up_notes?: string | null
  outcome?: string | null
  attachments?: string[] | null
}

/**
 * Interaction update form validation schema type
 */
export interface UpdateInteractionSchema {
  subject?: string
  description?: string | null
  interaction_date?: string
  duration_minutes?: number | null
  follow_up_required?: boolean | null
  follow_up_date?: string | null
  follow_up_notes?: string | null
  outcome?: string | null
  attachments?: string[] | null
}

// =============================================================================
// BUSINESS LOGIC TYPES
// =============================================================================

/**
 * Interaction summary for dashboard views
 */
export interface InteractionSummary {
  id: string
  type: InteractionType
  subject: string
  priority: PriorityLevel
  scheduled_at: string | null
  completed_at: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  organization_name: string
  opportunity_name: string | null
  contact_name: string | null
  is_overdue: boolean
  status: 'scheduled' | 'completed' | 'overdue' | 'cancelled'
  days_until_due: number | null
}

/**
 * Interaction with full context
 */
export interface InteractionWithFullContext extends InteractionWithRelations {
  activity_metrics?: InteractionActivityMetrics
  related_interactions?: Interaction[]
  follow_up_chain?: Interaction[]
  communication_thread?: CommunicationThread[]
}

/**
 * Interaction activity metrics
 */
export interface InteractionActivityMetrics {
  interaction_id: string
  response_time_hours: number | null
  engagement_score: number // 1-10 scale
  outcome_rating: 'positive' | 'neutral' | 'negative' | null
  follow_through_rate: number // Percentage of follow-ups completed
  relationship_impact: 'strengthened' | 'maintained' | 'weakened' | 'neutral'
  next_interaction_probability: number // 0-100
}

/**
 * Communication thread tracking
 */
export interface CommunicationThread {
  id: string
  thread_id: string // Groups related communications
  interaction_id: string
  sequence_number: number
  thread_type: 'email' | 'phone' | 'meeting_series' | 'project'
  parent_interaction_id: string | null
  is_thread_starter: boolean
  thread_subject: string
}

/**
 * Follow-up tracking and automation
 */
export interface FollowUpTask {
  id: string
  interaction_id: string
  assigned_to: string
  task_type: 'call' | 'email' | 'meeting' | 'proposal' | 'demo' | 'other'
  due_date: string
  priority: PriorityLevel
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  completion_notes?: string
  completed_at?: string
  auto_generated: boolean
}

/**
 * Interaction templates for common scenarios
 */
export interface InteractionTemplate {
  id: string
  name: string
  description: string
  type: InteractionType
  subject_template: string
  description_template: string
  suggested_duration: number | null
  default_priority: PriorityLevel
  follow_up_required: boolean
  follow_up_days_offset: number | null
  tags: string[]
  use_count: number
  is_active: boolean
}

// =============================================================================
// COMMUNICATION TRACKING
// =============================================================================

/**
 * Email interaction details
 */
export interface EmailInteractionDetails {
  interaction_id: string
  email_address: string
  subject: string
  message_id?: string
  thread_id?: string
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  replied_at?: string
  bounce_reason?: string
  attachment_count: number
  tracking_enabled: boolean
}

/**
 * Call interaction details
 */
export interface CallInteractionDetails {
  interaction_id: string
  phone_number: string
  call_direction: 'inbound' | 'outbound'
  call_duration_seconds: number | null
  call_quality: 'excellent' | 'good' | 'fair' | 'poor'
  recording_available: boolean
  recording_url?: string
  voicemail_left: boolean
  call_outcome: 'connected' | 'voicemail' | 'busy' | 'no_answer' | 'disconnected'
  notes: string
}

/**
 * Meeting interaction details
 */
export interface MeetingInteractionDetails {
  interaction_id: string
  meeting_type: 'in_person' | 'video_call' | 'phone_conference'
  location?: string
  meeting_url?: string
  attendees: MeetingAttendee[]
  agenda_items: string[]
  recording_available: boolean
  recording_url?: string
  presentation_shared: boolean
  action_items: ActionItem[]
}

/**
 * Meeting attendee information
 */
export interface MeetingAttendee {
  contact_id?: string
  name: string
  email?: string
  role?: string
  attendance_status: 'attended' | 'absent' | 'partial'
  contribution_level: 'high' | 'medium' | 'low'
}

/**
 * Action item from meetings
 */
export interface ActionItem {
  id: string
  interaction_id: string
  description: string
  assigned_to: string
  due_date?: string
  priority: PriorityLevel
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  completion_notes?: string
}

// =============================================================================
// ACTIVITY FEED AND TIMELINE
// =============================================================================

/**
 * Activity feed item
 */
export interface ActivityFeedItem {
  id: string
  type: 'interaction' | 'opportunity_stage_change' | 'contact_added' | 'deal_won' | 'follow_up_due'
  title: string
  description: string
  timestamp: string
  actor: string
  target_type: 'organization' | 'contact' | 'opportunity'
  target_id: string
  target_name: string
  metadata?: Record<string, any>
  importance: 'low' | 'medium' | 'high'
}

/**
 * Interaction timeline view
 */
export interface InteractionTimeline {
  organization_id: string
  interactions: InteractionWithFullContext[]
  grouped_by_month: Record<string, InteractionWithFullContext[]>
  total_interactions: number
  interaction_frequency: number // interactions per month
  most_common_type: InteractionType
  response_pattern: 'responsive' | 'slow' | 'unresponsive'
  engagement_trend: 'increasing' | 'stable' | 'decreasing'
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

/**
 * Interaction card display props
 */
export interface InteractionCardProps {
  interaction: InteractionListItem
  showOrganization?: boolean
  showContact?: boolean
  showActions?: boolean
  compact?: boolean
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onDelete?: (id: string) => void
  onComplete?: (id: string) => void
  onScheduleFollowUp?: (id: string) => void
}

/**
 * Interaction table column configuration
 */
export interface InteractionTableColumn {
  key: keyof InteractionListItem | 'actions'
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any, row: InteractionListItem) => string | number
}

/**
 * Interaction calendar view props
 */
export interface InteractionCalendarProps {
  interactions: InteractionSummary[]
  view: 'month' | 'week' | 'day'
  selectedDate: string
  onDateSelect: (date: string) => void
  onInteractionSelect: (id: string) => void
  onTimeSlotClick: (date: string, time: string) => void
  showCompleted?: boolean
  filterByType?: InteractionType[]
}

/**
 * Interaction form wizard steps
 */
export interface InteractionFormStep {
  id: string
  title: string
  description?: string
  fields: Array<keyof CreateInteractionSchema>
  validation?: (data: Partial<CreateInteractionSchema>) => string[]
  conditional?: (data: Partial<CreateInteractionSchema>) => boolean
}

// =============================================================================
// API SERVICE TYPES
// =============================================================================

/**
 * Interaction service method signatures
 */
export interface InteractionService {
  // CRUD operations
  getAll: (filter?: InteractionFilter) => Promise<InteractionListItem[]>
  getById: (id: string) => Promise<InteractionWithFullContext | null>
  create: (data: CreateInteractionSchema) => Promise<Interaction>
  update: (id: string, data: UpdateInteractionSchema) => Promise<Interaction>
  delete: (id: string) => Promise<void>
  
  // Status management
  complete: (id: string, outcome: string, nextSteps?: string) => Promise<Interaction>
  reschedule: (id: string, newDateTime: string, reason?: string) => Promise<Interaction>
  cancel: (id: string, reason: string) => Promise<Interaction>
  
  // Follow-up management
  createFollowUp: (parentId: string, data: Omit<CreateInteractionSchema, 'organization_id'>) => Promise<Interaction>
  getFollowUpChain: (rootId: string) => Promise<Interaction[]>
  
  // Communication details
  addEmailDetails: (interactionId: string, details: Omit<EmailInteractionDetails, 'interaction_id'>) => Promise<EmailInteractionDetails>
  addCallDetails: (interactionId: string, details: Omit<CallInteractionDetails, 'interaction_id'>) => Promise<CallInteractionDetails>
  addMeetingDetails: (interactionId: string, details: Omit<MeetingInteractionDetails, 'interaction_id'>) => Promise<MeetingInteractionDetails>
  
  // Activity and timeline
  getActivityFeed: (organizationId?: string, limit?: number) => Promise<ActivityFeedItem[]>
  getTimeline: (organizationId: string, dateRange?: { start: string; end: string }) => Promise<InteractionTimeline>
  
  // Templates
  getTemplates: (type?: InteractionType) => Promise<InteractionTemplate[]>
  createFromTemplate: (templateId: string, data: Partial<CreateInteractionSchema>) => Promise<Interaction>
  
  // Search and filter
  search: (query: string, filter?: InteractionFilter) => Promise<InteractionListItem[]>
  getUpcoming: (days?: number) => Promise<InteractionSummary[]>
  getOverdue: () => Promise<InteractionSummary[]>
  
  // Bulk operations
  bulkComplete: (ids: string[], outcome: string) => Promise<Interaction[]>
  bulkReschedule: (updates: Array<{ id: string; newDateTime: string; reason?: string }>) => Promise<Interaction[]>
  bulkDelete: (ids: string[]) => Promise<void>
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Interaction type validation
 */
export const INTERACTION_TYPES: InteractionType[] = [
  'call',
  'email',
  'meeting',
  'demo',
  'proposal',
  'follow_up',
  'trade_show',
  'site_visit',
  'contract_review'
] as const

/**
 * Required fields for interaction creation
 */
export const REQUIRED_INTERACTION_FIELDS: Array<keyof CreateInteractionSchema> = [
  'organization_id',
  'type',
  'subject'
]

/**
 * Default duration by interaction type (in minutes)
 */
export const DEFAULT_INTERACTION_DURATION: Record<InteractionType, number> = {
  call: 30,
  email: 0, // No duration for emails
  meeting: 60,
  demo: 90,
  proposal: 120,
  follow_up: 15,
  trade_show: 120,
  site_visit: 240,
  contract_review: 60
}

/**
 * Interaction type categories for grouping
 */
export const INTERACTION_TYPE_CATEGORIES = {
  communication: ['call', 'email'],
  presentation: ['meeting', 'demo', 'proposal'],
  fieldwork: ['site_visit', 'trade_show'],
  administrative: ['follow_up', 'other']
} as const

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Interaction type type guard function
 */
export const isInteractionType = (value: string): value is InteractionType => {
  return INTERACTION_TYPES.includes(value as InteractionType)
}

/**
 * Interaction display utilities
 */
export interface InteractionDisplayUtils {
  getTypeIcon: (type: InteractionType) => string
  getTypeColor: (type: InteractionType) => string
  getPriorityIcon: (priority: PriorityLevel) => string
  getPriorityColor: (priority: PriorityLevel) => string
  formatDuration: (minutes: number | null) => string
  getStatusBadge: (interaction: InteractionSummary) => { text: string; color: string }
  isOverdue: (scheduledAt: string | null, followUpDate: string | null) => boolean
  getDaysUntilDue: (followUpDate: string | null) => number | null
  getEngagementLevel: (interactionCount: number, daysSinceFirst: number) => 'high' | 'medium' | 'low'
}

/**
 * Interaction automation rules
 */
export interface InteractionAutomationRule {
  id: string
  name: string
  trigger: 'interaction_completed' | 'follow_up_due' | 'no_response' | 'opportunity_stage_change'
  conditions: Record<string, any>
  actions: InteractionAutomationAction[]
  is_active: boolean
}

export interface InteractionAutomationAction {
  type: 'create_follow_up' | 'send_reminder' | 'assign_task' | 'update_opportunity'
  parameters: Record<string, any>
  delay_hours?: number
}

// =============================================================================
// FORM STATE MANAGEMENT
// =============================================================================

/**
 * Interaction form state
 */
export interface InteractionFormState {
  data: Partial<CreateInteractionSchema>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  selectedOrganization?: Organization
  selectedContact?: Contact
  selectedOpportunity?: Opportunity
  availableOrganizations?: Organization[]
  availableContacts?: Contact[]
  availableOpportunities?: Opportunity[]
  currentStep?: number
  totalSteps?: number
}

/**
 * Interaction form actions
 */
export type InteractionFormAction =
  | { type: 'SET_FIELD'; field: keyof CreateInteractionSchema; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_ORGANIZATION'; organization: Organization }
  | { type: 'SET_CONTACT'; contact: Contact }
  | { type: 'SET_OPPORTUNITY'; opportunity: Opportunity }
  | { type: 'SET_AVAILABLE_ORGANIZATIONS'; organizations: Organization[] }
  | { type: 'SET_AVAILABLE_CONTACTS'; contacts: Contact[] }
  | { type: 'SET_AVAILABLE_OPPORTUNITIES'; opportunities: Opportunity[] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'RESET_FORM' }

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Interaction analytics metrics
 */
export interface InteractionMetrics {
  total_interactions: number
  completed_interactions: number
  completion_rate: number
  by_type: Record<InteractionType, number>
  by_priority: Record<PriorityLevel, number>
  average_duration: number
  response_rate: number
  follow_up_completion_rate: number
  overdue_count: number
  upcoming_count: number
}

/**
 * Interaction performance tracking
 */
export interface InteractionPerformance {
  period: string
  interactions_created: number
  interactions_completed: number
  average_response_time: number
  top_interaction_types: Array<{ type: InteractionType; count: number }>
  engagement_trends: Record<string, number>
  conversion_impact: number // Opportunities moved forward due to interactions
}

/**
 * Interaction import/export types
 */
export interface InteractionImportRow extends Omit<CreateInteractionSchema, 'organization_id' | 'type' | 'priority'> {
  organization_name?: string
  organization_id?: string
  contact_name?: string
  opportunity_name?: string
  type?: string // String version for CSV import
  priority?: string // String version for CSV import
  row_number: number
  validation_errors?: string[]
}

export interface InteractionExportRow extends InteractionListItem {
  description: string | null
  duration_minutes: number | null
  outcome_summary: string | null
  next_steps: string | null
  follow_up_notes: string | null
}