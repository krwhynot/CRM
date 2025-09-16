import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useDeviceDetection, type DeviceContext } from '../hooks/useDeviceDetection'
import { useIsIPad, useOrientation } from '../hooks/useMediaQuery'

// Filter layout modes
export type FilterLayoutMode = 'inline' | 'sheet' | 'drawer' | 'auto'

// User preference that can override auto mode
export type FilterLayoutPreference = FilterLayoutMode | 'device-default'

// Filter layout state interface
export interface FilterLayoutState {
  // Current active layout mode (resolved from auto mode)
  currentMode: Exclude<FilterLayoutMode, 'auto'>
  // User's preferred mode (can be auto)
  preferredMode: FilterLayoutMode
  // Whether layout is currently open (for sheet/drawer modes)
  isOpen: boolean
  // Device context for layout decisions
  deviceContext: DeviceContext
  // Whether preferences are being persisted
  isPersistent: boolean
}

// Actions for managing filter layout
export interface FilterLayoutActions {
  // Set user's preferred layout mode
  setPreferredMode: (mode: FilterLayoutMode) => void
  // Toggle open/closed state for sheet/drawer modes
  toggleOpen: () => void
  // Explicitly set open state
  setOpen: (open: boolean) => void
  // Reset to device defaults
  resetToDefaults: () => void
  // Clear persisted preferences
  clearPreferences: () => void
}

// Complete context value
export interface FilterLayoutContextValue extends FilterLayoutState, FilterLayoutActions {}

// Storage key for user preferences
const STORAGE_KEY = 'filter-layout-preferences'

// Default context value
const defaultContextValue: FilterLayoutContextValue = {
  currentMode: 'inline',
  preferredMode: 'auto',
  isOpen: false,
  deviceContext: 'desktop',
  isPersistent: true,
  setPreferredMode: () => {},
  toggleOpen: () => {},
  setOpen: () => {},
  resetToDefaults: () => {},
  clearPreferences: () => {},
}

// Create context
const FilterLayoutContext = createContext<FilterLayoutContextValue>(defaultContextValue)

/**
 * Resolve the actual layout mode from user preference and device context
 * Enhanced with iPad-specific logic
 */
function resolveLayoutMode(
  preferredMode: FilterLayoutMode,
  deviceContext: DeviceContext,
  isIPad?: boolean,
  orientation?: 'portrait' | 'landscape'
): Exclude<FilterLayoutMode, 'auto'> {
  // If user has explicit preference (not auto), use it
  if (preferredMode !== 'auto') {
    return preferredMode
  }

  // iPad-specific auto mode logic
  if (isIPad && orientation) {
    switch (orientation) {
      case 'portrait':
        return 'drawer' // iPad portrait behaves like mobile
      case 'landscape':
        return 'inline' // iPad landscape behaves like desktop
      default:
        return 'inline'
    }
  }

  // Standard auto mode: determine based on device context
  switch (deviceContext) {
    case 'mobile':
      return 'drawer' // Bottom drawer on mobile
    case 'tablet-portrait':
      return 'sheet' // Side sheet on tablet portrait (non-iPad)
    case 'tablet-landscape':
    case 'desktop':
    case 'large-desktop':
      return 'inline' // Inline filters on larger screens
    default:
      return 'inline'
  }
}

/**
 * Load user preferences from localStorage
 */
function loadPreferences(deviceContext: DeviceContext): FilterLayoutMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return 'auto'

    const preferences = JSON.parse(stored)

    // Get device-specific preference or fallback to global
    const deviceSpecific = preferences[deviceContext]
    const globalPreference = preferences.global

    return deviceSpecific || globalPreference || 'auto'
  } catch {
    return 'auto'
  }
}

/**
 * Save user preferences to localStorage
 */
function savePreferences(
  deviceContext: DeviceContext,
  mode: FilterLayoutMode,
  saveGlobally = false
) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const preferences = stored ? JSON.parse(stored) : {}

    if (saveGlobally) {
      preferences.global = mode
    } else {
      preferences[deviceContext] = mode
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Silently fail if localStorage unavailable
  }
}

/**
 * FilterLayoutProvider - Context provider for filter layout management
 */
interface FilterLayoutProviderProps {
  children: React.ReactNode
  // Override default persistence behavior
  persistent?: boolean
  // Initial mode override (useful for testing)
  initialMode?: FilterLayoutMode
}

export function FilterLayoutProvider({
  children,
  persistent = true,
  initialMode,
}: FilterLayoutProviderProps) {
  const { deviceContext } = useDeviceDetection()
  const isIPad = useIsIPad()
  const orientation = useOrientation()

  // Enhanced device context for iPad-specific behavior
  const enhancedDeviceContext = useMemo((): DeviceContext => {
    if (isIPad) {
      // iPad specific behavior: portrait=tablet-portrait, landscape=tablet-landscape
      return orientation === 'portrait' ? 'tablet-portrait' : 'tablet-landscape'
    }
    return deviceContext
  }, [isIPad, orientation, deviceContext])

  // Initialize preferred mode from storage or initial value
  const [preferredMode, setPreferredModeState] = useState<FilterLayoutMode>(() => {
    if (initialMode) return initialMode
    if (persistent) return loadPreferences(enhancedDeviceContext)
    return 'auto'
  })

  // Track open/closed state for sheet/drawer modes
  const [isOpen, setIsOpen] = useState(false)

  // Resolve current active mode with iPad-specific logic
  const currentMode = resolveLayoutMode(preferredMode, enhancedDeviceContext, isIPad, orientation)

  // Update preferred mode and persist if enabled
  const setPreferredMode = useCallback((mode: FilterLayoutMode) => {
    setPreferredModeState(mode)

    if (persistent) {
      // Save globally for 'auto' mode, device-specific for others
      // Use enhanced device context for iPad-specific persistence
      savePreferences(enhancedDeviceContext, mode, mode === 'auto')
    }
  }, [enhancedDeviceContext, persistent])

  // Toggle open state
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  // Set open state explicitly
  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  // Reset to device defaults
  const resetToDefaults = useCallback(() => {
    setPreferredMode('auto')
    setIsOpen(false)
  }, [setPreferredMode])

  // Clear all persisted preferences
  const clearPreferences = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Silently fail
    }
    setPreferredModeState('auto')
    setIsOpen(false)
  }, [])

  // Auto-close when switching from sheet/drawer to inline mode
  useEffect(() => {
    if (currentMode === 'inline') {
      setIsOpen(false)
    }
  }, [currentMode])

  // Load preferences when device context changes
  useEffect(() => {
    if (persistent && !initialMode) {
      const loadedMode = loadPreferences(enhancedDeviceContext)
      setPreferredModeState(loadedMode)
    }
  }, [enhancedDeviceContext, persistent, initialMode])

  // Auto-close when switching between iPad orientations if mode changes significantly
  useEffect(() => {
    if (isIPad && currentMode === 'inline') {
      // Close when switching to inline mode (usually landscape)
      setIsOpen(false)
    }
  }, [isIPad, currentMode])

  const contextValue: FilterLayoutContextValue = {
    currentMode,
    preferredMode,
    isOpen,
    deviceContext: enhancedDeviceContext, // Use enhanced context that handles iPad
    isPersistent: persistent,
    setPreferredMode,
    toggleOpen,
    setOpen,
    resetToDefaults,
    clearPreferences,
  }

  return (
    <FilterLayoutContext.Provider value={contextValue}>
      {children}
    </FilterLayoutContext.Provider>
  )
}

/**
 * useFilterLayout - Hook to access filter layout context
 *
 * @returns FilterLayoutContextValue with current layout state and actions
 *
 * @example
 * function FiltersComponent() {
 *   const { currentMode, isOpen, setOpen } = useFilterLayout()
 *
 *   if (currentMode === 'inline') {
 *     return <div className="grid grid-cols-4 gap-4">Inline filters</div>
 *   }
 *
 *   return (
 *     <Sheet open={isOpen} onOpenChange={setOpen}>
 *       <SheetContent>Filter content</SheetContent>
 *     </Sheet>
 *   )
 * }
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useFilterLayout(): FilterLayoutContextValue {
  const context = useContext(FilterLayoutContext)

  if (!context) {
    throw new Error('useFilterLayout must be used within a FilterLayoutProvider')
  }

  return context
}

/**
 * withFilterLayout - HOC to provide filter layout context to components
 */
// eslint-disable-next-line react-refresh/only-export-components
export function withFilterLayout<T extends object>(
  Component: React.ComponentType<T>,
  providerProps?: Omit<FilterLayoutProviderProps, 'children'>
) {
  return function WrappedComponent(props: T) {
    return (
      <FilterLayoutProvider {...providerProps}>
        <Component {...props} />
      </FilterLayoutProvider>
    )
  }
}

/**
 * Utility functions for filter layout
 */
export const FilterLayoutUtils = {
  /**
   * Check if current mode requires a trigger button
   */
  requiresTrigger: (mode: Exclude<FilterLayoutMode, 'auto'>): boolean => {
    return mode === 'sheet' || mode === 'drawer'
  },

  /**
   * Get recommended sheet/drawer side based on device context with iPad-specific logic
   */
  getSheetSide: (deviceContext: DeviceContext, isIPad?: boolean): 'top' | 'right' | 'bottom' | 'left' => {
    // iPad-specific logic for optimal enterprise usage
    if (isIPad) {
      switch (deviceContext) {
        case 'tablet-portrait':
          return 'bottom' // iPad portrait uses bottom drawer like mobile
        case 'tablet-landscape':
          return 'right' // iPad landscape uses side sheet when not inline
        default:
          return 'right'
      }
    }

    // Standard logic for non-iPad devices
    switch (deviceContext) {
      case 'mobile':
        return 'bottom'
      case 'tablet-portrait':
      case 'tablet-landscape':
      case 'desktop':
      case 'large-desktop':
        return 'right'
      default:
        return 'right'
    }
  },

  /**
   * Get storage key for additional preferences
   */
  getStorageKey: (key: string): string => {
    return `${STORAGE_KEY}-${key}`
  }
}

// Export context for advanced usage
export { FilterLayoutContext }