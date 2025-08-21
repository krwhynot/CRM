import React, { useState, useCallback, useRef } from 'react'
import Papa from 'papaparse'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for CSV parsing
interface CsvRow {
  [key: string]: string
}

interface ParsedData {
  headers: string[]
  rows: CsvRow[]
  validRows: TransformedOrganizationRow[]
  invalidRows: Array<{ row: CsvRow; errors: string[] }>
}

interface ImportResult {
  success: boolean
  message: string
  imported: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']

interface TransformedOrganizationRow {
  name: string
  type: Database['public']['Enums']['organization_type']
  priority: PriorityValue
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
  [key: string]: string | boolean | null | undefined // Add index signature for dynamic assignment
}

interface FileUploadState {
  file: File | null
  isDragOver: boolean
  isUploading: boolean
  uploadProgress: number
  parsedData: ParsedData | null
  error: string | null
  isImporting: boolean
  importProgress: number
  importResult: ImportResult | null
}

// Excel to PostgreSQL Field Mappings (MVP Hard-coded approach)
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

// Organization types that are valid for CSV import
const VALID_ORGANIZATION_TYPES = ['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const
type ValidOrganizationType = typeof VALID_ORGANIZATION_TYPES[number]

// Expected CSV columns for organizations (MVP simplified)
const EXPECTED_COLUMNS = {
  required: ['organizations'], // Only organization name is required
  optional: Object.keys(EXCEL_FIELD_MAPPINGS).filter(key => key !== 'organizations')
}

export function OrganizationImporter() {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    isDragOver: false,
    isUploading: false,
    uploadProgress: 0,
    parsedData: null,
    error: null,
    isImporting: false,
    importProgress: 0,
    importResult: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file type and size
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Please upload a CSV file (.csv extension)'
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 5MB'
    }

    return null
  }, [])

  // Validate CSV row data (MVP simplified)
  const validateRow = useCallback((row: CsvRow): string[] => {
    const errors: string[] = []

    // Check required fields - only organization name is required for MVP
    if (!row.organizations?.trim()) {
      errors.push('Organization name is required')
    }

    // Validate priority if provided (A, B, C, D only)
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

          // Check for required columns (MVP simplified - only 'organizations' required)
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

          // Validate each row
          const validRows: TransformedOrganizationRow[] = []
          const invalidRows: Array<{ row: CsvRow; errors: string[] }> = []

          rows.forEach((row) => {
            const errors = validateRow(row)
            if (errors.length === 0) {
              // Transform row using MVP field mappings
              const transformedRow: TransformedOrganizationRow = {
                name: '',
                type: 'customer' as Database['public']['Enums']['organization_type'],
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
              
              // Apply hard-coded field mappings
              Object.entries(EXCEL_FIELD_MAPPINGS).forEach(([excelCol, dbField]) => {
                const value = row[excelCol]?.trim()
                if (dbField in transformedRow && value) {
                  // Type-safe assignment with proper null handling
                  if (dbField === 'type') {
                    transformedRow.type = value as Database['public']['Enums']['organization_type']
                  } else if (dbField === 'is_active') {
                    transformedRow.is_active = Boolean(value)
                  } else {
                    // Type-safe assignment for string/null fields using the index signature
                    const key = dbField as keyof TransformedOrganizationRow
                    if (key in transformedRow) {
                      transformedRow[key] = value
                    }
                  }
                }
              })

              // Apply MVP business logic transformations
              if (transformedRow.priority) {
                const upperPriority = transformedRow.priority.toUpperCase()
                transformedRow.priority = PRIORITY_VALUES.includes(upperPriority as PriorityValue) 
                  ? upperPriority as PriorityValue 
                  : 'C' as PriorityValue
              } else {
                transformedRow.priority = 'C' as PriorityValue
              }

              // Determine organization type from DISTRIBUTOR column or segment
              if (row['distributor']?.toLowerCase().includes('distributor') || 
                  row['segment']?.toLowerCase().includes('distributor')) {
                transformedRow.type = 'distributor' as ValidOrganizationType & Database['public']['Enums']['organization_type']
              } else {
                transformedRow.type = 'customer' as ValidOrganizationType & Database['public']['Enums']['organization_type']
              }

              // Set default values
              transformedRow.country = transformedRow.country || 'US'
              transformedRow.segment = transformedRow.segment || 'General'

              // Store unmapped columns in import_notes
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

          const parsedData: ParsedData = {
            headers,
            rows,
            validRows,
            invalidRows,
          }

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

  // Handle file selection
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

  // File input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // Import organizations to database
  const importOrganizations = useCallback(async (validRows: TransformedOrganizationRow[]) => {
    setUploadState(prev => ({
      ...prev,
      isImporting: true,
      importProgress: 0,
      importResult: null,
      error: null,
    }))

    try {
      const batchSize = 50
      const batches = []
      
      // Split data into batches
      for (let i = 0; i < validRows.length; i += batchSize) {
        batches.push(validRows.slice(i, i + batchSize))
      }

      let imported = 0
      let failed = 0
      const errors: Array<{ row: number; error: string }> = []

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        
        try {
          // Get current user for RLS compliance
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            throw new Error('User not authenticated')
          }

          // Prepare data for database insertion with RLS-required audit fields
          const organizationsToInsert: OrganizationInsert[] = batch.map(row => ({
            name: row.name,
            type: row.type,
            priority: row.priority,
            segment: row.segment,
            website: row.website,
            phone: row.phone,
            address_line_1: row.address_line_1,
            city: row.city,
            state_province: row.state_province,
            postal_code: row.postal_code,
            country: row.country,
            notes: row.notes,
            primary_manager_name: row.primary_manager_name,
            secondary_manager_name: row.secondary_manager_name,
            import_notes: row.import_notes,
            is_active: row.is_active,
            created_by: user.id, // Required by RLS policy
            updated_by: user.id, // Required by RLS policy
          }))

          // Insert batch into database
          const { error } = await supabase
            .from('organizations')
            .insert(organizationsToInsert)
            .select('id, name')

          if (error) {
            console.error('Batch import error:', error)
            failed += batch.length
            errors.push({
              row: batchIndex * batchSize + 1,
              error: `Batch ${batchIndex + 1} failed: ${error.message}`
            })
          } else {
            imported += batch.length
          }
        } catch (batchError) {
          console.error('Batch processing error:', batchError)
          failed += batch.length
          errors.push({
            row: batchIndex * batchSize + 1,
            error: `Batch ${batchIndex + 1} failed: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`
          })
        }

        // Update progress
        const progress = Math.round(((batchIndex + 1) / batches.length) * 100)
        setUploadState(prev => ({
          ...prev,
          importProgress: progress,
        }))

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Set final result
      const result: ImportResult = {
        success: failed === 0,
        message: failed === 0 
          ? `Successfully imported ${imported} organizations` 
          : `Imported ${imported} organizations, ${failed} failed`,
        imported,
        failed,
        errors
      }

      setUploadState(prev => ({
        ...prev,
        isImporting: false,
        importProgress: 100,
        importResult: result,
      }))

    } catch (error) {
      console.error('Import error:', error)
      setUploadState(prev => ({
        ...prev,
        isImporting: false,
        importProgress: 0,
        error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }))
    }
  }, [])

  // Reset upload state
  const resetUpload = useCallback(() => {
    setUploadState({
      file: null,
      isDragOver: false,
      isUploading: false,
      uploadProgress: 0,
      parsedData: null,
      error: null,
      isImporting: false,
      importProgress: 0,
      importResult: null,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Download sample CSV template (MVP format)
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

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Download Template Button */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* Drag and Drop Area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                uploadState.isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400",
                uploadState.file && "border-green-500 bg-green-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="h-6 w-6 text-gray-600" />
                </div>
                
                {uploadState.file ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700">
                      File selected: {uploadState.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Size: {(uploadState.file.size / 1024).toFixed(1)} KB
                    </p>
                    <Button variant="outline" size="sm" onClick={resetUpload}>
                      <X className="h-4 w-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Drag and drop your CSV file here, or{' '}
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        browse to upload
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports CSV files up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Upload Progress */}
            {uploadState.isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing file...</span>
                  <span>{uploadState.uploadProgress}%</span>
                </div>
                <Progress value={uploadState.uploadProgress} className="w-full" />
              </div>
            )}

            {/* Error Display */}
            {uploadState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadState.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parsed Data Results */}
      {uploadState.parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              File Processed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {uploadState.parsedData.rows.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Rows</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadState.parsedData.validRows.length}
                  </div>
                  <div className="text-sm text-gray-600">Valid Rows</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {uploadState.parsedData.invalidRows.length}
                  </div>
                  <div className="text-sm text-gray-600">Invalid Rows</div>
                </div>
              </div>

              {/* Invalid Rows Table */}
              {uploadState.parsedData.invalidRows.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Invalid Rows (Need Correction)
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Errors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadState.parsedData.invalidRows.slice(0, 10).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.row.organizations || '-'}</TableCell>
                            <TableCell>{item.row['priority-focus'] || '-'}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {item.errors.map((error, errorIndex) => (
                                  <Badge key={errorIndex} variant="destructive" className="text-xs">
                                    {error}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {uploadState.parsedData.invalidRows.length > 10 && (
                    <p className="text-sm text-gray-500">
                      Showing first 10 of {uploadState.parsedData.invalidRows.length} invalid rows
                    </p>
                  )}
                </div>
              )}

              {/* Valid Rows Preview */}
              {uploadState.parsedData.validRows.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Valid Rows Preview
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">Organization</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="min-w-[120px]">LinkedIn</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Zip</TableHead>
                            <TableHead className="min-w-[100px]">Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadState.parsedData.validRows.slice(0, 5).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{row.name}</TableCell>
                              <TableCell>
                                <Badge variant={row.priority === 'A' ? 'default' : 'outline'}>{row.priority}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{row.type}</Badge>
                              </TableCell>
                              <TableCell>{row.phone || '-'}</TableCell>
                              <TableCell className="max-w-[120px] truncate">
                                {row.website ? (
                                  <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                    LinkedIn
                                  </a>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="max-w-[120px] truncate">{row.address_line_1 || '-'}</TableCell>
                              <TableCell>{row.city || '-'}</TableCell>
                              <TableCell>{row.state_province || '-'}</TableCell>
                              <TableCell>{row.postal_code || '-'}</TableCell>
                              <TableCell className="max-w-[100px] truncate" title={row.notes || ''}>
                                {row.notes || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  {uploadState.parsedData.validRows.length > 5 && (
                    <p className="text-sm text-gray-500">
                      Showing first 5 of {uploadState.parsedData.validRows.length} valid rows
                    </p>
                  )}
                </div>
              )}

              {/* Import Progress */}
              {uploadState.isImporting && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Importing organizations...</span>
                      <span>{uploadState.importProgress}%</span>
                    </div>
                    <Progress value={uploadState.importProgress} className="w-full" />
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Import in progress. Please do not close this page.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Import Actions */}
              {uploadState.parsedData.validRows.length > 0 && !uploadState.isImporting && !uploadState.importResult && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => importOrganizations(uploadState.parsedData!.validRows)}
                    disabled={uploadState.isImporting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import {uploadState.parsedData.validRows.length} Organizations
                  </Button>
                  <Button variant="outline" onClick={resetUpload}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}

              {/* Import Results */}
              {uploadState.importResult && (
                <div className="space-y-4 pt-4">
                  <Alert variant={uploadState.importResult.success ? "default" : "destructive"}>
                    {uploadState.importResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {uploadState.importResult.message}
                    </AlertDescription>
                  </Alert>

                  {/* Import Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {uploadState.importResult.imported}
                      </div>
                      <div className="text-sm text-gray-600">Imported</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {uploadState.importResult.failed}
                      </div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </div>

                  {/* Error Details */}
                  {uploadState.importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Import Errors
                      </h3>
                      <div className="border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                        <div className="space-y-1 p-3">
                          {uploadState.importResult.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-600">
                              Row {error.row}: {error.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button onClick={resetUpload} className="flex-1">
                      Import Another File
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/organizations'}>
                      View Organizations
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}