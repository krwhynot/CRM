#!/usr/bin/env node

/**
 * Simplified Token Analysis Script
 *
 * Provides quick audit of design token usage across the codebase.
 * Identifies actual token usage vs. defined tokens for optimization decisions.
 *
 * Usage: node scripts/simplified-token-analysis.js
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  rootDir: path.resolve(__dirname, '..'),
  srcDir: path.resolve(__dirname, '../src'),
  cssTokenFiles: [
    'src/styles/tokens/primitives.css',
    'src/styles/tokens/semantic.css',
    'src/styles/tokens/components.css',
    'src/styles/tokens/features.css'
  ],
  designTokenUtilsFile: 'src/lib/design-token-utils.ts',
  excludePatterns: [
    'node_modules',
    '.git',
    'build',
    'dist',
    'coverage'
  ]
}

class TokenAnalyzer {
  constructor() {
    this.results = {
      cssUsage: new Map(),
      tsImports: new Map(),
      cssDefinitions: new Map(),
      tsExports: new Map(),
      summary: {}
    }
  }

  /**
   * Main analysis entry point
   */
  async analyze() {
    console.log('🔍 Design Token Usage Analysis')
    console.log('================================\n')

    try {
      // Analyze CSS variable usage in components
      await this.analyzeCSSUsage()

      // Analyze TypeScript imports
      await this.analyzeTypeScriptImports()

      // Analyze CSS token definitions
      await this.analyzeCSSDefinitions()

      // Analyze TypeScript exports
      await this.analyzeTypeScriptExports()

      // Generate summary
      this.generateSummary()

      // Output results
      this.outputResults()

    } catch (error) {
      console.error('❌ Analysis failed:', error.message)
      process.exit(1)
    }
  }

  /**
   * Find all CSS variable usage (var(--*)) in components
   */
  async analyzeCSSUsage() {
    console.log('📊 Analyzing CSS variable usage...')

    try {
      // Search for var(--*) patterns in TypeScript/TSX files
      const output = execSync(
        `find "${CONFIG.srcDir}" -type f \\( -name "*.tsx" -o -name "*.ts" \\) -exec grep -Hn "var(--[^)]*)" {} \\;`,
        { encoding: 'utf8', cwd: CONFIG.rootDir }
      )

      const lines = output.trim().split('\n').filter(line => line.length > 0)

      lines.forEach(line => {
        const [filePath, lineNumber, content] = line.split(':', 3)
        const relativePath = path.relative(CONFIG.rootDir, filePath)

        // Extract var(--*) patterns
        const varMatches = content.match(/var\(--[^)]+\)/g) || []

        if (!this.results.cssUsage.has(relativePath)) {
          this.results.cssUsage.set(relativePath, [])
        }

        varMatches.forEach(varUsage => {
          this.results.cssUsage.get(relativePath).push({
            line: parseInt(lineNumber),
            variable: varUsage,
            context: content.trim()
          })
        })
      })

      console.log(`   Found CSS variables in ${this.results.cssUsage.size} files`)

    } catch (error) {
      if (error.status === 1) {
        // No matches found - this is expected if no usage
        console.log('   No CSS variable usage found')
      } else {
        throw error
      }
    }
  }

  /**
   * Find all imports from design-token modules
   */
  async analyzeTypeScriptImports() {
    console.log('📦 Analyzing TypeScript imports...')

    try {
      const output = execSync(
        `find "${CONFIG.srcDir}" -type f \\( -name "*.tsx" -o -name "*.ts" \\) -exec grep -Hn "from.*design-token" {} \\;`,
        { encoding: 'utf8', cwd: CONFIG.rootDir }
      )

      const lines = output.trim().split('\n').filter(line => line.length > 0)

      lines.forEach(line => {
        const [filePath, lineNumber, content] = line.split(':', 3)
        const relativePath = path.relative(CONFIG.rootDir, filePath)

        this.results.tsImports.set(relativePath, {
          line: parseInt(lineNumber),
          import: content.trim()
        })
      })

      console.log(`   Found imports in ${this.results.tsImports.size} files`)

    } catch (error) {
      if (error.status === 1) {
        console.log('   No design-token imports found')
      } else {
        throw error
      }
    }
  }

  /**
   * Count CSS variable definitions in token files
   */
  async analyzeCSSDefinitions() {
    console.log('🎨 Analyzing CSS token definitions...')

    for (const cssFile of CONFIG.cssTokenFiles) {
      const filePath = path.resolve(CONFIG.rootDir, cssFile)

      if (!fs.existsSync(filePath)) {
        console.log(`   Warning: ${cssFile} not found`)
        continue
      }

      try {
        const output = execSync(
          `grep -c "^\\s*--" "${filePath}"`,
          { encoding: 'utf8' }
        )

        const count = parseInt(output.trim())
        this.results.cssDefinitions.set(cssFile, count)

      } catch (error) {
        if (error.status === 1) {
          this.results.cssDefinitions.set(cssFile, 0)
        } else {
          throw error
        }
      }
    }

    const totalCSSVars = Array.from(this.results.cssDefinitions.values())
      .reduce((sum, count) => sum + count, 0)
    console.log(`   Found ${totalCSSVars} CSS variable definitions`)
  }

  /**
   * Count TypeScript exports in design-token-utils.ts
   */
  async analyzeTypeScriptExports() {
    console.log('⚛️ Analyzing TypeScript exports...')

    const tsFile = path.resolve(CONFIG.rootDir, CONFIG.designTokenUtilsFile)

    if (!fs.existsSync(tsFile)) {
      console.log(`   Warning: ${CONFIG.designTokenUtilsFile} not found`)
      return
    }

    try {
      // Count lines and exports
      const lineCount = execSync(`wc -l < "${tsFile}"`, { encoding: 'utf8' })
      const exportCount = execSync(`grep -c "^export " "${tsFile}"`, { encoding: 'utf8' })

      this.results.tsExports.set('totalLines', parseInt(lineCount.trim()))
      this.results.tsExports.set('exportCount', parseInt(exportCount.trim()))

      console.log(`   Found ${this.results.tsExports.get('exportCount')} exports in ${this.results.tsExports.get('totalLines')} lines`)

    } catch (error) {
      console.log(`   Error analyzing ${CONFIG.designTokenUtilsFile}:`, error.message)
    }
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const totalCSSVars = Array.from(this.results.cssDefinitions.values())
      .reduce((sum, count) => sum + count, 0)

    const totalCSSUsage = Array.from(this.results.cssUsage.values())
      .reduce((sum, usages) => sum + usages.length, 0)

    const tsLines = this.results.tsExports.get('totalLines') || 0
    const tsExports = this.results.tsExports.get('exportCount') || 0
    const tsImports = this.results.tsImports.size

    this.results.summary = {
      cssDefinitions: totalCSSVars,
      cssUsage: totalCSSUsage,
      cssUsageRate: totalCSSVars > 0 ? ((totalCSSUsage / totalCSSVars) * 100).toFixed(1) : '0.0',
      tsLines,
      tsExports,
      tsImports,
      componentsUsingCSS: this.results.cssUsage.size,
      componentsUsingTS: tsImports
    }
  }

  /**
   * Output comprehensive results
   */
  outputResults() {
    console.log('\n📋 ANALYSIS RESULTS')
    console.log('===================\n')

    // Summary statistics
    console.log('📊 Summary Statistics:')
    console.log(`   CSS Variables Defined: ${this.results.summary.cssDefinitions}`)
    console.log(`   CSS Variables Used: ${this.results.summary.cssUsage}`)
    console.log(`   CSS Usage Rate: ${this.results.summary.cssUsageRate}%`)
    console.log(`   TypeScript Lines: ${this.results.summary.tsLines}`)
    console.log(`   TypeScript Exports: ${this.results.summary.tsExports}`)
    console.log(`   TypeScript Imports: ${this.results.summary.tsImports}`)
    console.log(`   Components Using CSS Vars: ${this.results.summary.componentsUsingCSS}`)
    console.log()

    // CSS Usage Details
    if (this.results.cssUsage.size > 0) {
      console.log('🎨 CSS Variable Usage by File:')
      for (const [file, usages] of this.results.cssUsage) {
        console.log(`   ${file} (${usages.length} variables):`)
        usages.forEach(usage => {
          console.log(`     Line ${usage.line}: ${usage.variable}`)
        })
      }
      console.log()
    }

    // TypeScript Import Details
    if (this.results.tsImports.size > 0) {
      console.log('📦 TypeScript Imports:')
      for (const [file, importInfo] of this.results.tsImports) {
        console.log(`   ${file}:`)
        console.log(`     Line ${importInfo.line}: ${importInfo.import}`)
      }
      console.log()
    }

    // CSS Definitions by File
    if (this.results.cssDefinitions.size > 0) {
      console.log('📁 CSS Definitions by File:')
      for (const [file, count] of this.results.cssDefinitions) {
        console.log(`   ${file}: ${count} variables`)
      }
      console.log()
    }

    // Recommendations
    this.outputRecommendations()
  }

  /**
   * Output simplification recommendations
   */
  outputRecommendations() {
    console.log('💡 SIMPLIFICATION RECOMMENDATIONS')
    console.log('================================\n')

    const usageRate = parseFloat(this.results.summary.cssUsageRate)
    const tsLines = this.results.summary.tsLines
    const tsImports = this.results.summary.tsImports

    if (usageRate < 5) {
      console.log('🚨 CRITICAL: Very low CSS variable usage rate!')
      console.log('   Consider massive simplification of CSS token system')
      console.log()
    }

    if (tsLines > 1000 && tsImports < 3) {
      console.log('🚨 CRITICAL: Large TypeScript file with minimal imports!')
      console.log(`   ${tsLines} lines with only ${tsImports} importing files`)
      console.log('   Consider 90%+ reduction of TypeScript exports')
      console.log()
    }

    if (this.results.summary.componentsUsingCSS < 10) {
      console.log('⚠️  WARNING: Very few components using CSS variables')
      console.log('   Most styling likely uses Tailwind classes directly')
      console.log('   Consider focusing only on brand colors and core tokens')
      console.log()
    }

    // Specific recommendations
    console.log('📋 Specific Actions:')
    console.log('   1. Preserve MFB brand colors (--mfb-green, --mfb-cream, --mfb-clay)')
    console.log('   2. Keep shadcn/ui semantic tokens for component library')
    console.log('   3. Remove unused component-specific tokens')
    console.log('   4. Eliminate complex TypeScript exports with no imports')
    console.log('   5. Simplify build optimization for remaining tokens')
    console.log()

    console.log('✅ Analysis complete! Use results for design token simplification.')
  }
}

// Execute analysis if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new TokenAnalyzer()
  analyzer.analyze().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export default TokenAnalyzer