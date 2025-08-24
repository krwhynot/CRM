/**
 * Architecture Integration Test
 * Comprehensive test that validates all architectural patterns working together
 */

import { describe, test, expect, beforeAll } from 'vitest'
import { runArchitectureAnalysis, formatAnalysisReport } from '../shared/architecture-test-utils'
import { join } from 'path'

const projectRoot = join(process.cwd())

describe('Architecture Integration', () => {
  let analysisResults: Awaited<ReturnType<typeof runArchitectureAnalysis>>

  beforeAll(async () => {
    analysisResults = await runArchitectureAnalysis(projectRoot)
  }, 30000) // 30 second timeout for comprehensive analysis

  test('should have acceptable architecture compliance score', () => {
    const totalFiles = analysisResults.summary.totalFiles
    const totalViolations = analysisResults.summary.totalViolations
    
    // Calculate compliance score (files without violations / total files)
    const filesWithViolations = new Set(analysisResults.violations.map(v => v.file)).size
    const complianceScore = ((totalFiles - filesWithViolations) / totalFiles) * 100
    
    console.log(`Architecture Compliance Score: ${complianceScore.toFixed(1)}%`)
    console.log(`Files analyzed: ${totalFiles}`)
    console.log(`Total violations: ${totalViolations}`)
    
    // Expect at least 70% compliance
    expect(complianceScore).toBeGreaterThanOrEqual(70)
  })

  test('should have no critical architecture violations', () => {
    const criticalViolations = analysisResults.violations.filter(v => 
      v.severity === 'error' && 
      (v.type === 'state-boundary' || v.type === 'component-placement')
    )
    
    if (criticalViolations.length > 0) {
      console.log('Critical violations found:')
      criticalViolations.forEach(v => {
        console.log(`- ${v.type}: ${v.message} (${v.file})`)
      })
    }
    
    expect(criticalViolations).toHaveLength(0)
  })

  test('should have proper state separation', () => {
    const stateBoundaryViolations = analysisResults.violations.filter(v => 
      v.type === 'state-boundary'
    )
    
    // Allow some minor violations but no major state boundary issues
    expect(stateBoundaryViolations.length).toBeLessThanOrEqual(2)
  })

  test('should have components in correct directories', () => {
    const placementViolations = analysisResults.violations.filter(v => 
      v.type === 'component-placement'
    )
    
    // Allow some flexibility during refactoring
    expect(placementViolations.length).toBeLessThanOrEqual(5)
  })

  test('should demonstrate performance optimizations', () => {
    const componentsWithOptimizations = analysisResults.componentAnalyses.filter(c => 
      c.hasPerformanceOptimizations || c.hasMemoization
    ).length
    
    const optimizationRatio = componentsWithOptimizations / analysisResults.componentAnalyses.length
    
    console.log(`Performance optimization ratio: ${(optimizationRatio * 100).toFixed(1)}%`)
    
    // At least 20% of components should have some performance optimizations
    expect(optimizationRatio).toBeGreaterThanOrEqual(0.2)
  })

  test('should have proper TypeScript usage', () => {
    const componentsWithPropsInterfaces = analysisResults.componentAnalyses.filter(c => 
      c.hasPropsInterface
    ).length
    
    const typeScriptCompliance = componentsWithPropsInterfaces / analysisResults.componentAnalyses.length
    
    console.log(`TypeScript props interface compliance: ${(typeScriptCompliance * 100).toFixed(1)}%`)
    
    // At least 60% of components should have proper props interfaces
    expect(typeScriptCompliance).toBeGreaterThanOrEqual(0.6)
  })

  test('should maintain reasonable complexity', () => {
    // Check for overly complex components
    const complexComponents = analysisResults.componentAnalyses.filter(c => 
      c.lineCount > 300 && !c.hasMemoization
    )
    
    console.log(`Complex unmemoized components: ${complexComponents.length}`)
    
    // Allow some complex components but they should be optimized
    expect(complexComponents.length).toBeLessThanOrEqual(3)
  })

  test('should have comprehensive analysis report', () => {
    const report = formatAnalysisReport(analysisResults)
    
    expect(report).toContain('Architecture Analysis Report')
    expect(report).toContain('Summary')
    expect(report.length).toBeGreaterThan(100)
    
    // Log the report for debugging
    if (analysisResults.summary.totalViolations > 0) {
      console.log('\n' + report)
    }
  })

  test('architecture should support scalability', () => {
    // Check for good architectural patterns
    const hasFeatureBasedOrganization = analysisResults.componentAnalyses.some(c => 
      c.file.includes('/features/')
    )
    
    const hasStateSeparation = 
      analysisResults.stateAnalyses.some(s => s.type === 'zustand-store') &&
      analysisResults.stateAnalyses.some(s => s.type === 'tanstack-hook')
    
    const hasProperImports = analysisResults.componentAnalyses.some(c =>
      c.imports.some(imp => imp.includes('@/components/') || imp.includes('@/lib/'))
    )
    
    expect(hasFeatureBasedOrganization).toBe(true)
    expect(hasStateSeparation).toBe(true) 
    expect(hasProperImports).toBe(true)
  })

  test('should demonstrate quality patterns', () => {
    // Check for quality indicators
    const qualityMetrics = {
      componentModularization: analysisResults.componentAnalyses.length > 10,
      stateManagement: analysisResults.stateAnalyses.length > 5,
      performanceOptimizations: analysisResults.componentAnalyses.some(c => c.hasPerformanceOptimizations),
      typeScriptUsage: analysisResults.componentAnalyses.every(c => c.hasTypeScript),
      properSeparation: analysisResults.violations.filter(v => v.severity === 'error').length === 0
    }
    
    const qualityScore = Object.values(qualityMetrics).filter(Boolean).length / Object.keys(qualityMetrics).length
    
    console.log(`Quality metrics:`, qualityMetrics)
    console.log(`Overall quality score: ${(qualityScore * 100).toFixed(1)}%`)
    
    // Expect at least 60% quality score
    expect(qualityScore).toBeGreaterThanOrEqual(0.6)
  })
})