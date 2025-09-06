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
  
  const getMotivationalMessage = () => {
    if (isComplete) {
      return "All required fields completed! 🎉"
    }
    
    if (isNearCompletion) {
      const remaining = total - completed
      return remaining === 1 
        ? "Almost there! Just 1 field remaining"
        : `You're doing great! ${remaining} fields remaining`
    }
    
    if (percentage >= 50) {
      return "Great progress! Keep going"
    }
    
    if (completed > 0) {
      return "Good start! Continue filling out the form"
    }
    
    return `Please complete ${total} required fields`
  }

  const getProgressColor = () => {
    if (isComplete) return "bg-emerald-500"
    if (percentage >= 75) return "bg-amber-500" 
    if (percentage >= 50) return "bg-blue-500"
    return "bg-muted-foreground"
  }

  const getBackgroundColor = () => {
    if (isComplete) return "bg-emerald-50 border-emerald-200"
    if (isNearCompletion) return "bg-amber-50 border-amber-200"
    return "bg-muted border-border"
  }

  if (total === 0) return null

  return (
    <div className={cn(
      "rounded-lg border p-4 transition-all duration-300 ease-in-out",
      getBackgroundColor(),
      className
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className="shrink-0">
          {isComplete ? (
            <CheckCircle2 className="size-5 text-emerald-600" />
          ) : (
            <Circle className="size-5 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground">
              Form Progress
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              {percentage}%
            </span>
          </div>
          
          <Progress 
            value={percentage} 
            className="h-2"
            // Apply custom styling to the progress bar
            style={{
              // @ts-ignore - CSS custom properties are valid
              '--progress-background': getProgressColor()
            } as React.CSSProperties}
          />
        </div>
      </div>

      {showDetails && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Required fields completed</span>
            <span className="font-medium">
              {completed} of {total}
            </span>
          </div>
          
          <p className={cn(
            "text-sm font-medium transition-colors duration-200",
            isComplete ? "text-emerald-700" : 
            isNearCompletion ? "text-amber-700" : 
            "text-muted-foreground"
          )}>
            {getMotivationalMessage()}
          </p>
        </div>
      )}
      
      {/* Celebration animation for completion */}
      {isComplete && (
        <div className="animate-pulse">
          <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
        </div>
      )}
    </div>
  )
}