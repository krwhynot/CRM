# KitchenPantry CRM Type System

## Overview

This directory contains a comprehensive TypeScript type system for the KitchenPantry CRM application. The type definitions are designed to provide full type safety across the entire application stack, from database operations to UI components.

## File Structure

```
src/types/
├── database.types.ts       # Supabase-generated database types
├── entities.ts             # Core entity interfaces and utilities
├── organizations.types.ts  # Organization-specific types and schemas
├── contacts.types.ts       # Contact-specific types and schemas
├── products.types.ts       # Product-specific types and schemas
├── opportunities.types.ts  # Opportunity-specific types and schemas
├── interactions.types.ts   # Interaction-specific types and schemas
├── index.ts               # Central export hub for all types
└── README.md              # This documentation file
```

## Key Features

### 1. Complete Database Coverage
- **Full Supabase Integration**: All database tables, enums, and relationships are fully typed
- **CRUD Operation Support**: Insert, Update, and Row types for all entities
- **Relationship Mapping**: Foreign key relationships and join operations are type-safe

### 2. Entity-Specific Type Collections
Each entity has its own comprehensive type collection including:
- **Base Entity Types**: Core database representations
- **Form Data Types**: Validation-ready interfaces for forms
- **Display Types**: Optimized interfaces for UI components
- **Service Types**: API service method signatures
- **Business Logic Types**: Extended interfaces with computed fields
- **Filter Types**: Advanced filtering and search capabilities

### 3. UI Component Support
- **Component Prop Types**: Fully typed props for Vue components
- **Table Configuration**: Column definitions with formatters
- **Form State Management**: Reducer-pattern state management
- **Validation Schemas**: Runtime validation interfaces

### 4. Advanced Business Features
- **Sales Pipeline**: Opportunity stage management and forecasting
- **Relationship Mapping**: Principal-distributor business relationships  
- **Communication Tracking**: Interaction history and follow-up chains
- **Performance Metrics**: Analytics and reporting interfaces

## Database Schema Alignment

The type system is aligned with the database schema defined in `/database/schema/001_initial_schema.sql`:

### Core Entities
1. **Organizations** - Companies in the food service supply chain
2. **Contacts** - People within organizations with roles and contact information
3. **Products** - Items owned by principals, categorized by food service types
4. **Opportunities** - Sales pipeline tracking with stages and values
5. **Interactions** - Communication and follow-up activities

### Relationship Tables
- **opportunity_products** - Many-to-many with quantities and pricing
- **principal_distributor_relationships** - Business relationships and territories

### Enum Types
All database enums are fully typed with validation:
- `organization_type`: customer, principal, distributor, prospect, vendor
- `contact_role`: decision_maker, influencer, user, gatekeeper, champion, technical, financial, other
- `product_category`: beverages, dairy, frozen, fresh_produce, meat_poultry, seafood, bakery, pantry, cleaning, equipment, packaging, other
- `opportunity_stage`: lead, qualified, proposal, negotiation, closed_won, closed_lost, on_hold
- `priority_level`: low, medium, high, urgent
- `interaction_type`: call, email, meeting, demo, proposal, follow_up, site_visit, trade_show, other

## Type System Architecture

### Layered Type Approach
1. **Database Layer** (`database.types.ts`): Raw Supabase types
2. **Entity Layer** (`entities.ts`): Core business entity interfaces
3. **Feature Layer** (`*.types.ts`): Feature-specific extensions and utilities
4. **Application Layer** (`index.ts`): Consolidated exports and convenience types

### Design Principles
- **Type Safety First**: No `any` types, strict null checking
- **Developer Experience**: IntelliSense-friendly interfaces
- **Maintainability**: Modular structure with clear separation of concerns
- **Performance**: Efficient type inference and compilation

## Usage Examples

### Basic Entity Operations
```typescript
import type { Organization, CreateOrganizationSchema } from '@/types'

// Type-safe organization creation
const newOrg: CreateOrganizationSchema = {
  name: 'Acme Foods',
  type: 'customer',
  email: 'contact@acmefoods.com'
}
```

### Form Validation
```typescript
import type { ContactFormState, ContactFormAction } from '@/types'

// Fully typed form state management
const formState: ContactFormState = {
  data: {
    organization_id: '123',
    first_name: 'John',
    last_name: 'Doe'
  },
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: true
}
```

### API Service Implementation
```typescript
import type { OpportunityService, OpportunityFilter } from '@/types'

// Type-safe service interface
const opportunityService: OpportunityService = {
  getAll: async (filter?: OpportunityFilter) => {
    // Implementation with full type safety
  },
  // ... other methods
}
```

### Component Props
```typescript
import type { OrganizationCardProps } from '@/types'

// Vue component with typed props
const OrganizationCard = defineComponent<OrganizationCardProps>({
  props: {
    organization: { type: Object, required: true },
    showActions: { type: Boolean, default: false }
  }
})
```

## Best Practices

### 1. Import Organization
```typescript
// Prefer specific imports
import type { Organization, OrganizationFilter } from '@/types'

// Over broad imports
import type * as Types from '@/types'
```

### 2. Type Guards
```typescript
import { isOrganizationType } from '@/types'

// Use provided type guards for runtime validation
if (isOrganizationType(userInput)) {
  // userInput is now properly typed
}
```

### 3. Form Handling
```typescript
import type { CreateContactSchema } from '@/types'
import { validateSchema } from '@/utils/validation'

// Use schema types for consistent validation
const result = await validateSchema(contactSchema, formData)
if (result.isValid) {
  await contactService.create(result.data)
}
```

## Integration Points

### Supabase Client
The database types integrate seamlessly with Supabase:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

const supabase = createClient<Database>(url, key)
// All operations are now fully typed
```

### Vue 3 Composition API
Types work perfectly with Vue 3:
```typescript
import type { Organization } from '@/types'

const organizations = ref<Organization[]>([])
const loading = ref<LoadingState>('idle')
```

### Pinia Stores
Store operations are fully typed:
```typescript
import type { OrganizationStore, Organization } from '@/types'

export const useOrganizationStore = defineStore<OrganizationStore>('organizations', {
  state: () => ({
    organizations: [] as Organization[],
    loading: false
  })
})
```

## Future Considerations

### Extensibility
The type system is designed to be easily extensible:
- Add new entity types by following the established patterns
- Extend existing interfaces with new properties
- Create additional utility types as needed

### Validation Integration
While validation schemas are not included in this initial implementation, the type structure is designed to support:
- Yup schema generation from TypeScript types
- Zod integration for runtime validation
- Custom validation rule definitions

### Code Generation
The structured approach enables future code generation:
- API service boilerplate generation
- Form component generation
- CRUD operation templates

## Maintenance

### Database Schema Changes
When the database schema changes:
1. Update `database.types.ts` with new Supabase-generated types
2. Update corresponding interfaces in `entities.ts`
3. Extend feature-specific types as needed
4. Update validation schemas if implemented

### Adding New Features
For new features requiring new types:
1. Create feature-specific type file following naming convention
2. Add exports to `index.ts`
3. Include validation constants and type guards
4. Document usage patterns

This type system provides a solid foundation for type-safe development throughout the KitchenPantry CRM application.