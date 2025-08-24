import React from 'react'
import { useForm, FieldValues, DefaultValues } from 'react-hook-form'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import * as yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useFormLayout } from '@/hooks/useFormLayout'
import { FormFieldRenderer } from './FormFieldRenderer'
import { FormSectionComponent } from './FormSectionComponent'
import { ConditionalSectionRenderer } from './ConditionalSectionRenderer'
import type { FormSection, ConditionalSection } from '@/hooks/useFormLayout'

// ===== Core Interfaces =====

export interface CoreFormLayoutProps<T extends FieldValues> {
  // Form configuration
  title: string
  icon: React.ComponentType<{ className?: string }>
  formSchema: yup.ObjectSchema<T>
  onSubmit: (data: T) => void | Promise<void>
  
  // Data and state
  initialData?: Partial<T>
  loading?: boolean
  submitLabel?: string
  
  // Layout configuration
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  showAdvancedOptions?: boolean
  
  // Sections configuration
  coreSections: FormSection<T>[]
  optionalSections?: FormSection<T>[]
  contextualSections?: ConditionalSection<T>[]
}

// Re-export types from hook for backward compatibility
export type { FormSection, ConditionalSection, SelectOption, FormFieldConfig } from '@/hooks/useFormLayout'

export function CoreFormLayout<T extends FieldValues>({
  title,
  icon: Icon,
  formSchema,
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save',
  entityType,
  showAdvancedOptions = false,
  coreSections,
  optionalSections = [],
  contextualSections = []
}: CoreFormLayoutProps<T>) {
  const form = useForm<T>({
    resolver: createTypeSafeResolver<T>(formSchema),
    defaultValues: initialData as DefaultValues<T>
  })
  
  const formLayout = useFormLayout({
    entityType,
    showAdvancedOptions,
    coreSections,
    optionalSections,
    contextualSections,
    form
  })
  
  const handleSubmit = (data: T) => {
    const cleanData = formLayout.cleanFormData(data)
    onSubmit(cleanData)
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto bg-white rounded-lg border shadow-sm">
      <CardHeader className="p-6 border-b">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          <Icon className="h-5 w-5" />
          {initialData ? `Edit ${title}` : `New ${title}`}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
            {/* Core Sections - Always Visible */}
            {coreSections.map((section) => (
              <FormSectionComponent
                key={section.id}
                section={section}
                form={form}
                loading={loading}
                entityType={entityType}
                layoutClass={formLayout.getLayoutClass(section.layout)}
                sectionClassName={formLayout.getSectionClassName(section)}
              />
            ))}
            
            {/* Contextual Sections - Conditionally Visible */}
            {contextualSections.map((conditionalSection, index) => (
              <ConditionalSectionRenderer
                key={`contextual-${index}`}
                condition={conditionalSection.condition}
                section={conditionalSection.section}
                shouldShow={formLayout.shouldShowConditionalSection(conditionalSection.condition)}
                form={form}
                loading={loading}
                entityType={entityType}
                layoutClass={formLayout.getLayoutClass(conditionalSection.section.layout)}
                sectionClassName={formLayout.getSectionClassName(conditionalSection.section)}
              />
            ))}
            
            {/* Optional Sections - Progressive Disclosure */}
            {optionalSections.length > 0 && (
              <div className="border-t border-gray-100 pt-6 space-y-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={formLayout.toggleOptionalSections}
                  className="h-12 w-full text-base font-medium"
                >
                  {formLayout.showOptionalSections ? 'Hide' : 'Show'} Additional Details (Optional)
                </Button>
                
                {formLayout.showOptionalSections && (
                  <div className="space-y-6 mt-6 p-4 bg-gray-50 rounded-lg">
                    {optionalSections.map((section) => (
                      <FormSectionComponent
                        key={section.id}
                        section={section}
                        form={form}
                        loading={loading}
                        entityType={entityType}
                        layoutClass={formLayout.getLayoutClass(section.layout)}
                        sectionClassName={formLayout.getSectionClassName(section)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Notes Section - Universal */}
            <FormFieldRenderer
              field={{
                name: 'notes' as keyof T,
                type: 'textarea',
                label: 'Additional Notes',
                placeholder: `Any additional information about this ${entityType}...`,
                description: 'Internal notes, special requirements, relationship history, etc.'
              }}
              form={form}
              loading={loading}
              className="space-y-6"
            />
            
            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={loading} 
                className="h-12 text-base px-6 rounded-md font-medium
                           focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  submitLabel
                )}
              </Button>
              
              {initialData && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 text-base px-6 rounded-md font-medium
                             focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              )}
            </div>
            
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CoreFormLayout