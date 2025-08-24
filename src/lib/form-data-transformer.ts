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