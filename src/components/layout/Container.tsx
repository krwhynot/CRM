import React from 'react'
import { cn } from '@/lib/utils'

export function Container(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={cn('mx-auto max-w-7xl px-4 sm:px-6', className)} {...rest} />
}
