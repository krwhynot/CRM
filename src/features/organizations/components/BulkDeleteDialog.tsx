import React from 'react'
import { StandardDialog } from '@/components/ui/StandardDialog'
import type { Organization } from '@/types/entities'

interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizations: Organization[]
  onConfirm: () => void
  isDeleting?: boolean
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onOpenChange,
  organizations,
  onConfirm,
  isDeleting = false
}) => {
  const organizationCount = organizations.length
  
  const handleConfirm = () => {
    if (!isDeleting) {
      onConfirm()
    }
  }

  return (
    <StandardDialog
      variant="alert"
      open={open}
      onOpenChange={onOpenChange}
      title={`Archive ${organizationCount} Organization${organizationCount !== 1 ? 's' : ''}?`}
      description="This will archive the selected organizations. They will be hidden from view but can be restored later if needed."
      onConfirm={handleConfirm}
      confirmText="Archive Organizations"
      cancelText="Cancel"
      confirmVariant="destructive"
      isLoading={isDeleting}
      size="md"
    >
      <div className="space-y-3">
        {organizations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Organizations to be archived:</p>
            <div className="max-h-32 overflow-y-auto rounded bg-gray-50 p-2">
              <ul className="space-y-1 text-sm">
                {organizations.slice(0, 5).map((org) => (
                  <li key={org.id} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-gray-400" />
                    {org.name}
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
          ⚠️ This action will soft-delete these organizations (they can be restored)
        </p>
      </div>
    </StandardDialog>
  )
}