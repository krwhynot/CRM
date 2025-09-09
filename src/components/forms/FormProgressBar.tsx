import React from 'react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle } from 'lucide-react'

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
    if (isComplete) return "Complete! 🎉"
    if (isNearCompletion) {
      const remaining = total - completed
      return remaining === 1 ? "Almost done!" : `${remaining} left`
    }
    if (percentage >= 50) return "Good progress"
    if (completed > 0) return "Keep going"
    return "Get started"
  }

  const getProgressColor = () => {
    if (isComplete) return "bg-success"
    if (percentage >= 75) return "bg-warning" 
    if (percentage >= 50) return "bg-primary"
    return "bg-muted-foreground"
  }

  const getBackgroundColor = () => {
    if (isComplete) return "bg-success/10 border-success/20"
    if (isNearCompletion) return "bg-warning/10 border-warning/20"
    return "bg-muted border-border"
  }

  if (total === 0) return null

  return (
    <div className={cn(
      "rounded-lg border p-2 transition-all duration-300 ease-in-out",
      getBackgroundColor(),
      className
    )}>
      {/* Compact single-row layout */}
      <div className="flex items-center gap-2">
        {/* Status Icon */}
        <div className="shrink-0">
          {isComplete ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <Circle className="size-4 text-muted-foreground" />
          )}
        </div>
        
        {/* Progress Bar */}
        <Progress 
          value={percentage} 
          className="h-1.5 flex-1"
          style={{
            // @ts-ignore - CSS custom properties are valid
            '--progress-background': getProgressColor()
          } as React.CSSProperties}
        />
        
        {/* Completion Count */}
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
          {completed}/{total}
        </span>
        
        {/* Percentage */}
        <span className="min-w-10 whitespace-nowrap text-right text-xs font-semibold text-foreground">
          {percentage}%
        </span>
        
        {/* Compact Message (optional, hidden on mobile) */}
        {showDetails && (
          <span className={cn(
            "text-xs font-medium whitespace-nowrap hidden sm:inline",
            isComplete ? "text-success" : 
            isNearCompletion ? "text-warning" : 
            "text-muted-foreground"
          )}>
            {getCompactMessage()}
          </span>
        )}
      </div>
      
      {/* Celebration animation for completion */}
      {isComplete && (
        <div className="mt-1 animate-pulse">
          <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
        </div>
      )}
    </div>
  )
}