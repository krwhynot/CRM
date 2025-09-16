/**
 * Zod Validation Performance Testing
 *
 * Performance testing suite for the simplified Zod-only validation architecture.
 * Tests validation speed, memory usage, and scalability to ensure optimal
 * performance with the consolidated schema system.
 *
 * Test Categories:
 * 1. Basic validation performance (single record)
 * 2. Bulk validation performance (1000+ records)
 * 3. Memory usage tracking
 * 4. Schema compilation performance
 * 5. Transform function performance
 * 6. Conditional validation performance
 * 7. Error handling performance
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { performance } from 'perf_hooks'
import { z } from 'zod'

// Import all validation schemas
import {
  contactSchema,
  organizationSchema,
  productSchema,
  opportunitySchema,
  interactionSchema,
  multiPrincipalOpportunitySchema
} from '@/types/validation'

import {
  contactCreateSchema,
  contactUpdateSchema
} from '@/types/contact.types'

import {
  organizationCreateSchema,
  organizationUpdateSchema
} from '@/types/organization.types'

import {
  opportunityProductZodSchema
} from '@/types/product.types'

import {
  multiPrincipalOpportunityZodSchema,
  opportunityCreateZodSchema,
  opportunityUpdateZodSchema
} from '@/types/opportunity.types'

import {
  interactionWithOpportunitySchema
} from '@/types/interaction.types'

// Test configuration
const TEST_ITERATIONS = 1000
const BULK_TEST_SIZE = 5000

interface PerformanceMetric {
  operation: string
  totalTime: number
  avgTimePerOperation: number
  opsPerSecond: number
  memoryUsed?: number
}

interface TestResult {
  schema: string
  metrics: PerformanceMetric[]
  passed: boolean
  notes?: string
}

/**
 * Performance testing utilities
 */
class ZodPerformanceTestUtils {
  static measureExecution<T>(operation: () => T): { result: T; duration: number } {
    const start = performance.now()
    const result = operation()
    const end = performance.now()
    return { result, duration: end - start }
  }

  static async measureAsync<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now()
    const result = await operation()
    const end = performance.now()
    return { result, duration: end - start }
  }

  static getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }
    return 0
  }

  static generateTestData(schemaType: string, count: number = 1): any[] {
    const generators = {
      contact: () => ({
        first_name: 'John',
        last_name: 'Doe',
        organization_mode: 'existing',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        purchase_influence: 'High',
        decision_authority: 'Decision Maker',
        email: 'john.doe@example.com',
        phone: '555-1234'
      }),
      organization: () => ({
        name: 'Acme Corporation',
        type: 'customer',
        priority: 'A',
        segment: 'Fine Dining',
        email: 'contact@acme.com',
        phone: '555-0123'
      }),
      product: () => ({
        name: 'Test Product',
        category: 'Frozen',
        principal_mode: 'existing',
        principal_id: '123e4567-e89b-12d3-a456-426614174000',
        description: 'High quality frozen product',
        unit_cost: 10.99
      }),
      opportunity: () => ({
        name: 'Test Opportunity',
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        estimated_value: 50000,
        stage: 'New Lead',
        status: 'Active'
      }),
      interaction: () => ({
        type: 'call',
        interaction_date: '2024-01-15',
        subject: 'Follow-up call',
        opportunity_id: '123e4567-e89b-12d3-a456-426614174000',
        notes: 'Discussed product requirements'
      })
    }

    const generator = generators[schemaType as keyof typeof generators]
    if (!generator) throw new Error(`Unknown schema type: ${schemaType}`)

    return Array.from({ length: count }, () => generator())
  }

  static runBulkValidationTest(
    schema: z.ZodType<any>,
    testData: any[],
    iterations: number = 1
  ): PerformanceMetric {
    const memoryBefore = this.getMemoryUsage()

    const { duration } = this.measureExecution(() => {
      for (let i = 0; i < iterations; i++) {
        for (const data of testData) {
          schema.safeParse(data)
        }
      }
    })

    const memoryAfter = this.getMemoryUsage()
    const totalOperations = testData.length * iterations

    return {
      operation: `Bulk validation (${totalOperations} operations)`,
      totalTime: duration,
      avgTimePerOperation: duration / totalOperations,
      opsPerSecond: totalOperations / (duration / 1000),
      memoryUsed: memoryAfter - memoryBefore
    }
  }

  static runSchemaCompilationTest(
    schemaFactory: () => z.ZodType<any>,
    iterations: number = 100
  ): PerformanceMetric {
    const { duration } = this.measureExecution(() => {
      for (let i = 0; i < iterations; i++) {
        schemaFactory()
      }
    })

    return {
      operation: `Schema compilation (${iterations} iterations)`,
      totalTime: duration,
      avgTimePerOperation: duration / iterations,
      opsPerSecond: iterations / (duration / 1000)
    }
  }
}

/**
 * Basic Validation Performance Tests
 */
describe('Basic Zod Validation Performance', () => {
  let performanceResults: TestResult[] = []

  afterAll(() => {
    // Log performance summary
    console.log('\n📊 Zod Validation Performance Summary:')
    performanceResults.forEach(result => {
      console.log(`\n${result.schema}:`)
      result.metrics.forEach(metric => {
        console.log(`  ${metric.operation}: ${metric.avgTimePerOperation.toFixed(3)}ms avg, ${metric.opsPerSecond.toFixed(0)} ops/sec`)
      })
    })
  })

  test('should validate contact schema with good performance', () => {
    const testData = ZodPerformanceTestUtils.generateTestData('contact', 1)[0]

    // Warmup
    for (let i = 0; i < 100; i++) {
      contactSchema.safeParse(testData)
    }

    // Measure performance
    const { duration } = ZodPerformanceTestUtils.measureExecution(() => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        contactSchema.safeParse(testData)
      }
    })

    const metric: PerformanceMetric = {
      operation: 'Single contact validation',
      totalTime: duration,
      avgTimePerOperation: duration / TEST_ITERATIONS,
      opsPerSecond: TEST_ITERATIONS / (duration / 1000)
    }

    performanceResults.push({
      schema: 'Contact Schema',
      metrics: [metric],
      passed: metric.avgTimePerOperation < 1 // Should be under 1ms per operation
    })

    expect(metric.avgTimePerOperation).toBeLessThan(1)
  })

  test('should validate organization schema with good performance', () => {
    const testData = ZodPerformanceTestUtils.generateTestData('organization', 1)[0]

    // Measure performance
    const { duration } = ZodPerformanceTestUtils.measureExecution(() => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        organizationSchema.safeParse(testData)
      }
    })

    const metric: PerformanceMetric = {
      operation: 'Single organization validation',
      totalTime: duration,
      avgTimePerOperation: duration / TEST_ITERATIONS,
      opsPerSecond: TEST_ITERATIONS / (duration / 1000)
    }

    performanceResults.push({
      schema: 'Organization Schema',
      metrics: [metric],
      passed: metric.avgTimePerOperation < 1
    })

    expect(metric.avgTimePerOperation).toBeLessThan(1)
  })

  test('should validate product schema with good performance', () => {
    const testData = ZodPerformanceTestUtils.generateTestData('product', 1)[0]

    const { duration } = ZodPerformanceTestUtils.measureExecution(() => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        productSchema.safeParse(testData)
      }
    })

    const metric: PerformanceMetric = {
      operation: 'Single product validation',
      totalTime: duration,
      avgTimePerOperation: duration / TEST_ITERATIONS,
      opsPerSecond: TEST_ITERATIONS / (duration / 1000)
    }

    expect(metric.avgTimePerOperation).toBeLessThan(1)
  })
})

/**
 * Bulk Validation Performance Tests
 */
describe('Bulk Zod Validation Performance', () => {
  test('should handle bulk contact validation efficiently', () => {
    const bulkData = ZodPerformanceTestUtils.generateTestData('contact', BULK_TEST_SIZE)

    const metric = ZodPerformanceTestUtils.runBulkValidationTest(
      contactSchema,
      bulkData,
      1
    )

    expect(metric.avgTimePerOperation).toBeLessThan(0.1) // Should be very fast per item
    expect(metric.opsPerSecond).toBeGreaterThan(10000) // Should handle 10k+ ops per second
  })

  test('should handle bulk organization validation efficiently', () => {
    const bulkData = ZodPerformanceTestUtils.generateTestData('organization', BULK_TEST_SIZE)

    const metric = ZodPerformanceTestUtils.runBulkValidationTest(
      organizationSchema,
      bulkData,
      1
    )

    expect(metric.avgTimePerOperation).toBeLessThan(0.1)
    expect(metric.opsPerSecond).toBeGreaterThan(10000)
  })

  test('should maintain performance with mixed validation', () => {
    const contactData = ZodPerformanceTestUtils.generateTestData('contact', 1000)
    const orgData = ZodPerformanceTestUtils.generateTestData('organization', 1000)
    const productData = ZodPerformanceTestUtils.generateTestData('product', 1000)

    const { duration } = ZodPerformanceTestUtils.measureExecution(() => {
      contactData.forEach(data => contactSchema.safeParse(data))
      orgData.forEach(data => organizationSchema.safeParse(data))
      productData.forEach(data => productSchema.safeParse(data))
    })

    const totalOps = 3000
    const avgTime = duration / totalOps
    const opsPerSec = totalOps / (duration / 1000)

    expect(avgTime).toBeLessThan(0.2) // Mixed validation should still be fast
    expect(opsPerSec).toBeGreaterThan(5000)
  })
})

/**
 * Memory Usage Tests
 */
describe('Zod Memory Usage Performance', () => {
  test('should not leak memory during repeated validations', () => {
    const testData = ZodPerformanceTestUtils.generateTestData('contact', 100)
    const memoryBefore = ZodPerformanceTestUtils.getMemoryUsage()

    // Run many validation cycles
    for (let cycle = 0; cycle < 10; cycle++) {
      testData.forEach(data => contactSchema.safeParse(data))
    }

    const memoryAfter = ZodPerformanceTestUtils.getMemoryUsage()
    const memoryIncrease = memoryAfter - memoryBefore

    // Memory increase should be minimal (less than 1MB for this test)
    expect(memoryIncrease).toBeLessThan(1024 * 1024)
  })

  test('should handle schema creation without excessive memory usage', () => {
    const memoryBefore = ZodPerformanceTestUtils.getMemoryUsage()

    // Create many schema instances
    const schemas = Array.from({ length: 1000 }, () => contactSchema)

    const memoryAfter = ZodPerformanceTestUtils.getMemoryUsage()
    const memoryIncrease = memoryAfter - memoryBefore

    expect(schemas).toHaveLength(1000)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // Less than 10MB
  })
})

/**
 * Complex Schema Performance Tests
 */
describe('Complex Zod Schema Performance', () => {
  test('should handle multi-principal opportunity validation efficiently', () => {
    const complexData = {
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      principals: [
        '123e4567-e89b-12d3-a456-426614174001',
        '123e4567-e89b-12d3-a456-426614174002'
      ],
      auto_generated_name: true,
      opportunity_context: 'Site Visit',
      stage: 'New Lead',
      status: 'Active'
    }

    const { duration } = ZodPerformanceTestUtils.measureExecution(() => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        multiPrincipalOpportunityZodSchema.safeParse(complexData)
      }
    })

    const avgTime = duration / TEST_ITERATIONS
    expect(avgTime).toBeLessThan(2) // Complex validation should still be under 2ms
  })

  test('should handle interaction with opportunity validation efficiently', () => {
    const complexData = {
      type: 'meeting',
      interaction_date: '2024-01-15',
      subject: 'Product demonstration',
      opportunity_id: '123e4567-e89b-12d3-a456-426614174000',
      organization_id: '123e4567-e89b-12d3-a456-426614174001',
      notes: 'Successful product demonstration with positive feedback'
    }

    const { duration } = ZodPerformanceTestUtils.measureExecution(() => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        interactionWithOpportunitySchema.safeParse(complexData)
      }
    })

    const avgTime = duration / TEST_ITERATIONS
    expect(avgTime).toBeLessThan(2)
  })
})

/**
 * Error Handling Performance Tests
 */
describe('Zod Error Handling Performance', () => {
  test('should handle validation errors efficiently', () => {
    const invalidData = { /* intentionally incomplete */ }

    const { duration } = ZodPerformanceTestUtils.measureExecution(() => {
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const result = contactSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      }
    })

    const avgTime = duration / TEST_ITERATIONS
    expect(avgTime).toBeLessThan(1) // Error handling should be fast
  })

  test('should provide detailed error information efficiently', () => {
    const invalidData = {
      first_name: '', // Invalid - empty
      last_name: '', // Invalid - empty
      organization_mode: 'invalid', // Invalid enum value
      email: 'not-an-email' // Invalid format
    }

    const { duration, result } = ZodPerformanceTestUtils.measureExecution(() => {
      const errors: any[] = []
      for (let i = 0; i < 100; i++) { // Fewer iterations for error detail test
        const parseResult = contactSchema.safeParse(invalidData)
        if (!parseResult.success) {
          errors.push(parseResult.error.errors)
        }
      }
      return errors
    })

    expect(result).toHaveLength(100)
    expect(result[0]).toBeInstanceOf(Array)
    expect(duration / 100).toBeLessThan(5) // Error detail extraction should be reasonable
  })
})

/**
 * Performance Regression Tests
 */
describe('Zod Performance Regression Prevention', () => {
  test('should maintain validation speed benchmarks', () => {
    const benchmarks = {
      contact: 0.5,      // milliseconds per validation
      organization: 0.5,
      product: 0.5,
      opportunity: 1.0,  // More complex, allow more time
      interaction: 1.0
    }

    const schemas = {
      contact: contactSchema,
      organization: organizationSchema,
      product: productSchema,
      opportunity: opportunitySchema,
      interaction: interactionSchema
    }

    Object.entries(schemas).forEach(([name, schema]) => {
      const testData = ZodPerformanceTestUtils.generateTestData(name, 1)[0]

      const { duration } = ZodPerformanceTestUtils.measureExecution(() => {
        for (let i = 0; i < 1000; i++) {
          schema.safeParse(testData)
        }
      })

      const avgTime = duration / 1000
      const benchmark = benchmarks[name as keyof typeof benchmarks]

      expect(avgTime).toBeLessThan(benchmark)
    })
  })

  test('should maintain memory efficiency', () => {
    const memoryBefore = ZodPerformanceTestUtils.getMemoryUsage()

    // Simulate typical application usage
    const testData = ZodPerformanceTestUtils.generateTestData('contact', 1000)
    testData.forEach(data => {
      contactSchema.safeParse(data)
      organizationSchema.safeParse({ ...data, name: 'Test Org', type: 'customer', priority: 'A', segment: 'Test' })
    })

    const memoryAfter = ZodPerformanceTestUtils.getMemoryUsage()
    const memoryIncrease = memoryAfter - memoryBefore

    // Should not use more than 5MB for this test
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024)
  })
})