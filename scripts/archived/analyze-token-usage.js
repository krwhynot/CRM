#!/usr/bin/env node

/**
 * CSS Design Token Usage Analysis
 *
 * Analyzes CSS custom property usage across the codebase to identify:
 * - Unused tokens (orphaned definitions)
 * - Most frequently used tokens (critical tokens)
 * - Token dependency chains
 * - Duplicate definitions
 *
 * Part of the Design Tokens Architecture optimization initiative.
 * Target: 25% reduction in CSS bundle size through duplicate elimination
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TokenUsageAnalyzer {
  constructor() {
    this.tokens = new Map(); // token name -> definition info
    this.usages = new Map(); // token name -> usage locations
    this.duplicates = new Map(); // value -> token names array
    this.dependencies = new Map(); // token -> tokens it references
    this.criticalTokens = new Set();
    this.orphanedTokens = new Set();
    this.stats = {
      totalTokens: 0,
      usedTokens: 0,
      unusedTokens: 0,
      duplicateGroups: 0,
      totalDuplicates: 0,
      criticalCount: 0
    };
  }

  /**
   * Main analysis entry point
   */
  async analyze() {
    console.log('🔍 Starting CSS token usage analysis...\n');

    try {
      await this.scanTokenDefinitions();
      await this.scanTokenUsages();
      this.analyzeTokenDependencies();
      this.identifyDuplicates();
      this.identifyCriticalTokens();
      this.identifyOrphanedTokens();
      this.generateReport();

      console.log('✅ Token analysis completed successfully!\n');
      return this.getResults();
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Scan all CSS files for token definitions
   */
  async scanTokenDefinitions() {
    console.log('📊 Scanning token definitions...');

    const cssFiles = this.getAllCSSFiles();
    let tokenCount = 0;

    for (const filePath of cssFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = this.extractTokenDefinitions(content, filePath);

      tokens.forEach(token => {
        if (this.tokens.has(token.name)) {
          // Track duplicate definitions
          const existing = this.tokens.get(token.name);
          existing.duplicates = existing.duplicates || [];
          existing.duplicates.push(token);
        } else {
          this.tokens.set(token.name, token);
          tokenCount++;
        }
      });
    }

    this.stats.totalTokens = tokenCount;
    console.log(`   Found ${tokenCount} unique token definitions`);
  }

  /**
   * Scan all files for token usage
   */
  async scanTokenUsages() {
    console.log('🔎 Scanning token usages...');

    const allFiles = this.getAllSourceFiles();
    let usageCount = 0;

    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const usages = this.extractTokenUsages(content, filePath);

      usages.forEach(usage => {
        if (!this.usages.has(usage.token)) {
          this.usages.set(usage.token, []);
        }
        this.usages.get(usage.token).push({
          file: filePath,
          line: usage.line,
          context: usage.context
        });
        usageCount++;
      });
    }

    console.log(`   Found ${usageCount} token usages across ${allFiles.length} files`);
  }

  /**
   * Extract token definitions from CSS content
   */
  extractTokenDefinitions(content, filePath) {
    const tokens = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Match CSS custom property definitions: --token-name: value;
      const match = line.match(/^\s*(--.+?):\s*(.+?);/);
      if (match) {
        const [, name, value] = match;
        tokens.push({
          name: name.trim(),
          value: value.trim(),
          file: filePath,
          line: index + 1,
          originalLine: line.trim()
        });
      }
    });

    return tokens;
  }

  /**
   * Extract token usages from file content
   */
  extractTokenUsages(content, filePath) {
    const usages = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Match var(--token-name) usages
      const varMatches = line.matchAll(/var\((--[^,)]+)/g);
      for (const match of varMatches) {
        usages.push({
          token: match[1],
          line: index + 1,
          context: line.trim()
        });
      }

      // Match direct custom property references in selectors
      const directMatches = line.matchAll(/(--[a-zA-Z0-9-_]+)/g);
      for (const match of directMatches) {
        // Only include if it's not a definition (doesn't have colon after)
        if (!line.includes(match[1] + ':')) {
          usages.push({
            token: match[1],
            line: index + 1,
            context: line.trim()
          });
        }
      }
    });

    return usages;
  }

  /**
   * Analyze token dependency chains
   */
  analyzeTokenDependencies() {
    console.log('🔗 Analyzing token dependencies...');

    this.tokens.forEach((token, name) => {
      const dependencies = [];

      // Find var() references in token value
      const varMatches = token.value.matchAll(/var\((--[^,)]+)/g);
      for (const match of varMatches) {
        dependencies.push(match[1]);
      }

      if (dependencies.length > 0) {
        this.dependencies.set(name, dependencies);
      }
    });

    console.log(`   Found ${this.dependencies.size} tokens with dependencies`);
  }

  /**
   * Identify duplicate token values
   */
  identifyDuplicates() {
    console.log('🔍 Identifying duplicate values...');

    this.tokens.forEach((token, name) => {
      // Normalize value for comparison (remove whitespace, comments)
      const normalizedValue = token.value.replace(/\s+/g, ' ').trim();

      if (!this.duplicates.has(normalizedValue)) {
        this.duplicates.set(normalizedValue, []);
      }
      this.duplicates.get(normalizedValue).push(name);
    });

    // Filter to only actual duplicates (more than one token with same value)
    const duplicateGroups = new Map();
    this.duplicates.forEach((tokens, value) => {
      if (tokens.length > 1) {
        duplicateGroups.set(value, tokens);
        this.stats.totalDuplicates += tokens.length - 1; // -1 because one is the original
      }
    });

    this.duplicates = duplicateGroups;
    this.stats.duplicateGroups = duplicateGroups.size;

    console.log(`   Found ${this.stats.duplicateGroups} groups of duplicate values`);
    console.log(`   Total duplicate tokens: ${this.stats.totalDuplicates}`);
  }

  /**
   * Identify critical tokens (frequently used or in critical path)
   */
  identifyCriticalTokens() {
    console.log('⭐ Identifying critical tokens...');

    // Critical based on usage frequency
    this.usages.forEach((usageList, tokenName) => {
      if (usageList.length >= 5) { // Used 5+ times
        this.criticalTokens.add(tokenName);
      }
    });

    // Critical based on being referenced by other tokens
    const referencedTokens = new Set();
    this.dependencies.forEach(deps => {
      deps.forEach(dep => referencedTokens.add(dep));
    });

    referencedTokens.forEach(token => {
      this.criticalTokens.add(token);
    });

    // Critical based on known important patterns
    const criticalPatterns = [
      /^--primary/,
      /^--mfb-/,
      /^--background/,
      /^--foreground/,
      /^--font-/,
      /^--spacing-/,
      /^--border/,
      /^--radius/
    ];

    this.tokens.forEach((token, name) => {
      if (criticalPatterns.some(pattern => pattern.test(name))) {
        this.criticalTokens.add(name);
      }
    });

    this.stats.criticalCount = this.criticalTokens.size;
    console.log(`   Identified ${this.stats.criticalCount} critical tokens`);
  }

  /**
   * Identify orphaned tokens (defined but never used)
   */
  identifyOrphanedTokens() {
    console.log('🏚️  Identifying orphaned tokens...');

    this.tokens.forEach((token, name) => {
      if (!this.usages.has(name)) {
        this.orphanedTokens.add(name);
      }
    });

    this.stats.unusedTokens = this.orphanedTokens.size;
    this.stats.usedTokens = this.stats.totalTokens - this.stats.unusedTokens;

    console.log(`   Found ${this.stats.unusedTokens} orphaned tokens`);
  }

  /**
   * Generate comprehensive analysis report
   */
  generateReport() {
    const reportPath = path.join(process.cwd(), 'dist', 'token-analysis-report.json');
    const htmlReportPath = path.join(process.cwd(), 'dist', 'token-analysis-report.html');

    // Ensure dist directory exists
    const distDir = path.dirname(reportPath);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      criticalTokens: Array.from(this.criticalTokens),
      orphanedTokens: Array.from(this.orphanedTokens),
      duplicateGroups: Object.fromEntries(this.duplicates),
      tokenDetails: this.getTokenDetails(),
      recommendations: this.generateRecommendations()
    };

    // Write JSON report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Write HTML report
    this.generateHTMLReport(report, htmlReportPath);

    console.log(`📋 Reports generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
  }

  /**
   * Get detailed token information
   */
  getTokenDetails() {
    const details = {};

    this.tokens.forEach((token, name) => {
      details[name] = {
        ...token,
        usageCount: this.usages.has(name) ? this.usages.get(name).length : 0,
        isCritical: this.criticalTokens.has(name),
        isOrphaned: this.orphanedTokens.has(name),
        dependencies: this.dependencies.get(name) || []
      };
    });

    return details;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.stats.unusedTokens > 0) {
      recommendations.push({
        type: 'remove-orphaned',
        priority: 'high',
        impact: `Remove ${this.stats.unusedTokens} unused tokens`,
        description: 'These tokens are defined but never used and can be safely removed',
        tokens: Array.from(this.orphanedTokens)
      });
    }

    if (this.stats.duplicateGroups > 0) {
      recommendations.push({
        type: 'consolidate-duplicates',
        priority: 'high',
        impact: `Consolidate ${this.stats.totalDuplicates} duplicate token definitions`,
        description: 'Multiple tokens have identical values and should be consolidated',
        groups: Object.fromEntries(this.duplicates)
      });
    }

    if (this.stats.criticalCount > 0) {
      recommendations.push({
        type: 'inline-critical',
        priority: 'medium',
        impact: `Inline ${this.stats.criticalCount} critical tokens for better performance`,
        description: 'These tokens are used frequently and should be inlined for faster initial paint',
        tokens: Array.from(this.criticalTokens)
      });
    }

    return recommendations;
  }

  /**
   * Generate HTML report for better visualization
   */
  generateHTMLReport(report, htmlPath) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Token Analysis Report</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #28a745; }
        .section { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .token-list { background: white; padding: 10px; border-radius: 4px; font-family: monospace; max-height: 300px; overflow-y: auto; }
        .critical { color: #dc3545; font-weight: bold; }
        .success { color: #28a745; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        h1, h2, h3 { color: #333; }
        .recommendation { background: #e9ecef; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CSS Token Analysis Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Analysis of CSS custom properties usage and optimization opportunities</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${report.stats.totalTokens}</div>
            <div>Total Tokens</div>
        </div>
        <div class="stat-card">
            <div class="stat-number success">${report.stats.usedTokens}</div>
            <div>Used Tokens</div>
        </div>
        <div class="stat-card">
            <div class="stat-number critical">${report.stats.unusedTokens}</div>
            <div>Unused Tokens</div>
        </div>
        <div class="stat-card">
            <div class="stat-number warning">${report.stats.duplicateGroups}</div>
            <div>Duplicate Groups</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${report.stats.criticalCount}</div>
            <div>Critical Tokens</div>
        </div>
    </div>

    <div class="section">
        <h2>🎯 Optimization Recommendations</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation">
                <h3>${rec.type.replace('-', ' ').toUpperCase()} (${rec.priority.toUpperCase()} PRIORITY)</h3>
                <p><strong>Impact:</strong> ${rec.impact}</p>
                <p>${rec.description}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🏚️ Orphaned Tokens (${report.orphanedTokens.length})</h2>
        <div class="token-list">
            ${report.orphanedTokens.map(token => `<div>${token}</div>`).join('')}
        </div>
    </div>

    <div class="section">
        <h2>⭐ Critical Tokens (${report.criticalTokens.length})</h2>
        <div class="token-list">
            ${report.criticalTokens.map(token => `<div>${token}</div>`).join('')}
        </div>
    </div>

    <div class="section">
        <h2>🔍 Duplicate Value Groups (${report.stats.duplicateGroups})</h2>
        ${Object.entries(report.duplicateGroups).map(([value, tokens]) => `
            <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                <strong>Value:</strong> <code>${value}</code><br>
                <strong>Tokens:</strong> ${tokens.join(', ')}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    fs.writeFileSync(htmlPath, html);
  }

  /**
   * Get all CSS files in the project
   */
  getAllCSSFiles() {
    const cssFiles = [];
    const srcDir = path.join(process.cwd(), 'src');

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.css')) {
          cssFiles.push(fullPath);
        }
      }
    };

    scanDirectory(srcDir);
    return cssFiles;
  }

  /**
   * Get all source files (CSS, JSX, TSX) for usage analysis
   */
  getAllSourceFiles() {
    const sourceFiles = [];
    const srcDir = path.join(process.cwd(), 'src');
    const extensions = ['.css', '.tsx', '.jsx', '.ts', '.js'];

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          sourceFiles.push(fullPath);
        }
      }
    };

    scanDirectory(srcDir);
    return sourceFiles;
  }

  /**
   * Get analysis results
   */
  getResults() {
    return {
      stats: this.stats,
      criticalTokens: Array.from(this.criticalTokens),
      orphanedTokens: Array.from(this.orphanedTokens),
      duplicates: this.duplicates,
      tokens: this.tokens,
      usages: this.usages
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new TokenUsageAnalyzer();

  analyzer.analyze()
    .then(results => {
      console.log('\n📈 Analysis Summary:');
      console.log(`   Total tokens: ${results.stats.totalTokens}`);
      console.log(`   Used tokens: ${results.stats.usedTokens}`);
      console.log(`   Unused tokens: ${results.stats.unusedTokens}`);
      console.log(`   Critical tokens: ${results.stats.criticalCount}`);
      console.log(`   Duplicate groups: ${results.stats.duplicateGroups}`);

      if (results.stats.unusedTokens > 0) {
        console.log(`\n🎯 Optimization potential:`);
        console.log(`   Remove ${results.stats.unusedTokens} unused tokens`);
        console.log(`   Consolidate ${results.stats.totalDuplicates} duplicate definitions`);
        console.log(`   Estimated CSS size reduction: ~${Math.round((results.stats.unusedTokens + results.stats.totalDuplicates) / results.stats.totalTokens * 100)}%`);
      }
    })
    .catch(error => {
      console.error('Analysis failed:', error);
      process.exit(1);
    });
}

export { TokenUsageAnalyzer };