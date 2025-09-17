/**
 * CSS Variable Tree-Shaking Optimization Script
 *
 * Analyzes CSS variable usage across the codebase and eliminates unused design tokens
 * in production builds. Integrates with Vite's rollup configuration for automated optimization.
 *
 * Features:
 * - Scans TypeScript/JavaScript/CSS files for var() usage
 * - Identifies unused CSS variables in design token files
 * - Generates optimized CSS with only used variables
 * - Preserves critical variables and fallbacks
 * - Reports optimization metrics
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Configuration for CSS variable analysis
 */
const CONFIG = {
  // Directories to scan for CSS variable usage
  scanDirs: ['src/**/*.{ts,tsx,js,jsx,css,scss}'],

  // Design token files to optimize
  tokenFiles: [
    'src/styles/tokens/primitives.css',
    'src/styles/tokens/semantic.css'
  ],

  // Variables that should never be removed (critical fallbacks)
  preserveVariables: [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
    '--radius'
  ],

  // Output directory for optimized files
  outputDir: 'dist/optimized-tokens',

  // Enable debug logging
  debug: process.env.NODE_ENV === 'development' || process.argv.includes('--debug')
}

/**
 * Extract all CSS variable usage from source files
 */
async function extractUsedVariables() {
  const usedVariables = new Set()
  const files = await glob(CONFIG.scanDirs, { cwd: process.cwd() })

  if (CONFIG.debug) {
    console.log(`🔍 Scanning ${files.length} files for CSS variable usage...`)
  }

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8')

      // Match var(--variable-name) patterns
      const varMatches = content.match(/var\(\s*--[a-zA-Z0-9-_]+/g)
      if (varMatches) {
        varMatches.forEach(match => {
          // Extract just the variable name (remove var( and any spaces)
          const varName = match.replace(/var\(\s*/, '')
          usedVariables.add(varName)
        })
      }

      // Match CSS custom property definitions --variable-name:
      const propMatches = content.match(/--[a-zA-Z0-9-_]+(?=\s*:)/g)
      if (propMatches) {
        propMatches.forEach(prop => {
          usedVariables.add(prop)
        })
      }

      // Match CSS class references that might use variables indirectly
      // Look for utility classes that map to design tokens
      const classMatches = content.match(/(?:bg-|text-|border-|ring-)[a-zA-Z0-9-_]+/g)
      if (classMatches) {
        classMatches.forEach(className => {
          // Convert utility classes to potential variable names
          const potentialVar = `--${className.replace(/-/g, '-')}`
          usedVariables.add(potentialVar)
        })
      }

    } catch (error) {
      if (CONFIG.debug) {
        console.warn(`⚠️  Could not read file ${file}: ${error.message}`)
      }
    }
  }

  if (CONFIG.debug) {
    console.log(`✅ Found ${usedVariables.size} unique CSS variables in use`)
  }

  return usedVariables
}

/**
 * Parse CSS file and extract all defined variables
 */
function extractDefinedVariables(cssContent) {
  const definedVariables = new Map()

  // Match CSS custom property definitions with their values
  const matches = cssContent.match(/--[a-zA-Z0-9-_]+\s*:\s*[^;]+;/g)

  if (matches) {
    matches.forEach(match => {
      const [varName, ...valueParts] = match.split(':')
      const value = valueParts.join(':').replace(/;\s*$/, '').trim()
      definedVariables.set(varName.trim(), value)
    })
  }

  return definedVariables
}

/**
 * Optimize CSS content by removing unused variables
 */
function optimizeCssContent(cssContent, usedVariables, filename) {
  const definedVariables = extractDefinedVariables(cssContent)
  const unusedVariables = []
  const preservedCount = { used: 0, preserved: 0, removed: 0 }

  let optimizedContent = cssContent

  // Check each defined variable
  for (const [varName, value] of definedVariables) {
    const isUsed = usedVariables.has(varName)
    const isPreserved = CONFIG.preserveVariables.includes(varName)

    if (!isUsed && !isPreserved) {
      // Remove the variable definition
      const regex = new RegExp(`\\s*${varName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\s*:\\s*[^;]+;\\s*`, 'g')
      optimizedContent = optimizedContent.replace(regex, '')
      unusedVariables.push(varName)
      preservedCount.removed++
    } else if (isUsed) {
      preservedCount.used++
    } else {
      preservedCount.preserved++
    }
  }

  // Clean up extra whitespace and comments for removed variables
  optimizedContent = optimizedContent.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/\s*(?=\s*\/\*|$)/g, '')
  optimizedContent = optimizedContent.replace(/\n\s*\n\s*\n/g, '\n\n')

  if (CONFIG.debug) {
    console.log(`📄 ${filename}:`)
    console.log(`   Used: ${preservedCount.used}`)
    console.log(`   Preserved: ${preservedCount.preserved}`)
    console.log(`   Removed: ${preservedCount.removed}`)
    if (unusedVariables.length > 0) {
      console.log(`   Unused variables: ${unusedVariables.slice(0, 5).join(', ')}${unusedVariables.length > 5 ? '...' : ''}`)
    }
  }

  return {
    optimizedContent,
    unusedVariables,
    metrics: preservedCount
  }
}

/**
 * Generate optimization report
 */
function generateReport(results, outputPath) {
  const totalMetrics = {
    files: results.length,
    originalSize: 0,
    optimizedSize: 0,
    totalVariables: 0,
    usedVariables: 0,
    removedVariables: 0,
    preservedVariables: 0
  }

  const report = {
    timestamp: new Date().toISOString(),
    summary: totalMetrics,
    files: results.map(result => ({
      filename: result.filename,
      originalSize: result.originalSize,
      optimizedSize: result.optimizedSize,
      savings: result.originalSize - result.optimizedSize,
      savingsPercent: Math.round(((result.originalSize - result.optimizedSize) / result.originalSize) * 100),
      metrics: result.metrics,
      unusedVariables: result.unusedVariables.slice(0, 10) // Limit for readability
    }))
  }

  // Calculate totals
  results.forEach(result => {
    totalMetrics.originalSize += result.originalSize
    totalMetrics.optimizedSize += result.optimizedSize
    totalMetrics.usedVariables += result.metrics.used
    totalMetrics.removedVariables += result.metrics.removed
    totalMetrics.preservedVariables += result.metrics.preserved
    totalMetrics.totalVariables += result.metrics.used + result.metrics.removed + result.metrics.preserved
  })

  const reportPath = path.join(outputPath, 'optimization-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  return report
}

/**
 * Main optimization function
 */
async function optimizeCssVariables(options = {}) {
  const config = { ...CONFIG, ...options }

  try {
    // Extract used variables from source files
    const usedVariables = await extractUsedVariables()

    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true })
    }

    const results = []

    // Process each token file
    for (const tokenFile of config.tokenFiles) {
      if (!fs.existsSync(tokenFile)) {
        if (config.debug) {
          console.warn(`⚠️  Token file not found: ${tokenFile}`)
        }
        continue
      }

      const originalContent = fs.readFileSync(tokenFile, 'utf8')
      const filename = path.basename(tokenFile)

      const optimization = optimizeCssContent(originalContent, usedVariables, filename)

      // Write optimized file
      const outputPath = path.join(config.outputDir, filename)
      fs.writeFileSync(outputPath, optimization.optimizedContent)

      results.push({
        filename,
        originalSize: originalContent.length,
        optimizedSize: optimization.optimizedContent.length,
        unusedVariables: optimization.unusedVariables,
        metrics: optimization.metrics
      })
    }

    // Generate report
    const report = generateReport(results, config.outputDir)

    if (config.debug) {
      console.log('\n📊 Optimization Summary:')
      console.log(`   Files processed: ${report.summary.files}`)
      console.log(`   Total variables: ${report.summary.totalVariables}`)
      console.log(`   Used variables: ${report.summary.usedVariables}`)
      console.log(`   Removed variables: ${report.summary.removedVariables}`)
      console.log(`   Size reduction: ${report.summary.originalSize - report.summary.optimizedSize} bytes`)
      console.log(`   Optimized files saved to: ${config.outputDir}`)
    }

    return {
      success: true,
      report,
      optimizedFiles: results.map(r => path.join(config.outputDir, r.filename))
    }

  } catch (error) {
    console.error('❌ CSS optimization failed:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Vite plugin integration
 */
function createCssTreeShakingPlugin(options = {}) {
  let cachedResults = null

  return {
    name: 'css-variable-tree-shaking',

    async buildStart() {
      if (options.mode === 'production') {
        console.log('🚀 Starting CSS variable tree-shaking analysis...')
        cachedResults = await optimizeCssVariables(options)

        if (cachedResults.success) {
          console.log(`✅ CSS optimization complete. Saved to ${options.outputDir || CONFIG.outputDir}`)
        } else {
          console.error('❌ CSS optimization failed:', cachedResults.error)
        }
      }
    },

    generateBundle(options, bundle) {
      if (options.mode === 'production' && cachedResults?.success) {
        // Replace original CSS files with optimized versions in the bundle
        Object.keys(bundle).forEach(fileName => {
          const chunk = bundle[fileName]
          if (chunk.type === 'asset' && fileName.endsWith('.css')) {
            // Try to find corresponding optimized file
            const optimizedFile = cachedResults.optimizedFiles.find(f =>
              path.basename(f) === path.basename(fileName)
            )

            if (optimizedFile && fs.existsSync(optimizedFile)) {
              chunk.source = fs.readFileSync(optimizedFile, 'utf8')
              console.log(`🎯 Applied tree-shaking to ${fileName}`)
            }
          }
        })
      }
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const debug = args.includes('--debug')
  const outputDir = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || CONFIG.outputDir

  optimizeCssVariables({ debug, outputDir })
    .then(result => {
      if (result.success) {
        console.log('✅ CSS variable optimization completed successfully')
        process.exit(0)
      } else {
        console.error('❌ CSS variable optimization failed')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error.message)
      process.exit(1)
    })
}

export {
  optimizeCssVariables,
  createCssTreeShakingPlugin,
  extractUsedVariables,
  optimizeCssContent
}