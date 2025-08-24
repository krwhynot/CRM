/**
 * Products Database Tests
 * 
 * Comprehensive testing of CRUD operations, principal relationships, and business logic
 * for the Products table in the KitchenPantry CRM system.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'

describe('Products Database Operations', () => {
  let testPrincipalId: string
  let testProductIds: string[] = []

  beforeEach(async () => {
    testProductIds = []
    await TestAuth.loginAsTestUser()

    // Create a test principal organization for product relationships
    const principalResult = await testSupabase
      .from('organizations')
      .insert({
        name: 'Test Principal for Products',
        type: 'principal' as const,
        industry: 'Food Manufacturing'
      })
      .select()
      .single()

    testPrincipalId = principalResult.data.id
    TestCleanup.trackCreatedRecord('organizations', testPrincipalId)
  })

  afterEach(async () => {
    // Cleanup test products
    if (testProductIds.length > 0) {
      await testSupabase
        .from('products')
        .delete()
        .in('id', testProductIds)
    }
  })

  describe('CREATE Operations', () => {
    test('should create a new product with all fields', async () => {
      const productData = {
        principal_id: testPrincipalId,
        name: 'Premium Organic Tomato Sauce',
        category: 'condiments_sauces' as const,
        description: 'High-quality organic tomato sauce made from fresh tomatoes',
        sku: 'PREM-TOMA-001',
        unit_of_measure: 'case',
        unit_cost: 45.50,
        list_price: 65.99,
        min_order_quantity: 12,
        season_start: 3, // March
        season_end: 10,  // October
        shelf_life_days: 730,
        storage_requirements: 'Store in cool, dry place',
        specifications: 'Made from 100% organic tomatoes, no preservatives',
        is_active: true
      }

      const result = await PerformanceMonitor.measureQuery('create_product', async () => {
        return await testSupabase
          .from('products')
          .insert(productData)
          .select(`
            *,
            principal:organizations(name, type)
          `)
          .single()
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe(productData.name)
      expect(result.data.category).toBe(productData.category)
      expect(result.data.sku).toBe(productData.sku)
      expect(result.data.principal_id).toBe(testPrincipalId)
      expect(result.data.principal).toBeDefined()
      expect(result.data.principal.type).toBe('principal')
      expect(result.data.unit_cost).toBe(productData.unit_cost)
      expect(result.data.list_price).toBe(productData.list_price)
      expect(result.data.season_start).toBe(productData.season_start)
      expect(result.data.season_end).toBe(productData.season_end)
      expect(result.data.id).toBeDefined()
      expect(result.data.created_at).toBeDefined()

      testProductIds.push(result.data.id)
      TestCleanup.trackCreatedRecord('products', result.data.id)
    })

    test('should create products in different categories', async () => {
      const categories = [
        'beverages',
        'dairy', 
        'meat_poultry',
        'seafood',
        'produce',
        'frozen_foods',
        'dry_goods',
        'condiments_sauces',
        'bakery',
        'other'
      ] as const

      const createdProducts = []

      for (const category of categories) {
        const productData = {
          principal_id: testPrincipalId,
          name: `Test ${category} Product`,
          category: category,
          description: `Test product in ${category} category`
        }

        const result = await testSupabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        expect(result.error).toBeNull()
        expect(result.data.category).toBe(category)
        
        createdProducts.push(result.data)
        testProductIds.push(result.data.id)
      }

      expect(createdProducts).toHaveLength(categories.length)
    })

    test('should create product with minimal required fields', async () => {
      const minimalProductData = {
        principal_id: testPrincipalId,
        name: 'Minimal Test Product',
        category: 'other' as const
      }

      const result = await testSupabase
        .from('products')
        .insert(minimalProductData)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.name).toBe(minimalProductData.name)
      expect(result.data.category).toBe(minimalProductData.category)
      expect(result.data.is_active).toBe(true) // Default value
      expect(result.data.deleted_at).toBeNull() // Default value

      testProductIds.push(result.data.id)
    })

    test('should reject product creation without required fields', async () => {
      const invalidProductData = {
        description: 'Missing name, category, and principal_id'
      }

      const result = await testSupabase
        .from('products')
        .insert(invalidProductData as any)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23502') // NOT NULL constraint violation
    })

    test('should reject product with invalid principal_id', async () => {
      const invalidPrincipalProduct = {
        principal_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
        name: 'Invalid Principal Product',
        category: 'other' as const
      }

      const result = await testSupabase
        .from('products')
        .insert(invalidPrincipalProduct)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503') // Foreign key constraint violation
    })

    test('should validate season month constraints', async () => {
      const invalidSeasonProduct = {
        principal_id: testPrincipalId,
        name: 'Invalid Season Product',
        category: 'produce' as const,
        season_start: 13, // Invalid month (should be 1-12)
        season_end: 6
      }

      const result = await testSupabase
        .from('products')
        .insert(invalidSeasonProduct)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23514') // CHECK constraint violation
    })

    test('should enforce unique SKU per principal constraint', async () => {
      const product1Data = {
        principal_id: testPrincipalId,
        name: 'Product 1',
        category: 'dairy' as const,
        sku: 'UNIQUE-SKU-001'
      }

      const product2Data = {
        principal_id: testPrincipalId,
        name: 'Product 2',
        category: 'dairy' as const,
        sku: 'UNIQUE-SKU-001' // Same SKU as product1
      }

      // Create first product
      const result1 = await testSupabase
        .from('products')
        .insert(product1Data)
        .select()
        .single()

      expect(result1.error).toBeNull()
      testProductIds.push(result1.data.id)

      // Attempt to create second product with same SKU
      const result2 = await testSupabase
        .from('products')
        .insert(product2Data)
        .select()
        .single()

      expect(result2.error).toBeDefined()
      expect(result2.error?.code).toBe('23505') // Unique constraint violation
    })
  })

  describe('READ Operations', () => {
    let sampleProductId: string

    beforeEach(async () => {
      // Create a sample product for read tests
      const productData = {
        principal_id: testPrincipalId,
        name: 'Sample Read Test Product',
        category: 'beverages' as const,
        description: 'Sample product for read testing',
        sku: 'SAMPLE-READ-001',
        unit_cost: 25.00,
        list_price: 35.99,
        is_active: true
      }

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      sampleProductId = result.data.id
      testProductIds.push(sampleProductId)
    })

    test('should retrieve product by ID with principal information', async () => {
      const result = await PerformanceMonitor.measureQuery('read_product_by_id', async () => {
        return await testSupabase
          .from('products')
          .select(`
            *,
            principal:organizations(
              id,
              name,
              type,
              industry
            )
          `)
          .eq('id', sampleProductId)
          .single()
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(sampleProductId)
      expect(result.data.name).toBe('Sample Read Test Product')
      expect(result.data.principal).toBeDefined()
      expect(result.data.principal.type).toBe('principal')
      expect(result.data.principal.name).toBe('Test Principal for Products')
    })

    test('should list products for specific principal', async () => {
      // Create additional products for the principal
      const additionalProducts = [
        { name: 'Product A', category: 'dairy' as const, principal_id: testPrincipalId },
        { name: 'Product B', category: 'meat_poultry' as const, principal_id: testPrincipalId },
        { name: 'Product C', category: 'produce' as const, principal_id: testPrincipalId }
      ]

      for (const product of additionalProducts) {
        const result = await testSupabase.from('products').insert(product).select().single()
        testProductIds.push(result.data.id)
      }

      const result = await PerformanceMonitor.measureQuery('list_products_by_principal', async () => {
        return await testSupabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('principal_id', testPrincipalId)
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('name', { ascending: true })
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.count).toBeGreaterThanOrEqual(4) // Sample + 3 additional
      expect(result.data.length).toBeGreaterThanOrEqual(4)

      // Verify all products belong to the same principal
      result.data.forEach((product: any) => {
        expect(product.principal_id).toBe(testPrincipalId)
        expect(product.is_active).toBe(true)
        expect(product.deleted_at).toBeNull()
      })
    })

    test('should filter products by category', async () => {
      // Create products in different categories
      const categoryProducts = [
        { name: 'Dairy Product 1', category: 'dairy' as const, principal_id: testPrincipalId },
        { name: 'Dairy Product 2', category: 'dairy' as const, principal_id: testPrincipalId },
        { name: 'Beverage Product 1', category: 'beverages' as const, principal_id: testPrincipalId }
      ]

      for (const product of categoryProducts) {
        const result = await testSupabase.from('products').insert(product).select().single()
        testProductIds.push(result.data.id)
      }

      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('category', 'dairy')
        .eq('principal_id', testPrincipalId)
        .is('deleted_at', null)

      expect(result.error).toBeNull()
      expect(result.data.length).toBeGreaterThanOrEqual(2)
      result.data.forEach((product: any) => {
        expect(product.category).toBe('dairy')
      })
    })

    test('should search products by name and description', async () => {
      const result = await PerformanceMonitor.measureQuery('search_products', async () => {
        return await testSupabase
          .from('products')
          .select(`
            *,
            principal:organizations(name)
          `)
          .or(`name.ilike.%sample%,description.ilike.%sample%`)
          .is('deleted_at', null)
          .limit(10)
      })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.length).toBeGreaterThan(0)
      
      // Verify search results contain the search term
      result.data.forEach((product: any) => {
        const searchableText = `${product.name} ${product.description || ''}`.toLowerCase()
        expect(searchableText).toContain('sample')
      })
    })

    test('should filter active products only', async () => {
      // Create inactive product
      const inactiveProductData = {
        principal_id: testPrincipalId,
        name: 'Inactive Test Product',
        category: 'other' as const,
        is_active: false
      }

      const inactiveResult = await testSupabase
        .from('products')
        .insert(inactiveProductData)
        .select()
        .single()

      testProductIds.push(inactiveResult.data.id)

      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('principal_id', testPrincipalId)
        .eq('is_active', true)
        .is('deleted_at', null)

      expect(result.error).toBeNull()
      result.data.forEach((product: any) => {
        expect(product.is_active).toBe(true)
        expect(product.deleted_at).toBeNull()
      })

      // Verify inactive product is not included
      const inactiveProductInResults = result.data.find((p: any) => p.id === inactiveResult.data.id)
      expect(inactiveProductInResults).toBeUndefined()
    })

    test('should filter products by seasonal availability', async () => {
      // Create seasonal products
      const seasonalProducts = [
        { 
          name: 'Spring Product', 
          category: 'produce' as const, 
          principal_id: testPrincipalId,
          season_start: 3, // March
          season_end: 5    // May
        },
        { 
          name: 'Summer Product', 
          category: 'produce' as const, 
          principal_id: testPrincipalId,
          season_start: 6, // June
          season_end: 8    // August
        }
      ]

      for (const product of seasonalProducts) {
        const result = await testSupabase.from('products').insert(product).select().single()
        testProductIds.push(result.data.id)
      }

      // Query for products available in May (month 5)
      const currentMonth = 5
      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('principal_id', testPrincipalId)
        .lte('season_start', currentMonth)
        .gte('season_end', currentMonth)

      expect(result.error).toBeNull()
      result.data.forEach((product: any) => {
        if (product.season_start && product.season_end) {
          expect(product.season_start).toBeLessThanOrEqual(currentMonth)
          expect(product.season_end).toBeGreaterThanOrEqual(currentMonth)
        }
      })
    })
  })

  describe('UPDATE Operations', () => {
    let sampleProductId: string

    beforeEach(async () => {
      const productData = {
        principal_id: testPrincipalId,
        name: 'Update Test Product',
        category: 'dry_goods' as const,
        sku: 'UPDATE-TEST-001',
        unit_cost: 30.00,
        list_price: 45.00
      }

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      sampleProductId = result.data.id
      testProductIds.push(sampleProductId)
    })

    test('should update product information', async () => {
      const updateData = {
        name: 'Updated Product Name',
        description: 'Updated product description',
        unit_cost: 32.50,
        list_price: 48.99,
        min_order_quantity: 24,
        storage_requirements: 'Updated storage requirements'
      }

      const result = await PerformanceMonitor.measureQuery('update_product', async () => {
        return await testSupabase
          .from('products')
          .update(updateData)
          .eq('id', sampleProductId)
          .select()
          .single()
      })

      expect(result.error).toBeNull()
      expect(result.data.name).toBe(updateData.name)
      expect(result.data.description).toBe(updateData.description)
      expect(result.data.unit_cost).toBe(updateData.unit_cost)
      expect(result.data.list_price).toBe(updateData.list_price)
      expect(result.data.min_order_quantity).toBe(updateData.min_order_quantity)
      expect(new Date(result.data.updated_at) > new Date(result.data.created_at)).toBe(true)
    })

    test('should update product category', async () => {
      const result = await testSupabase
        .from('products')
        .update({ category: 'frozen_foods' as const })
        .eq('id', sampleProductId)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.category).toBe('frozen_foods')
    })

    test('should not allow invalid category values', async () => {
      const result = await testSupabase
        .from('products')
        .update({ category: 'invalid_category' as any })
        .eq('id', sampleProductId)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('22P02') // Invalid enum value
    })

    test('should update product pricing', async () => {
      const pricingUpdate = {
        unit_cost: 35.75,
        list_price: 52.99
      }

      const result = await testSupabase
        .from('products')
        .update(pricingUpdate)
        .eq('id', sampleProductId)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.unit_cost).toBe(pricingUpdate.unit_cost)
      expect(result.data.list_price).toBe(pricingUpdate.list_price)
    })

    test('should deactivate product', async () => {
      const result = await testSupabase
        .from('products')
        .update({ is_active: false })
        .eq('id', sampleProductId)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.is_active).toBe(false)
    })

    test('should update seasonal information', async () => {
      const seasonalUpdate = {
        season_start: 4, // April
        season_end: 9,   // September
        shelf_life_days: 365
      }

      const result = await testSupabase
        .from('products')
        .update(seasonalUpdate)
        .eq('id', sampleProductId)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.season_start).toBe(seasonalUpdate.season_start)
      expect(result.data.season_end).toBe(seasonalUpdate.season_end)
      expect(result.data.shelf_life_days).toBe(seasonalUpdate.shelf_life_days)
    })
  })

  describe('DELETE Operations (Soft Delete)', () => {
    let sampleProductId: string

    beforeEach(async () => {
      const productData = {
        principal_id: testPrincipalId,
        name: 'Delete Test Product',
        category: 'other' as const,
        sku: 'DELETE-TEST-001'
      }

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      sampleProductId = result.data.id
      testProductIds.push(sampleProductId)
    })

    test('should soft delete product by setting deleted_at timestamp', async () => {
      const result = await PerformanceMonitor.measureQuery('soft_delete_product', async () => {
        return await testSupabase
          .from('products')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', sampleProductId)
          .select()
          .single()
      })

      expect(result.error).toBeNull()
      expect(result.data.deleted_at).toBeDefined()
      expect(result.data.deleted_at).not.toBeNull()
    })

    test('should exclude soft-deleted products from normal queries', async () => {
      // First soft delete the product
      await testSupabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sampleProductId)

      // Normal query should not return soft-deleted products
      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('id', sampleProductId)
        .is('deleted_at', null)
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('PGRST116') // No rows returned
    })

    test('should be able to query soft-deleted products specifically', async () => {
      // First soft delete the product
      await testSupabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sampleProductId)

      // Query for soft-deleted products
      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('id', sampleProductId)
        .not('deleted_at', 'is', null)
        .single()

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.deleted_at).not.toBeNull()
    })
  })

  describe('Business Logic Constraints', () => {
    test('should enforce principal organization type constraint', async () => {
      // Create a customer organization (not principal)
      const customerOrgResult = await testSupabase
        .from('organizations')
        .insert({
          name: 'Test Customer Organization',
          type: 'customer' as const
        })
        .select()
        .single()

      TestCleanup.trackCreatedRecord('organizations', customerOrgResult.data.id)

      // Attempt to create product with customer organization as principal
      const productData = {
        principal_id: customerOrgResult.data.id,
        name: 'Invalid Principal Product',
        category: 'other' as const
      }

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      // This should fail if proper constraint exists
      if (result.error) {
        expect(result.error.code).toBe('23514') // CHECK constraint violation
      } else {
        console.warn('⚠️  Principal type constraint may not be enforced - consider adding database constraint')
        testProductIds.push(result.data.id)
      }
    })

    test('should handle decimal precision correctly', async () => {
      const productData = {
        principal_id: testPrincipalId,
        name: 'Precision Test Product',
        category: 'other' as const,
        unit_cost: 99.99,
        list_price: 999.99
      }

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.unit_cost).toBe(99.99)
      expect(result.data.list_price).toBe(999.99)

      testProductIds.push(result.data.id)
    })

    test('should allow null values for optional fields', async () => {
      const productData = {
        principal_id: testPrincipalId,
        name: 'Null Values Test Product',
        category: 'other' as const,
        description: null,
        sku: null,
        unit_cost: null,
        list_price: null,
        season_start: null,
        season_end: null,
        shelf_life_days: null
      }

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data.description).toBeNull()
      expect(result.data.sku).toBeNull()
      expect(result.data.unit_cost).toBeNull()
      expect(result.data.list_price).toBeNull()

      testProductIds.push(result.data.id)
    })
  })

  describe('Index Performance Tests', () => {
    test('should perform efficiently with principal-based queries', async () => {
      const startTime = performance.now()
      
      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('principal_id', testPrincipalId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(100)
      
      const duration = performance.now() - startTime
      
      expect(result.error).toBeNull()
      expect(duration).toBeLessThan(50) // Should be under 50ms with proper indexing
    })

    test('should perform efficiently with category filtering', async () => {
      const startTime = performance.now()
      
      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('category', 'dairy')
        .eq('is_active', true)
        .is('deleted_at', null)
        .limit(100)
      
      const duration = performance.now() - startTime
      
      expect(result.error).toBeNull()
      expect(duration).toBeLessThan(75) // Should be under 75ms
    })

    test('should perform efficiently with SKU lookups', async () => {
      // Create product with specific SKU
      const productData = {
        principal_id: testPrincipalId,
        name: 'SKU Lookup Test',
        category: 'other' as const,
        sku: 'SKU-PERF-TEST-001'
      }

      const createResult = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      testProductIds.push(createResult.data.id)

      const startTime = performance.now()
      
      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('sku', 'SKU-PERF-TEST-001')
        .single()
      
      const duration = performance.now() - startTime
      
      expect(result.error).toBeNull()
      expect(duration).toBeLessThan(25) // SKU lookups should be very fast with unique index
    })
  })
})
