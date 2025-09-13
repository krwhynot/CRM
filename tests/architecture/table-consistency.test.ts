import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { glob } from 'glob'
import path from 'path'

/**
 * Table Component Consistency Test Suite
 * 
 * Validates that all table components in the application
 * follow standardized patterns and conventions.
 */

describe('Table Component Consistency', () => {
  let tableFiles: string[] = []
  
  beforeAll(() => {
    // Find all table component files
    const patterns = [
      'src/features/**/components/*Table*.tsx',
      'src/features/**/components/*table*.tsx',
      'src/components/tables/*.tsx'
    ]
    
    const excludePatterns = [
      '**/node_modules/**',
      '**/*.test.tsx',
      '**/*.spec.tsx',
      '**/*.stories.tsx',
      '**/EntityTableTemplate.tsx'
    ]
    
    patterns.forEach(pattern => {
      const files = glob.sync(pattern, { ignore: excludePatterns })
      tableFiles.push(...files)
    })
  })
  
  describe('DataTable Component Usage', () => {
    it('all table components should use DataTable', () => {
      const violations: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        // Check for DataTable import
        const hasDataTableImport = content.includes("from '@/components/ui/DataTable'") ||
                                  content.includes('from "@/components/ui/DataTable"')
        
        // Check for DataTable usage
        const hasDataTableUsage = content.includes('<DataTable')
        
        if (!hasDataTableImport || !hasDataTableUsage) {
          violations.push(path.relative(process.cwd(), file))
        }
      })
      
      expect(violations, `Files not using DataTable: ${violations.join(', ')}`).toHaveLength(0)
    })
  })
  
  describe('Card Wrapper Pattern', () => {
    it('all tables should be wrapped in Card/CardContent', () => {
      const violations: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        if (content.includes('<DataTable')) {
          const hasCard = content.includes('<Card') && content.includes('</Card>')
          const hasCardContent = content.includes('<CardContent') && content.includes('</CardContent>')
          
          if (!hasCard || !hasCardContent) {
            violations.push(path.relative(process.cwd(), file))
          }
        }
      })
      
      expect(violations, `Tables without Card wrapper: ${violations.join(', ')}`).toHaveLength(0)
    })
  })
  
  describe('BulkActionsProvider Integration', () => {
    it('all tables should use BulkActionsProvider', () => {
      const violations: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        const hasBulkActionsImport = content.includes('BulkActionsProvider')
        const hasBulkActionsUsage = content.includes('<BulkActionsProvider')
        
        if (!hasBulkActionsImport || !hasBulkActionsUsage) {
          violations.push(path.relative(process.cwd(), file))
        }
      })
      
      expect(violations, `Tables without BulkActionsProvider: ${violations.join(', ')}`).toHaveLength(0)
    })
  })
  
  describe('Semantic Token Usage', () => {
    it('tables should use semantic spacing tokens', () => {
      const violations: string[] = []
      const hardcodedPattern = /className=["'][^"']*?(p-\d|m-\d|px-\d|py-\d|mx-\d|my-\d|space-[xy]-\d|gap-\d)[^"']*?["']/
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        if (hardcodedPattern.test(content)) {
          violations.push(path.relative(process.cwd(), file))
        }
      })
      
      expect(violations, `Tables with hardcoded spacing: ${violations.join(', ')}`).toHaveLength(0)
    })
    
    it('tables should import semantic tokens', () => {
      const violations: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        const hasSemanticImport = content.includes("from '@/styles/tokens'") ||
                                  content.includes('from "@/styles/tokens"') ||
                                  content.includes('semanticSpacing') ||
                                  content.includes('semanticTypography')
        
        if (!hasSemanticImport) {
          violations.push(path.relative(process.cwd(), file))
        }
      })
      
      expect(violations, `Tables without semantic tokens: ${violations.join(', ')}`).toHaveLength(0)
    })
  })
  
  describe('Hook Pattern Consistency', () => {
    it('tables should use standardized data hooks', () => {
      const violations: string[] = []
      const hookPattern = /use\w+TableData|useEntityTable/
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        if (!hookPattern.test(content)) {
          violations.push(path.relative(process.cwd(), file))
        }
      })
      
      expect(violations, `Tables without standard data hooks: ${violations.join(', ')}`).toHaveLength(0)
    })
    
    it('hook names should follow naming convention', () => {
      const violations: string[] = []
      const correctPattern = /use[A-Z]\w+TableData/
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        const hooks = content.match(/use\w+Table\w+/g) || []
        
        hooks.forEach(hook => {
          if (hook.includes('TableData') && !correctPattern.test(hook)) {
            violations.push(`${path.relative(process.cwd(), file)}: ${hook}`)
          }
        })
      })
      
      expect(violations, `Incorrectly named hooks: ${violations.join(', ')}`).toHaveLength(0)
    })
  })
  
  describe('Empty State Configuration', () => {
    it('tables should define empty states', () => {
      const violations: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        if (content.includes('<DataTable')) {
          const hasEmptyState = content.includes('emptyState') || 
                               content.includes('empty=') ||
                               content.includes('emptyMessage')
          
          if (!hasEmptyState) {
            violations.push(path.relative(process.cwd(), file))
          }
        }
      })
      
      expect(violations, `Tables without empty states: ${violations.join(', ')}`).toHaveLength(0)
    })
  })
  
  describe('Virtualization Configuration', () => {
    it('tables should consider virtualization for performance', () => {
      const warnings: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        if (content.includes('<DataTable')) {
          const hasVirtualization = content.includes('virtualization')
          
          if (!hasVirtualization) {
            warnings.push(path.relative(process.cwd(), file))
          }
        }
      })
      
      // This is a warning, not a failure
      if (warnings.length > 0) {
        console.warn(`Tables without virtualization config: ${warnings.join(', ')}`)
      }
    })
  })
  
  describe('Expandable Content Pattern', () => {
    it('expandable tables should have proper configuration', () => {
      const violations: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        if (content.includes('expandableContent') || content.includes('ExpandedContent')) {
          const hasExpandedRows = content.includes('expandedRows')
          const hasToggleRow = content.includes('onToggleRow') || content.includes('toggleRowExpansion')
          
          if (!hasExpandedRows || !hasToggleRow) {
            violations.push(path.relative(process.cwd(), file))
          }
        }
      })
      
      expect(violations, `Incomplete expandable configuration: ${violations.join(', ')}`).toHaveLength(0)
    })
  })
  
  describe('Type Safety', () => {
    it('tables should have proper TypeScript types', () => {
      const violations: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        // Check for any usage
        const hasAnyType = content.match(/:\s*any\b/g)
        
        if (hasAnyType) {
          violations.push(`${path.relative(process.cwd(), file)}: ${hasAnyType.length} 'any' types found`)
        }
      })
      
      expect(violations, `Tables with 'any' types: ${violations.join(', ')}`).toHaveLength(0)
    })
    
    it('tables should define proper interfaces', () => {
      const violations: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        // Check for interface or type definitions
        const hasInterface = content.includes('interface') || content.includes('type')
        const hasProps = content.includes('Props')
        
        if (!hasInterface || !hasProps) {
          violations.push(path.relative(process.cwd(), file))
        }
      })
      
      expect(violations, `Tables without proper type definitions: ${violations.join(', ')}`).toHaveLength(0)
    })
  })
  
  describe('Performance Patterns', () => {
    it('tables should use memoization where appropriate', () => {
      const warnings: string[] = []
      
      tableFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')
        
        // Check for heavy computations without memoization
        if (content.includes('.filter(') || content.includes('.sort(')) {
          const hasMemo = content.includes('useMemo') || content.includes('useCallback')
          
          if (!hasMemo) {
            warnings.push(path.relative(process.cwd(), file))
          }
        }
      })
      
      if (warnings.length > 0) {
        console.warn(`Tables without memoization: ${warnings.join(', ')}`)
      }
    })
  })
})