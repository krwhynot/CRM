# Development Guide

This comprehensive guide covers all aspects of developing with the KitchenPantry CRM system, from coding standards to advanced workflows.

## Quick Reference Commands

### Essential Development Commands

```bash
# Core Development
npm run dev                    # Start development server (Vite)
npm run build                  # Production build with optimizations  
npm run preview                # Preview production build locally
npm run type-check             # TypeScript compilation check
npm run lint                   # ESLint with architectural rules (max 20 warnings)
npm run format                 # Prettier code formatting
npm run validate               # Complete pipeline: type-check + lint + build

# Quality & Architecture
npm run quality-gates          # 6-stage comprehensive validation pipeline
npm run validate:architecture  # Architecture pattern validation
npm run validate:performance   # Performance baseline validation
npm run lint:architecture      # Custom architectural lint rules
npm run dev:health            # Development health check
npm run dev:fix               # Auto-fix common development issues

# Testing
npm test                      # Run all MCP tests
npm run test:backend          # Vitest unit/integration tests
npm run test:backend:coverage # Backend tests with coverage
npm run test:architecture     # Architecture boundary validation
npm run test:db              # Database-specific tests
npm run test:security        # Security validation tests

# Bundle Analysis & Performance  
npm run analyze              # Bundle visualizer with gzip analysis
npm run optimize:performance # Performance optimization analysis
npm run clean                # Clean build artifacts
npm run fresh                # Clean install (removes node_modules)

# Development Tools
npm run dev:assist            # Development assistant
npm run dev:health            # Development health check
npm run dev:fix               # Auto-fix common issues
```

## 10 Essential Coding Rules

### 1. KISS Principle (Keep It Simple)
Always favor clear, concise, and maintainable code. Use shadcn/ui components instead of building from scratch — they are pre-styled, accessible, and follow consistent design patterns.

```typescript
// ✅ Good: Use shadcn component
import { Button } from '@/components/ui/button'
<Button variant="outline" size="sm">Action</Button>

// ❌ Avoid: Custom button implementation
<button className="px-4 py-2 border rounded hover:bg-gray-100...">
```

### 2. Single Responsibility SQL Queries
Each SQL query should have one clear purpose. Use CTEs for complex logic.

```sql
-- ✅ Good: Clear, single purpose
WITH organization_activity AS (
  SELECT organization_id, COUNT(*) as interaction_count
  FROM interactions 
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND deleted_at IS NULL
  GROUP BY organization_id
)
SELECT * FROM organization_activity WHERE interaction_count > 5 LIMIT 100;
```

### 3. TypeScript-First Development
Never use `any` type. Always define explicit interfaces.

```typescript
// ✅ Good: Explicit typing
interface Organization {
  id: string;
  name: string;
  priority: 'A+' | 'A' | 'B' | 'C' | 'D';
  status: 'Active' | 'Inactive' | 'Prospect';
}

// ❌ Avoid
const organization: any = { ... }
```

### 4. Component Composition Over Inheritance
Use shadcn/ui primitives wrapped in CRM-specific components.

```typescript
// ✅ Good: Composition with shadcn/ui
export function OrganizationCard({ organization }: { organization: Organization }) {
  return (
    <Card className="p-4">
      <CardHeader>
        <Badge variant={getBadgeVariant(organization.priority)}>
          {organization.priority}
        </Badge>
      </CardHeader>
      <CardContent>{organization.name}</CardContent>
    </Card>
  )
}
```

### 5. Defensive Database Design
Always use UUIDs, soft deletes, and timestamps. Never cascade deletes.

```sql
-- ✅ Good: Defensive design
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Consistent Error Handling
Use shadcn/ui Toast for transient messages and Dialog for blocking errors.

```typescript
// ✅ Good: Consistent error handling
import { toast } from '@/components/ui/use-toast'

try {
  await createContact(data)
  toast({ title: "Success", description: "Contact created successfully" })
} catch (error) {
  toast({ 
    title: "Error", 
    description: "Failed to create contact",
    variant: "destructive" 
  })
}
```

### 7. Mobile-First Responsive Design
Start mobile-first with Tailwind CSS utilities.

```typescript
// ✅ Good: Mobile-first with proper touch targets
<Button 
  size="lg"  // Ensures 44px minimum touch target
  className="w-full md:w-auto"  // Full width on mobile, auto on desktop
>
  Action
</Button>
```

### 8. Optimistic UI Updates
Use Toast for feedback and skeleton loaders during revalidation.

```typescript
// ✅ Good: Optimistic updates with feedback
const createMutation = useMutation({
  mutationFn: createContact,
  onMutate: () => {
    toast({ title: "Creating contact..." })
  },
  onSuccess: () => {
    toast({ title: "Contact created successfully" })
  },
  onError: () => {
    toast({ title: "Failed to create contact", variant: "destructive" })
  }
})
```

### 9. Relationship-Centric Data Modeling
Model data around relationships, not transactions. Use junction tables with metadata.

```sql
-- ✅ Good: Relationship-focused with metadata
CREATE TABLE opportunity_principals (
  opportunity_id UUID REFERENCES opportunities(id),
  principal_id UUID REFERENCES organizations(id),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (opportunity_id, principal_id)
);
```

### 10. Performance-First Database Queries
Index foreign keys and use LIMIT on all queries.

```sql
-- ✅ Good: Performance-optimized
SELECT p.*, COUNT(i.id) as interaction_count
FROM principals p
LEFT JOIN interactions i ON p.id = i.principal_id 
  AND i.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND i.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id
ORDER BY p.last_interaction_date DESC
LIMIT 20;
```

## State Management Architecture

### Clear State Separation (January 2025)

**🗄️ Server State (TanStack Query)**
- Location: `/src/features/*/hooks/`
- Purpose: Data from APIs/database
- Examples: Organizations, contacts, authentication status

```typescript
// ✅ Server data via TanStack Query
const { data: organizations, isLoading } = useOrganizations(filters)
const createMutation = useCreateOrganization()
```

**🎨 Client State (Zustand)**
- Location: `/src/stores/`
- Purpose: UI state, preferences, temporary data
- Examples: View modes, filters, form state, selected IDs only

```typescript
// ✅ Client UI state via Zustand
const { viewMode, setViewMode } = useAdvocacyView()
const { selectedContactId, setSelectedContactId } = useContactsView()
```

### Type Safety Utilities

```typescript
// Import type safety utilities
import { 
  BaseClientState, 
  ClientStateStore, 
  CreateClientFilters, 
  validateClientState 
} from '@/lib/state-type-safety'

// ✅ Good: Type-safe client store
export interface ContactsUIState extends BaseClientState {
  selectedContactId: string | null  // ID only, not full object
  filters: CreateClientFilters<{
    search?: string
    status?: 'active' | 'inactive'
  }>
  viewMode: 'list' | 'cards'
  isFormOpen: boolean
}
```

### Anti-Patterns to Avoid

```typescript
// ❌ Don't store server objects in client state
interface BadClientState {
  selectedContact: ContactWithOrganization  // Server data!
  contacts: Contact[]  // Server data array!
}

// ✅ Store only IDs in client state
interface GoodClientState {
  selectedContactId: string | null  // ID only
  // Server data comes from useContacts() hook
}
```

## Component Development Workflow

### 1. Feature Structure Template

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

### 2. Component Creation with Development Assistant

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

### 3. Component Template Pattern

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

### 4. Performance Optimizations

Apply relevant optimizations based on component type:

```typescript
// Large data tables - use virtualization
const { visibleItems } = useVirtualScrolling(contacts, 50, 400)

// Search components - use debouncing  
const debouncedQuery = useDebounce(searchQuery, 300)

// Form components - use optimized submission
const { handleSubmit, isSubmitting } = useOptimizedFormSubmit(submitFn)
```

## MCP Tools Usage Guidelines

### Response Size Limits

Most MCP tools have a **25,000 token response limit**. Always use appropriate limits and filters.

### Database Queries

```sql
-- ❌ Avoid unlimited queries
SELECT * FROM interactions;

-- ✅ Always use LIMIT and filters
SELECT * FROM interactions 
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND deleted_at IS NULL
LIMIT 100;
```

### Documentation Searches

```bash
# ❌ Too broad
mcp__supabase__search_docs(query: "database")

# ✅ Specific and limited
mcp__supabase__search_docs(query: "database migrations setup", limit: 5)
```

### API Operations

```bash
# ✅ Use pagination parameters
mcp__github__list_issues(
  owner: "org", 
  repo: "repo",
  state: "open",
  per_page: 25
)
```

## Architectural Safeguards

### ESLint Architecture Rules

The system automatically enforces architectural patterns:

```javascript
// Prevents direct Supabase client imports in components
'no-restricted-imports': {
  paths: [{
    name: '@supabase/supabase-js',
    importNames: ['createClient'],
    message: 'Use feature-specific hooks instead of direct Supabase calls'
  }]
}
```

### Custom ESLint Plugin

**State Boundary Validation:**
- `no-server-data-in-stores`: Prevents server data fields in Zustand stores
- `enforce-feature-imports`: Validates proper feature-based import patterns
- `validate-client-state`: Ensures client state stores only contain UI state

### Architecture Validation

```bash
# Validate component organization
npm run lint:architecture

# Comprehensive structure validation
npm run validate:architecture

# Complete validation pipeline
npm run validate
```

## Quality Gates & Testing

### Pre-Commit Checklist

Before submitting any PR:

- [ ] Run `npm run validate` (passes all checks)
- [ ] Run `npm run lint:architecture` (no violations)
- [ ] Components are in correct directories
- [ ] State management follows separation patterns
- [ ] Performance optimizations applied where appropriate
- [ ] Tests written and passing

### Quality Gates Pipeline

```bash
# Run comprehensive quality gates
npm run quality-gates

# Individual gates
npm run type-check          # TypeScript compilation
npm run lint               # ESLint validation
npm run lint:architecture  # Architecture rules
npm run build              # Build success
npm run validate:performance # Performance benchmarks
```

### Testing Strategy

```typescript
// Feature component tests
import { render, screen } from '@testing-library/react'
import { ContactForm } from './ContactForm'

test('renders contact form with proper validation', () => {
  render(<ContactForm />)
  expect(screen.getByRole('form')).toBeInTheDocument()
})
```

## Development Best Practices

### Do's ✅

- Use development assistant for component generation
- Follow feature-based directory structure
- Separate server state (TanStack Query) from client state (Zustand)
- Apply performance optimizations proactively
- Run validation checks frequently
- Write tests for components and hooks
- Use TypeScript strictly (no `any` types)
- Follow established naming conventions
- Use shadcn/ui components as first choice

### Don'ts ❌

- Don't put feature components in `/src/components/`
- Don't mix server data with client UI state
- Don't skip performance optimizations for large data
- Don't ignore ESLint architectural rules
- Don't create components without proper typing
- Don't bypass the validation pipeline
- Don't duplicate state between Query cache and Zustand
- Don't build custom UI when shadcn/ui has the component

## Performance Guidelines

### Always Consider Performance

1. **Large Data Sets**: Use virtualization with `useVirtualScrolling`
2. **Search/Filter**: Implement debouncing with `useDebounce`
3. **Forms**: Use optimized submission with `useOptimizedFormSubmit`
4. **Complex Components**: Apply memoization patterns
5. **Server Operations**: Use TanStack Query optimizations

### Performance Monitoring

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

```bash
# Get detailed analysis
npm run dev:assist analyze

# Auto-fix common issues
npm run dev:fix

# Detailed architectural validation
npm run lint:architecture
```

### State Management Issues

If unsure about state placement:
- **Server data** (from API/database) → TanStack Query hooks
- **UI state** (preferences, form state) → Zustand stores  
- **Temporary component state** → useState

### Performance Issues

```bash
# Performance analysis
npm run optimize:performance

# Check for common anti-patterns
npm run dev:assist analyze performance
```

## Development Tools Integration

### Development Assistant

```bash
# Get help with any development task
npm run dev:assist help

# Analyze existing patterns
npm run dev:assist analyze

# Create components with proper patterns
npm run dev:assist create [type] [name] [feature]
```

### VS Code Integration

Install recommended extensions:
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

## Getting Help

### Documentation Resources

- [Architecture Guide](ARCHITECTURE.md) - System design and patterns
- [Getting Started](GETTING_STARTED.md) - Setup and onboarding
- [User Guide](USER_GUIDE.md) - Understanding CRM features
- [Deployment Guide](DEPLOYMENT.md) - Production deployment

### Development Tools

- `npm run dev:assist help` - Development assistant
- `npm run lint:architecture` - Architecture validation
- `npm run validate` - Complete validation pipeline
- `npm run quality-gates` - All quality checks

---

*This development guide provides comprehensive patterns and tools for building high-quality, maintainable code in the KitchenPantry CRM system.*