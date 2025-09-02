/**
 * Product Type Extensions
 *
 * Extended product types that include computed and joined fields
 * commonly used in product components and displays.
 */

import type { Product } from './entities'

/**
 * Product with computed inventory status
 */
export interface ProductWithStatus extends Product {
  in_stock?: boolean
  low_stock?: boolean
  stock_quantity?: number
  reorder_level?: number
}

/**
 * Product with principal organization details
 */
export interface ProductWithPrincipal extends Product {
  principal_name?: string
  principal_contact?: string
  principal_phone?: string
  principal_email?: string
}

/**
 * Product with additional specification fields
 */
export interface ProductWithSpecs extends Product {
  package_size?: string
  origin_country?: string
  brand?: string
  manufacturer?: string
  certifications?: string[]
  allergen_info?: string
}

/**
 * Complete product with all extended fields
 */
export interface ProductComplete extends ProductWithStatus, ProductWithPrincipal, ProductWithSpecs {
  // Additional computed fields
  profit_margin?: number
  sales_velocity?: number
  last_ordered_date?: string | Date
  average_rating?: number
  review_count?: number
}

/**
 * Product display data for tables and lists
 */
export interface ProductDisplayData extends ProductComplete {
  // Display-specific computed fields
  price_display?: string
  availability_status?: 'available' | 'low_stock' | 'out_of_stock' | 'discontinued'
  category_display?: string
  season_display?: string
}

/**
 * Product inventory status
 */
export type ProductAvailabilityStatus = 'available' | 'low_stock' | 'out_of_stock' | 'discontinued'

/**
 * Product component props that accept extended product types
 */
export interface ProductRowProps {
  product: ProductDisplayData
  onEdit?: (product: ProductDisplayData) => void
  onDelete?: (product: ProductDisplayData) => void
  onView?: (product: ProductDisplayData) => void
}

/**
 * Product table props with extended product data
 */
export interface ProductTableProps {
  products: ProductDisplayData[]
  loading?: boolean
  onEdit?: (product: ProductDisplayData) => void
  onDelete?: (product: ProductDisplayData) => void
  onView?: (product: ProductDisplayData) => void
  onBulkAction?: (action: string, products: ProductDisplayData[]) => void
}

/**
 * Type guards for product extensions
 */
export function hasInventoryStatus(product: Product): product is ProductWithStatus {
  return 'in_stock' in product || 'low_stock' in product || 'stock_quantity' in product
}

export function hasPrincipalInfo(product: Product): product is ProductWithPrincipal {
  return 'principal_name' in product
}

export function hasSpecifications(product: Product): product is ProductWithSpecs {
  return 'package_size' in product || 'origin_country' in product || 'brand' in product
}

export function isCompleteProduct(product: Product): product is ProductComplete {
  return hasInventoryStatus(product) && hasPrincipalInfo(product) && hasSpecifications(product)
}

/**
 * Utility to create a safe product display object with defaults
 */
export function createSafeProductDisplay(product: Product): ProductDisplayData {
  return {
    ...product,
    // Inventory defaults
    in_stock: hasInventoryStatus(product) ? (product.in_stock ?? true) : true,
    low_stock: hasInventoryStatus(product) ? (product.low_stock ?? false) : false,
    stock_quantity: hasInventoryStatus(product) ? product.stock_quantity : undefined,

    // Principal defaults
    principal_name: hasPrincipalInfo(product) ? product.principal_name : undefined,

    // Specification defaults
    package_size: hasSpecifications(product) ? product.package_size : undefined,
    origin_country: hasSpecifications(product) ? product.origin_country : undefined,
    brand: hasSpecifications(product) ? product.brand : undefined,

    // Display defaults
    availability_status: determineAvailabilityStatus(product),
    price_display: formatPrice(product.list_price),
    category_display: formatCategory(product.category),
  }
}

/**
 * Determine availability status from product data
 */
function determineAvailabilityStatus(product: Product): ProductAvailabilityStatus {
  if (hasInventoryStatus(product)) {
    if (!product.in_stock) return 'out_of_stock'
    if (product.low_stock) return 'low_stock'
  }
  return 'available'
}

/**
 * Format price for display
 */
function formatPrice(price?: number | null): string {
  if (price == null) return 'Price not set'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

/**
 * Format category for display
 */
function formatCategory(category?: string): string {
  if (!category) return 'Uncategorized'
  return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
