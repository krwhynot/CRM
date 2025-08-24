import { useForm, FieldValues, DefaultValues } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useFormLayout } from '@/hooks/useFormLayout'
import * as yup from 'yup'
import type { FormSection, ConditionalSection } from '@/hooks/useFormLayout'

interface CoreFormSetupProps<T extends FieldValues> {
  formSchema: yup.ObjectSchema<T>
  initialData?: Partial<T>
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  showAdvancedOptions?: boolean
  coreSections: FormSection<T>[]
  optionalSections?: FormSection<T>[]
  contextualSections?: ConditionalSection<T>[]
  onSubmit: (data: T) => void | Promise<void>
}

export function useCoreFormSetup<T extends FieldValues>({
  formSchema,
  initialData,
  entityType,
  showAdvancedOptions = false,
  coreSections,
  optionalSections = [],
  contextualSections = [],
  onSubmit
}: CoreFormSetupProps<T>) {
  const form = useForm<T>({
    resolver: yupResolver(formSchema),
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

  return {
    form,
    formLayout,
    handleSubmit
  }
}