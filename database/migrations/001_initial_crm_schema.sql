-- ============================================================================
-- KitchenPantry CRM - Initial Database Schema Migration
-- Migration: 001_initial_crm_schema
-- Description: Creates core entities for food service relationship management
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUM Types for Food Service Industry
-- ============================================================================

CREATE TYPE organization_type AS ENUM ('customer', 'principal', 'distributor', 'prospect', 'vendor');
CREATE TYPE organization_size AS ENUM ('small', 'medium', 'large', 'enterprise');
CREATE TYPE contact_role AS ENUM ('decision_maker', 'influencer', 'buyer', 'end_user', 'gatekeeper', 'champion');
CREATE TYPE product_category AS ENUM ('beverages', 'dairy', 'frozen', 'fresh_produce', 'meat_poultry', 'seafood', 'dry_goods', 'spices_seasonings', 'baking_supplies', 'cleaning_supplies', 'paper_products', 'equipment');
CREATE TYPE opportunity_stage AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE opportunity_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE interaction_type AS ENUM ('call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'trade_show', 'site_visit', 'contract_review');

-- ============================================================================
-- Core Tables
-- ============================================================================

-- Organizations table (companies - customers, principals, distributors)
CREATE TABLE organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type organization_type NOT NULL,
    size organization_size,
    website TEXT,
    phone TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    industry TEXT,
    description TEXT,
    notes TEXT,
    parent_organization_id UUID REFERENCES organizations(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Contacts table (people within organizations)
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile_phone TEXT,
    title TEXT,
    role contact_role,
    department TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    linkedin_url TEXT,
    notes TEXT,
    is_primary_contact BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Products table (items owned by principals)
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category product_category NOT NULL,
    sku TEXT UNIQUE,
    description TEXT,
    specifications TEXT,
    unit_of_measure TEXT,
    unit_cost DECIMAL(10,4),
    list_price DECIMAL(10,4),
    min_order_quantity INTEGER,
    shelf_life_days INTEGER,
    storage_requirements TEXT,
    principal_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    CONSTRAINT products_principal_type CHECK (
        (SELECT type FROM organizations WHERE id = principal_organization_id) = 'principal'
    )
);

-- Opportunities table (sales pipeline tracking)
CREATE TABLE opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    stage opportunity_stage NOT NULL DEFAULT 'lead',
    priority opportunity_priority DEFAULT 'medium',
    estimated_value DECIMAL(12,2),
    estimated_close_date DATE,
    actual_close_date DATE,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    principal_organization_id UUID REFERENCES organizations(id),
    distributor_organization_id UUID REFERENCES organizations(id),
    description TEXT,
    next_action TEXT,
    next_action_date DATE,
    competition TEXT,
    decision_criteria TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    CONSTRAINT opportunities_contact_org_match CHECK (
        (SELECT organization_id FROM contacts WHERE id = contact_id) = organization_id
    ),
    CONSTRAINT principal_distributor_types CHECK (
        (principal_organization_id IS NULL OR 
         (SELECT type FROM organizations WHERE id = principal_organization_id) = 'principal') AND
        (distributor_organization_id IS NULL OR 
         (SELECT type FROM organizations WHERE id = distributor_organization_id) = 'distributor')
    )
);

-- Opportunity Products (many-to-many with pricing)
CREATE TABLE opportunity_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,4),
    extended_price DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, product_id)
);

-- Interactions table (follow-up activities)
CREATE TABLE interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type interaction_type NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    interaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_minutes INTEGER,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    outcome TEXT,
    attachments TEXT[], -- Array of file URLs/paths
    is_completed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Principal-Distributor Relationships
CREATE TABLE principal_distributor_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    principal_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    distributor_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    territory TEXT,
    contract_start_date DATE,
    contract_end_date DATE,
    commission_rate DECIMAL(5,4),
    terms TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(principal_id, distributor_id),
    CONSTRAINT principal_distributor_types CHECK (
        (SELECT type FROM organizations WHERE id = principal_id) = 'principal' AND
        (SELECT type FROM organizations WHERE id = distributor_id) = 'distributor'
    )
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================

-- Organizations indexes
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_name_trgm ON organizations USING gin (name gin_trgm_ops);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = true;
CREATE INDEX idx_organizations_parent ON organizations(parent_organization_id) WHERE parent_organization_id IS NOT NULL;

-- Contacts indexes
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_contacts_name_trgm ON contacts USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_active ON contacts(is_active) WHERE is_active = true;
CREATE INDEX idx_contacts_primary ON contacts(organization_id, is_primary_contact) WHERE is_primary_contact = true;

-- Products indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_principal ON products(principal_organization_id);
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- Opportunities indexes
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX idx_opportunities_organization ON opportunities(organization_id);
CREATE INDEX idx_opportunities_close_date ON opportunities(estimated_close_date);
CREATE INDEX idx_opportunities_value ON opportunities(estimated_value) WHERE estimated_value IS NOT NULL;
CREATE INDEX idx_opportunities_active ON opportunities(is_active) WHERE is_active = true;

-- Opportunity Products indexes
CREATE INDEX idx_opportunity_products_opportunity ON opportunity_products(opportunity_id);
CREATE INDEX idx_opportunity_products_product ON opportunity_products(product_id);

-- Interactions indexes
CREATE INDEX idx_interactions_date ON interactions(interaction_date);
CREATE INDEX idx_interactions_contact ON interactions(contact_id);
CREATE INDEX idx_interactions_opportunity ON interactions(opportunity_id);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_follow_up ON interactions(follow_up_date) WHERE follow_up_required = true;

-- Principal-Distributor relationship indexes
CREATE INDEX idx_principal_distributor_principal ON principal_distributor_relationships(principal_id);
CREATE INDEX idx_principal_distributor_distributor ON principal_distributor_relationships(distributor_id);
CREATE INDEX idx_principal_distributor_active ON principal_distributor_relationships(is_active) WHERE is_active = true;

-- ============================================================================
-- Triggers for automatic updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunity_products_updated_at BEFORE UPDATE ON opportunity_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_principal_distributor_relationships_updated_at BEFORE UPDATE ON principal_distributor_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- End of Migration
-- ============================================================================

-- Verification queries (run these after migration to verify success)
/*
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;
SELECT enumname, enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid ORDER BY enumname, enumlabel;
*/