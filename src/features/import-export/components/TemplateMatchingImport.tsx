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

// Available CRM fields
const CRM_FIELDS = [
  { value: 'name', label: 'Organization Name' },
  { value: 'address_line_1', label: 'Address Line 1' },
  { value: 'address_line_2', label: 'Address Line 2' },
  { value: 'city', label: 'City' },
  { value: 'state_province', label: 'State/Province' },
  { value: 'postal_code', label: 'ZIP/Postal Code' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
  { value: 'notes', label: 'Notes' },
  { value: 'contact_name', label: 'Contact: Full Name' },
  { value: 'contact_email', label: 'Contact: Email' },
  { value: 'import_notes', label: 'Import Notes' },
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

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    setError(null)
    
    try {
      // Parse CSV
      const Papa = (await import('papaparse')).default
      
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.toLowerCase().trim(),
        complete: async (results) => {
          const headers = results.meta.fields || []
          const rows = results.data
          
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
        },
        error: (error) => {
          setError(`CSV parsing error: ${error.message}`)
        }
      })
    } catch (error) {
      setError('Failed to process file. Please try again.')
    }
  }, [generateAIMappings])

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

  // Get confidence badge styling
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8 text-sm">
      <span className={currentState === 'upload' ? 'text-green-600 font-medium' : currentState !== 'upload' ? 'text-green-600' : 'text-gray-500'}>
        1. Upload {['mapping', 'preview', 'importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-gray-400">›</span>
      <span className={currentState === 'mapping' ? 'text-green-600 font-medium' : ['preview', 'importing', 'complete'].includes(currentState) ? 'text-green-600' : 'text-gray-500'}>
        2. Map Fields {['preview', 'importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-gray-400">›</span>
      <span className={currentState === 'preview' ? 'text-green-600 font-medium' : ['importing', 'complete'].includes(currentState) ? 'text-green-600' : 'text-gray-500'}>
        3. Review {['importing', 'complete'].includes(currentState) && '✓'}
      </span>
      <span className="text-gray-400">›</span>
      <span className={currentState === 'importing' ? 'text-green-600 font-medium' : currentState === 'complete' ? 'text-green-600' : 'text-gray-500'}>
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

      {/* STATE 1: UPLOAD */}
      {currentState === 'upload' && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h3 className="text-base font-semibold">Organizations + Contacts</h3>
              <span className="px-2 py-0.5 text-xs font-medium border border-gray-200 rounded bg-white">Enhanced</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Import organizations and their contacts from a single CSV file. 
              Supports multiple contacts per organization with smart field mapping.
            </p>
          </div>
          <div className="p-6">
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center bg-gray-50"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="space-y-4">
                <div className="text-4xl">⬆️</div>
                <div>
                  <h4 className="font-medium text-gray-900">Upload CSV File</h4>
                  <p className="text-sm text-gray-600 mt-1">Drag and drop or click to browse</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleBrowseClick} className="bg-green-600 hover:bg-green-700">
                    <span className="mr-2">⬆</span> Import Organizations + Contacts
                  </Button>
                  <Button variant="outline" onClick={downloadTemplate}>
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: FIELD MAPPING */}
      {currentState === 'mapping' && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-base font-semibold">Field Mapping</h3>
            <p className="text-sm text-gray-600 mt-1">We've detected your CSV columns. Confirm or adjust the mapping below.</p>
          </div>
          <div className="p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">CSV Column</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Maps To</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {fieldMappings.map((mapping, idx) => (
                  <tr key={mapping.csvColumn} className="border-b border-gray-100">
                    <td className="p-3 text-sm font-medium">{mapping.csvColumn}</td>
                    <td className="p-3">
                      <Select value={mapping.mapsTo || 'skip'} onValueChange={(value) => updateFieldMapping(mapping.csvColumn, value === 'skip' ? null : value)}>
                        <SelectTrigger className="min-w-48">
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
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getConfidenceBadge(mapping.confidence)}`}>
                        {mapping.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between p-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setCurrentState('upload')}>Back</Button>
            <Button onClick={proceedToPreview} className="bg-green-600 hover:bg-green-700">Continue to Review</Button>
          </div>
        </div>
      )}

      {/* STATE 3: PREVIEW */}
      {currentState === 'preview' && parsedData && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-base font-semibold">Preview</h3>
            <p className="text-sm text-gray-600 mt-1">First 5 records from your file</p>
          </div>
          <div className="p-6">
            <div className="flex gap-3 p-4 border border-gray-200 rounded-md bg-gray-50 mb-4">
              <Info className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <strong>Summary:</strong> {parsedData.rows.length} new organizations will be created
              </div>
            </div>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Status</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Organization</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Contact</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.slice(0, 5).map((row, idx) => {
                  const orgName = fieldMappings.find(m => m.mapsTo === 'name')?.csvColumn
                  const contactName = fieldMappings.find(m => m.mapsTo === 'contact_name')?.csvColumn
                  
                  return (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="p-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </td>
                      <td className="p-3 text-sm">{orgName ? row[orgName] : 'Unnamed'}</td>
                      <td className="p-3 text-sm">{contactName ? row[contactName] || '-' : '-'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded border border-green-200">Create</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between p-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setCurrentState('mapping')}>Back to Mapping</Button>
            <Button onClick={startImport} className="bg-green-600 hover:bg-green-700">
              Import {parsedData.rows.length} Records
            </Button>
          </div>
        </div>
      )}

      {/* STATE 4: IMPORTING */}
      {currentState === 'importing' && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-12">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Creating organizations...</span>
                <span>{importState.importProgress}%</span>
              </div>
              <Progress value={importState.importProgress} className="h-2" />
              <p className="text-sm text-gray-600">
                Processing your data...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATE 5: COMPLETE */}
      {currentState === 'complete' && (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2">Import Complete</h2>
            <p className="text-gray-600 mb-6">
              Successfully imported {importState.importResult?.imported || 0} organizations
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = '/organizations'}>
                View Organizations
              </Button>
              <Button onClick={resetWizard} className="bg-green-600 hover:bg-green-700">
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