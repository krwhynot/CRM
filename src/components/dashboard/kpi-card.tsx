import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { useDashboardDensity } from '@/features/dashboard/hooks/useDashboardDensity'

import { semanticSpacing, semanticRadius, semanticTypography } from '@/styles/tokens'
interface KpiCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'success' | 'warning' | 'error'
  subtitle?: string
  isLoading?: boolean
  className?: string
  onClick?: () => void
  size?: 'default' | 'compact'
}

const variantStyles = {
  default: {
    card: 'border-border hover:border-primary/20 bg-background',
    title: 'text-muted-foreground',
    value: 'text-primary',
    icon: 'text-muted-foreground',
  },
  success: {
    card: 'border-success/20 hover:border-success/30 bg-success/5',
    title: 'text-success',
    value: 'text-success-foreground',
    icon: 'text-success',
  },
  warning: {
    card: 'border-warning/20 hover:border-warning/30 bg-warning/5',
    title: 'text-warning',
    value: 'text-warning-foreground',
    icon: 'text-warning',
  },
  error: {
    card: 'border-destructive/20 hover:border-destructive/30 bg-destructive/5',
    title: 'text-destructive',
    value: 'text-destructive-foreground',
    icon: 'text-destructive',
  },
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = 'neutral',
  variant = 'default',
  subtitle,
  isLoading = false,
  className,
  onClick,
  size = 'default',
}: KpiCardProps) {
  const styles = variantStyles[variant]
  const { density } = useDashboardDensity()

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  }

  // Use density to override size if not explicitly set
  const effectiveSize = size !== 'default' ? size : density === 'compact' ? 'compact' : 'default'

  if (isLoading) {
    if (effectiveSize === 'compact') {
      return (
        <Card
          className={cn(
            'kpi-card density-transition justify-between',
            density === 'compact' ? 'h-16' : 'h-20',
            className
          )}
        >
          <CardContent
            className={cn(
              'flex items-center justify-between',
              density === 'compact'
                ? `${semanticSpacing.layoutPadding.xs}`
                : `${semanticSpacing.layoutPadding.lg}`
            )}
          >
            <div className={cn(semanticSpacing.stack.xs, 'animate-pulse')}>
              <div
                className={cn(
                  'rounded bg-muted-foreground/20',
                  density === 'compact' ? 'h-2.5 w-12' : 'h-3 w-16'
                )}
              ></div>
              <div
                className={cn(
                  'rounded bg-muted-foreground/20',
                  density === 'compact' ? 'h-5 w-10' : 'h-6 w-12'
                )}
              ></div>
            </div>
            <div
              className={cn(
                'animate-pulse rounded bg-muted-foreground/20',
                density === 'compact' ? 'size-4' : 'size-5'
              )}
            ></div>
          </CardContent>
        </Card>
      )
    }
    return (
      <Card className={cn('kpi-card justify-between', className)}>
        <CardHeader className={`${semanticSpacing.bottomPadding.xs}`}>
          <div className="animate-pulse">
            <div className={cn(semanticSpacing.bottomGap.xs, 'flex items-center justify-between')}>
              <div className={cn(semanticRadius.small, 'h-4 w-20 bg-muted-foreground/20')}></div>
              <div className={cn(semanticRadius.small, 'size-4 bg-muted-foreground/20')}></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(semanticSpacing.stack.xs, 'animate-pulse')}>
            <div className={cn(semanticRadius.small, 'h-8 w-24 bg-muted-foreground/20')}></div>
            <div className={cn(semanticRadius.small, 'h-3 w-32 bg-muted-foreground/20')}></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toString()
    }
    return val
  }

  if (effectiveSize === 'compact') {
    const trendTooltip =
      change !== undefined
        ? `${change > 0 ? '+' : ''}${change}% ${changeLabel || 'change'}`
        : undefined

    return (
      <Card
        className={cn(
          'kpi-card density-transition justify-between group relative',
          density === 'compact' ? 'h-16' : density === 'spacious' ? 'h-24' : 'h-20',
          styles.card,
          onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
          className
        )}
        onClick={onClick}
        title={trendTooltip}
      >
        <CardContent
          className={cn(
            'flex items-center justify-between',
            density === 'compact'
              ? `${semanticSpacing.layoutPadding.xs}`
              : density === 'spacious'
                ? `${semanticSpacing.layoutPadding.xl}`
                : `${semanticSpacing.layoutPadding.lg}`
          )}
        >
          <div className={`${semanticSpacing.stack.xs}`}>
            <p
              className={cn(
                'truncate font-medium',
                styles.title,
                density === 'compact'
                  ? 'text-[10px]'
                  : density === 'spacious'
                    ? 'text-sm'
                    : 'text-xs'
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                'font-bold',
                styles.value,
                density === 'compact' ? 'text-lg' : density === 'spacious' ? 'text-2xl' : 'text-xl'
              )}
            >
              {formatValue(value)}
            </p>
            {density !== 'compact' && subtitle && (
              <p
                className={cn(
                  'text-muted-foreground truncate',
                  density === 'spacious' ? 'text-sm' : 'text-xs'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(semanticSpacing.stack.xs, 'flex flex-col items-center')}>
            {Icon && (
              <div className={cn('shrink-0', styles.icon)}>
                <Icon className="size-5" />
              </div>
            )}
            {change !== undefined && (
              <div
                className={cn(
                  `flex items-center ${semanticSpacing.gap.xs} text-xs opacity-0 group-hover:opacity-100 transition-opacity`,
                  trendColors[trend]
                )}
              >
                {trend === 'up' && <ArrowUpIcon className="size-3" />}
                {trend === 'down' && <ArrowDownIcon className="size-3" />}
                <span className={`${semanticTypography.label}`}>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'kpi-card justify-between',
        styles.card,
        onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={cn('kpi-label truncate', styles.title)}>{title}</CardTitle>
          {Icon && (
            <div className={cn('shrink-0', styles.icon)}>
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={cn(semanticSpacing.inline.xs, 'flex items-baseline')}>
            <p className={cn('kpi-value', styles.value)}>{formatValue(value)}</p>
            {change !== undefined && (
              <div
                className={cn(
                  `kpi-change flex items-center ${semanticSpacing.gap.xs}`,
                  trendColors[trend]
                )}
              >
                {trend === 'up' && <ArrowUpIcon className="size-3" />}
                {trend === 'down' && <ArrowDownIcon className="size-3" />}
                <span className={`${semanticTypography.label}`}>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              </div>
            )}
          </div>
          {(subtitle || changeLabel) && (
            <p className={cn(semanticTypography.body, 'truncate text-muted-foreground')}>
              {subtitle || changeLabel}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized variants for common use cases
export function SuccessKpiCard(props: Omit<KpiCardProps, 'variant'>) {
  return <KpiCard {...props} variant="success" />
}

export function WarningKpiCard(props: Omit<KpiCardProps, 'variant'>) {
  return <KpiCard {...props} variant="warning" />
}

export function ErrorKpiCard(props: Omit<KpiCardProps, 'variant'>) {
  return <KpiCard {...props} variant="error" />
}
