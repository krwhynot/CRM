// Shared Components - Main Exports
// These components are truly generic and reusable across features

// UI Components
export { CommandPalette } from './CommandPalette'

// TODO: Error handling components will be re-exported from ./app when consolidated

// Form System - Generic form components for all features
export * from './forms'

// Bulk Actions - Generic bulk operation components for all entity types
export * from './bulk-actions'

// TODO: Filter components now consolidated in ./data-table/filters

// Note: UI components available at @/components/ui/* - not re-exported to avoid conflicts
