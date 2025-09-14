import { useState, useMemo } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import type { Organization } from '@/types/entities'
import { OrganizationRepository } from '@/domain/organizations/OrganizationRepository'
import { OrganizationService } from '@/domain/organizations/OrganizationService'
import type { OrganizationDomain } from '@/domain/organizations/OrganizationTypes'

interface UseOrganizationActionsProps {
  onEditOpen?: (organization: Organization) => void
  onDeleteOpen?: (organization: Organization) => void
  onEditSuccess?: () => void
  onDeleteSuccess?: () => void
  onError?: (error: string) => void
}

export function useOrganizationActions(props: UseOrganizationActionsProps = {}) {
  const {
    onEditOpen,
    onDeleteOpen,
    onEditSuccess,
    onDeleteSuccess,
    onError,
  } = props

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()

  // Create service instances
  const organizationService = useMemo(() => {
    const repository = new OrganizationRepository()
    return new OrganizationService(repository)
  }, [])

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: Partial<OrganizationDomain>
    }) => {
      const result = await organizationService.update(organizationId, data)
      if (result.isFailure) {
        throw new Error(result.error)
      }
      return result.value
    },
    onSuccess: () => {
      // Invalidate and refetch organizations data
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organization-list'] })
      onEditSuccess?.()
    },
    onError: (error: Error) => {
      onError?.(error.message)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await organizationService.softDelete(organizationId)
      if (result.isFailure) {
        throw new Error(result.error)
      }
      return result.value
    },
    onSuccess: () => {
      // Invalidate and refetch organizations data
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organization-list'] })
      onDeleteSuccess?.()
    },
    onError: (error: Error) => {
      onError?.(error.message)
    },
  })

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleEditOrganization = (organization: Organization) => {
    // Open edit dialog/modal if callback provided, otherwise handle inline
    if (onEditOpen) {
      onEditOpen(organization)
    } else {
      // Inline editing would require additional UI implementation
      // For now, recommend using the onEditOpen callback pattern
    }
  }

  const handleDeleteOrganization = (organization: Organization) => {
    // Open delete confirmation dialog/modal if callback provided
    if (onDeleteOpen) {
      onDeleteOpen(organization)
    } else {
      // Direct delete (not recommended without confirmation)
      deleteMutation.mutate(organization.id)
    }
  }

  // Method to handle edit form submission
  const handleEditSubmit = async (
    organizationId: string,
    data: Partial<OrganizationDomain>
  ) => {
    await editMutation.mutateAsync({ organizationId, data })
  }

  // Method to handle delete confirmation
  const handleDeleteConfirm = async (organizationId: string) => {
    await deleteMutation.mutateAsync(organizationId)
  }

  return {
    selectedItems,
    handleSelectItem,
    handleEditOrganization,
    handleDeleteOrganization,
    handleEditSubmit,
    handleDeleteConfirm,
    isEditing: editMutation.isPending,
    isDeleting: deleteMutation.isPending,
    editError: editMutation.error?.message,
    deleteError: deleteMutation.error?.message,
  }
}
