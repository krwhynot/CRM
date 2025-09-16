import React from 'react'
import { PageLayout } from './PageLayout'
import { PageHeader } from './PageHeader'
import { ContentSection } from './ContentSection'

interface EntityListWrapperProps {
  /** Page title displayed in the header */
  title: string

  /** Optional description displayed below the title */
  description?: string

  /** Configuration for the primary action button (usually "Add Entity") */
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }

  /** Content to render in the main section (DataTable, filters, etc.) */
  children: React.ReactNode

  /** Whether to show breadcrumbs navigation */
  showBreadcrumbs?: boolean

  /** Optional additional header content (status badges, filters, etc.) */
  headerChildren?: React.ReactNode

  /** Optional content section title (if different from page title) */
  contentTitle?: string

  /** Optional content section description */
  contentDescription?: string

  /** Additional CSS classes for customization */
  className?: string
}

/**
 * EntityListWrapper is a reusable component that combines PageLayout, PageHeader,
 * and ContentSection into a standardized layout for entity list pages.
 *
 * This component provides consistent structure across all entity pages (Organizations,
 * Contacts, Opportunities, Products, Interactions) while allowing for customization
 * through props and children.
 *
 * Features:
 * - Consistent page layout with breadcrumbs
 * - Standardized header with title, description, and action button
 * - Content section wrapper for list content
 * - Flexible children prop for DataTable, filters, and other content
 * - TypeScript support with proper prop types
 *
 * Usage:
 * ```tsx
 * <EntityListWrapper
 *   title="Organizations"
 *   description="Manage your organization relationships and contacts"
 *   action={{
 *     label: "Add Organization",
 *     onClick: handleAddOrganization,
 *     icon: <Plus className="h-4 w-4" />
 *   }}
 * >
 *   <DataTable useResponsiveFilters={true} ... />
 * </EntityListWrapper>
 * ```
 */
export function EntityListWrapper({
  title,
  description,
  action,
  children,
  showBreadcrumbs = true,
  headerChildren,
  contentTitle,
  contentDescription,
  className
}: EntityListWrapperProps) {
  return (
    <PageLayout showBreadcrumbs={showBreadcrumbs} className={className}>
      <PageHeader
        title={title}
        description={description}
        action={action}
      >
        {headerChildren}
      </PageHeader>

      <ContentSection
        title={contentTitle}
        description={contentDescription}
      >
        {children}
      </ContentSection>
    </PageLayout>
  )
}