# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a KitchenPantry CRM system built for the food service industry, specifically designed for Master Food Brokers. The project uses a modern React + TypeScript stack with shadcn/ui components and follows a specialized agent-based architecture for CRM development.

## Project Structure

The codebase contains one main application:
- **Root Vite App** (`/src/`): Primary React + TypeScript + Vite application with shadcn/ui components

## Development Commands

### Root Application (Primary)
```bash
# Development server
npm run dev

# Build for production  
npm run build

# Lint code
npm run lint

# Type checking (included in build, but can be run standalone)
npm run type-check

# Preview production build
npm run preview

# Quality assurance and validation
npm run validate           # Complete validation: type-check + lint + build
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting
npm run analyze           # Bundle analysis with visualizer

# Documentation validation
npm run docs:validate     # Validate documentation links and formatting

# Maintenance commands
npm run clean             # Clean build artifacts
npm run fresh             # Clean install (removes node_modules)
```


## Architecture Guidelines

### Core Technologies
- **React 18** with TypeScript in strict mode
- **Vite** as build tool with `@vitejs/plugin-react`
- **shadcn/ui** component library with "new-york" style
- **Tailwind CSS** with CSS variables and "slate" base color
- **Radix UI** primitives for accessibility

### File Structure
- `src/components/` - Shared React components (UI primitives, forms, global components)
- `src/components/ui/` - shadcn/ui components
- `src/features/` - Feature-based component organization (dashboard, contacts, etc.)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and shared functions
- `docs/` - Architecture and development documentation

**Component Organization**: Follow feature-based architecture with clear separation between shared and feature-specific components. See [`/docs/COMPONENT_ORGANIZATION_GUIDELINES.md`](/docs/COMPONENT_ORGANIZATION_GUIDELINES.md) for detailed guidelines.

### Key Design Patterns

1. **Component Composition**: Use shadcn/ui primitives wrapped in CRM-specific components
2. **TypeScript-First**: Never use `any` type, always define explicit interfaces for CRM entities
3. **Mobile-First**: Start with mobile-first responsive design using Tailwind utilities
4. **Single Responsibility**: Keep components and SQL queries focused on one clear purpose

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
4. **Error Handling**: Use shadcn/ui Toast for transient messages, Alert/Dialog for blocking errors
5. **Relationship-Centric**: Model data around relationships, track engagement quality over quantity
6. **State Separation**: Use TanStack Query for server data, Zustand for client UI state only

- WHENEVER POSSIBLE USE A SUB AGENT

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
npm run validate
```

**📚 Complete Documentation**:
- `/docs/ARCHITECTURAL_SAFEGUARDS.md` - Enforcement details
- `/docs/DEVELOPMENT_WORKFLOW.md` - Development process
- `/src/lib/performance-optimizations.ts` - Performance utilities
- `/src/lib/query-optimizations.ts` - TanStack Query patterns

## Specialized Agent Architecture

This project follows a 14-agent specialized architecture with MCP tools:

### Primary Development Agents
- **Database & Schema Architect**: Schema design using Supabase + PostgreSQL
- **CRM Authentication Manager**: Auth implementation and security
- **Analytics & Reporting Engine**: Business intelligence and metrics
- **Coordinated UI Component Builder**: Design system and component development
- **Performance & Search Optimization**: Database and search performance

### Development Phases
1. **Weeks 1-4**: Infrastructure setup (database, auth, basic CRUD)
2. **Weeks 5-8**: Advanced features (search, activity feeds, validation)
3. **Weeks 9-12**: Dashboard and analytics
4. **Weeks 13-16**: Production readiness and deployment

## Available MCP Tools
- `supabase`: Database operations, migrations, auth
- `shadcn-ui`: UI component library
- `magicuidesign`: UI components and effects
- `postgres`: Database analysis and optimization
- `knowledge-graph`: Memory and relationship mapping
- `playwright`: Browser automation and testing
- `vercel`: Deployment and hosting

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

## Current Implementation Status (MVP COMPLETE + EXCEL IMPORT)

### ✅ Phase 1: Foundation (COMPLETED)
- **Stage 1**: Database Implementation - Full schema, indexes, RLS policies
- **Stage 2**: Type Definitions & Interfaces - Validation schemas, hooks
- **Stage 3**: Authentication Implementation - Supabase auth, context, routes

### ✅ Phase 2: Core Features (COMPLETED) 
- **Stage 4**: Component Implementation - CRUD forms, data tables, wizard
- **Stage 5**: Route Integration & Navigation - React Router, layout, pages
- **Stage 6**: Dashboard Implementation - Principal cards, activity feed, metrics

### ✅ Phase 3: Testing & Validation (COMPLETED)
- **Stage 7**: Comprehensive Testing - Database (95%), UI/UX (88%), Auth (94%), Performance (100%), UAT (95%)
- **Stage 8**: Production Deployment - Vercel deployment, documentation (100%)

### ✅ Phase 4: Excel Import Integration (COMPLETED)
- **Stage 9**: Excel to PostgreSQL Migration MVP - Complete import functionality (100%)
- **Stage 10**: Production Deployment with Import - Live at https://crm.kjrcloud.com (100%)

### 🎯 Production-Ready Features
- **5 Core Entities**: Organizations, Contacts, Products, Opportunities, Interactions
- **Authentication**: Supabase Auth with RLS security
- **Business Logic**: Database constraints, validation triggers
- **Mobile-Optimized**: iPad-focused responsive design
- **Performance**: Sub-5ms database queries, <3s page loads
- **Search**: Full-text search with trigram indexing
- **Dashboard**: Real-time metrics and activity feeds
- **Excel Import**: Complete Excel to PostgreSQL migration with MVP approach
  - CSV file upload with drag-and-drop interface
  - Hard-coded field mappings for organization data
  - Real-time progress tracking and error reporting
  - Batch processing with comprehensive validation
  - Manager names stored as text (Phase 2: UUID mapping)
  - Unmapped data preservation in import_notes field

### 📚 Documentation
- **User Guide**: `/docs/USER_GUIDE.md` - Complete Sales Manager guide
- **Technical Guide**: `/docs/TECHNICAL_GUIDE.md` - Developer documentation
- **Test Reports**: `/docs/testing/` - Comprehensive test documentation
- **Deployment Guide**: `/docs/PRODUCTION_DEPLOYMENT_GUIDE.md`

## Development Notes
- Always check `docs/` folder for architecture decisions and development guidelines
- Use the path alias `@/*` for imports (`@/components`, `@/lib`)
- Follow the mobile-first responsive design approach
- Prioritize shadcn/ui components for UI consistency
- Implement optimistic UI updates with proper error handling
- **MVP is production-ready** - All testing phases completed with >90% confidence
- **Excel Import MVP**: Follow checklist at `/docs/checklists/excel-to-postgresql-migration.md`
- **Production URL**: https://crm.kjrcloud.com - Live with Excel import functionality

### Quality Gates & Testing
- Run `npm run validate` before committing changes
- Use `./scripts/run-quality-gates.sh` for comprehensive validation
- Playwright tests available for E2E testing (`@playwright/test`)
- Mobile optimization tests in `/tests/mobile-optimization-*.spec.js`
- Database health validation with `/scripts/validate-database-health.js`

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
