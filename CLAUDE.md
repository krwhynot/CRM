# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a KitchenPantry CRM system built for the food service industry, specifically designed for Master Food Brokers. The project uses a modern React + TypeScript stack with shadcn/ui components and follows a layout-driven architecture with comprehensive form management.

## Current Architecture

The codebase follows a **simplified, component-driven architecture** after major refactoring:

- **Feature-Based Organization**: Domain logic organized by business features (`src/features/`)
- **Simplified Forms**: Core form components (`SimpleForm`, `FormField`) with Zod validation
- **Advanced Data Tables**: Comprehensive table system with filtering (`src/components/data-table/`)
- **Comprehensive Type System**: Zod-based validation with consolidated type definitions in `src/types/`

## Development Commands

> **📋 Build Pipeline Rationalization (January 2025)**
> The build system has been rationalized from 70+ scripts to ~25 parameterized commands. Both legacy and new consolidated commands work during the transition. See the [Migration Guide](/.docs/plans/build-pipeline-rationalization/migration-guide.md) for complete details.
>
> **Key Changes:**
> - **Parameterized Commands**: Use `npm run test -- backend --mode coverage` instead of separate `npm run test:backend:coverage`
> - **Backward Compatibility**: All existing scripts preserved during transition
> - **Enhanced Functionality**: New validation levels (`--level full`, `--level architecture`)
> - **CI/CD Safe**: GitHub workflows continue using preserved script names

### Essential Commands
```bash
# Development & Building
npm run dev                    # Start development server (Vite)
npm run build                  # Production build with optimizations
npm run build:enhanced         # Enhanced build with custom optimizations
npm run build:analyze          # Build with bundle analysis
npm run preview                # Preview production build locally
npm run type-check             # TypeScript compilation check
npm run lint                   # ESLint with architectural rules (max 20 warnings)
npm run format                 # Prettier code formatting
npm run validate               # Complete pipeline: type-check + lint + build

# Enhanced Build Commands
npm run build:validate         # Build with validation mode
npm run build:watch            # Build in watch mode with verbose output
npm run analyze                # Bundle analysis with auto-open

# Quality & Architecture
npm run quality-gates          # 6-stage comprehensive validation pipeline
npm run validate:enhanced      # Enhanced validation with custom script
npm run validate:full          # Complete validation pipeline
npm run validate:architecture-only # Architecture-focused validation
npm run validate:performance-only  # Performance-focused validation
npm run validate:architecture  # Architecture pattern validation
npm run validate:architecture:state      # State boundary validation
npm run validate:architecture:components # Component placement validation
npm run dev:setup              # Development environment setup
npm run dev:health             # Development health check
npm run dev:fix                # Auto-fix common development issues

# Testing (Actual Commands)
npm test                      # Run all MCP tests
npm run test:unified          # Unified test runner with parameters
npm run test:backend          # Vitest backend tests
npm run test:backend:watch    # Backend tests in watch mode
npm run test:backend:coverage # Backend tests with coverage
npm run test:backend:database # Database-specific tests
npm run test:backend:security # Security validation tests
npm run test:architecture     # Architecture boundary validation
npm run test:architecture:state      # State boundary tests
npm run test:architecture:components # Component placement tests
npm run test:mcp              # MCP authentication tests
npm run test:auth             # Authentication flow tests
npm run test:crud             # CRUD operation tests

# Bundle Analysis & Performance
npm run analyze              # Bundle visualizer with auto-open
npm run performance          # Basic performance monitoring
npm run performance:build    # Build-time performance analysis
npm run performance:runtime  # Runtime performance monitoring
npm run performance:full     # Complete performance analysis
npm run clean                # Clean build artifacts
npm run clean:all            # Full cleanup including node_modules
npm run clean:fresh          # Clean reinstall
npm run fresh                # Full clean install

# Technical Debt Management
npm run debt                 # Technical debt monitor
npm run debt:audit           # Technical debt analysis
npm run debt:scan            # Scan for debt patterns
npm run debt:report          # Generate debt report

# Documentation
npm run docs:lint           # Markdown linting
npm run docs:validate       # Full documentation validation
```

### Single Test Execution

#### Traditional Commands (Preserved for CI/CD Compatibility)
```bash
# MCP test suites (preserved for GitHub workflows)
npm run test:auth           # Authentication flow tests
npm run test:crud           # CRUD operation tests
npm run test:dashboard      # Dashboard functionality tests
npm run test:mobile         # Mobile/responsive tests

# Backend test suites (preserved for workflows)
npm run test:backend        # Vitest backend tests
npm run test:security       # Security validation tests
npm run test:performance    # Performance benchmark tests
npm run test:integrity      # Data integrity validation
```

#### Unified Test Commands (New System)
```bash
# MCP test suites
npm run test:mcp:unified         # Unified MCP test runner
npm run test:auth               # Authentication tests
npm run test:crud               # CRUD operation tests
npm run test:dashboard          # Dashboard functionality tests
npm run test:mobile             # Mobile/responsive tests

# Backend test suites with unified runner
npm run test:backend:unified    # Unified backend test runner
npm run test:backend            # Basic backend tests
npm run test:backend:database   # Database-specific tests
npm run test:backend:security   # Security tests
npm run test:backend:performance # Performance tests
npm run test:backend:integrity  # Data integrity tests

# Architecture test suites
npm run test:architecture:unified # Unified architecture test runner
npm run test:architecture       # Basic architecture validation
npm run test:architecture:state # State boundary validation
npm run test:architecture:components # Component placement rules
npm run test:architecture:performance # Performance patterns
npm run test:architecture:eslint     # Custom ESLint rule validation

# Design token testing
npm run test:design-tokens      # Complete design token validation
npm run test:design-tokens:visual    # Visual regression tests
npm run test:design-tokens:contracts # Contract validation tests
```

### Development Workflow Commands

#### Core Workflow (Enhanced)
```bash
# Pre-commit validation
npm run hooks:install       # Install git hooks for validation
npm run validate           # Basic validation (type-check + lint + build)
npm run validate:enhanced  # Enhanced validation with custom script
npm run validate:full      # Complete validation pipeline

# Enhanced validation levels
npm run validate:architecture-only # Architecture-focused validation
npm run validate:performance-only  # Performance-focused validation
npm run validate:quality-gates     # Quality gates validation
```

#### Technical Debt Management
```bash
# Technical debt commands
npm run debt               # Technical debt monitor
npm run debt:audit         # Technical debt analysis
npm run debt:scan          # Scan for debt patterns
npm run debt:report        # Generate debt report
npm run debt:validate      # Validate debt tracking
npm run debt:issues        # Create GitHub issues for technical debt
```

#### Development Utilities (Enhanced)
```bash
# Development assistance commands
npm run dev:setup           # Development environment setup
npm run dev:health          # Development health check
npm run dev:fix             # Auto-fix common development issues
npm run dev:assist          # Development assistant

# Cleanup utilities
npm run clean               # Basic cleanup (build artifacts)
npm run clean:all           # Full cleanup including node_modules
npm run clean:fresh         # Clean reinstall with npm install
npm run fresh               # Full clean install (removes node_modules)
```

#### UI & Design System Validation
```bash
# Design system validation
npm run test:ui-compliance    # UI design token compliance
npm run validate:design-tokens # Design system validation

# New parameterized design token testing
npm run test -- design-tokens --type visual    # Visual regression tests
npm run test -- design-tokens --type contracts # Contract validation tests
```

## Architecture Guidelines

### Core Technologies
- **React 18** with TypeScript in strict mode
- **Vite** as build tool with `@vitejs/plugin-react` and bundle optimization
- **Supabase** for database, authentication, and real-time features
- **shadcn/ui** component library with "new-york" style
- **Tailwind CSS** with CSS variables and "slate" base color
- **Radix UI** primitives for accessibility
- **TanStack Query** for server state management
- **Zustand** for client UI state management

### Current File Structure & Organization
The codebase follows a **simplified, feature-driven architecture**:

```
src/
├── components/           # Shared UI components
│   ├── ui/              # shadcn/ui primitives (Button, Input, etc.)
│   ├── forms/           # Form components (SimpleForm, FormField)
│   ├── data-table/      # Advanced data tables with filtering
│   ├── layout/          # Page layout and container components
│   ├── app/             # Dashboard and app-level components
│   └── dashboard/       # KPI cards, charts, and dashboard widgets
├── features/            # Domain-specific business logic
│   ├── auth/           # Authentication components and hooks
│   ├── contacts/       # Contact-specific hooks and components
│   ├── organizations/  # Organization-specific logic
│   ├── opportunities/  # Opportunity management
│   ├── products/       # Product catalog management
│   ├── interactions/   # Communication tracking
│   ├── dashboard/      # Dashboard-specific features
│   ├── import-export/  # Data import/export functionality
│   └── monitoring/     # System monitoring features
├── lib/                 # Core utilities
│   ├── form-*.ts       # Form utilities and transforms
│   ├── design-tokens.ts # Design system tokens
│   └── utils.ts        # General utilities
├── services/           # Service layer (minimal usage)
├── stores/             # State management (Zustand)
├── types/              # TypeScript definitions
│   ├── *.types.ts     # Entity-specific types with Zod schemas
│   ├── forms/         # Form-specific types
│   └── index.ts       # Main type exports
└── hooks/              # Shared React hooks
```

**Key Patterns**:
- Feature-driven architecture with domain-specific organization
- Simplified form system with Zod validation
- Advanced data table system with comprehensive filtering
- Unified Zod validation with consolidated schemas and TypeScript types
- Component composition using shadcn/ui primitives

### Component-Driven Architecture

**✅ CURRENT IMPLEMENTATION**: Simplified component architecture with advanced data tables:

#### Data Table System

**Location**: `src/components/data-table/`

Advanced data table with responsive filtering and expandable rows:

```typescript
// Example: Using DataTable with responsive filters
<DataTable
  data={organizations}
  columns={organizationColumns}
  useResponsiveFilters={true}
  entityType="organizations"
  entityFilters={filters}
  onEntityFiltersChange={setFilters}
  onRowClick={handleRowClick}
/>

// Alternative: Direct ResponsiveFilterWrapper usage
<FilterLayoutProvider>
  <ResponsiveFilterWrapper
    entityType="organizations"
    filters={filters}
    onFiltersChange={setFilters}
    title="Organization Filters"
  />
  <DataTable data={organizations} columns={organizationColumns} />
</FilterLayoutProvider>
```

#### Form System

**Location**: `src/components/forms/`

Simplified form components with Zod validation:

```typescript
// Simple form with validation
<SimpleForm
  onSubmit={handleSubmit}
  resolver={zodResolver(organizationSchema)}
>
  <FormField name="name" label="Organization Name" />
  <FormField name="city" label="City" />
</SimpleForm>
```

**Key Components**:
- **SimpleForm** (`src/components/forms/SimpleForm.tsx`): Basic form wrapper with validation
- **FormField** (`src/components/forms/FormField.tsx`): Reusable form field component
- **DataTable** (`src/components/ui/DataTable.tsx`): Advanced data table with responsive filtering
- **ResponsiveFilterWrapper** (`src/components/data-table/filters/ResponsiveFilterWrapper.tsx`): Smart responsive filter system with mobile/tablet/desktop adaptations
- **FilterLayoutProvider** (`src/contexts/FilterLayoutContext.tsx`): Context provider for device-aware filter layouts
- **EntityFilters** (`src/components/data-table/filters/EntityFilters.tsx`): Unified filter component with adaptive rendering

#### Form Architecture

**Core Form System**:
- **Form Resolver**: (`src/lib/form-resolver.ts`) Zod-only validation and error handling
- **Form Transforms**: (`src/lib/form-transforms.ts`) Comprehensive Zod transformation utilities
- **Validation Setup**: (`src/hooks/useCoreFormSetup.ts`) Centralized form configuration with Zod schemas
- **Type Safety**: Consolidated Zod schemas in `src/types/*.types.ts` for runtime validation

#### Responsive Filter Architecture

**✅ CURRENT IMPLEMENTATION**: Advanced responsive filter system with device-aware layouts:

**Core Components**:
- **ResponsiveFilterWrapper**: Smart wrapper that automatically adapts between mobile drawer, tablet sheet, and desktop inline modes
- **FilterLayoutProvider**: React context for device detection and layout state management
- **EntityFilters**: Unified filter component with responsive grid layouts and touch optimizations

**Device Behavior**:
- **Mobile**: Bottom drawer with 44px touch targets and enhanced spacing
- **Tablet Portrait**: Side sheet with optimized filter organization
- **Tablet Landscape**: Inline filters with desktop-like layout
- **Desktop**: Inline filters embedded in page layout
- **iPad Specific**: Portrait = drawer mode, Landscape = inline mode (enterprise optimization)

```typescript
// Recommended: DataTable integration
<DataTable
  useResponsiveFilters={true}
  entityType="contacts"
  entityFilters={filters}
  onEntityFiltersChange={setFilters}
  responsiveFilterTitle="Contact Filters"
/>

// Alternative: Direct usage with context
<FilterLayoutProvider>
  <ResponsiveFilterWrapper
    entityType="contacts"
    filters={filters}
    onFiltersChange={setFilters}
    lazyRender={true}
    showTimeRange={true}
    showQuickFilters={true}
  />
</FilterLayoutProvider>
```

**Key Features**:
- **Progressive Enhancement**: Works without context (inline fallback) and with full context (all responsive features)
- **iPad Enterprise Support**: Orientation-aware behavior with smooth transitions
- **Performance Optimization**: Lazy rendering for overlay modes, React.memo optimization
- **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support
- **Feature Flag Support**: Gradual rollout capabilities with `FEATURE_FLAGS.ENABLE_RESPONSIVE_FILTERS`

### Key Design Patterns

1. **Component Composition**: Use shadcn/ui primitives wrapped in CRM-specific components
2. **TypeScript-First**: Never use `any` type, always define explicit interfaces for CRM entities
3. **Mobile-First**: Start with mobile-first responsive design using Tailwind utilities
4. **Single Responsibility**: Keep components and SQL queries focused on one clear purpose
5. **Atomic Design**: Follow strict component hierarchy from atoms to templates

### CRM Entity Structure
The system is built around 5 core entities:
- **Organizations** - Companies/businesses
- **Contacts** - Individual people within organizations  
- **Products** - Items being sold/distributed
- **Opportunities** - Sales opportunities and deals
- **Interactions** - Communication history and touchpoints

### Database Conventions
- Use UUIDs for primary keys
- Implement soft deletes with `deleted_at` timestamps
- Include `created_at`/`updated_at` on every table
- Never cascade deletes on relationship data
- Always include `WHERE deleted_at IS NULL` for soft-deleted records

## Essential Coding Rules

1. **KISS Principle**: Favor shadcn/ui components over custom implementations
2. **Defensive Design**: Use UUIDs, soft deletes, and preserve data integrity
3. **Performance-First**: Index foreign keys, use LIMIT on queries, implement pagination
4. **Error Handling**: Use shadcn/ui Toast for transient messages, StandardDialog for confirmations and forms
5. **Relationship-Centric**: Model data around relationships, track engagement quality over quantity
6. **State Separation**: Use TanStack Query for server data, Zustand for client UI state only

**Critical Development Practices:**
- **Component-First**: Use shadcn/ui primitives and compose into feature-specific components
- **Zod-Only Validation**: All forms use consolidated Zod schemas for validation
- **Import Alias**: Use `@/*` path alias for all imports (`@/components`, `@/lib`, `@/features`)
- **Feature-Based Organization**: Group related functionality within feature directories
- **Type Safety**: Use consolidated Zod schemas in `src/types/*.types.ts` for runtime validation

### Build Configuration & Performance

**Vite Configuration** (`vite.config.ts`):
- **Manual Chunks**: Optimized bundle splitting (vendor, ui, router, supabase, query, design-tokens)
- **Tree Shaking**: Dead code elimination enabled
- **Console Removal**: All console statements dropped in production
- **Bundle Visualizer**: Integrated analysis with gzip size reporting
- **Design Token Optimization**: Advanced CSS variable tree-shaking in production
- **Chunk Size Limit**: 1000KB warning threshold
- **Path Aliases**: `@/` resolves to `./src/`

**Production Optimizations**:
- Bundle size kept under 3MB total
- Manual chunk splitting for optimal caching
- No source maps in production builds
- SPA routing configured for proper fallback
- Performance monitoring via Web Vitals integration

**Environment Variables**:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
NODE_ENV=development  # Only development supported in .env
```

## State Management Architecture

**✅ REFACTORED (January 2025)**: Clear separation of client-side and server-side state following React best practices.

### Server State (TanStack Query)
- **Location**: `/src/features/*/hooks/`
- **Purpose**: All data from APIs/database
- **Examples**: Organizations, contacts, opportunities, authentication status

```typescript
// ✅ Server data via TanStack Query
const { data: organizations } = useOrganizations(filters)
const createMutation = useCreateOrganization()
```

### Client State (Zustand)
- **Location**: `/src/stores/`  
- **Purpose**: UI state, preferences, temporary data
- **Examples**: View modes, filters, form state, selected items

```typescript
// ✅ Client UI state via Zustand  
const { viewMode, setViewMode } = useAdvocacyView()
const { isFormOpen, openCreateForm } = useAdvocacyForm()
```

**📚 Full Guide**: `/docs/STATE_MANAGEMENT_GUIDE.md`  
**🛠️ Development Workflow**: `/docs/DEVELOPMENT_WORKFLOW.md`

## Architectural Safeguards

**✅ IMPLEMENTED (January 2025)**: Comprehensive architectural enforcement and performance optimizations.

### ESLint Enforcement
- Custom architectural rules prevent state boundary violations
- Feature boundary enforcement prevents improper imports
- Automated validation during development and CI/CD

### Performance Optimizations
- TanStack Query optimizations with intelligent caching patterns
- Component-level optimizations (virtualization, debouncing, memoization)
- Performance monitoring and analysis tools
- Bundle optimization and analysis

### Development Tools
- Automated component generation with architectural patterns
- Development assistant for code analysis and fixes
- Comprehensive validation pipeline

```bash
# Generate components with proper patterns
npm run dev:assist create component ContactForm contacts

# Validate architecture
npm run lint:architecture

# Performance analysis
npm run optimize:performance

# Complete validation pipeline
npm run validate               # Basic validation (type-check + lint + build)
npm run validate:enhanced      # Enhanced validation with custom script
npm run validate:full          # Complete validation pipeline
npm run quality-gates          # Run comprehensive 6-stage quality gates

# Enhanced quality validation with levels
npm run validate:architecture-only # Architecture-focused validation
npm run validate:performance-only  # Performance-focused validation
npm run validate:quality-gates     # Quality gates validation

# Architecture validation
npm run validate:architecture  # Basic architecture validation
npm run validate:architecture:state      # State boundary validation
npm run validate:architecture:components # Component placement validation

# Performance validation
npm run performance            # Basic performance monitoring
npm run performance:build      # Build-time performance analysis
npm run performance:runtime    # Runtime performance monitoring
npm run performance:full       # Complete performance analysis
```

**📚 Complete Documentation**:
- `/docs/ARCHITECTURAL_SAFEGUARDS.md` - Enforcement details
- `/docs/DEVELOPMENT_WORKFLOW.md` - Development process
- `/src/lib/performance-optimizations.ts` - Performance utilities
- `/src/lib/query-optimizations.ts` - TanStack Query patterns

## Specialized Agent Architecture

This project follows a specialized agent architecture with MCP tools:

### Primary Development Agents
- **Database & Schema Architect**: Schema design using Supabase + PostgreSQL
- **CRM Authentication Manager**: Auth implementation and security
- **Analytics & Reporting Engine**: Business intelligence and metrics
- **Coordinated UI Component Builder**: Design system and component development
- **Performance & Search Optimization**: Database and search performance

### Development Phases
1. **Weeks 1-4**: Infrastructure setup (database, auth, basic CRUD)
2. **Weeks 5-8**: Advanced features (search, validation, core functionality)
3. **Weeks 9-12**: Interface optimization and user experience
4. **Weeks 13-16**: Production readiness and deployment

## Available MCP Tools
**Database & Infrastructure:**
- `supabase`: Database operations, migrations, auth, logs, advisors
- `postgres`: Database analysis and optimization, health checks, query performance

**Frontend Development:**
- `shadcn-ui`: UI component library access and demos
- `magicuidesign`: Special effects, text animations, buttons, backgrounds
- `playwright`: Browser automation, testing, screenshots, UI interaction (MCP tool only - no full installation)

**Development & Deployment:**
- `vercel`: Deployment and hosting
- `github`: Repository management, issues, pull requests
- `filesystem`: File operations, directory management

**Documentation & Research:**
- `Context7`: Up-to-date library documentation
- `exa`: Web search and content extraction
- `knowledge-graph`: Memory and relationship mapping

### MCP Tool Response Size Limits
⚠️ **Important**: All MCP tools have a **25,000 token response limit**. Always use pagination, filtering, and limit parameters to prevent errors.

**Key Guidelines:**
- Use `limit` parameters (recommended: 5-25 for docs, 100 for DB queries)
- Apply specific filters before querying large datasets
- Break large queries into smaller, focused requests
- Always include `LIMIT` clauses in SQL queries
- Use pagination for list operations (`page`, `per_page` parameters)

See `/docs/MCP_TOOL_REFERENCE_GUIDE.md` for comprehensive usage guidelines.

## Important Files
- `components.json`: shadcn/ui configuration (new-york style, slate theme)
- `vite.config.ts`: Vite configuration with path aliases
- `tsconfig.json`: TypeScript strict mode configuration
- `docs/CRM_AGENT_ARCHITECTURE.md`: Detailed agent architecture
- `docs/Coding_Rules.md`: 10 essential coding rules for the project

## Current Implementation Status (ARCHITECTURE REFACTOR)

### 🚧 Current Phase: Architecture Simplification (COMPLETED)
The codebase has completed major architectural simplification focusing on:

- **Simplified Architecture**: Removed complex layout systems in favor of direct component composition
- **Feature-Based Organization**: Clear separation of concerns by business domain
- **Advanced Data Tables**: Comprehensive table system with filtering and expansion
- **Enhanced Type Safety**: Consolidated Zod schemas with TypeScript definitions

### ✅ Implemented Features
- **Component System**: Simplified form and data table components
- **Feature Architecture**: Complete feature-based organization with domain-specific hooks
- **Data Table System**: Advanced filtering, sorting, and expandable rows
- **Type System**: Zod schemas for validation with TypeScript types
- **Component Library**: Enhanced shadcn/ui integration with custom components

### 🔄 Migration Status
- **Legacy Features**: Some features still use older patterns (feature-based)
- **Active Development**: Layout system actively being expanded
- **Testing Framework**: Architecture validation tests in place
- **Documentation**: Internal docs being maintained in `.docs/`

### 🎯 Architectural Goals
- **Consistency**: Unified approach to data display and form handling
- **Flexibility**: Easy to configure and extend layouts
- **Performance**: Optimized rendering with proper state management
- **Developer Experience**: Clear patterns and comprehensive tooling

### 📚 Documentation
- **User Guide**: `/docs/USER_GUIDE.md` - Complete Sales Manager guide
- **Technical Guide**: `/docs/TECHNICAL_GUIDE.md` - Developer documentation
- **Test Reports**: `/docs/testing/` - Comprehensive test documentation
- **Deployment Guide**: `/docs/PRODUCTION_DEPLOYMENT_GUIDE.md`

## Development Notes
- **Component-First Development**: Use shadcn/ui primitives and compose into feature-specific components
- **Design Token Architecture**: Follow 2-layer architecture (Primitives → Semantic) - no Component or Feature token layers
- **Theme Provider**: Use enhanced theme provider with DOM class management for light/dark mode switching
- **Responsive Filter Development**: Use `ResponsiveFilterWrapper` with DataTable `useResponsiveFilters={true}` for all entity filtering
- **Zod-Only Validation**: Use consolidated Zod schemas in `src/types/*.types.ts` for all validation
- Use the path alias `@/*` for imports (`@/components`, `@/lib`, `@/features`)
- **Feature Organization**: Group related components, hooks, and logic within feature directories
- **Form Development**: Use `createTypedZodResolver` for all form validation
- **Filter Development**: Always wrap components with `FilterLayoutProvider` and use `EntityFilterState` interface
- Check both `docs/` and `.docs/` folders for architecture decisions
- **Current State**: Simplified feature-driven architecture with responsive filters and consolidated schemas
- **Testing**: Run architecture validation tests to ensure compliance with patterns

### Quality Gates & Testing
**Before Committing:**
- `npm run validate` - Complete validation pipeline (type-check + lint + build)
- `npm run quality-gates` or `./scripts/run-quality-gates.sh` - 6-stage comprehensive validation

**Test Categories:**
- `npm run test:mcp` - MCP tests (auth, CRUD, dashboard, mobile)
- `npm run test:backend` - Vitest backend tests (database, performance, security)
- `npm run test:architecture` - Architecture validation (state boundaries, component placement)

**Testing Infrastructure:**
- **Backend Testing**: Vitest for unit/integration tests (`tests/backend/`)
- **Architecture Testing**: Custom validation rules (`tests/architecture/`)
- **MCP Testing**: Node.js-based integration tests (`tests/mcp/`)
- **E2E Testing**: Playwright MCP tool only (no full Playwright installation)
- **Production Monitoring**: `/scripts/production-monitor.sh`

**Testing Architecture Patterns**:
- **State Boundary Validation**: Ensures TanStack Query (server) vs Zustand (client) separation
- **Component Placement Rules**: Validates feature vs shared component organization
- **Performance Benchmarks**: Database query performance (<5ms), bundle size (<3MB)  
- **ESLint Rule Testing**: Custom architectural rules validation with 80%+ health score requirement
- **Security Testing**: RLS policy validation, auth flow testing
- **Data Integrity Testing**: Soft delete preservation, UUID consistency, referential integrity

#### Quality Gates (run-quality-gates.sh)
1. **TypeScript Compilation** - Strict type checking
2. **Code Linting** - ESLint validation with custom architectural rules
3. **Component Architecture** - Health score validation (80%+ required)
4. **Build & Bundle Analysis** - Build success + bundle size (<3MB)
5. **Performance Baseline** - Performance monitoring completion
6. **Mobile Optimization** - Mobile-first responsive design validation

### MCP Tool Development Guidelines
When working with MCP tools in this project:

1. **Always Use Limits**: Never execute unlimited queries or searches
   - Documentation searches: `limit: 5-10`
   - Database queries: Include `LIMIT 100` or less
   - API calls: Use `per_page: 25-50`

2. **Query Strategy**: Break large requests into focused, sequential queries
   - Start with overview/summary queries
   - Follow up with specific detail queries
   - Use filters and search terms to narrow scope

3. **Error Handling**: If you encounter response size errors:
   - Reduce the `limit` parameter immediately
   - Make search terms more specific
   - Consider alternative query approaches
   - Use templates from `/docs/templates/mcp-query-templates.md`

4. **Performance**: Always include appropriate WHERE clauses and indexes
   - Use `WHERE deleted_at IS NULL` for soft-deleted records
   - Filter by date ranges when appropriate
   - Index foreign keys and commonly queried columns

See `/docs/MCP_TOOL_REFERENCE_GUIDE.md` for complete guidelines and `/docs/templates/mcp-query-templates.md` for ready-to-use query patterns.

### UI Component Documentation
- **Dialog Patterns**: `/docs/ui/dialog.md` - StandardDialog API, migration guide, and best practices
- **Responsive Filters**: `/docs/guides/responsive-filters.md` - Complete ResponsiveFilterWrapper guide, migration patterns, and best practices

## Command Reference Notes

⚠️ **Important**: All commands listed above are verified against the actual `package.json` scripts. The project uses a combination of:
- **Direct npm scripts**: Defined in `package.json`
- **Shell script wrappers**: Located in `/scripts/` directory with parameterized options
- **Unified test runner**: New system using `./scripts/test.sh` with parameters

**Command Verification**: Always check `package.json` and `/scripts/` directory for the most current command syntax. Some commands may use shell script parameters that are not visible in package.json but are documented in the script files themselves.


