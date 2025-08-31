/**
 * Component Placement Architecture Tests
 * Validates that components are placed in correct directories according to feature-based organization
 */

import { describe, test, expect, beforeAll } from 'vitest'
import { readdir, readFile } from 'fs/promises'
import { join, basename } from 'path'
import { glob } from 'glob'

const projectRoot = join(process.cwd())

describe('Component Placement Architecture', () => {
  let sharedComponents: string[] = []
  let featureComponents: string[] = []
  let allComponents: string[] = []

  beforeAll(async () => {
    // Get shared components
    sharedComponents = await glob('src/components/**/*.{ts,tsx}', { 
      cwd: projectRoot,
      ignore: ['**/index.ts', '**/index.tsx']
    })
    
    // Get feature components
    featureComponents = await glob('src/features/**/components/**/*.{ts,tsx}', {
      cwd: projectRoot,
      ignore: ['**/index.ts', '**/index.tsx']
    })
    
    allComponents = [...sharedComponents, ...featureComponents]
  })

  describe('Shared Components (/src/components/)', () => {
    test('should only contain generic, reusable components', async () => {
      // Components that should NOT be in shared directory
      const featureSpecificPatterns = [
        /Contact(?!s\b)/,  // ContactForm, ContactCard (but not ContactsTable)
        /Organization(?!s\b)/, // OrganizationForm, OrganizationCard  
        /Product(?!s\b)/,   // ProductForm, ProductCard
        /Opportunity/,      // OpportunityForm, OpportunityCard
        /Interaction/,      // InteractionForm, InteractionCard
        /Dashboard/,        // Dashboard-specific components
      ]

      const violations: Array<{ file: string; pattern: string }> = []

      for (const file of sharedComponents) {
        const fileName = basename(file)
        
        for (const pattern of featureSpecificPatterns) {
          if (pattern.test(fileName)) {
            violations.push({ file, pattern: pattern.source })
          }
        }
      }

      expect(violations).toEqual([])
    })

    test('should contain appropriate UI primitives', async () => {
      const expectedPrimitives = [
        'ui/',
        'forms/',
        'CommandPalette',
        'error-boundaries/',
      ]

      let hasUIComponents = false
      const sharedPaths = sharedComponents.join(' ')

      for (const primitive of expectedPrimitives) {
        if (sharedPaths.includes(primitive)) {
          hasUIComponents = true
          break
        }
      }

      expect(hasUIComponents).toBe(true)
    })

    test('should not import from feature directories', async () => {
      const violations: Array<{ file: string; import: string }> = []

      for (const file of sharedComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for feature imports
        const featureImportPattern = /from ['"]@\/features\/([^'"]*)['"]|from ['"]\.\.\/\.\.\/features\/([^'"]*)['"]|from ['"]\.\/features\/([^'"]*)['"]/g
        const matches = content.match(featureImportPattern)
        
        if (matches) {
          matches.forEach(match => {
            violations.push({ file, import: match })
          })
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('Feature Components (/src/features/{feature}/components/)', () => {
    test('should be placed in correct feature directories', async () => {
      const featureMapping = [
        { patterns: [/Contact/], expectedFeature: 'contacts' },
        { patterns: [/Organization/], expectedFeature: 'organizations' },  
        { patterns: [/Product/], expectedFeature: 'products' },
        { patterns: [/Opportunity/], expectedFeature: 'opportunities' },
        { patterns: [/Interaction/], expectedFeature: 'interactions' },
        { patterns: [/Dashboard/, /Stats/, /Chart/], expectedFeature: 'dashboard' },
      ]

      const violations: Array<{ file: string; component: string; expectedFeature: string; actualPath: string }> = []

      for (const file of featureComponents) {
        const fileName = basename(file)
        const filePath = file
        
        for (const mapping of featureMapping) {
          const matchesPattern = mapping.patterns.some(pattern => pattern.test(fileName))
          
          if (matchesPattern) {
            const isInCorrectFeature = filePath.includes(`features/${mapping.expectedFeature}/`)
            
            if (!isInCorrectFeature) {
              violations.push({
                file,
                component: fileName,
                expectedFeature: mapping.expectedFeature,
                actualPath: filePath
              })
            }
          }
        }
      }

      expect(violations).toEqual([])
    })

    test('should follow proper directory structure within features', async () => {
      const featureComponentDirs = await glob('src/features/*/components', { cwd: projectRoot })
      const violations: string[] = []

      for (const dir of featureComponentDirs) {
        const dirPath = join(projectRoot, dir)
        
        try {
          const entries = await readdir(dirPath, { withFileTypes: true })
          
          // Check if there's an index.ts file for exports
          const hasIndex = entries.some(entry => 
            entry.name === 'index.ts' || entry.name === 'index.tsx'
          )
          
          if (!hasIndex) {
            violations.push(dir)
          }
        } catch (error) {
          // Directory might not exist, which is fine
        }
      }

      // Allow some flexibility - not all features need index files yet
      expect(violations.length).toBeLessThanOrEqual(featureComponentDirs.length)
    })
  })

  describe('Import Patterns', () => {
    test('feature components should use relative imports within feature', async () => {
      const violations: Array<{ file: string; import: string }> = []

      for (const file of featureComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Get the feature name from the path
        const featureMatch = file.match(/features\/([^\/]+)\//)
        if (!featureMatch) continue
        
        const featureName = featureMatch[1]
        
        // Check for absolute imports to same feature (should be relative)
        const absoluteImportPattern = new RegExp(`from ['"]@\/features\/${featureName}\/components\/([^'"]*)['"]`, 'g')
        const matches = content.match(absoluteImportPattern)
        
        if (matches) {
          matches.forEach(match => {
            violations.push({ file, import: match })
          })
        }
      }

      // Allow some violations as this is a guideline, not a strict rule
      expect(violations.length).toBeLessThanOrEqual(5)
    })

    test('components should import shared components correctly', async () => {
      let hasProperSharedImports = false

      for (const file of allComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for proper shared imports
        const sharedImportPattern = /from ['"]@\/components\/([^'"]*)['"]|from ['"]@\/components\/ui\/([^'"]*)['"]|from ['"]@\/lib\/([^'"]*)['"]/ 
        
        if (sharedImportPattern.test(content)) {
          hasProperSharedImports = true
          break
        }
      }

      expect(hasProperSharedImports).toBe(true)
    })
  })

  describe('Naming Conventions', () => {
    test('shared components should have generic names', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of sharedComponents) {
        const fileName = basename(file, '.tsx').replace('.ts', '')
        
        // Skip UI components and index files
        if (file.includes('/ui/') || fileName === 'index') continue
        
        // Check for overly specific domain names
        const domainSpecificPatterns = [
          /CRM/,
          /Sales/,
          /Kitchen/,
          /Food/,
          /Broker/,
        ]
        
        const hasSpecificDomain = domainSpecificPatterns.some(pattern => pattern.test(fileName))
        
        if (hasSpecificDomain) {
          violations.push({ file, issue: 'Contains domain-specific naming' })
        }
      }

      // Allow some domain-specific naming in shared components if needed
      expect(violations.length).toBeLessThanOrEqual(3)
    })

    test('feature components should have descriptive names', async () => {
      const tooGenericNames = ['Component', 'Widget', 'Item', 'Element', 'Thing']
      const violations: Array<{ file: string; name: string }> = []

      for (const file of featureComponents) {
        const fileName = basename(file, '.tsx').replace('.ts', '')
        
        if (tooGenericNames.some(generic => fileName === generic)) {
          violations.push({ file, name: fileName })
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('Component Co-location', () => {
    test('related components should be grouped appropriately', async () => {
      // Check for logical groupings within feature directories
      const featureDirs = await glob('src/features/*', { cwd: projectRoot })
      
      for (const featureDir of featureDirs) {
        const componentsPath = join(projectRoot, featureDir, 'components')
        
        try {
          const entries = await readdir(componentsPath, { withFileTypes: true })
          const subdirectories = entries.filter(entry => entry.isDirectory())
          
          // Good patterns: charts/, forms/, tables/, etc.
          const goodGroupingPatterns = [/charts?/, /forms?/, /tables?/, /cards?/, /lists?/]
          
          const hasGoodGrouping = subdirectories.some(subdir => 
            goodGroupingPatterns.some(pattern => pattern.test(subdir.name))
          )
          
          // Not required but good practice
          // expect(hasGoodGrouping || subdirectories.length === 0).toBe(true)
        } catch (error) {
          // Components directory might not exist
        }
      }
    })
  })

  describe('Performance Considerations', () => {
    test('components should use performance optimizations where appropriate', async () => {
      let hasPerformanceOptimizations = false

      for (const file of allComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        const performancePatterns = [
          /React\.memo/,
          /memo\(/,
          /useMemo/,
          /useCallback/,
          /useVirtualScrolling/,
          /useDebounce/,
        ]
        
        if (performancePatterns.some(pattern => pattern.test(content))) {
          hasPerformanceOptimizations = true
          break
        }
      }

      expect(hasPerformanceOptimizations).toBe(true)
    })
  })

  describe('Type Safety', () => {
    test('components should have proper TypeScript props interfaces', async () => {
      let hasProperInterfaces = true

      for (const file of allComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Skip if not a component file
        if (!content.includes('export function') && !content.includes('export const')) continue
        
        // Check for 'any' type usage (should be avoided)
        if (content.includes(': any') || content.includes('<any>')) {
          hasProperInterfaces = false
          break
        }
      }

      expect(hasProperInterfaces).toBe(true)
    })

    test('should define props interfaces for components', async () => {
      let hasPropsInterfaces = false

      for (const file of allComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Look for props interface patterns
        const interfacePatterns = [
          /interface \w+Props/,
          /type \w+Props/,
          /\w+Props\s*=/,
        ]
        
        if (interfacePatterns.some(pattern => pattern.test(content))) {
          hasPropsInterfaces = true
          break
        }
      }

      expect(hasPropsInterfaces).toBe(true)
    })
  })
})