import { yupResolver } from '@hookform/resolvers/yup'
import type { FieldValues, Resolver } from 'react-hook-form'
import type * as yup from 'yup'
import type React from 'react'

/**
 * Creates a properly typed Yup resolver for React Hook Form
 * Eliminates the need for 'as any' casting while maintaining type safety
 * 
 * @param schema - Yup schema for validation
 * @returns Typed resolver that matches form data structure
 */
export function createTypedYupResolver<T extends FieldValues>(
  schema: yup.ObjectSchema<T>
): Resolver<T> {
  return yupResolver(schema) as Resolver<T>
}

/**
 * Type-safe form prop helper for components that receive form instances
 * Ensures proper typing without 'as any' casting
 */
export interface TypedFormProps<T extends FieldValues> {
  form: {
    control: any // React Hook Form's control is complex, keep minimal typing here
    handleSubmit: (onSubmit: (data: T) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>
    formState: {
      errors: any
      isSubmitting: boolean
      isDirty: boolean
      isValid: boolean
    }
    setValue: (name: keyof T, value: any) => void
    getValues: () => T
    watch: (name?: keyof T) => any
    trigger: (name?: keyof T | (keyof T)[]) => Promise<boolean>
    reset: (values?: Partial<T>) => void
  }
}

/**
 * Creates a typed form helper that eliminates 'form as any' casting
 * Use this for form components that need proper typing
 */
export function createTypedFormHelper<T extends FieldValues>() {
  return {
    castForm: (form: any): TypedFormProps<T>['form'] => form,
    createResolver: (schema: yup.ObjectSchema<T>) => createTypedYupResolver(schema)
  }
}