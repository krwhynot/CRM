import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Activity,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// Dashboard Card Variants
const dashboardCardVariants = cva('relative overflow-hidden transition-all duration-200', {
  variants: {
    size: {
      sm: 'min-h-[120px]',
      md: 'min-h-[160px]',
      lg: 'min-h-[200px]',
      xl: 'min-h-[240px]',
      auto: 'min-h-fit',
    },
    variant: {
      default: 'bg-card hover:bg-accent/5',
      primary: 'border-primary/20 bg-primary/5 hover:bg-primary/10',
      success:
        'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-950/20 dark:hover:bg-green-950/30',
      warning:
        'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-900/50 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30',
      destructive:
        'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:hover:bg-red-950/30',
    },
    interactive: {
      true: 'cursor-pointer hover:scale-[1.02] hover:shadow-md',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    interactive: false,
  },
})

// Base Dashboard Card Props
export interface DashboardCardProps
  extends React.ComponentProps<typeof Card>,
    VariantProps<typeof dashboardCardVariants> {
  title: string
  subtitle?: string
  description?: string
  value?: string | number
  previousValue?: string | number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string | number
  icon?: React.ComponentType<{ className?: string }>
  actions?: Array<{
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
  }>
  loading?: boolean
  error?: string
  onRefresh?: () => void
  href?: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

// Metric Card Component
export function MetricCard({
  title,
  subtitle,
  value,
  previousValue,
  trend,
  trendValue,
  icon: Icon,
  size = 'md',
  variant = 'default',
  interactive = false,
  actions = [],
  loading = false,
  error,
  onRefresh,
  href,
  badge,
  className,
  onClick,
  ...props
}: DashboardCardProps) {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'

  const cardContent = (
    <Card
      className={cn(dashboardCardVariants({ size, variant, interactive }), className)}
      onClick={onClick}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
          <CardTitle className={cn(semanticTypography.body, semanticTypography.label, 'truncate')}>
            {title}
          </CardTitle>
          {badge && (
            <Badge
              variant={badge.variant || 'secondary'}
              className={`${semanticTypography.caption}`}
            >
              {badge.text}
            </Badge>
          )}
        </div>

        <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
          {Icon && <Icon className="size-4 text-muted-foreground" />}

          {/* Actions Dropdown */}
          {(actions.length > 0 || onRefresh) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onRefresh && (
                  <>
                    <DropdownMenuItem onClick={onRefresh}>
                      <RefreshCw className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                      Refresh
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {actions.map((action, index) => (
                  <DropdownMenuItem key={index} onClick={action.onClick}>
                    {action.icon && (
                      <action.icon className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                    )}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {href && (
            <Button variant="ghost" className="size-8 p-0" asChild>
              <a href={href} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className={`${semanticSpacing.stack.xs}`}>
            <div className={cn(semanticRadius.small, 'h-8 bg-muted animate-pulse')} />
            <div className={cn(semanticRadius.small, 'h-4 bg-muted animate-pulse w-1/2')} />
          </div>
        ) : error ? (
          <div className={cn(semanticTypography.body, 'text-destructive')}>{error}</div>
        ) : (
          <div className={`${semanticSpacing.stack.xs}`}>
            <div className={cn(semanticTypography.h2, semanticTypography.h2)}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>

            {subtitle && (
              <p className={cn(semanticTypography.caption, 'text-muted-foreground')}>{subtitle}</p>
            )}

            {/* Trend Information */}
            {(trend || trendValue) && (
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                {trendIcon &&
                  React.createElement(trendIcon, { className: cn('h-4 w-4', trendColor) })}
                {trendValue && (
                  <span className={cn('text-xs font-medium', trendColor)}>{trendValue}</span>
                )}
                {previousValue && (
                  <span className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                    vs{' '}
                    {typeof previousValue === 'number'
                      ? previousValue.toLocaleString()
                      : previousValue}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return cardContent
}

// Progress Card Component
export interface ProgressCardProps extends Omit<DashboardCardProps, 'value'> {
  value: number
  max: number
  segments?: Array<{
    label: string
    value: number
    color?: string
  }>
  showPercentage?: boolean
  showValue?: boolean
}

export function ProgressCard({
  title,
  subtitle,
  value,
  max,
  segments,
  showPercentage = true,
  showValue = true,
  icon: Icon,
  size = 'md',
  variant = 'default',
  actions = [],
  className,
  ...props
}: ProgressCardProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <Card className={cn(dashboardCardVariants({ size, variant }), className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(semanticTypography.body, semanticTypography.label)}>
          {title}
        </CardTitle>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </CardHeader>

      <CardContent className={`${semanticSpacing.stack.sm}`}>
        {subtitle && (
          <p className={cn(semanticTypography.caption, 'text-muted-foreground')}>{subtitle}</p>
        )}

        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={cn(semanticTypography.body, 'flex justify-between')}>
            {showValue && (
              <span className={`${semanticTypography.label}`}>
                {value.toLocaleString()} / {max.toLocaleString()}
              </span>
            )}
            {showPercentage && <span className="text-muted-foreground">{percentage}%</span>}
          </div>

          <Progress value={percentage} className="w-full" />
        </div>

        {/* Segments */}
        {segments && segments.length > 0 && (
          <div className={`${semanticSpacing.stack.xs}`}>
            {segments.map((segment, index) => (
              <div
                key={index}
                className={cn(semanticTypography.caption, 'flex items-center justify-between')}
              >
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                  {segment.color && (
                    <div
                      className={cn(semanticRadius.full, 'w-2 h-2')}
                      style={{ backgroundColor: segment.color }}
                    />
                  )}
                  <span>{segment.label}</span>
                </div>
                <span className={`${semanticTypography.label}`}>
                  {segment.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Activity Card Component
export interface ActivityItem {
  id: string
  type: 'contact' | 'opportunity' | 'task' | 'meeting' | 'call' | 'email'
  title: string
  description?: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
  }
  status?: 'completed' | 'pending' | 'overdue'
  priority?: 'low' | 'medium' | 'high'
}

export interface ActivityCardProps extends Omit<DashboardCardProps, 'value'> {
  activities: ActivityItem[]
  showAll?: boolean
  maxItems?: number
  onViewAll?: () => void
}

export function ActivityCard({
  title,
  subtitle,
  activities,
  showAll = false,
  maxItems = 5,
  onViewAll,
  size = 'lg',
  className,
  ...props
}: ActivityCardProps) {
  const displayActivities = showAll ? activities : activities.slice(0, maxItems)

  const getActivityIcon = (type: ActivityItem['type']) => {
    const icons = {
      contact: Users,
      opportunity: Target,
      task: CheckCircle,
      meeting: Calendar,
      call: Phone,
      email: Mail,
    }
    return icons[type] || Activity
  }

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'overdue':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <Card className={cn(dashboardCardVariants({ size }), className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className={cn(semanticTypography.body, semanticTypography.label)}>
            {title}
          </CardTitle>
          {subtitle && (
            <CardDescription className={cn(semanticTypography.caption, 'mt-1')}>
              {subtitle}
            </CardDescription>
          )}
        </div>

        {onViewAll && !showAll && activities.length > maxItems && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All ({activities.length})
          </Button>
        )}
      </CardHeader>

      <CardContent className={`${semanticSpacing.stack.sm}`}>
        {displayActivities.length === 0 ? (
          <div className={cn(semanticSpacing.cardY, 'text-center text-muted-foreground')}>
            <Activity className={cn(semanticSpacing.bottomGap.xs, 'h-8 w-8 mx-auto opacity-50')} />
            <p className={`${semanticTypography.body}`}>No recent activity</p>
          </div>
        ) : (
          <div className={`${semanticSpacing.stack.sm}`}>
            {displayActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type)

              return (
                <div
                  key={activity.id}
                  className={cn(semanticSpacing.inline.sm, 'flex items-start')}
                >
                  <div className="relative">
                    {activity.user?.avatar ? (
                      <Avatar className="size-6">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className={`${semanticTypography.caption}`}>
                          {activity.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div
                        className={cn(
                          semanticRadius.full,
                          'h-6 w-6 bg-muted flex items-center justify-center'
                        )}
                      >
                        <IconComponent className="size-3" />
                      </div>
                    )}

                    {activity.status && (
                      <div
                        className={cn(
                          'absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-background',
                          getStatusColor(activity.status)
                        )}
                      />
                    )}
                  </div>

                  <div className={cn(semanticSpacing.stack.xs, 'flex-1 min-w-0')}>
                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          semanticTypography.body,
                          semanticTypography.label,
                          'truncate'
                        )}
                      >
                        {activity.title}
                      </p>
                      <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                        {activity.priority && activity.priority !== 'medium' && (
                          <Badge
                            variant={activity.priority === 'high' ? 'destructive' : 'secondary'}
                            className={`${semanticTypography.caption}`}
                          >
                            {activity.priority}
                          </Badge>
                        )}
                        <span className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                          {activity.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {activity.description && (
                      <p
                        className={cn(semanticTypography.caption, 'text-muted-foreground truncate')}
                      >
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Quick Actions Card
export interface QuickActionCardProps extends Omit<DashboardCardProps, 'value'> {
  actions: Array<{
    id: string
    label: string
    description?: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    shortcut?: string
    disabled?: boolean
  }>
  layout?: 'grid' | 'list'
}

export function QuickActionsCard({
  title,
  subtitle,
  actions,
  layout = 'grid',
  size = 'md',
  className,
  ...props
}: QuickActionCardProps) {
  return (
    <Card className={cn(dashboardCardVariants({ size }), className)} {...props}>
      <CardHeader>
        <CardTitle className={cn(semanticTypography.body, semanticTypography.label)}>
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className={`${semanticTypography.caption}`}>{subtitle}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2')}>
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={cn('justify-start h-auto p-3', layout === 'list' && 'w-full')}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className={cn(semanticSpacing.inline.xs, 'flex items-center w-full')}>
                <action.icon className="size-4 shrink-0" />
                <div className="min-w-0 flex-1 text-left">
                  <div
                    className={cn(semanticTypography.body, semanticTypography.label, 'truncate')}
                  >
                    {action.label}
                  </div>
                  {action.description && (
                    <div
                      className={cn(semanticTypography.caption, 'text-muted-foreground truncate')}
                    >
                      {action.description}
                    </div>
                  )}
                </div>
                {action.shortcut && (
                  <kbd
                    className={cn(
                      semanticSpacing.gap.xs,
                      semanticRadius.small,
                      semanticTypography.label,
                      'hidden sm:inline-flex h-5 select-none items-center border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground'
                    )}
                  >
                    {action.shortcut}
                  </kbd>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Chart Container Card
export interface ChartCardProps extends Omit<DashboardCardProps, 'value'> {
  children: React.ReactNode
  chartType?: 'line' | 'bar' | 'pie' | 'area'
  period?: string
  filters?: React.ReactNode
}

export function ChartCard({
  title,
  subtitle,
  children,
  chartType,
  period,
  filters,
  actions = [],
  size = 'xl',
  className,
  ...props
}: ChartCardProps) {
  return (
    <Card className={cn(dashboardCardVariants({ size }), className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className={cn(semanticTypography.body, semanticTypography.label)}>
            {title}
          </CardTitle>
          {subtitle && (
            <CardDescription className={cn(semanticTypography.caption, 'mt-1')}>
              {subtitle}
            </CardDescription>
          )}
        </div>

        <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
          {period && (
            <Badge variant="outline" className={`${semanticTypography.caption}`}>
              {period}
            </Badge>
          )}

          {filters}

          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem key={index} onClick={action.onClick}>
                    {action.icon && (
                      <action.icon className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                    )}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex size-full min-h-[200px] items-center justify-center">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// Status Overview Card
export interface StatusItem {
  label: string
  count: number
  color: string
  percentage?: number
  trend?: 'up' | 'down' | 'neutral'
}

export interface StatusOverviewCardProps extends Omit<DashboardCardProps, 'value'> {
  items: StatusItem[]
  total?: number
  showTotal?: boolean
}

export function StatusOverviewCard({
  title,
  subtitle,
  items,
  total,
  showTotal = true,
  size = 'md',
  className,
  ...props
}: StatusOverviewCardProps) {
  const calculatedTotal = total || items.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className={cn(dashboardCardVariants({ size }), className)} {...props}>
      <CardHeader>
        <CardTitle className={cn(semanticTypography.body, semanticTypography.label)}>
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className={`${semanticTypography.caption}`}>{subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.sm}`}>
        {showTotal && (
          <>
            <div className="text-center">
              <div className={cn(semanticTypography.h2, semanticTypography.h2)}>
                {calculatedTotal.toLocaleString()}
              </div>
              <div className={cn(semanticTypography.caption, 'text-muted-foreground')}>Total</div>
            </div>
            <Separator />
          </>
        )}

        <div className={`${semanticSpacing.stack.xs}`}>
          {items.map((item, index) => {
            const percentage =
              item.percentage ||
              (calculatedTotal > 0 ? Math.round((item.count / calculatedTotal) * 100) : 0)

            return (
              <div key={index} className="flex items-center justify-between">
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center flex-1')}>
                  <div
                    className={cn(semanticRadius.full, 'w-2 h-2 shrink-0')}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={cn(semanticTypography.body, 'truncate')}>{item.label}</span>
                </div>
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center text-right')}>
                  <span className={cn(semanticTypography.body, semanticTypography.label)}>
                    {item.count.toLocaleString()}
                  </span>
                  <span className={cn(semanticTypography.caption, 'text-muted-foreground w-8')}>
                    {percentage}%
                  </span>
                  {item.trend &&
                    item.trend !== 'neutral' &&
                    (item.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 ${text-success}" />
                    ) : (
                      <TrendingDown className="h-3 w-3 ${text-destructive}" />
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
