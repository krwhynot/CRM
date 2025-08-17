// Example usage of CoreFormLayout component
// This file demonstrates how to use the CoreFormLayout with the organization entity

import React from 'react'
import { CoreFormLayout } from './CoreFormLayout'
import { createOrganizationFormConfig } from '@/configs/forms/organization.config'
import type { OrganizationFormData } from '@/types/organization.types'

interface ExampleOrganizationFormProps {
  onSubmit: (data: OrganizationFormData) => void
  initialData?: Partial<OrganizationFormData>
  loading?: boolean
  submitLabel?: string
}

export function ExampleOrganizationForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Organization'
}: ExampleOrganizationFormProps) {
  const formConfig = createOrganizationFormConfig(initialData)
  
  return (
    <CoreFormLayout
      {...formConfig}
      onSubmit={onSubmit}
      loading={loading}
      submitLabel={submitLabel}
    />
  )
}

// Usage example:
/*
function MyOrganizationPage() {
  const handleSubmit = (data: OrganizationFormData) => {
    console.log('Form submitted:', data)
    // Handle form submission logic here
  }

  const initialData = {
    name: 'Example Restaurant',
    priority: 'B' as const,
    segment: 'Fine Dining',
    is_principal: false,
    is_distributor: true
  }

  return (
    <div className="container mx-auto py-6">
      <ExampleOrganizationForm
        onSubmit={handleSubmit}
        initialData={initialData}
        submitLabel="Create Organization"
      />
    </div>
  )
}
*/

export default ExampleOrganizationForm