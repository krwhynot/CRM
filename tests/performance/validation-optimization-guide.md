# Validation Performance Optimization Guide
## Zod Schema Performance Best Practices

This guide provides specific optimization techniques for improving Zod validation performance based on the comprehensive performance testing results.

## Performance Optimization Techniques

### 1. Schema Structure Optimization

#### ✅ Use Compiled Schema Patterns
```typescript
// ❌ Inefficient: Runtime schema creation
const createDynamicSchema = (mode: string) => {
  return z.object({
    name: z.string(),
    mode: z.literal(mode),
    // ... other fields
  })
}

// ✅ Efficient: Pre-compiled schemas
const existingOrgSchema = z.object({
  name: z.string(),
  organization_id: z.string().uuid(),
})

const newOrgSchema = z.object({
  name: z.string(),
  organization_name: z.string(),
  organization_type: z.enum(['customer', 'principal']),
})

const contactSchema = z.discriminatedUnion('organization_mode', [
  existingOrgSchema.extend({ organization_mode: z.literal('existing') }),
  newOrgSchema.extend({ organization_mode: z.literal('new') })
])
```

#### ✅ Optimize Conditional Validation
```typescript
// ❌ Inefficient: Complex superRefine logic
const slowSchema = z.object({
  mode: z.enum(['new', 'existing']),
  name: z.string().optional(),
  id: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === 'new') {
    // Complex validation logic here
    if (!data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name required for new mode',
        path: ['name']
      })
    }
  }
  // More complex logic...
})

// ✅ Efficient: Discriminated unions
const fastSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('new'),
    name: z.string().min(1, 'Name required for new mode'),
    id: z.string().optional()
  }),
  z.object({
    mode: z.literal('existing'),
    name: z.string().optional(),
    id: z.string().uuid('Valid ID required for existing mode')
  })
])
```

### 2. Transform Function Optimization

#### ✅ Efficient Transform Patterns
```typescript
// ❌ Inefficient: Multiple transform steps
const slowTransform = z.string()
  .transform(val => val?.trim())
  .transform(val => val?.toLowerCase())
  .transform(val => val === '' ? null : val)

// ✅ Efficient: Single transform step
const fastTransform = z.string().transform(val => {
  if (!val || typeof val !== 'string') return null
  const processed = val.trim().toLowerCase()
  return processed === '' ? null : processed
})
```

#### ✅ Cached Transform Functions
```typescript
// ✅ Pre-compiled transform functions
export const ZodTransforms = {
  nullableEmail: z.preprocess((val) => {
    if (!val || typeof val !== 'string') return null
    const processed = val.trim().toLowerCase()
    return processed === '' ? null : processed
  }, z.string().email().nullable()),

  uuidField: z.preprocess((val) => {
    if (!val || typeof val !== 'string') return null
    const trimmed = val.trim()
    // Pre-compiled UUID regex for performance
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(trimmed) ? trimmed : null
  }, z.string().uuid().nullable())
}
```

### 3. Memory Usage Optimization

#### ✅ Schema Instance Management
```typescript
// ❌ Memory inefficient: Creating new schemas repeatedly
function validateContacts(contacts: any[]) {
  return contacts.map(contact => {
    const schema = z.object({
      first_name: z.string(),
      last_name: z.string(),
      // ... more fields
    })
    return schema.parse(contact)
  })
}

// ✅ Memory efficient: Reuse schema instances
const contactSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  // ... more fields
})

function validateContacts(contacts: any[]) {
  return contacts.map(contact => contactSchema.parse(contact))
}
```

#### ✅ Lazy Schema Loading
```typescript
// ✅ Lazy loading for complex schemas
const getComplexSchema = (() => {
  let cachedSchema: z.ZodType<any> | null = null

  return () => {
    if (!cachedSchema) {
      cachedSchema = z.object({
        // Complex schema definition
      }).refine((data) => {
        // Expensive validation logic
        return true
      })
    }
    return cachedSchema
  }
})()
```

### 4. Bulk Validation Optimization

#### ✅ Batch Processing Pattern
```typescript
// ✅ Optimized bulk validation
export class BulkValidator<T> {
  private schema: z.ZodType<T>
  private batchSize: number

  constructor(schema: z.ZodType<T>, batchSize = 100) {
    this.schema = schema
    this.batchSize = batchSize
  }

  async validateBatch(items: any[]): Promise<{
    valid: T[]
    invalid: { item: any; errors: z.ZodError }[]
  }> {
    const valid: T[] = []
    const invalid: { item: any; errors: z.ZodError }[] = []

    // Process in batches to manage memory
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize)

      for (const item of batch) {
        const result = this.schema.safeParse(item)
        if (result.success) {
          valid.push(result.data)
        } else {
          invalid.push({ item, errors: result.error })
        }
      }

      // Allow garbage collection between batches
      if (i % (this.batchSize * 10) === 0) {
        await new Promise(resolve => setImmediate(resolve))
      }
    }

    return { valid, invalid }
  }
}
```

### 5. Error Handling Optimization

#### ✅ Efficient Error Processing
```typescript
// ✅ Optimized error handling
function extractValidationErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  for (const issue of error.errors) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  }

  return errors
}

// ✅ Early validation termination
const efficientSchema = z.object({
  email: z.string().email(),
  // Use safeParse for non-critical validations
}).safeParse
```

## Specific Schema Optimizations

### Opportunity Schema Performance Fix

The opportunity schema showed a 45.8% performance regression. Apply these optimizations:

```typescript
// ❌ Current opportunity schema (hypothetical issue)
const slowOpportunitySchema = z.object({
  // Many fields with complex validation
}).superRefine((data, ctx) => {
  // Complex validation logic
})

// ✅ Optimized opportunity schema
const fastOpportunitySchema = z.discriminatedUnion('type', [
  // Split into specific schemas based on opportunity type
  z.object({
    type: z.literal('standard'),
    // Standard opportunity fields
  }),
  z.object({
    type: z.literal('multi_principal'),
    // Multi-principal specific fields
  })
])
```

### Interaction Schema Performance Fix

The interaction schema showed an 18.8% performance regression:

```typescript
// ✅ Optimized interaction schema
const fastInteractionSchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'demo', 'follow_up']),
  subject: z.string().min(1).max(255),
  // Use preprocess for expensive operations
  interaction_date: z.preprocess(
    (val) => val instanceof Date ? val : new Date(val as string),
    z.date()
  ),
  // Cache frequently used validations
  organization_id: ZodTransforms.uuidField,
  contact_id: ZodTransforms.uuidField,
})
```

## Performance Monitoring

### Production Performance Tracking

```typescript
// ✅ Performance monitoring wrapper
export function createPerformanceTrackedSchema<T>(
  schema: z.ZodType<T>,
  schemaName: string
) {
  return {
    parse: (data: unknown) => {
      const start = performance.now()
      try {
        const result = schema.parse(data)
        const duration = performance.now() - start

        // Log slow validations
        if (duration > 10) {
          console.warn(`Slow validation: ${schemaName} took ${duration.toFixed(2)}ms`)
        }

        return result
      } catch (error) {
        const duration = performance.now() - start
        console.warn(`Failed validation: ${schemaName} took ${duration.toFixed(2)}ms`)
        throw error
      }
    },

    safeParse: (data: unknown) => {
      const start = performance.now()
      const result = schema.safeParse(data)
      const duration = performance.now() - start

      // Track validation metrics
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('validation_performance', {
          schema: schemaName,
          duration,
          success: result.success
        })
      }

      return result
    }
  }
}
```

### Regression Detection

```typescript
// ✅ Performance regression detection
export class ValidationPerformanceMonitor {
  private baselines: Map<string, number> = new Map()

  setBaseline(schemaName: string, expectedDuration: number) {
    this.baselines.set(schemaName, expectedDuration)
  }

  checkPerformance(schemaName: string, actualDuration: number) {
    const baseline = this.baselines.get(schemaName)
    if (!baseline) return

    const regression = ((actualDuration - baseline) / baseline) * 100

    if (regression > 20) {
      console.error(`Performance regression detected: ${schemaName} is ${regression.toFixed(1)}% slower than baseline`)
    }
  }
}
```

## Implementation Checklist

### ✅ High Priority (Week 1)
- [ ] Optimize opportunity and interaction schemas
- [ ] Implement discriminated union patterns where applicable
- [ ] Cache frequently used transform functions
- [ ] Fix validation schema alignment issues

### ✅ Medium Priority (Week 2)
- [ ] Implement bulk validation optimizations
- [ ] Add performance monitoring wrappers
- [ ] Create schema instance management patterns
- [ ] Optimize memory usage for large datasets

### ✅ Low Priority (Week 3)
- [ ] Implement lazy loading for complex schemas
- [ ] Add performance regression detection
- [ ] Create comprehensive performance benchmarks
- [ ] Document optimization patterns for team

## Validation Rules for Optimized Schemas

1. **Discriminated Unions > SuperRefine**: Use discriminated unions instead of complex superRefine logic
2. **Preprocess Once**: Combine multiple transform steps into single preprocess functions
3. **Cache Schema Instances**: Never recreate schemas inside loops
4. **Batch Large Datasets**: Process bulk validations in manageable batches
5. **Monitor Performance**: Track validation times in production
6. **Early Termination**: Use safeParse for non-critical validations
7. **Memory Management**: Allow garbage collection during bulk operations

## Expected Performance Improvements

Following these optimizations should deliver:

- **Opportunity Schema**: Target 20-30% improvement over current regression
- **Interaction Schema**: Target 15-25% improvement over current regression
- **Memory Usage**: 20-40% reduction in memory footprint
- **Bulk Validation**: 50-100% improvement in large dataset processing
- **Error Handling**: 10-20% faster error processing

---

*Apply these optimizations systematically and measure performance impact after each change.*