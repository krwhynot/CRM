# Database Triggers

This document provides a comprehensive overview of all triggers in the CRM database, organized by purpose and table.

## Trigger Categories

### Audit Triggers
- **Purpose**: Automatically maintain audit fields (created_by, updated_by, timestamps)
- **Tables**: All core entities
- **Function**: `set_audit_fields()`

### Validation Triggers
- **Purpose**: Enforce business rules and data integrity
- **Timing**: BEFORE INSERT/UPDATE
- **Function**: Various validation functions

### Search Triggers
- **Purpose**: Maintain full-text search vectors
- **Tables**: Organizations, Contacts, Opportunities
- **Function**: `update_*_search_tsv()`

### Synchronization Triggers
- **Purpose**: Keep related data in sync
- **Timing**: AFTER INSERT/UPDATE/DELETE
- **Function**: Various sync functions

## Table-by-Table Trigger Analysis

### Organizations Table

#### Audit Triggers
- **audit_organizations** (BEFORE INSERT, UPDATE)
  - Function: `set_audit_fields()`
  - Purpose: Sets created_by, updated_by, created_at, updated_at

#### Search Triggers
- **trigger_update_organization_search_tsv** (BEFORE INSERT, UPDATE)
  - Function: `update_organization_search_tsv()`
  - Purpose: Maintains full-text search vector

#### Synchronization Triggers
- **sync_organization_roles_trigger** (AFTER INSERT, UPDATE, DELETE)
  - Function: `sync_organization_roles()`
  - Purpose: Synchronizes organization role flags with organization_roles table

#### Update Triggers
- **update_organizations_updated_at** (BEFORE UPDATE)
  - Function: `update_updated_at_column()`
  - Purpose: Updates timestamp on record modification

### Contacts Table

#### Audit Triggers
- **audit_contacts** (BEFORE INSERT, UPDATE)
  - Function: `set_audit_fields()`
  - Purpose: Sets audit fields automatically

#### Search Triggers
- **trigger_update_contact_search_tsv** (BEFORE INSERT, UPDATE)
  - Function: `update_contact_search_tsv()`
  - Purpose: Maintains search vector for name and organization

#### Update Triggers
- **update_contacts_updated_at** (BEFORE UPDATE)
  - Function: `update_updated_at_column()`
  - Purpose: Updates timestamp on modification

### Opportunities Table

#### Audit Triggers
- **audit_opportunities** (BEFORE INSERT, UPDATE)
  - Function: `set_audit_fields()`
  - Purpose: Sets audit fields

#### Validation Triggers
- **opportunity_contact_validation_insert** (BEFORE INSERT)
  - Function: `validate_opportunity_contact_business_rules()`
  - Purpose: Validates contact-opportunity relationship rules

- **opportunity_contact_validation_update** (BEFORE UPDATE)
  - Function: `validate_opportunity_contact_business_rules()`
  - Purpose: Validates contact-opportunity relationship rules

- **trg_opportunity_contact_alignment** (BEFORE INSERT, UPDATE)
  - Function: `validate_opportunity_contact_alignment()`
  - Purpose: Ensures contact belongs to opportunity organization

- **trigger_validate_priority_value_alignment** (BEFORE INSERT, UPDATE)
  - Function: `validate_priority_value_alignment()`
  - Purpose: Validates priority matches estimated value

- **validate_opportunity_stage_transition_trigger** (BEFORE UPDATE)
  - Function: `validate_opportunity_stage_transition()`
  - Purpose: Enforces valid stage transition rules

#### Search Triggers
- **trigger_update_opportunity_search_tsv** (BEFORE INSERT, UPDATE)
  - Function: `update_opportunity_search_tsv()`
  - Purpose: Maintains full-text search vector

#### Update Triggers
- **update_opportunities_updated_at** (BEFORE UPDATE)
  - Function: `update_updated_at_column()`
  - Purpose: Updates timestamp on modification

### Interactions Table

#### Audit Triggers
- **audit_interactions** (BEFORE INSERT, UPDATE)
  - Function: `set_audit_fields()`
  - Purpose: Sets audit fields

#### Validation Triggers
- **trg_interactions_consistency** (BEFORE INSERT, UPDATE)
  - Function: `validate_interaction_consistency()`
  - Purpose: Validates interaction business rules

- **trigger_validate_interaction_consistency** (BEFORE INSERT, UPDATE)
  - Function: `validate_interaction_consistency()`
  - Purpose: Validates interaction data consistency

#### Synchronization Triggers
- **trigger_sync_opportunity** (AFTER INSERT, UPDATE)
  - Function: `sync_opportunity_from_interaction()`
  - Purpose: Updates opportunity based on interaction changes

#### Update Triggers
- **update_interactions_updated_at** (BEFORE UPDATE)
  - Function: `update_updated_at_column()`
  - Purpose: Updates timestamp on modification

### Products Table

#### Validation Triggers
- **products_principal_type_trigger** (BEFORE INSERT, UPDATE)
  - Function: `validate_principal_type()`
  - Purpose: Validates that principal_id references a principal organization

#### Update Triggers
- **update_products_updated_at** (BEFORE UPDATE)
  - Function: `update_updated_at_column()`
  - Purpose: Updates timestamp on modification

### Opportunity Participants Table

#### Audit Triggers
- **audit_opp_participants** (BEFORE INSERT, UPDATE)
  - Function: `set_audit_fields()`
  - Purpose: Sets audit fields

#### Validation Triggers
- **trg_enforce_participant_role** (BEFORE INSERT, UPDATE)
  - Function: `enforce_participant_role_match()`
  - Purpose: Validates participant role matches organization type

- **trg_primary_customer** (BEFORE INSERT, UPDATE)
  - Function: `enforce_single_primary_customer()`
  - Purpose: Ensures only one primary customer per opportunity

### Opportunity Products Table

#### Update Triggers
- **update_opportunity_products_updated_at** (BEFORE UPDATE)
  - Function: `update_updated_at_column()`
  - Purpose: Updates timestamp on modification

### Organization Roles Table

#### Audit Triggers
- **audit_organization_roles** (BEFORE INSERT, UPDATE)
  - Function: `set_audit_fields()`
  - Purpose: Sets audit fields

### Principal Distributor Relationships Table

#### Update Triggers
- **update_principal_distributor_relationships_updated_at** (BEFORE UPDATE)
  - Function: `update_updated_at_column()`
  - Purpose: Updates timestamp on modification

### Contact Preferred Principals Table

#### Validation Triggers
- **validate_principal_organization_trigger** (BEFORE INSERT, UPDATE)
  - Function: `validate_principal_organization()`
  - Purpose: Validates that principal_organization_id is actually a principal

#### Update Triggers
- **update_contact_preferred_principals_updated_at** (BEFORE UPDATE)
  - Function: `update_updated_at_column()`
  - Purpose: Updates timestamp on modification

### Lookup Tables

#### Enum Validation Triggers
- **trg_validate_interaction_type_enum** (BEFORE INSERT, UPDATE) - interaction_type_lu
- **trg_validate_stage_enum** (BEFORE INSERT, UPDATE) - stage_lu
- **trg_validate_status_enum** (BEFORE INSERT, UPDATE) - status_lu
  - Function: `validate_enum_lookup_consistency()`
  - Purpose: Validates lookup table consistency with enum types

## Trigger Functions Overview

### Audit Functions
- **set_audit_fields()**: Universal audit field management
- **update_updated_at_column()**: Simple timestamp update

### Search Functions
- **update_contact_search_tsv()**: Contact name and organization search
- **update_opportunity_search_tsv()**: Opportunity name and description search
- **update_organization_search_tsv()**: Organization name and description search

### Validation Functions
- **validate_interaction_consistency()**: Interaction business rule validation
- **validate_opportunity_contact_alignment()**: Contact-opportunity alignment
- **validate_opportunity_contact_business_rules()**: Contact relationship rules
- **validate_opportunity_stage_transition()**: Stage transition validation
- **validate_principal_organization()**: Principal organization validation
- **validate_principal_type()**: Principal type validation
- **validate_priority_value_alignment()**: Priority-value alignment
- **enforce_participant_role_match()**: Participant role validation
- **enforce_single_primary_customer()**: Primary customer uniqueness
- **validate_enum_lookup_consistency()**: Enum-lookup consistency

### Synchronization Functions
- **sync_opportunity_from_interaction()**: Opportunity-interaction sync
- **sync_organization_roles()**: Organization role flag sync

## Trigger Performance Impact

### Execution Order
1. BEFORE triggers execute first (validation, audit)
2. Row modification occurs
3. AFTER triggers execute (synchronization)

### Performance Considerations
- Validation triggers add minimal overhead
- Search vector updates are efficient with GIN indexes
- Audit triggers are lightweight
- Synchronization triggers may have moderate impact

### Error Handling
- BEFORE triggers can prevent row modification by raising exceptions
- Failed triggers roll back the entire transaction
- Validation errors provide detailed messages for debugging

## Trigger Monitoring

### Debugging
- Use `RAISE NOTICE` for debugging trigger execution
- Check `pg_trigger` system catalog for trigger definitions
- Monitor `pg_stat_user_functions` for trigger function performance

### Maintenance
- Triggers are automatically maintained with table schema changes
- Function updates require manual trigger recreation if signature changes
- Regular testing ensures trigger logic remains correct