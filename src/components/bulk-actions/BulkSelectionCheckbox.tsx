import { semanticTypography, semanticSpacing, semanticRadius } from '@/styles/tokens'
/**
 * Bulk Selection Checkbox
 *
 * Enhanced checkbox component for bulk selection with indeterminate state support,
 * accessibility features, and consistent styling.
 */

import React from 'react'
// Removed unused: import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

interface BulkSelectionCheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BulkSelectionCheckbox({
  checked,
  indeterminate = false,
  onCheckedChange,
  disabled = false,
  'aria-label': ariaLabel,
  className,
  size = 'md',
}: BulkSelectionCheckboxProps) {
  // Size variants
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  // Handle click with proper indeterminate handling
  const handleClick = () => {
    if (disabled) return

    // If indeterminate, clicking should select all
    // If checked, clicking should deselect all
    // If unchecked, clicking should select all
    onCheckedChange(!checked)
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center rounded border border-input bg-background transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        checked && 'bg-primary border-primary text-primary-foreground',
        indeterminate && 'bg-primary border-primary text-primary-foreground',
        className
      )}
    >
      {indeterminate ? (
        <Minus className="h-3 w-3" />
      ) : checked ? (
        <Check className="h-3 w-3" />
      ) : null}
    </button>
  )
}

// =============================================================================
// TABLE HEADER CHECKBOX
// =============================================================================

interface TableHeaderCheckboxProps {
  totalCount: number
  selectedCount: number
  onSelectAll: () => void
  disabled?: boolean
  className?: string
}

export function TableHeaderCheckbox({
  totalCount,
  selectedCount,
  onSelectAll,
  disabled = false,
  className,
}: TableHeaderCheckboxProps) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount

  const getAriaLabel = () => {
    if (isAllSelected) return `Deselect all ${totalCount} items`
    if (isPartiallySelected)
      return `Select all ${totalCount} items (${selectedCount} currently selected)`
    return `Select all ${totalCount} items`
  }

  return (
    <BulkSelectionCheckbox
      checked={isAllSelected}
      indeterminate={isPartiallySelected}
      onCheckedChange={onSelectAll}
      disabled={disabled || totalCount === 0}
      aria-label={getAriaLabel()}
      className={className}
    />
  )
}

// =============================================================================
// TABLE ROW CHECKBOX
// =============================================================================

interface TableRowCheckboxProps {
  itemId: string
  itemLabel?: string
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  className?: string
}

export function TableRowCheckbox({
  itemId,
  itemLabel,
  checked,
  onToggle,
  disabled = false,
  className,
}: TableRowCheckboxProps) {
  const ariaLabel = itemLabel
    ? `${checked ? 'Deselect' : 'Select'} ${itemLabel}`
    : `${checked ? 'Deselect' : 'Select'} row ${itemId}`

  return (
    <BulkSelectionCheckbox
      checked={checked}
      onCheckedChange={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
    />
  )
}

// =============================================================================
// SELECTION COUNTER
// =============================================================================

interface SelectionCounterProps {
  selectedCount: number
  totalCount: number
  className?: string
  showTotal?: boolean
}

export function SelectionCounter({
  selectedCount,
  totalCount,
  className,
  showTotal = true,
}: SelectionCounterProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn('inline-flex items-center gap-1 text-sm text-muted-foreground', className)}
      role="status"
      aria-live="polite"
    >
      <span className={cn(semanticTypography.label, 'text-foreground')}>{selectedCount}</span>
      {showTotal && (
        <>
          <span>of</span>
          <span className={`${semanticTypography.label}`}>{totalCount}</span>
        </>
      )}
      <span>selected</span>
    </div>
  )
}

// =============================================================================
// KEYBOARD SHORTCUTS HELPER
// =============================================================================

interface KeyboardShortcutsProps {
  className?: string
}

export function BulkSelectionKeyboardShortcuts({ className }: KeyboardShortcutsProps) {
  return (
    <div className={cn('text-xs text-muted-foreground space-y-1', className)}>
      <div>
        <kbd
          className={cn(
            semanticSpacing.minimalX,
            semanticTypography.caption,
            semanticRadius.small,
            'py-0.5 font-mono bg-muted'
          )}
        >
          Ctrl+A
        </kbd>
        <span className={`${semanticSpacing.leftGap.xs}`}>Select all</span>
      </div>
      <div>
        <kbd
          className={cn(
            semanticSpacing.minimalX,
            semanticTypography.caption,
            semanticRadius.small,
            'py-0.5 font-mono bg-muted'
          )}
        >
          Escape
        </kbd>
        <span className={`${semanticSpacing.leftGap.xs}`}>Clear selection</span>
      </div>
    </div>
  )
}

// =============================================================================
// HOOKS FOR KEYBOARD HANDLING
// =============================================================================

/**
 * Hook to handle keyboard shortcuts for bulk selection
 */
export function useBulkSelectionKeyboard(
  onSelectAll: () => void,
  onClearSelection: () => void,
  enabled = true
) {
  React.useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+A or Cmd+A to select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault()
        onSelectAll()
      }

      // Escape to clear selection
      if (event.key === 'Escape') {
        onClearSelection()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSelectAll, onClearSelection, enabled])
}
