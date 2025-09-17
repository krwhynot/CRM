import { useMemo } from 'react'
import type { DataTableProps } from '@/components/data-table/data-table'
import type { ResponsiveFilterWrapperProps } from '@/components/data-table/filters/ResponsiveFilterWrapper'
import type { EntityDataStateReturn } from './useEntityDataState'

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

  // Data state integration
  useEntityDataState?: boolean
  dataStateConfig?: {
    enableRetry?: boolean
    errorMessage?: string
    loadingMessage?: string
    treatEmptyAsError?: boolean
  }

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

  // Helper function to integrate with entity data state
  withEntityDataState: (
    entityDataState: EntityDataStateReturn<TData>
  ) => Partial<DataTableProps<TData, TValue>>
}

/**
 * Hook that provides consistent DataTable configuration across all entity types.
 * Returns standardized props object that can be spread into DataTable components.
 * Now includes integration with useEntityDataState for unified data state management.
 *
 * @example
 * ```tsx
 * // Basic usage with manual data and loading states
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
 *     loading={isLoading}
 *     {...dataTableProps}
 *     // Override specific props as needed
 *     onSelectionChange={handleSelectionChange}
 *   />
 * )
 * ```
 *
 * @example
 * ```tsx
 * // Advanced usage with useEntityDataState integration
 * const organizationsQuery = useOrganizations(filters)
 * const dataState = useEntityDataState(organizationsQuery, {
 *   enableRetry: true,
 *   errorMessage: 'Failed to load organizations'
 * })
 * const { withEntityDataState } = useStandardDataTable({
 *   useResponsiveFilters: true,
 *   responsiveFilterTitle: "Filter Organizations"
 * })
 *
 * return (
 *   <DataTable
 *     columns={columns}
 *     {...withEntityDataState(dataState)}
 *     // Additional DataTable props...
 *     onSelectionChange={handleSelectionChange}
 *   />
 * )
 * ```
 *
 * @example
 * ```tsx
 * // Complete integration pattern (recommended)
 * const contactsQuery = useContacts(filters)
 * const dataState = useEntityDataState(contactsQuery, {
 *   enableRetry: true,
 *   errorMessage: 'Failed to load contacts',
 *   treatEmptyAsError: false
 * })
 * const { withEntityDataState } = useStandardDataTable({
 *   useResponsiveFilters: true,
 *   responsiveFilterTitle: "Contact Filters",
 *   selectable: true,
 *   searchPlaceholder: "Search contacts..."
 * })
 *
 * // Error handling can be done at component level or let DataTable handle it
 * // when error state support is added to DataTable
 * return (
 *   <DataTable
 *     columns={contactColumns}
 *     {...withEntityDataState(dataState)}
 *     onSelectionChange={handleSelectionChange}
 *     onRowClick={handleRowClick}
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
  const config = useMemo(
    (): Required<StandardDataTableConfig<TData>> => ({
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

      // Data state integration defaults
      useEntityDataState: false,
      dataStateConfig: {
        enableRetry: true,
        errorMessage: undefined,
        loadingMessage: undefined,
        treatEmptyAsError: false,
      },

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

      // Override with user config, handling dataStateConfig merge properly
      ...userConfig,
    }),
    [userConfig]
  )

  // Handle dataStateConfig merge separately to avoid duplicate properties
  const finalConfig = useMemo(
    () => ({
      ...config,
      dataStateConfig: {
        enableRetry: true,
        errorMessage: undefined,
        loadingMessage: undefined,
        treatEmptyAsError: false,
        ...userConfig.dataStateConfig,
      },
    }),
    [config, userConfig.dataStateConfig]
  )

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
    return userConfig.searchPlaceholder || finalConfig.searchPlaceholder
  }, [finalConfig.searchPlaceholder, userConfig.searchPlaceholder])

  // Use provided search key or default
  const searchKey = useMemo(() => {
    return userConfig.searchKey || finalConfig.searchKey
  }, [finalConfig.searchKey, userConfig.searchKey])

  // Create standardized DataTable props
  const dataTableProps = useMemo(
    (): Partial<DataTableProps<TData, TValue>> => ({
      // Core configuration
      enablePagination: finalConfig.enablePagination,
      enableSorting: finalConfig.enableSorting,
      enableColumnFilters: finalConfig.enableColumnFilters,
      enableToolbar: finalConfig.enableToolbar,

      // Pagination
      pageSize: finalConfig.pageSize,

      // Selection and expansion
      selectable: finalConfig.selectable,
      expandable: finalConfig.expandable,

      // ResponsiveFilterWrapper integration
      useResponsiveFilters: finalConfig.useResponsiveFilters,
      responsiveFilterTitle: finalConfig.responsiveFilterTitle,
      responsiveFilterDescription: finalConfig.responsiveFilterDescription,
      responsiveFilterLayoutModeOverride: finalConfig.responsiveFilterLayoutModeOverride,
      responsiveFilterCustomTrigger: finalConfig.responsiveFilterCustomTrigger,
      responsiveFilterForceInline: finalConfig.responsiveFilterForceInline,
      responsiveFilterLazyRender: finalConfig.responsiveFilterLazyRender,
      responsiveFilterWrapperClassName: finalConfig.responsiveFilterWrapperClassName,
      responsiveFilterTriggerClassName: finalConfig.responsiveFilterTriggerClassName,
      responsiveFilterSheetProps: finalConfig.responsiveFilterSheetProps,
      responsiveFilterSheetContentProps: finalConfig.responsiveFilterSheetContentProps,
      onResponsiveFilterLayoutModeChange: finalConfig.onResponsiveFilterLayoutModeChange,
      onResponsiveFilterOpenChange: finalConfig.onResponsiveFilterOpenChange,

      // Display options
      stickyHeader: finalConfig.stickyHeader,
      striped: finalConfig.striped,

      // Toolbar configuration
      searchPlaceholder,
      searchKey,

      // Standard row key function for entity data
      rowKey: (row: TData) => {
        // Try to get ID from common entity properties
        const entityRow = row as any
        return entityRow.id || entityRow._id || JSON.stringify(row)
      },
    }),
    [finalConfig, searchPlaceholder, searchKey]
  )

  // Helper function to integrate with entity data state
  const withEntityDataState = useMemo(() => {
    return (
      entityDataState: EntityDataStateReturn<TData>
    ): Partial<DataTableProps<TData, TValue>> => {
      // Merge standard DataTable props with entity data state
      return {
        ...dataTableProps,
        // Override with data state props directly from enhancedDataTableStateProps
        ...entityDataState.enhancedDataTableStateProps,
        // Future: When DataTable gets error state support, uncomment these:
        // isError: entityDataState.isError,
        // error: entityDataState.error,
        // onRetry: entityDataState.onRetry,
      }
    }
  }, [dataTableProps])

  return {
    dataTableProps,
    pageSizeOptions: finalPageSizeOptions,
    config: finalConfig,
    withEntityDataState,
  }
}
