import { useState } from 'react'
import type { Organization } from '@/types/entities'

export function useOrganizationActions() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleEditOrganization = (organization: Organization) => {
    console.log('Edit organization:', organization)
    // TODO: Implement edit logic
  }

  const handleDeleteOrganization = (organization: Organization) => {
    console.log('Delete organization:', organization)
    // TODO: Implement delete logic
  }

  return {
    selectedItems,
    handleSelectItem,
    handleEditOrganization,
    handleDeleteOrganization,
  }
}
