import React from 'react'

/**
 * Enhanced version of the original createFeatureLoader with better error handling
 * Uses the existing pattern from performance-optimizations.ts
 */
export function createFeatureLoader<T extends React.ComponentType<Record<string, unknown>>>(
  loader: () => Promise<{ default: T }>,
  componentName?: string
) {
  return React.lazy(() =>
    loader().catch(() => ({
      default: (() =>
        React.createElement(
          'div',
          {
            className: 'min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4',
            role: 'alert',
            'aria-live': 'polite',
          },
          React.createElement(
            'div',
            { className: 'text-destructive text-center' },
            React.createElement(
              'h3',
              { className: 'text-lg font-semibold mb-2' },
              `Failed to Load ${componentName || 'Component'}`
            ),
            React.createElement(
              'p',
              { className: 'text-muted-foreground max-w-md' },
              'This page could not load properly. Please try refreshing the page.'
            ),
            React.createElement(
              'button',
              {
                className:
                  'mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90',
                onClick: () => window.location.reload(),
              },
              'Refresh Page'
            )
          )
        )) as unknown as T,
    }))
  )
}

/**
 * Utility for dynamic imports of third-party libraries with fallback
 */
export async function safeImport<T>(
  importPromise: () => Promise<T>,
  fallback: T,
  errorMessage?: string
): Promise<T> {
  try {
    return await importPromise()
  } catch (error) {
    console.error(errorMessage || 'Failed to import module:', error)
    return fallback
  }
}
