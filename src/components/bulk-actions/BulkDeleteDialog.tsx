import { StandardDialog } from '@/components/ui/StandardDialog'
import type { BulkDeleteDialogProps, DeletableEntity } from './types'

export const BulkDeleteDialog = <T extends DeletableEntity = DeletableEntity>({
  open,
  onOpenChange,
  entities,
  onConfirm,
  isDeleting = false,
  entityType = 'item',
  entityTypePlural = 'items',
}: BulkDeleteDialogProps<T>) => {
  const entityCount = entities.length

  const handleConfirm = () => {
    if (!isDeleting) {
      onConfirm()
    }
  }

  // Capitalize first letter for display
  const capitalizedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1)
  const capitalizedEntityTypePlural =
    entityTypePlural.charAt(0).toUpperCase() + entityTypePlural.slice(1)

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
        {entities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{capitalizedEntityTypePlural} to be archived:</p>
            <div className="max-h-32 overflow-y-auto rounded bg-gray-50 p-2">
              <ul className="space-y-1 text-sm">
                {entities.slice(0, 5).map((entity) => (
                  <li key={entity.id} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-gray-400" />
                    {entity.name}
                  </li>
                ))}
                {entities.length > 5 && (
                  <li className="italic text-gray-600">...and {entities.length - 5} more</li>
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