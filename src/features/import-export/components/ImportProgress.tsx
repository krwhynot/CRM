import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Upload, X } from 'lucide-react'
import { semanticSpacing, semanticTypography, semanticRadius, fontWeight } from '@/styles/tokens'
import type { ImportResult } from '@/types/import-export'

import { cn } from '@/lib/utils'
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
  onReset,
}: ImportProgressProps) {
  if (isImporting) {
    return (
      <div className={`${semanticSpacing.layoutContainer} ${semanticSpacing.topPadding.lg}`}>
        <div className={semanticSpacing.stack.xs}>
          <div className={`flex items-center justify-between ${semanticTypography.body}`}>
            <span>Importing organizations...</span>
            <span>{importProgress}%</span>
          </div>
          <Progress value={importProgress} className="w-full" />
        </div>
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>Import in progress. Please do not close this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (importResult) {
    return (
      <div className={`${semanticSpacing.layoutContainer} ${semanticSpacing.topPadding.lg}`}>
        <Alert variant={importResult.success ? 'default' : 'destructive'}>
          {importResult.success ? (
            <CheckCircle className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          <AlertDescription>{importResult.message}</AlertDescription>
        </Alert>

        {/* Import Summary */}
        <div className={`grid grid-cols-2 ${semanticSpacing.gap.lg}`}>
          <div
            className={`${semanticRadius.lg} bg-success/5 ${semanticSpacing.cardContainer} text-center`}
          >
            <div className={cn(semanticTypography.h2, semanticTypography.title, 'text-success')}>
              {importResult.imported}
            </div>
            <div className={`${semanticTypography.body} text-gray-600`}>Imported</div>
          </div>
          <div
            className={`${semanticRadius.lg} bg-destructive/5 ${semanticSpacing.cardContainer} text-center`}
          >
            <div
              className={cn(semanticTypography.h2, semanticTypography.title, 'text-destructive')}
            >
              {importResult.failed}
            </div>
            <div className={`${semanticTypography.body} text-gray-600`}>Failed</div>
          </div>
        </div>

        {/* Error Details */}
        {importResult.errors && importResult.errors.length > 0 && (
          <div className={semanticSpacing.stack.xs}>
            <h3
              className={`flex items-center ${semanticSpacing.gap.xs} ${fontWeight.medium} text-destructive`}
            >
              <AlertCircle className="size-4" />
              Import Errors
            </h3>
            <div className={`max-h-40 overflow-hidden overflow-y-auto ${semanticRadius.lg} border`}>
              <div className={`${semanticSpacing.stack.xxs} ${semanticSpacing.cardContainer}`}>
                {importResult.errors.map((error, index) => (
                  <div key={index} className={`${semanticTypography.body} text-red-600`}>
                    Row {error.row}: {'error' in error ? error.error : error.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={`flex ${semanticSpacing.gap.lg}`}>
          <Button onClick={onReset} className="flex-1">
            Import Another File
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/organizations')}>
            View Organizations
          </Button>
        </div>
      </div>
    )
  }

  // Import actions (when data is ready but not importing)
  if (validRowsCount > 0) {
    return (
      <div className={`flex ${semanticSpacing.gap.lg} ${semanticSpacing.topPadding.xl}`}>
        <Button className="flex-1" onClick={onImport} disabled={isImporting}>
          <Upload className={cn(semanticSpacing.rightGap.xs, 'size-4')} />
          Import {validRowsCount} Organizations
        </Button>
        <Button variant="outline" onClick={onReset}>
          <X className={cn(semanticSpacing.rightGap.xs, 'size-4')} />
          Cancel
        </Button>
      </div>
    )
  }

  return null
}
