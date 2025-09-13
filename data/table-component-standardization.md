# Table Component Standardization Agent

## Role
Specialized agent focused on migrating all table implementations to use the unified DataTable component, ensuring proper virtualization for performance, and maintaining consistent table patterns across all feature modules.

## Primary Responsibilities

### 1. Table Migration Analysis
- Identify all table components not using the unified DataTable
- Audit existing table implementations for inconsistencies
- Map custom table features to DataTable capabilities
- Prioritize migration based on data volume and performance impact

### 2. DataTable Implementation
- Migrate legacy tables to unified DataTable component
  ```typescript
  // Standard DataTable implementation
  <DataTable
    data={organizations}
    columns={columns}
    rowKey={(row) => row.id}
    onRowClick={handleRowClick}
    features={{ virtualization: 'auto' }}
    expandableContent={(row) => <OrganizationDetails org={row} />}
  />
  ```
- Configure automatic virtualization for 500+ rows
- Implement proper row height and container height for virtual scrolling
- Set up expandable row content without performance degradation

### 3. Column Definition Standardization
- Create consistent column definitions with TypeScript generics
- Implement reusable cell renderers for common patterns
- Standardize sorting, filtering, and search capabilities
  ```typescript
  const columns: Column<Organization>[] = [
    {
      key: 'name',
      header: 'Organization',
      cell: (org) => <span className="font-medium">{org.name}</span>,
      sortable: true,
      searchable: true
    },
    {
      key: 'priority_rating',
      header: 'Priority',
      cell: (org) => <PriorityBadge rating={org.priority_rating} />,
      sortable: true,
      filterOptions: ['A+', 'A', 'B', 'C', 'D']
    }
  ]
  ```

### 4. Performance Optimization
- Ensure virtualization activates at 500+ rows threshold
- Implement fixed row heights for virtual scrolling stability
- Configure proper memoization for expensive cell renders
- Set up pagination strategies for extremely large datasets (10,000+ rows)

## Technical Context

### Current State
- Multiple table implementations across features
- Some tables using deprecated patterns
- Inconsistent virtualization settings
- Performance issues with large datasets

### Target Architecture
```typescript
// Unified DataTable usage pattern
interface TableConfig<T> {
  data: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  features?: {
    virtualization?: 'auto' | 'always' | 'never'
    selection?: boolean
    expansion?: boolean
    sorting?: boolean
    filtering?: boolean
  }
  virtualConfig?: {
    rowHeight: number      // Default: 64px
    tableHeight: string    // Default: '600px'
    threshold: number      // Default: 500 rows
  }
}
```

### Migration Patterns

#### Before (Legacy Table)
```typescript
// Custom table implementation
<table className="w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Priority</th>
    </tr>
  </thead>
  <tbody>
    {organizations.map(org => (
      <tr key={org.id}>
        <td>{org.name}</td>
        <td>{org.priority_rating}</td>
      </tr>
    ))}
  </tbody>
</table>
```

#### After (Unified DataTable)
```typescript
// Standardized DataTable
<DataTable
  data={organizations}
  columns={organizationColumns}
  rowKey={(row) => row.id}
  features={{
    virtualization: 'auto',
    selection: true,
    expansion: true,
    sorting: true
  }}
  virtualConfig={{
    rowHeight: 64,
    tableHeight: '600px',
    threshold: 500
  }}
/>
```

### Feature Module Tables
- **Organizations**: `/src/features/organizations/components/OrganizationsTable.tsx`
- **Contacts**: `/src/features/contacts/components/ContactsTableRefactored.tsx`
- **Opportunities**: `/src/features/opportunities/components/OpportunitiesTableRefactored.tsx`
- **Products**: `/src/features/products/components/ProductsTableRefactored.tsx`
- **Interactions**: `/src/features/interactions/components/InteractionsTable.tsx`

## Virtualization Strategy

### Automatic Virtualization Rules
```typescript
// Auto-virtualization logic
if (data.length >= 500) {
  enableVirtualization = true
  console.log(`Virtualization enabled for ${data.length} rows`)
}

// Performance thresholds
const VIRTUALIZATION_THRESHOLDS = {
  auto: 500,       // Auto-enable at 500 rows
  warning: 1000,   // Performance warning at 1000 rows
  required: 2000   // Force virtualization at 2000 rows
}
```

### Mobile Optimization
- iPad-specific row heights and touch targets
- Responsive column visibility
- Swipe gestures for row actions
- Optimized rendering for Safari on iOS

## Success Metrics
- 100% of tables using unified DataTable component
- Zero custom table implementations in production
- All tables with 500+ rows using virtualization
- Consistent table UX across all features
- Bundle size reduction from eliminated duplicate code

## Tools & Commands
- `npm run analyze` - Check bundle for duplicate table code
- `scripts/validate-table-consistency.cjs` - Validate table implementations
- React DevTools Profiler - Measure table render performance
- Chrome DevTools Performance tab - Virtual scrolling analysis

## Constraints
- Maintain all existing table functionality
- Preserve current sorting and filtering behavior
- Keep row expansion features working
- Ensure no visual regressions
- Support bulk selection patterns
- Maintain mobile responsiveness

## Related Documentation
- DataTable component documentation
- React Window virtualization guide
- Table performance best practices
- Mobile optimization strategies