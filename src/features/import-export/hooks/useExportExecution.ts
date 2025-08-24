import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ExportOptions } from './useExportConfiguration'

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
  const generateCSV = useCallback((data: any[]) => {
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
      const allData: any[] = []
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
      } else {
        // For now, export as CSV even for XLSX option
        // TODO: Implement proper XLSX export using SheetJS or similar
        content = generateCSV(allData)
        mimeType = 'text/csv'
        fileExtension = 'csv'
      }

      // Download file
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
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
      console.error('Export error:', error)
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