import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { TransformedOrganizationRow } from '@/hooks/useFileUpload'
import type { ImportResult, SkippedRecord } from '@/types/import-export'

type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']

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

  // Note: Removed checkExistingOrganizations function - no longer needed
  // Industry standard approach uses PostgreSQL's native upsert with ON CONFLICT handling

  // Import organizations with batch processing
  const importOrganizations = useCallback(async (validRows: TransformedOrganizationRow[]) => {
    setImportState((prev) => ({
      ...prev,
      isImporting: true,
      importProgress: 0,
      importResult: null,
      error: null,
    }))

    try {
      // Industry standard approach: Use upsert with ignoreDuplicates to handle all records
      // This eliminates the need for complex pre-checking and is more reliable
      const skippedRecords: SkippedRecord[] = []
      
      // Process all records in batches using upsert with duplicate handling
      const batchSize = 20 // Optimal batch size for PostgreSQL performance
      const batches = []

      for (let i = 0; i < validRows.length; i += batchSize) {
        batches.push(validRows.slice(i, i + batchSize))
      }

      let imported = 0
      let failed = 0
      const errors: Array<{ row: number; error: string }> = []

      // Get user once at the beginning
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        const startRowIndex = batchIndex * batchSize

        try {
          const organizationsToInsert: OrganizationInsert[] = batch.map((row) => {
            // Ensure priority is exactly one character
            const priority = row.priority.toString().charAt(0).toUpperCase()
            
            return {
              name: row.name.trim(),
              type: row.type,
              priority: ['A', 'B', 'C', 'D'].includes(priority) ? priority : 'C',
              segment: row.segment || 'General',
              website: row.website?.trim() || null,
              phone: row.phone?.trim() || null,
              address_line_1: row.address_line_1?.trim() || null,
              city: row.city?.trim() || null,
              state_province: row.state_province?.trim() || null,
              postal_code: row.postal_code?.trim() || null,
              country: row.country?.trim() || 'US',
              notes: row.notes?.trim() || null,
              primary_manager_name: row.primary_manager_name?.trim() || null,
              secondary_manager_name: row.secondary_manager_name?.trim() || null,
              import_notes: row.import_notes?.trim() || null,
              is_active: row.is_active !== false,
              created_by: user.id,
              updated_by: user.id,
            }
          })

          const { data, error } = await supabase
            .from('organizations')
            .upsert(organizationsToInsert, {
              onConflict: 'name,type',
              ignoreDuplicates: true
            })
            .select('id, name')

          if (error) {
            // Enhanced error details for better debugging
            const errorCode = error.code || 'unknown'
            const errorMessage = error.message || 'unknown error'
            const errorDetails = error.details ? ` (${error.details})` : ''
            const errorHint = error.hint ? ` Hint: ${error.hint}` : ''
            
            console.error(`Batch ${batchIndex + 1} error:`, {
              code: errorCode,
              message: errorMessage,
              details: error.details,
              hint: error.hint,
              batch: organizationsToInsert
            })

            failed += batch.length
            errors.push({
              row: startRowIndex + 1,
              error: `Batch ${batchIndex + 1} failed: Code: ${errorCode}, Message: ${errorMessage}${errorDetails}${errorHint}`,
            })
          } else {
            // With upsert and ignoreDuplicates, count actual inserts vs skipped duplicates
            const actualInserted = data?.length || 0
            const skippedInBatch = batch.length - actualInserted
            
            imported += actualInserted
            
            console.log(`Batch ${batchIndex + 1} success: ${actualInserted} organizations imported, ${skippedInBatch} duplicates skipped`)
            
            // Track skipped duplicates (we can't identify specific records, but we know the count)
            if (skippedInBatch > 0) {
              // Since we can't identify which specific records were duplicates,
              // we'll add a summary entry for the batch
              skippedRecords.push({
                name: `Batch ${batchIndex + 1}`,
                type: 'duplicate_batch_summary' as any, // Type assertion for summary entry
                reason: `${skippedInBatch} duplicate organizations skipped (same name/type combination already exists)`,
                rowIndex: startRowIndex + 1,
              })
            }
          }
        } catch (batchError) {
          // Enhanced batch error handling
          console.error(`Batch ${batchIndex + 1} processing error:`, batchError)
          
          failed += batch.length
          const errorMessage = batchError instanceof Error ? batchError.message : 'Unknown processing error'
          errors.push({
            row: startRowIndex + 1,
            error: `Batch ${batchIndex + 1} processing failed: ${errorMessage}`,
          })
        }

        const progress = Math.round(((batchIndex + 1) / batches.length) * 100)
        setImportState((prev) => ({ ...prev, importProgress: progress }))
        
        // Small delay for UI updates and to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Calculate total skipped count (sum of batch summaries)
      const totalSkipped = skippedRecords.reduce((sum, record) => {
        if (record.type === 'duplicate_batch_summary') {
          // Extract number from reason string like "5 duplicate organizations skipped"
          const match = record.reason.match(/(\d+) duplicate organizations/)
          return sum + (match ? parseInt(match[1]) : 0)
        }
        return sum + 1 // Regular skipped record counts as 1
      }, 0)

      const result: ImportResult = {
        success: failed === 0,
        message: `Import complete: ${imported} imported${totalSkipped > 0 ? `, ${totalSkipped} duplicates skipped` : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
        imported,
        failed,
        skipped: totalSkipped,
        errors,
        skippedRecords,
      }

      setImportState((prev) => ({
        ...prev,
        isImporting: false,
        importProgress: 100,
        importResult: result,
      }))
    } catch (error) {
      // Handle import errors
      setImportState((prev) => ({
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
    resetImport,
  }
}
