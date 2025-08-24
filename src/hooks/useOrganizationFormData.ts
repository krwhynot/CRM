import { useMemo } from 'react'
import type { Organization } from '@/types/entities'

export const useOrganizationFormData = (organization: Organization | null) => {
  const initialData = useMemo(() => {
    if (!organization) return undefined

    return {
      name: organization.name,
      type: organization.type,
      priority: organization.priority as 'A' | 'B' | 'C' | 'D',
      segment: organization.segment,
      is_principal: organization.is_principal ?? false,
      is_distributor: organization.is_distributor ?? false,
      city: organization.city,
      state_province: organization.state_province,
      phone: organization.phone,
      website: organization.website,
      notes: organization.notes
    }
  }, [organization])

  return { initialData }
}