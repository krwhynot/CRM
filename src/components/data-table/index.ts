// Data Table Component Exports
// OpenStatus-pattern data table implementation with integrated filtering,
// expandable rows, and entity-specific configurations

// Main components
export { DataTable } from './data-table'
export { DataTableToolbar, DataTableViewOptions, DataTableFilterBadge, DataTableFacetedFilter } from './toolbar'
export { DataTablePagination, DataTablePaginationSimple, DataTablePageInput, DataTableRowInfo } from './pagination'

// Column helpers and utilities
export {
  createSortableHeader,
  createSelectColumn,
  createExpandColumn,
  createActionsColumn,
  createStatusColumn,
  createDateColumn,
  createCurrencyColumn,
  createTextColumn,
  type ColumnDef,
} from './columns'

// Entity-specific column definitions
export { createOrganizationColumns, organizationColumns } from './columns/organizations'
export { createContactColumns, contactColumns } from './columns/contacts'
export { createOpportunityColumns, opportunityColumns } from './columns/opportunities'
export { createProductColumns, productColumns } from './columns/products'

// Expansion components
export { OrganizationExpansion } from './expansion/OrganizationExpansion'

// Filter components
export { EntityFilters, TimeRangeFilter, QuickFilters } from './filters'
export type { EntityFilterState, FilterOption, TimeRangeType, QuickFilterValue, QuickFilterOption } from './filters'