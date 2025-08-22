import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ className, size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-2">
      <Loader2 className={cn(
        'animate-spin border-mfb-green text-mfb-green',
        sizeClasses[size],
        className
      )} />
      {text && (
        <p className="text-mfb-olive/60 font-nunito text-sm">{text}</p>
      )}
    </div>
  )
}