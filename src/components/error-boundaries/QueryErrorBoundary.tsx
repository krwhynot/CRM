import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <Card className="w-full max-w-lg mx-auto mt-8">
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      <CardTitle className="text-red-600">Something went wrong</CardTitle>
    </CardHeader>
    <CardContent className="text-center space-y-4">
      <p className="text-gray-600">
        We encountered an error while loading this page. This might be due to a network issue or server problem.
      </p>
      <details className="text-left text-sm text-gray-500 bg-gray-50 p-3 rounded border">
        <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
        <pre className="whitespace-pre-wrap text-xs">
          {error.message}
          {error.stack && `\n\nStack trace:\n${error.stack}`}
        </pre>
      </details>
      <div className="flex gap-2 justify-center">
        <Button 
          onClick={resetErrorBoundary}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    </CardContent>
  </Card>
)

export class QueryErrorBoundary extends React.Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error boundary logging kept for production debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 [QueryErrorBoundary] Caught error:', error)
      console.error('🚨 [QueryErrorBoundary] Component stack trace:', errorInfo.componentStack)
      console.error('🚨 [QueryErrorBoundary] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString()
      })
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null
    })

    // Clear any existing reset timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    // Auto-reset after 30 seconds if error persists
    this.resetTimeoutId = window.setTimeout(() => {
      if (this.state.hasError) {
        this.resetErrorBoundary()
      }
    }, 30000)
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const ErrorFallback = this.props.fallback || DefaultErrorFallback
      
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}

// Wrapper component for easier usage with specific error handling
export const OrganizationsErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const OrganizationsErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle>Organizations Loading Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Failed to load organizations data. This could be due to:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
          <li>Network connectivity issues</li>
          <li>Database connection problems</li>
          <li>Authentication token expiry</li>
          <li>Server maintenance</li>
        </ul>
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <p className="text-sm text-red-700 font-medium">Error: {error.message}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={resetErrorBoundary}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Loading
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              // Clear all query cache and reload
              window.location.reload()
            }}
          >
            Hard Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <QueryErrorBoundary fallback={OrganizationsErrorFallback}>
      {children}
    </QueryErrorBoundary>
  )
}

// Wrapper component for Contacts error handling
export const ContactsErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ContactsErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle>Contacts Loading Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Failed to load contacts data. This could be due to:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
          <li>Network connectivity issues</li>
          <li>Database connection problems</li>
          <li>Authentication token expiry</li>
          <li>Server maintenance</li>
        </ul>
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <p className="text-sm text-red-700 font-medium">Error: {error.message}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={resetErrorBoundary}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Loading
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              // Clear all query cache and reload
              window.location.reload()
            }}
          >
            Hard Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <QueryErrorBoundary fallback={ContactsErrorFallback}>
      {children}
    </QueryErrorBoundary>
  )
}

// Wrapper component for Opportunities error handling
export const OpportunitiesErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const OpportunitiesErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <CardTitle>Opportunities Loading Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Failed to load opportunities data. This could be due to:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
          <li>Network connectivity issues</li>
          <li>Database connection problems</li>
          <li>Authentication token expiry</li>
          <li>Server maintenance</li>
        </ul>
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <p className="text-sm text-red-700 font-medium">Error: {error.message}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={resetErrorBoundary}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Loading
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              // Clear all query cache and reload
              window.location.reload()
            }}
          >
            Hard Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <QueryErrorBoundary fallback={OpportunitiesErrorFallback}>
      {children}
    </QueryErrorBoundary>
  )
}