/**
 * Contact Advocacy Store - Client-Side UI State Management
 * 
 * Manages client-side UI state for contact advocacy relationship management.
 * Server data is handled via TanStack Query hooks in useContactAdvocacy.ts.
 * 
 * ✅ ARCHITECTURE: Pure client-side state only
 * - UI filters and search state
 * - Selected relationship ID tracking (not full objects)
 * - Form state management
 * - Client-side preferences
 * 
 * ❌ DOES NOT STORE: Server data, relationship objects, or computed values
 */

import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { 
  BaseClientState, 
  ClientStateStore, 
  CreateClientFilters, 
  validateClientState 
} from '@/lib/state-type-safety'

// UI View modes for advocacy management
export type AdvocacyViewMode = 'list' | 'cards' | 'table'
export type AdvocacySortBy = 'name' | 'strength' | 'computed_score' | 'date'
export type AdvocacySortOrder = 'asc' | 'desc'

// Client-side filter interface using type-safe pattern
export type ClientAdvocacyFilters = CreateClientFilters<{
  contact_id?: string
  principal_organization_id?: string
  advocacy_strength_min?: number
  advocacy_strength_max?: number
  relationship_type?: string | string[]
  search?: string
  computed_score_min?: number
}>

export interface ContactAdvocacyUIState extends BaseClientState {
  // Selected relationship ID only (not full server object)
  selectedRelationshipId: string | null
  
  // UI Filters and Search (client-side state)
  filters: ClientAdvocacyFilters
  searchQuery: string
  
  // View preferences
  viewMode: AdvocacyViewMode
  sortBy: AdvocacySortBy
  sortOrder: AdvocacySortOrder
  showAdvancedFilters: boolean
  
  // Form state
  isFormOpen: boolean
  formMode: 'create' | 'edit' | null
  editingRelationshipId: string | null
  
  // UI preferences (extends base preferences)
  preferences: BaseClientState['preferences'] & {
    defaultViewMode: AdvocacyViewMode
    cardsPerPage: number
    showComputedScores: boolean
  }
  
  // Client-side actions
  actions: BaseClientState['actions'] & {
    // Selection Management (ID-based, not object-based)
    setSelectedRelationshipId: (relationshipId: string | null) => void
    
    // Search and Filtering
    setFilters: (filters: ClientAdvocacyFilters) => void
    setSearchQuery: (query: string) => void
    clearFilters: () => void
    
    // View Management
    setViewMode: (mode: AdvocacyViewMode) => void
    setSorting: (sortBy: AdvocacySortBy, order?: AdvocacySortOrder) => void
    toggleAdvancedFilters: () => void
    
    // Form Management
    openCreateForm: () => void
    openEditForm: (relationshipId: string) => void
    closeForm: () => void
    
    // Preferences
    updatePreferences: (preferences: Partial<ContactAdvocacyUIState['preferences']>) => void
    
    // Utility
    reset: () => void
  }
}

// Initial client-side state
const initialUIState: Omit<ContactAdvocacyUIState, 'actions'> = {
  selectedRelationshipId: null,
  filters: {},
  searchQuery: '',
  viewMode: 'list',
  sortBy: 'name',
  sortOrder: 'asc',
  showAdvancedFilters: false,
  isFormOpen: false,
  formMode: null,
  editingRelationshipId: null,
  preferences: {
    defaultViewMode: 'list',
    cardsPerPage: 12,
    showComputedScores: true,
    autoRefresh: true
  }
}

export const useContactAdvocacyStore = create<ContactAdvocacyUIState>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        ...initialUIState,
        
        actions: {
          // Selection Management (ID-based)
          setSelectedRelationshipId: (relationshipId: string | null) => {
            set({ selectedRelationshipId: relationshipId })
          },
          
          // Search and Filtering
          setFilters: (filters: ClientAdvocacyFilters) => {
            set({ filters })
          },

          setSearchQuery: (query: string) => {
            set({ searchQuery: query })
          },

          clearFilters: () => {
            set({ filters: {}, searchQuery: '' })
          },
          
          // View Management
          setViewMode: (mode: AdvocacyViewMode) => {
            set({ viewMode: mode })
          },

          setSorting: (sortBy: AdvocacySortBy, order?: AdvocacySortOrder) => {
            set(state => ({
              sortBy,
              sortOrder: order || (state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc')
            }))
          },

          toggleAdvancedFilters: () => {
            set(state => ({ showAdvancedFilters: !state.showAdvancedFilters }))
          },
          
          // Form Management
          openCreateForm: () => {
            set({ 
              isFormOpen: true, 
              formMode: 'create', 
              editingRelationshipId: null 
            })
          },

          openEditForm: (relationshipId: string) => {
            set({ 
              isFormOpen: true, 
              formMode: 'edit', 
              editingRelationshipId: relationshipId 
            })
          },

          closeForm: () => {
            set({ 
              isFormOpen: false, 
              formMode: null, 
              editingRelationshipId: null 
            })
          },
          
          // Preferences (with type safety validation)
          updatePreferences: (preferences: Partial<ContactAdvocacyUIState['preferences']>) => {
            if (process.env.NODE_ENV === 'development') {
              validateClientState(preferences, 'contact-advocacy-ui-store')
            }
            set(state => ({
              preferences: { ...state.preferences, ...preferences }
            }))
          },
          
          // Utility
          reset: () => {
            set(initialUIState)
            if (process.env.NODE_ENV === 'development') {
              validateClientState(initialUIState, 'contact-advocacy-ui-store')
            }
          }
        }
      })),
      {
        name: 'contact-advocacy-ui-store',
        partialize: (state) => ({
          // Persist UI preferences and settings
          viewMode: state.viewMode,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          preferences: state.preferences,
          filters: state.filters // Persist last used filters
        })
      }
    ),
    {
      name: 'contact-advocacy-ui-store'
    }
  )
)

// Export convenience hooks for different aspects of the store
export const useAdvocacySelection = () => {
  const store = useContactAdvocacyStore()
  return {
    selectedRelationshipId: store.selectedRelationshipId,
    setSelectedRelationshipId: store.actions.setSelectedRelationshipId
  }
}

export const useAdvocacyFilters = () => {
  const store = useContactAdvocacyStore()
  return {
    filters: store.filters,
    searchQuery: store.searchQuery,
    setFilters: store.actions.setFilters,
    setSearchQuery: store.actions.setSearchQuery,
    clearFilters: store.actions.clearFilters
  }
}

export const useAdvocacyView = () => {
  const store = useContactAdvocacyStore()
  return {
    viewMode: store.viewMode,
    sortBy: store.sortBy,
    sortOrder: store.sortOrder,
    showAdvancedFilters: store.showAdvancedFilters,
    setViewMode: store.actions.setViewMode,
    setSorting: store.actions.setSorting,
    toggleAdvancedFilters: store.actions.toggleAdvancedFilters
  }
}

export const useAdvocacyForm = () => {
  const store = useContactAdvocacyStore()
  return {
    isFormOpen: store.isFormOpen,
    formMode: store.formMode,
    editingRelationshipId: store.editingRelationshipId,
    openCreateForm: store.actions.openCreateForm,
    openEditForm: store.actions.openEditForm,
    closeForm: store.actions.closeForm
  }
}

export const useAdvocacyPreferences = () => {
  const store = useContactAdvocacyStore()
  return {
    preferences: store.preferences,
    updatePreferences: store.actions.updatePreferences
  }
}