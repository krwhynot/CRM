import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { TransformedOrganizationRow } from '@/hooks/useFileUpload'

type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']

export interface SkippedRecord {
  name: string
  type: string
  reason: string
  rowIndex: number
}

export interface ImportResult {
  success: boolean
  message: string
  imported: number
  failed: number
  skipped: number
  errors: Array<{ row: number; error: string }>
  skippedRecords: SkippedRecord[]
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

  // Check for existing organizations to avoid duplicates
  const checkExistingOrganizations = async (rows: TransformedOrganizationRow[]) => {
    const namePairs = rows.map(row => ({ name: row.name, type: row.type }))
    
    const { data: existingOrgs, error } = await supabase
      .from('organizations')
      .select('name, type')
      .in('name', rows.map(row => row.name))
      .is('deleted_at', null)
    
    if (error) {
      console.error('Error checking existing organizations:', error)
      throw error
    }

    const existingSet = new Set(
      existingOrgs?.map(org => `${org.name}|${org.type}`) || []
    )

    return namePairs.map((pair, index) => ({
      ...pair,
      index,
      exists: existingSet.has(`${pair.name}|${pair.type}`)
    }))
  }

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
      // First, check which organizations already exist
      const existenceCheck = await checkExistingOrganizations(validRows)
      
      // Separate new records from existing ones
      const newRecords: TransformedOrganizationRow[] = []
      const skippedRecords: SkippedRecord[] = []
      
      existenceCheck.forEach((check) => {
        if (check.exists) {
          skippedRecords.push({
            name: check.name,
            type: check.type,
            reason: 'Organization already exists',
            rowIndex: check.index + 1
          })
        } else {
          newRecords.push(validRows[check.index])
        }
      })


      // Process only new records in batches
      const batchSize = 50
      const batches = []
      
      for (let i = 0; i < newRecords.length; i += batchSize) {
        batches.push(newRecords.slice(i, i + batchSize))
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
            const errorDetail = `Code: ${error.code || 'unknown'}, Message: ${error.message || 'unknown error'}`
            if (error.details) {
              console.error('Error details:', error.details)
            }
            if (error.hint) {
              console.error('Error hint:', error.hint)
            }
            
            failed += batch.length
            errors.push({
              row: batchIndex * batchSize + 1,
              error: `Batch ${batchIndex + 1} failed: ${errorDetail}`
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
        message: `Import complete: ${imported} imported, ${skippedRecords.length} skipped${failed > 0 ? `, ${failed} failed` : ''}`,
        imported,
        failed,
        skipped: skippedRecords.length,
        errors,
        skippedRecords
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