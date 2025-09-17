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
 * @see /src/index.css - Core CSS variable definitions
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
  spacing: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  typography: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  colors: string // CSS variable names are dynamic
}

// =============================================================================
// COLOR UTILITIES AND CONTRAST VALIDATION
// =============================================================================

// =============================================================================
// OKLCH COLOR SPACE CONVERSION UTILITIES
// =============================================================================

/**
 * Convert OKLCH to RGB using proper color science
 * OKLCH uses perceptually uniform color space for accurate conversions
 */
export function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  // First convert OKLCH to OKLab
  const [labL, labA, labB] = oklchToOklab(l, c, h)

  // Then convert OKLab to linear RGB
  const [linearR, linearG, linearB] = oklabToLinearRgb(labL, labA, labB)

  // Finally convert linear RGB to sRGB (gamma correction)
  return [
    Math.round(linearToSrgb(linearR) * 255),
    Math.round(linearToSrgb(linearG) * 255),
    Math.round(linearToSrgb(linearB) * 255)
  ]
}

/**
 * Convert OKLCH to OKLab color space
 */
function oklchToOklab(l: number, c: number, h: number): [number, number, number] {
  const hueRadians = (h * Math.PI) / 180
  return [
    l,
    c * Math.cos(hueRadians),
    c * Math.sin(hueRadians)
  ]
}

/**
 * Convert OKLab to linear RGB using the OKLab color space matrix
 * Based on Björn Ottosson's OKLab specification
 */
function oklabToLinearRgb(l: number, a: number, b: number): [number, number, number] {
  // OKLab to LMS conversion (inverse of LMS to OKLab)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  // Cube the values to get LMS (inverse of cube root in forward direction)
  const l_cubed = Math.sign(l_) * Math.pow(Math.abs(l_), 3)
  const m_cubed = Math.sign(m_) * Math.pow(Math.abs(m_), 3)
  const s_cubed = Math.sign(s_) * Math.pow(Math.abs(s_), 3)

  // LMS to linear RGB conversion matrix (sRGB working space)
  const r = +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed
  const g = -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed
  const b_linear = -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.7076147010 * s_cubed

  return [r, g, b_linear]
}

/**
 * Convert linear RGB to sRGB (apply gamma correction)
 * Clamp values to valid range [0, 1]
 */
function linearToSrgb(linear: number): number {
  // Clamp to valid range
  const clamped = Math.max(0, Math.min(1, linear))

  if (clamped <= 0.0031308) {
    return 12.92 * clamped
  } else {
    return 1.055 * Math.pow(clamped, 1.0 / 2.4) - 0.055
  }
}

/**
 * Convert RGB to HSL
 * Returns HSL values as [h (0-360), s (0-100), l (0-100)]
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB values to 0-1
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const diff = max - min

  // Calculate lightness
  const l = (max + min) / 2

  // Calculate saturation
  let s = 0
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
  }

  // Calculate hue
  let h = 0
  if (diff !== 0) {
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) / 6
        break
      case gNorm:
        h = ((bNorm - rNorm) / diff + 2) / 6
        break
      case bNorm:
        h = ((rNorm - gNorm) / diff + 4) / 6
        break
    }
  }

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100)
  ]
}

/**
 * Convert OKLCH directly to HSL format string
 * Returns HSL format: "h s% l%" (without hsl() wrapper for CSS variables)
 */
export function oklchToHslString(l: number, c: number, h: number): string {
  const [r, g, b] = oklchToRgb(l, c, h)
  const [hslH, hslS, hslL] = rgbToHsl(r, g, b)
  return `${hslH} ${hslS}% ${hslL}%`
}

/**
 * Parse OKLCH string and convert to HSL string
 * Input: "oklch(0.6800 0.1800 130)"
 * Output: "95 71% 56%"
 */
export function parseOklchToHsl(oklchString: string): string | null {
  const oklchMatch = oklchString.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!oklchMatch) {
    return null
  }

  const l = parseFloat(oklchMatch[1])
  const c = parseFloat(oklchMatch[2])
  const h = parseFloat(oklchMatch[3])

  return oklchToHslString(l, c, h)
}

/**
 * Validate OKLCH format and values
 * Ensures L is 0-1, C is 0-0.4 (practical limit), H is 0-360
 */
export function validateOklchFormat(oklchString: string): {
  isValid: boolean
  errors: string[]
  parsed?: { l: number; c: number; h: number }
} {
  const errors: string[] = []

  const oklchMatch = oklchString.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!oklchMatch) {
    errors.push('Invalid OKLCH format. Expected: oklch(l c h)')
    return { isValid: false, errors }
  }

  const l = parseFloat(oklchMatch[1])
  const c = parseFloat(oklchMatch[2])
  const h = parseFloat(oklchMatch[3])

  // Validate lightness (0-1)
  if (l < 0 || l > 1) {
    errors.push(`Lightness must be between 0 and 1, got ${l}`)
  }

  // Validate chroma (0-0.4 practical limit)
  if (c < 0 || c > 0.4) {
    errors.push(`Chroma should be between 0 and 0.4 for practical colors, got ${c}`)
  }

  // Validate hue (0-360)
  if (h < 0 || h > 360) {
    errors.push(`Hue must be between 0 and 360 degrees, got ${h}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    parsed: errors.length === 0 ? { l, c, h } : undefined
  }
}

/**
 * Generate HSL fallback CSS variables from OKLCH definitions
 * Takes primitive CSS and generates corresponding HSL variables
 */
export function generateHslFallbacks(primitivesCss: string): string {
  const lines = primitivesCss.split('\n')
  const hslLines: string[] = []

  lines.forEach(line => {
    // Match CSS variable definitions with OKLCH values
    const match = line.match(/^\s*--([^:]+):\s*oklch\(([^)]+)\);(.*)$/)
    if (match) {
      const [, varName, oklchValues, comment] = match
      const oklchString = `oklch(${oklchValues})`
      const hslValue = parseOklchToHsl(oklchString)

      if (hslValue) {
        // Generate HSL variable name by adding -hsl suffix
        const hslVarName = `--${varName}-hsl`
        const hslComment = comment.replace(/OKLCH:/, 'HSL:')
        hslLines.push(`    ${hslVarName}: ${hslValue};${hslComment}`)
      }
    }
  })

  return hslLines.join('\n')
}

/**
 * Parse color string to RGB values
 * Supports hex, rgb, hsl, oklch, and CSS variables
 * Uses proper OKLCH color science conversion
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
        parseInt(hex[2] + hex[2], 16),
      ]
    } else if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
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
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
    const m = l - c / 2

    let r, g, b
    if (h < 1 / 6) {
      r = c
      g = x
      b = 0
    } else if (h < 2 / 6) {
      r = x
      g = c
      b = 0
    } else if (h < 3 / 6) {
      r = 0
      g = c
      b = x
    } else if (h < 4 / 6) {
      r = 0
      g = x
      b = c
    } else if (h < 5 / 6) {
      r = x
      g = 0
      b = c
    } else {
      r = c
      g = 0
      b = x
    }

    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
  }

  // Handle oklch() colors - proper OKLCH to RGB conversion
  const oklchMatch = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (oklchMatch) {
    const l = parseFloat(oklchMatch[1])
    const c = parseFloat(oklchMatch[2])
    const h = parseFloat(oklchMatch[3])

    return oklchToRgb(l, c, h)
  }

  return null
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const normalized = c / 255
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio from 1:1 to 21:1
 */
export function calculateContrastRatio(foreground: string, background: string): number {
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
    ui: { AA: 3, AAA: 4.5 }, // UI elements like buttons, inputs
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
    recommendation,
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
        references.push(...varMatches.map((match) => match.slice(4, -1)))
      }

      variables.push({
        name: property,
        value,
        category: categorizeCSSVariable(property),
        references,
        isRoot: true,
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
  if (
    variableName.includes('color') ||
    variableName.includes('bg') ||
    variableName.includes('border')
  ) {
    return 'color'
  }
  if (
    variableName.includes('space') ||
    variableName.includes('gap') ||
    variableName.includes('margin') ||
    variableName.includes('padding')
  ) {
    return 'spacing'
  }
  if (
    variableName.includes('font') ||
    variableName.includes('text') ||
    variableName.includes('size')
  ) {
    return 'typography'
  }
  if (
    variableName.includes('width') ||
    variableName.includes('height') ||
    variableName.includes('size')
  ) {
    return 'sizing'
  }
  if (
    variableName.includes('duration') ||
    variableName.includes('timing') ||
    variableName.includes('transition')
  ) {
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
    isComputed: true,
  }
}

// =============================================================================
// THEME VALIDATION UTILITIES
// =============================================================================

/**
 * Validate theme accessibility and completeness
 */
export function validateThemeAccessibility(requiredTokens: string[] = []): ThemeValidationResult {
  const result: ThemeValidationResult = {
    isValid: true,
    missingTokens: [],
    contrastIssues: [],
    recommendations: [],
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
          required: 4.5,
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
  },
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
          { fg: '--primary-foreground', bg: '--primary' },
        ]

        criticalCombos.forEach((combo) => {
          const contrast = validateContrast(
            getComputedCSSVariable(combo.fg),
            getComputedCSSVariable(combo.bg)
          )

          if (!contrast.wcagAA) {
            console.warn('Design Token Validation:', {
              combination: combo,
              contrast: contrast.ratio,
              recommendation: contrast.recommendation,
            })
          }
        })
      }
    })
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
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

      const grouped = tokens.reduce(
        (acc, token) => {
          if (!acc[token.category]) acc[token.category] = []
          acc[token.category].push(token)
          return acc
        },
        {} as Record<string, CSSVariableRef[]>
      )

      Object.entries(grouped).forEach(([category, tokens]) => {
        console.group(`${category.charAt(0).toUpperCase() + category.slice(1)} (${tokens.length})`)
        tokens.forEach((token) => {
          console.log(`${token.name}: ${token.value}`)
        })
        console.groupEnd()
      })

      console.groupEnd()
    },

    validateAllContrast() {
      console.group('🔍 Contrast Validation')

      const colorTokens = extractAllCSSVariables().filter((t) => t.category === 'color')

      // Common patterns to check
      const patterns = [
        { fg: 'foreground', bg: 'background' },
        { fg: 'primary-foreground', bg: 'primary' },
        { fg: 'secondary-foreground', bg: 'secondary' },
      ]

      patterns.forEach((pattern) => {
        const fg = colorTokens.find((t) => t.name.includes(pattern.fg))
        const bg = colorTokens.find((t) => t.name.includes(pattern.bg))

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
    },
  }
}

// =============================================================================
// CSS VARIABLE GENERATION AND AUTOMATION
// =============================================================================

/**
 * Extract OKLCH definitions from CSS content
 * Returns array of variable definitions with their OKLCH values
 */
export function extractOklchDefinitions(cssContent: string): Array<{
  name: string
  oklchValue: string
  fullDefinition: string
  comment?: string
}> {
  const lines = cssContent.split('\n')
  const definitions: Array<{
    name: string
    oklchValue: string
    fullDefinition: string
    comment?: string
  }> = []

  lines.forEach(line => {
    const match = line.match(/^\s*(--[^:]+):\s*(oklch\([^)]+\));(.*)$/)
    if (match) {
      const [, varName, oklchValue, commentPart] = match
      const comment = commentPart.trim().replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '')

      definitions.push({
        name: varName.trim(),
        oklchValue: oklchValue.trim(),
        fullDefinition: line,
        comment: comment || undefined
      })
    }
  })

  return definitions
}

/**
 * Generate HSL CSS variable definitions from OKLCH definitions
 * Creates corresponding -hsl suffixed variables
 */
export function generateHslDefinitions(oklchDefinitions: Array<{
  name: string
  oklchValue: string
  comment?: string
}>): string[] {
  const hslDefinitions: string[] = []

  oklchDefinitions.forEach(({ name, oklchValue, comment }) => {
    const hslValue = parseOklchToHsl(oklchValue)
    if (hslValue) {
      const hslVarName = `${name}-hsl`
      const hslComment = comment ? comment.replace(/OKLCH:/, 'HSL:').replace(/oklch\([^)]+\)/, `hsl(${hslValue})`) : 'HSL fallback'

      hslDefinitions.push(`    ${hslVarName}: ${hslValue};                  /* ${hslComment} */`)
    }
  })

  return hslDefinitions
}

/**
 * Process primitives.css and generate complete HSL fallback section
 * Returns updated CSS content with automated HSL generation
 */
export function processTokenFileForHslGeneration(cssContent: string): {
  updatedContent: string
  generatedCount: number
  errors: string[]
} {
  const errors: string[] = []
  let generatedCount = 0

  // Extract OKLCH definitions
  const oklchDefinitions = extractOklchDefinitions(cssContent)

  // Validate each OKLCH definition
  const validDefinitions = oklchDefinitions.filter(def => {
    const validation = validateOklchFormat(def.oklchValue)
    if (!validation.isValid) {
      errors.push(`Invalid OKLCH in ${def.name}: ${validation.errors.join(', ')}`)
      return false
    }
    return true
  })

  // Generate HSL definitions
  const hslDefinitions = generateHslDefinitions(validDefinitions)
  generatedCount = hslDefinitions.length

  // Find the HSL fallbacks section and replace it
  const hslSectionStart = cssContent.indexOf('/* MFB COLORS - HSL FALLBACKS FOR LEGACY COMPATIBILITY')
  const hslSectionEnd = cssContent.indexOf('/* =======================================================================', hslSectionStart + 1)

  if (hslSectionStart === -1 || hslSectionEnd === -1) {
    errors.push('Could not find HSL fallbacks section in CSS file')
    return { updatedContent: cssContent, generatedCount: 0, errors }
  }

  // Construct new HSL section
  const newHslSection = [
    '    /* MFB COLORS - HSL FALLBACKS FOR LEGACY COMPATIBILITY',
    '     *',
    '     * AUTO-GENERATED HSL fallbacks from OKLCH definitions above.',
    '     * DO NOT EDIT MANUALLY - Use generateHslFallbacks() to regenerate.',
    '     * Provides browser compatibility for older browsers without OKLCH support.',
    '     * ======================================================================= */',
    '',
    ...hslDefinitions,
    '',
    '    /* ======================================================================='
  ].join('\n')

  // Replace the HSL section
  const beforeHsl = cssContent.substring(0, hslSectionStart)
  const afterHsl = cssContent.substring(hslSectionEnd)
  const updatedContent = beforeHsl + newHslSection + afterHsl

  return {
    updatedContent,
    generatedCount,
    errors
  }
}

/**
 * CLI utility function to regenerate HSL fallbacks in primitives.css
 * Returns summary of the operation
 */
export function regenerateHslFallbacks(primitivesPath: string = '/src/styles/tokens/primitives.css'): {
  success: boolean
  message: string
  generatedCount: number
  errors: string[]
} {
  try {
    // This would need file system access in a real implementation
    // For now, return a guide for manual usage
    return {
      success: false,
      message: 'Use processTokenFileForHslGeneration() with file content to regenerate HSL fallbacks',
      generatedCount: 0,
      errors: ['File system access not available in browser context']
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to regenerate HSL fallbacks: ${error}`,
      generatedCount: 0,
      errors: [String(error)]
    }
  }
}

// =============================================================================
// DEVELOPMENT UTILITIES FOR UI-STYLES.TS INTEGRATION
// =============================================================================

/**
 * Development tool utilities for working with semantic tokens
 * Used by ui-styles.ts and other development utilities
 */

/**
 * Get a CSS variable reference for development tools
 * Returns CSS variable format ready for inline styles
 */
export function getDevToolCSSVar(variableName: string): string {
  const key = variableName.startsWith('--') ? variableName : `--${variableName}`
  return `hsl(var(${key}))`
}

/**
 * Create theme-aware development tool color palette
 * Returns colors optimized for development interfaces
 */
export function createDevToolPalette() {
  return {
    // Background colors using semantic tokens
    background: {
      primary: getDevToolCSSVar('--muted'),
      secondary: getDevToolCSSVar('--background'),
      accent: getDevToolCSSVar('--accent'),
      card: getDevToolCSSVar('--card'),
    },

    // Text colors for development interfaces
    text: {
      primary: getDevToolCSSVar('--info'),
      secondary: getDevToolCSSVar('--foreground'),
      muted: getDevToolCSSVar('--muted-foreground'),
      accent: getDevToolCSSVar('--primary'),
    },

    // Status colors using semantic intent tokens
    status: {
      error: getDevToolCSSVar('--destructive'),
      warning: getDevToolCSSVar('--warning'),
      success: getDevToolCSSVar('--success'),
      info: getDevToolCSSVar('--info'),
    },

    // Border and surface colors
    surface: {
      border: getDevToolCSSVar('--border'),
      ring: getDevToolCSSVar('--ring'),
      input: getDevToolCSSVar('--input'),
    }
  }
}

/**
 * Validate that all required semantic tokens exist for development tools
 * Returns validation report for development utilities
 */
export function validateDevToolTokens(): {
  isValid: boolean
  missingTokens: string[]
  availableTokens: string[]
} {
  const requiredTokens = [
    'background', 'foreground', 'muted', 'muted-foreground',
    'accent', 'border', 'ring', 'primary', 'secondary',
    'success', 'warning', 'info', 'destructive'
  ]

  const missingTokens: string[] = []
  const availableTokens: string[] = []

  requiredTokens.forEach(token => {
    const value = getComputedCSSVariable(token)
    if (value) {
      availableTokens.push(token)
    } else {
      missingTokens.push(token)
    }
  })

  return {
    isValid: missingTokens.length === 0,
    missingTokens,
    availableTokens
  }
}

/**
 * Generate CSS custom property mappings for legacy color migration
 * Used to update hardcoded colors in development utilities
 */
export function generateLegacyColorMappings(): Record<string, string> {
  return {
    // Gray scale mappings
    '#f5f5f5': getDevToolCSSVar('--muted'),
    '#ffffff': getDevToolCSSVar('--background'),
    '#f8f9fa': getDevToolCSSVar('--accent'),
    '#374151': getDevToolCSSVar('--foreground'),
    '#6b7280': getDevToolCSSVar('--muted-foreground'),
    '#e5e7eb': getDevToolCSSVar('--border'),
    '#d1d5db': getDevToolCSSVar('--accent'),
    '#f3f4f6': getDevToolCSSVar('--muted'),
    '#1f2937': getDevToolCSSVar('--foreground'),

    // Intent color mappings
    '#2563eb': getDevToolCSSVar('--info'),
    '#dc2626': getDevToolCSSVar('--destructive'),
    '#fee2e2': getDevToolCSSVar('--destructive') + '/10',
    '#d97706': getDevToolCSSVar('--warning'),
    '#fef3c7': getDevToolCSSVar('--warning') + '/10',
    '#059669': getDevToolCSSVar('--success'),
    '#d1fae5': getDevToolCSSVar('--success') + '/10',

    // Chart color mappings
    '#10b981': getDevToolCSSVar('--success'),
    '#f59e0b': getDevToolCSSVar('--warning'),
  }
}

/**
 * Development tool theme detector
 * Provides utilities for theme-aware development interfaces
 */
export function createDevToolThemeDetector() {
  return {
    isDarkMode: () => {
      if (typeof window === 'undefined') return false
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    },

    onThemeChange: (callback: (isDark: boolean) => void) => {
      if (typeof window === 'undefined') return () => {}

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => callback(e.matches)

      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    },

    getThemeAwareToken: (lightToken: string, darkToken?: string) => {
      const isDark = typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches

      if (isDark && darkToken) {
        return getDevToolCSSVar(darkToken)
      }
      return getDevToolCSSVar(lightToken)
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export all utilities for comprehensive design token support
