import { useMemo } from 'react'
import { type Control, type FieldValues, useWatch } from 'react-hook-form'
import type { SimpleFormField } from '../SimpleForm'

interface UseFormProgressProps<T extends FieldValues = FieldValues> {
  control: Control<T>
  fields: SimpleFormField[]
}

interface FormProgressResult {
  completed: number
  total: number
  percentage: number
  isComplete: boolean
  isNearCompletion: boolean
  completedFields: string[]
  remainingFields: string[]
}

export function useFormProgress<T extends FieldValues = FieldValues>({
  control,
  fields,
}: UseFormProgressProps<T>): FormProgressResult {
  // Watch all form values for real-time updates
  const formValues = useWatch({ control })

  return useMemo(() => {
    // Filter fields that are currently visible based on conditions
    // Exclude heading fields from progress calculation
    const visibleFields = fields.filter((field) => {
      // Skip heading fields
      if (field.type === 'heading') return false
      // Skip fields without names (they can't be tracked)
      if (!field.name) return false
      // Check conditions
      if (!field.condition) return true
      return field.condition(formValues)
    })

    // Get only required fields that are visible
    const requiredFields = visibleFields.filter((field) => 'required' in field && field.required)

    // Calculate which required fields are completed
    const completedFields: string[] = []
    const remainingFields: string[] = []

    requiredFields.forEach((field) => {
      if (!field.name) return // Skip fields without names

      const value = formValues[field.name]
      const isCompleted = isFieldCompleted(value)

      if (isCompleted) {
        completedFields.push(field.name)
      } else {
        remainingFields.push(field.name)
      }
    })

    const completed = completedFields.length
    const total = requiredFields.length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    const isComplete = completed === total && total > 0
    const isNearCompletion = percentage >= 75 && !isComplete

    return {
      completed,
      total,
      percentage,
      isComplete,
      isNearCompletion,
      completedFields,
      remainingFields,
    }
  }, [formValues, fields])
}

function isFieldCompleted(value: unknown): boolean {
  // Handle different field value types
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value)
  }

  if (typeof value === 'boolean') {
    return true // Boolean fields are considered complete if they have any value
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }

  // For any other type, consider it completed if it's not falsy
  return Boolean(value)
}
