/**
 * Contact Advocacy Store - Principal CRM Business Logic
 * 
 * Manages contact-to-principal advocacy relationships with advanced business rules,
 * advocacy scoring, and performance optimization for mobile field usage.
 * 
 * Key Features:
 * - Contact-Principal relationship management
 * - Advocacy strength scoring (1-10 scale)
 * - Business rule validation
 * - Performance-optimized caching
 * - Mobile-first design
 */

import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type {
  ContactPreferredPrincipal,
  ContactPreferredPrincipalInsert,
  ContactPreferredPrincipalUpdate,
  Contact,
  Organization,
  PurchaseInfluenceLevel,
  DecisionAuthorityRole
} from '@/types/entities'

// Extended types for advocacy management
export interface ContactAdvocacyRelationship extends ContactPreferredPrincipal {
  contact?: Contact
  principal_organization?: Organization
  computed_advocacy_score?: number
  influence_weight?: number
  authority_weight?: number
}

export interface AdvocacyFilters {
  contact_id?: string
  principal_organization_id?: string
  advocacy_strength_min?: number
  advocacy_strength_max?: number
  relationship_type?: string | string[]
  search?: string
  computed_score_min?: number
}

export interface AdvocacyMetrics {
  total_relationships: number
  average_advocacy_strength: number
  high_advocacy_count: number // strength >= 8
  medium_advocacy_count: number // strength 4-7
  low_advocacy_count: number // strength <= 3
  relationship_types: Record<string, number>
  top_principals: Array<{
    organization: Organization
    relationship_count: number
    average_strength: number
  }>
  top_advocates: Array<{
    contact: Contact
    relationship_count: number
    average_strength: number
    computed_score: number
  }>
}

export interface ContactAdvocacyState {
  // Core State
  relationships: ContactAdvocacyRelationship[]
  selectedRelationship: ContactAdvocacyRelationship | null
  
  // Loading States
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Cache Management
  lastFetched: number | null
  cacheTimeout: number // 5 minutes default
  
  // Filters and Search
  filters: AdvocacyFilters
  searchQuery: string
  
  // Metrics
  metrics: AdvocacyMetrics | null
  
  // Error Handling
  error: string | null
  
  // Business Logic Methods
  actions: {
    // Core CRUD Operations
    fetchRelationships: (filters?: AdvocacyFilters) => Promise<void>
    fetchRelationshipsByContact: (contactId: string) => Promise<ContactAdvocacyRelationship[]>
    fetchRelationshipsByPrincipal: (principalId: string) => Promise<ContactAdvocacyRelationship[]>
    createRelationship: (data: ContactPreferredPrincipalInsert) => Promise<ContactAdvocacyRelationship>
    updateRelationship: (id: string, updates: ContactPreferredPrincipalUpdate) => Promise<ContactAdvocacyRelationship>
    deleteRelationship: (id: string) => Promise<void>
    
    // Advanced Operations
    computeAdvocacyScore: (contact: Contact, advocacyStrength: number) => number
    validateAdvocacyAssignment: (contactId: string, principalId: string) => Promise<{ valid: boolean; reason?: string }>
    bulkUpdateAdvocacyStrength: (relationships: Array<{ id: string; advocacy_strength: number }>) => Promise<void>
    
    // Search and Filtering
    setFilters: (filters: AdvocacyFilters) => void
    setSearchQuery: (query: string) => void
    clearFilters: () => void
    getFilteredRelationships: () => ContactAdvocacyRelationship[]
    
    // Metrics and Analytics
    calculateMetrics: () => Promise<AdvocacyMetrics>
    getAdvocacyTrends: (timeframe: 'week' | 'month' | 'quarter') => Promise<any>
    
    // Cache Management
    invalidateCache: () => void
    refreshCache: () => Promise<void>
    
    // Utility Methods
    setSelectedRelationship: (relationship: ContactAdvocacyRelationship | null) => void
    clearError: () => void
    reset: () => void
  }
}

// Business Logic Constants
const ADVOCACY_SCORING_WEIGHTS = {
  purchase_influence: {
    'High': 1.0,
    'Medium': 0.7,
    'Low': 0.4,
    'Unknown': 0.3
  },
  decision_authority: {
    'Decision Maker': 1.0,
    'Influencer': 0.8,
    'End User': 0.5,
    'Gatekeeper': 0.6
  }
} as const

const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const HIGH_ADVOCACY_THRESHOLD = 8
const MEDIUM_ADVOCACY_THRESHOLD = 4

// Initial state
const initialState = {
  relationships: [],
  selectedRelationship: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  lastFetched: null,
  cacheTimeout: DEFAULT_CACHE_TIMEOUT,
  filters: {},
  searchQuery: '',
  metrics: null,
  error: null
}

export const useContactAdvocacyStore = create<ContactAdvocacyState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        ...initialState,
        
        actions: {
          // Core CRUD Operations
          fetchRelationships: async (filters?: AdvocacyFilters) => {
            const state = get()
            
            // Check cache validity
            if (
              state.lastFetched &&
              Date.now() - state.lastFetched < state.cacheTimeout &&
              !filters
            ) {
              return
            }

            set({ isLoading: true, error: null })

            try {
              let query = supabase
                .from('contact_preferred_principals')
                .select(`
                  *,
                  contact:contacts(*),
                  principal_organization:organizations(*)
                `)
                .is('deleted_at', null)

              // Apply filters
              if (filters?.contact_id) {
                query = query.eq('contact_id', filters.contact_id)
              }
              if (filters?.principal_organization_id) {
                query = query.eq('principal_organization_id', filters.principal_organization_id)
              }
              if (filters?.advocacy_strength_min) {
                query = query.gte('advocacy_strength', filters.advocacy_strength_min)
              }
              if (filters?.advocacy_strength_max) {
                query = query.lte('advocacy_strength', filters.advocacy_strength_max)
              }
              if (filters?.relationship_type) {
                if (Array.isArray(filters.relationship_type)) {
                  query = query.in('relationship_type', filters.relationship_type)
                } else {
                  query = query.eq('relationship_type', filters.relationship_type)
                }
              }

              const { data, error } = await query
              
              if (error) throw error

              // Compute advocacy scores for each relationship
              const relationshipsWithScores = data.map(relationship => {
                const computedScore = relationship.contact 
                  ? get().actions.computeAdvocacyScore(relationship.contact, relationship.advocacy_strength || 5)
                  : relationship.advocacy_strength || 5

                return {
                  ...relationship,
                  computed_advocacy_score: computedScore,
                  influence_weight: relationship.contact?.purchase_influence 
                    ? ADVOCACY_SCORING_WEIGHTS.purchase_influence[relationship.contact.purchase_influence as PurchaseInfluenceLevel]
                    : 0.3,
                  authority_weight: relationship.contact?.decision_authority
                    ? ADVOCACY_SCORING_WEIGHTS.decision_authority[relationship.contact.decision_authority as DecisionAuthorityRole]
                    : 0.5
                }
              })

              set({
                relationships: relationshipsWithScores,
                lastFetched: Date.now(),
                isLoading: false,
                filters: filters || state.filters
              })

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to fetch advocacy relationships',
                isLoading: false
              })
            }
          },

          fetchRelationshipsByContact: async (contactId: string) => {
            try {
              const { data, error } = await supabase
                .from('contact_preferred_principals')
                .select(`
                  *,
                  contact:contacts(*),
                  principal_organization:organizations(*)
                `)
                .eq('contact_id', contactId)
                .is('deleted_at', null)

              if (error) throw error

              const relationshipsWithScores = data.map(relationship => ({
                ...relationship,
                computed_advocacy_score: relationship.contact 
                  ? get().actions.computeAdvocacyScore(relationship.contact, relationship.advocacy_strength || 5)
                  : relationship.advocacy_strength || 5
              }))

              return relationshipsWithScores
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to fetch contact advocacy relationships'
              })
              return []
            }
          },

          fetchRelationshipsByPrincipal: async (principalId: string) => {
            try {
              const { data, error } = await supabase
                .from('contact_preferred_principals')
                .select(`
                  *,
                  contact:contacts(*),
                  principal_organization:organizations(*)
                `)
                .eq('principal_organization_id', principalId)
                .is('deleted_at', null)

              if (error) throw error

              const relationshipsWithScores = data.map(relationship => ({
                ...relationship,
                computed_advocacy_score: relationship.contact 
                  ? get().actions.computeAdvocacyScore(relationship.contact, relationship.advocacy_strength || 5)
                  : relationship.advocacy_strength || 5
              }))

              return relationshipsWithScores
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to fetch principal advocacy relationships'
              })
              return []
            }
          },

          createRelationship: async (data: ContactPreferredPrincipalInsert) => {
            set({ isCreating: true, error: null })

            try {
              // Get current user for audit fields
              const { data: { user }, error: authError } = await supabase.auth.getUser()
              
              if (authError || !user) {
                throw new Error('Authentication required to create advocacy relationship')
              }

              // Validate the advocacy assignment
              const validation = await get().actions.validateAdvocacyAssignment(
                data.contact_id,
                data.principal_organization_id
              )

              if (!validation.valid) {
                throw new Error(validation.reason || 'Invalid advocacy assignment')
              }

              // Ensure required audit fields
              const relationshipData = {
                ...data,
                created_by: user.id,
                updated_by: user.id,
              }

              const { data: newRelationship, error } = await supabase
                .from('contact_preferred_principals')
                .insert(relationshipData)
                .select(`
                  *,
                  contact:contacts(*),
                  principal_organization:organizations(*)
                `)
                .single()

              if (error) throw error

              // Compute advocacy score
              const relationshipWithScore = {
                ...newRelationship,
                computed_advocacy_score: newRelationship.contact 
                  ? get().actions.computeAdvocacyScore(newRelationship.contact, newRelationship.advocacy_strength || 5)
                  : newRelationship.advocacy_strength || 5
              }

              // Update store state
              set(state => ({
                relationships: [relationshipWithScore, ...state.relationships],
                isCreating: false
              }))

              // Invalidate cache
              get().actions.invalidateCache()

              return relationshipWithScore

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to create advocacy relationship',
                isCreating: false
              })
              throw error
            }
          },

          updateRelationship: async (id: string, updates: ContactPreferredPrincipalUpdate) => {
            set({ isUpdating: true, error: null })

            try {
              const { data: updatedRelationship, error } = await supabase
                .from('contact_preferred_principals')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select(`
                  *,
                  contact:contacts(*),
                  principal_organization:organizations(*)
                `)
                .single()

              if (error) throw error

              // Compute advocacy score
              const relationshipWithScore = {
                ...updatedRelationship,
                computed_advocacy_score: updatedRelationship.contact 
                  ? get().actions.computeAdvocacyScore(updatedRelationship.contact, updatedRelationship.advocacy_strength || 5)
                  : updatedRelationship.advocacy_strength || 5
              }

              // Update store state
              set(state => ({
                relationships: state.relationships.map(rel => 
                  rel.id === id ? relationshipWithScore : rel
                ),
                selectedRelationship: state.selectedRelationship?.id === id 
                  ? relationshipWithScore 
                  : state.selectedRelationship,
                isUpdating: false
              }))

              // Invalidate cache
              get().actions.invalidateCache()

              return relationshipWithScore

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to update advocacy relationship',
                isUpdating: false
              })
              throw error
            }
          },

          deleteRelationship: async (id: string) => {
            set({ isDeleting: true, error: null })

            try {
              const { error } = await supabase
                .from('contact_preferred_principals')
                .update({ 
                  deleted_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', id)

              if (error) throw error

              // Update store state
              set(state => ({
                relationships: state.relationships.filter(rel => rel.id !== id),
                selectedRelationship: state.selectedRelationship?.id === id 
                  ? null 
                  : state.selectedRelationship,
                isDeleting: false
              }))

              // Invalidate cache
              get().actions.invalidateCache()

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to delete advocacy relationship',
                isDeleting: false
              })
              throw error
            }
          },

          // Advanced Business Logic
          computeAdvocacyScore: (contact: Contact, advocacyStrength: number) => {
            // Base advocacy strength (1-10)
            const baseScore = advocacyStrength

            // Purchase influence weight
            const influenceWeight = contact.purchase_influence 
              ? ADVOCACY_SCORING_WEIGHTS.purchase_influence[contact.purchase_influence as PurchaseInfluenceLevel]
              : 0.3

            // Decision authority weight
            const authorityWeight = contact.decision_authority
              ? ADVOCACY_SCORING_WEIGHTS.decision_authority[contact.decision_authority as DecisionAuthorityRole]
              : 0.5

            // Computed score: base score * influence factor * authority factor
            // Scale to 1-10 range and round to 1 decimal place
            const computedScore = Math.min(10, baseScore * influenceWeight * authorityWeight)
            return Math.round(computedScore * 10) / 10
          },

          validateAdvocacyAssignment: async (contactId: string, principalId: string) => {
            try {
              // Check if relationship already exists
              const { data: existing, error } = await supabase
                .from('contact_preferred_principals')
                .select('id')
                .eq('contact_id', contactId)
                .eq('principal_organization_id', principalId)
                .is('deleted_at', null)
                .maybeSingle()

              if (error) throw error

              if (existing) {
                return {
                  valid: false,
                  reason: 'Advocacy relationship already exists between this contact and principal'
                }
              }

              // Validate contact exists and is active
              const { data: contact, error: contactError } = await supabase
                .from('contacts')
                .select('id, organization_id')
                .eq('id', contactId)
                .is('deleted_at', null)
                .single()

              if (contactError || !contact) {
                return {
                  valid: false,
                  reason: 'Contact not found or inactive'
                }
              }

              // Validate principal organization exists and is a principal
              const { data: principal, error: principalError } = await supabase
                .from('organizations')
                .select('id, type')
                .eq('id', principalId)
                .eq('type', 'principal')
                .is('deleted_at', null)
                .single()

              if (principalError || !principal) {
                return {
                  valid: false,
                  reason: 'Principal organization not found or not a principal type'
                }
              }

              return { valid: true }

            } catch (error) {
              return {
                valid: false,
                reason: error instanceof Error ? error.message : 'Validation failed'
              }
            }
          },

          bulkUpdateAdvocacyStrength: async (relationships: Array<{ id: string; advocacy_strength: number }>) => {
            set({ isUpdating: true, error: null })

            try {
              const updates = relationships.map(async ({ id, advocacy_strength }) => {
                return supabase
                  .from('contact_preferred_principals')
                  .update({ 
                    advocacy_strength,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', id)
              })

              await Promise.all(updates)

              // Refresh relationships to get updated data
              await get().actions.fetchRelationships()

              set({ isUpdating: false })

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to bulk update advocacy strengths',
                isUpdating: false
              })
              throw error
            }
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

          getFilteredRelationships: () => {
            const { relationships, filters, searchQuery } = get()
            
            let filtered = [...relationships]

            // Apply search query
            if (searchQuery) {
              const query = searchQuery.toLowerCase()
              filtered = filtered.filter(rel => 
                rel.contact?.first_name?.toLowerCase().includes(query) ||
                rel.contact?.last_name?.toLowerCase().includes(query) ||
                rel.principal_organization?.name?.toLowerCase().includes(query) ||
                rel.advocacy_notes?.toLowerCase().includes(query)
              )
            }

            // Apply computed score filters
            if (filters.computed_score_min) {
              filtered = filtered.filter(rel => 
                (rel.computed_advocacy_score || 0) >= filters.computed_score_min!
              )
            }

            return filtered
          },

          // Metrics and Analytics
          calculateMetrics: async () => {
            const { relationships } = get()

            if (relationships.length === 0) {
              const emptyMetrics: AdvocacyMetrics = {
                total_relationships: 0,
                average_advocacy_strength: 0,
                high_advocacy_count: 0,
                medium_advocacy_count: 0,
                low_advocacy_count: 0,
                relationship_types: {},
                top_principals: [],
                top_advocates: []
              }
              set({ metrics: emptyMetrics })
              return emptyMetrics
            }

            // Calculate basic metrics
            const totalRelationships = relationships.length
            const averageAdvocacyStrength = relationships.reduce(
              (sum, rel) => sum + (rel.advocacy_strength || 0), 0
            ) / totalRelationships

            const highAdvocacyCount = relationships.filter(
              rel => (rel.advocacy_strength || 0) >= HIGH_ADVOCACY_THRESHOLD
            ).length

            const mediumAdvocacyCount = relationships.filter(
              rel => {
                const strength = rel.advocacy_strength || 0
                return strength >= MEDIUM_ADVOCACY_THRESHOLD && strength < HIGH_ADVOCACY_THRESHOLD
              }
            ).length

            const lowAdvocacyCount = relationships.filter(
              rel => (rel.advocacy_strength || 0) < MEDIUM_ADVOCACY_THRESHOLD
            ).length

            // Relationship types distribution
            const relationshipTypes: Record<string, number> = {}
            relationships.forEach(rel => {
              const type = rel.relationship_type || 'unknown'
              relationshipTypes[type] = (relationshipTypes[type] || 0) + 1
            })

            // Top principals by relationship count and average strength
            const principalStats: Record<string, { 
              organization: Organization
              count: number
              totalStrength: number
            }> = {}

            relationships.forEach(rel => {
              if (rel.principal_organization) {
                const id = rel.principal_organization.id
                if (!principalStats[id]) {
                  principalStats[id] = {
                    organization: rel.principal_organization,
                    count: 0,
                    totalStrength: 0
                  }
                }
                principalStats[id].count += 1
                principalStats[id].totalStrength += rel.advocacy_strength || 0
              }
            })

            const topPrincipals = Object.values(principalStats)
              .map(stat => ({
                organization: stat.organization,
                relationship_count: stat.count,
                average_strength: stat.totalStrength / stat.count
              }))
              .sort((a, b) => b.relationship_count - a.relationship_count)
              .slice(0, 10)

            // Top advocates by relationship count and computed score
            const contactStats: Record<string, {
              contact: Contact
              count: number
              totalStrength: number
              totalComputedScore: number
            }> = {}

            relationships.forEach(rel => {
              if (rel.contact) {
                const id = rel.contact.id
                if (!contactStats[id]) {
                  contactStats[id] = {
                    contact: rel.contact,
                    count: 0,
                    totalStrength: 0,
                    totalComputedScore: 0
                  }
                }
                contactStats[id].count += 1
                contactStats[id].totalStrength += rel.advocacy_strength || 0
                contactStats[id].totalComputedScore += rel.computed_advocacy_score || 0
              }
            })

            const topAdvocates = Object.values(contactStats)
              .map(stat => ({
                contact: stat.contact,
                relationship_count: stat.count,
                average_strength: stat.totalStrength / stat.count,
                computed_score: stat.totalComputedScore / stat.count
              }))
              .sort((a, b) => b.computed_score - a.computed_score)
              .slice(0, 10)

            const metrics: AdvocacyMetrics = {
              total_relationships: totalRelationships,
              average_advocacy_strength: Math.round(averageAdvocacyStrength * 10) / 10,
              high_advocacy_count: highAdvocacyCount,
              medium_advocacy_count: mediumAdvocacyCount,
              low_advocacy_count: lowAdvocacyCount,
              relationship_types: relationshipTypes,
              top_principals: topPrincipals,
              top_advocates: topAdvocates
            }

            set({ metrics })
            return metrics
          },

          getAdvocacyTrends: async (/* _timeframe?: 'week' | 'month' | 'quarter' */) => {
            // Implementation for trend analysis would go here
            // This would analyze advocacy strength changes over time
            return {}
          },

          // Cache Management
          invalidateCache: () => {
            set({ lastFetched: null })
          },

          refreshCache: async () => {
            get().actions.invalidateCache()
            await get().actions.fetchRelationships()
          },

          // Utility Methods
          setSelectedRelationship: (relationship: ContactAdvocacyRelationship | null) => {
            set({ selectedRelationship: relationship })
          },

          clearError: () => {
            set({ error: null })
          },

          reset: () => {
            set(initialState)
          }
        }
      })),
      {
        name: 'contact-advocacy-store',
        partialize: (state) => ({
          // Only persist non-sensitive data
          cacheTimeout: state.cacheTimeout,
          filters: state.filters
        })
      }
    ),
    {
      name: 'contact-advocacy-store'
    }
  )
)

// Export helper hooks for common use cases
export const useAdvocacyRelationships = () => {
  const store = useContactAdvocacyStore()
  return {
    relationships: store.relationships,
    isLoading: store.isLoading,
    error: store.error,
    fetchRelationships: store.actions.fetchRelationships,
    getFilteredRelationships: store.actions.getFilteredRelationships
  }
}

export const useAdvocacyActions = () => {
  const store = useContactAdvocacyStore()
  return {
    createRelationship: store.actions.createRelationship,
    updateRelationship: store.actions.updateRelationship,
    deleteRelationship: store.actions.deleteRelationship,
    computeAdvocacyScore: store.actions.computeAdvocacyScore,
    validateAdvocacyAssignment: store.actions.validateAdvocacyAssignment,
    isCreating: store.isCreating,
    isUpdating: store.isUpdating,
    isDeleting: store.isDeleting
  }
}

export const useAdvocacyMetrics = () => {
  const store = useContactAdvocacyStore()
  return {
    metrics: store.metrics,
    calculateMetrics: store.actions.calculateMetrics
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