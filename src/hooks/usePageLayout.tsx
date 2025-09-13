import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COPY } from '@/lib/copy'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import { cn } from '@/lib/utils'
import type { PageLayoutProps } from '@/components/layout/PageLayout.types'

/**
 * Entity types that can be used for auto-deriving page content
 */
export type EntityType = keyof typeof COPY.ENTITIES

/**
 * Configuration for the page layout hook
 */
export interface UsePageLayoutConfig {
  /** Entity type for auto-deriving titles and labels */
  entityType?: EntityType
  /** Entity count for meta display */
  entityCount?: number
  /** Add button click handler */
  onAddClick?: () => void

  /** Override auto-derived title */
  customTitle?: React.ReactNode
  /** Override auto-derived subtitle */
  customSubtitle?: React.ReactNode
  /** Override auto-derived add button label */
  customAddButtonLabel?: string

  /** Additional header actions to include */
  headerActions?: React.ReactNode
  /** Filter content for sidebar */
  filters?: React.ReactNode
  /** Enable filter sidebar */
  withFilterSidebar?: boolean
}

/**
 * Return type for usePageLayout hook
 */
export interface UsePageLayoutReturn {
  /** Computed page layout props ready for PageLayout component */
  pageLayoutProps: PageLayoutProps
  /** Utility functions for building slot content */
  slotBuilders: {
    /** Create a standard add button */
    buildAddButton: (onClick: () => void, label?: string) => React.ReactNode
    /** Create entity count meta display */
    buildEntityMeta: (count: number, label?: string) => React.ReactNode
    /** Combine multiple actions with consistent spacing */
    buildActionGroup: (...actions: React.ReactNode[]) => React.ReactNode
  }
  /** Migration helpers for converting template props */
  migrationHelpers: {
    /** Convert headerActions prop to slot format */
    convertHeaderActions: (headerActions?: React.ReactNode) => React.ReactNode
    /** Convert entity template props to PageLayout props */
    convertTemplateProps: (templateProps: any) => Partial<PageLayoutProps>
  }
}

/**
 * Helper function to derive page copy from entity type
 */
const getEntityPageCopy = (entityType: EntityType) => {
  // Handle pluralization for page titles
  const titleKey = `${entityType}S_TITLE` as keyof typeof COPY.PAGES
  const subtitleKey = `${entityType}S_SUBTITLE` as keyof typeof COPY.PAGES
  const addButtonKey = `ADD_${entityType}` as keyof typeof COPY.BUTTONS

  // Fallback to constructing from entity name if not in COPY.PAGES
  const entityName = COPY.ENTITIES[entityType]
  const pluralName =
    COPY.ENTITIES[`${entityType}S` as keyof typeof COPY.ENTITIES] || `${entityName}s`

  return {
    title: (COPY as any).PAGES?.[titleKey] || `Manage ${pluralName}`,
    subtitle: (COPY as any).PAGES?.[subtitleKey] || `Manage your ${pluralName.toLowerCase()}`,
    addButtonLabel: COPY.BUTTONS[addButtonKey] || `Add ${entityName}`,
  }
}

/**
 * Page Layout Hook
 *
 * Migration utility hook that eases the transition from EntityManagementTemplate
 * to PageLayout by providing auto-derivation of common patterns and slot builders.
 *
 * Features:
 * - Auto-derive titles, subtitles, and button labels from entity type
 * - Build common slot content with consistent styling
 * - Migration helpers for converting template props
 * - TypeScript-first with full type safety
 *
 * @example
 * ```tsx
 * const { pageLayoutProps, slotBuilders } = usePageLayout({
 *   entityType: 'ORGANIZATION',
 *   entityCount: organizations.length,
 *   onAddClick: openCreateDialog,
 *   headerActions: <ExportButton />,
 *   filters: <OrganizationFilters />,
 *   withFilterSidebar: true,
 * })
 *
 * return (
 *   <PageLayout {...pageLayoutProps}>
 *     <OrganizationTable />
 *   </PageLayout>
 * )
 * ```
 */
export function usePageLayout(config: UsePageLayoutConfig = {}): UsePageLayoutReturn {
  const {
    entityType,
    entityCount,
    onAddClick,
    customTitle,
    customSubtitle,
    customAddButtonLabel,
    headerActions,
    filters,
    withFilterSidebar = false,
  } = config

  // Derive page copy from entity type
  const derivedCopy = React.useMemo(() => {
    if (!entityType) return null
    return getEntityPageCopy(entityType)
  }, [entityType])

  // Slot builders for common patterns
  const slotBuilders = React.useMemo(() => {
    const buildAddButton = (onClick: () => void, label?: string): React.ReactNode => {
      const buttonLabel = label || derivedCopy?.addButtonLabel || 'Add'
      const ariaLabel = entityType
        ? `Create new ${COPY.ENTITIES[entityType].toLowerCase()}`
        : 'Create new item'

      return (
        <Button
          onClick={onClick}
          className={cn('inline-flex items-center justify-center', semanticSpacing.gap.xs)}
          aria-label={ariaLabel}
        >
          <Plus className="size-4" />
          {buttonLabel}
        </Button>
      )
    }

    const buildEntityMeta = (count: number, label?: string): React.ReactNode => {
      const displayLabel =
        label ||
        (entityType && count === 1
          ? COPY.ENTITIES[entityType].toLowerCase()
          : entityType
            ? COPY.ENTITIES[`${entityType}S` as keyof typeof COPY.ENTITIES]?.toLowerCase() ||
              `${COPY.ENTITIES[entityType].toLowerCase()}s`
            : 'items')

      return (
        <span className={cn(semanticTypography.body, 'text-muted-foreground')}>
          ({count} {count === 1 ? displayLabel.replace(/s$/, '') : displayLabel})
        </span>
      )
    }

    const buildActionGroup = (...actions: React.ReactNode[]): React.ReactNode => {
      return (
        <div className={cn('flex items-center', semanticSpacing.gap.sm)}>
          {actions.filter(Boolean)}
        </div>
      )
    }

    return {
      buildAddButton,
      buildEntityMeta,
      buildActionGroup,
    }
  }, [entityType, derivedCopy])

  // Migration helpers for converting from templates
  const migrationHelpers = React.useMemo(() => {
    return {
      /**
       * Convert headerActions prop to slot format
       */
      convertHeaderActions: (templateHeaderActions?: React.ReactNode) => {
        if (!templateHeaderActions || !onAddClick) return templateHeaderActions

        // If we have both headerActions and onAddClick, combine them
        const addButton = slotBuilders.buildAddButton(onAddClick, customAddButtonLabel)

        return slotBuilders.buildActionGroup(templateHeaderActions, addButton)
      },

      /**
       * Convert EntityManagementTemplate props to PageLayout props
       */
      convertTemplateProps: (templateProps: any): Partial<PageLayoutProps> => {
        const {
          entityType: propEntityType,
          entityCount: propEntityCount,
          onAddClick: propOnAddClick,
          title: propTitle,
          subtitle: propSubtitle,
          addButtonLabel: propAddButtonLabel,
          headerActions: propHeaderActions,
          ...rest
        } = templateProps

        const localEntityType = propEntityType || entityType
        const localCopy = localEntityType ? getEntityPageCopy(localEntityType) : null

        return {
          title: propTitle || customTitle || localCopy?.title || 'Page',
          subtitle: propSubtitle || customSubtitle || localCopy?.subtitle,
          meta:
            typeof propEntityCount === 'number'
              ? slotBuilders.buildEntityMeta(propEntityCount)
              : undefined,
          actions: migrationHelpers.convertHeaderActions(propHeaderActions),
          filters,
          withFilterSidebar,
          ...rest,
        }
      },
    }
  }, [
    entityType,
    onAddClick,
    customAddButtonLabel,
    customTitle,
    customSubtitle,
    filters,
    withFilterSidebar,
    slotBuilders,
  ])

  // Compute final page layout props
  const pageLayoutProps = React.useMemo((): PageLayoutProps => {
    const title = customTitle || derivedCopy?.title || 'Page'
    const subtitle = customSubtitle || derivedCopy?.subtitle
    const meta =
      typeof entityCount === 'number' ? slotBuilders.buildEntityMeta(entityCount) : undefined

    // Build actions slot
    let actions: React.ReactNode = headerActions

    if (onAddClick) {
      const addButton = slotBuilders.buildAddButton(onAddClick, customAddButtonLabel)

      if (headerActions) {
        actions = slotBuilders.buildActionGroup(headerActions, addButton)
      } else {
        actions = addButton
      }
    }

    return {
      title,
      subtitle,
      meta,
      actions,
      filters,
      withFilterSidebar,
      children: null, // Will be provided by component using the hook
    }
  }, [
    customTitle,
    customSubtitle,
    derivedCopy,
    entityCount,
    headerActions,
    onAddClick,
    customAddButtonLabel,
    filters,
    withFilterSidebar,
    slotBuilders,
  ])

  return {
    pageLayoutProps,
    slotBuilders,
    migrationHelpers,
  }
}
