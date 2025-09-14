# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Summary

**Project**: Production CRM system for Master Food Brokers in the food service industry
**Stack**: React 18 + TypeScript + Vite + Supabase + shadcn/ui + Tailwind CSS
**Architecture**: Feature-based modules with unified component system
**Live Production**: https://crm.kjrcloud.com

📋 **Critical**: Always run `npm run quality-gates` before commits - comprehensive quality validation
🗂️ **Important**: Use unified `DataTable` component for all tables - auto-virtualizes at 500+ rows
🎨 **Note**: Design token coverage is 88% - prefer semantic tokens over hardcoded Tailwind classes

## Essential Commands

```bash
# Development
npm run dev              # Start development server (localhost:5173)
npm run type-check       # TypeScript compilation check
npm run lint             # ESLint with max 20 warnings
npm run build            # Production build
npm run quality-gates    # Run comprehensive quality validation

# Development Utilities
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run clean            # Clean dist and build artifacts
npm run fresh            # Full reset: clean + reinstall dependencies
npm run dev:health       # Check development environment health
npm run dev:fix          # Auto-fix common development issues

# Testing & Validation
npm run test             # Run MCP integration tests
npm run test:backend     # Database and backend tests (Vitest)
npm run test:ui-consistency  # Component consistency tests
npm run test:architecture    # Architecture compliance tests
npm run tokens:coverage      # Design token coverage report
npm run validate         # TypeScript + lint + build (pre-commit check)

# Quality & Performance
npm run analyze          # Bundle size analysis with visualizer
npm run validate:table-consistency  # Table component validation
npm run debt:audit       # Technical debt analysis
npm run lint:architecture        # Architecture pattern validation
```

## Architecture Overview

### Directory Structure (Feature-Based)
```
src/
  components/          # Reusable UI components
    ui/               # shadcn/ui primitives + unified DataTable
    forms/            # Form components with validation
    filters/          # Universal filtering system
    shared/           # Cross-feature components
  features/           # Business entity modules (self-contained)
    auth/             # Authentication & authorization
    organizations/    # Organization management
    contacts/         # Contact management
    products/         # Product catalog
    opportunities/    # Sales pipeline
    interactions/     # Communication history
    dashboard/        # Analytics & KPIs
    import-export/    # Excel import/export
  hooks/              # Custom React hooks
  lib/                # Utilities & business logic
  stores/             # Zustand client state
  styles/             # Design tokens (88% coverage)
  types/              # TypeScript definitions
```

### Key Architectural Decisions
- **Unified DataTable**: Single table component (`src/components/ui/DataTable.tsx`) handles all use cases with auto-virtualization at 500+ rows
- **Recent Refactoring**: Completed table architecture refactoring (September 2025) - all tables now use unified DataTable component
- **Design Token System**: 88% coverage via `src/styles/tokens/` - prefer semantic tokens over hardcoded Tailwind
- **Feature Isolation**: Each entity module is self-contained with own components/hooks/types
- **Strict TypeScript**: Full type safety with path aliases (`@/`, `@/features/*`, etc.)
- **Migration from Yup to Zod**: All validation now uses Zod schemas for better TypeScript integration

## Core Tech Stack Details

### Data Layer
- **Database**: Supabase PostgreSQL with Row Level Security
- **Server State**: TanStack Query v5 for caching/mutations
- **Client State**: Zustand for UI state management
- **Forms**: React Hook Form + Zod validation

### UI Framework
- **Components**: shadcn/ui "new-york" style with Radix primitives
- **Styling**: Tailwind CSS + CVA (Class Variance Authority) pattern
- **Performance**: React Window for virtualization
- **Brand Color**: MFB Green `#8DC63F` (HSL: 95 71% 56%)

### Build & Performance
- **Bundler**: Vite with manual chunks for vendor/ui/supabase/query
- **TypeScript**: Strict mode with comprehensive path aliases
- **Quality Gates**: 9-gate validation including bundle size, performance, token coverage

## Core Business Entities

The CRM manages 5 main entities with complex B2B relationships:

1. **Organizations** - Companies (customer/distributor/principal/supplier types)
2. **Contacts** - Individuals with decision authority levels
3. **Products** - Food items with pricing/categories
4. **Opportunities** - Sales pipeline with stages/values
5. **Interactions** - Communication history and touchpoints

### Business Domain Terms
- **Principal**: Manufacturer/brand owner (e.g., Coca-Cola, Nestlé)
- **Distributor**: Wholesale distribution company
- **Segment**: Market vertical (Restaurant, Healthcare, Education)
- **Priority Rating**: A+ (highest) through D (lowest) business importance
- **Decision Authority**: Primary (decision maker), Secondary (input), Influencer (recommends)

## Component Development Patterns

### Adding New Tables
Use the unified DataTable component for consistency and performance:

```typescript
// 1. Define columns with TypeScript generics
const supplierColumns: Column<Supplier>[] = [
  {
    key: 'name',
    header: 'Supplier Name',
    cell: (supplier) => <span className="font-medium">{supplier.name}</span>
  }
]

// 2. Use DataTable with auto-virtualization
<DataTable
  data={suppliers}
  columns={supplierColumns}
  rowKey={(row) => row.id}
  features={{ virtualization: 'auto' }} // Threshold: 500 rows
  expandableContent={(row) => <SupplierDetails supplier={row} />}
/>
```

### Design Token Usage
Prefer semantic tokens over hardcoded Tailwind classes:

```typescript
import { semanticSpacing, semanticColors } from '@/styles/tokens'

// Good: Semantic tokens
<div className={semanticSpacing.card}>        // Instead of "p-4 lg:p-6"
<Badge className={semanticColors.priority.a}> // Instead of "bg-red-500"

// CVA Pattern for component variants
const cardVariants = cva(
  "rounded-xl border transition-all", // base styles
  {
    variants: {
      variant: {
        default: "bg-card shadow-sm hover:shadow-md",
        elevated: "bg-card shadow-lg hover:shadow-xl"
      }
    }
  }
)
```

### Feature Module Pattern
Each business entity follows this self-contained structure:

```
src/features/entity-name/
  components/          # Entity-specific components
    EntityTable.tsx
    EntityForm.tsx
    EntityActions.tsx
  hooks/              # Data fetching and UI state
    useEntity.ts
    useEntityActions.ts
  types/              # TypeScript interfaces
    entity.types.ts
  index.ts            # Public exports
```

## Data Fetching Patterns

### TanStack Query + Supabase
```typescript
// Basic query hook with caching
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation with optimistic updates
export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (org: CreateOrganization) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert(org)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    }
  })
}
```

## Quality Standards & Validation

### Pre-Commit Requirements
The `npm run quality-gates` script runs 9 validation gates:
1. TypeScript compilation
2. ESLint (max 20 warnings)
3. Component architecture health (≥80%)
4. Build success & bundle analysis (≤3MB)
5. Performance baseline
6. UI consistency checks
7. Design token coverage (≥75%)
8. Mobile optimization
9. Table component consistency (≥80%)

### Performance Thresholds
- **Bundle Size**: ≤3MB total
- **DataTable Virtualization**: Auto-enabled at 500+ rows
- **Token Coverage**: Target 88%+ (currently achieved)
- **Architecture Health**: ≥80% component consistency

## Mobile-First Design

iPad-optimized responsive design for field sales teams:
- **Responsive Breakpoints**: mobile (<768px), tablet (768px+), laptop (1024px+), desktop (1280px+)
- **Touch-Friendly**: Larger touch targets, optimized gestures
- **Performance**: Virtual scrolling for large datasets on mobile

## Troubleshooting Common Issues

### TypeScript Errors
```bash
npm run type-check  # Check compilation
# Regenerate Supabase types if needed:
# supabase gen types typescript --project-id [ID] > src/lib/database.types.ts
```

### Performance Issues
```bash
npm run analyze           # Bundle size analysis
npm run test:performance  # Performance benchmarks
# Check DataTable virtualization for large datasets
```

### Design Token Issues
```bash
npm run tokens:coverage  # Check token usage and coverage report
npm run validate:design-tokens  # Validate token consistency
# Replace hardcoded Tailwind with semantic tokens from @/styles/tokens
```

### Build Failures
```bash
npm run quality-gates  # Full validation suite
npm run validate      # TypeScript + lint + build
npm run dev:health    # Check environment and dependencies
# Check .env file against .env.example for missing variables
```

### Environment Setup Issues
```bash
# Copy environment template and configure
cp .env.example .env
# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_project_url_here
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
# NODE_ENV=development
```

---

**Production Ready**: Live system serving Master Food Brokers at https://crm.kjrcloud.com
**Version**: 1.0 (September 2025)