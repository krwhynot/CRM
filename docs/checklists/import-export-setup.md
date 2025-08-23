## CSV Import Rollout Plan: MVP to Advanced

### **Phase 0: Pre-Launch Fixes** (2-3 days)
*Critical fixes needed before ANY import functionality*

```typescript
// Must have before launch:
- Add missing DB columns: external_id, import_notes to organizations
- Fix existing validation schemas
- Basic error boundaries in UI
```

---

### **Phase 1: Basic Working Import** (3-4 days)
*Get something working in production ASAP*

**Features:**
- Single entity import (Organizations only)
- Hard-coded field mappings
- Simple duplicate check (skip if name exists)
- Basic validation (required fields only)
- Success/fail count display

**Implementation:**
```typescript
// Simplified approach - no transactions, no batching
async function basicImport(csvRows) {
  const results = { success: 0, failed: 0, skipped: 0 };
  
  for (const row of csvRows) {
    if (await isDuplicate(row.name)) {
      results.skipped++;
      continue;
    }
    
    try {
      await supabase.from('organizations').insert(mapRow(row));
      results.success++;
    } catch {
      results.failed++;
    }
  }
  return results;
}
```

**User sees:** Upload CSV → Preview first 10 rows → Import → "Created 75 orgs, skipped 3 duplicates"

---

### **Phase 2: Add Contact Import** (3-4 days)
*Two entities from one CSV*

**New Features:**
- Parse attendee columns → create contacts
- Link contacts to organizations
- Handle missing attendee data gracefully
- Simple name splitting (first space = divider)

**Implementation:**
```typescript
// Still no transactions, but now dual-entity
const org = await createOrganization(row);
if (row['Attendee Name']) {
  await createContact({
    ...parseAttendee(row),
    organization_id: org.id
  });
}
```

**User sees:** "Created 75 organizations and 62 contacts"

---

### **Phase 3: Improved Reliability** (1 week)
*Add safety without complexity*

**New Features:**
- Batch processing (100 rows at a time)
- Simple progress bar
- Basic email/phone validation
- Download failed rows as CSV
- Application-level rollback on major failures

**Implementation:**
```typescript
// Process in batches with rollback capability
const createdIds = [];
try {
  for (const batch of chunks(rows, 100)) {
    const results = await processBatch(batch);
    createdIds.push(...results);
    updateProgress(processed / total);
  }
} catch (error) {
  await rollbackCreatedRecords(createdIds);
}
```

**User sees:** Progress bar, validation warnings, retry failed rows option

---

### **Phase 4: Smart Field Mapping** (1 week)
*Better UX for field matching*

**New Features:**
- Auto-detect common field patterns
- Confidence scoring for matches
- Visual mapping interface
- Remember user's mapping preferences
- Support custom field mappings

**Implementation:**
```typescript
const smartMap = {
  'Customer Name': { field: 'name', confidence: 95 },
  'Address': { field: 'address_line_1', confidence: 85 },
  'Booth Name': { field: 'import_notes', confidence: 40 }
};
```

**User sees:** Drag-and-drop mapping UI with confidence badges

---

### **Phase 5: Advanced Duplicate Handling** (1 week)
*Multiple strategies for existing data*

**New Features:**
- Three duplicate strategies (skip/update/create new)
- Check duplicates by multiple fields
- Show duplicate preview before import
- Merge capability for duplicates

**User sees:** "Found 3 duplicates" → Choose action → Preview changes

---

### **Phase 6: Database Transactions** (1 week)
*True ACID compliance*

**New Features:**
- Supabase RPC function for atomic imports
- All-or-nothing import guarantee
- Detailed transaction logs
- Automatic retry for transient failures

```sql
CREATE FUNCTION import_with_transaction(data JSONB)
RETURNS JSONB
AS $$ 
BEGIN
  -- True transaction safety
  -- Complex error handling
  -- Detailed result reporting
END $$;
```

---

### **Phase 7: Contact Deduplication** (4-5 days)
*Smart contact management*

**New Features:**
- Check existing contacts by email
- Link existing contacts to new orgs
- Contact merge suggestions
- Update existing contact info

---

### **Phase 8: Performance & Scale** (1 week)
*Handle massive imports*

**New Features:**
- Stream large files (100MB+)
- Parallel processing
- Background job queue
- Real-time metrics (rows/sec)
- Memory optimization

---

### **Phase 9: Enterprise Features** (2 weeks)
*Advanced capabilities*

**New Features:**
- Import templates library
- Field transformation rules
- Data quality scoring
- Import scheduling
- Webhook notifications
- Audit trail with rollback history
- Multi-file imports
- API endpoint for automated imports

---

## Decision Framework

**Launch with Phase 1-2 if:**
- Need to ship this week
- Users are technical
- Import volumes < 1000 rows
- Can tolerate some manual cleanup

**Wait for Phase 3-4 if:**
- Users are non-technical
- Data quality is poor
- Import is business-critical
- Need audit trail

**Consider Phase 5+ when:**
- Have real user feedback
- See actual usage patterns
- Specific advanced needs arise

## Time & Resource Reality

| Phase | Dev Time | Complexity | User Value | Risk |
|-------|----------|------------|------------|------|
| 1 | 3 days | Low | High | Low |
| 2 | 3 days | Low | High | Low |
| 3 | 5 days | Medium | High | Low |
| 4 | 5 days | Medium | Medium | Medium |
| 5 | 5 days | Medium | Medium | Medium |
| 6 | 5 days | High | Low | High |
| 7-9 | 3+ weeks | High | Variable | High |

**Recommendation:** Ship Phase 1-2 immediately (1 week total), gather feedback, then selectively implement Phase 3-5 based on actual user needs. Phases 6-9 should only be built if there's clear demand.

The biggest risk is spending 3+ weeks building features users don't need. Start simple, iterate based on reality.