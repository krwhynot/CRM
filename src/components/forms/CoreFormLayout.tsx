/**
 * DEPRECATED: CoreFormLayout system
 *
 * This component has been removed as part of the form architecture migration.
 * The CoreFormLayout system had issues with submit button rendering.
 *
 * Migration path:
 * 1. Use StandardDialog + FormCard pattern instead
 * 2. Replace with entity-specific dialog components in Phase 4
 *
 * @deprecated Use StandardDialog + FormCard pattern instead
 */

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

// Temporary stub interface for backward compatibility
export interface CoreFormLayoutProps<T = any> {
  onSubmit?: (data: T) => void
  loading?: boolean
  submitLabel?: string
  coreSections?: any[]
  contextualSections?: any[]
  optionalSections?: any[]
  initialData?: T
  [key: string]: any
}

/**
 * Temporary deprecation stub for CoreFormLayout
 * Shows deprecation notice while we migrate to new architecture
 */
export function CoreFormLayout({ submitLabel = 'Save' }: CoreFormLayoutProps<any>) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="size-4 text-amber-600" />
        <AlertDescription className="text-warning-foreground">
          <strong>CoreFormLayout Deprecated</strong>
          <br />
          This form is being migrated to the new StandardDialog + FormCard architecture.
          <br />
          Submit buttons were not rendering properly in the old system.
          <br />
          <em>Form will be updated in Phase 4 of the migration.</em>
        </AlertDescription>
      </Alert>

      <div className="mt-6 rounded-lg border bg-gray-50 p-4">
        <p className="mb-4 text-gray-600">Form temporarily unavailable during migration.</p>
        <button className="cursor-not-allowed rounded bg-gray-200 px-4 py-2 text-gray-500" disabled>
          {submitLabel} (Disabled)
        </button>
      </div>
    </div>
  )
}

// Export legacy types for compatibility
export type FormSection = any
export type FormFieldConfig = any
export type ConditionalSection = any
export type SelectOption = {
  value: string
  label: string
  description?: string
  icon?: string
}

export default CoreFormLayout
