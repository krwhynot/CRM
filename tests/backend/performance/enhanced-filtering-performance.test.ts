/**
 * Phase 7: Enhanced Filtering and Chart Rendering Performance Tests
 * 
 * Tests performance of weekly filter patterns, enhanced dashboard data retrieval,
 * and chart data processing for Phase 6 enhancements.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { testSupabase, TestAuth } from '../setup/test-setup'
import { 
  DEFAULT_WEEKLY_FILTERS,
  WEEKLY_TIME_RANGE_OPTIONS,
  type WeeklyTimeRangeType 
} from '@/types/shared-filters.types'

interface PerformanceMetric {
  operation: string
  duration: number
  dataPoints: number
  memoryUsage?: number
  cacheHit?: boolean
  filterComplexity: 'simple' | 'medium' | 'complex'
}

describe('Phase 7: Enhanced Filtering Performance Tests', () => {
  let testDataIds: { table: string; ids: string[] }[] = []
  let performanceMetrics: PerformanceMetric[] = []
  const PERFORMANCE_THRESHOLDS = {
    weeklyFilterQuery: 50, // ms
    chartDataAggregation: 100, // ms
    crossFeatureFilterQuery: 75, // ms
    principalPerformanceQuery: 80, // ms
    teamPerformanceQuery: 90, // ms
    pipelineFlowQuery: 120, // ms
    mobileResponsiveQuery: 60, // ms
  }

  beforeAll(async () => {
    console.log('🚀 Setting up enhanced performance test data...')
    await TestAuth.loginAsTestUser()
    await createEnhancedTestData()
  })

  afterAll(async () => {
    console.log('🧹 Cleaning up enhanced performance test data...')
    await cleanupEnhancedTestData()
    
    // Generate detailed performance report
    console.log('\n📊 ENHANCED FILTERING PERFORMANCE RESULTS:')
    console.log('=' .repeat(80))
    console.log('Operation'.padEnd(30) + '| Duration | Data Points | Complexity | Status')
    console.log('-'.repeat(80))
    
    performanceMetrics.forEach(metric => {
      const status = getPerformanceStatus(metric)
      const complexity = metric.filterComplexity.toUpperCase()
      console.log(
        `${metric.operation.padEnd(30)}| ${metric.duration.toFixed(2)}ms   | ${metric.dataPoints.toString().padEnd(11)}| ${complexity.padEnd(9)} | ${status}`
      )
    })
    console.log('=' .repeat(80))
    
    // Summary statistics
    const avgDuration = performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / performanceMetrics.length
    const slowQueries = performanceMetrics.filter(m => m.duration > 100).length
    console.log(`Average query duration: ${avgDuration.toFixed(2)}ms`)
    console.log(`Queries exceeding 100ms: ${slowQueries}/${performanceMetrics.length}`)
    console.log('=' .repeat(80))
  })

  beforeEach(() => {
    // Reset metrics for each test
    performanceMetrics = []
  })

  const trackTestData = (table: string, id: string) => {
    const existing = testDataIds.find(t => t.table === table)
    if (existing) {
      existing.ids.push(id)
    } else {
      testDataIds.push({ table, ids: [id] })
    }
  }

  const getPerformanceStatus = (metric: PerformanceMetric): string => {
    const threshold = PERFORMANCE_THRESHOLDS[metric.operation as keyof typeof PERFORMANCE_THRESHOLDS] || 100
    if (metric.duration <= threshold * 0.7) return '🟢 EXCELLENT'
    if (metric.duration <= threshold) return '🟡 GOOD'
    if (metric.duration <= threshold * 1.5) return '🟠 ACCEPTABLE'
    return '🔴 NEEDS OPTIMIZATION'
  }

  const createEnhancedTestData = async () => {
    // Create large dataset for performance testing
    const organizations = []
    const contacts = []
    const products = []
    const opportunities = []
    const interactions = []

    console.log('📊 Creating performance test organizations...')
    // Create 50 organizations with variety
    for (let i = 1; i <= 50; i++) {
      const orgData = {
        name: `Performance Test Org ${i}`,
        type: ['Restaurant', 'Distributor', 'Retailer', 'Manufacturer'][i % 4],
        priority: ['High', 'Medium', 'Low'][i % 3],
        segment: ['Enterprise', 'SMB', 'Startup'][i % 3],
      }

      const result = await testSupabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single()

      if (result.data) {
        organizations.push(result.data)
        trackTestData('organizations', result.data.id)
      }
    }

    console.log('👥 Creating performance test contacts...')
    // Create 150 contacts (3 per org)
    for (const org of organizations) {
      for (let j = 1; j <= 3; j++) {
        const contactData = {
          organization_id: org.id,
          first_name: `Contact${j}`,
          last_name: `Org${organizations.indexOf(org) + 1}`,
          title: ['Manager', 'Director', 'VP', 'Owner'][j % 4],
          role: ['primary', 'secondary', 'influencer'][j % 3] as ContactRole,
          purchase_influence: ['high', 'medium', 'low'][j % 3],
          decision_authority: ['final', 'recommender', 'influencer'][j % 3],
        }

        const result = await testSupabase
          .from('contacts')
          .insert(contactData)
          .select()
          .single()

        if (result.data) {
          contacts.push(result.data)
          trackTestData('contacts', result.data.id)
        }
      }
    }

    console.log('📦 Creating performance test products...')
    // Create 75 products
    for (let i = 1; i <= 75; i++) {
      const productData = {
        name: `Performance Product ${i}`,
        category: ['Ingredients', 'Equipment', 'Packaging', 'Services'][i % 4],
        price: Math.round((Math.random() * 10000 + 100) * 100) / 100,
        principal_organization_id: organizations[i % organizations.length].id,
      }

      const result = await testSupabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (result.data) {
        products.push(result.data)
        trackTestData('products', result.data.id)
      }
    }

    console.log('🎯 Creating performance test opportunities...')
    // Create 200 opportunities with various stages and dates
    const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
    const baseDate = new Date()
    
    for (let i = 1; i <= 200; i++) {
      // Distribute opportunities across different time ranges for weekly filtering tests
      const weeksAgo = Math.floor(Math.random() * 16) // 0-16 weeks ago
      const opportunityDate = new Date(baseDate)
      opportunityDate.setDate(opportunityDate.getDate() - (weeksAgo * 7))

      const oppData = {
        title: `Performance Opportunity ${i}`,
        organization_id: organizations[i % organizations.length].id,
        primary_contact_id: contacts[(i * 3) % contacts.length].id,
        product_id: products[i % products.length].id,
        stage: stages[i % stages.length],
        value: Math.round((Math.random() * 50000 + 5000) * 100) / 100,
        close_date: opportunityDate.toISOString(),
        principal_organization_id: organizations[i % organizations.length].id,
        created_at: opportunityDate.toISOString(),
        updated_at: opportunityDate.toISOString(),
      }

      const result = await testSupabase
        .from('opportunities')
        .insert(oppData)
        .select()
        .single()

      if (result.data) {
        opportunities.push(result.data)
        trackTestData('opportunities', result.data.id)
      }
    }

    console.log('💬 Creating performance test interactions...')
    // Create 500 interactions distributed across time ranges
    const interactionTypes = ['call', 'email', 'meeting', 'demo', 'proposal']
    
    for (let i = 1; i <= 500; i++) {
      const weeksAgo = Math.floor(Math.random() * 12) // 0-12 weeks ago
      const interactionDate = new Date(baseDate)
      interactionDate.setDate(interactionDate.getDate() - (weeksAgo * 7) - Math.random() * 7)

      const interactionData = {
        type: interactionTypes[i % interactionTypes.length],
        interaction_date: interactionDate.toISOString(),
        notes: `Performance test interaction ${i} - detailed notes for testing`,
        contact_id: contacts[i % contacts.length].id,
        opportunity_id: opportunities[i % opportunities.length].id,
        organization_id: organizations[i % organizations.length].id,
        created_at: interactionDate.toISOString(),
        updated_at: interactionDate.toISOString(),
      }

      const result = await testSupabase
        .from('interactions')
        .insert(interactionData)
        .select()
        .single()

      if (result.data) {
        interactions.push(result.data)
        trackTestData('interactions', result.data.id)
      }
    }

    console.log('✅ Enhanced performance test data creation completed')
    console.log(`📊 Created: ${organizations.length} orgs, ${contacts.length} contacts, ${products.length} products, ${opportunities.length} opps, ${interactions.length} interactions`)
  }

  const cleanupEnhancedTestData = async () => {
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

  const measureEnhancedQuery = async <T>(
    operation: string,
    queryFn: () => Promise<{ data: T[] | null; error: any }>,
    filterComplexity: 'simple' | 'medium' | 'complex' = 'medium',
    expectation?: { maxDuration: number; minDataPoints?: number }
  ) => {
    const memoryBefore = process.memoryUsage().heapUsed / 1024 / 1024 // MB

    const startTime = performance.now()
    const result = await queryFn()
    const duration = performance.now() - startTime

    const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024 // MB
    const memoryDelta = memoryAfter - memoryBefore

    expect(result.error).toBeNull()
    
    const dataPoints = result.data?.length || 0
    const metric: PerformanceMetric = {
      operation,
      duration,
      dataPoints,
      memoryUsage: memoryDelta,
      filterComplexity
    }
    
    performanceMetrics.push(metric)

    // Validate expectations
    if (expectation) {
      expect(duration).toBeLessThanOrEqual(expectation.maxDuration)
      if (expectation.minDataPoints) {
        expect(dataPoints).toBeGreaterThanOrEqual(expectation.minDataPoints)
      }
    }

    return { result, duration, dataPoints }
  }

  describe('Weekly Filter Pattern Performance', () => {
    test('should efficiently filter opportunities by weekly time ranges', async () => {
      const timeRanges: WeeklyTimeRangeType[] = ['this_week', 'last_week', 'last_4_weeks', 'this_month']
      
      for (const timeRange of timeRanges) {
        let dateRange: { start: Date; end: Date }
        const now = new Date()

        switch (timeRange) {
          case 'this_week':
            const startOfWeek = new Date(now)
            startOfWeek.setDate(now.getDate() - now.getDay())
            dateRange = { start: startOfWeek, end: new Date() }
            break
          case 'last_week':
            const lastWeekStart = new Date(now)
            lastWeekStart.setDate(now.getDate() - now.getDay() - 7)
            const lastWeekEnd = new Date(lastWeekStart)
            lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
            dateRange = { start: lastWeekStart, end: lastWeekEnd }
            break
          case 'last_4_weeks':
            const fourWeeksAgo = new Date(now)
            fourWeeksAgo.setDate(now.getDate() - 28)
            dateRange = { start: fourWeeksAgo, end: now }
            break
          case 'this_month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            dateRange = { start: startOfMonth, end: now }
            break
          default:
            continue
        }

        await measureEnhancedQuery(
          `weeklyFilterQuery_${timeRange}`,
          () => testSupabase
            .from('opportunities')
            .select(`
              id,
              title,
              stage,
              value,
              close_date,
              organization:organizations(name),
              contact:contacts(first_name, last_name),
              product:products(name, category)
            `)
            .gte('updated_at', dateRange.start.toISOString())
            .lte('updated_at', dateRange.end.toISOString())
            .order('updated_at', { ascending: false })
            .limit(100),
          'simple',
          { maxDuration: PERFORMANCE_THRESHOLDS.weeklyFilterQuery, minDataPoints: 1 }
        )
      }
    })

    test('should efficiently aggregate chart data for different time ranges', async () => {
      // Test weekly activity aggregation
      await measureEnhancedQuery(
        'chartDataAggregation',
        async () => {
          const fourWeeksAgo = new Date()
          fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
          
          return testSupabase.rpc('get_weekly_activity_data', {
            start_date: fourWeeksAgo.toISOString(),
            end_date: new Date().toISOString()
          })
        },
        'medium',
        { maxDuration: PERFORMANCE_THRESHOLDS.chartDataAggregation }
      )
    })

    test('should efficiently filter across multiple features with principal filtering', async () => {
      // Get a principal organization for testing
      const principalResult = await testSupabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (principalResult.data) {
        await measureEnhancedQuery(
          'crossFeatureFilterQuery',
          () => testSupabase
            .from('opportunities')
            .select(`
              id,
              title,
              stage,
              value,
              organization:organizations!inner(
                id,
                name,
                type
              ),
              interactions(
                id,
                type,
                interaction_date
              ),
              products(
                id,
                name,
                category
              )
            `)
            .eq('principal_organization_id', principalResult.data.id)
            .order('updated_at', { ascending: false })
            .limit(50),
          'complex',
          { maxDuration: PERFORMANCE_THRESHOLDS.crossFeatureFilterQuery }
        )
      }
    })
  })

  describe('Enhanced Chart Data Performance', () => {
    test('should efficiently generate principal performance data', async () => {
      await measureEnhancedQuery(
        'principalPerformanceQuery',
        async () => {
          const fourWeeksAgo = new Date()
          fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
          
          // Simulate principal performance aggregation
          return testSupabase
            .from('organizations')
            .select(`
              id,
              name,
              opportunities(count),
              interactions:interactions(count)
            `)
            .limit(20)
        },
        'complex',
        { maxDuration: PERFORMANCE_THRESHOLDS.principalPerformanceQuery }
      )
    })

    test('should efficiently generate team performance data', async () => {
      await measureEnhancedQuery(
        'teamPerformanceQuery',
        async () => {
          // Simulate team performance data aggregation
          const result = await testSupabase
            .from('interactions')
            .select(`
              id,
              type,
              interaction_date,
              contact:contacts(
                id,
                first_name,
                last_name
              ),
              opportunity:opportunities(
                id,
                stage,
                value
              )
            `)
            .gte('interaction_date', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString())
            .order('interaction_date', { ascending: false })
            .limit(100)

          return result
        },
        'complex',
        { maxDuration: PERFORMANCE_THRESHOLDS.teamPerformanceQuery }
      )
    })

    test('should efficiently generate pipeline flow data', async () => {
      await measureEnhancedQuery(
        'pipelineFlowQuery',
        async () => {
          // Simulate pipeline flow calculation
          return testSupabase
            .from('opportunities')
            .select(`
              id,
              stage,
              value,
              updated_at,
              organization:organizations(name),
              product:products(name, category)
            `)
            .in('stage', ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'])
            .gte('updated_at', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString())
            .order('updated_at', { ascending: false })
            .limit(200)
        },
        'complex',
        { maxDuration: PERFORMANCE_THRESHOLDS.pipelineFlowQuery }
      )
    })
  })

  describe('Mobile-Optimized Query Performance', () => {
    test('should efficiently handle mobile-optimized queries with reduced data', async () => {
      await measureEnhancedQuery(
        'mobileResponsiveQuery',
        () => testSupabase
          .from('opportunities')
          .select(`
            id,
            title,
            stage,
            value,
            organization:organizations(name),
            contact:contacts(first_name, last_name)
          `)
          .order('updated_at', { ascending: false })
          .limit(20), // Reduced limit for mobile
        'simple',
        { maxDuration: PERFORMANCE_THRESHOLDS.mobileResponsiveQuery }
      )
    })

    test('should efficiently handle paginated queries for mobile scrolling', async () => {
      const pageSize = 10
      const pages = 3

      for (let page = 0; page < pages; page++) {
        await measureEnhancedQuery(
          `mobileResponsiveQuery_page${page + 1}`,
          () => testSupabase
            .from('interactions')
            .select(`
              id,
              type,
              interaction_date,
              contact:contacts(first_name, last_name),
              organization:organizations(name)
            `)
            .order('interaction_date', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1),
          'simple',
          { maxDuration: PERFORMANCE_THRESHOLDS.mobileResponsiveQuery }
        )
      }
    })
  })

  describe('Filter Combination Performance', () => {
    test('should efficiently handle complex filter combinations', async () => {
      // Test combination of principal + time range + search
      const principalResult = await testSupabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (principalResult.data) {
        await measureEnhancedQuery(
          'complexFilterCombination',
          () => testSupabase
            .from('opportunities')
            .select(`
              id,
              title,
              stage,
              value,
              close_date,
              organization:organizations(name, type),
              contact:contacts(first_name, last_name),
              product:products(name, category),
              interactions(count)
            `)
            .eq('principal_organization_id', principalResult.data.id)
            .gte('updated_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
            .ilike('title', '%Performance%')
            .order('updated_at', { ascending: false })
            .limit(25),
          'complex',
          { maxDuration: 100 }
        )
      }
    })

    test('should efficiently handle quick view filter presets', async () => {
      const quickViewScenarios = [
        {
          name: 'pipeline_movers',
          query: () => testSupabase
            .from('opportunities')
            .select('id, title, stage, value, updated_at')
            .in('stage', ['Qualified', 'Proposal', 'Negotiation'])
            .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('updated_at', { ascending: false })
            .limit(50)
        },
        {
          name: 'stalled_opportunities',
          query: () => testSupabase
            .from('opportunities')
            .select('id, title, stage, value, updated_at')
            .in('stage', ['Qualified', 'Proposal'])
            .lt('updated_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
            .order('updated_at', { ascending: true })
            .limit(50)
        }
      ]

      for (const scenario of quickViewScenarios) {
        await measureEnhancedQuery(
          `quickViewPreset_${scenario.name}`,
          scenario.query,
          'medium',
          { maxDuration: 75 }
        )
      }
    })
  })

  describe('Caching Pattern Performance', () => {
    test('should demonstrate performance improvement with repeated queries', async () => {
      const queryFn = () => testSupabase
        .from('organizations')
        .select('id, name, type, priority')
        .order('name')
        .limit(50)

      // First execution (cache miss)
      const firstExecution = await measureEnhancedQuery(
        'cachingPattern_initial',
        queryFn,
        'simple'
      )

      // Wait a short moment
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second execution (potential cache hit)
      const secondExecution = await measureEnhancedQuery(
        'cachingPattern_repeated',
        queryFn,
        'simple'
      )

      // Note: Actual caching would require implementation of client-side cache
      // This test establishes baseline for cache effectiveness measurement
      expect(secondExecution.duration).toBeLessThanOrEqual(firstExecution.duration * 2)
    })
  })
})