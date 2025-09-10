import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Lightbulb,
  Zap,
  Users,
  Building,
  Package,
  TrendingUp,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Target,
  Clock,
  Globe,
  Shield,
  Settings,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  ArrowRight,
  ChevronRight
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// Tooltip Variants
const tooltipVariants = cva(
  "z-50 rounded-md px-3 py-1.5 text-xs text-balance shadow-lg border",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary",
        secondary: "bg-secondary text-secondary-foreground border-secondary",
        success: "bg-green-600 text-white border-green-600",
        warning: "bg-yellow-600 text-white border-yellow-600", 
        destructive: "bg-destructive text-destructive-foreground border-destructive",
        info: "bg-blue-600 text-white border-blue-600",
        dark: "bg-gray-900 text-white border-gray-800",
        light: "bg-white text-gray-900 border-gray-200 shadow-md"
      },
      size: {
        sm: "px-2 py-1 text-xs max-w-48",
        md: "px-3 py-1.5 text-xs max-w-64",
        lg: "px-4 py-2 text-sm max-w-80",
        xl: "px-4 py-3 text-sm max-w-96"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

// Base CRM Tooltip Props
export interface CRMTooltipProps extends VariantProps<typeof tooltipVariants> {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  sideOffset?: number
  disabled?: boolean
  className?: string
}

// Enhanced Tooltip Component
export function CRMTooltip({
  content,
  children,
  variant = 'default',
  size = 'md',
  side = 'top',
  align = 'center',
  delayDuration = 200,
  sideOffset = 4,
  disabled = false,
  className,
  ...props
}: CRMTooltipProps) {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(tooltipVariants({ variant, size }), className)}
          {...props}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Help Tooltip Component
export interface HelpTooltipProps {
  content: React.ReactNode
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HelpTooltip({
  content,
  children,
  size = 'md',
  className
}: HelpTooltipProps) {
  const iconSizes = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5'
  }

  const trigger = children || (
    <HelpCircle className={cn(iconSizes[size], 'text-muted-foreground hover:text-foreground cursor-help')} />
  )

  return (
    <CRMTooltip
      content={content}
      variant="dark"
      size="lg"
      className={className}
    >
      {trigger}
    </CRMTooltip>
  )
}

// Status Tooltip Component
export interface StatusTooltipProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending'
  title: string
  description?: string
  timestamp?: Date
  user?: string
  children: React.ReactNode
}

export function StatusTooltip({
  status,
  title,
  description,
  timestamp,
  user,
  children
}: StatusTooltipProps) {
  const statusConfig = {
    success: { icon: CheckCircle, variant: 'success' as const, color: 'text-green-600' },
    warning: { icon: AlertTriangle, variant: 'warning' as const, color: 'text-yellow-600' },
    error: { icon: XCircle, variant: 'destructive' as const, color: 'text-red-600' },
    info: { icon: Info, variant: 'info' as const, color: 'text-blue-600' },
    pending: { icon: Clock, variant: 'secondary' as const, color: 'text-orange-600' }
  }

  const config = statusConfig[status]
  const IconComponent = config.icon

  const content = (
    <div className="space-y-2 text-left">
      <div className="flex items-center gap-2">
        <IconComponent className={cn('size-4', config.color)} />
        <span className="font-medium">{title}</span>
      </div>
      
      {description && (
        <p className="text-xs opacity-90">{description}</p>
      )}
      
      {(timestamp || user) && (
        <div className="flex items-center gap-2 text-xs opacity-75 pt-1 border-t border-white/20">
          {timestamp && (
            <span>{timestamp.toLocaleString()}</span>
          )}
          {user && (
            <span>by {user}</span>
          )}
        </div>
      )}
    </div>
  )

  return (
    <CRMTooltip
      content={content}
      variant={config.variant}
      size="lg"
    >
      {children}
    </CRMTooltip>
  )
}

// Entity Preview Tooltip
export interface EntityPreviewTooltipProps {
  entityType: 'contact' | 'organization' | 'product' | 'opportunity' | 'interaction'
  data: {
    id: string
    name: string
    subtitle?: string
    avatar?: string
    status?: string
    priority?: string
    value?: number | string
    description?: string
    tags?: string[]
    lastActivity?: Date
  }
  children: React.ReactNode
}

export function EntityPreviewTooltip({
  entityType,
  data,
  children
}: EntityPreviewTooltipProps) {
  const entityConfig = {
    contact: { icon: Users, color: 'text-blue-600' },
    organization: { icon: Building, color: 'text-green-600' },
    product: { icon: Package, color: 'text-purple-600' },
    opportunity: { icon: TrendingUp, color: 'text-orange-600' },
    interaction: { icon: MessageSquare, color: 'text-teal-600' }
  }

  const config = entityConfig[entityType]
  const IconComponent = config.icon

  const content = (
    <div className="space-y-3 text-left min-w-64 max-w-80">
      {/* Header */}
      <div className="flex items-start gap-3">
        {data.avatar ? (
          <Avatar className="size-10">
            <AvatarImage src={data.avatar} />
            <AvatarFallback>
              {data.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
            <IconComponent className={cn('size-5', config.color)} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{data.name}</h4>
          {data.subtitle && (
            <p className="text-xs opacity-75 truncate">{data.subtitle}</p>
          )}
          
          <div className="flex items-center gap-1 mt-1">
            {data.status && (
              <Badge variant="secondary" className="text-xs">
                {data.status}
              </Badge>
            )}
            {data.priority && data.priority !== 'medium' && (
              <Badge 
                variant={data.priority === 'high' || data.priority === 'urgent' ? 'destructive' : 'outline'}
                className="text-xs"
              >
                {data.priority}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Value/Description */}
      {(data.value || data.description) && (
        <>
          <Separator className="bg-white/20" />
          <div className="space-y-1">
            {data.value && (
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-75">Value</span>
                <span className="font-medium">
                  {typeof data.value === 'number' 
                    ? `$${data.value.toLocaleString()}` 
                    : data.value}
                </span>
              </div>
            )}
            {data.description && (
              <p className="text-xs opacity-90 line-clamp-2">
                {data.description}
              </p>
            )}
          </div>
        </>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <>
          <Separator className="bg-white/20" />
          <div>
            <p className="text-xs opacity-75 mb-1">Tags</p>
            <div className="flex flex-wrap gap-1">
              {data.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-white/10 border-white/20">
                  {tag}
                </Badge>
              ))}
              {data.tags.length > 3 && (
                <Badge variant="outline" className="text-xs bg-white/10 border-white/20">
                  +{data.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </>
      )}

      {/* Last Activity */}
      {data.lastActivity && (
        <>
          <Separator className="bg-white/20" />
          <div className="flex items-center gap-2 text-xs opacity-75">
            <Clock className="size-3" />
            <span>Last activity: {data.lastActivity.toLocaleDateString()}</span>
          </div>
        </>
      )}
    </div>
  )

  return (
    <CRMTooltip
      content={content}
      variant="dark"
      size="xl"
      side="right"
      sideOffset={8}
      delayDuration={500}
    >
      {children}
    </CRMTooltip>
  )
}

// Feature Guide Tooltip
export interface FeatureGuideTooltipProps {
  title: string
  description: string
  steps?: string[]
  shortcut?: string
  learnMore?: {
    text: string
    url: string
  }
  children: React.ReactNode
}

export function FeatureGuideTooltip({
  title,
  description,
  steps,
  shortcut,
  learnMore,
  children
}: FeatureGuideTooltipProps) {
  const content = (
    <div className="space-y-3 text-left max-w-72">
      {/* Header */}
      <div className="flex items-start gap-2">
        <Lightbulb className="size-4 text-yellow-400 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-xs opacity-90 mt-1">{description}</p>
        </div>
      </div>

      {/* Steps */}
      {steps && steps.length > 0 && (
        <>
          <Separator className="bg-white/20" />
          <div>
            <p className="text-xs font-medium mb-2">How to use:</p>
            <ol className="text-xs space-y-1 opacity-90">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-yellow-400 shrink-0">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Shortcut */}
      {shortcut && (
        <>
          <Separator className="bg-white/20" />
          <div className="flex items-center gap-2">
            <Zap className="size-3 text-yellow-400" />
            <span className="text-xs opacity-75">Shortcut:</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-white/20 rounded border border-white/20">
              {shortcut}
            </kbd>
          </div>
        </>
      )}

      {/* Learn More */}
      {learnMore && (
        <>
          <Separator className="bg-white/20" />
          <div className="flex items-center gap-1 text-xs">
            <ExternalLink className="size-3" />
            <a 
              href={learnMore.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 underline"
            >
              {learnMore.text}
            </a>
          </div>
        </>
      )}
    </div>
  )

  return (
    <CRMTooltip
      content={content}
      variant="dark"
      size="xl"
      side="bottom"
      align="start"
      delayDuration={300}
    >
      {children}
    </CRMTooltip>
  )
}

// Progress Tooltip
export interface ProgressTooltipProps {
  title: string
  current: number
  total: number
  segments?: Array<{
    label: string
    value: number
    color: string
  }>
  children: React.ReactNode
}

export function ProgressTooltip({
  title,
  current,
  total,
  segments,
  children
}: ProgressTooltipProps) {
  const percentage = Math.round((current / total) * 100)

  const content = (
    <div className="space-y-3 text-left min-w-48">
      {/* Header */}
      <div>
        <h4 className="font-medium">{title}</h4>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="opacity-75">
            {current.toLocaleString()} / {total.toLocaleString()}
          </span>
          <span className="font-medium">{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={percentage} className="h-2" />

      {/* Segments */}
      {segments && segments.length > 0 && (
        <>
          <Separator className="bg-white/20" />
          <div className="space-y-2">
            {segments.map((segment, index) => {
              const segmentPercentage = Math.round((segment.value / total) * 100)
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="size-2 rounded-full" 
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="opacity-90">{segment.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-75">{segment.value.toLocaleString()}</span>
                    <span className="font-medium">({segmentPercentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )

  return (
    <CRMTooltip
      content={content}
      variant="dark"
      size="lg"
      side="top"
    >
      {children}
    </CRMTooltip>
  )
}

// Action Tooltip (for buttons and interactive elements)
export interface ActionTooltipProps {
  action: string
  description?: string
  shortcut?: string
  disabled?: boolean
  disabledReason?: string
  children: React.ReactNode
}

export function ActionTooltip({
  action,
  description,
  shortcut,
  disabled = false,
  disabledReason,
  children
}: ActionTooltipProps) {
  if (disabled && disabledReason) {
    return (
      <CRMTooltip
        content={
          <div className="flex items-center gap-2">
            <Lock className="size-3 text-red-400" />
            <span>{disabledReason}</span>
          </div>
        }
        variant="destructive"
        size="md"
      >
        {children}
      </CRMTooltip>
    )
  }

  const content = (
    <div className="flex items-center gap-2">
      <span>{action}</span>
      {description && (
        <>
          <span className="text-white/60">•</span>
          <span className="text-white/80">{description}</span>
        </>
      )}
      {shortcut && (
        <kbd className="ml-2 px-1 py-0.5 text-xs bg-white/20 rounded border border-white/20">
          {shortcut}
        </kbd>
      )}
    </div>
  )

  return (
    <CRMTooltip
      content={content}
      variant="dark"
      size="md"
    >
      {children}
    </CRMTooltip>
  )
}

// Quick Stats Tooltip
export interface QuickStatsTooltipProps {
  title: string
  stats: Array<{
    label: string
    value: string | number
    change?: {
      value: string
      trend: 'up' | 'down' | 'neutral'
    }
  }>
  children: React.ReactNode
}

export function QuickStatsTooltip({
  title,
  stats,
  children
}: QuickStatsTooltipProps) {
  const content = (
    <div className="space-y-3 text-left min-w-48">
      <h4 className="font-medium">{title}</h4>
      
      <div className="space-y-2">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-xs opacity-75">{stat.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </span>
              {stat.change && (
                <span className={cn(
                  'text-xs flex items-center gap-1',
                  stat.change.trend === 'up' ? 'text-green-400' :
                  stat.change.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                )}>
                  {stat.change.trend === 'up' && <TrendingUp className="size-3" />}
                  {stat.change.trend === 'down' && <TrendingUp className="size-3 rotate-180" />}
                  {stat.change.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <CRMTooltip
      content={content}
      variant="dark" 
      size="lg"
    >
      {children}
    </CRMTooltip>
  )
}

// Field Validation Tooltip
export interface FieldValidationTooltipProps {
  rules: string[]
  isValid?: boolean
  errors?: string[]
  children: React.ReactNode
}

export function FieldValidationTooltip({
  rules,
  isValid = true,
  errors = [],
  children
}: FieldValidationTooltipProps) {
  const content = (
    <div className="space-y-2 text-left max-w-64">
      <div className="flex items-center gap-2">
        {isValid ? (
          <CheckCircle className="size-4 text-green-400" />
        ) : (
          <XCircle className="size-4 text-red-400" />
        )}
        <span className="font-medium">
          {isValid ? 'Valid' : 'Invalid'} Field
        </span>
      </div>

      {/* Validation Rules */}
      <div>
        <p className="text-xs opacity-75 mb-1">Requirements:</p>
        <ul className="space-y-1">
          {rules.map((rule, index) => (
            <li key={index} className="flex items-start gap-2 text-xs">
              <CheckCircle className="size-3 text-green-400 mt-0.5 shrink-0" />
              <span className="opacity-90">{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <>
          <Separator className="bg-white/20" />
          <div>
            <p className="text-xs text-red-400 font-medium mb-1">Errors:</p>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <XCircle className="size-3 text-red-400 mt-0.5 shrink-0" />
                  <span className="text-red-200">{error}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )

  return (
    <CRMTooltip
      content={content}
      variant={isValid ? 'success' : 'destructive'}
      size="lg"
      side="right"
    >
      {children}
    </CRMTooltip>
  )
}