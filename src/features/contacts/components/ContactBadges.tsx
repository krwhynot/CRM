import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useContactsBadges } from '@/features/contacts/hooks/useContactsBadges'
import type { ContactWithOrganization } from '@/types/entities'

interface ContactBadgesProps {
  contact: ContactWithOrganization
  showPriority?: boolean
  showInfluence?: boolean
  showAuthority?: boolean
  className?: string
}

export const ContactBadges: React.FC<ContactBadgesProps> = ({
  contact,
  showPriority = true,
  showInfluence = true,
  showAuthority = true,
  className = ''
}) => {
  const { getInfluenceBadge, getAuthorityBadge, getPriorityBadge } = useContactsBadges()

  const priorityBadge = getPriorityBadge(
    contact.is_primary_contact || false, 
    contact.purchase_influence
  )
  const influenceBadge = getInfluenceBadge(contact.purchase_influence)
  const authorityBadge = getAuthorityBadge(contact.decision_authority)

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {/* Priority Badge (highest priority) */}
      {showPriority && priorityBadge && (
        <Badge 
          variant="outline" 
          className={priorityBadge.className}
        >
          {priorityBadge.label}
        </Badge>
      )}

      {/* Influence Badge */}
      {showInfluence && contact.purchase_influence && (
        <Badge 
          variant="outline" 
          className={influenceBadge.className}
        >
          {influenceBadge.label}
        </Badge>
      )}

      {/* Authority Badge */}
      {showAuthority && contact.decision_authority && (
        <Badge 
          variant="outline" 
          className={authorityBadge.className}
        >
          {authorityBadge.label}
        </Badge>
      )}

      {/* Primary Contact Badge (if not already shown as priority) */}
      {contact.is_primary_contact && !priorityBadge && (
        <Badge 
          variant="outline" 
          className="bg-blue-100 text-blue-800 border-blue-200"
        >
          Primary
        </Badge>
      )}
    </div>
  )
}
