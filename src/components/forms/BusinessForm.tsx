import { useState } from 'react'
import { useForm, type FieldValues, type UseFormReturn, type Path } from 'react-hook-form'
import { createTypedZodResolver } from '@/lib/form-resolver'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { useDialogContext } from '@/contexts/DialogContext'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import {
  getFormGridClasses,
  getFormSpacingClasses,
  getFormButtonClasses,
} from '@/lib/utils/form-utils'
import { FormFieldNew, type RegularFieldConfig } from './FormField'
import { FormSubmitButton } from './FormSubmitButton'
import type { z } from 'zod'
import { cn } from '@/lib/utils'

/**
 * BusinessForm - Advanced multi-section form with progressive disclosure
 *
 * Supports complex business forms with multiple sections, conditional fields,
 * progress tracking, and validation dependencies.
 */

export interface FormSection {
  id: string
  title: string
  description?: string
  fields: BusinessFormField[]
  required?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  condition?: <T extends FieldValues>(values: T) => boolean // Show section based on form values
  className?: string
}

export interface BusinessFormField extends RegularFieldConfig {
  name: string // Required for business form fields
  section?: string // Which section this field belongs to
  dependency?: {
    field: string
    value: string | number | boolean | null
    condition?: 'equals' | 'not_equals' | 'includes' | 'not_includes'
  }
}

interface BusinessFormProps<T extends FieldValues = FieldValues> {
  sections: FormSection[]
  onSubmit: (data: T) => Promise<void> | void
  validationSchema?: z.ZodType<T>
  defaultValues?: Partial<T>
  loading?: boolean
  submitLabel?: string
  showReset?: boolean
  showProgress?: boolean
  className?: string
}

export function BusinessForm<T extends FieldValues = FieldValues>({
  sections,
  onSubmit,
  validationSchema,
  defaultValues,
  loading = false,
  submitLabel = 'Save',
  showReset = true,
  showProgress = false,
  className,
}: BusinessFormProps<T>) {
  const { isInDialog } = useDialogContext()
  const spacingClasses = getFormSpacingClasses(isInDialog)
  const buttonClasses = getFormButtonClasses(isInDialog)

  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    sections.forEach((section) => {
      initial[section.id] = section.defaultExpanded ?? !section.collapsible
    })
    return initial
  })

  const form = useForm<T>({
    resolver: validationSchema ? createTypedZodResolver(validationSchema) : undefined,
    defaultValues: defaultValues as never,
    mode: 'onBlur',
  })

  const watchedValues = form.watch()

  const handleSubmit = async (data: T) => {
    await onSubmit(data)
  }

  const handleReset = () => {
    form.reset(defaultValues as never)
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  // Calculate form completion progress
  const calculateProgress = () => {
    if (!showProgress) return 0

    const allFields = sections.flatMap((section) => section.fields)
    const filledFields = allFields.filter((field) => {
      const value = watchedValues[field.name]
      return value !== undefined && value !== null && value !== ''
    })

    return Math.round((filledFields.length / allFields.length) * 100)
  }

  // Check if section should be visible
  const shouldShowSection = (section: FormSection) => {
    if (!section.condition) return true
    return section.condition(watchedValues)
  }

  // Check if field should be visible based on dependencies
  const shouldShowField = (field: BusinessFormField) => {
    if (!field.dependency) return true

    const dependentValue = watchedValues[field.dependency.field]
    const condition = field.dependency.condition || 'equals'

    switch (condition) {
      case 'equals':
        return dependentValue === field.dependency.value
      case 'not_equals':
        return dependentValue !== field.dependency.value
      case 'includes':
        return Array.isArray(dependentValue) && dependentValue.includes(field.dependency.value)
      case 'not_includes':
        return Array.isArray(dependentValue) && !dependentValue.includes(field.dependency.value)
      default:
        return true
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn(spacingClasses, className)}>
        {/* Progress Indicator */}
        {showProgress && (
          <div className={cn(semanticSpacing.bottomGap.md, semanticSpacing.stack.xs)}>
            <div
              className={cn(semanticTypography.body, 'flex justify-between text-muted-foreground')}
            >
              <span>Form Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        )}

        {/* Form Sections */}
        {sections.filter(shouldShowSection).map((section) => (
          <FormSectionRenderer<T>
            key={section.id}
            section={section}
            form={form}
            loading={loading}
            isExpanded={expandedSections[section.id]}
            onToggle={() => toggleSection(section.id)}
            shouldShowField={shouldShowField}
            isInDialog={isInDialog}
          />
        ))}

        {/* Form Actions */}
        <div
          className={cn(
            'flex gap-3 pt-6 border-t',
            isInDialog ? 'flex-col-reverse sm:flex-row justify-end' : 'justify-end'
          )}
        >
          {showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className={buttonClasses}
            >
              Reset
            </Button>
          )}

          <FormSubmitButton loading={loading} className={buttonClasses}>
            {submitLabel}
          </FormSubmitButton>
        </div>
      </form>
    </Form>
  )
}

// Section renderer component
interface FormSectionRendererProps<T extends FieldValues = FieldValues> {
  section: FormSection
  form: UseFormReturn<T>
  loading: boolean
  isExpanded: boolean
  onToggle: () => void
  shouldShowField: (field: BusinessFormField) => boolean
  isInDialog: boolean
}

function FormSectionRenderer<T extends FieldValues = FieldValues>({
  section,
  form,
  loading,
  isExpanded,
  onToggle,
  shouldShowField,
  isInDialog,
}: FormSectionRendererProps<T>) {
  const gridClasses = getFormGridClasses(isInDialog, section.fields.length)
  const spacingClasses = getFormSpacingClasses(isInDialog)

  const visibleFields = section.fields.filter(shouldShowField)

  if (visibleFields.length === 0) return null

  const sectionContent = (
    <div className={cn(gridClasses, spacingClasses)}>
      {visibleFields.map((field) => (
        <FormFieldNew
          key={field.name}
          control={form.control}
          name={field.name as Path<T>}
          config={field}
          disabled={loading}
        />
      ))}
    </div>
  )

  // Collapsible section
  if (section.collapsible) {
    return (
      <div className={cn(spacingClasses, section.className)}>
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                semanticSpacing.compact,
                'h-auto w-full justify-between border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
              )}
            >
              <div className={cn(semanticSpacing.gap.sm, 'flex items-center')}>
                <div
                  className={cn(
                    semanticRadius.small,
                    'flex size-6 items-center justify-center border bg-gray-100'
                  )}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </div>
                <div className="text-left">
                  <div className={`${semanticTypography.label}`}>{section.title}</div>
                  {section.description && (
                    <div className={cn(semanticTypography.body, 'text-muted-foreground')}>
                      {section.description}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-4">{sectionContent}</CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  // Regular section
  return (
    <div className={cn(spacingClasses, section.className)}>
      {section.title && (
        <div className={cn(semanticSpacing.bottomGap.sm, semanticSpacing.stack.xs)}>
          <h3 className={cn(semanticTypography.h4, semanticTypography.label)}>
            {section.title}
            {section.required && <span className="ml-1 text-destructive">*</span>}
          </h3>
          {section.description && (
            <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
              {section.description}
            </p>
          )}
        </div>
      )}
      {sectionContent}
    </div>
  )
}
