import { OpportunitiesList } from '@/features/opportunities/components/OpportunitiesList'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useEntityPageState } from '@/hooks/useEntityPageState'
import type { Opportunity } from '@/types/entities'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

function OpportunitiesPage() {
  const { data: opportunities = [], isLoading, isError, error } = useOpportunities()

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedEntity: selectedOpportunity,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useEntityPageState<Opportunity>()

  // Handle loading state
  if (isLoading) {
    return (
      <FilterLayoutProvider>
        <PageLayout>
          <PageHeader title="Opportunities" description="Loading opportunities..." />
          <ContentSection>
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading opportunities...</div>
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
          <PageHeader title="Opportunities" description="Error loading opportunities" />
          <ContentSection>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-destructive mb-4">Failed to load opportunities</div>
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
          title="Opportunities"
          description={`Manage ${opportunities.length} sales opportunities in your pipeline`}
          action={{
            label: 'Add Opportunity',
            onClick: openCreateDialog,
          }}
        />

        <ContentSection>
          <OpportunitiesList
            opportunities={opportunities}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
        </ContentSection>
      </PageLayout>
    </FilterLayoutProvider>
  )
}

export default OpportunitiesPage
