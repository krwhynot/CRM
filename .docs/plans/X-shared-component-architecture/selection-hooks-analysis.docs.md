# Selection Hooks and Entity Patterns Analysis

Research analysis of selection hook implementations, entity-specific patterns, and opportunities for standardization across the CRM codebase.

## Overview

The codebase currently has inconsistent selection patterns across entities, with dedicated selection hooks for contacts and opportunities but no standardized approach for organizations, products, and interactions. The analysis reveals opportunities for creating generic selection patterns while maintaining feature-specific flexibility.

## Relevant Files

- `/src/features/contacts/hooks/useContactsSelection.ts`: Multi-selection hook for bulk operations on contacts
- `/src/features/opportunities/hooks/useOpportunitiesSelection.ts`: Multi-selection hook for bulk operations on opportunities
- `/src/features/contacts/hooks/useContactsPageState.ts`: Single-item selection for CRUD operations
- `/src/features/organizations/hooks/useOrganizationsPageState.ts`: Single-item selection for CRUD operations
- `/src/features/products/hooks/useProductsPageState.ts`: Single-item selection for CRUD operations
- `/src/features/interactions/hooks/useInteractionsPageState.ts`: Single-item selection for CRUD operations
- `/src/hooks/useEntitySelectState.ts`: Generic entity selection for dropdowns/pickers
- `/src/stores/contactAdvocacyStore.ts`: Zustand store with ID-based selection pattern
- `/src/types/entities.ts`: Core entity type definitions

## Architectural Patterns

### **Multi-Item Selection Pattern**
- **Implementation**: `Set<string>` for selected IDs, with select-all and toggle operations
- **Current Usage**: Contacts and opportunities for bulk actions (export, delete, modify)
- **Pattern**: Hook manages selectedItems state with handleSelectAll, handleSelectItem, clearSelection methods
- **Interface**: Consistent return interface across both existing implementations

### **Single-Item Selection Pattern**
- **Implementation**: `EntityType | null` for currently selected entity
- **Current Usage**: All entity page states for edit/delete dialog operations
- **Pattern**: State management for selected entity with dialog open/close operations
- **Interface**: Inconsistent naming - selectedContact vs selectedOrganization vs selectedProduct

### **ID-Based Selection Pattern**
- **Implementation**: `string | null` for selected entity ID (Zustand stores)
- **Current Usage**: contactAdvocacyStore for relationship selection
- **Pattern**: Store only IDs to maintain separation between client/server state
- **Benefits**: Avoids stale data issues, maintains clear state boundaries

### **Entity Picker Selection Pattern**
- **Implementation**: Dropdown/combobox selection with search capability
- **Current Usage**: useEntitySelectState for form field selections
- **Pattern**: isOpen state + selectedOption + search filtering
- **Interface**: Generic across all entity types

## Gotchas & Edge Cases

- **State Stagnation**: Page state hooks hold full entity objects which can become stale, unlike ID-based approaches
- **Inconsistent Naming**: selectedContact vs selectedProduct vs editingOpportunity - no standardized naming convention
- **Mixed Selection Types**: Multi-selection hooks use Set<string> while page states use full objects
- **Missing Bulk Operations**: Organizations, products, and interactions lack multi-selection hooks for bulk operations
- **Store vs Hook Patterns**: contactAdvocacyStore uses ID-based selection while feature hooks use object-based selection
- **Generic Pattern Exists**: useEntitySelectState exists for dropdowns but no generic equivalent for list selections

## Missing Selection Hooks

### **Organizations**
- No `useOrganizationsSelection` hook for bulk operations
- Only single-selection via useOrganizationsPageState
- Missing multi-select functionality for bulk export/actions

### **Products**
- No `useProductsSelection` hook for bulk operations
- Only single-selection via useProductsPageState
- Missing multi-select functionality for bulk export/actions

### **Interactions**
- No `useInteractionsSelection` hook for bulk operations
- Only single-selection via useInteractionsPageState
- Missing multi-select functionality for bulk export/actions

## Recommendations

### **1. Create Generic Selection Hook**

Implement `useEntitySelection<T>` that can be specialized per entity:

```typescript
// Generic multi-selection hook
function useEntitySelection<T extends { id: string }>() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleSelectAll = useCallback((checked: boolean, items: T[]) => {
    // Implementation
  }, [])

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    // Implementation
  }, [])

  const clearSelection = useCallback(() => {
    // Implementation
  }, [])

  return { selectedItems, handleSelectAll, handleSelectItem, clearSelection }
}

// Feature-specific implementations
export const useOrganizationsSelection = () => useEntitySelection<Organization>()
export const useProductsSelection = () => useEntitySelection<Product>()
export const useInteractionsSelection = () => useEntitySelection<InteractionWithRelations>()
```

### **2. Standardize Page State Patterns**

Create generic page state hook with consistent naming:

```typescript
function useEntityPageState<T extends { id: string }>() {
  const [selectedEntity, setSelectedEntity] = useState<T | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  // ... consistent pattern across all entities
}
```

### **3. Implement ID-Based Selection Migration**

Migrate page state hooks to use ID-based selection following the contactAdvocacyStore pattern:
- Store only entity IDs, not full objects
- Fetch full objects via TanStack Query when needed
- Prevents stale data issues
- Maintains clear client/server state boundaries

### **4. Add Missing Multi-Selection Hooks**

Implement the missing selection hooks for organizations, products, and interactions:
- `useOrganizationsSelection` - for bulk organization operations
- `useProductsSelection` - for bulk product operations
- `useInteractionsSelection` - for bulk interaction operations

### **5. Create Selection Hook Factory**

Implement a factory pattern to reduce code duplication:

```typescript
export function createEntitySelectionHook<T extends { id: string }>(entityName: string) {
  return function useEntitySelection(): UseEntitySelectionReturn<T> {
    // Generic implementation with type safety
  }
}
```

This analysis provides a roadmap for standardizing selection patterns across the codebase while maintaining the flexibility needed for entity-specific requirements.