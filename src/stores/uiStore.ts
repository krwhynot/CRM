/**
 * UI Store for KitchenPantry CRM
 * 
 * Provides reactive state management for global UI state including:
 * - Modal and dialog management
 * - Notification system
 * - Loading overlays and indicators
 * - Navigation state
 * - Theme and layout preferences
 * - Mobile responsiveness state
 * - Keyboard shortcuts
 * - Global search interface
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { 
  LoadingState, 
  Theme, 
  Breakpoint, 
  ModalState
} from '@/types'

// Navigation interface for future use (commented out to avoid unused warning)
// interface NavigationItem {
//   label: string
//   icon: string
//   route: string
//   children?: NavigationItem[]
// }

// =============================================================================
// UI STATE INTERFACES
// =============================================================================

interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
  createdAt: Date
}

interface ModalConfig {
  id: string
  component: string
  props?: Record<string, any>
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  persistent?: boolean
  closable?: boolean
  state: ModalState
}

interface LoadingOverlay {
  id: string
  message?: string
  progress?: number
  cancelable?: boolean
  onCancel?: () => void
}

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface GlobalSearchState {
  isOpen: boolean
  query: string
  results: Array<{
    id: string
    type: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
    title: string
    subtitle?: string
    href: string
    metadata?: Record<string, any>
  }>
  loading: boolean
  recentSearches: string[]
}

interface LayoutPreferences {
  sidebarCollapsed: boolean
  sidebarWidth: number
  theme: Theme
  density: 'compact' | 'comfortable' | 'spacious'
  showBreadcrumbs: boolean
  showPageTitles: boolean
  animationsEnabled: boolean
  soundEnabled: boolean
}

interface KeyboardShortcut {
  key: string
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  description: string
  action: () => void
  context?: string[]
  disabled?: boolean
}

// =============================================================================
// STORE DEFINITION
// =============================================================================

export const useUIStore = defineStore('ui', () => {
  // =============================================================================
  // STATE
  // =============================================================================
  
  // Notification system
  const notifications = ref<NotificationItem[]>([])
  const notificationCounter = ref(0)
  
  // Modal system
  const modals = ref<ModalConfig[]>([])
  const modalStack = ref<string[]>([])
  
  // Loading states
  const globalLoading = ref<LoadingState>('idle')
  const loadingOverlays = ref<LoadingOverlay[]>([])
  const loadingMessage = ref<string>('')
  
  // Navigation state
  const currentRoute = ref<string>('/')
  const breadcrumbs = ref<BreadcrumbItem[]>([])
  const navigationHistory = ref<string[]>([])
  const pageTitle = ref<string>('KitchenPantry CRM')
  
  // Layout preferences
  const layoutPreferences = ref<LayoutPreferences>({
    sidebarCollapsed: false,
    sidebarWidth: 280,
    theme: 'light',
    density: 'comfortable',
    showBreadcrumbs: true,
    showPageTitles: true,
    animationsEnabled: true,
    soundEnabled: false
  })
  
  // Responsive state
  const windowWidth = ref<number>(window.innerWidth)
  const windowHeight = ref<number>(window.innerHeight)
  const isMobile = ref<boolean>(false)
  const isTablet = ref<boolean>(false)
  const isDesktop = ref<boolean>(true)
  const currentBreakpoint = ref<Breakpoint>('lg')
  
  // Global search
  const globalSearch = ref<GlobalSearchState>({
    isOpen: false,
    query: '',
    results: [],
    loading: false,
    recentSearches: []
  })
  
  // Keyboard shortcuts
  const keyboardShortcuts = ref<KeyboardShortcut[]>([])
  const shortcutsEnabled = ref<boolean>(true)
  // Track active keyboard shortcuts (reserved for future implementation)
  // const activeShortcuts = ref<Set<string>>(new Set())
  
  // Miscellaneous UI state
  const isOffline = ref<boolean>(!navigator.onLine)
  const lastUserActivity = ref<Date>(new Date())
  const idleTimeout = ref<NodeJS.Timeout | null>(null)
  const isUserIdle = ref<boolean>(false)
  const focusedElement = ref<HTMLElement | null>(null)

  // =============================================================================
  // GETTERS
  // =============================================================================
  
  const hasNotifications = computed(() => notifications.value.length > 0)
  
  const unreadNotificationCount = computed(() => 
    notifications.value.filter(n => !n.persistent).length
  )
  
  const persistentNotifications = computed(() => 
    notifications.value.filter(n => n.persistent)
  )
  
  const hasActiveModal = computed(() => modalStack.value.length > 0)
  
  const activeModal = computed(() => {
    if (modalStack.value.length === 0) return null
    const activeId = modalStack.value[modalStack.value.length - 1]
    return modals.value.find(m => m.id === activeId) || null
  })
  
  const hasLoadingOverlay = computed(() => loadingOverlays.value.length > 0)
  
  const isGloballyLoading = computed(() => 
    globalLoading.value === 'loading' || hasLoadingOverlay.value
  )
  
  const breakpointClass = computed(() => {
    const breakpoints = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md', 
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl'
    }
    return breakpoints[currentBreakpoint.value] || 'max-w-lg'
  })
  
  const themeClass = computed(() => {
    const themeClasses = {
      light: 'theme-light',
      dark: 'theme-dark',
      auto: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light'
    }
    return themeClasses[layoutPreferences.value.theme]
  })
  
  const densityClass = computed(() => {
    const densityClasses = {
      compact: 'density-compact',
      comfortable: 'density-comfortable', 
      spacious: 'density-spacious'
    }
    return densityClasses[layoutPreferences.value.density]
  })
  
  const sidebarClass = computed(() => 
    layoutPreferences.value.sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
  )

  // =============================================================================
  // NOTIFICATION ACTIONS
  // =============================================================================
  
  /**
   * Show notification
   */
  const showNotification = (notification: Omit<NotificationItem, 'id' | 'createdAt'>): string => {
    const id = `notification-${++notificationCounter.value}`
    const notificationItem: NotificationItem = {
      ...notification,
      id,
      createdAt: new Date(),
      duration: notification.duration ?? (notification.persistent ? undefined : 5000)
    }
    
    notifications.value.push(notificationItem)
    
    // Auto-remove non-persistent notifications
    if (!notification.persistent && notificationItem.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, notificationItem.duration)
    }
    
    return id
  }
  
  /**
   * Show success notification
   */
  const showSuccess = (title: string, message?: string, duration?: number): string => {
    return showNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }
  
  /**
   * Show error notification
   */
  const showError = (title: string, message?: string, persistent = false): string => {
    return showNotification({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? undefined : 8000
    })
  }
  
  /**
   * Show warning notification
   */
  const showWarning = (title: string, message?: string, duration?: number): string => {
    return showNotification({
      type: 'warning',
      title,
      message,
      duration: duration ?? 6000
    })
  }
  
  /**
   * Show info notification
   */
  const showInfo = (title: string, message?: string, duration?: number): string => {
    return showNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }
  
  /**
   * Remove notification
   */
  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  /**
   * Clear all notifications
   */
  const clearAllNotifications = (): void => {
    notifications.value = []
  }
  
  /**
   * Clear notifications by type
   */
  const clearNotificationsByType = (type: NotificationItem['type']): void => {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }

  // =============================================================================
  // MODAL ACTIONS
  // =============================================================================
  
  /**
   * Open modal
   */
  const openModal = (config: Omit<ModalConfig, 'id' | 'state'>): string => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const modalConfig: ModalConfig = {
      ...config,
      id,
      state: 'opening',
      size: config.size ?? 'md',
      persistent: config.persistent ?? false,
      closable: config.closable ?? true
    }
    
    modals.value.push(modalConfig)
    modalStack.value.push(id)
    
    // Animate in
    requestAnimationFrame(() => {
      const modal = modals.value.find(m => m.id === id)
      if (modal) {
        modal.state = 'open'
      }
    })
    
    return id
  }
  
  /**
   * Close modal
   */
  const closeModal = (id: string): void => {
    const modal = modals.value.find(m => m.id === id)
    if (!modal || (!modal.closable && modal.persistent)) return
    
    modal.state = 'closing'
    
    // Remove from stack
    const stackIndex = modalStack.value.indexOf(id)
    if (stackIndex > -1) {
      modalStack.value.splice(stackIndex, 1)
    }
    
    // Animate out then remove
    setTimeout(() => {
      const index = modals.value.findIndex(m => m.id === id)
      if (index > -1) {
        modals.value.splice(index, 1)
      }
    }, 300) // Animation duration
  }
  
  /**
   * Close top modal
   */
  const closeTopModal = (): void => {
    if (modalStack.value.length > 0) {
      const topModalId = modalStack.value[modalStack.value.length - 1]
      closeModal(topModalId)
    }
  }
  
  /**
   * Close all modals
   */
  const closeAllModals = (): void => {
    [...modalStack.value].forEach(id => closeModal(id))
  }

  // =============================================================================
  // LOADING ACTIONS
  // =============================================================================
  
  /**
   * Set global loading state
   */
  const setGlobalLoading = (state: LoadingState, message?: string): void => {
    globalLoading.value = state
    if (message) {
      loadingMessage.value = message
    } else if (state !== 'loading') {
      loadingMessage.value = ''
    }
  }
  
  /**
   * Show loading overlay
   */
  const showLoadingOverlay = (config: Omit<LoadingOverlay, 'id'>): string => {
    const id = `loading-${Date.now()}`
    const overlay: LoadingOverlay = {
      ...config,
      id
    }
    
    loadingOverlays.value.push(overlay)
    return id
  }
  
  /**
   * Update loading overlay
   */
  const updateLoadingOverlay = (id: string, updates: Partial<Omit<LoadingOverlay, 'id'>>): void => {
    const overlay = loadingOverlays.value.find(o => o.id === id)
    if (overlay) {
      Object.assign(overlay, updates)
    }
  }
  
  /**
   * Hide loading overlay
   */
  const hideLoadingOverlay = (id: string): void => {
    const index = loadingOverlays.value.findIndex(o => o.id === id)
    if (index > -1) {
      loadingOverlays.value.splice(index, 1)
    }
  }
  
  /**
   * Clear all loading overlays
   */
  const clearLoadingOverlays = (): void => {
    loadingOverlays.value = []
  }

  // =============================================================================
  // NAVIGATION ACTIONS
  // =============================================================================
  
  /**
   * Set current route
   */
  const setCurrentRoute = (route: string): void => {
    if (currentRoute.value !== route) {
      navigationHistory.value.push(currentRoute.value)
      // Keep history reasonable size
      if (navigationHistory.value.length > 50) {
        navigationHistory.value = navigationHistory.value.slice(-25)
      }
    }
    currentRoute.value = route
  }
  
  /**
   * Set page title
   */
  const setPageTitle = (title: string): void => {
    pageTitle.value = title
    if (typeof document !== 'undefined') {
      document.title = `${title} - KitchenPantry CRM`
    }
  }
  
  /**
   * Set breadcrumbs
   */
  const setBreadcrumbs = (crumbs: BreadcrumbItem[]): void => {
    breadcrumbs.value = crumbs.map((crumb, index) => ({
      ...crumb,
      active: index === crumbs.length - 1
    }))
  }
  
  /**
   * Add breadcrumb
   */
  const addBreadcrumb = (crumb: BreadcrumbItem): void => {
    // Mark all existing as inactive
    breadcrumbs.value.forEach(b => b.active = false)
    // Add new active breadcrumb
    breadcrumbs.value.push({ ...crumb, active: true })
  }
  
  /**
   * Get previous route
   */
  const getPreviousRoute = (): string | null => {
    return navigationHistory.value.length > 0 
      ? navigationHistory.value[navigationHistory.value.length - 1]
      : null
  }

  // =============================================================================
  // LAYOUT PREFERENCE ACTIONS
  // =============================================================================
  
  /**
   * Toggle sidebar
   */
  const toggleSidebar = (): void => {
    layoutPreferences.value.sidebarCollapsed = !layoutPreferences.value.sidebarCollapsed
    saveLayoutPreferences()
  }
  
  /**
   * Set theme
   */
  const setTheme = (theme: Theme): void => {
    layoutPreferences.value.theme = theme
    saveLayoutPreferences()
  }
  
  /**
   * Set density
   */
  const setDensity = (density: LayoutPreferences['density']): void => {
    layoutPreferences.value.density = density
    saveLayoutPreferences()
  }
  
  /**
   * Update layout preferences
   */
  const updateLayoutPreferences = (preferences: Partial<LayoutPreferences>): void => {
    layoutPreferences.value = { ...layoutPreferences.value, ...preferences }
    saveLayoutPreferences()
  }
  
  /**
   * Save layout preferences to localStorage
   */
  const saveLayoutPreferences = (): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kitchenPantry_layoutPreferences', JSON.stringify(layoutPreferences.value))
    }
  }
  
  /**
   * Load layout preferences from localStorage
   */
  const loadLayoutPreferences = (): void => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('kitchenPantry_layoutPreferences')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          layoutPreferences.value = { ...layoutPreferences.value, ...parsed }
        } catch (error) {
          console.warn('Failed to parse layout preferences from localStorage')
        }
      }
    }
  }

  // =============================================================================
  // RESPONSIVE ACTIONS
  // =============================================================================
  
  /**
   * Update window dimensions
   */
  const updateWindowDimensions = (): void => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    
    // Update breakpoint
    if (windowWidth.value < 640) {
      currentBreakpoint.value = 'xs'
      isMobile.value = true
      isTablet.value = false
      isDesktop.value = false
    } else if (windowWidth.value < 768) {
      currentBreakpoint.value = 'sm'
      isMobile.value = true
      isTablet.value = false
      isDesktop.value = false
    } else if (windowWidth.value < 1024) {
      currentBreakpoint.value = 'md'
      isMobile.value = false
      isTablet.value = true
      isDesktop.value = false
    } else if (windowWidth.value < 1280) {
      currentBreakpoint.value = 'lg'
      isMobile.value = false
      isTablet.value = false
      isDesktop.value = true
    } else if (windowWidth.value < 1536) {
      currentBreakpoint.value = 'xl'
      isMobile.value = false
      isTablet.value = false
      isDesktop.value = true
    } else {
      currentBreakpoint.value = '2xl'
      isMobile.value = false
      isTablet.value = false
      isDesktop.value = true
    }
    
    // Auto-collapse sidebar on mobile
    if (isMobile.value && !layoutPreferences.value.sidebarCollapsed) {
      layoutPreferences.value.sidebarCollapsed = true
    }
  }

  // =============================================================================
  // GLOBAL SEARCH ACTIONS
  // =============================================================================
  
  /**
   * Open global search
   */
  const openGlobalSearch = (): void => {
    globalSearch.value.isOpen = true
    globalSearch.value.query = ''
    globalSearch.value.results = []
  }
  
  /**
   * Close global search
   */
  const closeGlobalSearch = (): void => {
    globalSearch.value.isOpen = false
    globalSearch.value.query = ''
    globalSearch.value.results = []
    globalSearch.value.loading = false
  }
  
  /**
   * Set search query
   */
  const setSearchQuery = (query: string): void => {
    globalSearch.value.query = query
    
    // Add to recent searches if not empty and not already present
    if (query.trim() && !globalSearch.value.recentSearches.includes(query)) {
      globalSearch.value.recentSearches.unshift(query)
      // Keep only last 10 searches
      globalSearch.value.recentSearches = globalSearch.value.recentSearches.slice(0, 10)
    }
  }
  
  /**
   * Set search results
   */
  const setSearchResults = (results: GlobalSearchState['results']): void => {
    globalSearch.value.results = results
    globalSearch.value.loading = false
  }
  
  /**
   * Set search loading
   */
  const setSearchLoading = (loading: boolean): void => {
    globalSearch.value.loading = loading
  }

  // =============================================================================
  // KEYBOARD SHORTCUT ACTIONS
  // =============================================================================
  
  /**
   * Register keyboard shortcut
   */
  const registerShortcut = (shortcut: KeyboardShortcut): void => {
    // Remove existing shortcut with same key combination
    const existingIndex = keyboardShortcuts.value.findIndex(s => 
      s.key === shortcut.key && 
      JSON.stringify(s.modifiers || []) === JSON.stringify(shortcut.modifiers || [])
    )
    
    if (existingIndex > -1) {
      keyboardShortcuts.value.splice(existingIndex, 1)
    }
    
    keyboardShortcuts.value.push(shortcut)
  }
  
  /**
   * Unregister keyboard shortcut
   */
  const unregisterShortcut = (key: string, modifiers?: string[]): void => {
    const index = keyboardShortcuts.value.findIndex(s => 
      s.key === key && 
      JSON.stringify(s.modifiers || []) === JSON.stringify(modifiers || [])
    )
    
    if (index > -1) {
      keyboardShortcuts.value.splice(index, 1)
    }
  }
  
  /**
   * Handle keyboard event
   */
  const handleKeyboardEvent = (event: KeyboardEvent): boolean => {
    if (!shortcutsEnabled.value) return false
    
    const modifiers: string[] = []
    if (event.ctrlKey) modifiers.push('ctrl')
    if (event.altKey) modifiers.push('alt')
    if (event.shiftKey) modifiers.push('shift')
    if (event.metaKey) modifiers.push('meta')
    
    const matchingShortcut = keyboardShortcuts.value.find(shortcut =>
      !shortcut.disabled &&
      shortcut.key.toLowerCase() === event.key.toLowerCase() &&
      JSON.stringify(shortcut.modifiers || []) === JSON.stringify(modifiers)
    )
    
    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.action()
      return true
    }
    
    return false
  }
  
  /**
   * Enable/disable shortcuts
   */
  const setShortcutsEnabled = (enabled: boolean): void => {
    shortcutsEnabled.value = enabled
  }

  // =============================================================================
  // UTILITY ACTIONS
  // =============================================================================
  
  /**
   * Update user activity timestamp
   */
  const updateUserActivity = (): void => {
    lastUserActivity.value = new Date()
    
    if (isUserIdle.value) {
      isUserIdle.value = false
    }
    
    // Reset idle timeout
    if (idleTimeout.value) {
      clearTimeout(idleTimeout.value)
    }
    
    // Set new idle timeout (5 minutes)
    idleTimeout.value = setTimeout(() => {
      isUserIdle.value = true
    }, 5 * 60 * 1000)
  }
  
  /**
   * Set online/offline status
   */
  const setOnlineStatus = (online: boolean): void => {
    isOffline.value = !online
    
    if (online) {
      showSuccess('Connection restored', 'You are back online')
    } else {
      showWarning('Connection lost', 'Working offline')
    }
  }
  
  /**
   * Set focused element
   */
  const setFocusedElement = (element: HTMLElement | null): void => {
    focusedElement.value = element
  }
  
  /**
   * Reset UI state
   */
  const resetUIState = (): void => {
    notifications.value = []
    closeAllModals()
    clearLoadingOverlays()
    setGlobalLoading('idle')
    globalSearch.value.isOpen = false
    globalSearch.value.query = ''
    globalSearch.value.results = []
  }

  // =============================================================================
  // INITIALIZATION AND EVENT LISTENERS
  // =============================================================================
  
  /**
   * Initialize UI store
   */
  const initializeUIStore = (): void => {
    // Load preferences
    loadLayoutPreferences()
    
    // Set up responsive listeners
    if (typeof window !== 'undefined') {
      updateWindowDimensions()
      window.addEventListener('resize', updateWindowDimensions)
      
      // Online/offline listeners
      window.addEventListener('online', () => setOnlineStatus(true))
      window.addEventListener('offline', () => setOnlineStatus(false))
      
      // User activity listeners
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      activityEvents.forEach(event => {
        document.addEventListener(event, updateUserActivity, { passive: true })
      })
      
      // Keyboard shortcut listener
      document.addEventListener('keydown', handleKeyboardEvent)
      
      // Focus tracking
      document.addEventListener('focusin', (e) => {
        setFocusedElement(e.target as HTMLElement)
      })
      document.addEventListener('focusout', () => {
        setFocusedElement(null)
      })
      
      // Initialize activity tracking
      updateUserActivity()
    }
    
    // Register default shortcuts
    registerShortcut({
      key: 'k',
      modifiers: ['ctrl'],
      description: 'Open global search',
      action: openGlobalSearch
    })
    
    registerShortcut({
      key: 'Escape',
      modifiers: [],
      description: 'Close modal or search',
      action: () => {
        if (globalSearch.value.isOpen) {
          closeGlobalSearch()
        } else if (hasActiveModal.value) {
          closeTopModal()
        }
      }
    })
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================
  
  /**
   * Cleanup UI store
   */
  const cleanupUIStore = (): void => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateWindowDimensions)
      window.removeEventListener('online', () => setOnlineStatus(true))
      window.removeEventListener('offline', () => setOnlineStatus(false))
      
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateUserActivity)
      })
      
      document.removeEventListener('keydown', handleKeyboardEvent)
      document.removeEventListener('focusin', setFocusedElement as any)
      document.removeEventListener('focusout', () => setFocusedElement(null))
    }
    
    if (idleTimeout.value) {
      clearTimeout(idleTimeout.value)
    }
  }

  // =============================================================================
  // WATCHERS
  // =============================================================================
  
  // Save layout preferences when they change
  watch(
    () => layoutPreferences.value,
    () => saveLayoutPreferences(),
    { deep: true }
  )

  // =============================================================================
  // RETURN STORE INTERFACE
  // =============================================================================
  
  return {
    // State (readonly)
    notifications: readonly(notifications),
    modals: readonly(modals),
    modalStack: readonly(modalStack),
    loadingOverlays: readonly(loadingOverlays),
    globalLoading: readonly(globalLoading),
    loadingMessage: readonly(loadingMessage),
    currentRoute: readonly(currentRoute),
    breadcrumbs: readonly(breadcrumbs),
    pageTitle: readonly(pageTitle),
    layoutPreferences: readonly(layoutPreferences),
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet), 
    isDesktop: readonly(isDesktop),
    currentBreakpoint: readonly(currentBreakpoint),
    globalSearch: readonly(globalSearch),
    keyboardShortcuts: readonly(keyboardShortcuts),
    shortcutsEnabled: readonly(shortcutsEnabled),
    isOffline: readonly(isOffline),
    lastUserActivity: readonly(lastUserActivity),
    isUserIdle: readonly(isUserIdle),
    focusedElement: readonly(focusedElement),
    
    // Computed getters
    hasNotifications,
    unreadNotificationCount,
    persistentNotifications,
    hasActiveModal,
    activeModal,
    hasLoadingOverlay,
    isGloballyLoading,
    breakpointClass,
    themeClass,
    densityClass,
    sidebarClass,
    
    // Notification actions
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
    clearNotificationsByType,
    
    // Modal actions
    openModal,
    closeModal,
    closeTopModal,
    closeAllModals,
    
    // Loading actions
    setGlobalLoading,
    showLoadingOverlay,
    updateLoadingOverlay,
    hideLoadingOverlay,
    clearLoadingOverlays,
    
    // Navigation actions
    setCurrentRoute,
    setPageTitle,
    setBreadcrumbs,
    addBreadcrumb,
    getPreviousRoute,
    
    // Layout preference actions
    toggleSidebar,
    setTheme,
    setDensity,
    updateLayoutPreferences,
    loadLayoutPreferences,
    
    // Responsive actions
    updateWindowDimensions,
    
    // Global search actions
    openGlobalSearch,
    closeGlobalSearch,
    setSearchQuery,
    setSearchResults,
    setSearchLoading,
    
    // Keyboard shortcut actions
    registerShortcut,
    unregisterShortcut,
    handleKeyboardEvent,
    setShortcutsEnabled,
    
    // Utility actions
    updateUserActivity,
    setOnlineStatus,
    setFocusedElement,
    resetUIState,
    initializeUIStore,
    cleanupUIStore
  }
})