/**
 * Re-export useFilterLayout hook from FilterLayoutContext
 *
 * This provides a convenient import path for the hook while keeping
 * the main implementation in the context file.
 */

export {
  useFilterLayout,
  type FilterLayoutContextValue,
  type FilterLayoutMode,
  type FilterLayoutPreference,
  type FilterLayoutState,
  type FilterLayoutActions,
  FilterLayoutUtils,
} from '../contexts/FilterLayoutContext'

/**
 * Additional hook utilities for filter layout management
 */

import { useCallback, useMemo } from 'react'
import {
  useFilterLayout as useFilterLayoutBase,
  FilterLayoutUtils,
  type FilterLayoutMode,
} from '../contexts/FilterLayoutContext'
import type { DeviceContext } from './useDeviceDetection'
import { useIsIPad, useOrientation } from './useMediaQuery'

/**
 * Enhanced hook with additional utilities and iPad-specific optimizations
 */
export function useFilterLayoutExtended() {
  const base = useFilterLayoutBase()
  const isIPad = useIsIPad()
  const orientation = useOrientation()

  // iPad-specific device context enhancement
  const enhancedDeviceContext = useMemo((): DeviceContext => {
    if (isIPad) {
      // iPad specific behavior: portrait=mobile, landscape=desktop
      return orientation === 'portrait' ? 'tablet-portrait' : 'tablet-landscape'
    }
    return base.deviceContext
  }, [isIPad, orientation, base.deviceContext])

  // Check if current layout requires overlay (sheet/drawer)
  const isOverlayMode = base.currentMode === 'sheet' || base.currentMode === 'drawer'

  // Check if filters should be visible inline
  const showInline = base.currentMode === 'inline'

  // Check if trigger button should be shown
  const showTrigger = isOverlayMode

  // Get appropriate sheet side for current device (iPad-aware)
  const sheetSide = FilterLayoutUtils.getSheetSide(enhancedDeviceContext)

  // Smart open handler that respects mode
  const smartOpen = useCallback(() => {
    if (isOverlayMode) {
      base.setOpen(true)
    }
  }, [isOverlayMode, base])

  // Smart close handler
  const smartClose = useCallback(() => {
    if (isOverlayMode) {
      base.setOpen(false)
    }
  }, [isOverlayMode, base])

  // Check if mode is device-appropriate (iPad-aware)
  const isModeOptimal = useCallback(
    (mode: FilterLayoutMode): boolean => {
      if (mode === 'auto') return true

      const context = enhancedDeviceContext

      // Mobile works best with drawer
      if (context === 'mobile') {
        return mode === 'drawer' || mode === 'auto'
      }

      // iPad portrait behaves like mobile (drawer)
      if (context === 'tablet-portrait' && isIPad) {
        return mode === 'drawer' || mode === 'auto'
      }

      // Tablet portrait (non-iPad) works well with sheet
      if (context === 'tablet-portrait' && !isIPad) {
        return mode === 'sheet' || mode === 'auto'
      }

      // iPad landscape behaves like desktop (inline)
      if (context === 'tablet-landscape' && isIPad) {
        return mode === 'inline' || mode === 'auto'
      }

      // Tablet landscape (non-iPad) works well with sheet
      if (context === 'tablet-landscape' && !isIPad) {
        return mode === 'sheet' || mode === 'auto'
      }

      // Desktop works best with inline
      if (context === 'desktop' || context === 'large-desktop') {
        return mode === 'inline' || mode === 'auto'
      }

      return true
    },
    [enhancedDeviceContext, isIPad]
  )

  return {
    ...base,
    // Enhanced properties
    isOverlayMode,
    showInline,
    showTrigger,
    sheetSide,
    // iPad-specific properties
    isIPad,
    orientation,
    enhancedDeviceContext,
    // Enhanced actions
    smartOpen,
    smartClose,
    isModeOptimal,
  }
}

/**
 * Specialized hooks for specific use cases
 */

/**
 * Hook for filter trigger buttons with iPad-specific optimizations
 */
export function useFilterTrigger() {
  const { showTrigger, smartOpen, currentMode, enhancedDeviceContext, isIPad } =
    useFilterLayoutExtended()

  const getTriggerLabel = useCallback(() => {
    switch (currentMode) {
      case 'sheet':
        return 'Show Filters'
      case 'drawer':
        return 'Filter Options'
      case 'inline':
        return null // No trigger needed
      default:
        return 'Filters'
    }
  }, [currentMode])

  const getTriggerIcon = useCallback(() => {
    // iPad-specific icon logic
    if (isIPad) {
      switch (enhancedDeviceContext) {
        case 'tablet-portrait':
          return 'filter' // iPad portrait = drawer (like mobile)
        case 'tablet-landscape':
          return 'filter' // iPad landscape = inline (no trigger usually)
        default:
          return 'filter'
      }
    }

    // Non-iPad logic
    switch (enhancedDeviceContext) {
      case 'mobile':
        return 'filter' // Bottom drawer icon
      case 'tablet-portrait':
      case 'tablet-landscape':
        return 'sidebar' // Side sheet icon
      default:
        return 'filter'
    }
  }, [enhancedDeviceContext, isIPad])

  return {
    shouldShow: showTrigger,
    onClick: smartOpen,
    label: getTriggerLabel(),
    icon: getTriggerIcon(),
    mode: currentMode,
  }
}

/**
 * Hook for filter container components with iPad-specific handling
 */
export function useFilterContainer() {
  const {
    currentMode,
    isOpen,
    setOpen,
    showInline,
    isOverlayMode,
    sheetSide,
    enhancedDeviceContext,
    isIPad,
    orientation,
  } = useFilterLayoutExtended()

  const getContainerProps = useCallback(() => {
    if (showInline) {
      return {
        className: 'space-y-4', // Standard inline spacing
        'data-filter-mode': 'inline',
      }
    }

    return {
      className: 'space-y-6', // More space in overlay modes
      'data-filter-mode': currentMode,
    }
  }, [showInline, currentMode])

  const getSheetProps = useCallback(() => {
    if (!isOverlayMode) return null

    const baseProps = {
      open: isOpen,
      onOpenChange: setOpen,
    }

    // iPad-specific sheet configurations
    const contentProps = {
      side: sheetSide,
      className: (() => {
        if (currentMode === 'drawer') {
          // iPad portrait in drawer mode gets more height for better usability
          return isIPad
            ? 'h-[80vh] w-full' // iPad gets slightly less height for orientation changes
            : 'h-[85vh] w-full' // Standard mobile drawer height
        }

        // Sheet mode handling
        if (isIPad && orientation === 'landscape') {
          // iPad landscape should rarely use sheet, but if it does, make it wider
          return 'w-full sm:max-w-lg lg:max-w-xl'
        }

        return 'w-full sm:max-w-md' // Standard sheet width
      })(),
    }

    return { baseProps, contentProps }
  }, [isOverlayMode, isOpen, setOpen, sheetSide, currentMode, isIPad, orientation])

  return {
    mode: currentMode,
    showInline,
    isOverlayMode,
    containerProps: getContainerProps(),
    sheetProps: getSheetProps(),
    deviceContext: enhancedDeviceContext,
    // iPad-specific properties
    isIPad,
    orientation,
  }
}

/**
 * Hook for mode selection UI with iPad-specific recommendations
 */
export function useFilterModeSelector() {
  const {
    preferredMode,
    setPreferredMode,
    enhancedDeviceContext,
    isModeOptimal,
    isIPad,
    orientation,
  } = useFilterLayoutExtended()

  const availableModes: {
    value: FilterLayoutMode
    label: string
    optimal: boolean
    description?: string
  }[] = [
    {
      value: 'auto',
      label: 'Auto (Recommended)',
      optimal: true,
      description: isIPad
        ? `Adapts to iPad orientation: ${orientation === 'portrait' ? 'drawer' : 'inline'}`
        : 'Adapts to your device automatically',
    },
    {
      value: 'inline',
      label: 'Always Inline',
      optimal: isModeOptimal('inline'),
      description:
        isIPad && orientation === 'portrait' ? 'May be cramped on iPad portrait' : undefined,
    },
    {
      value: 'sheet',
      label: 'Side Panel',
      optimal: isModeOptimal('sheet'),
      description: isIPad ? 'Works well for non-iPad tablets' : undefined,
    },
    {
      value: 'drawer',
      label: 'Bottom Drawer',
      optimal: isModeOptimal('drawer'),
      description:
        isIPad && orientation === 'portrait' ? 'Recommended for iPad portrait' : undefined,
    },
  ]

  return {
    currentMode: preferredMode,
    setMode: setPreferredMode,
    availableModes,
    deviceContext: enhancedDeviceContext,
    isIPad,
    orientation,
  }
}
