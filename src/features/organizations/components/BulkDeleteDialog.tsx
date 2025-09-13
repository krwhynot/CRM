import { StandardDialog } from '@/components/ui/StandardDialog'
import {
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  fontWeight,
  semanticColors,
} from '@/styles/tokens'
import type { Organization } from '@/types/entities'

// Generic entity type that has id and name
import { cn } from '@/lib/utils'
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
  entityTypePlural = 'organizations',
}: BulkDeleteDialogProps<T>) => {
  const entityCount = organizations.length

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
      <div className={semanticSpacing.stackContainer}>
        {organizations.length > 0 && (
          <div className={semanticSpacing.stack.xs}>
            <p className={`${semanticTypography.body} ${fontWeight.medium}`}>
              {capitalizedEntityTypePlural} to be archived:
            </p>
            <div
              className={`max-h-32 overflow-y-auto ${semanticRadius.default} bg-muted ${semanticSpacing.cardContainer}`}
            >
              <ul className={`${semanticSpacing.stack.xs} ${semanticTypography.body}`}>
                {organizations.slice(0, 5).map((entity) => (
                  <li key={entity.id} className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
                    <span
                      className={`size-1.5 shrink-0 ${semanticRadius.full} bg-muted-foreground/40`}
                    />
                    {entity.name}
                  </li>
                ))}
                {organizations.length > 5 && (
                  <li className={`italic text-muted-foreground`}>
                    ...and {organizations.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        <p
          className={`${semanticRadius.default} ${semanticColors.warning.background} ${semanticSpacing.cardContainer} ${semanticTypography.body} ${fontWeight.medium} ${semanticColors.warning.foreground}`}
        >
          ⚠️ This action will soft-delete these {entityTypePlural} (they can be restored)
        </p>
      </div>
    </StandardDialog>
  )
}
