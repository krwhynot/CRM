import React from 'react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { AppSidebar } from '@/layout/components/AppSidebar'
import { Header } from '@/layout/components/Header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { semanticSpacing } from '@/styles/tokens'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type {
  PageLayoutProps,
  PageLayoutHeaderProps,
  PageLayoutContentProps,
} from './PageLayout.types'

/**
 * Internal header component for PageLayout
 * Wraps the existing PageHeader with slot-specific behavior
 */
const PageLayoutHeader: React.FC<
  PageLayoutHeaderProps & {
    mobileFilterButton?: React.ReactNode
  }
> = ({ title, subtitle, meta, actions, className, mobileFilterButton }) => {
  // Combine regular actions with mobile filter button
  const combinedActions = React.useMemo(() => {
    if (!mobileFilterButton && !actions) return null

    if (!mobileFilterButton) return actions
    if (!actions) return mobileFilterButton

    // If both exist, combine them
    return (
      <div className="flex items-center gap-2">
        {mobileFilterButton}
        {actions}
      </div>
    )
  }, [mobileFilterButton, actions])

  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      meta={meta}
      actions={combinedActions}
      className={className}
    />
  )
}

/**
 * Internal content component for PageLayout
 * Handles containerization and content spacing
 */
const PageLayoutContent: React.FC<PageLayoutContentProps> = ({
  children,
  className,
  containerized = true,
}) => {
  const contentClasses = cn(
    semanticSpacing.section.lg, // mt-8 for consistent section spacing
    className
  )

  if (containerized) {
    return <div className={contentClasses}>{children}</div>
  }

  return <div className={contentClasses}>{children}</div>
}

/**
 * PageLayout Component
 *
 * Slot-based layout system that replaces EntityManagementTemplate.
 * Provides composable slots for title, actions, filters, and content.
 *
 * Features:
 * - Flexible slot composition (any ReactNode in any slot)
 * - Conditional filter sidebar with responsive behavior
 * - Semantic design token integration (88% coverage maintained)
 * - Mobile-first responsive design
 * - TypeScript-first with full type safety
 *
 * @example
 * ```tsx
 * <PageLayout
 *   title="Organizations"
 *   subtitle="Manage your business relationships"
 *   meta={<span>({count})</span>}
 *   actions={
 *     <div className="flex gap-2">
 *       <ExportButton />
 *       <AddButton onClick={handleAdd} />
 *     </div>
 *   }
 *   filters={<OrganizationFilters />}
 *   withFilterSidebar
 * >
 *   <OrganizationTable />
 * </PageLayout>
 * ```
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  // Slots
  title,
  subtitle,
  actions,
  filters,
  meta,
  children,

  // Configuration
  withFilterSidebar = false,
  filterSidebarConfig = {},

  // Styling
  className,
  contentClassName,
  headerClassName,

  // Layout options
  containerized = true,
  fullHeight: _fullHeight = true,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Determine if we should render the filter sidebar
  const shouldRenderFilterSidebar = withFilterSidebar && filters

  // Create mobile filter button
  const mobileFilterButton =
    shouldRenderFilterSidebar && isMobile ? (
      <div className="md:hidden">
        <FilterSidebar {...filterSidebarConfig}>{filters}</FilterSidebar>
      </div>
    ) : null

  // All PageLayout renders now include the app shell
  return (
    <SidebarProvider data-app-shell className={className}>
      <AppSidebar />
      <SidebarInset className="flex">
        {/* If we have a filter sidebar, add it to the layout on desktop */}
        {shouldRenderFilterSidebar && (
          <FilterSidebar {...filterSidebarConfig} className="hidden md:block">
            {filters}
          </FilterSidebar>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className={cn('flex-1 overflow-auto', semanticSpacing.pageContainer)}>
            <PageLayoutHeader
              title={title}
              subtitle={subtitle}
              meta={meta}
              actions={actions}
              className={headerClassName}
              mobileFilterButton={mobileFilterButton}
            />
            <PageLayoutContent className={contentClassName} containerized={containerized}>
              {children}
            </PageLayoutContent>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Default export
export default PageLayout

// Named exports for specific use cases
export { PageLayoutHeader, PageLayoutContent }
export type { PageLayoutProps, PageLayoutHeaderProps, PageLayoutContentProps }
