import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Clock, 
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Database,
  Shield,
  Lightbulb
} from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Enhanced Alert Variants for CRM Context
const crmAlertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        success: "bg-green-50/50 text-green-900 border-green-200 dark:bg-green-950/20 dark:text-green-100 dark:border-green-900/50 [&>svg]:text-green-600",
        warning: "bg-yellow-50/50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-100 dark:border-yellow-900/50 [&>svg]:text-yellow-600",
        error: "bg-red-50/50 text-red-900 border-red-200 dark:bg-red-950/20 dark:text-red-100 dark:border-red-900/50 [&>svg]:text-red-600",
        info: "bg-blue-50/50 text-blue-900 border-blue-200 dark:bg-blue-950/20 dark:text-blue-100 dark:border-blue-900/50 [&>svg]:text-blue-600",
        pending: "bg-orange-50/50 text-orange-900 border-orange-200 dark:bg-orange-950/20 dark:text-orange-100 dark:border-orange-900/50 [&>svg]:text-orange-600",
        opportunity: "bg-purple-50/50 text-purple-900 border-purple-200 dark:bg-purple-950/20 dark:text-purple-100 dark:border-purple-900/50 [&>svg]:text-purple-600",
        system: "bg-gray-50/50 text-gray-900 border-gray-200 dark:bg-gray-950/20 dark:text-gray-100 dark:border-gray-900/50 [&>svg]:text-gray-600"
      },
      size: {
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-3 text-sm",
        lg: "px-6 py-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

// Alert Type Definitions
export type CRMAlertVariant = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'pending' 
  | 'opportunity' 
  | 'system'

export interface CRMAlertProps extends 
  React.ComponentProps<"div">,
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
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  pending: Clock,
  opportunity: TrendingUp,
  system: Database
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
  const IconComponent = icon || alertIcons[variant]

  return (
    <div
      role="alert"
      className={cn(crmAlertVariants({ variant, size }), className)}
      {...props}
    >
      <IconComponent className="size-4 translate-y-0.5" />
      
      <div className="col-start-2 space-y-2">
        {/* Header with title, badge, and timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h5 className="font-medium tracking-tight truncate">{title}</h5>
            
            {badge && (
              <Badge variant={badge.variant || 'default'} className="shrink-0">
                {badge.text}
              </Badge>
            )}
            
            {priority && priority !== 'medium' && (
              <Badge 
                variant={priority === 'urgent' || priority === 'high' ? 'destructive' : 'secondary'}
                className="shrink-0 text-xs"
              >
                {priority.toUpperCase()}
              </Badge>
            )}
          </div>
          
          {timestamp && (
            <span className="text-xs text-muted-foreground shrink-0">
              {timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
        </div>
        
        {/* Description */}
        <div className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {action && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={action.onClick}
              className="h-7 px-2 text-xs"
            >
              {action.label}
            </Button>
          )}
          
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 px-2 text-xs ml-auto"
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
      badge: { text: 'Birthday', variant: 'secondary' as const }
    },
    follow_up: {
      title: `Follow-up Due: ${contactName}`,
      variant: 'pending' as const,
      icon: Clock,
      badge: { text: 'Follow-up', variant: 'outline' as const }
    },
    no_activity: {
      title: `No Recent Activity: ${contactName}`,
      variant: 'warning' as const,
      icon: Users,
      badge: { text: 'Inactive', variant: 'destructive' as const }
    },
    updated: {
      title: `Contact Updated: ${contactName}`,
      variant: 'success' as const,
      icon: CheckCircle,
      badge: { text: 'Updated', variant: 'default' as const }
    }
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
      badge: { text: 'Closing Soon', variant: 'outline' as const }
    },
    won: {
      title: `Opportunity Won: ${opportunityName}`,
      variant: 'success' as const,
      icon: CheckCircle,
      badge: { text: 'Won', variant: 'default' as const }
    },
    lost: {
      title: `Opportunity Lost: ${opportunityName}`,
      variant: 'error' as const,
      icon: XCircle,
      badge: { text: 'Lost', variant: 'destructive' as const }
    },
    stage_change: {
      title: `Stage Updated: ${opportunityName}`,
      variant: 'info' as const,
      icon: TrendingUp,
      badge: { text: 'Updated', variant: 'secondary' as const }
    },
    overdue: {
      title: `Opportunity Overdue: ${opportunityName}`,
      variant: 'warning' as const,
      icon: AlertTriangle,
      badge: { text: 'Overdue', variant: 'destructive' as const }
    }
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
      badge: { text: 'Maintenance', variant: 'outline' as const }
    },
    backup: {
      title: 'Data Backup',
      variant: 'success' as const,
      icon: Shield,
      badge: { text: 'Backup', variant: 'default' as const }
    },
    security: {
      title: 'Security Alert',
      variant: 'warning' as const,
      icon: Shield,
      badge: { text: 'Security', variant: 'destructive' as const }
    },
    performance: {
      title: 'Performance Notice',
      variant: 'warning' as const,
      icon: TrendingUp,
      badge: { text: 'Performance', variant: 'outline' as const }
    },
    sync: {
      title: 'Data Synchronization',
      variant: 'info' as const,
      icon: Database,
      badge: { text: 'Sync', variant: 'secondary' as const }
    },
    quota: {
      title: 'Usage Quota',
      variant: 'warning' as const,
      icon: AlertTriangle,
      badge: { text: 'Quota', variant: 'destructive' as const }
    }
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
  onDismissAll 
}: AlertContainerProps) {
  const displayAlerts = alerts.slice(0, maxAlerts)
  const hasMoreAlerts = alerts.length > maxAlerts

  if (alerts.length === 0) return null

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with dismiss all option */}
      {alerts.length > 1 && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">
            Notifications ({alerts.length})
          </h4>
          {onDismissAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismissAll}
              className="h-6 px-2 text-xs"
            >
              Dismiss All
            </Button>
          )}
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-2">
        {displayAlerts.map(({ id, ...alertProps }) => (
          <CRMAlert
            key={id}
            {...alertProps}
          />
        ))}
      </div>

      {/* More alerts indicator */}
      {hasMoreAlerts && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
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

  const addAlert = React.useCallback((alert: Omit<CRMAlertProps, 'dismissible' | 'onDismiss'>) => {
    const id = Date.now().toString()
    setAlerts(prev => [...prev, {
      ...alert,
      id,
      dismissible: true,
      onDismiss: () => removeAlert(id),
      timestamp: new Date()
    }])
  }, [])

  const removeAlert = React.useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const clearAlerts = React.useCallback(() => {
    setAlerts([])
  }, [])

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts
  }
}