import React from 'react'
import { cn } from '@/lib/utils'
import { semanticRadius } from '@/styles/tokens'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(`animate-pulse ${semanticRadius.input} bg-muted`, className)} {...props} />
  )
}

export { Skeleton }
