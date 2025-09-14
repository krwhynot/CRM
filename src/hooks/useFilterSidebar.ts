import { useState, useCallback, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { debugError } from '@/utils/debug'
import type {
  UseFilterSidebarOptions,
  UseFilterSidebarReturn,
} from '@/components/filters/FilterSidebar.types'

const FILTER_SIDEBAR_STORAGE_KEY = 'filter-sidebar-state'
const DEFAULT_COLLAPSED_WIDTH = 64
const DEFAULT_EXPANDED_WIDTH = 280

export function useFilterSidebar({
  defaultCollapsed = false,
  defaultWidth = DEFAULT_EXPANDED_WIDTH,
  persistKey,
  collapsedWidth = DEFAULT_COLLAPSED_WIDTH,
  expandedWidth = DEFAULT_EXPANDED_WIDTH,
}: UseFilterSidebarOptions = {}): UseFilterSidebarReturn {
  const isMobile = useIsMobile()

  // Initialize state from localStorage if persist key is provided
  const getInitialState = () => {
    if (!persistKey || typeof window === 'undefined') {
      return {
        isCollapsed: defaultCollapsed,
        width: defaultWidth,
        openSections: new Set<string>(),
      }
    }

    try {
      const stored = localStorage.getItem(`${FILTER_SIDEBAR_STORAGE_KEY}-${persistKey}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          isCollapsed: parsed.isCollapsed ?? defaultCollapsed,
          width: parsed.width ?? defaultWidth,
          openSections: new Set(parsed.openSections ?? []),
        }
      }
    } catch (error) {
      debugError('Failed to load filter sidebar state:', error)
    }

    return {
      isCollapsed: defaultCollapsed,
      width: defaultWidth,
      openSections: new Set<string>(),
    }
  }

  const [state, setState] = useState(getInitialState)

  // Persist state to localStorage
  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(
          `${FILTER_SIDEBAR_STORAGE_KEY}-${persistKey}`,
          JSON.stringify({
            isCollapsed: state.isCollapsed,
            width: state.width,
            openSections: Array.from(state.openSections),
          })
        )
      } catch (error) {
        debugError('Failed to save filter sidebar state:', error)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [state, persistKey])

  const toggleCollapsed = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCollapsed: !prev.isCollapsed,
      width: !prev.isCollapsed ? collapsedWidth : expandedWidth,
    }))
  }, [collapsedWidth, expandedWidth])

  const setCollapsed = useCallback(
    (collapsed: boolean) => {
      setState((prev) => ({
        ...prev,
        isCollapsed: collapsed,
        width: collapsed ? collapsedWidth : expandedWidth,
      }))
    },
    [collapsedWidth, expandedWidth]
  )

  const setWidth = useCallback(
    (width: number) => {
      setState((prev) => ({
        ...prev,
        width,
        // Auto-collapse if width is close to collapsed width
        isCollapsed: width <= collapsedWidth + 20,
      }))
    },
    [collapsedWidth]
  )

  const toggleSection = useCallback((sectionId: string) => {
    setState((prev) => {
      const newOpenSections = new Set(prev.openSections)
      if (newOpenSections.has(sectionId)) {
        newOpenSections.delete(sectionId)
      } else {
        newOpenSections.add(sectionId)
      }
      return {
        ...prev,
        openSections: newOpenSections,
      }
    })
  }, [])

  return {
    isCollapsed: state.isCollapsed,
    width: state.width,
    isMobile,
    toggleCollapsed,
    setCollapsed,
    setWidth,
    openSections: state.openSections,
    toggleSection,
  }
}
