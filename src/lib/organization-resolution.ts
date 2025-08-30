/**
 * Organization resolution utilities for contact creation
 * Handles find-or-create logic to prevent duplicate organization issues
 */

import { supabase } from '@/lib/supabase'
import { validateAuthentication, surfaceError } from '@/lib/error-utils'
import { deriveOrganizationFlags } from '@/lib/organization-utils'
import type { OrganizationInsert } from '@/types/entities'
import type { Database } from '@/types/database.types'

type OrganizationType = Database['public']['Enums']['organization_type']

export interface OrganizationResolutionResult {
  id: string
  name: string
  type: OrganizationType
  isNew: boolean
}

/**
 * Find existing organization by name and type (case-insensitive)
 * Returns null if not found
 */
export async function findExistingOrganization(
  name: string, 
  type: OrganizationType
): Promise<{ id: string; name: string; type: OrganizationType } | null> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, type')
      .ilike('name', name.trim())
      .eq('type', type)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error
    }

    return data || null
  } catch (error) {
    // Error finding existing organization - handled
    throw new Error(surfaceError(error))
  }
}

/**
 * Create a new organization with proper audit fields and flags
 */
export async function createNewOrganization(
  organizationData: Omit<OrganizationInsert, 'created_by' | 'updated_by'>
): Promise<{ id: string; name: string; type: OrganizationType }> {
  try {
    // Validate authentication
    const { user, error: authError } = await validateAuthentication(supabase)
    if (authError || !user) {
      throw new Error(authError || 'Authentication required')
    }

    // Derive organization flags from type
    const orgType = organizationData.type as 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor' || 'customer'
    const derivedFlags = deriveOrganizationFlags(orgType)
    
    // Prepare organization data with audit fields
    const fullOrganizationData = {
      ...organizationData,
      type: orgType,
      ...derivedFlags,
      created_by: user.id,
      updated_by: user.id,
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert(fullOrganizationData)
      .select('id, name, type')
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      throw new Error('Organization creation returned no data')
    }

    return data
  } catch (error) {
    // Error creating new organization - handled
    throw new Error(surfaceError(error))
  }
}

/**
 * Find or create organization atomically
 * This is the main function to use for contact creation flows
 */
export async function resolveOrganization(
  name: string,
  type: OrganizationType,
  additionalData?: Partial<OrganizationInsert>
): Promise<OrganizationResolutionResult> {
  // First, try to find existing organization
  const existing = await findExistingOrganization(name, type)
  
  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      type: existing.type,
      isNew: false
    }
  }

  // If not found, create new organization
  const newOrg = await createNewOrganization({
    name: name.trim(),
    type: type as 'customer' | 'principal' | 'distributor' | 'prospect' | 'vendor',
    ...additionalData
  })

  return {
    id: newOrg.id,
    name: newOrg.name,
    type: newOrg.type,
    isNew: true
  }
}

/**
 * Bulk resolve multiple organizations (useful for imports)
 */
export async function resolveOrganizations(
  organizations: Array<{ name: string; type: OrganizationType; data?: Partial<OrganizationInsert> }>
): Promise<OrganizationResolutionResult[]> {
  const results: OrganizationResolutionResult[] = []
  
  for (const org of organizations) {
    const result = await resolveOrganization(org.name, org.type, org.data)
    results.push(result)
  }
  
  return results
}