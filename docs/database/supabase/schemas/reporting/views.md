# Database Views

This document covers all views in the CRM database, including reporting views and utility views.

## Public Schema Views

### contact_influence_profile
- **Purpose**: Provides contact influence and advocacy profile data
- **Usage**: Analyzing contact influence in purchasing decisions

### enum_display_mappings  
- **Purpose**: Maps enum values to display-friendly text
- **Usage**: UI display of enum values with proper formatting

### governance_summary
- **Purpose**: Database governance and health summary
- **Usage**: Monitoring database structure and compliance

### opportunities_legacy
- **Purpose**: Legacy compatibility view for opportunity data
- **Usage**: Maintains backward compatibility during migrations

### phase_3_validation_summary
- **Purpose**: Validation summary for Phase 3 migration completion
- **Usage**: Migration progress tracking and validation

### principal_advocacy_dashboard
- **Purpose**: Principal advocacy network analysis dashboard
- **Usage**: Business intelligence for principal relationships

### typescript_enum_types
- **Purpose**: TypeScript-compatible enum type definitions
- **Usage**: Frontend type generation and validation

### v_org_roles
- **Purpose**: Organization roles view with aggregated data
- **Usage**: Role-based organization querying

### hypopg_hidden_indexes
- **Purpose**: Extension view for hypothetical hidden indexes
- **Usage**: Database performance analysis and index optimization (part of hypopg extension)

### hypopg_list_indexes
- **Purpose**: Extension view for listing hypothetical indexes
- **Usage**: Database performance analysis and index optimization (part of hypopg extension)

## Reporting Schema Views

### latest_interaction

### Definition
```sql
SELECT DISTINCT ON (opportunity_id) opportunity_id,
    id AS interaction_id,
    type AS interaction_type,
    subject,
    interaction_date,
    contact_id,
    organization_id,
    outcome,
    follow_up_required,
    follow_up_date
   FROM interactions i
  WHERE ((deleted_at IS NULL) AND (opportunity_id IS NOT NULL))
  ORDER BY opportunity_id, interaction_date DESC;
```

### Purpose
Returns the most recent interaction for each opportunity

### mv_health_check
- **Purpose**: Health check view for system monitoring
- **Usage**: Database health monitoring and system validation

## pipeline_full

### Definition
```sql
SELECT o.id AS opportunity_id,
    o.name AS opportunity_name,
    o.stage,
    o.status,
    o.priority,
    o.estimated_value,
    o.estimated_close_date,
    o.probability,
    o.stage_manual,
    o.status_manual,
    org.name AS organization_name,
    org.type AS organization_type,
    org.city,
    org.state_province,
    ((c.first_name || ' '::text) || c.last_name) AS contact_name,
    c.title AS contact_title,
    c.email AS contact_email,
    princ.name AS principal_name,
    dist.name AS distributor_name,
    li.interaction_type AS latest_interaction_type,
    li.interaction_date AS latest_interaction_date,
    li.outcome AS latest_outcome,
    ( SELECT count(*) AS count
           FROM opportunity_products op
          WHERE (op.opportunity_id = o.id)) AS product_count,
    o.created_at,
    o.updated_at
   FROM (((((opportunities o
     JOIN organizations org ON ((o.organization_id = org.id)))
     LEFT JOIN contacts c ON ((o.contact_id = c.id)))
     LEFT JOIN organizations princ ON ((o.principal_organization_id = princ.id)))
     LEFT JOIN organizations dist ON ((o.distributor_organization_id = dist.id)))
     LEFT JOIN reporting.latest_interaction li ON ((o.id = li.opportunity_id)))
  WHERE (o.deleted_at IS NULL);
```

### Purpose
Comprehensive view joining all opportunity-related data including organizations, contacts, principals, distributors, and latest interactions