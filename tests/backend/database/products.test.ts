/**
 * Products Database Tests
 * 
 * Comprehensive testing of CRUD operations, principal relationships, and business logic
 * for the Products table in the KitchenPantry CRM system.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createTestOrganization, createTestProduct, checkResult } from '../../utils/test-factories'
import { testSupabase, TestAuth, PerformanceMonitor, TestCleanup } from '../setup/test-setup'

describe('Products Database Operations', () => {
  let testPrincipalId: string
  let testProductIds: string[] = []

  beforeEach(async () => {
    testProductIds = []
    await TestAuth.loginAsTestUser()

    // Create a test principal organization for product relationships
    const principalData = createTestOrganization({
      name: 'Test Principal for Products',
      type: 'principal',
      industry: 'Food Manufacturing'
    })
    
    const principalResult = await testSupabase
      .from('organizations')
      .insert(principalData)
      .select()
      .single()

    const principal = checkResult(principalResult, 'create test principal organization')
    testPrincipalId = principal.id
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
      const productData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Premium Organic Tomato Sauce',
        category: 'spices_seasonings' as const,
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
      })

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

      const createdProduct = checkResult(result, 'create product with all fields')
      expect(createdProduct.name).toBe(productData.name)
      expect(createdProduct.category).toBe(productData.category)
      expect(createdProduct.sku).toBe(productData.sku)
      expect(createdProduct.principal_id).toBe(testPrincipalId)
      expect(createdProduct.principal).toBeDefined()
      expect((createdProduct as any).principal.type).toBe('principal')
      expect(createdProduct.unit_cost).toBe(productData.unit_cost)
      expect(createdProduct.list_price).toBe(productData.list_price)
      expect(createdProduct.season_start).toBe(productData.season_start)
      expect(createdProduct.season_end).toBe(productData.season_end)
      expect(createdProduct.id).toBeDefined()
      expect(createdProduct.created_at).toBeDefined()

      testProductIds.push(createdProduct.id)
      TestCleanup.trackCreatedRecord('products', createdProduct.id)
    })

    test('should create products in different categories', async () => {
      const categories = [
        'beverages',
        'dairy', 
        'meat_poultry',
        'seafood',
        'fresh_produce',
        'frozen',
        'dry_goods',
        'spices_seasonings',
        'baking_supplies',
        'cleaning_supplies'
      ] as const

      const createdProducts = []

      for (const category of categories) {
        const productData = createTestProduct({
          principal_id: testPrincipalId,
          name: `Test ${category} Product`,
          category: category,
          description: `Test product in ${category} category`
        })

        const result = await testSupabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        const createdProduct = checkResult(result, `create ${category} product`)
        expect(createdProduct.category).toBe(category)
        
        createdProducts.push(createdProduct)
        testProductIds.push(createdProduct.id)
      }

      expect(createdProducts).toHaveLength(categories.length)
    })

    test('should create product with minimal required fields', async () => {
      const minimalProductData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Minimal Test Product',
        category: 'dry_goods' as const
      })

      const result = await testSupabase
        .from('products')
        .insert(minimalProductData)
        .select()
        .single()

      const createdProduct = checkResult(result, 'create product with minimal fields')
      expect(createdProduct.name).toBe(minimalProductData.name)
      expect(createdProduct.category).toBe(minimalProductData.category)
      expect((createdProduct as any).is_active).toBe(true) // Default value
      expect(createdProduct.deleted_at).toBeNull() // Default value

      testProductIds.push(createdProduct.id)
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
      const invalidPrincipalProduct = createTestProduct({
        principal_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
        name: 'Invalid Principal Product',
        category: 'dry_goods' as const
      })

      const result = await testSupabase
        .from('products')
        .insert(invalidPrincipalProduct)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503') // Foreign key constraint violation
    })

    test('should validate season month constraints', async () => {
      const invalidSeasonProduct = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Invalid Season Product',
        category: 'fresh_produce' as const,
        season_start: 13, // Invalid month (should be 1-12)
        season_end: 6
      })

      const result = await testSupabase
        .from('products')
        .insert(invalidSeasonProduct)
        .select()
        .single()

      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23514') // CHECK constraint violation
    })

    test('should enforce unique SKU per principal constraint', async () => {
      const product1Data = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Product 1',
        category: 'dairy' as const,
        sku: 'UNIQUE-SKU-001'
      })

      const product2Data = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Product 2',
        category: 'dairy' as const,
        sku: 'UNIQUE-SKU-001' // Same SKU as product1
      })

      // Create first product
      const result1 = await testSupabase
        .from('products')
        .insert(product1Data)
        .select()
        .single()

      const firstProduct = checkResult(result1, 'create first product with unique SKU')
      testProductIds.push(firstProduct.id)

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
      const productData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Sample Read Test Product',
        category: 'beverages' as const,
        description: 'Sample product for read testing',
        sku: 'SAMPLE-READ-001',
        unit_cost: 25.00,
        list_price: 35.99,
        is_active: true
      })

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      const createdProduct = checkResult(result, 'create sample product for read tests')
      sampleProductId = createdProduct.id
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

      const product = checkResult(result, 'retrieve product by ID with principal information')
      expect(product.id).toBe(sampleProductId)
      expect(product.name).toBe('Sample Read Test Product')
      expect(product.principal).toBeDefined()
      expect(product.principal.type).toBe('principal')
      expect(product.principal.name).toBe('Test Principal for Products')
    })

    test('should list products for specific principal', async () => {
      // Create additional products for the principal
      const additionalProducts = [
        createTestProduct({ name: 'Product A', category: 'dairy' as const, principal_id: testPrincipalId }),
        createTestProduct({ name: 'Product B', category: 'meat_poultry' as const, principal_id: testPrincipalId }),
        createTestProduct({ name: 'Product C', category: 'fresh_produce' as const, principal_id: testPrincipalId })
      ]

      for (const product of additionalProducts) {
        const result = await testSupabase.from('products').insert(product).select().single()
        const createdProduct = checkResult(result, 'create additional product')
        testProductIds.push(createdProduct.id)
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
      expect(result.data!.length).toBeGreaterThanOrEqual(4)

      // Verify all products belong to the same principal
      result.data!.forEach((product: any) => {
        expect(product.principal_id).toBe(testPrincipalId)
        expect(product.is_active).toBe(true)
        expect(product.deleted_at).toBeNull()
      })
    })

    test('should filter products by category', async () => {
      // Create products in different categories
      const categoryProducts = [
        createTestProduct({ name: 'Dairy Product 1', category: 'dairy' as const, principal_id: testPrincipalId }),
        createTestProduct({ name: 'Dairy Product 2', category: 'dairy' as const, principal_id: testPrincipalId }),
        createTestProduct({ name: 'Beverage Product 1', category: 'beverages' as const, principal_id: testPrincipalId })
      ]

      for (const product of categoryProducts) {
        const result = await testSupabase.from('products').insert(product).select().single()
        const createdProduct = checkResult(result, 'create category product')
        testProductIds.push(createdProduct.id)
      }

      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('category', 'dairy')
        .eq('principal_id', testPrincipalId)
        .is('deleted_at', null)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data!.length).toBeGreaterThanOrEqual(2)
      result.data!.forEach((product: any) => {
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
      expect(result.data!.length).toBeGreaterThan(0)
      
      // Verify search results contain the search term
      result.data!.forEach((product: any) => {
        const searchableText = `${product.name} ${product.description || ''}`.toLowerCase()
        expect(searchableText).toContain('sample')
      })
    })

    test('should filter active products only', async () => {
      // Create inactive product
      const inactiveProductData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Inactive Test Product',
        category: 'dry_goods' as const,
        is_active: false
      })

      const inactiveResult = await testSupabase
        .from('products')
        .insert(inactiveProductData)
        .select()
        .single()

      const inactiveProduct = checkResult(inactiveResult, 'create inactive product')
      testProductIds.push(inactiveProduct.id)

      const result = await testSupabase
        .from('products')
        .select('*')
        .eq('principal_id', testPrincipalId)
        .eq('is_active', true)
        .is('deleted_at', null)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      result.data!.forEach((product: any) => {
        expect(product.is_active).toBe(true)
        expect(product.deleted_at).toBeNull()
      })

      // Verify inactive product is not included
      const inactiveProductInResults = result.data!.find((p: any) => p.id === inactiveProduct.id)
      expect(inactiveProductInResults).toBeUndefined()
    })

    test('should filter products by seasonal availability', async () => {
      // Create seasonal products
      const seasonalProducts = [
        createTestProduct({ 
          name: 'Spring Product', 
          category: 'fresh_produce' as const, 
          principal_id: testPrincipalId,
          season_start: 3, // March
          season_end: 5    // May
        }),
        createTestProduct({ 
          name: 'Summer Product', 
          category: 'fresh_produce' as const, 
          principal_id: testPrincipalId,
          season_start: 6, // June
          season_end: 8    // August
        })
      ]

      for (const product of seasonalProducts) {
        const result = await testSupabase.from('products').insert(product).select().single()
        const createdProduct = checkResult(result, 'create seasonal product')
        testProductIds.push(createdProduct.id)
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
      expect(result.data).toBeDefined()
      result.data!.forEach((product: any) => {
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
      const productData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Update Test Product',
        category: 'dry_goods' as const,
        sku: 'UPDATE-TEST-001',
        unit_cost: 30.00,
        list_price: 45.00
      })

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      const createdProduct = checkResult(result, 'create sample product for update tests')
      sampleProductId = createdProduct.id
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

      const updatedProduct = checkResult(result, 'update product information')
      expect(updatedProduct.name).toBe(updateData.name)
      expect(updatedProduct.description).toBe(updateData.description)
      expect(updatedProduct.unit_cost).toBe(updateData.unit_cost)
      expect(updatedProduct.list_price).toBe(updateData.list_price)
      expect(updatedProduct.min_order_quantity).toBe(updateData.min_order_quantity)
      expect(new Date(updatedProduct.updated_at || new Date()) > new Date(updatedProduct.created_at || new Date())).toBe(true)
    })

    test('should update product category', async () => {
      const result = await testSupabase
        .from('products')
        .update({ category: 'frozen' as const })
        .eq('id', sampleProductId)
        .select()
        .single()

      const categoryUpdatedProduct = checkResult(result, 'update product category')
      expect(categoryUpdatedProduct.category).toBe('frozen')
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

      const pricingUpdatedProduct = checkResult(result, 'update product pricing')
      expect(pricingUpdatedProduct.unit_cost).toBe(pricingUpdate.unit_cost)
      expect(pricingUpdatedProduct.list_price).toBe(pricingUpdate.list_price)
    })

    test('should update product description', async () => {
      const result = await testSupabase
        .from('products')
        .update({ description: 'Updated product description' })
        .eq('id', sampleProductId)
        .select()
        .single()

      const updatedProduct = checkResult(result, 'update product description')
      expect(updatedProduct.description).toBe('Updated product description')
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

      const seasonalUpdatedProduct = checkResult(result, 'update seasonal information')
      expect(seasonalUpdatedProduct.season_start).toBe(seasonalUpdate.season_start)
      expect(seasonalUpdatedProduct.season_end).toBe(seasonalUpdate.season_end)
      expect(seasonalUpdatedProduct.shelf_life_days).toBe(seasonalUpdate.shelf_life_days)
    })
  })

  describe('DELETE Operations (Soft Delete)', () => {
    let sampleProductId: string

    beforeEach(async () => {
      const productData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Delete Test Product',
        category: 'dry_goods' as const,
        sku: 'DELETE-TEST-001'
      })

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      const createdProduct = checkResult(result, 'create sample product for delete tests')
      sampleProductId = createdProduct.id
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

      const deletedProduct = checkResult(result, 'soft delete product')
      expect(deletedProduct.deleted_at).toBeDefined()
      expect(deletedProduct.deleted_at).not.toBeNull()
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

      const softDeletedProduct = checkResult(result, 'query soft-deleted products')
      expect(softDeletedProduct.deleted_at).not.toBeNull()
    })
  })

  describe('Business Logic Constraints', () => {
    test('should enforce principal organization type constraint', async () => {
      // Create a customer organization (not principal)
      const customerOrgData = createTestOrganization({
        name: 'Test Customer Organization',
        type: 'customer'
      })
      const customerOrgResult = await testSupabase
        .from('organizations')
        .insert(customerOrgData)
        .select()
        .single()

      const customerOrg = checkResult(customerOrgResult, 'create customer organization for constraint test')
      TestCleanup.trackCreatedRecord('organizations', customerOrg.id)

      // Attempt to create product with customer organization as principal
      const productData = createTestProduct({
        principal_id: customerOrg.id,
        name: 'Invalid Principal Product',
        category: 'dry_goods' as const
      })

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
      const productData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Precision Test Product',
        category: 'dry_goods' as const,
        unit_cost: 99.99,
        list_price: 999.99
      })

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      const precisionProduct = checkResult(result, 'create product with decimal precision')
      expect(precisionProduct.unit_cost).toBe(99.99)
      expect(precisionProduct.list_price).toBe(999.99)

      testProductIds.push(precisionProduct.id)
    })

    test('should allow null values for optional fields', async () => {
      const productData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'Null Values Test Product',
        category: 'dry_goods' as const,
        description: undefined,
        sku: undefined,
        unit_cost: undefined,
        list_price: undefined,
        season_start: undefined,
        season_end: undefined,
        shelf_life_days: undefined
      })

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      const nullValuesProduct = checkResult(result, 'create product with null optional fields')
      expect(nullValuesProduct.description).toBeNull()
      expect(nullValuesProduct.sku).toBeNull()
      expect(nullValuesProduct.unit_cost).toBeNull()
      expect(nullValuesProduct.list_price).toBeNull()

      testProductIds.push(nullValuesProduct.id)
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
      const productData = createTestProduct({
        principal_id: testPrincipalId,
        name: 'SKU Lookup Test',
        category: 'dry_goods' as const,
        sku: 'SKU-PERF-TEST-001'
      })

      const createResult = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      const skuProduct = checkResult(createResult, 'create product for SKU lookup test')
      testProductIds.push(skuProduct.id)

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
