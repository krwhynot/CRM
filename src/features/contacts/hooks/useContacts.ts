import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { isFeatureEnabled } from '@/lib/feature-flags'
import type { Database } from '@/lib/database.types'
import { resolveOrganization } from '@/lib/organization-resolution'
import { validateAuthentication, surfaceError } from '@/lib/error-utils'
import type { 
  Contact,
  ContactInsert, 
  ContactUpdate, 
  ContactFilters,
  ContactWithOrganization,
  OrganizationInsert,
  OrganizationType 
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
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
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
      // Get current user ID for RLS policy compliance
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Authentication required to create contact')
      }

      // Ensure required audit fields are set for RLS policy
      const contactData = {
        ...contact,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactData)
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

// Enhanced contact creation interface for form data with organization details
// Excludes virtual fields that are not part of the actual contacts table schema
export interface ContactWithOrganizationData extends Omit<ContactInsert, 'organization_id' | 'created_by' | 'updated_by'> {
  // Organization can be provided as ID (existing) or details (new/existing)
  organization_id?: string
  organization_name?: string
  organization_type?: Database['public']['Enums']['organization_type']
  organization_data?: Partial<OrganizationInsert>
  // Virtual field for form handling (not stored in contacts table)
  preferred_principals?: string[]
}

// Type for actual database contact data (excludes virtual fields)
export type ContactDatabaseData = Omit<ContactInsert, 'created_by' | 'updated_by'>

// Hook to create a contact with bulletproof organization resolution
export function useCreateContactWithOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contactData: ContactWithOrganizationData) => {
      try {
        // Validate authentication upfront
        const { user, error: authError } = await validateAuthentication(supabase)
        if (authError || !user) {
          throw new Error(authError || 'Authentication required to create contact')
        }

        let organizationId: string

        // Case 1: Organization ID provided directly (existing organization)
        if (contactData.organization_id) {
          organizationId = contactData.organization_id
        }
        // Case 2: Organization name and type provided (find or create)
        else if (contactData.organization_name && contactData.organization_type) {
          const orgResult = await resolveOrganization(
            contactData.organization_name,
            contactData.organization_type as OrganizationType,
            contactData.organization_data
          )
          organizationId = orgResult.id
        }
        // Case 3: Neither provided - error
        else {
          throw new Error('Either organization_id or organization_name+type must be provided')
        }

        // Prepare contact data with resolved organization_id and audit fields
        // Extract virtual fields and organization fields from contact data
        const { 
          organization_name: _organization_name, 
          organization_type: _organization_type, 
          organization_data: _organization_data, 
          preferred_principals, // Remove virtual field
          ...cleanContactData 
        } = contactData
        
        const finalContactData: ContactInsert = {
          ...cleanContactData,
          organization_id: organizationId,
          created_by: user.id,
          updated_by: user.id,
        }

        // Create the contact
        const { data, error } = await supabase
          .from('contacts')
          .insert(finalContactData)
          .select(`
            *,
            organization:organizations(*)
          `)
          .single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error('Contact creation returned no data')
        }

        // Handle preferred principals if provided (virtual field processing)
        if (preferred_principals && preferred_principals.length > 0) {
          try {
            // Create preferred principal relationships
            const relationshipPromises = preferred_principals.map(async (principalId) => {
              return supabase
                .from('contact_preferred_principals')
                .insert({
                  contact_id: data.id,
                  principal_organization_id: principalId,
                  created_by: user.id,
                  updated_by: user.id
                })
            })
            
            await Promise.all(relationshipPromises)
          } catch (preferredPrincipalsError) {
            // Log error but don't fail the contact creation
            console.warn('Failed to create preferred principal relationships:', preferredPrincipalsError)
          }
        }

        return data as ContactWithOrganization
      } catch (error) {
        console.error('Enhanced contact creation failed:', error)
        throw new Error(surfaceError(error))
      }
    },
    onSuccess: (newContact) => {
      // Invalidate all contact lists
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.byOrganization(newContact.organization_id) })
      queryClient.invalidateQueries({ queryKey: [...contactKeys.all, 'primary'] })
      
      // Invalidate organization lists since we may have created a new organization
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      
      // Add the new contact to the cache
      queryClient.setQueryData(contactKeys.detail(newContact.id), newContact)
    },
  })
}

// Hook to create contact with organization using atomic RPC function
export function useCreateContactWithOrganizationRPC() {
  const queryClient = useQueryClient()

  return useMutation<ContactWithOrganization, Error, ContactWithOrganizationData>({
    mutationFn: async (_contactData: ContactWithOrganizationData) => {
      // Validate authentication upfront
      const { user, error: authError } = await validateAuthentication(supabase)
      if (authError || !user) {
        throw new Error(authError || 'Authentication required to create contact')
      }

      if (!isFeatureEnabled('rpcContactCreation')) {
        throw new Error('Contact creation is temporarily disabled while we improve the feature. Please use the Excel import functionality to add contacts.')
      }
      
      // RPC contact creation will be implemented here
      // Will include proper validation and organization linking
      throw new Error('RPC contact creation feature is being finalized')
    },
    onSuccess: (newContact) => {
      // Invalidate all contact lists
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.byOrganization(newContact.organization_id) })
      queryClient.invalidateQueries({ queryKey: [...contactKeys.all, 'primary'] })
      
      // Invalidate organization lists since we may have created a new organization
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      
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

// Hook to refresh contacts data
export const useRefreshContacts = () => {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: contactKeys.all })
  }
}

// Hook to prepare form data for editing
export const useContactFormData = (contact: Contact | null) => {
  if (!contact) {
    return { initialData: {} }
  }

  const initialData = {
    // Basic fields
    first_name: contact.first_name || '',
    last_name: contact.last_name || '', 
    title: contact.title || '',
    email: contact.email || '',
    phone: contact.phone || '',
    mobile_phone: contact.mobile_phone || '',
    
    // Organization fields
    organization_id: contact.organization_id || '',
    
    // Additional fields
    notes: contact.notes || '',
    is_primary_contact: contact.is_primary_contact || false,
    linkedin_profile: contact.linkedin_profile || '',
    department: contact.department || '',
    
    // Address fields if they exist
    address_line_1: (contact as any).address_line_1 || '',
    address_line_2: (contact as any).address_line_2 || '',
    city: (contact as any).city || '',
    state_province: (contact as any).state_province || '',
    postal_code: (contact as any).postal_code || '',
    country: (contact as any).country || ''
  }

  return { initialData }
}