import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low'
  className?: string
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const getVariant = () => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <Badge variant={getVariant()} className={cn('capitalize', className)}>
      {priority}
    </Badge>
  )
}