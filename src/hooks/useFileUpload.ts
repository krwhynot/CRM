import type React from 'react'
import { useState, useCallback } from 'react'
import type { Database } from '@/lib/database.types'

// Type definition for PapaParse to avoid import issues
interface PapaParseResult<T> {
  data: T[]
  errors: unknown[]
  meta: {
    fields?: string[]
    delimiter?: string
    linebreak?: string
    aborted?: boolean
    truncated?: boolean
    cursor?: number
  }
}

interface PapaParseStatic {
  parse: <T>(
    input: string | File,
    config?: {
      header?: boolean
      skipEmptyLines?: boolean | 'greedy'
      transformHeader?: (header: string) => string
      complete?: (results: PapaParseResult<T>) => void
      error?: (error: unknown) => void
    }
  ) => void
  unparse: (data: { fields: string[]; data: unknown[][] }) => string
}

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
  type: Database['public']['Enums']['organization_type']
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
  // Original lowercase mappings for backward compatibility
  organizations: 'name',
  'priority-focus': 'priority',
  segment: 'segment',
  distributor: 'type',
  'primary acct. manager': 'primary_manager_name',
  'secondary acct. manager': 'secondary_manager_name',
  linkedin: 'website',
  phone: 'phone',
  'street address': 'address_line_1',
  city: 'city',
  state: 'state_province',
  'zip code': 'postal_code',
  notes: 'notes',
  
  // Actual CSV headers from your organization data
  'Organizations': 'name',
  'PRIORITY-FOCUS (A-D) A-highest\n(DropDown)': 'priority',
  'SEGMENT\n(DropDown)': 'segment',
  'DISTRIBUTOR \n(DropDown)': 'type',
  'Distr Rep': 'secondary_manager_name',
  'PRIMARY ACCT. MANAGER \n(DropDown)': 'primary_manager_name',
  'SECONDARY ACCT. MANAGER \n(DropDown)': 'secondary_manager_name',
  'LINKEDIN': 'website',
  'PHONE': 'phone',
  'STREET ADDRESS': 'address_line_1',
  'CITY': 'city',
  'STATE\n(DropDown)': 'state_province',
  'Zip Code': 'postal_code',
  'NOTES': 'notes',
  
  // Handle variations without newlines  
  'PRIORITY-FOCUS (A-D) A-highest (DropDown)': 'priority',
  'SEGMENT (DropDown)': 'segment',
  'DISTRIBUTOR (DropDown)': 'type',
  'PRIMARY ACCT. MANAGER (DropDown)': 'primary_manager_name',
  'SECONDARY ACCT. MANAGER (DropDown)': 'secondary_manager_name',
  'STATE (DropDown)': 'state_province',
  
  // Note: 'Row_Number' (first column) is intentionally not mapped as it's just a row identifier
} as const

const PRIORITY_VALUES = ['A', 'B', 'C', 'D'] as const
type PriorityValue = (typeof PRIORITY_VALUES)[number]

// Priority mapping for common CSV values to database format
const PRIORITY_MAPPING: Record<string, PriorityValue> = {
  'high': 'A',
  'a': 'A',
  'priority a': 'A',
  'top': 'A',
  '1': 'A',
  'medium-high': 'B', 
  'b': 'B',
  'priority b': 'B',
  'above average': 'B',
  '2': 'B',
  'medium': 'C',
  'c': 'C', 
  'priority c': 'C',
  'standard': 'C',
  'average': 'C',
  '3': 'C',
  'low': 'D',
  'd': 'D',
  'priority d': 'D',
  'minimal': 'D',
  '4': 'D',
} as const

// Organization type mapping for common CSV values to database format
const ORGANIZATION_TYPE_MAPPING: Record<string, Database['public']['Enums']['organization_type']> = {
  // Direct mappings
  'customer': 'customer',
  'principal': 'principal', 
  'distributor': 'distributor',
  'prospect': 'prospect',
  'vendor': 'vendor',
  'unknown': 'unknown',
  
  // Common variations
  'dist': 'distributor',
  'distribution': 'distributor',
  'distrib': 'distributor',
  'client': 'customer',
  'account': 'customer',
  'restaurant': 'customer',
  'foodservice': 'customer',
  'food service': 'customer',
  'manufacturer': 'principal',
  'brand': 'principal',
  'producer': 'principal',
  'supplier': 'vendor',
  'service provider': 'vendor',
  'lead': 'prospect',
  'potential': 'prospect',
  'potential customer': 'prospect',
  
  // Special cases that should be noted but mapped to unknown
  'key partner': 'unknown',
  'strategic partner': 'unknown',
  'preferred partner': 'unknown',
  'vip': 'unknown',
  'premium': 'unknown',
  'priority': 'unknown',
  'tier 1': 'unknown',
  'tier 2': 'unknown',
  'tier 3': 'unknown',
  'gold': 'unknown',
  'silver': 'unknown',
  'bronze': 'unknown',
} as const

const EXPECTED_COLUMNS = {
  required: ['organizations'],
  optional: Object.keys(EXCEL_FIELD_MAPPINGS).filter((key) => key !== 'organizations'),
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

  // Helper function to normalize priority values
  const normalizePriority = useCallback((priorityValue: string): PriorityValue => {
    const normalized = priorityValue.toLowerCase().trim()
    return PRIORITY_MAPPING[normalized] || 'C'
  }, [])

  // Helper function to normalize organization type values
  const normalizeOrganizationType = useCallback((
    typeValue: string
  ): { 
    type: Database['public']['Enums']['organization_type'], 
    originalValue?: string,
    shouldAddToNotes?: boolean 
  } => {
    const normalized = typeValue.toLowerCase().trim()
    const mappedType = ORGANIZATION_TYPE_MAPPING[normalized]
    
    if (mappedType) {
      // Check if this is a special case that should be noted
      const specialCases = ['key partner', 'strategic partner', 'preferred partner', 'vip', 'premium', 'priority', 'tier 1', 'tier 2', 'tier 3', 'gold', 'silver', 'bronze']
      const shouldAddToNotes = specialCases.includes(normalized) && mappedType === 'unknown'
      
      return {
        type: mappedType,
        originalValue: shouldAddToNotes ? typeValue : undefined,
        shouldAddToNotes
      }
    }
    
    // Fallback to unknown for unrecognized values
    return {
      type: 'unknown',
      originalValue: typeValue,
      shouldAddToNotes: true
    }
  }, [])

  // Validate CSV row data with enhanced priority validation
  const validateRow = useCallback((row: CsvRow): string[] => {
    const errors: string[] = []
    
    // Organization name is required
    if (!row.organizations?.trim()) {
      errors.push('Organization name is required')
    }
    
    // Priority validation - now more flexible
    if (row['priority-focus']?.trim()) {
      const priorityValue = row['priority-focus'].trim()
      
      // Only warn if we couldn't normalize it and it's not already a valid single character  
      if (!PRIORITY_VALUES.includes(priorityValue.toUpperCase() as PriorityValue) && 
          !PRIORITY_MAPPING[priorityValue.toLowerCase()]) {
        errors.push(`Priority "${priorityValue}" not recognized. Will default to 'C'. Expected: ${Object.keys(PRIORITY_MAPPING).slice(0, 8).join(', ')}, etc.`)
      }
    }
    
    return errors
  }, [normalizePriority])

  // Helper function to detect if a row has meaningful content
  const hasContent = useCallback((row: string[]): boolean => {
    return row.some((cell) => cell && cell.trim().length > 0)
  }, [])

  // Enhanced preprocessing for complex Excel CSV files
  const preprocessCSVData = useCallback((allRows: string[][]): { headerRow: string[], dataRows: string[][] } => {
    // Skip instruction rows and find actual header
    const cleanRows = allRows.filter(row => {
      const firstCell = row[0] || ''
      const rowText = row.join(' ').toLowerCase()
      
      // Skip instruction rows, empty rows, and Excel metadata
      return !(
        rowText.includes('instruction') ||
        rowText.includes('enter your') ||
        rowText.includes('dropdown') ||
        firstCell.startsWith('=') ||
        row.every(cell => !cell || cell.trim() === '' || cell === ',')
      )
    })

    // Find header row - look for row with organization-related keywords
    let headerRowIndex = 0
    let maxScore = 0
    
    for (let i = 0; i < Math.min(5, cleanRows.length); i++) {
      const row = cleanRows[i]
      let score = 0
      
      // Score based on presence of expected column names
      row.forEach(cell => {
        const cellLower = (cell || '').toLowerCase()
        if (cellLower.includes('organization') || cellLower.includes('priority')) score += 10
        if (cellLower.includes('segment') || cellLower.includes('manager')) score += 5
        if (cellLower.includes('phone') || cellLower.includes('address')) score += 3
        if (cell && cell.trim().length > 0) score += 1
      })
      
      if (score > maxScore) {
        maxScore = score
        headerRowIndex = i
      }
    }

    const headerRow = cleanRows[headerRowIndex] || []
    const dataRows = cleanRows.slice(headerRowIndex + 1).filter(row => 
      row.some(cell => cell && cell.trim().length > 0)
    )

    return { headerRow, dataRows }
  }, [])

  // Helper function to normalize column headers for field mapping
  const normalizeHeader = useCallback((header: string): string => {
    if (!header) return ''
    
    // Handle multi-line headers by taking the key part
    const normalized = header.toLowerCase()
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Map common Excel header variations to our expected fields
    const headerMappings: Record<string, string> = {
      'organizations': 'organizations',
      'organization name': 'organizations',
      'company': 'organizations',
      'priority-focus': 'priority-focus',
      'priority': 'priority-focus', 
      'segment': 'segment',
      'primary acct. manager': 'primary-manager',
      'primary manager': 'primary-manager',
      'manager': 'primary-manager',
      'secondary acct. manager': 'secondary-manager',
      'secondary manager': 'secondary-manager',
      'phone': 'phone',
      'city': 'city',
      'state': 'state',
      'notes': 'notes'
    }
    
    // Find best match
    for (const [key, value] of Object.entries(headerMappings)) {
      if (normalized.includes(key)) {
        return value
      }
    }
    
    return header // Return original if no mapping found
  }, [])

  // Helper function to find the header row (row with most non-empty cells)
  const findHeaderRow = useCallback(
    (allRows: string[][]): number => {
      let bestRowIndex = 0
      let maxNonEmptyCells = 0
      
      // Look at first 10 rows to find the one with the most content
      for (let i = 0; i < Math.min(10, allRows.length); i++) {
        const nonEmptyCells = allRows[i].filter(cell => 
          cell && 
          cell.trim().length > 0 && 
          !cell.startsWith('=') && // Skip Excel formulas
          !cell.toLowerCase().includes('instruction') // Skip instruction rows
        ).length
        
        if (nonEmptyCells > maxNonEmptyCells) {
          maxNonEmptyCells = nonEmptyCells
          bestRowIndex = i
        }
      }
      
      return bestRowIndex
    },
    []
  )
  
  // Helper function to find first data row (after headers)
  const findDataStartRow = useCallback(
    (allRows: string[][], headerRowIndex: number): number => {
      // Start looking for data after the header row
      for (let i = headerRowIndex + 1; i < allRows.length; i++) {
        if (hasContent(allRows[i])) {
          return i
        }
      }
      return headerRowIndex + 1 // Default to row after headers
    },
    [hasContent]
  )

  // Parse CSV file with smart row skipping
  const parseCSV = useCallback(
    async (file: File) => {
      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
      }))

      try {
        // Dynamic import for PapaParse to avoid bundle bloat
        let Papa: PapaParseStatic
        try {
          Papa = (await import('papaparse')).default as PapaParseStatic
        } catch (importError) {
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            error: 'Failed to load CSV parsing library. Please try again.',
          }))
          return
        }

        // First pass: Read without headers to find data start
        Papa.parse<string[]>(file, {
          header: false,
          skipEmptyLines: false, // Keep empty lines for analysis
          complete: (firstPass: PapaParseResult<string[]>) => {
          try {
            const allRows = firstPass.data
            
            // Use enhanced preprocessing for complex Excel CSV files
            const { headerRow, dataRows } = preprocessCSVData(allRows)

            if (!headerRow.length || !dataRows.length) {
              setUploadState((prev) => ({
                ...prev,
                isUploading: false,
                error: 'No valid headers or data found in CSV file. Please check your file format.',
              }))
              return
            }

            // Process headers with normalization for better field mapping
            const processedHeaders = headerRow.map((header, index) => {
              const trimmed = header ? header.trim() : ''
              if (!trimmed) {
                // Use context-aware names for empty headers
                if (index === 0) return 'Row_Number' // First column appears to be row identifier
                return `Column_${index + 1}`
              }
              
              // Check if this header has a direct mapping in our field mappings
              if (EXCEL_FIELD_MAPPINGS[trimmed]) {
                return trimmed // Keep exact match for direct mapping
              }
              
              // Try to normalize and find a mapping
              const normalized = normalizeHeader(trimmed)
              if (normalized !== trimmed) {
                // Find the original field key that maps to this normalized value
                const mappingKey = Object.keys(EXCEL_FIELD_MAPPINGS).find(key => 
                  normalizeHeader(key) === normalized
                )
                if (mappingKey) {
                  return mappingKey // Use the mapping key for consistency
                }
              }
              
              return trimmed // Keep original if no mapping found
            })

            // Build data objects directly
            const rows: CsvRow[] = dataRows
              .filter(row => row.some(cell => cell && cell.trim().length > 0)) // Skip empty rows
              .map(row => {
                const rowObj: CsvRow = {}
                processedHeaders.forEach((header, index) => {
                  rowObj[header] = (row[index] && row[index].trim()) || ''
                })
                return rowObj
              })

            try {
              const headers = processedHeaders

                  // Check for required columns
                  const missingRequired = EXPECTED_COLUMNS.required.filter(
                    (col) => !headers.includes(col)
                  )

                  if (missingRequired.length > 0) {
                    setUploadState((prev) => ({
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
                        is_active: true,
                      }

                      // Apply field mappings
                      Object.entries(EXCEL_FIELD_MAPPINGS).forEach(([excelCol, dbField]) => {
                        const value = row[excelCol]?.trim()
                        if (dbField in transformedRow && value) {
                          if (dbField === 'type') {
                            const typeResult = normalizeOrganizationType(value)
                            transformedRow.type = typeResult.type
                            
                            // If this should be noted, add to notes
                            if (typeResult.shouldAddToNotes && typeResult.originalValue) {
                              const noteText = `Import notes: Original type was '${typeResult.originalValue}'`
                              transformedRow.import_notes = transformedRow.import_notes 
                                ? `${transformedRow.import_notes}; ${noteText}` 
                                : noteText
                            }
                          } else if (dbField === 'is_active') {
                            transformedRow.is_active = Boolean(value)
                          } else if (dbField === 'priority') {
                            // Use the priority normalization function
                            transformedRow.priority = normalizePriority(value)
                          } else {
                            const key = dbField as keyof TransformedOrganizationRow
                            if (key in transformedRow) {
                              (transformedRow as Record<string, unknown>)[key] = value
                            }
                          }
                        }
                      })

                      // Ensure priority has a valid default if not set
                      if (!transformedRow.priority) {
                        transformedRow.priority = 'C' as PriorityValue
                      }

                      // Fallback organization type determination if not set via field mapping
                      if (!transformedRow.type) {
                        if (
                          row['distributor']?.toLowerCase().includes('distributor') ||
                          row['segment']?.toLowerCase().includes('distributor')
                        ) {
                          transformedRow.type = 'distributor'
                        } else {
                          // Use unknown as the fallback instead of customer
                          transformedRow.type = 'unknown'
                          
                          // Add note about fallback assignment
                          const noteText = 'Import notes: Type could not be determined from data, assigned as Unknown'
                          transformedRow.import_notes = transformedRow.import_notes 
                            ? `${transformedRow.import_notes}; ${noteText}` 
                            : noteText
                        }
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

              setUploadState((prev) => ({
                ...prev,
                isUploading: false,
                uploadProgress: 100,
                parsedData,
              }))
            } catch (error) {
              setUploadState((prev) => ({
                ...prev,
                isUploading: false,
                error: `Failed to process CSV data: ${error instanceof Error ? error.message : 'Please check the file format.'}`,
              }))
            }
          } catch (error) {
            setUploadState((prev) => ({
              ...prev,
              isUploading: false,
              error: 'Failed to analyze CSV structure. Please check the file format.',
            }))
          }
        },
        error: (error: unknown) => {
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            error: `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }))
        },
      })
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: 'Failed to load CSV parsing library. Please try again.',
        }))
      }
    },
    [validateRow, findHeaderRow, findDataStartRow, normalizePriority, preprocessCSVData, normalizeHeader, normalizeOrganizationType]
  )

  // File selection handler
  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file)
      if (error) {
        setUploadState((prev) => ({
          ...prev,
          error,
          file: null,
          parsedData: null,
        }))
        return
      }

      setUploadState((prev) => ({
        ...prev,
        file,
        error: null,
        parsedData: null,
      }))

      parseCSV(file)
    },
    [validateFile, parseCSV]
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState((prev) => ({ ...prev, isDragOver: true }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState((prev) => ({ ...prev, isDragOver: false }))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setUploadState((prev) => ({ ...prev, isDragOver: false }))
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

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
  const downloadTemplate = useCallback(async () => {
    const headers = Object.keys(EXCEL_FIELD_MAPPINGS)
    const sampleData = [
      {
        organizations: 'Acme Food Distribution',
        'priority-focus': 'A',
        segment: 'Casual Dining',
        distributor: '',
        'primary acct. manager': 'John Smith',
        'secondary acct. manager': 'Jane Doe',
        linkedin: 'https://linkedin.com/company/acmefood',
        phone: '555-0123',
        'street address': '123 Business Ave',
        city: 'Chicago',
        state: 'IL',
        'zip code': '60601',
        notes: 'Regional food distributor serving Chicago metro area',
      },
      {
        organizations: 'Premium Ingredients Co',
        'priority-focus': 'B',
        segment: 'Distributor',
        distributor: 'Yes',
        'primary acct. manager': 'Mike Johnson',
        'secondary acct. manager': '',
        linkedin: 'https://linkedin.com/company/premiumingredients',
        phone: '555-0456',
        'street address': '456 Industrial Blvd',
        city: 'Milwaukee',
        state: 'WI',
        'zip code': '53202',
        notes: 'Specialty ingredient supplier - high volume distributor',
      },
    ]

    try {
      // Dynamic import for PapaParse to avoid bundle bloat
      const Papa = (await import('papaparse')).default as PapaParseStatic
      const csv = Papa.unparse({ fields: headers, data: sampleData.map(Object.values) })
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'organization_import_template.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      // Fallback: Could show error toast or provide alternative download method
      // Silent failure for now - user will notice if template doesn't download
    }
  }, [])

  return {
    uploadState,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetUpload,
    downloadTemplate,
  }
}
