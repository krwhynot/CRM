import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { 
  ContactInsert, 
  ContactUpdate, 
  ContactFilters,
  ContactWithOrganization 
} from '@/types/entities'

// Query key factory
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters?: ContactFilters) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  byOrganization: (organizationId: string) => [...contactKeys.all, 'organization', organizationId] as const,
}

// Hook to fetch all contacts with optional filtering
export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select(`
          *,
          organization:organizations(*)
        `)
        .is('deleted_at', null)

      // Apply filters
      if (filters?.organization_id) {
        query = query.eq('organization_id', filters.organization_id)
      }

      if (filters?.role) {
        if (Array.isArray(filters.role)) {
          query = query.in('role', filters.role)
        } else {
          query = query.eq('role', filters.role)
        }
      }

      if (typeof filters?.is_primary_contact === 'boolean') {
        query = query.eq('is_primary_contact', filters.is_primary_contact)
      }

      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      query = query.order('last_name').order('first_name')

      const { data, error } = await query

      if (error) throw error
      return data as ContactWithOrganization[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch a single contact by ID with organization details
export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as ContactWithOrganization
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch contacts for a specific organization
export function useContactsByOrganization(organizationId: string) {
  return useQuery({
    queryKey: contactKeys.byOrganization(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('is_primary_contact', { ascending: false })
        .order('last_name')
        .order('first_name')

      if (error) throw error
      return data as ContactWithOrganization[]
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch primary contacts for organizations
export function usePrimaryContacts() {
  return useQuery({
    queryKey: [...contactKeys.all, 'primary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('is_primary_contact', true)
        .is('deleted_at', null)
        .order('last_name')
        .order('first_name')

      if (error) throw error
      return data as ContactWithOrganization[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to create a new contact
export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contact: ContactInsert) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select(`
          *,
          organization:organizations(*)
        `)
        .single()

      if (error) throw error
      return data as ContactWithOrganization
    },
    onSuccess: (newContact) => {
      // Invalidate all contact lists
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.byOrganization(newContact.organization_id) })
      queryClient.invalidateQueries({ queryKey: [...contactKeys.all, 'primary'] })
      
      // Add the new contact to the cache
      queryClient.setQueryData(contactKeys.detail(newContact.id), newContact)
    },
  })
}

// Hook to update a contact
export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ContactUpdate }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          organization:organizations(*)
        `)
        .single()

      if (error) throw error
      return data as ContactWithOrganization
    },
    onSuccess: (updatedContact) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.byOrganization(updatedContact.organization_id) })
      queryClient.invalidateQueries({ queryKey: [...contactKeys.all, 'primary'] })
      
      // Update the specific contact in the cache
      queryClient.setQueryData(contactKeys.detail(updatedContact.id), updatedContact)
    },
  })
}

// Hook to soft delete a contact
export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          organization:organizations(*)
        `)
        .single()

      if (error) throw error
      return data as ContactWithOrganization
    },
    onSuccess: (deletedContact) => {
      // Invalidate all contact lists
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.byOrganization(deletedContact.organization_id) })
      queryClient.invalidateQueries({ queryKey: [...contactKeys.all, 'primary'] })
      
      // Remove from individual cache
      queryClient.removeQueries({ queryKey: contactKeys.detail(deletedContact.id) })
    },
  })
}

// Hook to restore a soft-deleted contact
export function useRestoreContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({ 
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          organization:organizations(*)
        `)
        .single()

      if (error) throw error
      return data as ContactWithOrganization
    },
    onSuccess: (restoredContact) => {
      // Invalidate all contact lists
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.byOrganization(restoredContact.organization_id) })
      queryClient.invalidateQueries({ queryKey: [...contactKeys.all, 'primary'] })
      
      // Add back to individual cache
      queryClient.setQueryData(contactKeys.detail(restoredContact.id), restoredContact)
    },
  })
}

// Hook to set a contact as the primary contact for their organization
export function useSetPrimaryContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contactId: string) => {
      // First, get the contact to know which organization it belongs to
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('organization_id')
        .eq('id', contactId)
        .single()

      if (contactError) throw contactError

      // Remove primary status from all contacts in the organization
      const { error: clearError } = await supabase
        .from('contacts')
        .update({ 
          is_primary_contact: false,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', contact.organization_id)

      if (clearError) throw clearError

      // Set the new primary contact
      const { data, error } = await supabase
        .from('contacts')
        .update({ 
          is_primary_contact: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .select(`
          *,
          organization:organizations(*)
        `)
        .single()

      if (error) throw error
      return data as ContactWithOrganization
    },
    onSuccess: (primaryContact) => {
      // Invalidate all contact lists for the organization
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.byOrganization(primaryContact.organization_id) })
      queryClient.invalidateQueries({ queryKey: [...contactKeys.all, 'primary'] })
    },
  })
}