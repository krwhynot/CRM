import React from 'react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Organization } from '@/types/entities'

interface PrincipalCardHeaderProps {
  principal: Organization
  priority: string
  priorityColor: string
}

export const PrincipalCardHeader: React.FC<PrincipalCardHeaderProps> = ({
  principal,
  priority,
  priorityColor
}) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {principal.name}
        </CardTitle>
        <Badge className={priorityColor} variant="outline">
          {priority}
        </Badge>
      </div>
      
      {principal.industry && (
        <p className="text-sm text-muted-foreground">{principal.industry}</p>
      )}
      
      {principal.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {principal.description}
        </p>
      )}
    </CardHeader>
  )
}