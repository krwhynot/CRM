import { useState, useEffect, useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '@/lib/secure-storage'
// import type { DashboardDensity } from '@/features/dashboard/hooks/useDashboardDensity' // Reserved for future use

interface CollapsibleSectionState {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

/**
 * Hook for managing collapsible section state with localStorage persistence
 * Supports density-aware defaults for better UX across different modes
 *
 * @param sectionId - Unique identifier for the section
 * @param defaultOpen - Default open state (fallback if no stored value)
 * @param densityDefaults - Optional density-specific defaults
 * @returns Object with isOpen state and toggle/setOpen functions
 */
export function useCollapsibleSection(
  sectionId: string,
  defaultOpen: boolean = true
  // Note: densityDefaults parameter reserved for future density-aware behavior
): CollapsibleSectionState {
  // Create storage key
  const storageKey = `dashboard-section-${sectionId}-collapsed`

  // Initialize state from localStorage or default
  const [isOpen, setIsOpenState] = useState<boolean>(() => {
    // For SSR safety, use default during initial render
    if (typeof window === 'undefined') {
      return defaultOpen
    }

    // Get stored value (note: we store 'collapsed' state, so invert it)
    const isCollapsed = safeGetJSON<boolean>(storageKey, !defaultOpen)
    return !isCollapsed
  })

  // Effect to sync with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue !== null) {
        try {
          const isCollapsed = JSON.parse(e.newValue)
          setIsOpenState(!isCollapsed)
        } catch {
          // Silently ignore invalid JSON
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [storageKey])

  // Toggle function with persistence
  const toggle = useCallback(() => {
    setIsOpenState((prevOpen) => {
      const newOpen = !prevOpen
      const isCollapsed = !newOpen

      // Store the collapsed state (inverted)
      safeSetJSON(storageKey, isCollapsed)

      return newOpen
    })
  }, [storageKey])

  // SetOpen function with persistence
  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpenState(open)
      const isCollapsed = !open
      safeSetJSON(storageKey, isCollapsed)
    },
    [storageKey]
  )

  return {
    isOpen,
    toggle,
    setOpen,
  }
}

/**
 * Hook for managing multiple collapsible sections with bulk operations
 *
 * @param sectionIds - Array of section identifiers
 * @param defaultOpen - Default open state for all sections
 * @returns Object with section states and bulk operations
 */
export function useMultipleCollapsibleSections(sectionIds: string[], defaultOpen: boolean = true) {
  // Instead of creating multiple hooks, create individual state and localStorage management for each section
  const [sectionsState, setSectionsState] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}

    sectionIds.forEach((sectionId) => {
      const storageKey = `dashboard-section-${sectionId}-collapsed`
      try {
        const isCollapsed = safeGetJSON<boolean>(storageKey, !defaultOpen)
        initialState[sectionId] = !isCollapsed
      } catch {
        initialState[sectionId] = defaultOpen
      }
    })

    return initialState
  })

  // Create toggle function for each section
  const toggleSection = useCallback((sectionId: string) => {
    setSectionsState((prev) => {
      const newState = { ...prev, [sectionId]: !prev[sectionId] }
      const storageKey = `dashboard-section-${sectionId}-collapsed`
      safeSetJSON(storageKey, !newState[sectionId])
      return newState
    })
  }, [])

  // Create setOpen function for each section
  const setOpen = useCallback((sectionId: string, open: boolean) => {
    setSectionsState((prev) => {
      const newState = { ...prev, [sectionId]: open }
      const storageKey = `dashboard-section-${sectionId}-collapsed`
      safeSetJSON(storageKey, !open)
      return newState
    })
  }, [])

  // Convert to the expected format
  const sections = sectionIds.reduce(
    (acc, sectionId) => {
      acc[sectionId] = {
        isOpen: sectionsState[sectionId] ?? defaultOpen,
        toggle: () => toggleSection(sectionId),
        setOpen: (open: boolean) => setOpen(sectionId, open),
      }
      return acc
    },
    {} as Record<string, CollapsibleSectionState>
  )

  // Bulk operations
  const expandAll = useCallback(() => {
    sectionIds.forEach((sectionId) => setOpen(sectionId, true))
  }, [sectionIds, setOpen])

  const collapseAll = useCallback(() => {
    sectionIds.forEach((sectionId) => setOpen(sectionId, false))
  }, [sectionIds, setOpen])

  const toggleAll = useCallback(() => {
    const allOpen = sectionIds.every((sectionId) => sectionsState[sectionId])
    const newState = !allOpen
    sectionIds.forEach((sectionId) => setOpen(sectionId, newState))
  }, [sectionIds, sectionsState, setOpen])

  return {
    sections,
    expandAll,
    collapseAll,
    toggleAll,
  }
}

export default useCollapsibleSection
