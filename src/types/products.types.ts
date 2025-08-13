/**
 * Product-specific type definitions and utilities
 * 
 * This file provides specialized types for product-related functionality
 * including validation schemas, form types, and business logic interfaces.
 */

import type { 
  Product, 
  ProductWithRelations,
  ProductListItem,
  ProductFilter,
  ProductCategory,
  Organization
} from './entities'

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

/**
 * Product creation form validation schema type
 */
export interface CreateProductSchema {
  principal_id: string
  name: string
  description?: string | null
  category: ProductCategory
  sku?: string | null
  unit_cost?: number | null
  list_price?: number | null
  unit_of_measure?: string | null
  min_order_quantity?: number | null
  shelf_life_days?: number | null
  season_start?: number | null
  season_end?: number | null
  specifications?: string | null
  storage_requirements?: string | null
}

/**
 * Product update form validation schema type
 */
export interface UpdateProductSchema {
  name?: string
  description?: string | null
  category?: ProductCategory
  sku?: string | null
  unit_cost?: number | null
  list_price?: number | null
  unit_of_measure?: string | null
  min_order_quantity?: number | null
  shelf_life_days?: number | null
  season_start?: number | null
  season_end?: number | null
  specifications?: string | null
  storage_requirements?: string | null
  principal_id?: string
}

// =============================================================================
// BUSINESS LOGIC TYPES
// =============================================================================

/**
 * Product summary for dashboard views
 */
export interface ProductSummary {
  id: string
  name: string
  category: ProductCategory
  brand: string | null
  sku: string | null
  unit_price: number | null
  unit_of_measure: string | null
  is_active: boolean
  principal_name: string
  opportunity_count: number
  total_opportunity_value: number
  last_order_date: string | null
  inventory_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
}

/**
 * Product with pricing and availability context
 */
export interface ProductWithPricing extends ProductWithRelations {
  pricing_tiers?: ProductPricingTier[]
  volume_discounts?: ProductVolumeDiscount[]
  seasonal_pricing?: ProductSeasonalPricing[]
  availability?: ProductAvailability
  inventory?: ProductInventory
}

/**
 * Product pricing tier structure
 */
export interface ProductPricingTier {
  id: string
  product_id: string
  tier_name: string
  min_quantity: number
  unit_price: number
  discount_percentage: number
  effective_date: string
  expiry_date?: string
  is_active: boolean
}

/**
 * Product volume discount structure
 */
export interface ProductVolumeDiscount {
  id: string
  product_id: string
  min_quantity: number
  discount_percentage: number
  discount_amount?: number
  description?: string
  is_active: boolean
}

/**
 * Product seasonal pricing
 */
export interface ProductSeasonalPricing {
  id: string
  product_id: string
  season_name: string
  start_date: string
  end_date: string
  seasonal_price: number
  price_adjustment_type: 'percentage' | 'fixed'
  price_adjustment_value: number
  is_active: boolean
}

/**
 * Product availability tracking
 */
export interface ProductAvailability {
  product_id: string
  is_available: boolean
  availability_date?: string
  discontinued_date?: string
  replacement_product_id?: string
  availability_notes?: string
  regional_availability?: ProductRegionalAvailability[]
}

/**
 * Regional availability for products
 */
export interface ProductRegionalAvailability {
  region: string
  is_available: boolean
  lead_time_days?: number
  minimum_order_quantity?: number
  notes?: string
}

/**
 * Product inventory tracking
 */
export interface ProductInventory {
  product_id: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_point: number
  max_stock_level: number
  last_updated: string
  warehouse_locations?: ProductWarehouseLocation[]
}

/**
 * Product warehouse location
 */
export interface ProductWarehouseLocation {
  warehouse_id: string
  warehouse_name: string
  location_code: string
  quantity: number
  last_updated: string
}

// =============================================================================
// PRODUCT CATALOG TYPES
// =============================================================================

/**
 * Product catalog structure
 */
export interface ProductCatalog {
  id: string
  name: string
  description?: string
  principal_id: string
  categories: ProductCatalogCategory[]
  effective_date: string
  expiry_date?: string
  is_active: boolean
  version: string
}

/**
 * Product catalog category
 */
export interface ProductCatalogCategory {
  category: ProductCategory
  display_name: string
  description?: string
  products: ProductCatalogItem[]
  subcategories?: ProductCatalogSubcategory[]
}

/**
 * Product catalog subcategory
 */
export interface ProductCatalogSubcategory {
  id: string
  name: string
  description?: string
  products: ProductCatalogItem[]
}

/**
 * Product catalog item
 */
export interface ProductCatalogItem {
  product: Product
  catalog_price?: number
  catalog_description?: string
  featured: boolean
  sort_order: number
  available: boolean
  promotional?: ProductPromotion
}

/**
 * Product promotion structure
 */
export interface ProductPromotion {
  id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  promotion_type: 'percentage_discount' | 'fixed_discount' | 'bogo' | 'bundle'
  discount_value?: number
  conditions?: Record<string, any>
  is_active: boolean
}

// =============================================================================
// UI COMPONENT TYPES
// =============================================================================

/**
 * Product card display props
 */
export interface ProductCardProps {
  product: ProductListItem
  showPrincipal?: boolean
  showActions?: boolean
  showPricing?: boolean
  showAvailability?: boolean
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onDelete?: (id: string) => void
  onAddToOpportunity?: (id: string) => void
}

/**
 * Product table column configuration
 */
export interface ProductTableColumn {
  key: keyof ProductListItem | 'actions'
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any, row: ProductListItem) => string | number
}

/**
 * Product form section configuration
 */
export interface ProductFormSection {
  id: string
  title: string
  description?: string
  fields: Array<keyof CreateProductSchema>
  collapsible?: boolean
  defaultOpen?: boolean
  conditional?: (data: Partial<CreateProductSchema>) => boolean
}

/**
 * Product image configuration
 */
export interface ProductImageProps {
  product: Product | ProductSummary | ProductListItem
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showPlaceholder?: boolean
  showBadges?: boolean
  className?: string
}

// =============================================================================
// SEARCH AND FILTERING
// =============================================================================

/**
 * Product search facets
 */
export interface ProductSearchFacets {
  categories: Array<{ category: ProductCategory; count: number }>
  brands: Array<{ brand: string; count: number }>
  principals: Array<{ id: string; name: string; count: number }>
  price_ranges: Array<{ min: number; max: number; count: number }>
  availability: Array<{ status: string; count: number }>
}

/**
 * Advanced product search criteria
 */
export interface ProductSearchCriteria extends ProductFilter {
  keywords?: string[]
  exclude_keywords?: string[]
  price_min?: number
  price_max?: number
  weight_min?: number
  weight_max?: number
  has_sku?: boolean
  has_upc?: boolean
  seasonal_only?: boolean
  promotional_only?: boolean
  nutritional_filters?: ProductNutritionalFilters
}

/**
 * Nutritional filtering (food service specific)
 */
export interface ProductNutritionalFilters {
  organic?: boolean
  gluten_free?: boolean
  dairy_free?: boolean
  vegan?: boolean
  kosher?: boolean
  halal?: boolean
  non_gmo?: boolean
  low_sodium?: boolean
  low_fat?: boolean
  sugar_free?: boolean
}

// =============================================================================
// API SERVICE TYPES
// =============================================================================

/**
 * Product service method signatures
 */
export interface ProductService {
  // CRUD operations
  getAll: (filter?: ProductFilter) => Promise<ProductListItem[]>
  getById: (id: string) => Promise<ProductWithPricing | null>
  create: (data: CreateProductSchema) => Promise<Product>
  update: (id: string, data: UpdateProductSchema) => Promise<Product>
  delete: (id: string) => Promise<void>
  
  // Principal relationships
  getByPrincipal: (principalId: string) => Promise<ProductListItem[]>
  
  // Catalog operations
  getCatalog: (principalId: string) => Promise<ProductCatalog>
  createCatalog: (data: Omit<ProductCatalog, 'id'>) => Promise<ProductCatalog>
  
  // Pricing operations
  getPricingTiers: (productId: string) => Promise<ProductPricingTier[]>
  createPricingTier: (data: Omit<ProductPricingTier, 'id'>) => Promise<ProductPricingTier>
  getVolumeDiscounts: (productId: string) => Promise<ProductVolumeDiscount[]>
  
  // Availability operations
  getAvailability: (productId: string) => Promise<ProductAvailability>
  updateAvailability: (productId: string, data: Partial<ProductAvailability>) => Promise<ProductAvailability>
  
  // Search and filter
  search: (criteria: ProductSearchCriteria) => Promise<ProductListItem[]>
  getSearchFacets: (filter?: ProductFilter) => Promise<ProductSearchFacets>
  
  // Business operations
  getSummary: (id: string) => Promise<ProductSummary>
  getPopularProducts: (limit?: number) => Promise<ProductListItem[]>
  getSeasonalProducts: (season?: string) => Promise<ProductListItem[]>
  
  // Bulk operations
  bulkUpdate: (updates: Array<{ id: string; data: UpdateProductSchema }>) => Promise<Product[]>
  bulkDelete: (ids: string[]) => Promise<void>
  bulkPriceUpdate: (updates: Array<{ id: string; price: number; effective_date?: string }>) => Promise<Product[]>
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Product category validation
 */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'beverages',
  'dairy',
  'frozen',
  'fresh_produce',
  'meat_poultry',
  'seafood',
  'dry_goods',
  'spices_seasonings',
  'baking_supplies',
  'cleaning_supplies',
  'paper_products',
  'equipment'
] as const

/**
 * Required fields for product creation
 */
export const REQUIRED_PRODUCT_FIELDS: Array<keyof CreateProductSchema> = [
  'principal_id',
  'name',
  'category'
]

/**
 * Unit of measure standard options
 */
export const UNIT_OF_MEASURE_OPTIONS = [
  'each', 'case', 'box', 'bag', 'lb', 'kg', 'oz', 'g',
  'fl oz', 'ml', 'l', 'gal', 'qt', 'pt', 'cup',
  'dozen', 'pair', 'set', 'pack', 'bundle'
] as const

/**
 * SKU validation pattern
 */
export const SKU_VALIDATION_PATTERN = /^[A-Za-z0-9\-_]+$/

/**
 * UPC validation pattern (UPC-A: 12 digits)
 */
export const UPC_VALIDATION_PATTERN = /^\d{12}$/

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Product category type guard function
 */
export const isProductCategory = (value: string): value is ProductCategory => {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory)
}

/**
 * Product display utilities
 */
export interface ProductDisplayUtils {
  formatPrice: (price: number | null, currency?: string) => string
  formatWeight: (weight: number | null, unit?: string) => string
  formatDimensions: (dimensions: string | null) => string
  getCategoryIcon: (category: ProductCategory) => string
  getCategoryColor: (category: ProductCategory) => string
  getAvailabilityBadge: (isActive: boolean, isSeasonal: boolean, seasonDates?: { start?: string; end?: string }) => string
  generateSKU: (product: Partial<Product>) => string
}

/**
 * Product comparison types
 */
export interface ProductComparison {
  products: Product[]
  comparison_fields: Array<keyof Product>
  differences: Record<string, any[]>
  similarities: Record<string, any>
}

// =============================================================================
// FORM STATE MANAGEMENT
// =============================================================================

/**
 * Product form state
 */
export interface ProductFormState {
  data: Partial<CreateProductSchema>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  selectedPrincipal?: Organization
  availablePrincipals?: Organization[]
  currentSection?: string
}

/**
 * Product form actions
 */
export type ProductFormAction =
  | { type: 'SET_FIELD'; field: keyof CreateProductSchema; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_PRINCIPAL'; principal: Organization }
  | { type: 'SET_AVAILABLE_PRINCIPALS'; principals: Organization[] }
  | { type: 'SET_SECTION'; section: string }
  | { type: 'RESET_FORM' }

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Product analytics metrics
 */
export interface ProductMetrics {
  total_products: number
  active_products: number
  by_category: Record<ProductCategory, number>
  by_principal: Record<string, number>
  avg_price: number
  price_range: { min: number; max: number }
  seasonal_products: number
  top_selling: ProductListItem[]
  low_performing: ProductListItem[]
}

/**
 * Product performance tracking
 */
export interface ProductPerformance {
  product_id: string
  total_opportunities: number
  won_opportunities: number
  total_value: number
  average_deal_size: number
  win_rate: number
  days_to_close: number
  last_sold_date: string | null
  trending: 'up' | 'down' | 'stable'
}

/**
 * Product import/export types
 */
export interface ProductImportRow extends Omit<CreateProductSchema, 'principal_id' | 'category'> {
  principal_name?: string
  principal_id?: string
  category?: string // String version for CSV import
  row_number: number
  validation_errors?: string[]
}

export interface ProductExportRow extends ProductListItem {
  description: string | null
  upc_code: string | null
  case_pack: number | null
  weight_per_unit: number | null
  dimensions: string | null
  product_line: string | null
  marketing_description: string | null
}