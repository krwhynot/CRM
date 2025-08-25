import { TemplateMatchingImport } from '@/features/import-export/components/TemplateMatchingImport'

export default function ImportExportPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Template .page-header - Match Template Exactly */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <span>📤</span> Import/Export
        </h1>
        <p className="text-sm text-gray-500">
          Import organizations and contacts from CSV files or export your data
        </p>
      </div>

      {/* Main Import Component */}
      <TemplateMatchingImport />
    </div>
  )
}