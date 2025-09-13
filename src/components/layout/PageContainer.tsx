import React from 'react'
import { cn } from '@/lib/utils'
import { Container } from './Container'
import { semanticSpacing } from '@/styles/tokens'

export function PageContainer(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return (
    <Container
      className={cn(`${semanticSpacing.pageY} ${semanticSpacing.gap.xl}`, className)}
      {...rest}
    />
  )
}
