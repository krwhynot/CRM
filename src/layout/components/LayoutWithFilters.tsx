import React from 'react'
import { AppSidebar } from './AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Header } from './Header'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { semanticSpacing } from '@/styles/tokens'
import { cn } from '@/lib/utils'
import type { FilterSection } from '@/components/filters/FilterSidebar.types'

interface LayoutWithFiltersProps {
  children: React.ReactNode
  filterSections?: FilterSection[]
  filterContent?: React.ReactNode
  defaultFiltersCollapsed?: boolean
  persistFiltersKey?: string
  onFiltersCollapsedChange?: (collapsed: boolean) => void
}

/**
 * @deprecated LayoutWithFilters is deprecated in favor of PageLayout with filter sidebar.
 *
 * Migration: Use PageLayout with withFilterSidebar={true} and filters slot:
 * ```tsx
 * <PageLayout
 *   withFilterSidebar={true}
 *   filterSidebarConfig={{ persistKey: 'your-key' }}
 *   filters={<YourFilterContent />}
 * >
 *   {children}
 * </PageLayout>
 * ```
 *
 * See /src/components/layout/MIGRATION.md for complete migration guide.
 */
export function LayoutWithFilters({
  children,
  filterSections,
  filterContent,
  defaultFiltersCollapsed = false,
  persistFiltersKey,
  onFiltersCollapsedChange,
}: LayoutWithFiltersProps) {
  // Development deprecation warning
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '🚨 LayoutWithFilters is deprecated!\n' +
          '📚 Migration: Use PageLayout with withFilterSidebar={true}\n' +
          '📖 Guide: /src/components/layout/MIGRATION.md\n' +
          '⚡ Benefits: Slot-based composition with 5-10x faster development'
      )
    }
  }, [])

  return (
    <SidebarProvider data-app-shell>
      <AppSidebar />
      <SidebarInset className="flex">
        {/* Filter Sidebar - Fixed width column */}
        <FilterSidebar
          sections={filterSections}
          defaultCollapsed={defaultFiltersCollapsed}
          persistKey={persistFiltersKey}
          onCollapsedChange={onFiltersCollapsedChange}
          className="hidden md:block"
        >
          {filterContent}
        </FilterSidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className={cn('flex-1 overflow-auto', semanticSpacing.pageContainer)}>
            {children}
          </main>
        </div>

        {/* Mobile Filter Sidebar - Renders as Sheet on mobile */}
        <div className="md:hidden">
          <FilterSidebar sections={filterSections} persistKey={persistFiltersKey}>
            {filterContent}
          </FilterSidebar>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
