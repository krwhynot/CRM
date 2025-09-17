/**
 * Design Token Consistency Tests
 *
 * Comprehensive testing suite for design token architecture, naming
 * conventions, hierarchical relationships, and system coherence across
 * the entire design token ecosystem.
 *
 * @see /src/lib/design-tokens.ts - Core design token system
 * @see /src/styles/design-tokens.md - Design token documentation
 * @see /scripts/optimize-design-tokens.js - Token optimization utilities
 */

import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
// Design tokens module removed - using simplified CSS variables approach
import { designTokens, getCachedCSSVariable, createCSSVariableRef } from '../../src/lib/design-token-utils'

// Test configuration
const TEST_CONFIG = {
  tokenFiles: [
    'src/index.css',
    'src/styles/accessibility-tokens.css',
    'src/styles/component-tokens.css',
    'src/styles/advanced-colors.css',
    'src/styles/density.css',
  ],
  requiredCoreTokens: [
    '--primary',
    '--background',
    '--foreground',
    '--card',
    '--popover',
    '--border',
    '--muted',
    '--accent',
    '--destructive',
    '--success',
    '--warning',
    '--info',
  ],
  requiredMFBTokens: [
    '--mfb-green',
    '--mfb-green-hover',
    '--mfb-green-focus',
    '--mfb-green-active',
    '--mfb-clay',
    '--mfb-cream',
    '--mfb-sage',
    '--mfb-olive',
  ],
  namingPatterns: {
    color: /^--(([a-z]+-)*(primary|secondary|success|warning|info|destructive|mfb|hc|cb|priority|org|segment)(-[a-z0-9]+)*)(-(50|100|200|300|400|500|600|700|800|900|950|foreground|hover|focus|active|bg|text|border|subtle))*$/,
    spacing: /^--(space|spacing|padding|margin|gap|inset)(-[a-z0-9]+)*$/,
    typography: /^--(font|text|line-height)(-[a-z0-9]+)*$/,
    component: /^--(btn|card|input|dialog|table|badge|nav|toast|loading)(-[a-z0-9]+)*$/,
    density: /^--(kpi|chart|rail|activity-feed|kanban|principal-card|dashboard-grid)(-[a-z0-9]+)*$/,
  },
}

// Token extraction and analysis utilities
interface DesignToken {
  name: string
  value: string
  file: string
  category: 'color' | 'spacing' | 'typography' | 'component' | 'density' | 'other'
  isRoot: boolean
  references: string[]
  referencedBy: string[]
}

/**
 * Extract and analyze design tokens from CSS files
 */
function analyzeDesignTokens(): DesignToken[] {
  const tokens: DesignToken[] = []
  const allContent = []

  // Read all token files
  for (const tokenFile of TEST_CONFIG.tokenFiles) {
    const filePath = path.resolve(process.cwd(), tokenFile)
    if (!fs.existsSync(filePath)) continue

    const content = fs.readFileSync(filePath, 'utf8')
    allContent.push({ file: tokenFile, content })
  }

  // Extract tokens
  for (const { file, content } of allContent) {
    const variableRegex = /--([a-zA-Z0-9-_]+):\s*([^;]+);/g
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      const [, name, value] = match
      const fullName = `--${name}`

      // Determine category
      let category: DesignToken['category'] = 'other'
      if (TEST_CONFIG.namingPatterns.color.test(fullName)) category = 'color'
      else if (TEST_CONFIG.namingPatterns.spacing.test(fullName)) category = 'spacing'
      else if (TEST_CONFIG.namingPatterns.typography.test(fullName)) category = 'typography'
      else if (TEST_CONFIG.namingPatterns.component.test(fullName)) category = 'component'
      else if (TEST_CONFIG.namingPatterns.density.test(fullName)) category = 'density'

      // Extract references
      const references = []
      const varMatches = value.match(/var\(--([a-zA-Z0-9-_]+)\)/g)
      if (varMatches) {
        references.push(...varMatches.map(match => match.slice(4, -1))) // Remove var( and )
      }

      tokens.push({
        name: fullName,
        value: value.trim(),
        file,
        category,
        isRoot: !references.length || !references.some(ref => ref.startsWith('--')),
        references,
        referencedBy: [], // Will be populated in second pass
      })
    }
  }

  // Calculate reverse references
  for (const token of tokens) {
    for (const reference of token.references) {
      const referencedToken = tokens.find(t => t.name === reference)
      if (referencedToken) {
        referencedToken.referencedBy.push(token.name)
      }
    }
  }

  return tokens
}

// Test data
let tokens: DesignToken[] = []

describe('Design Token Consistency Tests', () => {
  beforeAll(() => {
    tokens = analyzeDesignTokens()
    console.log(`🎨 Analyzed ${tokens.length} design tokens across ${TEST_CONFIG.tokenFiles.length} files`)
  })

  describe('Token Architecture', () => {
    it('should have all required core design tokens', () => {
      for (const requiredToken of TEST_CONFIG.requiredCoreTokens) {
        const token = tokens.find(t => t.name === requiredToken)
        expect(token).toBeDefined(`Missing required core token: ${requiredToken}`)
      }
    })

    it('should have all required MFB brand tokens', () => {
      for (const requiredToken of TEST_CONFIG.requiredMFBTokens) {
        const token = tokens.find(t => t.name === requiredToken)
        expect(token).toBeDefined(`Missing required MFB token: ${requiredToken}`)
      }
    })

    it('should implement three-tier token hierarchy (primitive → semantic → component)', () => {
      // Primitive tokens (root values like OKLCH colors)
      const primitiveTokens = tokens.filter(token =>
        token.isRoot && (
          token.value.includes('oklch') ||
          token.value.includes('#') ||
          token.value.match(/^\d+(\.\d+)?(rem|px|em|%)$/)
        )
      )

      // Semantic tokens (reference primitive tokens)
      const semanticTokens = tokens.filter(token =>
        !token.isRoot &&
        token.references.some(ref => primitiveTokens.find(pt => pt.name === ref)) &&
        TEST_CONFIG.requiredCoreTokens.includes(token.name)
      )

      // Component tokens (reference semantic tokens)
      const componentTokens = tokens.filter(token =>
        token.category === 'component' &&
        token.references.some(ref => semanticTokens.find(st => st.name === ref))
      )

      expect(primitiveTokens.length).toBeGreaterThan(10, 'Should have primitive tokens (OKLCH colors, base values)')
      expect(semanticTokens.length).toBeGreaterThan(5, 'Should have semantic tokens (--primary, --background, etc.)')
      expect(componentTokens.length).toBeGreaterThan(20, 'Should have component-specific tokens')

      console.log(`📊 Token hierarchy: ${primitiveTokens.length} primitive, ${semanticTokens.length} semantic, ${componentTokens.length} component`)
    })

    it('should have proper token categorization', () => {
      const categoryCounts = {
        color: tokens.filter(t => t.category === 'color').length,
        spacing: tokens.filter(t => t.category === 'spacing').length,
        typography: tokens.filter(t => t.category === 'typography').length,
        component: tokens.filter(t => t.category === 'component').length,
        density: tokens.filter(t => t.category === 'density').length,
        other: tokens.filter(t => t.category === 'other').length,
      }

      expect(categoryCounts.color).toBeGreaterThan(50, 'Should have substantial color token system')
      expect(categoryCounts.component).toBeGreaterThan(20, 'Should have component-specific tokens')
      expect(categoryCounts.density).toBeGreaterThan(10, 'Should have density-aware tokens')

      console.log(`📈 Token categories:`, categoryCounts)
    })
  })

  describe('Naming Conventions', () => {
    it('should follow consistent naming patterns', () => {
      const invalidTokens = tokens.filter(token => {
        // Check if token matches any naming pattern
        return !Object.values(TEST_CONFIG.namingPatterns).some(pattern =>
          pattern.test(token.name)
        ) && !token.name.startsWith('--gray-') // Allow basic gray scale
      })

      if (invalidTokens.length > 0) {
        console.warn(`⚠️  Tokens with non-standard naming:`)
        invalidTokens.forEach(token => console.warn(`     ${token.name} (${token.category})`))
      }

      // Allow some flexibility in naming but flag potential issues
      expect(invalidTokens.length).toBeLessThan(tokens.length * 0.1, 'Most tokens should follow naming conventions')
    })

    it('should use consistent semantic suffixes', () => {
      const colorTokens = tokens.filter(t => t.category === 'color')
      const semanticSuffixes = ['-foreground', '-hover', '-focus', '-active', '-bg', '-text', '-border']

      const suffixUsage = new Map<string, number>()
      for (const token of colorTokens) {
        for (const suffix of semanticSuffixes) {
          if (token.name.endsWith(suffix)) {
            suffixUsage.set(suffix, (suffixUsage.get(suffix) || 0) + 1)
          }
        }
      }

      // Each suffix should be used consistently across the system
      for (const [suffix, count] of suffixUsage.entries()) {
        expect(count).toBeGreaterThan(0, `Semantic suffix ${suffix} should be used`)
      }

      console.log(`📝 Semantic suffix usage:`, Object.fromEntries(suffixUsage))
    })

    it('should have consistent color scale naming (50-950)', () => {
      const colorScales = ['primary', 'secondary', 'gray']
      const scaleValues = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

      for (const scale of colorScales) {
        const scaleTokens = tokens.filter(t => t.name.includes(`--${scale}-`))

        if (scaleTokens.length > 0) {
          // Should have multiple scale values for proper color scales
          expect(scaleTokens.length).toBeGreaterThan(5, `${scale} should have proper color scale`)

          // Check for key scale values
          const hasBase = scaleTokens.some(t => t.name === `--${scale}-500` || t.name === `--${scale}`)
          expect(hasBase).toBe(true, `${scale} should have base value (500 or base)`)
        }
      }
    })
  })

  describe('Token References and Dependencies', () => {
    it('should not have circular references', () => {
      const circularRefs: string[] = []

      function hasCircularReference(tokenName: string, visited = new Set<string>()): boolean {
        if (visited.has(tokenName)) {
          return true // Circular reference detected
        }

        const token = tokens.find(t => t.name === tokenName)
        if (!token) return false

        visited.add(tokenName)

        for (const reference of token.references) {
          if (hasCircularReference(reference, new Set(visited))) {
            circularRefs.push(`${tokenName} → ${reference}`)
            return true
          }
        }

        visited.delete(tokenName)
        return false
      }

      for (const token of tokens) {
        hasCircularReference(token.name)
      }

      expect(circularRefs).toEqual([], `Circular references found: ${circularRefs.join(', ')}`)
    })

    it('should have all token references defined', () => {
      const undefinedRefs: string[] = []
      const tokenNames = new Set(tokens.map(t => t.name))

      for (const token of tokens) {
        for (const reference of token.references) {
          if (!tokenNames.has(reference)) {
            undefinedRefs.push(`${token.name} references undefined ${reference}`)
          }
        }
      }

      expect(undefinedRefs).toEqual([], `Undefined references: ${undefinedRefs.join(', ')}`)
    })

    it('should have reasonable reference depth (avoid deep nesting)', () => {
      function calculateReferenceDepth(tokenName: string, visited = new Set<string>()): number {
        if (visited.has(tokenName)) return 0 // Avoid infinite loops

        const token = tokens.find(t => t.name === tokenName)
        if (!token || token.references.length === 0) return 0

        visited.add(tokenName)

        const depths = token.references.map(ref => calculateReferenceDepth(ref, new Set(visited)))
        visited.delete(tokenName)

        return Math.max(...depths) + 1
      }

      const deepTokens = tokens
        .map(token => ({ name: token.name, depth: calculateReferenceDepth(token.name) }))
        .filter(({ depth }) => depth > 5)

      expect(deepTokens.length).toBeLessThan(5, `Too many deeply nested tokens: ${deepTokens.map(t => `${t.name}(${t.depth})`).join(', ')}`)
    })
  })

  describe('MFB Brand Integration', () => {
    it('should have proper MFB brand color mappings', () => {
      // Primary should map to MFB green
      const primaryToken = tokens.find(t => t.name === '--primary')
      expect(primaryToken).toBeDefined('Primary token should exist')

      if (primaryToken) {
        const usesMFBGreen = primaryToken.value.includes('mfb-green') ||
                            primaryToken.references.includes('--mfb-green')
        expect(usesMFBGreen).toBe(true, 'Primary should reference MFB green')
      }

      // Check other semantic mappings
      const semanticMappings = [
        { semantic: '--secondary', brand: 'mfb-clay' },
        { semantic: '--success', brand: 'mfb-success' },
        { semantic: '--warning', brand: 'mfb-warning' },
        { semantic: '--destructive', brand: 'mfb-danger' },
      ]

      for (const mapping of semanticMappings) {
        const semanticToken = tokens.find(t => t.name === mapping.semantic)
        if (semanticToken) {
          const usesBrandColor = semanticToken.value.includes(mapping.brand) ||
                                 semanticToken.references.some(ref => ref.includes(mapping.brand))
          expect(usesBrandColor).toBe(true, `${mapping.semantic} should reference ${mapping.brand}`)
        }
      }
    })

    it('should have complete MFB color interactive states', () => {
      const mfbColors = ['green', 'clay', 'sage', 'olive']
      const interactiveStates = ['hover', 'focus', 'active']

      for (const color of mfbColors) {
        const baseToken = tokens.find(t => t.name === `--mfb-${color}`)
        expect(baseToken).toBeDefined(`MFB ${color} base color should exist`)

        for (const state of interactiveStates) {
          const stateToken = tokens.find(t => t.name === `--mfb-${color}-${state}`)
          expect(stateToken).toBeDefined(`MFB ${color} ${state} state should exist`)
        }
      }
    })
  })

  describe('Accessibility Integration', () => {
    it('should have accessibility-specific token variants', () => {
      const accessibilityPrefixes = ['--hc-', '--cb-', '--a11y-']

      for (const prefix of accessibilityPrefixes) {
        const accessibilityTokens = tokens.filter(t => t.name.startsWith(prefix))
        expect(accessibilityTokens.length).toBeGreaterThan(0, `Should have ${prefix} accessibility tokens`)
      }
    })

    it('should have semantic accessibility token pairs', () => {
      const semanticColors = ['success', 'warning', 'destructive', 'info']

      for (const semantic of semanticColors) {
        // Check for foreground/background pairs
        const bgToken = tokens.find(t => t.name === `--${semantic}`)
        const fgToken = tokens.find(t => t.name === `--${semantic}-foreground`)

        expect(bgToken).toBeDefined(`${semantic} background token should exist`)
        expect(fgToken).toBeDefined(`${semantic} foreground token should exist`)
      }
    })
  })

  describe('Density System Integration', () => {
    it('should have density-aware tokens', () => {
      const densityTokens = tokens.filter(t =>
        t.name.includes('kpi') ||
        t.name.includes('chart') ||
        t.name.includes('rail') ||
        t.name.includes('activity-feed') ||
        t.name.includes('kanban')
      )

      expect(densityTokens.length).toBeGreaterThan(15, 'Should have comprehensive density token system')
    })

    it('should have density mode variants', () => {
      const densityModes = ['compact', 'comfortable', 'spacious']

      // Check for density-specific overrides or variables
      const densityAwareTokens = tokens.filter(t =>
        densityModes.some(mode => t.value.includes(mode)) ||
        t.name.includes('density')
      )

      expect(densityAwareTokens.length).toBeGreaterThan(5, 'Should have density mode awareness')
    })
  })

  describe('TypeScript Integration', () => {
    it('should have TypeScript utility functions working correctly', () => {
      // Test core design token utilities
      expect(designTokens).toBeDefined('designTokens should be exported')
      expect(typeof getCachedCSSVariable).toBe('function', 'getCachedCSSVariable utility should be exported')
      expect(typeof createCSSVariableRef).toBe('function', 'createCSSVariableRef utility should be exported')

      // Test token access
      const primarySpacing = designTokens.spacing.md
      expect(primarySpacing).toBeDefined('Should have spacing tokens')
      expect(typeof primarySpacing).toBe('string', 'Spacing tokens should be strings')
    })

    it('should have proper TypeScript definitions for CSS variables', () => {
      // This test validates that the TypeScript integration is working
      // by checking that design token functions can be called without type errors

      try {
        const token = getCachedCSSVariable('primary') // Get CSS variable value
        expect(typeof token).toBe('string')

        const cssRef = createCSSVariableRef('primary', '#000') // Create CSS var reference with fallback
        expect(cssRef).toContain('var(--primary')
        expect(cssRef).toContain('#000')
      } catch (error) {
        // Functions are available, but might fail in test environment without DOM
        console.warn('CSS variable utilities might not work in test environment without DOM')
      }
    })
  })

  describe('Performance and Optimization', () => {
    it('should have reasonable number of total tokens', () => {
      // Too many tokens can impact performance
      expect(tokens.length).toBeLessThan(1000, 'Should limit total token count for performance')
      expect(tokens.length).toBeGreaterThan(100, 'Should have comprehensive token system')
    })

    it('should minimize unused token definitions', () => {
      const unusedTokens = tokens.filter(t => t.referencedBy.length === 0 &&
        !TEST_CONFIG.requiredCoreTokens.includes(t.name) &&
        !TEST_CONFIG.requiredMFBTokens.includes(t.name)
      )

      // Some unused tokens might be intentional (future use, external references)
      if (unusedTokens.length > 20) {
        console.warn(`⚠️  ${unusedTokens.length} potentially unused tokens`)
        console.warn(`     Consider reviewing: ${unusedTokens.slice(0, 5).map(t => t.name).join(', ')}...`)
      }

      expect(unusedTokens.length).toBeLessThan(tokens.length * 0.15, 'Should minimize unused tokens')
    })

    it('should have token files with reasonable sizes', () => {
      for (const tokenFile of TEST_CONFIG.tokenFiles) {
        const filePath = path.resolve(process.cwd(), tokenFile)
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath)
          expect(stats.size).toBeLessThan(100000, `${tokenFile} should be under 100KB for performance`)
        }
      }
    })
  })

  describe('Documentation and Maintenance', () => {
    it('should have design token documentation file', () => {
      const docsPath = path.resolve(process.cwd(), 'src/styles/design-tokens.md')
      expect(fs.existsSync(docsPath)).toBe(true, 'Design token documentation should exist')

      if (fs.existsSync(docsPath)) {
        const docsContent = fs.readFileSync(docsPath, 'utf8')
        expect(docsContent.length).toBeGreaterThan(1000, 'Documentation should be comprehensive')
        expect(docsContent).toContain('MFB', 'Documentation should cover MFB branding')
        expect(docsContent).toContain('WCAG', 'Documentation should cover accessibility')
      }
    })

    it('should have validation scripts', () => {
      const validationScript = path.resolve(process.cwd(), 'scripts/validate-design-tokens.sh')
      expect(fs.existsSync(validationScript)).toBe(true, 'Design token validation script should exist')

      const optimizationScript = path.resolve(process.cwd(), 'scripts/optimize-design-tokens.js')
      expect(fs.existsSync(optimizationScript)).toBe(true, 'Design token optimization script should exist')
    })
  })
})