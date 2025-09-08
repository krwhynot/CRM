# Database Indexes

This document provides a comprehensive overview of all indexes in the CRM database, organized by table and purpose.

## Index Categories

### Performance Indexes
- **B-tree indexes**: Standard indexes for equality and range queries
- **GIN indexes**: For full-text search and array operations
- **Trigram indexes**: For fuzzy text matching and partial string search

### Constraint Indexes
- **Primary key indexes**: Unique identification
- **Unique indexes**: Data integrity enforcement
- **Foreign key indexes**: Referential integrity and join performance

## Table-by-Table Index Analysis

### Organizations Table

#### Search and Text Indexes
- `idx_organizations_name_text`: GIN index on `to_tsvector('english', name)` for full-text search
- `idx_organizations_name_trgm`: GIN index with trigram ops for fuzzy name matching
- `idx_organizations_search_tsv`: GIN index on search_tsv column
- `idx_organizations_search_active`: GIN index on search_tsv for active records only

#### Performance Indexes
- `idx_organizations_active_name`: B-tree on (deleted_at, name) for active organization listing
- `idx_organizations_owner_deleted`: B-tree on (created_by, deleted_at) for user-owned records
- `idx_organizations_type`: B-tree on organization type for filtering
- `idx_organizations_role_flags`: B-tree on (is_principal, is_distributor) for role-based queries
- `idx_organizations_parent`: B-tree on parent_organization_id for hierarchy queries

#### Constraint Indexes
- `organizations_pkey`: UNIQUE B-tree on id (primary key)
- `idx_organizations_unique_name_type_active`: UNIQUE B-tree on (name, type) for active records

### Contacts Table

#### Search and Text Indexes
- `idx_contacts_name_trgm`: GIN index with trigram ops on concatenated full name
- `idx_contacts_search_tsv`: GIN index on search_tsv column

#### Performance Indexes
- `idx_contacts_active_name`: B-tree on (deleted_at, last_name, first_name) for name sorting
- `idx_contacts_organization`: B-tree on organization_id for foreign key joins
- `idx_contacts_organization_active`: B-tree on organization_id for active contacts only
- `idx_contacts_org_active`: B-tree on (organization_id, deleted_at) for filtered organization queries
- `idx_contacts_owner_deleted`: B-tree on (created_by, deleted_at) for user-owned records
- `idx_contacts_email`: B-tree on email for email lookups

#### Constraint Indexes
- `contacts_pkey`: UNIQUE B-tree on id (primary key)
- `idx_contacts_primary_per_org`: UNIQUE B-tree on organization_id where is_primary_contact = true
- `idx_contacts_unique_email_org_active`: UNIQUE B-tree on (email, organization_id) for active records
- `uq_contact_email_active`: UNIQUE B-tree on lower(email) for active records

### Opportunities Table

#### Search Indexes
- `idx_opportunities_search_tsv`: GIN index on search_tsv column

#### Performance Indexes
- `idx_opportunities_active_stage`: B-tree on (deleted_at, stage, estimated_close_date) for pipeline views
- `idx_opportunities_organization`: B-tree on organization_id for foreign key joins
- `idx_opportunities_organization_active`: B-tree on organization_id for active opportunities
- `idx_opportunities_org_active`: B-tree on (organization_id, deleted_at, stage) for filtered queries
- `idx_opportunities_contact`: B-tree on contact_id for contact-related opportunities
- `idx_opportunities_owner_deleted`: B-tree on (created_by, deleted_at) for user-owned records
- `idx_opportunities_stage`: B-tree on (stage, created_at DESC) for stage-based reporting
- `idx_opportunities_priority`: B-tree on priority for priority filtering
- `idx_opportunities_deleted_stage`: B-tree on (deleted_at, stage) for active stage queries
- `idx_opportunities_deleted_status`: B-tree on (deleted_at, status) for active status queries
- `idx_opportunities_deleted_value`: B-tree on (deleted_at, estimated_value) for value-based queries

#### Constraint Indexes
- `opportunities_pkey`: UNIQUE B-tree on id (primary key)
- `idx_opportunities_unique_name_org_active`: UNIQUE B-tree on (name, organization_id) for active records
- `uq_opp_org_name_active`: UNIQUE B-tree on (organization_id, lower(name)) for active records

### Interactions Table

#### Performance Indexes
- `idx_interactions_composite`: B-tree on (opportunity_id, interaction_date DESC, deleted_at) for timeline queries
- `idx_interactions_opportunity`: B-tree on opportunity_id for foreign key joins
- `idx_interactions_contact`: B-tree on contact_id for contact-related interactions
- `idx_interactions_date`: B-tree on interaction_date for date-based queries

#### Constraint Indexes
- `interactions_pkey`: UNIQUE B-tree on id (primary key)

### Products Table

#### Performance Indexes
- `idx_products_principal`: B-tree on principal_id for foreign key joins
- `idx_products_principal_active`: B-tree on principal_id for active products only

#### Constraint Indexes
- `products_pkey`: UNIQUE B-tree on id (primary key)
- `products_sku_key`: UNIQUE B-tree on sku (legacy constraint)
- `idx_products_unique_sku_principal_active`: UNIQUE B-tree on (sku, principal_id) for active records

## Index Usage Patterns

### Search Performance
- **Full-text search**: Uses GIN indexes on tsvector columns for fast text search
- **Fuzzy matching**: Uses trigram GIN indexes for partial string matching
- **Exact lookups**: Uses standard B-tree indexes for precise matches

### Query Optimization
- **Soft delete filtering**: Most indexes include `WHERE deleted_at IS NULL` for performance
- **Composite indexes**: Multi-column indexes optimize common query patterns
- **Foreign key performance**: All foreign keys have supporting indexes

### Data Integrity
- **Unique constraints**: Prevent duplicate data while allowing soft deletes
- **Conditional uniqueness**: Unique indexes with WHERE clauses for business rules
- **Primary keys**: Standard UUID primary keys with B-tree indexes

## Performance Considerations

### Index Maintenance
- Indexes are automatically maintained by PostgreSQL
- GIN indexes have higher maintenance costs but excellent query performance
- Partial indexes (with WHERE clauses) reduce storage and maintenance overhead

### Query Planning
- PostgreSQL query planner automatically selects optimal indexes
- Multiple indexes on the same table can be combined using bitmap scans
- Index-only scans possible when all required columns are in the index

### Storage Impact
- Total of 42 indexes across 5 core tables
- GIN indexes are larger but essential for text search performance
- Partial indexes significantly reduce storage requirements

## Index Monitoring

### Performance Metrics
- Query execution plans show index usage
- `pg_stat_user_indexes` provides usage statistics
- Missing indexes identified through slow query analysis

### Maintenance Tasks
- Regular VACUUM maintains index performance
- REINDEX rarely needed due to B-tree robustness
- ANALYZE updates statistics for optimal query planning