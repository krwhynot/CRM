import React from 'react'
import { cn } from '@/lib/utils'

interface ContentSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  title?: string
  description?: string
}

/**
 * Simple content wrapper component for sections within a page.
 * Provides consistent spacing and optional section titles.
 */
export function ContentSection({
  children,
  title,
  description,
  className,
  ...props
}: ContentSectionProps) {
  return (
    <section className={cn('space-y-6', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-lg font-medium">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  )
}