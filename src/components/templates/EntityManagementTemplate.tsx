import React from 'react'
import { PageContainer } from '@/components/layout'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { COPY } from '@/lib/copy'

interface EntityManagementTemplateProps {
  // Entity info
  entityType: keyof typeof COPY.ENTITIES
  entityCount: number
  
  // Page content
  title: string
  subtitle: string
  
  // Actions
  onAddClick: () => void
  children: React.ReactNode
  
  // Optional customization
  addButtonLabel?: string
  headerActions?: React.ReactNode
  className?: string
}

/**
 * Template component for entity management pages following atomic design principles.
 * This template provides consistent layout and behavior across all CRUD pages.
 * 
 * Atomic Design Level: Template
 * - Combines organisms (PageHeader, entity tables) into page layouts
 * - Provides consistent structure for all entity management pages
 * - Handles common patterns like add buttons and page containers
 */
export const EntityManagementTemplate: React.FC<EntityManagementTemplateProps> = ({
  entityType,
  entityCount,
  title,
  subtitle,
  onAddClick,
  children,
  addButtonLabel,
  headerActions,
  className = ""
}) => {
  const defaultAddLabel = `${COPY.BUTTONS.ADD_ORGANIZATION.replace('Organization', COPY.ENTITIES[entityType])}`
  const buttonLabel = addButtonLabel || defaultAddLabel

  return (
    <div className={`min-h-screen ${className}`}>
      <PageContainer>
        {/* Page Header - Organism level component */}
        <div className="flex items-center justify-between">
          <PageHeader 
            title={title}
            subtitle={subtitle}
            count={entityCount}
          />
          
          <div className="flex items-center gap-2">
            {headerActions}
            <Button 
              onClick={onAddClick}
              className="ml-6 focus-ring"
            >
              <Plus className="h-4 w-4 mr-2" />
              {buttonLabel}
            </Button>
          </div>
        </div>
        
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
 * These provide pre-configured templates with appropriate copy and styling
 */

interface OrganizationManagementTemplateProps extends Omit<EntityManagementTemplateProps, 'entityType' | 'title' | 'subtitle'> {
}

export const OrganizationManagementTemplate: React.FC<OrganizationManagementTemplateProps> = (props) => (
  <EntityManagementTemplate
    {...props}
    entityType="ORGANIZATION"
    title={COPY.PAGES.ORGANIZATIONS_TITLE}
    subtitle={COPY.PAGES.ORGANIZATIONS_SUBTITLE}
  />
)

interface ContactManagementTemplateProps extends Omit<EntityManagementTemplateProps, 'entityType' | 'title' | 'subtitle'> {
}

export const ContactManagementTemplate: React.FC<ContactManagementTemplateProps> = (props) => (
  <EntityManagementTemplate
    {...props}
    entityType="CONTACT"
    title={COPY.PAGES.CONTACTS_TITLE}
    subtitle={COPY.PAGES.CONTACTS_SUBTITLE}
  />
)

interface ProductManagementTemplateProps extends Omit<EntityManagementTemplateProps, 'entityType' | 'title' | 'subtitle'> {
}

export const ProductManagementTemplate: React.FC<ProductManagementTemplateProps> = (props) => (
  <EntityManagementTemplate
    {...props}
    entityType="PRODUCT"
    title={COPY.PAGES.PRODUCTS_TITLE}
    subtitle={COPY.PAGES.PRODUCTS_SUBTITLE}
  />
)

interface OpportunityManagementTemplateProps extends Omit<EntityManagementTemplateProps, 'entityType' | 'title' | 'subtitle'> {
}

export const OpportunityManagementTemplate: React.FC<OpportunityManagementTemplateProps> = (props) => (
  <EntityManagementTemplate
    {...props}
    entityType="OPPORTUNITY"
    title={COPY.PAGES.OPPORTUNITIES_TITLE}
    subtitle={COPY.PAGES.OPPORTUNITIES_SUBTITLE}
  />
)