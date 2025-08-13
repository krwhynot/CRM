-- KitchenPantry CRM Database Schema Rollback
-- Rollback script for 001_initial_schema.sql
-- WARNING: This will drop all tables and data!

-- Drop triggers first
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
DROP TRIGGER IF EXISTS update_interactions_updated_at ON interactions;
DROP TRIGGER IF EXISTS update_opportunity_products_updated_at ON opportunity_products;
DROP TRIGGER IF EXISTS update_principal_distributor_relationships_updated_at ON principal_distributor_relationships;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop junction tables (have foreign key dependencies)
DROP TABLE IF EXISTS principal_distributor_relationships;
DROP TABLE IF EXISTS opportunity_products;

-- Drop main tables (in reverse dependency order)
DROP TABLE IF EXISTS interactions;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS organizations;

-- Drop ENUM types
DROP TYPE IF EXISTS priority_level;
DROP TYPE IF EXISTS product_category;
DROP TYPE IF EXISTS contact_role;
DROP TYPE IF EXISTS interaction_type;
DROP TYPE IF EXISTS opportunity_stage;
DROP TYPE IF EXISTS organization_type;

-- Note: Extensions (uuid-ossp, pg_trgm) are left intact as they may be used by other parts of the system