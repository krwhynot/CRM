# Feature-Based Architecture Design

## Overview

This document outlines the comprehensive feature-based architecture for the KitchenPantry CRM system, designed to address audit findings and create a production-ready, scalable structure that reduces code duplication to <5% and accelerates development by 50%.

## Core Architecture Principles

### 1. Feature-First Organization
Each entity becomes a self-contained feature with its own API layer, components, hooks, stores, types, and schemas.

### 2. Shared Foundation Layer
Common utilities, UI components, and services are abstracted into a shared layer accessible by all features.

### 3. Consistent API Patterns
All features follow the same service layer patterns, making the codebase predictable and maintainable.

### 4. Type-Safe Integration
Full TypeScript integration with schema-first validation ensuring compile-time safety.

## Directory Structure

```
/src/
├── features/                    # Feature-based organization
│   ├── contacts/               # Contact management feature
│   │   ├── api/                # React Query hooks + API operations
│   │   │   ├── queries.ts      # useContacts, useContact, etc.
│   │   │   ├── mutations.ts    # useCreateContact, useUpdateContact, etc.
│   │   │   └── index.ts        # Public API exports
│   │   ├── components/         # Contact-specific components
│   │   │   ├── ContactForm/
│   │   │   │   ├── ContactForm.tsx
│   │   │   │   ├── ContactForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ContactsTable/
│   │   │   │   ├── ContactsTable.tsx
│   │   │   │   ├── ContactsTableColumns.tsx
│   │   │   │   ├── ContactsTableActions.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ContactCard/
│   │   │   └── index.ts        # Component exports
│   │   ├── hooks/              # Feature-specific custom hooks
│   │   │   ├── useContactForm.ts
│   │   │   ├── useContactValidation.ts
│   │   │   └── index.ts
│   │   ├── stores/             # Zustand UI state (if needed)
│   │   │   ├── contactFormStore.ts
│   │   │   └── index.ts
│   │   ├── types/              # Contact-specific types
│   │   │   ├── contact.types.ts
│   │   │   ├── contact-form.types.ts
│   │   │   └── index.ts
│   │   ├── schemas/            # Yup validation schemas
│   │   │   ├── contact.schema.ts
│   │   │   ├── contact-form.schema.ts
│   │   │   └── index.ts
│   │   ├── services/           # Business logic services
│   │   │   ├── contactService.ts
│   │   │   └── index.ts
│   │   └── index.ts            # Feature public API
│   │
│   ├── organizations/          # Organization management feature
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── products/               # Product management feature
│   │   └── [same structure]
│   │
│   ├── opportunities/          # Opportunity management feature
│   │   └── [same structure]
│   │
│   └── interactions/           # Interaction management feature
│       └── [same structure]
│
├── shared/                     # Shared foundation layer
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # Form-related components
│   │   │   ├── CoreFormLayout/
│   │   │   ├── EntitySelect/
│   │   │   ├── ProgressiveDetails/
│   │   │   └── index.ts
│   │   ├── data-display/       # Tables, lists, cards
│   │   │   ├── DataTable/
│   │   │   ├── EntityCard/
│   │   │   ├── SearchableList/
│   │   │   └── index.ts
│   │   ├── feedback/           # Error boundaries, loading states
│   │   │   ├── ErrorBoundary/
│   │   │   ├── LoadingSpinner/
│   │   │   ├── EmptyState/
│   │   │   └── index.ts
│   │   ├── layout/             # Layout components
│   │   │   ├── AppSidebar/
│   │   │   ├── Header/
│   │   │   ├── Layout/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── services/               # Core business services
│   │   ├── api/                # API abstraction layer
│   │   │   ├── base.service.ts # Base API service class
│   │   │   ├── queryClient.ts  # React Query configuration
│   │   │   └── index.ts
│   │   ├── auth/               # Authentication services
│   │   │   ├── auth.service.ts
│   │   │   ├── authContext.tsx
│   │   │   └── index.ts
│   │   ├── storage/            # File storage services
│   │   │   ├── storage.service.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── hooks/                  # Global custom hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   ├── useSearch.ts
│   │   └── index.ts
│   │
│   ├── stores/                 # Global Zustand stores
│   │   ├── appStore.ts         # Global app state
│   │   ├── navigationStore.ts  # Navigation state
│   │   └── index.ts
│   │
│   ├── types/                  # Global types
│   │   ├── api.types.ts        # API response types
│   │   ├── common.types.ts     # Shared types
│   │   ├── database.types.ts   # Generated database types
│   │   └── index.ts
│   │
│   ├── schemas/                # Global validation schemas
│   │   ├── common.schemas.ts   # Shared validation rules
│   │   └── index.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── formatting.ts       # Data formatting utils
│   │   ├── validation.ts       # Validation helpers
│   │   ├── constants.ts        # App constants
│   │   └── index.ts
│   │
│   └── lib/                    # Third-party integrations
│       ├── supabase.ts         # Supabase client
│       ├── queryClient.ts      # React Query setup
│       └── index.ts
│
├── app/                        # Application routing and pages
│   ├── routes/                 # Route definitions
│   │   ├── contacts.tsx        # Contact routes
│   │   ├── organizations.tsx   # Organization routes
│   │   ├── products.tsx        # Product routes
│   │   ├── opportunities.tsx   # Opportunity routes
│   │   ├── interactions.tsx    # Interaction routes
│   │   └── index.ts
│   │
│   ├── pages/                  # Page components
│   │   ├── Dashboard/
│   │   ├── Contacts/
│   │   ├── Organizations/
│   │   ├── Products/
│   │   ├── Opportunities/
│   │   ├── Interactions/
│   │   └── index.ts
│   │
│   └── App.tsx                 # Root app component
│
└── [existing files]            # Keep existing structure during migration
    ├── components/             # Legacy components (to be migrated)
    ├── hooks/                  # Legacy hooks (to be migrated)
    ├── types/                  # Legacy types (to be migrated)
    └── ...
```

## Feature Structure Details

### API Layer Pattern
Each feature's API layer follows a consistent pattern:

```typescript
// features/contacts/api/queries.ts
export const contactQueries = {
  all: ['contacts'] as const,
  lists: () => [...contactQueries.all, 'list'] as const,
  list: (filters?: ContactFilters) => [...contactQueries.lists(), { filters }] as const,
  details: () => [...contactQueries.all, 'detail'] as const,
  detail: (id: string) => [...contactQueries.details(), id] as const,
}

export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: contactQueries.list(filters),
    queryFn: () => contactService.getContacts(filters),
  })
}
```

### Service Layer Pattern
Each feature has a service class that handles all API operations:

```typescript
// features/contacts/services/contactService.ts
export class ContactService extends BaseService<Contact> {
  constructor() {
    super('contacts')
  }

  async getContactsWithOrganization(filters?: ContactFilters) {
    return this.query()
      .select('*, organization:organizations(*)')
      .applyFilters(filters)
      .execute()
  }
}

export const contactService = new ContactService()
```

### Component Organization
Components are organized by functionality with co-located tests and exports:

```typescript
// features/contacts/components/ContactForm/index.ts
export { ContactForm } from './ContactForm'
export type { ContactFormProps } from './ContactForm'
```

## Benefits

1. **Reduced Code Duplication**: Common patterns abstracted to shared layer
2. **Faster Development**: Consistent patterns accelerate feature development
3. **Better Maintainability**: Clear separation of concerns
4. **Type Safety**: Schema-first approach with generated types
5. **Testability**: Co-located tests with components
6. **Scalability**: Easy to add new features following established patterns

## Migration Strategy

The architecture supports gradual migration:
1. Start with one feature (contacts) as proof of concept
2. Migrate remaining features one by one
3. Remove legacy code after successful migration
4. Maintain backward compatibility during transition

## Performance Considerations

- Lazy loading of feature modules
- Optimized bundle splitting
- Shared dependencies extracted to common chunks
- Tree-shaking friendly exports