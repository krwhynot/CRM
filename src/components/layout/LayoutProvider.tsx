import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react'
import type { LayoutConfiguration, LayoutEntityType } from '@/types/layout/schema.types'
import type { LayoutComponentRegistry } from '@/types/layout/registry.types'
import type { LayoutContextType } from './PageLayout.types'
import { getComponentRegistry } from '../../lib/layout/component-registry'
import { getLayoutRenderer } from '../../lib/layout/renderer'

/**
 * Layout context state and actions
 */
interface LayoutState {
  currentLayout?: LayoutConfiguration
  availableLayouts: LayoutConfiguration[]
  loading: boolean
  error?: Error | null
}

type LayoutAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_CURRENT_LAYOUT'; payload: LayoutConfiguration }
  | { type: 'SET_AVAILABLE_LAYOUTS'; payload: LayoutConfiguration[] }
  | { type: 'UPDATE_LAYOUT'; payload: LayoutConfiguration }

/**
 * Layout state reducer
 */
function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }

    case 'SET_CURRENT_LAYOUT':
      return { ...state, currentLayout: action.payload, error: null }

    case 'SET_AVAILABLE_LAYOUTS':
      return { ...state, availableLayouts: action.payload }

    case 'UPDATE_LAYOUT':
      return {
        ...state,
        currentLayout: action.payload,
        availableLayouts: state.availableLayouts.map(layout =>
          layout.id === action.payload.id ? action.payload : layout
        ),
      }

    default:
      return state
  }
}

/**
 * Initial layout state
 */
const initialState: LayoutState = {
  availableLayouts: [],
  loading: false,
  error: null,
}

/**
 * Layout context instance
 */
const LayoutContext = createContext<LayoutContextType | null>(null)

/**
 * Layout Provider Props
 */
export interface LayoutProviderProps {
  /** Entity type for layout filtering */
  entityType?: LayoutEntityType
  /** Component registry instance (optional) */
  registry?: LayoutComponentRegistry
  /** Default layout configuration */
  defaultLayout?: LayoutConfiguration
  /** Available layouts for this context */
  layouts?: LayoutConfiguration[]
  /** Persist layout changes to local storage */
  persistChanges?: boolean
  /** Storage key for layout persistence */
  storageKey?: string
  /** Children components */
  children: React.ReactNode
}

/**
 * Layout Provider Component
 *
 * Manages layout state, registry access, and provides context for schema-driven
 * rendering throughout the component tree. Supports both global and entity-specific
 * layout configurations with persistence and caching.
 *
 * Features:
 * - Layout state management with React useReducer
 * - Component registry integration
 * - Local storage persistence
 * - Entity-specific layout filtering
 * - Error handling and loading states
 * - Hot layout switching
 *
 * @example
 * ```tsx
 * <LayoutProvider
 *   entityType="organizations"
 *   defaultLayout={organizationsLayout}
 *   persistChanges={true}
 * >
 *   <PageLayout schema={{ layout: dynamicLayout }} />
 * </LayoutProvider>
 * ```
 */
export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  entityType,
  registry: providedRegistry,
  defaultLayout,
  layouts = [],
  persistChanges = false,
  storageKey,
  children,
}) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState)
  const registry = providedRegistry || getComponentRegistry()

  // Generate storage key if not provided
  const finalStorageKey = storageKey || `layout-${entityType || 'global'}`

  /**
   * Load persisted layout from localStorage
   */
  const loadPersistedLayout = useCallback((): LayoutConfiguration | null => {
    if (!persistChanges || typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(finalStorageKey)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      return parsed as LayoutConfiguration
    } catch (error) {
      console.warn('Failed to load persisted layout:', error)
      return null
    }
  }, [persistChanges, finalStorageKey])

  /**
   * Persist layout to localStorage
   */
  const persistLayout = useCallback((layout: LayoutConfiguration) => {
    if (!persistChanges || typeof window === 'undefined') return

    try {
      localStorage.setItem(finalStorageKey, JSON.stringify(layout))
    } catch (error) {
      console.warn('Failed to persist layout:', error)
    }
  }, [persistChanges, finalStorageKey])

  /**
   * Switch to a different layout by ID
   */
  const switchLayout = useCallback((layoutId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const layout = state.availableLayouts.find(l => l.id === layoutId)
      if (!layout) {
        throw new Error(`Layout with ID '${layoutId}' not found`)
      }

      dispatch({ type: 'SET_CURRENT_LAYOUT', payload: layout })

      if (persistChanges) {
        persistLayout(layout)
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error })
    }
  }, [state.availableLayouts, persistChanges, persistLayout])

  /**
   * Update current layout configuration
   */
  const updateLayout = useCallback((layout: LayoutConfiguration) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      dispatch({ type: 'UPDATE_LAYOUT', payload: layout })

      if (persistChanges) {
        persistLayout(layout)
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error })
    }
  }, [persistChanges, persistLayout])

  /**
   * Initialize available layouts and current layout
   */
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      // Set available layouts
      const filteredLayouts = entityType
        ? layouts.filter(layout => layout.entityType === entityType)
        : layouts

      dispatch({ type: 'SET_AVAILABLE_LAYOUTS', payload: filteredLayouts })

      // Determine current layout priority:
      // 1. Persisted layout (if matching entity type)
      // 2. Default layout provided
      // 3. First available layout
      // 4. None
      let currentLayout: LayoutConfiguration | undefined

      const persistedLayout = loadPersistedLayout()
      if (persistedLayout && (!entityType || persistedLayout.entityType === entityType)) {
        currentLayout = persistedLayout
      } else if (defaultLayout) {
        currentLayout = defaultLayout
      } else if (filteredLayouts.length > 0) {
        currentLayout = filteredLayouts[0]
      }

      if (currentLayout) {
        dispatch({ type: 'SET_CURRENT_LAYOUT', payload: currentLayout })
      }

      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error })
    }
  }, [entityType, layouts, defaultLayout, loadPersistedLayout])

  /**
   * Context value
   */
  const contextValue: LayoutContextType = {
    currentLayout: state.currentLayout,
    registry,
    availableLayouts: state.availableLayouts,
    switchLayout,
    updateLayout,
    loading: state.loading,
    error: state.error,
  }

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  )
}

/**
 * Hook to access layout context
 *
 * @throws {Error} If used outside of LayoutProvider
 */
export function useLayoutContext(): LayoutContextType {
  const context = useContext(LayoutContext)

  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider')
  }

  return context
}

/**
 * Hook to access layout context with optional fallback
 *
 * @param fallback Optional fallback values if no context exists
 * @returns Layout context or fallback values
 */
export function useOptionalLayoutContext(
  fallback?: Partial<LayoutContextType>
): LayoutContextType | null {
  const context = useContext(LayoutContext)

  if (!context && fallback) {
    return {
      availableLayouts: [],
      switchLayout: () => {},
      updateLayout: () => {},
      loading: false,
      ...fallback,
    } as LayoutContextType
  }

  return context
}

/**
 * HOC for wrapping components with layout provider
 */
export function withLayoutProvider<P extends object>(
  Component: React.ComponentType<P>,
  providerProps: Omit<LayoutProviderProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <LayoutProvider {...providerProps}>
      <Component {...props} />
    </LayoutProvider>
  )

  WrappedComponent.displayName = `withLayoutProvider(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default LayoutProvider