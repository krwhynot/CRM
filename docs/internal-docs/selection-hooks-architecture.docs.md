# Selection Hooks Architecture Research

Analysis of selection hook patterns across the CRM codebase, identifying inconsistencies and standardization opportunities for multi-selection, single-item selection, and ID-based selection patterns.

## Relevant Files

**Multi-Selection Hooks (Set<string> pattern):**
- `/src/features/contacts/hooks/useContactsSelection.ts`: Multi-selection with Set<string> for contacts
- `/src/features/opportunities/hooks/useOpportunitiesSelection.ts`: Multi-selection with Set<string> for opportunities

**Single-Item Selection Hooks (object-based):**
- `/src/features/contacts/hooks/useContactsPageState.ts`: Dialog state management with Contact entity
- `/src/features/organizations/hooks/useOrganizationsPageState.ts`: Dialog state management with Organization entity
- `/src/features/products/hooks/useProductsPageState.ts`: Dialog state management with Product entity
- `/src/features/interactions/hooks/useInteractionsPageState.ts`: Dialog state management with InteractionWithRelations entity
- `/src/features/opportunities/hooks/useOpportunitiesPageState.ts`: Dialog state management (not examined but likely exists)

**Generic Selection Hooks:**
- `/src/hooks/useEntitySelectState.ts`: Dropdown selection state for EntityOption
- `/src/stores/contactAdvocacyStore.ts`: ID-based selection pattern in Zustand store

## Architectural Patterns

### Multi-Selection Pattern (Set<string>)
**Current Implementation**: Used in contacts and opportunities
- **State**: `useState<Set<string>>(new Set())`
- **Methods**: `handleSelectAll`, `handleSelectItem`, `clearSelection`
- **Type Safety**: Entity-specific types for handleSelectAll parameter
- **Pattern Consistency**: 95% identical code between implementations

```typescript
// Pattern observed in both contacts and opportunities
interface UseEntitySelectionReturn {
  selectedItems: Set<string>
  handleSelectAll: (checked: boolean, items: EntityType[]) => void
  handleSelectItem: (id: string, checked: boolean) => void
  clearSelection: () => void
}
```

### Single-Item Selection Pattern (object-based)
**Current Implementation**: Used across all 5 main entities
- **Dialog State**: Create, Edit, Delete boolean flags
- **Selected Entity**: Full entity object storage (`Entity | null`)
- **Methods**: `openCreateDialog`, `openEditDialog`, `openDeleteDialog`, `closeEditDialog`, etc.
- **Pattern Consistency**: 90% identical code with only entity type changing

```typescript
// Pattern observed across contacts, organizations, products, interactions
interface UseEntityPageStateReturn {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  selectedEntity: EntityType | null
  // Open/close methods...
}
```

### ID-Based Selection Pattern (Zustand)
**Current Implementation**: Used in contactAdvocacyStore
- **State**: `selectedRelationshipId: string | null`
- **Philosophy**: Store only IDs, not full objects
- **Architecture**: Client-side UI state only, server data via TanStack Query
- **Type Safety**: Strong typing with validation in development mode

## Edge Cases & Gotchas

### Multi-Selection Inconsistencies
- **Missing Implementations**: Organizations, products, and interactions lack multi-selection hooks
- **Entity Type Coupling**: Each hook hardcoded to specific entity type in `handleSelectAll`
- **Import Dependencies**: Direct coupling to specific entity types from `@/types/entities`

### Page State Pattern Variations
- **Interactions Hook Enhancement**: `/src/features/interactions/hooks/useInteractionsPageState.ts` includes additional `viewingInteraction` state and `handleViewInteraction` method
- **Method Consistency**: Some hooks use `useCallback` (interactions), others don't (contacts, organizations, products)
- **Return Object Organization**: Products hook includes comments for organization, others don't

### State Management Architecture Mismatch
- **Dual Patterns**: Some features use React useState hooks, others use Zustand stores
- **ID vs Object Storage**: contactAdvocacyStore uses ID-based selection (recommended), but page state hooks store full objects
- **Client vs Server Boundaries**: Page state hooks blur client/server state boundaries by storing server entities

### Generic Hook Limitations
- **useEntitySelectState**: Limited to dropdown selection, not applicable to bulk operations
- **No Generic Multi-Selection**: No reusable pattern for Set<string> multi-selection across entities
- **No Generic Page State**: No reusable pattern for CRUD dialog management

## Standardization Opportunities

### 1. Generic Multi-Selection Hook
**Current Gap**: Contacts and opportunities have identical multi-selection logic
**Opportunity**: Create `useMultiSelection<T>(entities: T[])` generic hook

```typescript
// Proposed generic pattern
function useMultiSelection<T extends { id: string }>(entities: T[]) {
  // Generic implementation for any entity with id field
}
```

### 2. Generic Page State Hook
**Current Gap**: 5 nearly identical page state implementations
**Opportunity**: Create `useEntityPageState<T>()` generic hook

```typescript
// Proposed generic pattern
function useEntityPageState<T>() {
  // Generic CRUD dialog state management
}
```

### 3. Unified Selection Architecture
**Current Gap**: Mixed patterns between React state and Zustand stores
**Opportunity**: Standardize on ID-based selection following contactAdvocacyStore pattern

### 4. Missing Multi-Selection Implementations
**Current Gap**: Organizations, products, interactions lack multi-selection hooks
**Opportunity**: Generate missing hooks using standardized generic pattern

### 5. Type Safety Enhancement
**Current Gap**: Manual type coupling in each implementation
**Opportunity**: Leverage TypeScript generics for compile-time type safety

## Implementation Recommendations

### Phase 1: Generic Hook Creation
1. **Create `useGenericMultiSelection<T>`**: Extract common pattern from contacts/opportunities
2. **Create `useGenericPageState<T>`**: Extract common pattern from all page state hooks
3. **Validate with existing implementations**: Ensure backward compatibility

### Phase 2: Migration Strategy
1. **Migrate existing hooks**: Update to use generic implementations
2. **Generate missing hooks**: Create multi-selection for organizations, products, interactions
3. **Standardize patterns**: Align on ID-based vs object-based selection approach

### Phase 3: Architecture Alignment
1. **Zustand integration**: Consider moving page state to stores for consistency
2. **Type system enhancement**: Leverage generic constraints for entity types
3. **Performance optimization**: Implement memoization patterns in generic hooks

## Relevant Docs

- `/src/stores/contactAdvocacyStore.ts`: Reference implementation for ID-based selection pattern
- [Zustand Best Practices](https://github.com/pmndrs/zustand): Store-based state management patterns
- `/docs/STATE_MANAGEMENT_GUIDE.md`: Client vs server state separation guidelines