import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

import { cn } from '@/lib/utils'
interface LoadingStateProps {
  title: string
  description: string
  bgClassName?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  description,
  bgClassName = 'bg-background',
}) => {
  return (
    <div
      className={`flex min-h-screen items-center justify-center ${bgClassName} ${semanticSpacing.horizontalPadding.lg} ${semanticSpacing.verticalPadding.xxl} sm:${semanticSpacing.horizontalPadding.xl} lg:${semanticSpacing.horizontalPadding.xxl}`}
    >
      <Card className="mx-auto w-full max-w-md" role="status" aria-live="polite">
        <CardHeader className="text-center">
          <CardTitle
            className={cn(semanticTypography.h2, semanticTypography.title)}
            aria-label={`Loading: ${title}`}
          >
            {title}
          </CardTitle>
          <CardDescription aria-live="polite">{description}</CardDescription>
        </CardHeader>
        <span className="sr-only">Please wait while we {description.toLowerCase()}</span>
      </Card>
    </div>
  )
}
