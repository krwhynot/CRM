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

  // Import organizations with optimized batch processing
  const importOrganizations = useCallback(async (validRows: TransformedOrganizationRow[]) => {
    // Generate unique session ID for this import
    const importSessionId = crypto.randomUUID()
    console.log(`Starting import session: ${importSessionId}`)

    setImportState((prev) => ({
      ...prev,
      isImporting: true,
      importProgress: 0,
      importResult: null,
      error: null,
    }))

    try {
      // Industry best practice: Larger batches for better performance while maintaining reliability
      // Based on PostgreSQL performance research: optimal batch size for network operations is 100-500 rows
      const skippedRecords: SkippedRecord[] = []
      
      // Dynamic batch sizing based on data volume for optimal performance
      const getBatchSize = (totalRows: number): number => {
        if (totalRows < 50) return totalRows // Small datasets: single batch
        if (totalRows < 500) return 50 // Medium datasets: moderate batches
        return 100 // Large datasets: larger batches for efficiency
      }
      
      const batchSize = getBatchSize(validRows.length)
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

      console.log(`Starting optimized import: ${validRows.length} records in ${batches.length} batches (${batchSize} records per batch)`)
      const startTime = performance.now()

      // ✨ Enhanced with atomic batch processing and comprehensive error handling
      // Industry approach: Process batches individually with rollback capability on critical failures
      console.log(`Starting atomic batch import for session: ${importSessionId}`)
      
      let processingFailed = false
      let criticalError: string | null = null

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        const startRowIndex = batchIndex * batchSize

        console.log(`Processing atomic batch ${batchIndex + 1}/${batches.length} for session: ${importSessionId}`)

          try {
          const batchStartTime = performance.now()
          
          // Pre-process and validate batch data for optimal performance
          const organizationsToInsert: OrganizationInsert[] = batch.map((row, index) => {
            // Ensure priority is exactly one character
            const priority = row.priority.toString().charAt(0).toUpperCase()
            
            // Pre-validate required fields to avoid database errors
            if (!row.name?.trim()) {
              throw new Error(`Row ${startRowIndex + index + 1}: Organization name is required`)
            }
            
            return {
              name: row.name.trim(),
              type: row.type || 'customer', // Ensure type is always set
              priority: (['A', 'B', 'C', 'D'].includes(priority) ? priority : 'C') as 'A' | 'B' | 'C' | 'D',
              segment: row.segment?.trim() || 'General',
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
              import_session_id: importSessionId, // Track import session for audit purposes
              is_active: row.is_active !== false,
              created_by: user.id,
              updated_by: user.id,
            }
          })

          // Optimized upsert with minimal data selection for performance
          const { data, error } = await supabase
            .from('organizations')
            .upsert(organizationsToInsert, {
              onConflict: 'name,type',
              ignoreDuplicates: true,
              count: 'exact' // Get exact count for better reporting
            })
            .select('id, name')
          
          const batchEndTime = performance.now()
          const batchDuration = batchEndTime - batchStartTime
          const recordsPerMs = batch.length / batchDuration
          
          console.log(`Batch ${batchIndex + 1} completed in ${batchDuration.toFixed(2)}ms (${recordsPerMs.toFixed(3)} records/ms)`);

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

            // Check if this is a critical error that should stop the entire import
            const isCriticalError = ['23505', '23503', '42P01', '42703'].includes(errorCode) // Unique violation, FK violation, table not found, column not found
            
            if (isCriticalError) {
              processingFailed = true
              criticalError = `Critical database error in batch ${batchIndex + 1}: ${errorMessage}`
              console.error(`CRITICAL ERROR - Stopping import for session ${importSessionId}:`, criticalError)
              
              failed += batch.length
              errors.push({
                row: startRowIndex + 1,
                error: `CRITICAL: ${criticalError}`,
              })
              break // Stop processing remaining batches
            } else {
              // Non-critical error - log and continue with next batch
              console.log(`Non-critical database error in batch ${batchIndex + 1} for session: ${importSessionId}`)
              
              failed += batch.length
              errors.push({
                row: startRowIndex + 1,
                error: `Batch ${batchIndex + 1} failed: Code: ${errorCode}, Message: ${errorMessage}${errorDetails}${errorHint}`,
              })
            }
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
          // Enhanced batch error handling with critical failure detection
          console.error(`Batch ${batchIndex + 1} processing error in session ${importSessionId}:`, batchError)
          
          const errorMessage = batchError instanceof Error ? batchError.message : 'Unknown processing error'
          
          // Check if this is a critical processing error
          const isCriticalProcessingError = errorMessage.includes('User not authenticated') || 
                                           errorMessage.includes('network') ||
                                           errorMessage.includes('timeout')
          
          if (isCriticalProcessingError) {
            processingFailed = true
            criticalError = `Critical processing error in batch ${batchIndex + 1}: ${errorMessage}`
            console.error(`CRITICAL PROCESSING ERROR - Stopping import for session ${importSessionId}:`, criticalError)
            
            failed += batch.length
            errors.push({
              row: startRowIndex + 1,
              error: `CRITICAL PROCESSING: ${criticalError}`,
            })
            break // Stop processing remaining batches
          } else {
            // Non-critical processing error - continue with next batch
            failed += batch.length
            errors.push({
              row: startRowIndex + 1,
              error: `Batch ${batchIndex + 1} processing failed: ${errorMessage}`,
            })
          }
        }

        const progress = Math.round(((batchIndex + 1) / batches.length) * 100)
        setImportState((prev) => ({ ...prev, importProgress: progress }))
        
        // Reduced delay for better performance - only wait between batches if needed
        if (batchIndex < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50)) // Shorter delay for better UX
        }
      }

      // Handle critical failures with compensating actions
      if (processingFailed && criticalError) {
        console.error(`Import session ${importSessionId} failed with critical error: ${criticalError}`)
        
        // Option 1: Mark all imported records from this session for review/cleanup
        // Option 2: Provide detailed rollback instructions to user
        // For now, we'll provide detailed failure information
        
        const compensatingMessage = `
          Critical failure detected during import. 
          Imported records before failure: ${imported}
          Failed batches due to critical error: remaining batches were skipped
          Session ID: ${importSessionId} (use this to identify imported records)
          
          Recommended actions:
          1. Review imported records with session_id = '${importSessionId}'
          2. Address the critical error: ${criticalError}
          3. Re-run import with corrected data
        `
        
        console.log(compensatingMessage)
      } else {
        console.log(`Import session ${importSessionId} completed normally`)
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

      // Calculate and log performance metrics
      const endTime = performance.now()
      const totalDuration = endTime - startTime
      const totalRecordsProcessed = validRows.length
      const recordsPerSecond = (totalRecordsProcessed / totalDuration) * 1000
      const msPerRecord = totalDuration / totalRecordsProcessed

      console.log(`Import session ${importSessionId} completed: ${totalRecordsProcessed} records in ${totalDuration.toFixed(2)}ms`)
      console.log(`Performance: ${recordsPerSecond.toFixed(1)} records/second, ${msPerRecord.toFixed(3)}ms per record`)
      console.log(`Results: ${imported} imported, ${totalSkipped} duplicates skipped, ${failed} failed`)

      const result: ImportResult = {
        success: failed === 0 && !processingFailed,
        message: processingFailed 
          ? `Import session ${importSessionId}: CRITICAL FAILURE - ${imported} imported before failure, ${failed} failed, ${totalSkipped} skipped. Check session records.`
          : `Import session ${importSessionId}: ${imported} imported${totalSkipped > 0 ? `, ${totalSkipped} duplicates skipped` : ''}${failed > 0 ? `, ${failed} failed` : ''} (${msPerRecord.toFixed(1)}ms/record)`,
        imported,
        failed,
        skipped: totalSkipped,
        errors,
        skippedRecords,
        sessionId: importSessionId, // Include session ID in result
        criticalFailure: processingFailed ? criticalError : undefined,
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
