/**
 * Border Radius Design Tokens
 *
 * Consistent border radius system for creating cohesive rounded corners
 * across all CRM interface elements.
 */

// Base radius values
export const radius = {
  // No radius
  none: 'rounded-none',

  // Small radius
  xs: 'rounded-xs',
  sm: 'rounded-sm',

  // Standard radius
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',

  // Large radius
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',

  // Full radius
  full: 'rounded-full',
} as const

// Directional radius tokens
export const radiusDirectional = {
  // Top corners
  topNone: 'rounded-t-none',
  topSm: 'rounded-t-sm',
  topMd: 'rounded-t-md',
  topLg: 'rounded-t-lg',
  topXl: 'rounded-t-xl',

  // Bottom corners
  bottomNone: 'rounded-b-none',
  bottomSm: 'rounded-b-sm',
  bottomMd: 'rounded-b-md',
  bottomLg: 'rounded-b-lg',
  bottomXl: 'rounded-b-xl',

  // Left corners
  leftNone: 'rounded-l-none',
  leftSm: 'rounded-l-sm',
  leftMd: 'rounded-l-md',
  leftLg: 'rounded-l-lg',
  leftXl: 'rounded-l-xl',

  // Right corners
  rightNone: 'rounded-r-none',
  rightSm: 'rounded-r-sm',
  rightMd: 'rounded-r-md',
  rightLg: 'rounded-r-lg',
  rightXl: 'rounded-r-xl',
} as const

// Semantic radius aliases for CRM components
export const semanticRadius = {
  // Default radius (commonly referenced)
  default: radius.md,
  small: radius.sm,

  // Buttons and interactive elements
  button: radius.md,
  buttonSmall: radius.sm,
  buttonLarge: radius.lg,

  // Cards and containers
  card: radius.lg,
  cardSmall: radius.md,

  // Form elements
  input: radius.md,
  select: radius.md,
  textarea: radius.md,
  checkbox: radius.sm,

  // Data display
  table: radius.lg,
  tableCell: radius.none,
  badge: radius.full,
  avatar: radius.full,

  // Modals and overlays
  modal: radius.xl,
  popover: radius.lg,
  tooltip: radius.md,
  dropdown: radius.lg,

  // Images and media
  image: radius.lg,
  imageSmall: radius.md,

  // Progress and indicators
  progressBar: radius.full,
  progressBackground: radius.full,

  // Navigation
  navItem: radius.md,
  tabItem: radiusDirectional.topMd,

  // Special cases
  pill: radius.full,
  sharp: radius.none,

  // Additional sizes
  full: radius.full,
  large: radius.lg,
  none: radius.none,

  // Direct size references (for compatibility)
  xs: radius.xs,
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,

  // Missing properties referenced by components
  extra: radius['3xl'], // Maps to rounded-3xl for extra large radius
} as const

export type RadiusToken = keyof typeof radius
export type RadiusDirectionalToken = keyof typeof radiusDirectional
export type SemanticRadiusToken = keyof typeof semanticRadius
