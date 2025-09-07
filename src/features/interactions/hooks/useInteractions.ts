import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  InteractionInsert,
  InteractionUpdate,
  InteractionFilters,
  InteractionWithRelations,
  OpportunityInsert,
} from '@/types/entities'
import { opportunityKeys } from '@/features/opportunities/hooks/useOpportunities'

// Query key factory
export const interactionKeys = {
  all: ['interactions'] as const,
  lists: () => [...interactionKeys.all, 'list'] as const,
  list: (filters?: InteractionFilters) => [...interactionKeys.lists(), { filters }] as const,
  details: () => [...interactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...interactionKeys.details(), id] as const,
  byOrganization: (organizationId: string) =>
    [...interactionKeys.all, 'organization', organizationId] as const,
  byContact: (contactId: string) => [...interactionKeys.all, 'contact', contactId] as const,
  byOpportunity: (opportunityId: string) =>
    [...interactionKeys.all, 'opportunity', opportunityId] as const,
  recentActivity: () => [...interactionKeys.all, 'recent'] as const,
  followUps: () => [...interactionKeys.all, 'followUps'] as const,
  stats: () => [...interactionKeys.all, 'stats'] as const,
}

// Hook to fetch all interactions with optional filtering
export function useInteractions(filters?: InteractionFilters) {
  return useQuery({
    queryKey: interactionKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('interactions')
        .select(
          `
          id,
          type,
          interaction_date,
          subject,
          description,
          duration_minutes,
          follow_up_required,
          follow_up_date,
          follow_up_notes,
          outcome,
          opportunity_id,
          contact_id,
          organization_id,
          created_at,
          contact:contacts!interactions_contact_id_fkey(id, first_name, last_name, title, organization_id),
          organization:organizations(id, name, type),
          opportunity:opportunities!interactions_opportunity_id_fkey(id, name, stage, organization_id)
        `
        )
        .is('deleted_at', null)
        .order('interaction_date', { ascending: false })
        .limit(50)

      // Apply filters
      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          query = query.in('type', filters.type)
        } else {
          query = query.eq('type', filters.type)
        }
      }

      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id)
      }

      if (filters?.contact_id) {
        query = query.eq('contact_id', filters.contact_id)
      }

      if (filters?.opportunity_id) {
        query = query.eq('opportunity_id', filters.opportunity_id)
      }

      if (filters?.interaction_date_from) {
        query = query.gte('interaction_date', filters.interaction_date_from)
      }

      if (filters?.interaction_date_to) {
        query = query.lte('interaction_date', filters.interaction_date_to)
      }

      if (typeof filters?.follow_up_required === 'boolean') {
        query = query.eq('follow_up_required', filters.follow_up_required)
      }

      const { data, error } = await query

      if (error) throw error
      return data as InteractionWithRelations[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (interactions are more frequently accessed)
  })
}

// Hook to fetch a single interaction by ID with all relations
export function useInteraction(id: string) {
  return useQuery({
    queryKey: interactionKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as InteractionWithRelations
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch interactions for a specific organization
export function useInteractionsByOrganization(organizationId: string) {
  return useQuery({
    queryKey: interactionKeys.byOrganization(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('interaction_date', { ascending: false })

      if (error) throw error
      return data as InteractionWithRelations[]
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook to fetch interactions for a specific contact
export function useInteractionsByContact(contactId: string) {
  return useQuery({
    queryKey: interactionKeys.byContact(contactId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .eq('contact_id', contactId)
        .is('deleted_at', null)
        .order('interaction_date', { ascending: false })

      if (error) throw error
      return data as InteractionWithRelations[]
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook to fetch interactions for a specific opportunity
export function useInteractionsByOpportunity(opportunityId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: interactionKeys.byOpportunity(opportunityId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .eq('opportunity_id', opportunityId)
        .is('deleted_at', null)
        .order('interaction_date', { ascending: false })

      if (error) throw error
      return data as InteractionWithRelations[]
    },
    enabled: !!opportunityId && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000,
  })
}

// Hook to fetch recent activity (last 50 interactions)
export function useRecentActivity(limit: number = 50) {
  return useQuery({
    queryKey: [...interactionKeys.recentActivity(), limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .is('deleted_at', null)
        .order('interaction_date', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as InteractionWithRelations[]
    },
    staleTime: 1 * 60 * 1000, // 1 minute for recent activity
  })
}

// Hook to fetch interactions that need follow-up
export function useFollowUpInteractions() {
  return useQuery({
    queryKey: interactionKeys.followUps(),
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format

      const { data, error } = await supabase
        .from('interactions')
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .eq('follow_up_required', true)
        .lte('follow_up_date', today)
        .is('deleted_at', null)
        .order('follow_up_date')

      if (error) throw error
      return data as InteractionWithRelations[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to get interaction statistics
export function useInteractionStats() {
  return useQuery({
    queryKey: interactionKeys.stats(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('type, follow_up_required, follow_up_date, created_at')
        .is('deleted_at', null)

      if (error) throw error

      const stats = {
        total: data.length,
        followUpsNeeded: data.filter(
          (i) =>
            i.follow_up_required && i.follow_up_date && new Date(i.follow_up_date) <= new Date()
        ).length,
        recentActivity: data.filter(
          (i) =>
            i.created_at && new Date(i.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        byType: data.reduce(
          (acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
      }

      return stats
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook for creating opportunity from interaction
export function useCreateOpportunityFromInteraction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      interactionId,
      opportunityData,
    }: {
      interactionId: string
      opportunityData: OpportunityInsert
    }) => {
      // Get current user ID for RLS policy compliance
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Authentication required to create opportunity')
      }

      // Create opportunity with founding interaction reference
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...opportunityData,
          founding_interaction_id: interactionId,
          created_by: user.id,
          updated_by: user.id,
        })
        .select('*')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newOpportunity) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() })
      if (newOpportunity.founding_interaction_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.detail(newOpportunity.founding_interaction_id),
        })
      }
      // Invalidate stats as this might affect interaction statistics
      queryClient.invalidateQueries({ queryKey: interactionKeys.stats() })
    },
  })
}

// Hook to create a new interaction
export function useCreateInteraction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (interaction: InteractionInsert) => {
      // Get current user ID for RLS policy compliance
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Authentication required to create interaction')
      }

      // Ensure required audit fields are set for RLS policy
      const interactionData = {
        ...interaction,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data, error } = await supabase
        .from('interactions')
        .insert(interactionData)
        .select('*')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newInteraction) => {
      // Invalidate all interaction lists
      queryClient.invalidateQueries({ queryKey: interactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.recentActivity() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.followUps() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.stats() })

      // Invalidate related entity interactions
      if (newInteraction.organization_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byOrganization(newInteraction.organization_id),
        })
      }
      if (newInteraction.contact_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byContact(newInteraction.contact_id),
        })
      }
      if (newInteraction.opportunity_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byOpportunity(newInteraction.opportunity_id),
        })
      }

      // Add the new interaction to the cache
      queryClient.setQueryData(interactionKeys.detail(newInteraction.id), newInteraction)
    },
  })
}

// Hook to update an interaction
export function useUpdateInteraction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: InteractionUpdate }) => {
      const { data, error } = await supabase
        .from('interactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .single()

      if (error) throw error
      return data as InteractionWithRelations
    },
    onSuccess: (updatedInteraction) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: interactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.recentActivity() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.followUps() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.stats() })

      // Invalidate related entity interactions
      if (updatedInteraction.organization_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byOrganization(updatedInteraction.organization_id),
        })
      }
      if (updatedInteraction.contact_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byContact(updatedInteraction.contact_id),
        })
      }
      if (updatedInteraction.opportunity_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byOpportunity(updatedInteraction.opportunity_id),
        })
      }

      // Update the specific interaction in the cache
      queryClient.setQueryData(interactionKeys.detail(updatedInteraction.id), updatedInteraction)
    },
  })
}

// Hook to mark follow-up as completed
export function useCompleteFollowUp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('interactions')
        .update({
          follow_up_required: false,
          follow_up_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .single()

      if (error) throw error
      return data as InteractionWithRelations
    },
    onSuccess: (updatedInteraction) => {
      // Update follow-up related queries
      queryClient.invalidateQueries({ queryKey: interactionKeys.followUps() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.lists() })

      // Update the specific interaction in the cache
      queryClient.setQueryData(interactionKeys.detail(updatedInteraction.id), updatedInteraction)
    },
  })
}

// Hook to soft delete an interaction
export function useDeleteInteraction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('interactions')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          contact:contacts!interactions_contact_id_fkey(*),
          organization:organizations(*),
          opportunity:opportunities!interactions_opportunity_id_fkey(*)
        `
        )
        .single()

      if (error) throw error
      return data as InteractionWithRelations
    },
    onSuccess: (deletedInteraction) => {
      // Invalidate all interaction lists
      queryClient.invalidateQueries({ queryKey: interactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.recentActivity() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.followUps() })
      queryClient.invalidateQueries({ queryKey: interactionKeys.stats() })

      // Invalidate related entity interactions
      if (deletedInteraction.organization_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byOrganization(deletedInteraction.organization_id),
        })
      }
      if (deletedInteraction.contact_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byContact(deletedInteraction.contact_id),
        })
      }
      if (deletedInteraction.opportunity_id) {
        queryClient.invalidateQueries({
          queryKey: interactionKeys.byOpportunity(deletedInteraction.opportunity_id),
        })
      }

      // Remove from individual cache
      queryClient.removeQueries({ queryKey: interactionKeys.detail(deletedInteraction.id) })
    },
  })
}
