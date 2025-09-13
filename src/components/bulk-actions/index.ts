/**
 * Bulk Actions System
 *
 * Unified bulk selection and actions system for CRM entities.
 * Provides consistent selection UI and bulk operation capabilities.
 */

// Core provider and hooks
export {
  BulkActionsProvider,
  useBulkActions,
  useBulkSelection,
  type BulkActionItem,
  type BulkAction,
  type BulkActionsState,
} from './BulkActionsProvider'

// Toolbar component
export { BulkActionsToolbar, useBulkActionsSetup, createBulkActions } from './BulkActionsToolbar'

// Selection components
export {
  BulkSelectionCheckbox,
  TableHeaderCheckbox,
  TableRowCheckbox,
  SelectionCounter,
  BulkSelectionKeyboardShortcuts,
  useBulkSelectionKeyboard,
} from './BulkSelectionCheckbox'
