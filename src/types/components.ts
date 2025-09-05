import type React from 'react'
import type { LucideIcon } from 'lucide-react'
import type {
  Organization,
  Contact,
  Product,
  Opportunity,
  Interaction,
  ContactWithOrganization,
  OpportunityWithRelations,
  InteractionWithRelations,
  OrganizationFilters,
  ContactFilters,
  ProductFilters,
  OpportunityFilters,
  InteractionFilters,
} from './entities'
import type { ProductDisplayData } from './product-extensions'

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Data table column definition
export interface DataTableColumn<T> {
  key: keyof T
  header: string
  accessor?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

// Generic data table props
export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  error?: string | null
  onRowClick?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onBulkAction?: (selectedRows: T[], action: string) => void
  searchable?: boolean
  searchKey?: keyof T
  searchPlaceholder?: string
  filterable?: boolean
  sortable?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  selection?: {
    enabled: boolean
    selectedRows?: string[]
    onSelectionChange?: (selectedIds: string[]) => void
  }
  emptyStateMessage?: string
  emptyStateIcon?: LucideIcon
}

// Form modal props
export interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  loading?: boolean
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

// Confirmation dialog props
export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

// Search and filter props
export interface SearchFilterProps<T = Record<string, unknown>> {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: T
  onFilterChange?: (filters: T) => void
  onClearFilters?: () => void
  filterComponents?: React.ReactNode[]
}

// Filter option for select filters
export interface FilterOption {
  value: string | number | boolean
  label: string
  count?: number
}

// Stats card props
export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  onClick?: () => void
  loading?: boolean
}

// Activity feed item
export interface ActivityFeedItem {
  id: string
  type: string
  title: string
  description?: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
  }
  metadata?: Record<string, unknown>
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'error'
}

// Activity feed props
export interface ActivityFeedProps {
  items: ActivityFeedItem[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  emptyMessage?: string
  limit?: number
}

// Form field props
export interface FormFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

// Select field option
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  description?: string
}

// Select field props
export interface SelectFieldProps extends FormFieldProps {
  options: SelectOption[]
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  loading?: boolean
  onSearch?: (query: string) => void
}

// Multi-step form props
export interface MultiStepFormProps {
  steps: FormStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete: (data: Record<string, unknown>) => void
  onCancel: () => void
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  loading?: boolean
  canGoBack?: boolean
  canGoNext?: boolean
  showProgress?: boolean
}

export interface FormStep {
  id: string
  title: string
  description?: string
  component: React.ComponentType<FormStepProps>
  validation?: (data: Record<string, unknown>) => boolean | Promise<boolean>
  optional?: boolean
}

export interface FormStepProps {
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  onNext: () => void
  onPrevious: () => void
  onComplete: () => void
  onCancel: () => void
  isFirstStep: boolean
  isLastStep: boolean
  errors?: Record<string, string>
}

// Entity-specific component props
export interface OrganizationTableProps
  extends Omit<DataTableProps<Organization>, 'data' | 'columns'> {
  organizations: Organization[]
  filters?: OrganizationFilters
  onFiltersChange?: (filters: OrganizationFilters) => void
}

export interface ContactTableProps
  extends Omit<DataTableProps<ContactWithOrganization>, 'data' | 'columns'> {
  contacts: ContactWithOrganization[]
  filters?: ContactFilters
  onFiltersChange?: (filters: ContactFilters) => void
}

export interface ProductTableProps
  extends Omit<DataTableProps<ProductDisplayData>, 'data' | 'columns'> {
  products: ProductDisplayData[]
  filters?: ProductFilters
  onFiltersChange?: (filters: ProductFilters) => void
}

export interface OpportunityTableProps
  extends Omit<DataTableProps<OpportunityWithRelations>, 'data' | 'columns'> {
  opportunities: OpportunityWithRelations[]
  filters?: OpportunityFilters
  onFiltersChange?: (filters: OpportunityFilters) => void
}

export interface InteractionTableProps
  extends Omit<DataTableProps<InteractionWithRelations>, 'data' | 'columns'> {
  interactions: InteractionWithRelations[]
  filters?: InteractionFilters
  onFiltersChange?: (filters: InteractionFilters) => void
}

// Form component props
export interface OrganizationFormProps {
  initialData?: Partial<Organization>
  onSubmit: (data: Organization) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
}

export interface ContactFormProps {
  initialData?: Partial<Contact>
  onSubmit: (data: Contact) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
  preselectedOrganization?: string
}

export interface ProductFormProps {
  initialData?: Partial<Product>
  onSubmit: (data: Product) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
  preselectedPrincipal?: string
}

export interface OpportunityFormProps {
  initialData?: Partial<Opportunity>
  onSubmit: (data: Opportunity) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
  preselectedOrganization?: string
  preselectedContact?: string
}

export interface InteractionFormProps {
  initialData?: Partial<Interaction>
  onSubmit: (data: Interaction) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
  preselectedOpportunity?: string
  preselectedContact?: string
}

// Navigation and layout props
export interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  activeRoute?: string
}

export interface HeaderProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

// Dashboard component props
export interface DashboardCardProps {
  title: string
  children: React.ReactNode
  headerActions?: React.ReactNode
  loading?: boolean
  error?: string | null
  className?: string
}

export interface MetricCardProps {
  label: string
  value: string | number
  change?: {
    value: number
    period: string
    isPositive: boolean
  }
  icon?: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  loading?: boolean
}

// Chart component props
export interface ChartProps {
  data: Record<string, unknown>[]
  loading?: boolean
  error?: string | null
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  className?: string
}

export interface BarChartProps extends ChartProps {
  xKey: string
  yKey: string
  color?: string
}

export interface LineChartProps extends ChartProps {
  xKey: string
  yKey: string
  lines: Array<{
    key: string
    color: string
    name: string
  }>
}

export interface PieChartProps extends ChartProps {
  dataKey: string
  nameKey: string
  colors?: string[]
}

// Notification props
export interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: (id: string) => void
}

// Loading and error state props
export interface LoadingStateProps {
  message?: string
  className?: string
}

export interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
  className?: string
}

export interface EmptyStateProps {
  title?: string
  message: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

// Utility component props
export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}
