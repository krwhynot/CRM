import React from 'react'
import type { Organization } from '@/types/entities'

interface PrincipalContactInfoProps {
  principal: Organization
}

export const PrincipalContactInfo: React.FC<PrincipalContactInfoProps> = ({ principal }) => {
  // Don't render if no contact information available
  if (!principal.phone && !principal.email && !principal.website) {
    return null
  }

  return (
    <div className="border-t border-border/50 pt-2">
      <div className="space-y-1 text-xs text-muted-foreground">
        {principal.phone && (
          <p>📞 {principal.phone}</p>
        )}
        {principal.email && (
          <p>📧 {principal.email}</p>
        )}
        {principal.website && (
          <p>🌐 {principal.website}</p>
        )}
      </div>
    </div>
  )
}