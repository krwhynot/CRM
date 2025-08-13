/**
 * Store Index for KitchenPantry CRM
 * 
 * Centralized exports and setup for all Pinia stores including:
 * - Store exports for easy importing
 * - Store initialization and cleanup utilities
 * - Cross-store dependency management
 * - Hot module replacement support
 */

// Core store exports
export { useAuthStore } from './authStore'
export { useOrganizationStore } from './organizationStore'
export { useContactStore } from './contactStore'
export { useProductStore } from './productStore'
export { useOpportunityStore } from './opportunityStore'
export { useInteractionStore } from './interactionStore'
export { useRelationshipProgressionStore } from './relationshipProgressionStore'
export { useUIStore } from './uiStore'
export { useDashboardStore } from './dashboardStore'

// Store utilities and types
import { createPinia, type Pinia } from 'pinia'
import type { App } from 'vue'

// Store instances for direct access if needed
import { useAuthStore } from './authStore'
import { useOrganizationStore } from './organizationStore'
import { useContactStore } from './contactStore'
import { useProductStore } from './productStore'
import { useOpportunityStore } from './opportunityStore'
import { useInteractionStore } from './interactionStore'
import { useRelationshipProgressionStore } from './relationshipProgressionStore'
import { useUIStore } from './uiStore'
import { useDashboardStore } from './dashboardStore'

// =============================================================================
// STORE SETUP AND INITIALIZATION
// =============================================================================

/**
 * Create and configure Pinia instance
 */
export const createStores = (): Pinia => {
  const pinia = createPinia()

  // Add development tools support
  if (import.meta.env.DEV) {
    // Enable Vue devtools integration
    pinia.use(({ store }) => {
      store.$subscribe((mutation, state) => {
        console.debug(`[${store.$id}] ${mutation.type}:`, mutation.payload)
      })
    })
  }

  return pinia
}

/**
 * Install stores plugin for Vue app
 */
export const installStores = (app: App): void => {
  const pinia = createStores()
  app.use(pinia)
}

// =============================================================================
// STORE INITIALIZATION HELPERS
// =============================================================================

/**
 * Initialize all stores with proper dependencies
 * Call this after user authentication is established
 */
export const initializeStores = (): void => {
  // Initialize UI store first (no dependencies)
  const uiStore = useUIStore()
  uiStore.initializeUIStore()
  
  // Initialize auth store (no dependencies)
  const authStore = useAuthStore()
  
  // Wait for authentication before initializing data stores
  if (authStore.isAuthenticated) {
    // Initialize data stores in dependency order
    const organizationStore = useOrganizationStore()
    const contactStore = useContactStore()
    const productStore = useProductStore()
    const opportunityStore = useOpportunityStore()
    const interactionStore = useInteractionStore()
    const relationshipProgressionStore = useRelationshipProgressionStore()
    
    // Fetch initial data if needed
    Promise.all([
      organizationStore.fetchOrganizations().catch(console.error),
      contactStore.fetchContacts().catch(console.error),
      productStore.fetchProducts().catch(console.error),
      opportunityStore.fetchOpportunities().catch(console.error),
      interactionStore.fetchInteractions().catch(console.error),
      relationshipProgressionStore.fetchProgressions().catch(console.error)
    ]).then(() => {
      console.info('All stores initialized successfully')
    }).catch((error) => {
      console.error('Error initializing stores:', error)
    })
  }
}

/**
 * Reset all stores to initial state
 * Call this on user logout or app reset
 */
export const resetAllStores = (): void => {
  try {
    const organizationStore = useOrganizationStore()
    const contactStore = useContactStore()
    const productStore = useProductStore()
    const opportunityStore = useOpportunityStore()
    const interactionStore = useInteractionStore()
    const relationshipProgressionStore = useRelationshipProgressionStore()
    const uiStore = useUIStore()
    
    // Reset data stores first
    organizationStore.resetStore()
    contactStore.resetStore()
    productStore.resetStore()
    opportunityStore.resetStore()
    interactionStore.resetStore()
    relationshipProgressionStore.resetStore()
    
    // Reset UI store last but preserve layout preferences
    uiStore.resetUIState()
    
    console.info('All stores reset successfully')
  } catch (error) {
    console.error('Error resetting stores:', error)
  }
}

/**
 * Cleanup all stores
 * Call this on app unmount or hot reload
 */
export const cleanupStores = (): void => {
  try {
    const uiStore = useUIStore()
    uiStore.cleanupUIStore()
    
    console.info('Store cleanup completed')
  } catch (error) {
    console.error('Error cleaning up stores:', error)
  }
}

// =============================================================================
// STORE DEPENDENCY GRAPH
// =============================================================================

/**
 * Store dependency relationships for proper initialization order
 */
export const STORE_DEPENDENCIES = {
  auth: [], // No dependencies
  ui: [], // No dependencies
  organizations: ['auth'], // Depends on auth
  contacts: ['auth', 'organizations'], // Depends on auth and organizations
  products: ['auth', 'organizations'], // Depends on auth and organizations
  opportunities: ['auth', 'organizations', 'contacts'], // Depends on auth, organizations, contacts
  interactions: ['auth', 'organizations', 'contacts', 'opportunities'], // Depends on all other data stores
  relationshipProgression: ['auth', 'organizations', 'contacts'] // Depends on auth, organizations, contacts
} as const

/**
 * Get store instance by name
 */
export const getStore = (storeName: keyof typeof STORE_DEPENDENCIES) => {
  switch (storeName) {
    case 'auth':
      return useAuthStore()
    case 'ui':
      return useUIStore()
    case 'organizations':
      return useOrganizationStore()
    case 'contacts':
      return useContactStore()
    case 'products':
      return useProductStore()
    case 'opportunities':
      return useOpportunityStore()
    case 'interactions':
      return useInteractionStore()
    case 'relationshipProgression':
      return useRelationshipProgressionStore()
    default:
      throw new Error(`Unknown store: ${storeName}`)
  }
}

// =============================================================================
// HOT MODULE REPLACEMENT SUPPORT
// =============================================================================

if (import.meta.hot) {
  import.meta.hot.accept(['./authStore', './organizationStore', './contactStore', './productStore', './opportunityStore', './interactionStore', './uiStore'], (newModules) => {
    console.info('Hot reloading stores...')
    
    // Preserve current state during HMR
    const currentStates = {
      auth: useAuthStore().$state,
      organizations: useOrganizationStore().$state,
      contacts: useContactStore().$state,
      products: useProductStore().$state,
      opportunities: useOpportunityStore().$state,
      interactions: useInteractionStore().$state,
      ui: useUIStore().$state
    }
    
    // After HMR, restore states if needed
    setTimeout(() => {
      try {
        // Restore authentication state if user was logged in
        if (currentStates.auth.isAuthenticated) {
          initializeStores()
        }
        console.info('Store states restored after HMR')
      } catch (error) {
        console.error('Error restoring store states after HMR:', error)
      }
    }, 100)
  })
}

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

if (import.meta.env.DEV) {
  // Global access to stores for debugging
  ;(window as any).__STORES__ = {
    auth: () => useAuthStore(),
    ui: () => useUIStore(),
    organizations: () => useOrganizationStore(),
    contacts: () => useContactStore(),
    products: () => useProductStore(),
    opportunities: () => useOpportunityStore(),
    interactions: () => useInteractionStore(),
    
    // Utility functions
    init: initializeStores,
    reset: resetAllStores,
    cleanup: cleanupStores
  }
  
  console.info('Development stores available at window.__STORES__')
}

// =============================================================================
// STORE COMPOSITION HELPERS
// =============================================================================

/**
 * Compose multiple stores for complex operations
 * Useful for components that need multiple store interactions
 */
export const useStores = () => ({
  auth: useAuthStore(),
  ui: useUIStore(),
  organizations: useOrganizationStore(),
  contacts: useContactStore(),
  products: useProductStore(),
  opportunities: useOpportunityStore(),
  interactions: useInteractionStore(),
  relationshipProgression: useRelationshipProgressionStore()
})

/**
 * Get data stores only (excludes auth and ui)
 */
export const useDataStores = () => ({
  organizations: useOrganizationStore(),
  contacts: useContactStore(),
  products: useProductStore(),
  opportunities: useOpportunityStore(),
  interactions: useInteractionStore(),
  relationshipProgression: useRelationshipProgressionStore()
})

/**
 * Check if all data stores are ready (not loading)
 */
export const useStoresReady = () => {
  const dataStores = useDataStores()
  
  return Object.values(dataStores).every(store => 
    !store.isLoading && !store.hasErrors
  )
}

/**
 * Get combined loading state across all stores
 */
export const useGlobalLoading = () => {
  const dataStores = useDataStores()
  
  return Object.values(dataStores).some(store => store.isLoading)
}

/**
 * Get combined error state across all stores
 */
export const useGlobalErrors = () => {
  const dataStores = useDataStores()
  
  const errors: Record<string, any> = {}
  Object.entries(dataStores).forEach(([name, store]) => {
    if (store.hasErrors) {
      errors[name] = store.errors
    }
  })
  
  return errors
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type StoreNames = keyof typeof STORE_DEPENDENCIES
export type StoreInstance = ReturnType<typeof getStore>

// Default export for convenience
export default {
  createStores,
  installStores,
  initializeStores,
  resetAllStores,
  cleanupStores,
  getStore,
  useStores,
  useDataStores,
  useStoresReady,
  useGlobalLoading,
  useGlobalErrors,
  STORE_DEPENDENCIES
}