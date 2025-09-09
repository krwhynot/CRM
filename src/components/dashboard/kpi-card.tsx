import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

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
}: KpiCardProps) {
  const styles = variantStyles[variant]

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  }

  if (isLoading) {
    return (
      <Card className={cn('dashboard-card h-[180px] flex flex-col justify-between', className)}>
        <CardHeader className="pb-2">
          <div className="animate-pulse">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-muted-foreground/20"></div>
              <div className="size-4 rounded bg-muted-foreground/20"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 w-24 rounded bg-muted-foreground/20"></div>
            <div className="h-3 w-32 rounded bg-muted-foreground/20"></div>
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

  return (
    <Card
      className={cn(
        'dashboard-card h-[180px] flex flex-col justify-between transition-all duration-200',
        styles.card,
        onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-label truncate', styles.title)}>{title}</CardTitle>
          {Icon && (
            <div className={cn('shrink-0', styles.icon)}>
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <p className={cn('text-metric', styles.value)}>{formatValue(value)}</p>
            {change !== undefined && (
              <div className={cn('flex items-center gap-1 text-sm', trendColors[trend])}>
                {trend === 'up' && <ArrowUpIcon className="size-3" />}
                {trend === 'down' && <ArrowDownIcon className="size-3" />}
                <span className="font-medium">
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              </div>
            )}
          </div>
          {(subtitle || changeLabel) && (
            <p className="truncate text-sm text-muted-foreground">{subtitle || changeLabel}</p>
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
