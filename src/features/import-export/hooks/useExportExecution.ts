import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { isFeatureEnabled } from '@/lib/feature-flags'
import type { ExportOptions } from './useExportConfiguration'

// Type for export data record (based on organization fields)
type ExportDataRecord = {
  [key: string]: string | number | boolean | null | undefined
}

// Type for XLSX library interface
interface XLSXLibrary {
  utils: {
    json_to_sheet: (data: ExportDataRecord[]) => unknown
    book_new: () => unknown
    book_append_sheet: (workbook: unknown, worksheet: unknown, sheetName: string) => void
  }
  write: (workbook: unknown, options: { type: string; bookType: string }) => string
}

export interface ExportProgress {
  isExporting: boolean
  progress: number
  recordsProcessed: number
  totalRecords: number
  error: string | null
  completed: boolean
}

interface UseExportExecutionReturn {
  exportProgress: ExportProgress
  executeExport: () => Promise<void>
  resetExport: () => void
}

export const useExportExecution = (exportOptions: ExportOptions): UseExportExecutionReturn => {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    recordsProcessed: 0,
    totalRecords: 0,
    error: null,
    completed: false
  })

  // Generate CSV content
  const generateCSV = useCallback((data: ExportDataRecord[]) => {
    if (data.length === 0) return ''

    const headers = exportOptions.selectedFields
    const csvHeaders = headers.map(field => {
      const fieldDef = exportOptions.selectedFields.find(f => f === field)
      return fieldDef || field
    }).join(',')

    const csvRows = data.map(row => {
      return headers.map(field => {
        const value = row[field]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value)
      }).join(',')
    }).join('\n')

    return `${csvHeaders}\n${csvRows}`
  }, [exportOptions.selectedFields])

  // Generate XLSX content using SheetJS
  const generateXLSX = useCallback((data: ExportDataRecord[], XLSX: XLSXLibrary): string => {
    if (data.length === 0) {
      // Create empty workbook with headers only
      const headers = exportOptions.selectedFields
      const worksheet = XLSX.utils.json_to_sheet([])
      XLSX.utils.sheet_add_aoa(worksheet, [headers])
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Export')
      return XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' })
    }

    // Transform data to ensure proper field mapping
    const transformedData = data.map(row => {
      const transformedRow: ExportDataRecord = {}
      exportOptions.selectedFields.forEach(field => {
        const value = row[field]
        // Handle null/undefined values
        if (value === null || value === undefined) {
          transformedRow[field] = ''
        } else if (typeof value === 'object') {
          // Handle JSON objects by converting to string
          transformedRow[field] = JSON.stringify(value)
        } else {
          transformedRow[field] = value
        }
      })
      return transformedRow
    })

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(transformedData)
    
    // Set column widths for better readability
    const columnWidths = exportOptions.selectedFields.map(() => ({ wch: 20 }))
    worksheet['!cols'] = columnWidths
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export')
    
    // Write as binary string
    return XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' })
  }, [exportOptions.selectedFields])

  // Execute export
  const executeExport = useCallback(async () => {
    setExportProgress({
      isExporting: true,
      progress: 0,
      recordsProcessed: 0,
      totalRecords: 0,
      error: null,
      completed: false
    })

    try {
      // Build query
      let query = supabase
        .from('organizations')
        .select(exportOptions.selectedFields.join(', '))

      // Apply filters
      if (!exportOptions.includeInactive) {
        query = query.eq('is_active', true)
      }

      if (exportOptions.filters.type && exportOptions.filters.type.length > 0) {
        query = query.in('type', exportOptions.filters.type)
      }

      if (exportOptions.filters.priority && exportOptions.filters.priority.length > 0) {
        query = query.in('priority', exportOptions.filters.priority)
      }

      if (exportOptions.filters.segment && exportOptions.filters.segment.length > 0) {
        query = query.in('segment', exportOptions.filters.segment)
      }

      // Get total count first
      const { count } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })

      setExportProgress(prev => ({ ...prev, totalRecords: count || 0 }))

      // Fetch data in batches
      const batchSize = 1000
      const allData: ExportDataRecord[] = []
      let offset = 0
      let hasMore = true

      while (hasMore) {
        const { data, error } = await query
          .range(offset, offset + batchSize - 1)
          .order('created_at', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          allData.push(...data)
          offset += batchSize
          
          setExportProgress(prev => ({
            ...prev,
            recordsProcessed: allData.length,
            progress: Math.round((allData.length / (count || 1)) * 100)
          }))

          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 50))
        } else {
          hasMore = false
        }
      }

      // Generate file content
      let content: string
      let mimeType: string
      let fileExtension: string

      if (exportOptions.format === 'csv') {
        content = generateCSV(allData)
        mimeType = 'text/csv'
        fileExtension = 'csv'
      } else if (exportOptions.format === 'xlsx' && isFeatureEnabled('xlsxExport')) {
        // Dynamic import to avoid bundle bloat
        const XLSX = await import('xlsx')
        content = generateXLSX(allData, XLSX.default)
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
      } else {
        // Fallback to CSV for XLSX when feature is disabled
        // User will be notified via UI that CSV is being used instead
        content = generateCSV(allData)
        mimeType = 'text/csv'
        fileExtension = 'csv'
        
        // XLSX export requested but feature disabled, falling back to CSV
      }

      // Download file
      let blob: Blob
      if (fileExtension === 'xlsx') {
        // Convert binary string to array buffer for XLSX
        const buffer = new ArrayBuffer(content.length)
        const view = new Uint8Array(buffer)
        for (let i = 0; i < content.length; i++) {
          view[i] = content.charCodeAt(i) & 0xFF
        }
        blob = new Blob([buffer], { type: mimeType })
      } else {
        // Standard text blob for CSV
        blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
      }
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      const timestamp = new Date().toISOString().split('T')[0]
      const fileName = `organizations_export_${timestamp}.${fileExtension}`
      
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportProgress(prev => ({
        ...prev,
        isExporting: false,
        progress: 100,
        completed: true
      }))

    } catch (error) {
      // Handle export errors
      setExportProgress(prev => ({
        ...prev,
        isExporting: false,
        error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        completed: false
      }))
    }
  }, [exportOptions, generateCSV])

  // Reset export state
  const resetExport = useCallback(() => {
    setExportProgress({
      isExporting: false,
      progress: 0,
      recordsProcessed: 0,
      totalRecords: 0,
      error: null,
      completed: false
    })
  }, [])

  return {
    exportProgress,
    executeExport,
    resetExport
  }
}