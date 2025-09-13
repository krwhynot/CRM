/**
 * Breakpoint Design Tokens
 *
 * Provides responsive design breakpoints following mobile-first approach.
 * Aligned with Tailwind CSS defaults but with CRM-specific considerations.
 */

// Base Breakpoint Values (in pixels)
export const breakpointValues = {
  xs: 0, // Mobile phones (portrait)
  sm: 640, // Mobile phones (landscape) / Small tablets
  md: 768, // Tablets (portrait) / iPad Mini
  lg: 1024, // Tablets (landscape) / Small laptops / iPad Pro
  xl: 1280, // Desktop / Large laptops
  '2xl': 1536, // Large desktop / 4K displays

  // CRM-specific breakpoints
  mobile: 480, // Small mobile devices
  tablet: 768, // Standard tablet size
  desktop: 1024, // Standard desktop
  wide: 1440, // Wide desktop
  ultrawide: 1920, // Ultra-wide displays
} as const

// Media Query Strings
export const mediaQueries = {
  // Standard breakpoints (min-width)
  xs: '(min-width: 0px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',

  // Max-width queries
  maxXs: '(max-width: 639px)',
  maxSm: '(max-width: 767px)',
  maxMd: '(max-width: 1023px)',
  maxLg: '(max-width: 1279px)',
  maxXl: '(max-width: 1535px)',

  // Range queries
  smToMd: '(min-width: 640px) and (max-width: 767px)',
  mdToLg: '(min-width: 768px) and (max-width: 1023px)',
  lgToXl: '(min-width: 1024px) and (max-width: 1279px)',
  xlTo2xl: '(min-width: 1280px) and (max-width: 1535px)',

  // Device-specific queries
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',

  // Orientation queries
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',

  // High-DPI displays
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',

  // CRM-optimized queries
  crmMobile: '(max-width: 767px)',
  crmTablet: '(min-width: 768px) and (max-width: 1199px)',
  crmDesktop: '(min-width: 1200px)',

  // Touch device detection
  touch: '(pointer: coarse)',
  noTouch: '(pointer: fine)',
} as const

// Responsive Container Sizes
export const containerSizes = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',

  // CRM-specific containers
  sidebar: '280px',
  sidebarCollapsed: '80px',
  content: 'calc(100% - 280px)',
  contentCollapsed: 'calc(100% - 80px)',

  // Modal sizes
  modalSm: '400px',
  modalMd: '600px',
  modalLg: '800px',
  modalXl: '1200px',
  modalFull: '95vw',
} as const

// Grid Column Configurations
export const gridColumns = {
  xs: 1, // 1 column on mobile
  sm: 2, // 2 columns on small screens
  md: 3, // 3 columns on medium screens
  lg: 4, // 4 columns on large screens
  xl: 6, // 6 columns on extra large screens
  '2xl': 8, // 8 columns on 2xl screens

  // CRM-specific grid configurations
  organizationCards: {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 5,
  },

  contactCards: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 6,
  },

  dashboardWidgets: {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4,
  },
} as const

// Responsive Spacing Multipliers
export const spacingMultipliers = {
  xs: 0.5, // Tight spacing on mobile
  sm: 0.75, // Slightly more space
  md: 1, // Base spacing
  lg: 1.25, // More generous spacing
  xl: 1.5, // Even more spacing
  '2xl': 2, // Maximum spacing
} as const

// Typography Scale Modifiers by Breakpoint
export const typographyScales = {
  xs: 0.875, // Smaller text on mobile
  sm: 0.9375, // Slightly smaller
  md: 1, // Base scale
  lg: 1.0625, // Slightly larger
  xl: 1.125, // Larger text on desktop
  '2xl': 1.25, // Maximum scale
} as const

// Tailwind CSS Breakpoint Classes
export const breakpointClasses = {
  // Display utilities
  hidden: {
    xs: '',
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
    xl: 'xl:hidden',
    '2xl': '2xl:hidden',
  },

  block: {
    xs: 'block',
    sm: 'sm:block',
    md: 'md:block',
    lg: 'lg:block',
    xl: 'xl:block',
    '2xl': '2xl:block',
  },

  // Flexbox
  flex: {
    xs: 'flex',
    sm: 'sm:flex',
    md: 'md:flex',
    lg: 'lg:flex',
    xl: 'xl:flex',
    '2xl': '2xl:flex',
  },

  // Grid
  grid: {
    xs: 'grid',
    sm: 'sm:grid',
    md: 'md:grid',
    lg: 'lg:grid',
    xl: 'xl:grid',
    '2xl': '2xl:grid',
  },

  // Text alignment
  textCenter: {
    xs: 'text-center',
    sm: 'sm:text-center',
    md: 'md:text-center',
    lg: 'lg:text-center',
    xl: 'xl:text-center',
    '2xl': '2xl:text-center',
  },

  textLeft: {
    xs: 'text-left',
    sm: 'sm:text-left',
    md: 'md:text-left',
    lg: 'lg:text-left',
    xl: 'xl:text-left',
    '2xl': '2xl:text-left',
  },
} as const

// CRM-Specific Responsive Patterns
export const crmResponsivePatterns = {
  // Table responsive behavior
  table: {
    mobile: 'block overflow-x-auto',
    tablet: 'table-auto',
    desktop: 'table-fixed',
  },

  // Sidebar responsive behavior
  sidebar: {
    mobile: 'fixed inset-y-0 left-0 w-64 transform -translate-x-full transition-transform',
    tablet: 'fixed inset-y-0 left-0 w-64 transform transition-transform',
    desktop: 'static w-64 transform-none',
  },

  // Card grid responsive behavior
  cardGrid: {
    mobile: 'grid grid-cols-1 gap-4',
    tablet: 'grid grid-cols-2 gap-6',
    desktop: 'grid grid-cols-3 gap-8',
    wide: 'grid grid-cols-4 gap-8',
  },

  // Form layout responsive behavior
  form: {
    mobile: 'space-y-4',
    tablet: 'space-y-6 max-w-md',
    desktop: 'space-y-6 max-w-lg',
  },

  // Modal responsive behavior
  modal: {
    mobile: 'w-full h-full',
    tablet: 'w-full max-w-md',
    desktop: 'w-full max-w-lg',
  },
} as const

// Responsive utility functions
export const responsiveUtilities = {
  // Get breakpoint value
  getBreakpointValue: (breakpoint: keyof typeof breakpointValues): number =>
    breakpointValues[breakpoint],

  // Check if current viewport matches breakpoint
  matchesBreakpoint: (breakpoint: keyof typeof mediaQueries): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(mediaQueries[breakpoint]).matches
  },

  // Get current active breakpoint
  getCurrentBreakpoint: (): keyof typeof breakpointValues => {
    if (typeof window === 'undefined') return 'xs'

    const width = window.innerWidth

    if (width >= breakpointValues['2xl']) return '2xl'
    if (width >= breakpointValues.xl) return 'xl'
    if (width >= breakpointValues.lg) return 'lg'
    if (width >= breakpointValues.md) return 'md'
    if (width >= breakpointValues.sm) return 'sm'
    return 'xs'
  },

  // Generate responsive class names
  generateResponsiveClasses: (
    base: string,
    overrides: Partial<Record<keyof typeof breakpointValues, string>>
  ): string => {
    const classes = [base]

    Object.entries(overrides).forEach(([breakpoint, className]) => {
      if (breakpoint !== 'xs' && className) {
        classes.push(`${breakpoint}:${className}`)
      } else if (breakpoint === 'xs' && className) {
        classes[0] = className // Override base class for xs
      }
    })

    return classes.join(' ')
  },
} as const

// TypeScript types
export type Breakpoint = keyof typeof breakpointValues
export type MediaQuery = keyof typeof mediaQueries
export type ContainerSize = keyof typeof containerSizes

// Export consolidated breakpoint tokens
export const breakpointTokens = {
  values: breakpointValues,
  mediaQueries,
  containers: containerSizes,
  gridColumns,
  spacingMultipliers,
  typographyScales,
  classes: breakpointClasses,
  patterns: crmResponsivePatterns,
  utilities: responsiveUtilities,
} as const
