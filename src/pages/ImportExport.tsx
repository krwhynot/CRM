import { SmartImportOrchestrator } from '@/features/import-export/wizard/components/SmartImportOrchestrator'
import { PageContainer } from '@/components/layout'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { COPY } from '@/lib/copy'

export default function ImportExportPage() {
  return (
    <PageContainer>
      <PageHeader
        title={COPY.PAGES.IMPORT_EXPORT_TITLE}
        subtitle={COPY.PAGES.IMPORT_EXPORT_SUBTITLE}
      />

      {/* AI-Powered Smart Import Orchestrator */}
      <SmartImportOrchestrator />
    </PageContainer>
  )
}
