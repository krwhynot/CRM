import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  semanticTypography,
  semanticSpacing,
  semanticColors,
  textColors,
  semanticRadius,
  borderColors,
  colors,
} from '@/styles/tokens'
import {
  CheckCircle,
  Circle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  BarChart3,
  ArrowRight,
} from 'lucide-react'

// Base progress component props
interface BaseProgressProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

// Size variants using semantic tokens
const progressSizes = {
  sm: 'h-1', // Will be replaced with token system in future
  md: 'h-2', // Will be replaced with token system in future
  lg: 'h-3', // Will be replaced with token system in future
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
  className,
}: EnhancedProgressProps) {
  const percentage = Math.round((value / max) * 100)

  const colorClasses = {
    default: 'bg-primary',
    success: semanticColors.success.primary,
    warning: semanticColors.warning.primary,
    danger: semanticColors.error.primary,
    info: semanticColors.info.primary,
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (label || showPercentage || showValue) && (
        <div className={cn(semanticTypography.body, 'flex items-center justify-between')}>
          {label && <span className={`${semanticTypography.label}`}>{label}</span>}
          <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
            {showValue && (
              <span className={textColors.secondary}>
                {value.toLocaleString()}
                {suffix} of {max.toLocaleString()}
                {suffix}
              </span>
            )}
            {showPercentage && <span className={`${semanticTypography.label}`}>{percentage}%</span>}
          </div>
        </div>
      )}
      <div
        className={cn(
          'relative w-full overflow-hidden',
          semanticRadius.progressBackground,
          semanticColors.backgrounds.muted,
          progressSizes[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            semanticRadius.progressBar,
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
  className,
}: PipelineProgressProps) {
  const totalStageValue = stages.reduce((sum, stage) => sum + stage.value, 0)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`${semanticTypography.h4}`}>{title}</CardTitle>
          {totalValue && (
            <Badge variant="outline" className={`${semanticTypography.body}`}>
              {currency}
              {totalValue.toLocaleString()}
            </Badge>
          )}
        </div>
        {totalStageValue > 0 && (
          <CardDescription>
            Total pipeline value: {currency}
            {totalStageValue.toLocaleString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        {stages.map((stage, index) => {
          const isActive = currentStage === stage.id
          const percentage = stage.target ? (stage.value / stage.target) * 100 : 0
          const Icon = stage.icon || Target

          return (
            <div key={stage.id} className={`${semanticSpacing.stack.xs}`}>
              <div className="flex items-center justify-between">
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? semanticColors.text.accent : textColors.secondary
                    )}
                  />
                  <span className={cn('font-medium', isActive && semanticColors.text.accent)}>
                    {stage.name}
                  </span>
                  {isActive && (
                    <Badge variant="outline" className={`${semanticTypography.caption}`}>
                      Current
                    </Badge>
                  )}
                </div>
                <div
                  className={cn(
                    semanticSpacing.inline.xs,
                    semanticTypography.body,
                    'flex items-center'
                  )}
                >
                  <span className={`${semanticTypography.label}`}>
                    {currency}
                    {stage.value.toLocaleString()}
                  </span>
                  {stage.target && (
                    <>
                      <span className={textColors.secondary}>/</span>
                      <span className={textColors.secondary}>
                        {currency}
                        {stage.target.toLocaleString()}
                      </span>
                      <span className={`${semanticTypography.label}`}>
                        ({Math.round(percentage)}%)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {stage.target && (
                <Progress
                  value={percentage}
                  className={cn(
                    'w-full',
                    isActive && `ring-2 ${borderColors.inputFocus} ring-offset-2`
                  )}
                />
              )}

              {stage.description && (
                <p
                  className={cn(
                    semanticTypography.caption,
                    semanticSpacing.leftGap.md,
                    textColors.secondary
                  )}
                >
                  {stage.description}
                </p>
              )}

              {index < stages.length - 1 && (
                <div className={cn(semanticSpacing.compactY, 'flex justify-center')}>
                  <ArrowRight className={cn('h-4 w-4', textColors.secondary)} />
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
  className,
}: DealProgressProps) {
  const probabilityColor = probability >= 80 ? 'success' : probability >= 50 ? 'warning' : 'danger'

  const urgencyColor = daysRemaining <= 7 ? 'danger' : daysRemaining <= 30 ? 'warning' : 'success'

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={`${semanticTypography.body}`}>{dealName}</CardTitle>
        <CardDescription className={cn(semanticSpacing.inline.md, 'flex items-center')}>
          <span>
            {currency}
            {value.toLocaleString()}
          </span>
          <span>•</span>
          <span>Close: {expectedCloseDate.toLocaleDateString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        {/* Current Stage */}
        <div className="flex items-center justify-between">
          <span className={cn(semanticTypography.body, semanticTypography.label)}>
            Current Stage
          </span>
          <Badge variant="outline">{currentStage}</Badge>
        </div>

        {/* Probability Progress */}
        <div className={`${semanticSpacing.stack.xs}`}>
          <EnhancedProgress
            value={probability}
            label="Win Probability"
            color={probabilityColor}
            showPercentage
            suffix="%"
          />
        </div>

        {/* Time Remaining */}
        <div className={`${semanticSpacing.stack.xs}`}>
          <EnhancedProgress
            value={Math.max(0, 100 - (daysRemaining / 90) * 100)}
            label="Time Urgency"
            color={urgencyColor}
            showValue
            suffix=" days remaining"
          />
          <div
            className={cn(
              semanticTypography.caption,
              'flex items-center justify-between',
              textColors.secondary
            )}
          >
            <span>Days remaining: {daysRemaining}</span>
            <span>
              {urgencyColor === 'danger'
                ? 'Critical'
                : urgencyColor === 'warning'
                  ? 'Urgent'
                  : 'On track'}
            </span>
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
  className,
}: PerformanceProgressProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`${semanticTypography.h4}`}>{title}</CardTitle>
          {period && <Badge variant="outline">{period}</Badge>}
        </div>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        {metrics.map((metric) => {
          const percentage = (metric.current / metric.target) * 100
          const isOverTarget = percentage > 100
          const Icon = metric.icon || BarChart3
          const TrendIcon =
            metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity

          return (
            <div key={metric.id} className={`${semanticSpacing.stack.sm}`}>
              <div className="flex items-center justify-between">
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                  <Icon className={cn('h-4 w-4', textColors.secondary)} />
                  <span className={`${semanticTypography.label}`}>{metric.name}</span>
                  {metric.trend && (
                    <TrendIcon
                      className={cn(
                        'h-3 w-3',
                        metric.trend === 'up' && semanticColors.text.success,
                        metric.trend === 'down' && semanticColors.text.error,
                        metric.trend === 'stable' && semanticColors.text.info
                      )}
                    />
                  )}
                </div>
                <div className="text-right">
                  <div className={`${semanticTypography.label}`}>
                    {metric.current.toLocaleString()}
                    {metric.unit} / {metric.target.toLocaleString()}
                    {metric.unit}
                  </div>
                  <div
                    className={cn(
                      semanticTypography.body,
                      isOverTarget
                        ? semanticColors.text.success
                        : percentage >= 80
                          ? semanticColors.text.success
                          : percentage >= 50
                            ? semanticColors.text.warning
                            : semanticColors.text.error
                    )}
                  >
                    {Math.round(percentage)}%{isOverTarget && ' (Over target!)'}
                  </div>
                </div>
              </div>

              <EnhancedProgress
                value={Math.min(percentage, 100)}
                color={
                  isOverTarget || percentage >= 80
                    ? 'success'
                    : percentage >= 50
                      ? 'warning'
                      : 'danger'
                }
                showLabel={false}
              />

              {isOverTarget && (
                <div
                  className={cn(
                    semanticTypography.caption,
                    semanticTypography.label,
                    semanticColors.text.success
                  )}
                >
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
  className,
}: ProcessProgressProps) {
  const completedSteps = steps.filter((step) => step.status === 'completed').length
  const totalSteps = steps.length
  const overallProgress = (completedSteps / totalSteps) * 100

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`${semanticTypography.h4}`}>{title}</CardTitle>
          <Badge variant="outline">
            {completedSteps} of {totalSteps} steps
          </Badge>
        </div>
        <div className={`${semanticSpacing.stack.xs}`}>
          <Progress value={overallProgress} className="w-full" />
          <div className={cn(semanticTypography.body, textColors.secondary)}>
            {Math.round(overallProgress)}% complete
          </div>
        </div>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className={cn(semanticSpacing.inline.sm, 'flex items-start')}>
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 border-2 font-medium',
                    semanticRadius.full,
                    semanticTypography.body,
                    step.status === 'completed' &&
                      cn(
                        semanticColors.success.primary,
                        semanticColors.success.border,
                        textColors.inverse
                      ),
                    step.status === 'current' &&
                      cn(borderColors.inputFocus, semanticColors.text.accent, colors.primary[100]),
                    step.status === 'pending' && cn(borderColors.muted, textColors.secondary),
                    step.status === 'error' &&
                      cn(
                        borderColors.error,
                        semanticColors.text.error,
                        semanticColors.error.background
                      )
                  )}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="size-4" />
                  ) : step.status === 'error' ? (
                    <AlertTriangle className="size-4" />
                  ) : showStepNumbers ? (
                    index + 1
                  ) : (
                    <Circle className="size-4" />
                  )}
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-8 mt-2',
                      step.status === 'completed'
                        ? semanticColors.success.primary
                        : semanticColors.muted
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-8">
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                  <span
                    className={cn(
                      'font-medium',
                      step.status === 'current' && semanticColors.text.accent,
                      step.status === 'completed' && semanticColors.text.success,
                      step.status === 'error' && semanticColors.text.error
                    )}
                  >
                    {step.name}
                  </span>

                  {step.optional && (
                    <Badge variant="outline" className={`${semanticTypography.caption}`}>
                      Optional
                    </Badge>
                  )}

                  {step.status === 'current' && (
                    <Badge variant="default" className={`${semanticTypography.caption}`}>
                      In Progress
                    </Badge>
                  )}

                  {step.status === 'error' && (
                    <Badge variant="destructive" className={`${semanticTypography.caption}`}>
                      Error
                    </Badge>
                  )}
                </div>

                {step.description && (
                  <p className={cn(semanticTypography.body, textColors.secondary, 'mt-1')}>
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
export interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showLabel?: boolean
  label?: string
  className?: string
  animated?: boolean
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = semanticColors.chartPrimary,
  backgroundColor = semanticColors.neutral.background,
  showLabel = true,
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
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
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={cn(semanticTypography.h2, semanticTypography.h2)}>
                {Math.round(percentage)}%
              </div>
              {label && (
                <div className={cn(semanticTypography.caption, textColors.secondary, 'mt-1')}>
                  {label}
                </div>
              )}
            </div>
          </div>
        )}
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
  className,
}: ProgressComparisonProps) {
  const currentProgress = (current / target) * 100
  const previousProgress = (previous / target) * 100
  const change = current - previous
  const changePercent = previous > 0 ? (change / previous) * 100 : 0
  const isImprovement = change > 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={`${semanticTypography.body}`}>{label}</CardTitle>
        <CardDescription>
          Current: {current.toLocaleString()}
          {unit} • Target: {target.toLocaleString()}
          {unit}
        </CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        {/* Current Progress */}
        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={cn(semanticTypography.body, 'flex items-center justify-between')}>
            <span>Current Progress</span>
            <span className={`${semanticTypography.label}`}>{Math.round(currentProgress)}%</span>
          </div>
          <Progress value={currentProgress} className="w-full" />
        </div>

        {/* Previous Progress */}
        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={cn(semanticTypography.body, 'flex items-center justify-between')}>
            <span className={textColors.secondary}>Previous Period</span>
            <span className={textColors.secondary}>{Math.round(previousProgress)}%</span>
          </div>
          <Progress
            value={previousProgress}
            className={cn('w-full opacity-60', semanticColors.neutral.background)}
          />
        </div>

        {/* Change Indicator */}
        <div className="flex items-center justify-between border-t pt-2">
          <span className={cn(semanticTypography.body, textColors.secondary)}>Change {period}</span>
          <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
            {isImprovement ? (
              <TrendingUp className={cn('h-4 w-4', semanticColors.text.success)} />
            ) : (
              <TrendingDown className={cn('h-4 w-4', semanticColors.text.error)} />
            )}
            <span
              className={cn(
                'font-medium',
                isImprovement ? semanticColors.text.success : semanticColors.text.error
              )}
            >
              {isImprovement ? '+' : ''}
              {change.toLocaleString()}
              {unit}
            </span>
            <span
              className={cn(
                semanticTypography.body,
                isImprovement ? semanticColors.text.success : semanticColors.text.error
              )}
            >
              ({changePercent > 0 ? '+' : ''}
              {changePercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
