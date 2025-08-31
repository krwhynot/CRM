import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { FormSectionComponent } from '../FormSectionComponent'
import type { FormSection } from '@/hooks/useFormLayout'

interface CoreSectionsRendererProps<T extends FieldValues> {
  sections: FormSection<T>[]
  form: UseFormReturn<T, any, any>
  loading: boolean
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'activity'
  getLayoutClass: (layout?: FormSection<T>['layout']) => string
  getSectionClassName: (section: FormSection<T>) => string
}

export function CoreSectionsRenderer<T extends FieldValues>({
  sections,
  form,
  loading,
  entityType,
  getLayoutClass,
  getSectionClassName,
}: CoreSectionsRendererProps<T>) {
  return (
    <>
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
    </>
  )
}
