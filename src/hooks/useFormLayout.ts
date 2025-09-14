import { useState, useCallback } from 'react'
import type { FieldValues, UseFormReturn, RegisterOptions } from 'react-hook-form'
import { semanticSpacing, semanticRadius, semanticColors } from '@/styles/tokens'

export interface FormSection<T extends FieldValues> {
  id: string
  title?: string
  description?: string
  fields: FormFieldConfig<T>[]
  layout?: 'single' | 'double' | 'triple' | 'auto'
  className?: string
}

export interface FormFieldConfig<T extends FieldValues> {
  name: keyof T
  type: 'text' | 'select' | 'textarea' | 'switch' | 'checkbox' | 'number' | 'email' | 'tel' | 'url'
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  options?: SelectOption[]
  tooltip?: string
  validation?: RegisterOptions
  conditional?: (values: T) => boolean
  className?: string
}

export interface ConditionalSection<T extends FieldValues> {
  condition: (values: T) => boolean
  section: FormSection<T>
}

export interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: string
  badge?: { text: string; variant: string; className?: string }
}

interface UseFormLayoutProps<T extends FieldValues> {
  entityType: string
  coreSections: FormSection<T>[]
  optionalSections?: FormSection<T>[]
  contextualSections?: ConditionalSection<T>[]
  showAdvancedOptions?: boolean
  form: UseFormReturn<T, FieldValues, undefined> // Accept properly typed form to work with React Hook Form
}

interface UseFormLayoutReturn<T extends FieldValues> {
  showOptionalSections: boolean
  toggleOptionalSections: () => void
  watchedValues: T
  getLayoutClass: (layout?: FormSection<T>['layout']) => string
  getSectionClassName: (section: FormSection<T>) => string
  shouldShowConditionalSection: (condition: (values: T) => boolean) => boolean
  cleanFormData: (data: T) => T
}

export const useFormLayout = <T extends FieldValues>({
  entityType,
  form,
}: UseFormLayoutProps<T>): UseFormLayoutReturn<T> => {
  const [showOptionalSections, setShowOptionalSections] = useState(false) // Default to false, can be managed by consuming component

  const watchedValues = form.watch()

  // Toggle optional sections visibility
  const toggleOptionalSections = () => {
    setShowOptionalSections(!showOptionalSections)
  }

  // Get responsive layout class for section
  const getLayoutClass = useCallback((layout?: FormSection<T>['layout']): string => {
    switch (layout) {
      case 'single':
        return semanticSpacing.stack.lg
      case 'double':
        return `grid grid-cols-1 md:grid-cols-2 ${semanticSpacing.gap.lg}`
      case 'triple':
        return `grid grid-cols-1 md:grid-cols-3 ${semanticSpacing.gap.lg}`
      case 'auto':
        return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${semanticSpacing.gap.lg}`
      default:
        return semanticSpacing.stack.lg
    }
  }, [])

  // Get entity-specific section styling
  const getSectionClassName = useCallback(
    (section: FormSection<T>): string => {
      const baseClass = `${semanticSpacing.stack.xl} ${section.className || ''}`
      return entityType === 'activity'
        ? `${baseClass} ${semanticColors.background.info} ${semanticSpacing.cardContainer} ${semanticRadius.card}`
        : baseClass
    },
    [entityType]
  )

  // Check if conditional section should be shown
  const shouldShowConditionalSection = (condition: (values: T) => boolean): boolean => {
    return condition(watchedValues)
  }

  // Clean form data by converting empty strings to null
  const cleanFormData = (data: T): T => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === '' ? null : value,
      ])
    ) as T
  }

  return {
    showOptionalSections,
    toggleOptionalSections,
    watchedValues,
    getLayoutClass,
    getSectionClassName,
    shouldShowConditionalSection,
    cleanFormData,
  }
}
