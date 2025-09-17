#!/usr/bin/env node

/**
 * Technical Debt Monitoring System
 *
 * This script provides comprehensive monitoring of technical debt in the CRM system
 * Run with: node scripts/technical-debt-monitor.js [action]
 *
 * Actions:
 *   audit    - Run complete technical debt audit (default)
 *   scan     - Scan for new TODO comments
 *   report   - Generate debt summary report
 *   validate - Validate feature flags configuration
 *   issues   - Create GitHub issues for technical debt items
 *
 * Usage:
 *   npm run debt -- audit
 *   npm run debt -- scan
 *   npm run debt -- report
 *   npm run debt -- validate
 *   npm run debt -- issues
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

// Technical debt items for GitHub issue creation
const TECHNICAL_DEBT_ITEMS = [
  {
    file: 'src/features/interactions/components/table/InteractionTableHeader.tsx',
    lines: [47, 50],
    title: 'Implement bulk operations for interactions',
    description: `
## Problem
Bulk operations are not implemented for interaction management, limiting user efficiency.

## Current State
- Selection state is hardcoded to 0
- Bulk action handler only logs to console
- UI shows but is non-functional

## Solution Required
- [ ] Implement selection state management
- [ ] Add bulk delete functionality
- [ ] Add bulk update operations
- [ ] Add bulk export functionality
- [ ] Update UI to show selected count properly

## Priority
High - Affects user workflow efficiency

## Files
- \`src/features/interactions/components/table/InteractionTableHeader.tsx:47,50\`
    `,
    labels: ['technical-debt', 'enhancement', 'priority-high'],
    milestone: 'v1.1.0'
  },

  {
    file: 'src/features/import-export/hooks/useExportExecution.ts',
    lines: [136],
    title: 'Implement proper XLSX export using SheetJS',
    description: `
## Problem
XLSX export option falls back to CSV, creating user confusion and missing expected functionality.

## Current State
- XLSX export requested but CSV file is generated
- User expects Excel format but receives CSV
- Feature flag now controls behavior

## Solution Required
- [ ] Install SheetJS (xlsx) library
- [ ] Implement proper XLSX generation
- [ ] Maintain CSV compatibility
- [ ] Add proper MIME types and file extensions
- [ ] Test with various data sizes

## Priority
Medium - Feature completeness issue

## Files
- \`src/features/import-export/hooks/useExportExecution.ts:136\`
    `,
    labels: ['technical-debt', 'enhancement', 'priority-medium'],
    milestone: 'v1.0.1'
  },

  {
    file: 'src/features/contacts/hooks/useContacts.ts',
    lines: [323],
    title: 'Implement RPC contact creation function',
    description: `
## Problem
Contact creation via RPC is not implemented, forcing users to rely only on Excel import.

## Current State
- Function throws error when called
- Users cannot create individual contacts
- Only batch import is available

## Solution Required
- [ ] Create Supabase RPC function for contact creation
- [ ] Implement proper validation
- [ ] Add organization linking logic
- [ ] Handle duplicate detection
- [ ] Add proper error handling

## Priority
Medium - Affects user workflow but workaround exists

## Files
- \`src/features/contacts/hooks/useContacts.ts:323\`
    `,
    labels: ['technical-debt', 'enhancement', 'priority-medium'],
    milestone: 'v1.0.1'
  },

  {
    file: 'src/features/opportunities/hooks/useOpportunities.ts',
    lines: [651],
    title: 'Add stage tracking for opportunities',
    description: `
## Problem
Opportunity stage changes are not tracked over time, limiting analytics and audit capabilities.

## Current State
- \`stage_updated_at\` is always null
- No historical tracking of stage changes
- Missing audit trail for sales process

## Solution Required
- [ ] Implement stage change tracking
- [ ] Add historical stage data table
- [ ] Update stage_updated_at on changes
- [ ] Create stage analytics views
- [ ] Add stage change notifications

## Priority
Low - Enhancement for future analytics

## Files
- \`src/features/opportunities/hooks/useOpportunities.ts:651\`
    `,
    labels: ['technical-debt', 'enhancement', 'priority-low'],
    milestone: 'v1.2.0'
  },

  {
    file: 'src/features/interactions/hooks/useInteractionTimelineItemActions.ts',
    lines: [39],
    title: 'Implement mark complete functionality for interactions',
    description: `
## Problem
Mark complete functionality is not implemented for interaction timeline items.

## Current State
- Function is commented as TODO
- Users cannot mark interactions as completed
- No completion tracking

## Solution Required
- [ ] Implement mark complete functionality
- [ ] Add completed_at timestamp field
- [ ] Update UI to show completion status
- [ ] Add completion filters
- [ ] Add completion analytics

## Priority
Low - Enhancement for interaction management

## Files
- \`src/features/interactions/hooks/useInteractionTimelineItemActions.ts:39\`
    `,
    labels: ['technical-debt', 'enhancement', 'priority-low'],
    milestone: 'v1.1.0'
  },

  {
    file: 'src/features/contacts/components/ContactsTable.original.tsx',
    lines: [261],
    title: 'Implement date-based sorting for contacts',
    description: `
## Problem
Date-based implementation for contact sorting is not complete.

## Current State
- TODO comment indicates missing implementation
- Advanced sorting not available
- User experience limitation

## Solution Required
- [ ] Implement created_at date sorting
- [ ] Add date range filters
- [ ] Add advanced sorting options
- [ ] Update table column headers
- [ ] Test performance with large datasets

## Priority
Low - User experience enhancement

## Files
- \`src/features/contacts/components/ContactsTable.original.tsx:261\`
    `,
    labels: ['technical-debt', 'enhancement', 'priority-low'],
    milestone: 'v1.1.0'
  },

  {
    file: '.eslintrc.cjs',
    lines: [25],
    title: 'Fix TypeScript type safety post-deployment',
    description: `
## Problem
TypeScript explicit any usage is currently set to warn instead of error.

## Current State
- \`@typescript-eslint/no-explicit-any\` is set to 'warn'
- Type safety is not fully enforced
- Potential runtime errors from any usage

## Solution Required
- [ ] Audit all \`any\` usage in codebase
- [ ] Replace \`any\` with proper types
- [ ] Change ESLint rule to 'error'
- [ ] Add pre-commit hooks for type safety
- [ ] Document type safety guidelines

## Priority
Medium - Code quality and runtime safety

## Files
- \`.eslintrc.cjs:25\`
    `,
    labels: ['technical-debt', 'type-safety', 'priority-medium'],
    milestone: 'v1.0.1'
  }
]

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
 * Create GitHub issues for technical debt items
 */
async function createGitHubIssues() {
  log('\n🚀 Creating GitHub issues for technical debt...', colors.cyan)

  const createdIssues = []

  for (const item of TECHNICAL_DEBT_ITEMS) {
    try {
      log(`📝 Creating issue: ${item.title}`)

      // Create the issue using GitHub CLI
      const command = [
        'gh', 'issue', 'create',
        '--title', `"${item.title}"`,
        '--body', `"${item.description}"`,
        '--label', item.labels.join(','),
        '--milestone', item.milestone
      ].join(' ')

      const result = execSync(command, { encoding: 'utf-8' })
      const issueUrl = result.trim()
      const issueNumber = issueUrl.split('/').pop()

      createdIssues.push({
        ...item,
        issueNumber,
        issueUrl
      })

      log(`✅ Created issue #${issueNumber}: ${issueUrl}`, colors.green)

    } catch (error) {
      log(`❌ Failed to create issue for ${item.title}: ${error.message}`, colors.red)
    }
  }

  // Update feature flags with issue numbers
  updateFeatureFlagsWithIssues(createdIssues)

  log(`\n🎉 Created ${createdIssues.length} GitHub issues for technical debt!`, colors.green)
  log('📋 Next steps:')
  log('  1. Review and prioritize issues in GitHub')
  log('  2. Assign team members to issues')
  log('  3. Add issues to project boards')
  log('  4. Schedule technical debt work in sprints')
}

/**
 * Update feature flags file with GitHub issue numbers
 */
function updateFeatureFlagsWithIssues(issues) {
  const featureFlagsPath = path.join(process.cwd(), CONFIG.featureFlagsPath)

  if (!fs.existsSync(featureFlagsPath)) {
    log('⚠️  Feature flags file not found, skipping issue number updates', colors.yellow)
    return
  }

  let content = fs.readFileSync(featureFlagsPath, 'utf-8')

  // Map issues to feature flags
  const flagIssueMap = {
    'Implement bulk operations for interactions': 'bulkOperations',
    'Implement proper XLSX export using SheetJS': 'xlsxExport',
    'Implement RPC contact creation function': 'rpcContactCreation',
    'Add stage tracking for opportunities': 'opportunityStageTracking',
    'Implement mark complete functionality for interactions': 'markInteractionComplete',
    'Implement date-based sorting for contacts': 'contactDateSorting'
  }

  issues.forEach(issue => {
    const flagKey = flagIssueMap[issue.title]
    if (flagKey) {
      content = content.replace(
        new RegExp(`(${flagKey}:[\\s\\S]*?githubIssue: )"#TBD"`),
        `$1"#${issue.issueNumber}"`
      )
    }
  })

  fs.writeFileSync(featureFlagsPath, content, 'utf-8')
  log('✅ Updated feature flags with GitHub issue numbers', colors.green)
}

/**
 * Main execution function
 */
async function main() {
  const action = process.argv[2] || 'audit'

  // Validate action parameter
  const validActions = ['audit', 'scan', 'report', 'validate', 'issues']
  if (!validActions.includes(action)) {
    log(`❌ Invalid action: ${action}`, colors.red)
    log(`📋 Valid actions: ${validActions.join(', ')}`, colors.cyan)
    process.exit(1)
  }

  log(`🚀 Technical Debt Monitor - ${action.toUpperCase()} mode`, colors.bright + colors.magenta)

  try {
    switch (action) {
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

      case 'issues':
        // Check if GitHub CLI is available
        try {
          execSync('gh --version', { stdio: 'ignore' })
          await createGitHubIssues()
        } catch (error) {
          log('❌ GitHub CLI not found. Please install gh CLI to create issues automatically.', colors.red)
          log('\n📋 Manual issue creation required:', colors.yellow)
          TECHNICAL_DEBT_ITEMS.forEach((item, index) => {
            log(`\n${index + 1}. ${item.title}`)
            log(`   File: ${item.file}:${item.lines.join(',')}`)
            log(`   Priority: ${item.labels.find(l => l.startsWith('priority-')) || 'N/A'}`)
            log(`   Milestone: ${item.milestone}`)
          })
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
  main().catch(error => {
    console.error(`❌ Unexpected error: ${error.message}`)
    process.exit(1)
  })
}