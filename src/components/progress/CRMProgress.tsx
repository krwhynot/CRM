import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  Circle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  DollarSign,
  Users,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  ArrowRight
} from 'lucide-react'

// Base progress component props
interface BaseProgressProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

// Size variants
const progressSizes = {
  sm: 'h-1',
  md: 'h-2', 
  lg: 'h-3'
}

// Simple Progress Bar with enhanced features
export interface EnhancedProgressProps extends BaseProgressProps {
  value: number
  max?: number
  label?: string
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  showPercentage?: boolean
  showValue?: boolean
  suffix?: string
}

export function EnhancedProgress({
  value,
  max = 100,
  label,
  color = 'default',
  size = 'md',
  showLabel = true,
  showPercentage = true,
  showValue = false,
  suffix = '',
  animated = false,
  className
}: EnhancedProgressProps) {
  const percentage = Math.round((value / max) * 100)
  
  const colorClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (label || showPercentage || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          <div className="flex items-center space-x-2">
            {showValue && (
              <span className="text-muted-foreground">
                {value.toLocaleString()}{suffix} of {max.toLocaleString()}{suffix}
              </span>
            )}
            {showPercentage && (
              <span className="font-medium">{percentage}%</span>
            )}
          </div>
        </div>
      )}
      <div className={cn('relative w-full overflow-hidden rounded-full bg-primary/20', progressSizes[size])}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            colorClasses[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Pipeline Stage Progress
export interface PipelineStage {
  id: string
  name: string
  description?: string
  value: number
  target?: number
  color?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface PipelineProgressProps extends BaseProgressProps {
  stages: PipelineStage[]
  currentStage?: string
  title?: string
  totalValue?: number
  currency?: string
}

export function PipelineProgress({
  stages,
  currentStage,
  title = 'Sales Pipeline',
  totalValue,
  currency = '$',
  className
}: PipelineProgressProps) {
  const totalStageValue = stages.reduce((sum, stage) => sum + stage.value, 0)
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {totalValue && (
            <Badge variant="outline" className="text-sm">
              {currency}{totalValue.toLocaleString()}
            </Badge>
          )}
        </div>
        {totalStageValue > 0 && (
          <CardDescription>
            Total pipeline value: {currency}{totalStageValue.toLocaleString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {stages.map((stage, index) => {
          const isActive = currentStage === stage.id
          const percentage = stage.target ? (stage.value / stage.target) * 100 : 0
          const Icon = stage.icon || Target
          
          return (
            <div key={stage.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon 
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span className={cn(
                    'font-medium',
                    isActive && 'text-primary'
                  )}>
                    {stage.name}
                  </span>
                  {isActive && (
                    <Badge variant="outline" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">
                    {currency}{stage.value.toLocaleString()}
                  </span>
                  {stage.target && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">
                        {currency}{stage.target.toLocaleString()}
                      </span>
                      <span className="font-medium">({Math.round(percentage)}%)</span>
                    </>
                  )}
                </div>
              </div>
              
              {stage.target && (
                <Progress
                  value={percentage}
                  className={cn(
                    'w-full',
                    isActive && 'ring-2 ring-primary ring-offset-2'
                  )}
                />
              )}
              
              {stage.description && (
                <p className="text-xs text-muted-foreground ml-6">
                  {stage.description}
                </p>
              )}
              
              {index < stages.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Deal Progress Component
export interface DealProgressProps extends BaseProgressProps {
  dealName: string
  currentStage: string
  probability: number
  value: number
  expectedCloseDate: Date
  daysRemaining: number
  currency?: string
}

export function DealProgress({
  dealName,
  currentStage,
  probability,
  value,
  expectedCloseDate,
  daysRemaining,
  currency = '$',
  className
}: DealProgressProps) {
  const probabilityColor = probability >= 80 ? 'success' : 
                          probability >= 50 ? 'warning' : 'danger'
  
  const urgencyColor = daysRemaining <= 7 ? 'danger' :
                      daysRemaining <= 30 ? 'warning' : 'success'
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{dealName}</CardTitle>
        <CardDescription className="flex items-center space-x-4">
          <span>{currency}{value.toLocaleString()}</span>
          <span>•</span>
          <span>Close: {expectedCloseDate.toLocaleDateString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stage */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Stage</span>
          <Badge variant="outline">{currentStage}</Badge>
        </div>
        
        {/* Probability Progress */}
        <div className="space-y-2">
          <EnhancedProgress
            value={probability}
            label="Win Probability"
            color={probabilityColor}
            showPercentage
            suffix="%"
          />
        </div>
        
        {/* Time Remaining */}
        <div className="space-y-2">
          <EnhancedProgress
            value={Math.max(0, 100 - (daysRemaining / 90) * 100)}
            label="Time Urgency"
            color={urgencyColor}
            showValue
            suffix=" days remaining"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Days remaining: {daysRemaining}</span>
            <span>{urgencyColor === 'danger' ? 'Critical' : urgencyColor === 'warning' ? 'Urgent' : 'On track'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Performance Metrics Progress
export interface PerformanceMetric {
  id: string
  name: string
  current: number
  target: number
  unit?: string
  color?: 'success' | 'warning' | 'danger' | 'info'
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ComponentType<{ className?: string }>
}

export interface PerformanceProgressProps extends BaseProgressProps {
  metrics: PerformanceMetric[]
  title?: string
  period?: string
}

export function PerformanceProgress({
  metrics,
  title = 'Performance Metrics',
  period,
  className
}: PerformanceProgressProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {period && (
            <Badge variant="outline">{period}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const percentage = (metric.current / metric.target) * 100
          const isOverTarget = percentage > 100
          const Icon = metric.icon || BarChart3
          const TrendIcon = metric.trend === 'up' ? TrendingUp :
                           metric.trend === 'down' ? TrendingDown : Activity
          
          return (
            <div key={metric.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{metric.name}</span>
                  {metric.trend && (
                    <TrendIcon className={cn(
                      'h-3 w-3',
                      metric.trend === 'up' && 'text-green-500',
                      metric.trend === 'down' && 'text-red-500',
                      metric.trend === 'stable' && 'text-blue-500'
                    )} />
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {metric.current.toLocaleString()}{metric.unit} / {metric.target.toLocaleString()}{metric.unit}
                  </div>
                  <div className={cn(
                    'text-sm',
                    isOverTarget ? 'text-green-600' : percentage >= 80 ? 'text-green-600' : 
                    percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {Math.round(percentage)}%
                    {isOverTarget && ' (Over target!)'}
                  </div>
                </div>
              </div>
              
              <EnhancedProgress
                value={Math.min(percentage, 100)}
                color={
                  isOverTarget || percentage >= 80 ? 'success' :
                  percentage >= 50 ? 'warning' : 'danger'
                }
                showLabel={false}
              />
              
              {isOverTarget && (
                <div className="text-xs text-green-600 font-medium">
                  Exceeded target by {Math.round(percentage - 100)}%
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Multi-Step Process Progress
export interface ProcessStep {
  id: string
  name: string
  description?: string
  status: 'completed' | 'current' | 'pending' | 'error'
  optional?: boolean
}

export interface ProcessProgressProps extends BaseProgressProps {
  steps: ProcessStep[]
  title?: string
  showStepNumbers?: boolean
}

export function ProcessProgress({
  steps,
  title = 'Process Progress',
  showStepNumbers = true,
  className
}: ProcessProgressProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const currentStepIndex = steps.findIndex(step => step.status === 'current')
  const overallProgress = (completedSteps / totalSteps) * 100
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="outline">
            {completedSteps} of {totalSteps} steps
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress value={overallProgress} className="w-full" />
          <div className="text-sm text-muted-foreground">
            {Math.round(overallProgress)}% complete
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="flex items-start space-x-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium',
                  step.status === 'completed' && 'bg-green-500 border-green-500 text-white',
                  step.status === 'current' && 'border-primary text-primary bg-primary/10',
                  step.status === 'pending' && 'border-muted-foreground text-muted-foreground',
                  step.status === 'error' && 'border-red-500 text-red-500 bg-red-50'
                )}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : step.status === 'error' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : showStepNumbers ? (
                    index + 1
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                
                {!isLast && (
                  <div className={cn(
                    'w-0.5 h-8 mt-2',
                    step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                  )} />
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'font-medium',
                    step.status === 'current' && 'text-primary',
                    step.status === 'completed' && 'text-green-600',
                    step.status === 'error' && 'text-red-600'
                  )}>
                    {step.name}
                  </span>
                  
                  {step.optional && (
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  )}
                  
                  {step.status === 'current' && (
                    <Badge variant="default" className="text-xs">
                      In Progress
                    </Badge>
                  )}
                  
                  {step.status === 'error' && (
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  )}
                </div>
                
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Circular Progress Component
export interface CircularProgressProps extends BaseProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showLabel?: boolean
  label?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'hsl(var(--primary))',
  backgroundColor = 'hsl(var(--muted))',
  showLabel = true,
  label,
  className
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
  
  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round(percentage)}%
            </div>
            {label && (
              <div className="text-xs text-muted-foreground mt-1">
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Progress Comparison Component
export interface ProgressComparisonProps extends BaseProgressProps {
  current: number
  previous: number
  target: number
  label: string
  unit?: string
  period?: string
}

export function ProgressComparison({
  current,
  previous,
  target,
  label,
  unit = '',
  period = 'vs last period',
  className
}: ProgressComparisonProps) {
  const currentProgress = (current / target) * 100
  const previousProgress = (previous / target) * 100
  const change = current - previous
  const changePercent = previous > 0 ? ((change / previous) * 100) : 0
  const isImprovement = change > 0
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        <CardDescription>
          Current: {current.toLocaleString()}{unit} • Target: {target.toLocaleString()}{unit}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Current Progress</span>
            <span className="font-medium">{Math.round(currentProgress)}%</span>
          </div>
          <Progress value={currentProgress} className="w-full" />
        </div>
        
        {/* Previous Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Previous Period</span>
            <span className="text-muted-foreground">{Math.round(previousProgress)}%</span>
          </div>
          <Progress 
            value={previousProgress} 
            className={cn('w-full opacity-60', 'bg-muted/50')}
          />
        </div>
        
        {/* Change Indicator */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Change {period}</span>
          <div className="flex items-center space-x-2">
            {isImprovement ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={cn(
              'font-medium',
              isImprovement ? 'text-green-600' : 'text-red-600'
            )}>
              {isImprovement ? '+' : ''}{change.toLocaleString()}{unit}
            </span>
            <span className={cn(
              'text-sm',
              isImprovement ? 'text-green-600' : 'text-red-600'
            )}>
              ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}