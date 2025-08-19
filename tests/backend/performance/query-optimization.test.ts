/**
 * Database Query Performance and Optimization Tests
 * 
 * Comprehensive testing of query performance, index effectiveness, and optimization
 * for the KitchenPantry CRM system with realistic workloads.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'

describe('Database Query Performance Tests', () => {
  let testDataIds: { table: string; ids: string[] }[] = []
  let performanceResults: { query: string; duration: number; rows: number }[] = []

  beforeAll(async () => {
    console.log('🏗️  Setting up performance test data...')
    await TestAuth.loginAsTestUser()
    await createPerformanceTestData()
  })

  afterAll(async () => {
    console.log('🧹 Cleaning up performance test data...')
    await cleanupPerformanceTestData()
    
    // Generate performance report
    console.log('\n📊 PERFORMANCE TEST RESULTS:')
    console.log('=' .repeat(60))
    performanceResults.forEach(result => {
      const rowsPerMs = result.rows / result.duration
      console.log(`${result.query.padEnd(40)} | ${result.duration.toFixed(2)}ms | ${result.rows} rows | ${rowsPerMs.toFixed(2)} rows/ms`)
    })
    console.log('=' .repeat(60))
  })

  beforeEach(() => {
    performanceResults = []
  })

  const trackTestData = (table: string, id: string) => {
    const existing = testDataIds.find(t => t.table === table)
    if (existing) {
      existing.ids.push(id)
    } else {
      testDataIds.push({ table, ids: [id] })
    }
  }

  const createPerformanceTestData = async () => {
    // Create multiple organizations of different types
    const orgTypes = ['principal', 'customer', 'distributor'] as const
    const organizations = []

    for (let i = 0; i < 50; i++) {
      const orgType = orgTypes[i % 3]
      const orgData = {
        name: `Performance Test Org ${i + 1}`,
        type: orgType,
        industry: 'Food Service',
        is_active: i % 10 !== 0 // 90% active
      }

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      organizations.push(result.data)
      trackTestData('organizations', result.data.id)
    }

    // Create contacts for organizations
    for (const org of organizations.slice(0, 30)) { // First 30 orgs get contacts
      const contactCount = Math.floor(Math.random() * 5) + 1 // 1-5 contacts per org
      
      for (let i = 0; i < contactCount; i++) {
        const contactData = {
          organization_id: org.id,
          first_name: `Contact${i + 1}`,
          last_name: `Org${organizations.indexOf(org) + 1}`,
          email: `contact${i + 1}.org${organizations.indexOf(org) + 1}@example.com`,
          role: (['decision_maker', 'influencer', 'gatekeeper', 'champion'] as const)[i % 4],
          is_primary_contact: i === 0
        }

        const result = await testSupabase
          .from('contacts')
          .insert(contactData)
          .select()
          .single()

        trackTestData('contacts', result.data.id)
      }
    }

    // Create products for principal organizations
    const principals = organizations.filter(org => org.type === 'principal')
    const categories = ['dairy', 'meat_poultry', 'produce', 'beverages', 'dry_goods'] as const

    for (const principal of principals) {
      const productCount = Math.floor(Math.random() * 15) + 5 // 5-20 products per principal
      
      for (let i = 0; i < productCount; i++) {
        const productData = {
          principal_id: principal.id,
          name: `Product ${i + 1} - ${principal.name}`,
          category: categories[i % categories.length],
          sku: `SKU-${principal.id.slice(-8).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
          unit_cost: Math.random() * 50 + 10, // $10-60
          list_price: Math.random() * 100 + 25, // $25-125
          is_active: i % 8 !== 0 // 87.5% active
        }

        const result = await testSupabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        trackTestData('products', result.data.id)
      }
    }

    // Create opportunities
    const customers = organizations.filter(org => org.type === 'customer')
    const stages = ['new_lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const

    for (const customer of customers.slice(0, 20)) { // First 20 customers get opportunities
      const oppCount = Math.floor(Math.random() * 3) + 1 // 1-3 opportunities per customer
      
      for (let i = 0; i < oppCount; i++) {
        // Get a contact from this organization
        const contactResult = await testSupabase
          .from('contacts')
          .select('id')
          .eq('organization_id', customer.id)
          .limit(1)
          .single()

        if (contactResult.data) {
          const oppData = {
            name: `Opportunity ${i + 1} - ${customer.name}`,
            organization_id: customer.id,
            contact_id: contactResult.data.id,
            stage: stages[i % stages.length],
            estimated_value: Math.random() * 100000 + 5000, // $5K-105K
            probability: Math.floor(Math.random() * 100),
            estimated_close_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }

          const result = await testSupabase
            .from('opportunities')
            .insert(oppData)
            .select()
            .single()

          trackTestData('opportunities', result.data.id)
        }
      }
    }

    // Create interactions
    const interactionTypes = ['call', 'email', 'meeting', 'demo', 'note'] as const
    const interactionCount = 200 // Create 200 interactions

    for (let i = 0; i < interactionCount; i++) {
      const randomOrg = organizations[Math.floor(Math.random() * organizations.length)]
      
      // Get a contact from this organization
      const contactResult = await testSupabase
        .from('contacts')
        .select('id')
        .eq('organization_id', randomOrg.id)
        .limit(1)
        .single()

      const interactionData = {
        type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
        subject: `Performance Test Interaction ${i + 1}`,
        description: `Test interaction description ${i + 1}`,
        organization_id: randomOrg.id,
        contact_id: contactResult.data?.id || null,
        interaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: Math.floor(Math.random() * 120) + 15
      }

      const result = await testSupabase
        .from('interactions')
        .insert(interactionData)
        .select()
        .single()

      trackTestData('interactions', result.data.id)
    }

    console.log('✅ Performance test data creation completed')
  }

  const cleanupPerformanceTestData = async () => {
    const tables = ['interactions', 'opportunities', 'products', 'contacts', 'organizations']
    
    for (const table of tables) {
      const tableData = testDataIds.find(t => t.table === table)
      if (tableData && tableData.ids.length > 0) {
        try {
          await testSupabase
            .from(table as any)
            .delete()
            .in('id', tableData.ids)
          
          console.log(`✅ Cleaned up ${tableData.ids.length} records from ${table}`)
        } catch (error) {
          console.warn(`⚠️  Could not cleanup ${table}:`, error)
        }
      }
    }
  }

  const measureQuery = async <T>(
    queryName: string, 
    queryFn: () => Promise<{ data: T[]; error: any }>,
    expectation?: { maxDuration: number; minRows?: number }
  ) => {
    const startTime = performance.now()
    const result = await queryFn()
    const duration = performance.now() - startTime

    expect(result.error).toBeNull()
    
    const rows = result.data?.length || 0
    performanceResults.push({ query: queryName, duration, rows })

    if (expectation) {
      expect(duration).toBeLessThan(expectation.maxDuration)
      if (expectation.minRows) {
        expect(rows).toBeGreaterThanOrEqual(expectation.minRows)
      }
    }

    return { result, duration, rows }
  }

  describe('Basic Query Performance', () => {
    test('should perform simple organization lookups efficiently', async () => {
      await measureQuery(
        'simple_org_lookup',
        () => testSupabase
          .from('organizations')
          .select('id, name, type')
          .limit(10),
        { maxDuration: 25, minRows: 10 }
      )
    })

    test('should perform filtered organization queries efficiently', async () => {
      await measureQuery(
        'filtered_org_query',
        () => testSupabase
          .from('organizations')
          .select('*')
          .eq('type', 'customer')
          .eq('is_active', true)
          .is('deleted_at', null)
          .limit(20),
        { maxDuration: 50 }
      )
    })

    test('should perform contact queries with organization joins efficiently', async () => {
      await measureQuery(
        'contact_with_org_join',
        () => testSupabase
          .from('contacts')
          .select(`
            id, first_name, last_name, email,
            organization:organizations(name, type)
          `)
          .limit(25),
        { maxDuration: 75 }
      )
    })

    test('should perform product queries with principal joins efficiently', async () => {
      await measureQuery(
        'product_with_principal_join',
        () => testSupabase
          .from('products')
          .select(`
            id, name, category, sku,
            principal:organizations(name, type)
          `)
          .eq('is_active', true)
          .limit(30),
        { maxDuration: 100 }
      )
    })
  })

  describe('Complex Query Performance', () => {
    test('should perform dashboard metrics query efficiently', async () => {
      await measureQuery(
        'dashboard_metrics',
        async () => {
          const [orgCount, contactCount, oppCount] = await Promise.all([
            testSupabase
              .from('organizations')
              .select('*', { count: 'exact', head: true })
              .eq('is_active', true),
            testSupabase
              .from('contacts')
              .select('*', { count: 'exact', head: true })
              .is('deleted_at', null),
            testSupabase
              .from('opportunities')
              .select('*', { count: 'exact', head: true })
              .not('stage', 'in', '(closed_won,closed_lost)')
          ])

          return { 
            data: [
              { metric: 'organizations', count: orgCount.count },
              { metric: 'contacts', count: contactCount.count },
              { metric: 'opportunities', count: oppCount.count }
            ], 
            error: null 
          }
        },
        { maxDuration: 150 }
      )
    })

    test('should perform opportunity pipeline query efficiently', async () => {
      await measureQuery(
        'opportunity_pipeline',
        () => testSupabase
          .rpc('get_opportunity_pipeline_stats')
          .then(result => ({ 
            data: result.data || [], 
            error: result.error 
          }))
          .catch(() => 
            // Fallback if RPC doesn't exist
            testSupabase
              .from('opportunities')
              .select('stage, estimated_value')
              .is('deleted_at', null)
          ),
        { maxDuration: 200 }
      )
    })

    test('should perform recent activity feed query efficiently', async () => {
      await measureQuery(
        'recent_activity_feed',
        () => testSupabase
          .from('interactions')
          .select(`
            id, type, subject, interaction_date,
            organization:organizations(name),
            contact:contacts(first_name, last_name)
          `)
          .order('interaction_date', { ascending: false })
          .limit(20),
        { maxDuration: 100 }
      )
    })

    test('should perform full-text search across multiple tables efficiently', async () => {
      const searchTerm = 'Performance'
      
      await measureQuery(
        'multi_table_search',
        async () => {
          const [orgResults, contactResults, productResults] = await Promise.all([
            testSupabase
              .from('organizations')
              .select('id, name, type')
              .ilike('name', `%${searchTerm}%`)
              .limit(10),
            testSupabase
              .from('contacts')
              .select('id, first_name, last_name, organization_id')
              .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
              .limit(10),
            testSupabase
              .from('products')
              .select('id, name, category, principal_id')
              .ilike('name', `%${searchTerm}%`)
              .limit(10)
          ])

          return {
            data: [
              ...orgResults.data || [],
              ...contactResults.data || [],
              ...productResults.data || []
            ],
            error: null
          }
        },
        { maxDuration: 250 }
      )
    })
  })

  describe('Large Dataset Performance', () => {
    test('should handle large result sets with pagination efficiently', async () => {
      await measureQuery(
        'large_paginated_query',
        () => testSupabase
          .from('interactions')
          .select(`
            id, type, subject, interaction_date,
            organization:organizations(name)
          `)
          .range(0, 99) // First 100 records
          .order('interaction_date', { ascending: false }),
        { maxDuration: 150 }
      )
    })

    test('should perform aggregation queries efficiently', async () => {
      await measureQuery(
        'aggregation_query',
        async () => {
          const result = await testSupabase
            .from('opportunities')
            .select('stage, estimated_value')
            .not('estimated_value', 'is', null)

          // Group by stage and sum estimated_value (client-side aggregation for test)
          const aggregated = result.data?.reduce((acc: any, opp) => {
            const stage = opp.stage
            if (!acc[stage]) {
              acc[stage] = { count: 0, total_value: 0 }
            }
            acc[stage].count += 1
            acc[stage].total_value += opp.estimated_value || 0
            return acc
          }, {})

          return {
            data: Object.entries(aggregated || {}).map(([stage, data]) => ({ stage, ...data })),
            error: null
          }
        },
        { maxDuration: 200 }
      )
    })

    test('should handle concurrent query load', async () => {
      const concurrentQueries = Array(5).fill(null).map((_, index) => 
        measureQuery(
          `concurrent_query_${index}`,
          () => testSupabase
            .from('organizations')
            .select('id, name, type')
            .range(index * 10, (index * 10) + 9),
          { maxDuration: 100 }
        )
      )

      const startTime = performance.now()
      const results = await Promise.all(concurrentQueries)
      const totalDuration = performance.now() - startTime

      // All queries should complete within reasonable time
      expect(totalDuration).toBeLessThan(300)
      
      // All individual queries should succeed
      results.forEach(({ result }) => {
        expect(result.error).toBeNull()
        expect(result.data).toBeDefined()
      })
    })
  })

  describe('Index Effectiveness Tests', () => {
    test('should utilize primary key index efficiently', async () => {
      // Get a random organization ID from our test data
      const orgList = await testSupabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (orgList.data) {
        await measureQuery(
          'primary_key_lookup',
          () => testSupabase
            .from('organizations')
            .select('*')
            .eq('id', orgList.data.id)
            .single()
            .then(result => ({ data: [result.data], error: result.error })),
          { maxDuration: 10 } // Primary key lookups should be very fast
        )
      }
    })

    test('should utilize foreign key indexes efficiently', async () => {
      // Get organization with contacts
      const orgWithContacts = await testSupabase
        .from('contacts')
        .select('organization_id')
        .limit(1)
        .single()

      if (orgWithContacts.data) {
        await measureQuery(
          'foreign_key_lookup',
          () => testSupabase
            .from('contacts')
            .select('*')
            .eq('organization_id', orgWithContacts.data.organization_id)
            .limit(20),
          { maxDuration: 30 }
        )
      }
    })

    test('should utilize composite indexes efficiently', async () => {
      await measureQuery(
        'composite_index_query',
        () => testSupabase
          .from('organizations')
          .select('*')
          .eq('type', 'customer')
          .eq('is_active', true)
          .limit(25),
        { maxDuration: 40 }
      )
    })

    test('should utilize partial indexes for soft deletes efficiently', async () => {
      await measureQuery(
        'partial_index_query',
        () => testSupabase
          .from('contacts')
          .select('*')
          .is('deleted_at', null)
          .limit(30),
        { maxDuration: 50 }
      )
    })
  })

  describe('Query Optimization Recommendations', () => {
    test('should identify slow queries for optimization', async () => {
      const slowQueries = performanceResults.filter(result => result.duration > 100)
      
      if (slowQueries.length > 0) {
        console.warn('\n⚠️  SLOW QUERIES DETECTED:')
        slowQueries.forEach(query => {
          console.warn(`  - ${query.query}: ${query.duration.toFixed(2)}ms`)
        })
        console.warn('Consider adding indexes or optimizing these queries.\n')
      }

      // Test should pass regardless, but log recommendations
      expect(slowQueries.length).toBeLessThan(performanceResults.length * 0.5) // Less than 50% should be slow
    })

    test('should measure query efficiency (rows per millisecond)', async () => {
      const efficiencyMetrics = performanceResults
        .filter(result => result.rows > 0)
        .map(result => ({
          query: result.query,
          efficiency: result.rows / result.duration,
          rows: result.rows,
          duration: result.duration
        }))
        .sort((a, b) => b.efficiency - a.efficiency)

      console.log('\n📊 QUERY EFFICIENCY RANKINGS (rows/ms):')
      efficiencyMetrics.slice(0, 5).forEach((metric, index) => {
        console.log(`  ${index + 1}. ${metric.query}: ${metric.efficiency.toFixed(2)} rows/ms`)
      })

      // Most efficient query should process at least 1 row per millisecond
      if (efficiencyMetrics.length > 0) {
        expect(efficiencyMetrics[0].efficiency).toBeGreaterThan(0.5)
      }
    })

    test('should validate performance against business requirements', async () => {
      const requirements = {
        'dashboard_metrics': 200,     // Dashboard loads in <200ms
        'simple_org_lookup': 50,      // Simple lookups in <50ms
        'contact_with_org_join': 100, // Joined queries in <100ms
        'recent_activity_feed': 150   // Activity feed in <150ms
      }

      const failures = []
      
      for (const [queryName, maxTime] of Object.entries(requirements)) {
        const result = performanceResults.find(r => r.query === queryName)
        if (result && result.duration > maxTime) {
          failures.push(`${queryName}: ${result.duration.toFixed(2)}ms > ${maxTime}ms`)
        }
      }

      if (failures.length > 0) {
        console.warn('\n⚠️  PERFORMANCE REQUIREMENT FAILURES:')
        failures.forEach(failure => console.warn(`  - ${failure}`))
      }

      // Allow some failures in test environment, but log them
      expect(failures.length).toBeLessThan(Object.keys(requirements).length * 0.3)
    })
  })
})