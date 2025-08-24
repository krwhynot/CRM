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
  bgClassName = "bg-gray-50"
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${bgClassName} py-12 px-4 sm:px-6 lg:px-8`}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
