import { StandardDialog } from '@/components/ui/StandardDialog'
import { OrganizationForm } from './OrganizationForm'
import { COPY } from '@/lib/copy'
import type { Organization } from '@/types/entities'
import type { OrganizationFormInterface } from '@/types/forms/form-interfaces'

interface OrganizationDialogsProps {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  selectedOrganization: Organization | null
  editFormInitialData: Partial<OrganizationFormInterface> | undefined
  onCreateSubmit: (data: OrganizationFormInterface) => void
  onEditSubmit: (selectedOrganization: Organization, data: OrganizationFormInterface) => void
  onDeleteConfirm: (selectedOrganization: Organization) => void
  onCreateDialogChange: (open: boolean) => void
  onEditDialogChange: (open: boolean) => void
  onDeleteDialogChange: (open: boolean) => void
  onDeleteCancel: () => void
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export const OrganizationDialogs = ({
  isCreateDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  selectedOrganization,
  editFormInitialData,
  onCreateSubmit,
  onEditSubmit,
  onDeleteConfirm,
  onCreateDialogChange,
  onEditDialogChange,
  onDeleteDialogChange,
  onDeleteCancel,
  isCreating,
  isUpdating,
  isDeleting,
}: OrganizationDialogsProps) => {
  return (
    <>
      {/* Create Dialog */}
      <StandardDialog
        open={isCreateDialogOpen}
        onOpenChange={onCreateDialogChange}
        title={COPY.DIALOGS.CREATE_ORGANIZATION}
        description="Add an organization to your CRM system with contact and business information."
        size="lg"
        scroll="content"
      >
        <OrganizationForm onSubmit={onCreateSubmit} loading={isCreating} />
      </StandardDialog>

      {/* Edit Dialog */}
      <StandardDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogChange}
        title={COPY.DIALOGS.EDIT_ORGANIZATION}
        description="Update organization information and business details."
        size="lg"
        scroll="content"
      >
        {selectedOrganization && (
          <OrganizationForm
            initialData={editFormInitialData as never}
            onSubmit={(data) => onEditSubmit(selectedOrganization, data)}
            loading={isUpdating}
          />
        )}
      </StandardDialog>

      {/* Delete Confirmation Dialog */}
      <StandardDialog
        variant="alert"
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        title={COPY.CONFIRMATIONS.ARE_YOU_SURE}
        description={
          selectedOrganization &&
          COPY.CONFIRMATIONS.DELETE_WARNING.replace('{name}', selectedOrganization.name)
        }
        onConfirm={() => selectedOrganization && onDeleteConfirm(selectedOrganization)}
        onCancel={onDeleteCancel}
        confirmText={COPY.BUTTONS.DELETE + ' Organization'}
        cancelText={COPY.BUTTONS.CANCEL}
        confirmVariant="destructive"
        isLoading={isDeleting}
      >
        <div className="text-center text-sm text-muted-foreground">
          This will soft-delete the organization. It can be restored later if needed.
        </div>
      </StandardDialog>
    </>
  )
}
