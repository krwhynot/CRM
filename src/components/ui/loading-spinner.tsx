import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { semanticSpacing, semanticTypography } from '@/styles/tokens'
interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ className, size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div
      className={cn(
        semanticSpacing.stack.xs,
        semanticSpacing.pageContainer,
        'flex flex-col items-center justify-center'
      )}
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading content'}
    >
      <Loader2
        className={cn('animate-spin border-mfb-green text-mfb-green', sizeClasses[size], className)}
        aria-hidden="true"
      />
      {text && (
        <p
          className={cn(semanticTypography.body, 'text-mfb-olive/60 font-nunito')}
          aria-live="polite"
        >
          {text}
        </p>
      )}
      <span className="sr-only">Loading, please wait</span>
    </div>
  )
}
