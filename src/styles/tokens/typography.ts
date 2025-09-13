/**
 * Typography Design Tokens
 *
 * Responsive typography scale that ensures consistent text sizing and hierarchy.
 * Based on existing CRM component analysis and mobile-first responsive design.
 */

// Base typography scale
export const typography = {
  // Display text (largest)
  display: {
    lg: 'text-4xl lg:text-5xl font-bold tracking-tight',
    md: 'text-3xl lg:text-4xl font-bold tracking-tight',
    sm: 'text-2xl lg:text-3xl font-bold tracking-tight',
  },

  // Headings
  h1: 'text-3xl lg:text-4xl font-bold tracking-tight',
  h2: 'text-2xl lg:text-3xl font-semibold tracking-tight',
  h3: 'text-xl lg:text-2xl font-semibold tracking-tight',
  h4: 'text-lg lg:text-xl font-semibold',
  h5: 'text-base lg:text-lg font-semibold',
  h6: 'text-sm lg:text-base font-semibold',

  // Body text
  bodyVariants: {
    lg: 'text-lg leading-relaxed',
    md: 'text-base leading-relaxed',
    sm: 'text-sm leading-relaxed',
  },

  // Default body text (most common)
  body: 'text-base leading-relaxed',

  // Caption and small text
  caption: 'text-sm text-muted-foreground',
  small: 'text-sm',
  tiny: 'text-xs',

  // Interactive elements
  button: {
    lg: 'text-base font-medium',
    md: 'text-sm font-medium',
    sm: 'text-xs font-medium',
  },

  link: 'text-sm font-medium underline-offset-4 hover:underline',

  // Form elements
  label:
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  input: 'text-sm',
  placeholder: 'text-sm text-muted-foreground',

  // Table text
  tableHeader: 'text-sm font-medium text-muted-foreground',
  tableCell: 'text-sm',

  // Additional utility typography
  heading: 'text-lg font-semibold',

  // Code and monospace
  code: {
    inline: 'text-sm font-mono bg-muted px-1.5 py-0.5 rounded',
    block: 'text-sm font-mono bg-muted p-4 rounded-lg',
  },
} as const

// Weight variations
export const fontWeight = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const

// Line height variations
export const lineHeight = {
  none: 'leading-none',
  tight: 'leading-tight',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const

// Letter spacing
export const letterSpacing = {
  tighter: 'tracking-tighter',
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
} as const

// Semantic typography aliases for CRM-specific use cases
export const semanticTypography = {
  // Base typography (commonly referenced)
  body: typography.body,
  label: typography.label,
  caption: typography.caption,
  tiny: typography.tiny,
  small: typography.small,

  // Layout spacing for typography
  tightSpacing: 'leading-tight',
  relaxedLine: 'leading-relaxed',

  // Page elements
  pageTitle: typography.h1,
  pageSubtitle: typography.body,
  sectionTitle: typography.h2,
  sectionSubtitle: typography.caption,

  // Entity-specific
  entityTitle: typography.h3,
  entitySubtitle: typography.caption,
  entityMeta: typography.tiny,

  // Data display
  dataLabel: typography.label,
  dataValue: typography.body,
  dataMeta: typography.caption,

  // Form elements
  formTitle: typography.h4,
  formDescription: typography.caption,
  fieldLabel: typography.label,
  fieldHelp: typography.caption,
  fieldError: `${typography.small} text-destructive`,

  // Navigation and UI
  navItem: typography.button.md,
  menuItem: typography.button.md,
  badgeText: typography.tiny,

  // Dashboard specific
  cardTitle: typography.h4,
  cardSubtitle: typography.caption,
  metricValue: typography.display.md,
  metricLabel: typography.caption,

  // Typography utilities (accessible through semantic API)
  fontWeight,
  lineHeight,
  letterSpacing,

  // Heading references (for backward compatibility)
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
  h4: typography.h4,
  h5: typography.h5,
  heading: typography.heading,

  // Table typography
  tableCell: typography.tableCell,
  tableHeader: typography.tableHeader,
  h6: typography.h6,

  // Additional properties used by components
  tightLine: 'leading-tight',
  wideSpacing: 'tracking-wide',

  // Missing properties referenced by components
  title: typography.h3, // Maps to text-xl lg:text-2xl font-semibold tracking-tight
} as const

export type TypographyToken = keyof typeof typography
export type SemanticTypographyToken = keyof typeof semanticTypography
export type FontWeightToken = keyof typeof fontWeight
export type LineHeightToken = keyof typeof lineHeight
export type LetterSpacingToken = keyof typeof letterSpacing
