import React from 'react'
import type { FieldValues, SubmitHandler } from 'react-hook-form'
import type * as yup from 'yup'
import { Card, CardContent } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { useCoreFormSetup } from '@/hooks/useCoreFormSetup'
import { FormHeader } from './core-form/FormHeader'
import { CoreSectionsRenderer } from './core-form/CoreSectionsRenderer'
import { ContextualSectionsRenderer } from './core-form/ContextualSectionsRenderer'
import { OptionalSectionsRenderer } from './core-form/OptionalSectionsRenderer'
import { FormNotesSection } from './core-form/FormNotesSection'
import { FormSubmitActions } from './core-form/FormSubmitActions'
import type { FormSection, ConditionalSection } from '@/hooks/useFormLayout'

// ===== Core Interfaces =====

export interface CoreFormLayoutProps<T extends FieldValues> {
  // Form configuration
  title: string
  icon: React.ComponentType<{ className?: string }>
  formSchema: yup.ObjectSchema<T>
  onSubmit: SubmitHandler<T>

  // Data and state
  initialData?: Partial<T>
  loading?: boolean
  submitLabel?: string

  // Layout configuration
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'activity'
  showAdvancedOptions?: boolean

  // Sections configuration
  coreSections: FormSection<T>[]
  optionalSections?: FormSection<T>[]
  contextualSections?: ConditionalSection<T>[]
}

// Re-export types from hook for backward compatibility
export type {
  FormSection,
  ConditionalSection,
  SelectOption,
  FormFieldConfig,
} from '@/hooks/useFormLayout'

export function CoreFormLayout<T extends FieldValues>({
  title,
  icon,
  formSchema,
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save',
  entityType,
  showAdvancedOptions = false,
  coreSections,
  optionalSections = [],
  contextualSections = [],
}: CoreFormLayoutProps<T>) {
  const { form, formLayout, handleSubmit } = useCoreFormSetup({
    formSchema,
    initialData,
    entityType,
    showAdvancedOptions,
    coreSections,
    optionalSections,
    contextualSections,
    onSubmit,
  })

  return (
    <Card className="mx-auto w-full max-w-4xl rounded-lg border bg-white shadow-sm">
      <FormHeader title={title} icon={icon} isEdit={Boolean(initialData)} />

      <CardContent className="space-y-8 p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit as SubmitHandler<FieldValues>)}
            className="space-y-8"
          >
            <CoreSectionsRenderer
              sections={coreSections}
              form={form as any}
              loading={loading}
              entityType={entityType}
              getLayoutClass={formLayout.getLayoutClass}
              getSectionClassName={formLayout.getSectionClassName}
            />

            <ContextualSectionsRenderer
              sections={contextualSections}
              form={form as any}
              loading={loading}
              entityType={entityType}
              shouldShowConditionalSection={formLayout.shouldShowConditionalSection}
              getLayoutClass={formLayout.getLayoutClass}
              getSectionClassName={formLayout.getSectionClassName}
            />

            <OptionalSectionsRenderer
              sections={optionalSections}
              form={form as any}
              loading={loading}
              entityType={entityType}
              showOptionalSections={formLayout.showOptionalSections}
              toggleOptionalSections={formLayout.toggleOptionalSections}
              getLayoutClass={formLayout.getLayoutClass}
              getSectionClassName={formLayout.getSectionClassName}
            />

            <FormNotesSection form={form as any} loading={loading} entityType={entityType} />

            <FormSubmitActions
              loading={loading}
              submitLabel={submitLabel}
              hasInitialData={Boolean(initialData)}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CoreFormLayout
