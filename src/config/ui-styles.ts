/**
 * UI Styles Configuration
 *
 * Centralized configuration for UI styles, colors, and visual elements
 * used in development tools, error pages, and utility components.
 */

// Color palette for development tools and utilities
export const devToolColors = {
  background: {
    primary: '#f5f5f5',
    secondary: '#ffffff',
    accent: '#f8f9fa',
  },

  text: {
    primary: '#2563eb',
    secondary: '#374151',
    muted: '#6b7280',
  },

  status: {
    error: '#dc2626',
    errorBackground: '#fee2e2',
    warning: '#d97706',
    warningBackground: '#fef3c7',
    success: '#059669',
    successBackground: '#d1fae5',
  },

  border: {
    default: '#e5e7eb',
    accent: '#d1d5db',
  },

  code: {
    background: '#f3f4f6',
    text: '#1f2937',
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

// CSS generation helpers for development tools
export const generateDevToolCSS = () => {
  const { colors, typography, layout } = {
    colors: devToolColors,
    typography: devToolTypography,
    layout: devToolLayout,
  }

  return `
    body { 
      font-family: ${typography.fontFamily}; 
      margin: 0; 
      padding: ${layout.spacing.md}; 
      background: ${colors.background.primary}; 
    }
    
    .container { 
      max-width: ${layout.maxWidth}; 
      margin: 0 auto; 
      background: ${colors.background.secondary}; 
      padding: ${layout.spacing.lg}; 
      border-radius: ${layout.borderRadius.large}; 
      box-shadow: ${layout.shadow.card}; 
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
    }
    
    .warning { 
      background: ${colors.status.warningBackground}; 
      border-left: 4px solid ${colors.status.warning}; 
      padding: ${layout.spacing.sm}; 
      margin: ${layout.spacing.xs} 0; 
    }
    
    .success { 
      background: ${colors.status.successBackground}; 
      border-left: 4px solid ${colors.status.success}; 
      padding: ${layout.spacing.sm}; 
      margin: ${layout.spacing.xs} 0; 
    }
    
    .code { 
      background: ${colors.code.background}; 
      padding: ${layout.spacing.xs}; 
      border-radius: ${layout.borderRadius.small}; 
      font-family: monospace; 
      overflow-x: auto; 
    }
  `
}

// Export individual style objects for flexible usage
export { devToolColors as colors, devToolTypography as typography, devToolLayout as layout }
