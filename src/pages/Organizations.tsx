import { OrganizationsList } from '@/features/organizations/components/OrganizationsList'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useEntityPageState } from '@/hooks/useEntityPageState'
import type { Organization } from '@/types/entities'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

function OrganizationsPage() {
  const { data: organizations = [], isLoading, error, isError } = useOrganizations()

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedEntity: selectedOrganization,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useEntityPageState<Organization>()

  // Handle loading state
  if (isLoading) {
    return (
      <FilterLayoutProvider>
        <PageLayout>
          <PageHeader title="Organizations" description="Loading organizations..." />
          <ContentSection>
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading organizations...</div>
            </div>
          </ContentSection>
        </PageLayout>
      </FilterLayoutProvider>
    )
  }

  // Handle error state
  if (isError && error) {
    return (
      <FilterLayoutProvider>
        <PageLayout>
          <PageHeader title="Organizations" description="Error loading organizations" />
          <ContentSection>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-destructive mb-4">Failed to load organizations</div>
              <div className="text-sm text-muted-foreground">{error?.message || 'Unknown error'}</div>
            </div>
          </ContentSection>
        </PageLayout>
      </FilterLayoutProvider>
    )
  }

  return (
    <FilterLayoutProvider>
      <PageLayout>
        <PageHeader
          title="Organizations"
          description={`Manage ${organizations.length} organizations in your CRM`}
          action={{
            label: 'Add Organization',
            onClick: openCreateDialog,
          }}
        />

        <ContentSection>
          <OrganizationsList
            organizations={organizations}
            loading={isLoading}
            isError={isError}
            error={error}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onAddNew={openCreateDialog}
          />
        </ContentSection>
      </PageLayout>
    </FilterLayoutProvider>
  )
}

export default OrganizationsPage
