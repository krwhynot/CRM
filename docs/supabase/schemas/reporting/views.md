# Reporting Schema Views

## latest_interaction

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