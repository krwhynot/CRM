/**
 * Organizations List Layout Definition
 *
 * Advanced reusable layout definition for organizations list views that can be
 * used across different contexts (full page, modals, widgets, embedded components).
 *
 * This layout showcases the full power of the schema-driven system with:
 * - Multiple layout variants for different use cases
 * - Complex organizational relationships and hierarchies
 * - Advanced filtering and search capabilities
 * - Responsive design patterns
 * - Performance optimizations including auto-virtualization
 */

import type {
  OrganizationLayoutConfig,
  SlotConfiguration,
  ResponsiveBreakpoints,
} from '@/types/layout/schema.types'
import type { Database } from '@/lib/database.types'
import { FOOD_SERVICE_SEGMENTS } from '@/types/organization.types'
import { organizationFiltersSchema } from '@/pages/Organizations.schema'

/**
 * Base responsive breakpoints used across all organization layouts
 */
export const organizationBreakpoints: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1024,
  laptop: 1280,
  desktop: 1920,
}

/**
 * Base slot configurations that can be reused across variants
 */
export const organizationSlots = {
  /**
   * Header title slot - adaptable for different contexts
   */
  title: (context: 'page' | 'modal' | 'widget' = 'page'): SlotConfiguration => ({
    id: 'header-title',
    type: 'title',
    name: 'organization-title',
    displayName: 'Organizations Title',
    required: true,
    multiple: false,
    defaultComponent: context === 'widget' ? 'WidgetTitle' : 'PageTitle',
    props: {
      text: context === 'widget' ? 'Organizations' : 'Organizations',
      level: context === 'modal' ? 2 : 1,
      className: context === 'widget'
        ? 'text-lg font-medium text-gray-900'
        : 'text-2xl font-semibold text-gray-900',
      showIcon: context !== 'widget',
      icon: 'Building2',
      contextual: true,
    },
    responsive: {
      mobile: { visible: true, size: context === 'widget' ? 'md' : 'lg' },
      tablet: { visible: true, size: context === 'widget' ? 'lg' : 'xl' },
      laptop: { visible: true, size: 'xl' },
      desktop: { visible: true, size: 'xl' },
    },
  }),

  /**
   * Subtitle slot - contextual information
   */
  subtitle: (context: 'page' | 'modal' | 'widget' = 'page'): SlotConfiguration => ({
    id: 'header-subtitle',
    type: 'subtitle',
    name: 'organization-subtitle',
    displayName: 'Organizations Subtitle',
    required: false,
    multiple: false,
    defaultComponent: 'ContextualSubtitle',
    props: {
      text: context === 'widget'
        ? 'Business relationships'
        : 'Manage business relationships across your distribution network',
      className: 'text-sm text-gray-600',
      contextual: true,
      showFilterSummary: context === 'page',
    },
    responsive: {
      mobile: { visible: context === 'widget' },
      tablet: { visible: true },
      laptop: { visible: true },
      desktop: { visible: true },
    },
  }),

  /**
   * Meta information slot - statistics and summaries
   */
  meta: (context: 'page' | 'modal' | 'widget' = 'page'): SlotConfiguration => ({
    id: 'header-meta',
    type: 'meta',
    name: 'organization-meta',
    displayName: 'Organization Statistics',
    required: false,
    multiple: true,
    allowedComponents: context === 'widget'
      ? ['OrganizationCount']
      : [
          'OrganizationCount',
          'FilterSummaryBadges',
          'PriorityBreakdown',
          'TypeDistribution',
          'GeographicSummary'
        ],
    props: {
      showActiveFilters: context === 'page',
      showPriorityBreakdown: context !== 'widget',
      showTypeDistribution: context === 'page',
      showGeographicSummary: context === 'page',
      compact: context === 'widget',
    },
    responsive: {
      mobile: { visible: context === 'widget' },
      tablet: { visible: true, size: 'auto' },
      laptop: { visible: true, size: 'auto' },
      desktop: { visible: true, size: 'auto' },
    },
  }),

  /**
   * Actions slot - context-appropriate actions
   */
  actions: (context: 'page' | 'modal' | 'widget' = 'page'): SlotConfiguration => ({
    id: 'header-actions',
    type: 'actions',
    name: 'organization-actions',
    displayName: 'Organization Actions',
    required: false,
    multiple: true,
    allowedComponents: context === 'widget'
      ? ['ViewAllButton']
      : context === 'modal'
      ? ['AddOrganizationButton', 'CloseModalButton']
      : [
          'AddOrganizationButton',
          'BulkActionsMenu',
          'ImportOrganizationsButton',
          'ExportOrganizationsButton',
          'ViewToggle',
          'SettingsMenu'
        ],
    defaultComponent: context === 'widget' ? 'ViewAllButton' : 'AddOrganizationButton',
    props: {
      variant: 'primary',
      size: context === 'widget' ? 'sm' : 'md',
      showLabels: context !== 'widget',
      groupActions: context === 'page',
      contextualActions: context === 'page',
      compact: context === 'widget',
    },
    responsive: {
      mobile: { visible: true, size: 'sm', alignment: 'end' },
      tablet: { visible: true, size: context === 'widget' ? 'sm' : 'md' },
      laptop: { visible: true, size: 'md' },
      desktop: { visible: true, size: 'md' },
    },
  }),

  /**
   * Filter sidebar slot - adaptive filtering
   */
  filters: (context: 'page' | 'modal' | 'widget' = 'page'): SlotConfiguration => ({
    id: 'filter-sidebar',
    type: 'filters',
    name: 'organization-filters',
    displayName: 'Organization Filters',
    required: false,
    multiple: false,
    defaultComponent: context === 'widget' ? 'CompactFilters' : 'SchemaFilterSidebar',
    props: {
      schemaConfig: context === 'widget'
        ? {
            ...organizationFiltersSchema,
            groups: organizationFiltersSchema.groups.slice(0, 2), // Only search and type
          }
        : organizationFiltersSchema,
      persistFilters: context === 'page',
      showFilterCount: true,
      enableQuickFilters: context !== 'widget',
      quickFilters: context === 'widget' ? [] : [
        { label: 'All', filter: {} },
        { label: 'High Priority', filter: { priority: ['A+', 'A'] } },
        { label: 'Customers', filter: { type: 'customer' } },
        { label: 'Distributors', filter: { type: 'distributor' } },
      ],
      enableSavedFilters: context === 'page',
      enableFilterPresets: context === 'page',
      compact: context === 'widget',
    },
    responsive: {
      mobile: { visible: context !== 'widget', size: 'auto' },
      tablet: { visible: context !== 'widget', size: 'md' },
      laptop: { visible: true, size: context === 'widget' ? 'sm' : 'lg' },
      desktop: { visible: true, size: context === 'widget' ? 'sm' : 'lg' },
    },
  }),

  /**
   * Search slot - intelligent search with suggestions
   */
  search: (context: 'page' | 'modal' | 'widget' = 'page'): SlotConfiguration => ({
    id: 'content-search',
    type: 'search',
    name: 'organization-search',
    displayName: 'Organization Search',
    required: false,
    multiple: false,
    defaultComponent: context === 'widget' ? 'SimpleSearch' : 'SmartSearch',
    props: {
      placeholder: context === 'widget'
        ? 'Search...'
        : 'Search organizations by name, location, segment...',
      searchFields: [
        'name',
        'segment',
        'city',
        'state_province',
        'phone',
        'primary_manager_name',
      ],
      debounceMs: 300,
      enableSuggestions: context !== 'widget',
      suggestionTypes: context === 'widget' ? [] : ['name', 'segment', 'location'],
      enableRecentSearches: context === 'page',
      enableSearchHistory: context === 'page',
      compact: context === 'widget',
    },
    responsive: {
      mobile: { visible: true, size: 'auto' },
      tablet: { visible: true, size: 'auto' },
      laptop: { visible: true, size: 'auto' },
      desktop: { visible: true, size: 'auto' },
    },
  }),

  /**
   * Main content slot - adaptive table with performance optimizations
   */
  content: (context: 'page' | 'modal' | 'widget' = 'page'): SlotConfiguration => ({
    id: 'main-content',
    type: 'content',
    name: 'organization-content',
    displayName: 'Organizations Table',
    required: true,
    multiple: false,
    defaultComponent: 'OrganizationsDataDisplay',
    props: {
      // Adaptive virtualization based on context
      enableVirtualization: context === 'widget' ? false : 'auto',
      virtualizationThreshold: context === 'modal' ? 100 : 500,

      // Feature toggles based on context
      enableBulkSelection: context === 'page',
      enableColumnResizing: context === 'page',
      enableColumnReordering: context === 'page',
      enableSorting: true,
      enableRowExpansion: context !== 'widget',
      enableDensityToggle: context === 'page',

      // Default configuration
      defaultSort: { field: 'name', order: 'asc' },
      defaultDensity: context === 'widget' ? 'compact' : 'normal',
      defaultPageSize: context === 'widget' ? 10 : context === 'modal' ? 25 : 50,

      // Context-specific features
      showExpandedContent: context !== 'widget',
      enableInlineEditing: false,
      enableRowActions: context !== 'widget',
      enableContextMenu: context === 'page',

      // Relationship display
      showOrganizationalHierarchy: context === 'page',
      showDistributorRelationships: context !== 'widget',
      showPrincipalRelationships: context !== 'widget',

      // Performance optimizations
      enableMemoization: true,
      enableLazyLoading: context !== 'widget',
      enableProgressiveEnhancement: context === 'page',

      // Context-specific styling
      compact: context === 'widget',
      embedded: context === 'modal' || context === 'widget',
    },
    responsive: {
      mobile: { visible: true, size: 'auto' },
      tablet: { visible: true, size: 'auto' },
      laptop: { visible: true, size: 'auto' },
      desktop: { visible: true, size: 'auto' },
    },
  }),
} as const

/**
 * Layout variant interface
 */
interface LayoutVariant<T> {
  id: string
  name: string
  description: string
  context: 'page' | 'modal' | 'widget'
  create: (overrides?: Partial<T>) => T
}

/**
 * Layout variants for different use cases
 */
export const organizationLayoutVariants: Record<string, LayoutVariant<OrganizationLayoutConfig>> = {
  /**
   * Full page layout - comprehensive feature set
   */
  fullPage: {
    id: 'organizations-full-page',
    name: 'Organizations Full Page',
    description: 'Complete organizations management interface with all features',
    context: 'page',

    create: (overrides: Partial<OrganizationLayoutConfig> = {}): OrganizationLayoutConfig => ({
      id: 'organizations-full-page',
      name: 'Organizations Full Page Layout',
      version: '1.0.0',
      type: 'slots',
      entityType: 'organizations',

      metadata: {
        displayName: 'Full Page Organizations',
        description: 'Complete organizations management with advanced filtering and features',
        category: 'default',
        tags: ['organizations', 'full-featured', 'advanced-filters', 'responsive'],
        isShared: false,
        isDefault: true,
        createdBy: 'Layout System',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        ...(overrides.metadata || {}),
      },

      entitySpecific: {
        typeFilters: [] as Database['public']['Enums']['organization_type'][],
        priorityLevels: ['A+', 'A', 'B', 'C', 'D'],
        segmentOptions: [...FOOD_SERVICE_SEGMENTS],
        organizationalHierarchy: true,
        distributorRelationships: true,
        principalRelationships: true,
        ...(overrides.entitySpecific || {}),
      },

      structure: {
        slots: [
          organizationSlots.title('page'),
          organizationSlots.subtitle('page'),
          organizationSlots.meta('page'),
          organizationSlots.actions('page'),
          organizationSlots.filters('page'),
          organizationSlots.search('page'),
          organizationSlots.content('page'),
        ],
        composition: {
          requiredSlots: ['header-title', 'main-content'],
          slotOrder: [
            'header-title',
            'header-subtitle',
            'header-meta',
            'header-actions',
            'content-search',
            'filter-sidebar',
            'main-content',
          ],
          inheritance: {
            inheritsFrom: 'base-entity-layout',
            overrides: ['main-content', 'filter-sidebar', 'header-meta'],
            merge: ['header-actions', 'content-search'],
          },
          validation: {
            required: ['header-title', 'main-content'],
            dependencies: {
              'filter-sidebar': ['main-content'],
              'content-search': ['main-content'],
              'header-meta': ['main-content'],
            },
            conflicts: {},
            custom: [],
          },
        },
        responsive: {
          breakpoints: organizationBreakpoints,
          mobileFirst: true,
          adaptiveLayout: true,
        },
        ...(overrides.structure || {}),
      },

      ...(overrides || {}),
    }),
  },

  /**
   * Modal layout - focused subset for dialogs
   */
  modal: {
    id: 'organizations-modal',
    name: 'Organizations Modal',
    description: 'Organizations list for selection dialogs and modals',
    context: 'modal',

    create: (overrides: Partial<OrganizationLayoutConfig> = {}): OrganizationLayoutConfig => ({
      id: 'organizations-modal',
      name: 'Organizations Modal Layout',
      version: '1.0.0',
      type: 'slots',
      entityType: 'organizations',

      metadata: {
        displayName: 'Modal Organizations',
        description: 'Organizations list optimized for modal dialogs',
        category: 'template',
        tags: ['organizations', 'modal', 'selection', 'compact'],
        isShared: true,
        isDefault: false,
        createdBy: 'Layout System',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        ...(overrides.metadata || {}),
      },

      entitySpecific: {
        typeFilters: [] as Database['public']['Enums']['organization_type'][],
        priorityLevels: ['A+', 'A', 'B', 'C', 'D'],
        segmentOptions: [...FOOD_SERVICE_SEGMENTS],
        organizationalHierarchy: false,
        distributorRelationships: false,
        principalRelationships: false,
        ...(overrides.entitySpecific || {}),
      },

      structure: {
        slots: [
          organizationSlots.title('modal'),
          organizationSlots.actions('modal'),
          organizationSlots.search('modal'),
          organizationSlots.content('modal'),
        ],
        composition: {
          requiredSlots: ['header-title', 'main-content'],
          slotOrder: [
            'header-title',
            'header-actions',
            'content-search',
            'main-content',
          ],
          inheritance: {
            inheritsFrom: 'base-modal-layout',
            overrides: ['main-content'],
            merge: ['header-actions'],
          },
          validation: {
            required: ['header-title', 'main-content'],
            dependencies: {
              'content-search': ['main-content'],
            },
            conflicts: {},
            custom: [],
          },
        },
        responsive: {
          breakpoints: organizationBreakpoints,
          mobileFirst: true,
          adaptiveLayout: true,
        },
        ...(overrides.structure || {}),
      },

      ...(overrides || {}),
    }),
  },

  /**
   * Widget layout - minimal dashboard component
   */
  widget: {
    id: 'organizations-widget',
    name: 'Organizations Widget',
    description: 'Compact organizations widget for dashboards',
    context: 'widget',

    create: (overrides: Partial<OrganizationLayoutConfig> = {}): OrganizationLayoutConfig => ({
      id: 'organizations-widget',
      name: 'Organizations Widget Layout',
      version: '1.0.0',
      type: 'slots',
      entityType: 'organizations',

      metadata: {
        displayName: 'Organizations Widget',
        description: 'Compact organizations display for dashboard widgets',
        category: 'template',
        tags: ['organizations', 'widget', 'dashboard', 'minimal'],
        isShared: true,
        isDefault: false,
        createdBy: 'Layout System',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        ...(overrides.metadata || {}),
      },

      entitySpecific: {
        typeFilters: [] as Database['public']['Enums']['organization_type'][],
        priorityLevels: ['A+', 'A', 'B', 'C', 'D'],
        segmentOptions: [...FOOD_SERVICE_SEGMENTS],
        organizationalHierarchy: false,
        distributorRelationships: false,
        principalRelationships: false,
        ...(overrides.entitySpecific || {}),
      },

      structure: {
        slots: [
          organizationSlots.title('widget'),
          organizationSlots.subtitle('widget'),
          organizationSlots.meta('widget'),
          organizationSlots.actions('widget'),
          organizationSlots.content('widget'),
        ],
        composition: {
          requiredSlots: ['header-title', 'main-content'],
          slotOrder: [
            'header-title',
            'header-subtitle',
            'header-meta',
            'header-actions',
            'main-content',
          ],
          inheritance: {
            inheritsFrom: 'base-widget-layout',
            overrides: ['main-content'],
            merge: [],
          },
          validation: {
            required: ['header-title', 'main-content'],
            dependencies: {},
            conflicts: {},
            custom: [],
          },
        },
        responsive: {
          breakpoints: organizationBreakpoints,
          mobileFirst: true,
          adaptiveLayout: true,
        },
        ...(overrides.structure || {}),
      },

      ...(overrides || {}),
    }),
  },
} as const

/**
 * Factory function to create organization layouts
 */
export function createOrganizationLayout(
  variant: keyof typeof organizationLayoutVariants = 'fullPage',
  overrides: Partial<OrganizationLayoutConfig> = {}
): OrganizationLayoutConfig {
  const layoutVariant = organizationLayoutVariants[variant]
  if (!layoutVariant) {
    throw new Error(`Unknown organization layout variant: ${variant}`)
  }

  return layoutVariant.create(overrides)
}

/**
 * Get organization layout for specific context
 */
export function getOrganizationLayoutForContext(
  context: 'page' | 'modal' | 'widget' | 'embedded',
  overrides: Partial<OrganizationLayoutConfig> = {}
): OrganizationLayoutConfig {
  switch (context) {
    case 'page':
      return createOrganizationLayout('fullPage', overrides)
    case 'modal':
    case 'embedded':
      return createOrganizationLayout('modal', overrides)
    case 'widget':
      return createOrganizationLayout('widget', overrides)
    default:
      return createOrganizationLayout('fullPage', overrides)
  }
}

/**
 * Utility functions for layout customization
 */
export const organizationLayoutUtils = {
  /**
   * Enable/disable virtualization based on data size
   */
  configureVirtualization: (
    layout: OrganizationLayoutConfig,
    dataSize: number,
    forceEnable = false
  ): OrganizationLayoutConfig => {
    const contentSlot = layout.structure.slots.find(slot => slot.id === 'main-content')
    if (contentSlot) {
      contentSlot.props = {
        ...contentSlot.props,
        enableVirtualization: forceEnable || dataSize >= 500 ? true : 'auto',
        virtualizationThreshold: Math.min(dataSize / 2, 500),
      }
    }
    return layout
  },

  /**
   * Configure filters for specific use cases
   */
  configureFilters: (
    layout: OrganizationLayoutConfig,
    enabledGroups: string[]
  ): OrganizationLayoutConfig => {
    const filterSlot = layout.structure.slots.find(slot => slot.id === 'filter-sidebar')
    if (filterSlot?.props?.schemaConfig) {
      filterSlot.props.schemaConfig = {
        ...filterSlot.props.schemaConfig,
        groups: filterSlot.props.schemaConfig.groups.filter((group: any) =>
          enabledGroups.includes(group.id)
        ),
      }
    }
    return layout
  },

  /**
   * Set responsive behavior
   */
  configureResponsive: (
    layout: OrganizationLayoutConfig,
    mobileOptimized = true
  ): OrganizationLayoutConfig => {
    if (mobileOptimized) {
      layout.structure.slots.forEach(slot => {
        if (slot.responsive?.mobile) {
          slot.responsive.mobile.visible = true
        }
      })
    }
    return layout
  },
} as const

// Export default layouts
export const defaultOrganizationLayouts = {
  page: createOrganizationLayout('fullPage'),
  modal: createOrganizationLayout('modal'),
  widget: createOrganizationLayout('widget'),
} as const

// Export for use in other modules
export default organizationLayoutVariants