import React from 'react'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { ExportProgress } from '@/features/import-export/hooks/useExportExecution'
import { semanticSpacing } from '@/styles/tokens'

interface ExportResultsProps {
  exportProgress: ExportProgress
  onReset: () => void
}

export const ExportResults: React.FC<ExportResultsProps> = ({ exportProgress, onReset }) => {
  if (!exportProgress.completed) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center ${semanticSpacing.gap.xs}`}>
          <CheckCircle className="size-5 text-success" />
          Export Completed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={semanticSpacing.stack.lg}>
          <Alert>
            <CheckCircle className="size-4" />
            <AlertDescription>
              Successfully exported {exportProgress.recordsProcessed} organizations. The file should
              have downloaded automatically.
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
