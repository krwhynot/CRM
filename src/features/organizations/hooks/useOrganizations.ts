import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Organization, OrganizationFilters } from '@/types/entities'
import type { OrganizationFormInterface } from '@/types/forms/form-interfaces'
import { deriveOrganizationFlags } from '@/lib/organization-utils'
import { debugQueryState, measureQueryPerformance } from '@/lib/query-debug'

// Query key factory - standardized for consistent caching
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters?: OrganizationFilters) => {
    // Normalize filters to ensure consistent cache keys
    const normalizedFilters = filters
      ? {
          ...filters,
          // Sort array filters for consistency
          type: Array.isArray(filters.type) ? [...filters.type].sort() : filters.type,
        }
      : undefined
    return [...organizationKeys.lists(), { filters: normalizedFilters }] as const
  },
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  principals: () => [...organizationKeys.all, 'principals'] as const,
  distributors: () => [...organizationKeys.all, 'distributors'] as const,
}

// Hook to fetch all organizations with optional filtering
export function useOrganizations(filters?: OrganizationFilters) {
  const queryResult = useQuery({
    queryKey: organizationKeys.list(filters),
    queryFn: async () => {
      const timer = measureQueryPerformance('useOrganizations query')

      let query = supabase
        .from('organizations')
        .select(
          `
          id,
          name,
          type,
          segment,
          priority,
          phone,
          email,
          website,
          address_line_1,
          city,
          state_province,
          country,
          is_active,
          is_principal,
          is_distributor,
          notes,
          created_at,
          updated_at
        `
        )
        .is('deleted_at', null)
        .order('name')
        .limit(100)

      // Apply filters
      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          query = query.in('type', filters.type)
        } else {
          query = query.eq('type', filters.type)
        }
      }

      if (filters?.segment) {
        query = query.ilike('segment', `%${filters.segment}%`)
      }

      if (typeof filters?.is_active === 'boolean') {
        query = query.eq('is_active', filters.is_active)
      }

      if (typeof filters?.is_principal === 'boolean') {
        query = query.eq('is_principal', filters.is_principal)
      }

      if (typeof filters?.is_distributor === 'boolean') {
        query = query.eq('is_distributor', filters.is_distributor)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      timer.end()
      return data as Organization[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Debug: Monitor query state changes
  React.useEffect(() => {
    debugQueryState(
      [...organizationKeys.list(filters)],
      'useOrganizations',
      queryResult.data,
      queryResult as any
    )
  }, [queryResult.data, queryResult.isLoading, queryResult.isError, filters, queryResult])

  return queryResult
}

// Utility hook to force refresh organizations cache
export function useRefreshOrganizations() {
  const queryClient = useQueryClient()

  return React.useCallback(() => {
    // Invalidate all organization-related queries
    queryClient.invalidateQueries({ queryKey: organizationKeys.all })
    queryClient.invalidateQueries({ queryKey: organizationKeys.principals() })
    queryClient.invalidateQueries({ queryKey: organizationKeys.distributors() })

    // Also refetch to ensure immediate update
    queryClient.refetchQueries({ queryKey: organizationKeys.all })
  }, [queryClient])
}

// Hook to fetch a single organization by ID
export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select(
          `
          id,
          name,
          type,
          segment,
          priority,
          phone,
          email,
          website,
          address_line_1,
          address_line_2,
          city,
          state_province,
          country,
          postal_code,
          is_active,
          is_principal,
          is_distributor,
          notes,
          created_at,
          updated_at
        `
        )
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as Organization
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch principal organizations
export function usePrincipals() {
  return useQuery({
    queryKey: organizationKeys.principals(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, type, phone, email, website, city, state_province')
        .eq('type', 'principal')
        .is('deleted_at', null)
        .order('name')
        .limit(50)

      if (error) throw error
      return data as Organization[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch distributor organizations
export function useDistributors() {
  return useQuery({
    queryKey: organizationKeys.distributors(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, type, phone, email, website, city, state_province')
        .eq('type', 'distributor')
        .is('deleted_at', null)
        .order('name')
        .limit(50)

      if (error) throw error
      return data as Organization[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to create a new organization
export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (organization: OrganizationFormInterface) => {
      // Get current user ID for RLS policy compliance
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Authentication required to create organization')
      }

      // Ensure required audit fields are set for RLS policy
      // Also ensure boolean flags are derived from type
      const derivedFlags = deriveOrganizationFlags(organization.type || 'customer')
      const organizationData = {
        ...organization,
        ...derivedFlags,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert(organizationData)
        .select()
        .single()

      if (error) throw error
      return data as Organization
    },
    onSuccess: (newOrganization) => {
      // Invalidate all organization lists
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.principals() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.distributors() })

      // Add the new organization to the cache
      queryClient.setQueryData(organizationKeys.detail(newOrganization.id), newOrganization)
    },
  })
}

// Hook to update an organization
export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: OrganizationFormInterface }) => {
      // Ensure boolean flags are derived from type if type is being updated
      const derivedFlags = updates.type ? deriveOrganizationFlags(updates.type) : {}
      const updateData = {
        ...updates,
        ...derivedFlags,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Organization
    },
    onSuccess: (updatedOrganization) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.principals() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.distributors() })

      // Update the specific organization in the cache
      queryClient.setQueryData(organizationKeys.detail(updatedOrganization.id), updatedOrganization)
    },
  })
}

// Hook to soft delete an organization
export function useDeleteOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Organization
    },
    onSuccess: (deletedOrganization) => {
      // Invalidate all organization lists
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.principals() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.distributors() })

      // Remove from individual cache
      queryClient.removeQueries({ queryKey: organizationKeys.detail(deletedOrganization.id) })
    },
  })
}

// Hook to restore a soft-deleted organization
export function useRestoreOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          deleted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Organization
    },
    onSuccess: (restoredOrganization) => {
      // Invalidate all organization lists
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.principals() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.distributors() })

      // Add back to individual cache
      queryClient.setQueryData(
        organizationKeys.detail(restoredOrganization.id),
        restoredOrganization
      )
    },
  })
}
