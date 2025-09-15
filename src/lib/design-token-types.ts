/**
 * Design Token TypeScript Definitions for KitchenPantry CRM
 *
 * Provides comprehensive type safety for the four-tier design token hierarchy.
 * These types enable autocompletion, validation, and better developer experience
 * when working with design tokens across the application.
 *
 * @see /docs/DESIGN_TOKEN_HIERARCHY.md - Complete documentation
 * @see /src/styles/tokens/ - Token implementations
 */

// =============================================================================
// LAYER 1: PRIMITIVE TOKENS
// =============================================================================

/**
 * Primitive tokens represent the foundational design values.
 * These are pure values with no semantic meaning attached.
 */
export interface PrimitiveTokens {
  // MFB Brand Colors - Primary Green
  '--mfb-green': string;
  '--mfb-green-hover': string;
  '--mfb-green-focus': string;
  '--mfb-green-active': string;
  '--mfb-green-light': string;
  '--mfb-green-subtle': string;

  // MFB Brand Colors - Clay
  '--mfb-clay': string;
  '--mfb-clay-hover': string;
  '--mfb-clay-focus': string;
  '--mfb-clay-active': string;
  '--mfb-clay-light': string;
  '--mfb-clay-subtle': string;

  // MFB Brand Colors - Cream
  '--mfb-cream': string;
  '--mfb-cream-hover': string;
  '--mfb-cream-focus': string;
  '--mfb-cream-active': string;
  '--mfb-cream-dark': string;
  '--mfb-cream-subtle': string;

  // MFB Brand Colors - Sage
  '--mfb-sage': string;
  '--mfb-sage-hover': string;
  '--mfb-sage-focus': string;
  '--mfb-sage-active': string;
  '--mfb-sage-light': string;
  '--mfb-sage-tint': string;
  '--mfb-sage-subtle': string;

  // MFB Brand Colors - Olive
  '--mfb-olive': string;
  '--mfb-olive-hover': string;
  '--mfb-olive-focus': string;
  '--mfb-olive-active': string;
  '--mfb-olive-light': string;
  '--mfb-olive-lighter': string;
  '--mfb-olive-subtle': string;

  // MFB Brand Colors - White
  '--mfb-white': string;
  '--mfb-white-hover': string;
  '--mfb-white-focus': string;
  '--mfb-white-active': string;

  // MFB Intent Colors
  '--mfb-success': string;
  '--mfb-success-hover': string;
  '--mfb-success-focus': string;
  '--mfb-success-active': string;

  '--mfb-warning': string;
  '--mfb-warning-hover': string;
  '--mfb-warning-focus': string;
  '--mfb-warning-active': string;

  '--mfb-danger': string;
  '--mfb-danger-hover': string;
  '--mfb-danger-focus': string;
  '--mfb-danger-active': string;

  '--mfb-info': string;
  '--mfb-info-hover': string;
  '--mfb-info-focus': string;
  '--mfb-info-active': string;

  // HSL Format Variants for shadcn/ui Integration
  '--mfb-green-hsl': string;
  '--mfb-clay-hsl': string;
  '--mfb-success-hsl': string;
  '--mfb-warning-hsl': string;
  '--mfb-danger-hsl': string;
  '--mfb-info-hsl': string;

  // Spacing Scale (rem units)
  '--space-0': string;
  '--space-1': string;    // 4px
  '--space-2': string;    // 8px
  '--space-3': string;    // 12px
  '--space-4': string;    // 16px
  '--space-5': string;    // 20px
  '--space-6': string;    // 24px
  '--space-8': string;    // 32px
  '--space-10': string;   // 40px
  '--space-12': string;   // 48px
  '--space-16': string;   // 64px
  '--space-20': string;   // 80px
  '--space-24': string;   // 96px

  // Typography Scale
  '--font-size-xs': string;    // 12px
  '--font-size-sm': string;    // 14px
  '--font-size-base': string;  // 15px
  '--font-size-lg': string;    // 18px
  '--font-size-xl': string;    // 20px
  '--font-size-2xl': string;   // 24px
  '--font-size-3xl': string;   // 32px
  '--font-size-4xl': string;   // 40px
  '--font-size-5xl': string;   // 48px

  // Font Weights
  '--font-weight-light': string;      // 300
  '--font-weight-normal': string;     // 400
  '--font-weight-medium': string;     // 500
  '--font-weight-semibold': string;   // 600
  '--font-weight-bold': string;       // 700

  // Line Heights
  '--line-height-none': string;     // 1
  '--line-height-tight': string;    // 1.2
  '--line-height-normal': string;   // 1.5
  '--line-height-relaxed': string;  // 1.75

  // Shadow Definitions
  '--shadow-xs': string;
  '--shadow-sm': string;
  '--shadow-md': string;
  '--shadow-lg': string;
  '--shadow-xl': string;
  '--shadow-2xl': string;
  '--shadow-inner': string;
}

// =============================================================================
// LAYER 2: SEMANTIC TOKENS
// =============================================================================

/**
 * Semantic tokens map primitive tokens to meaningful UI concepts.
 * These provide the abstraction layer for component styling.
 */
export interface SemanticTokens {
  // Core shadcn/ui Color Semantics
  '--primary': string;
  '--primary-foreground': string;
  '--primary-50': string;
  '--primary-100': string;
  '--primary-400': string;
  '--primary-600': string;

  '--secondary': string;
  '--secondary-foreground': string;

  '--destructive': string;
  '--destructive-foreground': string;

  '--success': string;
  '--success-foreground': string;

  '--warning': string;
  '--warning-foreground': string;

  '--info': string;
  '--info-foreground': string;

  // Surface Semantics
  '--background': string;
  '--foreground': string;
  '--card': string;
  '--card-foreground': string;
  '--popover': string;
  '--popover-foreground': string;

  // Interface Element Semantics
  '--muted': string;
  '--muted-foreground': string;
  '--accent': string;
  '--accent-foreground': string;
  '--border': string;
  '--input': string;
  '--ring': string;
  '--radius': string;

  // Unified Focus Ring System
  '--focus-ring': string;
  '--focus-ring-width': string;
  '--focus-ring-offset': string;
  '--focus-ring-opacity': string;
  '--focus-ring-style': string;
  '--focus-ring-inverse': string;
  '--focus-ring-destructive': string;
  '--focus-ring-success': string;
  '--focus-ring-warning': string;

  // CRM Priority Level Semantics
  '--priority-a-plus': string;
  '--priority-a-plus-foreground': string;
  '--priority-a': string;
  '--priority-a-foreground': string;
  '--priority-b': string;
  '--priority-b-foreground': string;
  '--priority-c': string;
  '--priority-c-foreground': string;
  '--priority-d': string;
  '--priority-d-foreground': string;

  // Organization Type Semantics
  '--org-customer': string;
  '--org-customer-foreground': string;
  '--org-distributor': string;
  '--org-distributor-foreground': string;
  '--org-principal': string;
  '--org-principal-foreground': string;
  '--org-supplier': string;
  '--org-supplier-foreground': string;

  // Market Segment Semantics
  '--segment-restaurant': string;
  '--segment-restaurant-foreground': string;
  '--segment-healthcare': string;
  '--segment-healthcare-foreground': string;
  '--segment-education': string;
  '--segment-education-foreground': string;

  // Semantic Spacing Mappings
  '--space-component-xs': string;
  '--space-component-sm': string;
  '--space-component-md': string;
  '--space-component-lg': string;
  '--space-component-xl': string;

  '--space-section-xs': string;
  '--space-section-sm': string;
  '--space-section-md': string;
  '--space-section-lg': string;
  '--space-section-xl': string;

  '--space-card-padding': string;
  '--space-card-gap': string;

  '--space-button-padding-x': string;
  '--space-button-padding-y': string;
  '--space-button-gap': string;

  '--space-form-field-gap': string;
  '--space-form-section-gap': string;
  '--space-form-padding': string;

  '--space-dashboard-grid-gap': string;
  '--space-kpi-padding': string;
  '--space-chart-margin': string;
}

// =============================================================================
// LAYER 3: COMPONENT TOKENS
// =============================================================================

/**
 * Component tokens extend semantic tokens with component-specific styling.
 * These tokens are scoped to specific UI components.
 */
export interface ComponentTokens {
  // Button Component Tokens
  '--btn-primary-bg': string;
  '--btn-primary-bg-hover': string;
  '--btn-primary-text': string;
  '--btn-primary-border': string;
  '--btn-primary-shadow': string;
  '--btn-primary-ring': string;

  '--btn-secondary-bg': string;
  '--btn-secondary-bg-hover': string;
  '--btn-secondary-text': string;
  '--btn-secondary-border': string;
  '--btn-secondary-ring': string;

  // Card Component Tokens
  '--card-bg': string;
  '--card-bg-hover': string;
  '--card-border': string;
  '--card-text': string;
  '--card-padding': string;
  '--card-gap': string;
  '--card-shadow': string;
  '--card-shadow-hover': string;

  // Input Component Tokens
  '--input-bg': string;
  '--input-border': string;
  '--input-border-focus': string;
  '--input-text': string;
  '--input-placeholder': string;
  '--input-padding': string;
  '--input-ring': string;

  // Dialog Component Tokens
  '--dialog-bg': string;
  '--dialog-border': string;
  '--dialog-shadow': string;
  '--dialog-overlay': string;
  '--dialog-padding': string;
  '--dialog-max-height': string;

  // Navigation Component Tokens
  '--nav-bg': string;
  '--nav-text': string;
  '--nav-active-bg': string;
  '--nav-active-text': string;
  '--nav-border': string;
  '--nav-padding': string;
}

// =============================================================================
// LAYER 4: FEATURE TOKENS
// =============================================================================

/**
 * Feature tokens provide specialized enhancements for specific features
 * like density modes, accessibility features, and advanced functionality.
 */
export interface FeatureTokens {
  // Density System Tokens
  '--density-mode': string;
  '--density-scale': string;
  '--density-multiplier': string;

  // Density-aware Dimensions
  '--kpi-height': string;
  '--chart-height': string;
  '--chart-height-sm': string;
  '--chart-height-lg': string;
  '--rail-width': string;
  '--font-scale': string;

  // High Contrast Enhancement Tokens
  '--hc-primary-bg': string;
  '--hc-secondary-bg': string;
  '--hc-danger-bg': string;

  // Colorblind-Safe Enhancement Tokens
  '--color-danger-colorblind-safe': string;
  '--color-success-colorblind-safe': string;
  '--color-warning-colorblind-safe': string;

  // Layout Enhancement Tokens
  '--header-height': string;
  '--sidebar-width': string;
  '--content-max-width': string;
  '--activity-feed-height': string;
  '--search-width-sm': string;
  '--search-width-lg': string;
}

// =============================================================================
// COMBINED TOKEN INTERFACE
// =============================================================================

/**
 * Combined interface containing all design tokens across all four layers.
 * Use this for comprehensive type checking and autocompletion.
 */
export interface DesignTokens extends PrimitiveTokens, SemanticTokens, ComponentTokens, FeatureTokens {}

// =============================================================================
// UTILITY TYPES AND HELPERS
// =============================================================================

/**
 * Union type of all token names for validation and utilities
 */
export type TokenName = keyof DesignTokens;

/**
 * Token categories for organizational purposes
 */
export type TokenCategory = 'primitive' | 'semantic' | 'component' | 'feature';

/**
 * Color token subcategories for better organization
 */
export type ColorTokenType =
  | 'brand'       // MFB brand colors
  | 'semantic'    // UI semantic colors (primary, secondary, etc.)
  | 'intent'      // Intent colors (success, warning, danger, info)
  | 'priority'    // CRM priority levels
  | 'organization' // Organization type colors
  | 'segment';    // Market segment colors

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  density: 'compact' | 'comfortable' | 'spacious';
  contrast: 'normal' | 'high';
  colorBlindSafe: boolean;
  reducedMotion: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Gets the computed value of a design token
 */
export function getToken(tokenName: TokenName): string {
  if (typeof window === 'undefined') return '';

  return getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim();
}

/**
 * Sets a design token value dynamically
 * Use with caution - prefer CSS custom properties
 */
export function setToken(tokenName: TokenName, value: string): void {
  if (typeof window === 'undefined') return;

  document.documentElement.style.setProperty(tokenName, value);
}

/**
 * Theme utility functions for managing design token themes
 */
export const themeUtils = {
  /**
   * Applies a theme configuration
   */
  applyTheme(config: Partial<ThemeConfig>): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Apply mode
    if (config.mode) {
      root.classList.remove('light', 'dark');
      if (config.mode !== 'system') {
        root.classList.add(config.mode);
      }
    }

    // Apply density
    if (config.density) {
      root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
      root.classList.add(`density-${config.density}`);
    }

    // Apply contrast
    if (config.contrast) {
      root.classList.toggle('high-contrast', config.contrast === 'high');
    }

    // Apply accessibility features
    if (config.colorBlindSafe !== undefined) {
      root.classList.toggle('colorblind-safe', config.colorBlindSafe);
    }

    if (config.reducedMotion !== undefined) {
      root.classList.toggle('reduce-motion', config.reducedMotion);
    }
  },

  /**
   * Detects system preferences and applies them
   */
  applySystemPreferences(): void {
    if (typeof window === 'undefined') return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.applyTheme({
      mode: prefersDark ? 'dark' : 'light',
      contrast: prefersHighContrast ? 'high' : 'normal',
      reducedMotion: prefersReducedMotion
    });
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default DesignTokens;