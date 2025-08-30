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
      <Alert className={cn("border-info/20 bg-info/10", className)}>
        <Info className="size-4 text-info" />
        <AlertDescription className="text-info-foreground">
          Submitting form... Please wait.
        </AlertDescription>
      </Alert>
    )
  }

  if (isValid && submitAttempted && !isSubmitting) {
    return (
      <Alert className={cn("border-success/20 bg-success/10", className)}>
        <CheckCircle2 className="size-4 text-success" />
        <AlertDescription className="text-success">
          Form submitted successfully!
        </AlertDescription>
      </Alert>
    )
  }

  if (errorCount > 0) {
    return (
      <Alert className={cn("border-destructive/20 bg-destructive/10", className)}>
        <AlertCircle className="size-4 text-destructive" />
        <AlertDescription className="text-destructive">
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
                    <span className="mt-0.5 text-destructive">•</span>
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
      <Alert className={cn("border-warning/20 bg-warning/10", className)}>
        <AlertTriangle className="size-4 text-warning-foreground" />
        <AlertDescription className="text-warning-foreground">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {warningCount === 1 ? '1 recommendation:' : `${warningCount} recommendations:`}
              </span>
              <Badge variant="outline" className="border-warning/30 text-xs text-warning-foreground">
                Optional
              </Badge>
            </div>
            <ul className="space-y-1 text-sm">
              {errors
                .filter(e => e.type === 'warning')
                .map((warning, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="mt-0.5 text-warning-foreground">•</span>
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
      <Alert className={cn("border-success/20 bg-success/10", className)}>
        <CheckCircle2 className="size-4 text-success" />
        <AlertDescription className="text-success">
          <div className="flex items-center gap-2">
            <span>Form looks good! Ready to submit.</span>
            <Badge variant="outline" className="border-success/30 text-xs text-success">
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
      <div className={cn("flex items-center text-info", className)}>
        <div className="size-4 animate-spin rounded-full border-2 border-info border-t-transparent" />
      </div>
    )
  }

  if (hasError) {
    return (
      <AlertCircle className={cn("h-4 w-4 text-destructive", className)} />
    )
  }

  if (isValid) {
    return (
      <CheckCircle2 className={cn("h-4 w-4 text-success", className)} />
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
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Form completion</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div 
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            requiredProgress === 100 ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{validFields} of {totalFields} fields completed</span>
        <span className={requiredProgress === 100 ? "text-success" : "text-warning-foreground"}>
          {requiredFields} required
        </span>
      </div>
    </div>
  )
}