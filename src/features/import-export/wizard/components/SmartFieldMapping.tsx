import { SmartPreviewComponent } from './SmartPreviewComponent'
import { QuickFieldReview } from './QuickFieldReview'
import type { SmartFieldMapping } from '../hooks/useSmartImport'
import type { ParsedData } from '@/hooks/useFileUpload'
import { semanticSpacing } from '@/styles/tokens'

interface SmartFieldMappingProps {
  parsedData: ParsedData | null
  mappings: SmartFieldMapping[]
  aiInProgress: boolean
  onGenerateAIMappings: () => Promise<void>
  onUpdateMapping: (csvHeader: string, crmField: string | null) => void
  onConfirmMapping: (csvHeader: string) => void
  onSkipField: (csvHeader: string) => void
  onConfirmAll?: () => void
  onProceedToImport?: () => void
  className?: string
}

// New simplified, user-friendly approach

export function SmartFieldMappingComponent({
  parsedData,
  mappings,
  aiInProgress,
  onGenerateAIMappings,
  onUpdateMapping,
  onConfirmMapping,
  onSkipField,
  onConfirmAll,
  onProceedToImport,
  className,
}: SmartFieldMappingProps) {
  const needsReviewMappings = mappings.filter((m) => m.status === 'needs_review')
  const hasReviewItems = needsReviewMappings.length > 0

  // Handle confirm all mappings
  const handleConfirmAll = () => {
    needsReviewMappings.forEach((mapping) => {
      if (mapping.crmField) {
        onConfirmMapping(mapping.csvHeader)
      }
    })
    onConfirmAll?.()
  }

  return (
    <div className={className}>
      {/* Smart Preview - Always show this first */}
      <SmartPreviewComponent
        parsedData={parsedData}
        mappings={mappings}
        aiInProgress={aiInProgress}
        onRegenerateMapping={onGenerateAIMappings}
        onProceedToImport={onProceedToImport}
        className={semanticSpacing.bottomGap.xl}
      />

      {/* Quick Field Review - Always show for field management */}
      <QuickFieldReview
        mappings={mappings}
        onUpdateMapping={onUpdateMapping}
        onConfirmMapping={onConfirmMapping}
        onSkipField={onSkipField}
        onConfirmAll={handleConfirmAll}
      />
    </div>
  )
}

// Export alias for backward compatibility
export { SmartFieldMappingComponent as SmartFieldMapping }
export default SmartFieldMappingComponent
