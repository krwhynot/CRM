// Generic entity type that has id and name
export interface DeletableEntity {
  id: string
  name: string
}

// Bulk Actions Toolbar Props
export interface BulkActionsToolbarProps {
  selectedCount: number
  totalCount: number
  onBulkDelete: () => void
  onClearSelection: () => void
  onSelectAll?: () => void
  onSelectNone?: () => void
  className?: string
  entityType?: string // e.g., "contact", "opportunity"
  entityTypePlural?: string // e.g., "contacts", "opportunities"
}

// Bulk Delete Dialog Props
export interface BulkDeleteDialogProps<T extends DeletableEntity = DeletableEntity> {
  open: boolean
  onOpenChange: (open: boolean) => void
  entities: T[] // Generic entities array (was "organizations")
  onConfirm: () => void
  isDeleting?: boolean
  entityType?: string // e.g., "organization", "opportunity", "contact"
  entityTypePlural?: string // e.g., "organizations", "opportunities", "contacts"
}

// Bulk Operations Hook Return Type
export interface BulkOperationsHook<T extends DeletableEntity> {
  selectedItems: Set<string>
  selectedEntities: T[]
  selectedCount: number
  showBulkActions: boolean
  handleSelectAll: (checked: boolean, entities: T[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  handleBulkDelete: () => void
  clearSelection: () => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  isDeleting: boolean
}
