"use client"

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface FormErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface FormErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class FormErrorBoundary extends React.Component<
  FormErrorBoundaryProps,
  FormErrorBoundaryState
> {
  constructor(props: FormErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Form Error Boundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error!} 
            resetError={this.resetError} 
          />
        )
      }

      return <DefaultFormErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface DefaultFormErrorFallbackProps {
  error: Error
  resetError: () => void
}

function DefaultFormErrorFallback({ error, resetError }: DefaultFormErrorFallbackProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-3">
        <div>
          <strong>Form Error:</strong> Something went wrong while processing your form.
        </div>
        <div className="text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred.'}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetError}
          className="w-fit"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// Hook for form error handling
export function useFormErrorHandler() {
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleFormError = React.useCallback((error: unknown) => {
    console.error('Form submission error:', error)
    
    if (error instanceof Error) {
      setError(error.message)
    } else if (typeof error === 'string') {
      setError(error)
    } else {
      setError('An unexpected error occurred. Please try again.')
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const submitWithErrorHandling = React.useCallback(
    async (submitFn: () => Promise<void>) => {
      try {
        setIsSubmitting(true)
        setError(null)
        await submitFn()
      } catch (error) {
        handleFormError(error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [handleFormError]
  )

  return {
    error,
    isSubmitting,
    clearError,
    handleFormError,
    submitWithErrorHandling
  }
}

// Global form error display component
interface FormErrorDisplayProps {
  error: string | null
  onClear?: () => void
}

export function FormErrorDisplay({ error, onClear }: FormErrorDisplayProps) {
  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            ×
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}