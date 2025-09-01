# Performance Baselines & Benchmarking Guide

Comprehensive guide to performance testing, monitoring, and baseline management for the KitchenPantry CRM test suite.

## Overview

The CRM test suite includes sophisticated performance monitoring to ensure:

- **Database operations** meet response time requirements
- **Test execution** remains efficient as the suite grows
- **Performance regressions** are caught early  
- **Scalability issues** are identified before production

## Performance Thresholds

### Database Operation Targets

| Operation Type | Target (ms) | Warning (ms) | Critical (ms) |
|----------------|-------------|--------------|---------------|
| Simple INSERT  | < 25        | 50           | 100           |
| Simple SELECT  | < 10        | 25           | 50            |
| Simple UPDATE  | < 25        | 50           | 100           |
| Simple DELETE  | < 15        | 30           | 75            |
| JOIN Queries   | < 75        | 150          | 300           |
| Search Queries | < 100       | 200          | 500           |
| Dashboard Queries | < 150    | 300          | 600           |

### Test Execution Targets

| Test Category | Target Time | Max Entities | Concurrency |
|---------------|-------------|--------------|-------------|
| Unit Tests    | < 5s total  | N/A          | All parallel|
| Backend Tests | < 30s total | 100/test     | 5 parallel  |
| E2E Tests     | < 2min total| 50/test      | 3 parallel  |

### Import Operation Targets

| Import Size | Target Time | Records/Second | Max Memory |
|-------------|-------------|----------------|------------|
| Small (25)  | < 5s        | > 5            | < 50MB     |
| Medium (100)| < 15s       | > 6.7          | < 100MB    |
| Large (500) | < 60s       | > 8.3          | < 200MB    |

## Performance Testing Tools

### 1. DatabaseTestHelper Performance Tracking

```typescript
import { DatabaseTestHelper, PerformanceMonitor } from '../shared/test-utils'

// Automatic performance monitoring
const helper = new DatabaseTestHelper('organization')
const org = await helper.create(orgData) // Automatically tracked

// Check performance metrics
const avgTime = PerformanceMonitor.getAverageQueryTime('create_organization')
expect(avgTime).toBeLessThan(25) // 25ms threshold
```

### 2. Benchmark Suite

```typescript
import { TestPerformanceUtils } from '../shared/test-utils'

// Comprehensive CRUD benchmarking
const results = await TestPerformanceUtils.benchmarkCRUD(
  'organization',
  { name: 'Test Org', type: 'customer' },
  10 // iterations
)

// Validate against thresholds
expect(results.create.avgTime).toBeLessThan(25)
expect(results.read.avgTime).toBeLessThan(10)
expect(results.update.avgTime).toBeLessThan(25)
expect(results.delete.avgTime).toBeLessThan(15)
expect(results.create.successRate).toBeGreaterThan(0.95)
```

### 3. Batch Operation Performance

```typescript
// Test batch performance with different sizes
const batchSizes = [10, 25, 50, 100]
const results = []

for (const size of batchSizes) {
  const startTime = performance.now()
  
  const entities = []
  for (let i = 0; i < size; i++) {
    entities.push(await OrganizationTestHelper.create({
      name: `Batch Org ${i}`,
      type: 'customer'
    }))
  }
  
  const duration = performance.now() - startTime
  const throughput = size / (duration / 1000) // entities per second
  
  results.push({
    batchSize: size,
    duration,
    throughput,
    avgTimePerEntity: duration / size
  })
  
  // Validate throughput doesn't degrade significantly
  expect(throughput).toBeGreaterThan(5) // Minimum 5 entities/second
}
```

## Advanced Performance Testing

### 1. Concurrent Operation Testing

```typescript
async function testConcurrentOperations() {
  const concurrency = 5
  const operationsPerThread = 10
  
  const startTime = performance.now()
  
  // Create concurrent promises
  const threadPromises = Array.from({ length: concurrency }, async (_, threadId) => {
    const threadResults = []
    
    for (let i = 0; i < operationsPerThread; i++) {
      const opStart = performance.now()
      
      const org = await OrganizationTestHelper.create({
        name: `Concurrent Org T${threadId}-${i}`,
        type: 'customer'
      })
      
      const opDuration = performance.now() - opStart
      threadResults.push({ duration: opDuration, id: org.id })
    }
    
    return threadResults
  })
  
  const allResults = await Promise.all(threadPromises)
  const totalDuration = performance.now() - startTime
  
  // Analyze results
  const flatResults = allResults.flat()
  const avgOperationTime = flatResults.reduce((sum, r) => sum + r.duration, 0) / flatResults.length
  const totalOperations = concurrency * operationsPerThread
  const operationsPerSecond = totalOperations / (totalDuration / 1000)
  
  // Performance assertions
  expect(avgOperationTime).toBeLessThan(50) // Operations shouldn't slow down significantly
  expect(operationsPerSecond).toBeGreaterThan(10) // Minimum throughput
  expect(flatResults.length).toBe(totalOperations) // No failures
  
  console.log(`Concurrent Performance Results:`)
  console.log(`- Total Duration: ${totalDuration.toFixed(2)}ms`)
  console.log(`- Avg Operation Time: ${avgOperationTime.toFixed(2)}ms`)
  console.log(`- Operations/Second: ${operationsPerSecond.toFixed(2)}`)
}
```

### 2. Memory Usage Monitoring

```typescript
function measureMemoryUsage<T>(operation: () => Promise<T>): Promise<{
  result: T
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
}> {
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
  
  const memBefore = process.memoryUsage()
  
  return operation().then(result => {
    const memAfter = process.memoryUsage()
    
    return {
      result,
      memoryUsage: {
        heapUsed: memAfter.heapUsed - memBefore.heapUsed,
        heapTotal: memAfter.heapTotal - memBefore.heapTotal,
        external: memAfter.external - memBefore.external,
        rss: memAfter.rss - memBefore.rss
      }
    }
  })
}

// Usage
test('should not leak memory during batch operations', async () => {
  const { result, memoryUsage } = await measureMemoryUsage(async () => {
    const entities = []
    for (let i = 0; i < 100; i++) {
      entities.push(await OrganizationTestHelper.create({
        name: `Memory Test ${i}`,
        type: 'customer'
      }))
    }
    return entities
  })
  
  expect(result).toHaveLength(100)
  expect(memoryUsage.heapUsed).toBeLessThan(50 * 1024 * 1024) // 50MB limit
})
```

### 3. Database Query Optimization Testing

```typescript
async function testQueryOptimization() {
  // Create test data
  const organizations = await Promise.all(
    Array.from({ length: 100 }, (_, i) =>
      OrganizationTestHelper.create({
        name: `Query Test Org ${i}`,
        type: i % 3 === 0 ? 'principal' : i % 3 === 1 ? 'customer' : 'distributor',
        segment: i % 2 === 0 ? 'Fine Dining' : 'Fast Food'
      })
    )
  )
  
  // Test different query patterns
  const queryTests = [
    {
      name: 'Simple filter by type',
      query: () => OrganizationTestHelper.list({ type: 'principal' }),
      expectedThreshold: 25 // ms
    },
    {
      name: 'Complex filter with multiple conditions',
      query: () => OrganizationTestHelper.list({ 
        type: 'customer', 
        segment: 'Fine Dining' 
      }),
      expectedThreshold: 50 // ms
    },
    {
      name: 'Large result set',
      query: () => OrganizationTestHelper.list({}, 1000),
      expectedThreshold: 100 // ms
    }
  ]
  
  const results = []
  
  for (const test of queryTests) {
    const times = []
    
    // Run each query multiple times
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now()
      await test.query()
      const duration = performance.now() - startTime
      times.push(duration)
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    
    results.push({
      name: test.name,
      avgTime,
      minTime,
      maxTime,
      threshold: test.expectedThreshold,
      passed: avgTime < test.expectedThreshold
    })
    
    // Validate performance
    expect(avgTime).toBeLessThan(test.expectedThreshold)
  }
  
  // Log results for analysis
  console.log('Query Optimization Results:')
  results.forEach(result => {
    console.log(`${result.name}: ${result.avgTime.toFixed(2)}ms (threshold: ${result.threshold}ms)`)
  })
}
```

## Performance Regression Testing

### 1. Baseline Establishment

```typescript
interface PerformanceBaseline {
  entityType: string
  operation: string
  averageTime: number
  minTime: number
  maxTime: number
  throughput: number
  timestamp: Date
  testConditions: {
    iterations: number
    concurrency: number
    dataSize: string
  }
}

async function establishBaseline(entityType: EntityType): Promise<PerformanceBaseline> {
  const testData = createTestEntity(entityType, {})
  const results = await TestPerformanceUtils.benchmarkCRUD(entityType, testData, 20)
  
  return {
    entityType,
    operation: 'crud_baseline',
    averageTime: (results.create.avgTime + results.read.avgTime + 
                  results.update.avgTime + results.delete.avgTime) / 4,
    minTime: Math.min(results.create.avgTime, results.read.avgTime,
                     results.update.avgTime, results.delete.avgTime),
    maxTime: Math.max(results.create.avgTime, results.read.avgTime,
                     results.update.avgTime, results.delete.avgTime),
    throughput: 20 / ((results.create.avgTime + results.read.avgTime + 
                      results.update.avgTime + results.delete.avgTime) / 1000),
    timestamp: new Date(),
    testConditions: {
      iterations: 20,
      concurrency: 1,
      dataSize: 'small'
    }
  }
}
```

### 2. Regression Detection

```typescript
function detectPerformanceRegression(
  current: PerformanceBaseline,
  previous: PerformanceBaseline
): {
  hasRegression: boolean
  regressionDetails: string[]
} {
  const regressionThreshold = 1.2 // 20% increase is considered regression
  const details: string[] = []
  
  if (current.averageTime > previous.averageTime * regressionThreshold) {
    details.push(`Average time increased by ${((current.averageTime / previous.averageTime - 1) * 100).toFixed(1)}%`)
  }
  
  if (current.throughput < previous.throughput / regressionThreshold) {
    details.push(`Throughput decreased by ${((1 - current.throughput / previous.throughput) * 100).toFixed(1)}%`)
  }
  
  if (current.maxTime > previous.maxTime * 1.5) { // 50% increase in max time
    details.push(`Maximum time increased significantly`)
  }
  
  return {
    hasRegression: details.length > 0,
    regressionDetails: details
  }
}

// Usage in CI/CD
test('should not have performance regression', async () => {
  const currentBaseline = await establishBaseline('organization')
  const previousBaseline = loadPreviousBaseline('organization') // From saved results
  
  const regression = detectPerformanceRegression(currentBaseline, previousBaseline)
  
  if (regression.hasRegression) {
    console.warn('Performance regression detected:', regression.regressionDetails)
    
    // In CI, this might be a warning rather than failure
    // expect(regression.hasRegression).toBe(false)
  }
  
  // Save current baseline for next run
  saveBaseline(currentBaseline)
})
```

## Monitoring & Alerting

### 1. Real-time Performance Monitoring

```typescript
class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()
  
  static recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }
    
    this.metrics.get(operation)!.push(duration)
    
    // Alert on immediate performance issues
    if (duration > this.getThreshold(operation) * 2) {
      console.warn(`⚠️  SLOW OPERATION: ${operation} took ${duration.toFixed(2)}ms`)
    }
  }
  
  static getRealtimeStats(operation: string): {
    count: number
    average: number
    recent: number // Last 10 operations average
    trend: 'improving' | 'stable' | 'degrading'
  } {
    const metrics = this.metrics.get(operation) || []
    const recent = metrics.slice(-10)
    const older = metrics.slice(-20, -10)
    
    const recentAvg = recent.reduce((sum, m) => sum + m, 0) / recent.length || 0
    const olderAvg = older.reduce((sum, m) => sum + m, 0) / older.length || 0
    
    let trend: 'improving' | 'stable' | 'degrading' = 'stable'
    if (recentAvg > olderAvg * 1.1) trend = 'degrading'
    else if (recentAvg < olderAvg * 0.9) trend = 'improving'
    
    return {
      count: metrics.length,
      average: metrics.reduce((sum, m) => sum + m, 0) / metrics.length || 0,
      recent: recentAvg,
      trend
    }
  }
}
```

### 2. Performance Dashboard

```typescript
function generatePerformanceDashboard(): string {
  const operations = [
    'create_organization',
    'read_organization', 
    'update_organization',
    'delete_organization',
    'list_organizations'
  ]
  
  let dashboard = '\n📊 PERFORMANCE DASHBOARD\n'
  dashboard += '=' .repeat(50) + '\n'
  
  operations.forEach(op => {
    const stats = PerformanceMonitor.getRealtimeStats(op)
    const threshold = getPerformanceThreshold(op)
    const status = stats.average < threshold ? '✅' : stats.average < threshold * 1.5 ? '⚠️' : '❌'
    const trendIcon = stats.trend === 'improving' ? '📈' : stats.trend === 'degrading' ? '📉' : '➡️'
    
    dashboard += `${status} ${op.padEnd(20)} | ${stats.average.toFixed(2)}ms avg | ${trendIcon} ${stats.trend}\n`
  })
  
  dashboard += '=' .repeat(50) + '\n'
  return dashboard
}

// Usage in test teardown
afterAll(() => {
  console.log(generatePerformanceDashboard())
})
```

## Performance Best Practices

### 1. Database Connection Management

```typescript
// ✅ Good: Reuse connections
const testSupabase = createClient(url, key, {
  db: { schema: 'public' },
  global: { headers: { 'Connection': 'keep-alive' } }
})

// ❌ Avoid: Creating new connections per test
test('bad example', async () => {
  const newClient = createClient(url, key) // Don't do this
})
```

### 2. Efficient Test Data Cleanup

```typescript
// ✅ Good: Batch cleanup
afterEach(async () => {
  // Single query to cleanup all test data
  await testSupabase
    .from('organizations')
    .delete()
    .in('id', testEntityIds)
})

// ❌ Avoid: Individual deletes
afterEach(async () => {
  for (const id of testEntityIds) {
    await testSupabase.from('organizations').delete().eq('id', id) // Slow
  }
})
```

### 3. Smart Test Parallelization

```typescript
// ✅ Good: Controlled concurrency
test.concurrent.each([
  { type: 'customer', count: 10 },
  { type: 'principal', count: 8 },
  { type: 'distributor', count: 12 }
])('should handle $type organizations', async ({ type, count }) => {
  // Tests run in parallel but with controlled resource usage
})

// ❌ Avoid: Uncontrolled parallel operations
test('bad parallel test', async () => {
  const promises = Array.from({ length: 1000 }, () => 
    OrganizationTestHelper.create({}) // Too many concurrent operations
  )
  await Promise.all(promises)
})
```

### 4. Performance-Aware Assertions

```typescript
// ✅ Good: Performance-aware testing
test('should create organization efficiently', async () => {
  const startTime = performance.now()
  
  const org = await OrganizationTestHelper.create({
    name: 'Performance Test Org',
    type: 'customer'
  })
  
  const duration = performance.now() - startTime
  
  expect(org).toHaveProperty('id')
  expect(org.name).toBe('Performance Test Org')
  expect(duration).toBeLessThan(25) // Performance assertion
})
```

## Troubleshooting Performance Issues

### 1. Slow Database Operations

```typescript
// Debug query performance
async function debugSlowQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()
  
  try {
    const result = await queryFn()
    const duration = performance.now() - startTime
    
    if (duration > 100) { // Slow query threshold
      console.warn(`🐌 Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`)
      console.warn('Consider adding indexes or optimizing query logic')
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`❌ Query failed: ${queryName} after ${duration.toFixed(2)}ms`, error)
    throw error
  }
}
```

### 2. Memory Leak Detection

```typescript
test('should detect memory leaks', async () => {
  // Force garbage collection
  if (global.gc) global.gc()
  
  const initialMemory = process.memoryUsage().heapUsed
  
  // Perform operations that might leak memory
  for (let i = 0; i < 100; i++) {
    await OrganizationTestHelper.create({
      name: `Memory Test ${i}`,
      type: 'customer'
    })
  }
  
  // Force garbage collection again
  if (global.gc) global.gc()
  
  const finalMemory = process.memoryUsage().heapUsed
  const memoryIncrease = finalMemory - initialMemory
  
  // Should not increase memory by more than reasonable amount
  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 10MB
  
  if (memoryIncrease > 5 * 1024 * 1024) { // 5MB warning threshold
    console.warn(`⚠️  Memory usage increased by ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
  }
})
```

## Continuous Performance Monitoring

### 1. CI/CD Integration

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run performance tests
        run: npm run test:performance
        
      - name: Upload performance results
        uses: actions/upload-artifact@v2
        with:
          name: performance-results
          path: performance-results.json
          
      - name: Performance regression check
        run: npm run check-performance-regression
```

### 2. Performance Metrics Collection

```typescript
// Collect and store performance metrics
export function collectPerformanceMetrics(): PerformanceReport {
  return {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      cpus: os.cpus().length
    },
    testResults: PerformanceMonitor.getAllMetrics(),
    thresholds: DEFAULT_PERFORMANCE_THRESHOLDS,
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      averageExecutionTime: 0
    }
  }
}
```

By following these performance guidelines and using the provided tools, you can ensure that your CRM tests remain fast, reliable, and scalable as the system grows.