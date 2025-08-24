import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { ExportProgress } from '@/features/import-export/hooks/useExportExecution'

interface ExportErrorProps {
  exportProgress: ExportProgress
  onReset: () => void
}

export const ExportError: React.FC<ExportErrorProps> = ({ 
  exportProgress, 
  onReset 
}) => {
  if (!exportProgress.error) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Export Failed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
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