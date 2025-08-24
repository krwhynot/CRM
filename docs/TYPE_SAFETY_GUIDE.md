# Type Safety Guide: Client vs Server State

## Overview

This guide establishes type safety patterns to maintain strict separation between client-side state (Zustand) and server-side state (TanStack Query).

## Architecture Principles

### 🎨 Client State (Zustand)
**What belongs here:**
- UI view modes and preferences
- Form open/closed states
- Search queries and filters (primitives only)
- Selected item IDs (not full objects)
- User preferences and settings

**What does NOT belong here:**
- ❌ Full server data objects
- ❌ Database records with `id`, `created_at`, etc.
- ❌ Computed values from server data
- ❌ Loading states or error states

### 🗄️ Server State (TanStack Query)
**What belongs here:**
- All database records and API responses
- Loading, error, and mutation states
- Background data fetching
- Cache management and invalidation

## Type Safety Utilities

Import from `@/lib/state-type-safety`:

```typescript
import { 
  BaseClientState, 
  ClientStateStore, 
  CreateClientFilters, 
  validateClientState 
} from '@/lib/state-type-safety'
```

## Creating Type-Safe Client Stores

### 1. Define Your State Interface

```typescript
// ✅ Correct: Extends base client state
export interface MyFeatureUIState extends BaseClientState {
  // Store only IDs, not full objects
  selectedItemId: string | null
  
  // Type-safe filters using utility type
  filters: CreateClientFilters<{
    search?: string
    category?: string
    status?: 'active' | 'inactive'
    priority_min?: number
  }>
  
  // UI state
  viewMode: 'list' | 'cards'
  showAdvancedOptions: boolean
  
  // Form state
  isFormOpen: boolean
  formMode: 'create' | 'edit' | null
  
  // Extended preferences
  preferences: BaseClientState['preferences'] & {
    defaultViewMode: 'list' | 'cards'
    itemsPerPage: number
  }
  
  // Extended actions
  actions: BaseClientState['actions'] & {
    setSelectedItemId: (id: string | null) => void
    setViewMode: (mode: 'list' | 'cards') => void
    // ... other actions
  }
}
```

### 2. Create the Store with Validation

```typescript
export const useMyFeatureStore = create<MyFeatureUIState>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        ...initialState,
        
        actions: {
          // Base actions with validation
          updatePreferences: (prefs: Partial<MyFeatureUIState['preferences']>) => {
            if (process.env.NODE_ENV === 'development') {
              validateClientState(prefs, 'my-feature-store')
            }
            set(state => ({ 
              preferences: { ...state.preferences, ...prefs } 
            }))
          },
          
          reset: () => {
            set(initialState)
            if (process.env.NODE_ENV === 'development') {
              validateClientState(initialState, 'my-feature-store')
            }
          },
          
          // Feature-specific actions
          setSelectedItemId: (id: string | null) => {
            set({ selectedItemId: id })
          }
        }
      })),
      {
        name: 'my-feature-store',
        partialize: (state) => ({
          // Only persist UI preferences
          viewMode: state.viewMode,
          preferences: state.preferences
        })
      }
    ),
    { name: 'my-feature-store' }
  )
)
```

### 3. Export Convenience Hooks

```typescript
export const useMyFeatureSelection = () => {
  const store = useMyFeatureStore()
  return {
    selectedItemId: store.selectedItemId,
    setSelectedItemId: store.actions.setSelectedItemId
  }
}

export const useMyFeatureView = () => {
  const store = useMyFeatureStore()
  return {
    viewMode: store.viewMode,
    setViewMode: store.actions.setViewMode,
    showAdvancedOptions: store.showAdvancedOptions
  }
}
```

## Anti-Patterns to Avoid

### ❌ Don't Store Server Objects

```typescript
// ❌ WRONG: Storing full server objects
interface BadClientState {
  selectedContact: ContactWithOrganization  // Contains server data!
  contacts: Contact[]  // Server data array!
}

// ✅ CORRECT: Store only IDs
interface GoodClientState {
  selectedContactId: string | null  // ID only
  // Server data comes from useContacts() hook
}
```

### ❌ Don't Import Server Types in Stores

```typescript
// ❌ WRONG: Importing server data types
import { ContactWithOrganization } from '@/features/contacts/hooks/useContacts'

// ✅ CORRECT: Use utility types for client-safe data
import { CreateClientFilters } from '@/lib/state-type-safety'
```

### ❌ Don't Mix Client and Server Operations

```typescript
// ❌ WRONG: Server operations in client store
const useContactStore = create((set) => ({
  contacts: [],
  fetchContacts: async () => {  // Server operation!
    const data = await supabase.from('contacts').select('*')
    set({ contacts: data })
  }
}))

// ✅ CORRECT: Separate concerns
// Server operations in TanStack Query hooks
const { data: contacts } = useContacts()
// Client state in Zustand
const { viewMode, setViewMode } = useContactsView()
```

## Component Usage Patterns

```typescript
function MyComponent() {
  // ✅ Server data via TanStack Query
  const { data: contacts, isLoading } = useContacts()
  
  // ✅ Client UI state via Zustand
  const { selectedContactId, setSelectedContactId } = useContactsSelection()
  const { viewMode, setViewMode } = useContactsView()
  
  // ✅ Combine server data with client selection
  const selectedContact = contacts?.find(c => c.id === selectedContactId)
  
  return (
    <div>
      <ViewToggle mode={viewMode} onChange={setViewMode} />
      {isLoading ? (
        <Skeleton />
      ) : (
        contacts?.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isSelected={contact.id === selectedContactId}
            onClick={() => setSelectedContactId(contact.id)}
          />
        ))
      )}
    </div>
  )
}
```

## Development Tools

### Runtime Validation

The `validateClientState` function will warn you in development if you accidentally store server-like objects:

```
⚠️ [my-store] Invalid client state detected in key 'selectedItem':
{ id: 'uuid', created_at: '2024-01-01', name: 'Item' }
💡 Client state should only contain UI state, preferences, and IDs - not full server objects.
```

### TypeScript Checks

The type system will prevent many violations at compile time:

```typescript
// TypeScript error: server data type not assignable to client state
const badState: ClientState<MyState> = {
  selectedItem: serverObject  // ❌ Error!
}
```

## Migration Checklist

When updating existing stores:

- [ ] Extend `BaseClientState` interface
- [ ] Use `CreateClientFilters` for filter types
- [ ] Replace server objects with IDs
- [ ] Add `validateClientState` calls
- [ ] Update action signatures to be client-safe
- [ ] Test that TypeScript compilation passes
- [ ] Verify runtime warnings are resolved

## Benefits

1. **Prevents Data Duplication**: Server data lives in one place (TanStack Query cache)
2. **Improves Performance**: No unnecessary re-renders from client state changes
3. **Enhances Maintainability**: Clear separation makes debugging easier
4. **Ensures Consistency**: Single source of truth for server data
5. **Better Developer Experience**: Clear boundaries and helpful error messages

---

*For questions about type safety patterns, see `/src/lib/state-type-safety.ts` for implementation details.*