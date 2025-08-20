# Supabase Database Documentation

This directory contains complete documentation of the KitchenPantry CRM database structure.

## Structure

### Root Level
- `extensions.md` - PostgreSQL extensions (3 installed)
- `enums.md` - Custom enum types (9 types)

### Schemas

#### Public Schema (`schemas/public/`)
- `tables/` - All database tables (14 tables)
  - `contact_preferred_principals.md`
  - `contacts.md`
  - `interactions.md`
  - `migration_control.md`
  - `opportunities.md`
  - `opportunity_products.md`
  - `organizations.md`
  - `priority_lu.md`
  - `principal_distributor_relationships.md`
  - `products.md`
  - `stage_lu.md`
  - `status_lu.md`
  - `user_organization_access.md`
  - `user_profiles.md`
- `functions.md` - Database functions (23 functions)
- `rls-policies.md` - Row Level Security policies (32 policies)

#### Reporting Schema (`schemas/reporting/`)
- `views.md` - Database views (2 views)
- `materialized-views.md` - Materialized views (1 view)

## Database Statistics
- **Tables**: 14 (all with RLS enabled except lookup tables)
- **Functions**: 23 (7 business logic, 12 triggers, 4 security)
- **RLS Policies**: 32 (across 8 tables)
- **Views**: 2 (reporting schema)
- **Materialized Views**: 1 (dashboard performance)
- **Extensions**: 3 (citext, pg_trgm, uuid-ossp)
- **Enum Types**: 9 (contact types, interaction types, etc.)

## Core Entity Relationships
- **Organizations** → **Contacts** (1:many)
- **Organizations** → **Opportunities** (1:many via organization_id)
- **Organizations** → **Products** (1:many via principal_id)
- **Opportunities** → **Interactions** (1:many)
- **Opportunities** → **Products** (many:many via opportunity_products)
- **Principal** ↔ **Distributor** (many:many via principal_distributor_relationships)