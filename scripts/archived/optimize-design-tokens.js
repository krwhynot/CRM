/**
 * Design Token Performance Optimization Script
 *
 * This script optimizes the design token system for production builds by:
 * - Analyzing CSS variable usage across the codebase
 * - Implementing tree-shaking for unused design tokens
 * - Inlining critical design tokens for faster initial paint
 * - Generating performance reports and recommendations
 *
 * Usage:
 *   node scripts/optimize-design-tokens.js [options]
 *
 * Options:
 *   --analyze     Analyze current token usage
 *   --optimize    Run optimization and tree-shaking
 *   --critical    Generate critical CSS with inlined tokens
 *   --report      Generate performance report
 *   --dry-run     Show what would be done without making changes
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const srcDir = path.join(rootDir, 'src')

// Configuration
const CONFIG = {
  // Files to analyze for CSS variable usage
  sourcePatterns: [
    'src/**/*.tsx',
    'src/**/*.ts',
    'src/**/*.css',
    'src/**/*.scss',
  ],
  // CSS files containing design tokens
  tokenFiles: [
    'src/index.css',
    'src/styles/accessibility-tokens.css',
    'src/styles/component-tokens.css',
    'src/styles/advanced-colors.css',
    'src/styles/density.css',
  ],
  // Critical CSS variables that should always be included
  criticalTokens: [
    '--primary',
    '--background',
    '--foreground',
    '--mfb-green',
    '--text-primary',
    '--border',
    '--card',
    '--popover',
    '--muted',
    '--accent',
    '--destructive',
    '--success',
    '--warning',
    '--info',
  ],
  // Output files
  output: {
    criticalCss: 'dist/critical-tokens.css',
    optimizedCss: 'dist/optimized-tokens.css',
    unusedReport: 'dist/unused-tokens.json',
    performanceReport: 'dist/token-performance-report.json',
  }
}

// =============================================================================
// CSS VARIABLE ANALYSIS
// =============================================================================

/**
 * Extract all CSS variables from design token files
 */
async function extractDesignTokens() {
  const tokens = new Map()

  for (const tokenFile of CONFIG.tokenFiles) {
    const filePath = path.join(rootDir, tokenFile)
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Token file not found: ${tokenFile}`)
      continue
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const variableRegex = /--([a-zA-Z0-9-_]+):\s*([^;]+);/g
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      const [, name, value] = match
      const fullName = `--${name}`

      tokens.set(fullName, {
        name: fullName,
        value: value.trim(),
        file: tokenFile,
        usage: 0,
        isCritical: CONFIG.criticalTokens.includes(fullName),
        references: []
      })
    }
  }

  console.log(`📊 Found ${tokens.size} design tokens across ${CONFIG.tokenFiles.length} files`)
  return tokens
}

/**
 * Analyze usage of CSS variables in source files
 */
async function analyzeTokenUsage(tokens) {
  const files = await glob(CONFIG.sourcePatterns, { cwd: rootDir })
  const usageMap = new Map()

  for (const file of files) {
    const filePath = path.join(rootDir, file)
    const content = fs.readFileSync(filePath, 'utf8')

    // Find CSS variables in various formats
    const patterns = [
      /var\(--([a-zA-Z0-9-_]+)\)/g,           // var(--token)
      /var\(--([a-zA-Z0-9-_]+),\s*[^)]+\)/g, // var(--token, fallback)
      /--([a-zA-Z0-9-_]+)(?=\s*[;:}])/g,     // Direct CSS variable usage
      /"--([a-zA-Z0-9-_]+)"/g,               // String literals
      /'--([a-zA-Z0-9-_]+)'/g,               // String literals
      /\`--([a-zA-Z0-9-_]+)\`/g,             // Template literals
    ]

    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const tokenName = `--${match[1]}`

        if (tokens.has(tokenName)) {
          const token = tokens.get(tokenName)
          token.usage++
          token.references.push({
            file,
            line: content.substring(0, match.index).split('\n').length,
            context: match[0]
          })
        }

        // Track usage even for tokens not in our design system
        if (!usageMap.has(tokenName)) {
          usageMap.set(tokenName, { usage: 0, files: [] })
        }
        usageMap.get(tokenName).usage++
        if (!usageMap.get(tokenName).files.includes(file)) {
          usageMap.get(tokenName).files.push(file)
        }
      }
    }
  }

  console.log(`🔍 Analyzed ${files.length} source files for token usage`)
  return { tokens, usageMap }
}

/**
 * Generate performance analysis report
 */
function generatePerformanceReport(tokens, usageMap) {
  const usedTokens = Array.from(tokens.values()).filter(token => token.usage > 0)
  const unusedTokens = Array.from(tokens.values()).filter(token => token.usage === 0)
  const criticalTokens = Array.from(tokens.values()).filter(token => token.isCritical)

  const report = {
    summary: {
      totalTokens: tokens.size,
      usedTokens: usedTokens.length,
      unusedTokens: unusedTokens.length,
      criticalTokens: criticalTokens.length,
      usageRate: (usedTokens.length / tokens.size * 100).toFixed(2) + '%',
    },
    optimization: {
      potentialSavings: {
        unusedVariables: unusedTokens.length,
        estimatedCssSavings: unusedTokens.length * 30, // ~30 chars per variable
        treeShakingCandidates: unusedTokens.filter(t => !t.isCritical).length,
      },
      recommendations: []
    },
    usage: {
      mostUsed: usedTokens
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 20)
        .map(token => ({
          name: token.name,
          usage: token.usage,
          file: token.file
        })),
      unused: unusedTokens.map(token => ({
        name: token.name,
        file: token.file,
        isCritical: token.isCritical
      })),
      critical: criticalTokens.map(token => ({
        name: token.name,
        usage: token.usage,
        isUsed: token.usage > 0
      }))
    },
    files: {
      tokenFiles: CONFIG.tokenFiles.map(file => {
        const fileTokens = Array.from(tokens.values()).filter(token => token.file === file)
        return {
          file,
          totalTokens: fileTokens.length,
          usedTokens: fileTokens.filter(t => t.usage > 0).length,
          unusedTokens: fileTokens.filter(t => t.usage === 0).length,
          usageRate: fileTokens.length > 0
            ? (fileTokens.filter(t => t.usage > 0).length / fileTokens.length * 100).toFixed(2) + '%'
            : '0%'
        }
      })
    },
    timestamp: new Date().toISOString(),
    buildInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  }

  // Generate recommendations
  if (unusedTokens.length > 10) {
    report.optimization.recommendations.push({
      type: 'tree-shaking',
      severity: 'medium',
      message: `Consider removing ${unusedTokens.length} unused design tokens to reduce bundle size`
    })
  }

  const uncriticalUnused = unusedTokens.filter(t => !t.isCritical)
  if (uncriticalUnused.length > 0) {
    report.optimization.recommendations.push({
      type: 'cleanup',
      severity: 'low',
      message: `${uncriticalUnused.length} non-critical tokens are unused and can be safely removed`
    })
  }

  const unusedCritical = criticalTokens.filter(t => t.usage === 0)
  if (unusedCritical.length > 0) {
    report.optimization.recommendations.push({
      type: 'review',
      severity: 'high',
      message: `${unusedCritical.length} critical tokens are unused - review if they're still needed`,
      tokens: unusedCritical.map(t => t.name)
    })
  }

  return report
}

/**
 * Generate critical CSS with inlined design tokens
 */
function generateCriticalCSS(tokens) {
  const criticalVars = Array.from(tokens.values())
    .filter(token => token.isCritical || token.usage > 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  let criticalCSS = `/*
 * Critical Design Tokens - Generated by optimize-design-tokens.js
 * Contains essential design tokens for fast initial page render
 * Generated: ${new Date().toISOString()}
 */

:root {
  /* Critical Design Tokens (${criticalVars.length} variables) */
`

  for (const token of criticalVars) {
    criticalCSS += `  ${token.name}: ${token.value};\n`
  }

  criticalCSS += '}\n'

  return criticalCSS
}

/**
 * Generate optimized CSS with tree-shaking applied
 */
function generateOptimizedCSS(tokens) {
  const usedTokens = Array.from(tokens.values())
    .filter(token => token.usage > 0 || token.isCritical)
    .sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name))

  const fileGroups = {}
  for (const token of usedTokens) {
    if (!fileGroups[token.file]) {
      fileGroups[token.file] = []
    }
    fileGroups[token.file].push(token)
  }

  let optimizedCSS = `/*
 * Optimized Design Tokens - Generated by optimize-design-tokens.js
 * Tree-shaken to include only used design tokens (${usedTokens.length}/${tokens.size} variables)
 * Generated: ${new Date().toISOString()}
 */

`

  for (const [file, tokens] of Object.entries(fileGroups)) {
    optimizedCSS += `/* From ${file} (${tokens.length} variables) */\n:root {\n`
    for (const token of tokens) {
      optimizedCSS += `  ${token.name}: ${token.value}; /* Used ${token.usage}x */\n`
    }
    optimizedCSS += '}\n\n'
  }

  return optimizedCSS
}

/**
 * Write optimization outputs to files
 */
async function writeOptimizationOutputs(tokens, report, criticalCSS, optimizedCSS) {
  // Ensure dist directory exists
  const distDir = path.join(rootDir, 'dist')
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }

  // Write critical CSS
  fs.writeFileSync(
    path.join(rootDir, CONFIG.output.criticalCss),
    criticalCSS,
    'utf8'
  )
  console.log(`✅ Critical CSS written to ${CONFIG.output.criticalCss}`)

  // Write optimized CSS
  fs.writeFileSync(
    path.join(rootDir, CONFIG.output.optimizedCss),
    optimizedCSS,
    'utf8'
  )
  console.log(`✅ Optimized CSS written to ${CONFIG.output.optimizedCss}`)

  // Write performance report
  fs.writeFileSync(
    path.join(rootDir, CONFIG.output.performanceReport),
    JSON.stringify(report, null, 2),
    'utf8'
  )
  console.log(`📊 Performance report written to ${CONFIG.output.performanceReport}`)

  // Write unused tokens list
  const unusedTokens = Array.from(tokens.values()).filter(token => token.usage === 0)
  fs.writeFileSync(
    path.join(rootDir, CONFIG.output.unusedReport),
    JSON.stringify(unusedTokens, null, 2),
    'utf8'
  )
  console.log(`🗑️  Unused tokens report written to ${CONFIG.output.unusedReport}`)
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

/**
 * Display usage information
 */
function showHelp() {
  console.log(`
🎨 Design Token Performance Optimization

Usage: node scripts/optimize-design-tokens.js [options]

Options:
  --analyze     Analyze current token usage and generate reports
  --optimize    Generate optimized CSS with tree-shaking
  --critical    Generate critical CSS for inlining
  --report      Generate detailed performance report
  --dry-run     Show analysis without writing files
  --help        Show this help message

Examples:
  node scripts/optimize-design-tokens.js --analyze
  node scripts/optimize-design-tokens.js --optimize --critical
  node scripts/optimize-design-tokens.js --report --dry-run
`)
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.length === 0) {
    showHelp()
    return
  }

  const options = {
    analyze: args.includes('--analyze'),
    optimize: args.includes('--optimize'),
    critical: args.includes('--critical'),
    report: args.includes('--report'),
    dryRun: args.includes('--dry-run')
  }

  // If no specific action requested, do analysis
  if (!Object.values(options).some(Boolean)) {
    options.analyze = true
    options.report = true
  }

  console.log('🚀 Starting design token optimization...\n')

  try {
    // Extract all design tokens
    const tokens = await extractDesignTokens()

    // Analyze usage
    const { usageMap } = await analyzeTokenUsage(tokens)

    // Generate reports
    const report = generatePerformanceReport(tokens, usageMap)

    console.log(`\n📈 Analysis Summary:`)
    console.log(`   Total tokens: ${report.summary.totalTokens}`)
    console.log(`   Used tokens: ${report.summary.usedTokens}`)
    console.log(`   Unused tokens: ${report.summary.unusedTokens}`)
    console.log(`   Usage rate: ${report.summary.usageRate}`)
    console.log(`   Critical tokens: ${report.summary.criticalTokens}`)

    if (report.optimization.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`)
      for (const rec of report.optimization.recommendations) {
        const icon = rec.severity === 'high' ? '🔴' : rec.severity === 'medium' ? '🟡' : '🟢'
        console.log(`   ${icon} ${rec.message}`)
      }
    }

    // Generate optimized files if requested
    if (options.optimize || options.critical) {
      if (!options.dryRun) {
        let criticalCSS, optimizedCSS

        if (options.critical) {
          criticalCSS = generateCriticalCSS(tokens)
        }

        if (options.optimize) {
          optimizedCSS = generateOptimizedCSS(tokens)
        }

        await writeOptimizationOutputs(tokens, report, criticalCSS, optimizedCSS)
      } else {
        console.log('\n🔍 Dry run - would generate:')
        if (options.critical) console.log(`   - Critical CSS: ${CONFIG.output.criticalCss}`)
        if (options.optimize) console.log(`   - Optimized CSS: ${CONFIG.output.optimizedCss}`)
      }
    }

    // Write reports if requested
    if ((options.report || options.analyze) && !options.dryRun) {
      const distDir = path.join(rootDir, 'dist')
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true })
      }

      fs.writeFileSync(
        path.join(rootDir, CONFIG.output.performanceReport),
        JSON.stringify(report, null, 2),
        'utf8'
      )
      console.log(`\n📊 Performance report written to ${CONFIG.output.performanceReport}`)
    }

    console.log('\n✅ Design token optimization complete!')

  } catch (error) {
    console.error('❌ Error during optimization:', error)
    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export {
  extractDesignTokens,
  analyzeTokenUsage,
  generatePerformanceReport,
  generateCriticalCSS,
  generateOptimizedCSS
}