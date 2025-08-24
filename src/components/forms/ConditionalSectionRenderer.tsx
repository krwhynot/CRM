import React from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { FormSectionComponent } from './FormSectionComponent'
import type { FormSection } from '@/hooks/useFormLayout'

interface ConditionalSectionRendererProps<T extends FieldValues> {
  condition: (values: T) => boolean
  section: FormSection<T>
  shouldShow: boolean
  form: UseFormReturn<T>
  loading: boolean
  entityType: string
  layoutClass: string
  sectionClassName: string
}

export function ConditionalSectionRenderer<T extends FieldValues>({
  condition,
  section,
  shouldShow,
  form,
  loading,
  entityType,
  layoutClass,
  sectionClassName
}: ConditionalSectionRendererProps<T>) {
  if (!shouldShow) return null
  
  return (
    <div className="p-4 rounded-lg border-l-4 bg-blue-50 border-blue-400">
      <FormSectionComponent
        section={section}
        form={form}
        loading={loading}
        entityType={entityType}
        layoutClass={layoutClass}
        sectionClassName={sectionClassName}
      />
    </div>
  )
}