/**
 * Products List Layout Configuration
 *
 * Reusable layout definition for product list views that can be used across
 * different contexts (page, modal, embedded views). This demonstrates the
 * flexibility of the layout-as-data system.
 */

import type {
  ProductLayoutConfig,
  SlotConfiguration,
  ResponsiveBreakpoints,
} from '@/types/layout/schema.types'
import type { Database } from '@/lib/database.types'

/**
 * Standard breakpoints for consistent responsive behavior
 */
const responsiveBreakpoints: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1024,
  laptop: 1280,
  desktop: 1920,
}

/**
 * Base Products List Layout
 *
 * This layout can be customized for different contexts:
 * - Full page view (includes header, filters, actions)
 * - Modal view (simplified header, no filters)
 * - Embedded view (table only, minimal chrome)
 */
export const baseProductsListLayout: ProductLayoutConfig = {
  id: 'products-list-base',
  name: 'Products List - Base Layout',
  version: '1.0.0',
  type: 'slots',
  entityType: 'products',

  metadata: {
    displayName: 'Base Products List',
    description: 'Reusable product list layout with flexible context support',
    category: 'template',
    tags: ['list', 'table', 'reusable', 'responsive'],
    isShared: true,
    isDefault: false,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 0,
  },

  entitySpecific: {
    categoryFilters: [] as Database['public']['Enums']['product_category'][],
    principalGrouping: true,
    inventoryStatus: true,
    pricingView: true,
  },

  structure: {
    slots: [
      // Flexible Header Title (context-aware)
      {
        id: 'list-title',
        type: 'title',
        name: 'list-title',
        displayName: 'List Title',
        required: false, // Can be omitted for embedded contexts
        multiple: false,
        defaultComponent: 'PageTitle',
        props: {
          text: 'Products', // Can be overridden
          level: 2, // Smaller than page-level heading
          className: 'text-xl font-semibold text-gray-900',
        },
        responsive: {
          mobile: { visible: true, size: 'md' },
          tablet: { visible: true, size: 'lg' },
          laptop: { visible: true, size: 'lg' },
          desktop: { visible: true, size: 'lg' },
        },
      } as SlotConfiguration,

      // Quick Actions (add, export, etc.)
      {
        id: 'list-actions',
        type: 'actions',
        name: 'list-actions',
        displayName: 'List Actions',
        required: false,
        multiple: true,
        allowedComponents: ['AddProductButton', 'ExportButton', 'RefreshButton'],
        props: {
          variant: 'secondary',
          size: 'sm',
          showLabels: false, // Icons only in list context
        },
        responsive: {
          mobile: { visible: true, size: 'sm', alignment: 'end' },
          tablet: { visible: true, size: 'sm' },
          laptop: { visible: true, size: 'default' },
          desktop: { visible: true, size: 'default' },
        },
      } as SlotConfiguration,

      // Search Bar (always visible)
      {
        id: 'list-search',
        type: 'search',
        name: 'list-search',
        displayName: 'Product Search',
        required: false,
        multiple: false,
        defaultComponent: 'ProductSearch',
        props: {
          placeholder: 'Search products...',
          searchFields: ['name', 'sku', 'description'],
          debounceMs: 300,
          showAdvancedToggle: false, // Simple search in list context
        },
        responsive: {
          mobile: { visible: true, size: 'auto' },
          tablet: { visible: true, size: 'auto' },
          laptop: { visible: true, size: 'auto' },
          desktop: { visible: true, size: 'auto' },
        },
      } as SlotConfiguration,

      // Quick Filters (essential filters only)
      {
        id: 'list-filters',
        type: 'filters',
        name: 'list-filters',
        displayName: 'Quick Filters',
        required: false,
        multiple: false,
        defaultComponent: 'QuickFilters',
        props: {
          layout: 'horizontal', // Horizontal for list context
          sections: [
            {
              id: 'status',
              title: 'Status',
              type: 'select',
              field: 'availability_status',
              options: [
                { label: 'All', value: '' },
                { label: 'In Stock', value: 'available' },
                { label: 'Low Stock', value: 'low_stock' },
                { label: 'Out of Stock', value: 'out_of_stock' },
              ],
            },
            {
              id: 'category',
              title: 'Category',
              type: 'select',
              field: 'category',
              options: [], // Populated dynamically
            },
          ],
        },
        responsive: {
          mobile: { visible: false }, // Hidden on mobile to save space
          tablet: { visible: true },
          laptop: { visible: true },
          desktop: { visible: true },
        },
      } as SlotConfiguration,

      // Main Table/List Content
      {
        id: 'list-content',
        type: 'content',
        name: 'list-content',
        displayName: 'Product List',
        required: true,
        multiple: false,
        defaultComponent: 'ProductsTable',
        props: {
          enableVirtualization: 'auto',
          enableBulkSelection: false, // Disabled in list context by default
          enableColumnResizing: true,
          enableSorting: true,
          defaultSort: { field: 'name', order: 'asc' },
          density: 'compact', // More compact in list context
          showExpandedContent: false, // Disabled by default in list
          columns: [
            {
              key: 'name',
              header: 'Product Name',
              width: 'auto',
              sortable: true,
              required: true,
            },
            {
              key: 'sku',
              header: 'SKU',
              width: '120px',
              sortable: true,
            },
            {
              key: 'category',
              header: 'Category',
              width: '140px',
              sortable: true,
            },
            {
              key: 'list_price',
              header: 'Price',
              width: '100px',
              sortable: true,
              align: 'right',
            },
            {
              key: 'availability_status',
              header: 'Status',
              width: '100px',
              sortable: true,
            },
          ],
        },
        responsive: {
          mobile: { visible: true, size: 'auto' },
          tablet: { visible: true, size: 'auto' },
          laptop: { visible: true, size: 'auto' },
          desktop: { visible: true, size: 'auto' },
        },
      } as SlotConfiguration,

      // Status/Meta Bar (count, pagination, etc.)
      {
        id: 'list-meta',
        type: 'meta',
        name: 'list-meta',
        displayName: 'List Meta Information',
        required: false,
        multiple: false,
        defaultComponent: 'ListMeta',
        props: {
          showCount: true,
          showPagination: true,
          showPerPage: true,
          position: 'bottom',
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
      requiredSlots: ['list-content'],
      slotOrder: [
        'list-title',
        'list-actions',
        'list-search',
        'list-filters',
        'list-content',
        'list-meta',
      ],
      inheritance: {
        inheritsFrom: 'base-list-layout',
        overrides: ['list-content'],
        merge: ['list-actions', 'list-filters'],
      },
      validation: {
        required: ['list-content'],
        dependencies: {
          'list-filters': ['list-content'],
          'list-search': ['list-content'],
          'list-meta': ['list-content'],
        },
        conflicts: {},
        custom: [
          {
            name: 'validate-columns-configuration',
            expression: 'slots.list-content?.props?.columns?.length > 0',
            message: 'List content must have at least one column configured',
          },
        ],
      },
    },

    responsive: {
      breakpoints: responsiveBreakpoints,
      mobileFirst: true,
      adaptiveLayout: true,
    },
  },
}

/**
 * Context-specific layout variations
 */

/**
 * Full Page Products List Layout
 * Includes all features: title, actions, filters, search, etc.
 */
export function getPageProductsListLayout(): ProductLayoutConfig {
  return {
    ...baseProductsListLayout,
    id: 'products-list-page',
    name: 'Products List - Full Page',
    metadata: {
      ...baseProductsListLayout.metadata,
      displayName: 'Full Page Products List',
      description: 'Complete product list with all features for dedicated page',
    },
    structure: {
      ...baseProductsListLayout.structure,
      slots: baseProductsListLayout.structure.slots.map(slot => {
        if (slot.id === 'list-title') {
          return {
            ...slot,
            props: {
              ...slot.props,
              text: 'Product Catalog',
              level: 1,
              className: 'text-2xl font-semibold text-gray-900',
            },
          } as SlotConfiguration
        }
        if (slot.id === 'list-content') {
          return {
            ...slot,
            props: {
              ...slot.props,
              enableBulkSelection: true,
              showExpandedContent: true,
              density: 'normal',
            },
          } as SlotConfiguration
        }
        return slot
      }),
    },
  }
}

/**
 * Modal Products List Layout
 * Simplified for modal context: no title, minimal actions
 */
export function getModalProductsListLayout(): ProductLayoutConfig {
  return {
    ...baseProductsListLayout,
    id: 'products-list-modal',
    name: 'Products List - Modal',
    metadata: {
      ...baseProductsListLayout.metadata,
      displayName: 'Modal Products List',
      description: 'Simplified product list for modal dialogs',
    },
    structure: {
      ...baseProductsListLayout.structure,
      slots: baseProductsListLayout.structure.slots.filter(slot =>
        ['list-search', 'list-filters', 'list-content', 'list-meta'].includes(slot.id)
      ),
      composition: {
        ...baseProductsListLayout.structure.composition,
        requiredSlots: ['list-content'],
        slotOrder: ['list-search', 'list-filters', 'list-content', 'list-meta'],
      },
    },
  }
}

/**
 * Embedded Products List Layout
 * Minimal layout for embedding in other components
 */
export function getEmbeddedProductsListLayout(): ProductLayoutConfig {
  return {
    ...baseProductsListLayout,
    id: 'products-list-embedded',
    name: 'Products List - Embedded',
    metadata: {
      ...baseProductsListLayout.metadata,
      displayName: 'Embedded Products List',
      description: 'Minimal product list for embedding in other components',
    },
    structure: {
      ...baseProductsListLayout.structure,
      slots: baseProductsListLayout.structure.slots.filter(slot =>
        ['list-content'].includes(slot.id)
      ).map(slot => {
        if (slot.id === 'list-content') {
          return {
            ...slot,
            props: {
              ...slot.props,
              density: 'compact',
              enableBulkSelection: false,
              showExpandedContent: false,
              columns: [
                {
                  key: 'name',
                  header: 'Product',
                  width: 'auto',
                  sortable: true,
                },
                {
                  key: 'sku',
                  header: 'SKU',
                  width: '100px',
                  sortable: true,
                },
                {
                  key: 'list_price',
                  header: 'Price',
                  width: '80px',
                  align: 'right',
                },
              ],
            },
          } as SlotConfiguration
        }
        return slot
      }),
      composition: {
        ...baseProductsListLayout.structure.composition,
        requiredSlots: ['list-content'],
        slotOrder: ['list-content'],
      },
    },
  }
}

/**
 * Get the appropriate layout based on context
 *
 * @param context - The context where the layout will be used
 * @param options - Additional options for customization
 */
export function getProductLayoutForContext(
  context: 'page' | 'modal' | 'embedded',
  options: {
    enableBulkActions?: boolean
    enableFilters?: boolean
    enableSearch?: boolean
    density?: 'compact' | 'normal' | 'relaxed'
  } = {}
): ProductLayoutConfig {
  let layout: ProductLayoutConfig

  switch (context) {
    case 'page':
      layout = getPageProductsListLayout()
      break
    case 'modal':
      layout = getModalProductsListLayout()
      break
    case 'embedded':
      layout = getEmbeddedProductsListLayout()
      break
    default:
      layout = baseProductsListLayout
  }

  // Apply options overrides
  if (options.density || options.enableBulkActions !== undefined) {
    const contentSlot = layout.structure.slots.find(slot => slot.id === 'list-content')
    if (contentSlot) {
      if (options.density) {
        contentSlot.props = { ...contentSlot.props, density: options.density }
      }
      if (options.enableBulkActions !== undefined) {
        contentSlot.props = { ...contentSlot.props, enableBulkSelection: options.enableBulkActions }
      }
    }
  }

  // Filter out slots based on options
  if (options.enableFilters === false) {
    layout = {
      ...layout,
      structure: {
        ...layout.structure,
        slots: layout.structure.slots.filter(slot => slot.id !== 'list-filters'),
      },
    }
  }

  if (options.enableSearch === false) {
    layout = {
      ...layout,
      structure: {
        ...layout.structure,
        slots: layout.structure.slots.filter(slot => slot.id !== 'list-search'),
      },
    }
  }

  return layout
}

/**
 * Validate products list layout configuration
 */
export function validateProductsListLayout(layout: ProductLayoutConfig): string[] {
  const errors: string[] = []

  // Must have list-content slot
  const hasContentSlot = layout.structure.slots.some(slot => slot.id === 'list-content')
  if (!hasContentSlot) {
    errors.push('Products list layout must have a list-content slot')
  }

  // Content slot must have columns configured
  const contentSlot = layout.structure.slots.find(slot => slot.id === 'list-content')
  if (contentSlot && (!contentSlot.props?.columns || contentSlot.props.columns.length === 0)) {
    errors.push('List content slot must have columns configured')
  }

  // Validate entity type
  if (layout.entityType !== 'products') {
    errors.push('Layout entity type must be "products"')
  }

  return errors
}

// Export the layout configurations
export {
  baseProductsListLayout as default,
  responsiveBreakpoints,
}