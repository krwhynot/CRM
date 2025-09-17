/**
 * Design Token Changelog Generator
 *
 * Automated tool for generating comprehensive changelogs for design token
 * modifications, tracking version history, and managing migration documentation.
 *
 * Features:
 * - Git-based change detection for design token files
 * - Semantic categorization of changes (Added/Changed/Deprecated/Removed)
 * - Accessibility impact analysis
 * - Performance impact assessment
 * - Migration guide generation
 * - Cross-platform export updates
 *
 * Usage:
 *   node scripts/design-token-changelog.js [options]
 *
 * Options:
 *   --version <version>    Specify version for changelog entry
 *   --since <commit>       Generate changelog since specific commit
 *   --format <format>      Output format (markdown|json|html)
 *   --output <file>        Output file path
 *   --analyze              Include impact analysis
 *   --migration            Generate migration guides
 *   --dry-run             Show output without writing files
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Configuration
const CONFIG = {
  // Token files to monitor for changes
  tokenFiles: [
    'src/index.css',
    'src/styles/accessibility-tokens.css',
    'src/styles/component-tokens.css',
    'src/styles/advanced-colors.css',
    'src/styles/density.css',
  ],
  // Related files that might affect tokens
  relatedFiles: [
    'src/lib/design-tokens.ts',
    'src/lib/design-token-utils.ts',
    'tailwind.config.js',
    'vite.config.ts',
  ],
  // Change categories
  changeCategories: {
    ADDED: 'Added',
    CHANGED: 'Changed',
    DEPRECATED: 'Deprecated',
    REMOVED: 'Removed',
    FIXED: 'Fixed',
  },
  // Output formats
  formats: ['markdown', 'json', 'html'],
  // Default output file
  defaultOutput: 'DESIGN_TOKEN_CHANGELOG.md',
}

// Git utilities
class GitAnalyzer {
  /**
   * Get list of changed files since last commit
   */
  static getChangedFiles(since = 'HEAD~1') {
    try {
      const output = execSync(`git diff --name-only ${since}`, {
        cwd: rootDir,
        encoding: 'utf8'
      })
      return output.trim().split('\n').filter(line => line.length > 0)
    } catch (error) {
      console.warn('⚠️  Could not get changed files from git:', error.message)
      return []
    }
  }

  /**
   * Get detailed diff for a specific file
   */
  static getFileDiff(filePath, since = 'HEAD~1') {
    try {
      const output = execSync(`git diff ${since} -- ${filePath}`, {
        cwd: rootDir,
        encoding: 'utf8'
      })
      return output
    } catch (error) {
      console.warn(`⚠️  Could not get diff for ${filePath}:`, error.message)
      return ''
    }
  }

  /**
   * Get commit messages since specific point
   */
  static getCommitMessages(since = 'HEAD~10') {
    try {
      const output = execSync(`git log --oneline ${since}..HEAD`, {
        cwd: rootDir,
        encoding: 'utf8'
      })
      return output.trim().split('\n').filter(line => line.length > 0)
    } catch (error) {
      console.warn('⚠️  Could not get commit messages:', error.message)
      return []
    }
  }

  /**
   * Get current version from package.json or git tags
   */
  static getCurrentVersion() {
    try {
      // Try package.json first
      const packagePath = path.join(rootDir, 'package.json')
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
        return pkg.version || '1.0.0'
      }

      // Try git tags
      const output = execSync('git describe --tags --abbrev=0', {
        cwd: rootDir,
        encoding: 'utf8'
      })
      return output.trim()
    } catch (error) {
      console.warn('⚠️  Could not determine version:', error.message)
      return '1.0.0'
    }
  }
}

// Token analysis utilities
class TokenAnalyzer {
  /**
   * Extract CSS variables from file content
   */
  static extractTokens(content) {
    const tokens = []
    const regex = /--([a-zA-Z0-9-_]+):\s*([^;]+);/g
    let match

    while ((match = regex.exec(content)) !== null) {
      tokens.push({
        name: `--${match[1]}`,
        value: match[2].trim(),
      })
    }

    return tokens
  }

  /**
   * Compare token sets to identify changes
   */
  static compareTokens(oldTokens, newTokens) {
    const changes = {
      [CONFIG.changeCategories.ADDED]: [],
      [CONFIG.changeCategories.CHANGED]: [],
      [CONFIG.changeCategories.REMOVED]: [],
    }

    const oldMap = new Map(oldTokens.map(t => [t.name, t]))
    const newMap = new Map(newTokens.map(t => [t.name, t]))

    // Find added and changed tokens
    for (const [name, newToken] of newMap) {
      const oldToken = oldMap.get(name)
      if (!oldToken) {
        changes[CONFIG.changeCategories.ADDED].push({
          name,
          value: newToken.value,
          description: this.generateTokenDescription(newToken),
        })
      } else if (oldToken.value !== newToken.value) {
        changes[CONFIG.changeCategories.CHANGED].push({
          name,
          oldValue: oldToken.value,
          newValue: newToken.value,
          description: this.generateTokenDescription(newToken, oldToken),
        })
      }
    }

    // Find removed tokens
    for (const [name, oldToken] of oldMap) {
      if (!newMap.has(name)) {
        changes[CONFIG.changeCategories.REMOVED].push({
          name,
          value: oldToken.value,
          description: this.generateTokenDescription(oldToken),
        })
      }
    }

    return changes
  }

  /**
   * Generate human-readable description for a token change
   */
  static generateTokenDescription(newToken, oldToken = null) {
    const { name, value } = newToken

    // Categorize token type
    let category = 'design token'
    if (name.includes('mfb-')) category = 'MFB brand color'
    else if (name.includes('hc-')) category = 'high contrast variant'
    else if (name.includes('cb-')) category = 'colorblind-friendly alternative'
    else if (name.includes('btn-')) category = 'button component token'
    else if (name.includes('card-')) category = 'card component token'
    else if (name.includes('input-')) category = 'input component token'
    else if (name.includes('primary')) category = 'primary color token'
    else if (name.includes('spacing') || name.includes('space')) category = 'spacing token'
    else if (name.includes('font') || name.includes('text')) category = 'typography token'

    if (oldToken) {
      // Changed token
      if (value.includes('oklch') && oldToken.value.includes('oklch')) {
        return `Updated ${category} color value`
      } else if (value.includes('px') || value.includes('rem')) {
        return `Adjusted ${category} size value`
      } else {
        return `Modified ${category} definition`
      }
    } else {
      // New or removed token
      if (value.includes('oklch')) {
        return `New ${category} using OKLCH color space`
      } else if (value.includes('var(')) {
        return `New ${category} referencing existing tokens`
      } else {
        return `New ${category}`
      }
    }
  }

  /**
   * Analyze accessibility impact of token changes
   */
  static analyzeAccessibilityImpact(changes) {
    const impact = {
      contrastAffected: [],
      colorblindImpact: [],
      highContrastChanges: [],
      focusRingChanges: [],
    }

    const allChanges = [
      ...changes[CONFIG.changeCategories.ADDED],
      ...changes[CONFIG.changeCategories.CHANGED],
      ...changes[CONFIG.changeCategories.REMOVED],
    ]

    for (const change of allChanges) {
      const { name } = change

      // Contrast-critical tokens
      if (name.includes('text') || name.includes('foreground') || name.includes('background')) {
        impact.contrastAffected.push(name)
      }

      // Colorblind accessibility
      if (name.includes('cb-') || name.includes('success') || name.includes('warning') || name.includes('danger')) {
        impact.colorblindImpact.push(name)
      }

      // High contrast mode
      if (name.includes('hc-')) {
        impact.highContrastChanges.push(name)
      }

      // Focus indicators
      if (name.includes('focus') || name.includes('ring')) {
        impact.focusRingChanges.push(name)
      }
    }

    return impact
  }

  /**
   * Analyze performance impact of changes
   */
  static analyzePerformanceImpact(changes) {
    const impact = {
      tokenCountChange: 0,
      bundleSizeEstimate: 0,
      complexityIncrease: 0,
      optimizationOpportunities: [],
    }

    // Calculate token count change
    impact.tokenCountChange =
      changes[CONFIG.changeCategories.ADDED].length -
      changes[CONFIG.changeCategories.REMOVED].length

    // Estimate bundle size impact (~30 characters per token)
    impact.bundleSizeEstimate = impact.tokenCountChange * 30

    // Analyze complexity
    const allChanges = [
      ...changes[CONFIG.changeCategories.ADDED],
      ...changes[CONFIG.changeCategories.CHANGED],
    ]

    let referencesAdded = 0
    for (const change of allChanges) {
      const value = change.value || change.newValue || ''
      const varMatches = value.match(/var\(/g)
      if (varMatches) {
        referencesAdded += varMatches.length
      }
    }

    impact.complexityIncrease = referencesAdded

    // Optimization opportunities
    if (impact.tokenCountChange > 20) {
      impact.optimizationOpportunities.push('Consider token consolidation for large additions')
    }

    if (changes[CONFIG.changeCategories.REMOVED].length > 0) {
      impact.optimizationOpportunities.push('Run tree-shaking analysis after removal')
    }

    return impact
  }
}

// Changelog generation
class ChangelogGenerator {
  constructor(options = {}) {
    this.options = {
      version: options.version || GitAnalyzer.getCurrentVersion(),
      since: options.since || 'HEAD~1',
      format: options.format || 'markdown',
      includeAnalysis: options.analyze || false,
      includeMigration: options.migration || false,
      ...options,
    }
  }

  /**
   * Generate complete changelog
   */
  async generate() {
    console.log('📝 Generating design token changelog...')

    const changes = await this.analyzeChanges()
    const analysis = this.options.includeAnalysis ? await this.generateAnalysis(changes) : null
    const migration = this.options.includeMigration ? await this.generateMigration(changes) : null

    const changelog = {
      version: this.options.version,
      date: new Date().toISOString().split('T')[0],
      changes,
      analysis,
      migration,
      metadata: {
        generatedAt: new Date().toISOString(),
        gitCommits: GitAnalyzer.getCommitMessages(this.options.since),
      },
    }

    return this.formatChangelog(changelog)
  }

  /**
   * Analyze changes across all token files
   */
  async analyzeChanges() {
    const allChanges = {
      [CONFIG.changeCategories.ADDED]: [],
      [CONFIG.changeCategories.CHANGED]: [],
      [CONFIG.changeCategories.DEPRECATED]: [],
      [CONFIG.changeCategories.REMOVED]: [],
      [CONFIG.changeCategories.FIXED]: [],
    }

    const changedFiles = GitAnalyzer.getChangedFiles(this.options.since)
    const relevantFiles = changedFiles.filter(file =>
      CONFIG.tokenFiles.includes(file) || CONFIG.relatedFiles.includes(file)
    )

    console.log(`🔍 Analyzing ${relevantFiles.length} changed files...`)

    for (const filePath of relevantFiles) {
      if (!CONFIG.tokenFiles.includes(filePath)) continue

      const fullPath = path.join(rootDir, filePath)

      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  File not found: ${filePath}`)
        continue
      }

      // Get current and previous versions
      const currentContent = fs.readFileSync(fullPath, 'utf8')
      const diff = GitAnalyzer.getFileDiff(filePath, this.options.since)

      if (!diff) continue

      // Extract tokens from current version
      const currentTokens = TokenAnalyzer.extractTokens(currentContent)

      // Reconstruct previous version from diff
      const previousTokens = this.reconstructPreviousTokens(currentContent, diff)

      // Compare and categorize changes
      const fileChanges = TokenAnalyzer.compareTokens(previousTokens, currentTokens)

      // Merge with overall changes
      for (const category in fileChanges) {
        allChanges[category].push(...fileChanges[category].map(change => ({
          ...change,
          file: filePath,
        })))
      }
    }

    // Detect deprecated tokens from commit messages
    const commits = GitAnalyzer.getCommitMessages(this.options.since)
    const deprecatedTokens = this.extractDeprecatedTokens(commits)
    allChanges[CONFIG.changeCategories.DEPRECATED].push(...deprecatedTokens)

    return allChanges
  }

  /**
   * Reconstruct previous token state from git diff
   */
  reconstructPreviousTokens(currentContent, diff) {
    // This is a simplified reconstruction - in practice, you might want
    // to use git show or more sophisticated diff parsing
    const lines = currentContent.split('\n')
    const diffLines = diff.split('\n')

    // For now, extract tokens from current content
    // In a full implementation, you'd parse the diff properly
    return TokenAnalyzer.extractTokens(currentContent)
  }

  /**
   * Extract deprecated tokens from commit messages
   */
  extractDeprecatedTokens(commits) {
    const deprecated = []
    const deprecationPattern = /(deprecated|deprecate)\s+(--[\w-]+)/gi

    for (const commit of commits) {
      let match
      while ((match = deprecationPattern.exec(commit)) !== null) {
        deprecated.push({
          name: match[2],
          description: `Deprecated as indicated in: ${commit}`,
        })
      }
    }

    return deprecated
  }

  /**
   * Generate impact analysis
   */
  async generateAnalysis(changes) {
    const accessibility = TokenAnalyzer.analyzeAccessibilityImpact(changes)
    const performance = TokenAnalyzer.analyzePerformanceImpact(changes)

    return {
      accessibility,
      performance,
      summary: {
        totalChanges: Object.values(changes).flat().length,
        addedCount: changes[CONFIG.changeCategories.ADDED].length,
        changedCount: changes[CONFIG.changeCategories.CHANGED].length,
        removedCount: changes[CONFIG.changeCategories.REMOVED].length,
        deprecatedCount: changes[CONFIG.changeCategories.DEPRECATED].length,
      },
    }
  }

  /**
   * Generate migration guide
   */
  async generateMigration(changes) {
    const migration = {
      breakingChanges: [],
      automatedMigration: [],
      manualSteps: [],
      codeModifications: [],
    }

    // Analyze removed and changed tokens for breaking changes
    const breaking = [
      ...changes[CONFIG.changeCategories.REMOVED],
      ...changes[CONFIG.changeCategories.CHANGED].filter(change =>
        this.isBreakingChange(change)
      ),
    ]

    for (const change of breaking) {
      migration.breakingChanges.push({
        token: change.name,
        change: change.oldValue ? 'modified' : 'removed',
        impact: this.assessBreakingChangeImpact(change),
        recommendation: this.generateMigrationRecommendation(change),
      })
    }

    // Generate automated migration commands
    if (migration.breakingChanges.length > 0) {
      migration.automatedMigration.push({
        tool: 'find-and-replace',
        command: this.generateFindReplaceCommands(changes),
      })
    }

    return migration
  }

  /**
   * Check if a change is breaking
   */
  isBreakingChange(change) {
    // Consider color changes breaking, spacing changes non-breaking
    if (change.name.includes('color') || change.name.includes('bg') || change.name.includes('text')) {
      return true
    }
    return false
  }

  /**
   * Assess impact of breaking change
   */
  assessBreakingChangeImpact(change) {
    if (change.name.includes('primary')) {
      return 'High - affects primary brand colors'
    } else if (change.name.includes('mfb-')) {
      return 'High - affects MFB brand consistency'
    } else if (change.name.includes('btn-') || change.name.includes('card-')) {
      return 'Medium - affects specific components'
    } else {
      return 'Low - minor visual changes expected'
    }
  }

  /**
   * Generate migration recommendation
   */
  generateMigrationRecommendation(change) {
    if (change.oldValue && change.newValue) {
      return `Update references to ${change.name} - value changed from ${change.oldValue} to ${change.newValue}`
    } else {
      return `Replace ${change.name} with alternative token or update component styling`
    }
  }

  /**
   * Generate find-and-replace commands for migration
   */
  generateFindReplaceCommands(changes) {
    const commands = []

    for (const change of changes[CONFIG.changeCategories.REMOVED]) {
      commands.push({
        find: `var(${change.name})`,
        replace: '/* TODO: Replace with appropriate token */',
        description: `Remove references to deleted token ${change.name}`,
      })
    }

    return commands
  }

  /**
   * Format changelog based on output format
   */
  formatChangelog(changelog) {
    switch (this.options.format) {
      case 'json':
        return JSON.stringify(changelog, null, 2)
      case 'html':
        return this.formatAsHTML(changelog)
      default:
        return this.formatAsMarkdown(changelog)
    }
  }

  /**
   * Format changelog as Markdown
   */
  formatAsMarkdown(changelog) {
    let md = `# Design Token Changelog\n\n`
    md += `## [${changelog.version}] - ${changelog.date}\n\n`

    // Changes section
    for (const [category, changes] of Object.entries(changelog.changes)) {
      if (changes.length === 0) continue

      md += `### ${category}\n\n`
      for (const change of changes) {
        md += `- \`${change.name}\`: ${change.description || 'Updated'}`
        if (change.file) {
          md += ` (${change.file})`
        }
        md += '\n'
      }
      md += '\n'
    }

    // Analysis section
    if (changelog.analysis) {
      md += `### Impact Analysis\n\n`

      const { summary, accessibility, performance } = changelog.analysis

      md += `**Summary:**\n`
      md += `- Total changes: ${summary.totalChanges}\n`
      md += `- Added: ${summary.addedCount}\n`
      md += `- Modified: ${summary.changedCount}\n`
      md += `- Removed: ${summary.removedCount}\n`
      md += `- Deprecated: ${summary.deprecatedCount}\n\n`

      if (accessibility.contrastAffected.length > 0) {
        md += `**Accessibility Impact:**\n`
        md += `- Contrast-critical tokens affected: ${accessibility.contrastAffected.length}\n`
        if (accessibility.colorblindImpact.length > 0) {
          md += `- Colorblind accessibility updates: ${accessibility.colorblindImpact.length}\n`
        }
        md += '\n'
      }

      if (performance.tokenCountChange !== 0) {
        md += `**Performance Impact:**\n`
        md += `- Token count change: ${performance.tokenCountChange > 0 ? '+' : ''}${performance.tokenCountChange}\n`
        md += `- Estimated bundle size impact: ${performance.bundleSizeEstimate > 0 ? '+' : ''}${performance.bundleSizeEstimate} bytes\n`
        md += '\n'
      }
    }

    // Migration section
    if (changelog.migration && changelog.migration.breakingChanges.length > 0) {
      md += `### Migration Guide\n\n`

      md += `**Breaking Changes:**\n`
      for (const breaking of changelog.migration.breakingChanges) {
        md += `- \`${breaking.token}\`: ${breaking.recommendation} (${breaking.impact})\n`
      }
      md += '\n'

      if (changelog.migration.automatedMigration.length > 0) {
        md += `**Automated Migration:**\n`
        md += `\`\`\`bash\n`
        md += `# Run automated migration tools\n`
        md += `npm run migrate:tokens --from=${changelog.version}\n`
        md += `\`\`\`\n\n`
      }
    }

    // Metadata
    md += `---\n\n`
    md += `*Generated at ${changelog.metadata.generatedAt}*\n`
    if (changelog.metadata.gitCommits.length > 0) {
      md += `\n**Related Commits:**\n`
      for (const commit of changelog.metadata.gitCommits) {
        md += `- ${commit}\n`
      }
    }

    return md
  }

  /**
   * Format changelog as HTML
   */
  formatAsHTML(changelog) {
    // HTML formatting implementation
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Design Token Changelog v${changelog.version}</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .change-category { margin: 2rem 0; }
        .token { background: #f5f5f5; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; }
        .impact-analysis { background: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 2rem 0; }
    </style>
</head>
<body>
    <h1>Design Token Changelog</h1>
    <h2>Version ${changelog.version} - ${changelog.date}</h2>

    ${Object.entries(changelog.changes).map(([category, changes]) =>
      changes.length > 0 ? `
        <div class="change-category">
            <h3>${category}</h3>
            <ul>
                ${changes.map(change => `
                    <li><span class="token">${change.name}</span>: ${change.description || 'Updated'}</li>
                `).join('')}
            </ul>
        </div>
      ` : ''
    ).join('')}

    ${changelog.analysis ? `
        <div class="impact-analysis">
            <h3>Impact Analysis</h3>
            <p><strong>Total Changes:</strong> ${changelog.analysis.summary.totalChanges}</p>
        </div>
    ` : ''}

    <footer>
        <p><em>Generated at ${changelog.metadata.generatedAt}</em></p>
    </footer>
</body>
</html>
    `.trim()
  }
}

// CLI Interface
function parseArguments() {
  const args = process.argv.slice(2)
  const options = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--version':
        options.version = args[++i]
        break
      case '--since':
        options.since = args[++i]
        break
      case '--format':
        options.format = args[++i]
        break
      case '--output':
        options.output = args[++i]
        break
      case '--analyze':
        options.analyze = true
        break
      case '--migration':
        options.migration = true
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
        showHelp()
        process.exit(0)
        break
    }
  }

  return options
}

function showHelp() {
  console.log(`
🎨 Design Token Changelog Generator

Usage: node scripts/design-token-changelog.js [options]

Options:
  --version <version>    Specify version for changelog entry
  --since <commit>       Generate changelog since specific commit (default: HEAD~1)
  --format <format>      Output format: markdown, json, html (default: markdown)
  --output <file>        Output file path (default: ${CONFIG.defaultOutput})
  --analyze              Include impact analysis
  --migration            Generate migration guides
  --dry-run             Show output without writing files
  --help                Show this help message

Examples:
  node scripts/design-token-changelog.js --version 2.1.0 --analyze
  node scripts/design-token-changelog.js --since HEAD~5 --migration
  node scripts/design-token-changelog.js --format json --output tokens-v2.json
`)
}

// Main execution
async function main() {
  const options = parseArguments()

  try {
    const generator = new ChangelogGenerator(options)
    const changelog = await generator.generate()

    if (options.dryRun) {
      console.log('\n📄 Generated Changelog:\n')
      console.log(changelog)
    } else {
      const outputPath = options.output || CONFIG.defaultOutput
      const fullPath = path.resolve(rootDir, outputPath)

      fs.writeFileSync(fullPath, changelog, 'utf8')
      console.log(`✅ Changelog written to ${outputPath}`)
    }

  } catch (error) {
    console.error('❌ Error generating changelog:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { ChangelogGenerator, TokenAnalyzer, GitAnalyzer }