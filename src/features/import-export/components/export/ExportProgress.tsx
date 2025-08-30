import React from 'react'
import { FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ExportProgress as ExportProgressType } from '@/features/import-export/hooks/useExportExecution'

interface ExportProgressProps {
  exportProgress: ExportProgressType
}

export const ExportProgressComponent: React.FC<ExportProgressProps> = ({ exportProgress }) => {
  if (!exportProgress.isExporting) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="size-5 text-blue-600" />
          Exporting Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing records...</span>
              <span>{exportProgress.recordsProcessed} / {exportProgress.totalRecords}</span>
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