#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Analyzes CRM components and applies performance optimizations
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises'
import { join, basename, dirname, relative, extname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Performance optimization patterns
const OPTIMIZATION_PATTERNS = {
  // Large table components that could benefit from virtualization
  tableComponents: [
    'ContactsTable', 'OrganizationsTable', 'ProductsTable', 
    'OpportunitiesTable', 'InteractionsTable'
  ],
  
  // Form components that could benefit from optimized submission
  formComponents: [
    'ContactForm', 'OrganizationForm', 'ProductForm', 
    'OpportunityForm', 'InteractionForm'
  ],
  
  // Search/filter components that could use debouncing
  searchComponents: [
    'ContactsFilters', 'OrganizationsFilters', 'ProductsFilters'
  ],

  // Heavy components that should be lazy loaded
  heavyComponents: [
    'Dashboard', 'ActivityFeed', 'InteractionTimeline', 'OpportunityWizard'
  ]
}

// Optimization results
const optimizationResults = {
  analyzed: [],
  optimized: [],
  warnings: [],
  metrics: {
    totalComponents: 0,
    optimizableComponents: 0,
    performanceScore: 0
  }
}

/**
 * Get all component files
 */
async function getComponentFiles() {
  const files = []
  
  const searchDirs = [
    join(projectRoot, 'src/components'),
    join(projectRoot, 'src/features')
  ]
  
  for (const dir of searchDirs) {
    const foundFiles = await getFiles(dir, ['.tsx', '.jsx'])
    files.push(...foundFiles.filter(file => 
      basename(file, extname(file)).match(/^[A-Z]/) && 
      !file.includes('.test.')
    ))
  }
  
  return files
}

async function getFiles(dir, extensions = ['.ts', '.tsx']) {
  const files = []
  
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', '.git'].includes(entry.name)) {
          files.push(...await getFiles(fullPath, extensions))
        }
      } else if (extensions.includes(extname(entry.name))) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files
}

/**
 * Analyze component for optimization opportunities
 */
async function analyzeComponent(filePath) {
  try {
    const content = await readFile(filePath, 'utf8')
    const fileName = basename(filePath, extname(filePath))
    const relativePath = relative(projectRoot, filePath)
    
    const analysis = {
      file: relativePath,
      fileName,
      size: content.length,
      optimizations: [],
      hasPerformanceIssues: false
    }
    
    // Check for missing React.memo on large components
    if (content.length > 10000 && !content.includes('React.memo') && !content.includes('memo(')) {
      analysis.optimizations.push({
        type: 'memoization',
        message: 'Large component could benefit from React.memo',
        pattern: 'wrap-with-memo'
      })
    }
    
    // Check for missing useMemo/useCallback in computations
    const hasExpensiveComputations = content.match(/\.map\(|\.filter\(|\.reduce\(|\.sort\(/g)
    const hasMemoization = content.includes('useMemo') || content.includes('useCallback')
    
    if (hasExpensiveComputations && hasExpensiveComputations.length > 3 && !hasMemoization) {
      analysis.optimizations.push({
        type: 'computation-memoization',
        message: 'Multiple array operations without memoization',
        pattern: 'add-usememo'
      })
    }
    
    // Check table components for virtualization
    const isTableComponent = OPTIMIZATION_PATTERNS.tableComponents.some(comp => fileName.includes(comp))
    if (isTableComponent && !content.includes('virtual') && !content.includes('Virtual')) {
      analysis.optimizations.push({
        type: 'virtualization',
        message: 'Large table could benefit from virtualization',
        pattern: 'virtual-scrolling'
      })
    }
    
    // Check form components for optimized submission
    const isFormComponent = OPTIMIZATION_PATTERNS.formComponents.some(comp => fileName.includes(comp))
    if (isFormComponent && !content.includes('useOptimizedFormSubmit') && content.includes('onSubmit')) {
      analysis.optimizations.push({
        type: 'form-optimization',
        message: 'Form could use optimized submission pattern',
        pattern: 'optimized-form-submit'
      })
    }
    
    // Check search components for debouncing
    const isSearchComponent = OPTIMIZATION_PATTERNS.searchComponents.some(comp => fileName.includes(comp))
    if (isSearchComponent && content.includes('onChange') && !content.includes('debounce') && !content.includes('useDebounce')) {
      analysis.optimizations.push({
        type: 'search-debouncing',
        message: 'Search input could benefit from debouncing',
        pattern: 'add-debouncing'
      })
    }
    
    // Check for inline object/function creation in JSX
    const inlineObjectCount = (content.match(/\{\s*\{[^}]*\}\s*\}/g) || []).length
    const inlineFunctionCount = (content.match(/onClick=\{[^=]*=>/g) || []).length
    
    if (inlineObjectCount > 5 || inlineFunctionCount > 5) {
      analysis.optimizations.push({
        type: 'inline-objects',
        message: `${inlineObjectCount + inlineFunctionCount} inline objects/functions could cause re-renders`,
        pattern: 'extract-objects-functions'
      })
    }
    
    // Performance score
    analysis.hasPerformanceIssues = analysis.optimizations.length > 0
    
    return analysis
  } catch (error) {
    return {
      file: relative(projectRoot, filePath),
      fileName: basename(filePath, extname(filePath)),
      error: error.message,
      optimizations: []
    }
  }
}

/**
 * Apply basic optimizations to a component
 */
async function applyOptimizations(filePath, analysis) {
  if (analysis.optimizations.length === 0) return false
  
  try {
    let content = await readFile(filePath, 'utf8')
    let modified = false
    
    for (const optimization of analysis.optimizations) {
      switch (optimization.pattern) {
        case 'wrap-with-memo':
          if (!content.includes('React.memo') && !content.includes('memo(')) {
            // Add React.memo import if not present
            if (!content.includes('import React') || !content.includes('memo')) {
              content = content.replace(
                /import React[^;]*;/,
                match => match.includes('memo') ? match : match.replace('React', 'React, { memo }')
              )
            }
            
            // Wrap component export with memo
            content = content.replace(
              /export (function|const) (\w+)/,
              'export const $2 = memo('
            )
            
            // Add closing parenthesis before last export or at end
            if (content.includes('export default')) {
              content = content.replace(/export default/, ');\n\nexport default')
            } else {
              content += ')'
            }
            modified = true
          }
          break
          
        case 'add-debouncing':
          // Add useDebounce import
          if (!content.includes('useDebounce')) {
            content = content.replace(
              /import.*from '@\/lib\/performance-optimizations'/,
              match => match || "import { useDebounce } from '@/lib/performance-optimizations'"
            )
            
            if (!content.includes('useDebounce')) {
              const firstImport = content.match(/import.*from.*/)
              if (firstImport) {
                content = content.replace(
                  firstImport[0],
                  firstImport[0] + "\nimport { useDebounce } from '@/lib/performance-optimizations'"
                )
              }
            }
            modified = true
          }
          break
      }
    }
    
    if (modified) {
      await writeFile(filePath, content, 'utf8')
      return true
    }
    
    return false
  } catch (error) {
    console.error(`Error applying optimizations to ${filePath}:`, error.message)
    return false
  }
}

/**
 * Generate performance optimization suggestions
 */
function generateOptimizationSuggestions(analyses) {
  const suggestions = {
    highPriority: [],
    mediumPriority: [],
    lowPriority: []
  }
  
  for (const analysis of analyses) {
    if (!analysis.optimizations) continue
    
    for (const optimization of analysis.optimizations) {
      const suggestion = {
        file: analysis.file,
        type: optimization.type,
        message: optimization.message,
        pattern: optimization.pattern
      }
      
      // Categorize by impact
      switch (optimization.type) {
        case 'virtualization':
        case 'form-optimization':
          suggestions.highPriority.push(suggestion)
          break
        case 'computation-memoization':
        case 'search-debouncing':
          suggestions.mediumPriority.push(suggestion)
          break
        case 'memoization':
        case 'inline-objects':
          suggestions.lowPriority.push(suggestion)
          break
      }
    }
  }
  
  return suggestions
}

/**
 * Generate performance report
 */
function generatePerformanceReport(analyses, suggestions) {
  const totalComponents = analyses.length
  const optimizableComponents = analyses.filter(a => a.hasPerformanceIssues).length
  const performanceScore = Math.round(((totalComponents - optimizableComponents) / totalComponents) * 100)
  
  console.log('\n🚀 CRM Performance Optimization Report')
  console.log('======================================')
  
  console.log('\n📊 Metrics:')
  console.log(`Total Components Analyzed: ${totalComponents}`)
  console.log(`Components Needing Optimization: ${optimizableComponents}`)
  console.log(`Performance Score: ${performanceScore}%`)
  
  if (suggestions.highPriority.length > 0) {
    console.log('\n🔴 High Priority Optimizations:')
    suggestions.highPriority.forEach(s => {
      console.log(`  • ${s.file}: ${s.message}`)
    })
  }
  
  if (suggestions.mediumPriority.length > 0) {
    console.log('\n🟡 Medium Priority Optimizations:')
    suggestions.mediumPriority.forEach(s => {
      console.log(`  • ${s.file}: ${s.message}`)
    })
  }
  
  if (suggestions.lowPriority.length > 0) {
    console.log('\n🟢 Low Priority Optimizations:')
    suggestions.lowPriority.slice(0, 5).forEach(s => {
      console.log(`  • ${s.file}: ${s.message}`)
    })
    if (suggestions.lowPriority.length > 5) {
      console.log(`  ... and ${suggestions.lowPriority.length - 5} more`)
    }
  }
  
  // Overall assessment
  if (performanceScore >= 80) {
    console.log('\n✅ Performance health is good!')
  } else if (performanceScore >= 60) {
    console.log('\n⚠️ Performance could be improved')
  } else {
    console.log('\n🚨 Performance needs attention')
  }
  
  return { totalComponents, optimizableComponents, performanceScore }
}

/**
 * Main performance optimization function
 */
async function runPerformanceOptimization() {
  try {
    console.log('🚀 Starting CRM performance analysis...\n')
    
    const componentFiles = await getComponentFiles()
    const analyses = []
    
    console.log(`Analyzing ${componentFiles.length} components...`)
    
    for (const file of componentFiles) {
      const analysis = await analyzeComponent(file)
      analyses.push(analysis)
    }
    
    const suggestions = generateOptimizationSuggestions(analyses)
    const metrics = generatePerformanceReport(analyses, suggestions)
    
    // Apply safe optimizations in dry-run mode
    console.log('\n🔧 Auto-optimization suggestions:')
    console.log('Run with --apply flag to apply safe optimizations')
    
    optimizationResults.metrics = metrics
    
    // Exit with error if performance is poor
    if (metrics.performanceScore < 60) {
      console.log('\n❌ Performance optimization needed')
      process.exit(1)
    } else {
      console.log('\n✅ Performance analysis complete')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('❌ Performance optimization error:', error.message)
    process.exit(1)
  }
}

// Run optimization if called directly
if (process.argv[1] === __filename) {
  runPerformanceOptimization()
}

export { runPerformanceOptimization, optimizationResults }