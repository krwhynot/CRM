import { useState } from 'react'

/**
 * Generic entity page state hook for CRUD dialog management
 *
 * Provides consistent interface for single-entity selection and dialog
 * state management across all entity types. Uses standardized naming
 * convention with 'selectedEntity' instead of entity-specific names.
 *
 * Note: While the documentation suggests ID-based selection following
 * contactAdvocacyStore pattern, existing page state hooks store full
 * entities for immediate access during dialog operations. This maintains
 * backward compatibility with current implementation patterns.
 *
 * @template T - Entity type that must have an 'id' property
 */
export interface UseEntityPageStateReturn<T extends { id: string }> {
  // Dialog state management
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean

  // Selected entity (standardized naming - stores full entity for compatibility)
  selectedEntity: T | null

  // Create dialog actions
  openCreateDialog: () => void
  closeCreateDialog: () => void

  // Edit dialog actions
  openEditDialog: (entity: T) => void
  closeEditDialog: () => void

  // Delete dialog actions
  openDeleteDialog: (entity: T) => void
  closeDeleteDialog: () => void
}

export const useEntityPageState = <T extends { id: string }>(): UseEntityPageStateReturn<T> => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<T | null>(null)

  const openCreateDialog = () => setIsCreateDialogOpen(true)
  const closeCreateDialog = () => setIsCreateDialogOpen(false)

  const openEditDialog = (entity: T) => {
    setSelectedEntity(entity)
    setIsEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedEntity(null)
  }

  const openDeleteDialog = (entity: T) => {
    setSelectedEntity(entity)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedEntity(null)
  }

  return {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedEntity,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  }
}
