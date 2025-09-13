import React from 'react'

import { cn } from '@/lib/utils'
import { semanticRadius, semanticSpacing, semanticTypography } from '@/styles/tokens'
export const EntitySelectLoadingState: React.FC = () => {
  return (
    <div
      className={cn(
        semanticRadius.default,
        semanticSpacing.cardX,
        'flex h-12 w-full items-center border border-border bg-muted'
      )}
    >
      <span className={cn(semanticTypography.body, 'text-muted-foreground')}>
        Loading options...
      </span>
    </div>
  )
}
