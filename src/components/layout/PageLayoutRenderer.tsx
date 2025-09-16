import React, { useMemo, useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getLayoutRenderer } from '../../lib/layout/renderer'
import type { LayoutConfiguration, LayoutComponentProps } from '@/types/layout/schema.types'
import type { LayoutComponentRegistry, RenderResult, RenderOptions } from '@/types/layout/registry.types'
import type { PageLayoutSchemaConfig } from './PageLayout.types'
import { useOptionalLayoutContext } from './LayoutProvider'

/**
 * Props for PageLayoutRenderer component
 */
export interface PageLayoutRendererProps {
  /** Schema configuration for layout rendering */
  schema: PageLayoutSchemaConfig
  /** Additional CSS class for root element */
  className?: string
  /** Loading state override */
  loading?: boolean
  /** Error state override */
  error?: Error | null
  /** Callback when render completes */
  onRenderComplete?: (result: RenderResult) => void
  /** Callback when render fails */
  onRenderError?: (error: Error) => void
}

/**
 * Loading skeleton component for schema-driven layouts
 */
const SchemaLayoutSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'schema-layout-skeleton',
      'container mx-auto px-4 py-6',
      'animate-pulse',
      className
    )}
    role="status"
    aria-label="Loading layout"
  >
    {/* Header skeleton */}
    <div className={cn('header-skeleton', 'mb-4')}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded bg-muted" />
          <div className="h-9 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className={cn('content-skeleton', 'mb-8')}>
      <div className="space-y-4">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  </div>
)

/**
 * Error display component for schema-driven layouts
 */
const SchemaLayoutError: React.FC<{
  error: Error
  schema: PageLayoutSchemaConfig
  onRetry?: () => void
  className?: string
}> = ({ error, schema, onRetry, className }) => (
  <div
    className={cn(
      'schema-layout-error',
      'container mx-auto px-4 py-6',
      'border border-red-200 bg-red-50 text-red-700 rounded-lg p-6',
      className
    )}
    role="alert"
  >
    <div className="flex items-start gap-3">
      <div className="shrink-0">
        <svg
          className="size-5 text-red-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium">Layout Render Error</h3>
        <div className="mt-2 text-sm">
          <p>Failed to render schema-driven layout: {error.message}</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Debug Details</summary>
              <div className="mt-1 rounded bg-red-100 p-2 text-xs">
                <p><strong>Layout ID:</strong> {schema.layout.id}</p>
                <p><strong>Layout Type:</strong> {schema.layout.type}</p>
                <p><strong>Entity Type:</strong> {schema.layout.entityType}</p>
                <p><strong>Stack:</strong></p>
                <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
              </div>
            </details>
          )}
        </div>
        {onRetry && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onRetry}
              className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              Retry Render
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)

/**
 * Page Layout Renderer Component
 *
 * Interprets layout schema configurations and renders them using the layout engine.
 * Provides error boundaries, loading states, and integrates with the layout context
 * for seamless schema-driven rendering within the existing PageLayout architecture.
 *
 * Features:
 * - Schema-driven layout interpretation
 * - Async rendering with proper loading states
 * - Error boundaries and graceful degradation
 * - Layout context integration
 * - Performance monitoring and caching
 * - Auto-virtualization at 500+ rows
 *
 * @example
 * ```tsx
 * const organizationLayout: LayoutConfiguration = {
 *   id: 'org-list',
 *   type: 'slots',
 *   // ... schema definition
 * }
 *
 * <PageLayoutRenderer
 *   schema={{
 *     layout: organizationLayout,
 *     data: organizations,
 *     options: { enableVirtualization: 'auto' }
 *   }}
 *   onRenderComplete={(result) => console.log('Render metrics:', result.metadata)}
 * />
 * ```
 */
export const PageLayoutRenderer: React.FC<PageLayoutRendererProps> = ({
  schema,
  className,
  loading: loadingOverride,
  error: errorOverride,
  onRenderComplete,
  onRenderError,
}) => {
  const layoutContext = useOptionalLayoutContext()
  const [renderState, setRenderState] = useState<{
    loading: boolean
    error: Error | null
    result: RenderResult | null
  }>({
    loading: true,
    error: null,
    result: null,
  })

  // Use context registry if available, fallback to schema registry
  const registry = layoutContext?.registry || schema.registry

  // Merge render options with defaults
  const renderOptions: Partial<RenderOptions> = useMemo(() => ({
    enableVirtualization: 'auto',
    enableErrorBoundaries: true,
    enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    enableCaching: true,
    strictValidation: process.env.NODE_ENV === 'development',
    renderMode: 'production',
    maxRetries: 3,
    ...schema.options,
  }), [schema.options])

  /**
   * Perform layout rendering
   */
  const renderLayout = useCallback(async () => {
    setRenderState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const renderer = getLayoutRenderer(registry)
      const result = await renderer.render(schema.layout, schema.data, renderOptions)

      if (!result.success) {
        const error = new Error(
          result.errors?.join(', ') || 'Unknown layout render error'
        )
        throw error
      }

      setRenderState({
        loading: false,
        error: null,
        result,
      })

      onRenderComplete?.(result)

    } catch (error) {
      const renderError = error instanceof Error ? error : new Error(String(error))

      setRenderState({
        loading: false,
        error: renderError,
        result: null,
      })

      onRenderError?.(renderError)
    }
  }, [schema, registry, renderOptions, onRenderComplete, onRenderError])

  /**
   * Effect to trigger rendering when schema changes
   */
  useEffect(() => {
    renderLayout()
  }, [renderLayout])

  /**
   * Handle layout change notifications
   */
  const handleLayoutChange = useCallback((newLayout: LayoutConfiguration) => {
    schema.onLayoutChange?.(newLayout)
  }, [schema])

  /**
   * Handle data change notifications
   */
  const handleDataChange = useCallback((newData: any[]) => {
    schema.onDataChange?.(newData)
  }, [schema])

  /**
   * Retry rendering on error
   */
  const handleRetry = useCallback(() => {
    renderLayout()
  }, [renderLayout])

  // Determine current state
  const isLoading = loadingOverride ?? renderState.loading
  const currentError = errorOverride ?? renderState.error
  const renderResult = renderState.result

  // Loading state
  if (isLoading) {
    return <SchemaLayoutSkeleton className={className} />
  }

  // Error state
  if (currentError) {
    return (
      <SchemaLayoutError
        error={currentError}
        schema={schema}
        onRetry={handleRetry}
        className={className}
      />
    )
  }

  // Success state - render the generated component
  if (renderResult?.component) {
    const RenderedComponent = renderResult.component

    const componentProps: LayoutComponentProps = {
      layoutConfig: schema.layout,
      data: schema.data,
      onConfigChange: handleLayoutChange,
      onDataChange: handleDataChange,
      className: cn('schema-driven-layout', className),
      ...renderResult.props,
    }

    return <RenderedComponent {...componentProps} />
  }

  // Fallback state
  return (
    <div
      className={cn(
        'schema-layout-fallback',
        'container mx-auto px-4 py-6',
        'border border-muted rounded-lg p-6 text-center text-muted-foreground',
        className
      )}
    >
      <div className="space-y-2">
        <h3 className="font-medium">No Layout Rendered</h3>
        <p className="text-sm">
          Schema-driven layout is configured but no component was generated.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer font-medium">Schema Debug</summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs">
              {JSON.stringify(schema.layout, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default PageLayoutRenderer