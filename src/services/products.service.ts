/**
 * Product Service for KitchenPantry CRM
 * 
 * Provides type-safe CRUD operations for products including:
 * - Principal-product ownership validation
 * - Product catalog management
 * - Seasonal product handling
 * - SKU and UPC code management
 * - Category-based filtering and searching
 */

import { BaseService } from './baseService'
import type { 
  Tables, 
  TablesInsert, 
  TablesUpdate, 
  Enums 
} from '@/types/database.types'
import type { 
  CreateProductSchema,
  UpdateProductSchema,
  ProductMetrics
} from '@/types'
import { ApiError, supabase, handleSupabaseResponse } from './api'

// =============================================================================
// TYPES
// =============================================================================

type Product = Tables<'products'>
type ProductInsert = TablesInsert<'products'>
type ProductUpdate = TablesUpdate<'products'>
type ProductCategory = Enums<'product_category'>

export interface ProductWithRelations extends Product {
  principal?: Tables<'organizations'>
  opportunity_products?: Array<Tables<'opportunity_products'> & {
    opportunity?: Tables<'opportunities'>
  }>
}

export interface ProductSearchOptions {
  query?: string
  principalId?: string
  category?: ProductCategory[]
  brand?: string[]
  productLine?: string[]
  isActive?: boolean
  isSeasonal?: boolean
  priceRange?: { min?: number; max?: number }
  inSeason?: boolean
}

export interface ProductSummary {
  id: string
  name: string
  category: ProductCategory
  brand: string | null
  product_line: string | null
  principal_name: string
  sku: string | null
  unit_price: number | null
  is_active: boolean
  is_seasonal: boolean
  opportunity_count: number
  total_opportunity_value: number
  last_opportunity_date: string | null
}

export interface SeasonalProductInfo {
  product: Product
  is_currently_in_season: boolean
  days_until_season_start: number | null
  days_until_season_end: number | null
  season_length_days: number | null
}

// =============================================================================
// PRODUCT SERVICE CLASS
// =============================================================================

export class ProductService extends BaseService<
  Product,
  ProductInsert,
  ProductUpdate
> {
  constructor() {
    super('products')
  }

  // =============================================================================
  // ENHANCED CRUD OPERATIONS
  // =============================================================================

  /**
   * Create product with business logic validation
   */
  async create(data: CreateProductSchema): Promise<Product> {
    // Validate required fields
    this.validateRequiredFields(data, ['principal_id', 'name', 'category'])
    
    // Validate business constraints
    await this.validateConstraints(data, 'create')

    // Validate principal can own products
    await this.validatePrincipalOwnership(data.principal_id)

    const insertData: ProductInsert = {
      ...data,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_seasonal: data.is_seasonal || false
    }

    return super.create(insertData)
  }

  /**
   * Update product with validation
   */
  async update(id: string, data: UpdateProductSchema): Promise<Product> {
    // Validate constraints
    await this.validateConstraints(data, 'update')

    // If changing principal, validate new principal can own products
    if (data.principal_id) {
      await this.validatePrincipalOwnership(data.principal_id)
    }

    const updateData: ProductUpdate = { ...data }
    return super.update(id, updateData)
  }

  /**
   * Get product with principal and related data
   */
  async findByIdWithRelations(
    id: string,
    options: {
      includePrincipal?: boolean
      includeOpportunities?: boolean
    } = {}
  ): Promise<ProductWithRelations> {
    try {
      const {
        includePrincipal = true,
        includeOpportunities = false
      } = options

      let selectFields = '*'

      // Build select fields based on options
      const relations = []
      if (includePrincipal) relations.push('principal:principal_id(*)')
      if (includeOpportunities) {
        relations.push('opportunity_products!product_id(*, opportunity:opportunity_id(*))')
      }

      if (relations.length > 0) {
        selectFields = `*, ${relations.join(', ')}`
      }

      const { data, error } = await supabase
        .from('products')
        .select(selectFields)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to fetch product with relations: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Advanced search with product-specific filters
   */
  async search(options: ProductSearchOptions = {}): Promise<Product[]> {
    try {
      const {
        query,
        principalId,
        category,
        brand,
        productLine,
        isActive,
        isSeasonal,
        priceRange,
        inSeason
      } = options

      let searchQuery = supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)

      // Text search across multiple fields
      if (query) {
        searchQuery = searchQuery.or(
          `name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%,brand.ilike.%${query}%,product_line.ilike.%${query}%`
        )
      }

      // Principal filter
      if (principalId) {
        searchQuery = searchQuery.eq('principal_id', principalId)
      }

      // Category filter
      if (category && category.length > 0) {
        searchQuery = searchQuery.in('category', category)
      }

      // Brand filter
      if (brand && brand.length > 0) {
        searchQuery = searchQuery.in('brand', brand)
      }

      // Product line filter
      if (productLine && productLine.length > 0) {
        searchQuery = searchQuery.in('product_line', productLine)
      }

      // Active status filter
      if (isActive !== undefined) {
        searchQuery = searchQuery.eq('is_active', isActive)
      }

      // Seasonal filter
      if (isSeasonal !== undefined) {
        searchQuery = searchQuery.eq('is_seasonal', isSeasonal)
      }

      // Price range filter
      if (priceRange) {
        if (priceRange.min !== undefined) {
          searchQuery = searchQuery.gte('unit_price', priceRange.min)
        }
        if (priceRange.max !== undefined) {
          searchQuery = searchQuery.lte('unit_price', priceRange.max)
        }
      }

      // In season filter (for seasonal products)
      if (inSeason !== undefined && inSeason) {
        const today = new Date()
        const currentDate = today.toISOString().split('T')[0] // YYYY-MM-DD format
        
        searchQuery = searchQuery.or(
          `is_seasonal.eq.false,and(season_start.lte.${currentDate},season_end.gte.${currentDate})`
        )
      }

      const { data, error } = await searchQuery.order('name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        'Failed to search products',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // PRINCIPAL-SPECIFIC OPERATIONS
  // =============================================================================

  /**
   * Get all products for a principal
   */
  async findByPrincipal(
    principalId: string,
    activeOnly = true
  ): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('principal_id', principalId)
        .is('deleted_at', null)

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.order('name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to get products for principal: ${principalId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get product catalog for a principal (organized by category)
   */
  async getPrincipalCatalog(principalId: string): Promise<Record<ProductCategory, Product[]>> {
    try {
      const products = await this.findByPrincipal(principalId, true)
      
      const catalog: Record<string, Product[]> = {}
      
      products.forEach(product => {
        if (!catalog[product.category]) {
          catalog[product.category] = []
        }
        catalog[product.category].push(product)
      })

      return catalog as Record<ProductCategory, Product[]>
    } catch (error) {
      throw new ApiError(
        `Failed to get product catalog for principal: ${principalId}`,
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // CATEGORY-BASED OPERATIONS
  // =============================================================================

  /**
   * Get products by category
   */
  async findByCategory(
    category: ProductCategory,
    activeOnly = true
  ): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .is('deleted_at', null)

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.order('name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        `Failed to get products in category: ${category}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get all available categories with product counts
   */
  async getCategorySummary(): Promise<Array<{ category: ProductCategory; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)
        .is('deleted_at', null)

      if (error) throw error

      const categoryCounts = (data || []).reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1
        return acc
      }, {} as Record<ProductCategory, number>)

      return Object.entries(categoryCounts).map(([category, count]) => ({
        category: category as ProductCategory,
        count
      }))
    } catch (error) {
      throw new ApiError(
        'Failed to get category summary',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // SEASONAL PRODUCT OPERATIONS
  // =============================================================================

  /**
   * Get seasonal product information with current season status
   */
  async getSeasonalInfo(productId: string): Promise<SeasonalProductInfo | null> {
    try {
      const product = await this.findById(productId)
      
      if (!product.is_seasonal) {
        return null
      }

      const today = new Date()
      const currentYear = today.getFullYear()
      
      // Parse season dates (assuming MM-DD format)
      const seasonStart = product.season_start ? new Date(`${currentYear}-${product.season_start}`) : null
      const seasonEnd = product.season_end ? new Date(`${currentYear}-${product.season_end}`) : null
      
      let isCurrentlyInSeason = false
      let daysUntilSeasonStart: number | null = null
      let daysUntilSeasonEnd: number | null = null
      let seasonLengthDays: number | null = null

      if (seasonStart && seasonEnd) {
        // Handle cross-year seasons (e.g., December to February)
        if (seasonEnd < seasonStart) {
          seasonEnd.setFullYear(currentYear + 1)
        }

        isCurrentlyInSeason = today >= seasonStart && today <= seasonEnd
        
        if (!isCurrentlyInSeason) {
          if (today < seasonStart) {
            daysUntilSeasonStart = Math.ceil((seasonStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          } else {
            // Season has ended this year, calculate days until next year's season
            const nextYearSeasonStart = new Date(`${currentYear + 1}-${product.season_start}`)
            daysUntilSeasonStart = Math.ceil((nextYearSeasonStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          }
        } else {
          daysUntilSeasonEnd = Math.ceil((seasonEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        }

        seasonLengthDays = Math.ceil((seasonEnd.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24))
      }

      return {
        product,
        is_currently_in_season: isCurrentlyInSeason,
        days_until_season_start: daysUntilSeasonStart,
        days_until_season_end: daysUntilSeasonEnd,
        season_length_days: seasonLengthDays
      }
    } catch (error) {
      throw new ApiError(
        `Failed to get seasonal info for product: ${productId}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get all seasonal products currently in season
   */
  async getCurrentSeasonalProducts(): Promise<Product[]> {
    try {
      const today = new Date()
      const currentDate = today.toISOString().split('T')[0] // YYYY-MM-DD format

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_seasonal', true)
        .eq('is_active', true)
        .lte('season_start', currentDate)
        .gte('season_end', currentDate)
        .is('deleted_at', null)
        .order('name')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        'Failed to get current seasonal products',
        500,
        error as any
      )
    }
  }

  /**
   * Get upcoming seasonal products (starting within next 30 days)
   */
  async getUpcomingSeasonalProducts(daysAhead = 30): Promise<Product[]> {
    try {
      const today = new Date()
      const futureDate = new Date(today)
      futureDate.setDate(futureDate.getDate() + daysAhead)
      
      const currentDate = today.toISOString().split('T')[0]
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_seasonal', true)
        .eq('is_active', true)
        .gte('season_start', currentDate)
        .lte('season_start', futureDateStr)
        .is('deleted_at', null)
        .order('season_start')

      return handleSupabaseResponse(data, error)
    } catch (error) {
      throw new ApiError(
        'Failed to get upcoming seasonal products',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // PRODUCT ANALYTICS
  // =============================================================================

  /**
   * Get product summary with opportunity data
   */
  async getSummary(id: string): Promise<ProductSummary> {
    try {
      const productData = await this.findByIdWithRelations(id, {
        includePrincipal: true,
        includeOpportunities: false
      })

      // Get opportunity metrics for this product
      const { data: opportunityProducts, error: oppError } = await supabase
        .from('opportunity_products')
        .select('quantity, unit_price, total_value, opportunity:opportunity_id(stage, updated_at)')
        .eq('product_id', id)

      if (oppError) throw oppError

      const opportunityCount = opportunityProducts?.length || 0
      const totalOpportunityValue = opportunityProducts?.reduce(
        (sum, op) => sum + (op.total_value || 0), 0
      ) || 0

      // Get last opportunity date
      const lastOpportunityDate = opportunityProducts?.length > 0
        ? opportunityProducts.reduce((latest, op) => {
            const opDate = op.opportunity?.updated_at
            return opDate && opDate > latest ? opDate : latest
          }, opportunityProducts[0].opportunity?.updated_at || '')
        : null

      return {
        id: productData.id,
        name: productData.name,
        category: productData.category,
        brand: productData.brand,
        product_line: productData.product_line,
        principal_name: productData.principal?.name || '',
        sku: productData.sku,
        unit_price: productData.unit_price,
        is_active: productData.is_active,
        is_seasonal: productData.is_seasonal,
        opportunity_count: opportunityCount,
        total_opportunity_value: totalOpportunityValue,
        last_opportunity_date: lastOpportunityDate
      }
    } catch (error) {
      throw new ApiError(
        `Failed to get product summary: ${id}`,
        500,
        error as any
      )
    }
  }

  /**
   * Get product metrics for analytics
   */
  async getMetrics(): Promise<ProductMetrics> {
    try {
      // Get total count
      const { count: totalCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      // Get active count
      const { count: activeCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .is('deleted_at', null)

      // Get counts by category
      const { data: categoryStats, error: categoryError } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)
        .is('deleted_at', null)

      if (categoryError) throw categoryError

      const categoryCounts = categoryStats?.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1
        return acc
      }, {} as Record<ProductCategory, number>) || {}

      // Get seasonal count
      const { count: seasonalCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_seasonal', true)
        .eq('is_active', true)
        .is('deleted_at', null)

      // Get products with pricing
      const { count: pricedCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .not('unit_price', 'is', null)
        .eq('is_active', true)
        .is('deleted_at', null)

      // Get recent additions (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .is('deleted_at', null)

      return {
        total_count: totalCount || 0,
        active_count: activeCount || 0,
        by_category: categoryCounts,
        seasonal_count: seasonalCount || 0,
        with_pricing: pricedCount || 0,
        recent_additions: recentCount || 0,
        active_percentage: totalCount > 0 ? ((activeCount || 0) / totalCount) * 100 : 0,
        pricing_coverage: activeCount > 0 ? ((pricedCount || 0) / activeCount) * 100 : 0
      }
    } catch (error) {
      throw new ApiError(
        'Failed to get product metrics',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // BULK OPERATIONS
  // =============================================================================

  /**
   * Bulk import products for a principal
   */
  async importForPrincipal(
    principalId: string,
    products: Omit<CreateProductSchema, 'principal_id'>[]
  ): Promise<{ success: Product[]; failed: Array<{ product: any; error: string }> }> {
    // Validate principal can own products
    await this.validatePrincipalOwnership(principalId)

    const success: Product[] = []
    const failed: Array<{ product: any; error: string }> = []

    for (const productData of products) {
      try {
        const product = await this.create({
          ...productData,
          principal_id: principalId
        })
        success.push(product)
      } catch (error) {
        failed.push({
          product: productData,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return { success, failed }
  }

  /**
   * Bulk update product status (activate/deactivate)
   */
  async updateActiveStatus(
    productIds: string[],
    isActive: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
          updated_by: await this.getCurrentUserId()
        })
        .in('id', productIds)

      if (error) throw error

      this.invalidateCache()
    } catch (error) {
      throw new ApiError(
        'Failed to update product active status',
        500,
        error as any
      )
    }
  }

  // =============================================================================
  // VALIDATION HELPERS
  // =============================================================================

  protected async validateConstraints(
    data: any, 
    operation: 'create' | 'update' = 'create'
  ): Promise<void> {
    // Validate SKU format (if provided)
    if (data.sku) {
      const skuRegex = /^[A-Z0-9\-]{3,20}$/
      if (!skuRegex.test(data.sku)) {
        throw new ApiError(
          'SKU must be 3-20 characters, uppercase letters, numbers, and hyphens only',
          400
        )
      }
    }

    // Validate UPC code (if provided)
    if (data.upc_code) {
      const upcRegex = /^\d{12}$/
      if (!upcRegex.test(data.upc_code)) {
        throw new ApiError('UPC code must be exactly 12 digits', 400)
      }
    }

    // Validate price is positive
    if (data.unit_price !== undefined && data.unit_price !== null && data.unit_price < 0) {
      throw new ApiError('Unit price must be positive', 400)
    }

    // Validate seasonal dates
    if (data.is_seasonal && data.season_start && data.season_end) {
      const seasonStartRegex = /^\d{2}-\d{2}$/
      const seasonEndRegex = /^\d{2}-\d{2}$/
      
      if (!seasonStartRegex.test(data.season_start)) {
        throw new ApiError('Season start must be in MM-DD format', 400)
      }
      
      if (!seasonEndRegex.test(data.season_end)) {
        throw new ApiError('Season end must be in MM-DD format', 400)
      }
    }

    // Validate principal exists
    if (data.principal_id) {
      await this.validatePrincipalExists(data.principal_id)
    }

    // Validate unique SKU (if provided)
    if (data.sku) {
      await this.validateUniqueSKU(
        data.sku, 
        operation === 'update' ? data.id : undefined
      )
    }

    // Validate unique UPC (if provided)
    if (data.upc_code) {
      await this.validateUniqueUPC(
        data.upc_code, 
        operation === 'update' ? data.id : undefined
      )
    }
  }

  /**
   * Validate principal exists and is of type 'principal'
   */
  private async validatePrincipalExists(principalId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, type')
        .eq('id', principalId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new ApiError('Principal organization not found', 404)
      }

      if (data.type !== 'principal') {
        throw new ApiError(
          'Only principal organizations can own products',
          403
        )
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Failed to validate principal', 500, error as any)
    }
  }

  /**
   * Validate that only principals can own products
   */
  private async validatePrincipalOwnership(principalId: string): Promise<void> {
    return this.validatePrincipalExists(principalId)
  }

  /**
   * Validate SKU is unique
   */
  private async validateUniqueSKU(sku: string, excludeProductId?: string): Promise<void> {
    try {
      let query = supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .is('deleted_at', null)

      if (excludeProductId) {
        query = query.neq('id', excludeProductId)
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        throw new ApiError(`A product with SKU "${sku}" already exists`, 409)
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Failed to validate SKU uniqueness', 500, error as any)
    }
  }

  /**
   * Validate UPC is unique
   */
  private async validateUniqueUPC(upcCode: string, excludeProductId?: string): Promise<void> {
    try {
      let query = supabase
        .from('products')
        .select('id')
        .eq('upc_code', upcCode)
        .is('deleted_at', null)

      if (excludeProductId) {
        query = query.neq('id', excludeProductId)
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        throw new ApiError(`A product with UPC "${upcCode}" already exists`, 409)
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError('Failed to validate UPC uniqueness', 500, error as any)
    }
  }

  // =============================================================================
  // SELECT FIELD BUILDER
  // =============================================================================

  protected buildSelectFields(include: string[]): string {
    const baseFields = '*'
    const relationMap: Record<string, string> = {
      'principal': 'principal:principal_id(*)',
      'opportunities': 'opportunity_products!product_id(*, opportunity:opportunity_id(*))'
    }

    const relations = include
      .filter(rel => relationMap[rel])
      .map(rel => relationMap[rel])

    return relations.length > 0 
      ? `${baseFields}, ${relations.join(', ')}` 
      : baseFields
  }
}

// =============================================================================
// SERVICE INSTANCE
// =============================================================================

export const productService = new ProductService()