/**
 * Design Token System for CRM
 * 
 * Centralized design tokens that standardize spacing, typography, sizing,
 * and component variants across the entire application.
 */

// =============================================================================
// SPACING SYSTEM
// =============================================================================

export const spacing = {
  // Base spacing scale (rem units)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  '4xl': '2.5rem',  // 40px
  '5xl': '3rem',    // 48px
  '6xl': '4rem',    // 64px
  
  // Component-specific spacing
  component: {
    padding: {
      xs: '0.375rem 0.75rem',    // 6px 12px
      sm: '0.5rem 1rem',         // 8px 16px  
      md: '0.75rem 1.5rem',      // 12px 24px
      lg: '1rem 2rem',           // 16px 32px
      xl: '1.25rem 2.5rem',      // 20px 40px
    },
    margin: {
      section: '2rem',           // 32px
      card: '1.5rem',           // 24px
      element: '1rem',          // 16px
      tight: '0.5rem',          // 8px
    },
    gap: {
      xs: '0.25rem',            // 4px
      sm: '0.5rem',             // 8px
      md: '0.75rem',            // 12px
      lg: '1rem',               // 16px
      xl: '1.5rem',             // 24px
    }
  }
} as const

// =============================================================================
// TYPOGRAPHY SYSTEM  
// =============================================================================

export const typography = {
  // Font families
  fontFamily: {
    primary: ['Nunito', 'system-ui', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
  },
  
  // Font sizes with line heights
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px/16px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px/20px
    base: { size: '1rem', lineHeight: '1.5rem' },     // 16px/24px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px/28px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px/28px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px/32px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px/36px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px/40px
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Component typography
  component: {
    heading: {
      h1: { size: typography.fontSize['3xl'], weight: typography.fontWeight.bold },
      h2: { size: typography.fontSize['2xl'], weight: typography.fontWeight.semibold },
      h3: { size: typography.fontSize.xl, weight: typography.fontWeight.semibold },
      h4: { size: typography.fontSize.lg, weight: typography.fontWeight.medium },
    },
    body: {
      large: typography.fontSize.lg,
      default: typography.fontSize.base,
      small: typography.fontSize.sm,
      caption: typography.fontSize.xs,
    },
    ui: {
      button: typography.fontSize.sm,
      input: typography.fontSize.base,
      label: typography.fontSize.sm,
      helper: typography.fontSize.xs,
    }
  }
} as const

// =============================================================================
// COMPONENT SIZE VARIANTS
// =============================================================================

export const sizing = {
  // Standard size variants used across components
  variants: {
    xs: {
      height: '1.5rem',          // 24px
      padding: spacing.component.padding.xs,
      fontSize: typography.fontSize.xs,
      iconSize: '0.75rem',       // 12px
    },
    sm: {
      height: '2rem',            // 32px
      padding: spacing.component.padding.sm,
      fontSize: typography.fontSize.sm,
      iconSize: '1rem',          // 16px
    },
    md: {
      height: '2.5rem',          // 40px
      padding: spacing.component.padding.md,
      fontSize: typography.fontSize.base,
      iconSize: '1.25rem',       // 20px
    },
    lg: {
      height: '3rem',            // 48px
      padding: spacing.component.padding.lg,
      fontSize: typography.fontSize.lg,
      iconSize: '1.5rem',        // 24px
    },
    xl: {
      height: '3.5rem',          // 56px
      padding: spacing.component.padding.xl,
      fontSize: typography.fontSize.xl,
      iconSize: '1.75rem',       // 28px
    },
  },
  
  // Component-specific sizing
  component: {
    button: {
      minWidth: {
        xs: '4rem',              // 64px
        sm: '5rem',              // 80px
        md: '6rem',              // 96px
        lg: '8rem',              // 128px
        xl: '10rem',             // 160px
      }
    },
    input: {
      width: {
        xs: '8rem',              // 128px
        sm: '12rem',             // 192px
        md: '16rem',             // 256px
        lg: '20rem',             // 320px
        xl: '24rem',             // 384px
        full: '100%',
      }
    },
    dialog: {
      maxWidth: {
        xs: '20rem',             // 320px
        sm: '24rem',             // 384px
        md: '32rem',             // 512px
        lg: '48rem',             // 768px
        xl: '64rem',             // 1024px
        '2xl': '80rem',          // 1280px
      }
    }
  }
} as const

// =============================================================================
// ANIMATION & TRANSITIONS
// =============================================================================

export const motion = {
  // Transition durations
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Common transition combinations
  transition: {
    fast: `all ${motion.duration.fast} ${motion.easing.easeOut}`,
    normal: `all ${motion.duration.normal} ${motion.easing.easeOut}`,
    slow: `all ${motion.duration.slow} ${motion.easing.easeOut}`,
    colors: `color ${motion.duration.normal} ${motion.easing.easeOut}, background-color ${motion.duration.normal} ${motion.easing.easeOut}, border-color ${motion.duration.normal} ${motion.easing.easeOut}`,
    transform: `transform ${motion.duration.normal} ${motion.easing.easeOut}`,
    opacity: `opacity ${motion.duration.normal} ${motion.easing.easeOut}`,
  }
} as const

// =============================================================================
// LAYOUT BREAKPOINTS
// =============================================================================

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  
  // Semantic breakpoints
  mobile: '475px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
} as const

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
  max: 9999,
} as const

// =============================================================================
// BORDER RADIUS SCALE
// =============================================================================

export const radius = {
  none: '0',
  xs: '0.125rem',              // 2px
  sm: '0.25rem',               // 4px
  md: '0.375rem',              // 6px
  lg: '0.5rem',                // 8px
  xl: '0.75rem',               // 12px
  '2xl': '1rem',               // 16px
  '3xl': '1.5rem',             // 24px
  full: '9999px',
  
  // Component-specific radius
  component: {
    button: 'var(--radius)',
    input: 'var(--radius-sm)',
    card: 'var(--radius)',
    dialog: 'var(--radius)',
  }
} as const

// =============================================================================
// SHADOW SCALE
// =============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Component-specific shadows
  component: {
    card: shadows.sm,
    dropdown: shadows.lg,
    modal: shadows['2xl'],
    button: shadows.xs,
  }
} as const

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get consistent component sizing based on variant
 */
export function getComponentSize(variant: keyof typeof sizing.variants) {
  return sizing.variants[variant]
}

/**
 * Get typography styles for component type
 */
export function getTypographyStyle(type: keyof typeof typography.component) {
  return typography.component[type]
}

/**
 * Get spacing value with fallback
 */
export function getSpacing(size: keyof typeof spacing, fallback = spacing.md) {
  return spacing[size] || fallback
}

/**
 * Create consistent transition string
 */
export function createTransition(properties: string[], duration = motion.duration.normal, easing = motion.easing.easeOut) {
  return properties.map(prop => `${prop} ${duration} ${easing}`).join(', ')
}

// =============================================================================
// EXPORT DEFAULT DESIGN SYSTEM
// =============================================================================

export const designTokens = {
  spacing,
  typography,
  sizing,
  motion,
  breakpoints,
  zIndex,
  radius,
  shadows,
  
  // Utility functions
  getComponentSize,
  getTypographyStyle,
  getSpacing,
  createTransition,
} as const

export default designTokens