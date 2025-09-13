import React from 'react'
import { PageLayout } from './PageLayout'
import { usePageLayout } from '@/hooks/usePageLayout'
import type { PageLayoutProps } from './PageLayout.types'
import type {
  TemplateAdapterProps,
  TemplateAdapterConfig,
  EntityManagementTemplateProps,
  OrganizationManagementTemplateProps,
  ContactManagementTemplateProps,
  ProductManagementTemplateProps,
  OpportunityManagementTemplateProps,
  TransformedProps,
} from './TemplateAdapter.types'

/**
 * Default configuration for template adaptation
 */
const DEFAULT_CONFIG: TemplateAdapterConfig = {
  enableWarnings: process.env.NODE_ENV === 'development',
  migrationMode: 'enhanced',
  transformations: {
    convertHeaderActions: true,
    autoEnableFilters: false,
    useEnhancedSlots: true,
  },
}

/**
 * Hook for transforming EntityManagementTemplate props to PageLayout props
 */
function useTemplatePropsTransform(
  props: TemplateAdapterProps,
  config: TemplateAdapterConfig = DEFAULT_CONFIG
): TransformedProps {
  const {
    entityType,
    entityCount,
    onAddClick,
    title,
    subtitle,
    addButtonLabel,
    headerActions,
    children,
    filters,
    withFilterSidebar = false,
    filterSidebarConfig,
    containerized = true,
    fullHeight = true,
    className,
    showDeprecationWarning = config.enableWarnings,
  } = props

  const warnings: string[] = React.useMemo(() => {
    const warningList: string[] = []

    // Development warnings
    if (showDeprecationWarning && config.enableWarnings) {
      warningList.push(
        `EntityManagementTemplate is deprecated. Please migrate to PageLayout with slot-based composition.`
      )
    }

    return warningList
  }, [showDeprecationWarning, config.enableWarnings])

  const usedFeatures: string[] = React.useMemo(() => {
    const features: string[] = []
    if (headerActions) features.push('headerActions')
    if (filters) features.push('filters')
    if (withFilterSidebar) features.push('filterSidebar')
    return features
  }, [headerActions, filters, withFilterSidebar])

  // Use the migration hook for prop transformation
  const { migrationHelpers } = usePageLayout({
    entityType,
    entityCount,
    onAddClick,
    customTitle: title,
    customSubtitle: subtitle,
    customAddButtonLabel: addButtonLabel,
    headerActions,
    filters,
    withFilterSidebar,
  })

  // Build PageLayout props
  const pageLayoutProps = React.useMemo(() => {
    const partialProps = migrationHelpers.convertTemplateProps({
      entityType,
      entityCount,
      onAddClick,
      title,
      subtitle,
      addButtonLabel,
      headerActions,
      filters,
      withFilterSidebar,
      filterSidebarConfig,
      containerized,
      fullHeight,
      className,
      children,
    })

    // Ensure required properties are always provided
    const completeProps: PageLayoutProps = {
      title: partialProps.title || 'Page',
      children: children, // Use the actual children from props
      ...partialProps,
    }

    return completeProps
  }, [
    entityType,
    entityCount,
    onAddClick,
    title,
    subtitle,
    addButtonLabel,
    headerActions,
    filters,
    withFilterSidebar,
    filterSidebarConfig,
    containerized,
    fullHeight,
    className,
    children,
    migrationHelpers,
  ])

  return {
    pageLayoutProps,
    warnings,
    usedFeatures,
  }
}

/**
 * TemplateAdapter Component
 *
 * Provides backward compatibility with EntityManagementTemplate API
 * while using PageLayout internally. Enables gradual migration to slot-based architecture.
 *
 * Features:
 * - 100% API compatibility with EntityManagementTemplate
 * - Development-time deprecation warnings
 * - Enhanced features (filters, custom layouts) when needed
 * - Migration mode support for different transition strategies
 *
 * @example
 * ```tsx
 * // Drop-in replacement for EntityManagementTemplate
 * <TemplateAdapter
 *   entityType="ORGANIZATION"
 *   entityCount={organizations.length}
 *   onAddClick={openCreateDialog}
 *   headerActions={<ExportButton />}
 * >
 *   <OrganizationDataDisplay />
 *   <OrganizationDialogs />
 * </TemplateAdapter>
 * ```
 */
export const TemplateAdapter: React.FC<TemplateAdapterProps> = (props) => {
  const { pageLayoutProps, warnings } = useTemplatePropsTransform(props)

  // Log warnings in development
  React.useEffect(() => {
    if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
      warnings.forEach((warning) => {
        console.warn(`[TemplateAdapter]: ${warning}`)
      })
    }
  }, [warnings])

  return <PageLayout {...pageLayoutProps} />
}

/**
 * Specialized template variants for backward compatibility
 * These maintain the exact same API as the original templates
 */

/**
 * @deprecated Use PageLayout with slot-based composition instead
 */
export const EntityManagementTemplate: React.FC<EntityManagementTemplateProps> = (props) => {
  return <TemplateAdapter {...props} />
}

/**
 * @deprecated Use PageLayout with slot-based composition instead
 */
export const OrganizationManagementTemplate: React.FC<OrganizationManagementTemplateProps> = (
  props
) => {
  return <TemplateAdapter {...props} entityType="ORGANIZATION" />
}

/**
 * @deprecated Use PageLayout with slot-based composition instead
 */
export const ContactManagementTemplate: React.FC<ContactManagementTemplateProps> = (props) => {
  return <TemplateAdapter {...props} entityType="CONTACT" />
}

/**
 * @deprecated Use PageLayout with slot-based composition instead
 */
export const ProductManagementTemplate: React.FC<ProductManagementTemplateProps> = (props) => {
  return <TemplateAdapter {...props} entityType="PRODUCT" />
}

/**
 * @deprecated Use PageLayout with slot-based composition instead
 */
export const OpportunityManagementTemplate: React.FC<OpportunityManagementTemplateProps> = (
  props
) => {
  return <TemplateAdapter {...props} entityType="OPPORTUNITY" />
}

// Default export
export default TemplateAdapter

// Named exports for migration
export { useTemplatePropsTransform }
export type { TemplateAdapterProps, TemplateAdapterConfig }
