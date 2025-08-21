import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { 
  Opportunity,
  OpportunityInsert, 
  OpportunityUpdate, 
  OpportunityFilters,
  OpportunityWithRelations 
} from '@/types/entities'
import type { Database } from '@/lib/database.types'

// Query key factory
export const opportunityKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunityKeys.all, 'list'] as const,
  list: (filters?: OpportunityFilters) => [...opportunityKeys.lists(), { filters }] as const,
  details: () => [...opportunityKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunityKeys.details(), id] as const,
  byOrganization: (organizationId: string) => [...opportunityKeys.all, 'organization', organizationId] as const,
  byContact: (contactId: string) => [...opportunityKeys.all, 'contact', contactId] as const,
  byStage: (stage: string) => [...opportunityKeys.all, 'stage', stage] as const,
  pipeline: () => [...opportunityKeys.all, 'pipeline'] as const,
}

// Hook to fetch all opportunities with optional filtering
export function useOpportunities(filters?: OpportunityFilters) {
  return useQuery({
    queryKey: opportunityKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*),
          principal_organization:organizations!opportunities_principal_organization_id_fkey(*),
          distributor_organization:organizations!opportunities_distributor_organization_id_fkey(*)
        `)
        .is('deleted_at', null)

      // Apply filters
      if (filters?.stage) {
        if (Array.isArray(filters.stage)) {
          query = query.in('stage', filters.stage)
        } else {
          query = query.eq('stage', filters.stage)
        }
      }

      if (filters?.priority) {
        if (Array.isArray(filters.priority)) {
          query = query.in('priority', filters.priority)
        } else {
          query = query.eq('priority', filters.priority)
        }
      }

      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id)
      }

      if (filters?.principal_organization_id) {
        query = query.eq('principal_organization_id', filters.principal_organization_id)
      }

      if (filters?.distributor_organization_id) {
        query = query.eq('distributor_organization_id', filters.distributor_organization_id)
      }

      if (filters?.contact_id) {
        query = query.eq('contact_id', filters.contact_id)
      }

      if (filters?.estimated_value_min) {
        query = query.gte('estimated_value', filters.estimated_value_min)
      }

      if (filters?.estimated_value_max) {
        query = query.lte('estimated_value', filters.estimated_value_max)
      }

      if (filters?.probability_min) {
        query = query.gte('probability', filters.probability_min)
      }

      if (filters?.probability_max) {
        query = query.lte('probability', filters.probability_max)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data as OpportunityWithRelations[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch a single opportunity by ID with all relations
export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*),
          principal_organization:organizations!opportunities_principal_organization_id_fkey(*),
          distributor_organization:organizations!opportunities_distributor_organization_id_fkey(*),
          opportunity_products(
            *,
            product:products(*)
          ),
          interactions(*)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      
      // Transform the data to match OpportunityWithRelations type
      const transformedData = {
        ...data,
        interactions: data.interactions ? [data.interactions].flat() : []
      }
      
      return transformedData as OpportunityWithRelations
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch opportunities for a specific organization
export function useOpportunitiesByOrganization(organizationId: string) {
  return useQuery({
    queryKey: opportunityKeys.byOrganization(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*),
          principal_organization:organizations!opportunities_principal_organization_id_fkey(*),
          distributor_organization:organizations!opportunities_distributor_organization_id_fkey(*)
        `)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as OpportunityWithRelations[]
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch opportunities for a specific contact
export function useOpportunitiesByContact(contactId: string) {
  return useQuery({
    queryKey: opportunityKeys.byContact(contactId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*),
          principal_organization:organizations!opportunities_principal_organization_id_fkey(*),
          distributor_organization:organizations!opportunities_distributor_organization_id_fkey(*)
        `)
        .eq('contact_id', contactId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as OpportunityWithRelations[]
    },
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch pipeline data (opportunities grouped by stage)
export function usePipelineData() {
  return useQuery({
    queryKey: opportunityKeys.pipeline(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          stage,
          estimated_value,
          probability,
          organization:organizations!opportunities_organization_id_fkey(name),
          contact:contacts!opportunities_contact_id_fkey(first_name, last_name)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by stage and calculate metrics
      const pipeline = data.reduce((acc, opp) => {
        const stage = opp.stage
        if (!acc[stage]) {
          acc[stage] = {
            stage,
            count: 0,
            totalValue: 0,
            weightedValue: 0,
            opportunities: []
          }
        }
        
        acc[stage].count += 1
        acc[stage].totalValue += opp.estimated_value || 0
        acc[stage].weightedValue += (opp.estimated_value || 0) * ((opp.probability || 0) / 100)
        acc[stage].opportunities.push(opp)
        
        return acc
      }, {} as Record<string, { stage: string; count: number; totalValue: number; weightedValue: number; opportunities: Opportunity[] }>)

      return Object.values(pipeline)
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch active opportunities (not closed)
export function useActiveOpportunities() {
  return useQuery({
    queryKey: [...opportunityKeys.all, 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*),
          principal_organization:organizations!opportunities_principal_organization_id_fkey(*),
          distributor_organization:organizations!opportunities_distributor_organization_id_fkey(*)
        `)
        .not('stage', 'in', '(Closed - Won,Closed - Lost)')
        .is('deleted_at', null)
        .order('estimated_close_date')

      if (error) throw error
      return data as OpportunityWithRelations[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to create a new opportunity
export function useCreateOpportunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (opportunity: OpportunityInsert) => {
      // Get current user ID for RLS policy compliance
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Authentication required to create opportunity')
      }

      // Business rule validation: Ensure at least organization_id is provided
      if (!opportunity.organization_id) {
        throw new Error('Organization is required for all opportunities')
      }

      // Business rule validation: Warn about advanced stages without contacts
      if (opportunity.stage && ['proposal', 'negotiation'].includes(opportunity.stage) && !opportunity.contact_id) {
        console.warn(`Creating opportunity "${opportunity.name}" in stage "${opportunity.stage}" without a contact. Consider assigning a contact for better tracking.`)
      }

      // Ensure required audit fields are set for RLS policy and clean up empty strings
      const opportunityData = {
        ...opportunity,
        contact_id: opportunity.contact_id || null,
        principal_organization_id: opportunity.principal_organization_id || null,
        distributor_organization_id: opportunity.distributor_organization_id || null,
        estimated_close_date: opportunity.estimated_close_date || null,
        actual_close_date: opportunity.actual_close_date || null,
        description: opportunity.description || null,
        competition: opportunity.competition || null,
        decision_criteria: opportunity.decision_criteria || null,
        next_action: opportunity.next_action || null,
        next_action_date: opportunity.next_action_date || null,
        notes: opportunity.notes || null,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data, error } = await supabase
        .from('opportunities')
        .insert(opportunityData)
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*),
          principal_organization:organizations!opportunities_principal_organization_id_fkey(*),
          distributor_organization:organizations!opportunities_distributor_organization_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data as OpportunityWithRelations
    },
    onSuccess: (newOpportunity) => {
      // Invalidate all opportunity lists
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: opportunityKeys.byOrganization(newOpportunity.organization_id) })
      
      // Only invalidate contact-specific queries if contact_id exists
      if (newOpportunity.contact_id) {
        queryClient.invalidateQueries({ queryKey: opportunityKeys.byContact(newOpportunity.contact_id) })
      }
      
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() })
      queryClient.invalidateQueries({ queryKey: [...opportunityKeys.all, 'active'] })
      
      // Add the new opportunity to the cache
      queryClient.setQueryData(opportunityKeys.detail(newOpportunity.id), newOpportunity)
    },
  })
}

// Hook to update an opportunity
export function useUpdateOpportunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: OpportunityUpdate }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ 
          ...updates, 
          contact_id: updates.contact_id || null,
          principal_organization_id: updates.principal_organization_id || null,
          distributor_organization_id: updates.distributor_organization_id || null,
          estimated_close_date: updates.estimated_close_date || null,
          actual_close_date: updates.actual_close_date || null,
          description: updates.description || null,
          competition: updates.competition || null,
          decision_criteria: updates.decision_criteria || null,
          next_action: updates.next_action || null,
          next_action_date: updates.next_action_date || null,
          notes: updates.notes || null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*),
          principal_organization:organizations!opportunities_principal_organization_id_fkey(*),
          distributor_organization:organizations!opportunities_distributor_organization_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data as OpportunityWithRelations
    },
    onSuccess: (updatedOpportunity) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: opportunityKeys.byOrganization(updatedOpportunity.organization_id) })
      
      // Only invalidate contact-specific queries if contact_id exists
      if (updatedOpportunity.contact_id) {
        queryClient.invalidateQueries({ queryKey: opportunityKeys.byContact(updatedOpportunity.contact_id) })
      }
      
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() })
      queryClient.invalidateQueries({ queryKey: [...opportunityKeys.all, 'active'] })
      
      // Update the specific opportunity in the cache
      queryClient.setQueryData(opportunityKeys.detail(updatedOpportunity.id), updatedOpportunity)
    },
  })
}

// Hook to advance opportunity to next stage
export function useAdvanceOpportunityStage() {
  const queryClient = useQueryClient()

  const stageProgression = {
    'New Lead': 'Initial Outreach',
    'Initial Outreach': 'Sample/Visit Offered',
    'Sample/Visit Offered': 'Awaiting Response',
    'Awaiting Response': 'Feedback Logged',
    'Feedback Logged': 'Demo Scheduled',
    'Demo Scheduled': 'Closed - Won',
  } as const

  return useMutation({
    mutationFn: async (id: string) => {
      // First get current stage
      const { data: currentOpp, error: fetchError } = await supabase
        .from('opportunities')
        .select('stage')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const nextStage = stageProgression[currentOpp.stage as keyof typeof stageProgression]
      if (!nextStage) {
        throw new Error('Cannot advance opportunity from current stage')
      }

      const { data, error } = await supabase
        .from('opportunities')
        .update({ 
          stage: nextStage as Database['public']['Enums']['opportunity_stage'],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*),
          principal_organization:organizations!opportunities_principal_organization_id_fkey(*),
          distributor_organization:organizations!opportunities_distributor_organization_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data as OpportunityWithRelations
    },
    onSuccess: (updatedOpportunity) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: opportunityKeys.byOrganization(updatedOpportunity.organization_id) })
      
      // Only invalidate contact-specific queries if contact_id exists
      if (updatedOpportunity.contact_id) {
        queryClient.invalidateQueries({ queryKey: opportunityKeys.byContact(updatedOpportunity.contact_id) })
      }
      
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() })
      queryClient.invalidateQueries({ queryKey: [...opportunityKeys.all, 'active'] })
      
      // Update the specific opportunity in the cache
      queryClient.setQueryData(opportunityKeys.detail(updatedOpportunity.id), updatedOpportunity)
    },
  })
}

// Hook to soft delete an opportunity
export function useDeleteOpportunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          organization:organizations!opportunities_organization_id_fkey(*),
          contact:contacts!opportunities_contact_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data as OpportunityWithRelations
    },
    onSuccess: (deletedOpportunity) => {
      // Invalidate all opportunity lists
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() })
      queryClient.invalidateQueries({ queryKey: opportunityKeys.byOrganization(deletedOpportunity.organization_id) })
      
      // Only invalidate contact-specific queries if contact_id exists
      if (deletedOpportunity.contact_id) {
        queryClient.invalidateQueries({ queryKey: opportunityKeys.byContact(deletedOpportunity.contact_id) })
      }
      
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() })
      queryClient.invalidateQueries({ queryKey: [...opportunityKeys.all, 'active'] })
      
      // Remove from individual cache
      queryClient.removeQueries({ queryKey: opportunityKeys.detail(deletedOpportunity.id) })
    },
  })
}