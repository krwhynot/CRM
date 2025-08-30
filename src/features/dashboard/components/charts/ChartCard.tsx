import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartCardProps {
  icon: React.ReactNode
  title: string
  description: string
  cardClassName: string
  headerClassName: string
  titleClassName: string
  descriptionClassName: string
  contentClassName: string
  children: React.ReactNode
}

export const ChartCard: React.FC<ChartCardProps> = ({
  icon,
  title,
  description,
  cardClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  children
}) => {
  return (
    <Card className={`${cardClassName} transition-shadow hover:shadow-lg`}>
      <CardHeader className={headerClassName}>
        <CardTitle className={`flex items-center gap-2 ${titleClassName}`}>
          {icon}
          {title}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${descriptionClassName}`}>
          {description}
        </p>
      </CardHeader>
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  )
}