import React, { useState } from 'react'
import { toast } from '@/lib/toast-styles'
import { Button } from '@/components/ui/button'
import { OrganizationsTable } from '@/components/organizations/OrganizationsTable'
import { OrganizationForm } from '@/components/organizations/OrganizationForm'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization, useRefreshOrganizations } from '@/hooks/useOrganizations'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { OrganizationsErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import type { Organization } from '@/types/entities'

function OrganizationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  
  // Feature flag for new MFB styling (default: enabled, opt-out with 'false')
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false';
  
  const { data: organizations = [], isLoading, error, isError } = useOrganizations()
  const createOrganizationMutation = useCreateOrganization()
  const updateOrganizationMutation = useUpdateOrganization()
  const deleteOrganizationMutation = useDeleteOrganization()
  const refreshOrganizations = useRefreshOrganizations()

  // Debug: Track Organizations page data state
  React.useEffect(() => {
    console.log('📄 [OrganizationsPage] Data state:', {
      isLoading,
      isError,
      organizationsCount: organizations.length,
      error: error?.message
    })
  }, [isLoading, isError, organizations.length, error])


  const handleEdit = (organization: Organization) => {
    setSelectedOrganization(organization)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (organization: Organization) => {
    setSelectedOrganization(organization)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedOrganization) return

    try {
      await deleteOrganizationMutation.mutateAsync(selectedOrganization.id)
      setIsDeleteDialogOpen(false)
      setSelectedOrganization(null)
      toast.success('Organization deleted successfully!')
    } catch (error) {
      console.error('Failed to delete organization:', error)
      toast.error('Failed to delete organization. Please try again.')
    }
  }

  return (
    <OrganizationsErrorBoundary>
      <div className={cn("min-h-screen", USE_NEW_STYLE && "bg-[var(--mfb-cream)]")}>
        <div className={cn("max-w-7xl mx-auto p-6", USE_NEW_STYLE && "space-y-8")}>
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Manage Organizations"
          subtitle="Principals, Retailers & Partners"
          count={organizations.length}
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className={cn(
              "btn-primary ml-6",
              USE_NEW_STYLE && "shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            )}>
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Add a new organization to your CRM system with contact and business information.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <OrganizationForm 
              onSubmit={async (data) => {
                try {
                  console.log('🔍 Form data received:', data)
                  
                  // Form data already matches database schema
                  const dbData = data
                  
                  console.log('🚀 Sending to database:', dbData)
                  
                  // Validate type field is present before submission
                  if (!data.type) {
                    throw new Error('Organization type is required but missing from form data')
                  }
                  
                  await createOrganizationMutation.mutateAsync(dbData as any)
                  setIsCreateDialogOpen(false)
                  toast.success('Organization created successfully!')
                } catch (error) {
                  console.error('Failed to create organization:', error)
                  toast.error('Failed to create organization. Please try again.')
                }
              }}
              loading={createOrganizationMutation.isPending}
            />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organizations Table */}
      {isError ? (
        <div className="text-center py-8 space-y-4 bg-white rounded-lg border shadow-sm p-12">
          <div className="text-red-600 font-medium">Failed to load organizations</div>
          <div className="text-gray-500 text-sm">
            {error?.message || 'An unexpected error occurred while fetching organizations.'}
          </div>
          <Button 
            onClick={refreshOrganizations} 
            variant="outline"
            className="mt-2"
          >
            Refresh Data
          </Button>
        </div>
      ) : isLoading ? (
        <div className="text-center py-8 space-y-2 bg-white rounded-lg border shadow-sm p-12">
          <div className="font-nunito text-mfb-green">Loading organizations...</div>
          <div className="text-sm text-mfb-olive/60 font-nunito">
            This should only take a few seconds
          </div>
        </div>
      ) : (
        <OrganizationsTable 
          organizations={organizations}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization information and business details.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            {selectedOrganization && (
              <OrganizationForm
              initialData={{
                name: selectedOrganization.name,
                type: selectedOrganization.type,
                priority: selectedOrganization.priority as 'A' | 'B' | 'C' | 'D',
                segment: selectedOrganization.segment,
                is_principal: selectedOrganization.is_principal ?? false,
                is_distributor: selectedOrganization.is_distributor ?? false,
                city: selectedOrganization.city,
                state_province: selectedOrganization.state_province,
                phone: selectedOrganization.phone,
                website: selectedOrganization.website,
                notes: selectedOrganization.notes
              }}
              onSubmit={async (data) => {
                try {
                  await updateOrganizationMutation.mutateAsync({
                    id: selectedOrganization.id,
                    updates: data as any
                  })
                  setIsEditDialogOpen(false)
                  setSelectedOrganization(null)
                  toast.success('Organization updated successfully!')
                } catch (error) {
                  console.error('Failed to update organization:', error)
                  toast.error('Failed to update organization. Please try again.')
                }
              }}
              loading={updateOrganizationMutation.isPending}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete "{selectedOrganization?.name}". 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedOrganization(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteOrganizationMutation.isPending}
            >
              {deleteOrganizationMutation.isPending ? 'Deleting...' : 'Delete Organization'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
    </OrganizationsErrorBoundary>
  )
}

export default OrganizationsPage
