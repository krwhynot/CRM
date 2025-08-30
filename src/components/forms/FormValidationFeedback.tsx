import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FieldError {
  field: string
  message: string
  type?: 'error' | 'warning' | 'info'
}

interface FormValidationFeedbackProps {
  errors?: FieldError[]
  isValid?: boolean
  isDirty?: boolean
  isSubmitting?: boolean
  submitAttempted?: boolean
  className?: string
}

export const FormValidationFeedback: React.FC<FormValidationFeedbackProps> = ({
  errors = [],
  isValid = true,
  isDirty = false,
  isSubmitting = false,
  submitAttempted = false,
  className
}) => {
  const errorCount = errors.filter(e => e.type !== 'warning' && e.type !== 'info').length
  const warningCount = errors.filter(e => e.type === 'warning').length
  
  if (isSubmitting) {
    return (
      <Alert className={cn("border-blue-200 bg-blue-50", className)}>
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Submitting form... Please wait.
        </AlertDescription>
      </Alert>
    )
  }

  if (isValid && submitAttempted && !isSubmitting) {
    return (
      <Alert className={cn("border-green-200 bg-green-50", className)}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Form submitted successfully!
        </AlertDescription>
      </Alert>
    )
  }

  if (errorCount > 0) {
    return (
      <Alert className={cn("border-red-200 bg-red-50", className)}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {errorCount === 1 ? '1 error found:' : `${errorCount} errors found:`}
              </span>
              <Badge variant="destructive" className="text-xs">
                Fix required
              </Badge>
            </div>
            <ul className="space-y-1 text-sm">
              {errors
                .filter(e => e.type !== 'warning' && e.type !== 'info')
                .map((error, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>
                      <span className="font-medium capitalize">{error.field.replace('_', ' ')}:</span>{' '}
                      {error.message}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (warningCount > 0) {
    return (
      <Alert className={cn("border-orange-200 bg-orange-50", className)}>
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {warningCount === 1 ? '1 recommendation:' : `${warningCount} recommendations:`}
              </span>
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                Optional
              </Badge>
            </div>
            <ul className="space-y-1 text-sm">
              {errors
                .filter(e => e.type === 'warning')
                .map((warning, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>
                      <span className="font-medium capitalize">{warning.field.replace('_', ' ')}:</span>{' '}
                      {warning.message}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (isDirty && isValid) {
    return (
      <Alert className={cn("border-green-200 bg-green-50", className)}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          <div className="flex items-center gap-2">
            <span>Form looks good! Ready to submit.</span>
            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
              Valid
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

interface FieldValidationIndicatorProps {
  hasError?: boolean
  isValid?: boolean
  isValidating?: boolean
  className?: string
}

export const FieldValidationIndicator: React.FC<FieldValidationIndicatorProps> = ({
  hasError = false,
  isValid = false,
  isValidating = false,
  className
}) => {
  if (isValidating) {
    return (
      <div className={cn("flex items-center text-blue-500", className)}>
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (hasError) {
    return (
      <AlertCircle className={cn("h-4 w-4 text-red-500", className)} />
    )
  }

  if (isValid) {
    return (
      <CheckCircle2 className={cn("h-4 w-4 text-green-500", className)} />
    )
  }

  return null
}

interface FormProgressIndicatorProps {
  totalFields: number
  validFields: number
  requiredFields: number
  className?: string
}

export const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({
  totalFields,
  validFields,
  requiredFields,
  className
}) => {
  const progress = totalFields > 0 ? (validFields / totalFields) * 100 : 0
  const requiredProgress = requiredFields > 0 ? Math.min(validFields, requiredFields) / requiredFields * 100 : 100

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Form completion</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            requiredProgress === 100 ? "bg-green-500" : "bg-blue-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{validFields} of {totalFields} fields completed</span>
        <span className={requiredProgress === 100 ? "text-green-600" : "text-orange-600"}>
          {requiredFields} required
        </span>
      </div>
    </div>
  )
}