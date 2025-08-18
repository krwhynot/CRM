import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FormCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function FormCard({ title, children, className }: FormCardProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}