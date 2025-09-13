import React from 'react'
import { Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import type { ExportOptions } from '@/features/import-export/hooks/useExportConfiguration'
import type { ExportProgress } from '@/features/import-export/hooks/useExportExecution'

import { cn } from '@/lib/utils'
interface ExportActionProps {
  exportOptions: ExportOptions
  exportProgress: ExportProgress
  onExecute: () => Promise<void>
}

export const ExportAction: React.FC<ExportActionProps> = ({
  exportOptions,
  exportProgress,
  onExecute,
}) => {
  const shouldShow =
    !exportProgress.isExporting && !exportProgress.completed && !exportProgress.error

  if (!shouldShow) return null

  return (
    <Card>
      <CardContent className={`${semanticSpacing.topPadding.xxl}`}>
        <Button
          onClick={onExecute}
          className="w-full"
          disabled={exportOptions.selectedFields.length === 0}
        >
          <Download className={`${semanticSpacing.rightGap.xs} size-4`} />
          Export Organizations ({exportOptions.format.toUpperCase()})
        </Button>
        <p
          className={cn(
            semanticTypography.caption,
            `${semanticSpacing.topGap.xs} text-center text-muted-foreground`
          )}
        >
          Export will include organizations with the selected fields and options
        </p>
      </CardContent>
    </Card>
  )
}
