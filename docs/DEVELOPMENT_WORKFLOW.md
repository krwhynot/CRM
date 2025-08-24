# Development Workflow Guide

## Overview

This guide provides a comprehensive workflow for developing features in the KitchenPantry CRM system, incorporating all architectural patterns, performance optimizations, and automated safeguards.

## Quick Start Development

### Setting Up Development Environment

```bash
# Clone and setup
git clone <repo-url>
cd CRM
npm install

# Start development server
npm run dev

# Validate setup
npm run validate
```

### Development Commands Reference

```bash
# Core Development
npm run dev                    # Start development server
npm run build                  # Production build
npm run preview                # Preview production build
npm run validate              # Complete validation pipeline

# Code Quality
npm run lint                   # ESLint validation
npm run lint:architecture      # Architectural validation
npm run type-check            # TypeScript validation
npm run format                # Format code with Prettier

# Performance & Analysis
npm run optimize:performance   # Performance analysis
npm run analyze               # Bundle analysis
npm run validate:performance  # Performance validation

# Development Tools
npm run dev:assist            # Development assistant
npm run dev:health            # Development health check
npm run dev:fix               # Auto-fix common issues

# Architecture Validation
npm run validate:architecture # Comprehensive structure validation
npm run quality-gates         # Run all quality gates
```

## Feature Development Workflow

### 1. Planning Phase

Before starting development, use the development assistant to analyze requirements:

```bash
# Analyze existing patterns for similar features
npm run dev:assist analyze
```

### 2. Component Creation

Use the development assistant for consistent component creation:

```bash
# Create feature component
npm run dev:assist create component ContactForm contacts

# Create shared component (if truly reusable)
npm run dev:assist create component DataTable --shared

# Create feature hook
npm run dev:assist create hook useContactAdvocacy contacts

# Create client state store
npm run dev:assist create store contactsViewStore
```

### 3. State Management Implementation

Follow the clear separation patterns:

#### Server State (TanStack Query)
```typescript
// /src/features/contacts/hooks/useContacts.ts
export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => contactsService.getContacts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateContact() {
  return useMutation({
    mutationFn: contactsService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  })
}
```

#### Client State (Zustand)
```typescript
// /src/stores/contactsViewStore.ts
interface ContactsViewState {
  viewMode: 'list' | 'grid'
  selectedIds: string[]
  isFiltersOpen: boolean
}

export const useContactsView = create<ContactsViewState>((set) => ({
  viewMode: 'list',
  selectedIds: [],
  isFiltersOpen: false,
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(item => item !== id)
      : [...state.selectedIds, id]
  }))
}))
```

### 4. Component Implementation

#### Feature Components
```typescript
// /src/features/contacts/components/ContactForm.tsx
import { useCreateContact } from '../hooks/useContacts'
import { useOptimizedFormSubmit } from '@/lib/performance-optimizations'

export function ContactForm() {
  const createMutation = useCreateContact()
  
  const { handleSubmit, isSubmitting } = useOptimizedFormSubmit(
    createMutation.mutate,
    () => onSuccess?.(),
    (error) => console.error('Form submission error:', error)
  )

  return (
    <form onSubmit={handleSubmit}>
      {/* Form implementation */}
    </form>
  )
}
```

#### Performance Optimizations
Apply relevant optimizations based on component type:

```typescript
// Large data tables - use virtualization
const { visibleItems } = useVirtualScrolling(contacts, 50, 400)

// Search components - use debouncing  
const debouncedQuery = useDebounce(searchQuery, 300)

// Form components - use optimized submission
const { handleSubmit, isSubmitting } = useOptimizedFormSubmit(submitFn)
```

### 5. Validation During Development

Run validation checks frequently during development:

```bash
# Quick validation during development
npm run type-check
npm run lint:architecture

# Full validation before commits
npm run validate
npm run quality-gates
```

### 6. Testing Implementation

Create tests following the established patterns:

```typescript
// Feature component tests
import { render, screen } from '@testing-library/react'
import { ContactForm } from './ContactForm'

test('renders contact form with proper validation', () => {
  render(<ContactForm />)
  expect(screen.getByRole('form')).toBeInTheDocument()
})
```

## Code Review Process

### Pre-Review Checklist

Before creating a pull request:

- [ ] Run `npm run validate` (passes all checks)
- [ ] Run `npm run lint:architecture` (no violations)
- [ ] Components are in correct directories
- [ ] State management follows separation patterns
- [ ] Performance optimizations applied where appropriate
- [ ] Tests written and passing
- [ ] Documentation updated if needed

### Review Focus Areas

When reviewing code:

1. **Architecture Compliance**
   - Components in correct feature/shared directories
   - Proper state separation (TanStack Query vs Zustand)
   - Import patterns follow conventions

2. **Performance Considerations**
   - Large lists use virtualization
   - Search inputs are debounced
   - Forms use optimized submission patterns
   - Unnecessary re-renders avoided

3. **Type Safety**
   - No `any` types used
   - Proper interfaces defined
   - Generic types used appropriately

4. **Code Quality**
   - ESLint rules followed
   - Consistent naming conventions
   - Proper error handling

## Common Development Patterns

### Feature Structure Template

```
/src/features/[feature-name]/
├── components/           # Feature-specific components
│   ├── [Feature]Form.tsx
│   ├── [Feature]Table.tsx
│   ├── [Feature]Card.tsx
│   └── index.ts
├── hooks/               # TanStack Query hooks
│   ├── use[Feature].ts
│   ├── use[Feature]Mutations.ts
│   └── index.ts
├── types/               # Feature-specific types
│   └── index.ts
└── index.ts             # Feature exports
```

### Component Templates

The development assistant generates components with these patterns:

```typescript
// Standard component template
interface ComponentProps {
  className?: string
  // ... other props
}

export function Component({ className, ...props }: ComponentProps) {
  // Performance monitoring in development
  usePerformanceMonitoring('ComponentName')
  
  // State management
  const { data } = useServerData()  // TanStack Query
  const { uiState } = useClientState()  // Zustand
  
  return (
    <div className={cn(className)} {...props}>
      {/* Component JSX */}
    </div>
  )
}
```

## Performance Guidelines

### Always Consider Performance

1. **Large Data Sets**: Use virtualization
2. **Search/Filter**: Implement debouncing
3. **Forms**: Use optimized submission patterns
4. **Complex Components**: Apply memoization
5. **Server Operations**: Use TanStack Query optimizations

### Performance Monitoring

Monitor key metrics during development:

```bash
# Run performance analysis
npm run optimize:performance

# Check bundle size
npm run analyze

# Validate performance benchmarks
npm run validate:performance
```

## Troubleshooting Development Issues

### Architectural Violations

If ESLint reports architectural violations:

```bash
# Get detailed analysis
npm run dev:assist analyze

# Auto-fix common issues
npm run dev:fix
```

### Performance Issues

If components are slow:

```bash
# Run performance analysis
npm run optimize:performance

# Check for common performance anti-patterns
npm run dev:assist analyze performance
```

### State Management Confusion

If unsure about state placement:

- **Server data** (from API/database) → TanStack Query
- **UI state** (preferences, form state) → Zustand
- **Temporary component state** → useState

## Best Practices Summary

### Do's ✅

- Use development assistant for component generation
- Follow feature-based directory structure
- Separate server state (TanStack Query) from client state (Zustand)
- Apply performance optimizations proactively
- Run validation checks frequently
- Write tests for components and hooks
- Use TypeScript strictly (no `any` types)
- Follow established naming conventions

### Don'ts ❌

- Don't put feature components in `/src/components/`
- Don't mix server data with client UI state
- Don't skip performance optimizations for large data
- Don't ignore ESLint architectural rules
- Don't create components without proper typing
- Don't bypass the validation pipeline
- Don't duplicate state between Query cache and Zustand

## Getting Help

### Development Assistant

```bash
# Get help with any development task
npm run dev:assist help

# Analyze existing patterns
npm run dev:assist analyze

# Create components with proper patterns
npm run dev:assist create [type] [name] [feature]
```

### Documentation Resources

- `/docs/STATE_MANAGEMENT_GUIDE.md` - State management patterns
- `/docs/COMPONENT_ORGANIZATION_GUIDELINES.md` - Component structure
- `/docs/ARCHITECTURAL_SAFEGUARDS.md` - Automated enforcement
- `/docs/TECHNICAL_GUIDE.md` - Technical architecture

### Validation Tools

- `npm run lint:architecture` - Architecture validation
- `npm run validate` - Complete validation pipeline
- `npm run quality-gates` - All quality checks

---

*This development workflow ensures consistent, high-quality code that follows established architectural patterns and performance best practices.*