import type { FieldValues, DefaultValues, SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useFormLayout } from '@/hooks/useFormLayout'
import type * as yup from 'yup'
import type { FormSection, ConditionalSection } from '@/hooks/useFormLayout'

interface CoreFormSetupProps<T extends FieldValues> {
  formSchema: yup.ObjectSchema<T>
  initialData?: Partial<T>
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'activity'
  showAdvancedOptions?: boolean
  coreSections: FormSection<T>[]
  optionalSections?: FormSection<T>[]
  contextualSections?: ConditionalSection<T>[]
  onSubmit: SubmitHandler<T>
}

export function useCoreFormSetup<T extends FieldValues>({
  formSchema,
  initialData,
  entityType,
  showAdvancedOptions = false,
  coreSections,
  optionalSections = [],
  contextualSections = [],
  onSubmit,
}: CoreFormSetupProps<T>) {
  const form = useForm<T>({
    resolver: yupResolver(formSchema) as any,
    defaultValues: initialData as DefaultValues<T>,
  })

  const formLayout = useFormLayout({
    entityType,
    showAdvancedOptions,
    coreSections,
    optionalSections,
    contextualSections,
    form,
  })

  const handleSubmit: SubmitHandler<T> = (data) => {
    const cleanData = formLayout.cleanFormData(data)
    onSubmit(cleanData)
  }

  return {
    form,
    formLayout,
    handleSubmit,
  }
}
