import React from 'react'
import { useExportConfiguration } from '../hooks/useExportConfiguration'
import { useExportExecution } from '../hooks/useExportExecution'
import { ExportConfiguration } from '@/components/shared/export/ExportConfiguration'
import { ExportProgressComponent } from '@/components/shared/export/ExportProgress'
import { ExportResults } from '@/components/shared/export/ExportResults'
import { ExportError } from '@/components/shared/export/ExportError'
import { ExportAction } from '@/components/shared/export/ExportAction'

export function OrganizationExporter() {
  const {
    exportOptions,
    handleFieldToggle,
    handleFormatChange,
    handleIncludeInactiveChange
  } = useExportConfiguration()

  const {
    exportProgress,
    executeExport,
    resetExport
  } = useExportExecution(exportOptions)

  return (
    <div className="space-y-6">
      <ExportConfiguration
        exportOptions={exportOptions}
        handleFieldToggle={handleFieldToggle}
        handleFormatChange={handleFormatChange}
        handleIncludeInactiveChange={handleIncludeInactiveChange}
      />

      <ExportProgressComponent exportProgress={exportProgress} />

      <ExportResults 
        exportProgress={exportProgress}
        onReset={resetExport}
      />

      <ExportError 
        exportProgress={exportProgress}
        onReset={resetExport}
      />

      <ExportAction
        exportOptions={exportOptions}
        exportProgress={exportProgress}
        onExecute={executeExport}
      />
    </div>
  )
}