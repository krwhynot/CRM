import React from 'react'
import { cn } from '@/lib/utils'
import { semanticSpacing } from '@/styles/tokens'

export function Container(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return (
    <div
      className={cn('mx-auto max-w-7xl', semanticSpacing.containerPadding, className)}
      {...rest}
    />
  )
}
