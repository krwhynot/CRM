# Generic Entity Hooks Architecture

This directory contains a comprehensive set of generic, type-safe hooks for entity management in the CRM system. These hooks provide consistent patterns for data fetching, mutations, selections, filtering, and form handling across all entity types.

## Overview

The generic entity hooks architecture eliminates code duplication and provides a unified approach to entity management. Instead of writing separate hooks for each entity type (contacts, organizations, opportunities), you can use these generic hooks with entity-specific adapters.

## Core Hooks

### 1. `useEntityList` - List Management
Provides comprehensive list management with filtering, sorting, and pagination.

```typescript
import { useEntityList, createEntityListConfig } from '@/hooks/entity'

const config = createEntityListConfig<Contact>(
  'contacts', // table name
  'contacts', // query key prefix
  {
    defaultSort: { column: 'last_name', direction: 'asc' },
    virtualizationThreshold: 500,
  }
)

const { data, filteredData, filters, setFilters, isLoading } = useEntityList(config)
```

**Features:**
- Automatic query caching and invalidation
- Client-side and server-side filtering
- Sorting and pagination support
- Optimistic updates
- Auto-virtualization for large datasets (500+ rows)
- Real-time data synchronization

### 2. `useEntitySelection` - Selection Management
Handles individual and bulk selection with advanced features.

```typescript
import { useEntitySelection } from '@/hooks/entity'

const selection = useEntitySelection(entities, {
  maxSelection: 100,
  onSelectionChange: (selected, entities) => console.log('Selection changed'),
  autoDeselect: true, // Remove selections when entities are filtered out
})

// Selection state
const { 
  selectedItems, 
  selectedEntities, 
  isAllSelected, 
  selectionCount 
} = selection

// Selection actions
selection.handleSelectItem(id, true)
selection.handleSelectAll(true, entities)
selection.clearSelection()
```

**Features:**
- Individual and bulk selection
- Selection limits and validation
- Conditional selection with predicates
- Auto-deselection when entities change
- Optimistic selection state

### 3. `useEntityFilters` - Advanced Filtering
Provides sophisticated filtering with presets and faceted search.

```typescript
import { useEntityFilters, useAdvancedEntityFilters } from '@/hooks/entity'

const filters = useAdvancedEntityFilters(entities, {
  defaultFilters: { search: '', status: 'active' },
  persistFilters: true,
  filterKey: 'contacts',
  presets: [
    { id: 'vip', name: 'VIP Contacts', filters: { priority: 'high' } },
    { id: 'recent', name: 'Recent', filters: { created_days: 7 } }
  ]
})

// Apply filters
filters.setFilters({ search: 'john', status: 'active' })
filters.applyPreset('vip')
filters.clearFilters()
```

**Features:**
- Real-time client-side filtering
- Filter persistence to localStorage
- Preset filters for quick access
- Faceted filtering with counts
- Advanced filter combinations

### 4. `useEntityForm` - Form State Management
Comprehensive form handling with validation and auto-save.

```typescript
import { useEntityForm } from '@/hooks/entity'
import { z } from 'zod'

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
})

const form = useEntityForm({
  initialData: contact,
  validationSchema: schema,
  autoSave: true,
  resetOnSubmit: true,
})

// Form state
const { formState: { data, isDirty, isValid, errors } } = form

// Form actions
form.formActions.updateField('first_name', 'John')
form.formActions.validateForm()

// Form submission
const handleSubmit = form.handleSubmit(async (data) => {
  await createContact(data)
})
```

**Features:**
- Real-time validation with Zod schemas
- Dirty state tracking
- Auto-save functionality
- Multi-step form support
- Error handling and display

### 5. `useEntityActions` - CRUD Operations
Unified CRUD operations with optimistic updates and bulk actions.

```typescript
import { useEntityActions, createEntityActionsConfig } from '@/hooks/entity'

const config = createEntityActionsConfig<Contact>(
  'contacts',
  'contact', 
  queryKeyFactory,
  {
    softDelete: true,
    optimisticUpdates: true,
    bulkOperations: true,
  }
)

const actions = useEntityActions(entities, config)

// Individual actions
await actions.create(newContact)
await actions.update(id, updates)
await actions.delete(id)

// Bulk actions
await actions.bulkDelete(selectedContacts)
await actions.bulkUpdate(selectedContacts, updates)

// Selection management included
actions.selection.handleSelectItem(id, true)
```

**Features:**
- Complete CRUD operations
- Optimistic UI updates
- Bulk operations with progress tracking
- Integrated selection management
- Error handling with user feedback
- Soft delete support

## Entity-Specific Adapters

### Using with Contacts

```typescript
// /src/features/contacts/hooks/useContactList.ts
import { useEntityList, useEntityActions } from '@/hooks/entity'

export function useContactList(filters?: ContactFilters) {
  const config = createEntityListConfig<ContactWithContext>(
    'contacts',
    'contacts',
    {
      select: `*, organization:organizations(*)`,
      defaultSort: { column: 'last_name', direction: 'asc' }
    }
  )

  const list = useEntityList(config, { initialFilters: filters })
  const actions = useEntityActions(list.data, contactActionsConfig)

  return {
    contacts: list.filteredData,
    actions,
    filters: list.filters,
    setFilters: list.setFilters,
    isLoading: list.isLoading,
  }
}
```

### Using with Organizations

```typescript
// /src/features/organizations/hooks/useOrganizationList.ts
export function useOrganizationList(filters?: OrganizationFilters) {
  // Custom filtering logic for organizations
  const customFilter = (org: Organization, filters: OrganizationFilters) => {
    if (filters.segment && org.segment !== filters.segment) return false
    if (filters.priority && org.priority_rating !== filters.priority) return false
    return true
  }

  const list = useEntityList(organizationConfig, { initialFilters: filters })
  const filteredOrgs = useEntityFilters(list.data, filterConfig, customFilter)
  
  return {
    organizations: filteredOrgs.filteredData,
    // ... rest of the interface
  }
}
```

## Advanced Features

### Custom CRUD Operations

```typescript
const config = createEntityActionsConfig<Contact>(
  'contacts',
  'contact',
  queryKeys,
  {
    crudOperations: {
      create: async (data) => {
        // Custom create logic
        return await customCreateContact(data)
      },
      update: async (id, data) => {
        // Custom update with business logic
        return await updateContactWithValidation(id, data)
      }
    }
  }
)
```

### Multi-Step Forms

```typescript
const multiStepForm = useMultiStepEntityForm({
  initialData: contact,
  validationSchema: contactSchema,
  steps: [
    { id: 'basic', name: 'Basic Info', fields: ['first_name', 'last_name', 'email'] },
    { id: 'details', name: 'Details', fields: ['title', 'department', 'phone'] },
    { id: 'preferences', name: 'Preferences', fields: ['notes', 'preferred_principals'] },
  ]
})
```

### Virtualized Lists

```typescript
const { shouldVirtualize } = useVirtualizedEntityList(config, {
  forceVirtualization: false, // Auto-virtualizes at 500+ rows
})

// Use with DataTable component
<DataTable 
  data={contacts} 
  virtualized={shouldVirtualize}
  rowHeight={64}
/>
```

## Migration Guide

### From Legacy Hooks

**Before:**
```typescript
// Old approach - separate hooks for each entity
const { data: contacts } = useContacts()
const { selectedItems, handleSelectItem } = useContactsSelection()
const { deleteContact } = useContactActions()
```

**After:**
```typescript
// New approach - unified entity management
const { contacts, actions } = useContactList()

// All functionality in one place
actions.selection.handleSelectItem(id, true)
await actions.delete(id)
```

### Updating Components

**Before:**
```typescript
function ContactsTable() {
  const { data: contacts, isLoading } = useContacts()
  const selection = useContactsSelection()
  const actions = useContactActions()
  
  return (
    <DataTable 
      data={contacts}
      selectedItems={selection.selectedItems}
      onSelectItem={selection.handleSelectItem}
      // ... many props
    />
  )
}
```

**After:**
```typescript
function ContactsTable() {
  const { contacts, actions, isLoading } = useContactList()
  
  return (
    <DataTable 
      data={contacts}
      selection={actions.selection}
      actions={actions}
      isLoading={isLoading}
      // Unified interface
    />
  )
}
```

## Performance Optimizations

1. **Automatic Virtualization**: Lists automatically virtualize at 500+ items
2. **Query Caching**: Intelligent query caching with proper invalidation
3. **Optimistic Updates**: Immediate UI feedback with rollback on errors
4. **Debounced Filtering**: Prevents excessive API calls during typing
5. **Memory Management**: Proper cleanup of subscriptions and timeouts

## Type Safety

All hooks are fully typed with TypeScript generics:

```typescript
// Type-safe entity operations
const actions = useEntityActions<Contact, ContactInsert, ContactUpdate>(contacts, config)

// Type-safe filtering
const filters = useEntityFilters<ContactFilters, Contact>(contacts, config)

// Inferred return types
const { contacts } = useContactList() // contacts: ContactWithContext[]
```

## Best Practices

1. **Use Adapters**: Create feature-specific adapter hooks rather than using generic hooks directly
2. **Configure Properly**: Set appropriate caching, virtualization, and optimization settings
3. **Handle Errors**: Implement proper error boundaries and user feedback
4. **Persist State**: Use filter and selection persistence for better UX
5. **Optimize Queries**: Use appropriate select statements to fetch only needed data

## Testing

```typescript
import { renderHook } from '@testing-library/react'
import { useEntityList } from '@/hooks/entity'

test('useEntityList filters data correctly', () => {
  const { result } = renderHook(() => 
    useEntityList(config, { initialFilters: { search: 'john' } })
  )
  
  expect(result.current.filteredData).toHaveLength(2)
})
```

The generic entity hooks provide a robust, type-safe foundation for all entity management in the CRM system, significantly reducing code duplication while improving maintainability and consistency.