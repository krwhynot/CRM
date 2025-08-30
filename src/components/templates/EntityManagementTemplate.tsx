import React from 'react'
import { PageContainer } from '@/components/layout'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { Plus } from 'lucide-react'
import { COPY } from '@/lib/copy'

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
    addButtonLabel: COPY.BUTTONS[addButtonKey] || `Add ${COPY.ENTITIES[entityType]}`
  }
}

/**
 * Template component for entity management pages following atomic design principles.
 * This template provides consistent layout and behavior across all CRUD pages.
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
  className = ""
}) => {
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
      component: headerActions
    })
  }
  
  // Add the primary add button
  actions.push({
    type: 'button' as const,
    label: buttonLabel,
    onClick: onAddClick,
    icon: <Plus className="size-4" />,
    'aria-label': `Create new ${COPY.ENTITIES[entityType].toLowerCase()}`
  })

  // Custom actions renderer for mixed content
  const renderActions = () => (
    <div className="flex items-center gap-2">
      {headerActions}
      <button
        onClick={onAddClick}
        className="focus-ring inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
        aria-label={`Create new ${COPY.ENTITIES[entityType].toLowerCase()}`}
      >
        <Plus className="size-4" />
        {buttonLabel}
      </button>
    </div>
  )

  return (
    <div className={`min-h-screen ${className}`}>
      <PageContainer>
        <PageHeader 
          title={title}
          subtitle={subtitle}
          meta={<span className="text-sm text-muted-foreground">({entityCount})</span>}
          actions={renderActions()}
        />
        
        {/* Entity Content - Organism level components (tables, forms, etc.) */}
        <div className="mt-6">
          {children}
        </div>
      </PageContainer>
    </div>
  )
}

/**
 * Specialized template variants for common entity types
 * These provide pre-configured templates with appropriate copy automatically derived
 */

interface OrganizationManagementTemplateProps extends Omit<EntityManagementTemplateProps, 'entityType'> {
}

export const OrganizationManagementTemplate: React.FC<OrganizationManagementTemplateProps> = (props) => (
  <EntityManagementTemplate
    {...props}
    entityType="ORGANIZATION"
  />
)

interface ContactManagementTemplateProps extends Omit<EntityManagementTemplateProps, 'entityType'> {
}

export const ContactManagementTemplate: React.FC<ContactManagementTemplateProps> = (props) => (
  <EntityManagementTemplate
    {...props}
    entityType="CONTACT"
  />
)

interface ProductManagementTemplateProps extends Omit<EntityManagementTemplateProps, 'entityType'> {
}

export const ProductManagementTemplate: React.FC<ProductManagementTemplateProps> = (props) => (
  <EntityManagementTemplate
    {...props}
    entityType="PRODUCT"
  />
)

interface OpportunityManagementTemplateProps extends Omit<EntityManagementTemplateProps, 'entityType'> {
}

export const OpportunityManagementTemplate: React.FC<OpportunityManagementTemplateProps> = (props) => (
  <EntityManagementTemplate
    {...props}
    entityType="OPPORTUNITY"
  />
)