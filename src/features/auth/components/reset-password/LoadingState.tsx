import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      className={`flex min-h-screen items-center justify-center ${bgClassName} px-4 py-12 sm:px-6 lg:px-8`}
    >
      <Card className="mx-auto w-full max-w-md" role="status" aria-live="polite">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" aria-label={`Loading: ${title}`}>
            {title}
          </CardTitle>
          <CardDescription aria-live="polite">{description}</CardDescription>
        </CardHeader>
        <span className="sr-only">Please wait while we {description.toLowerCase()}</span>
      </Card>
    </div>
  )
}
