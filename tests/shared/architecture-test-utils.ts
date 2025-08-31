/**
 * Architecture Test Utilities
 * Shared utilities for architecture compliance testing
 */

import { readFile } from 'fs/promises'
import { join, extname, basename } from 'path'
import { glob } from 'glob'

export interface ComponentAnalysis {
  file: string
  name: string
  size: number
  lineCount: number
  hasTypeScript: boolean
  hasPropsInterface: boolean
  hasMemoization: boolean
  hasPerformanceOptimizations: boolean
  imports: string[]
  exports: string[]
  violations: ArchitectureViolation[]
}

export interface ArchitectureViolation {
  type: 'component-placement' | 'state-boundary' | 'import-pattern' | 'performance' | 'type-safety'
  severity: 'error' | 'warning' | 'info'
  message: string
  file: string
  line?: number
}

export interface StateAnalysis {
  file: string
  type: 'zustand-store' | 'tanstack-hook' | 'component-state'
  hasServerData: boolean
  hasClientData: boolean
  hasAPIOperations: boolean
  violations: ArchitectureViolation[]
}

/**
 * Get all TypeScript/TSX files in a directory
 */
export async function getTypeScriptFiles(
  directory: string, 
  options: { 
    recursive?: boolean
    excludeTests?: boolean
    excludeNodeModules?: boolean 
  } = {}
): Promise<string[]> {
  const { recursive = true, excludeTests = true, excludeNodeModules = true } = options
  
  const pattern = recursive ? '**/*.{ts,tsx}' : '*.{ts,tsx}'
  const ignore: string[] = []
  
  if (excludeTests) {
    ignore.push('**/*.test.*', '**/*.spec.*')
  }
  
  if (excludeNodeModules) {
    ignore.push('**/node_modules/**', '**/dist/**')
  }
  
  return await glob(pattern, {
    cwd: directory,
    ignore,
    absolute: true
  })
}

/**
 * Analyze a component file for architecture compliance
 */
export async function analyzeComponent(filePath: string): Promise<ComponentAnalysis> {
  const content = await readFile(filePath, 'utf8')
  const fileName = basename(filePath, extname(filePath))
  const lines = content.split('\n')
  
  const analysis: ComponentAnalysis = {
    file: filePath,
    name: fileName,
    size: content.length,
    lineCount: lines.length,
    hasTypeScript: extname(filePath) === '.ts' || extname(filePath) === '.tsx',
    hasPropsInterface: false,
    hasMemoization: false,
    hasPerformanceOptimizations: false,
    imports: [],
    exports: [],
    violations: []
  }
  
  // Extract imports
  const importMatches = content.match(/^import\s+.*from\s+['"][^'"]*['"]/gm)
  if (importMatches) {
    analysis.imports = importMatches.map(imp => imp.trim())
  }
  
  // Extract exports
  const exportMatches = content.match(/^export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+\w+/gm)
  if (exportMatches) {
    analysis.exports = exportMatches.map(exp => exp.trim())
  }
  
  // Check for props interface
  analysis.hasPropsInterface = /interface\s+\w*Props|type\s+\w*Props/.test(content)
  
  // Check for memoization
  analysis.hasMemoization = /React\.memo|memo\(|useMemo|useCallback/.test(content)
  
  // Check for performance optimizations
  const performancePatterns = [
    'useVirtualScrolling',
    'useDebounce',
    'useOptimizedFormSubmit',
    'useCachedSearch',
    'usePerformanceMonitoring'
  ]
  analysis.hasPerformanceOptimizations = performancePatterns.some(pattern => 
    content.includes(pattern)
  )
  
  return analysis
}

/**
 * Analyze a state file (store or hook) for compliance
 */
export async function analyzeStateFile(filePath: string): Promise<StateAnalysis> {
  const content = await readFile(filePath, 'utf8')
  
  const analysis: StateAnalysis = {
    file: filePath,
    type: determineStateType(filePath, content),
    hasServerData: false,
    hasClientData: false,
    hasAPIOperations: false,
    violations: []
  }
  
  // Check for server data patterns
  const serverDataPatterns = [
    /\bid\s*:\s*string/,
    /created_at/,
    /updated_at/,
    /deleted_at/,
    /user_id/,
    /organization_id/
  ]
  analysis.hasServerData = serverDataPatterns.some(pattern => pattern.test(content))
  
  // Check for client data patterns  
  const clientDataPatterns = [
    /viewMode/,
    /isOpen/,
    /selected/,
    /filter/,
    /preference/
  ]
  analysis.hasClientData = clientDataPatterns.some(pattern => pattern.test(content))
  
  // Check for API operations
  const apiPatterns = [
    /supabase\./,
    /\.from\(/,
    /\.select\(/,
    /fetch\(/,
    /axios\./
  ]
  analysis.hasAPIOperations = apiPatterns.some(pattern => pattern.test(content))
  
  return analysis
}

/**
 * Determine the type of state file
 */
function determineStateType(filePath: string, content: string): StateAnalysis['type'] {
  if (filePath.includes('/stores/') || content.includes('create(')) {
    return 'zustand-store'
  }
  
  if (filePath.includes('/hooks/') || content.includes('useQuery') || content.includes('useMutation')) {
    return 'tanstack-hook'
  }
  
  return 'component-state'
}

/**
 * Validate component placement according to feature-based architecture
 */
export function validateComponentPlacement(analysis: ComponentAnalysis): ArchitectureViolation[] {
  const violations: ArchitectureViolation[] = []
  const filePath = analysis.file
  
  // Feature-specific components should be in feature directories
  const featurePatterns = [
    { pattern: /Contact(?!s\b)/, feature: 'contacts' },
    { pattern: /Organization(?!s\b)/, feature: 'organizations' },
    { pattern: /Product(?!s\b)/, feature: 'products' },
    { pattern: /Opportunity/, feature: 'opportunities' },
    { pattern: /Interaction/, feature: 'interactions' },
    { pattern: /Dashboard/, feature: 'dashboard' }
  ]
  
  for (const { pattern, feature } of featurePatterns) {
    if (pattern.test(analysis.name)) {
      const isInCorrectFeature = filePath.includes(`features/${feature}/`)
      const isInSharedComponents = filePath.includes('src/components/')
      
      if (isInSharedComponents && !isInCorrectFeature) {
        violations.push({
          type: 'component-placement',
          severity: 'error',
          message: `Feature-specific component "${analysis.name}" should be in /src/features/${feature}/components/`,
          file: filePath
        })
      }
    }
  }
  
  return violations
}

/**
 * Validate state boundary compliance
 */
export function validateStateBoundaries(analysis: StateAnalysis): ArchitectureViolation[] {
  const violations: ArchitectureViolation[] = []
  
  if (analysis.type === 'zustand-store') {
    if (analysis.hasServerData) {
      violations.push({
        type: 'state-boundary',
        severity: 'error',
        message: 'Zustand store contains server data fields. Use TanStack Query for server state.',
        file: analysis.file
      })
    }
    
    if (analysis.hasAPIOperations) {
      violations.push({
        type: 'state-boundary',
        severity: 'error',
        message: 'Zustand store contains API operations. Use TanStack Query hooks for server operations.',
        file: analysis.file
      })
    }
  }
  
  if (analysis.type === 'tanstack-hook' && analysis.hasClientData && !analysis.hasServerData) {
    violations.push({
      type: 'state-boundary',
      severity: 'warning',
      message: 'TanStack Query hook appears to manage client-only state. Consider using Zustand.',
      file: analysis.file
    })
  }
  
  return violations
}

/**
 * Validate import patterns
 */
export function validateImportPatterns(analysis: ComponentAnalysis): ArchitectureViolation[] {
  const violations: ArchitectureViolation[] = []
  
  for (const importStatement of analysis.imports) {
    // Check for direct feature component imports (should use feature index)
    const directFeatureImport = importStatement.match(/@\/features\/([^\/]+)\/components\/([^'"]*)/g)
    if (directFeatureImport) {
      violations.push({
        type: 'import-pattern',
        severity: 'warning',
        message: 'Direct feature component import detected. Consider importing from feature index.',
        file: analysis.file
      })
    }
    
    // Check for shared components importing from features
    if (analysis.file.includes('src/components/') && importStatement.includes('@/features/')) {
      violations.push({
        type: 'import-pattern',
        severity: 'error',
        message: 'Shared component importing from feature directory violates architecture boundaries.',
        file: analysis.file
      })
    }
  }
  
  return violations
}

/**
 * Validate performance patterns
 */
export function validatePerformancePatterns(analysis: ComponentAnalysis): ArchitectureViolation[] {
  const violations: ArchitectureViolation[] = []
  
  // Large components should use memoization
  if (analysis.size > 10000 && !analysis.hasMemoization) {
    violations.push({
      type: 'performance',
      severity: 'warning', 
      message: 'Large component should consider using React.memo or useMemo for optimization.',
      file: analysis.file
    })
  }
  
  return violations
}

/**
 * Run comprehensive architecture analysis
 */
export async function runArchitectureAnalysis(rootPath: string) {
  const results = {
    componentAnalyses: [] as ComponentAnalysis[],
    stateAnalyses: [] as StateAnalysis[],
    violations: [] as ArchitectureViolation[],
    summary: {
      totalFiles: 0,
      totalViolations: 0,
      violationsByType: {} as Record<string, number>,
      violationsBySeverity: {} as Record<string, number>
    }
  }
  
  // Analyze components
  const componentFiles = await getTypeScriptFiles(join(rootPath, 'src'), {
    recursive: true,
    excludeTests: true
  })
  
  for (const file of componentFiles) {
    if (file.includes('/components/') || file.includes('/features/')) {
      const analysis = await analyzeComponent(file)
      results.componentAnalyses.push(analysis)
      
      // Validate component
      const placementViolations = validateComponentPlacement(analysis)
      const importViolations = validateImportPatterns(analysis)
      const performanceViolations = validatePerformancePatterns(analysis)
      
      results.violations.push(...placementViolations, ...importViolations, ...performanceViolations)
    }
  }
  
  // Analyze state files
  const stateFiles = [
    ...await getTypeScriptFiles(join(rootPath, 'src/stores')),
    ...await getTypeScriptFiles(join(rootPath, 'src/features/**/hooks'))
  ]
  
  for (const file of stateFiles) {
    const analysis = await analyzeStateFile(file)
    results.stateAnalyses.push(analysis)
    
    // Validate state boundaries
    const boundaryViolations = validateStateBoundaries(analysis)
    results.violations.push(...boundaryViolations)
  }
  
  // Calculate summary
  results.summary.totalFiles = results.componentAnalyses.length + results.stateAnalyses.length
  results.summary.totalViolations = results.violations.length
  
  // Group violations by type and severity
  for (const violation of results.violations) {
    results.summary.violationsByType[violation.type] = (results.summary.violationsByType[violation.type] || 0) + 1
    results.summary.violationsBySeverity[violation.severity] = (results.summary.violationsBySeverity[violation.severity] || 0) + 1
  }
  
  return results
}

/**
 * Format architecture analysis report
 */
export function formatAnalysisReport(analysis: Awaited<ReturnType<typeof runArchitectureAnalysis>>): string {
  let report = '# Architecture Analysis Report\n\n'
  
  report += `## Summary\n`
  report += `- **Total Files Analyzed**: ${analysis.summary.totalFiles}\n`
  report += `- **Total Violations**: ${analysis.summary.totalViolations}\n\n`
  
  if (analysis.summary.totalViolations > 0) {
    report += `### Violations by Type\n`
    for (const [type, count] of Object.entries(analysis.summary.violationsByType)) {
      report += `- **${type}**: ${count}\n`
    }
    report += '\n'
    
    report += `### Violations by Severity\n`
    for (const [severity, count] of Object.entries(analysis.summary.violationsBySeverity)) {
      report += `- **${severity}**: ${count}\n`
    }
    report += '\n'
    
    report += `## Detailed Violations\n\n`
    
    const violationsByType = analysis.violations.reduce((acc, violation) => {
      if (!acc[violation.type]) acc[violation.type] = []
      acc[violation.type].push(violation)
      return acc
    }, {} as Record<string, ArchitectureViolation[]>)
    
    for (const [type, violations] of Object.entries(violationsByType)) {
      report += `### ${type}\n\n`
      
      violations.forEach((violation, index) => {
        report += `${index + 1}. **${violation.severity.toUpperCase()}**: ${violation.message}\n`
        report += `   File: \`${violation.file}\`\n\n`
      })
    }
  } else {
    report += '✅ **No architecture violations found!**\n\n'
  }
  
  return report
}

/**
 * Helper to check if a file contains specific patterns
 */
export function containsPatterns(content: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some(pattern => {
    if (typeof pattern === 'string') {
      return content.includes(pattern)
    }
    return pattern.test(content)
  })
}