import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { semanticSpacing, semanticRadius, semanticTypography } from '@/styles/tokens'
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
  <Card className={cn(semanticSpacing.topGap.lg, 'mx-auto w-full max-w-lg')}>
    <CardHeader className="text-center">
      <div className={cn(semanticSpacing.bottomGap.sm, 'flex justify-center')}>
        <AlertTriangle className="size-12 text-destructive" />
      </div>
      <CardTitle className="text-destructive">Something went wrong</CardTitle>
    </CardHeader>
    <CardContent className={cn(semanticSpacing.stack.md, 'text-center')}>
      <p className="text-muted-foreground">
        We encountered an error while loading this page. This might be due to a network issue or
        server problem.
      </p>
      <details
        className={cn(
          semanticRadius.small,
          semanticSpacing.compact,
          semanticTypography.body,
          'border bg-muted text-left text-muted-foreground'
        )}
      >
        <summary
          className={cn(semanticSpacing.bottomGap.xs, semanticTypography.label, 'cursor-pointer')}
        >
          Error Details
        </summary>
        <pre className={cn(semanticTypography.caption, 'whitespace-pre-wrap')}>
          {error.message}
          {error.stack && `\n\nStack trace:\n${error.stack}`}
        </pre>
      </details>
      <div className={cn(semanticSpacing.gap.xs, 'flex justify-center')}>
        <Button
          onClick={resetErrorBoundary}
          className={cn(semanticSpacing.gap.xs, 'flex items-center')}
        >
          <RefreshCw className="size-4" />
          Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
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
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch() {
    // Error boundary caught error - in production, errors should be logged to external service
    // This is intentionally minimal to avoid console spam
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
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

      return <ErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
    }

    return this.props.children
  }
}

// Wrapper component for easier usage with specific error handling
export const OrganizationsErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const OrganizationsErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    resetErrorBoundary,
  }) => (
    <Card className={cn(semanticSpacing.topGap.md, 'w-full')}>
      <CardHeader>
        <div className={cn(semanticSpacing.gap.xs, 'flex items-center text-destructive')}>
          <AlertTriangle className="size-5" />
          <CardTitle>Organizations Loading Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        <p className="text-muted-foreground">
          Failed to load organizations data. This could be due to:
        </p>
        <ul
          className={cn(
            semanticSpacing.stack.xs,
            semanticTypography.body,
            'list-inside list-disc text-muted-foreground'
          )}
        >
          <li>Network connectivity issues</li>
          <li>Database connection problems</li>
          <li>Authentication token expiry</li>
          <li>Server maintenance</li>
        </ul>
        <div
          className={cn(
            semanticRadius.small,
            semanticSpacing.compact,
            'border border-destructive/20 bg-destructive/10'
          )}
        >
          <p className={cn(semanticTypography.body, semanticTypography.label, 'text-destructive')}>
            Error: {error.message}
          </p>
        </div>
        <div className={cn(semanticSpacing.gap.xs, 'flex')}>
          <Button
            onClick={resetErrorBoundary}
            className={cn(semanticSpacing.gap.xs, 'flex items-center')}
          >
            <RefreshCw className="size-4" />
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

  return <QueryErrorBoundary fallback={OrganizationsErrorFallback}>{children}</QueryErrorBoundary>
}

// Wrapper component for Contacts error handling
export const ContactsErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ContactsErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
    <Card className={cn(semanticSpacing.topGap.md, 'w-full')}>
      <CardHeader>
        <div className={cn(semanticSpacing.gap.xs, 'flex items-center text-destructive')}>
          <AlertTriangle className="size-5" />
          <CardTitle>Contacts Loading Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        <p className="text-muted-foreground">Failed to load contacts data. This could be due to:</p>
        <ul
          className={cn(
            semanticSpacing.stack.xs,
            semanticTypography.body,
            'list-inside list-disc text-muted-foreground'
          )}
        >
          <li>Network connectivity issues</li>
          <li>Database connection problems</li>
          <li>Authentication token expiry</li>
          <li>Server maintenance</li>
        </ul>
        <div
          className={cn(
            semanticRadius.small,
            semanticSpacing.compact,
            'border border-destructive/20 bg-destructive/10'
          )}
        >
          <p className={cn(semanticTypography.body, semanticTypography.label, 'text-destructive')}>
            Error: {error.message}
          </p>
        </div>
        <div className={cn(semanticSpacing.gap.xs, 'flex')}>
          <Button
            onClick={resetErrorBoundary}
            className={cn(semanticSpacing.gap.xs, 'flex items-center')}
          >
            <RefreshCw className="size-4" />
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

  return <QueryErrorBoundary fallback={ContactsErrorFallback}>{children}</QueryErrorBoundary>
}

// Wrapper component for Opportunities error handling
export const OpportunitiesErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const OpportunitiesErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    resetErrorBoundary,
  }) => (
    <Card className={cn(semanticSpacing.topGap.md, 'w-full')}>
      <CardHeader>
        <div className={cn(semanticSpacing.gap.xs, 'flex items-center text-destructive')}>
          <AlertTriangle className="size-5" />
          <CardTitle>Opportunities Loading Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        <p className="text-muted-foreground">
          Failed to load opportunities data. This could be due to:
        </p>
        <ul
          className={cn(
            semanticSpacing.stack.xs,
            semanticTypography.body,
            'list-inside list-disc text-muted-foreground'
          )}
        >
          <li>Network connectivity issues</li>
          <li>Database connection problems</li>
          <li>Authentication token expiry</li>
          <li>Server maintenance</li>
        </ul>
        <div
          className={cn(
            semanticRadius.small,
            semanticSpacing.compact,
            'border border-destructive/20 bg-destructive/10'
          )}
        >
          <p className={cn(semanticTypography.body, semanticTypography.label, 'text-destructive')}>
            Error: {error.message}
          </p>
        </div>
        <div className={cn(semanticSpacing.gap.xs, 'flex')}>
          <Button
            onClick={resetErrorBoundary}
            className={cn(semanticSpacing.gap.xs, 'flex items-center')}
          >
            <RefreshCw className="size-4" />
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

  return <QueryErrorBoundary fallback={OpportunitiesErrorFallback}>{children}</QueryErrorBoundary>
}

// Wrapper component for Products error handling
export const ProductsErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ProductsErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
    <Card className={cn(semanticSpacing.topGap.md, 'w-full')}>
      <CardHeader>
        <div className={cn(semanticSpacing.gap.xs, 'flex items-center text-destructive')}>
          <AlertTriangle className="size-5" />
          <CardTitle>Products Loading Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.md}`}>
        <p className="text-muted-foreground">Failed to load products data. This could be due to:</p>
        <ul
          className={cn(
            semanticSpacing.stack.xs,
            semanticTypography.body,
            'list-inside list-disc text-muted-foreground'
          )}
        >
          <li>Network connectivity issues</li>
          <li>Database connection problems</li>
          <li>Authentication token expiry</li>
          <li>Server maintenance</li>
        </ul>
        <div
          className={cn(
            semanticRadius.small,
            semanticSpacing.compact,
            'border border-destructive/20 bg-destructive/10'
          )}
        >
          <p className={cn(semanticTypography.body, semanticTypography.label, 'text-destructive')}>
            Error: {error.message}
          </p>
        </div>
        <div className={cn(semanticSpacing.gap.xs, 'flex')}>
          <Button
            onClick={resetErrorBoundary}
            className={cn(semanticSpacing.gap.xs, 'flex items-center')}
          >
            <RefreshCw className="size-4" />
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

  return <QueryErrorBoundary fallback={ProductsErrorFallback}>{children}</QueryErrorBoundary>
}
