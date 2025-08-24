import React from 'react'
import { Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ExportOptions } from '@/features/import-export/hooks/useExportConfiguration'
import type { ExportProgress } from '@/features/import-export/hooks/useExportExecution'

interface ExportActionProps {
  exportOptions: ExportOptions
  exportProgress: ExportProgress
  onExecute: () => Promise<void>
}

export const ExportAction: React.FC<ExportActionProps> = ({
  exportOptions,
  exportProgress,
  onExecute
}) => {
  const shouldShow = !exportProgress.isExporting && !exportProgress.completed && !exportProgress.error

  if (!shouldShow) return null

  return (
    <Card>
      <CardContent className="pt-6">
        <Button 
          onClick={onExecute} 
          className="w-full"
          disabled={exportOptions.selectedFields.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Organizations ({exportOptions.format.toUpperCase()})
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Export will include organizations with the selected fields and options
        </p>
      </CardContent>
    </Card>
  )
}