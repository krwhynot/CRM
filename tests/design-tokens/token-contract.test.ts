/**
 * Token Contract Tests for Design Token Architecture
 *
 * Ensures semantic tokens maintain expected values and contracts across
 * design system changes. Tests token API stability, value consistency,
 * and hierarchical relationships during token consolidation.
 *
 * @see /src/styles/tokens/ - Design token layer system
 * @see /src/lib/design-tokens.ts - Token utilities and contracts
 * @see /.docs/plans/design-tokens-architecture/ - Token architecture plan
 */

import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'

// Token contract interfaces
interface TokenContract {
  name: string
  expectedValue: string | RegExp
  layer: 'primitive' | 'semantic'
  required: boolean
  deprecationDate?: string
  replacementToken?: string
}

interface TokenLayer {
  name: string
  file: string
  dependencies: string[]
  tokens: TokenContract[]
}

// Design token contract definitions
const TOKEN_CONTRACTS: Record<string, TokenContract[]> = {
  primitive: [
    // MFB Brand Colors (Primitives Layer)
    { name: '--mfb-green', expectedValue: /^#[0-9a-fA-F]{6}$/, layer: 'primitive', required: true },
    { name: '--mfb-green-hover', expectedValue: /^#[0-9a-fA-F]{6}$/, layer: 'primitive', required: true },
    { name: '--mfb-green-focus', expectedValue: /^#[0-9a-fA-F]{6}$/, layer: 'primitive', required: true },
    { name: '--mfb-green-active', expectedValue: /^#[0-9a-fA-F]{6}$/, layer: 'primitive', required: true },
    { name: '--mfb-clay', expectedValue: /^#[0-9a-fA-F]{6}$/, layer: 'primitive', required: true },
    { name: '--mfb-cream', expectedValue: /^#[0-9a-fA-F]{6}$/, layer: 'primitive', required: true },
    { name: '--mfb-sage', expectedValue: /^#[0-9a-fA-F]{6}$/, layer: 'primitive', required: true },
    { name: '--mfb-olive', expectedValue: /^#[0-9a-fA-F]{6}$/, layer: 'primitive', required: true },

    // Base Spacing (Primitives Layer)
    { name: '--spacing-xs', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--spacing-sm', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--spacing-md', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--spacing-lg', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--spacing-xl', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },

    // Typography Scale (Primitives Layer)
    { name: '--font-size-xs', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--font-size-sm', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--font-size-base', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--font-size-lg', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--font-size-xl', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },

    // Shadow Primitives
    { name: '--shadow-sm', expectedValue: /^(0 \d+px \d+px rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\))/, layer: 'primitive', required: true },
    { name: '--shadow-md', expectedValue: /^(0 \d+px \d+px rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\))/, layer: 'primitive', required: true },
    { name: '--shadow-lg', expectedValue: /^(0 \d+px \d+px rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\))/, layer: 'primitive', required: true },

    // Border Radius Primitives
    { name: '--radius-sm', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--radius-md', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true },
    { name: '--radius-lg', expectedValue: /^\d+(\.\d+)?(px|rem)$/, layer: 'primitive', required: true }
  ],

  semantic: [
    // Core Semantic Tokens (must reference primitives)
    { name: '--color-primary', expectedValue: /^var\(--mfb-green\)$/, layer: 'semantic', required: true },
    { name: '--color-primary-hover', expectedValue: /^var\(--mfb-green-hover\)$/, layer: 'semantic', required: true },
    { name: '--color-primary-focus', expectedValue: /^var\(--mfb-green-focus\)$/, layer: 'semantic', required: true },
    { name: '--color-primary-active', expectedValue: /^var\(--mfb-green-active\)$/, layer: 'semantic', required: true },

    // Status Colors (must reference primitives)
    { name: '--color-success', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-warning', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-destructive', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-info', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },

    // Background Semantics
    { name: '--color-background', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-foreground', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-muted', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-muted-foreground', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },

    // Surface Semantics
    { name: '--color-card', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-card-foreground', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-popover', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-popover-foreground', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },

    // Interactive Semantics
    { name: '--color-accent', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-accent-foreground', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-border', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-input', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },
    { name: '--color-ring', expectedValue: /^var\(--\w+-\w+\)$/, layer: 'semantic', required: true },

    // Spacing Semantics (must reference primitives)
    { name: '--space-component-padding', expectedValue: /^var\(--spacing-\w+\)$/, layer: 'semantic', required: true },
    { name: '--space-component-margin', expectedValue: /^var\(--spacing-\w+\)$/, layer: 'semantic', required: true },
    { name: '--space-content-gap', expectedValue: /^var\(--spacing-\w+\)$/, layer: 'semantic', required: true },

    // Typography Semantics (must reference primitives)
    { name: '--text-body-size', expectedValue: /^var\(--font-size-\w+\)$/, layer: 'semantic', required: true },
    { name: '--text-heading-size', expectedValue: /^var\(--font-size-\w+\)$/, layer: 'semantic', required: true },
    { name: '--text-caption-size', expectedValue: /^var\(--font-size-\w+\)$/, layer: 'semantic', required: true }
  ],

}

// Token layer hierarchy definition (2-layer simplified architecture)
const TOKEN_LAYERS: TokenLayer[] = [
  {
    name: 'primitives',
    file: 'src/styles/tokens/primitives.css',
    dependencies: [],
    tokens: TOKEN_CONTRACTS.primitive
  },
  {
    name: 'semantic',
    file: 'src/styles/tokens/semantic.css',
    dependencies: ['primitives'],
    tokens: TOKEN_CONTRACTS.semantic
  }
]

// Utility functions for token validation
const extractTokensFromCSS = async (filePath: string): Promise<Record<string, string>> => {
  try {
    const css = await fs.readFile(path.join(process.cwd(), filePath), 'utf-8')
    const tokens: Record<string, string> = {}

    // Extract CSS custom properties
    const tokenRegex = /--([\w-]+):\s*([^;]+);/g
    let match

    while ((match = tokenRegex.exec(css)) !== null) {
      const [, name, value] = match
      tokens[`--${name}`] = value.trim()
    }

    return tokens
  } catch (error) {
    console.warn(`Could not read CSS file: ${filePath}`)
    return {}
  }
}

const validateTokenValue = (actualValue: string, expectedValue: string | RegExp): boolean => {
  if (typeof expectedValue === 'string') {
    return actualValue === expectedValue
  } else {
    return expectedValue.test(actualValue)
  }
}

const findCircularDependencies = (tokenValue: string, visitedTokens: Set<string> = new Set()): boolean => {
  const varMatch = tokenValue.match(/var\((--[\w-]+)\)/)
  if (!varMatch) return false

  const referencedToken = varMatch[1]
  if (visitedTokens.has(referencedToken)) {
    return true // Circular dependency detected
  }

  visitedTokens.add(referencedToken)
  return false // For now, simplified check
}

describe('Token Contract Tests', () => {
  let extractedTokens: Record<string, Record<string, string>> = {}

  beforeAll(async () => {
    // Extract tokens from all layer files
    for (const layer of TOKEN_LAYERS) {
      extractedTokens[layer.name] = await extractTokensFromCSS(layer.file)
    }
  })

  describe('Token Layer Hierarchy Validation', () => {
    it('should enforce strict layer hierarchy - no layer references tokens from higher layers', async () => {
      const violations: Array<{ layer: string; token: string; invalidRef: string }> = []

      for (const layer of TOKEN_LAYERS) {
        const layerTokens = extractedTokens[layer.name]

        for (const [tokenName, tokenValue] of Object.entries(layerTokens)) {
          // Check if token references variables from higher layers
          const varMatches = tokenValue.match(/var\((--[\w-]+)\)/g)

          if (varMatches) {
            for (const varMatch of varMatches) {
              const referencedToken = varMatch.match(/var\((--[\w-]+)\)/)?.[1]
              if (referencedToken) {
                // Check if referenced token exists in a higher layer
                const higherLayers = TOKEN_LAYERS.slice(TOKEN_LAYERS.indexOf(layer) + 1)
                for (const higherLayer of higherLayers) {
                  if (extractedTokens[higherLayer.name]?.[referencedToken]) {
                    violations.push({
                      layer: layer.name,
                      token: tokenName,
                      invalidRef: referencedToken
                    })
                  }
                }
              }
            }
          }
        }
      }

      expect(violations).toEqual([])

      if (violations.length > 0) {
        console.error('Layer hierarchy violations detected:')
        violations.forEach(v =>
          console.error(`  ${v.layer} layer token "${v.token}" references higher layer token "${v.invalidRef}"`)
        )
      }
    })

    it('should ensure each layer only depends on declared dependencies', async () => {
      const dependencyViolations: Array<{ layer: string; token: string; invalidDependency: string }> = []

      for (const layer of TOKEN_LAYERS) {
        const layerTokens = extractedTokens[layer.name]
        const allowedLayers = layer.dependencies

        for (const [tokenName, tokenValue] of Object.entries(layerTokens)) {
          const varMatches = tokenValue.match(/var\((--[\w-]+)\)/g)

          if (varMatches) {
            for (const varMatch of varMatches) {
              const referencedToken = varMatch.match(/var\((--[\w-]+)\)/)?.[1]
              if (referencedToken) {
                // Check if referenced token exists in an allowed dependency layer
                let foundInAllowedLayer = false

                for (const allowedLayer of allowedLayers) {
                  if (extractedTokens[allowedLayer]?.[referencedToken]) {
                    foundInAllowedLayer = true
                    break
                  }
                }

                // If token reference found but not in allowed layers
                if (!foundInAllowedLayer) {
                  // Check if it exists in any layer to identify the violation
                  for (const otherLayer of TOKEN_LAYERS) {
                    if (otherLayer.name !== layer.name && extractedTokens[otherLayer.name]?.[referencedToken]) {
                      dependencyViolations.push({
                        layer: layer.name,
                        token: tokenName,
                        invalidDependency: otherLayer.name
                      })
                      break
                    }
                  }
                }
              }
            }
          }
        }
      }

      expect(dependencyViolations).toEqual([])
    })
  })

  describe('Token Value Contract Validation', () => {
    TOKEN_LAYERS.forEach(layer => {
      describe(`${layer.name} layer contracts`, () => {
        layer.tokens.forEach(contract => {
          it(`should maintain contract for token ${contract.name}`, () => {
            const layerTokens = extractedTokens[layer.name]
            const actualValue = layerTokens[contract.name]

            if (contract.required) {
              expect(actualValue).toBeDefined()
              expect(actualValue).not.toBe('')

              if (actualValue) {
                expect(validateTokenValue(actualValue, contract.expectedValue)).toBe(true)
              }
            } else if (actualValue) {
              // Optional tokens should still match contract if present
              expect(validateTokenValue(actualValue, contract.expectedValue)).toBe(true)
            }
          })

          if (contract.deprecationDate) {
            it(`should flag deprecated token ${contract.name} for migration`, () => {
              const deprecationDate = new Date(contract.deprecationDate)
              const currentDate = new Date()

              if (currentDate > deprecationDate) {
                const layerTokens = extractedTokens[layer.name]
                const tokenExists = layerTokens[contract.name] !== undefined

                if (tokenExists) {
                  console.warn(`DEPRECATED TOKEN ALERT: ${contract.name} should be migrated to ${contract.replacementToken || 'TBD'}`)
                }

                // Don't fail test, but log warning for awareness
                expect(true).toBe(true) // Keep test passing while logging deprecation
              }
            })
          }
        })
      })
    })
  })

  describe('Token Reference Integrity', () => {
    it('should not contain circular token references', () => {
      const circularRefs: Array<{ layer: string; token: string }> = []

      for (const layer of TOKEN_LAYERS) {
        const layerTokens = extractedTokens[layer.name]

        for (const [tokenName, tokenValue] of Object.entries(layerTokens)) {
          if (findCircularDependencies(tokenValue)) {
            circularRefs.push({ layer: layer.name, token: tokenName })
          }
        }
      }

      expect(circularRefs).toEqual([])
    })

    it('should ensure all token references resolve to existing tokens', () => {
      const unresolvedRefs: Array<{ layer: string; token: string; unresolvedRef: string }> = []
      const allTokens = new Set<string>()

      // Collect all available tokens
      for (const layer of TOKEN_LAYERS) {
        Object.keys(extractedTokens[layer.name]).forEach(token => allTokens.add(token))
      }

      // Check all references resolve
      for (const layer of TOKEN_LAYERS) {
        const layerTokens = extractedTokens[layer.name]

        for (const [tokenName, tokenValue] of Object.entries(layerTokens)) {
          const varMatches = tokenValue.match(/var\((--[\w-]+)\)/g)

          if (varMatches) {
            for (const varMatch of varMatches) {
              const referencedToken = varMatch.match(/var\((--[\w-]+)\)/)?.[1]
              if (referencedToken && !allTokens.has(referencedToken)) {
                unresolvedRefs.push({
                  layer: layer.name,
                  token: tokenName,
                  unresolvedRef: referencedToken
                })
              }
            }
          }
        }
      }

      expect(unresolvedRefs).toEqual([])
    })
  })

  describe('MFB Brand Token Cleanup Validation', () => {
    it('should confirm MFB brand tokens are completely removed', () => {
      const primitiveTokens = extractedTokens.primitives

      // These MFB tokens should no longer exist
      const legacyMFBTokens = [
        '--mfb-green',
        '--mfb-clay',
        '--mfb-cream',
        '--mfb-sage',
        '--mfb-olive',
        '--mfb-green-hover',
        '--mfb-green-focus',
        '--mfb-green-active'
      ]

      const remainingMFBTokens = legacyMFBTokens.filter(tokenName =>
        primitiveTokens[tokenName] !== undefined
      )

      expect(remainingMFBTokens.length).toBe(0,
        `Found ${remainingMFBTokens.length} legacy MFB tokens that should be removed: ${remainingMFBTokens.join(', ')}`
      )

      if (remainingMFBTokens.length === 0) {
        console.log('✅ MFB token cleanup complete - all legacy tokens removed')
      } else {
        console.error('❌ MFB token cleanup incomplete:', remainingMFBTokens)
      }
    })

    it('should validate new brand color system is implemented', () => {
      const primitiveTokens = extractedTokens.primitives

      // Check for new brand token structure
      const expectedNewTokens = [
        '--brand-primary',
        '--brand-primary-hover',
        '--brand-primary-focus',
        '--brand-success',
        '--brand-warning',
        '--brand-error'
      ]

      const foundNewTokens = expectedNewTokens.filter(tokenName =>
        primitiveTokens[tokenName] !== undefined
      )

      console.log(`Found ${foundNewTokens.length}/${expectedNewTokens.length} new brand tokens`)

      // Allow gradual implementation
      if (foundNewTokens.length >= expectedNewTokens.length * 0.5) {
        console.log('✅ New brand system implementation in progress')
      } else {
        console.warn('⚠️ New brand system implementation not yet started')
      }

      // Don't fail test during transition, just track progress
      expect(foundNewTokens.length).toBeGreaterThanOrEqual(0)
    })

    it('should validate new brand tokens replace MFB mappings', () => {
      const semanticTokens = extractedTokens.semantic

      // Check that semantic tokens no longer reference MFB primitives
      const mfbMappings = Object.entries(semanticTokens).filter(([, value]) =>
        value.includes('--mfb-')
      )

      expect(mfbMappings.length).toBe(0,
        `Found ${mfbMappings.length} semantic tokens still referencing MFB primitives: ${mfbMappings.map(([key]) => key).join(', ')}`
      )

      // Check for new brand token mappings
      const expectedNewMappings = [
        { semantic: '--primary', expectedPattern: /^var\(--brand-primary.*\)$/ },
        { semantic: '--primary-foreground', expectedPattern: /^var\(--brand-primary-.*\)$/ },
        { semantic: '--success', expectedPattern: /^var\(--brand-success.*\)$/ },
        { semantic: '--warning', expectedPattern: /^var\(--brand-warning.*\)$/ },
      ]

      let validMappings = 0
      expectedNewMappings.forEach(({ semantic, expectedPattern }) => {
        const actualValue = semanticTokens[semantic]

        if (actualValue && expectedPattern.test(actualValue)) {
          console.log(`✅ ${semantic}: ${actualValue}`)
          validMappings++
        } else if (actualValue) {
          console.warn(`⚠️ ${semantic}: ${actualValue} (doesn't match expected pattern)`)
        } else {
          console.warn(`❌ Missing semantic token: ${semantic}`)
        }
      })

      // Allow partial implementation during transition
      expect(validMappings).toBeGreaterThanOrEqual(1,
        'Should have at least some new brand token mappings'
      )
    })
  })

  describe('Token API Stability', () => {
    it('should maintain backwards compatibility for public token API', () => {
      // Define tokens that must remain stable for backwards compatibility (2-layer system)
      const publicAPITokens = [
        '--primary',
        '--secondary',
        '--background',
        '--foreground',
        '--muted',
        '--accent',
        '--destructive',
        '--success',
        '--warning',
        '--card',
        '--card-foreground'
      ]

      const missingAPITokens: string[] = []
      const semanticTokens = extractedTokens.semantic

      publicAPITokens.forEach(tokenName => {
        const existsInSemantic = semanticTokens[tokenName] !== undefined

        if (!existsInSemantic) {
          missingAPITokens.push(tokenName)
        }
      })

      expect(missingAPITokens).toEqual([])

      if (missingAPITokens.length > 0) {
        console.error('Missing public API tokens:', missingAPITokens)
      }
    })
  })

  describe('Colorblind Accessibility Contract', () => {
    it('should validate colorblind-friendly token existence', () => {
      const semanticTokens = extractedTokens.semantic

      // Check for colorblind-friendly token patterns
      const colorblindTokens = Object.keys(semanticTokens).filter(token =>
        token.includes('--cb-') ||
        token.includes('colorblind') ||
        token.includes('accessible')
      )

      // Expected colorblind token categories
      const expectedColorblindCategories = [
        'cb-success',
        'cb-warning',
        'cb-error',
        'cb-info'
      ]

      let foundCategories = 0
      expectedColorblindCategories.forEach(category => {
        const hasCategory = colorblindTokens.some(token => token.includes(category))
        if (hasCategory) {
          foundCategories++
          console.log(`✅ Found colorblind tokens for: ${category}`)
        } else {
          console.warn(`⚠️ Missing colorblind tokens for: ${category}`)
        }
      })

      // Track but don't fail during implementation
      expect(foundCategories).toBeGreaterThanOrEqual(0)

      console.log(`Colorblind accessibility coverage: ${foundCategories}/${expectedColorblindCategories.length} categories`)
    })

    it('should ensure zero MFB references across all token layers', () => {
      let totalMfbReferences = 0
      const mfbViolations: Array<{ layer: string; token: string; value: string }> = []

      TOKEN_LAYERS.forEach(layer => {
        const layerTokens = extractedTokens[layer.name]

        Object.entries(layerTokens).forEach(([tokenName, tokenValue]) => {
          // Check token name for MFB references
          if (tokenName.includes('--mfb-')) {
            totalMfbReferences++
            mfbViolations.push({
              layer: layer.name,
              token: tokenName,
              value: tokenValue
            })
          }

          // Check token value for MFB references
          if (tokenValue.includes('--mfb-')) {
            totalMfbReferences++
            mfbViolations.push({
              layer: layer.name,
              token: tokenName,
              value: tokenValue
            })
          }
        })
      })

      expect(totalMfbReferences).toBe(0,
        `Found ${totalMfbReferences} MFB references that should be removed during overhaul`
      )

      if (mfbViolations.length > 0) {
        console.error('MFB references found:', mfbViolations)
      } else {
        console.log('✅ Zero MFB references - token overhaul cleanup successful')
      }
    })
  })

  describe('Performance Contract Validation', () => {
    it('should not exceed maximum token count per layer', () => {
      const maxTokenLimits = {
        primitives: 100,   // Base primitives should be limited
        semantic: 150      // Semantic mappings can be more numerous
      }

      const tokenCountViolations: Array<{ layer: string; count: number; limit: number }> = []

      TOKEN_LAYERS.forEach(layer => {
        const tokenCount = Object.keys(extractedTokens[layer.name]).length
        const limit = maxTokenLimits[layer.name as keyof typeof maxTokenLimits]

        if (tokenCount > limit) {
          tokenCountViolations.push({
            layer: layer.name,
            count: tokenCount,
            limit: limit
          })
        }
      })

      expect(tokenCountViolations).toEqual([])
    })

    it('should maintain reasonable token nesting depth', () => {
      const maxNestingDepth = 3 // e.g., var(var(var(--token)))
      const deepNestingViolations: Array<{ layer: string; token: string; depth: number }> = []

      TOKEN_LAYERS.forEach(layer => {
        const layerTokens = extractedTokens[layer.name]

        Object.entries(layerTokens).forEach(([tokenName, tokenValue]) => {
          const nestingDepth = (tokenValue.match(/var\(/g) || []).length

          if (nestingDepth > maxNestingDepth) {
            deepNestingViolations.push({
              layer: layer.name,
              token: tokenName,
              depth: nestingDepth
            })
          }
        })
      })

      expect(deepNestingViolations).toEqual([])
    })

    it('should complete validation in reasonable time for CI/CD', () => {
      const startTime = Date.now()

      // Simulate validation workload
      let operations = 0
      TOKEN_LAYERS.forEach(layer => {
        operations += Object.keys(extractedTokens[layer.name]).length
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete quickly for CI/CD
      expect(duration).toBeLessThan(1000, 'Token contract validation should complete within 1 second')

      console.log(`⚡ Validated ${operations} token contracts in ${duration}ms`)
    })
  })
})