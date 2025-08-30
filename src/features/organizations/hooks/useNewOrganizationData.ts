import React, { useState } from 'react'

interface NewOrganizationData {
  name: string
  type: 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor'
  phone: string
  email: string
  website: string
  notes: string
}

interface UseNewOrganizationDataReturn {
  newOrgData: NewOrganizationData
  setNewOrgData: React.Dispatch<React.SetStateAction<NewOrganizationData>>
  updateNewOrgField: (field: keyof NewOrganizationData, value: string) => void
}

export const useNewOrganizationData = (): UseNewOrganizationDataReturn => {
  const [newOrgData, setNewOrgData] = useState<NewOrganizationData>({
    name: '',
    type: 'customer',
    phone: '',
    email: '',
    website: '',
    notes: ''
  })

  const updateNewOrgField = (field: keyof NewOrganizationData, value: string) => {
    setNewOrgData(prev => ({ ...prev, [field]: value }))
  }

  return {
    newOrgData,
    setNewOrgData,
    updateNewOrgField
  }
}