/**
 * Chart Type Definitions
 *
 * Comprehensive type definitions for chart components that eliminate the need for `any` types.
 * Provides type-safe interfaces for Recharts components, data transformations, and configurations.
 */

import type { ReactNode } from 'react'

/**
 * Base chart data interface
 */
export interface ChartDataPoint {
  name: string
  value: number
  label?: string
  color?: string
  count?: number // Alternative to value for count-based charts
}

/**
 * Time series data for temporal charts
 */
export interface TimeSeriesData {
  date: string
  week?: string
  month?: string
  count: number
  value?: number
  [key: string]: string | number | undefined
}

/**
 * Chart configuration for layout and sizing
 */
export interface ChartConfig {
  width?: number
  height?: number
  margin?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  responsive?: boolean
}

/**
 * Chart color scheme configuration
 */
export interface ChartColorConfig {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  error: string
  muted: string
  background: string
  foreground: string
  border: string
}

/**
 * Chart theme configuration
 */
export interface ChartTheme {
  colors: ChartColorConfig
  fontSize: {
    small: number
    medium: number
    large: number
  }
  spacing: {
    small: number
    medium: number
    large: number
  }
}

/**
 * Generic tooltip props for Recharts components
 */
export interface CustomTooltipProps<TData = ChartDataPoint> {
  active?: boolean
  payload?: Array<{
    payload: TData
    value: number
    name?: string
    dataKey?: string
    color?: string
    fill?: string
    stroke?: string
  }>
  label?: string
  labelFormatter?: (value: string | number, payload?: TData[]) => ReactNode
  formatter?: (value: number, name?: string, entry?: TData, index?: number) => ReactNode
  coordinate?: { x: number; y: number }
}

/**
 * Legend props for Recharts components
 */
export interface CustomLegendProps {
  payload?: Array<{
    value: string
    type?: string
    id?: string
    color?: string
    inactive?: boolean
  }>
  iconType?:
    | 'line'
    | 'square'
    | 'rect'
    | 'circle'
    | 'cross'
    | 'diamond'
    | 'star'
    | 'triangle'
    | 'wye'
  layout?: 'horizontal' | 'vertical'
  align?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

/**
 * Chart data transformation function types
 */
export type ChartDataTransformer<TInput, TOutput = ChartDataPoint> = (data: TInput[]) => TOutput[]

/**
 * Time-based data transformer
 */
export type TimeSeriesDataTransformer<T> = ChartDataTransformer<T, TimeSeriesData>

/**
 * Chart event handler types
 */
export interface ChartEventHandlers<TData = ChartDataPoint> {
  onMouseEnter?: (data: TData, index: number) => void
  onMouseLeave?: (data: TData, index: number) => void
  onClick?: (data: TData, index: number) => void
  onDoubleClick?: (data: TData, index: number) => void
}

/**
 * Chart loading state
 */
export interface ChartLoadingState {
  isLoading: boolean
  error?: string | null
  isEmpty?: boolean
  emptyMessage?: string
}

/**
 * Chart filter configuration
 */
export interface ChartFilterConfig {
  dateRange?: {
    start: Date
    end: Date
  }
  categories?: string[]
  status?: string[]
  customFilters?: Record<string, unknown>
}

/**
 * Interactive chart configuration
 */
export interface InteractiveChartConfig extends ChartConfig {
  enableZoom?: boolean
  enablePan?: boolean
  enableBrush?: boolean
  enableTooltip?: boolean
  enableLegend?: boolean
  enableGrid?: boolean
  enableAnimation?: boolean
  animationDuration?: number
}

/**
 * Chart axis configuration
 */
export interface ChartAxisConfig {
  dataKey: string
  label?: string
  domain?: [number, number] | ['dataMin' | 'dataMax', 'dataMin' | 'dataMax']
  tickCount?: number
  tickFormatter?: (value: number | string) => string
  allowDecimals?: boolean
  hide?: boolean
  orientation?: 'left' | 'right' | 'top' | 'bottom'
}

/**
 * Line chart specific configuration
 */
export interface LineChartConfig extends InteractiveChartConfig {
  strokeWidth?: number
  strokeDasharray?: string
  dot?: boolean | object
  activeDot?: boolean | object
  connectNulls?: boolean
}

/**
 * Bar chart specific configuration
 */
export interface BarChartConfig extends InteractiveChartConfig {
  barSize?: number
  maxBarSize?: number
  stackId?: string
  radius?: [number, number, number, number]
}

/**
 * Pie chart specific configuration
 */
export interface PieChartConfig extends InteractiveChartConfig {
  innerRadius?: number
  outerRadius?: number
  startAngle?: number
  endAngle?: number
  paddingAngle?: number
  labelLine?: boolean
  label?: boolean | ((entry: ChartDataPoint) => string)
}

/**
 * Dashboard chart data aggregation
 */
export interface DashboardChartData {
  opportunities: TimeSeriesData[]
  interactions: TimeSeriesData[]
  organizations: ChartDataPoint[]
  contacts: ChartDataPoint[]
  products: ChartDataPoint[]
}

/**
 * Chart component props base interface
 */
export interface BaseChartProps<TData = ChartDataPoint> {
  data: TData[]
  loading?: boolean
  error?: string | null
  config?: ChartConfig
  className?: string
  title?: string
  description?: string
  eventHandlers?: ChartEventHandlers<TData>
}

/**
 * Responsive chart container props
 */
export interface ResponsiveChartProps extends BaseChartProps {
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  aspectRatio?: number
  debounceMs?: number
}

/**
 * Chart export configuration
 */
export interface ChartExportConfig {
  format: 'png' | 'jpg' | 'svg' | 'pdf'
  filename?: string
  width?: number
  height?: number
  backgroundColor?: string
  quality?: number
}

/**
 * Chart state management
 */
export interface ChartState<TData = ChartDataPoint> {
  data: TData[]
  filteredData: TData[]
  loading: boolean
  error: string | null
  selectedItems: TData[]
  filters: ChartFilterConfig
  viewMode: 'chart' | 'table' | 'both'
}

/**
 * Chart reducer actions
 */
export type ChartAction<TData = ChartDataPoint> =
  | { type: 'SET_DATA'; payload: TData[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: ChartFilterConfig }
  | { type: 'SELECT_ITEMS'; payload: TData[] }
  | { type: 'SET_VIEW_MODE'; payload: 'chart' | 'table' | 'both' }
  | { type: 'RESET' }

/**
 * Chart hook return type
 */
export interface UseChartReturn<TData = ChartDataPoint> {
  state: ChartState<TData>
  actions: {
    setData: (data: TData[]) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    setFilters: (filters: ChartFilterConfig) => void
    selectItems: (items: TData[]) => void
    setViewMode: (mode: 'chart' | 'table' | 'both') => void
    reset: () => void
    exportChart: (config: ChartExportConfig) => Promise<void>
    refreshData: () => Promise<void>
  }
  computed: {
    hasData: boolean
    isEmpty: boolean
    isFiltered: boolean
    selectedCount: number
    totalCount: number
    filteredCount: number
  }
}

/**
 * Common chart data aggregation utilities
 */
export interface ChartDataAggregation {
  sum: (data: number[]) => number
  average: (data: number[]) => number
  median: (data: number[]) => number
  max: (data: number[]) => number
  min: (data: number[]) => number
  groupBy: <T>(data: T[], key: keyof T) => Record<string, T[]>
  groupByDate: <T extends { date: string }>(
    data: T[],
    period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ) => Record<string, T[]>
}

/**
 * Chart accessibility configuration
 */
export interface ChartAccessibilityConfig {
  ariaLabel?: string
  ariaDescribedBy?: string
  role?: string
  tabIndex?: number
  keyboardNavigation?: boolean
  highContrast?: boolean
  reducedMotion?: boolean
  alternativeText?: string
}

/**
 * Complete chart component interface
 */
export interface ChartComponentProps<TData = ChartDataPoint>
  extends BaseChartProps<TData>,
    ChartAccessibilityConfig {
  responsive?: boolean
  exportable?: boolean
  interactive?: boolean
  theme?: ChartTheme
  onExport?: (config: ChartExportConfig) => void
  onDataUpdate?: (data: TData[]) => void
  onSelectionChange?: (selectedItems: TData[]) => void
}
