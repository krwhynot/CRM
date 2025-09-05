import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { EnhancedFormField } from './EnhancedFormField'
import { formTheme } from '@/configs/forms/base.config'
import type { FormData, FormLayoutProps, FormSection, ConditionalSection } from '@/types/forms'

export function FormLayout<T extends FormData>({
  config,
  onSubmit,
  initialData,
  loading = false,
}: FormLayoutProps<T>) {
  const [showOptionalSection, setShowOptionalSection] = useState(false)

  const form = useForm<T>({
    resolver: yupResolver(config.schema) as never,
    defaultValues: config.defaultValues(initialData) as never,
    mode: 'onBlur', // Better UX - validate on blur, not every keystroke
  })

  const handleSubmit = async (data: T) => {
    // Apply business logic transformations if needed
    const processedData = config.transformData?.(data) ?? data
    await onSubmit(processedData)
  }

  const shouldShowConditionalSection = (section: ConditionalSection) => {
    const currentValues = form.watch()

    if (typeof section.condition === 'function') {
      return section.condition(currentValues)
    }

    // String-based condition (field name)
    const fieldValue = currentValues[section.condition as keyof typeof currentValues]
    const showWhen = section.showWhen || 'truthy'

    return showWhen === 'truthy' ? !!fieldValue : !fieldValue
  }

  return (
    <Card className="mx-auto w-full max-w-4xl rounded-lg border bg-white shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          {config.icon && <config.icon className="size-6 text-primary" />}
          {config.title}
        </CardTitle>
      </CardHeader>

      <CardContent className={`p-6 ${formTheme.spacing.section}`}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit as never)}
            className={formTheme.spacing.section}
          >
            {/* Core Sections */}
            {config.sections.map((section) => (
              <FormSectionRenderer
                key={section.id}
                section={section}
                form={form}
                loading={loading}
              />
            ))}

            {/* Conditional Sections */}
            {config.conditionalSections?.map(
              (section) =>
                shouldShowConditionalSection(section) &&
                (section.isCollapsible ? (
                  <CollapsibleFormSection
                    key={section.id}
                    section={section}
                    form={form}
                    loading={loading}
                  />
                ) : (
                  <FormSectionRenderer
                    key={section.id}
                    section={section}
                    form={form}
                    loading={loading}
                  />
                ))
            )}

            {/* Optional Section with Progressive Disclosure */}
            {config.optionalSection && (
              <Collapsible open={showOptionalSection} onOpenChange={setShowOptionalSection}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between border border-dashed border-gray-300 p-3 hover:border-gray-400 hover:bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-6 items-center justify-center rounded border bg-gray-100">
                        {showOptionalSection ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{config.optionalSection.title}</div>
                        {config.optionalSection.description && (
                          <div className="text-sm text-muted-foreground">
                            {config.optionalSection.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className={`${formTheme.spacing.field} pt-6`}>
                  <div className={`grid grid-cols-1 md:grid-cols-2 ${formTheme.spacing.inner}`}>
                    {config.optionalSection.fields.map((field) => (
                      <EnhancedFormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        config={field}
                        disabled={loading}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Form Actions */}
            <div className="flex flex-col-reverse justify-end gap-3 border-t pt-6 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={loading}
                className={formTheme.sizing.button}
              >
                Reset
              </Button>
              <Button type="submit" disabled={loading} className={formTheme.sizing.button}>
                {loading ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  config.submitLabel || 'Save'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// ===== Section Renderer Component =====

interface FormSectionRendererProps {
  section: FormSection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  loading: boolean
}

function FormSectionRenderer({ section, form, loading }: FormSectionRendererProps) {
  return (
    <div className={formTheme.spacing.field}>
      {section.title && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
      )}

      <div
        className={
          section.className || `grid grid-cols-1 md:grid-cols-2 ${formTheme.spacing.inner}`
        }
      >
        {section.fields.map((fieldConfig) => (
          <EnhancedFormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            config={fieldConfig}
            disabled={loading}
          />
        ))}
      </div>
    </div>
  )
}

// ===== Collapsible Form Section Component =====

interface CollapsibleFormSectionProps {
  section: ConditionalSection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  loading: boolean
}

function CollapsibleFormSection({ section, form, loading }: CollapsibleFormSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={formTheme.spacing.field}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full justify-between border border-dashed border-gray-300 p-3 hover:border-gray-400 hover:bg-gray-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-6 items-center justify-center rounded border bg-gray-100">
                {isOpen ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </div>
              <div className="text-left">
                <div className="font-medium">{section.title}</div>
                {section.description && (
                  <div className="text-sm text-muted-foreground">{section.description}</div>
                )}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className={`${formTheme.spacing.field} pt-6`}>
          <div
            className={
              section.className || `grid grid-cols-1 md:grid-cols-2 ${formTheme.spacing.inner}`
            }
          >
            {section.fields.map((fieldConfig) => (
              <EnhancedFormField
                key={fieldConfig.name}
                control={form.control}
                name={fieldConfig.name}
                config={fieldConfig}
                disabled={loading}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
