#!/usr/bin/env node
/**
 * Token Coverage Report
 * 
 * Analyzes the codebase to determine design token adoption coverage
 * and identify areas that still use hardcoded values.
 */

import fs from 'fs'
import { glob } from 'glob'

class TokenCoverageAnalyzer {
  constructor() {
    this.stats = {
      totalFiles: 0,
      filesWithTokens: 0,
      hardcodedInstances: 0,
      tokenInstances: 0,
      coverageByType: {},
    }
    
    this.hardcodedPatterns = [
      // Spacing patterns
      { type: 'spacing', pattern: /\b(p|m|px|py|pl|pr|pt|pb|mx|my|ml|mr|mt|mb)-(0|1|2|3|4|5|6|8|10|12|16|20|24)\b/g },
      { type: 'spacing', pattern: /\b(space|gap)-(x|y)-(0|1|2|3|4|5|6|8|10|12|16|20|24)\b/g },
      
      // Typography patterns
      { type: 'typography', pattern: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/g },
      { type: 'typography', pattern: /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g },
      
      // Color patterns  
      { type: 'colors', pattern: /\bbg-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d+|white|black)\b/g },
      { type: 'colors', pattern: /\btext-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d+|white|black)\b/g },
      { type: 'colors', pattern: /\bborder-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d+|white|black)\b/g },
      
      // Shadow patterns
      { type: 'shadows', pattern: /\bshadow-(sm|md|lg|xl|2xl|inner|none)\b/g },
      
      // Radius patterns
      { type: 'radius', pattern: /\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/g },
    ]
    
    this.tokenPatterns = [
      // Token usage patterns
      { type: 'spacing', pattern: /semanticSpacing\.|spacing\./g },
      { type: 'typography', pattern: /semanticTypography\.|typography\.|fontWeight\./g },
      { type: 'colors', pattern: /semanticColors\.|textColors\.|borderColors\./g },
      { type: 'shadows', pattern: /semanticShadows\.|shadows\./g },
      { type: 'radius', pattern: /semanticRadius\.|radius\./g },
      { type: 'animations', pattern: /semanticAnimations\.|animationClasses\.|animationDuration\./g },
      { type: 'zIndex', pattern: /semanticZIndex\.|zIndexClasses\.|zIndex\./g },
    ]
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const fileStats = {
        hardcoded: {},
        tokens: {},
        totalHardcoded: 0,
        totalTokens: 0,
      }

      // Count hardcoded instances
      this.hardcodedPatterns.forEach(({ type, pattern }) => {
        const matches = content.match(pattern) || []
        if (matches.length > 0) {
          fileStats.hardcoded[type] = (fileStats.hardcoded[type] || 0) + matches.length
          fileStats.totalHardcoded += matches.length
        }
      })

      // Count token instances
      this.tokenPatterns.forEach(({ type, pattern }) => {
        const matches = content.match(pattern) || []
        if (matches.length > 0) {
          fileStats.tokens[type] = (fileStats.tokens[type] || 0) + matches.length
          fileStats.totalTokens += matches.length
        }
      })

      // Update global stats
      this.stats.totalFiles++
      this.stats.hardcodedInstances += fileStats.totalHardcoded
      this.stats.tokenInstances += fileStats.totalTokens
      
      if (fileStats.totalTokens > 0) {
        this.stats.filesWithTokens++
      }

      // Update coverage by type
      Object.keys(fileStats.hardcoded).forEach(type => {
        if (!this.stats.coverageByType[type]) {
          this.stats.coverageByType[type] = { hardcoded: 0, tokens: 0 }
        }
        this.stats.coverageByType[type].hardcoded += fileStats.hardcoded[type]
      })

      Object.keys(fileStats.tokens).forEach(type => {
        if (!this.stats.coverageByType[type]) {
          this.stats.coverageByType[type] = { hardcoded: 0, tokens: 0 }
        }
        this.stats.coverageByType[type].tokens += fileStats.tokens[type]
      })

      return fileStats

    } catch (error) {
      console.error(`Error analyzing ${filePath}: ${error.message}`)
      return null
    }
  }

  async analyzeAllFiles() {
    console.log('🔍 Analyzing design token coverage...\n')
    
    const pattern = 'src/**/*.{ts,tsx}'
    const files = await glob(pattern)
    
    // Filter relevant files
    const filteredFiles = files.filter(file => {
      return !file.includes('node_modules') && 
             !file.includes('dist') && 
             !file.includes('.d.ts') &&
             !file.includes('/tokens/') // Skip token definition files
    })

    const problemFiles = []

    for (const file of filteredFiles) {
      const fileStats = this.analyzeFile(file)
      
      if (fileStats && fileStats.totalHardcoded > 0) {
        const coverage = fileStats.totalTokens / (fileStats.totalTokens + fileStats.totalHardcoded)
        
        if (coverage < 0.7) { // Less than 70% token coverage
          problemFiles.push({
            file,
            hardcoded: fileStats.totalHardcoded,
            tokens: fileStats.totalTokens,
            coverage: Math.round(coverage * 100),
            details: fileStats
          })
        }
      }
    }

    this.printReport(problemFiles)
  }

  printReport(problemFiles) {
    const totalInstances = this.stats.hardcodedInstances + this.stats.tokenInstances
    const overallCoverage = totalInstances > 0 
      ? Math.round((this.stats.tokenInstances / totalInstances) * 100)
      : 0

    console.log('📊 Design Token Coverage Report')
    console.log('================================\n')
    
    console.log('Overall Statistics:')
    console.log(`  Files analyzed: ${this.stats.totalFiles}`)
    console.log(`  Files using tokens: ${this.stats.filesWithTokens}`)
    console.log(`  Token instances: ${this.stats.tokenInstances}`)
    console.log(`  Hardcoded instances: ${this.stats.hardcodedInstances}`)
    console.log(`  Overall coverage: ${overallCoverage}%\n`)

    // Coverage by type
    if (Object.keys(this.stats.coverageByType).length > 0) {
      console.log('Coverage by Category:')
      Object.entries(this.stats.coverageByType).forEach(([type, stats]) => {
        const total = stats.hardcoded + stats.tokens
        const coverage = total > 0 ? Math.round((stats.tokens / total) * 100) : 0
        console.log(`  ${type}: ${coverage}% (${stats.tokens} tokens, ${stats.hardcoded} hardcoded)`)
      })
      console.log('')
    }

    // Files needing improvement
    if (problemFiles.length > 0) {
      console.log(`Files needing token migration (${problemFiles.length}):`)
      problemFiles
        .sort((a, b) => a.coverage - b.coverage)
        .slice(0, 10) // Show top 10 worst
        .forEach(({ file, coverage, hardcoded, tokens }) => {
          console.log(`  ${file}: ${coverage}% coverage (${hardcoded} hardcoded, ${tokens} tokens)`)
        })
    }

    // Recommendations
    console.log('\nRecommendations:')
    
    if (overallCoverage < 90) {
      console.log('  🔧 Run token migration script to improve coverage')
      console.log('  📏 Focus on files with <70% token coverage')
    }
    
    if (overallCoverage >= 90) {
      console.log('  ✅ Excellent token coverage!')
      console.log('  🔄 Continue using tokens for new components')
    }

    console.log(`\n✨ Target: 90%+ token coverage (Currently: ${overallCoverage}%)`)
  }
}

// Main execution
async function main() {
  const analyzer = new TokenCoverageAnalyzer()
  await analyzer.analyzeAllFiles()
}

main().catch(console.error)