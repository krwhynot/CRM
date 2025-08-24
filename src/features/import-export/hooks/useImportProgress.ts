import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { TransformedOrganizationRow } from '@/hooks/useFileUpload'

type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']

export interface ImportResult {
  success: boolean
  message: string
  imported: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

interface UseImportProgressState {
  isImporting: boolean
  importProgress: number
  importResult: ImportResult | null
  error: string | null
}

interface UseImportProgressReturn {
  importState: UseImportProgressState
  importOrganizations: (validRows: TransformedOrganizationRow[]) => Promise<void>
  resetImport: () => void
}

export const useImportProgress = (): UseImportProgressReturn => {
  const [importState, setImportState] = useState<UseImportProgressState>({
    isImporting: false,
    importProgress: 0,
    importResult: null,
    error: null,
  })

  // Import organizations with batch processing
  const importOrganizations = useCallback(async (validRows: TransformedOrganizationRow[]) => {
    setImportState(prev => ({
      ...prev,
      isImporting: true,
      importProgress: 0,
      importResult: null,
      error: null,
    }))

    try {
      const batchSize = 50
      const batches = []
      
      for (let i = 0; i < validRows.length; i += batchSize) {
        batches.push(validRows.slice(i, i + batchSize))
      }

      let imported = 0
      let failed = 0
      const errors: Array<{ row: number; error: string }> = []

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            throw new Error('User not authenticated')
          }

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
            created_by: user.id,
            updated_by: user.id,
          }))

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

        const progress = Math.round(((batchIndex + 1) / batches.length) * 100)
        setImportState(prev => ({ ...prev, importProgress: progress }))
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const result: ImportResult = {
        success: failed === 0,
        message: failed === 0 
          ? `Successfully imported ${imported} organizations` 
          : `Imported ${imported} organizations, ${failed} failed`,
        imported,
        failed,
        errors
      }

      setImportState(prev => ({
        ...prev,
        isImporting: false,
        importProgress: 100,
        importResult: result,
      }))

    } catch (error) {
      console.error('Import error:', error)
      setImportState(prev => ({
        ...prev,
        isImporting: false,
        importProgress: 0,
        error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }))
    }
  }, [])

  // Reset import state
  const resetImport = useCallback(() => {
    setImportState({
      isImporting: false,
      importProgress: 0,
      importResult: null,
      error: null,
    })
  }, [])

  return {
    importState,
    importOrganizations,
    resetImport
  }
}