# Architecture Guide

KitchenPantry CRM is built with a modern, specialized architecture designed for Master Food Brokers in the food service industry. This comprehensive guide covers all architectural decisions, patterns, and safeguards.

## System Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Development   │
│                 │    │                 │    │                 │
│ React 18 + TS   │◄──►│ Supabase        │◄──►│ 14-Agent        │
│ Vite + shadcn   │    │ PostgreSQL      │    │ Architecture    │
│ Tailwind CSS    │    │ Auth + RLS      │    │ MCP Tools       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Technology Stack

**Frontend Layer**
- **React 18** - Modern React with concurrent features
- **TypeScript 5** - Strict type safety throughout
- **Vite** - Fast build tool and development server
- **shadcn/ui** - Consistent, accessible component library
- **Tailwind CSS** - Utility-first styling framework

**Backend Layer**
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL 17** - Primary database with advanced features
- **Row Level Security** - Database-level access control
- **Real-time subscriptions** - Live data updates
- **Authentication** - Built-in auth with JWT tokens

**Development Architecture**
- **14 Specialized Agents** - Each focused on specific CRM aspects
- **MCP Tools Integration** - 12+ tools for automated development
- **Feature-based organization** - Modular, scalable structure
- **Type-driven development** - Schema-first approach

## Core Business Entities

The system is built around 5 interconnected business entities:

```
Organizations ──┐
                ├── Contacts ──┐
Products ───────┘             ├── Opportunities ──► Interactions
                              └── (Communication History)
```

### Entity Relationships

1. **Organizations** - Can be both Principals (suppliers) and Distributors
2. **Contacts** - Individual people within organizations
3. **Products** - Items sold, belonging only to Principal organizations
4. **Opportunities** - Sales opportunities linking all entities
5. **Interactions** - Complete communication and activity history

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
- Examples: View modes, filters, form state, selected items

```typescript
// ✅ Client UI state via Zustand
const { viewMode, setViewMode } = useAdvocacyView()
const { isFormOpen, openCreateForm } = useAdvocacyForm()
```

### State Management Best Practices

**When to Use TanStack Query:**
- Fetching data from APIs/database
- Creating, updating, deleting records
- Real-time data synchronization
- Background data refetching
- Optimistic updates

**When to Use Zustand:**
- UI view preferences
- Form state management
- Component interaction state
- User settings and preferences
- Temporary selections

**Anti-Patterns to Avoid:**
- ❌ Never store server data in Zustand stores
- ❌ Don't duplicate data between Query cache and Zustand
- ❌ Avoid manual cache invalidation when using TanStack Query
- ❌ Don't use useState for global client state

## Component Organization

### Feature-Based Architecture

**`/src/components/` - Shared Components Only**
- Global navigation (CommandPalette)
- Generic form system components (forms/)
- Design system primitives (ui/)
- Cross-cutting utility components

**`/src/features/{feature}/components/` - Feature-Specific Components**
- Feature-specific UI components
- Business logic components
- Domain-specific forms and tables
- Components only used within this feature

### Decision Framework

When creating components:
1. **Usage Scope**: Multiple features → shared, Single feature → feature directory
2. **Business Logic**: Domain-specific → feature directory, Generic UI → shared
3. **Dependencies**: Feature-specific imports → feature directory

### Import Conventions

```typescript
// Shared components
import { CommandPalette } from '@/components/CommandPalette'
import { Button } from '@/components/ui/button'

// Feature components (within same feature)
import { ContactForm } from './ContactForm'

// Feature components (from outside feature)
import { ContactForm } from '@/features/contacts'
```

## Security Architecture

### Authentication & Authorization
- **Supabase Auth** - Industry-standard authentication
- **Row Level Security (RLS)** - Database-level access control
- **JWT Tokens** - Secure session management
- **Role-based Access** - Sales Manager permissions

### Data Security
- **Encrypted at Rest** - Database encryption
- **Encrypted in Transit** - HTTPS/TLS everywhere
- **Audit Logging** - Complete activity tracking
- **Data Isolation** - Tenant-specific data access

## Performance Architecture

### Database Optimization
- **Strategic Indexing** - All foreign keys and query patterns
- **Query Optimization** - Sub-5ms response times
- **Connection Pooling** - Efficient database connections
- **Soft Deletes** - Data preservation with performance

### Frontend Optimization
- **Code Splitting** - Feature-based bundle splitting
- **React Query Caching** - Intelligent data caching
- **Optimistic Updates** - Immediate UI feedback
- **Bundle Optimization** - Tree-shaking and minification

### Performance Tools & Utilities

**Query Optimizations** (`/src/lib/query-optimizations.ts`):
```typescript
// Optimized query client for CRM workload
const queryClient = createOptimizedQueryClient()

// Batch operations for related data
const results = useBatchOptimizedQueries([
  { queryKey: ['organizations'], queryFn: fetchOrganizations },
  { queryKey: ['contacts'], queryFn: fetchContacts }
])
```

**Component Optimizations** (`/src/lib/performance-optimizations.ts`):
```typescript
// Virtual scrolling for large datasets
const { visibleItems } = useVirtualScrolling(items, 50, 400)

// Debounced search with caching
const { results } = useCachedSearch(searchFunction, query)

// Optimized form submissions
const { handleSubmit, isSubmitting } = useOptimizedFormSubmit(submitFn)
```

## Architectural Safeguards

### ESLint Architecture Rules

**State Management Enforcement:**
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

**Import Pattern Validation:**
```javascript
// Prevents cross-feature component imports
patterns: [{
  group: ['@/features/*/components/*'],
  message: 'Import feature components from feature index or relative paths'
}]
```

### Custom ESLint Plugin (`eslint-plugins/crm-architecture.js`)

**State Boundary Validation:**
- `no-server-data-in-stores`: Prevents server data fields in Zustand stores
- `enforce-feature-imports`: Validates proper feature-based import patterns
- `validate-client-state`: Ensures client state stores only contain UI state

### Architecture Validation Script (`scripts/validate-architecture.js`)

**Component Organization:**
- ✅ Validates feature-specific components are in correct directories
- ✅ Ensures shared components don't contain business logic
- ✅ Checks for proper component placement

**File Size Monitoring:**
- Components: 25KB limit (~800 lines)
- Hooks: 20KB limit (~600 lines)
- Utilities: 15KB limit (~450 lines)
- Types: 50KB limit (~1500 lines)

### TypeScript Architectural Constraints (`tsconfig.architectural.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 14-Agent Specialized Architecture

### Core Development Agents
1. **Database & Schema Architect** - Complete database design and optimization
2. **CRM Authentication Manager** - Security and access control
3. **Analytics & Reporting Engine** - Business intelligence and metrics
4. **CRM Deployment Orchestrator** - Production deployment and monitoring
5. **Coordinated UI Component Builder** - Design system and components
6. **Performance & Search Optimization** - Database and query performance

### Specialized Function Agents
7. **Data Integration & Migration** - Excel imports and data pipelines
8. **Testing & Quality Assurance** - Automated testing and validation
9. **API & Integration** - RESTful APIs and third-party integrations
10. **Documentation & Knowledge Management** - Comprehensive documentation
11. **Mobile CRM Optimizer** - iPad-first mobile optimization
12. **Activity Feed Builder** - Real-time activity tracking
13. **Business Logic Validator** - Data validation and business rules
14. **Code Maintenance Optimizer** - Code quality and optimization

## MCP Tools Integration

The architecture leverages 12+ MCP (Model Context Protocol) tools:
- **supabase** - Database operations and management
- **postgres** - Advanced database analysis and optimization
- **shadcn-ui** - Component library integration
- **playwright** - Automated browser testing
- **github** - Repository and deployment management
- **vercel** - Production hosting and monitoring
- **knowledge-graph** - Relationship mapping and memory
- **sequential-thinking** - Complex problem-solving workflows

## Mobile-First Design

### iPad Optimization
The system is specifically designed for iPad-using field sales teams:
- **Touch-friendly interfaces** - 44px minimum touch targets
- **Portrait/landscape support** - Flexible layouts
- **Offline considerations** - Graceful network handling
- **Field-optimized workflows** - Quick data entry and retrieval

## Quality Assurance

### Testing Strategy
- **Automated Testing** - Playwright end-to-end tests
- **Manual Testing** - Comprehensive UAT processes
- **Performance Testing** - Load testing and monitoring
- **Security Testing** - Authentication and authorization testing

### Code Quality
- **TypeScript Strict Mode** - 100% type coverage
- **ESLint Configuration** - Consistent code standards
- **Pre-commit Hooks** - Automated quality checks
- **Code Reviews** - Peer review requirements

## Development Workflow Integration

### Daily Development Commands
```bash
# Quick architecture check
npm run lint:architecture

# Detailed validation
npm run validate:architecture

# Complete validation pipeline
npm run validate

# Performance analysis
npm run optimize:performance

# Bundle analysis
npm run analyze
```

### Component Generation
```bash
# Use dev assistant for consistent patterns
npm run dev:assist create component ContactTable contacts
npm run dev:assist create hook useContactAdvocacy contacts
npm run dev:assist create store advocacyUIStore
```

## Scalability & Future Considerations

### Current Capacity
- **Users**: 3-5 concurrent sales managers
- **Data**: Thousands of organizations and contacts
- **Performance**: Sub-5ms database queries
- **Uptime**: 99.9% availability target

### Growth Path
- **Horizontal Scaling** - Add more Supabase compute
- **Feature Expansion** - Modular agent architecture supports growth
- **Team Scaling** - Clear patterns for adding developers
- **Data Growth** - PostgreSQL scales to millions of records

### Potential Enhancements
- **Multi-tenancy** - Support for multiple food broker companies
- **Advanced Analytics** - Machine learning integration
- **Mobile Apps** - Native iOS/Android applications
- **API Marketplace** - Third-party integration ecosystem

## Deployment Architecture

### Production Environment
```
GitHub Repository ──► Vercel (Frontend) ──► CDN
                  └─► Supabase (Backend) ──► PostgreSQL
```

### CI/CD Pipeline
- **GitHub Actions** - Automated testing and deployment
- **Vercel Integration** - Automatic deployments from main branch
- **Environment Management** - Separate dev/staging/production
- **Monitoring** - Real-time performance and error tracking

## Troubleshooting Architecture Issues

### Common Issues and Solutions

**"Server data in client state"**
- Move server objects to TanStack Query hooks
- Use only IDs and UI flags in Zustand stores

**"Cross-feature imports"**
- Use shared components or feature index exports
- Move truly shared logic to `/src/components/`

**"Legacy import patterns"**
- Update to use new feature-based imports
- Use path aliases (`@/`) instead of relative imports

**"Component misplacement"**
- Move feature-specific components to feature directories
- Keep only generic UI in shared components

### Getting Help

- Run `npm run lint:architecture` for detailed error messages
- Check architectural safeguards documentation
- Review existing implementations in `/src/features/`
- Use development assistant: `npm run dev:assist help`

---

*This architecture guide provides the foundation for building and maintaining the KitchenPantry CRM system. It should be referenced when making architectural decisions and updated as the system evolves.*