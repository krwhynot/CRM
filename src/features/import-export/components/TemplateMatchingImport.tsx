import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useFileUpload, type ParsedData } from '@/hooks/useFileUpload'
import { useImportProgress } from '@/features/import-export/hooks/useImportProgress'
import { suggestFieldMappings, isOpenAIAvailable } from '@/lib/openai'
import { Info, CheckCircle2, X } from 'lucide-react'

// Import state matching the 5 wireframe states
type ImportState = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

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
  { value: 'skip', label: 'Skip this field' }
]

export function TemplateMatchingImport() {
  // State management
  const [currentState, setCurrentState] = useState<ImportState>('upload')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hooks
  const { downloadTemplate } = useFileUpload()
  const { importState, importOrganizations, resetImport } = useImportProgress()

  // AI field mapping
  const generateAIMappings = useCallback(async (headers: string[], rows: any[]) => {
    if (!isOpenAIAvailable()) {
      // Fallback to basic mapping
      return headers.map(header => ({
        csvColumn: header,
        mapsTo: detectFieldMapping(header),
        confidence: 50
      }))
    }

    try {
      const aiResponse = await suggestFieldMappings(headers, rows.slice(0, 3), 'organization')
      return headers.map(header => {
        const aiMapping = aiResponse.mappings.find(m => 
          m.header.toLowerCase() === header.toLowerCase()
        )
        return {
          csvColumn: header,
          mapsTo: aiMapping?.suggestedField || detectFieldMapping(header),
          confidence: aiMapping?.confidence ? Math.round(aiMapping.confidence * 100) : 50
        }
      })
    } catch (error) {
      console.warn('AI mapping failed, using fallback', error)
      return headers.map(header => ({
        csvColumn: header,
        mapsTo: detectFieldMapping(header),
        confidence: 50
      }))
    }
  }, [])

  // Basic field detection fallback
  const detectFieldMapping = (header: string): string | null => {
    const h = header.toLowerCase().trim()
    
    // Organization name variations
    if (h.includes('organization') || h.includes('company') || h.includes('customer') || 
        h.includes('business') || h === 'name' || h.includes('account')) {
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
    if (h.includes('email')) return h.includes('contact') || h.includes('attendee') ? 'contact_email' : 'email'
    if (h.includes('website') || h.includes('linkedin')) return 'website'
    
    // Contact names
    if (h.includes('attendee') || h.includes('contact')) return 'contact_name'
    
    // Notes and misc
    if (h.includes('note') || h.includes('comment') || h.includes('booth')) return 'import_notes'
    
    return null
  }

  // Helper functions for smart row detection (from useFileUpload)
  const hasContent = useCallback((row: string[]): boolean => {
    return row.some(cell => cell && cell.trim().length > 0)
  }, [])

  const findDataStartRow = useCallback((allRows: string[][]): number => {
    // Look for the actual header row (not just first content)
    for (let i = 0; i < Math.min(allRows.length, 10); i++) {
      const row = allRows[i]
      const nonEmptyCount = row.filter(cell => cell && cell.trim()).length
      
      if (nonEmptyCount > 3) {
        // Check if this row contains Excel formulas (skip these)
        const hasFormulas = row.some(cell => cell && cell.startsWith('='))
        // Check if this row contains business terms that indicate headers
        const hasBusinessTerms = row.some(cell => 
          cell && (
            cell.toLowerCase().includes('organization') ||
            cell.toLowerCase().includes('priority') ||
            cell.toLowerCase().includes('segment') ||
            cell.toLowerCase().includes('manager') ||
            cell.toLowerCase().includes('phone') ||
            cell.toLowerCase().includes('address') ||
            cell.toLowerCase().includes('email')
          )
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
  }, [hasContent])

  // Clean and filter headers
  const cleanHeaders = useCallback((rawHeaders: string[]): string[] => {
    return rawHeaders
      .map(header => {
        if (!header || header.trim() === '') return null
        // Clean multi-line headers and special characters
        return header
          .replace(/\n/g, ' ')  // Replace newlines with spaces
          .replace(/\r/g, ' ')  // Replace carriage returns
          .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
          .trim()
      })
      .filter(header => {
        // Remove empty headers and auto-generated numeric headers
        return header && 
               header !== '' && 
               !header.match(/^_\d+$/) && // Remove _1, _2, _3 etc.
               header.length > 0
      }) as string[]
  }, [])

  // File upload handler with smart parsing
  const handleFileUpload = useCallback(async (file: File) => {
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
                .filter(row => hasContent(row))
                .map(row => {
                  // Only take the columns that correspond to our cleaned headers
                  const cleanedRow = row.slice(0, rawHeaderRow.length)
                    .filter((_, index) => {
                      const header = rawHeaderRow[index]
                      return header && header.trim() !== '' && !header.match(/^_\d+$/)
                    })
                  return cleanedRow.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')
                })
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
                  const rows = results.data.filter(row => 
                    Object.values(row).some(value => value && value.trim().length > 0)
                  )
                  
                  const parsed: ParsedData = {
                    headers,
                    rows,
                    validRows: [], // Will be populated after mapping
                    invalidRows: []
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
              }
            })
          } catch (error) {
            setError('Failed to analyze CSV structure. Please check the file format.')
          }
        },
        error: (error) => {
          setError(`CSV parsing error: ${error.message}`)
        }
      })
    } catch (error) {
      setError('Failed to process file. Please try again.')
    }
  }, [generateAIMappings, findDataStartRow, hasContent, cleanHeaders])

  // File input handlers
  const handleBrowseClick = () => fileInputRef.current?.click()
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      handleFileUpload(file)
    }
  }

  // Mapping handlers
  const updateFieldMapping = (csvColumn: string, crmField: string | null) => {
    setFieldMappings(prev => 
      prev.map(mapping => 
        mapping.csvColumn === csvColumn 
          ? { ...mapping, mapsTo: crmField }
          : mapping
      )
    )
  }

  const proceedToPreview = () => {
    // Validate that we have at least organization name mapped
    const hasOrgName = fieldMappings.some(m => m.mapsTo === 'name')
    if (!hasOrgName) {
      setError('Organization Name is required. Please map at least one column to Organization Name.')
      return
    }
    setCurrentState('preview')
  }

  const startImport = async () => {
    if (!parsedData) return
    
    setCurrentState('importing')
    
    // Transform data based on mappings
    const validRows = parsedData.rows.map(row => {
      const transformed: any = {
        name: '',
        type: 'customer',
        priority: 'C',
        segment: 'General',
        is_active: true
      }
      
      fieldMappings.forEach(mapping => {
        if (mapping.mapsTo && mapping.mapsTo !== 'skip') {
          const value = row[mapping.csvColumn]?.trim()
          if (value) {
            if (mapping.mapsTo.startsWith('contact_')) {
              // Handle contact fields separately in the future
              transformed[mapping.mapsTo] = value
            } else {
              transformed[mapping.mapsTo] = value
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
    <div className="flex items-center gap-2 mb-8 text-sm">
      <span className={`flex items-center gap-2 ${
        currentState === 'upload' ? 'text-emerald-500 font-medium' : 
        ['mapping', 'preview', 'importing', 'complete'].includes(currentState) ? 'text-emerald-500' : 
        'text-gray-500'
      }`}>
        1. Upload {['mapping', 'preview', 'importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-gray-400">›</span>
      <span className={`flex items-center gap-2 ${
        currentState === 'mapping' ? 'text-emerald-500 font-medium' : 
        ['preview', 'importing', 'complete'].includes(currentState) ? 'text-emerald-500' : 
        'text-gray-500'
      }`}>
        2. Map Fields {['preview', 'importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-gray-400">›</span>
      <span className={`flex items-center gap-2 ${
        currentState === 'preview' ? 'text-emerald-500 font-medium' : 
        ['importing', 'complete'].includes(currentState) ? 'text-emerald-500' : 
        'text-gray-500'
      }`}>
        3. Review {['importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-gray-400">›</span>
      <span className={`flex items-center gap-2 ${
        currentState === 'importing' ? 'text-emerald-500 font-medium' : 
        currentState === 'complete' ? 'text-emerald-500' : 
        'text-gray-500'
      }`}>
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
        <div className="border border-gray-200 rounded-lg bg-white">
          {/* Template .card-header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-2 text-base font-semibold">
              <span>📊</span>
              Organizations + Contacts
              <span className="px-2 py-0.5 text-xs font-medium border border-gray-200 rounded bg-white inline-block">Enhanced</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Import organizations and their contacts from a single CSV file. 
              Supports multiple contacts per organization with smart field mapping.
            </p>
          </div>
          {/* Template .card-content */}
          <div className="p-6">
            <Button 
              onClick={handleBrowseClick} 
              className="w-full justify-center bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md text-sm font-medium inline-flex items-center gap-2"
            >
              <span>⬆</span> Import Organizations + Contacts
            </Button>
          </div>
        </div>
      )}

      {/* STATE 2: FIELD MAPPING - Template .card */}
      {currentState === 'mapping' && (
        <div className="border border-gray-200 rounded-lg bg-white">
          {/* Template .card-header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="text-base font-semibold">Field Mapping</div>
            <p className="text-sm text-gray-500 mt-1">We've detected your CSV columns. Confirm or adjust the mapping below.</p>
          </div>
          {/* Template .card-content */}
          <div className="p-6">
            {/* Template .table */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">CSV Column</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">Maps To</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {fieldMappings.map((mapping, idx) => (
                  <tr key={mapping.csvColumn}>
                    <td className="py-3 px-3 text-sm font-medium border-b border-gray-100">{mapping.csvColumn}</td>
                    <td className="py-3 px-3 border-b border-gray-100">
                      <Select value={mapping.mapsTo || 'skip'} onValueChange={(value) => updateFieldMapping(mapping.csvColumn, value === 'skip' ? null : value)}>
                        <SelectTrigger className="py-2 px-3 border border-gray-200 rounded-md bg-white text-sm min-w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CRM_FIELDS.map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-3 border-b border-gray-100">
                      <span className={`py-0.5 px-2 text-xs font-medium rounded border inline-block ${
                        mapping.confidence >= 85 ? 'bg-green-100 text-green-800' :
                        mapping.confidence >= 45 ? 'bg-yellow-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {mapping.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Template .card-footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentState('upload')} className="py-2 px-4 border border-gray-200 bg-white text-gray-700 rounded-md text-sm font-medium">Back</Button>
            <Button onClick={proceedToPreview} className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm font-medium">Continue to Review</Button>
          </div>
        </div>
      )}

      {/* STATE 3: PREVIEW - Template .card */}
      {currentState === 'preview' && parsedData && (
        <div className="border border-gray-200 rounded-lg bg-white">
          {/* Template .card-header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="text-base font-semibold">Preview</div>
            <p className="text-sm text-gray-500 mt-1">First 5 records from your file</p>
          </div>
          {/* Template .card-content */}
          <div className="p-6">
            {/* Template .alert */}
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50 mb-4 flex gap-3 text-sm">
              <span className="text-emerald-500">ℹ</span>
              <div>
                <strong>Summary:</strong> {parsedData.rows.length} new organizations will be created
              </div>
            </div>
            
            {/* Template .table */}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">Organization</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">Contact</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase bg-gray-50 border-b border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.slice(0, 5).map((row, idx) => {
                  const orgName = fieldMappings.find(m => m.mapsTo === 'name')?.csvColumn
                  const contactName = fieldMappings.find(m => m.mapsTo === 'contact_name')?.csvColumn
                  
                  return (
                    <tr key={idx}>
                      <td className="py-3 px-3 text-sm border-b border-gray-100">
                        <span className="inline-block w-4 h-4 leading-4 text-center text-xs text-emerald-500">✓</span>
                      </td>
                      <td className="py-3 px-3 text-sm border-b border-gray-100">{orgName ? row[orgName] : 'Unnamed'}</td>
                      <td className="py-3 px-3 text-sm border-b border-gray-100">{contactName ? row[contactName] || '-' : '-'}</td>
                      <td className="py-3 px-3 border-b border-gray-100">
                        <span className="py-0.5 px-2 text-xs font-medium bg-green-100 text-green-800 rounded border inline-block">Create</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Template .card-footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentState('mapping')} className="py-2 px-4 border border-gray-200 bg-white text-gray-700 rounded-md text-sm font-medium">Back to Mapping</Button>
            <Button onClick={startImport} className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm font-medium">
              Import {parsedData.rows.length} Records
            </Button>
          </div>
        </div>
      )}

      {/* STATE 4: IMPORTING - Template .card */}
      {currentState === 'importing' && (
        <div className="border border-gray-200 rounded-lg bg-white">
          {/* Template .card-content */}
          <div className="p-6">
            {/* Template .progress-container */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Creating organizations...</span>
                <span>{importState.importProgress}%</span>
              </div>
              {/* Template .progress-bar */}
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-emerald-500" style={{width: `${importState.importProgress}%`}}></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Processing your data with duplicate detection and conflict resolution...
            </p>
            {importState.error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <X className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  <strong>Import Error:</strong> {importState.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* STATE 5: COMPLETE - Template .card */}
      {currentState === 'complete' && (
        <div className="border border-gray-200 rounded-lg bg-white">
          {/* Template .card-content with centered styling */}
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">
              {importState.importResult?.success ? '✓' : '⚠️'}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {importState.importResult?.success ? 'Import Complete' : 'Import Completed with Issues'}
            </h2>
            <div className="mb-6">
              <div className="space-y-2">
                <p className="text-gray-500">
                  {importState.importResult?.message || 'Import completed'}
                </p>
                
                {/* Skipped Records Section */}
                {importState.importResult?.skipped && importState.importResult.skipped > 0 && (
                  <details className="text-left max-w-md mx-auto">
                    <summary className="cursor-pointer text-orange-600 text-sm font-medium">
                      View Skipped Organizations ({importState.importResult.skipped} already exist)
                    </summary>
                    <div className="mt-2 p-3 bg-orange-50 rounded border max-h-32 overflow-y-auto">
                      {importState.importResult.skippedRecords?.map((record, idx) => (
                        <div key={idx} className="text-xs text-orange-700 mb-1">
                          <span className="font-medium">{record.name}</span> ({record.type}) - Row {record.rowIndex}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Error Details Section */}
                {importState.importResult?.errors && importState.importResult.errors.length > 0 && (
                  <details className="text-left max-w-md mx-auto">
                    <summary className="cursor-pointer text-red-600 text-sm font-medium">
                      View Error Details ({importState.importResult.errors.length} errors)
                    </summary>
                    <div className="mt-2 p-3 bg-red-50 rounded border max-h-32 overflow-y-auto">
                      {importState.importResult.errors.map((err, idx) => (
                        <div key={idx} className="text-xs text-red-700 mb-1">
                          <span className="font-medium">Row {err.row}:</span> {err.error}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = '/organizations'} className="py-2 px-4 border border-gray-200 bg-white text-gray-700 rounded-md text-sm font-medium">
                View Organizations
              </Button>
              <Button onClick={resetWizard} className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm font-medium">
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