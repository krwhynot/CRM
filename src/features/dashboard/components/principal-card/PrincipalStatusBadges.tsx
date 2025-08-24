import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { Organization } from '@/types/entities'

interface PrincipalStatusBadgesProps {
  principal: Organization
}

export const PrincipalStatusBadges: React.FC<PrincipalStatusBadgesProps> = ({ principal }) => {
  return (
    <div className="flex items-center justify-between">
      <Badge 
        variant={principal.is_active ? 'default' : 'secondary'}
        className="text-xs"
      >
        {principal.is_active ? 'Active' : 'Inactive'}
      </Badge>
      
      {principal.size && (
        <Badge variant="outline" className="text-xs">
          {principal.size.charAt(0).toUpperCase() + principal.size.slice(1)}
        </Badge>
      )}
    </div>
  )
}