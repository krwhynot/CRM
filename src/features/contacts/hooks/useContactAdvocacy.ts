import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

const HIGH_ADVOCACY_THRESHOLD = 8
const MEDIUM_ADVOCACY_THRESHOLD = 4

// Query key factory
export const advocacyKeys = {
  all: ['contact-advocacy'] as const,
  lists: () => [...advocacyKeys.all, 'list'] as const,
  list: (filters?: AdvocacyFilters) => [...advocacyKeys.lists(), { filters }] as const,
  byContact: (contactId: string) => [...advocacyKeys.all, 'by-contact', contactId] as const,
  byPrincipal: (principalId: string) => [...advocacyKeys.all, 'by-principal', principalId] as const,
  metrics: () => [...advocacyKeys.all, 'metrics'] as const,
  validation: (contactId: string, principalId: string) => [
    ...advocacyKeys.all, 'validation', contactId, principalId
  ] as const,
}

// Utility function to compute advocacy score
export function computeAdvocacyScore(contact: Contact, advocacyStrength: number): number {
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
}

// Hook to fetch advocacy relationships with filters
export function useContactAdvocacyRelationships(filters?: AdvocacyFilters) {
  return useQuery({
    queryKey: advocacyKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('contact_preferred_principals')
        .select(`
          *,
          contact:contacts!contact_preferred_principals_contact_id_fkey(*),
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
          ? computeAdvocacyScore(relationship.contact, relationship.advocacy_strength || 5)
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

      return relationshipsWithScores as ContactAdvocacyRelationship[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch advocacy relationships by contact
export function useContactAdvocacyByContact(contactId: string) {
  return useQuery({
    queryKey: advocacyKeys.byContact(contactId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_preferred_principals')
        .select(`
          *,
          contact:contacts!contact_preferred_principals_contact_id_fkey(*),
          principal_organization:organizations(*)
        `)
        .eq('contact_id', contactId)
        .is('deleted_at', null)

      if (error) throw error

      const relationshipsWithScores = data.map(relationship => ({
        ...relationship,
        computed_advocacy_score: relationship.contact 
          ? computeAdvocacyScore(relationship.contact, relationship.advocacy_strength || 5)
          : relationship.advocacy_strength || 5
      }))

      return relationshipsWithScores as ContactAdvocacyRelationship[]
    },
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch advocacy relationships by principal
export function useContactAdvocacyByPrincipal(principalId: string) {
  return useQuery({
    queryKey: advocacyKeys.byPrincipal(principalId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_preferred_principals')
        .select(`
          *,
          contact:contacts!contact_preferred_principals_contact_id_fkey(*),
          principal_organization:organizations(*)
        `)
        .eq('principal_organization_id', principalId)
        .is('deleted_at', null)

      if (error) throw error

      const relationshipsWithScores = data.map(relationship => ({
        ...relationship,
        computed_advocacy_score: relationship.contact 
          ? computeAdvocacyScore(relationship.contact, relationship.advocacy_strength || 5)
          : relationship.advocacy_strength || 5
      }))

      return relationshipsWithScores as ContactAdvocacyRelationship[]
    },
    enabled: !!principalId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to validate advocacy assignment
export function useAdvocacyValidation(contactId: string, principalId: string) {
  return useQuery({
    queryKey: advocacyKeys.validation(contactId, principalId),
    queryFn: async () => {
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
    enabled: !!contactId && !!principalId,
    staleTime: 30 * 1000, // 30 seconds for validation
  })
}

// Hook to calculate advocacy metrics
export function useAdvocacyMetrics() {
  const { data: relationships } = useContactAdvocacyRelationships()
  
  return useQuery({
    queryKey: advocacyKeys.metrics(),
    queryFn: async (): Promise<AdvocacyMetrics> => {
      if (!relationships || relationships.length === 0) {
        return {
          total_relationships: 0,
          average_advocacy_strength: 0,
          high_advocacy_count: 0,
          medium_advocacy_count: 0,
          low_advocacy_count: 0,
          relationship_types: {},
          top_principals: [],
          top_advocates: []
        }
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

      return {
        total_relationships: totalRelationships,
        average_advocacy_strength: Math.round(averageAdvocacyStrength * 10) / 10,
        high_advocacy_count: highAdvocacyCount,
        medium_advocacy_count: mediumAdvocacyCount,
        low_advocacy_count: lowAdvocacyCount,
        relationship_types: relationshipTypes,
        top_principals: topPrincipals,
        top_advocates: topAdvocates
      }
    },
    enabled: !!relationships,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to create a new advocacy relationship
export function useCreateAdvocacyRelationship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ContactPreferredPrincipalInsert) => {
      // Get current user for audit fields
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Authentication required to create advocacy relationship')
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
          contact:contacts!contact_preferred_principals_contact_id_fkey(*),
          principal_organization:organizations(*)
        `)
        .single()

      if (error) throw error

      // Compute advocacy score
      const relationshipWithScore = {
        ...newRelationship,
        computed_advocacy_score: newRelationship.contact 
          ? computeAdvocacyScore(newRelationship.contact, newRelationship.advocacy_strength || 5)
          : newRelationship.advocacy_strength || 5
      }

      return relationshipWithScore as ContactAdvocacyRelationship
    },
    onSuccess: () => {
      // Invalidate all advocacy queries
      queryClient.invalidateQueries({ queryKey: advocacyKeys.all })
    },
  })
}

// Hook to update an advocacy relationship
export function useUpdateAdvocacyRelationship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ContactPreferredPrincipalUpdate }) => {
      const { data: updatedRelationship, error } = await supabase
        .from('contact_preferred_principals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          contact:contacts!contact_preferred_principals_contact_id_fkey(*),
          principal_organization:organizations(*)
        `)
        .single()

      if (error) throw error

      // Compute advocacy score
      const relationshipWithScore = {
        ...updatedRelationship,
        computed_advocacy_score: updatedRelationship.contact 
          ? computeAdvocacyScore(updatedRelationship.contact, updatedRelationship.advocacy_strength || 5)
          : updatedRelationship.advocacy_strength || 5
      }

      return relationshipWithScore as ContactAdvocacyRelationship
    },
    onSuccess: () => {
      // Invalidate all advocacy queries
      queryClient.invalidateQueries({ queryKey: advocacyKeys.all })
    },
  })
}

// Hook to delete an advocacy relationship
export function useDeleteAdvocacyRelationship() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_preferred_principals')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate all advocacy queries
      queryClient.invalidateQueries({ queryKey: advocacyKeys.all })
    },
  })
}

// Hook to bulk update advocacy strengths
export function useBulkUpdateAdvocacyStrength() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (relationships: Array<{ id: string; advocacy_strength: number }>) => {
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
    },
    onSuccess: () => {
      // Invalidate all advocacy queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: advocacyKeys.all })
    },
  })
}