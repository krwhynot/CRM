import { useState } from 'react'
import type { Organization } from '@/types/entities'

export const useOrganizationsPageState = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)

  const openCreateDialog = () => setIsCreateDialogOpen(true)
  const closeCreateDialog = () => setIsCreateDialogOpen(false)

  const openEditDialog = (organization: Organization) => {
    setSelectedOrganization(organization)
    setIsEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedOrganization(null)
  }

  const openDeleteDialog = (organization: Organization) => {
    setSelectedOrganization(organization)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedOrganization(null)
  }

  return {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedOrganization,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  }
}
