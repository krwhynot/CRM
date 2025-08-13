# KitchenPantry CRM Database Schema Design

## Overview

This document outlines the database schema design decisions for the KitchenPantry CRM system, focusing on relationship-centric data modeling for the food service industry.

## Core Design Principles

### 1. **Principal-Centric Architecture**
The schema is designed around the fundamental business relationship in food service:
- **Principals** (manufacturers) own products
- **Distributors** sell principal products to customers
- **Customers** (restaurants, cafeterias) purchase through distributors
- **Sales Managers** track and manage these relationships

### 2. **Data Integrity & Consistency**
- **ENUM types** for all dropdown values to ensure data consistency
- **Foreign key constraints** with appropriate CASCADE/RESTRICT actions
- **CHECK constraints** for business rule validation
- **Unique constraints** for business logic enforcement

### 3. **Performance Optimization**
- **Strategic indexing** for common query patterns
- **Partial indexes** for filtered queries (e.g., `WHERE deleted_at IS NULL`)
- **GIN indexes** with `pg_trgm` for full-text search capabilities
- **Composite indexes** for multi-column queries

### 4. **Audit Trail & Soft Deletes**
- **Audit fields** on all tables (`created_at`, `updated_at`, `created_by`, `updated_by`)
- **Soft delete** capability with `deleted_at` field
- **Automatic timestamp updates** via triggers

## Entity Relationships

### Primary Entities

#### Organizations
- **Purpose**: Central entity representing all companies in the ecosystem
- **Types**: customer, principal, distributor, prospect, vendor
- **Key Features**:
  - Self-referencing parent relationships for company hierarchies
  - Complete address and contact information
  - Business metrics (revenue, employee count)

#### Contacts
- **Purpose**: People within organizations with role-based categorization
- **Key Features**:
  - Multiple contact methods (work, mobile, direct phone)
  - Role-based categorization for sales strategy
  - Primary contact designation per organization

#### Products
- **Purpose**: Items owned by principals, categorized by food service types
- **Key Features**:
  - Industry-specific categorization (beverages, dairy, frozen, etc.)
  - Comprehensive product specifications (SKU, UPC, pricing, dimensions)
  - Seasonal availability tracking
  - Brand and product line organization

#### Opportunities
- **Purpose**: Sales pipeline tracking with relationship context
- **Key Features**:
  - Standard sales stages (lead → qualified → proposal → negotiation → closed)
  - Financial tracking (estimated value, probability)
  - Relationship tracking (principal, distributor, customer)
  - Timeline management (expected vs actual close dates)

#### Interactions
- **Purpose**: Communication history and follow-up management
- **Key Features**:
  - Multiple interaction types (call, email, meeting, demo, etc.)
  - Scheduling and completion tracking
  - Follow-up requirement flagging
  - Outcome documentation

### Relationship Tables

#### opportunity_products
- **Purpose**: Many-to-many relationship between opportunities and products
- **Features**: Quantity, pricing, and discount tracking per product per opportunity

#### principal_distributor_relationships
- **Purpose**: Business relationships between principals and distributors
- **Features**: Territory management, contract dates, volume commitments

## Index Strategy

### Text Search Optimization
- **GIN indexes** with `pg_trgm` for fuzzy text matching on names
- Enables fast LIKE queries: `WHERE name ILIKE '%search%'`

### Filtered Indexes
- **Partial indexes** excluding soft-deleted records: `WHERE deleted_at IS NULL`
- Significantly reduces index size and improves performance

### Composite Indexes
- **Multi-column indexes** for common query patterns
- Example: `(last_name, first_name)` for contact sorting

### Foreign Key Indexes
- **Automatic performance** for JOIN operations and referential integrity

## Business Logic Constraints

### Data Validation
- **Email format validation** using regex patterns
- **Positive number constraints** for financial and quantity fields
- **Date range validation** for seasonal products and contracts

### Referential Integrity
- **Contact-Organization matching**: Ensures contacts belong to correct organizations
- **Principal-Product ownership**: Only principals can own products
- **Opportunity logic**: Closing logic with actual close dates and loss reasons

### Business Rule Enforcement
- **Primary contact uniqueness**: One primary contact per organization
- **Relationship type validation**: Principals and distributors must have correct types
- **Seasonal date logic**: Start date must be before or equal to end date

## Performance Considerations

### Query Optimization
- **Covering indexes** for frequently accessed columns
- **Partial indexes** to exclude inactive/deleted records
- **Strategic denormalization** where appropriate (calculated fields)

### Scalability Features
- **UUID primary keys** for distributed systems
- **Efficient pagination** support through indexed sorting
- **Prepared for read replicas** with proper indexing strategy

## Security Preparation

### Row Level Security (RLS) Ready
- **User tracking fields** (`created_by`, `updated_by`) for RLS policies
- **Tenant isolation** capabilities through organization-based filtering
- **Audit trail** for security compliance

### Data Protection
- **Soft deletes** to maintain referential integrity
- **Audit trails** for compliance requirements
- **Structured data types** to prevent injection attacks

## Migration Strategy

### Forward Migration
```sql
-- Apply the schema
\i database/schema/001_initial_schema.sql
```

### Rollback Migration
```sql
-- Rollback if needed (WARNING: Destroys all data)
\i database/schema/001_initial_schema_rollback.sql
```

### Validation Queries
```sql
-- Verify schema creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Verify ENUM types
SELECT enumname, enumlabel 
FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
ORDER BY enumname, enumlabel;
```

## Future Considerations

### Potential Enhancements
- **Document attachments** table for proposals, contracts
- **Activity timeline** view for comprehensive interaction history
- **Territory management** enhancements for geographic analysis
- **Product pricing history** for trend analysis
- **Email integration** tracking for automated interaction logging

### Performance Monitoring
- **Query performance** monitoring for optimization opportunities
- **Index usage** analysis for unused index cleanup
- **Table size growth** monitoring for partitioning decisions
- **Constraint violation** tracking for data quality insights

This schema provides a robust foundation for a relationship-focused CRM system while maintaining flexibility for future enhancements and scale.