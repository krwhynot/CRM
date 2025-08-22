# Supabase Database Documentation

This directory contains complete documentation of the KitchenPantry CRM database structure.

## Structure

### Root Level
- `extensions.md` - PostgreSQL extensions (3 installed)
- `enums.md` - Custom enum types (9 types)

### Schemas

#### Public Schema (`schemas/public/`)
- `tables/` - All database tables (16 tables)
  - `contact_preferred_principals.md`
  - `contacts.md`
  - `interaction_type_lu.md`
  - `interactions.md`
  - `loss_reason_lu.md`
  - `migration_control.md`
  - `opportunities.md`
  - `opportunity_participants.md`
  - `opportunity_products.md`
  - `organization_roles.md`
  - `organizations.md`
  - `principal_distributor_relationships.md`
  - `products.md`
  - `source_lu.md`
  - `stage_lu.md`
  - `status_lu.md`
- `functions.md` - Database functions (23 functions)
- `rls-policies.md` - Row Level Security policies (31 policies)
- `triggers.md` - Database triggers (52 triggers across all tables)
- `indexes.md` - Performance indexes (42 indexes with GIN and trigram support)

#### Reporting Schema (`schemas/reporting/`)
- `views.md` - Database views (2 views)
- `materialized-views.md` - Materialized views (1 view)

## Database Statistics
- **Tables**: 26 total (16 base tables + 10 lookup/relationship tables)
- **Core Entity Tables**: 5 (Organizations, Contacts, Products, Opportunities, Interactions)
- **Functions**: 38 custom functions (excluding system/extension functions)
- **RLS Policies**: 35 across 9 secured tables
- **Views**: 7 (including materialized views and reporting views)
- **Extensions**: 9 installed (citext, pg_trgm, uuid-ossp, hypopg, pg_stat_statements, pgcrypto, supabase_vault, pg_graphql, plpgsql)
- **Enum Types**: 9 (contact_role, interaction_type, opportunity_stage, etc.)
- **Indexes**: 42 performance-optimized indexes with GIN and trigram support
- **Triggers**: 56 triggers for audit, validation, and business logic enforcement

## Core Entity Relationships
- **Organizations** → **Contacts** (1:many)
- **Organizations** → **Opportunities** (many:many via opportunity_participants)
- **Organizations** → **Products** (1:many via principal_id)
- **Organizations** → **Roles** (1:many via organization_roles)
- **Opportunities** → **Interactions** (1:many)
- **Opportunities** → **Products** (many:many via opportunity_products)
- **Opportunities** → **Organizations** (many:many via opportunity_participants)
- **Principal** ↔ **Distributor** (many:many via principal_distributor_relationships)