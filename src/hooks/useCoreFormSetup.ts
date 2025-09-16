import type { FieldValues, DefaultValues, SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useFormLayout } from '@/hooks/useFormLayout'
import type { z } from 'zod'
import type { FormSection, ConditionalSection } from '@/hooks/useFormLayout'
import { createResolver } from '@/lib/form-resolver'

interface CoreFormSetupProps<T extends FieldValues> {
  formSchema: z.ZodType<T>
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
    resolver: createResolver(formSchema) as never,
    defaultValues: initialData as DefaultValues<T>,
  })

  const formLayout = useFormLayout({
    entityType,
    showAdvancedOptions,
    coreSections,
    optionalSections,
    contextualSections,
    form: form as never,
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
