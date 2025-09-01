import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { FormSectionComponent } from './FormSectionComponent'
import type { FormSection } from '@/hooks/useFormLayout'

interface ConditionalSectionRendererProps<T extends FieldValues> {
  condition: (values: T) => boolean
  section: FormSection<T>
  shouldShow: boolean
  form: UseFormReturn<T, any, undefined>
  loading: boolean
  entityType: string
  layoutClass: string
  sectionClassName: string
}

export function ConditionalSectionRenderer<T extends FieldValues>({
  section,
  shouldShow,
  form,
  loading,
  entityType,
  layoutClass,
  sectionClassName,
}: ConditionalSectionRendererProps<T>) {
  if (!shouldShow) return null

  return (
    <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
      <FormSectionComponent
        section={section}
        form={form as any}
        loading={loading}
        entityType={entityType}
        layoutClass={layoutClass}
        sectionClassName={sectionClassName}
      />
    </div>
  )
}
