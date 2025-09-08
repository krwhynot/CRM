Perfect! Let's build a **Journey-Focused Design Principles Checklist** that's RLS and schema-aware. Think of this like a **restaurant's service flow checklist** — from greeting to payment, every step must maintain quality AND security.

## 📋 **CRM Design Principles Checklist v1.0**
*For: You + Claude Code | Focus: Consistency, RLS/Schema Compliance*

---

## 🎯 **Pre-Journey Setup** (Before Any Design Work)

### Schema Awareness Check
- [ ] Review current database schema in `docs/DATABASE_SCHEMA.md`
- [ ] Identify which entities this journey touches
- [ ] Note all required fields (NOT NULL constraints)
- [ ] List enum types that need dropdowns (priority_level, interaction_type, etc.)
- [ ] Map foreign key relationships for form dependencies

### RLS Context Verification
- [ ] Identify data ownership model (user_id, organization_id, created_by)
- [ ] Note which data is private vs shared (owner_user_id NULL = shared)
- [ ] List user roles that affect this journey (admin, sales_manager, viewer)
- [ ] Check soft-delete implications (deleted_at filtering)

---

## 🚀 **Journey Stage 1: Data Entry** (Creating New Records)

### Form Design Compliance
```checklist
□ Form matches exact database schema
  - All required fields marked with * (visual indicator)
  - Field types match DB types (UUID, text, enum, etc.)
  - Default values align with DB defaults
  
□ Validation mirrors database constraints
  - Yup schema matches DB constraints exactly
  - Check constraints reflected (e.g., probability 0-100)
  - Foreign key validations (organization must exist)
  
□ RLS-aware field visibility
  - Only show organizations user has access to
  - Filter dropdown options by RLS policies
  - Hide admin-only fields from regular users
```

### Mobile-First Form Layout
```checklist
□ Touch-optimized inputs
  - 44px minimum touch targets (2.75rem)
  - 16px minimum font size (prevents iOS zoom)
  - Adequate spacing between fields (min 8px)
  
□ Progressive disclosure
  - Core fields visible first
  - Optional fields in collapsible sections
  - Multi-step for complex forms (>6 fields)
```

### Error Handling Standards
```checklist
□ Schema-aware error messages
  - "Organization is required" (not "Please fill this field")
  - "Email must be unique" (constraint-specific)
  - Show field-level errors inline
  
□ RLS error handling
  - "You don't have permission to create in this organization"
  - Graceful fallback for filtered options
  - Clear messaging when no options available
```

---

## 🔄 **Journey Stage 2: Data Retrieval** (Viewing/Listing)

### Table/List Compliance
```checklist
□ Query reflects RLS policies
  - Include WHERE deleted_at IS NULL
  - Join only accessible related data
  - Respect organization boundaries
  
□ Schema-aware column display
  - Show human-readable enum values
  - Format dates consistently (created_at, updated_at)
  - Display relationships properly (organization.name not organization_id)
  
□ Performance considerations
  - Implement pagination (LIMIT/OFFSET)
  - Use indexes from schema (foreign keys, commonly filtered fields)
  - Lazy load related data when needed
```

### Mobile Table Patterns
```checklist
□ Responsive table design
  - Priority columns visible on mobile
  - Horizontal scroll for secondary data
  - Expandable rows for details
  
□ Touch interactions
  - Swipe actions for common operations
  - Long-press for context menu
  - Pull-to-refresh pattern
```

---

## ✏️ **Journey Stage 3: Data Modification** (Editing)

### Update Form Compliance
```checklist
□ Respect field mutability
  - Disable primary keys (id)
  - Readonly system fields (created_at, created_by)
  - Editable user fields only
  
□ RLS update validation
  - Check user can edit this record
  - Validate organization changes allowed
  - Prevent privilege escalation
  
□ Optimistic updates with rollback
  - Show pending state during save
  - Revert on RLS rejection
  - Clear error messaging
```

### Audit Trail Awareness
```checklist
□ Track modifications
  - Update updated_at timestamp
  - Set updated_by to current user
  - Log significant changes if needed
  
□ Preserve data integrity
  - Never delete, use soft-delete (deleted_at)
  - Maintain referential integrity
  - Keep historical relationships
```

---

## 🗑️ **Journey Stage 4: Data Removal** (Soft Delete)

### Deletion Compliance
```checklist
□ Implement soft-delete pattern
  - Set deleted_at = NOW()
  - Never actually DELETE records
  - Update UI immediately
  
□ Handle cascading relationships
  - Check for dependent records
  - Warn about impacts
  - Offer to archive related data
  
□ RLS deletion checks
  - Verify user can delete
  - Admin-only hard delete (if exists)
  - Respect organization boundaries
```

---

## 🔍 **Journey Stage 5: Search & Filter**

### Schema-Aware Search
```checklist
□ Search appropriate fields
  - Text search on text fields only
  - Exact match for enums
  - Range queries for dates/numbers
  
□ RLS-filtered results
  - Pre-filter by user access
  - Don't expose count of hidden records
  - Maintain performance with indexes
```

---

## 🎨 **Cross-Journey Consistency Rules**

### Component Reuse Checklist
```checklist
□ Use existing shadcn/ui components
  - Button, Card, Input, Select (ALLOWED list)
  - Avoid Badge, Avatar, Separator (BANNED list)
  - Document if using CONDITIONAL components
  
□ Consistent patterns
  - Same loading states everywhere
  - Unified error display
  - Standard success feedback (Toast)
```

### Visual Hierarchy
```checklist
□ Typography consistency
  - H1: Page titles (text-2xl on mobile, text-3xl on desktop)
  - H2: Section headers (text-xl on mobile, text-2xl on desktop)
  - Body: min 16px for readability
  
□ Spacing system
  - 4px base unit (p-1 in Tailwind)
  - Consistent card padding (p-4 mobile, p-6 desktop)
  - Predictable margins between sections
```

### State Management
```checklist
□ Loading states
  - Skeleton screens for initial load
  - Inline spinners for actions
  - Disabled state during processing
  
□ Empty states
  - Clear message when no data
  - Action to create first item
  - Helpful illustration if appropriate
  
□ Error recovery
  - Retry mechanisms for failures
  - Offline mode indication
  - Data preservation on error
```

---

## 🚦 **Pre-Launch Validation**

### Technical Compliance
```checklist
□ TypeScript strict mode (no 'any' types)
□ All forms use React Hook Form + Yup
□ Supabase client properly configured
□ RLS policies tested with different user roles
```

### Performance Metrics
```checklist
□ Page load < 3 seconds on 3G
□ Time to Interactive < 5 seconds
□ Forms respond within 100ms
□ Search results within 500ms
```

### Accessibility Audit
```checklist
□ WCAG 2.1 AA compliance
□ Keyboard navigation works
□ Screen reader compatible
□ Color contrast ratios met (4.5:1 minimum)
```

---

## 📝 **Quick Reference for Claude Code**

When implementing any feature, verify:

1. **Schema Match**: Does the UI match the exact database structure?
2. **RLS Compliance**: Are we respecting data access boundaries?
3. **Mobile First**: Does it work perfectly on iPad?
4. **Consistency**: Are we using established patterns from other journeys?
5. **Error Handling**: Do we handle both validation AND permission errors?

### Example Prompt for Claude Code:
```
"Implement a contact creation form following our design checklist:
- Schema: contacts table (first_name, last_name required)
- RLS: Filter organizations by user access
- Mobile: 44px touch targets, 16px fonts
- Pattern: Use OrganizationForm.tsx as reference"
```

---

## 🔄 **Living Document Notes**

This checklist should evolve as you discover new patterns. When you find a new edge case or pattern:

1. Add it to the relevant journey stage
2. Note which component exemplifies it best
3. Update the version number
4. Share with Claude Code for consistency

**Current Version**: 1.0  
**Last Updated**: Today  
**Next Review**: After implementing 2-3 major features
