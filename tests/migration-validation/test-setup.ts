import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 1 },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: { id: 1 },
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: null,
          error: null
        }))
      }))
    }))
  }
}))

// Mock React Router
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  useNavigate: () => vi.fn()
}))

// Global test utilities
global.fetch = vi.fn()
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock layout components that might not exist yet
vi.mock('@/hooks/layout/useLayoutData', () => ({
  useLayoutData: vi.fn(() => ({
    data: {},
    updateData: vi.fn(),
    batchUpdate: vi.fn(),
    bindInput: vi.fn(() => ({ value: '', onChange: vi.fn() }))
  }))
}))

vi.mock('@/lib/layout/data-binding', () => ({
  dataBindingEngine: {
    bind: vi.fn(() => Promise.resolve({ components: [] })),
    bindWithComputed: vi.fn(() => Promise.resolve({ components: [] })),
    bindWithErrorHandling: vi.fn(() => Promise.resolve({ components: [], errors: [] })),
    bindWithTransformations: vi.fn(() => Promise.resolve({ components: [] })),
    bindWithMemoization: vi.fn(() => ({ components: [] }))
  }
}))

vi.mock('@/lib/layout/query-integration', () => ({
  queryIntegration: {
    useSchemaQueries: vi.fn(() => ({ queries: {} })),
    useSchemaMutations: vi.fn(() => ({ mutations: {} }))
  }
}))

vi.mock('@/lib/layout/component-registry', () => ({
  componentRegistry: {
    register: vi.fn(() => ({ success: true })),
    get: vi.fn(() => null),
    resolve: vi.fn(() => Promise.resolve(null)),
    resolveWithFallback: vi.fn(() => Promise.resolve({})),
    getByCategory: vi.fn(() => []),
    addCategory: vi.fn(),
    update: vi.fn(),
    validateProps: vi.fn(() => ({ valid: true })),
    resolveFromSchema: vi.fn(() => Promise.resolve([])),
    validateSchema: vi.fn(() => ({ valid: true })),
    resolveBatch: vi.fn(() => Promise.resolve([])),
    preloadCritical: vi.fn(() => Promise.resolve()),
    wrapWithErrorBoundary: vi.fn(() => ({ render: vi.fn() })),
    export: vi.fn(() => ({ components: [], categories: [], version: '1.0.0' })),
    import: vi.fn(),
    clear: vi.fn()
  }
}))