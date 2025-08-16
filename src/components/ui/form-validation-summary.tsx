"use client"

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { type FieldErrors } from 'react-hook-form'

interface FormValidationSummaryProps {
  errors: FieldErrors
  isSubmitting?: boolean
  showSuccessState?: boolean
  onClearErrors?: () => void
}

export function FormValidationSummary({ 
  errors, 
  isSubmitting = false,
  showSuccessState = false,
  onClearErrors 
}: FormValidationSummaryProps) {
  const errorMessages = React.useMemo(() => {
    const messages: string[] = []
    
    function extractErrors(obj: any, prefix = '') {
      Object.keys(obj).forEach(key => {
        const value = obj[key]
        const fieldName = prefix ? `${prefix}.${key}` : key
        
        if (value?.message) {
          messages.push(`${formatFieldName(fieldName)}: ${value.message}`)
        } else if (value && typeof value === 'object') {
          extractErrors(value, fieldName)
        }
      })
    }
    
    extractErrors(errors)
    return messages
  }, [errors])

  const hasErrors = errorMessages.length > 0

  // Show success state when explicitly requested and no errors
  if (showSuccessState && !hasErrors && !isSubmitting) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Form validation passed. Ready to submit.
        </AlertDescription>
      </Alert>
    )
  }

  // Don't show anything if no errors
  if (!hasErrors) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-medium mb-2">
              Please fix the following {errorMessages.length === 1 ? 'error' : 'errors'}:
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errorMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
          {onClearErrors && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearErrors}
              className="ml-2 p-1 h-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Helper function to format field names for display
function formatFieldName(fieldName: string): string {
  return fieldName
    .split('.')
    .map(part => {
      // Convert snake_case to Title Case
      return part
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
        .replace(/\b\w/g, letter => letter.toUpperCase())
    })
    .join(' > ')
}

// Hook for managing form validation state
export function useFormValidation() {
  const [showValidationSummary, setShowValidationSummary] = React.useState(false)
  const [lastSubmitAttempt, setLastSubmitAttempt] = React.useState<Date | null>(null)

  const handleSubmitAttempt = React.useCallback(() => {
    setLastSubmitAttempt(new Date())
    setShowValidationSummary(true)
  }, [])

  const clearValidationErrors = React.useCallback(() => {
    setShowValidationSummary(false)
  }, [])

  const shouldShowSummary = React.useCallback((hasErrors: boolean) => {
    return showValidationSummary && (hasErrors || lastSubmitAttempt)
  }, [showValidationSummary, lastSubmitAttempt])

  return {
    showValidationSummary: shouldShowSummary,
    handleSubmitAttempt,
    clearValidationErrors
  }
}