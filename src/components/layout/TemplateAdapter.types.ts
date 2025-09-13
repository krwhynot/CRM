import type { ReactNode } from 'react'
import type { EntityType } from '@/hooks/usePageLayout'
import type { PageLayoutProps } from './PageLayout.types'

/**
 * Props that match the original EntityManagementTemplate interface
 * Used for backward compatibility during migration
 */
export interface EntityManagementTemplateProps {
  // Entity info
  entityType: EntityType
  entityCount: number

  // Actions
  onAddClick: () => void
  children: ReactNode

  // Optional customization (can override derived values)
  title?: string
  subtitle?: string
  addButtonLabel?: string
  headerActions?: ReactNode
  className?: string
}

/**
 * Props for the TemplateAdapter component
 * Extends EntityManagementTemplate props with additional PageLayout features
 */
export interface TemplateAdapterProps extends EntityManagementTemplateProps {
  // Additional PageLayout features
  filters?: ReactNode
  withFilterSidebar?: boolean
  filterSidebarConfig?: PageLayoutProps['filterSidebarConfig']

  // Override PageLayout defaults
  containerized?: boolean
  fullHeight?: boolean

  // Development flags
  showDeprecationWarning?: boolean
  migrationMode?: 'strict' | 'enhanced' | 'silent'
}

/**
 * Configuration for template adaptation
 */
export interface TemplateAdapterConfig {
  /** Enable development-time deprecation warnings */
  enableWarnings: boolean
  /** Migration mode affects how props are transformed */
  migrationMode: 'strict' | 'enhanced' | 'silent'
  /** Additional transformation options */
  transformations: {
    /** Auto-convert headerActions to action slots */
    convertHeaderActions: boolean
    /** Auto-derive filter sidebar from certain entity types */
    autoEnableFilters: boolean
    /** Use enhanced slot composition */
    useEnhancedSlots: boolean
  }
}

/**
 * Entity-specific template props for specialized variants
 */
export interface OrganizationManagementTemplateProps
  extends Omit<EntityManagementTemplateProps, 'entityType'> {}

export interface ContactManagementTemplateProps
  extends Omit<EntityManagementTemplateProps, 'entityType'> {}

export interface ProductManagementTemplateProps
  extends Omit<EntityManagementTemplateProps, 'entityType'> {}

export interface OpportunityManagementTemplateProps
  extends Omit<EntityManagementTemplateProps, 'entityType'> {}

/**
 * Legacy support for template variants
 */
export type EntityTemplateVariant = 'ORGANIZATION' | 'CONTACT' | 'PRODUCT' | 'OPPORTUNITY'

/**
 * Props transformation result
 */
export interface TransformedProps {
  pageLayoutProps: PageLayoutProps
  warnings: string[]
  usedFeatures: string[]
}
