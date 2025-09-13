import React from 'react'
import { PageContainer } from '@/components/layout'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { Plus } from 'lucide-react'
import { COPY } from '@/lib/copy'
import { useResponsiveTokens } from '@/hooks/tokens'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import { cn } from '@/lib/utils'

interface EntityManagementTemplateProps {
  // Entity info
  entityType: keyof typeof COPY.ENTITIES
  entityCount: number

  // Actions
  onAddClick: () => void
  children: React.ReactNode

  // Optional customization (can override derived values)
  title?: string
  subtitle?: string
  addButtonLabel?: string
  headerActions?: React.ReactNode
  className?: string
}

/**
 * Helper function to derive page title and subtitle from entity type
 */
const getEntityPageCopy = (entityType: keyof typeof COPY.ENTITIES) => {
  const titleKey = `${entityType}S_TITLE` as keyof typeof COPY.PAGES
  const subtitleKey = `${entityType}S_SUBTITLE` as keyof typeof COPY.PAGES
  const addButtonKey = `ADD_${entityType}` as keyof typeof COPY.BUTTONS

  return {
    title: COPY.PAGES[titleKey] || `Manage ${COPY.ENTITIES[entityType]}s`,
    subtitle: COPY.PAGES[subtitleKey] || `Manage your ${COPY.ENTITIES[entityType].toLowerCase()}s`,
    addButtonLabel: COPY.BUTTONS[addButtonKey] || `Add ${COPY.ENTITIES[entityType]}`,
  }
}

/**
 * Template component for entity management pages following atomic design principles.
 * This template provides consistent layout and behavior across all CRUD pages.
 *
 * @deprecated This template-based layout system is deprecated.
 * Please migrate to the new slot-based PageLayout system for 5-10x faster development.
 *
 * Migration guide: /src/components/layout/MIGRATION.md
 * Interactive examples: Run `npm run storybook`
 *
 * Quick migration with usePageLayout hook:
 * ```tsx
 * const { pageLayoutProps } = usePageLayout({
 *   entityType: 'ORGANIZATION',
 *   entityCount: items.length,
 *   onAddClick: openDialog,
 * })
 * return <PageLayout {...pageLayoutProps}>{children}</PageLayout>
 * ```
 *
 * Atomic Design Level: Template
 * - Uses PageHeader v2 for consistent header implementation
 * - Provides consistent structure for all entity management pages
 * - Handles common patterns like add buttons and page containers
 */
export const EntityManagementTemplate: React.FC<EntityManagementTemplateProps> = ({
  entityType,
  entityCount,
  title: customTitle,
  subtitle: customSubtitle,
  onAddClick,
  children,
  addButtonLabel: customAddButtonLabel,
  headerActions,
  className = '',
}) => {
  // Development deprecation warning
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '🚨 EntityManagementTemplate is deprecated!\n' +
          '📚 Migration guide: /src/components/layout/MIGRATION.md\n' +
          '🔗 Interactive examples: npm run storybook\n' +
          '⚡ Quick migration: Use usePageLayout hook for 5-10x faster development'
      )
    }
  }, [])

  const { spacing, typography } = useResponsiveTokens()
  const derivedCopy = getEntityPageCopy(entityType)

  const title = customTitle || derivedCopy.title
  const subtitle = customSubtitle || derivedCopy.subtitle
  const buttonLabel = customAddButtonLabel || derivedCopy.addButtonLabel

  // Compose actions array for PageHeader
  const actions = []

  // Add custom header actions if provided
  if (headerActions) {
    actions.push({
      type: 'custom' as const,
      component: headerActions,
    })
  }

  // Add the primary add button
  actions.push({
    type: 'button' as const,
    label: buttonLabel,
    onClick: onAddClick,
    icon: <Plus className="size-4" />,
    'aria-label': `Create new ${COPY.ENTITIES[entityType].toLowerCase()}`,
  })

  // Custom actions renderer for mixed content
  const renderActions = () => (
    <div className={cn('flex items-center', spacing.gap)}>
      {headerActions}
      <button
        onClick={onAddClick}
        className={cn(
          'focus-ring inline-flex h-9 items-center justify-center whitespace-nowrap transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          semanticSpacing.compact,
          semanticTypography.navItem,
          'rounded-md shadow'
        )}
        aria-label={`Create new ${COPY.ENTITIES[entityType].toLowerCase()}`}
      >
        <Plus className="size-4" />
        {buttonLabel}
      </button>
    </div>
  )

  return (
    <div className={cn('min-h-screen', className)}>
      <PageContainer>
        <PageHeader
          title={title}
          subtitle={subtitle}
          meta={<span className={semanticTypography.entityMeta}>({entityCount})</span>}
          actions={renderActions()}
        />

        {/* Entity Content - Organism level components (tables, forms, etc.) */}
        <div className={semanticSpacing.section.md}>{children}</div>
      </PageContainer>
    </div>
  )
}

/**
 * Specialized template variants for common entity types
 * These provide pre-configured templates with appropriate copy automatically derived
 */

interface OrganizationManagementTemplateProps
  extends Omit<EntityManagementTemplateProps, 'entityType'> {}

export const OrganizationManagementTemplate: React.FC<OrganizationManagementTemplateProps> = (
  props
) => <EntityManagementTemplate {...props} entityType="ORGANIZATION" />

interface ContactManagementTemplateProps
  extends Omit<EntityManagementTemplateProps, 'entityType'> {}

export const ContactManagementTemplate: React.FC<ContactManagementTemplateProps> = (props) => (
  <EntityManagementTemplate {...props} entityType="CONTACT" />
)

interface ProductManagementTemplateProps
  extends Omit<EntityManagementTemplateProps, 'entityType'> {}

export const ProductManagementTemplate: React.FC<ProductManagementTemplateProps> = (props) => (
  <EntityManagementTemplate {...props} entityType="PRODUCT" />
)

interface OpportunityManagementTemplateProps
  extends Omit<EntityManagementTemplateProps, 'entityType'> {}

export const OpportunityManagementTemplate: React.FC<OpportunityManagementTemplateProps> = (
  props
) => <EntityManagementTemplate {...props} entityType="OPPORTUNITY" />
