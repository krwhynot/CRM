import React, { useEffect } from 'react'
import { Search, Building2, Users, Filter } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import {
  useOrganizations,
  useRefreshOrganizations,
  useOrganizationsPageState,
  useOrganizationsPageActions,
  useOrganizationFormData,
  OrganizationsDataDisplay,
  OrganizationDialogs,
} from '@/features/organizations'
import { OrganizationsErrorBoundary } from '@/components/error-boundaries/QueryErrorBoundary'
import { PageLayout } from '@/components/layout'
import { usePageLayout } from '@/hooks'
import { useOrganizationsFiltering } from '@/features/organizations/hooks/useOrganizationsFiltering'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import type { FilterSection } from '@/components/filters/FilterSidebar.types'

function OrganizationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: organizations = [], isLoading, error, isError } = useOrganizations()
  const refreshOrganizations = useRefreshOrganizations()

  // Filter state management
  const {
    activeFilter,
    setActiveFilter,
    searchTerm,
    setSearchTerm,
    filteredOrganizations,
    filterPills,
  } = useOrganizationsFiltering(organizations)

  const {
    isCreateDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedOrganization,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
  } = useOrganizationsPageState()

  const { handleCreate, handleUpdate, handleDelete, isCreating, isUpdating, isDeleting } =
    useOrganizationsPageActions(closeCreateDialog, closeEditDialog, closeDeleteDialog)

  const { initialData: editFormInitialData } = useOrganizationFormData(selectedOrganization)

  // Handle URL action parameters (e.g., ?action=create)
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      openCreateDialog()
      // Remove the action parameter from URL to clean up
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.delete('action')
        return newParams
      })
    }
  }, [searchParams, setSearchParams, openCreateDialog])

  // Create filter sections for the sidebar
  const filterSections: FilterSection[] = React.useMemo(
    () => [
      {
        id: 'search',
        title: 'Search',
        icon: <Search className="size-4" />,
        defaultExpanded: true,
        content: (
          <div className={semanticSpacing.stack.sm}>
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        ),
      },
      {
        id: 'type',
        title: 'Organization Type',
        icon: <Building2 className="size-4" />,
        defaultExpanded: true,
        badge: activeFilter !== 'all' ? '1' : undefined,
        content: (
          <div className={semanticSpacing.stack.sm}>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="distributors">Distributors</SelectItem>
                <SelectItem value="high-priority">High Priority</SelectItem>
                <SelectItem value="recently-contacted">Recently Contacted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
      },
      {
        id: 'quick-filters',
        title: 'Quick Filters',
        icon: <Filter className="size-4" />,
        defaultExpanded: true,
        content: (
          <div className={cn(semanticSpacing.stack.sm, 'space-y-2')}>
            {filterPills.map((pill) => (
              <Button
                key={pill.key}
                variant={activeFilter === pill.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(pill.key)}
                className="w-full justify-between"
              >
                <span>{pill.label}</span>
                <Badge variant="secondary" className="ml-2">
                  {pill.count}
                </Badge>
              </Button>
            ))}
          </div>
        ),
      },
    ],
    [activeFilter, setActiveFilter, searchTerm, setSearchTerm, filterPills]
  )

  // Create filters component for sidebar
  const organizationFilters = (
    <div className={semanticSpacing.stack.md}>
      {filterSections.map((section) => (
        <div key={section.id} className={semanticSpacing.stack.sm}>
          <div className="flex items-center gap-2">
            {section.icon}
            <h3 className={semanticTypography.label}>{section.title}</h3>
            {section.badge && <Badge variant="secondary">{section.badge}</Badge>}
          </div>
          {section.content}
        </div>
      ))}
    </div>
  )

  // Custom header actions showing filter counts
  const headerActions = (
    <div className="flex items-center gap-2">
      <span className={cn(semanticTypography.caption, 'text-muted-foreground')}>
        {filteredOrganizations.length === organizations.length
          ? `${organizations.length} total`
          : `${filteredOrganizations.length} of ${organizations.length}`}
      </span>
    </div>
  )

  // Use the page layout hook for slot composition without filters
  const { pageLayoutProps } = usePageLayout({
    entityType: 'ORGANIZATION',
    entityCount: filteredOrganizations.length,
    onAddClick: openCreateDialog,
    headerActions,
  })

  return (
    <OrganizationsErrorBoundary>
      <PageLayout {...pageLayoutProps}>
        <OrganizationsDataDisplay
          isLoading={isLoading}
          isError={isError}
          error={error}
          organizations={filteredOrganizations}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onRefresh={refreshOrganizations}
        />

        <OrganizationDialogs
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          selectedOrganization={selectedOrganization}
          editFormInitialData={editFormInitialData}
          onCreateSubmit={handleCreate}
          onEditSubmit={handleUpdate}
          onDeleteConfirm={handleDelete}
          onCreateDialogChange={closeCreateDialog}
          onEditDialogChange={closeEditDialog}
          onDeleteDialogChange={closeDeleteDialog}
          onDeleteCancel={closeDeleteDialog}
          isCreating={isCreating}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </PageLayout>
    </OrganizationsErrorBoundary>
  )
}

export default OrganizationsPage
