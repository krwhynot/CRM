/**
 * Color Design Tokens
 *
 * Semantic color system that extends Tailwind CSS colors and provides
 * consistent color usage across the CRM application with dark mode support.
 */

// Base color palette (extending Tailwind defaults)
export const colors = {
  // Primary brand colors
  primary: {
    50: 'bg-primary/5',
    100: 'bg-primary/10',
    500: 'bg-primary',
    600: 'bg-primary/90',
    700: 'bg-primary/80',
    foreground: 'text-primary-foreground',
  },

  // Secondary colors
  secondary: {
    50: 'bg-secondary/5',
    100: 'bg-secondary/10',
    500: 'bg-secondary',
    600: 'bg-secondary/90',
    700: 'bg-secondary/80',
    foreground: 'text-secondary-foreground',
  },

  // Semantic state colors
  success: {
    50: 'bg-green-50',
    100: 'bg-green-100',
    500: 'bg-green-500',
    600: 'bg-green-600',
    700: 'bg-green-700',
    foreground: 'text-white',
  },

  warning: {
    50: 'bg-yellow-50',
    100: 'bg-yellow-100',
    500: 'bg-yellow-500',
    600: 'bg-yellow-600',
    700: 'bg-yellow-700',
    foreground: 'text-white',
  },

  error: {
    50: 'bg-destructive/5',
    100: 'bg-destructive/10',
    500: 'bg-destructive',
    600: 'bg-destructive/90',
    700: 'bg-destructive/80',
    foreground: 'text-destructive-foreground',
  },

  info: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    foreground: 'text-white',
  },

  // Neutral colors
  neutral: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
  },
} as const

// Text color variants
export const textColors = {
  // Primary text colors
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  tertiary: 'text-muted-foreground/70',

  // Semantic text colors
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-destructive',
  info: 'text-blue-600 dark:text-blue-400',

  // Interactive text colors
  link: 'text-primary hover:text-primary/80',
  linkMuted: 'text-muted-foreground hover:text-foreground',

  // Inverse colors
  inverse: 'text-primary-foreground',

  // Disabled state
  disabled: 'text-muted-foreground/50',
} as const

// Border color variants
export const borderColors = {
  default: 'border-border',
  muted: 'border-border/50',
  strong: 'border-foreground/20',

  // Semantic borders
  success: 'border-green-500',
  warning: 'border-yellow-500',
  error: 'border-destructive',
  info: 'border-blue-500',

  // Interactive borders
  input: 'border-input',
  inputFocus: 'border-ring',

  // Table borders
  table: 'border-border',
  tableHeader: 'border-border',
} as const

// Semantic color aliases for CRM-specific use cases
export const semanticColors = {
  // Page elements
  pageBackground: 'bg-background',
  cardBackground: 'bg-card',
  modalBackground: 'bg-popover',

  // Text colors
  text: {
    primary: textColors.primary,
    secondary: textColors.secondary,
    tertiary: textColors.tertiary,
    info: textColors.info,
    success: textColors.success,
    warning: textColors.warning,
    error: textColors.error,
    accent: 'text-accent',
    danger: textColors.error,
    subtle: 'text-muted-foreground/60',
    muted: textColors.secondary,
    infoAccent: 'text-blue-700 dark:text-blue-300',
    warningAccent: 'text-yellow-700 dark:text-yellow-300',
  },

  // Shorthand text color alias for backward compatibility
  textSecondary: textColors.secondary,

  // Semantic colors with text, background, and border variants
  success: {
    primary: 'text-green-500',
    background: 'bg-green-50',
    border: 'border-green-200',
    foreground: 'text-green-700',
  },

  warning: {
    primary: 'text-yellow-500',
    background: 'bg-yellow-50',
    border: 'border-yellow-200',
    foreground: 'text-yellow-700',
  },

  error: {
    primary: 'bg-red-500',
    background: 'bg-red-50',
    border: 'border-red-200',
    foreground: 'text-red-700',
  },

  info: {
    primary: 'text-blue-500',
    background: 'bg-blue-50',
    border: 'border-blue-200',
    foreground: 'text-blue-700',
  },

  neutral: {
    200: 'bg-gray-200',
    background: 'bg-gray-50',
    border: 'border-gray-200',
    foreground: 'text-gray-700',
  },

  // Entity status colors
  entityActive: colors.success[500],
  entityInactive: colors.neutral[400],
  entityPending: colors.warning[500],
  entityError: colors.error[500],

  // Priority indicators
  priorityHigh: colors.error[500],
  priorityMedium: colors.warning[500],
  priorityLow: colors.info[500],
  priorityNone: colors.neutral[400],

  // Opportunity stages
  opportunityNew: colors.info[500],
  opportunityQualified: colors.warning[500],
  opportunityProposal: colors.warning[600],
  opportunityNegotiation: colors.warning[700],
  opportunityWon: colors.success[500],
  opportunityLost: colors.error[500],

  // Data visualization
  chartPrimary: colors.primary[500],
  chartSecondary: colors.secondary[500],
  chartTertiary: colors.info[500],
  chartQuaternary: colors.warning[500],

  // Interactive states
  hoverBackground: 'hover:bg-muted/50',
  activeBackground: 'bg-muted',
  focusRing: 'focus-visible:ring-1 focus-visible:ring-ring',

  // Hover state variations
  hoverStates: {
    subtle: 'hover:bg-muted/30',
    default: 'hover:bg-muted/50',
    strong: 'hover:bg-muted/80',
  },

  // Focus state variations
  focusStates: {
    info: 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
    success: 'focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
    warning: 'focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500',
    error: 'focus:ring-2 focus:ring-red-500/20 focus:border-red-500',
    default: 'focus:ring-2 focus:ring-ring/20 focus:border-ring',
  },

  // Border variations
  borderStyles: {
    subtle: 'border-border/30',
    default: 'border-border',
    strong: 'border-border/80',
    muted: 'border-muted-foreground/20',
  },

  // Background variations
  backgrounds: {
    subtle: 'bg-muted/20',
    default: 'bg-background',
    muted: 'bg-muted',
    card: 'bg-card',
  },

  // Extended background variations for component use
  background: {
    info: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    danger: 'bg-red-50',
    muted: 'bg-muted',
    successSolid: 'bg-green-500',
  },

  // Extended border variations
  border: {
    info: 'border-blue-200',
    success: 'border-green-200',
    warning: 'border-yellow-200',
    danger: 'border-red-200',
    infoSubtle: 'border-blue-100',
  },

  // Hover state extensions
  hover: {
    primarySubtle: 'hover:bg-primary/10',
    successSubtle: 'hover:bg-green-50',
    infoSubtle: 'hover:bg-blue-50',
    dangerSubtle: 'hover:bg-red-50',
  },

  // Additional semantic colors needed by components
  muted: 'bg-muted text-muted-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  caution: 'bg-yellow-500 text-white',
  criticalSolid: 'bg-red-600 text-white',
  backgroundDefault: 'bg-background',
  borderDefault: 'border-border',
  hoverDefault: 'hover:bg-accent hover:text-accent-foreground',

  // Form states
  fieldDefault: 'bg-background border-input',
  fieldFocus: 'bg-background border-ring',
  fieldError: 'bg-background border-destructive',
  fieldDisabled: 'bg-muted border-muted-foreground/20',

  // Badge colors for status, priority, and organization type
  badges: {
    // Status badges
    statusActive: 'bg-green-100 text-green-800 border-green-300',
    statusInactive: 'bg-gray-100 text-gray-700 border-gray-300',
    statusPending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    statusArchived: 'bg-red-100 text-red-800 border-red-300',

    // Priority badges
    priorityAPlus: 'bg-red-100 text-red-800 border-red-300',
    priorityA: 'bg-red-50 text-red-700 border-red-200',
    priorityB: 'bg-orange-100 text-orange-800 border-orange-300',
    priorityC: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    priorityD: 'bg-gray-100 text-gray-700 border-gray-300',

    // Organization type badges
    orgCustomer: 'bg-blue-100 text-blue-800 border-blue-300',
    orgDistributor: 'bg-green-100 text-green-800 border-green-300',
    orgPrincipal: 'bg-purple-100 text-purple-800 border-purple-300',
    orgSupplier: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },

  // Alert colors for CRM context
  alerts: {
    default: 'bg-card text-card-foreground border-border',
    success:
      'bg-green-50/50 text-green-900 border-green-200 dark:bg-green-950/20 dark:text-green-100 dark:border-green-900/50 [&>svg]:text-green-600',
    warning:
      'bg-yellow-50/50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-100 dark:border-yellow-900/50 [&>svg]:text-yellow-600',
    error:
      'bg-red-50/50 text-red-900 border-red-200 dark:bg-red-950/20 dark:text-red-100 dark:border-red-900/50 [&>svg]:text-red-600',
    info: 'bg-blue-50/50 text-blue-900 border-blue-200 dark:bg-blue-950/20 dark:text-blue-100 dark:border-blue-900/50 [&>svg]:text-blue-600',
    pending:
      'bg-orange-50/50 text-orange-900 border-orange-200 dark:bg-orange-950/20 dark:text-orange-100 dark:border-orange-900/50 [&>svg]:text-orange-600',
    opportunity:
      'bg-purple-50/50 text-purple-900 border-purple-200 dark:bg-purple-950/20 dark:text-purple-100 dark:border-purple-900/50 [&>svg]:text-purple-600',
    system:
      'bg-gray-50/50 text-gray-900 border-gray-200 dark:bg-gray-950/20 dark:text-gray-100 dark:border-gray-900/50 [&>svg]:text-gray-600',
  },

  // Interaction type colors
  interactionTypes: {
    // Email
    email: 'bg-blue-100',
    emailText: 'text-blue-800',
    emailBorder: 'border-blue-200',

    // Call
    call: 'bg-green-100',
    callText: 'text-green-800',
    callBorder: 'border-green-200',

    // Meeting
    meeting: 'bg-purple-100',
    meetingText: 'text-purple-800',
    meetingBorder: 'border-purple-200',

    // Demo
    demo: 'bg-orange-100',
    demoText: 'text-orange-800',
    demoBorder: 'border-orange-200',

    // Proposal
    proposal: 'bg-red-100',
    proposalText: 'text-red-800',
    proposalBorder: 'border-red-200',

    // Follow up
    followUp: 'bg-yellow-100',
    followUpText: 'text-yellow-800',
    followUpBorder: 'border-yellow-200',

    // Trade show
    tradeShow: 'bg-pink-100',
    tradeShowText: 'text-pink-800',
    tradeShowBorder: 'border-pink-200',

    // Site visit
    siteVisit: 'bg-indigo-100',
    siteVisitText: 'text-indigo-800',
    siteVisitBorder: 'border-indigo-200',

    // Default
    default: 'bg-gray-100',
    defaultText: 'text-gray-800',
    defaultBorder: 'border-gray-200',
  },
} as const

export type ColorToken = keyof typeof colors
export type TextColorToken = keyof typeof textColors
export type BorderColorToken = keyof typeof borderColors
export type SemanticColorToken = keyof typeof semanticColors
