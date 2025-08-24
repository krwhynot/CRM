import React from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const SuccessState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">Password Updated!</CardTitle>
          <CardDescription>
            Your password has been successfully updated. Redirecting to login...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}