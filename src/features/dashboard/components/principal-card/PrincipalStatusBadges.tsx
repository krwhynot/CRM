import { Badge } from '@/components/ui/badge'
import type { Organization } from '@/types/entities'

interface PrincipalStatusBadgesProps {
  principal: Organization
}

export const PrincipalStatusBadges = ({ principal }: PrincipalStatusBadgesProps) => {
  return (
    <div className="flex items-center justify-between">
      <Badge variant={principal.is_active ? 'default' : 'secondary'} className="text-xs">
        {principal.is_active ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  )
}
