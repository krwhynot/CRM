# Functions

## Business Logic Functions

### analyze_principal_advocacy_network
- **Arguments**: target_principal_id uuid
- **Returns**: TABLE(organization_name text, organization_id uuid, contact_count integer, avg_influence numeric, strong_advocates integer, total_advocacy_strength integer, network_strength_score numeric)
- **Language**: plpgsql

### get_contact_advocacy_profile  
- **Arguments**: target_contact_id uuid
- **Returns**: TABLE(principal_name text, principal_id uuid, advocacy_strength integer, relationship_type text, advocacy_notes text, purchase_influence integer, decision_authority integer, combined_influence_score numeric)
- **Language**: plpgsql

### get_principal_advocacy_summary
- **Arguments**: target_principal_id uuid
- **Returns**: TABLE(total_advocates integer, avg_advocacy_strength numeric, strong_advocates integer, contact_count integer, organization_count integer)
- **Language**: plpgsql

### principal_advocacy_schema_health_check
- **Arguments**: none
- **Returns**: TABLE(table_name text, row_count bigint, index_count integer, avg_row_size numeric, recommendations text)  
- **Language**: plpgsql

### refresh_dashboard_view
- **Arguments**: none
- **Returns**: boolean
- **Language**: plpgsql

### validate_founding_interaction_timing
- **Arguments**: p_founding_interaction_id uuid, p_opportunity_created_at timestamp with time zone
- **Returns**: boolean
- **Language**: plpgsql

### validate_principal_type (function)
- **Arguments**: org_type organization_type
- **Returns**: boolean
- **Language**: plpgsql

### validate_priority_value_alignment (function)
- **Arguments**: priority priority_level, estimated_value numeric
- **Returns**: boolean
- **Language**: plpgsql

## Trigger Functions

### set_updated_at
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### sync_opportunity_from_interaction  
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### update_contact_search_tsv
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### update_opportunity_search_tsv
- **Arguments**: none  
- **Returns**: trigger
- **Language**: plpgsql

### update_organization_search_tsv
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### update_updated_at_column
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### validate_opportunity_contact_business_rules
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### validate_opportunity_stage_transition
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### validate_principal_organization
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### validate_principal_type (trigger)
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

### validate_priority_value_alignment (trigger)
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql

## Security Functions

### user_has_org_access (single argument)
- **Arguments**: org_id uuid
- **Returns**: boolean
- **Language**: plpgsql

### user_has_org_access (dual argument)
- **Arguments**: user_id uuid, org_id uuid
- **Returns**: boolean
- **Language**: plpgsql

### user_is_admin (no arguments)
- **Arguments**: none
- **Returns**: boolean
- **Language**: plpgsql

### user_is_admin (with user_id)
- **Arguments**: user_id uuid
- **Returns**: boolean
- **Language**: plpgsql