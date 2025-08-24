import { useMemo } from 'react'
import type { ContactWithOrganization } from '@/types/entities'

interface UseContactRowStateReturn {
  primaryContactInfo: string | null
  getPrimaryContactInfo: (contact: ContactWithOrganization) => string | null
}

export const useContactRowState = (
  contact: ContactWithOrganization
): UseContactRowStateReturn => {
  const getPrimaryContactInfo = (contact: ContactWithOrganization): string | null => {
    if (contact.email) return contact.email
    if (contact.phone) return contact.phone
    if (contact.mobile_phone) return contact.mobile_phone
    return null
  }

  const primaryContactInfo = useMemo(() => {
    return getPrimaryContactInfo(contact)
  }, [contact])

  return {
    primaryContactInfo,
    getPrimaryContactInfo
  }
}