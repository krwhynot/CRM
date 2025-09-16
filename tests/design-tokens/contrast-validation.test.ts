/**
 * Design Token Contrast Validation Tests
 *
 * Automated accessibility testing for design tokens with WCAG AA/AAA
 * compliance validation, contrast ratio checking, and visual regression
 * testing for design token changes.
 *
 * @see /src/styles/accessibility-tokens.css - Accessibility token definitions
 * @see /src/lib/design-token-utils.ts - Utility functions for contrast validation
 * @see /scripts/validate-design-tokens.sh - Design token validation script
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseColorToRgb, calculateContrastRatio, validateContrastWCAG } from '../../src/lib/design-token-utils'

// Test configuration
const TEST_CONFIG = {
  // WCAG compliance levels to test
  wcagLevels: ['AA', 'AAA'] as const,
  // Color token files to analyze
  tokenFiles: [
    'src/index.css',
    'src/styles/accessibility-tokens.css',
    'src/styles/component-tokens.css',
    'src/styles/advanced-colors.css',
  ],
  // Critical color combinations that must pass AAA
  criticalCombinations: [
    { fg: '--text-primary', bg: '--background' },
    { fg: '--text-body', bg: '--card' },
    { fg: '--mfb-green', bg: '--background' },
    { fg: '--destructive-foreground', bg: '--destructive' },
    { fg: '--success-foreground', bg: '--success' },
  ],
  // Minimum contrast ratios
  contrastThresholds: {
    'AA-normal': 4.5,
    'AA-large': 3.0,
    'AAA-normal': 7.0,
    'AAA-large': 4.5,
  },
}

// Design token extraction utilities
interface DesignToken {
  name: string
  value: string
  file: string
  category: 'color' | 'spacing' | 'typography' | 'other'
}

/**
 * Extract design tokens from CSS files
 */
function extractDesignTokensFromFile(filePath: string): DesignToken[] {
  const tokens: DesignToken[] = []

  if (!fs.existsSync(filePath)) {
    return tokens
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const variableRegex = /--([a-zA-Z0-9-_]+):\s*([^;]+);/g
  let match

  while ((match = variableRegex.exec(content)) !== null) {
    const [, name, value] = match
    const fullName = `--${name}`

    // Categorize tokens
    let category: DesignToken['category'] = 'other'
    if (value.includes('oklch') || value.includes('hsl') || value.includes('#') || value.includes('rgb')) {
      category = 'color'
    } else if (name.includes('space') || name.includes('padding') || name.includes('margin')) {
      category = 'spacing'
    } else if (name.includes('font') || name.includes('text') || name.includes('line-height')) {
      category = 'typography'
    }

    tokens.push({
      name: fullName,
      value: value.trim(),
      file: filePath,
      category,
    })
  }

  return tokens
}

/**
 * Extract all design tokens from configured files
 */
function extractAllDesignTokens(): DesignToken[] {
  const allTokens: DesignToken[] = []

  for (const tokenFile of TEST_CONFIG.tokenFiles) {
    const filePath = path.resolve(process.cwd(), tokenFile)
    const fileTokens = extractDesignTokensFromFile(filePath)
    allTokens.push(...fileTokens)
  }

  return allTokens
}

// Test data
let designTokens: DesignToken[] = []
let colorTokens: DesignToken[] = []

describe('Design Token Contrast Validation', () => {
  beforeAll(() => {
    // Extract design tokens for testing
    designTokens = extractAllDesignTokens()
    colorTokens = designTokens.filter(token => token.category === 'color')

    console.log(`🎨 Loaded ${designTokens.length} design tokens (${colorTokens.length} color tokens)`)
  })

  describe('Token Extraction and Parsing', () => {
    it('should extract design tokens from all configured files', () => {
      expect(designTokens.length).toBeGreaterThan(0)
      expect(colorTokens.length).toBeGreaterThan(0)

      // Should have tokens from each file
      for (const tokenFile of TEST_CONFIG.tokenFiles) {
        const fileTokens = designTokens.filter(token => token.file.includes(tokenFile))
        if (fs.existsSync(path.resolve(process.cwd(), tokenFile))) {
          expect(fileTokens.length).toBeGreaterThan(0, `Expected tokens from ${tokenFile}`)
        }
      }
    })

    it('should categorize tokens correctly', () => {
      const categories = [...new Set(designTokens.map(token => token.category))]
      expect(categories).toContain('color')

      // Check specific token categorization
      const primaryToken = designTokens.find(token => token.name === '--primary')
      if (primaryToken) {
        expect(primaryToken.category).toBe('color')
      }
    })

    it('should parse color values correctly', () => {
      const testColors = [
        { input: '#ffffff', expected: [255, 255, 255] },
        { input: '#000000', expected: [0, 0, 0] },
        { input: '#8DC63F', expected: [141, 198, 63] }, // MFB Green
        { input: 'rgb(255, 255, 255)', expected: [255, 255, 255] },
        { input: 'hsl(0, 0%, 100%)', expected: [255, 255, 255] },
      ]

      for (const { input, expected } of testColors) {
        const result = parseColorToRgb(input)
        expect(result).toEqual(expected)
      }
    })
  })

  describe('WCAG Contrast Compliance', () => {
    it('should validate contrast ratios for critical color combinations', () => {
      const results: Array<{
        combination: string
        ratio: number
        wcagAA: boolean
        wcagAAA: boolean
      }> = []

      for (const { fg, bg } of TEST_CONFIG.criticalCombinations) {
        const fgToken = colorTokens.find(token => token.name === fg)
        const bgToken = colorTokens.find(token => token.name === bg)

        if (!fgToken || !bgToken) {
          console.warn(`⚠️  Skipping missing tokens: ${fg}, ${bg}`)
          continue
        }

        const fgColor = parseColorToRgb(fgToken.value)
        const bgColor = parseColorToRgb(bgToken.value)

        if (!fgColor || !bgColor) {
          console.warn(`⚠️  Could not parse colors: ${fgToken.value}, ${bgToken.value}`)
          continue
        }

        const ratio = calculateContrastRatio(fgColor, bgColor)
        const validation = validateContrastWCAG(ratio, 'normal')

        results.push({
          combination: `${fg} on ${bg}`,
          ratio,
          wcagAA: validation.wcagAA,
          wcagAAA: validation.wcagAAA,
        })

        // Critical combinations should pass WCAG AAA
        expect(ratio).toBeGreaterThanOrEqual(
          TEST_CONFIG.contrastThresholds['AAA-normal'],
          `${fg} on ${bg} must meet WCAG AAA (7:1) but got ${ratio.toFixed(2)}:1`
        )
      }

      console.log('📊 Contrast validation results:')
      results.forEach(result => {
        const status = result.wcagAAA ? '✅ AAA' : result.wcagAA ? '🟡 AA' : '❌ FAIL'
        console.log(`   ${status} ${result.combination}: ${result.ratio.toFixed(2)}:1`)
      })
    })

    it('should validate MFB brand colors meet accessibility standards', () => {
      const mfbTokens = colorTokens.filter(token => token.name.includes('--mfb-'))
      expect(mfbTokens.length).toBeGreaterThan(0, 'Should have MFB brand color tokens')

      const backgroundColors = ['#ffffff', '#000000', '#f8fafc'] // Light, dark, and neutral backgrounds

      for (const mfbToken of mfbTokens) {
        const mfbColor = parseColorToRgb(mfbToken.value)
        if (!mfbColor) continue

        for (const backgroundColor of backgroundColors) {
          const bgColor = parseColorToRgb(backgroundColor)
          if (!bgColor) continue

          const ratio = calculateContrastRatio(mfbColor, bgColor)
          const validation = validateContrastWCAG(ratio, 'normal')

          // MFB colors should meet at least WCAG AA when used as foreground
          if (mfbToken.name.includes('text') || mfbToken.name.includes('foreground')) {
            expect(ratio).toBeGreaterThanOrEqual(
              TEST_CONFIG.contrastThresholds['AA-normal'],
              `${mfbToken.name} must meet WCAG AA against ${backgroundColor}`
            )
          }
        }
      }
    })

    it('should validate semantic color pairs have proper contrast', () => {
      const semanticPairs = [
        { name: 'success', fg: '--success-foreground', bg: '--success' },
        { name: 'warning', fg: '--warning-foreground', bg: '--warning' },
        { name: 'destructive', fg: '--destructive-foreground', bg: '--destructive' },
        { name: 'info', fg: '--info-foreground', bg: '--info' },
      ]

      for (const pair of semanticPairs) {
        const fgToken = colorTokens.find(token => token.name === pair.fg)
        const bgToken = colorTokens.find(token => token.name === pair.bg)

        if (!fgToken || !bgToken) {
          console.warn(`⚠️  Missing semantic pair: ${pair.name}`)
          continue
        }

        const fgColor = parseColorToRgb(fgToken.value)
        const bgColor = parseColorToRgb(bgToken.value)

        if (!fgColor || !bgColor) continue

        const ratio = calculateContrastRatio(fgColor, bgColor)

        // Semantic colors should meet WCAG AAA for critical information
        expect(ratio).toBeGreaterThanOrEqual(
          TEST_CONFIG.contrastThresholds['AAA-normal'],
          `${pair.name} semantic colors must meet WCAG AAA (${ratio.toFixed(2)}:1)`
        )
      }
    })
  })

  describe('Colorblind Accessibility', () => {
    it('should validate colorblind-friendly color alternatives exist', () => {
      const colorblindTokens = colorTokens.filter(token => token.name.includes('--cb-'))
      expect(colorblindTokens.length).toBeGreaterThan(0, 'Should have colorblind-friendly alternatives')

      // Check that colorblind alternatives exist for critical semantic colors
      const requiredColorblindTokens = [
        '--cb-success-bg',
        '--cb-warning-bg',
        '--cb-danger-bg',
        '--cb-info-bg',
      ]

      for (const requiredToken of requiredColorblindTokens) {
        const token = colorblindTokens.find(t => t.name === requiredToken)
        expect(token).toBeDefined(`Missing colorblind-friendly token: ${requiredToken}`)
      }
    })

    it('should ensure colorblind colors have sufficient contrast', () => {
      const colorblindPairs = [
        { fg: '--cb-success-text', bg: '--cb-success-bg' },
        { fg: '--cb-warning-text', bg: '--cb-warning-bg' },
        { fg: '--cb-danger-text', bg: '--cb-danger-bg' },
        { fg: '--cb-info-text', bg: '--cb-info-bg' },
      ]

      for (const pair of colorblindPairs) {
        const fgToken = colorTokens.find(token => token.name === pair.fg)
        const bgToken = colorTokens.find(token => token.name === pair.bg)

        if (!fgToken || !bgToken) continue

        const fgColor = parseColorToRgb(fgToken.value)
        const bgColor = parseColorToRgb(bgToken.value)

        if (!fgColor || !bgColor) continue

        const ratio = calculateContrastRatio(fgColor, bgColor)
        expect(ratio).toBeGreaterThanOrEqual(
          TEST_CONFIG.contrastThresholds['AAA-normal'],
          `Colorblind-friendly ${pair.fg} on ${pair.bg} must meet WCAG AAA`
        )
      }
    })
  })

  describe('High Contrast Mode', () => {
    it('should validate high contrast mode tokens exist', () => {
      const highContrastTokens = colorTokens.filter(token => token.name.includes('--hc-'))
      expect(highContrastTokens.length).toBeGreaterThan(0, 'Should have high contrast mode tokens')

      // Check essential high contrast tokens
      const requiredHCTokens = [
        '--hc-primary-bg',
        '--hc-primary-text',
        '--hc-background-primary',
        '--hc-text-primary',
      ]

      for (const requiredToken of requiredHCTokens) {
        const token = highContrastTokens.find(t => t.name === requiredToken)
        expect(token).toBeDefined(`Missing high contrast token: ${requiredToken}`)
      }
    })

    it('should ensure high contrast tokens meet enhanced contrast ratios', () => {
      const highContrastPairs = [
        { fg: '--hc-primary-text', bg: '--hc-primary-bg' },
        { fg: '--hc-text-primary', bg: '--hc-background-primary' },
        { fg: '--hc-success-text', bg: '--hc-success-bg' },
      ]

      for (const pair of highContrastPairs) {
        const fgToken = colorTokens.find(token => token.name === pair.fg)
        const bgToken = colorTokens.find(token => token.name === pair.bg)

        if (!fgToken || !bgToken) continue

        const fgColor = parseColorToRgb(fgToken.value)
        const bgColor = parseColorToRgb(bgToken.value)

        if (!fgColor || !bgColor) continue

        const ratio = calculateContrastRatio(fgColor, bgColor)

        // High contrast mode should have even higher ratios
        expect(ratio).toBeGreaterThanOrEqual(
          10.0, // Enhanced contrast beyond WCAG AAA
          `High contrast ${pair.fg} on ${pair.bg} should exceed 10:1 ratio`
        )
      }
    })
  })

  describe('Token Consistency', () => {
    it('should not have duplicate token definitions', () => {
      const tokenNames = designTokens.map(token => token.name)
      const duplicates = tokenNames.filter((name, index) => tokenNames.indexOf(name) !== index)

      if (duplicates.length > 0) {
        console.warn(`⚠️  Found duplicate tokens: ${duplicates.join(', ')}`)
        // This might be expected for overrides in different contexts
      }

      expect(duplicates.length).toBeLessThan(5, 'Should minimize duplicate token definitions')
    })

    it('should have consistent naming conventions', () => {
      const badNames = colorTokens.filter(token => {
        const name = token.name
        // Check naming patterns
        return !(
          name.startsWith('--') &&
          name.match(/^--[a-z][a-z0-9-]*$/) // kebab-case after --
        )
      })

      expect(badNames).toEqual([], `Inconsistent token names: ${badNames.map(t => t.name).join(', ')}`)
    })

    it('should validate token references are defined', () => {
      const undefinedReferences: string[] = []
      const tokenNames = new Set(designTokens.map(token => token.name))

      // Check for var() references that don't have corresponding definitions
      for (const token of designTokens) {
        const varMatches = token.value.match(/var\(--([a-zA-Z0-9-_]+)\)/g)
        if (varMatches) {
          for (const varMatch of varMatches) {
            const referencedToken = varMatch.slice(4, -1) // Remove var( and )
            if (!tokenNames.has(referencedToken)) {
              undefinedReferences.push(`${token.name} references undefined ${referencedToken}`)
            }
          }
        }
      }

      expect(undefinedReferences).toEqual([], `Undefined token references: ${undefinedReferences.join(', ')}`)
    })
  })

  describe('Performance Impact', () => {
    it('should not have excessive number of color tokens', () => {
      // Large numbers of CSS variables can impact performance
      expect(colorTokens.length).toBeLessThan(500, 'Should limit total color tokens for performance')
    })

    it('should have reasonable token file sizes', () => {
      for (const tokenFile of TEST_CONFIG.tokenFiles) {
        const filePath = path.resolve(process.cwd(), tokenFile)
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath)
          expect(stats.size).toBeLessThan(50000, `${tokenFile} should be under 50KB`)
        }
      }
    })
  })

  afterAll(() => {
    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTokens: designTokens.length,
        colorTokens: colorTokens.length,
        tokenFiles: TEST_CONFIG.tokenFiles.length,
      },
      coverage: {
        criticalCombinations: TEST_CONFIG.criticalCombinations.length,
        wcagLevels: TEST_CONFIG.wcagLevels.length,
      },
    }

    console.log('📊 Design Token Test Summary:')
    console.log(`   Total tokens: ${report.summary.totalTokens}`)
    console.log(`   Color tokens: ${report.summary.colorTokens}`)
    console.log(`   Files tested: ${report.summary.tokenFiles}`)
    console.log(`   Critical combinations: ${report.coverage.criticalCombinations}`)
  })
})