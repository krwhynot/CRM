# KitchenPantry CRM - 10 Essential Coding Rules

## 1. **KISS Principle (Keep It Simple, Stupid)**
Always apply the KISS principle: Keep It Simple, Stupid — favor clear, concise, and maintainable code over unnecessary complexity. If a feature can be implemented in 10 lines instead of 50, choose the simpler approach.

## 2. **Single Responsibility SQL Queries**
Each SQL query should have one clear purpose. Avoid complex joins spanning more than 3 tables in a single query. For principal-centric reporting, use CTEs (Common Table Expressions) to break complex logic into readable steps.
```sql
-- Good: Clear, single purpose
WITH principal_activity AS (
  SELECT principal_id, COUNT(*) as interaction_count
  FROM interactions 
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY principal_id
)
SELECT * FROM principal_activity WHERE interaction_count > 5;
```

## 3. **TypeScript-First Development**
Never use `any` type. Always define explicit interfaces for all data structures, especially CRM entities (Organization, Contact, Opportunity, Interaction). Create reusable type definitions in dedicated files.
```typescript
// Good: Explicit typing
interface Principal {
  id: string;
  name: string;
  engagement_level: 'High' | 'Medium' | 'Low' | 'Inactive';
  last_interaction_date: Date;
}
```

## 4. **Component Composition Over Inheritance**
Build UI components using composition patterns. Create small, reusable components (EngagementBadge, PrincipalCard, ActivityTimeline) that can be combined to build complex views. Each component should handle one specific UI concern.

## 5. **Defensive Database Design**
Always use UUIDs for primary keys, implement soft deletes with `deleted_at` timestamps, and include `created_at`/`updated_at` on every table. Never cascade deletes on relationship data — preserve data integrity for CRM historical tracking.
```sql
-- Good: Defensive design
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 6. **Consistent Error Handling**
Implement consistent error handling across all layers. Use Supabase's error types, create custom error classes for business logic, and always provide meaningful error messages to Sales Managers. Never fail silently.
```typescript
// Good: Consistent error handling
try {
  const result = await supabase.from('opportunities').insert(data);
  if (result.error) throw new CRMError('Failed to create opportunity', result.error);
} catch (error) {
  logger.error('Opportunity creation failed', { error, data });
  throw error;
}
```

## 7. **Mobile-First Responsive Design**
Design every UI component mobile-first using Tailwind CSS. Use responsive breakpoints (sm:, md:, lg:) consistently. Ensure touch targets are minimum 44px, and all forms work perfectly on mobile devices since Sales Managers are often on the go.

## 8. **Optimistic UI Updates**
Implement optimistic updates for all CRUD operations. Update the UI immediately, then sync with the database. If the operation fails, revert the UI state and show a clear error message. This keeps the interface feeling fast and responsive.
```typescript
// Good: Optimistic update pattern
const updateEngagementLevel = async (principalId: string, level: EngagementLevel) => {
  // Update UI immediately
  updatePrincipalInStore(principalId, { engagement_level: level });
  
  try {
    await supabase.from('principals').update({ engagement_level: level }).eq('id', principalId);
  } catch (error) {
    // Revert on failure
    revertPrincipalInStore(principalId);
    showErrorMessage('Failed to update engagement level');
  }
};
```

## 9. **Relationship-Centric Data Modeling**
Always model data around relationships, not transactions. Focus on tracking engagement quality over quantity. Use junction tables for many-to-many relationships (opportunity_principals, opportunity_products) and include metadata like `created_at` for relationship timeline tracking.

## 10. **Performance-First Database Queries**
Index all foreign keys and frequently queried fields (engagement_level, last_interaction_date, principal_id). Use `LIMIT` on all list queries, implement cursor-based pagination for large datasets, and always include `WHERE deleted_at IS NULL` for soft-deleted records.
```sql
-- Good: Performance-optimized query
SELECT p.*, COUNT(i.id) as interaction_count
FROM principals p
LEFT JOIN interactions i ON p.id = i.principal_id 
  AND i.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND i.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id
ORDER BY p.last_interaction_date DESC
LIMIT 20;
```

---

## 🎯 **Rule Enforcement Strategy**
- Use ESLint and TypeScript strict mode to enforce rules 3, 6
- Implement database migrations with proper indexing for rule 10
- Code review checklist should verify rules 1, 2, 4, 9
- Use Tailwind CSS utilities to enforce rule 7
- Implement Pinia store patterns for rule 8