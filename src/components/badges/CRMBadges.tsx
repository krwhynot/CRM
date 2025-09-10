import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  XCircle, 
  Clock,
  Archive,
  AlertTriangle,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Shield,
  Users,
  Building2,
  Package,
  Target,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  Activity
} from 'lucide-react'

// Base badge props
interface BaseBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  children?: React.ReactNode
}

// Status Badge Types
export type StatusType = 'active' | 'inactive' | 'pending' | 'archived' | 'draft' | 'expired'
export type PriorityType = 'a-plus' | 'a' | 'b' | 'c' | 'd'
export type OrganizationType = 'customer' | 'distributor' | 'principal' | 'supplier'
export type OpportunityStageType = 'prospecting' | 'qualification' | 'needs-analysis' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
export type InteractionType = 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'contract' | 'support' | 'follow-up' | 'other'
export type HealthType = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
export type EngagementType = 'high' | 'medium' | 'low' | 'none'
export type TrendType = 'up' | 'down' | 'stable' | 'volatile'

// Size variants
const sizeVariants = {
  sm: 'text-xs px-1.5 py-0.5 h-5',
  md: 'text-xs px-2 py-0.5 h-6',
  lg: 'text-sm px-2.5 py-1 h-7'
}

// Status Badge Component
export interface StatusBadgeProps extends BaseBadgeProps {
  status: StatusType
  label?: string
}

export function StatusBadge({ 
  status, 
  label, 
  size = 'md', 
  showIcon = true, 
  className, 
  children 
}: StatusBadgeProps) {
  const statusConfig = {
    active: {
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
      icon: CheckCircle,
      label: 'Active'
    },
    inactive: {
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
      icon: XCircle,
      label: 'Inactive'
    },
    pending: {
      variant: 'outline' as const,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
      icon: Clock,
      label: 'Pending'
    },
    archived: {
      variant: 'outline' as const,
      className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
      icon: Archive,
      label: 'Archived'
    },
    draft: {
      variant: 'outline' as const,
      className: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
      icon: FileText,
      label: 'Draft'
    },
    expired: {
      variant: 'outline' as const,
      className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
      icon: AlertTriangle,
      label: 'Expired'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon
  const displayLabel = children || label || config.label

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        sizeVariants[size],
        config.className,
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </Badge>
  )
}

// Priority Badge Component
export interface PriorityBadgeProps extends BaseBadgeProps {
  priority: PriorityType
  label?: string
}

export function PriorityBadge({ 
  priority, 
  label, 
  size = 'md', 
  showIcon = true, 
  className, 
  children 
}: PriorityBadgeProps) {
  const priorityConfig = {
    'a-plus': {
      className: 'bg-red-500 text-white border-red-600 hover:bg-red-600',
      icon: Zap,
      label: 'A+',
      description: 'Highest Priority'
    },
    'a': {
      className: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
      icon: Star,
      label: 'A',
      description: 'High Priority'
    },
    'b': {
      className: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200',
      icon: TrendingUp,
      label: 'B',
      description: 'Medium Priority'
    },
    'c': {
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
      icon: Minus,
      label: 'C',
      description: 'Low Priority'
    },
    'd': {
      className: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
      icon: TrendingDown,
      label: 'D',
      description: 'Lowest Priority'
    }
  }

  const config = priorityConfig[priority]
  const Icon = config.icon
  const displayLabel = children || label || config.label

  return (
    <Badge 
      variant="outline"
      title={config.description}
      className={cn(
        sizeVariants[size],
        config.className,
        'inline-flex items-center gap-1 font-semibold',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </Badge>
  )
}

// Organization Type Badge Component
export interface OrganizationTypeBadgeProps extends BaseBadgeProps {
  type: OrganizationType
  label?: string
}

export function OrganizationTypeBadge({ 
  type, 
  label, 
  size = 'md', 
  showIcon = true, 
  className, 
  children 
}: OrganizationTypeBadgeProps) {
  const typeConfig = {
    customer: {
      className: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
      icon: Users,
      label: 'Customer'
    },
    distributor: {
      className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
      icon: Building2,
      label: 'Distributor'
    },
    principal: {
      className: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
      icon: Shield,
      label: 'Principal'
    },
    supplier: {
      className: 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200',
      icon: Package,
      label: 'Supplier'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon
  const displayLabel = children || label || config.label

  return (
    <Badge 
      variant="outline"
      className={cn(
        sizeVariants[size],
        config.className,
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </Badge>
  )
}

// Opportunity Stage Badge Component
export interface OpportunityStageBadgeProps extends BaseBadgeProps {
  stage: OpportunityStageType
  label?: string
}

export function OpportunityStageBadge({ 
  stage, 
  label, 
  size = 'md', 
  showIcon = true, 
  className, 
  children 
}: OpportunityStageBadgeProps) {
  const stageConfig = {
    prospecting: {
      className: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
      icon: Target,
      label: 'Prospecting',
      progress: 10
    },
    qualification: {
      className: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
      icon: CheckCircle,
      label: 'Qualification',
      progress: 25
    },
    'needs-analysis': {
      className: 'bg-cyan-100 text-cyan-700 border-cyan-300 hover:bg-cyan-200',
      icon: Activity,
      label: 'Needs Analysis',
      progress: 40
    },
    proposal: {
      className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
      icon: FileText,
      label: 'Proposal',
      progress: 65
    },
    negotiation: {
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
      icon: Settings,
      label: 'Negotiation',
      progress: 80
    },
    'closed-won': {
      className: 'bg-green-500 text-white border-green-600 hover:bg-green-600',
      icon: CheckCircle,
      label: 'Closed Won',
      progress: 100
    },
    'closed-lost': {
      className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
      icon: XCircle,
      label: 'Closed Lost',
      progress: 0
    }
  }

  const config = stageConfig[stage]
  const Icon = config.icon
  const displayLabel = children || label || config.label

  return (
    <Badge 
      variant="outline"
      className={cn(
        sizeVariants[size],
        config.className,
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </Badge>
  )
}

// Interaction Type Badge Component
export interface InteractionTypeBadgeProps extends BaseBadgeProps {
  type: InteractionType
  label?: string
}

export function InteractionTypeBadge({ 
  type, 
  label, 
  size = 'md', 
  showIcon = true, 
  className, 
  children 
}: InteractionTypeBadgeProps) {
  const typeConfig = {
    call: {
      className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
      icon: Phone,
      label: 'Call'
    },
    email: {
      className: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
      icon: Mail,
      label: 'Email'
    },
    meeting: {
      className: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200',
      icon: Calendar,
      label: 'Meeting'
    },
    demo: {
      className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
      icon: Activity,
      label: 'Demo'
    },
    proposal: {
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
      icon: FileText,
      label: 'Proposal'
    },
    contract: {
      className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
      icon: Shield,
      label: 'Contract'
    },
    support: {
      className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
      icon: AlertTriangle,
      label: 'Support'
    },
    'follow-up': {
      className: 'bg-cyan-100 text-cyan-700 border-cyan-300 hover:bg-cyan-200',
      icon: Clock,
      label: 'Follow-up'
    },
    other: {
      className: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
      icon: MessageSquare,
      label: 'Other'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon
  const displayLabel = children || label || config.label

  return (
    <Badge 
      variant="outline"
      className={cn(
        sizeVariants[size],
        config.className,
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </Badge>
  )
}

// Health Badge Component
export interface HealthBadgeProps extends BaseBadgeProps {
  health: HealthType
  label?: string
}

export function HealthBadge({ 
  health, 
  label, 
  size = 'md', 
  showIcon = true, 
  className, 
  children 
}: HealthBadgeProps) {
  const healthConfig = {
    excellent: {
      className: 'bg-green-500 text-white border-green-600 hover:bg-green-600',
      icon: Heart,
      label: 'Excellent'
    },
    good: {
      className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
      icon: ThumbsUp,
      label: 'Good'
    },
    fair: {
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
      icon: Battery,
      label: 'Fair'
    },
    poor: {
      className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
      icon: BatteryLow,
      label: 'Poor'
    },
    critical: {
      className: 'bg-red-500 text-white border-red-600 hover:bg-red-600',
      icon: AlertTriangle,
      label: 'Critical'
    }
  }

  const config = healthConfig[health]
  const Icon = config.icon
  const displayLabel = children || label || config.label

  return (
    <Badge 
      variant="outline"
      className={cn(
        sizeVariants[size],
        config.className,
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </Badge>
  )
}

// Engagement Badge Component
export interface EngagementBadgeProps extends BaseBadgeProps {
  engagement: EngagementType
  label?: string
}

export function EngagementBadge({ 
  engagement, 
  label, 
  size = 'md', 
  showIcon = true, 
  className, 
  children 
}: EngagementBadgeProps) {
  const engagementConfig = {
    high: {
      className: 'bg-green-500 text-white border-green-600 hover:bg-green-600',
      icon: SignalHigh,
      label: 'High'
    },
    medium: {
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
      icon: Signal,
      label: 'Medium'
    },
    low: {
      className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
      icon: SignalLow,
      label: 'Low'
    },
    none: {
      className: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
      icon: Minus,
      label: 'None'
    }
  }

  const config = engagementConfig[engagement]
  const Icon = config.icon
  const displayLabel = children || label || config.label

  return (
    <Badge 
      variant="outline"
      className={cn(
        sizeVariants[size],
        config.className,
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </Badge>
  )
}

// Trend Badge Component
export interface TrendBadgeProps extends BaseBadgeProps {
  trend: TrendType
  label?: string
  value?: string | number
}

export function TrendBadge({ 
  trend, 
  label, 
  value,
  size = 'md', 
  showIcon = true, 
  className, 
  children 
}: TrendBadgeProps) {
  const trendConfig = {
    up: {
      className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
      icon: TrendingUp,
      label: 'Up'
    },
    down: {
      className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
      icon: TrendingDown,
      label: 'Down'
    },
    stable: {
      className: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
      icon: Minus,
      label: 'Stable'
    },
    volatile: {
      className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
      icon: Activity,
      label: 'Volatile'
    }
  }

  const config = trendConfig[trend]
  const Icon = config.icon
  const displayLabel = children || label || config.label

  return (
    <Badge 
      variant="outline"
      className={cn(
        sizeVariants[size],
        config.className,
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{displayLabel}</span>
      {value && <span className="font-semibold">({value})</span>}
    </Badge>
  )
}

// Generic Badge Component with custom colors
export interface CustomBadgeProps extends BaseBadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink' | 'gray'
  icon?: React.ComponentType<{ className?: string }>
  label: string
}

export function CustomBadge({ 
  variant = 'outline',
  color = 'gray',
  icon: Icon,
  label,
  size = 'md', 
  className, 
  children 
}: CustomBadgeProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
    red: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200',
    pink: 'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        sizeVariants[size],
        variant === 'outline' && colorClasses[color],
        'inline-flex items-center gap-1',
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children || label}
    </Badge>
  )
}

// Badge Group Component for displaying multiple related badges
export interface BadgeGroupProps {
  badges: React.ReactNode[]
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

export function BadgeGroup({ badges, className, spacing = 'md' }: BadgeGroupProps) {
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  }

  return (
    <div className={cn('flex flex-wrap items-center', spacingClasses[spacing], className)}>
      {badges}
    </div>
  )
}