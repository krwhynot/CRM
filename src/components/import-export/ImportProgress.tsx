import React from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  AlertCircle,
  Upload,
  X
} from 'lucide-react'

export interface ImportResult {
  success: boolean
  message: string
  imported: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

interface ImportProgressProps {
  isImporting: boolean
  importProgress: number
  importResult: ImportResult | null
  validRowsCount: number
  onImport: () => void
  onReset: () => void
}

export function ImportProgress({
  isImporting,
  importProgress,
  importResult,
  validRowsCount,
  onImport,
  onReset
}: ImportProgressProps) {
  if (isImporting) {
    return (
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Importing organizations...</span>
            <span>{importProgress}%</span>
          </div>
          <Progress value={importProgress} className="w-full" />
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Import in progress. Please do not close this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (importResult) {
    return (
      <div className="space-y-4 pt-4">
        <Alert variant={importResult.success ? "default" : "destructive"}>
          {importResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {importResult.message}
          </AlertDescription>
        </Alert>

        {/* Import Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {importResult.imported}
            </div>
            <div className="text-sm text-gray-600">Imported</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {importResult.failed}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        {/* Error Details */}
        {importResult.errors.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Import Errors
            </h3>
            <div className="border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
              <div className="space-y-1 p-3">
                {importResult.errors.map((error, index) => (
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
          <Button onClick={onReset} className="flex-1">
            Import Another File
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/organizations'}>
            View Organizations
          </Button>
        </div>
      </div>
    )
  }

  // Import actions (when data is ready but not importing)
  if (validRowsCount > 0) {
    return (
      <div className="flex gap-3 pt-4">
        <Button 
          className="flex-1" 
          onClick={onImport}
          disabled={isImporting}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import {validRowsCount} Organizations
        </Button>
        <Button variant="outline" onClick={onReset}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    )
  }

  return null
}