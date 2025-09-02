import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { type ParsedData, type TransformedOrganizationRow } from '@/hooks/useFileUpload'
import { useImportProgress } from '@/features/import-export/hooks/useImportProgress'
import { suggestFieldMappings, isOpenAIAvailable } from '@/lib/openai'
import { X } from 'lucide-react'

// Import state matching the 5 wireframe states
type ImportState = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

// CSV row data type
type CsvRowData = Record<string, string | number | null>

// Field mapping structure
interface FieldMapping {
  csvColumn: string
  mapsTo: string | null
  confidence: number
}

// Available CRM fields - organized by priority
const CRM_FIELDS = [
  // REQUIRED FIELDS (must be mapped)
  { value: 'name', label: 'Organization Name' },
  { value: 'type', label: 'Organization Type (customer/distributor/etc.)' },
  { value: 'priority', label: 'Priority Level (A/B/C/D)' },
  { value: 'segment', label: 'Business Segment' },

  // CONTACT INFORMATION
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },

  // ADDRESS FIELDS
  { value: 'address_line_1', label: 'Address Line 1' },
  { value: 'address_line_2', label: 'Address Line 2' },
  { value: 'city', label: 'City' },
  { value: 'state_province', label: 'State/Province' },
  { value: 'postal_code', label: 'ZIP/Postal Code' },
  { value: 'country', label: 'Country' },

  // MANAGER FIELDS
  { value: 'primary_manager_name', label: 'Primary Manager' },
  { value: 'secondary_manager_name', label: 'Secondary Manager' },

  // CONTACT PERSON FIELDS
  { value: 'contact_name', label: 'Contact: Full Name' },
  { value: 'contact_email', label: 'Contact: Email' },
  { value: 'contact_phone', label: 'Contact: Phone' },
  { value: 'contact_title', label: 'Contact: Job Title' },

  // OPTIONAL FIELDS
  { value: 'is_active', label: 'Active Status (true/false)' },
  { value: 'notes', label: 'Notes' },
  { value: 'import_notes', label: 'Import Notes' },

  // UTILITY
  { value: 'skip', label: 'Skip this field' },
]

export function TemplateMatchingImport() {
  // State management
  const [currentState, setCurrentState] = useState<ImportState>('upload')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hooks
  const { importState, importOrganizations, resetImport } = useImportProgress()

  // AI field mapping
  const generateAIMappings = useCallback(async (headers: string[], rows: CsvRowData[]) => {
    if (!isOpenAIAvailable()) {
      // Fallback to basic mapping
      return headers.map((header) => ({
        csvColumn: header,
        mapsTo: detectFieldMapping(header),
        confidence: 50,
      }))
    }

    try {
      const aiResponse = await suggestFieldMappings(headers, rows.slice(0, 3), 'organization')
      return headers.map((header) => {
        const aiMapping = aiResponse.mappings.find(
          (m) => m.header.toLowerCase() === header.toLowerCase()
        )
        return {
          csvColumn: header,
          mapsTo: aiMapping?.suggestedField || detectFieldMapping(header),
          confidence: aiMapping?.confidence ? Math.round(aiMapping.confidence * 100) : 50,
        }
      })
    } catch (error) {
      // AI mapping failed, using fallback field detection
      return headers.map((header) => ({
        csvColumn: header,
        mapsTo: detectFieldMapping(header),
        confidence: 50,
      }))
    }
  }, [])

  // Basic field detection fallback
  const detectFieldMapping = (header: string): string | null => {
    const h = header.toLowerCase().trim()

    // Organization name variations
    if (
      h.includes('organization') ||
      h.includes('company') ||
      h.includes('customer') ||
      h.includes('business') ||
      h === 'name' ||
      h.includes('account')
    ) {
      return 'name'
    }

    // Address variations
    if (h.includes('address') && !h.includes('email')) return 'address_line_1'
    if (h.includes('street')) return 'address_line_1'
    if (h.includes('city')) return 'city'
    if (h.includes('state') || h.includes('province')) return 'state_province'
    if (h.includes('zip') || h.includes('postal')) return 'postal_code'

    // Contact info
    if (h.includes('phone') || h.includes('tel')) return 'phone'
    if (h.includes('email'))
      return h.includes('contact') || h.includes('attendee') ? 'contact_email' : 'email'
    if (h.includes('website') || h.includes('linkedin')) return 'website'

    // Contact names
    if (h.includes('attendee') || h.includes('contact')) return 'contact_name'

    // Notes and misc
    if (h.includes('note') || h.includes('comment') || h.includes('booth')) return 'import_notes'

    return null
  }

  // Helper functions for smart row detection (from useFileUpload)
  const hasContent = useCallback((row: string[]): boolean => {
    return row.some((cell) => cell && cell.trim().length > 0)
  }, [])

  const findDataStartRow = useCallback(
    (allRows: string[][]): number => {
      // Look for the actual header row (not just first content)
      for (let i = 0; i < Math.min(allRows.length, 10); i++) {
        const row = allRows[i]
        const nonEmptyCount = row.filter((cell) => cell && cell.trim()).length

        if (nonEmptyCount > 3) {
          // Check if this row contains Excel formulas (skip these)
          const hasFormulas = row.some((cell) => cell && cell.startsWith('='))
          // Check if this row contains business terms that indicate headers
          const hasBusinessTerms = row.some(
            (cell) =>
              cell &&
              (cell.toLowerCase().includes('organization') ||
                cell.toLowerCase().includes('priority') ||
                cell.toLowerCase().includes('segment') ||
                cell.toLowerCase().includes('manager') ||
                cell.toLowerCase().includes('phone') ||
                cell.toLowerCase().includes('address') ||
                cell.toLowerCase().includes('email'))
          )

          if (!hasFormulas && hasBusinessTerms) {
            return i
          }
        }
      }

      // Fallback to first content row
      for (let i = 0; i < allRows.length; i++) {
        if (hasContent(allRows[i])) {
          return i
        }
      }
      return 0
    },
    [hasContent]
  )

  // Clean and filter headers
  const cleanHeaders = useCallback((rawHeaders: string[]): string[] => {
    return rawHeaders
      .map((header) => {
        if (!header || header.trim() === '') return null
        // Clean multi-line headers and special characters
        return header
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .replace(/\r/g, ' ') // Replace carriage returns
          .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
          .trim()
      })
      .filter((header) => {
        // Remove empty headers and auto-generated numeric headers
        return (
          header &&
          header !== '' &&
          !header.match(/^_\d+$/) && // Remove _1, _2, _3 etc.
          header.length > 0
        )
      }) as string[]
  }, [])

  // File upload handler with smart parsing
  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null)

      try {
        const Papa = (await import('papaparse')).default

        // First pass: Read without headers to find data start
        Papa.parse<string[]>(file, {
          header: false,
          skipEmptyLines: false, // Keep empty lines for analysis
          complete: (firstPass) => {
            try {
              const allRows = firstPass.data
              const dataStartIndex = findDataStartRow(allRows)

              if (dataStartIndex >= allRows.length) {
                setError('No data found in CSV file. Please check your file contains valid data.')
                return
              }

              // Get header row and clean it
              const rawHeaderRow = allRows[dataStartIndex]
              const cleanedHeaders = cleanHeaders(rawHeaderRow)

              if (cleanedHeaders.length === 0) {
                setError('No valid column headers found. Please check your CSV file format.')
                return
              }

              // Create cleaned CSV content for second pass
              const dataRows = allRows.slice(dataStartIndex + 1)
              const csvContent = [
                cleanedHeaders.join(','),
                ...dataRows
                  .filter((row) => hasContent(row))
                  .map((row) => {
                    // Only take the columns that correspond to our cleaned headers
                    const cleanedRow = row.slice(0, rawHeaderRow.length).filter((_, index) => {
                      const header = rawHeaderRow[index]
                      return header && header.trim() !== '' && !header.match(/^_\d+$/)
                    })
                    return cleanedRow
                      .map((cell) => `"${(cell || '').replace(/"/g, '""')}"`)
                      .join(',')
                  }),
              ].join('\n')

              // Second pass: Parse cleaned CSV with headers
              const blob = new Blob([csvContent], { type: 'text/csv' })
              const tempFile = new File([blob], file.name, { type: 'text/csv' })

              Papa.parse<Record<string, string>>(tempFile, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                  try {
                    const headers = results.meta.fields || []
                    const rows = results.data.filter((row) =>
                      Object.values(row).some((value) => value && value.trim().length > 0)
                    )

                    const parsed: ParsedData = {
                      headers,
                      rows,
                      validRows: [], // Will be populated after mapping
                      invalidRows: [],
                    }

                    setParsedData(parsed)

                    // Generate AI field mappings
                    const mappings = await generateAIMappings(headers, rows)
                    setFieldMappings(mappings)

                    setCurrentState('mapping')
                  } catch (error) {
                    setError('Failed to process CSV data. Please check the file format.')
                  }
                },
                error: (error) => {
                  setError(`CSV parsing error: ${error.message}`)
                },
              })
            } catch (error) {
              setError('Failed to analyze CSV structure. Please check the file format.')
            }
          },
          error: (error) => {
            setError(`CSV parsing error: ${error.message}`)
          },
        })
      } catch (error) {
        setError('Failed to process file. Please try again.')
      }
    },
    [generateAIMappings, findDataStartRow, hasContent, cleanHeaders]
  )

  // File input handlers
  const handleBrowseClick = () => fileInputRef.current?.click()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  // Mapping handlers
  const updateFieldMapping = (csvColumn: string, crmField: string | null) => {
    setFieldMappings((prev) =>
      prev.map((mapping) =>
        mapping.csvColumn === csvColumn ? { ...mapping, mapsTo: crmField } : mapping
      )
    )
  }

  const proceedToPreview = () => {
    // Validate that we have at least organization name mapped
    const hasOrgName = fieldMappings.some((m) => m.mapsTo === 'name')
    if (!hasOrgName) {
      setError(
        'Organization Name is required. Please map at least one column to Organization Name.'
      )
      return
    }
    setCurrentState('preview')
  }

  const startImport = async () => {
    if (!parsedData) return

    setCurrentState('importing')

    // Transform data based on mappings
    const validRows = parsedData.rows.map((row) => {
      const transformed: TransformedOrganizationRow = {
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
        import_notes: null,
        is_active: true,
      }

      fieldMappings.forEach((mapping) => {
        if (mapping.mapsTo && mapping.mapsTo !== 'skip') {
          const value = row[mapping.csvColumn]?.trim()
          if (value) {
            if (mapping.mapsTo.startsWith('contact_')) {
              // Handle contact fields separately in the future - skip for now
              return
            }

            // Type-safe assignment to known fields
            switch (mapping.mapsTo) {
              case 'name':
                transformed.name = value
                break
              case 'type': {
                // Validate organization type enum values
                const validTypes = [
                  'customer',
                  'principal',
                  'distributor',
                  'prospect',
                  'vendor',
                ] as const
                transformed.type = validTypes.includes(value as (typeof validTypes)[number])
                  ? (value as 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor')
                  : 'customer' // Default fallback
                break
              }
              case 'priority':
                transformed.priority = value as 'A' | 'B' | 'C' | 'D'
                break
              case 'segment':
                transformed.segment = value
                break
              case 'website':
                transformed.website = value
                break
              case 'phone':
                transformed.phone = value
                break
              case 'address_line_1':
                transformed.address_line_1 = value
                break
              case 'city':
                transformed.city = value
                break
              case 'state_province':
                transformed.state_province = value
                break
              case 'postal_code':
                transformed.postal_code = value
                break
              case 'country':
                transformed.country = value
                break
              case 'notes':
                transformed.notes = value
                break
              case 'primary_manager_name':
                transformed.primary_manager_name = value
                break
              case 'secondary_manager_name':
                transformed.secondary_manager_name = value
                break
              default:
                // For any unmapped fields, store in import_notes
                if (!transformed.import_notes) {
                  transformed.import_notes = `${mapping.mapsTo}: ${value}`
                } else {
                  transformed.import_notes += `; ${mapping.mapsTo}: ${value}`
                }
            }
          }
        }
      })

      // Ensure we have a name
      if (!transformed.name) {
        transformed.name = 'Unnamed Organization'
      }

      return transformed
    })

    try {
      await importOrganizations(validRows)
      setCurrentState('complete')
    } catch (error) {
      setError('Import failed. Please try again.')
      setCurrentState('preview')
    }
  }

  const resetWizard = () => {
    setCurrentState('upload')
    setParsedData(null)
    setFieldMappings([])
    setError(null)
    resetImport()
  }

  // Template .badge styling - removed as it's now inline

  // Step indicator component matching template .step-indicator
  const StepIndicator = () => (
    <div className="mb-8 flex items-center gap-2 text-sm">
      <span
        className={`flex items-center gap-2 ${
          currentState === 'upload'
            ? 'font-medium text-success'
            : ['mapping', 'preview', 'importing', 'complete'].includes(currentState)
              ? 'text-success'
              : 'text-muted-foreground'
        }`}
      >
        1. Upload {['mapping', 'preview', 'importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-muted-foreground">›</span>
      <span
        className={`flex items-center gap-2 ${
          currentState === 'mapping'
            ? 'font-medium text-success'
            : ['preview', 'importing', 'complete'].includes(currentState)
              ? 'text-success'
              : 'text-muted-foreground'
        }`}
      >
        2. Map Fields {['preview', 'importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-muted-foreground">›</span>
      <span
        className={`flex items-center gap-2 ${
          currentState === 'preview'
            ? 'font-medium text-success'
            : ['importing', 'complete'].includes(currentState)
              ? 'text-success'
              : 'text-muted-foreground'
        }`}
      >
        3. Review {['importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-muted-foreground">›</span>
      <span
        className={`flex items-center gap-2 ${
          currentState === 'importing'
            ? 'font-medium text-success'
            : currentState === 'complete'
              ? 'text-success'
              : 'text-muted-foreground'
        }`}
      >
        4. Import {currentState === 'complete' && '✓'}
      </span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <StepIndicator />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* STATE 1: UPLOAD - Template .card */}
      {currentState === 'upload' && (
        <div className="rounded-lg border border-border bg-card">
          {/* Template .card-header */}
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-2 text-base font-semibold text-card-foreground">
              <span>📊</span>
              Organizations + Contacts
              <span className="inline-block rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Enhanced
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Import organizations and their contacts from a single CSV file. Supports multiple
              contacts per organization with smart field mapping.
            </p>
          </div>
          {/* Template .card-content */}
          <div className="p-6">
            <Button
              onClick={handleBrowseClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
            >
              <span>⬆</span> Import Organizations + Contacts
            </Button>
          </div>
        </div>
      )}

      {/* STATE 2: FIELD MAPPING - Template .card */}
      {currentState === 'mapping' && (
        <div className="rounded-lg border border-border bg-card">
          {/* Template .card-header */}
          <div className="border-b border-border px-6 py-5">
            <div className="text-base font-semibold text-card-foreground">Field Mapping</div>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ve detected your CSV columns. Confirm or adjust the mapping below.
            </p>
          </div>
          {/* Template .card-content */}
          <div className="p-6">
            {/* Template .table */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border bg-muted p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    CSV Column
                  </th>
                  <th className="border-b border-border bg-muted p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Maps To
                  </th>
                  <th className="border-b border-border bg-muted p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {fieldMappings.map((mapping, idx) => (
                  <tr key={`${mapping.csvColumn}-${idx}`}>
                    <td className="border-b border-border p-3 text-sm font-medium">
                      {mapping.csvColumn}
                    </td>
                    <td className="border-b border-border p-3">
                      <Select
                        value={mapping.mapsTo || 'skip'}
                        onValueChange={(value) =>
                          updateFieldMapping(mapping.csvColumn, value === 'skip' ? null : value)
                        }
                      >
                        <SelectTrigger className="min-w-48 rounded-md border border-border bg-background px-3 py-2 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CRM_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border-b border-border p-3">
                      <span
                        className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${
                          mapping.confidence >= 85
                            ? 'bg-success/10 text-success'
                            : mapping.confidence >= 45
                              ? 'bg-warning/10 text-warning-foreground'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {mapping.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Template .card-footer */}
          <div className="flex justify-between border-t border-border px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setCurrentState('upload')}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              Back
            </Button>
            <Button
              onClick={proceedToPreview}
              className="rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
            >
              Continue to Review
            </Button>
          </div>
        </div>
      )}

      {/* STATE 3: PREVIEW - Template .card */}
      {currentState === 'preview' && parsedData && (
        <div className="rounded-lg border border-border bg-card">
          {/* Template .card-header */}
          <div className="border-b border-border px-6 py-5">
            <div className="text-base font-semibold">Preview</div>
            <p className="mt-1 text-sm text-muted-foreground">First 5 records from your file</p>
          </div>
          {/* Template .card-content */}
          <div className="p-6">
            {/* Template .alert */}
            <div className="mb-4 flex gap-3 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
              <span className="text-info">ℹ</span>
              <div>
                <strong>Summary:</strong> {parsedData.rows.length} new organizations will be created
              </div>
            </div>

            {/* Template .table */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border bg-muted p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Status
                  </th>
                  <th className="border-b border-border bg-muted p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Organization
                  </th>
                  <th className="border-b border-border bg-muted p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Contact
                  </th>
                  <th className="border-b border-border bg-muted p-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.slice(0, 5).map((row, idx) => {
                  const orgName = fieldMappings.find((m) => m.mapsTo === 'name')?.csvColumn
                  const contactName = fieldMappings.find(
                    (m) => m.mapsTo === 'contact_name'
                  )?.csvColumn

                  return (
                    <tr key={idx}>
                      <td className="border-b border-gray-100 p-3 text-sm">
                        <span className="inline-block size-4 text-center text-xs leading-4 text-success">
                          ✓
                        </span>
                      </td>
                      <td className="border-b border-border p-3 text-sm">
                        {orgName ? row[orgName] : 'Unnamed'}
                      </td>
                      <td className="border-b border-border p-3 text-sm">
                        {contactName ? row[contactName] || '-' : '-'}
                      </td>
                      <td className="border-b border-border p-3">
                        <span className="inline-block rounded border bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          Create
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Template .card-footer */}
          <div className="flex justify-between border-t border-border px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setCurrentState('mapping')}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              Back to Mapping
            </Button>
            <Button
              onClick={startImport}
              className="rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
            >
              Import {parsedData.rows.length} Records
            </Button>
          </div>
        </div>
      )}

      {/* STATE 4: IMPORTING - Template .card */}
      {currentState === 'importing' && (
        <div className="rounded-lg border border-border bg-card">
          {/* Template .card-content */}
          <div className="p-6">
            {/* Template .progress-container */}
            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                <span>Creating organizations...</span>
                <span>{importState.importProgress}%</span>
              </div>
              {/* Template .progress-bar */}
              <div className="h-2 overflow-hidden rounded bg-muted">
                <div
                  className="h-full bg-success"
                  style={{ width: `${importState.importProgress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Processing your data with duplicate detection and conflict resolution...
            </p>
            {importState.error && (
              <Alert className="mt-4 border-destructive/20 bg-destructive/10">
                <X className="size-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <strong>Import Error:</strong> {importState.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* STATE 5: COMPLETE - Template .card */}
      {currentState === 'complete' && (
        <div className="rounded-lg border border-border bg-card">
          {/* Template .card-content with centered styling */}
          <div className="p-12 text-center">
            <div className="mb-4 text-5xl">{importState.importResult?.success ? '✓' : '⚠️'}</div>
            <h2 className="mb-2 text-xl font-semibold">
              {importState.importResult?.success
                ? 'Import Complete'
                : 'Import Completed with Issues'}
            </h2>
            <div className="mb-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  {importState.importResult?.message || 'Import completed'}
                </p>

                {/* Skipped Records Section */}
                {importState.importResult?.skipped && importState.importResult.skipped > 0 && (
                  <details className="mx-auto max-w-md text-left">
                    <summary className="cursor-pointer text-sm font-medium text-warning-foreground">
                      View Skipped Organizations ({importState.importResult.skipped} already exist)
                    </summary>
                    <div className="mt-2 max-h-32 overflow-y-auto rounded border bg-warning/10 p-3">
                      {importState.importResult.skippedRecords?.map((record, idx) => (
                        <div key={idx} className="mb-1 text-xs text-warning-foreground">
                          <span className="font-medium">{record.name}</span> ({record.type}) - Row{' '}
                          {record.rowIndex}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Error Details Section */}
                {importState.importResult?.errors && importState.importResult.errors.length > 0 && (
                  <details className="mx-auto max-w-md text-left">
                    <summary className="cursor-pointer text-sm font-medium text-destructive">
                      View Error Details ({importState.importResult.errors.length} errors)
                    </summary>
                    <div className="mt-2 max-h-32 overflow-y-auto rounded border bg-destructive/10 p-3">
                      {importState.importResult.errors.map((err, idx) => (
                        <div key={idx} className="mb-1 text-xs text-destructive">
                          <span className="font-medium">Row {err.row}:</span>{' '}
                          {'error' in err ? err.error : err.message}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/organizations')}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground"
              >
                View Organizations
              </Button>
              <Button
                onClick={resetWizard}
                className="rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
              >
                Import More
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
