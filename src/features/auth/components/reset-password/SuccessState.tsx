import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

import { cn } from '@/lib/utils'
export const SuccessState: React.FC = () => {
  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-gray-50 ${semanticSpacing.horizontalPadding.lg} ${semanticSpacing.verticalPadding.xxl} sm:${semanticSpacing.horizontalPadding.xl} lg:${semanticSpacing.horizontalPadding.xxl}`}
    >
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle
            className={cn(semanticTypography.h2, semanticTypography.title, 'text-green-600')}
          >
            Password Updated!
          </CardTitle>
          <CardDescription>
            Your password has been successfully updated. Redirecting to login...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
