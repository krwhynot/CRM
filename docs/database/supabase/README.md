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
- **Tables**: 16 base tables total
- **Core Entity Tables**: 5 (Organizations, Contacts, Products, Opportunities, Interactions)
- **Lookup Tables**: 5 (interaction_type_lu, loss_reason_lu, source_lu, stage_lu, status_lu)
- **Relationship Tables**: 6 (contact_preferred_principals, opportunity_participants, opportunity_products, organization_roles, principal_distributor_relationships, migration_control)
- **Functions**: 72+ functions (including custom business logic, triggers, and security functions)
- **RLS Policies**: 35 policies across 9 secured tables
- **Extensions**: 8 installed (citext, hypopg, pg_graphql, pg_stat_statements, pg_trgm, pgcrypto, supabase_vault, uuid-ossp)
- **Enum Types**: 8 (contact_role, interaction_type, opportunity_priority, opportunity_stage, opportunity_status, organization_type, priority_level, product_category)
- **Indexes**: 74+ performance-optimized indexes with GIN and trigram support for full-text search
- **Triggers**: Multiple triggers for audit trails, validation, and business logic enforcement

## Core Entity Relationships
- **Organizations** → **Contacts** (1:many)
- **Organizations** → **Opportunities** (many:many via opportunity_participants)
- **Organizations** → **Products** (1:many via principal_id)
- **Organizations** → **Roles** (1:many via organization_roles)
- **Opportunities** → **Interactions** (1:many)
- **Opportunities** → **Products** (many:many via opportunity_products)
- **Opportunities** → **Organizations** (many:many via opportunity_participants)
- **Principal** ↔ **Distributor** (many:many via principal_distributor_relationships)