import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import type { Database } from '@/lib/database.types'

export interface CsvRow {
  [key: string]: string
}

export interface ParsedData {
  headers: string[]
  rows: CsvRow[]
  validRows: TransformedOrganizationRow[]
  invalidRows: Array<{ row: CsvRow; errors: string[] }>
}

export interface TransformedOrganizationRow {
  name: string
  type: any // Database type
  priority: 'A' | 'B' | 'C' | 'D'
  segment: string
  website: string | null
  phone: string | null
  address_line_1: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  notes: string | null
  primary_manager_name: string | null
  secondary_manager_name: string | null
  import_notes?: string | null
  is_active: boolean
  [key: string]: string | boolean | null | undefined
}

interface UseFileUploadState {
  file: File | null
  isDragOver: boolean
  isUploading: boolean
  uploadProgress: number
  parsedData: ParsedData | null
  error: string | null
}

interface UseFileUploadReturn {
  uploadState: UseFileUploadState
  handleFileSelect: (file: File) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  resetUpload: () => void
  downloadTemplate: () => void
}

// Field mappings (moved from component)
const EXCEL_FIELD_MAPPINGS: Record<string, keyof TransformedOrganizationRow> = {
  'organizations': 'name',
  'priority-focus': 'priority', 
  'segment': 'segment',
  'distributor': 'type',
  'primary acct. manager': 'primary_manager_name',
  'secondary acct. manager': 'secondary_manager_name',
  'linkedin': 'website',
  'phone': 'phone',
  'street address': 'address_line_1',
  'city': 'city',
  'state': 'state_province',
  'zip code': 'postal_code',
  'notes': 'notes'
} as const

const PRIORITY_VALUES = ['A', 'B', 'C', 'D'] as const
type PriorityValue = typeof PRIORITY_VALUES[number]

const EXPECTED_COLUMNS = {
  required: ['organizations'],
  optional: Object.keys(EXCEL_FIELD_MAPPINGS).filter(key => key !== 'organizations')
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploadState, setUploadState] = useState<UseFileUploadState>({
    file: null,
    isDragOver: false,
    isUploading: false,
    uploadProgress: 0,
    parsedData: null,
    error: null,
  })

  // Validate file type and size
  const validateFile = useCallback((file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Please upload a CSV file (.csv extension)'
    }
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'File size must be less than 5MB'
    }
    return null
  }, [])

  // Validate CSV row data
  const validateRow = useCallback((row: CsvRow): string[] => {
    const errors: string[] = []
    if (!row.organizations?.trim()) {
      errors.push('Organization name is required')
    }
    if (row['priority-focus']?.trim()) {
      const priority = row['priority-focus'].trim().toUpperCase()
      if (!PRIORITY_VALUES.includes(priority as PriorityValue)) {
        errors.push(`Priority must be one of: ${PRIORITY_VALUES.join(', ')}`)
      }
    }
    return errors
  }, [])

  // Parse CSV file
  const parseCSV = useCallback((file: File) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null,
    }))

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.toLowerCase().trim(),
      complete: (results: Papa.ParseResult<CsvRow>) => {
        try {
          const headers = results.meta.fields || []
          const rows = results.data

          // Check for required columns
          const missingRequired = EXPECTED_COLUMNS.required.filter(
            col => !headers.includes(col)
          )

          if (missingRequired.length > 0) {
            setUploadState(prev => ({
              ...prev,
              isUploading: false,
              error: `Missing required column: ${missingRequired.join(', ')}. Your CSV must have a column named 'organizations' with organization names.`,
            }))
            return
          }

          // Validate and transform rows
          const validRows: TransformedOrganizationRow[] = []
          const invalidRows: Array<{ row: CsvRow; errors: string[] }> = []

          rows.forEach((row) => {
            const errors = validateRow(row)
            if (errors.length === 0) {
              const transformedRow: TransformedOrganizationRow = {
                name: '',
                type: 'customer',
                priority: 'C',
                segment: 'General',
                website: null,
                phone: null,
                address_line_1: null,
                city: null,
                state_province: null,
                postal_code: null,
                country: null,
                notes: null,
                primary_manager_name: null,
                secondary_manager_name: null,
                is_active: true
              }
              
              // Apply field mappings
              Object.entries(EXCEL_FIELD_MAPPINGS).forEach(([excelCol, dbField]) => {
                const value = row[excelCol]?.trim()
                if (dbField in transformedRow && value) {
                  if (dbField === 'type') {
                    transformedRow.type = value as Database['public']['Enums']['organization_type']
                  } else if (dbField === 'is_active') {
                    transformedRow.is_active = Boolean(value)
                  } else {
                    const key = dbField as keyof TransformedOrganizationRow
                    if (key in transformedRow) {
                      ;(transformedRow as Record<string, any>)[key] = value
                    }
                  }
                }
              })

              // Business logic transformations
              if (transformedRow.priority) {
                const upperPriority = (transformedRow.priority as string).toUpperCase()
                transformedRow.priority = PRIORITY_VALUES.includes(upperPriority as PriorityValue) 
                  ? upperPriority as PriorityValue 
                  : 'C' as PriorityValue
              } else {
                transformedRow.priority = 'C' as PriorityValue
              }

              // Determine organization type
              if (row['distributor']?.toLowerCase().includes('distributor') || 
                  row['segment']?.toLowerCase().includes('distributor')) {
                transformedRow.type = 'distributor'
              } else {
                transformedRow.type = 'customer'
              }

              // Set defaults
              transformedRow.country = transformedRow.country || 'US'
              transformedRow.segment = transformedRow.segment || 'General'

              // Store unmapped data
              const unmappedData = Object.entries(row)
                .filter(([key]) => !Object.keys(EXCEL_FIELD_MAPPINGS).includes(key))
                .filter(([, value]) => value && value.trim())
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ')
              
              if (unmappedData) {
                transformedRow.import_notes = unmappedData
              }

              validRows.push(transformedRow)
            } else {
              invalidRows.push({ row, errors })
            }
          })

          const parsedData: ParsedData = { headers, rows, validRows, invalidRows }

          setUploadState(prev => ({
            ...prev,
            isUploading: false,
            uploadProgress: 100,
            parsedData,
          }))
        } catch (error) {
          setUploadState(prev => ({
            ...prev,
            isUploading: false,
            error: 'Failed to parse CSV file. Please check the file format.',
          }))
        }
      },
      error: (error: Error) => {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          error: `CSV parsing error: ${error.message}`,
        }))
      },
    })
  }, [validateRow])

  // File selection handler
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      setUploadState(prev => ({
        ...prev,
        error,
        file: null,
        parsedData: null,
      }))
      return
    }

    setUploadState(prev => ({
      ...prev,
      file,
      error: null,
      parsedData: null,
    }))

    parseCSV(file)
  }, [validateFile, parseCSV])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState(prev => ({ ...prev, isDragOver: true }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState(prev => ({ ...prev, isDragOver: false }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState(prev => ({ ...prev, isDragOver: false }))
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // Reset handler
  const resetUpload = useCallback(() => {
    setUploadState({
      file: null,
      isDragOver: false,
      isUploading: false,
      uploadProgress: 0,
      parsedData: null,
      error: null,
    })
  }, [])

  // Download template
  const downloadTemplate = useCallback(() => {
    const headers = Object.keys(EXCEL_FIELD_MAPPINGS)
    const sampleData = [
      {
        'organizations': 'Acme Food Distribution',
        'priority-focus': 'A',
        'segment': 'Casual Dining',
        'distributor': '',
        'primary acct. manager': 'John Smith',
        'secondary acct. manager': 'Jane Doe',
        'linkedin': 'https://linkedin.com/company/acmefood',
        'phone': '555-0123',
        'street address': '123 Business Ave',
        'city': 'Chicago',
        'state': 'IL',
        'zip code': '60601',
        'notes': 'Regional food distributor serving Chicago metro area'
      },
      {
        'organizations': 'Premium Ingredients Co',
        'priority-focus': 'B',
        'segment': 'Distributor',
        'distributor': 'Yes',
        'primary acct. manager': 'Mike Johnson',
        'secondary acct. manager': '',
        'linkedin': 'https://linkedin.com/company/premiumingredients',
        'phone': '555-0456',
        'street address': '456 Industrial Blvd',
        'city': 'Milwaukee',
        'state': 'WI',
        'zip code': '53202',
        'notes': 'Specialty ingredient supplier - high volume distributor'
      }
    ]

    const csv = Papa.unparse({ fields: headers, data: sampleData })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'organization_import_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return {
    uploadState,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetUpload,
    downloadTemplate
  }
}