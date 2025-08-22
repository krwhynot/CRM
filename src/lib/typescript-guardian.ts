/**
 * TypeScript Guardian - Enhanced Type Safety & Error Prevention
 * 
 * A comprehensive utility for preventing TypeScript errors in the KitchenPantry CRM system.
 * Provides runtime type validation, automatic type inference, and proactive error detection.
 */

import { type FieldValues, type Control } from 'react-hook-form'
import type { AnyObjectSchema } from 'yup'

// ==================== TYPE GUARDS ====================

/**
 * Enhanced type guards for CRM entities
 */
export class TypeGuards {
  /**
   * Validates that an object has all required properties with correct types
   */
  static hasRequiredProperties<T extends Record<string, unknown>>(
    obj: unknown,
    requiredProps: Array<keyof T>,
    typeCheckers?: Partial<Record<keyof T, (value: unknown) => boolean>>
  ): obj is T {
    if (!obj || typeof obj !== 'object') return false
    
    for (const prop of requiredProps) {
      const value = (obj as Record<string, unknown>)[prop as string]
      
      // Check if property exists
      if (value === undefined) return false
      
      // Check specific type if provided
      if (typeCheckers?.[prop] && !typeCheckers[prop]!(value)) {
        return false
      }
    }
    
    return true
  }

  /**
   * Validates React Hook Form control object
   */
  static isValidControl(control: unknown): control is Control<FieldValues> {
    return (
      control !== null &&
      control !== undefined &&
      typeof control === 'object' &&
      'register' in control &&
      'handleSubmit' in control &&
      'formState' in control
    )
  }

  /**
   * Validates form field component props
   */
  static hasValidFormFieldProps<T extends FieldValues>(
    props: unknown
  ): props is { name: keyof T; control: Control<T> } {
    return (
      props !== null &&
      props !== undefined &&
      typeof props === 'object' &&
      'name' in props &&
      'control' in props &&
      TypeGuards.isValidControl((props as Record<string, unknown>).control)
    )
  }

  /**
   * Validates that a value matches expected enum values
   */
  static isValidEnumValue<T extends readonly string[]>(
    value: unknown,
    enumValues: T
  ): value is T[number] {
    return typeof value === 'string' && enumValues.includes(value as T[number])
  }

  /**
   * Validates UUID format
   */
  static isValidUUID(value: unknown): value is string {
    if (typeof value !== 'string') return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  }
}


// ==================== AUTOMATIC TYPE INFERENCE ====================

/**
 * Automatic type inference helpers
 */
export class TypeInference {
  /**
   * Infers the correct TypeScript interface from a Yup schema
   */
  static inferFormTypeFromSchema<T extends AnyObjectSchema>(
    _schema: T
  ): string {
    // Generate TypeScript interface string from Yup schema
    // This is a simplified version - in practice, you'd use a more sophisticated parser
    return `type InferredFormType = yup.InferType<typeof schema>`
  }

  /**
   * Generates type-safe default values for forms
   */
  static generateSafeDefaults<T extends Record<string, unknown>>(
    schema: AnyObjectSchema,
    overrides?: Partial<T>
  ): T {
    const defaults: Record<string, unknown> = {}
    
    // Extract schema fields and their types
    const fields = schema.fields || {}
    
    for (const [fieldName, fieldSchema] of Object.entries(fields)) {
      if (fieldSchema && typeof fieldSchema === 'object' && 'type' in fieldSchema) {
        switch (fieldSchema.type) {
          case 'string':
            defaults[fieldName] = ''
            break
          case 'number':
            defaults[fieldName] = 0
            break
          case 'boolean':
            defaults[fieldName] = false
            break
          case 'array':
            defaults[fieldName] = []
            break
          default:
            defaults[fieldName] = null
        }
      }
    }

    return { ...defaults, ...overrides } as T
  }

  /**
   * Converts nullable database types to optional form types
   */
  static databaseToFormType<T>(dbEntity: T): Partial<T> {
    if (!dbEntity || typeof dbEntity !== 'object') return {}

    const formData: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(dbEntity)) {
      // Convert null to undefined for React Hook Form compatibility
      formData[key] = value === null ? undefined : value
    }

    return formData as Partial<T>
  }

  /**
   * Converts optional form types to nullable database types
   */
  static formToDatabaseType<T>(formData: T): T {
    if (!formData || typeof formData !== 'object') return formData

    const dbData: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(formData)) {
      // Convert empty strings and undefined to null for database
      if (value === '' || value === undefined) {
        dbData[key] = null
      } else {
        dbData[key] = value
      }
    }

    return dbData as T
  }
}

// ==================== FORM COMPONENT VALIDATION ====================

/**
 * Form component prop validation
 */
export class FormComponentValidator {
  /**
   * Validates that form field components have required props
   */
  static validateFieldProps<_T extends FieldValues>(
    props: Record<string, unknown>,
    requiredProps: string[] = ['name', 'control']
  ): { isValid: boolean; missingProps: string[]; errors: string[] } {
    const missingProps: string[] = []
    const errors: string[] = []

    for (const prop of requiredProps) {
      if (!(prop in props) || props[prop] === undefined) {
        missingProps.push(prop)
        errors.push(`Missing required prop: ${prop}`)
      }
    }

    // Special validation for control prop
    if ('control' in props && !TypeGuards.isValidControl(props.control)) {
      errors.push('Invalid control prop - must be a valid React Hook Form control object')
    }

    return {
      isValid: missingProps.length === 0 && errors.length === 0,
      missingProps,
      errors
    }
  }

  /**
   * Auto-generates missing props for form components
   */
  static generateMissingProps<T extends FieldValues>(
    existingProps: Record<string, unknown>,
    control: Control<T>
  ): Record<string, unknown> {
    const generatedProps = { ...existingProps }

    // Add control if missing
    if (!generatedProps.control) {
      generatedProps.control = control
    }

    // Add default name if missing
    if (!generatedProps.name && existingProps.fieldName) {
      generatedProps.name = existingProps.fieldName
    }

    return generatedProps
  }
}



// ==================== EXPORTS ====================

export default {
  TypeGuards,
  TypeInference,
  FormComponentValidator
}