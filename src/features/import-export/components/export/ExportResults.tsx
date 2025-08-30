import React from 'react'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { ExportProgress } from '@/features/import-export/hooks/useExportExecution'

interface ExportResultsProps {
  exportProgress: ExportProgress
  onReset: () => void
}

export const ExportResults: React.FC<ExportResultsProps> = ({ 
  exportProgress, 
  onReset 
}) => {
  if (!exportProgress.completed) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="size-5 text-green-600" />
          Export Completed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="size-4" />
            <AlertDescription>
              Successfully exported {exportProgress.recordsProcessed} organizations. 
              The file should have downloaded automatically.
            </AlertDescription>
          </Alert>
          <Button onClick={onReset} variant="outline">
            Export Another File
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}