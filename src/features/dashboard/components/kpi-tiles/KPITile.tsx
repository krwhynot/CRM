import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useDashboardDensity } from '../hooks/useDashboardDensity'

export type KPIVariant = 'default' | 'success' | 'warning' | 'error'

export interface KPITileProps {
  title: string
  value: string | number
  icon: LucideIcon
  variant?: KPIVariant
  trend?: {
    value: number
    label: string
  }
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

export function KPITile({
  title,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  subtitle,
  isLoading = false,
  className,
  onClick,
}: KPITileProps) {
  const styles = variantStyles[variant]
  const { density } = useDashboardDensity()

  // Density-specific configurations
  const densityConfig = {
    compact: {
      showTrend: false,
      showSubtitle: false,
      showIcon: true,
      titleClass: 'text-[10px] font-medium truncate leading-tight',
      valueClass: 'text-lg font-bold leading-none',
      cardClass: 'h-16 p-2',
      contentClass: 'gap-1',
      iconSize: 'size-3'
    },
    comfortable: {
      showTrend: true,
      showSubtitle: false,
      showIcon: true,
      titleClass: 'kpi-title density-text-xs font-medium truncate',
      valueClass: 'kpi-value text-xl font-bold leading-none',
      cardClass: 'density-aware-kpi density-transition',
      contentClass: 'density-aware-card',
      iconSize: 'size-4'
    },
    spacious: {
      showTrend: true,
      showSubtitle: true,
      showIcon: true,
      titleClass: 'text-sm font-medium truncate',
      valueClass: 'text-2xl font-bold leading-none',
      cardClass: 'h-32 p-6',
      contentClass: 'gap-2',
      iconSize: 'size-5'
    }
  }

  const config = densityConfig[density]

  if (isLoading) {
    return (
      <Card className={cn(config.cardClass, styles.card, className)}>
        <CardContent className={cn('h-full flex flex-col justify-between', config.contentClass)}>
          <div className="animate-pulse">
            <div className="mb-2 flex items-center justify-between">
              <div className={cn('rounded bg-muted-foreground/20', 
                density === 'compact' ? 'h-3 w-16' : 
                density === 'comfortable' ? 'h-4 w-20' : 'h-5 w-24'
              )}></div>
              <div className={cn('rounded bg-muted-foreground/20', config.iconSize)}></div>
            </div>
            <div className={cn('mb-1 rounded bg-muted-foreground/20',
              density === 'compact' ? 'h-5 w-12' : 
              density === 'comfortable' ? 'h-6 w-16' : 'h-8 w-20'
            )}></div>
            {config.showSubtitle && (
              <div className="h-3 w-24 rounded bg-muted-foreground/20"></div>
            )}
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

  const getTrendIcon = () => {
    if (!trend) return null

    if (trend.value > 0) {
      return <TrendingUp className="size-3 text-success" />
    } else if (trend.value < 0) {
      return <TrendingDown className="size-3 text-destructive" />
    }
    return null
  }

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'
    return trend.value > 0
      ? 'text-success'
      : trend.value < 0
        ? 'text-destructive'
        : 'text-muted-foreground'
  }

  return (
    <Card
      className={cn(
        config.cardClass,
        styles.card,
        onClick && 'cursor-pointer hover:shadow-md',
        'density-transition',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn('flex h-full flex-col justify-between', config.contentClass)}>
        {/* Header */}
        <div className={cn('flex items-center justify-between', density === 'compact' ? 'mb-1' : 'mb-2')}>
          <h3 className={cn(config.titleClass, styles.title)}>{title}</h3>
          {config.showIcon && <Icon className={cn(config.iconSize, 'shrink-0', styles.icon)} />}
        </div>

        {/* Value and Trend */}
        <div className="flex flex-1 flex-col justify-center">
          <div className={cn('flex items-baseline', density === 'compact' ? 'space-x-1' : 'space-x-2')}>
            <span className={cn(config.valueClass, styles.value)}>
              {formatValue(value)}
            </span>
            {config.showTrend && trend && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className={cn('font-medium', getTrendColor(), 
                  density === 'compact' ? 'text-[10px]' : 
                  density === 'comfortable' ? 'text-xs' : 'text-sm'
                )}>
                  {Math.abs(trend.value).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Subtitle or Trend Label - Only show if config allows */}
          {config.showSubtitle && (subtitle || trend?.label) && (
            <p className={cn('mt-1 truncate text-muted-foreground',
              density === 'compact' ? 'text-[9px]' : 
              density === 'comfortable' ? 'text-xs' : 'text-sm'
            )}>
              {subtitle || trend?.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized KPI Tile variants for common use cases
export function SuccessKPITile(props: Omit<KPITileProps, 'variant'>) {
  return <KPITile {...props} variant="success" />
}

export function WarningKPITile(props: Omit<KPITileProps, 'variant'>) {
  return <KPITile {...props} variant="warning" />
}

export function ErrorKPITile(props: Omit<KPITileProps, 'variant'>) {
  return <KPITile {...props} variant="error" />
}
