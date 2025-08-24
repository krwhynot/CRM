# State Management Architecture Guide

## Overview

This CRM application follows a clear separation between client-side and server-side state management, implemented in January 2025 to align with React best practices.

## Architecture Principles

### 🗄️ **Server State (TanStack Query)**
**Location**: `/src/features/*/hooks/`  
**Purpose**: Data that originates from or is synchronized with the server/database

**Examples:**
- User data, organizations, contacts, opportunities
- API responses and database records
- Authentication status from server
- Real-time data subscriptions

```typescript
// ✅ Good - Server data via TanStack Query
const { data: organizations, isLoading } = useOrganizations(filters)
const createMutation = useCreateOrganization()
```

### 🎨 **Client State (Zustand)**
**Location**: `/src/stores/`  
**Purpose**: UI state, preferences, and temporary data that exists only in the browser

**Examples:**
- Form state and validation UI flags
- View modes (list, cards, table)
- Filter selections and search queries
- Modal/dialog open states
- User preferences and settings

```typescript
// ✅ Good - Client UI state via Zustand
const { viewMode, setViewMode } = useAdvocacyView()
const { isFormOpen, openCreateForm } = useAdvocacyForm()
```

## Migration Guide

### ❌ **Before (Mixed State)**
```typescript
// Bad: Server operations in Zustand store
const useOldStore = create((set, get) => ({
  data: [],
  fetchData: async () => {
    const response = await supabase.from('table').select('*')
    set({ data: response.data })
  }
}))
```

### ✅ **After (Separated State)**
```typescript
// Good: Server data via TanStack Query
export function useTableData() {
  return useQuery({
    queryKey: ['table-data'],
    queryFn: async () => {
      const { data } = await supabase.from('table').select('*')
      return data
    }
  })
}

// Good: Client state via Zustand
const useTableUI = create((set) => ({
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode })
}))
```

## Best Practices

### 🎯 **When to Use TanStack Query**
- Fetching data from APIs/database
- Creating, updating, deleting records
- Real-time data synchronization
- Background data refetching
- Optimistic updates

### 🎯 **When to Use Zustand**
- UI view preferences
- Form state management
- Component interaction state
- User settings and preferences
- Temporary selections

### 🚫 **Anti-Patterns to Avoid**
1. **Never store server data in Zustand stores**
2. **Don't duplicate data between Query cache and Zustand**
3. **Avoid manual cache invalidation when using TanStack Query**
4. **Don't use useState for global client state**

## Implementation Examples

### Contact Advocacy Feature
```typescript
// Server operations
import { 
  useContactAdvocacyRelationships,
  useCreateAdvocacyRelationship 
} from '@/features/contacts/hooks/useContactAdvocacy'

// Client UI state
import { 
  useAdvocacyView, 
  useAdvocacyForm 
} from '@/stores'

function ContactAdvocacyPage() {
  // Server data
  const { data: relationships } = useContactAdvocacyRelationships()
  const createMutation = useCreateAdvocacyRelationship()
  
  // Client UI state
  const { viewMode, setViewMode } = useAdvocacyView()
  const { isFormOpen, openCreateForm } = useAdvocacyForm()
  
  return (
    <div>
      {/* UI controls update client state */}
      <ViewToggle mode={viewMode} onChange={setViewMode} />
      <button onClick={openCreateForm}>Add Relationship</button>
      
      {/* Server data displayed */}
      {relationships?.map(rel => <RelationshipCard key={rel.id} {...rel} />)}
      
      {/* Forms trigger server mutations */}
      {isFormOpen && (
        <RelationshipForm 
          onSubmit={createMutation.mutate}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  )
}
```

## Performance Benefits

### ⚡ **TanStack Query Optimizations**
- Automatic background refetching
- Intelligent caching and deduplication  
- Stale-while-revalidate patterns
- Optimistic updates with rollback
- Request deduplication

### ⚡ **Zustand Optimizations**
- Granular subscriptions (no unnecessary re-renders)
- Persistence of user preferences
- Lightweight client state management
- Direct state updates without reducers

## Architectural Safeguards

### 🔒 **ESLint Rules**
Custom architectural enforcement prevents common violations:

```javascript
// .eslintrc.cjs enforces these patterns
rules: {
  'crm-architecture/no-server-data-in-stores': 'error',
  'crm-architecture/prefer-tanstack-query': 'error',
  'crm-architecture/enforce-feature-boundaries': 'error'
}
```

### 🔍 **TypeScript Constraints**
Branded types enforce state boundaries:

```typescript
// Client state types prevent server data mixing
type ClientUIState = {
  viewMode: 'list' | 'grid'
  isFormOpen: boolean
} & Brand<'client-state'>

type ServerEntity = {
  id: string
  created_at: string
  updated_at: string
} & Brand<'server-entity'>
```

### 🛠️ **Development Tools**
- `npm run lint:architecture` - Validates architectural patterns
- `scripts/validate-architecture.js` - Comprehensive state management validation
- `scripts/dev-assistant.js` - Generates components with correct patterns

## Performance Optimizations

### ⚡ **Query Optimizations**
The `/src/lib/query-optimizations.ts` provides:

```typescript
// Optimized query client with CRM-specific settings
const queryClient = createOptimizedQueryClient()

// Batch queries for related data
const results = useBatchOptimizedQueries([
  { queryKey: ['organizations'], queryFn: fetchOrganizations },
  { queryKey: ['contacts'], queryFn: fetchContacts }
])

// Smart prefetching for CRM workflows  
const { prefetchRelatedData } = usePrefetchRelatedData()
```

### 🎯 **Component Optimizations**
The `/src/lib/performance-optimizations.ts` provides:

```typescript
// Debounced search with caching
const { results } = useCachedSearch(searchFunction, query)

// Virtual scrolling for large datasets
const { visibleItems } = useVirtualScrolling(items, itemHeight, containerHeight)

// Optimized form submissions
const { handleSubmit, isSubmitting } = useOptimizedFormSubmit(submitFn)
```

## Migration Checklist

When adding new features:

- [ ] **Server data**: Use TanStack Query hooks in `/src/features/*/hooks/`
- [ ] **Client state**: Use Zustand stores in `/src/stores/`
- [ ] **Query keys**: Follow consistent naming patterns from `query-optimizations.ts`
- [ ] **Error handling**: Use TanStack Query error boundaries
- [ ] **Loading states**: Use TanStack Query loading states
- [ ] **Optimistic updates**: Implement via `useOptimisticMutation`
- [ ] **Cache invalidation**: Use smart invalidation patterns
- [ ] **Performance**: Apply relevant optimizations from performance libraries
- [ ] **Validation**: Run `npm run lint:architecture` before committing

## Development Workflow

### 🚀 **Creating Components**
```bash
# Use the dev assistant for consistent patterns
npm run dev:assist create component ContactTable contacts
npm run dev:assist create hook useContactAdvocacy contacts
npm run dev:assist create store advocacyUIStore
```

### ✅ **Validation Pipeline**
```bash
# Comprehensive architecture validation
npm run validate:architecture
npm run lint:architecture
npm run quality-gates
```

## Support

For questions about this architecture:
1. Review existing implementations in `/src/features/organizations/hooks/`
2. Check architectural safeguards in `/docs/ARCHITECTURAL_SAFEGUARDS.md`
3. Use development tools: `npm run dev:assist help`
4. TanStack Query docs: https://tanstack.com/query/latest
5. Zustand docs: https://docs.pmnd.rs/zustand/getting-started/introduction

---
*Last updated: January 2025 - Post-architectural refactoring*