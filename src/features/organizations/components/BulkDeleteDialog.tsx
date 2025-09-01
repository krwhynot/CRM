import { StandardDialog } from '@/components/ui/StandardDialog'
import type { Organization } from '@/types/entities'

// Generic entity type that has id and name
interface DeletableEntity {
  id: string
  name: string
}

interface BulkDeleteDialogProps<T extends DeletableEntity = Organization> {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizations: T[] // Renamed for backward compatibility, but accepts any entity type
  onConfirm: () => void
  isDeleting?: boolean
  entityType?: string // e.g., "organization", "opportunity", "contact"
  entityTypePlural?: string // e.g., "organizations", "opportunities", "contacts"
}

export const BulkDeleteDialog = <T extends DeletableEntity = Organization>({
  open,
  onOpenChange,
  organizations,
  onConfirm,
  isDeleting = false,
  entityType = 'organization',
  entityTypePlural = 'organizations'
}: BulkDeleteDialogProps<T>) => {
  const entityCount = organizations.length
  
  const handleConfirm = () => {
    if (!isDeleting) {
      onConfirm()
    }
  }

  // Capitalize first letter for display
  const capitalizedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1)
  const capitalizedEntityTypePlural = entityTypePlural.charAt(0).toUpperCase() + entityTypePlural.slice(1)

  return (
    <StandardDialog
      variant="alert"
      open={open}
      onOpenChange={onOpenChange}
      title={`Archive ${entityCount} ${capitalizedEntityType}${entityCount !== 1 ? 's' : ''}?`}
      description={`This will archive the selected ${entityTypePlural}. They will be hidden from view but can be restored later if needed.`}
      onConfirm={handleConfirm}
      confirmText={`Archive ${capitalizedEntityTypePlural}`}
      cancelText="Cancel"
      confirmVariant="destructive"
      isLoading={isDeleting}
      size="md"
    >
      <div className="space-y-3">
        {organizations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{capitalizedEntityTypePlural} to be archived:</p>
            <div className="max-h-32 overflow-y-auto rounded bg-gray-50 p-2">
              <ul className="space-y-1 text-sm">
                {organizations.slice(0, 5).map((entity) => (
                  <li key={entity.id} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-gray-400" />
                    {entity.name}
                  </li>
                ))}
                {organizations.length > 5 && (
                  <li className="italic text-gray-600">
                    ...and {organizations.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
        
        <p className="rounded bg-amber-50 p-2 text-sm font-medium text-amber-700">
          ⚠️ This action will soft-delete these {entityTypePlural} (they can be restored)
        </p>
      </div>
    </StandardDialog>
  )
}