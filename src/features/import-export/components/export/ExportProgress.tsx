import React from 'react'
import { FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ExportProgress as ExportProgressType } from '@/features/import-export/hooks/useExportExecution'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

interface ExportProgressProps {
  exportProgress: ExportProgressType
}

export const ExportProgressComponent: React.FC<ExportProgressProps> = ({ exportProgress }) => {
  if (!exportProgress.isExporting) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center ${semanticSpacing.gap.xs}`}>
          <FileSpreadsheet className="size-5 text-primary" />
          Exporting Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={semanticSpacing.stack.lg}>
          <div className={semanticSpacing.stack.xs}>
            <div className={`flex items-center justify-between ${semanticTypography.body}`}>
              <span>Processing records...</span>
              <span>
                {exportProgress.recordsProcessed} / {exportProgress.totalRecords}
              </span>
            </div>
            <Progress value={exportProgress.progress} className="w-full" />
          </div>
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Export in progress. Your file will download automatically when complete.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
