/**
 * UI Styles Configuration
 *
 * Centralized configuration for UI styles, colors, and visual elements
 * used in development tools, error pages, and utility components.
 *
 * Updated to use semantic design tokens for consistency with the CRM design system.
 * All colors now reference CSS variables for proper theme support.
 */

// Helper function to get CSS variable values for development tools
const getCSSVar = (variable: string): string => `hsl(var(${variable}))`

// Color palette for development tools and utilities using semantic tokens
export const devToolColors = {
  background: {
    primary: getCSSVar('--muted'),           // Neutral background using muted token
    secondary: getCSSVar('--background'),     // Clean white/dark background
    accent: getCSSVar('--accent'),           // Subtle accent background
  },

  text: {
    primary: getCSSVar('--info'),            // Info blue for primary dev tool text
    secondary: getCSSVar('--foreground'),     // Standard text color
    muted: getCSSVar('--muted-foreground'),  // Muted text for less important content
  },

  status: {
    error: getCSSVar('--destructive'),            // Semantic error color
    errorBackground: getCSSVar('--destructive')+'/10',  // Light error background
    warning: getCSSVar('--warning'),              // Semantic warning color
    warningBackground: getCSSVar('--warning')+'/10',    // Light warning background
    success: getCSSVar('--success'),              // Semantic success color
    successBackground: getCSSVar('--success')+'/10',    // Light success background
  },

  border: {
    default: getCSSVar('--border'),          // Standard border color
    accent: getCSSVar('--accent'),           // Accent border for emphasis
  },

  code: {
    background: getCSSVar('--muted'),        // Code block background
    text: getCSSVar('--foreground'),         // Code text color
  },
} as const

// Typography styles for development tools
export const devToolTypography = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  fontSize: {
    base: '14px',
    large: '2em',
    small: '12px',
  },

  fontWeight: {
    normal: '400',
    semibold: '600',
    bold: '700',
  },
} as const

// Layout dimensions for development tools
export const devToolLayout = {
  spacing: {
    xs: '10px',
    sm: '15px',
    md: '20px',
    lg: '30px',
  },

  borderRadius: {
    default: '6px',
    small: '4px',
    large: '8px',
  },

  shadow: {
    card: '0 2px 10px rgba(0,0,0,0.1)',
  },

  maxWidth: '1200px',
} as const

/**
 * CSS generation helpers for development tools
 *
 * Generates CSS using semantic design tokens for theme-aware development utilities.
 * All generated styles automatically adapt to light/dark theme changes.
 */
export const generateDevToolCSS = () => {
  const { colors, typography, layout } = {
    colors: devToolColors,
    typography: devToolTypography,
    layout: devToolLayout,
  }

  return `
    /* Development tool styles using semantic design tokens */
    body {
      font-family: ${typography.fontFamily};
      margin: 0;
      padding: ${layout.spacing.md};
      background: ${colors.background.primary};
      color: ${colors.text.secondary};
    }

    .container {
      max-width: ${layout.maxWidth};
      margin: 0 auto;
      background: ${colors.background.secondary};
      padding: ${layout.spacing.lg};
      border-radius: ${layout.borderRadius.large};
      box-shadow: ${layout.shadow.card};
      border: 1px solid ${colors.border.default};
    }

    h1, h2, h3 {
      color: ${colors.text.primary};
      margin: 0 0 ${layout.spacing.sm} 0;
    }

    .stat-card {
      background: ${colors.background.accent};
      padding: ${layout.spacing.md};
      border-radius: ${layout.borderRadius.default};
      text-align: center;
      border: 1px solid ${colors.border.default};
    }

    .stat-number {
      font-size: ${typography.fontSize.large};
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.text.primary};
    }

    .error {
      background: ${colors.status.errorBackground};
      border-left: 4px solid ${colors.status.error};
      padding: ${layout.spacing.sm};
      margin: ${layout.spacing.xs} 0;
      border-radius: ${layout.borderRadius.small};
    }

    .warning {
      background: ${colors.status.warningBackground};
      border-left: 4px solid ${colors.status.warning};
      padding: ${layout.spacing.sm};
      margin: ${layout.spacing.xs} 0;
      border-radius: ${layout.borderRadius.small};
    }

    .success {
      background: ${colors.status.successBackground};
      border-left: 4px solid ${colors.status.success};
      padding: ${layout.spacing.sm};
      margin: ${layout.spacing.xs} 0;
      border-radius: ${layout.borderRadius.small};
    }

    .code {
      background: ${colors.code.background};
      color: ${colors.code.text};
      padding: ${layout.spacing.xs};
      border-radius: ${layout.borderRadius.small};
      border: 1px solid ${colors.border.default};
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      overflow-x: auto;
    }

    /* Theme-aware utilities */
    @media (prefers-color-scheme: dark) {
      body {
        /* Dark theme automatically handled by CSS variables */
      }
    }
  `
}

/**
 * Semantic token utilities for development tools
 *
 * Provides helper functions and utilities for working with design tokens
 * in development and utility contexts.
 */

// Get semantic token value by name (for development utilities)
export const getSemanticToken = (tokenName: string): string => {
  return getCSSVar(`--${tokenName}`)
}

// Development tool theme utilities
export const devToolTheme = {
  isDark: () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  getThemeAwareColor: (lightToken: string, darkToken: string) => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? getCSSVar(`--${darkToken}`)
      : getCSSVar(`--${lightToken}`)
  }
}

// Export individual style objects for flexible usage
export { devToolColors as colors, devToolTypography as typography, devToolLayout as layout }

// Export semantic token categories for development utilities
export const semanticTokenCategories = {
  surfaces: ['background', 'card', 'popover', 'muted', 'accent'],
  text: ['foreground', 'muted-foreground', 'primary-foreground', 'secondary-foreground'],
  intent: ['success', 'warning', 'info', 'destructive'],
  interaction: ['primary', 'secondary', 'border', 'ring', 'focus-ring'],
  chart: ['chart-primary', 'chart-success', 'chart-warning', 'chart-info', 'chart-accent']
} as const
