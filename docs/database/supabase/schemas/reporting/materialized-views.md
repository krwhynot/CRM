# Materialized Views

## dashboard_summary

### Properties
- **Schema**: reporting
- **Populated**: Yes
- **Has Indexes**: Yes

### Definition
```sql
SELECT 'overview'::text AS section_type,
    'total_opportunities'::text AS metric_key,
    (count(*))::text AS metric_value,
    'count'::text AS metric_type,
    now() AS calculated_at
   FROM opportunities
  WHERE (opportunities.deleted_at IS NULL)
UNION ALL
 SELECT 'overview'::text AS section_type,
    'total_value'::text AS metric_key,
    (COALESCE(sum(opportunities.estimated_value), (0)::numeric))::text AS metric_value,
    'currency'::text AS metric_type,
    now() AS calculated_at
   FROM opportunities
  WHERE (opportunities.deleted_at IS NULL)
UNION ALL
 SELECT 'pipeline'::text AS section_type,
    (opportunities.stage)::text AS metric_key,
    (count(*))::text AS metric_value,
    'count'::text AS metric_type,
    now() AS calculated_at
   FROM opportunities
  WHERE (opportunities.deleted_at IS NULL)
  GROUP BY opportunities.stage
UNION ALL
 SELECT 'status'::text AS section_type,
    (opportunities.status)::text AS metric_key,
    (count(*))::text AS metric_value,
    'count'::text AS metric_type,
    now() AS calculated_at
   FROM opportunities
  WHERE (opportunities.deleted_at IS NULL)
  GROUP BY opportunities.status;
```

### Indexes
- **idx_dashboard_summary_unique**: UNIQUE btree (section_type, metric_key, metric_type)

### Purpose
Pre-calculated dashboard metrics including total opportunities, total value, pipeline counts by stage, and status distributions