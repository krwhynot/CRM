// MVP Security & Compliance Agent - Security Events Hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { 
  SecurityEvent, 
  SecurityEventInsert, 
  SecurityEventFilters,
  SecurityMetrics,
  LogSecurityEventParams,
  RLSPolicyStatus,
  SecurityAuditResult
} from './types'

// Query key factory
export const securityEventKeys = {
  all: ['security-events'] as const,
  lists: () => [...securityEventKeys.all, 'list'] as const,
  list: (filters?: SecurityEventFilters) => [...securityEventKeys.lists(), { filters }] as const,
  details: () => [...securityEventKeys.all, 'detail'] as const,
  detail: (id: string) => [...securityEventKeys.details(), id] as const,
  metrics: () => [...securityEventKeys.all, 'metrics'] as const,
  recent: () => [...securityEventKeys.all, 'recent'] as const,
  audit: () => [...securityEventKeys.all, 'audit'] as const,
}

// Hook to fetch security events with optional filtering
export function useSecurityEvents(filters?: SecurityEventFilters, limit: number = 50) {
  return useQuery({
    queryKey: securityEventKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      // Apply filters
      if (filters?.event_type) {
        if (Array.isArray(filters.event_type)) {
          query = query.in('event_type', filters.event_type)
        } else {
          query = query.eq('event_type', filters.event_type)
        }
      }

      if (filters?.severity) {
        if (Array.isArray(filters.severity)) {
          query = query.in('severity', filters.severity)
        } else {
          query = query.eq('severity', filters.severity)
        }
      }

      if (typeof filters?.success === 'boolean') {
        query = query.eq('success', filters.success)
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }

      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type)
      }

      if (filters?.date_from) {
        query = query.gte('timestamp', filters.date_from)
      }

      if (filters?.date_to) {
        query = query.lte('timestamp', filters.date_to)
      }

      if (filters?.search) {
        query = query.or(`user_email.ilike.%${filters.search}%,details.ilike.%${filters.search}%,error_message.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data as SecurityEvent[]
    },
    staleTime: 30 * 1000, // 30 seconds - security events should be relatively fresh
  })
}

// Hook to fetch recent security activity (last 24 hours)
export function useRecentSecurityActivity() {
  return useQuery({
    queryKey: securityEventKeys.recent(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recent_security_activity')
        .select('*')
        .limit(20)

      if (error) throw error
      return data as SecurityEvent[]
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  })
}

// Hook to fetch security metrics for dashboard
export function useSecurityMetrics() {
  return useQuery({
    queryKey: securityEventKeys.metrics(),
    queryFn: async () => {
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Fetch recent events
      const { data: events, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', twentyFourHoursAgo.toISOString())
        .order('timestamp', { ascending: false })

      if (error) throw error

      // Calculate metrics
      const totalEvents = events.length
      const failedLogins = events.filter(e => e.event_type === 'login_failure').length
      const suspiciousActivities = events.filter(e => e.event_type === 'suspicious_activity').length
      const rlsViolations = events.filter(e => e.event_type === 'rls_policy_violation').length
      const highSeverityEvents = events.filter(e => ['high', 'critical'].includes(e.severity)).length
      const uniqueUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size

      // Count events by type
      const eventsByType = events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Count events by severity
      const eventsBySeverity = events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Get recent events for display
      const recentEvents = events.slice(0, 10)

      const metrics: SecurityMetrics = {
        total_events_24h: totalEvents,
        failed_logins_24h: failedLogins,
        suspicious_activities_24h: suspiciousActivities,
        rls_violations_24h: rlsViolations,
        high_severity_events_24h: highSeverityEvents,
        unique_users_24h: uniqueUsers,
        events_by_type: eventsByType,
        events_by_severity: eventsBySeverity,
        recent_events: recentEvents
      }

      return metrics
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  })
}

// Hook to perform RLS policy audit
export function useRLSAudit() {
  return useQuery({
    queryKey: securityEventKeys.audit(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_rls_policies')

      if (error) throw error

      const policies = data as RLSPolicyStatus[]
      const totalTables = policies.length
      const tablesWithRLS = policies.filter(p => p.rls_enabled).length
      const tablesWithoutRLS = totalTables - tablesWithRLS
      const totalPolicies = policies.reduce((sum, p) => sum + p.policy_count, 0)

      // Generate issues and recommendations
      const issues: string[] = []
      const recommendations: string[] = []

      policies.forEach(policy => {
        if (!policy.rls_enabled) {
          issues.push(`Table "${policy.table_name}" does not have RLS enabled`)
          recommendations.push(`Enable RLS on table "${policy.table_name}"`)
        }
        if (policy.policy_count === 0) {
          issues.push(`Table "${policy.table_name}" has no RLS policies defined`)
          recommendations.push(`Create appropriate RLS policies for table "${policy.table_name}"`)
        }
      })

      const auditResult: SecurityAuditResult = {
        timestamp: new Date().toISOString(),
        rls_policies: policies,
        total_tables_checked: totalTables,
        tables_with_rls: tablesWithRLS,
        tables_without_rls: tablesWithoutRLS,
        total_policies: totalPolicies,
        issues_found: issues,
        recommendations: recommendations
      }

      return auditResult
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - RLS policies don't change often
  })
}

// Hook to log security events
export function useLogSecurityEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: LogSecurityEventParams) => {
      const { data, error } = await supabase.rpc('log_security_event', {
        p_event_type: params.event_type,
        p_details: params.details || {},
        p_entity_type: params.entity_type || null,
        p_entity_id: params.entity_id || null,
        p_severity: params.severity || 'info',
        p_success: params.success !== undefined ? params.success : true,
        p_error_message: params.error_message || null
      })

      if (error) throw error
      return data as string // Returns the event ID
    },
    onSuccess: () => {
      // Invalidate all security event queries to show the new event
      queryClient.invalidateQueries({ queryKey: securityEventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: securityEventKeys.recent() })
      queryClient.invalidateQueries({ queryKey: securityEventKeys.metrics() })
    },
  })
}

// Hook to create security event directly (alternative to function)
export function useCreateSecurityEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (securityEvent: SecurityEventInsert) => {
      // Get current user info
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.warn('Could not get user for security event:', authError)
      }

      // Prepare event data
      const eventData = {
        ...securityEvent,
        user_id: securityEvent.user_id || user?.id || null,
        user_email: securityEvent.user_email || user?.email || null,
        details: securityEvent.details || {},
        metadata: securityEvent.metadata || { source: 'security_agent' },
        severity: securityEvent.severity || 'info',
        success: securityEvent.success !== undefined ? securityEvent.success : true
      }

      const { data, error } = await supabase
        .from('security_events')
        .insert(eventData)
        .select()
        .single()

      if (error) throw error
      return data as SecurityEvent
    },
    onSuccess: () => {
      // Invalidate all security event queries
      queryClient.invalidateQueries({ queryKey: securityEventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: securityEventKeys.recent() })
      queryClient.invalidateQueries({ queryKey: securityEventKeys.metrics() })
    },
  })
}

// Utility hook to monitor auth events and automatically log them
export function useSecurityEventMonitor() {
  const logEvent = useLogSecurityEvent()

  // Helper functions to log common security events
  const logLoginSuccess = (userEmail?: string) => {
    logEvent.mutate({
      event_type: 'login_success',
      details: { user_email: userEmail },
      severity: 'info'
    })
  }

  const logLoginFailure = (userEmail?: string, reason?: string) => {
    logEvent.mutate({
      event_type: 'login_failure',
      details: { user_email: userEmail, reason },
      severity: 'medium',
      success: false,
      error_message: reason
    })
  }

  const logLogout = (userEmail?: string) => {
    logEvent.mutate({
      event_type: 'logout',
      details: { user_email: userEmail },
      severity: 'info'
    })
  }

  const logDataAccess = (entityType: string, entityId: string, action: string) => {
    logEvent.mutate({
      event_type: 'data_access',
      entity_type: entityType as any,
      entity_id: entityId,
      details: { action },
      severity: 'info'
    })
  }

  const logDataModification = (entityType: string, entityId: string, action: string, changes?: Record<string, any>) => {
    logEvent.mutate({
      event_type: 'data_modification',
      entity_type: entityType as any,
      entity_id: entityId,
      details: { action, changes },
      severity: 'info'
    })
  }

  const logSuspiciousActivity = (details: Record<string, any>, reason: string) => {
    logEvent.mutate({
      event_type: 'suspicious_activity',
      details: { ...details, reason },
      severity: 'high',
      error_message: reason
    })
  }

  const logRLSViolation = (table: string, operation: string, reason: string) => {
    logEvent.mutate({
      event_type: 'rls_policy_violation',
      details: { table, operation },
      severity: 'high',
      success: false,
      error_message: reason
    })
  }

  return {
    logLoginSuccess,
    logLoginFailure,
    logLogout,
    logDataAccess,
    logDataModification,
    logSuspiciousActivity,
    logRLSViolation,
    logEvent: logEvent.mutate,
    isLogging: logEvent.isPending
  }
}