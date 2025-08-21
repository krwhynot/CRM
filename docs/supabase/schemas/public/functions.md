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

### check_ui_readiness_for_legacy_removal
- **Arguments**: none
- **Returns**: record (table format)
- **Language**: plpgsql
- **Purpose**: Validates UI readiness before removing legacy database columns

### get_enum_display_info
- **Arguments**: enum_type text, enum_value text  
- **Returns**: record (table format)
- **Language**: plpgsql
- **Purpose**: Gets display information for enum values

### refresh_dashboard_summary_concurrent
- **Arguments**: none
- **Returns**: text
- **Language**: plpgsql
- **Purpose**: Refreshes dashboard materialized views with concurrent updates

### refresh_dashboard_summary_regular
- **Arguments**: none
- **Returns**: text
- **Language**: plpgsql
- **Purpose**: Refreshes dashboard materialized views with standard updates

### remove_legacy_opportunity_columns
- **Arguments**: none
- **Returns**: text
- **Language**: plpgsql
- **Purpose**: Removes legacy opportunity table columns after migration validation

### validate_enum_governance
- **Arguments**: none
- **Returns**: record (table format)
- **Language**: plpgsql
- **Purpose**: Validates enum governance and consistency across the database

### validate_schema_migration_success
- **Arguments**: none
- **Returns**: record (table format)
- **Language**: plpgsql
- **Purpose**: Validates successful completion of schema migrations

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

### enforce_participant_role_match
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql
- **Purpose**: Validates that opportunity participant roles match organization roles

### enforce_single_primary_customer
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql
- **Purpose**: Ensures each opportunity has only one primary customer

### set_audit_fields
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql
- **Purpose**: Automatically sets created_by, updated_by, created_at, updated_at fields

### sync_organization_roles
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql
- **Purpose**: Synchronizes organization roles when organization data changes

### validate_enum_lookup_consistency
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql
- **Purpose**: Validates consistency between enum values and lookup tables

### validate_interaction_consistency
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql
- **Purpose**: Validates business rules for interaction records

### validate_opportunity_contact_alignment
- **Arguments**: none
- **Returns**: trigger
- **Language**: plpgsql
- **Purpose**: Validates that opportunity contacts align with business rules

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