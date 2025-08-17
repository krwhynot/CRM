// MVP Security & Compliance Agent - Type Definitions

// Security Event Types matching SQL enum
export type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'data_access'
  | 'data_modification'
  | 'rls_policy_violation'
  | 'suspicious_activity'
  | 'permission_denied'
  | 'audit_check'

// Security Event Severity Levels
export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical' | 'info'

// Security Event Entity Types
export type SecurityEventEntityType = 
  | 'organization'
  | 'contact'
  | 'product'
  | 'opportunity'
  | 'interaction'
  | 'user'
  | 'system'

// Security Event Base Structure
export interface SecurityEvent {
  id: string
  event_type: SecurityEventType
  user_id: string | null
  user_email: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  entity_type: SecurityEventEntityType | null
  entity_id: string | null
  severity: SecurityEventSeverity
  success: boolean
  error_message: string | null
  metadata: Record<string, any>
  timestamp: string
  created_at: string
}

// Security Event for insertion
export interface SecurityEventInsert {
  event_type: SecurityEventType
  user_id?: string | null
  user_email?: string | null
  details?: Record<string, any>
  ip_address?: string | null
  user_agent?: string | null
  session_id?: string | null
  entity_type?: SecurityEventEntityType | null
  entity_id?: string | null
  severity?: SecurityEventSeverity
  success?: boolean
  error_message?: string | null
  metadata?: Record<string, any>
}

// Security Event for updates (minimal - mostly readonly)
export interface SecurityEventUpdate {
  details?: Record<string, any>
  metadata?: Record<string, any>
}

// Security Event with enhanced context for display
export interface SecurityEventWithContext extends SecurityEvent {
  user_display_name?: string
  entity_display_name?: string
  risk_level?: 'low' | 'medium' | 'high'
  requires_attention?: boolean
}

// Security Dashboard Metrics
export interface SecurityMetrics {
  total_events_24h: number
  failed_logins_24h: number
  suspicious_activities_24h: number
  rls_violations_24h: number
  high_severity_events_24h: number
  unique_users_24h: number
  events_by_type: Record<SecurityEventType, number>
  events_by_severity: Record<SecurityEventSeverity, number>
  recent_events: SecurityEvent[]
}

// RLS Policy Status
export interface RLSPolicyStatus {
  table_name: string
  rls_enabled: boolean
  policy_count: number
}

// Security Audit Result
export interface SecurityAuditResult {
  timestamp: string
  rls_policies: RLSPolicyStatus[]
  total_tables_checked: number
  tables_with_rls: number
  tables_without_rls: number
  total_policies: number
  issues_found: string[]
  recommendations: string[]
}

// Security Event Filters for querying
export interface SecurityEventFilters {
  event_type?: SecurityEventType | SecurityEventType[]
  severity?: SecurityEventSeverity | SecurityEventSeverity[]
  success?: boolean
  user_id?: string
  entity_type?: SecurityEventEntityType
  date_from?: string
  date_to?: string
  search?: string
}

// Function parameters for logging security events
export interface LogSecurityEventParams {
  event_type: SecurityEventType
  details?: Record<string, any>
  entity_type?: SecurityEventEntityType
  entity_id?: string
  severity?: SecurityEventSeverity
  success?: boolean
  error_message?: string
}

// Security Event Type Configuration for UI display
export interface SecurityEventTypeConfig {
  label: string
  icon: string
  color: string
  description: string
  severity_default: SecurityEventSeverity
}

// Security Event Type Configurations
export const SECURITY_EVENT_CONFIGS: Record<SecurityEventType, SecurityEventTypeConfig> = {
  login_success: {
    label: 'Successful Login',
    icon: 'LogIn',
    color: 'green',
    description: 'User successfully authenticated',
    severity_default: 'info'
  },
  login_failure: {
    label: 'Failed Login',
    icon: 'AlertTriangle',
    color: 'red',
    description: 'Authentication attempt failed',
    severity_default: 'medium'
  },
  logout: {
    label: 'Logout',
    icon: 'LogOut',
    color: 'blue',
    description: 'User logged out',
    severity_default: 'info'
  },
  password_reset_request: {
    label: 'Password Reset Request',
    icon: 'Key',
    color: 'orange',
    description: 'Password reset was requested',
    severity_default: 'medium'
  },
  password_reset_success: {
    label: 'Password Reset Success',
    icon: 'CheckCircle',
    color: 'green',
    description: 'Password was successfully reset',
    severity_default: 'medium'
  },
  data_access: {
    label: 'Data Access',
    icon: 'Eye',
    color: 'blue',
    description: 'Data was accessed',
    severity_default: 'info'
  },
  data_modification: {
    label: 'Data Modification',
    icon: 'Edit',
    color: 'yellow',
    description: 'Data was modified',
    severity_default: 'info'
  },
  rls_policy_violation: {
    label: 'RLS Policy Violation',
    icon: 'Shield',
    color: 'red',
    description: 'Row Level Security policy violation detected',
    severity_default: 'high'
  },
  suspicious_activity: {
    label: 'Suspicious Activity',
    icon: 'AlertCircle',
    color: 'red',
    description: 'Potentially suspicious behavior detected',
    severity_default: 'high'
  },
  permission_denied: {
    label: 'Permission Denied',
    icon: 'Ban',
    color: 'red',
    description: 'Access denied due to insufficient permissions',
    severity_default: 'medium'
  },
  audit_check: {
    label: 'Audit Check',
    icon: 'Search',
    color: 'purple',
    description: 'Security audit or compliance check performed',
    severity_default: 'info'
  }
}

// Severity Level Configurations
export const SEVERITY_CONFIGS: Record<SecurityEventSeverity, { label: string; color: string; priority: number }> = {
  critical: { label: 'Critical', color: 'red', priority: 5 },
  high: { label: 'High', color: 'orange', priority: 4 },
  medium: { label: 'Medium', color: 'yellow', priority: 3 },
  low: { label: 'Low', color: 'blue', priority: 2 },
  info: { label: 'Info', color: 'gray', priority: 1 }
}

// Helper type for query results
export interface SecurityEventQueryResult {
  data: SecurityEvent[]
  count: number
  error: Error | null
}

// Export type guards for type safety
export function isSecurityEventType(value: string): value is SecurityEventType {
  return Object.keys(SECURITY_EVENT_CONFIGS).includes(value as SecurityEventType)
}

export function isSecurityEventSeverity(value: string): value is SecurityEventSeverity {
  return Object.keys(SEVERITY_CONFIGS).includes(value as SecurityEventSeverity)
}