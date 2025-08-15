# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a KitchenPantry CRM system built for the food service industry, specifically designed for Master Food Brokers. The project uses a modern React + TypeScript stack with shadcn/ui components and follows a specialized agent-based architecture for CRM development.

## Project Structure

The codebase contains two main applications:
- **Root Vite App** (`/src/`): Primary React + TypeScript + Vite application with shadcn/ui components
- **Next.js Dashboard** (`/crm-dashboard/`): Secondary Next.js application (experimental/alternative implementation)

The main development should focus on the root Vite application unless specifically working on Next.js features.

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
npx tsc --noEmit

# Preview production build
npm run preview
```

### CRM Dashboard (Next.js)
```bash
cd crm-dashboard
npm run dev        # Next.js dev server with Turbopack
npm run build      # Production build
npm run lint       # Next.js linting
```

## Architecture Guidelines

### Core Technologies
- **React 18** with TypeScript in strict mode
- **Vite** as build tool with `@vitejs/plugin-react`
- **shadcn/ui** component library with "new-york" style
- **Tailwind CSS** with CSS variables and "slate" base color
- **Radix UI** primitives for accessibility

### File Structure
- `src/components/` - React components (dashboard, forms, UI components)
- `src/components/ui/` - shadcn/ui components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and shared functions
- `docs/` - Architecture and development documentation

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

- WHENEVER POSSIBLE USE A SUB AGENT  

To prevent specific TypeScript + form validation issues in the future, you’ll want a schema-first, type-driven workflow that keeps your database schema, validation schema, and form types in sync automatically.

1. Use a Single Source of Truth for Types

Generate TypeScript types from your database schema (e.g., using Prisma, Supabase gen types, or Drizzle ORM).

Infer form validation types directly from the Yup/Zod schema instead of manually writing interfaces.

const formSchema = yup.object({
  firstName: yup.string().required(),
  age: yup.number().nullable(),
});

type FormValues = yup.InferType<typeof formSchema>;


This ensures form, validation, and DB types always match.

2. Align Database Schema and Validation Rules

Whenever you change a DB column’s nullability, type, or constraints, immediately update:

Your validation schema (Yup/Zod)

Your form defaults in react-hook-form

Use migration scripts that also regenerate types (e.g., prisma generate, drizzle-kit generate).

3. Create a Validation + Form Types Layer

Make a folder like /schemas and store:

form.schema.ts → Yup/Zod schema

form.types.ts → InferType from schema

Use those types everywhere instead of redefining.

Example:

// schemas/contact.schema.ts
export const contactSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().nullable(),
});
export type ContactFormData = yup.InferType<typeof contactSchema>;

// form component
const form = useForm<ContactFormData>({
  resolver: yupResolver(contactSchema),
});

4. Validate Relationships in Type Definitions

If a component expects ContactWithOrganization, make sure the query and type both guarantee it.

Use type-safe queries so you can't accidentally pass a base type.

Example with Prisma:

type ContactWithOrg = Prisma.ContactGetPayload<{ include: { organization: true } }>;

5. Add a CI Step for Type & Schema Consistency

In CI/CD, run:

tsc --noEmit → catches type errors

A schema drift check (e.g., Prisma db pull and diff)

A type generation step to ensure yup.InferType and DB types match

6. Workflow for Changes

Whenever you modify a form or DB schema:

Update DB migration.

Regenerate DB types.

Update Yup/Zod schema.

Regenerate form types from schema.

Run tsc before commit.

✅ Result:

No more guessing if Yup matches DB.

React Hook Form will always have the correct types.

Components will never get the wrong relationship type.

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

## Current Implementation Status (MVP COMPLETE)

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

### 🎯 Production-Ready Features
- **5 Core Entities**: Organizations, Contacts, Products, Opportunities, Interactions
- **Authentication**: Supabase Auth with RLS security
- **Business Logic**: Database constraints, validation triggers
- **Mobile-Optimized**: iPad-focused responsive design
- **Performance**: Sub-5ms database queries, <3s page loads
- **Search**: Full-text search with trigram indexing
- **Dashboard**: Real-time metrics and activity feeds

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