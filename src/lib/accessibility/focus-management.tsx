/**
 * Focus Management System
 * 
 * Comprehensive focus management utilities for accessibility compliance.
 * Provides focus trap, restoration, and keyboard navigation helpers.
 */

import React from 'react'

// =============================================================================
// FOCUS TRAP
// =============================================================================

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ')

  const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  
  return elements.filter(element => {
    // Filter out elements that are not visible or have negative tabindex
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.tabIndex !== -1 &&
      !element.hasAttribute('inert')
    )
  })
}

/**
 * Create a focus trap within a container element
 */
export function createFocusTrap(container: HTMLElement) {
  let isActive = false
  let previousActiveElement: Element | null = null

  const activate = () => {
    if (isActive) return

    // Store the currently focused element
    previousActiveElement = document.activeElement
    isActive = true

    // Focus the first focusable element
    const focusableElements = getFocusableElements(container)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Add event listener for tab key
    document.addEventListener('keydown', handleKeyDown)
  }

  const deactivate = () => {
    if (!isActive) return

    isActive = false
    document.removeEventListener('keydown', handleKeyDown)

    // Restore focus to the previously focused element
    if (previousActiveElement && 'focus' in previousActiveElement) {
      (previousActiveElement as HTMLElement).focus()
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return

    const focusableElements = getFocusableElements(container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const currentActiveElement = document.activeElement

    if (event.shiftKey) {
      // Shift + Tab - move backwards
      if (currentActiveElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab - move forwards
      if (currentActiveElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  return {
    activate,
    deactivate,
    isActive: () => isActive,
  }
}

// =============================================================================
// FOCUS RESTORATION
// =============================================================================

/**
 * Store and restore focus when navigating between components
 */
export function createFocusRestoration() {
  let storedElement: Element | null = null

  const store = () => {
    storedElement = document.activeElement
  }

  const restore = () => {
    if (storedElement && 'focus' in storedElement) {
      (storedElement as HTMLElement).focus()
      storedElement = null
    }
  }

  const clear = () => {
    storedElement = null
  }

  return { store, restore, clear }
}

// =============================================================================
// REACT HOOKS
// =============================================================================

/**
 * Hook to create and manage a focus trap
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  active: boolean = false
) {
  const ref = React.useRef<T>(null)
  const trapRef = React.useRef<ReturnType<typeof createFocusTrap> | null>(null)

  React.useEffect(() => {
    if (!ref.current) return

    // Create focus trap if it doesn't exist
    if (!trapRef.current) {
      trapRef.current = createFocusTrap(ref.current)
    }

    // Activate or deactivate based on active prop
    if (active) {
      trapRef.current.activate()
    } else {
      trapRef.current.deactivate()
    }

    // Cleanup on unmount
    return () => {
      if (trapRef.current) {
        trapRef.current.deactivate()
      }
    }
  }, [active])

  return ref
}

/**
 * Hook to restore focus when component unmounts
 */
export function useFocusRestoration() {
  const restorationRef = React.useRef(createFocusRestoration())

  React.useEffect(() => {
    // Store focus on mount
    restorationRef.current.store()

    // Restore focus on unmount
    return () => {
      restorationRef.current.restore()
    }
  }, [])

  return restorationRef.current
}

/**
 * Hook to manage focus on a specific element when condition changes
 */
export function useAutoFocus<T extends HTMLElement = HTMLElement>(
  shouldFocus: boolean = false,
  delay: number = 0
) {
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    if (shouldFocus && ref.current) {
      const timer = setTimeout(() => {
        ref.current?.focus()
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [shouldFocus, delay])

  return ref
}

// =============================================================================
// KEYBOARD NAVIGATION
// =============================================================================

export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'first' | 'last'

/**
 * Navigate between focusable elements using arrow keys
 */
export function useArrowKeyNavigation<T extends HTMLElement = HTMLElement>(
  options: {
    direction?: 'horizontal' | 'vertical' | 'both'
    loop?: boolean
    onNavigate?: (direction: NavigationDirection, element: HTMLElement) => void
  } = {}
) {
  const { direction = 'both', loop = true, onNavigate } = options
  const containerRef = React.useRef<T>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = getFocusableElements(container)
      if (focusableElements.length === 0) return

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
      if (currentIndex === -1) return

      let nextIndex = currentIndex
      let navigationDirection: NavigationDirection | null = null

      switch (event.key) {
        case 'ArrowUp':
          if (direction === 'horizontal') return
          event.preventDefault()
          nextIndex = currentIndex - 1
          navigationDirection = 'up'
          break

        case 'ArrowDown':
          if (direction === 'horizontal') return
          event.preventDefault()
          nextIndex = currentIndex + 1
          navigationDirection = 'down'
          break

        case 'ArrowLeft':
          if (direction === 'vertical') return
          event.preventDefault()
          nextIndex = currentIndex - 1
          navigationDirection = 'left'
          break

        case 'ArrowRight':
          if (direction === 'vertical') return
          event.preventDefault()
          nextIndex = currentIndex + 1
          navigationDirection = 'right'
          break

        case 'Home':
          event.preventDefault()
          nextIndex = 0
          navigationDirection = 'first'
          break

        case 'End':
          event.preventDefault()
          nextIndex = focusableElements.length - 1
          navigationDirection = 'last'
          break

        default:
          return
      }

      // Handle looping
      if (loop) {
        if (nextIndex < 0) {
          nextIndex = focusableElements.length - 1
        } else if (nextIndex >= focusableElements.length) {
          nextIndex = 0
        }
      } else {
        nextIndex = Math.max(0, Math.min(nextIndex, focusableElements.length - 1))
      }

      const nextElement = focusableElements[nextIndex]
      if (nextElement) {
        nextElement.focus()
        if (navigationDirection && onNavigate) {
          onNavigate(navigationDirection, nextElement)
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [direction, loop, onNavigate])

  return containerRef
}

// =============================================================================
// FOCUS VISIBLE UTILITIES
// =============================================================================

/**
 * Hook to track if focus should be visible (keyboard navigation)
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = React.useState(false)

  React.useEffect(() => {
    let hadKeyboardEvent = true
    let keyboardThrottleTimer: NodeJS.Timeout

    const onPointerDown = () => {
      hadKeyboardEvent = false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return

      hadKeyboardEvent = true
      clearTimeout(keyboardThrottleTimer)
      keyboardThrottleTimer = setTimeout(() => {
        hadKeyboardEvent = false
      }, 100)
    }

    const onFocus = () => {
      setIsFocusVisible(hadKeyboardEvent)
    }

    const onBlur = () => {
      setIsFocusVisible(false)
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('focusin', onFocus, true)
    document.addEventListener('focusout', onBlur, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('focusin', onFocus, true)
      document.removeEventListener('focusout', onBlur, true)
      clearTimeout(keyboardThrottleTimer)
    }
  }, [])

  return isFocusVisible
}

// =============================================================================
// SKIP LINKS
// =============================================================================

/**
 * Component for skip navigation links
 */
export interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg ${className || ''}`}
      onFocus={(e) => {
        // Ensure the target exists and is focusable
        const target = document.querySelector(href)
        if (target && 'focus' in target) {
          e.preventDefault()
          ;(target as HTMLElement).focus()
        }
      }}
    >
      {children}
    </a>
  )
}

// =============================================================================
// ANNOUNCEMENTS
// =============================================================================

/**
 * Hook to make screen reader announcements
 */
export function useAnnouncer() {
  const announcerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement('div')
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      announcer.id = 'aria-announcer'
      document.body.appendChild(announcer)
      announcerRef.current = announcer
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current)
        announcerRef.current = null
      }
    }
  }, [])

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority)
      announcerRef.current.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])

  return announce
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Check if an element is visible and focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return (
    element.tabIndex >= 0 &&
    !element.hasAttribute('disabled') &&
    !element.hasAttribute('inert') &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  )
}

/**
 * Find the next/previous focusable sibling
 */
export function findFocusableSibling(
  element: HTMLElement, 
  direction: 'next' | 'previous'
): HTMLElement | null {
  let sibling = direction === 'next' 
    ? element.nextElementSibling 
    : element.previousElementSibling

  while (sibling) {
    if (sibling instanceof HTMLElement && isFocusable(sibling)) {
      return sibling
    }
    sibling = direction === 'next' 
      ? sibling.nextElementSibling 
      : sibling.previousElementSibling
  }

  return null
}