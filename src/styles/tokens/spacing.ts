/**
 * Spacing Design Tokens
 *
 * Unified spacing system that provides consistent spacing across the application.
 * Based on analysis of existing CRM components and following mobile-first approach.
 */

// Base spacing units following 8px grid system
export const spacing = {
  // Page-level spacing
  page: 'p-6 lg:p-8',
  pageX: 'px-6 lg:px-8',
  pageY: 'py-6 lg:py-8',

  // Card and component spacing
  card: 'p-4 lg:p-6',
  cardX: 'px-4 lg:px-6',
  cardY: 'py-4 lg:py-6',

  // Compact spacing for dense layouts
  compact: 'p-2 lg:p-3',
  compactX: 'px-2 lg:px-3',
  compactY: 'py-2 lg:py-3',

  // Form and input spacing
  form: 'p-4',
  formX: 'px-4',
  formY: 'py-4',

  // Stack spacing (vertical spacing between elements)
  stack: {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },

  // Inline spacing (horizontal spacing between elements)
  inline: {
    xs: 'space-x-2',
    sm: 'space-x-3',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },

  // Gap spacing for flex/grid layouts
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },

  // Margin tokens
  margin: {
    xs: 'm-2',
    sm: 'm-3',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  },

  marginX: {
    xs: 'mx-2',
    sm: 'mx-3',
    md: 'mx-4',
    lg: 'mx-6',
    xl: 'mx-8',
  },

  marginY: {
    xs: 'my-2',
    sm: 'my-3',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  },

  // Section spacing for page layout
  section: {
    sm: 'mt-4',
    md: 'mt-6',
    lg: 'mt-8',
    xl: 'mt-12',
  },
} as const

// Comprehensive semantic spacing system for all UI patterns
export const semanticSpacing = {
  // Layout containers
  pageContainer: spacing.page,
  cardContainer: spacing.card,
  cardX: spacing.cardX,
  formContainer: spacing.form,
  layoutContainer: 'w-full',
  verticalContainer: 'flex flex-col',

  // Badge spacing
  badgeDefault: 'px-2 py-0.5',
  badgeLarge: 'px-3 py-1',

  // Minimal spacing
  minimalX: 'px-1',
  minimalY: 'py-1',

  // Card spacing variants
  cardY: 'py-4 lg:py-6',

  // Zero spacing
  zero: 'p-0',

  // Interactive elements
  interactiveElement: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',

  // Padding variants
  compact: spacing.compact,
  compactX: spacing.compactX,
  compactY: spacing.compactY,

  // Layout padding
  layoutPadding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    xxl: 'p-12',
  },

  // Vertical padding - semantic names for vertical padding
  verticalPadding: {
    xxs: 'py-1', // 4px vertical padding
    xs: 'py-2', // 8px vertical padding
    sm: 'py-3', // 12px vertical padding
    md: 'py-4', // 16px vertical padding
    lg: 'py-6', // 24px vertical padding
    xl: 'py-8', // 32px vertical padding
    xxl: 'py-12', // 48px vertical padding
  },

  // Horizontal padding - semantic names for horizontal padding
  horizontalPadding: {
    xxs: 'px-1', // 4px horizontal padding
    xs: 'px-2', // 8px horizontal padding
    sm: 'px-3', // 12px horizontal padding
    md: 'px-4', // 16px horizontal padding
    lg: 'px-6', // 24px horizontal padding
    xl: 'px-8', // 32px horizontal padding
    xxl: 'px-12', // 48px horizontal padding
  },

  // Gap spacing - semantic names for all gap sizes
  gap: {
    none: 'gap-0',
    xs: spacing.gap.xs, // gap-2
    sm: spacing.gap.sm, // gap-3
    md: spacing.gap.md, // gap-4
    lg: spacing.gap.lg, // gap-6
    xl: spacing.gap.xl, // gap-8
  },

  // Stack spacing - semantic names for vertical spacing
  stack: {
    none: 'space-y-0',
    xxs: 'space-y-1', // space-y-1 (4px)
    xs: spacing.stack.xs, // space-y-2
    sm: spacing.stack.sm, // space-y-3
    md: spacing.stack.md, // space-y-4
    lg: spacing.stack.lg, // space-y-6
    xl: spacing.stack.xl, // space-y-8
  },

  // Inline spacing - semantic names for horizontal spacing
  inline: {
    none: 'space-x-0',
    xs: spacing.inline.xs, // space-x-2
    sm: spacing.inline.sm, // space-x-3
    md: spacing.inline.md, // space-x-4
    lg: spacing.inline.lg, // space-x-6
    xl: spacing.inline.xl, // space-x-8
  },

  // Margin spacing - semantic names for margins
  margin: {
    xs: spacing.margin.xs, // m-2
    sm: spacing.margin.sm, // m-3
    md: spacing.margin.md, // m-4
    lg: spacing.margin.lg, // m-6
    xl: spacing.margin.xl, // m-8
  },

  // Shorthand margin (alias for margin)
  m: {
    xs: spacing.margin.xs, // m-2
    sm: spacing.margin.sm, // m-3
    md: spacing.margin.md, // m-4
    lg: spacing.margin.lg, // m-6
    xl: spacing.margin.xl, // m-8
  },

  // Top gap spacing for consistent vertical separation
  topGap: {
    zero: 'mt-0', // 0px top margin
    xxs: 'mt-1', // 4px top margin
    xs: 'mt-2',
    sm: 'mt-3',
    md: 'mt-4',
    lg: 'mt-6',
    xl: 'mt-8',
    xxl: 'mt-12', // 48px top margin
  },

  // Bottom gap spacing
  bottomGap: {
    zero: 'mb-0', // 0px bottom margin
    xxs: 'mb-1', // 4px bottom margin
    xs: 'mb-2',
    sm: 'mb-3',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
  },

  // Left gap spacing
  leftGap: {
    zero: 'ml-0', // 0px left margin
    auto: 'ml-auto', // Auto left margin
    xxs: 'ml-1', // 4px left margin
    xs: 'ml-2',
    sm: 'ml-3',
    md: 'ml-4',
    lg: 'ml-6',
    xl: 'ml-8',
    xxl: 'ml-12',
  },

  // Right gap spacing
  rightGap: {
    xs: 'mr-2',
    sm: 'mr-3',
    md: 'mr-4',
    lg: 'mr-6',
    xl: 'mr-8',
    xxs: 'mr-1',
  },

  // Content spacing - commonly used combinations
  contentStack: spacing.stack.md,
  contentGap: spacing.gap.md,
  sectionGap: spacing.section.md,
  stackContainer: 'space-y-6',

  // Component spacing
  buttonGap: spacing.inline.sm,
  inputStack: spacing.stack.sm,
  tableCell: spacing.compact,

  // Header/footer spacing
  headerPadding: spacing.cardY,
  footerPadding: spacing.cardY,

  // Section spacing
  section: {
    sm: spacing.section.sm, // mt-4
    md: spacing.section.md, // mt-6
    lg: spacing.section.lg, // mt-8
    xl: spacing.section.xl, // mt-12
  },

  // Individual directional padding properties
  topPadding: {
    xs: 'pt-2', // 8px top padding
    md: 'pt-4', // 16px top padding
    lg: 'pt-6', // 24px top padding
    xl: 'pt-8', // 32px top padding
    xxl: 'pt-12', // 48px top padding
  },

  bottomPadding: {
    xs: 'pb-2', // 8px bottom padding
    lg: 'pb-6', // 24px bottom padding
  },

  leftPadding: {
    xs: 'pl-2', // 8px left padding
    lg: 'pl-6', // 24px left padding
    xxl: 'pl-12', // 48px left padding
  },

  rightPadding: {
    xs: 'pr-2', // 8px right padding
    xxl: 'pr-12', // 48px right padding
  },

  // Additional gap properties
  stackGap: {
    zero: 'space-y-0',
  },

  // Negative margin utilities
  negativeMargin: {
    xs: '-m-2', // -8px margin
  },

  verticalMargin: {
    xs: 'my-2', // 8px vertical margin
  },

  // Additional properties needed by components
  pageY: spacing.pageY,
  containerPadding: spacing.card,

  // Missing spacing tokens for UI components
  sectionContainer: spacing.card,
  insetLeft: 'pl-8',
  horizontalLarge: 'px-8',
  compactLeft: 'pl-2',
  extraY: 'py-12',

  // Additional missing properties
  minimal: 'p-1',
  mr: 'mr-4',
  mt: 'mt-4',
  compactRight: 'pr-2',
  interactiveElementLarge: 'p-3',
  standardX: 'px-3',
} as const

export type SpacingToken = keyof typeof spacing
export type SemanticSpacingToken = keyof typeof semanticSpacing

// Helper function to get spacing token with fallback
export const getSpacingToken = (token: SemanticSpacingToken, fallback?: string): string => {
  return semanticSpacing[token] || fallback || ''
}
