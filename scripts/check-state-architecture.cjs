#!/usr/bin/env node

/**
 * State Architecture Checker
 * 
 * Scans the codebase for potential state management anti-patterns
 * and ensures proper separation of client/server state.
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Define patterns to look for
const ANTI_PATTERNS = {
  // Server operations in Zustand stores
  ZUSTAND_SERVER_OPS: {
    pattern: /create\([^)]*\).*(?:supabase|fetch|axios|api)/s,
    message: 'Zustand store contains server operations - should use TanStack Query',
    severity: 'error'
  },
  
  // Direct Supabase usage in components (should use hooks)
  COMPONENT_DIRECT_DB: {
    pattern: /supabase\.from\(/,
    message: 'Component directly accessing Supabase - should use TanStack Query hooks',
    severity: 'warning',
    excludeFiles: ['/hooks/', '/lib/']
  },
  
  // Manual cache management in stores
  MANUAL_CACHE: {
    pattern: /(?:cache|lastFetched|cacheTimeout).*supabase/s,
    message: 'Manual cache management detected - TanStack Query handles this automatically',
    severity: 'warning'
  },
  
  // Server data in useState
  LOCAL_SERVER_STATE: {
    pattern: /useState.*(?:organizations|contacts|opportunities|products)/,
    message: 'Server data in useState - should use TanStack Query',
    severity: 'warning'
  }
}

const GOOD_PATTERNS = {
  // Proper TanStack Query usage
  TANSTACK_QUERY: {
    pattern: /useQuery\s*\(\s*{/,
    message: '✅ Proper server state management with TanStack Query'
  },
  
  // Proper Zustand client state
  ZUSTAND_CLIENT: {
    pattern: /create.*\(set\).*(?:viewMode|sortBy|isOpen|preferences)/s,
    message: '✅ Proper client state management with Zustand'
  }
}

class StateArchitectureChecker {
  constructor() {
    this.issues = []
    this.goodPatterns = []
    this.scannedFiles = 0
  }

  async checkProject() {
    console.log('🔍 Scanning project for state management patterns...\n')

    // Scan TypeScript/JavaScript files
    const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
      ignore: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**']
    })

    for (const file of files) {
      await this.checkFile(file)
    }

    this.generateReport()
  }

  async checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      this.scannedFiles++

      // Check for anti-patterns
      for (const [name, config] of Object.entries(ANTI_PATTERNS)) {
        if (config.excludeFiles && config.excludeFiles.some(exclude => filePath.includes(exclude))) {
          continue
        }

        if (config.pattern.test(content)) {
          this.issues.push({
            file: filePath,
            pattern: name,
            message: config.message,
            severity: config.severity,
            line: this.findLineNumber(content, config.pattern)
          })
        }
      }

      // Check for good patterns
      for (const [name, config] of Object.entries(GOOD_PATTERNS)) {
        if (config.pattern.test(content)) {
          this.goodPatterns.push({
            file: filePath,
            pattern: name,
            message: config.message
          })
        }
      }

    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message)
    }
  }

  findLineNumber(content, pattern) {
    const match = content.match(pattern)
    if (!match) return null

    const beforeMatch = content.substring(0, match.index)
    return beforeMatch.split('\n').length
  }

  generateReport() {
    console.log('📊 State Management Architecture Report')
    console.log('=' .repeat(50))
    console.log(`📁 Files scanned: ${this.scannedFiles}`)
    console.log(`❌ Issues found: ${this.issues.length}`)
    console.log(`✅ Good patterns: ${this.goodPatterns.length}\n`)

    // Report issues by severity
    const errors = this.issues.filter(issue => issue.severity === 'error')
    const warnings = this.issues.filter(issue => issue.severity === 'warning')

    if (errors.length > 0) {
      console.log('🚨 ERRORS (Must Fix):')
      errors.forEach(issue => {
        console.log(`  ❌ ${issue.file}:${issue.line}`)
        console.log(`     ${issue.message}`)
        console.log(`     Pattern: ${issue.pattern}\n`)
      })
    }

    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS (Recommended to Fix):')
      warnings.forEach(issue => {
        console.log(`  ⚠️  ${issue.file}:${issue.line}`)
        console.log(`     ${issue.message}`)
        console.log(`     Pattern: ${issue.pattern}\n`)
      })
    }

    // Show good patterns
    if (this.goodPatterns.length > 0) {
      console.log('✅ GOOD PATTERNS FOUND:')
      const patternCounts = {}
      this.goodPatterns.forEach(pattern => {
        patternCounts[pattern.pattern] = (patternCounts[pattern.pattern] || 0) + 1
      })

      Object.entries(patternCounts).forEach(([pattern, count]) => {
        console.log(`  ✅ ${GOOD_PATTERNS[pattern].message} (${count} files)`)
      })
      console.log()
    }

    // Architecture health score
    const healthScore = this.calculateHealthScore()
    console.log('🏆 ARCHITECTURE HEALTH SCORE')
    console.log(`   ${this.getHealthEmoji(healthScore)} ${healthScore}/100`)
    console.log(`   ${this.getHealthMessage(healthScore)}\n`)

    // Recommendations
    this.generateRecommendations()

    // Exit with error code if critical issues found
    if (errors.length > 0) {
      process.exit(1)
    }
  }

  calculateHealthScore() {
    let score = 100
    
    // Deduct for errors (more severe)
    const errors = this.issues.filter(issue => issue.severity === 'error')
    score -= errors.length * 15

    // Deduct for warnings (less severe)
    const warnings = this.issues.filter(issue => issue.severity === 'warning')
    score -= warnings.length * 5

    // Bonus for good patterns
    score += Math.min(20, this.goodPatterns.length * 2)

    return Math.max(0, Math.min(100, score))
  }

  getHealthEmoji(score) {
    if (score >= 90) return '🟢'
    if (score >= 70) return '🟡'
    if (score >= 50) return '🟠'
    return '🔴'
  }

  getHealthMessage(score) {
    if (score >= 90) return 'Excellent state architecture!'
    if (score >= 70) return 'Good architecture with minor improvements needed'
    if (score >= 50) return 'Architecture needs attention'
    return 'Major architecture issues - refactoring recommended'
  }

  generateRecommendations() {
    console.log('💡 RECOMMENDATIONS:')

    if (this.issues.some(issue => issue.pattern === 'ZUSTAND_SERVER_OPS')) {
      console.log('  1. Move server operations from Zustand stores to TanStack Query hooks')
      console.log('     📖 Guide: /docs/STATE_MANAGEMENT_GUIDE.md')
    }

    if (this.issues.some(issue => issue.pattern === 'COMPONENT_DIRECT_DB')) {
      console.log('  2. Create TanStack Query hooks instead of direct Supabase usage in components')
      console.log('     📁 Examples: /src/features/organizations/hooks/useOrganizations.ts')
    }

    if (this.issues.some(issue => issue.pattern === 'LOCAL_SERVER_STATE')) {
      console.log('  3. Replace useState for server data with TanStack Query hooks')
      console.log('     ⚡ Benefits: Automatic caching, background refetching, error handling')
    }

    if (this.issues.length === 0) {
      console.log('  🎉 No issues found! Your state architecture follows best practices.')
    }

    console.log()
  }
}

// Run the checker
if (require.main === module) {
  const checker = new StateArchitectureChecker()
  checker.checkProject().catch(error => {
    console.error('❌ Error running architecture checker:', error.message)
    process.exit(1)
  })
}

module.exports = StateArchitectureChecker