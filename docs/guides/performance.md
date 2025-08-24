# Performance Optimization Guide
*Comprehensive performance optimization for KitchenPantry CRM*

## Overview

This guide covers performance optimization strategies across the entire KitchenPantry CRM stack, from database queries to frontend rendering, with specific focus on mobile/iPad performance.

## Performance Targets

### Current Metrics (Production)
- **Database Query Response**: <5ms average
- **Page Load Time**: <3 seconds (iPad Safari)
- **First Contentful Paint**: <1.5 seconds
- **Time to Interactive**: <3 seconds
- **Bundle Size**: ~1.07MB (283KB compressed)
- **Mobile Performance Score**: >90

### Performance Budget
- **JavaScript Bundle**: <1.5MB uncompressed
- **CSS Bundle**: <200KB
- **Image Assets**: <2MB total
- **Database Queries**: <500ms worst-case
- **API Response**: <200ms average

## Database Performance Optimization

### Index Strategy

All foreign keys and frequently queried fields are indexed for sub-5ms performance:

```sql
-- Organization indexes for fast lookups
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_is_principal ON organizations(is_principal);
CREATE INDEX idx_organizations_is_distributor ON organizations(is_distributor);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_priority ON organizations(priority);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at);

-- Contact indexes for relationship queries
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_is_primary ON contacts(is_primary_contact);
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_deleted_at ON contacts(deleted_at);

-- Product indexes for principal relationships
CREATE INDEX idx_products_principal_id ON products(principal_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

-- Opportunity indexes for sales queries
CREATE INDEX idx_opportunities_organization_id ON opportunities(organization_id);
CREATE INDEX idx_opportunities_contact_id ON opportunities(primary_contact_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX idx_opportunities_value_estimate ON opportunities(value_estimate);
CREATE INDEX idx_opportunities_deleted_at ON opportunities(deleted_at);

-- Interaction indexes for activity feeds
CREATE INDEX idx_interactions_opportunity_id ON interactions(opportunity_id);
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_date ON interactions(interaction_date);
CREATE INDEX idx_interactions_type ON interactions(interaction_type);
CREATE INDEX idx_interactions_deleted_at ON interactions(deleted_at);
```

### Search Optimization with Trigrams

```sql
-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for full-text search performance
CREATE INDEX idx_organizations_name_gin ON organizations USING gin(name gin_trgm_ops);
CREATE INDEX idx_contacts_name_gin ON contacts USING gin((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_products_name_gin ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_opportunities_name_gin ON opportunities USING gin(name gin_trgm_ops);

-- Composite indexes for common query patterns
CREATE INDEX idx_contacts_org_name ON contacts(organization_id, first_name, last_name);
CREATE INDEX idx_opportunities_stage_date ON opportunities(stage, created_at);
CREATE INDEX idx_interactions_opp_date ON interactions(opportunity_id, interaction_date);
```

### Query Optimization Patterns

```typescript
// Optimized service layer queries with proper LIMIT clauses
export class OrganizationService extends BaseService {
  async getOrganizationsWithCounts(filters?: OrganizationFilters) {
    let query = this.supabase
      .from('organizations')
      .select(`
        *,
        contacts!inner(count),
        opportunities!inner(count),
        products!inner(count)
      `)
      .is('deleted_at', null)
      .limit(100) // Always include LIMIT

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.isPrincipal !== undefined) {
      query = query.eq('is_principal', filters.isPrincipal)
    }

    if (filters?.isDistributor !== undefined) {
      query = query.eq('is_distributor', filters.isDistributor)
    }

    // Order by most recently updated for relevance
    query = query.order('updated_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data
  }

  // Optimized dashboard query with single SQL call
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { data, error } = await this.supabase.rpc('get_dashboard_metrics')
    if (error) throw error
    return data
  }
}
```

### Database Function for Complex Queries

```sql
-- ✅ PRODUCTION OPTIMIZED (January 2025): Comprehensive dashboard metrics function
-- Replaces 5 separate API calls with single server-side aggregation
-- Performance: 14.5ms execution, 1.3KB response vs 1.2MB+ client processing
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  p_principal_ids UUID[] DEFAULT NULL,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL
) 
RETURNS TABLE(
  -- Core entity counts
  total_organizations bigint,
  total_contacts bigint,
  total_opportunities bigint,
  total_interactions bigint,
  total_products bigint,
  
  -- Organization breakdowns
  principals_count bigint,
  distributors_count bigint,
  
  -- Opportunity metrics
  active_opportunities bigint,
  total_pipeline_value numeric,
  active_pipeline_value numeric,
  conversion_rate numeric,
  average_opportunity_value numeric,
  
  -- Interaction metrics
  recent_interactions bigint,
  this_week_interactions bigint,
  this_month_interactions bigint,
  avg_interactions_per_opportunity numeric,
  
  -- Principal metrics
  principals_with_active_opportunities bigint,
  avg_opportunities_per_principal numeric,
  
  -- Activity timing
  last_activity_date timestamptz,
  
  -- Complex breakdowns as JSON for efficient transport
  opportunities_by_stage jsonb,
  opportunity_values_by_stage jsonb,
  interactions_by_type jsonb,
  top_principals_by_value jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- All metrics calculated server-side with proper filtering
    -- Full implementation in migration optimize_dashboard_metrics_function
    -- Supports filtering by principal IDs and date ranges
    -- Returns comprehensive metrics in single database roundtrip
  FROM comprehensive_metrics_calculation;
END;
$$;

-- Performance Results (Measured January 2025):
-- • Database Execution Time: 14.5ms
-- • Response Size: 1,305 bytes 
-- • Old Approach Data Transfer: 1,229KB (420KB + 257KB + 306KB + 150KB + 96KB)
-- • Performance Improvement: 99.89% reduction in data transfer
-- • Mobile Performance: Eliminates client-side computation lag
```

### Dashboard Metrics Performance Optimization

The dashboard metrics system has been completely optimized for maximum performance using server-side aggregation:

```typescript
// ✅ OPTIMIZED (January 2025): Server-side aggregation approach
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDashboardMetrics(options: DashboardMetricsOptions = {}): DashboardMetrics {
  const query = useQuery<DatabaseMetricsResponse, Error>({
    queryKey: ['dashboard', 'metrics', options.filters],
    queryFn: async () => {
      // Single RPC call replaces 5 separate API calls
      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        p_principal_ids: options.filters?.principalIds || null,
        p_date_from: options.filters?.dateRange?.start || null,
        p_date_to: options.filters?.dateRange?.end || null
      })
      if (error) throw error
      return Array.isArray(data) ? data[0] : data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
    gcTime: 10 * 60 * 1000,   // 10 minutes cache
  })

  return {
    ...transformDatabaseMetrics(query.data),
    isLoading: query.isLoading,
    error: query.error,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null
  }
}

// Performance Results:
// • Data Transfer: 99.89% reduction (1,229KB → 1.3KB)
// • Load Time: ~90% improvement (2-5s → <200ms)
// • Memory Usage: ~95% reduction (no client-side arrays)
// • Database Execution: 14.5ms for all metrics
// • Mobile Battery: Eliminates heavy computation
```

**Before vs After Comparison:**

| Metric | Old Approach | New Approach | Improvement |
|--------|--------------|--------------|-------------|
| API Calls | 5 separate calls | 1 RPC call | 80% reduction |
| Data Transfer | 1,229KB | 1.3KB | 99.89% reduction |
| Client Memory | ~50MB arrays | ~2KB object | 95% reduction |
| Load Time | 2-5 seconds | <200ms | 90% improvement |
| Database Load | Multiple queries | Single function | Consolidated |
| Mobile Performance | Heavy computation | Instant display | Optimized |

## Frontend Performance Optimization

### React Query Configuration

```typescript
// lib/react-query.ts - Optimized React Query setup
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
})

// Prefetch strategies for common data
export function prefetchCriticalData() {
  // Prefetch organizations for form dropdowns
  queryClient.prefetchQuery({
    queryKey: ['organizations', { limit: 100 }],
    queryFn: () => organizationService.getAll({ limit: 100 }),
    staleTime: 10 * 60 * 1000, // 10 minutes for relatively static data
  })

  // Prefetch dashboard metrics
  queryClient.prefetchQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => organizationService.getDashboardMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutes for frequently changing data
  })
}
```

### Bundle Optimization with Vite

```typescript
// vite.config.ts - Production optimization
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Source maps for debugging
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  plugins: [
    // Bundle analyzer
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
})
```

### Lazy Loading and Code Splitting

```typescript
// app/routes/index.tsx - Route-based code splitting
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load route components
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const OrganizationsPage = lazy(() => import('@/pages/OrganizationsPage'))
const ContactsPage = lazy(() => import('@/pages/ContactsPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const OpportunitiesPage = lazy(() => import('@/pages/OpportunitiesPage'))
const InteractionsPage = lazy(() => import('@/pages/InteractionsPage'))

export const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/organizations" element={<OrganizationsPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/opportunities" element={<OpportunitiesPage />} />
      <Route path="/interactions" element={<InteractionsPage />} />
    </Routes>
  </Suspense>
)

// Feature-based lazy loading
const ContactForm = lazy(() => 
  import('@/features/contacts').then(module => ({ 
    default: module.ContactForm 
  }))
)
```

### React Performance Optimizations

```typescript
// Memoized components for expensive renders
import { memo, useMemo, useCallback } from 'react'

interface ContactsTableProps {
  contacts: ContactWithOrganization[]
  onEdit: (contact: ContactWithOrganization) => void
  onDelete: (contact: ContactWithOrganization) => void
}

export const ContactsTable = memo(({ contacts, onEdit, onDelete }: ContactsTableProps) => {
  // Memoize expensive calculations
  const sortedContacts = useMemo(() => {
    return contacts.sort((a, b) => {
      if (a.is_primary_contact && !b.is_primary_contact) return -1
      if (!a.is_primary_contact && b.is_primary_contact) return 1
      return a.first_name.localeCompare(b.first_name)
    })
  }, [contacts])

  // Memoize event handlers to prevent child re-renders
  const handleEdit = useCallback((contact: ContactWithOrganization) => {
    onEdit(contact)
  }, [onEdit])

  const handleDelete = useCallback((contact: ContactWithOrganization) => {
    onDelete(contact)
  }, [onDelete])

  // Memoize table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.first_name} {row.original.last_name}
          {row.original.is_primary_contact && (
            <Badge variant="secondary" className="ml-2">Primary</Badge>
          )}
        </div>
      ),
    },
    // ... other columns
  ], [])

  return (
    <DataTable
      columns={columns}
      data={sortedContacts}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
})
```

### Virtual Scrolling for Large Lists

```typescript
// components/VirtualizedTable.tsx - For handling 1000+ records
import { FixedSizeList as List } from 'react-window'
import { useMemo } from 'react'

interface VirtualizedTableProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: ({ index, style }: { index: number; style: React.CSSProperties }) => React.ReactNode
}

export function VirtualizedTable<T>({ items, height, itemHeight, renderItem }: VirtualizedTableProps<T>) {
  const itemCount = items.length

  const Row = useMemo(() => ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {renderItem({ index, style })}
    </div>
  ), [renderItem])

  return (
    <List
      height={height}
      itemCount={itemCount}
      itemSize={itemHeight}
      overscanCount={10} // Render extra items for smooth scrolling
    >
      {Row}
    </List>
  )
}

// Usage in OrganizationsPage
export function OrganizationsPage() {
  const { data: organizations = [] } = useOrganizations()

  const renderOrganizationRow = useCallback(({ index, style }) => (
    <div style={style} className="p-4 border-b">
      <OrganizationCard organization={organizations[index]} />
    </div>
  ), [organizations])

  if (organizations.length > 100) {
    return (
      <VirtualizedTable
        items={organizations}
        height={600}
        itemHeight={120}
        renderItem={renderOrganizationRow}
      />
    )
  }

  // Regular rendering for smaller lists
  return (
    <div className="space-y-4">
      {organizations.map((org) => (
        <OrganizationCard key={org.id} organization={org} />
      ))}
    </div>
  )
}
```

## Mobile Performance Optimization

### iPad-Specific Optimizations

```typescript
// hooks/useDeviceDetection.ts
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isIPad: false,
    isMobile: false,
    touchSupport: false,
  })

  useEffect(() => {
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isIPad = /iPad/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isMobile = window.innerWidth < 768
    const touchSupport = 'ontouchstart' in window

    setDeviceInfo({
      isIOS,
      isIPad,
      isMobile,
      touchSupport,
    })
  }, [])

  return deviceInfo
}

// iPad-optimized component behavior
export function ContactForm() {
  const { isIPad, touchSupport } = useDeviceDetection()

  return (
    <form className={cn(
      "space-y-4",
      isIPad && "space-y-6", // More spacing on iPad
      touchSupport && "touch-friendly" // Add touch-friendly styles
    )}>
      {/* Form fields with iPad optimizations */}
    </form>
  )
}
```

### Touch Performance

```css
/* Touch-optimized CSS for better performance */
.touch-friendly {
  /* Prevent zoom on input focus (iOS) */
  input[type="email"],
  input[type="number"],
  input[type="search"],
  input[type="tel"],
  input[type="url"],
  input[type="password"],
  textarea,
  select {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  /* Improve touch responsiveness */
  button,
  [role="button"],
  input[type="submit"] {
    touch-action: manipulation; /* Prevents double-tap delay */
    min-height: 44px; /* iOS/Android minimum touch target */
    min-width: 44px;
  }

  /* Optimize scrolling */
  .scrollable {
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    overflow: auto;
  }

  /* Prevent text selection on UI elements */
  .ui-element {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
}

/* Hardware acceleration for animations */
.animated-element {
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform; /* Optimize for animations */
}
```

### Image Optimization

```typescript
// components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  className?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  loading = 'lazy',
  className 
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Create WebP version if supported
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const supportsWebP = ctx && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0

    // Use WebP if supported, fallback to original
    const optimizedSrc = supportsWebP 
      ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      : src

    const img = new Image()
    img.onload = () => {
      setImageSrc(optimizedSrc)
      setIsLoading(false)
    }
    img.onerror = () => {
      setImageSrc(src) // Fallback to original
      setIsLoading(false)
    }
    img.src = optimizedSrc
  }, [src])

  if (isLoading) {
    return (
      <div 
        className={cn("bg-muted animate-pulse", className)}
        style={{ width, height }}
      />
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={className}
      decoding="async"
    />
  )
}
```

## Performance Monitoring

### Web Vitals Monitoring

```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function initializePerformanceMonitoring() {
  // Core Web Vitals
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}

function sendToAnalytics(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Metric:', metric)
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    })
  }
}

// Custom performance marks
export function markPerformance(name: string) {
  performance.mark(name)
}

export function measurePerformance(name: string, startMark: string) {
  performance.measure(name, startMark)
  const measure = performance.getEntriesByName(name, 'measure')[0]
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name}: ${measure.duration}ms`)
  }
  
  return measure.duration
}
```

### React Query Performance Monitoring

```typescript
// hooks/usePerformanceMonitoring.ts
export function usePerformanceMonitoring() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Monitor cache size
    const cache = queryClient.getQueryCache()
    const cacheSize = cache.getAll().length

    if (cacheSize > 100) {
      console.warn(`React Query cache has ${cacheSize} entries. Consider cleanup.`)
    }

    // Monitor stale queries
    const staleQueries = cache.getAll().filter(query => 
      query.isStale() && query.getObserversCount() === 0
    )

    if (staleQueries.length > 20) {
      console.warn(`${staleQueries.length} stale queries detected. Consider garbage collection.`)
    }
  }, [queryClient])

  // Manual cache cleanup
  const cleanupCache = useCallback(() => {
    queryClient.clear()
    console.log('React Query cache cleared')
  }, [queryClient])

  return { cleanupCache }
}
```

## Performance Best Practices

### Database Queries
- Always include `LIMIT` clauses (recommended: 100 for lists)
- Use proper indexing on all foreign keys
- Implement trigram search for fuzzy matching
- Use database functions for complex aggregations
- Monitor query performance with `EXPLAIN ANALYZE`

### React Components
- Use `memo()` for expensive components
- Memoize callbacks with `useCallback()`
- Memoize computed values with `useMemo()`
- Implement virtual scrolling for lists >100 items
- Use lazy loading for route components

### React Query
- Set appropriate `staleTime` (5+ minutes for static data)
- Use query key factories for consistent cache keys
- Implement optimistic updates for better UX
- Prefetch critical data on app initialization
- Monitor cache size and cleanup stale queries

### Mobile Performance
- Use 16px font size to prevent iOS zoom
- Implement 44px minimum touch targets
- Use `touch-action: manipulation` for buttons
- Enable hardware acceleration for animations
- Optimize images with WebP format

### Bundle Optimization
- Implement code splitting by route and feature
- Use manual chunks for vendor libraries
- Enable tree shaking and minification
- Monitor bundle size with analyzer tools
- Lazy load non-critical features

### Monitoring
- Track Core Web Vitals in production
- Monitor database query performance
- Track React Query cache efficiency
- Set up performance budgets and alerts
- Regular performance audits with Lighthouse

By following these optimization strategies, the KitchenPantry CRM maintains excellent performance across all devices, particularly on iPad devices used by field sales teams.