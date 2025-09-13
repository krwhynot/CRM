import React from 'react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle } from 'lucide-react'

import {
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  semanticColors,
  semanticAnimations,
  animationDuration,
  animationEasing,
} from '@/styles/tokens'
interface FormProgressBarProps {
  completed: number
  total: number
  className?: string
  showDetails?: boolean
}

export function FormProgressBar({
  completed,
  total,
  className,
  showDetails = true,
}: FormProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
  const isComplete = completed === total && total > 0
  const isNearCompletion = percentage >= 75 && !isComplete

  const getCompactMessage = () => {
    if (isComplete) return 'Complete! 🎉'
    if (isNearCompletion) {
      const remaining = total - completed
      return remaining === 1 ? 'Almost done!' : `${remaining} left`
    }
    if (percentage >= 50) return 'Good progress'
    if (completed > 0) return 'Keep going'
    return 'Get started'
  }

  const getProgressColor = () => {
    if (isComplete) return semanticColors.success.primary.replace('text-', 'bg-')
    if (percentage >= 75) return semanticColors.warning.primary.replace('text-', 'bg-')
    if (percentage >= 50) return semanticColors.chartPrimary
    return semanticColors.muted.split(' ')[1] // Extract text color from muted
  }

  const getBackgroundColor = () => {
    if (isComplete) return cn(semanticColors.success.background, semanticColors.success.border)
    if (isNearCompletion)
      return cn(semanticColors.warning.background, semanticColors.warning.border)
    return cn(semanticColors.muted.split(' ')[0], semanticColors.border)
  }

  if (total === 0) return null

  return (
    <div
      className={cn(
        semanticRadius.lg,
        semanticColors.border,
        semanticSpacing.compact,
        `transition-all duration-[${animationDuration.medium}] ${animationEasing.standard}`,
        getBackgroundColor(),
        className
      )}
    >
      {/* Compact single-row layout */}
      <div className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
        {/* Status Icon */}
        <div className="shrink-0">
          {isComplete ? (
            <CheckCircle2 className={cn('h-4 w-4', semanticColors.success.foreground)} />
          ) : (
            <Circle className={cn('h-4 w-4', semanticColors.text.muted)} />
          )}
        </div>

        {/* Progress Bar */}
        <Progress
          value={percentage}
          className={cn('h-1.5 flex-1')}
          style={
            {
              // @ts-ignore - CSS custom properties are valid
              '--progress-background': getProgressColor(),
            } as React.CSSProperties
          }
        />

        {/* Completion Count */}
        <span
          className={cn(
            semanticTypography.caption,
            semanticTypography.label,
            'whitespace-nowrap text-muted-foreground'
          )}
        >
          {completed}/{total}
        </span>

        {/* Percentage */}
        <span
          className={cn(
            semanticTypography.caption,
            semanticTypography.h4,
            'min-w-10 whitespace-nowrap text-right text-foreground'
          )}
        >
          {percentage}%
        </span>

        {/* Compact Message (optional, hidden on mobile) */}
        {showDetails && (
          <span
            className={cn(
              semanticTypography.caption,
              semanticTypography.label,
              'whitespace-nowrap hidden sm:inline',
              isComplete
                ? semanticColors.text.success
                : isNearCompletion
                  ? semanticColors.text.warning
                  : semanticColors.text.muted
            )}
          >
            {getCompactMessage()}
          </span>
        )}
      </div>

      {/* Celebration animation for completion */}
      {isComplete && (
        <div className={cn(semanticSpacing.topGap.xs, semanticAnimations.warning)}>
          <div
            className={cn(
              semanticRadius.full,
              'h-0.5 w-full',
              'bg-gradient-to-r from-green-400 via-green-500 to-green-600'
            )}
          />
        </div>
      )}
    </div>
  )
}
