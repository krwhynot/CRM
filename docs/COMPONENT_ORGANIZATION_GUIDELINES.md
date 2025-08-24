# Component Organization Guidelines

## Overview

This document establishes clear guidelines for organizing React components in our CRM system, ensuring consistency and maintainability as the codebase scales.

## Architecture Philosophy

Our component organization follows a **feature-based architecture** with clear separation between shared and feature-specific components.

## Directory Structure

### `/src/components/` - Shared Components Only

**Purpose**: Contains only truly generic, reusable components that are used across multiple features.

**What belongs here:**
- ✅ Global navigation components (CommandPalette)
- ✅ Generic form system components (forms/)
- ✅ Design system primitives (ui/)
- ✅ Global error handling (error-boundaries/)
- ✅ Cross-cutting utility components

**What does NOT belong here:**
- ❌ Components specific to a single feature
- ❌ Business logic components
- ❌ Domain-specific UI components

### `/src/features/{feature}/components/` - Feature-Specific Components

**Purpose**: Contains all components that belong to a specific business domain or feature.

**What belongs here:**
- ✅ Feature-specific UI components
- ✅ Business logic components
- ✅ Domain-specific forms and tables
- ✅ Feature-specific charts and visualizations
- ✅ Components only used within this feature

## Decision Framework

When creating a new component, ask these questions:

### 1. Usage Scope
- **Is this component used by multiple features?** → `/src/components/`
- **Is this component only used by one feature?** → `/src/features/{feature}/components/`

### 2. Business Logic
- **Does this component contain business logic specific to a domain?** → Feature directory
- **Is this a generic UI primitive?** → Shared components

### 3. Dependencies
- **Does this component import feature-specific hooks or types?** → Feature directory
- **Does this component only use generic utilities?** → Could be shared

## Examples

### ✅ Correctly Placed Components

```
/src/components/
├── CommandPalette.tsx        # Used globally for navigation
├── ui/button.tsx             # Generic UI primitive
├── forms/FormInput.tsx       # Generic form component
└── error-boundaries/         # Global error handling

/src/features/dashboard/components/
├── StatsCards.tsx            # Dashboard-specific metrics
├── QuickActions.tsx          # Dashboard quick actions
└── ChartCard.tsx             # Dashboard chart wrapper

/src/features/contacts/components/
├── ContactForm.tsx           # Contact-specific form
├── ContactsTable.tsx         # Contact data table
└── ContactRow.tsx            # Contact display component
```

### ❌ Incorrectly Placed Components

```
# DON'T: Feature-specific component in shared directory
/src/components/ContactForm.tsx     # Should be in /features/contacts/

# DON'T: Generic UI component in feature directory  
/features/dashboard/components/Button.tsx  # Should be in /components/ui/

# DON'T: Cross-feature component in single feature
/features/contacts/components/SearchBar.tsx  # If used by multiple features
```

## Import Conventions

### Shared Components
```typescript
// From anywhere in the app
import { CommandPalette } from '@/components/CommandPalette'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/forms'
```

### Feature Components
```typescript
// Within the same feature (preferred)
import { ContactForm } from './ContactForm'
import { StatsCards } from '../StatsCards'

// From feature index (when importing from outside the feature)
import { ContactForm } from '@/features/contacts'
```

## Migration Guidelines

When moving components between directories:

1. **Move the component file** to the appropriate directory
2. **Update all import statements** that reference the component
3. **Update index.ts files** to export/remove the component
4. **Run type checking** to ensure no broken imports
5. **Test the application** to verify functionality

## Naming Conventions

### Shared Components
- Use generic, descriptive names
- Avoid domain-specific terminology
- Example: `FormInput`, `DataTable`, `Modal`

### Feature Components
- Use domain-specific names when appropriate
- Be descriptive about the component's purpose
- Example: `ContactForm`, `OpportunityCard`, `DashboardStats`

## File Organization Within Directories

### Group Related Components
```
/src/features/dashboard/components/
├── charts/                   # Chart-related components
│   ├── ChartCard.tsx
│   ├── InteractionsChart.tsx
│   └── OpportunitiesChart.tsx
├── activity/                 # Activity-related components
│   ├── ActivityFeed.tsx
│   └── ActivityFilters.tsx
├── StatsCards.tsx           # Standalone components
└── QuickActions.tsx
```

### Maintain Clean Index Files
```typescript
// /src/features/dashboard/components/index.ts
export { StatsCards } from './StatsCards'
export { QuickActions } from './QuickActions'
export * from './charts'
export * from './activity'
```

## Testing Strategy

- **Shared components**: Test in isolation with various props
- **Feature components**: Test within feature context
- **Integration**: Test component interactions within features

## Best Practices

1. **Single Responsibility**: Each component should have one clear purpose
2. **Dependency Direction**: Features can import from shared, not vice versa
3. **Co-location**: Keep related components, hooks, and types together
4. **Documentation**: Document component purpose and usage patterns
5. **Consistency**: Follow established patterns for similar components

## Automated Enforcement

### 🔒 **ESLint Rules**
Our architectural safeguards automatically enforce component organization:

```javascript
// .eslintrc.cjs
rules: {
  'crm-architecture/enforce-feature-boundaries': 'error',
  'no-restricted-imports': ['error', {
    patterns: [
      {
        group: ['@/features/*/components/*'],
        message: 'Import feature components from feature index or relative paths'
      }
    ]
  }]
}
```

### 🛠️ **Development Tools**
Use the development assistant to generate properly organized components:

```bash
# Creates component in correct feature directory
npm run dev:assist create component ContactForm contacts

# Creates shared component in correct location
npm run dev:assist create component DataTable --shared
```

### ✅ **Validation Scripts**
- `npm run lint:architecture` - Validates component organization
- `scripts/validate-architecture.js` - Comprehensive structure validation

## Performance Considerations

### 🎯 **Component Optimization**
Feature components can leverage performance optimizations:

```typescript
// Use performance utilities from /src/lib/performance-optimizations.ts
import { useVirtualScrolling, useDebounce } from '@/lib/performance-optimizations'

export function ContactsTable({ contacts }) {
  const { visibleItems } = useVirtualScrolling(contacts, 50, 400)
  
  return (
    <div>
      {visibleItems.items.map(contact => (
        <ContactRow key={contact.id} contact={contact} />
      ))}
    </div>
  )
}
```

### ⚡ **State Management Integration**
Components should follow state separation patterns:

```typescript
// Feature component with proper state separation
import { useContacts } from '@/features/contacts/hooks'  // Server state
import { useContactsView } from '@/stores'  // Client state

export function ContactsPage() {
  const { data: contacts } = useContacts()  // TanStack Query
  const { viewMode } = useContactsView()    // Zustand
  
  return <ContactsTable contacts={contacts} viewMode={viewMode} />
}
```

## Code Review Checklist

When reviewing PRs with new components:

- [ ] Is the component in the correct directory based on usage?
- [ ] Are imports using the correct paths?
- [ ] Is the component exported from the appropriate index.ts?
- [ ] Does the component follow naming conventions?
- [ ] Is the component properly typed?
- [ ] Does it follow state management patterns (TanStack Query vs Zustand)?
- [ ] Are performance optimizations applied where appropriate?
- [ ] Does it pass `npm run lint:architecture`?
- [ ] Are there tests for the component?

## Common Pitfalls

### 1. Premature Generalization
Don't move a component to shared until it's actually used by multiple features.

### 2. Feature Coupling in Shared Components
Shared components should not import from feature directories.

### 3. Inconsistent Import Paths
Stick to the established import conventions for better maintainability.

### 4. Missing Index Exports
Always update index.ts files when moving components.

### 5. Ignoring State Boundaries
Don't mix server data (TanStack Query) with client state (Zustand) in components.

## Getting Help

If you're unsure where a component should go:
1. Check this document's decision framework
2. Look at similar existing components
3. Ask the team during code review
4. Consider the component's dependencies and usage

## Maintenance

This document should be updated when:
- New component categories are established
- Architecture patterns change
- Team conventions evolve
- New tools or frameworks are adopted

---

*Last updated: January 2025 - Post-architectural refactoring*
*Next review: Quarterly with architecture team*