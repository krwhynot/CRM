import { useState, useCallback } from 'react'
import { useCreateOrganization } from './useOrganizations'
import { useCreateContact } from './useContacts'
import { useCreateProduct } from './useProducts'
import { useCreateOpportunity } from './useOpportunities'

export type EntityType = 'organization' | 'contact' | 'product' | 'opportunity'

export interface QuickCreateState {
  isOpen: boolean
  isLoading: boolean
  error: Error | null
}

export interface UseEntityQuickCreateReturn<T = any> {
  state: QuickCreateState
  openModal: () => void
  closeModal: () => void
  createEntity: (data: any) => Promise<T>
  resetError: () => void
}

export interface QuickCreateConfig {
  onSuccess?: (entity: any) => void
  onError?: (error: Error) => void
  preselectedData?: Record<string, any>
}

/**
 * Generic hook factory for entity quick creation
 */
function createEntityQuickCreateHook<T = any>(
  useCreateMutation: () => any
) {
  return function useEntityQuickCreate(
    config: QuickCreateConfig = {}
  ): UseEntityQuickCreateReturn<T> {
    const [state, setState] = useState<QuickCreateState>({
      isOpen: false,
      isLoading: false,
      error: null,
    })

    const createMutation = useCreateMutation()

    const openModal = useCallback(() => {
      setState(prev => ({
        ...prev,
        isOpen: true,
        error: null,
      }))
    }, [])

    const closeModal = useCallback(() => {
      setState(prev => ({
        ...prev,
        isOpen: false,
        error: null,
      }))
    }, [])

    const resetError = useCallback(() => {
      setState(prev => ({
        ...prev,
        error: null,
      }))
    }, [])

    const createEntity = useCallback(async (data: any): Promise<T> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        // Merge preselected data with form data
        const entityData = {
          ...config.preselectedData,
          ...data,
        }

        const result = await createMutation.mutateAsync(entityData)
        
        // Call success callback
        config.onSuccess?.(result)
        
        // Close modal on success
        setState(prev => ({
          ...prev,
          isLoading: false,
          isOpen: false,
        }))

        return result
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorInstance,
        }))

        // Call error callback
        config.onError?.(errorInstance)

        throw errorInstance
      }
    }, [createMutation, config])

    return {
      state,
      openModal,
      closeModal,
      createEntity,
      resetError,
    }
  }
}

/**
 * Specific entity quick create hooks
 */
export const useOrganizationQuickCreate = createEntityQuickCreateHook(
  useCreateOrganization
)

export const useContactQuickCreate = createEntityQuickCreateHook(
  useCreateContact
)

export const useProductQuickCreate = createEntityQuickCreateHook(
  useCreateProduct
)

export const useOpportunityQuickCreate = createEntityQuickCreateHook(
  useCreateOpportunity
)

/**
 * Combined hook that provides quick create functionality for all entity types
 */
export function useUnifiedQuickCreate() {
  const organizationQuickCreate = useOrganizationQuickCreate()
  const contactQuickCreate = useContactQuickCreate()
  const productQuickCreate = useProductQuickCreate()
  const opportunityQuickCreate = useOpportunityQuickCreate()

  return {
    organization: organizationQuickCreate,
    contact: contactQuickCreate,
    product: productQuickCreate,
    opportunity: opportunityQuickCreate,
  }
}

/**
 * Dynamic hook that returns the appropriate quick create hook based on entity type
 */
export function useEntityQuickCreateByType(entityType: EntityType, config?: QuickCreateConfig) {
  const organizationQuickCreate = useOrganizationQuickCreate(config)
  const contactQuickCreate = useContactQuickCreate(config)
  const productQuickCreate = useProductQuickCreate(config)
  const opportunityQuickCreate = useOpportunityQuickCreate(config)

  const hooks = {
    organization: organizationQuickCreate,
    contact: contactQuickCreate,
    product: productQuickCreate,
    opportunity: opportunityQuickCreate,
  }

  return hooks[entityType]
}

/**
 * Utility function to determine entity type from field name
 */
export function getEntityTypeFromFieldName(fieldName: string): EntityType | null {
  if (fieldName.includes('organization')) return 'organization'
  if (fieldName.includes('contact')) return 'contact'
  if (fieldName.includes('product')) return 'product'
  if (fieldName.includes('opportunity')) return 'opportunity'
  return null
}