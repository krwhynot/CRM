import { useState, useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Database } from '@/lib/database.types'

export interface ExportOptions {
  format: 'csv' | 'xlsx'
  includeInactive: boolean
  selectedFields: string[]
  filters: {
    type?: Database['public']['Enums']['organization_type'][]
    priority?: Database['public']['Enums']['priority_level'][]
    segment?: string[] // Assuming segment is still string[] or needs a new enum
  }
}

export const AVAILABLE_FIELDS = [
  { id: 'name', label: 'Organization Name', required: true },
  { id: 'type', label: 'Type', required: false },
  { id: 'priority', label: 'Priority', required: false },
  { id: 'segment', label: 'Segment', required: false },
  { id: 'website', label: 'Website', required: false },
  { id: 'phone', label: 'Phone', required: false },
  { id: 'address_line_1', label: 'Address', required: false },
  { id: 'city', label: 'City', required: false },
  { id: 'state_province', label: 'State/Province', required: false },
  { id: 'postal_code', label: 'Postal Code', required: false },
  { id: 'country', label: 'Country', required: false },
  { id: 'notes', label: 'Notes', required: false },
  { id: 'primary_manager_name', label: 'Primary Manager', required: false },
  { id: 'secondary_manager_name', label: 'Secondary Manager', required: false },
  { id: 'created_at', label: 'Created Date', required: false },
  { id: 'updated_at', label: 'Last Updated', required: false },
]

export const ORGANIZATION_TYPES = ['customer', 'principal', 'distributor', 'prospect', 'vendor']
export const PRIORITIES = ['A', 'B', 'C', 'D']

interface UseExportConfigurationReturn {
  exportOptions: ExportOptions
  setExportOptions: Dispatch<SetStateAction<ExportOptions>>
  handleFieldToggle: (fieldId: string, checked: boolean) => void
  handleFormatChange: (format: 'csv' | 'xlsx') => void
  handleIncludeInactiveChange: (checked: boolean) => void
}

export const useExportConfiguration = (): UseExportConfigurationReturn => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeInactive: false,
    selectedFields: ['name', 'type', 'priority', 'segment', 'phone', 'city', 'state_province'],
    filters: {},
  })

  // Handle field selection
  const handleFieldToggle = useCallback((fieldId: string, checked: boolean) => {
    const field = AVAILABLE_FIELDS.find((f) => f.id === fieldId)
    if (field?.required) return // Don't allow toggling required fields

    setExportOptions((prev) => ({
      ...prev,
      selectedFields: checked
        ? [...prev.selectedFields, fieldId]
        : prev.selectedFields.filter((id) => id !== fieldId),
    }))
  }, [])

  // Handle format change
  const handleFormatChange = useCallback((format: 'csv' | 'xlsx') => {
    setExportOptions((prev) => ({ ...prev, format }))
  }, [])

  // Handle include inactive toggle
  const handleIncludeInactiveChange = useCallback((checked: boolean) => {
    setExportOptions((prev) => ({ ...prev, includeInactive: checked }))
  }, [])

  return {
    exportOptions,
    setExportOptions,
    handleFieldToggle,
    handleFormatChange,
    handleIncludeInactiveChange,
  }
}
