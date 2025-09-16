# Data Integrity Validation Addendum

**CRITICAL ADDITION** to the Architecture Simplification Parallel Plan

The current plan lacks explicit data integrity validation to ensure new components maintain correct database field mappings. This addendum adds essential validation tasks to prevent data corruption during migration.

## Pre-Migration Validation Tasks (Add to Phase 1)

#### Task 1.4: Database Schema Documentation Depends on [none]

**READ THESE BEFORE TASK**
- /src/types/contact.zod.ts
- /src/types/organization.zod.ts
- /src/types/opportunity.zod.ts
- /src/features/*/components/*Table.tsx (all existing tables)

**Instructions**

Files to Create
- /docs/validation/database-field-mappings.md (comprehensive field mapping documentation)
- /scripts/validate-schema-mappings.js (automated validation script)

Document every database field used by current components:
- Map table column definitions to database fields
- Document form field names and their database mappings
- Identify any data transformation logic in current components
- Create baseline for validation after migration

#### Task 1.5: Data Flow Analysis Depends on [1.4]

**READ THESE BEFORE TASK**
- /docs/validation/database-field-mappings.md
- /src/lib/form-transforms.ts
- Current feature table and form components

**Instructions**

Files to Create
- /docs/validation/data-flow-analysis.md (data flow documentation)
- /tests/integration/data-integrity-baseline.test.ts (baseline tests)

Analyze complete data flow:
- Database → table components → UI display
- Form input → validation → database storage
- Any data transformations or formatting logic
- Required fields, constraints, and validation rules

## Per-Migration Validation (Add to Each Migration Task)

Add to every Task 2.x and 3.x:

**BEFORE IMPLEMENTATION:**
1. **Field Mapping Verification**: Compare new column/field definitions against documented baseline
2. **Test Data Setup**: Create test records with representative data for validation
3. **Transformation Logic Check**: Ensure any data processing logic is preserved

**AFTER IMPLEMENTATION:**
1. **CRUD Operation Testing**: Test Create, Read, Update, Delete with new components
2. **Data Consistency Check**: Verify same data displays identically in old vs new components
3. **Validation Rule Testing**: Confirm form validation rules match database constraints

## Post-Migration Validation (Add to Phase 5)

#### Task 5.5: End-to-End Data Integrity Testing Depends on [5.3]

**READ THESE BEFORE TASK**
- /docs/validation/database-field-mappings.md
- All migrated components

**Instructions**

Files to Create
- /tests/integration/comprehensive-data-integrity.test.ts

Comprehensive validation:
- Test all CRUD operations across all entities
- Verify data transformations work correctly
- Test edge cases and validation scenarios
- Confirm no database fields are orphaned

#### Task 5.6: Schema Compliance Verification Depends on [5.5]

**READ THESE BEFORE TASK**
- /scripts/validate-schema-mappings.js
- All new components

**Instructions**

Files to Create
- /reports/schema-compliance-report.md

Automated verification:
- Run schema validation script against all new components
- Verify Zod schemas match database constraints
- Test with production-like data volumes
- Generate compliance report for sign-off

## Critical Database Field Mapping Areas

### High-Risk Fields (Verify Carefully)
- **Primary Keys**: UUIDs must map correctly (id → id)
- **Foreign Keys**: Relationship fields (organization_id, contact_id, etc.)
- **Timestamps**: created_at, updated_at, deleted_at patterns
- **Business Logic Fields**: Custom validation, calculated fields, enum mappings

### Common Mapping Issues
- **Field Name Changes**: `org_name` vs `organization_name`
- **Data Type Mismatches**: String vs UUID, Date vs DateTime
- **Null Handling**: Required vs optional field mismatches
- **Enum Values**: Status codes, type classifications

## Validation Scripts

### Example Schema Validation Script
```javascript
// /scripts/validate-schema-mappings.js
const validateTableColumns = (tableName, newColumns, zodSchema) => {
  // Compare new column definitions against Zod schema
  // Verify all database fields are mapped
  // Check for orphaned or missing fields
  // Validate data types match
}

const validateFormFields = (entityType, formFields, zodSchema) => {
  // Ensure form fields map to database columns
  // Verify validation rules are preserved
  // Check required field configurations
}
```

## Risk Mitigation

### Before Any Deletion
- **Baseline Validation**: Document current working state
- **Test Data Creation**: Set up comprehensive test scenarios
- **Rollback Plan**: Ensure ability to revert changes

### During Migration
- **Incremental Testing**: Test each component migration individually
- **Data Consistency Checks**: Compare old vs new component behavior
- **Production Safeguards**: Use feature flags or parallel testing

### After Migration
- **Comprehensive Testing**: Full end-to-end validation
- **Performance Testing**: Ensure no performance regressions
- **User Acceptance Testing**: Verify business workflows still work

## Sign-off Requirements

Before marking any migration task complete:
✅ **Field Mapping Verified**: All database fields correctly mapped
✅ **CRUD Operations Tested**: Create, Read, Update, Delete all working
✅ **Data Transformations Preserved**: Any formatting/processing logic maintained
✅ **Validation Rules Intact**: Form validation matches database constraints
✅ **Test Coverage**: Automated tests cover data integrity scenarios

**No component should be deleted until these validations pass for its replacement.**