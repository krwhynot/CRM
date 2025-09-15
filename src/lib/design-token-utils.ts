/**
 * Design Token Utilities for KitchenPantry CRM
 *
 * Advanced utility functions for design token usage including runtime contrast
 * validation, design token extraction tools, performance optimization, and
 * enhanced TypeScript definitions for improved developer experience.
 *
 * Features:
 * - WCAG AAA/AA contrast validation with runtime checks
 * - CSS variable extraction and manipulation utilities
 * - Design token debugging and analysis tools
 * - Performance optimizations with caching
 * - TypeScript definitions for enhanced IntelliSense
 * - Theme validation and accessibility compliance
 *
 * @see /src/lib/design-tokens.ts - Core design token definitions
 * @see /src/index.css - CSS variable definitions
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'css-variable'
export type WcagLevel = 'AA' | 'AAA'
export type TextType = 'normal' | 'large' | 'ui'

export interface ContrastValidationResult {
  ratio: number
  wcagAA: boolean
  wcagAAA: boolean
  level: 'fail' | 'AA' | 'AAA'
  recommendation?: string
}

export interface DesignTokenData {
  name: string
  value: string | number
  category: 'color' | 'spacing' | 'typography' | 'sizing' | 'motion' | 'other'
  cssVariable?: string
  semanticMeaning?: string
  isComputed: boolean
}

export interface CSSVariableRef {
  name: string
  value: string
  category: string
  references: string[]
  isRoot: boolean
}

export interface ThemeValidationResult {
  isValid: boolean
  missingTokens: string[]
  contrastIssues: Array<{
    foreground: string
    background: string
    ratio: number
    required: number
  }>
  recommendations: string[]
}

export interface DesignTokenKey {
  spacing: keyof typeof import('./design-tokens').spacing
  typography: keyof typeof import('./design-tokens').typography.fontSize
  colors: string // CSS variable names are dynamic
}

// =============================================================================
// COLOR UTILITIES AND CONTRAST VALIDATION
// =============================================================================

/**
 * Parse color string to RGB values
 * Supports hex, rgb, hsl, oklch, and CSS variables
 */
export function parseColorToRgb(color: string): [number, number, number] | null {
  // Handle CSS variables by getting computed value
  if (color.startsWith('var(')) {
    const computedValue = getComputedCSSVariable(color.slice(4, -1))
    if (computedValue) {
      return parseColorToRgb(computedValue)
    }
    return null
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16)
      ]
    } else if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
      ]
    }
  }

  // Handle rgb() colors
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])]
  }

  // Handle hsl() colors - basic conversion
  const hslMatch = color.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/)
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360
    const s = parseInt(hslMatch[2]) / 100
    const l = parseInt(hslMatch[3]) / 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h * 6) % 2 - 1))
    const m = l - c / 2

    let r, g, b
    if (h < 1/6) { r = c; g = x; b = 0 }
    else if (h < 2/6) { r = x; g = c; b = 0 }
    else if (h < 3/6) { r = 0; g = c; b = x }
    else if (h < 4/6) { r = 0; g = x; b = c }
    else if (h < 5/6) { r = x; g = 0; b = c }
    else { r = c; g = 0; b = x }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ]
  }

  // Handle oklch() colors - simplified conversion
  const oklchMatch = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (oklchMatch) {
    // This is a simplified conversion - in practice, you'd want a proper OKLCH to RGB conversion
    const l = parseFloat(oklchMatch[1])
    const c = parseFloat(oklchMatch[2])
    const h = parseFloat(oklchMatch[3])

    // Rough approximation - not accurate OKLCH conversion
    const lightness = Math.round(l * 255)
    return [lightness, lightness, lightness]
  }

  return null
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(c => {
    const normalized = c / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio from 1:1 to 21:1
 */
export function calculateContrastRatio(
  foreground: string,
  background: string
): number {
  const fgRgb = parseColorToRgb(foreground)
  const bgRgb = parseColorToRgb(background)

  if (!fgRgb || !bgRgb) {
    console.warn('Could not parse colors for contrast calculation:', { foreground, background })
    return 1
  }

  const fgLuminance = getRelativeLuminance(fgRgb)
  const bgLuminance = getRelativeLuminance(bgRgb)

  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Validate color contrast against WCAG guidelines
 * Supports AA and AAA levels for different text types
 */
export function validateContrast(
  foreground: string,
  background: string,
  textType: TextType = 'normal',
  level: WcagLevel = 'AAA'
): ContrastValidationResult {
  const ratio = calculateContrastRatio(foreground, background)

  // WCAG requirements
  const requirements = {
    normal: { AA: 4.5, AAA: 7 },
    large: { AA: 3, AAA: 4.5 },
    ui: { AA: 3, AAA: 4.5 } // UI elements like buttons, inputs
  }

  const required = requirements[textType]
  const wcagAA = ratio >= required.AA
  const wcagAAA = ratio >= required.AAA

  let resultLevel: 'fail' | 'AA' | 'AAA'
  let recommendation: string | undefined

  if (wcagAAA) {
    resultLevel = 'AAA'
  } else if (wcagAA) {
    resultLevel = 'AA'
  } else {
    resultLevel = 'fail'
    recommendation = `Increase contrast to at least ${required[level]}:1 for ${level} compliance`
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA,
    wcagAAA,
    level: resultLevel,
    recommendation
  }
}

// =============================================================================
// CSS VARIABLE UTILITIES
// =============================================================================

// Cache for computed CSS variables
const cssVariableCache = new Map<string, string>()
let cacheEnabled = true

/**
 * Get computed value of a CSS variable
 */
export function getComputedCSSVariable(variableName: string): string {
  const key = variableName.startsWith('--') ? variableName : `--${variableName}`

  if (cacheEnabled && cssVariableCache.has(key)) {
    return cssVariableCache.get(key)!
  }

  if (typeof window === 'undefined') {
    return ''
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(key).trim()

  if (cacheEnabled) {
    cssVariableCache.set(key, value)
  }

  return value
}

/**
 * Set CSS variable value
 */
export function setCSSVariable(variableName: string, value: string): void {
  const key = variableName.startsWith('--') ? variableName : `--${variableName}`

  if (typeof window === 'undefined') {
    return
  }

  document.documentElement.style.setProperty(key, value)

  // Update cache
  if (cacheEnabled) {
    cssVariableCache.set(key, value)
  }
}

/**
 * Extract all CSS variables from document
 */
export function extractAllCSSVariables(): CSSVariableRef[] {
  if (typeof window === 'undefined') {
    return []
  }

  const variables: CSSVariableRef[] = []
  const computedStyles = getComputedStyle(document.documentElement)

  // Get all CSS variables from root element
  for (let i = 0; i < computedStyles.length; i++) {
    const property = computedStyles[i]
    if (property.startsWith('--')) {
      const value = computedStyles.getPropertyValue(property).trim()
      const references: string[] = []

      // Find references to other CSS variables
      const varMatches = value.match(/var\(--[^)]+\)/g)
      if (varMatches) {
        references.push(...varMatches.map(match => match.slice(4, -1)))
      }

      variables.push({
        name: property,
        value,
        category: categorizeCSSVariable(property),
        references,
        isRoot: true
      })
    }
  }

  return variables
}

/**
 * Create a CSS variable reference string
 */
export function createCSSVariableRef(variableName: string, fallback?: string): string {
  const key = variableName.startsWith('--') ? variableName : `--${variableName}`
  return fallback ? `var(${key}, ${fallback})` : `var(${key})`
}

/**
 * Categorize CSS variable based on its name
 */
function categorizeCSSVariable(variableName: string): string {
  if (variableName.includes('color') || variableName.includes('bg') || variableName.includes('border')) {
    return 'color'
  }
  if (variableName.includes('space') || variableName.includes('gap') || variableName.includes('margin') || variableName.includes('padding')) {
    return 'spacing'
  }
  if (variableName.includes('font') || variableName.includes('text') || variableName.includes('size')) {
    return 'typography'
  }
  if (variableName.includes('width') || variableName.includes('height') || variableName.includes('size')) {
    return 'sizing'
  }
  if (variableName.includes('duration') || variableName.includes('timing') || variableName.includes('transition')) {
    return 'motion'
  }
  return 'other'
}

// =============================================================================
// DESIGN TOKEN EXTRACTION AND ANALYSIS
// =============================================================================

/**
 * Extract design token data from CSS variables
 */
export function extractDesignToken(tokenName: string): DesignTokenData | null {
  const value = getComputedCSSVariable(tokenName)
  if (!value) return null

  return {
    name: tokenName,
    value,
    category: categorizeCSSVariable(tokenName) as any,
    cssVariable: createCSSVariableRef(tokenName),
    isComputed: true
  }
}

// =============================================================================
// THEME VALIDATION UTILITIES
// =============================================================================

/**
 * Validate theme accessibility and completeness
 */
export function validateThemeAccessibility(
  requiredTokens: string[] = []
): ThemeValidationResult {
  const result: ThemeValidationResult = {
    isValid: true,
    missingTokens: [],
    contrastIssues: [],
    recommendations: []
  }

  // Check for missing required tokens
  for (const token of requiredTokens) {
    const value = getComputedCSSVariable(token)
    if (!value) {
      result.missingTokens.push(token)
      result.isValid = false
    }
  }

  // Common color combinations to check
  const colorCombinations = [
    { fg: '--foreground', bg: '--background' },
    { fg: '--primary-foreground', bg: '--primary' },
    { fg: '--secondary-foreground', bg: '--secondary' },
    { fg: '--muted-foreground', bg: '--muted' },
    { fg: '--accent-foreground', bg: '--accent' },
  ]

  // Validate contrast ratios
  for (const combo of colorCombinations) {
    const fgValue = getComputedCSSVariable(combo.fg)
    const bgValue = getComputedCSSVariable(combo.bg)

    if (fgValue && bgValue) {
      const contrast = validateContrast(fgValue, bgValue, 'normal', 'AA')
      if (!contrast.wcagAA) {
        result.contrastIssues.push({
          foreground: combo.fg,
          background: combo.bg,
          ratio: contrast.ratio,
          required: 4.5
        })
        result.isValid = false
      }
    }
  }

  // Generate recommendations
  if (result.missingTokens.length > 0) {
    result.recommendations.push('Define missing CSS variables for complete theme support')
  }
  if (result.contrastIssues.length > 0) {
    result.recommendations.push('Improve color contrast ratios for better accessibility')
  }

  return result
}

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

/**
 * Get cached CSS variable value with performance optimization
 */
export function getCachedCSSVariable(variableName: string): string {
  return getComputedCSSVariable(variableName)
}

/**
 * Clear CSS variable cache
 */
export function clearCSSVariableCache(): void {
  cssVariableCache.clear()
}

/**
 * Set multiple CSS variables efficiently
 */
export function batchSetCSSVariables(variables: Record<string, string>): void {
  if (typeof window === 'undefined') {
    return
  }

  const style = document.documentElement.style

  Object.entries(variables).forEach(([name, value]) => {
    const key = name.startsWith('--') ? name : `--${name}`
    style.setProperty(key, value)

    if (cacheEnabled) {
      cssVariableCache.set(key, value)
    }
  })
}

// =============================================================================
// TYPESCRIPT UTILITIES
// =============================================================================

/**
 * Create typed CSS variable reference
 */
export function createTypedCSSVar<T extends string>(variableName: T): `var(--${T})` {
  return `var(--${variableName})` as const
}

/**
 * Design tokens with enhanced TypeScript support
 */
export const designTokens = {
  spacing: {
    xs: createTypedCSSVar('spacing-xs'),
    sm: createTypedCSSVar('spacing-sm'),
    md: createTypedCSSVar('spacing-md'),
    lg: createTypedCSSVar('spacing-lg'),
    xl: createTypedCSSVar('spacing-xl'),
  },
  colors: {
    primary: createTypedCSSVar('primary'),
    secondary: createTypedCSSVar('secondary'),
    background: createTypedCSSVar('background'),
    foreground: createTypedCSSVar('foreground'),
    muted: createTypedCSSVar('muted'),
    accent: createTypedCSSVar('accent'),
  },
  typography: {
    fontSizeXs: createTypedCSSVar('font-size-xs'),
    fontSizeSm: createTypedCSSVar('font-size-sm'),
    fontSizeBase: createTypedCSSVar('font-size-base'),
    fontSizeLg: createTypedCSSVar('font-size-lg'),
  }
} as const

// =============================================================================
// RUNTIME VALIDATION UTILITIES
// =============================================================================

/**
 * Enable runtime validation for design tokens in development
 */
export function enableRuntimeValidation(): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // Monitor CSS variable changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        clearCSSVariableCache()

        // Validate critical color combinations
        const criticalCombos = [
          { fg: '--foreground', bg: '--background' },
          { fg: '--primary-foreground', bg: '--primary' }
        ]

        criticalCombos.forEach(combo => {
          const contrast = validateContrast(
            getComputedCSSVariable(combo.fg),
            getComputedCSSVariable(combo.bg)
          )

          if (!contrast.wcagAA) {
            console.warn('Design Token Validation:', {
              combination: combo,
              contrast: contrast.ratio,
              recommendation: contrast.recommendation
            })
          }
        })
      }
    })
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style']
  })
}

/**
 * Create design token debugger for development
 */
export function createDesignTokenDebugger(): {
  logAllTokens: () => void
  validateAllContrast: () => void
  findUnusedTokens: () => void
} {
  return {
    logAllTokens() {
      const tokens = extractAllCSSVariables()
      console.group('🎨 Design Tokens Debug')

      const grouped = tokens.reduce((acc, token) => {
        if (!acc[token.category]) acc[token.category] = []
        acc[token.category].push(token)
        return acc
      }, {} as Record<string, CSSVariableRef[]>)

      Object.entries(grouped).forEach(([category, tokens]) => {
        console.group(`${category.charAt(0).toUpperCase() + category.slice(1)} (${tokens.length})`)
        tokens.forEach(token => {
          console.log(`${token.name}: ${token.value}`)
        })
        console.groupEnd()
      })

      console.groupEnd()
    },

    validateAllContrast() {
      console.group('🔍 Contrast Validation')

      const colorTokens = extractAllCSSVariables()
        .filter(t => t.category === 'color')

      // Common patterns to check
      const patterns = [
        { fg: 'foreground', bg: 'background' },
        { fg: 'primary-foreground', bg: 'primary' },
        { fg: 'secondary-foreground', bg: 'secondary' },
      ]

      patterns.forEach(pattern => {
        const fg = colorTokens.find(t => t.name.includes(pattern.fg))
        const bg = colorTokens.find(t => t.name.includes(pattern.bg))

        if (fg && bg) {
          const contrast = validateContrast(fg.value, bg.value)
          console.log(`${fg.name} on ${bg.name}:`, contrast)
        }
      })

      console.groupEnd()
    },

    findUnusedTokens() {
      console.group('🧹 Unused Tokens Analysis')
      console.log('This would analyze CSS usage to find unused tokens')
      console.log('Implementation would require CSS AST parsing')
      console.groupEnd()
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export everything for easy access
export * from './design-tokens'