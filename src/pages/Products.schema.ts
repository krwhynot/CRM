/**
 * Products Page Schema Configuration
 *
 * Layout-as-data schema for the Products page, demonstrating the migration
 * from slot-based JSX to configuration-driven layout rendering.
 *
 * This serves as the proof-of-concept for schema-driven page layouts and
 * provides migration patterns for other pages.
 */

import type {
  ProductLayoutConfig,
  SlotBasedLayout,
  SlotConfiguration,
  ResponsiveBreakpoints,
  ConditionalExpression
} from '@/types/layout/schema.types'
import type { ProductWithPrincipal } from '@/types/product-extensions'
import type { Database } from '@/lib/database.types'

/**
 * Standard responsive breakpoints matching the CRM design system
 */
const standardBreakpoints: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1024,
  laptop: 1280,
  desktop: 1920,
}

/**
 * Primary Products Page Layout Configuration
 *
 * This layout mirrors the current Products.tsx slot-based structure:
 * - Header with title, actions, and meta information
 * - Filter sidebar (responsive desktop/mobile)
 * - Main content area with ProductsDataDisplay
 */
export const productsPageLayoutConfig: ProductLayoutConfig = {
  id: 'products-page-default',
  name: 'Products Page - Default Layout',
  version: '1.0.0',
  type: 'slots',
  entityType: 'products',

  metadata: {
    displayName: 'Default Products View',
    description: 'Standard products table with filters and actions',
    category: 'default',
    tags: ['table', 'filters', 'crud', 'responsive'],
    isShared: false,
    isDefault: true,
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
      // Header Title Slot
      {
        id: 'header-title',
        type: 'title',
        name: 'page-title',
        displayName: 'Page Title',
        required: true,
        multiple: false,
        defaultComponent: 'PageTitle',
        props: {
          text: 'Products',
          level: 1,
          className: 'text-2xl font-semibold text-gray-900',
        },
        responsive: {
          mobile: { visible: true, size: 'lg' },
          tablet: { visible: true, size: 'xl' },
          laptop: { visible: true, size: 'xl' },
          desktop: { visible: true, size: 'xl' },
        },
      } as SlotConfiguration,

      // Header Subtitle Slot
      {
        id: 'header-subtitle',
        type: 'subtitle',
        name: 'page-subtitle',
        displayName: 'Page Subtitle',
        required: false,
        multiple: false,
        defaultComponent: 'PageSubtitle',
        props: {
          text: 'Manage product catalog and inventory',
          className: 'text-sm text-gray-600',
        },
        responsive: {
          mobile: { visible: false },
          tablet: { visible: true },
          laptop: { visible: true },
          desktop: { visible: true },
        },
      } as SlotConfiguration,

      // Meta Information Slot (count, badges, etc.)
      {
        id: 'header-meta',
        type: 'meta',
        name: 'page-meta',
        displayName: 'Meta Information',
        required: false,
        multiple: true,
        allowedComponents: ['ProductCount', 'StatusBadges', 'CategoryBreakdown'],
        props: {
          showCount: true,
          showActiveFilters: true,
        },
        responsive: {
          mobile: { visible: false },
          tablet: { visible: true },
          laptop: { visible: true },
          desktop: { visible: true },
        },
      } as SlotConfiguration,

      // Action Buttons Slot
      {
        id: 'header-actions',
        type: 'actions',
        name: 'page-actions',
        displayName: 'Page Actions',
        required: false,
        multiple: true,
        allowedComponents: ['AddProductButton', 'BulkActions', 'ExportButton', 'ImportButton'],
        defaultComponent: 'AddProductButton',
        props: {
          variant: 'primary',
          size: 'default',
          showLabels: true,
        },
        responsive: {
          mobile: { visible: true, size: 'sm', alignment: 'end' },
          tablet: { visible: true, size: 'default' },
          laptop: { visible: true, size: 'default' },
          desktop: { visible: true, size: 'default' },
        },
      } as SlotConfiguration,

      // Filter Sidebar Slot
      {
        id: 'filter-sidebar',
        type: 'filters',
        name: 'product-filters',
        displayName: 'Product Filters',
        required: false,
        multiple: false,
        defaultComponent: 'ProductFilters',
        props: {
          sections: [
            {
              id: 'category',
              title: 'Category',
              type: 'select',
              field: 'category',
              options: [], // Will be populated from enum
            },
            {
              id: 'principal',
              title: 'Principal',
              type: 'combobox',
              field: 'principal_id',
            },
            {
              id: 'inventory',
              title: 'Inventory Status',
              type: 'checkbox',
              field: 'availability_status',
              options: [
                { label: 'In Stock', value: 'available' },
                { label: 'Low Stock', value: 'low_stock' },
                { label: 'Out of Stock', value: 'out_of_stock' },
              ],
            },
            {
              id: 'price',
              title: 'Price Range',
              type: 'range',
              field: 'list_price',
              min: 0,
              max: 1000,
            },
          ],
        },
        responsive: {
          mobile: { visible: true, size: 'auto' }, // Mobile sheet
          tablet: { visible: true, size: 'md' },   // Sidebar
          laptop: { visible: true, size: 'md' },
          desktop: { visible: true, size: 'lg' },
        },
      } as SlotConfiguration,

      // Search Slot
      {
        id: 'content-search',
        type: 'search',
        name: 'product-search',
        displayName: 'Product Search',
        required: false,
        multiple: false,
        defaultComponent: 'UniversalSearch',
        props: {
          placeholder: 'Search products by name, SKU, or description...',
          searchFields: ['name', 'sku', 'description', 'brand'],
          debounceMs: 300,
        },
        responsive: {
          mobile: { visible: true, size: 'auto' },
          tablet: { visible: true, size: 'auto' },
          laptop: { visible: true, size: 'auto' },
          desktop: { visible: true, size: 'auto' },
        },
      } as SlotConfiguration,

      // Main Content Slot (Table/Data Display)
      {
        id: 'main-content',
        type: 'content',
        name: 'products-data-display',
        displayName: 'Products Table',
        required: true,
        multiple: false,
        defaultComponent: 'ProductsDataDisplay',
        props: {
          enableVirtualization: 'auto', // Auto at 500+ rows
          enableBulkSelection: true,
          enableColumnResizing: true,
          enableSorting: true,
          defaultSort: { field: 'name', order: 'asc' },
          density: 'normal',
          showExpandedContent: true,
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
        overrides: ['main-content', 'filter-sidebar'],
        merge: ['header-actions', 'header-meta'],
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
            name: 'validate-filter-compatibility',
            expression: 'slots.filter-sidebar?.props?.sections?.length > 0 || !slots.filter-sidebar',
            message: 'Filter sidebar must have at least one filter section if enabled',
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
 * Compact Products Layout for Mobile/Embedded Use
 *
 * Simplified layout with essential information only
 */
export const compactProductsLayoutConfig: ProductLayoutConfig = {
  ...productsPageLayoutConfig,
  id: 'products-compact',
  name: 'Products Page - Compact Layout',

  metadata: {
    ...productsPageLayoutConfig.metadata,
    displayName: 'Compact Products View',
    description: 'Simplified products view for mobile and embedded use',
    category: 'template',
  },

  structure: {
    ...productsPageLayoutConfig.structure,
    slots: productsPageLayoutConfig.structure.slots.filter(slot =>
      ['header-title', 'header-actions', 'content-search', 'main-content'].includes(slot.id)
    ),
    composition: {
      ...productsPageLayoutConfig.structure.composition,
      requiredSlots: ['header-title', 'main-content'],
      slotOrder: ['header-title', 'header-actions', 'content-search', 'main-content'],
    },
  },
}

/**
 * Get default products layout based on context
 *
 * @param context - Layout context ('page', 'modal', 'embedded')
 * @param screenSize - Current screen size category
 */
export function getDefaultProductsLayout(
  context: 'page' | 'modal' | 'embedded' = 'page',
  screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): ProductLayoutConfig {
  if (context === 'embedded' || screenSize === 'mobile') {
    return compactProductsLayoutConfig
  }

  return productsPageLayoutConfig
}

/**
 * Create conditional configuration for products
 *
 * Example conditional expressions for products page:
 * - Show inventory filters only if inventory tracking is enabled
 * - Show principal grouping only if user has multi-principal access
 * - Show bulk actions only if user has admin permissions
 */
export const productsConditionalExpressions: Record<string, ConditionalExpression> = {
  inventoryEnabled: {
    type: 'feature',
    feature: 'inventory_tracking',
  },

  multiPrincipalAccess: {
    type: 'permission',
    permission: 'view_all_principals',
  },

  bulkActionsEnabled: {
    type: 'permission',
    permission: 'bulk_edit_products',
  },

  hasProducts: {
    type: 'field',
    field: 'data.length',
    operator: 'greater_than',
    value: 0,
  },
}

/**
 * Schema validation for products layout configuration
 *
 * Ensures layout configuration is valid for products entity type
 */
export function validateProductsLayoutConfig(config: ProductLayoutConfig): boolean {
  // Basic validation
  if (config.entityType !== 'products') {
    console.warn('Layout config entity type must be "products"')
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

  // Component validation
  const mainContentSlot = config.structure.slots.find(slot => slot.id === 'main-content')
  if (!mainContentSlot || !mainContentSlot.defaultComponent) {
    console.warn('Main content slot must have a default component')
    return false
  }

  return true
}

/**
 * Migration helper: Convert existing Products.tsx props to schema config
 *
 * This demonstrates how to migrate from slot-based props to schema configuration
 */
export function migrateProductsPropsToSchema(props: {
  products: ProductWithPrincipal[]
  isLoading: boolean
  onEdit: (product: any) => void
  onDelete: (product: any) => void
  onRefresh: () => void
}): ProductLayoutConfig {
  const baseConfig = { ...productsPageLayoutConfig }

  // Update main content slot with actual data and handlers
  const mainContentSlot = baseConfig.structure.slots.find(slot => slot.id === 'main-content')
  if (mainContentSlot) {
    mainContentSlot.props = {
      ...mainContentSlot.props,
      data: props.products,
      loading: props.isLoading,
      onEdit: props.onEdit,
      onDelete: props.onDelete,
      onRefresh: props.onRefresh,
    }
  }

  // Update meta slot with current count
  const metaSlot = baseConfig.structure.slots.find(slot => slot.id === 'header-meta')
  if (metaSlot) {
    metaSlot.props = {
      ...metaSlot.props,
      count: props.products.length,
      loading: props.isLoading,
    }
  }

  return baseConfig
}

// Export types for external use
export type {
  ProductLayoutConfig,
  SlotBasedLayout,
} from '@/types/layout/schema.types'