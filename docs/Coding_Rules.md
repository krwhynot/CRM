# KitchenPantry CRM - 10 Essential Coding Rules

## 1. **KISS Principle (Keep It Simple, Stupid)**
Always apply the KISS principle: Keep It Simple, Stupid — favor clear, concise, and maintainable code over unnecessary complexity.  Keep components and logic minimal. When UI complexity increases, use shadcn/ui components instead of building from scratch — they are pre-styled, accessible, and follow consistent design patterns.
Example: Instead of custom-styling a button, use the Button component from shadcn and extend with Tailwind utilities if needed.

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
Break down UI into small composable units. When possible:
Use shadcn/ui primitives (e.g., Card, Badge, Avatar, Dialog, Tabs) for base structure.
Wrap them in CRM-specific components (PrincipalCard, EngagementBadge) for business logic.
This ensures UI consistency and accelerates development.

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
Implement consistent error handling across all layers. Use Supabase's error types, When displaying errors:

Use shadcn/ui Toast for transient messages.

Use Alert or Dialog for blocking errors that require acknowledgment.
This ensures all user-facing error feedback is visually consistent across CRM modules.


## 7. **Mobile-First Responsive Design**
Start mobile-first with Tailwind CSS utilities.
Use shadcn/ui components that are responsive out-of-the-box (e.g., Sheet for mobile menus, DropdownMenu for compact actions).
Always ensure tap areas meet accessibility standards (min. 44px).

## 8. **Optimistic UI Updates**
For confirmation feedback:
Use shadcn/ui Toast for success and failure messages after optimistic updates.
Use skeleton loaders (Skeleton component) from shadcn when waiting for data to revalidate.

## 9. **Relationship-Centric Data Modeling**
Always model data around relationships, not transactions. Focus on tracking engagement quality over quantity. Use junction tables for many-to-many relationships (opportunity_principals, opportunity_products) and include metadata like `created_at` for relationship timeline tracking. when visualizing relationships, leverage shadcn/ui data display components like Tabs, Accordion, or Table for clean, accessible views.

## 10. **Performance-First Database Queries**
Index all foreign keys and frequently queried fields (engagement_level, last_interaction_date, principal_id). For large lists, consider shadcn-compatible virtualized lists or paginated Table components for rendering efficiency.
Use `LIMIT` on all list queries, implement cursor-based pagination for large datasets, and always include `WHERE deleted_at IS NULL` for soft-deleted records.
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
- Type Safety: ESLint + TypeScript strict mode for rules 3, 6.
- UI Consistency: Use shadcn/ui as the first choice for new UI elements before creating custom ones.
- Database Performance: Proper indexing and soft-delete filtering for rule 10.
- Responsive Standards: Tailwind breakpoints + mobile-first testing for rule 7.
- Store Patterns: Continue using Pinia for optimistic updates (rule 8).
- Code Reviews: Ensure new UI uses shadcn/ui where applicable (rules 4, 6, 7, 8).