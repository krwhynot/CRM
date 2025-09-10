import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  DollarSign,
  MessageSquare,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MetricCardData } from '@/types/dashboard'

interface MetricCardProps extends MetricCardData {
  className?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-600" />
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-600" />
    case 'neutral':
      return <Minus className="h-4 w-4 text-gray-600" />
    default:
      return null
  }
}

const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'down':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'neutral':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getMetricIcon = (title: string) => {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('activity') || titleLower.includes('total')) {
    return <Activity className="h-5 w-5 text-blue-600" />
  }
  if (titleLower.includes('opportunit') || titleLower.includes('pipeline') || titleLower.includes('value')) {
    return <DollarSign className="h-5 w-5 text-green-600" />
  }
  if (titleLower.includes('interaction') || titleLower.includes('contact')) {
    return <MessageSquare className="h-5 w-5 text-purple-600" />
  }
  if (titleLower.includes('completion') || titleLower.includes('goal') || titleLower.includes('performance')) {
    return <Target className="h-5 w-5 text-orange-600" />
  }
  
  return <Activity className="h-5 w-5 text-blue-600" />
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  subtitle,
  className,
  variant = 'default',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  }

  const valueSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  const variantClasses = {
    default: '',
    primary: 'border-primary/20 bg-primary/5',
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50'
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      variantClasses[variant],
      className
    )}>
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getMetricIcon(title)}
              <h3 className="text-sm font-medium text-muted-foreground">
                {title}
              </h3>
            </div>
            
            <div className={cn("font-bold text-foreground", valueSize[size])}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {trend && trendValue && (
            <div className="ml-2">
              <Badge 
                variant="outline"
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1",
                  getTrendColor(trend)
                )}
              >
                {getTrendIcon(trend)}
                <span>{trendValue}</span>
              </Badge>
            </div>
          )}
        </div>
        
        {/* Progress bar for percentage values */}
        {typeof value === 'string' && value.includes('%') && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, Math.max(0, parseInt(value)))}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized metric card variants for common use cases
export const ActivityMetricCard: React.FC<Omit<MetricCardProps, 'title'> & { count: number }> = ({
  count,
  ...props
}) => (
  <MetricCard
    title="Total Activity"
    value={count}
    subtitle="This period"
    {...props}
  />
)

export const OpportunityMetricCard: React.FC<Omit<MetricCardProps, 'title'> & { 
  count: number
  totalValue?: number 
}> = ({
  count,
  totalValue,
  ...props
}) => (
  <MetricCard
    title="Opportunities"
    value={count}
    subtitle={totalValue ? `$${(totalValue / 1000).toFixed(0)}k total value` : undefined}
    variant="success"
    {...props}
  />
)

export const InteractionMetricCard: React.FC<Omit<MetricCardProps, 'title'> & { 
  count: number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}> = ({
  count,
  trend,
  trendValue,
  ...props
}) => (
  <MetricCard
    title="Interactions"
    value={count}
    trend={trend}
    trendValue={trendValue}
    subtitle="This period"
    {...props}
  />
)

export const CompletionMetricCard: React.FC<Omit<MetricCardProps, 'title'> & { 
  percentage: number 
}> = ({
  percentage,
  ...props
}) => (
  <MetricCard
    title="Completion Rate"
    value={`${percentage}%`}
    subtitle="Goals achieved"
    variant="primary"
    {...props}
  />
)

export default MetricCard