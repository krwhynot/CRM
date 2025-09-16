import { useMemo } from 'react'
import type { DataTableProps } from '@/components/data-table/data-table'
import type { ResponsiveFilterWrapperProps } from '@/components/data-table/filters/ResponsiveFilterWrapper'

export interface StandardDataTableConfig<TData> {
  // Core configuration
  enablePagination?: boolean
  enableSorting?: boolean
  enableColumnFilters?: boolean
  enableToolbar?: boolean

  // Pagination settings
  pageSize?: number
  pageSizeOptions?: number[]

  // Selection and expansion
  selectable?: boolean
  expandable?: boolean

  // ResponsiveFilterWrapper integration
  useResponsiveFilters?: boolean
  responsiveFilterTitle?: string
  responsiveFilterDescription?: string
  responsiveFilterLayoutModeOverride?: ResponsiveFilterWrapperProps['layoutModeOverride']
  responsiveFilterCustomTrigger?: ResponsiveFilterWrapperProps['customTrigger']
  responsiveFilterForceInline?: boolean
  responsiveFilterLazyRender?: boolean
  responsiveFilterWrapperClassName?: string
  responsiveFilterTriggerClassName?: string
  responsiveFilterSheetProps?: ResponsiveFilterWrapperProps['sheetProps']
  responsiveFilterSheetContentProps?: ResponsiveFilterWrapperProps['sheetContentProps']
  onResponsiveFilterLayoutModeChange?: ResponsiveFilterWrapperProps['onLayoutModeChange']
  onResponsiveFilterOpenChange?: ResponsiveFilterWrapperProps['onOpenChange']

  // Display options
  stickyHeader?: boolean
  striped?: boolean

  // Toolbar configuration
  searchPlaceholder?: string
  searchKey?: string
}

export interface StandardDataTableReturn<TData, TValue> {
  // Props that can be spread into DataTable
  dataTableProps: Partial<DataTableProps<TData, TValue>>

  // Standard pagination options
  pageSizeOptions: number[]

  // Standard configuration values
  config: Required<StandardDataTableConfig<TData>>
}

/**
 * Hook that provides consistent DataTable configuration across all entity types.
 * Returns standardized props object that can be spread into DataTable components.
 *
 * @example
 * ```tsx
 * const { dataTableProps } = useStandardDataTable({
 *   useResponsiveFilters: true,
 *   responsiveFilterTitle: "Filter Organizations",
 *   selectable: true,
 *   expandable: true,
 *   searchPlaceholder: "Search organizations..."
 * })
 *
 * return (
 *   <DataTable
 *     data={organizations}
 *     columns={columns}
 *     {...dataTableProps}
 *     // Override specific props as needed
 *     onSelectionChange={handleSelectionChange}
 *   />
 * )
 * ```
 */
export function useStandardDataTable<TData, TValue = unknown>(
  userConfig: StandardDataTableConfig<TData> = {}
): StandardDataTableReturn<TData, TValue> {

  // Standard page size options (10, 20, 30, 40, 50)
  const standardPageSizeOptions = [10, 20, 30, 40, 50]

  // Merge user config with defaults
  const config = useMemo((): Required<StandardDataTableConfig<TData>> => ({
    // Core configuration defaults
    enablePagination: true,
    enableSorting: true,
    enableColumnFilters: true,
    enableToolbar: true,

    // Pagination defaults
    pageSize: 20,
    pageSizeOptions: standardPageSizeOptions,

    // Selection and expansion defaults
    selectable: true,
    expandable: true,

    // ResponsiveFilterWrapper defaults
    useResponsiveFilters: false,
    responsiveFilterTitle: undefined,
    responsiveFilterDescription: undefined,
    responsiveFilterLayoutModeOverride: undefined,
    responsiveFilterCustomTrigger: undefined,
    responsiveFilterForceInline: false,
    responsiveFilterLazyRender: true,
    responsiveFilterWrapperClassName: undefined,
    responsiveFilterTriggerClassName: undefined,
    responsiveFilterSheetProps: undefined,
    responsiveFilterSheetContentProps: undefined,
    onResponsiveFilterLayoutModeChange: undefined,
    onResponsiveFilterOpenChange: undefined,

    // Display defaults
    stickyHeader: false,
    striped: false,

    // Toolbar defaults
    searchPlaceholder: 'Search...',
    searchKey: 'name',

    // Override with user config
    ...userConfig,
  }), [userConfig])

  // Calculate final pageSizeOptions separately to avoid object property conflicts
  const finalPageSizeOptions = useMemo(() => {
    if (userConfig.pageSizeOptions) {
      return userConfig.pageSizeOptions
    }

    // Ensure pageSizeOptions includes user's pageSize if provided
    if (userConfig.pageSize && !standardPageSizeOptions.includes(userConfig.pageSize)) {
      return [...standardPageSizeOptions, userConfig.pageSize].sort((a, b) => a - b)
    }

    return standardPageSizeOptions
  }, [userConfig.pageSizeOptions, userConfig.pageSize])

  // Use provided search placeholder or default
  const searchPlaceholder = useMemo(() => {
    return userConfig.searchPlaceholder || config.searchPlaceholder
  }, [config.searchPlaceholder, userConfig.searchPlaceholder])

  // Use provided search key or default
  const searchKey = useMemo(() => {
    return userConfig.searchKey || config.searchKey
  }, [config.searchKey, userConfig.searchKey])

  // Create standardized DataTable props
  const dataTableProps = useMemo((): Partial<DataTableProps<TData, TValue>> => ({
    // Core configuration
    enablePagination: config.enablePagination,
    enableSorting: config.enableSorting,
    enableColumnFilters: config.enableColumnFilters,
    enableToolbar: config.enableToolbar,

    // Pagination
    pageSize: config.pageSize,

    // Selection and expansion
    selectable: config.selectable,
    expandable: config.expandable,

    // ResponsiveFilterWrapper integration
    useResponsiveFilters: config.useResponsiveFilters,
    responsiveFilterTitle: config.responsiveFilterTitle,
    responsiveFilterDescription: config.responsiveFilterDescription,
    responsiveFilterLayoutModeOverride: config.responsiveFilterLayoutModeOverride,
    responsiveFilterCustomTrigger: config.responsiveFilterCustomTrigger,
    responsiveFilterForceInline: config.responsiveFilterForceInline,
    responsiveFilterLazyRender: config.responsiveFilterLazyRender,
    responsiveFilterWrapperClassName: config.responsiveFilterWrapperClassName,
    responsiveFilterTriggerClassName: config.responsiveFilterTriggerClassName,
    responsiveFilterSheetProps: config.responsiveFilterSheetProps,
    responsiveFilterSheetContentProps: config.responsiveFilterSheetContentProps,
    onResponsiveFilterLayoutModeChange: config.onResponsiveFilterLayoutModeChange,
    onResponsiveFilterOpenChange: config.onResponsiveFilterOpenChange,

    // Display options
    stickyHeader: config.stickyHeader,
    striped: config.striped,

    // Toolbar configuration
    searchPlaceholder,
    searchKey,

    // Standard row key function for entity data
    rowKey: (row: TData) => {
      // Try to get ID from common entity properties
      const entityRow = row as any
      return entityRow.id || entityRow._id || JSON.stringify(row)
    }
  }), [config, searchPlaceholder, searchKey])

  return {
    dataTableProps,
    pageSizeOptions: finalPageSizeOptions,
    config
  }
}