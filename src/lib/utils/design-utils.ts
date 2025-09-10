/**
 * Design Utility Functions
 * 
 * Helper functions for applying design tokens consistently across components.
 * These utilities abstract common design patterns and ensure consistency.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { designTokens } from '@/lib/design-tokens'

// =============================================================================
// CORE UTILITY FUNCTIONS
// =============================================================================

/**
 * Enhanced cn function with design token support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Component variant class generator
 */
export function getVariantClasses(
  component: 'button' | 'input' | 'card' | 'badge',
  variant: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md',
  additionalClasses?: string
) {
  const baseClasses: Record<string, string> = {
    button: 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    input: 'flex w-full border border-input bg-transparent transition-colors file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    card: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    badge: 'inline-flex items-center border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  }

  const sizeClasses: Record<string, Record<string, string>> = {
    button: {
      xs: 'h-6 px-2 text-xs gap-1 min-w-16',
      sm: 'h-8 px-3 text-sm gap-1.5 min-w-20',
      md: 'h-9 px-4 text-sm gap-2 min-w-24',
      lg: 'h-10 px-6 text-base gap-2 min-w-32',
      xl: 'h-12 px-8 text-lg gap-3 min-w-40',
    },
    input: {
      xs: 'h-6 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
      xl: 'h-12 px-4 text-lg',
    },
    card: {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    badge: {
      xs: 'px-1.5 py-0.5 text-xs rounded',
      sm: 'px-2 py-0.5 text-xs rounded-md',
      md: 'px-2.5 py-0.5 text-sm rounded-md',
      lg: 'px-3 py-1 text-sm rounded-lg',
      xl: 'px-4 py-1.5 text-base rounded-lg',
    },
  }

  return cn(
    baseClasses[component],
    sizeClasses[component][variant],
    additionalClasses
  )
}

// =============================================================================
// LAYOUT UTILITIES
// =============================================================================

/**
 * Generate responsive grid classes
 */
export function getGridClasses(
  columns: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number } = { md: 1 }
) {
  const classes = []
  
  if (columns.xs) classes.push(`grid-cols-${columns.xs}`)
  if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`)
  if (columns.md) classes.push(`md:grid-cols-${columns.md}`)
  if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`)
  if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`)
  
  return cn('grid gap-4', classes.join(' '))
}

/**
 * Generate responsive spacing classes
 */
export function getSpacingClasses(
  type: 'padding' | 'margin' | 'gap',
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md',
  direction?: 'x' | 'y' | 't' | 'r' | 'b' | 'l'
) {
  const sizeMap = {
    xs: '1',
    sm: '2',
    md: '4',
    lg: '6',
    xl: '8',
    '2xl': '12',
  }

  const prefix = type === 'padding' ? 'p' : type === 'margin' ? 'm' : 'gap'
  const suffix = direction ? `-${direction}` : ''
  
  return `${prefix}${suffix}-${sizeMap[size]}`
}

// =============================================================================
// FORM UTILITIES
// =============================================================================

/**
 * Generate form field wrapper classes
 */
export function getFormFieldClasses(
  layout: 'vertical' | 'horizontal' = 'vertical',
  size: 'sm' | 'md' | 'lg' = 'md'
) {
  const baseClasses = 'space-y-2'
  
  const layoutClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row items-center space-y-0 space-x-4',
  }
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }
  
  return cn(baseClasses, layoutClasses[layout], sizeClasses[size])
}

/**
 * Generate form grid layout classes
 */
export function getFormGridClasses(
  columns: 1 | 2 | 3 | 4 = 1,
  responsive = true
) {
  const baseClasses = 'grid gap-4'
  
  if (!responsive) {
    return cn(baseClasses, `grid-cols-${columns}`)
  }
  
  // Responsive grid patterns
  const responsiveClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }
  
  return cn(baseClasses, responsiveClasses[columns])
}

// =============================================================================
// STATUS & STATE UTILITIES
// =============================================================================

/**
 * Generate status indicator classes
 */
export function getStatusClasses(
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral',
  variant: 'solid' | 'outline' | 'subtle' = 'subtle'
) {
  const statusMap = {
    success: {
      solid: 'bg-success text-success-foreground',
      outline: 'border-success text-success bg-transparent',
      subtle: 'bg-success/10 text-success border-success/20',
    },
    warning: {
      solid: 'bg-warning text-warning-foreground',
      outline: 'border-warning text-warning bg-transparent',
      subtle: 'bg-warning/10 text-warning border-warning/20',
    },
    danger: {
      solid: 'bg-destructive text-destructive-foreground',
      outline: 'border-destructive text-destructive bg-transparent',
      subtle: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    info: {
      solid: 'bg-info text-info-foreground',
      outline: 'border-info text-info bg-transparent',
      subtle: 'bg-info/10 text-info border-info/20',
    },
    neutral: {
      solid: 'bg-muted text-muted-foreground',
      outline: 'border-muted-foreground text-muted-foreground bg-transparent',
      subtle: 'bg-muted/50 text-muted-foreground border-muted',
    },
  }
  
  return statusMap[status][variant]
}

/**
 * Generate loading state classes
 */
export function getLoadingClasses(
  type: 'spinner' | 'skeleton' | 'pulse' = 'spinner',
  size: 'sm' | 'md' | 'lg' = 'md'
) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }
  
  const typeClasses = {
    spinner: 'animate-spin',
    skeleton: 'animate-pulse bg-muted rounded',
    pulse: 'animate-pulse',
  }
  
  return cn(sizeClasses[size], typeClasses[type])
}

// =============================================================================
// INTERACTION UTILITIES
// =============================================================================

/**
 * Generate focus ring classes
 */
export function getFocusClasses(
  variant: 'default' | 'inset' | 'none' = 'default'
) {
  const variants = {
    default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    inset: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    none: 'focus-visible:outline-none',
  }
  
  return variants[variant]
}

/**
 * Generate hover state classes
 */
export function getHoverClasses(
  type: 'button' | 'card' | 'link' = 'button',
  intensity: 'subtle' | 'medium' | 'strong' = 'medium'
) {
  const typeMap = {
    button: {
      subtle: 'hover:bg-accent hover:text-accent-foreground',
      medium: 'hover:bg-primary/90',
      strong: 'hover:bg-primary/80',
    },
    card: {
      subtle: 'hover:bg-accent/50',
      medium: 'hover:bg-accent',
      strong: 'hover:bg-accent hover:shadow-md',
    },
    link: {
      subtle: 'hover:text-primary/80',
      medium: 'hover:text-primary hover:underline',
      strong: 'hover:text-primary hover:underline hover:underline-offset-4',
    },
  }
  
  return typeMap[type][intensity]
}

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

/**
 * Generate responsive visibility classes
 */
export function getVisibilityClasses(
  breakpoint: 'sm' | 'md' | 'lg' | 'xl',
  direction: 'show' | 'hide' = 'show'
) {
  const prefix = direction === 'show' ? '' : 'hidden '
  const suffix = direction === 'show' ? `:block` : `:hidden`
  
  return `${prefix}${breakpoint}${suffix}`
}

/**
 * Generate responsive text size classes
 */
export function getResponsiveTextClasses(
  sizes: { sm?: string; md?: string; lg?: string; xl?: string }
) {
  const classes = []
  
  if (sizes.sm) classes.push(`text-${sizes.sm}`)
  if (sizes.md) classes.push(`md:text-${sizes.md}`)
  if (sizes.lg) classes.push(`lg:text-${sizes.lg}`)
  if (sizes.xl) classes.push(`xl:text-${sizes.xl}`)
  
  return cn(classes.join(' '))
}

// =============================================================================
// EXPORT ALL UTILITIES
// =============================================================================

export const designUtils = {
  // Core
  cn,
  getVariantClasses,
  
  // Layout
  getGridClasses,
  getSpacingClasses,
  
  // Forms
  getFormFieldClasses,
  getFormGridClasses,
  
  // Status & State
  getStatusClasses,
  getLoadingClasses,
  
  // Interaction
  getFocusClasses,
  getHoverClasses,
  
  // Responsive
  getVisibilityClasses,
  getResponsiveTextClasses,
} as const

export default designUtils