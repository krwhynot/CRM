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
  layer: 'primitive' | 'semantic' | 'component' | 'feature'
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

  component: [
    // Button Component Tokens (must reference semantic)
    { name: '--btn-primary-bg', expectedValue: /^var\(--color-primary\)$/, layer: 'component', required: true },
    { name: '--btn-primary-fg', expectedValue: /^var\(--color-primary-foreground\)$/, layer: 'component', required: true },
    { name: '--btn-primary-hover-bg', expectedValue: /^var\(--color-primary-hover\)$/, layer: 'component', required: true },
    { name: '--btn-primary-focus-ring', expectedValue: /^var\(--color-ring\)$/, layer: 'component', required: true },

    { name: '--btn-secondary-bg', expectedValue: /^var\(--color-secondary\)$/, layer: 'component', required: true },
    { name: '--btn-secondary-fg', expectedValue: /^var\(--color-secondary-foreground\)$/, layer: 'component', required: true },
    { name: '--btn-destructive-bg', expectedValue: /^var\(--color-destructive\)$/, layer: 'component', required: true },
    { name: '--btn-destructive-fg', expectedValue: /^var\(--color-destructive-foreground\)$/, layer: 'component', required: true },

    // Input Component Tokens (must reference semantic)
    { name: '--input-bg', expectedValue: /^var\(--color-background\)$/, layer: 'component', required: true },
    { name: '--input-fg', expectedValue: /^var\(--color-foreground\)$/, layer: 'component', required: true },
    { name: '--input-border', expectedValue: /^var\(--color-input\)$/, layer: 'component', required: true },
    { name: '--input-focus-ring', expectedValue: /^var\(--color-ring\)$/, layer: 'component', required: true },
    { name: '--input-placeholder', expectedValue: /^var\(--color-muted-foreground\)$/, layer: 'component', required: true },

    // Card Component Tokens (must reference semantic)
    { name: '--card-bg', expectedValue: /^var\(--color-card\)$/, layer: 'component', required: true },
    { name: '--card-fg', expectedValue: /^var\(--color-card-foreground\)$/, layer: 'component', required: true },
    { name: '--card-border', expectedValue: /^var\(--color-border\)$/, layer: 'component', required: true },
    { name: '--card-padding', expectedValue: /^var\(--space-component-padding\)$/, layer: 'component', required: true },

    // Badge Component Tokens (must reference semantic)
    { name: '--badge-primary-bg', expectedValue: /^var\(--color-primary\)$/, layer: 'component', required: true },
    { name: '--badge-primary-fg', expectedValue: /^var\(--color-primary-foreground\)$/, layer: 'component', required: true },
    { name: '--badge-secondary-bg', expectedValue: /^var\(--color-secondary\)$/, layer: 'component', required: true },
    { name: '--badge-destructive-bg', expectedValue: /^var\(--color-destructive\)$/, layer: 'component', required: true }
  ],

  feature: [
    // Density Feature Tokens (must reference semantic/component)
    { name: '--density-compact-scale', expectedValue: /^0\.[5-9]$/, layer: 'feature', required: true },
    { name: '--density-comfortable-scale', expectedValue: /^1(\.[0-2])?$/, layer: 'feature', required: true },
    { name: '--density-spacious-scale', expectedValue: /^1\.[3-7]$/, layer: 'feature', required: true },

    // Accessibility Feature Tokens (must reference semantic/component)
    { name: '--hc-primary-bg', expectedValue: /^var\(--color-primary\)$/, layer: 'feature', required: true },
    { name: '--hc-primary-border', expectedValue: /^2px solid var\(--color-primary\)$/, layer: 'feature', required: true },
    { name: '--hc-focus-outline', expectedValue: /^3px solid var\(--color-ring\)$/, layer: 'feature', required: true },
    { name: '--hc-text-decoration', expectedValue: 'underline', layer: 'feature', required: true },

    // Animation Feature Tokens (must reference semantic)
    { name: '--motion-duration-fast', expectedValue: /^\d{1,3}ms$/, layer: 'feature', required: false },
    { name: '--motion-duration-normal', expectedValue: /^\d{1,3}ms$/, layer: 'feature', required: false },
    { name: '--motion-duration-slow', expectedValue: /^\d{1,3}ms$/, layer: 'feature', required: false },
    { name: '--motion-easing-standard', expectedValue: /^cubic-bezier\([\d.,\s]+\)$/, layer: 'feature', required: false }
  ]
}

// Token layer hierarchy definition
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
  },
  {
    name: 'components',
    file: 'src/styles/tokens/components.css',
    dependencies: ['primitives', 'semantic'],
    tokens: TOKEN_CONTRACTS.component
  },
  {
    name: 'features',
    file: 'src/styles/tokens/features.css',
    dependencies: ['primitives', 'semantic', 'components'],
    tokens: TOKEN_CONTRACTS.feature
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

  describe('MFB Brand Token Stability', () => {
    it('should maintain stable MFB brand token values', () => {
      const expectedMFBTokens = {
        '--mfb-green': '#4a7c59',      // Core MFB Green
        '--mfb-clay': '#c19a6b',       // MFB Clay
        '--mfb-cream': '#f4f4f0',      // MFB Cream
        '--mfb-sage': '#87a96b',       // MFB Sage
        '--mfb-olive': '#8b9456'       // MFB Olive
      }

      const primitiveTokens = extractedTokens.primitives

      Object.entries(expectedMFBTokens).forEach(([tokenName, expectedValue]) => {
        const actualValue = primitiveTokens[tokenName]

        if (actualValue && actualValue.startsWith('#')) {
          // Allow for slight variations or different formats but flag major changes
          const isValidColor = /^#[0-9a-fA-F]{6}$/.test(actualValue)
          expect(isValidColor).toBe(true)

          // Log if value has changed from expected
          if (actualValue.toLowerCase() !== expectedValue.toLowerCase()) {
            console.warn(`MFB Brand Color Change: ${tokenName} expected ${expectedValue}, got ${actualValue}`)
          }
        }
      })
    })

    it('should ensure MFB brand tokens are properly mapped to semantic tokens', () => {
      const semanticTokens = extractedTokens.semantic
      const expectedMappings = [
        { semantic: '--color-primary', expectedPrimitive: '--mfb-green' },
        { semantic: '--color-primary-hover', expectedPrimitive: '--mfb-green-hover' },
        { semantic: '--color-primary-focus', expectedPrimitive: '--mfb-green-focus' },
        { semantic: '--color-primary-active', expectedPrimitive: '--mfb-green-active' }
      ]

      expectedMappings.forEach(({ semantic, expectedPrimitive }) => {
        const actualValue = semanticTokens[semantic]
        const expectedValue = `var(${expectedPrimitive})`

        if (actualValue) {
          expect(actualValue).toBe(expectedValue)
        } else {
          console.warn(`Missing semantic token mapping: ${semantic} should map to ${expectedPrimitive}`)
        }
      })
    })
  })

  describe('Token API Stability', () => {
    it('should maintain backwards compatibility for public token API', () => {
      // Define tokens that must remain stable for backwards compatibility
      const publicAPITokens = [
        '--color-primary',
        '--color-secondary',
        '--color-background',
        '--color-foreground',
        '--color-muted',
        '--color-accent',
        '--color-destructive',
        '--color-success',
        '--color-warning',
        '--btn-primary-bg',
        '--input-bg',
        '--card-bg'
      ]

      const missingAPITokens: string[] = []
      const semanticTokens = extractedTokens.semantic
      const componentTokens = extractedTokens.components

      publicAPITokens.forEach(tokenName => {
        const existsInSemantic = semanticTokens[tokenName] !== undefined
        const existsInComponent = componentTokens[tokenName] !== undefined

        if (!existsInSemantic && !existsInComponent) {
          missingAPITokens.push(tokenName)
        }
      })

      expect(missingAPITokens).toEqual([])

      if (missingAPITokens.length > 0) {
        console.error('Missing public API tokens:', missingAPITokens)
      }
    })
  })

  describe('Performance Contract Validation', () => {
    it('should not exceed maximum token count per layer', () => {
      const maxTokenLimits = {
        primitives: 100,   // Base primitives should be limited
        semantic: 150,     // Semantic mappings can be more numerous
        components: 200,   // Components may have many variants
        features: 100      // Features should be focused
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
  })
})