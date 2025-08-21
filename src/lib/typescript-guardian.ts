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
      const value = (obj as Record<string, unknown>)[prop]
      
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

// ==================== RUNTIME TYPE VALIDATION ====================
// NOTE: Currently unused but available for future type validation needs

/**
 * Runtime type validation for CRM entities (Currently unused)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RuntimeValidator {
  /**
   * Validates organization type and priority values
   */
  static validateOrganization(data: unknown): {
    isValid: boolean
    errors: string[]
    typedData?: Record<string, unknown>
  } {
    const errors: string[] = []
    
    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Invalid organization data'] }
    }

    const obj = data as Record<string, unknown>

    // Required fields
    if (!obj.name || typeof obj.name !== 'string') {
      errors.push('Organization name is required and must be a string')
    }

    // Type validation
    const validTypes = ['customer', 'principal', 'distributor', 'prospect', 'vendor'] as const
    if (!TypeGuards.isValidEnumValue(obj.type, validTypes)) {
      errors.push(`Invalid organization type. Must be one of: ${validTypes.join(', ')}`)
    }

    // Priority validation
    const validPriorities = ['A', 'B', 'C', 'D'] as const
    if (!TypeGuards.isValidEnumValue(obj.priority, validPriorities)) {
      errors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`)
    }

    // Auto-derive boolean flags if missing
    const typedData = {
      ...obj,
      is_principal: obj.is_principal ?? obj.type === 'principal',
      is_distributor: obj.is_distributor ?? obj.type === 'distributor'
    }

    return {
      isValid: errors.length === 0,
      errors,
      typedData: errors.length === 0 ? typedData : undefined
    }
  }

  /**
   * Validates contact form data
   */
  static validateContact(data: unknown): {
    isValid: boolean
    errors: string[]
    typedData?: Record<string, unknown>
  } {
    const errors: string[] = []
    
    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Invalid contact data'] }
    }

    const obj = data as Record<string, unknown>

    // Required fields
    if (!obj.first_name || typeof obj.first_name !== 'string') {
      errors.push('First name is required and must be a string')
    }

    if (!obj.last_name || typeof obj.last_name !== 'string') {
      errors.push('Last name is required and must be a string')
    }

    if (!obj.organization_id || !TypeGuards.isValidUUID(obj.organization_id)) {
      errors.push('Valid organization ID is required')
    }

    // Enum validations
    const validInfluences = ['High', 'Medium', 'Low', 'Unknown'] as const
    if (!TypeGuards.isValidEnumValue(obj.purchase_influence, validInfluences)) {
      errors.push(`Invalid purchase influence. Must be one of: ${validInfluences.join(', ')}`)
    }

    const validAuthorities = ['Decision Maker', 'Influencer', 'End User', 'Gatekeeper'] as const
    if (!TypeGuards.isValidEnumValue(obj.decision_authority, validAuthorities)) {
      errors.push(`Invalid decision authority. Must be one of: ${validAuthorities.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      typedData: errors.length === 0 ? obj : undefined
    }
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

// ==================== ERROR DETECTION & REPORTING ====================
// NOTE: Currently unused but available for future error detection needs

/**
 * TypeScript error detection and reporting (Currently unused)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ErrorDetector {
  /**
   * Detects common TypeScript patterns that cause errors
   */
  static detectCommonIssues(codeContent: string): {
    resolverTypeConflicts: boolean
    missingControlProps: boolean
    nullabilityMismatches: boolean
    enumValueErrors: boolean
  } {
    return {
      resolverTypeConflicts: /Resolver<.*> is not assignable to type 'Resolver<.*>/.test(codeContent),
      missingControlProps: /Property 'control' is missing/.test(codeContent),
      nullabilityMismatches: /Type 'null' is not assignable to type/.test(codeContent),
      enumValueErrors: /Type '".*"' is not assignable to type/.test(codeContent)
    }
  }

  /**
   * Generates fix suggestions for detected issues
   */
  static generateFixSuggestions(issues: ReturnType<typeof ErrorDetector.detectCommonIssues>): string[] {
    const suggestions: string[] = []

    if (issues.resolverTypeConflicts) {
      suggestions.push('Use createTypeSafeResolver() from form-resolver.ts to fix resolver type conflicts')
    }

    if (issues.missingControlProps) {
      suggestions.push('Add control prop to form field components or use FormComponentValidator.generateMissingProps()')
    }

    if (issues.nullabilityMismatches) {
      suggestions.push('Use TypeInference.databaseToFormType() to convert nullable database types to optional form types')
    }

    if (issues.enumValueErrors) {
      suggestions.push('Use TypeGuards.isValidEnumValue() to validate enum values before assignment')
    }

    return suggestions
  }
}

// ==================== DEVELOPMENT UTILITIES ====================
// NOTE: Currently unused but available for future development utilities

/**
 * Development utilities for enhanced TypeScript support (Currently unused)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DevUtils {
  /**
   * Logs detailed type information for debugging
   */
  static logTypeInfo(value: unknown, context: string = ''): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 TypeScript Guardian - ${context}`)
      console.log('Value:', value)
      console.log('Type:', typeof value)
      console.log('Constructor:', value?.constructor?.name)
      console.log('Is Array:', Array.isArray(value))
      console.log('Is Object:', value !== null && typeof value === 'object')
      console.groupEnd()
    }
  }

  /**
   * Creates a development-time type checker
   */
  static createTypeChecker<T>(
    typeGuard: (value: unknown) => value is T,
    errorMessage: string = 'Type validation failed'
  ) {
    return (value: unknown): T => {
      if (typeGuard(value)) {
        return value
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`🚨 TypeScript Guardian: ${errorMessage}`, value)
        DevUtils.logTypeInfo(value, 'Type Checker Failed')
      }
      
      throw new Error(errorMessage)
    }
  }

  /**
   * Validates component props at runtime in development
   */
  static validateProps<T>(props: T, validator: (props: T) => boolean, componentName: string): T {
    if (process.env.NODE_ENV === 'development' && !validator(props)) {
      console.error(`🚨 TypeScript Guardian: Invalid props for ${componentName}`, props)
      throw new Error(`Invalid props for ${componentName}`)
    }
    return props
  }
}

// ==================== EXPORTS ====================

export default {
  TypeGuards,
  TypeInference,
  FormComponentValidator
  // RuntimeValidator, ErrorDetector, DevUtils are commented out as they're currently unused
}