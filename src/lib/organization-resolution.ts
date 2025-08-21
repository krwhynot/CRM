/**
 * Organization resolution utilities for contact creation
 * Handles find-or-create logic to prevent duplicate organization issues
 */

import { supabase } from '@/lib/supabase'
import { validateAuthentication, surfaceError } from '@/lib/error-utils'
import { deriveOrganizationFlags } from '@/lib/organization-utils'
import type { OrganizationInsert } from '@/types/entities'

export interface OrganizationResolutionResult {
  id: string
  name: string
  type: string
  isNew: boolean
}

/**
 * Find existing organization by name and type (case-insensitive)
 * Returns null if not found
 */
export async function findExistingOrganization(
  name: string, 
  type: string
): Promise<{ id: string; name: string; type: string } | null> {
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
    console.error('Error finding existing organization:', error)
    throw new Error(surfaceError(error))
  }
}

/**
 * Create a new organization with proper audit fields and flags
 */
export async function createNewOrganization(
  organizationData: Omit<OrganizationInsert, 'created_by' | 'updated_by'>
): Promise<{ id: string; name: string; type: string }> {
  try {
    // Validate authentication
    const { user, error: authError } = await validateAuthentication(supabase)
    if (authError || !user) {
      throw new Error(authError || 'Authentication required')
    }

    // Derive organization flags from type
    const derivedFlags = deriveOrganizationFlags(organizationData.type || 'customer')
    
    // Prepare organization data with audit fields
    const fullOrganizationData = {
      ...organizationData,
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
    console.error('Error creating new organization:', error)
    throw new Error(surfaceError(error))
  }
}

/**
 * Find or create organization atomically
 * This is the main function to use for contact creation flows
 */
export async function resolveOrganization(
  name: string,
  type: string,
  additionalData?: Partial<OrganizationInsert>
): Promise<OrganizationResolutionResult> {
  try {
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
      type,
      ...additionalData
    })

    return {
      id: newOrg.id,
      name: newOrg.name,
      type: newOrg.type,
      isNew: true
    }
  } catch (error) {
    console.error('Error resolving organization:', error)
    throw error // Re-throw the error with enhanced message from create/find functions
  }
}

/**
 * Bulk resolve multiple organizations (useful for imports)
 */
export async function resolveOrganizations(
  organizations: Array<{ name: string; type: string; data?: Partial<OrganizationInsert> }>
): Promise<OrganizationResolutionResult[]> {
  const results: OrganizationResolutionResult[] = []
  
  for (const org of organizations) {
    try {
      const result = await resolveOrganization(org.name, org.type, org.data)
      results.push(result)
    } catch (error) {
      console.error(`Failed to resolve organization ${org.name}:`, error)
      throw error
    }
  }
  
  return results
}