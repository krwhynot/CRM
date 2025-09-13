import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { semanticSpacing, semanticTypography, semanticColors } from '@/styles/tokens'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  Database,
  Shield,
  Lightbulb,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Enhanced Alert Variants for CRM Context
const crmAlertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[1rem_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: semanticColors.alerts.default,
        success: semanticColors.alerts.success,
        warning: semanticColors.alerts.warning,
        error: semanticColors.alerts.error,
        info: semanticColors.alerts.info,
        pending: semanticColors.alerts.pending,
        opportunity: semanticColors.alerts.opportunity,
        system: semanticColors.alerts.system,
      },
      size: {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

// Alert Type Definitions
export type CRMAlertVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'opportunity'
  | 'system'

export interface CRMAlertProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof crmAlertVariants> {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  timestamp?: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

// Icon mapping for different alert types
const alertIcons: Record<CRMAlertVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  pending: Clock,
  opportunity: TrendingUp,
  system: Database,
}

// Core CRM Alert Component
export function CRMAlert({
  title,
  description,
  variant = 'info',
  size = 'md',
  icon,
  dismissible = false,
  onDismiss,
  action,
  badge,
  timestamp,
  priority,
  className,
  ...props
}: CRMAlertProps) {
  const IconComponent = icon || alertIcons[variant || 'default']

  return (
    <div role="alert" className={cn(crmAlertVariants({ variant, size }), className)} {...props}>
      <IconComponent className="size-4 translate-y-0.5" />

      <div className={cn(semanticSpacing.stack.xs, 'col-start-2')}>
        {/* Header with title, badge, and timestamp */}
        <div className={cn(semanticSpacing.gap.xs, 'flex items-center justify-between')}>
          <div className={cn(semanticSpacing.gap.xs, 'flex items-center min-w-0 flex-1')}>
            <h5
              className={cn(semanticTypography.label, semanticTypography.tightSpacing, 'truncate')}
            >
              {title}
            </h5>

            {badge && (
              <Badge variant={badge.variant || 'default'} className="shrink-0">
                {badge.text}
              </Badge>
            )}

            {priority && priority !== 'medium' && (
              <Badge
                variant={priority === 'urgent' || priority === 'high' ? 'destructive' : 'secondary'}
                className={cn(semanticTypography.caption, 'shrink-0')}
              >
                {priority.toUpperCase()}
              </Badge>
            )}
          </div>

          {timestamp && (
            <span className={cn(semanticTypography.caption, 'text-muted-foreground shrink-0')}>
              {timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* Description */}
        <div
          className={cn(
            semanticTypography.body,
            semanticTypography.relaxedLine,
            'text-muted-foreground'
          )}
        >
          {description}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className={cn(semanticSpacing.compactX, semanticTypography.caption, 'h-7')}
            >
              {action.label}
            </Button>
          )}

          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={cn(semanticSpacing.compactX, semanticTypography.caption, 'h-7 ml-auto')}
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Specialized CRM Alert Components
export function ContactAlert({
  contactName,
  alertType,
  message,
  ...props
}: Omit<CRMAlertProps, 'title' | 'description' | 'icon'> & {
  contactName: string
  alertType: 'birthday' | 'follow_up' | 'no_activity' | 'updated'
  message: string
}) {
  const alertConfig = {
    birthday: {
      title: `Birthday Today: ${contactName}`,
      variant: 'opportunity' as const,
      icon: Calendar,
      badge: { text: 'Birthday', variant: 'secondary' as const },
    },
    follow_up: {
      title: `Follow-up Due: ${contactName}`,
      variant: 'pending' as const,
      icon: Clock,
      badge: { text: 'Follow-up', variant: 'outline' as const },
    },
    no_activity: {
      title: `No Recent Activity: ${contactName}`,
      variant: 'warning' as const,
      icon: Users,
      badge: { text: 'Inactive', variant: 'destructive' as const },
    },
    updated: {
      title: `Contact Updated: ${contactName}`,
      variant: 'success' as const,
      icon: CheckCircle,
      badge: { text: 'Updated', variant: 'default' as const },
    },
  }

  const config = alertConfig[alertType]

  return (
    <CRMAlert
      title={config.title}
      description={message}
      variant={config.variant}
      icon={config.icon}
      badge={config.badge}
      {...props}
    />
  )
}

export function OpportunityAlert({
  opportunityName,
  alertType,
  value,
  message,
  ...props
}: Omit<CRMAlertProps, 'title' | 'description' | 'icon'> & {
  opportunityName: string
  alertType: 'closing_soon' | 'won' | 'lost' | 'stage_change' | 'overdue'
  value?: number
  message: string
}) {
  const alertConfig = {
    closing_soon: {
      title: `Opportunity Closing Soon: ${opportunityName}`,
      variant: 'pending' as const,
      icon: Clock,
      badge: { text: 'Closing Soon', variant: 'outline' as const },
    },
    won: {
      title: `Opportunity Won: ${opportunityName}`,
      variant: 'success' as const,
      icon: CheckCircle,
      badge: { text: 'Won', variant: 'default' as const },
    },
    lost: {
      title: `Opportunity Lost: ${opportunityName}`,
      variant: 'error' as const,
      icon: XCircle,
      badge: { text: 'Lost', variant: 'destructive' as const },
    },
    stage_change: {
      title: `Stage Updated: ${opportunityName}`,
      variant: 'info' as const,
      icon: TrendingUp,
      badge: { text: 'Updated', variant: 'secondary' as const },
    },
    overdue: {
      title: `Opportunity Overdue: ${opportunityName}`,
      variant: 'warning' as const,
      icon: AlertTriangle,
      badge: { text: 'Overdue', variant: 'destructive' as const },
    },
  }

  const config = alertConfig[alertType]
  const valueText = value ? ` ($${value.toLocaleString()})` : ''

  return (
    <CRMAlert
      title={config.title + valueText}
      description={message}
      variant={config.variant}
      icon={config.icon}
      badge={config.badge}
      {...props}
    />
  )
}

export function SystemAlert({
  alertType,
  message,
  severity = 'medium',
  ...props
}: Omit<CRMAlertProps, 'title' | 'description' | 'icon' | 'priority'> & {
  alertType: 'maintenance' | 'backup' | 'security' | 'performance' | 'sync' | 'quota'
  message: string
  severity?: 'low' | 'medium' | 'high' | 'urgent'
}) {
  const alertConfig = {
    maintenance: {
      title: 'System Maintenance',
      variant: 'info' as const,
      icon: Database,
      badge: { text: 'Maintenance', variant: 'outline' as const },
    },
    backup: {
      title: 'Data Backup',
      variant: 'success' as const,
      icon: Shield,
      badge: { text: 'Backup', variant: 'default' as const },
    },
    security: {
      title: 'Security Alert',
      variant: 'warning' as const,
      icon: Shield,
      badge: { text: 'Security', variant: 'destructive' as const },
    },
    performance: {
      title: 'Performance Notice',
      variant: 'warning' as const,
      icon: TrendingUp,
      badge: { text: 'Performance', variant: 'outline' as const },
    },
    sync: {
      title: 'Data Synchronization',
      variant: 'info' as const,
      icon: Database,
      badge: { text: 'Sync', variant: 'secondary' as const },
    },
    quota: {
      title: 'Usage Quota',
      variant: 'warning' as const,
      icon: AlertTriangle,
      badge: { text: 'Quota', variant: 'destructive' as const },
    },
  }

  const config = alertConfig[alertType]

  return (
    <CRMAlert
      title={config.title}
      description={message}
      variant={config.variant}
      icon={config.icon}
      badge={config.badge}
      priority={severity}
      {...props}
    />
  )
}

// Alert Container for managing multiple alerts
export interface AlertContainerProps {
  alerts: Array<CRMAlertProps & { id: string }>
  maxAlerts?: number
  className?: string
  onDismissAll?: () => void
}

export function AlertContainer({
  alerts,
  maxAlerts = 5,
  className,
  onDismissAll,
}: AlertContainerProps) {
  const displayAlerts = alerts.slice(0, maxAlerts)
  const hasMoreAlerts = alerts.length > maxAlerts

  if (alerts.length === 0) return null

  return (
    <div className={cn(semanticSpacing.stack.sm, className)}>
      {/* Header with dismiss all option */}
      {alerts.length > 1 && (
        <div className="flex items-center justify-between">
          <h4
            className={cn(
              semanticTypography.body,
              semanticTypography.label,
              'text-muted-foreground'
            )}
          >
            Notifications ({alerts.length})
          </h4>
          {onDismissAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismissAll}
              className={cn(semanticSpacing.compactX, semanticTypography.caption, 'h-6')}
            >
              Dismiss All
            </Button>
          )}
        </div>
      )}

      {/* Alert List */}
      <div className={`${semanticSpacing.stack.xs}`}>
        {displayAlerts.map(({ id, ...alertProps }) => (
          <CRMAlert key={id} {...alertProps} />
        ))}
      </div>

      {/* More alerts indicator */}
      {hasMoreAlerts && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(semanticSpacing.compactX, semanticTypography.caption, 'h-7')}
          >
            <Lightbulb className="size-3 mr-1" />
            View {alerts.length - maxAlerts} More
          </Button>
        </div>
      )}
    </div>
  )
}

// Hook for managing alerts
export function useCRMAlerts() {
  const [alerts, setAlerts] = React.useState<Array<CRMAlertProps & { id: string }>>([])

  const removeAlert = React.useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  const addAlert = React.useCallback(
    (alert: Omit<CRMAlertProps, 'dismissible' | 'onDismiss'>) => {
      const id = Date.now().toString()
      setAlerts((prev) => [
        ...prev,
        {
          ...alert,
          id,
          dismissible: true,
          onDismiss: () => removeAlert(id),
          timestamp: new Date(),
        },
      ])
    },
    [removeAlert]
  )

  const clearAlerts = React.useCallback(() => {
    setAlerts([])
  }, [])

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
  }
}
