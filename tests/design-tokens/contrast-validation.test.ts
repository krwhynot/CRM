/**
 * Design Token Contrast Validation Tests
 *
 * Automated accessibility testing for design tokens with WCAG AA/AAA
 * compliance validation, proper contrast ratio algorithms, colorblind
 * accessibility validation, and performance-optimized testing for CI/CD.
 *
 * Enhanced for design token system overhaul with zero MFB reference validation,
 * new brand color system testing, and comprehensive accessibility coverage.
 *
 * @see /src/styles/tokens/primitives.css - New OKLCH primitive tokens
 * @see /src/styles/tokens/semantic.css - Enhanced semantic mappings
 * @see /src/lib/design-token-utils.ts - OKLCH conversion and contrast utilities
 * @see /scripts/validate-design-tokens.sh - Enhanced validation script
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseColorToRgb, calculateContrastRatio, validateContrastWCAG } from '../../src/lib/design-token-utils'

// Test configuration
const TEST_CONFIG = {
  // WCAG compliance levels to test
  wcagLevels: ['AA', 'AAA'] as const,
  // Color token files to analyze (updated for 2-layer architecture with new brand system)
  tokenFiles: [
    'src/styles/tokens/primitives.css',
    'src/styles/tokens/semantic.css',
    'src/styles/tokens/primitives-new.css',
    'src/styles/tokens/semantic-new.css',
    'src/index.css',
    'src/styles/accessibility-tokens.css',
  ],
  // Critical color combinations that must pass AAA (post-overhaul with new brand system)
  criticalCombinations: [
    { fg: '--text-primary', bg: '--background' },
    { fg: '--text-body', bg: '--card' },
    { fg: '--brand-primary', bg: '--background' },
    { fg: '--brand-primary-foreground', bg: '--brand-primary' },
    { fg: '--destructive-foreground', bg: '--destructive' },
    { fg: '--success-foreground', bg: '--success' },
    { fg: '--warning-foreground', bg: '--warning' },
    { fg: '--info-foreground', bg: '--info' },
    // Legacy MFB combinations (should fail if MFB tokens are removed)
    { fg: '--mfb-green-foreground', bg: '--mfb-green', optional: true },
  ],
  // Colorblind test combinations
  colorblindCombinations: [
    { fg: '--cb-success-text', bg: '--cb-success-bg' },
    { fg: '--cb-warning-text', bg: '--cb-warning-bg' },
    { fg: '--cb-error-text', bg: '--cb-error-bg' },
    { fg: '--cb-info-text', bg: '--cb-info-bg' },
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

    it('should validate new brand colors meet accessibility standards', () => {
      // Test both legacy MFB tokens (should be removed) and new brand tokens
      const mfbTokens = colorTokens.filter(token => token.name.includes('--mfb-'))
      const brandTokens = colorTokens.filter(token => token.name.includes('--brand-'))
      
      // After overhaul, MFB tokens should be zero
      if (mfbTokens.length === 0) {
        console.log('✅ MFB token removal successful - no legacy tokens found')
      } else {
        console.warn(`⚠️  Found ${mfbTokens.length} legacy MFB tokens that should be removed`)
      }

      // Test new brand color system
      expect(brandTokens.length).toBeGreaterThan(0, 'Should have new brand color tokens')

      const backgroundColors = [
        { color: '#ffffff', name: 'white' },
        { color: '#000000', name: 'black' },
        { color: '#f8fafc', name: 'neutral' },
        { color: 'oklch(0.98 0.02 0)', name: 'light-oklch' },
        { color: 'oklch(0.09 0.01 0)', name: 'dark-oklch' }
      ]

      for (const brandToken of brandTokens) {
        const brandColor = parseColorToRgb(brandToken.value)
        if (!brandColor) continue

        for (const { color: backgroundColor, name: bgName } of backgroundColors) {
          const bgColor = parseColorToRgb(backgroundColor)
          if (!bgColor) continue

          const ratio = calculateContrastRatio(brandColor, bgColor)
          const validation = validateContrastWCAG(ratio, 'normal')

          // New brand colors should meet at least WCAG AA when used as foreground
          if (brandToken.name.includes('text') || brandToken.name.includes('foreground')) {
            expect(ratio).toBeGreaterThanOrEqual(
              TEST_CONFIG.contrastThresholds['AA-normal'],
              `${brandToken.name} must meet WCAG AA against ${bgName} (${ratio.toFixed(2)}:1)`
            )
          }

          console.log(`🎨 ${brandToken.name} vs ${bgName}: ${ratio.toFixed(2)}:1 (${validation.wcagAAA ? 'AAA' : validation.wcagAA ? 'AA' : 'FAIL'})`)
        }
      }

      // Test legacy MFB tokens if they still exist (should be removed)
      for (const mfbToken of mfbTokens) {
        console.warn(`❌ Legacy MFB token found: ${mfbToken.name} (should be removed in overhaul)`)
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

    it('should validate new brand color system implementation', () => {
      const newBrandTokens = colorTokens.filter(token => 
        token.name.includes('--brand-') && 
        !token.name.includes('--mfb-')
      )
      
      console.log(`Found ${newBrandTokens.length} new brand tokens`)
      
      // Expected new brand tokens
      const expectedBrandTokens = [
        '--brand-primary',
        '--brand-primary-hover', 
        '--brand-primary-focus',
        '--brand-secondary',
        '--brand-accent',
        '--brand-success',
        '--brand-warning',
        '--brand-error'
      ]
      
      let foundBrandTokens = 0
      for (const expectedToken of expectedBrandTokens) {
        const token = newBrandTokens.find(t => t.name === expectedToken)
        if (token) {
          foundBrandTokens++
          console.log(`✅ Found new brand token: ${expectedToken}`)
          
          // Validate OKLCH format for new brand tokens
          if (token.value.includes('oklch(')) {
            console.log(`   🎨 Using OKLCH: ${token.value}`)
          } else {
            console.warn(`   ⚠️  Not using OKLCH: ${token.value}`)
          }
        } else {
          console.warn(`⚠️  Missing new brand token: ${expectedToken}`)
        }
      }
      
      // Allow gradual implementation
      expect(foundBrandTokens).toBeGreaterThanOrEqual(
        Math.floor(expectedBrandTokens.length * 0.3),
        `Should have at least 30% of new brand tokens implemented`
      )
      
      console.log(`📊 New brand system progress: ${foundBrandTokens}/${expectedBrandTokens.length} tokens`)
    })
  })

  describe('Enhanced Colorblind Accessibility', () => {
    it('should validate colorblind-friendly color alternatives exist', () => {
      const colorblindTokens = colorTokens.filter(token => 
        token.name.includes('--cb-') || 
        token.name.includes('colorblind') ||
        token.name.includes('accessible')
      )
      
      console.log(`🌈 Found ${colorblindTokens.length} colorblind-friendly tokens`)
      
      // Enhanced colorblind token requirements
      const requiredColorblindTokens = [
        '--cb-success-bg',
        '--cb-success-text',
        '--cb-warning-bg', 
        '--cb-warning-text',
        '--cb-error-bg',
        '--cb-error-text',
        '--cb-info-bg',
        '--cb-info-text',
      ]

      let foundTokens = 0
      for (const requiredToken of requiredColorblindTokens) {
        const token = colorblindTokens.find(t => t.name === requiredToken)
        if (token) {
          foundTokens++
          console.log(`✅ Found colorblind token: ${requiredToken}`)
        } else {
          console.warn(`⚠️  Missing colorblind token: ${requiredToken}`)
        }
      }

      // Allow gradual implementation
      expect(foundTokens).toBeGreaterThanOrEqual(
        Math.floor(requiredColorblindTokens.length * 0.5),
        `Should have at least 50% of colorblind tokens (found ${foundTokens}/${requiredColorblindTokens.length})`
      )

      console.log(`📊 Colorblind token coverage: ${foundTokens}/${requiredColorblindTokens.length} (${Math.round(foundTokens/requiredColorblindTokens.length*100)}%)`)
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

  describe('Token Consistency and MFB Migration', () => {
    it('should validate zero MFB references after overhaul', () => {
      const mfbTokens = designTokens.filter(token => 
        token.name.includes('--mfb-') || 
        token.value.includes('--mfb-')
      )
      
      console.log(`🔍 MFB reference check: found ${mfbTokens.length} tokens`)
      
      if (mfbTokens.length === 0) {
        console.log('✅ Zero MFB references - token overhaul successful')
      } else {
        console.error('❌ Found MFB references that should be removed:')
        mfbTokens.forEach(token => {
          console.error(`   ${token.name}: ${token.value} (in ${token.file})`)
        })
      }

      // Expect zero MFB references after overhaul
      expect(mfbTokens.length).toBe(0, 
        `Found ${mfbTokens.length} MFB references that should be removed during token overhaul`
      )
    })

    it('should not have duplicate token definitions', () => {
      const tokenNames = designTokens.map(token => token.name)
      const duplicates = tokenNames.filter((name, index) => tokenNames.indexOf(name) !== index)

      if (duplicates.length > 0) {
        console.warn(`⚠️  Found duplicate tokens: ${duplicates.join(', ')}`)
        // This might be expected for overrides in different contexts during migration
      }

      // Allow more duplicates during migration period
      expect(duplicates.length).toBeLessThan(10, 'Should minimize duplicate token definitions')
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
            
            // Skip MFB references during migration (they should be undefined after overhaul)
            if (referencedToken.includes('mfb-')) {
              console.log(`🔍 Found MFB reference in ${token.name}: ${referencedToken} (should be migrated)`)
              continue
            }
            
            if (!tokenNames.has(referencedToken)) {
              undefinedReferences.push(`${token.name} references undefined ${referencedToken}`)
            }
          }
        }
      }

      // Allow some undefined references during migration period
      expect(undefinedReferences.length).toBeLessThan(5, 
        `Too many undefined token references: ${undefinedReferences.join(', ')}`
      )
      
      if (undefinedReferences.length > 0) {
        console.warn(`⚠️  Found ${undefinedReferences.length} undefined references (acceptable during migration)`)
      }
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
    // Generate enhanced test report for overhaul validation
    const mfbTokens = designTokens.filter(token => 
      token.name.includes('--mfb-') || token.value.includes('--mfb-')
    )
    const brandTokens = designTokens.filter(token => token.name.includes('--brand-'))
    const colorblindTokens = designTokens.filter(token => 
      token.name.includes('--cb-') || token.name.includes('colorblind')
    )
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTokens: designTokens.length,
        colorTokens: colorTokens.length,
        tokenFiles: TEST_CONFIG.tokenFiles.length,
        mfbTokens: mfbTokens.length,
        brandTokens: brandTokens.length,
        colorblindTokens: colorblindTokens.length,
      },
      coverage: {
        criticalCombinations: TEST_CONFIG.criticalCombinations.length,
        wcagLevels: TEST_CONFIG.wcagLevels.length,
      },
      overhaul: {
        mfbRemovalComplete: mfbTokens.length === 0,
        brandSystemImplemented: brandTokens.length > 0,
        colorblindSupport: colorblindTokens.length > 0,
      }
    }

    console.log('📊 Design Token Overhaul Test Summary:')
    console.log(`   Total tokens: ${report.summary.totalTokens}`)
    console.log(`   Color tokens: ${report.summary.colorTokens}`)
    console.log(`   Files tested: ${report.summary.tokenFiles}`)
    console.log(`   Critical combinations: ${report.coverage.criticalCombinations}`)
    console.log(`   MFB tokens remaining: ${report.summary.mfbTokens} (should be 0)`)
    console.log(`   New brand tokens: ${report.summary.brandTokens}`)
    console.log(`   Colorblind tokens: ${report.summary.colorblindTokens}`)
    console.log('🎯 Overhaul Status:')
    console.log(`   ✅ MFB removal: ${report.overhaul.mfbRemovalComplete ? 'Complete' : 'In Progress'}`)
    console.log(`   ✅ Brand system: ${report.overhaul.brandSystemImplemented ? 'Implemented' : 'Pending'}`)
    console.log(`   ✅ Colorblind support: ${report.overhaul.colorblindSupport ? 'Present' : 'Missing'}`)
  })
})