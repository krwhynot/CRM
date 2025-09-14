import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  semanticColors,
  textColors,
  borderColors,
} from '@/styles/tokens'
import {
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Zap,
  Users,
  Building,
  Package,
  TrendingUp,
  MessageSquare,
  Clock,
  ExternalLink,
  Lock,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
// Removed unused: import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// Tooltip Variants
const tooltipVariants = cva('z-50 text-balance rounded-md border px-3 py-1.5 text-xs shadow-lg', {
  variants: {
    variant: {
      default: 'border-primary bg-primary text-primary-foreground',
      secondary: 'border-secondary bg-secondary text-secondary-foreground',
      success: `${semanticColors.success.primary} ${textColors.inverse} ${borderColors.success}`,
      warning: `${semanticColors.warning.primary} ${textColors.inverse} ${borderColors.warning}`,
      destructive: `${semanticColors.destructive} ${borderColors.error}`,
      info: `${semanticColors.info.primary} ${textColors.inverse} ${borderColors.info}`,
      dark: 'border-border bg-popover text-popover-foreground',
      light: 'border-border bg-card text-card-foreground shadow-md',
    },
    size: {
      sm: 'max-w-48 px-2 py-1 text-xs',
      md: 'max-w-64 px-3 py-1.5 text-xs',
      lg: 'max-w-80 px-4 py-2 text-sm',
      xl: 'max-w-96 px-4 py-3 text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

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
        <TooltipTrigger asChild>{children}</TooltipTrigger>
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

export function HelpTooltip({ content, children, size = 'md', className }: HelpTooltipProps) {
  const iconSizes = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
  }

  const trigger = children || (
    <HelpCircle
      className={cn(iconSizes[size], textColors.secondary, 'hover:text-foreground cursor-help')}
    />
  )

  return (
    <CRMTooltip content={content} variant="dark" size="lg" className={className}>
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
  children,
}: StatusTooltipProps) {
  const statusConfig = {
    success: { icon: CheckCircle, variant: 'success' as const, color: semanticColors.text.success },
    warning: {
      icon: AlertTriangle,
      variant: 'warning' as const,
      color: semanticColors.text.warning,
    },
    error: { icon: XCircle, variant: 'destructive' as const, color: semanticColors.text.error },
    info: { icon: Info, variant: 'info' as const, color: semanticColors.text.info },
    pending: {
      icon: Clock,
      variant: 'secondary' as const,
      color: semanticColors.text.warningAccent,
    },
  }

  const config = statusConfig[status]
  const IconComponent = config.icon

  const content = (
    <div className={cn(semanticSpacing.stack.xs, 'text-left')}>
      <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
        <IconComponent className={cn('size-4', config.color)} />
        <span className={`${semanticTypography.label}`}>{title}</span>
      </div>

      {description && <p className={cn(semanticTypography.caption, 'opacity-90')}>{description}</p>}

      {(timestamp || user) && (
        <div
          className={cn(
            semanticSpacing.gap.xs,
            semanticTypography.caption,
            'flex items-center opacity-75 pt-1 border-t',
            borderColors.muted
          )}
        >
          {timestamp && <span>{timestamp.toLocaleString()}</span>}
          {user && <span>by {user}</span>}
        </div>
      )}
    </div>
  )

  return (
    <CRMTooltip content={content} variant={config.variant} size="lg">
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

export function EntityPreviewTooltip({ entityType, data, children }: EntityPreviewTooltipProps) {
  const entityConfig = {
    contact: { icon: Users, color: semanticColors.text.info },
    organization: { icon: Building, color: semanticColors.text.success },
    product: { icon: Package, color: textColors.info },
    opportunity: { icon: TrendingUp, color: semanticColors.text.warningAccent },
    interaction: { icon: MessageSquare, color: textColors.info },
  }

  const config = entityConfig[entityType]
  const IconComponent = config.icon

  const content = (
    <div className={cn(semanticSpacing.stack.sm, 'text-left min-w-64 max-w-80')}>
      {/* Header */}
      <div className={cn(semanticSpacing.gap.sm, 'flex items-start')}>
        {data.avatar ? (
          <Avatar className="size-10">
            <AvatarImage src={data.avatar} />
            <AvatarFallback>{data.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <div
            className={cn(
              semanticRadius.full,
              'size-10 flex items-center justify-center',
              semanticColors.muted
            )}
          >
            <IconComponent className={cn('size-5', config.color)} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4 className={cn(semanticTypography.label, 'truncate')}>{data.name}</h4>
          {data.subtitle && (
            <p className={cn(semanticTypography.caption, 'opacity-75 truncate')}>{data.subtitle}</p>
          )}

          <div className={cn(semanticSpacing.gap.xs, 'flex items-center mt-1')}>
            {data.status && (
              <Badge variant="secondary" className={`${semanticTypography.caption}`}>
                {data.status}
              </Badge>
            )}
            {data.priority && data.priority !== 'medium' && (
              <Badge
                variant={
                  data.priority === 'high' || data.priority === 'urgent' ? 'destructive' : 'outline'
                }
                className={`${semanticTypography.caption}`}
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
          <Separator className={borderColors.muted} />
          <div className={`${semanticSpacing.stack.xs}`}>
            {data.value && (
              <div className="flex items-center justify-between">
                <span className={cn(semanticTypography.caption, 'opacity-75')}>Value</span>
                <span className={`${semanticTypography.label}`}>
                  {typeof data.value === 'number' ? `$${data.value.toLocaleString()}` : data.value}
                </span>
              </div>
            )}
            {data.description && (
              <p className={cn(semanticTypography.caption, 'opacity-90 line-clamp-2')}>
                {data.description}
              </p>
            )}
          </div>
        </>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <>
          <Separator className={borderColors.muted} />
          <div>
            <p className={cn(semanticTypography.caption, 'opacity-75 mb-1')}>Tags</p>
            <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
              {data.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn(
                    semanticTypography.caption,
                    semanticColors.muted,
                    borderColors.muted
                  )}
                >
                  {tag}
                </Badge>
              ))}
              {data.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className={cn(
                    semanticTypography.caption,
                    semanticColors.muted,
                    borderColors.muted
                  )}
                >
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
          <Separator className={borderColors.muted} />
          <div
            className={cn(
              semanticSpacing.gap.xs,
              semanticTypography.caption,
              'flex items-center opacity-75'
            )}
          >
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
  children,
}: FeatureGuideTooltipProps) {
  const content = (
    <div className={cn(semanticSpacing.stack.sm, 'text-left max-w-72')}>
      {/* Header */}
      <div className={cn(semanticSpacing.gap.xs, 'flex items-start')}>
        <Lightbulb className={cn('size-4 mt-0.5 shrink-0', semanticColors.text.warningAccent)} />
        <div>
          <h4 className={`${semanticTypography.label}`}>{title}</h4>
          <p className={cn(semanticTypography.caption, 'opacity-90 mt-1')}>{description}</p>
        </div>
      </div>

      {/* Steps */}
      {steps && steps.length > 0 && (
        <>
          <Separator className={borderColors.muted} />
          <div>
            <p
              className={cn(
                semanticTypography.caption,
                semanticTypography.label,
                semanticSpacing.bottomGap.xs
              )}
            >
              How to use:
            </p>
            <ol className={cn(semanticTypography.caption, semanticSpacing.stack.xs, 'opacity-90')}>
              {steps.map((step, index) => (
                <li key={index} className={cn(semanticSpacing.gap.xs, 'flex')}>
                  <span className={cn(semanticColors.text.warningAccent, 'shrink-0')}>
                    {index + 1}.
                  </span>
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
          <Separator className={borderColors.muted} />
          <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
            <Zap className={cn('size-3', semanticColors.text.warningAccent)} />
            <span className={cn(semanticTypography.caption, 'opacity-75')}>Shortcut:</span>
            <kbd
              className={cn(
                semanticTypography.caption,
                semanticRadius.small,
                'px-1.5 py-0.5 border',
                semanticColors.muted,
                borderColors.muted
              )}
            >
              {shortcut}
            </kbd>
          </div>
        </>
      )}

      {/* Learn More */}
      {learnMore && (
        <>
          <Separator className={borderColors.muted} />
          <div
            className={cn(semanticSpacing.gap.xs, semanticTypography.caption, 'flex items-center')}
          >
            <ExternalLink className="size-3" />
            <a
              href={learnMore.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(semanticColors.text.infoAccent, 'hover:opacity-80 underline')}
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
  children,
}: ProgressTooltipProps) {
  const percentage = Math.round((current / total) * 100)

  const content = (
    <div className={cn(semanticSpacing.stack.sm, 'text-left min-w-48')}>
      {/* Header */}
      <div>
        <h4 className={`${semanticTypography.label}`}>{title}</h4>
        <div className={cn(semanticTypography.caption, 'flex items-center justify-between mt-1')}>
          <span className="opacity-75">
            {current.toLocaleString()} / {total.toLocaleString()}
          </span>
          <span className={`${semanticTypography.label}`}>{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={percentage} className="h-2" />

      {/* Segments */}
      {segments && segments.length > 0 && (
        <>
          <Separator className={borderColors.muted} />
          <div className={`${semanticSpacing.stack.xs}`}>
            {segments.map((segment, index) => {
              const segmentPercentage = Math.round((segment.value / total) * 100)
              return (
                <div
                  key={index}
                  className={cn(semanticTypography.caption, 'flex items-center justify-between')}
                >
                  <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
                    <div
                      className={cn(semanticRadius.full, 'size-2')}
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="opacity-90">{segment.label}</span>
                  </div>
                  <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
                    <span className="opacity-75">{segment.value.toLocaleString()}</span>
                    <span className={`${semanticTypography.label}`}>({segmentPercentage}%)</span>
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
    <CRMTooltip content={content} variant="dark" size="lg" side="top">
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
  children,
}: ActionTooltipProps) {
  if (disabled && disabledReason) {
    return (
      <CRMTooltip
        content={
          <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
            <Lock className={cn('size-3', semanticColors.text.error)} />
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
    <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
      <span>{action}</span>
      {description && (
        <>
          <span className="opacity-60">•</span>
          <span className="opacity-80">{description}</span>
        </>
      )}
      {shortcut && (
        <kbd
          className={cn(
            semanticSpacing.leftGap.xs,
            semanticSpacing.minimalX,
            semanticTypography.caption,
            semanticRadius.small,
            'py-0.5 border',
            semanticColors.muted,
            borderColors.muted
          )}
        >
          {shortcut}
        </kbd>
      )}
    </div>
  )

  return (
    <CRMTooltip content={content} variant="dark" size="md">
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

export function QuickStatsTooltip({ title, stats, children }: QuickStatsTooltipProps) {
  const content = (
    <div className={cn(semanticSpacing.stack.sm, 'text-left min-w-48')}>
      <h4 className={`${semanticTypography.label}`}>{title}</h4>

      <div className={`${semanticSpacing.stack.xs}`}>
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={cn(semanticTypography.caption, 'opacity-75')}>{stat.label}</span>
            <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
              <span className={`${semanticTypography.label}`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </span>
              {stat.change && (
                <span
                  className={cn(
                    'text-xs flex items-center gap-1',
                    stat.change.trend === 'up'
                      ? semanticColors.text.success
                      : stat.change.trend === 'down'
                        ? semanticColors.text.error
                        : textColors.tertiary
                  )}
                >
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
    <CRMTooltip content={content} variant="dark" size="lg">
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
  children,
}: FieldValidationTooltipProps) {
  const content = (
    <div className={cn(semanticSpacing.stack.xs, 'text-left max-w-64')}>
      <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
        {isValid ? (
          <CheckCircle className={cn('size-4', semanticColors.text.success)} />
        ) : (
          <XCircle className={cn('size-4', semanticColors.text.error)} />
        )}
        <span className={`${semanticTypography.label}`}>{isValid ? 'Valid' : 'Invalid'} Field</span>
      </div>

      {/* Validation Rules */}
      <div>
        <p className={cn(semanticTypography.caption, 'opacity-75 mb-1')}>Requirements:</p>
        <ul className={`${semanticSpacing.stack.xs}`}>
          {rules.map((rule, index) => (
            <li
              key={index}
              className={cn(semanticSpacing.gap.xs, semanticTypography.caption, 'flex items-start')}
            >
              <CheckCircle className={cn('size-3 mt-0.5 shrink-0', semanticColors.text.success)} />
              <span className="opacity-90">{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <>
          <Separator className={borderColors.muted} />
          <div>
            <p
              className={cn(
                semanticTypography.caption,
                semanticTypography.label,
                semanticColors.text.error,
                'mb-1'
              )}
            >
              Errors:
            </p>
            <ul className={`${semanticSpacing.stack.xs}`}>
              {errors.map((error, index) => (
                <li
                  key={index}
                  className={cn(
                    semanticSpacing.gap.xs,
                    semanticTypography.caption,
                    'flex items-start'
                  )}
                >
                  <XCircle className={cn('size-3 mt-0.5 shrink-0', semanticColors.text.error)} />
                  <span className={cn(semanticColors.text.error, 'opacity-90')}>{error}</span>
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
