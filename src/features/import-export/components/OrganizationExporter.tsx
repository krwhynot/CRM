import { useExportConfiguration } from '../hooks/useExportConfiguration'
import { useExportExecution } from '../hooks/useExportExecution'
import { semanticSpacing } from '@/styles/tokens'
import { ExportConfiguration } from '@/features/import-export/components/export/ExportConfiguration'
import { ExportProgressComponent } from '@/features/import-export/components/export/ExportProgress'
import { ExportResults } from '@/features/import-export/components/export/ExportResults'
import { ExportError } from '@/features/import-export/components/export/ExportError'
import { ExportAction } from '@/features/import-export/components/export/ExportAction'

export function OrganizationExporter() {
  const { exportOptions, handleFieldToggle, handleFormatChange, handleIncludeInactiveChange } =
    useExportConfiguration()

  const { exportProgress, executeExport, resetExport } = useExportExecution(exportOptions)

  return (
    <div className={semanticSpacing.stackContainer}>
      <ExportConfiguration
        exportOptions={exportOptions}
        handleFieldToggle={handleFieldToggle}
        handleFormatChange={handleFormatChange}
        handleIncludeInactiveChange={handleIncludeInactiveChange}
      />

      <ExportProgressComponent exportProgress={exportProgress} />

      <ExportResults exportProgress={exportProgress} onReset={resetExport} />

      <ExportError exportProgress={exportProgress} onReset={resetExport} />

      <ExportAction
        exportOptions={exportOptions}
        exportProgress={exportProgress}
        onExecute={executeExport}
      />
    </div>
  )
}
