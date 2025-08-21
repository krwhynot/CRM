/**
 * Enhanced Type-Safe Form Resolver
 * 
 * Bridges the gap between Yup schemas and React Hook Form types
 * by providing a properly typed resolver that handles the differences
 * between Yup's transform output and React Hook Form's expected input.
 * 
 * Features automatic type conflict detection and resolution.
 */

import React from 'react'
import { type Resolver, type FieldValues, type Control } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import type { AnyObjectSchema } from 'yup'
import { TypeInference, FormComponentValidator } from './typescript-guardian'

/**
 * Enhanced type-safe resolver with automatic conflict detection
 */
export function createTypeSafeResolver<TFormValues extends FieldValues>(
  schema: AnyObjectSchema,
  options?: {
    autoTransformNullable?: boolean
    strictTypeValidation?: boolean
  }
): Resolver<TFormValues> {
  const {
    autoTransformNullable = true,
    strictTypeValidation = false
  } = options || {}

  const baseResolver = yupResolver(schema)
  
  return async (values, context, options) => {
    let processedValues = values

    // Auto-transform nullable fields if enabled
    if (autoTransformNullable) {
      processedValues = TypeInference.formToDatabaseType(values)
    }

    // Strict type validation if enabled
    if (strictTypeValidation) {
      const validationResult = validateFormValues(processedValues, schema)
      if (!validationResult.isValid) {
        console.warn('🚨 TypeScript Guardian: Form validation warnings:', validationResult.warnings)
      }
    }

    // Use the base yup resolver but return it with the correct typing
    const result = await baseResolver(processedValues as FieldValues, context, options)
    
    // Transform result values back to form-compatible format
    const transformedValues = autoTransformNullable 
      ? TypeInference.databaseToFormType(result.values)
      : result.values

    return {
      values: transformedValues as TFormValues,
      errors: result.errors
    }
  }
}

/**
 * Validates form values against expected patterns
 */
function validateFormValues(values: Record<string, unknown>, schema: AnyObjectSchema): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  
  // Check for common type conflicts
  const schemaFields = schema.fields || {}
  
  for (const [fieldName, value] of Object.entries(values)) {
    if (schemaFields[fieldName]) {
      // Check for null/undefined mismatches
      if (value === null && typeof schemaFields[fieldName] === 'object') {
        warnings.push(`Field '${fieldName}' is null but schema expects a specific type`)
      }
      
      // Check for empty string to null conversion needs
      if (value === '' && (schemaFields[fieldName] as { spec?: { nullable?: boolean } })?.spec?.nullable) {
        warnings.push(`Field '${fieldName}' is empty string but should be null for nullable schema`)
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings
  }
}

/**
 * Data transformer for converting between database types and form types
 * Handles the conversion of null/undefined values for React Hook Form
 */
export class FormDataTransformer {
  /**
   * Converts database entity to form-compatible data
   * Handles null to undefined conversion for optional fields
   */
  static toFormData<TFormData>(dbEntity: Record<string, unknown>): Partial<TFormData> {
    if (!dbEntity) return {}
    
    const formData: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(dbEntity)) {
      // Convert null to undefined for optional fields in forms
      // Keep original value for required fields
      formData[key] = value === null ? undefined : value
    }
    
    return formData as Partial<TFormData>
  }
  
  /**
   * Converts form data to database-compatible format
   * Handles undefined to null conversion for database storage
   */
  static fromFormData(formData: Record<string, unknown>): Record<string, unknown> {
    if (!formData) return {}
    
    const dbData: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(formData)) {
      // Convert empty strings and undefined to null for database
      if (value === '' || value === undefined) {
        dbData[key] = null
      } else {
        dbData[key] = value
      }
    }
    
    return dbData
  }
  
  /**
   * Validates that required fields are present and not empty
   */
  static validateRequired(data: Record<string, unknown>, requiredFields: string[]): string[] {
    const errors: string[] = []
    
    for (const field of requiredFields) {
      const value = data[field]
      if (value === null || value === undefined || value === '') {
        errors.push(`${field} is required`)
      }
    }
    
    return errors
  }
}

/**
 * Type utility to make nullable fields optional for React Hook Form
 */
export type FormCompatible<T> = {
  [K in keyof T]: T[K] extends string | null 
    ? string | undefined
    : T[K] extends number | null
    ? number | undefined  
    : T[K] extends boolean | null
    ? boolean | undefined
    : T[K]
}

/**
 * Helper to create form-compatible default values
 */
export function createFormDefaults<T>(
  defaults: Partial<T>,
  overrides?: Partial<T>
): T {
  return {
    ...defaults,
    ...overrides
  } as T
}

/**
 * Enhanced form component prop utilities
 */
export class FormPropGuardian {
  /**
   * Validates and auto-fixes form field component props
   */
  static validateAndFixProps<T extends FieldValues>(
    props: Record<string, unknown>,
    control: Control<T>,
    componentName: string = 'FormField'
  ): Record<string, unknown> {
    const validation = FormComponentValidator.validateFieldProps(props)
    
    if (!validation.isValid) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🔧 TypeScript Guardian: Auto-fixing props for ${componentName}:`, validation.errors)
      }
      
      // Auto-generate missing props
      const fixedProps = FormComponentValidator.generateMissingProps(props, control)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ TypeScript Guardian: Fixed props for ${componentName}:`, fixedProps)
      }
      
      return fixedProps
    }
    
    return props
  }

  /**
   * Creates a Higher-Order Component that auto-fixes prop issues
   */
  static withTypeSafety<T extends FieldValues>(
    WrappedComponent: React.ComponentType<Record<string, unknown>>,
    control: Control<T>,
    componentName?: string
  ) {
    return function TypeSafeComponent(props: Record<string, unknown>) {
      const safeProps = FormPropGuardian.validateAndFixProps(
        props, 
        control, 
        componentName || WrappedComponent.displayName || WrappedComponent.name
      )
      
      return React.createElement(WrappedComponent, safeProps)
    }
  }

  /**
   * Development-time prop validator decorator
   */
  static validatePropsDecorator<T extends FieldValues>(
    target: Record<string, unknown>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    
    descriptor.value = function(this: unknown, props: Record<string, unknown>, control: Control<T>) {
      if (process.env.NODE_ENV === 'development') {
        const validation = FormComponentValidator.validateFieldProps(props)
        if (!validation.isValid) {
          console.error(`🚨 TypeScript Guardian: Invalid props in ${target.constructor.name}.${propertyKey}:`, validation.errors)
        }
      }
      
      return originalMethod.apply(this, [props, control])
    }
    
    return descriptor
  }
}

/**
 * Type-safe form field prop generator
 */
export function createTypeSafeFieldProps<T extends FieldValues>(
  name: keyof T,
  control: Control<T>,
  additionalProps?: Record<string, unknown>
): {
  name: keyof T
  control: Control<T>
} & Record<string, unknown> {
  return {
    name,
    control,
    ...additionalProps
  }
}

/**
 * Resolver factory with enhanced type safety for specific CRM entities
 */
export class CRMResolverFactory {
  /**
   * Creates a type-safe resolver specifically for Contact forms
   */
  static createContactResolver<T extends FieldValues>(schema: AnyObjectSchema): Resolver<T> {
    return createTypeSafeResolver<T>(schema, {
      autoTransformNullable: true,
      strictTypeValidation: true
    })
  }

  /**
   * Creates a type-safe resolver specifically for Organization forms
   */
  static createOrganizationResolver<T extends FieldValues>(schema: AnyObjectSchema): Resolver<T> {
    return createTypeSafeResolver<T>(schema, {
      autoTransformNullable: true,
      strictTypeValidation: true
    })
  }

  /**
   * Creates a type-safe resolver specifically for Opportunity forms
   */
  static createOpportunityResolver<T extends FieldValues>(schema: AnyObjectSchema): Resolver<T> {
    return createTypeSafeResolver<T>(schema, {
      autoTransformNullable: true,
      strictTypeValidation: false // Opportunities have more dynamic fields
    })
  }
}