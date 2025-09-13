import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/ui/DataTable'
import { BulkActionsProvider, BulkActionsToolbar } from '@/components/shared/BulkActions'
import { semanticSpacing } from '@/styles/tokens'
import { cn } from '@/lib/utils'
import type { Column } from '@/components/ui/DataTable'

/**
 * Standardized template for all entity table implementations.
 * Enforces consistent structure and patterns across the application.
 *
 * This template ensures:
 * - All tables use the unified DataTable component
 * - Consistent Card wrapper with semantic spacing
 * - BulkActionsProvider integration
 * - Semantic token usage for styling
 * - Standardized empty states
 *
 * @template T - The entity type being displayed in the table
 */

export interface EntityTableTemplateProps<T extends { id: string }> {
  // Data
  data: T[]
  columns: Column<T>[]
  loading?: boolean

  // Identification
  entityType: string
  entityTypePlural: string
  getItemId: (item: T) => string
  getItemName: (item: T) => string

  // Row management
  expandableContent?: (item: T) => React.ReactNode
  expandedRows?: string[]
  onToggleRow?: (id: string) => void

  // Filters (optional, rendered above table)
  filters?: React.ReactNode

  // Bulk actions
  bulkActionsToolbar?: React.ReactNode
  customBulkActions?: Array<{
    label: string
    onClick: (selectedItems: Set<T>) => void
    variant?: 'default' | 'destructive'
  }>

  // Empty state
  emptyMessage?: string
  emptyDescription?: string

  // Styling
  className?: string
  containerClassName?: string
  cardClassName?: string
}

/**
 * Internal component that uses the BulkActionsProvider context
 */
function EntityTableContent<T extends { id: string }>({
  data,
  columns,
  loading = false,
  entityType,
  entityTypePlural,
  expandableContent,
  expandedRows = [],
  onToggleRow,
  filters,
  bulkActionsToolbar,
  emptyMessage,
  emptyDescription,
  className,
  cardClassName,
}: Omit<EntityTableTemplateProps<T>, 'getItemId' | 'getItemName' | 'containerClassName'>) {
  const defaultEmptyMessage = emptyMessage || `No ${entityTypePlural} found`
  const defaultEmptyDescription =
    emptyDescription || `Get started by adding your first ${entityType}`

  return (
    <div className={cn(semanticSpacing.layoutContainer, className)}>
      {/* Optional Filters */}
      {filters}

      {/* Bulk Actions Toolbar */}
      {bulkActionsToolbar || (
        <BulkActionsToolbar />
      )}

      {/* Data Table with Card Wrapper */}
      <Card className={cardClassName}>
        <CardContent className={semanticSpacing.cardContainer}>
          <DataTable<T>
            data={data}
            columns={columns}
            rowKey={(row) => row.id}
            loading={loading}
            empty={{
              title: defaultEmptyMessage,
              description: defaultEmptyDescription,
            }}
            expandableContent={expandableContent}
            expandedRows={expandedRows}
            onToggleRow={onToggleRow}
            features={{
              virtualization: 'auto', // Auto-virtualization at 500+ rows
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Main template component with BulkActionsProvider wrapper
 */
export function EntityTableTemplate<T extends { id: string }>(props: EntityTableTemplateProps<T>) {
  const {
    data,
    getItemId,
    getItemName,
    entityType,
    entityTypePlural,
    containerClassName,
    ...rest
  } = props

  return (
    <div className={containerClassName}>
      <BulkActionsProvider<T>
        items={data}
        getItemId={getItemId}
        getItemName={getItemName}
        entityType={entityType}
        entityTypePlural={entityTypePlural}
      >
        <EntityTableContent<T>
          data={data}
          entityType={entityType}
          entityTypePlural={entityTypePlural}
          {...rest}
        />
      </BulkActionsProvider>
    </div>
  )
}

/**
 * Type guard to ensure a component uses the EntityTableTemplate
 */
export function isEntityTableComponent(
  component: any
): component is React.FC<EntityTableTemplateProps<any>> {
  return component && typeof component === 'function' && component.prototype?.isEntityTable === true
}

/**
 * Higher-order component to mark a table as compliant
 */
export function withEntityTableCompliance<T extends { id: string }>(
  Component: React.FC<any>
): React.FC<any> {
  const WrappedComponent = (props: any) => {
    return <Component {...props} />
  }

  WrappedComponent.isEntityTable = true
  WrappedComponent.displayName = `EntityTable(${Component.displayName || Component.name})`

  return WrappedComponent
}
