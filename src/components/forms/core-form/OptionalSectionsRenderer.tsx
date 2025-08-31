import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FormSectionComponent } from '../FormSectionComponent'
import type { FormSection } from '@/hooks/useFormLayout'

interface OptionalSectionsRendererProps<T extends FieldValues> {
  sections: FormSection<T>[]
  form: UseFormReturn<T, any, any>
  loading: boolean
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'activity'
  showOptionalSections: boolean
  toggleOptionalSections: () => void
  getLayoutClass: (layout?: FormSection<T>['layout']) => string
  getSectionClassName: (section: FormSection<T>) => string
}

export function OptionalSectionsRenderer<T extends FieldValues>({
  sections,
  form,
  loading,
  entityType,
  showOptionalSections,
  toggleOptionalSections,
  getLayoutClass,
  getSectionClassName,
}: OptionalSectionsRendererProps<T>) {
  if (sections.length === 0) return null

  return (
    <div className="space-y-6 border-t border-gray-100 pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={toggleOptionalSections}
        className="h-12 w-full text-base font-medium"
      >
        {showOptionalSections ? 'Hide' : 'Show'} Additional Details (Optional)
      </Button>

      {showOptionalSections && (
        <div className="mt-6 space-y-6 rounded-lg bg-gray-50 p-4">
          {sections.map((section) => (
            <FormSectionComponent
              key={section.id}
              section={section}
              form={form}
              loading={loading}
              entityType={entityType}
              layoutClass={getLayoutClass(section.layout)}
              sectionClassName={getSectionClassName(section)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
