import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
    icon: 'text-muted-foreground'
  },
  success: {
    card: 'border-success/20 hover:border-success/30 bg-success/5',
    title: 'text-success',
    value: 'text-success-foreground',
    icon: 'text-success'
  },
  warning: {
    card: 'border-warning/20 hover:border-warning/30 bg-warning/5',
    title: 'text-warning',
    value: 'text-warning-foreground',
    icon: 'text-warning'
  },
  error: {
    card: 'border-destructive/20 hover:border-destructive/30 bg-destructive/5',
    title: 'text-destructive',
    value: 'text-destructive-foreground',
    icon: 'text-destructive'
  }
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
  onClick
}: KPITileProps) {
  const styles = variantStyles[variant]

  if (isLoading) {
    return (
      <Card className={cn('h-24 transition-colors', styles.card, className)}>
        <CardContent className="h-full p-4">
          <div className="animate-pulse">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-4 w-20 rounded bg-muted-foreground/20"></div>
              <div className="size-4 rounded bg-muted-foreground/20"></div>
            </div>
            <div className="mb-1 h-6 w-16 rounded bg-muted-foreground/20"></div>
            <div className="h-3 w-24 rounded bg-muted-foreground/20"></div>
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
      return <TrendingUp className="size-3 text-green-600" />
    } else if (trend.value < 0) {
      return <TrendingDown className="size-3 text-red-600" />
    }
    return null
  }

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'
    return trend.value > 0 ? 'text-success' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground'
  }

  return (
    <Card 
      className={cn(
        'h-24 transition-all duration-200',
        styles.card,
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="flex h-full flex-col justify-between p-4">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h3 className={cn('text-xs font-medium truncate', styles.title)}>
            {title}
          </h3>
          <Icon className={cn('size-4 shrink-0', styles.icon)} />
        </div>

        {/* Value and Trend */}
        <div className="flex flex-1 flex-col justify-center">
          <div className="flex items-baseline space-x-2">
            <span className={cn('text-xl font-bold leading-none', styles.value)}>
              {formatValue(value)}
            </span>
            {trend && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className={cn('text-xs font-medium', getTrendColor())}>
                  {Math.abs(trend.value).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          {/* Subtitle or Trend Label */}
          {(subtitle || trend?.label) && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
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