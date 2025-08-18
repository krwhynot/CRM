# Shared Components Architecture

## Overview

The shared components layer provides reusable UI components that maintain design consistency across all CRM features while maximizing code reuse and minimizing duplication.

## Component Categories

### 1. UI Components (`/shared/components/ui/`)

These are the core shadcn/ui components that form the foundation of the design system:

```typescript
// shared/components/ui/index.ts
export { Button } from './button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form'
export { Input } from './input'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table'
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
export { Alert, AlertDescription, AlertTitle } from './alert'
export { Badge } from './badge'
export { Checkbox } from './checkbox'
export { Label } from './label'
export { Textarea } from './textarea'
export { Switch } from './switch'
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
export { Progress } from './progress'
export { Separator } from './separator'
export { Skeleton } from './skeleton'
export { LoadingSpinner } from './loading-spinner'
// ... additional shadcn/ui components
```

### 2. Form Components (`/shared/components/forms/`)

Reusable form components that provide consistent form patterns:

```typescript
// shared/components/forms/CoreFormLayout/CoreFormLayout.tsx
import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'

interface CoreFormLayoutProps {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function CoreFormLayout({
  title,
  description,
  children,
  actions,
  className = ''
}: CoreFormLayoutProps) {
  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        {actions && (
          <>
            <Separator />
            <div className="flex justify-end space-x-2">
              {actions}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// shared/components/forms/EntitySelect/EntitySelect.tsx
import { forwardRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { FormControl } from '@/shared/components/ui/form'

interface EntityOption {
  id: string
  name: string
  description?: string
}

interface EntitySelectProps {
  entities: EntityOption[]
  placeholder?: string
  loading?: boolean
  onValueChange?: (value: string) => void
  value?: string
  disabled?: boolean
}

export const EntitySelect = forwardRef<HTMLDivElement, EntitySelectProps>(
  ({ entities, placeholder, loading, onValueChange, value, disabled }, ref) => {
    return (
      <Select onValueChange={onValueChange} value={value} disabled={disabled || loading}>
        <FormControl>
          <SelectTrigger ref={ref}>
            <SelectValue placeholder={loading ? 'Loading...' : placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {entities.map((entity) => (
            <SelectItem key={entity.id} value={entity.id}>
              <div className="flex flex-col">
                <span>{entity.name}</span>
                {entity.description && (
                  <span className="text-xs text-muted-foreground">
                    {entity.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
)

EntitySelect.displayName = 'EntitySelect'

// shared/components/forms/ProgressiveDetails/ProgressiveDetails.tsx
import { ReactNode, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ProgressiveDetailsProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function ProgressiveDetails({
  title,
  children,
  defaultOpen = false,
  className = ''
}: ProgressiveDetailsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex w-full justify-between p-0 h-auto">
          <span className="font-medium">{title}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

// shared/components/forms/FormField/FormField.tsx
import { ReactNode } from 'react'
import { FormControl, FormDescription, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Control, FieldPath, FieldValues } from 'react-hook-form'

interface FormFieldWrapperProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  required?: boolean
  children: ReactNode
}

export function FormFieldWrapper<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required = false,
  children
}: FormFieldWrapperProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={required ? 'required' : ''}>
            {label}
          </FormLabel>
          <FormControl>
            {children}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Export all form components
// shared/components/forms/index.ts
export { CoreFormLayout } from './CoreFormLayout'
export { EntitySelect } from './EntitySelect'
export { ProgressiveDetails } from './ProgressiveDetails'
export { FormFieldWrapper } from './FormField'
export type { CoreFormLayoutProps } from './CoreFormLayout'
export type { EntitySelectProps } from './EntitySelect'
export type { ProgressiveDetailsProps } from './ProgressiveDetails'
```

### 3. Data Display Components (`/shared/components/data-display/`)

Components for displaying and interacting with data:

```typescript
// shared/components/data-display/DataTable/DataTable.tsx
import { ReactNode, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  title: string
  render?: (value: any, record: T, index: number) => ReactNode
  sortable?: boolean
  width?: string
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (search: string) => void
  sortable?: boolean
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  rowActions?: (record: T, index: number) => ReactNode
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  sortable = false,
  onSort,
  rowActions,
  emptyMessage = 'No data available',
  className = ''
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleSort = (key: string) => {
    if (!sortable) return

    const direction = 
      sortConfig?.key === key && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc'
    
    setSortConfig({ key, direction })
    onSort?.(key, direction)
  }

  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = record[column.key as keyof T]
    
    if (column.render) {
      return column.render(value, record, index)
    }

    // Default rendering based on value type
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    if (Array.isArray(value)) {
      return value.join(', ')
    }

    return value?.toString() || '-'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && <Skeleton className="h-10 w-full max-w-sm" />}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} style={{ width: column.width }}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
                {rowActions && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  style={{ width: column.width }}
                  className={column.className}
                >
                  {column.sortable && sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(column.key as string)}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      {column.title}
                      {sortConfig?.key === column.key && (
                        sortConfig.direction === 'asc' ? (
                          <SortAsc className="ml-1 h-4 w-4" />
                        ) : (
                          <SortDesc className="ml-1 h-4 w-4" />
                        )
                      )}
                    </Button>
                  ) : (
                    column.title
                  )}
                </TableHead>
              ))}
              {rowActions && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (rowActions ? 1 : 0)} 
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow key={index}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {renderCell(column, record, index)}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell>
                      {rowActions(record, index)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// shared/components/data-display/EntityCard/EntityCard.tsx
import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'

interface EntityCardProps {
  title: string
  description?: string
  status?: string
  statusVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  metadata?: Array<{
    label: string
    value: ReactNode
  }>
  actions?: ReactNode
  children?: ReactNode
  onClick?: () => void
  className?: string
}

export function EntityCard({
  title,
  description,
  status,
  statusVariant = 'default',
  metadata = [],
  actions,
  children,
  onClick,
  className = ''
}: EntityCardProps) {
  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:bg-accent/50' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {status && (
              <Badge variant={statusVariant}>{status}</Badge>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>
      {(metadata.length > 0 || children) && (
        <CardContent>
          {metadata.length > 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {metadata.map((item, index) => (
                <div key={index}>
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="ml-1 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  )
}

// shared/components/data-display/SearchableList/SearchableList.tsx
import { ReactNode, useState } from 'react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Search, Plus } from 'lucide-react'

interface SearchableListProps<T> {
  data: T[]
  loading?: boolean
  searchPlaceholder?: string
  onSearch?: (search: string) => void
  renderItem: (item: T, index: number) => ReactNode
  emptyMessage?: string
  onAdd?: () => void
  addButtonText?: string
  className?: string
}

export function SearchableList<T>({
  data,
  loading = false,
  searchPlaceholder = 'Search...',
  onSearch,
  renderItem,
  emptyMessage = 'No items found',
  onAdd,
  addButtonText = 'Add New',
  className = ''
}: SearchableListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          {onAdd && <Skeleton className="h-10 w-24" />}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          data.map((item, index) => renderItem(item, index))
        )}
      </div>
    </div>
  )
}

// Export data display components
// shared/components/data-display/index.ts
export { DataTable } from './DataTable'
export { EntityCard } from './EntityCard'
export { SearchableList } from './SearchableList'
export type { DataTableProps } from './DataTable'
export type { EntityCardProps } from './EntityCard'
export type { SearchableListProps } from './SearchableList'
```

### 4. Feedback Components (`/shared/components/feedback/`)

Components for error handling, loading states, and user feedback:

```typescript
// shared/components/feedback/ErrorBoundary/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={this.handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// shared/components/feedback/EmptyState/EmptyState.tsx
import { ReactNode } from 'react'
import { Button } from '@/shared/components/ui/button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Export feedback components
// shared/components/feedback/index.ts
export { ErrorBoundary } from './ErrorBoundary'
export { EmptyState } from './EmptyState'
export { LoadingSpinner } from '@/shared/components/ui/loading-spinner'
export type { ErrorBoundaryProps } from './ErrorBoundary'
export type { EmptyStateProps } from './EmptyState'
```

### 5. Layout Components (`/shared/components/layout/`)

Components for application layout and navigation:

```typescript
// shared/components/layout/Layout/Layout.tsx
import { ReactNode } from 'react'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { ErrorBoundary } from '@/shared/components/feedback'

interface LayoutProps {
  children: ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={title} />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Export layout components
// shared/components/layout/index.ts
export { Layout } from './Layout'
export { AppSidebar } from './AppSidebar'
export { Header } from './Header'
```

## Shared Component Index

The main shared components index exports everything:

```typescript
// shared/components/index.ts
export * from './ui'
export * from './forms'
export * from './data-display'
export * from './feedback'
export * from './layout'
```

## Usage Patterns

### 1. Feature Component Using Shared Components

```typescript
// features/contacts/components/ContactForm/ContactForm.tsx
import { CoreFormLayout, EntitySelect, FormFieldWrapper } from '@/shared/components/forms'
import { Button, Input, Textarea } from '@/shared/components/ui'
import { useOrganizations } from '@/features/organizations'

export function ContactForm({ onSubmit, initialData, loading }: ContactFormProps) {
  const { data: organizations = [] } = useOrganizations()
  
  return (
    <CoreFormLayout
      title="Contact Information"
      description="Add or update contact details"
      actions={
        <Button type="submit" loading={loading}>
          Save Contact
        </Button>
      }
    >
      <FormFieldWrapper
        control={form.control}
        name="organization_id"
        label="Organization"
        required
      >
        <EntitySelect
          entities={organizations}
          placeholder="Select organization"
        />
      </FormFieldWrapper>
      
      {/* Additional form fields */}
    </CoreFormLayout>
  )
}
```

### 2. Feature Table Using Shared Data Display

```typescript
// features/contacts/components/ContactsTable/ContactsTable.tsx
import { DataTable } from '@/shared/components/data-display'
import { Badge, Button } from '@/shared/components/ui'

export function ContactsTable({ contacts, loading, onEdit, onDelete }: ContactsTableProps) {
  const columns = [
    {
      key: 'full_name',
      title: 'Name',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      sortable: true
    },
    {
      key: 'is_primary_contact',
      title: 'Primary',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Primary' : 'Secondary'}
        </Badge>
      )
    }
  ]

  return (
    <DataTable
      data={contacts}
      columns={columns}
      loading={loading}
      searchable
      sortable
      rowActions={(contact) => (
        <div className="flex space-x-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(contact)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(contact.id)}>
            Delete
          </Button>
        </div>
      )}
    />
  )
}
```

## Benefits

1. **Design Consistency**: All components follow the same design patterns
2. **Code Reuse**: Maximum reuse across all features
3. **Type Safety**: Full TypeScript support with proper prop types
4. **Accessibility**: Built on shadcn/ui with ARIA compliance
5. **Testability**: Components are easily testable in isolation
6. **Documentation**: Self-documenting with TypeScript interfaces
7. **Performance**: Optimized components with proper memoization
8. **Maintainability**: Centralized component logic for easier updates