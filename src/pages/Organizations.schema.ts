/**
 * Organizations Page Schema Configuration
 *
 * Layout-as-data schema for the Organizations page, implementing the most advanced
 * filter system and complex interactions as the culmination of the migration process.
 *
 * This configuration showcases the full capabilities of schema-driven layouts with:
 * - Complex organization-specific filters (priority, type, segment, distributor, principal)
 * - Advanced organizational relationship hierarchies
 * - Dynamic filtering with responsive behavior
 * - Auto-virtualization for 500+ organizations
 * - Schema-driven filter generation from Task 3.2
 */

import type {
  OrganizationLayoutConfig,
  SlotConfiguration,
  ConditionalExpression,
  ResponsiveBreakpoints,
} from '@/types/layout/schema.types'
import type {
  SchemaFilterConfig,
  FilterGroupConfig,
} from '@/lib/layout/filter-generator'
import type { Organization, OrganizationFilters, FoodServiceSegment } from '@/types/entities'
import type { Database } from '@/lib/database.types'
import { FOOD_SERVICE_SEGMENTS } from '@/types/organization.types'

/**
 * Standard responsive breakpoints for CRM consistency
 */
const standardBreakpoints: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1024,
  laptop: 1280,
  desktop: 1920,
}

/**
 * Advanced filter configuration for organizations using schema-driven generation
 * Leverages the enhanced FilterSidebar from Task 3.2
 */
const organizationFiltersSchema: SchemaFilterConfig = {
  layoutId: 'organizations-page-advanced',
  entityType: 'organizations',
  groups: [
    {
      id: 'search-group',
      title: 'Search & Quick Filters',
      priority: 1,
      defaultExpanded: true,
      fields: [
        {
          id: 'search',
          type: 'text',
          label: 'Search Organizations',
          placeholder: 'Search by name, segment, city, phone...',
        },
      ],
    },
    {
      id: 'classification-group',
      title: 'Organization Classification',
      priority: 2,
      defaultExpanded: true,
      fields: [
        {
          id: 'type',
          type: 'select',
          label: 'Organization Type',
          placeholder: 'Filter by type...',
          options: [
            { label: 'All Types', value: '' },
            { label: 'Customers', value: 'customer' },
            { label: 'Distributors', value: 'distributor' },
            { label: 'Principals', value: 'principal' },
            { label: 'Prospects', value: 'prospect' },
            { label: 'Vendors', value: 'vendor' },
          ],
        },
        {
          id: 'priority',
          type: 'multiselect',
          label: 'Priority Level',
          options: [
            { label: 'A+ (Top Priority)', value: 'A+' },
            { label: 'A (High Priority)', value: 'A' },
            { label: 'B (Medium Priority)', value: 'B' },
            { label: 'C (Low Priority)', value: 'C' },
            { label: 'D (Minimal)', value: 'D' },
          ],
        },
      ],
    },
    {
      id: 'business-group',
      title: 'Business Attributes',
      priority: 3,
      defaultExpanded: false,
      fields: [
        {
          id: 'segment',
          type: 'multiselect',
          label: 'Food Service Segment',
          placeholder: 'Select segments...',
          options: FOOD_SERVICE_SEGMENTS.map(segment => ({
            label: segment,
            value: segment,
          })),
        },
        {
          id: 'is_principal',
          type: 'boolean',
          label: 'Is Principal',
        },
        {
          id: 'is_distributor',
          type: 'boolean',
          label: 'Is Distributor',
        },
      ],
    },
    {
      id: 'location-group',
      title: 'Location & Geography',
      priority: 4,
      defaultExpanded: false,
      fields: [
        {
          id: 'state_province',
          type: 'multiselect',
          label: 'State/Province',
          placeholder: 'Select states...',
          options: [], // Would be populated dynamically
        },
        {
          id: 'country',
          type: 'select',
          label: 'Country',
          placeholder: 'Select country...',
          options: [
            { label: 'United States', value: 'United States' },
            { label: 'Canada', value: 'Canada' },
            { label: 'Mexico', value: 'Mexico' },
          ],
        },
      ],
    },
  ],
  responsive: {
    mobile: {
      collapsedByDefault: true,
      maxGroupsExpanded: 2,
      showGroupIcons: true,
    },
    desktop: {
      defaultWidth: 280,
      allowResize: true,
      showFilterCounts: true,
    },
  },
}

/**
 * Primary Organizations Page Layout Configuration
 *
 * Comprehensive layout showcasing advanced filtering, organizational hierarchies,
 * and complex business logic integration with full schema-driven capabilities.
 */
export const organizationsPageLayoutConfig: OrganizationLayoutConfig = {
  id: 'organizations-page-advanced',
  name: 'Organizations Page - Advanced Layout',
  version: '1.0.0',
  type: 'slots',
  entityType: 'organizations',

  metadata: {
    displayName: 'Advanced Organizations View',
    description: 'Comprehensive organizations management with advanced filtering, hierarchies, and business logic',
    category: 'default',
    tags: ['organizations', 'advanced-filters', 'hierarchies', 'responsive', 'auto-virtualization'],
    isShared: false,
    isDefault: true,
    lastUsed: new Date().toISOString(),
    usageCount: 0,
  },

  entitySpecific: {
    typeFilters: [] as Database['public']['Enums']['organization_type'][],
    priorityLevels: ['A+', 'A', 'B', 'C', 'D'],
    segmentOptions: [...FOOD_SERVICE_SEGMENTS],
    organizationalHierarchy: true,
    distributorRelationships: true,
    principalRelationships: true,
  },

  structure: {
    slots: [
      // Header Title Slot - Dynamic with entity count
      {
        id: 'header-title',
        type: 'title',
        name: 'page-title',
        displayName: 'Page Title',
        required: true,
        multiple: false,
        defaultComponent: 'PageTitle',
        props: {
          text: 'Organizations',
          level: 1,
          className: 'text-2xl font-semibold text-gray-900',
          showIcon: true,
          icon: 'Building2',
        },
        responsive: {
          mobile: { visible: true, size: 'lg' },
          tablet: { visible: true, size: 'xl' },
          laptop: { visible: true, size: 'xl' },
          desktop: { visible: true, size: 'xl' },
        },
      } as SlotConfiguration,

      // Header Subtitle with Dynamic Context
      {
        id: 'header-subtitle',
        type: 'subtitle',
        name: 'page-subtitle',
        displayName: 'Page Subtitle',
        required: false,
        multiple: false,
        defaultComponent: 'PageSubtitle',
        props: {
          text: 'Manage business relationships across your distribution network',
          className: 'text-sm text-gray-600',
          contextual: true, // Updates based on active filters
        },
        responsive: {
          mobile: { visible: false },
          tablet: { visible: true },
          laptop: { visible: true },
          desktop: { visible: true },
        },
      } as SlotConfiguration,

      // Enhanced Meta Information Slot
      {
        id: 'header-meta',
        type: 'meta',
        name: 'page-meta',
        displayName: 'Meta Information & Statistics',
        required: false,
        multiple: true,
        allowedComponents: [
          'OrganizationCount',
          'FilterSummaryBadges',
          'PriorityBreakdown',
          'TypeDistribution',
          'GeographicSummary'
        ],
        props: {
          showActiveFilters: true,
          showPriorityBreakdown: true,
          showTypeDistribution: true,
          showGeographicSummary: false, // Only on desktop
        },
        responsive: {
          mobile: { visible: false },
          tablet: { visible: true, size: 'auto' },
          laptop: { visible: true, size: 'auto' },
          desktop: { visible: true, size: 'auto' },
        },
      } as SlotConfiguration,

      // Enhanced Action Buttons Slot
      {
        id: 'header-actions',
        type: 'actions',
        name: 'page-actions',
        displayName: 'Page Actions',
        required: false,
        multiple: true,
        allowedComponents: [
          'AddOrganizationButton',
          'BulkActionsMenu',
          'ImportOrganizationsButton',
          'ExportOrganizationsButton',
          'ViewToggle',
          'SettingsMenu'
        ],
        defaultComponent: 'AddOrganizationButton',
        props: {
          variant: 'primary',
          size: 'default',
          showLabels: true,
          groupActions: true,
          contextualActions: true, // Show different actions based on filters
        },
        responsive: {
          mobile: { visible: true, size: 'sm', alignment: 'end' },
          tablet: { visible: true, size: 'default' },
          laptop: { visible: true, size: 'default' },
          desktop: { visible: true, size: 'default' },
        },
      } as SlotConfiguration,

      // Advanced Schema-Driven Filter Sidebar
      {
        id: 'filter-sidebar',
        type: 'filters',
        name: 'organization-filters',
        displayName: 'Advanced Organization Filters',
        required: false,
        multiple: false,
        defaultComponent: 'SchemaFilterSidebar',
        props: {
          schemaConfig: organizationFiltersSchema,
          persistFilters: true,
          showFilterCount: true,
          enableQuickFilters: true,
          quickFilters: [
            { label: 'All', filter: {} },
            { label: 'High Priority', filter: { priority: ['A+', 'A'] } },
            { label: 'Customers', filter: { type: 'customer' } },
            { label: 'Distributors', filter: { type: 'distributor' } },
            { label: 'Recently Contacted', filter: { last_contact_date: { type: 'relative', days: -14 } } },
          ],
          enableSavedFilters: true,
          enableFilterPresets: true,
        },
        responsive: {
          mobile: { visible: true, size: 'auto' }, // Mobile sheet
          tablet: { visible: true, size: 'md' },   // Sidebar
          laptop: { visible: true, size: 'lg' },
          desktop: { visible: true, size: 'lg' },
        },
      } as SlotConfiguration,

      // Enhanced Search Slot with Smart Suggestions
      {
        id: 'content-search',
        type: 'search',
        name: 'organization-search',
        displayName: 'Organization Search',
        required: false,
        multiple: false,
        defaultComponent: 'SmartSearch',
        props: {
          placeholder: 'Search organizations by name, location, segment, or contact...',
          searchFields: [
            'name',
            'segment',
            'city',
            'state_province',
            'phone',
            'primary_manager_name',
            'secondary_manager_name',
            'address_line_1',
            'industry'
          ],
          debounceMs: 300,
          enableSuggestions: true,
          suggestionTypes: ['name', 'segment', 'location'],
          enableRecentSearches: true,
          enableSearchHistory: true,
        },
        responsive: {
          mobile: { visible: true, size: 'auto' },
          tablet: { visible: true, size: 'auto' },
          laptop: { visible: true, size: 'auto' },
          desktop: { visible: true, size: 'auto' },
        },
      } as SlotConfiguration,

      // Advanced Content Slot with Auto-Virtualization
      {
        id: 'main-content',
        type: 'content',
        name: 'organizations-data-display',
        displayName: 'Organizations Table with Advanced Features',
        required: true,
        multiple: false,
        defaultComponent: 'OrganizationsDataDisplay',
        props: {
          // Auto-virtualization configuration
          enableVirtualization: 'auto', // Auto at 500+ rows
          virtualizationThreshold: 500,

          // Advanced table features
          enableBulkSelection: true,
          enableColumnResizing: true,
          enableColumnReordering: true,
          enableSorting: true,
          enableRowExpansion: true,
          enableDensityToggle: true,

          // Default configuration
          defaultSort: { field: 'name', order: 'asc' },
          defaultDensity: 'normal',
          defaultPageSize: 50,

          // Advanced features
          showExpandedContent: true,
          enableInlineEditing: false, // Can be enabled via user preferences
          enableRowActions: true,
          enableContextMenu: true,

          // Relationship display
          showOrganizationalHierarchy: true,
          showDistributorRelationships: true,
          showPrincipalRelationships: true,

          // Performance optimizations
          enableMemoization: true,
          enableLazyLoading: true,
          enableProgressiveEnhancement: true,
        },
        responsive: {
          mobile: { visible: true, size: 'auto' },
          tablet: { visible: true, size: 'auto' },
          laptop: { visible: true, size: 'auto' },
          desktop: { visible: true, size: 'auto' },
        },
      } as SlotConfiguration,
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
          'filter-sidebar': ['main-content'], // Filters need content to filter
          'content-search': ['main-content'], // Search needs content to search
          'header-meta': ['main-content'],    // Meta displays content stats
        },
        conflicts: {},
        custom: [
          {
            name: 'validate-virtualization-config',
            expression: 'slots.main-content?.props?.enableVirtualization === "auto" || typeof slots.main-content?.props?.virtualizationThreshold === "number"',
            message: 'Auto-virtualization must have a threshold defined',
          },
          {
            name: 'validate-filter-schema',
            expression: 'slots.filter-sidebar?.props?.schemaConfig?.groups?.length > 0',
            message: 'Filter sidebar must have at least one filter group configured',
          },
        ],
      },
    },

    responsive: {
      breakpoints: standardBreakpoints,
      mobileFirst: true,
      adaptiveLayout: true,
    },
  },
}

/**
 * Compact Organizations Layout for Mobile/Dashboard Widgets
 */
export const compactOrganizationsLayoutConfig: OrganizationLayoutConfig = {
  ...organizationsPageLayoutConfig,
  id: 'organizations-compact',
  name: 'Organizations Page - Compact Layout',

  metadata: {
    ...organizationsPageLayoutConfig.metadata,
    displayName: 'Compact Organizations View',
    description: 'Simplified organizations view for mobile and dashboard widgets',
    category: 'template',
    tags: ['organizations', 'compact', 'mobile', 'widget'],
  },

  structure: {
    ...organizationsPageLayoutConfig.structure,
    slots: organizationsPageLayoutConfig.structure.slots
      .filter(slot => ['header-title', 'header-actions', 'content-search', 'main-content'].includes(slot.id))
      .map(slot => {
        if (slot.id === 'main-content') {
          return {
            ...slot,
            props: {
              ...slot.props,
              enableVirtualization: false, // Disable for compact view
              defaultPageSize: 25,
              showExpandedContent: false,
              enableRowExpansion: false,
              enableBulkSelection: false,
            },
          }
        }
        return slot
      }),
    composition: {
      ...organizationsPageLayoutConfig.structure.composition,
      requiredSlots: ['header-title', 'main-content'],
      slotOrder: ['header-title', 'header-actions', 'content-search', 'main-content'],
    },
  },
}

/**
 * Conditional expressions for organization-specific features
 */
export const organizationConditionalExpressions: Record<string, ConditionalExpression> = {
  hierarchyEnabled: {
    type: 'feature',
    feature: 'organizational_hierarchy',
  },

  distributorRelationships: {
    type: 'permission',
    permission: 'view_distributor_relationships',
  },

  principalAccess: {
    type: 'permission',
    permission: 'view_principal_data',
  },

  bulkActionsEnabled: {
    type: 'permission',
    permission: 'bulk_edit_organizations',
  },

  hasOrganizations: {
    type: 'field',
    field: 'data.length',
    operator: 'greater_than',
    value: 0,
  },

  highPriorityFilter: {
    type: 'field',
    field: 'filters.priority',
    operator: 'includes_any',
    value: ['A+', 'A'],
  },

  virtualizationNeeded: {
    type: 'field',
    field: 'data.length',
    operator: 'greater_than_or_equal',
    value: 500,
  },
}

/**
 * Validation function for organizations layout configuration
 */
export function validateOrganizationsLayoutConfig(config: OrganizationLayoutConfig): boolean {
  // Entity type validation
  if (config.entityType !== 'organizations') {
    console.warn('Layout config entity type must be "organizations"')
    return false
  }

  // Required slots validation
  const requiredSlots = config.structure.composition.requiredSlots
  const availableSlots = config.structure.slots.map(slot => slot.id)

  const missingSlots = requiredSlots.filter(required => !availableSlots.includes(required))
  if (missingSlots.length > 0) {
    console.warn('Missing required slots:', missingSlots)
    return false
  }

  // Main content validation
  const mainContentSlot = config.structure.slots.find(slot => slot.id === 'main-content')
  if (!mainContentSlot || !mainContentSlot.defaultComponent) {
    console.warn('Main content slot must have a default component')
    return false
  }

  // Filter sidebar validation
  const filterSlot = config.structure.slots.find(slot => slot.id === 'filter-sidebar')
  if (filterSlot && filterSlot.props?.schemaConfig) {
    const schemaConfig = filterSlot.props.schemaConfig as SchemaFilterConfig
    if (!schemaConfig.groups || schemaConfig.groups.length === 0) {
      console.warn('Filter sidebar schema must have at least one filter group')
      return false
    }
  }

  // Auto-virtualization validation
  if (mainContentSlot?.props?.enableVirtualization === 'auto') {
    if (!mainContentSlot.props.virtualizationThreshold) {
      console.warn('Auto-virtualization requires threshold to be defined')
      return false
    }
  }

  return true
}

/**
 * Get default organizations layout based on context and screen size
 */
export function getDefaultOrganizationsLayout(
  context: 'page' | 'modal' | 'embedded' | 'widget' = 'page',
  screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): OrganizationLayoutConfig {
  if (context === 'embedded' || context === 'widget' || screenSize === 'mobile') {
    return compactOrganizationsLayoutConfig
  }

  return organizationsPageLayoutConfig
}

/**
 * Migration helper: Convert existing Organizations.tsx props to schema config
 */
export function migrateOrganizationsPropsToSchema(props: {
  organizations: Organization[]
  filteredOrganizations: Organization[]
  isLoading: boolean
  activeFilter: string
  searchTerm: string
  onEdit: (org: Organization) => void
  onDelete: (org: Organization) => void
  onRefresh: () => void
}): OrganizationLayoutConfig {
  const baseConfig = { ...organizationsPageLayoutConfig }

  // Update main content slot with actual data and handlers
  const mainContentSlot = baseConfig.structure.slots.find(slot => slot.id === 'main-content')
  if (mainContentSlot) {
    mainContentSlot.props = {
      ...mainContentSlot.props,
      data: props.filteredOrganizations,
      loading: props.isLoading,
      onEdit: props.onEdit,
      onDelete: props.onDelete,
      onRefresh: props.onRefresh,
      // Enable virtualization if needed
      enableVirtualization: props.organizations.length >= 500 ? true : 'auto',
    }
  }

  // Update meta slot with current counts and filter info
  const metaSlot = baseConfig.structure.slots.find(slot => slot.id === 'header-meta')
  if (metaSlot) {
    metaSlot.props = {
      ...metaSlot.props,
      totalCount: props.organizations.length,
      filteredCount: props.filteredOrganizations.length,
      activeFilter: props.activeFilter,
      searchTerm: props.searchTerm,
      loading: props.isLoading,
    }
  }

  // Update filter sidebar with current values
  const filterSlot = baseConfig.structure.slots.find(slot => slot.id === 'filter-sidebar')
  if (filterSlot && filterSlot.props?.schemaConfig) {
    filterSlot.props = {
      ...filterSlot.props,
      filterValues: {
        search: props.searchTerm,
        // Additional filter values would be derived from actual filter state
      },
      activeFilterCount: props.activeFilter !== 'all' ? 1 : 0,
    }
  }

  return baseConfig
}

// Export types for external use
export type {
  OrganizationLayoutConfig,
  SchemaFilterConfig,
} from '@/types/layout/schema.types'

export { organizationFiltersSchema }