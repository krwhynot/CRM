import { TemplateMatchingImport } from '@/features/import-export/components/TemplateMatchingImport'

export default function ImportExportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header - Match Template Exactly */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <span>📤</span> Import/Export
        </h1>
        <p className="text-gray-600 text-sm">
          Import organizations and contacts from CSV files or export your data
        </p>
      </div>

      {/* Main Import Component */}
      <TemplateMatchingImport />
    </div>
  )
}