/**
 * Contacts List Layout Definition
 *
 * Reusable layout configuration for contact list displays across the application.
 * This layout can be used in various contexts: main contacts page, contact selection
 * dialogs, organization contact lists, and embedded contact displays.
 *
 * Features:
 * - Reusable across multiple contexts
 * - Configurable display modes (compact, standard, detailed)
 * - Responsive design with mobile-first approach
 * - Expandable content with decision authority insights
 * - Auto-virtualization for performance
 * - Design token consistency
 */

import type {
  LayoutConfiguration,
  SlotConfiguration,
  ContactLayoutConfig,
} from '@/types/layout/schema.types'
import type { ContactWithExpandedContent } from '@/pages/Contacts.schema'

/**
 * Display mode configuration for different use cases
 */
export type ContactListDisplayMode = 'compact' | 'standard' | 'detailed' | 'embedded'

/**
 * Context configuration for layout adaptation
 */
export interface ContactListContext {
  mode: ContactListDisplayMode
  maxHeight?: number
  selectable?: boolean
  expandable?: boolean
  showOrganizations?: boolean
  showAuthority?: boolean
  showInfluence?: boolean
  showActivity?: boolean
  allowBulkActions?: boolean
}

/**
 * Generates column configuration based on display mode and context
 */
function getColumnsForMode(mode: ContactListDisplayMode, context: ContactListContext) {
  const baseColumns = [{
    key: 'name',
    header: 'Name',
    cell: 'ContactNameCell',
    sortable: true,
    width: mode === 'compact' ? 150 : 200
  }]

  switch (mode) {
    case 'compact':
      return [
        ...baseColumns,
        ...(context.showOrganizations ? [{
          key: 'organization.name',
          header: 'Organization',
          cell: 'OrganizationLinkCell',
          sortable: true,
          width: 180
        }] : []),
        {
          key: 'actions',
          header: '',
          cell: 'ContactActionsCell',
          width: 60,
          align: 'right' as const
        }
      ]

    case 'embedded':
      return [
        ...baseColumns,
        {
          key: 'title',
          header: 'Title',
          cell: 'TextCell',
          sortable: true,
          width: 140
        },
        ...(context.showOrganizations ? [{
          key: 'organization.name',
          header: 'Organization',
          cell: 'OrganizationLinkCell',
          sortable: true,
          width: 160
        }] : [])
      ]

    case 'standard':
      return [
        ...baseColumns,
        {
          key: 'title',
          header: 'Title',
          cell: 'TextCell',
          sortable: true,
          width: 180
        },
        ...(context.showOrganizations ? [{
          key: 'organization.name',
          header: 'Organization',
          cell: 'OrganizationLinkCell',
          sortable: true,
          width: 200
        }] : []),
        ...(context.showAuthority ? [{
          key: 'decision_authority_level',
          header: 'Authority',
          cell: 'AuthorityBadgeCell',
          sortable: true,
          width: 120,
          align: 'center' as const
        }] : []),
        {
          key: 'actions',
          header: '',
          cell: 'ContactActionsCell',
          width: 80,
          align: 'right' as const
        }
      ]

    case 'detailed':
      return [
        ...baseColumns,
        {
          key: 'title',
          header: 'Title',
          cell: 'TextCell',
          sortable: true,
          width: 180
        },
        ...(context.showOrganizations ? [{
          key: 'organization.name',
          header: 'Organization',
          cell: 'OrganizationLinkCell',
          sortable: true,
          width: 200
        }] : []),
        ...(context.showAuthority ? [{
          key: 'decision_authority_level',
          header: 'Authority',
          cell: 'AuthorityBadgeCell',
          sortable: true,
          width: 120,
          align: 'center' as const
        }] : []),
        ...(context.showInfluence ? [{
          key: 'purchase_influence_score',
          header: 'Influence',
          cell: 'InfluenceScoreCell',
          sortable: true,
          width: 100,
          align: 'center' as const
        }] : []),
        ...(context.showActivity ? [{
          key: 'recent_interactions_count',
          header: 'Recent Activity',
          cell: 'ActivityIndicatorCell',
          sortable: true,
          width: 120,
          align: 'center' as const
        }] : []),
        {
          key: 'actions',
          header: '',
          cell: 'ContactActionsCell',
          width: 80,
          align: 'right' as const
        }
      ]

    default:
      return baseColumns
  }
}

/**
 * Generates bulk actions based on context
 */
function getBulkActionsForContext(context: ContactListContext) {
  if (!context.allowBulkActions) {
    return []
  }

  const actions = [{
    id: 'edit',
    label: 'Edit Selected',
    icon: 'Edit',
    action: 'contacts:bulkEdit'
  }]

  if (context.mode !== 'embedded') {
    actions.push(
      {
        id: 'delete',
        label: 'Delete Selected',
        icon: 'Trash2',
        action: 'contacts:bulkDelete'
      },
      {
        id: 'export',
        label: 'Export Selected',
        icon: 'Download',
        action: 'contacts:bulkExport'
      }
    )
  }

  return actions
}

/**
 * Generates responsive configuration based on display mode
 */
function getResponsiveConfig(mode: ContactListDisplayMode, context: ContactListContext) {
  const baseConfig = {
    mobile: {
      columns: ['name', 'actions']
    },
    tablet: {
      columns: ['name', 'title', 'actions']
    }
  }

  if (context.showOrganizations) {
    baseConfig.mobile.columns = ['name', 'organization.name', 'actions']
    baseConfig.tablet.columns = ['name', 'title', 'organization.name', 'actions']
  }

  if (mode === 'detailed' && context.showAuthority) {
    baseConfig.tablet.columns.splice(-1, 0, 'decision_authority_level')
  }

  return baseConfig
}

/**
 * Creates a contacts list layout configuration
 */
export function createContactsListLayout(
  id: string,
  context: ContactListContext = {
    mode: 'standard',
    selectable: true,
    expandable: true,
    showOrganizations: true,
    showAuthority: true,
    showInfluence: false,
    showActivity: false,
    allowBulkActions: true
  }
): ContactLayoutConfig {
  const columns = getColumnsForMode(context.mode, context)
  const bulkActions = getBulkActionsForContext(context)
  const responsive = getResponsiveConfig(context.mode, context)

  const contentSlot: SlotConfiguration = {
    id: 'content',
    type: 'content',
    name: 'listContent',
    displayName: 'List Content',
    required: true,
    multiple: false,
    defaultComponent: 'DataTable',
  props: {
    features: {
      virtualization: 'auto',
      expansion: context.expandable,
      selection: context.selectable,
      bulkActions: context.allowBulkActions
    },
    columns,
    expandableContent: context.expandable ? {
      component: 'ContactExpandedContent',
      height: 'auto',
      collapsible: true
    } : undefined,
    bulkActions,
    maxHeight: context.maxHeight,
    density: context.mode === 'compact' ? 'compact' : 'standard'
  }
}

  return {
    id,
    name: `Contacts List (${context.mode})`,
    version: '1.0.0',
    type: 'slots',
    entityType: 'contacts',

    metadata: {
      displayName: `Contacts List (${context.mode})`,
      description: `Reusable contacts list layout in ${context.mode} mode`,
      category: 'default',
      tags: ['contacts', 'list', 'reusable', context.mode],
      isShared: false,
      isDefault: context.mode === 'standard',
      createdBy: 'Layout System',
      createdAt: new Date().toISOString(),
      usageCount: 0
    },

    structure: {
      slots: [contentSlot],
      composition: {
        requiredSlots: ['content'],
        maxSlots: 5,
        slotOrder: ['content'],
        inheritance: {
          overrides: [],
          merge: []
        },
        validation: {
          required: ['content'],
          dependencies: {},
          conflicts: {}
        }
      },
      responsive: {
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          laptop: 1280,
          desktop: 1920
        },
        mobileFirst: true,
        adaptiveLayout: true
      }
    },

    // Entity-specific configuration
    entitySpecific: {
      roleFilters: [],
      authorityLevels: ['high', 'medium', 'low'],
      organizationContext: context.showOrganizations
    }
  }
}

/**
 * Pre-configured layout instances for common use cases
 */

// Standard contacts list for main page
export const standardContactsList = createContactsListLayout(
  'contacts-list-standard',
  {
    mode: 'standard',
    selectable: true,
    expandable: true,
    showOrganizations: true,
    showAuthority: true,
    showInfluence: false,
    showActivity: false,
    allowBulkActions: true
  }
)

// Detailed contacts list for analysis
export const detailedContactsList = createContactsListLayout(
  'contacts-list-detailed',
  {
    mode: 'detailed',
    selectable: true,
    expandable: true,
    showOrganizations: true,
    showAuthority: true,
    showInfluence: true,
    showActivity: true,
    allowBulkActions: true
  }
)

// Compact contacts list for dialogs
export const compactContactsList = createContactsListLayout(
  'contacts-list-compact',
  {
    mode: 'compact',
    selectable: true,
    expandable: false,
    showOrganizations: true,
    showAuthority: false,
    showInfluence: false,
    showActivity: false,
    allowBulkActions: false
  }
)

// Embedded contacts list for organization pages
export const embeddedContactsList = createContactsListLayout(
  'contacts-list-embedded',
  {
    mode: 'embedded',
    maxHeight: 400,
    selectable: false,
    expandable: false,
    showOrganizations: false,
    showAuthority: true,
    showInfluence: false,
    showActivity: false,
    allowBulkActions: false
  }
)

/**
 * Layout registry exports
 */
export const contactsListLayouts = {
  standard: standardContactsList,
  detailed: detailedContactsList,
  compact: compactContactsList,
  embedded: embeddedContactsList
}

/**
 * Default export for main contacts page
 */
export default standardContactsList