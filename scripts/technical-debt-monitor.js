#!/usr/bin/env node

/**
 * Technical Debt Monitoring System
 * 
 * This script provides comprehensive monitoring of technical debt in the CRM system
 * Run with: node scripts/technical-debt-monitor.js [command]
 * 
 * Commands:
 *   audit    - Run complete technical debt audit
 *   scan     - Scan for new TODO comments
 *   report   - Generate debt summary report  
 *   validate - Validate feature flags configuration
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Configuration
const CONFIG = {
  todoPatterns: ['TODO', 'FIXME', 'HACK', 'XXX', 'BUG'],
  excludePaths: [
    'node_modules',
    'dist', 
    'build',
    '.git',
    '*.min.js',
    'docs/technical-debt/registry.md' // Exclude our own registry
  ],
  maxAllowedDebt: 10,
  alertThreshold: 15,
  featureFlagsPath: 'src/lib/feature-flags.ts'
}

/**
 * ANSI color codes for terminal output
 */
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
}

/**
 * Log with colors
 */
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`)
}

/**
 * Scan for TODO comments in the codebase
 */
function scanTodoComments() {
  log('\n🔍 Scanning for technical debt comments...', colors.cyan)
  
  const todoItems = []
  const excludePattern = CONFIG.excludePaths.map(p => `--exclude-dir=${p}`).join(' ')
  
  CONFIG.todoPatterns.forEach(pattern => {
    try {
      const command = `grep -r "${pattern}" src/ ${excludePattern} --include="*.ts" --include="*.tsx" -n || true`
      const output = execSync(command, { encoding: 'utf-8' })
      
      if (output.trim()) {
        const lines = output.trim().split('\n')
        lines.forEach(line => {
          const match = line.match(/^([^:]+):(\d+):(.+)$/)
          if (match) {
            const [, file, lineNumber, content] = match
            todoItems.push({
              pattern,
              file: file.replace(/^src\//, ''),
              line: parseInt(lineNumber),
              content: content.trim(),
              severity: getSeverity(pattern, content)
            })
          }
        })
      }
    } catch (error) {
      // Grep returns non-zero when no matches found, ignore
    }
  })
  
  return todoItems
}

/**
 * Determine severity of technical debt item
 */
function getSeverity(pattern, content) {
  const lowercaseContent = content.toLowerCase()
  
  if (pattern === 'HACK' || lowercaseContent.includes('urgent') || lowercaseContent.includes('critical')) {
    return 'HIGH'
  }
  if (pattern === 'FIXME' || lowercaseContent.includes('bug') || lowercaseContent.includes('broken')) {
    return 'MEDIUM'  
  }
  if (pattern === 'TODO' && (lowercaseContent.includes('implement') || lowercaseContent.includes('add'))) {
    return 'MEDIUM'
  }
  
  return 'LOW'
}

/**
 * Validate feature flags configuration
 */
function validateFeatureFlags() {
  log('\n⚙️  Validating feature flags configuration...', colors.cyan)
  
  const featureFlagsPath = path.join(process.cwd(), CONFIG.featureFlagsPath)
  
  if (!fs.existsSync(featureFlagsPath)) {
    log('❌ Feature flags file not found', colors.red)
    return { valid: false, issues: ['Feature flags file missing'] }
  }
  
  const content = fs.readFileSync(featureFlagsPath, 'utf-8')
  const issues = []
  
  // Check for TBD GitHub issues
  const tbdMatches = content.match(/githubIssue: "#TBD"/g)
  if (tbdMatches) {
    issues.push(`${tbdMatches.length} feature flags still have "#TBD" GitHub issues`)
  }
  
  // Check for enabled flags that shouldn't be
  const riskyPatterns = [
    { pattern: /rpcContactCreation:\s*{\s*enabled:\s*true/, message: 'RPC contact creation is enabled but may not be fully implemented' },
    { pattern: /debugMode:\s*{\s*enabled:\s*true/, message: 'Debug mode is enabled in production build' }
  ]
  
  riskyPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      issues.push(message)
    }
  })
  
  return { valid: issues.length === 0, issues }
}

/**
 * Check ESLint configuration for technical debt rules
 */
function validateEslintConfig() {
  log('\n📋 Validating ESLint configuration...', colors.cyan)
  
  const eslintPath = path.join(process.cwd(), '.eslintrc.cjs')
  const issues = []
  
  if (!fs.existsSync(eslintPath)) {
    issues.push('ESLint configuration file not found')
    return { valid: false, issues }
  }
  
  const content = fs.readFileSync(eslintPath, 'utf-8')
  
  // Check for no-warning-comments rule
  if (!content.includes('no-warning-comments')) {
    issues.push('ESLint missing no-warning-comments rule for TODO tracking')
  }
  
  // Check for technical debt related rules
  if (!content.includes('TODO') && !content.includes('FIXME')) {
    issues.push('ESLint not configured to detect technical debt comments')
  }
  
  return { valid: issues.length === 0, issues }
}

/**
 * Run ESLint and check for technical debt warnings
 */
function runEslintCheck() {
  log('\n🔧 Running ESLint technical debt check...', colors.cyan)
  
  try {
    const result = execSync('npm run lint -- --format=json', { encoding: 'utf-8' })
    const lintResults = JSON.parse(result)
    
    const debtWarnings = []
    lintResults.forEach(file => {
      file.messages.forEach(message => {
        if (message.ruleId === 'no-warning-comments' || 
            (message.message && message.message.includes('TODO'))) {
          debtWarnings.push({
            file: file.filePath.replace(process.cwd(), ''),
            line: message.line,
            message: message.message,
            severity: message.severity
          })
        }
      })
    })
    
    return debtWarnings
  } catch (error) {
    log('⚠️  Could not run ESLint check', colors.yellow)
    return []
  }
}

/**
 * Generate comprehensive technical debt report
 */
function generateReport(todoItems, featureFlagValidation, eslintValidation, eslintWarnings) {
  log('\n📊 Technical Debt Report', colors.bright + colors.cyan)
  log('=' .repeat(50), colors.cyan)
  
  // Summary statistics
  const highSeverity = todoItems.filter(item => item.severity === 'HIGH').length
  const mediumSeverity = todoItems.filter(item => item.severity === 'MEDIUM').length
  const lowSeverity = todoItems.filter(item => item.severity === 'LOW').length
  const totalDebt = todoItems.length
  
  log(`\n📈 Summary:`)
  log(`  Total Technical Debt Items: ${totalDebt}`)
  log(`  🔴 High Severity: ${highSeverity}`, highSeverity > 0 ? colors.red : colors.green)
  log(`  🟡 Medium Severity: ${mediumSeverity}`, mediumSeverity > 3 ? colors.yellow : colors.green)
  log(`  🟢 Low Severity: ${lowSeverity}`, lowSeverity > 5 ? colors.yellow : colors.green)
  
  // Debt by file
  const fileGroups = {}
  todoItems.forEach(item => {
    if (!fileGroups[item.file]) fileGroups[item.file] = []
    fileGroups[item.file].push(item)
  })
  
  log(`\n📁 Debt Distribution:`)
  Object.entries(fileGroups)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .forEach(([file, items]) => {
      log(`  ${file}: ${items.length} items`, items.length > 3 ? colors.yellow : colors.green)
    })
  
  // Feature flags status
  log(`\n🚩 Feature Flags Status:`)
  if (featureFlagValidation.valid) {
    log('  ✅ Feature flags configuration is valid', colors.green)
  } else {
    log('  ❌ Feature flags have issues:', colors.red)
    featureFlagValidation.issues.forEach(issue => {
      log(`    • ${issue}`, colors.red)
    })
  }
  
  // ESLint status  
  log(`\n🔧 ESLint Configuration:`)
  if (eslintValidation.valid) {
    log('  ✅ ESLint properly configured for debt tracking', colors.green)
  } else {
    log('  ❌ ESLint configuration issues:', colors.red)
    eslintValidation.issues.forEach(issue => {
      log(`    • ${issue}`, colors.red)
    })
  }
  
  if (eslintWarnings.length > 0) {
    log(`  ⚠️  ${eslintWarnings.length} ESLint debt warnings detected`, colors.yellow)
  }
  
  // Recommendations
  log(`\n💡 Recommendations:`)
  if (totalDebt > CONFIG.maxAllowedDebt) {
    log(`  • Reduce technical debt to below ${CONFIG.maxAllowedDebt} items`, colors.yellow)
  }
  if (highSeverity > 0) {
    log(`  • Address ${highSeverity} high severity items immediately`, colors.red)
  }
  if (!featureFlagValidation.valid) {
    log(`  • Fix feature flag configuration issues`, colors.yellow)
  }
  
  // Alert if debt is too high
  if (totalDebt >= CONFIG.alertThreshold) {
    log(`\n🚨 ALERT: Technical debt (${totalDebt}) exceeds threshold (${CONFIG.alertThreshold})`, colors.red + colors.bright)
    log('  Immediate action required to prevent velocity degradation', colors.red)
  }
  
  return {
    total: totalDebt,
    highSeverity,
    mediumSeverity,
    lowSeverity,
    isHealthy: totalDebt <= CONFIG.maxAllowedDebt && highSeverity === 0
  }
}

/**
 * Write debt tracking data to registry
 */
function updateDebtRegistry(todoItems, summary) {
  log('\n📝 Updating debt registry...', colors.cyan)
  
  const registryPath = path.join(process.cwd(), 'docs/technical-debt/registry.md')
  
  if (!fs.existsSync(registryPath)) {
    log('⚠️  Debt registry not found, skipping update', colors.yellow)
    return
  }
  
  let content = fs.readFileSync(registryPath, 'utf-8')
  
  // Update summary statistics
  const statsSection = `- **Total Items**: ${summary.total}
- **High Priority**: ${summary.highSeverity}
- **Medium Priority**: ${summary.mediumSeverity}
- **Low Priority**: ${summary.lowSeverity}
- **Status**: ${summary.isHealthy ? 'Healthy' : 'Needs Attention'}`
  
  content = content.replace(
    /- \*\*Total Items\*\*:.*?- \*\*Status\*\*:.*?\n/s,
    statsSection + '\n'
  )
  
  // Update timestamp
  const now = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  content = content.replace(
    /\*\*Last Updated\*\*: .*?\n/,
    `**Last Updated**: ${now}\n`
  )
  
  fs.writeFileSync(registryPath, content)
  log('✅ Registry updated successfully', colors.green)
}

/**
 * Main execution function
 */
function main() {
  const command = process.argv[2] || 'audit'
  
  log(`🚀 Technical Debt Monitor - ${command.toUpperCase()} mode`, colors.bright + colors.magenta)
  
  try {
    switch (command) {
      case 'scan':
        const todoItems = scanTodoComments()
        log(`\nFound ${todoItems.length} technical debt items`)
        todoItems.slice(0, 10).forEach(item => {
          const severityColor = item.severity === 'HIGH' ? colors.red : 
                               item.severity === 'MEDIUM' ? colors.yellow : colors.green
          log(`  ${item.file}:${item.line} [${item.severity}] ${item.content}`, severityColor)
        })
        if (todoItems.length > 10) {
          log(`  ... and ${todoItems.length - 10} more items`)
        }
        break
        
      case 'validate':
        const flagValidation = validateFeatureFlags()
        const lintValidation = validateEslintConfig()
        
        if (flagValidation.valid && lintValidation.valid) {
          log('\n✅ All validations passed', colors.green)
        } else {
          log('\n❌ Validation issues found', colors.red)
          process.exit(1)
        }
        break
        
      case 'report':
      case 'audit':
      default:
        const todos = scanTodoComments()
        const featureFlags = validateFeatureFlags()
        const eslintConfig = validateEslintConfig()
        const eslintWarnings = runEslintCheck()
        
        const summary = generateReport(todos, featureFlags, eslintConfig, eslintWarnings)
        updateDebtRegistry(todos, summary)
        
        log(`\n${summary.isHealthy ? '✅' : '⚠️ '} Technical Debt Status: ${summary.isHealthy ? 'HEALTHY' : 'NEEDS ATTENTION'}`, 
            summary.isHealthy ? colors.green : colors.yellow)
        
        if (!summary.isHealthy) {
          process.exit(1)
        }
        break
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}