import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { ExportProgress } from '@/features/import-export/hooks/useExportExecution'
import { semanticSpacing } from '@/styles/tokens'

interface ExportErrorProps {
  exportProgress: ExportProgress
  onReset: () => void
}

export const ExportError: React.FC<ExportErrorProps> = ({ exportProgress, onReset }) => {
  if (!exportProgress.error) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center ${semanticSpacing.gap.xs}`}>
          <AlertCircle className="size-5 text-destructive" />
          Export Failed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={semanticSpacing.stack.lg}>
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{exportProgress.error}</AlertDescription>
          </Alert>
          <Button onClick={onReset} variant="outline">
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
