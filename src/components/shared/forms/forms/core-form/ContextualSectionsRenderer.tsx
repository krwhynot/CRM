import { FieldValues, UseFormReturn } from 'react-hook-form'
import { ConditionalSectionRenderer } from '../ConditionalSectionRenderer'
import type { ConditionalSection } from '@/hooks/useFormLayout'

interface ContextualSectionsRendererProps<T extends FieldValues> {
  sections: ConditionalSection<T>[]
  form: UseFormReturn<T>
  loading: boolean
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  shouldShowConditionalSection: (condition: any) => boolean
  getLayoutClass: (layout?: string) => string
  getSectionClassName: (section: any) => string
}

export function ContextualSectionsRenderer<T extends FieldValues>({
  sections,
  form,
  loading,
  entityType,
  shouldShowConditionalSection,
  getLayoutClass,
  getSectionClassName
}: ContextualSectionsRendererProps<T>) {
  return (
    <>
      {sections.map((conditionalSection, index) => (
        <ConditionalSectionRenderer
          key={`contextual-${index}`}
          condition={conditionalSection.condition}
          section={conditionalSection.section}
          shouldShow={shouldShowConditionalSection(conditionalSection.condition)}
          form={form}
          loading={loading}
          entityType={entityType}
          layoutClass={getLayoutClass(conditionalSection.section.layout)}
          sectionClassName={getSectionClassName(conditionalSection.section)}
        />
      ))}
    </>
  )
}