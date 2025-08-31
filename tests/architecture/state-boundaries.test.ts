/**
 * State Boundaries Architecture Tests
 * Validates proper separation between server state (TanStack Query) and client state (Zustand)
 */

import { describe, test, expect, beforeAll } from 'vitest'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

// Simple glob implementation for tests
async function getFiles(pattern: string, options: { cwd: string }): Promise<string[]> {
  const files: string[] = []
  
  async function walkDir(dir: string, relativeDir = '') {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        const relativePath = join(relativeDir, entry.name)
        
        if (entry.isDirectory()) {
          if (!['node_modules', 'dist', '.git'].includes(entry.name)) {
            await walkDir(fullPath, relativePath)
          }
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          files.push(relativePath)
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }
  
  if (pattern.includes('stores/**/*')) {
    await walkDir(join(options.cwd, 'src/stores'), 'src/stores')
  } else if (pattern.includes('features/**/hooks/**/*')) {
    const featuresDir = join(options.cwd, 'src/features')
    try {
      const features = await readdir(featuresDir, { withFileTypes: true })
      for (const feature of features) {
        if (feature.isDirectory()) {
          await walkDir(join(featuresDir, feature.name, 'hooks'), `src/features/${feature.name}/hooks`)
        }
      }
    } catch (error) {
      // Features directory might not exist
    }
  } else if (pattern.includes('features/**/components/**/*')) {
    const featuresDir = join(options.cwd, 'src/features')
    try {
      const features = await readdir(featuresDir, { withFileTypes: true })
      for (const feature of features) {
        if (feature.isDirectory()) {
          await walkDir(join(featuresDir, feature.name, 'components'), `src/features/${feature.name}/components`)
        }
      }
    } catch (error) {
      // Features directory might not exist
    }
  }
  
  return files
}

const projectRoot = join(process.cwd())

describe('State Management Boundaries', () => {
  let storeFiles: string[] = []
  let hookFiles: string[] = []

  beforeAll(async () => {
    // Get all store files
    storeFiles = await getFiles('src/stores/**/*', { cwd: projectRoot })
    
    // Get all hook files in features
    hookFiles = await getFiles('src/features/**/hooks/**/*', { cwd: projectRoot })
  })

  describe('Zustand Stores - Client State Only', () => {
    test('should not contain server data fields', async () => {
      const serverDataFields = [
        'id', 'created_at', 'updated_at', 'deleted_at',
        'user_id', 'organization_id', 'contact_id'
      ]
      
      const violations: Array<{ file: string; field: string }> = []

      for (const file of storeFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        for (const field of serverDataFields) {
          // Check for server data field patterns
          const patterns = [
            new RegExp(`${field}\\s*:\\s*string`, 'g'),
            new RegExp(`${field}\\s*:\\s*Date`, 'g'),
            new RegExp(`\\b${field}\\b.*UUID`, 'g'),
          ]
          
          if (patterns.some(pattern => pattern.test(content))) {
            violations.push({ file, field })
          }
        }
      }

      expect(violations).toEqual([])
    })

    test('should not contain API calls', async () => {
      const apiPatterns = [
        /supabase\./g,
        /\.from\(/g,
        /\.select\(/g,
        /\.insert\(/g,
        /\.update\(/g,
        /\.delete\(/g,
        /fetch\(/g,
        /axios\./g,
      ]

      const violations: Array<{ file: string; pattern: string }> = []

      for (const file of storeFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        for (const pattern of apiPatterns) {
          if (pattern.test(content)) {
            violations.push({ file, pattern: pattern.source })
          }
        }
      }

      expect(violations).toEqual([])
    })

    test('should follow client state naming patterns', async () => {
      const expectedPatterns = [
        /viewMode/,
        /isOpen/,
        /selected/,
        /filter/,
        /preference/,
        /UI/,
      ]

      let hasClientStatePatterns = false

      for (const file of storeFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (expectedPatterns.some(pattern => pattern.test(content))) {
          hasClientStatePatterns = true
          break
        }
      }

      expect(hasClientStatePatterns).toBe(true)
    })
  })

  describe('TanStack Query Hooks - Server State Only', () => {
    test('should contain proper query patterns', async () => {
      const expectedPatterns = [
        /useQuery/,
        /useMutation/,
        /queryKey/,
        /queryFn/,
      ]

      let hasQueryPatterns = false

      for (const file of hookFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (expectedPatterns.some(pattern => pattern.test(content))) {
          hasQueryPatterns = true
          break
        }
      }

      expect(hasQueryPatterns).toBe(true)
    })

    test('should not contain Zustand create calls', async () => {
      const violations: string[] = []

      for (const file of hookFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (content.includes('create(') && content.includes('zustand')) {
          violations.push(file)
        }
      }

      expect(violations).toEqual([])
    })

    test('should contain server operations', async () => {
      const serverOperationPatterns = [
        /supabase/,
        /\.from\(/,
        /\.select\(/,
        /fetch/,
        /api\//,
      ]

      let hasServerOperations = false

      for (const file of hookFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (serverOperationPatterns.some(pattern => pattern.test(content))) {
          hasServerOperations = true
          break
        }
      }

      expect(hasServerOperations).toBe(true)
    })
  })

  describe('State Import Patterns', () => {
    test('components should import server state from hooks', async () => {
      const componentFiles = await getFiles('src/features/**/components/**/*', { cwd: projectRoot })
      
      let hasProperServerStateImports = false

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for hooks imports
        if (content.includes("from '../hooks/") || content.includes("from '@/features/")) {
          hasProperServerStateImports = true
          break
        }
      }

      expect(hasProperServerStateImports).toBe(true)
    })

    test('components should import client state from stores', async () => {
      const componentFiles = await getFiles('src/features/**/components/**/*', { cwd: projectRoot })
      
      let hasProperClientStateImports = false

      for (const file of componentFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for store imports
        if (content.includes("from '@/stores/")) {
          hasProperClientStateImports = true
          break
        }
      }

      expect(hasProperClientStateImports).toBe(true)
    })
  })

  describe('Performance Optimizations', () => {
    test('query hooks should use optimized patterns', async () => {
      const optimizationPatterns = [
        /staleTime/,
        /cacheTime/,
        /gcTime/, // TanStack Query v5+
        /queryClient\.prefetchQuery/,
        /invalidateQueries/,
      ]

      let hasOptimizations = false

      for (const file of hookFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (optimizationPatterns.some(pattern => pattern.test(content))) {
          hasOptimizations = true
          break
        }
      }

      expect(hasOptimizations).toBe(true)
    })

    test('stores should use shallow comparison where appropriate', async () => {
      let hasShallowComparison = false

      for (const file of storeFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (content.includes('shallow') || content.includes('subscribeWithSelector')) {
          hasShallowComparison = true
          break
        }
      }

      // This is optional but recommended for performance
      expect(hasShallowComparison || storeFiles.length === 0).toBe(true)
    })
  })

  describe('Error Handling', () => {
    test('query hooks should handle errors appropriately', async () => {
      const errorHandlingPatterns = [
        /error/,
        /isError/,
        /onError/,
        /catch/,
      ]

      let hasErrorHandling = false

      for (const file of hookFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        if (errorHandlingPatterns.some(pattern => pattern.test(content))) {
          hasErrorHandling = true
          break
        }
      }

      expect(hasErrorHandling).toBe(true)
    })
  })

  describe('Type Safety', () => {
    test('stores should have proper TypeScript interfaces', async () => {
      let hasProperTypes = true

      for (const file of storeFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for 'any' type usage (should be avoided)
        if (content.includes(': any') || content.includes('<any>')) {
          hasProperTypes = false
          break
        }
      }

      expect(hasProperTypes).toBe(true)
    })

    test('hooks should have proper generic types', async () => {
      let hasProperGenerics = false

      for (const file of hookFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')
        
        // Check for generic type usage in queries
        if (content.includes('useQuery<') || content.includes('useMutation<')) {
          hasProperGenerics = true
          break
        }
      }

      expect(hasProperGenerics).toBe(true)
    })
  })
})