import { useMemo } from 'react'
import type { Organization } from '@/types/entities'
import type { OrganizationFormInterface } from '@/types/forms/form-interfaces'

export const useOrganizationFormData = (
  organization: Organization | null
): {
  initialData: Partial<OrganizationFormInterface> | undefined
} => {
  const initialData = useMemo((): Partial<OrganizationFormInterface> | undefined => {
    if (!organization) return undefined

    return {
      name: organization.name,
      type: organization.type,
      priority: organization.priority,
      segment: organization.segment,
      is_principal: organization.is_principal ?? false,
      is_distributor: organization.is_distributor ?? false,
      city: organization.city,
      state_province: organization.state_province,
      phone: organization.phone,
      website: organization.website,
      notes: organization.notes,
    }
  }, [organization])

  return { initialData }
}
