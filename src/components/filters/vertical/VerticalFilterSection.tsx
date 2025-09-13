import React from 'react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

interface VerticalFilterSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function VerticalFilterSection({
  title,
  children,
  className,
  noPadding = false,
}: VerticalFilterSectionProps) {
  return (
    <div className={cn(semanticSpacing.stack.sm, !noPadding && semanticSpacing.compact, className)}>
      {title && (
        <label
          className={cn(
            semanticTypography.caption,
            semanticTypography.label,
            'text-muted-foreground'
          )}
        >
          {title}
        </label>
      )}
      {children}
    </div>
  )
}
