/**
 * Z-Index Design Tokens
 *
 * Provides a consistent layering system for the CRM application.
 * Each layer is designed to ensure proper stacking order and prevent conflicts.
 */

// Base Z-Index Scale (10-based system for flexibility)
export const zIndex = {
  // Base layers (-1 to 0)
  hide: -1,
  base: 0,

  // Content layers (1-9)
  behind: 1,
  normal: 2,
  raised: 3,

  // Interactive elements (10-29)
  hover: 10,
  focus: 11,
  selected: 12,
  active: 13,

  // UI Components (30-49)
  badge: 30,
  tooltip: 31,
  button: 32,
  card: 33,

  // Navigation (50-69)
  header: 50,
  sidebar: 51,
  navigation: 52,
  breadcrumb: 53,
  tabs: 54,

  // Overlays (70-89)
  overlay: 70,
  backdrop: 71,
  dropdown: 72,
  popover: 73,
  select: 74,

  // Modals and Dialogs (90-99)
  modal: 90,
  dialog: 91,
  alertDialog: 92,
  sheet: 93,
  drawer: 94,

  // Critical UI (100+)
  toast: 100,
  notification: 101,
  loading: 102,
  error: 103,

  // System level (9000+)
  skip: 9000,
  system: 9990,
  max: 9999,
} as const

// Semantic Z-Index for CRM Context
export const semanticZIndex = {
  // Table layers
  tableHeader: zIndex.raised,
  tableRow: zIndex.normal,
  tableHover: zIndex.hover,
  tableSelection: zIndex.selected,
  tableSort: zIndex.focus,

  // Form layers
  formField: zIndex.normal,
  formFieldFocus: zIndex.focus,
  formError: zIndex.active,
  formTooltip: zIndex.tooltip,

  // CRM-specific components
  crmHeader: zIndex.header,
  crmSidebar: zIndex.sidebar,
  crmFilters: zIndex.navigation,
  crmSearch: zIndex.dropdown,
  crmActions: zIndex.button,

  // Data visualization
  chartTooltip: zIndex.tooltip,
  chartLegend: zIndex.raised,
  chartOverlay: zIndex.overlay,

  // Interaction components
  bulkActions: zIndex.navigation,
  quickActions: zIndex.active,
  contextMenu: zIndex.popover,
  commandPalette: zIndex.modal,

  // Status indicators
  statusBadge: zIndex.badge,
  priorityIndicator: zIndex.badge,
  progressBar: zIndex.raised,
  loadingSpinner: zIndex.loading,

  // Feedback components
  successToast: zIndex.toast,
  errorAlert: zIndex.error,
  warningNotification: zIndex.notification,
  infoPopover: zIndex.popover,
} as const

// Z-Index utilities for dynamic layering
export const zIndexUtilities = {
  // Layer management
  bringToFront: (currentZ: number) => currentZ + 1,
  sendToBack: (currentZ: number) => Math.max(currentZ - 1, zIndex.base),

  // Context-aware layering
  aboveContent: zIndex.raised,
  aboveUI: zIndex.overlay,
  aboveModal: zIndex.system,

  // Component-specific helpers
  dropdownAbove: (parentZ: number) => parentZ + 10,
  tooltipAbove: (parentZ: number) => parentZ + 5,
  modalAbove: (parentZ: number) => Math.max(parentZ + 20, zIndex.modal),
} as const

// Tailwind CSS classes for z-index values
export const zIndexClasses = {
  // Base layers
  'z-hide': 'z-[-1]',
  'z-base': 'z-0',
  'z-behind': 'z-[1]',
  'z-normal': 'z-[2]',
  'z-raised': 'z-[3]',

  // Interactive
  'z-hover': 'z-[10]',
  'z-focus': 'z-[11]',
  'z-selected': 'z-[12]',
  'z-active': 'z-[13]',

  // Components
  'z-badge': 'z-[30]',
  'z-tooltip': 'z-[31]',
  'z-button': 'z-[32]',
  'z-card': 'z-[33]',

  // Navigation
  'z-header': 'z-[50]',
  'z-sidebar': 'z-[51]',
  'z-navigation': 'z-[52]',
  'z-breadcrumb': 'z-[53]',
  'z-tabs': 'z-[54]',

  // Overlays
  'z-overlay': 'z-[70]',
  'z-backdrop': 'z-[71]',
  'z-dropdown': 'z-[72]',
  'z-popover': 'z-[73]',
  'z-select': 'z-[74]',

  // Modals
  'z-modal': 'z-[90]',
  'z-dialog': 'z-[91]',
  'z-alert-dialog': 'z-[92]',
  'z-sheet': 'z-[93]',
  'z-drawer': 'z-[94]',

  // Critical
  'z-toast': 'z-[100]',
  'z-notification': 'z-[101]',
  'z-loading': 'z-[102]',
  'z-error': 'z-[103]',

  // System
  'z-skip': 'z-[9000]',
  'z-system': 'z-[9990]',
  'z-max': 'z-[9999]',
} as const

// CRM-specific z-index combinations
export const crmZIndexCombinations = {
  // Table with overlays
  table: {
    base: zIndexClasses['z-normal'],
    header: zIndexClasses['z-raised'],
    hover: zIndexClasses['z-hover'],
    selection: zIndexClasses['z-selected'],
    actions: zIndexClasses['z-active'],
  },

  // Form with validation
  form: {
    field: zIndexClasses['z-normal'],
    focus: zIndexClasses['z-focus'],
    error: zIndexClasses['z-active'],
    tooltip: zIndexClasses['z-tooltip'],
  },

  // Navigation stack
  navigation: {
    sidebar: zIndexClasses['z-sidebar'],
    header: zIndexClasses['z-header'],
    breadcrumb: zIndexClasses['z-breadcrumb'],
    tabs: zIndexClasses['z-tabs'],
  },

  // Modal stack
  modal: {
    backdrop: zIndexClasses['z-backdrop'],
    content: zIndexClasses['z-modal'],
    actions: zIndexClasses['z-active'],
    close: zIndexClasses['z-button'],
  },

  // Feedback stack
  feedback: {
    toast: zIndexClasses['z-toast'],
    notification: zIndexClasses['z-notification'],
    error: zIndexClasses['z-error'],
    loading: zIndexClasses['z-loading'],
  },
} as const

// Z-Index validation helpers
export const validateZIndex = {
  // Check if z-index is within valid range
  isValid: (value: number): boolean => value >= zIndex.hide && value <= zIndex.max,

  // Get the appropriate z-index for a component type
  getForComponent: (componentType: keyof typeof semanticZIndex): number =>
    semanticZIndex[componentType],

  // Resolve z-index conflicts by providing safe alternatives
  resolveConflict: (desired: number, existing: number[]): number => {
    if (!existing.includes(desired)) return desired

    // Find the next available z-index above the desired value
    let candidate = desired + 1
    while (existing.includes(candidate) && candidate <= zIndex.max) {
      candidate++
    }

    return candidate <= zIndex.max ? candidate : zIndex.max
  },
} as const

// TypeScript types
export type ZIndexValue = (typeof zIndex)[keyof typeof zIndex]
export type SemanticZIndexKey = keyof typeof semanticZIndex
export type ZIndexClassName = keyof typeof zIndexClasses

// Export consolidated z-index object for easy access
export const zIndexTokens = {
  values: zIndex,
  semantic: semanticZIndex,
  classes: zIndexClasses,
  utilities: zIndexUtilities,
  combinations: crmZIndexCombinations,
  validate: validateZIndex,
} as const
