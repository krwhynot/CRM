-- KitchenPantry CRM Database Schema
-- Initial migration for core entities and relationships
-- Target: Supabase (PostgreSQL 15+)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUM TYPES FOR CONSISTENT DATA VALUES
-- =====================================================

-- Organization type categorization for food service industry
CREATE TYPE organization_type AS ENUM (
    'customer',      -- End customers (restaurants, cafeterias, etc.)
    'principal',     -- Manufacturers/suppliers who own products
    'distributor',   -- Distributors who sell principal products
    'prospect',      -- Potential customers not yet converted
    'vendor'         -- Service providers or other business partners
);

-- Opportunity stages following typical sales pipeline
CREATE TYPE opportunity_stage AS ENUM (
    'lead',          -- Initial contact/interest
    'qualified',     -- Qualified lead with budget/authority
    'proposal',      -- Proposal submitted
    'negotiation',   -- In active negotiation
    'closed_won',    -- Successfully closed
    'closed_lost',   -- Lost opportunity
    'on_hold'        -- Temporarily paused
);

-- Interaction types for CRM activity tracking
CREATE TYPE interaction_type AS ENUM (
    'call',          -- Phone call
    'email',         -- Email communication
    'meeting',       -- In-person or virtual meeting
    'demo',          -- Product demonstration
    'proposal',      -- Proposal presentation
    'follow_up',     -- General follow-up activity
    'site_visit',    -- On-site visit
    'trade_show',    -- Trade show interaction
    'other'          -- Other interaction types
);

-- Contact roles within organizations
CREATE TYPE contact_role AS ENUM (
    'decision_maker',    -- Primary decision authority
    'influencer',        -- Influences buying decisions
    'user',             -- End user of products
    'gatekeeper',       -- Controls access to decision makers
    'champion',         -- Internal advocate for your solution
    'technical',        -- Technical evaluator
    'financial',        -- Budget/financial authority
    'other'             -- Other roles
);

-- Product categories for food service industry
CREATE TYPE product_category AS ENUM (
    'beverages',         -- Drinks, juices, etc.
    'dairy',            -- Milk, cheese, dairy products
    'frozen',           -- Frozen foods
    'fresh_produce',    -- Fresh fruits and vegetables
    'meat_poultry',     -- Meat and poultry products
    'seafood',          -- Fish and seafood
    'bakery',           -- Bread, pastries, baked goods
    'pantry',           -- Shelf-stable pantry items
    'cleaning',         -- Cleaning and sanitation supplies
    'equipment',        -- Kitchen equipment and tools
    'packaging',        -- Food packaging and containers
    'other'             -- Other product categories
);

-- Priority levels for opportunities and interactions
CREATE TYPE priority_level AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- =====================================================
-- CORE ENTITY TABLES
-- =====================================================

-- Organizations: Companies in the food service supply chain
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type organization_type NOT NULL,
    description TEXT,
    
    -- Contact information
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Address information
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Business details
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    industry VARCHAR(100),
    
    -- Relationship tracking
    parent_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID, -- Will reference auth.users when RLS is implemented
    updated_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT organizations_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT organizations_positive_revenue CHECK (annual_revenue >= 0),
    CONSTRAINT organizations_positive_employees CHECK (employee_count >= 0),
    CONSTRAINT organizations_no_self_parent CHECK (id != parent_organization_id)
);

-- Contacts: People within organizations
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    role contact_role,
    department VARCHAR(100),
    
    -- Contact information
    email VARCHAR(255),
    phone_work VARCHAR(50),
    phone_mobile VARCHAR(50),
    phone_direct VARCHAR(50),
    
    -- Professional details
    linkedin_url VARCHAR(255),
    notes TEXT,
    is_primary_contact BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT contacts_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT contacts_name_not_empty CHECK (TRIM(first_name) != '' AND TRIM(last_name) != '')
);

-- Products: Items owned by principals
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Product information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category product_category NOT NULL,
    sku VARCHAR(100),
    upc_code VARCHAR(50),
    
    -- Pricing and specifications
    unit_price DECIMAL(10,2),
    unit_of_measure VARCHAR(50),
    case_pack INTEGER,
    weight_per_unit DECIMAL(10,3),
    dimensions VARCHAR(100),
    
    -- Status and availability
    is_active BOOLEAN DEFAULT TRUE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    season_start DATE,
    season_end DATE,
    
    -- Marketing information
    brand VARCHAR(100),
    product_line VARCHAR(100),
    marketing_description TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT products_positive_price CHECK (unit_price >= 0),
    CONSTRAINT products_positive_case_pack CHECK (case_pack > 0),
    CONSTRAINT products_positive_weight CHECK (weight_per_unit >= 0),
    CONSTRAINT products_season_dates CHECK (
        (season_start IS NULL AND season_end IS NULL) OR 
        (season_start IS NOT NULL AND season_end IS NOT NULL AND season_start <= season_end)
    ),
    CONSTRAINT products_principal_type CHECK (
        EXISTS (
            SELECT 1 FROM organizations 
            WHERE id = principal_id 
            AND type = 'principal'
            AND deleted_at IS NULL
        )
    )
);

-- Opportunities: Sales pipeline tracking
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Opportunity details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stage opportunity_stage NOT NULL DEFAULT 'lead',
    priority priority_level DEFAULT 'medium',
    
    -- Financial information
    estimated_value DECIMAL(15,2),
    probability INTEGER DEFAULT 0, -- 0-100 percentage
    
    -- Timeline
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Relationship tracking
    principal_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    distributor_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Additional context
    source VARCHAR(100), -- Where the opportunity came from
    reason_lost TEXT,    -- Reason if closed_lost
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT opportunities_positive_value CHECK (estimated_value >= 0),
    CONSTRAINT opportunities_valid_probability CHECK (probability >= 0 AND probability <= 100),
    CONSTRAINT opportunities_close_date_logic CHECK (
        (stage NOT IN ('closed_won', 'closed_lost') AND actual_close_date IS NULL) OR
        (stage IN ('closed_won', 'closed_lost') AND actual_close_date IS NOT NULL)
    ),
    CONSTRAINT opportunities_reason_lost_logic CHECK (
        (stage = 'closed_lost' AND reason_lost IS NOT NULL) OR
        (stage != 'closed_lost' AND reason_lost IS NULL)
    ),
    CONSTRAINT opportunities_contact_org_match CHECK (
        primary_contact_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM contacts 
            WHERE id = primary_contact_id 
            AND organization_id = opportunities.organization_id
            AND deleted_at IS NULL
        )
    )
);

-- Interactions: Follow-up activities and communication tracking
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Interaction details
    type interaction_type NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority priority_level DEFAULT 'medium',
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Follow-up planning
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- Outcomes and results
    outcome_summary TEXT,
    next_steps TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT interactions_positive_duration CHECK (duration_minutes >= 0),
    CONSTRAINT interactions_completion_logic CHECK (
        completed_at IS NULL OR 
        (scheduled_at IS NOT NULL AND completed_at >= scheduled_at)
    ),
    CONSTRAINT interactions_contact_org_match CHECK (
        contact_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM contacts 
            WHERE id = contact_id 
            AND organization_id = interactions.organization_id
            AND deleted_at IS NULL
        )
    )
);

-- =====================================================
-- RELATIONSHIP JUNCTION TABLES
-- =====================================================

-- Many-to-many relationship between opportunities and products
CREATE TABLE opportunity_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Quantity and pricing for this specific opportunity
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    total_value DECIMAL(15,2),
    
    -- Status
    is_primary_product BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT opportunity_products_unique UNIQUE (opportunity_id, product_id),
    CONSTRAINT opportunity_products_positive_qty CHECK (quantity >= 0),
    CONSTRAINT opportunity_products_positive_price CHECK (unit_price >= 0),
    CONSTRAINT opportunity_products_valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    CONSTRAINT opportunity_products_positive_total CHECK (total_value >= 0)
);

-- Principal-Distributor relationships (which distributors sell which principal's products)
CREATE TABLE principal_distributor_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    distributor_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Relationship details
    is_active BOOLEAN DEFAULT TRUE,
    territory VARCHAR(255), -- Geographic territory covered
    contract_start_date DATE,
    contract_end_date DATE,
    
    -- Performance tracking
    annual_volume_commitment DECIMAL(15,2),
    discount_tier VARCHAR(50),
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT principal_distributor_unique UNIQUE (principal_id, distributor_id),
    CONSTRAINT principal_distributor_different CHECK (principal_id != distributor_id),
    CONSTRAINT principal_distributor_types CHECK (
        EXISTS (SELECT 1 FROM organizations WHERE id = principal_id AND type = 'principal' AND deleted_at IS NULL) AND
        EXISTS (SELECT 1 FROM organizations WHERE id = distributor_id AND type = 'distributor' AND deleted_at IS NULL)
    ),
    CONSTRAINT principal_distributor_dates CHECK (
        (contract_start_date IS NULL AND contract_end_date IS NULL) OR
        (contract_start_date IS NOT NULL AND contract_end_date IS NOT NULL AND contract_start_date <= contract_end_date)
    )
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Organizations indexes
CREATE INDEX idx_organizations_type ON organizations(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_name_trgm ON organizations USING GIN (name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_parent ON organizations(parent_organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_created_at ON organizations(created_at DESC) WHERE deleted_at IS NULL;

-- Contacts indexes
CREATE INDEX idx_contacts_organization ON contacts(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_name ON contacts(last_name, first_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL AND email IS NOT NULL;
CREATE INDEX idx_contacts_primary ON contacts(organization_id) WHERE is_primary_contact = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_contacts_role ON contacts(role) WHERE deleted_at IS NULL;

-- Products indexes
CREATE INDEX idx_products_principal ON products(principal_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_sku ON products(sku) WHERE deleted_at IS NULL AND sku IS NOT NULL;
CREATE INDEX idx_products_brand ON products(brand) WHERE deleted_at IS NULL AND brand IS NOT NULL;

-- Opportunities indexes
CREATE INDEX idx_opportunities_organization ON opportunities(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_stage ON opportunities(stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_close_date ON opportunities(expected_close_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_primary_contact ON opportunities(primary_contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_principal ON opportunities(principal_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_distributor ON opportunities(distributor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_value ON opportunities(estimated_value DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_opportunities_priority ON opportunities(priority) WHERE deleted_at IS NULL;

-- Interactions indexes
CREATE INDEX idx_interactions_organization ON interactions(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_interactions_opportunity ON interactions(opportunity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_interactions_contact ON interactions(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_interactions_type ON interactions(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_interactions_scheduled ON interactions(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_interactions_follow_up ON interactions(follow_up_date) WHERE follow_up_required = TRUE AND deleted_at IS NULL;

-- Junction table indexes
CREATE INDEX idx_opportunity_products_opportunity ON opportunity_products(opportunity_id);
CREATE INDEX idx_opportunity_products_product ON opportunity_products(product_id);
CREATE INDEX idx_principal_distributor_principal ON principal_distributor_relationships(principal_id);
CREATE INDEX idx_principal_distributor_distributor ON principal_distributor_relationships(distributor_id);
CREATE INDEX idx_principal_distributor_active ON principal_distributor_relationships(is_active) WHERE is_active = TRUE;

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

-- Generic function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all main tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunity_products_updated_at BEFORE UPDATE ON opportunity_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_principal_distributor_relationships_updated_at BEFORE UPDATE ON principal_distributor_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Table comments
COMMENT ON TABLE organizations IS 'Companies in the food service supply chain (customers, principals, distributors, prospects, vendors)';
COMMENT ON TABLE contacts IS 'People within organizations with their roles and contact information';
COMMENT ON TABLE products IS 'Items owned by principals, categorized by food service industry types';
COMMENT ON TABLE opportunities IS 'Sales pipeline tracking with stages, values, and relationships';
COMMENT ON TABLE interactions IS 'Communication and follow-up activities with contacts and organizations';
COMMENT ON TABLE opportunity_products IS 'Many-to-many relationship between opportunities and products with quantities and pricing';
COMMENT ON TABLE principal_distributor_relationships IS 'Business relationships between principals and their distributors';

-- Key column comments
COMMENT ON COLUMN organizations.type IS 'Type of organization: customer, principal, distributor, prospect, or vendor';
COMMENT ON COLUMN opportunities.probability IS 'Percentage likelihood of closing (0-100)';
COMMENT ON COLUMN interactions.follow_up_required IS 'Flag indicating if this interaction requires follow-up action';
COMMENT ON COLUMN products.principal_id IS 'Organization that owns this product (must be type=principal)';
COMMENT ON COLUMN principal_distributor_relationships.territory IS 'Geographic territory covered by this distributor for this principal';