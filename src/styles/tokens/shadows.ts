/**
 * Shadow Design Tokens
 *
 * Elevation system using shadows to create depth hierarchy in the CRM interface.
 * Based on material design principles adapted for the CRM use cases.
 */

// Base shadow levels
export const shadows = {
  // No shadow
  none: 'shadow-none',

  // Subtle shadows
  xs: 'shadow-xs',
  sm: 'shadow-sm',

  // Standard shadows
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',

  // Strong shadows
  '2xl': 'shadow-2xl',

  // Inner shadows
  inner: 'shadow-inner',
} as const

// Semantic shadow aliases for CRM components
export const semanticShadows = {
  // Cards and containers
  card: shadows.sm,
  cardHover: shadows.md,
  cardElevated: shadows.lg,

  // Modals and overlays
  modal: shadows.xl,
  popover: shadows.lg,
  tooltip: shadows.md,
  dropdown: shadows.lg,

  // Interactive elements
  button: shadows.sm,
  buttonHover: shadows.md,
  buttonPressed: shadows.xs,

  // Form elements
  input: shadows.sm,
  inputFocus: shadows.md,

  // Data display
  table: shadows.sm,
  tableRow: shadows.none,
  tableRowHover: shadows.xs,

  // Navigation
  sidebar: shadows.lg,
  header: shadows.sm,

  // Floating elements
  fab: shadows.lg,
  fabHover: shadows.xl,

  // States
  loading: shadows.inner,
  disabled: shadows.none,

  // Additional properties
  subtle: shadows.sm,
  extra: shadows['2xl'],

  // Direct size references (for compatibility)
  xs: shadows.xs,
  sm: shadows.sm,
  md: shadows.md,
  lg: shadows.lg,
  xl: shadows.xl,
  '2xl': shadows['2xl'],
} as const

export type ShadowToken = keyof typeof shadows
export type SemanticShadowToken = keyof typeof semanticShadows
