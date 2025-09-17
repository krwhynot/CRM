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

export const ContactBadges = ({
  contact,
  showPriority = true,
  showInfluence = true,
  showAuthority = true,
  className = '',
}: ContactBadgesProps) => {
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
        <Badge {...priorityBadge.props}>{priorityBadge.label}</Badge>
      )}

      {/* Influence Badge */}
      {showInfluence && contact.purchase_influence && (
        <Badge {...influenceBadge.props}>{influenceBadge.label}</Badge>
      )}

      {/* Authority Badge */}
      {showAuthority && contact.decision_authority && (
        <Badge {...authorityBadge.props}>{authorityBadge.label}</Badge>
      )}

      {/* Primary Contact Badge (if not already shown as priority) */}
      {contact.is_primary_contact && !priorityBadge && <Badge priority="a">Primary</Badge>}
    </div>
  )
}
