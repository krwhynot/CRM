# State Management Onboarding Guide

*Quick start guide for developers working with the new client/server state separation*

## 🎯 Quick Reference

### When to Use What
- **TanStack Query** → Server data (API calls, database records, authentication)
- **Zustand** → Client UI state (view modes, form state, preferences)

### File Locations
- **Server State**: `/src/features/*/hooks/` (e.g., `useOrganizations.ts`)
- **Client State**: `/src/stores/` (e.g., `organizationViewStore.ts`)

## 🚀 Common Patterns

### ✅ Server Data Pattern
```typescript
// /src/features/contacts/hooks/useContacts.ts
export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: async () => {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('deleted_at', null)
      return data
    }
  })
}
```

### ✅ Client State Pattern
```typescript
// /src/stores/contactViewStore.ts
export const useContactView = create<ContactViewState>((set) => ({
  viewMode: 'list',
  sortBy: 'name',
  searchQuery: '',
  setViewMode: (mode) => set({ viewMode: mode }),
  setSorting: (field) => set({ sortBy: field })
}))
```

### ✅ Component Integration
```typescript
function ContactsPage() {
  // Server data
  const { data: contacts, isLoading } = useContacts(filters)
  
  // Client UI state  
  const { viewMode, setViewMode } = useContactView()
  
  return (
    <div>
      <ViewToggle mode={viewMode} onChange={setViewMode} />
      {isLoading ? <Spinner /> : <ContactList contacts={contacts} />}
    </div>
  )
}
```

## ❌ Anti-Patterns to Avoid

### Don't Mix Server Operations in Zustand
```typescript
// ❌ Bad - Server operations in client store
const useBadStore = create((set) => ({
  data: [],
  fetchData: async () => {
    const response = await supabase.from('table').select('*')
    set({ data: response.data }) // Don't do this!
  }
}))
```

### Don't Duplicate Server Data in Client State
```typescript
// ❌ Bad - Duplicating server data
const useBadClientStore = create((set) => ({
  organizations: [], // This belongs in TanStack Query
  viewMode: 'list' // This is fine
}))
```

## 🔧 Migration Checklist

When working with existing code:

1. **Identify State Type**
   - [ ] Does this data come from the server? → TanStack Query
   - [ ] Is this UI-only state? → Zustand

2. **Create Server Hooks** (if needed)
   - [ ] Create query key factory
   - [ ] Implement query/mutation hooks
   - [ ] Add error handling

3. **Refactor Client Store** (if needed)
   - [ ] Remove server operations
   - [ ] Keep only UI state
   - [ ] Update component imports

4. **Update Components**
   - [ ] Import server hooks for data
   - [ ] Import client store for UI state
   - [ ] Remove mixed state patterns

## 🧪 Testing Your Implementation

### Validate Separation
```typescript
describe('State Separation', () => {
  it('should not trigger server queries when UI state changes', () => {
    const { result } = renderHook(() => useContactView())
    const initialQueries = queryClient.getQueryCache().getAll().length
    
    act(() => result.current.setViewMode('cards'))
    
    expect(queryClient.getQueryCache().getAll().length).toBe(initialQueries)
  })
})
```

### Check Architecture Health
```bash
# Run architecture checker
node scripts/check-state-architecture.cjs

# Should show: 🟢 95/100 - Excellent state architecture!
```

## 🎓 Learning Resources

### Essential Reading
1. **[State Management Guide](../STATE_MANAGEMENT_GUIDE.md)** - Complete implementation guide
2. **[TanStack Query Docs](https://tanstack.com/query/latest)** - Official documentation
3. **[Zustand Docs](https://docs.pmnd.rs/zustand)** - State management patterns

### Code Examples
- **Organizations**: `/src/features/organizations/hooks/useOrganizations.ts`
- **Contact Advocacy**: `/src/features/contacts/hooks/useContactAdvocacy.ts`
- **UI Stores**: `/src/stores/` directory

### Tools & Scripts
- **Architecture Checker**: `scripts/check-state-architecture.cjs`
- **Performance Monitor**: `src/lib/state-performance-monitor.ts`
- **Integration Tests**: `src/__tests__/state-management-integration.test.tsx`

## 🚨 Common Gotchas

### Query Key Consistency
```typescript
// ✅ Good - Consistent query keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters?: Filters) => [...contactKeys.lists(), { filters }] as const
}
```

### Proper Error Handling
```typescript
// ✅ Good - Let TanStack Query handle errors
const { data, error, isLoading } = useContacts()

if (error) return <ErrorBoundary error={error} />
if (isLoading) return <Spinner />
```

### Cache Invalidation
```typescript
// ✅ Good - Use query client for invalidation
const queryClient = useQueryClient()
const createContact = useMutation({
  mutationFn: createContactFn,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
  }
})
```

## 📞 Need Help?

1. **Check Examples**: Look at existing implementations in `/src/features/*/hooks/`
2. **Run Architecture Checker**: `node scripts/check-state-architecture.cjs`
3. **Review Documentation**: `/docs/STATE_MANAGEMENT_GUIDE.md`
4. **Test Your Implementation**: Use the patterns above to validate separation

---

*Updated: January 2025 - Reflects the new client/server state separation architecture*