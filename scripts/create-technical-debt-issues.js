#!/usr/bin/env node

/**
 * Script to create GitHub issues for technical debt tracked in TODO comments
 * Run with: node scripts/create-technical-debt-issues.js
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Technical debt items found in the codebase
const technicalDebtItems = [
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
 * Create GitHub issues using GitHub CLI
 */
async function createGitHubIssues() {
  console.log('🚀 Creating GitHub issues for technical debt...\n')
  
  const createdIssues = []
  
  for (const item of technicalDebtItems) {
    try {
      console.log(`📝 Creating issue: ${item.title}`)
      
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
      
      console.log(`✅ Created issue #${issueNumber}: ${issueUrl}`)
      
    } catch (error) {
      console.error(`❌ Failed to create issue for ${item.title}:`, error.message)
    }
  }
  
  // Update feature flags with issue numbers
  updateFeatureFlagsWithIssues(createdIssues)
  
  console.log(`\n🎉 Created ${createdIssues.length} GitHub issues for technical debt!`)
  console.log('📋 Next steps:')
  console.log('  1. Review and prioritize issues in GitHub')
  console.log('  2. Assign team members to issues')
  console.log('  3. Add issues to project boards')
  console.log('  4. Schedule technical debt work in sprints')
}

/**
 * Update feature flags file with GitHub issue numbers
 */
function updateFeatureFlagsWithIssues(issues) {
  const featureFlagsPath = path.join(process.cwd(), 'src/lib/feature-flags.ts')
  
  if (!fs.existsSync(featureFlagsPath)) {
    console.warn('⚠️  Feature flags file not found, skipping issue number updates')
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
  console.log('✅ Updated feature flags with GitHub issue numbers')
}

// Check if GitHub CLI is available
try {
  execSync('gh --version', { stdio: 'ignore' })
  createGitHubIssues()
} catch (error) {
  console.error('❌ GitHub CLI not found. Please install gh CLI to create issues automatically.')
  console.log('\n📋 Manual issue creation required:')
  technicalDebtItems.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.title}`)
    console.log(`   File: ${item.file}:${item.lines.join(',')}`)
    console.log(`   Priority: ${item.labels.find(l => l.startsWith('priority-')) || 'N/A'}`)
    console.log(`   Milestone: ${item.milestone}`)
  })
}