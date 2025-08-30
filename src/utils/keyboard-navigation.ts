/**
 * Keyboard navigation utilities for CRM application
 */

export type FocusableElement = HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement | HTMLAnchorElement

/**
 * Gets all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): FocusableElement[] {
  const selector = [
    'input:not([disabled]):not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    'a[href]:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  return Array.from(container.querySelectorAll(selector)).filter((element) => {
    return isVisible(element) && !isInert(element)
  }) as FocusableElement[]
}

/**
 * Checks if an element is visible
 */
function isVisible(element: Element): boolean {
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0'
}

/**
 * Checks if an element is inert (disabled for interaction)
 */
function isInert(element: Element): boolean {
  return element.hasAttribute('inert') ||
         element.closest('[inert]') !== null
}

/**
 * Creates a focus trap within a container
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = getFocusableElements(container)
  
  if (focusableElements.length === 0) return () => {}

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: Focus previous element
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: Focus next element
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  // Focus first element when trap is created
  firstElement.focus()

  // Add event listener
  container.addEventListener('keydown', handleKeyDown)

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Handles arrow key navigation for lists and grids
 */
export function createArrowKeyNavigation(
  container: HTMLElement,
  options: {
    direction?: 'vertical' | 'horizontal' | 'both'
    wrap?: boolean
    selector?: string
  } = {}
) {
  const { direction = 'vertical', wrap = true, selector } = options
  
  const getNavigableElements = () => {
    const elements = selector 
      ? Array.from(container.querySelectorAll(selector)) as HTMLElement[]
      : getFocusableElements(container)
    
    return elements.filter(isVisible)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const navigableElements = getNavigableElements()
    const currentIndex = navigableElements.indexOf(document.activeElement as HTMLElement)
    
    if (currentIndex === -1) return

    let nextIndex = currentIndex
    
    switch (event.key) {
      case 'ArrowDown':
        if (direction === 'vertical' || direction === 'both') {
          event.preventDefault()
          nextIndex = currentIndex + 1
          if (nextIndex >= navigableElements.length) {
            nextIndex = wrap ? 0 : navigableElements.length - 1
          }
        }
        break
        
      case 'ArrowUp':
        if (direction === 'vertical' || direction === 'both') {
          event.preventDefault()
          nextIndex = currentIndex - 1
          if (nextIndex < 0) {
            nextIndex = wrap ? navigableElements.length - 1 : 0
          }
        }
        break
        
      case 'ArrowRight':
        if (direction === 'horizontal' || direction === 'both') {
          event.preventDefault()
          nextIndex = currentIndex + 1
          if (nextIndex >= navigableElements.length) {
            nextIndex = wrap ? 0 : navigableElements.length - 1
          }
        }
        break
        
      case 'ArrowLeft':
        if (direction === 'horizontal' || direction === 'both') {
          event.preventDefault()
          nextIndex = currentIndex - 1
          if (nextIndex < 0) {
            nextIndex = wrap ? navigableElements.length - 1 : 0
          }
        }
        break
        
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
        
      case 'End':
        event.preventDefault()
        nextIndex = navigableElements.length - 1
        break
    }

    if (nextIndex !== currentIndex && navigableElements[nextIndex]) {
      navigableElements[nextIndex].focus()
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Creates a roving tabindex system for improved keyboard navigation
 */
export function createRovingTabindex(
  container: HTMLElement,
  selector: string = '[role="option"], [role="menuitem"], [role="tab"], button, input'
) {
  const updateTabindices = () => {
    const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[]
    const activeElement = container.querySelector('[tabindex="0"]') as HTMLElement
    
    elements.forEach((element, index) => {
      if (element === activeElement || (!activeElement && index === 0)) {
        element.setAttribute('tabindex', '0')
      } else {
        element.setAttribute('tabindex', '-1')
      }
    })
  }

  const handleFocusIn = (event: Event) => {
    const target = event.target as HTMLElement
    if (target.matches(selector)) {
      // Update all tabindices when focus moves
      const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[]
      elements.forEach(el => el.setAttribute('tabindex', '-1'))
      target.setAttribute('tabindex', '0')
    }
  }

  // Initialize tabindices
  updateTabindices()

  // Add event listeners
  container.addEventListener('focusin', handleFocusIn)

  return () => {
    container.removeEventListener('focusin', handleFocusIn)
  }
}

/**
 * Keyboard shortcuts manager
 */
export class KeyboardShortcuts {
  private shortcuts: Map<string, (event: KeyboardEvent) => void> = new Map()
  private isActive = false

  constructor(private container: HTMLElement | Document = document) {}

  /**
   * Register a keyboard shortcut
   */
  register(
    keys: string, 
    callback: (event: KeyboardEvent) => void,
    options: { preventDefault?: boolean } = {}
  ) {
    const normalizedKeys = this.normalizeKeys(keys)
    this.shortcuts.set(normalizedKeys, (event) => {
      if (options.preventDefault) {
        event.preventDefault()
      }
      callback(event)
    })
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(keys: string) {
    const normalizedKeys = this.normalizeKeys(keys)
    this.shortcuts.delete(normalizedKeys)
  }

  /**
   * Start listening for keyboard events
   */
  start() {
    if (this.isActive) return
    this.isActive = true
    this.container.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Stop listening for keyboard events
   */
  stop() {
    if (!this.isActive) return
    this.isActive = false
    this.container.removeEventListener('keydown', this.handleKeyDown)
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const keys = this.getEventKeys(event)
    const callback = this.shortcuts.get(keys)
    if (callback) {
      callback(event)
    }
  }

  private normalizeKeys(keys: string): string {
    return keys.toLowerCase().replace(/\s+/g, '+')
  }

  private getEventKeys(event: KeyboardEvent): string {
    const parts = []
    
    if (event.ctrlKey) parts.push('ctrl')
    if (event.metaKey) parts.push('meta')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    
    parts.push(event.key.toLowerCase())
    
    return parts.join('+')
  }
}