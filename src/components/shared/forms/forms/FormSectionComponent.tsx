import { FieldValues, UseFormReturn } from 'react-hook-form'
import { FormFieldRenderer } from './FormFieldRenderer'
import type { FormSection } from '@/hooks/useFormLayout'

interface FormSectionProps<T extends FieldValues> {
  section: FormSection<T>
  form: UseFormReturn<T>
  loading: boolean
  entityType: string
  layoutClass: string
  sectionClassName: string
}

export function FormSectionComponent<T extends FieldValues>({ 
  section, 
  form, 
  loading, 
  entityType,
  layoutClass,
  sectionClassName
}: FormSectionProps<T>) {
  // Use entityType for section-specific styling or behavior
  const sectionKey = `${section.id}-${entityType}`;
  
  return (
    <div className={sectionClassName} data-section={sectionKey}>
      {section.title && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {section.title}
          </h3>
          {section.description && (
            <p className="text-sm text-gray-600">
              {section.description}
            </p>
          )}
        </div>
      )}
      
      <div className={layoutClass}>
        {section.fields.map((field) => (
          <FormFieldRenderer
            key={String(field.name)}
            field={field}
            form={form}
            loading={loading}
            className={field.className}
          />
        ))}
      </div>
    </div>
  )
}
