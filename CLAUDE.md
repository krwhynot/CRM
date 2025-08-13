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

## Important Files
- `components.json`: shadcn/ui configuration (new-york style, slate theme)
- `vite.config.ts`: Vite configuration with path aliases
- `tsconfig.json`: TypeScript strict mode configuration
- `docs/CRM_AGENT_ARCHITECTURE.md`: Detailed agent architecture
- `docs/Coding_Rules.md`: 10 essential coding rules for the project

## Development Notes
- Always check `docs/` folder for architecture decisions and development guidelines
- Use the path alias `@/*` for imports (`@/components`, `@/lib`)
- Follow the mobile-first responsive design approach
- Prioritize shadcn/ui components for UI consistency
- Implement optimistic UI updates with proper error handling