/**
 * Contact Advocacy Store - Client-Side UI State Management
 * 
 * Manages client-side UI state for contact advocacy relationship management.
 * Server data is handled via TanStack Query hooks in useContactAdvocacy.ts.
 * 
 * Key Features:
 * - UI filters and search state
 * - Selected relationship tracking
 * - Form state management
 * - Client-side preferences
 */

import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import type { ContactAdvocacyRelationship, AdvocacyFilters } from '@/features/contacts/hooks/useContactAdvocacy'

// UI View modes for advocacy management
export type AdvocacyViewMode = 'list' | 'cards' | 'table'
export type AdvocacySortBy = 'name' | 'strength' | 'computed_score' | 'date'
export type AdvocacySortOrder = 'asc' | 'desc'

export interface ContactAdvocacyUIState {
  // Selected relationship for detail view/editing
  selectedRelationship: ContactAdvocacyRelationship | null
  
  // UI Filters and Search (client-side state)
  filters: AdvocacyFilters
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
  
  // UI preferences
  preferences: {
    defaultViewMode: AdvocacyViewMode
    cardsPerPage: number
    showComputedScores: boolean
    autoRefreshEnabled: boolean
  }
  
  // Client-side actions
  actions: {
    // Selection Management
    setSelectedRelationship: (relationship: ContactAdvocacyRelationship | null) => void
    
    // Search and Filtering
    setFilters: (filters: AdvocacyFilters) => void
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
  selectedRelationship: null,
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
    autoRefreshEnabled: true
  }
}

export const useContactAdvocacyStore = create<ContactAdvocacyUIState>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        ...initialUIState,
        
        actions: {
          // Selection Management
          setSelectedRelationship: (relationship: ContactAdvocacyRelationship | null) => {
            set({ selectedRelationship: relationship })
          },
          
          // Search and Filtering
          setFilters: (filters: AdvocacyFilters) => {
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
          
          // Preferences
          updatePreferences: (preferences: Partial<ContactAdvocacyUIState['preferences']>) => {
            set(state => ({
              preferences: { ...state.preferences, ...preferences }
            }))
          },
          
          // Utility
          reset: () => {
            set(initialUIState)
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
    selectedRelationship: store.selectedRelationship,
    setSelectedRelationship: store.actions.setSelectedRelationship
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