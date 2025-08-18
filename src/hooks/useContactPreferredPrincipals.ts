import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { 
  ContactPreferredPrincipal,
  ContactPreferredPrincipalInsert,
  ContactPreferredPrincipalUpdate 
} from '@/types/entities'

// Query key factory
export const contactPreferredPrincipalsKeys = {
  all: ['contact_preferred_principals'] as const,
  lists: () => [...contactPreferredPrincipalsKeys.all, 'list'] as const,
  list: (contactId?: string) => [...contactPreferredPrincipalsKeys.lists(), { contactId }] as const,
  details: () => [...contactPreferredPrincipalsKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactPreferredPrincipalsKeys.details(), id] as const,
}

// Hook to fetch preferred principals for a specific contact
export function useContactPreferredPrincipals(contactId: string) {
  return useQuery({
    queryKey: contactPreferredPrincipalsKeys.list(contactId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_preferred_principals')
        .select(`
          id,
          contact_id,
          principal_organization_id,
          relationship_type,
          advocacy_strength,
          advocacy_notes,
          created_at,
          updated_at,
          principal_organization:organizations!principal_organization_id(
            id,
            name,
            type,
            city,
            state_province,
            phone,
            email,
            website
          )
        `)
        .eq('contact_id', contactId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (ContactPreferredPrincipal & {
        principal_organization?: any
      })[]
    },
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to add a preferred principal to a contact
export function useAddContactPreferredPrincipal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ContactPreferredPrincipalInsert) => {
      // Get current user ID for RLS policy compliance
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Authentication required to add preferred principal')
      }

      // Ensure required audit fields are set for RLS policy
      const relationshipData = {
        ...data,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data: result, error } = await supabase
        .from('contact_preferred_principals')
        .insert(relationshipData)
        .select()
        .single()

      if (error) throw error
      return result as ContactPreferredPrincipal
    },
    onSuccess: (newRelationship) => {
      // Invalidate contact preferred principals queries
      queryClient.invalidateQueries({ 
        queryKey: contactPreferredPrincipalsKeys.list(newRelationship.contact_id) 
      })
    },
  })
}

// Hook to remove a preferred principal from a contact
export function useRemoveContactPreferredPrincipal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ contactId, principalOrganizationId }: { 
      contactId: string
      principalOrganizationId: string 
    }) => {
      const { data, error } = await supabase
        .from('contact_preferred_principals')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('contact_id', contactId)
        .eq('principal_organization_id', principalOrganizationId)
        .select()
        .single()

      if (error) throw error
      return data as ContactPreferredPrincipal
    },
    onSuccess: (deletedRelationship) => {
      // Invalidate contact preferred principals queries
      queryClient.invalidateQueries({ 
        queryKey: contactPreferredPrincipalsKeys.list(deletedRelationship.contact_id) 
      })
    },
  })
}

// Hook to bulk update preferred principals for a contact
export function useBulkUpdateContactPreferredPrincipals() {
  const queryClient = useQueryClient()
  const addMutation = useAddContactPreferredPrincipal()
  const removeMutation = useRemoveContactPreferredPrincipal()

  return useMutation({
    mutationFn: async ({ 
      contactId, 
      principalOrganizationIds 
    }: { 
      contactId: string
      principalOrganizationIds: string[] 
    }) => {
      // Get current preferred principals
      const { data: currentRelationships, error: fetchError } = await supabase
        .from('contact_preferred_principals')
        .select('principal_organization_id')
        .eq('contact_id', contactId)
        .is('deleted_at', null)

      if (fetchError) throw fetchError

      const currentPrincipalIds = currentRelationships?.map(r => r.principal_organization_id) || []

      // Determine which principals to add and remove
      const principalsToAdd = principalOrganizationIds.filter(id => !currentPrincipalIds.includes(id))
      const principalsToRemove = currentPrincipalIds.filter(id => !principalOrganizationIds.includes(id))

      // Remove principals that are no longer selected
      for (const principalId of principalsToRemove) {
        await removeMutation.mutateAsync({ contactId, principalOrganizationId: principalId })
      }

      // Add new principals
      for (const principalId of principalsToAdd) {
        await addMutation.mutateAsync({
          contact_id: contactId,
          principal_organization_id: principalId,
          relationship_type: 'advocate' // Default relationship type
        })
      }

      return { added: principalsToAdd.length, removed: principalsToRemove.length }
    },
    onSuccess: (result, variables) => {
      // Invalidate contact preferred principals queries
      queryClient.invalidateQueries({ 
        queryKey: contactPreferredPrincipalsKeys.list(variables.contactId) 
      })
    },
  })
}

// Hook to update advocacy details for a preferred principal relationship
export function useUpdateContactPreferredPrincipal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: ContactPreferredPrincipalUpdate 
    }) => {
      const { data, error } = await supabase
        .from('contact_preferred_principals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ContactPreferredPrincipal
    },
    onSuccess: (updatedRelationship) => {
      // Invalidate contact preferred principals queries
      queryClient.invalidateQueries({ 
        queryKey: contactPreferredPrincipalsKeys.list(updatedRelationship.contact_id) 
      })
      
      // Update the specific relationship in the cache
      queryClient.setQueryData(
        contactPreferredPrincipalsKeys.detail(updatedRelationship.id),
        updatedRelationship
      )
    },
  })
}

// Utility function to extract principal IDs from contact preferred principals
export function extractPrincipalIds(relationships: ContactPreferredPrincipal[] | undefined): string[] {
  return relationships?.map(r => r.principal_organization_id) || []
}

// Utility function to check if a contact advocates for a specific principal
export function isContactAdvocateForPrincipal(
  relationships: ContactPreferredPrincipal[] | undefined,
  principalId: string
): boolean {
  return relationships?.some(r => r.principal_organization_id === principalId) || false
}