#!/usr/bin/env node

/**
 * CSS Design Token Tree-Shaking and Optimization
 *
 * Implements CSS variable tree-shaking to remove unused tokens in production builds.
 * Performs critical token inlining for faster initial paint and duplicate elimination.
 *
 * Features:
 * - Remove unused CSS custom properties
 * - Inline critical tokens for faster initial paint
 * - Eliminate duplicate token definitions
 * - Generate optimized token files for production
 *
 * Target: 25% reduction in CSS bundle size through optimization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TokenUsageAnalyzer } from './analyze-token-usage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CSSTokenOptimizer {
  constructor(options = {}) {
    this.options = {
      analyzeUsage: true,
      removeDuplicates: true,
      inlineCritical: true,
      generateSeparateFiles: true,
      outputDir: 'dist',
      ...options
    };

    this.analyzer = new TokenUsageAnalyzer();
    this.analysisResults = null;
    this.stats = {
      originalTokens: 0,
      optimizedTokens: 0,
      removedTokens: 0,
      inlinedTokens: 0,
      duplicatesRemoved: 0,
      sizeBefore: 0,
      sizeAfter: 0,
      reductionPercent: 0
    };
  }

  /**
   * Main optimization process
   */
  async optimize() {
    console.log('🚀 Starting CSS token optimization...\n');

    try {
      // Step 1: Analyze current token usage
      if (this.options.analyzeUsage) {
        console.log('📊 Running token usage analysis...');
        this.analysisResults = await this.analyzer.analyze();
        this.stats.originalTokens = this.analysisResults.stats.totalTokens;
      }

      // Step 2: Generate optimized token files
      await this.generateOptimizedFiles();

      // Step 3: Generate critical tokens for inlining
      if (this.options.inlineCritical) {
        await this.generateCriticalTokens();
      }

      // Step 4: Generate production-ready token files
      if (this.options.generateSeparateFiles) {
        await this.generateProductionFiles();
      }

      // Step 5: Calculate and report optimization results
      this.calculateOptimizationResults();
      this.generateOptimizationReport();

      console.log('\n✅ CSS token optimization completed successfully!');
      return this.stats;

    } catch (error) {
      console.error('❌ Optimization failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate optimized CSS files with tree-shaking applied
   */
  async generateOptimizedFiles() {
    console.log('🌳 Generating tree-shaken token files...');

    const outputDir = path.join(process.cwd(), this.options.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const cssFiles = this.getAllCSSFiles();
    let totalSizeBefore = 0;
    let totalSizeAfter = 0;

    for (const filePath of cssFiles) {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      totalSizeBefore += originalContent.length;

      const optimizedContent = await this.optimizeFile(originalContent, filePath);
      totalSizeAfter += optimizedContent.length;

      // Generate optimized version
      const relativePath = path.relative(path.join(process.cwd(), 'src'), filePath);
      const outputPath = path.join(outputDir, 'optimized-' + path.basename(filePath));

      fs.writeFileSync(outputPath, optimizedContent);

      const reduction = Math.round((1 - optimizedContent.length / originalContent.length) * 100);
      console.log(`   ✓ ${path.basename(filePath)}: ${reduction}% size reduction`);
    }

    this.stats.sizeBefore = totalSizeBefore;
    this.stats.sizeAfter = totalSizeAfter;
    this.stats.reductionPercent = Math.round((1 - totalSizeAfter / totalSizeBefore) * 100);
  }

  /**
   * Optimize individual CSS file content
   */
  async optimizeFile(content, filePath) {
    const lines = content.split('\n');
    const optimizedLines = [];
    const removedTokens = [];
    const processedTokens = new Set();

    for (const line of lines) {
      const tokenMatch = line.match(/^\s*(--.+?):\s*(.+?);/);

      if (tokenMatch) {
        const [, tokenName, tokenValue] = tokenMatch;
        const cleanTokenName = tokenName.trim();

        // Skip if already processed (duplicate)
        if (processedTokens.has(cleanTokenName)) {
          this.stats.duplicatesRemoved++;
          continue;
        }

        // Skip if token is unused (orphaned)
        if (this.analysisResults && this.analysisResults.orphanedTokens.includes(cleanTokenName)) {
          removedTokens.push(cleanTokenName);
          this.stats.removedTokens++;
          continue;
        }

        processedTokens.add(cleanTokenName);
        optimizedLines.push(line);
      } else {
        // Keep non-token lines as-is
        optimizedLines.push(line);
      }
    }

    // Add optimization header comment
    const header = this.generateOptimizationHeader(filePath, removedTokens);

    this.stats.optimizedTokens = processedTokens.size;

    return header + optimizedLines.join('\n');
  }

  /**
   * Generate critical tokens file for inlining
   */
  async generateCriticalTokens() {
    console.log('⚡ Generating critical tokens for inlining...');

    if (!this.analysisResults) {
      console.log('   ⚠️  Skipping critical token generation (no analysis results)');
      return;
    }

    const criticalTokens = this.analysisResults.criticalTokens;
    const criticalCSS = this.generateCriticalCSS(criticalTokens);

    const outputPath = path.join(process.cwd(), this.options.outputDir, 'critical-tokens.css');
    fs.writeFileSync(outputPath, criticalCSS);

    this.stats.inlinedTokens = criticalTokens.length;
    console.log(`   ✓ Generated critical tokens file with ${criticalTokens.length} tokens`);
  }

  /**
   * Generate critical CSS content from token list
   */
  generateCriticalCSS(criticalTokens) {
    const criticalDefinitions = [];

    // Get token definitions for critical tokens
    this.analysisResults.tokens.forEach((token, name) => {
      if (criticalTokens.includes(name)) {
        criticalDefinitions.push(`  ${name}: ${token.value};`);
      }
    });

    return `/* Critical Design Tokens - Auto-generated for inlining */
/* Generated: ${new Date().toISOString()} */
/* Critical tokens inlined for faster initial paint */

:root {
${criticalDefinitions.join('\n')}
}`;
  }

  /**
   * Generate production-ready token files
   */
  async generateProductionFiles() {
    console.log('📦 Generating production token files...');

    const outputDir = path.join(process.cwd(), this.options.outputDir);

    // Generate consolidated tokens file
    await this.generateConsolidatedTokens(outputDir);

    // Generate layer-separated files
    await this.generateLayeredTokens(outputDir);

    console.log('   ✓ Production files generated');
  }

  /**
   * Generate consolidated tokens file for production
   */
  async generateConsolidatedTokens(outputDir) {
    const allTokens = new Map();
    const cssFiles = this.getAllCSSFiles();

    // Collect all used tokens
    for (const filePath of cssFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = this.extractTokenDefinitions(content);

      tokens.forEach(token => {
        // Only include tokens that are used
        if (!this.analysisResults || !this.analysisResults.orphanedTokens.includes(token.name)) {
          if (!allTokens.has(token.name)) {
            allTokens.set(token.name, token);
          }
        }
      });
    }

    // Generate consolidated CSS
    const consolidatedCSS = this.generateConsolidatedCSS(allTokens);
    const outputPath = path.join(outputDir, 'consolidated-tokens.css');

    fs.writeFileSync(outputPath, consolidatedCSS);
  }

  /**
   * Generate layer-separated token files
   */
  async generateLayeredTokens(outputDir) {
    const layers = {
      primitives: new Map(),
      semantic: new Map(),
      components: new Map(),
      features: new Map()
    };

    // Categorize tokens by layer
    this.analysisResults.tokens.forEach((token, name) => {
      if (this.analysisResults.orphanedTokens.includes(name)) return;

      const layer = this.categorizeToken(name);
      if (layers[layer]) {
        layers[layer].set(name, token);
      }
    });

    // Generate files for each layer
    for (const [layerName, tokens] of Object.entries(layers)) {
      if (tokens.size > 0) {
        const layerCSS = this.generateLayerCSS(layerName, tokens);
        const outputPath = path.join(outputDir, `${layerName}-tokens.css`);
        fs.writeFileSync(outputPath, layerCSS);
      }
    }
  }

  /**
   * Categorize token into appropriate layer
   */
  categorizeToken(tokenName) {
    // Primitive layer patterns
    if (/^--(mfb-|color-|font-|space-|radius-|shadow-)/.test(tokenName)) {
      return 'primitives';
    }

    // Semantic layer patterns
    if (/^--(primary|secondary|success|warning|danger|info|background|foreground)/.test(tokenName)) {
      return 'semantic';
    }

    // Component layer patterns
    if (/^--(btn-|card-|dialog-|input-|nav-|table-)/.test(tokenName)) {
      return 'components';
    }

    // Feature layer patterns
    if (/^--(density-|a11y-|hc-|mobile-)/.test(tokenName)) {
      return 'features';
    }

    return 'primitives'; // default fallback
  }

  /**
   * Generate consolidated CSS content
   */
  generateConsolidatedCSS(tokens) {
    const header = `/* Consolidated Design Tokens - Production Optimized */
/* Generated: ${new Date().toISOString()} */
/* Tree-shaken: ${this.stats.removedTokens} unused tokens removed */
/* Duplicates eliminated: ${this.stats.duplicatesRemoved} tokens */
/* Size reduction: ${this.stats.reductionPercent}% */

:root {`;

    const tokenDefinitions = [];
    tokens.forEach((token, name) => {
      tokenDefinitions.push(`  ${name}: ${token.value};`);
    });

    const footer = `}

/* Optimization Stats */
/* Original tokens: ${this.stats.originalTokens} */
/* Optimized tokens: ${this.stats.optimizedTokens} */
/* Critical tokens: ${this.stats.inlinedTokens} */`;

    return header + '\n' + tokenDefinitions.join('\n') + '\n' + footer;
  }

  /**
   * Generate layer-specific CSS content
   */
  generateLayerCSS(layerName, tokens) {
    const header = `/* ${layerName.toUpperCase()} Layer Design Tokens */
/* Generated: ${new Date().toISOString()} */
/* Tokens in this layer: ${tokens.size} */

@layer ${layerName} {
  :root {`;

    const tokenDefinitions = [];
    tokens.forEach((token, name) => {
      tokenDefinitions.push(`    ${name}: ${token.value};`);
    });

    const footer = `  }
}`;

    return header + '\n' + tokenDefinitions.join('\n') + '\n' + footer;
  }

  /**
   * Generate optimization header comment
   */
  generateOptimizationHeader(filePath, removedTokens) {
    return `/* Optimized CSS Tokens - ${path.basename(filePath)} */
/* Generated: ${new Date().toISOString()} */
/* Removed ${removedTokens.length} unused tokens */
${removedTokens.length > 0 ? `/* Removed tokens: ${removedTokens.join(', ')} */` : ''}

`;
  }

  /**
   * Calculate optimization results and statistics
   */
  calculateOptimizationResults() {
    console.log('📊 Calculating optimization results...');

    const reductionPercent = this.stats.reductionPercent;
    const targetReduction = 25;

    console.log(`\n📈 Optimization Results:`);
    console.log(`   Original tokens: ${this.stats.originalTokens}`);
    console.log(`   Optimized tokens: ${this.stats.optimizedTokens}`);
    console.log(`   Removed unused: ${this.stats.removedTokens}`);
    console.log(`   Duplicates eliminated: ${this.stats.duplicatesRemoved}`);
    console.log(`   Critical tokens inlined: ${this.stats.inlinedTokens}`);
    console.log(`   CSS size reduction: ${reductionPercent}%`);

    if (reductionPercent >= targetReduction) {
      console.log(`   ✅ Target reduction achieved (${targetReduction}%)`);
    } else {
      console.log(`   ⚠️  Target reduction not met (${targetReduction}% target, ${reductionPercent}% achieved)`);
    }
  }

  /**
   * Generate comprehensive optimization report
   */
  generateOptimizationReport() {
    const reportPath = path.join(process.cwd(), this.options.outputDir, 'optimization-report.json');
    const htmlReportPath = path.join(process.cwd(), this.options.outputDir, 'optimization-report.html');

    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      options: this.options,
      files: {
        'critical-tokens.css': `${this.stats.inlinedTokens} critical tokens for inlining`,
        'consolidated-tokens.css': `${this.stats.optimizedTokens} optimized tokens`,
        'optimization-report.html': 'Visual optimization report'
      },
      performance: {
        targetReduction: '25%',
        actualReduction: `${this.stats.reductionPercent}%`,
        targetAchieved: this.stats.reductionPercent >= 25,
        estimatedLoadTime: `${Math.round(this.stats.sizeAfter / 1000)}ms faster`
      }
    };

    // Write JSON report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    this.generateHTMLOptimizationReport(report, htmlReportPath);

    console.log(`\n📋 Optimization reports generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
  }

  /**
   * Generate HTML optimization report
   */
  generateHTMLOptimizationReport(report, htmlPath) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Token Optimization Report</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2.5rem; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; }
        .success .stat-number { color: #28a745; }
        .warning .stat-number { color: #ffc107; }
        .danger .stat-number { color: #dc3545; }
        .primary .stat-number { color: #007bff; }
        .section { margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 12px; }
        .performance-chart { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .bar { height: 30px; background: linear-gradient(90deg, #28a745, #20c997); border-radius: 15px; margin: 10px 0; display: flex; align-items: center; padding: 0 15px; color: white; font-weight: bold; }
        .files-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0; }
        .file-card { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        h1, h2, h3 { color: #333; }
        .achievement { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .achievement.warning { background: #fff3cd; border-color: #ffeaa7; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 CSS Token Optimization</h1>
        <p>Performance optimization completed: ${report.timestamp}</p>
        <p>Target: 25% reduction in CSS bundle size through token tree-shaking</p>
    </div>

    <div class="stats">
        <div class="stat-card primary">
            <div class="stat-number">${report.stats.originalTokens}</div>
            <div>Original Tokens</div>
        </div>
        <div class="stat-card success">
            <div class="stat-number">${report.stats.optimizedTokens}</div>
            <div>Optimized Tokens</div>
        </div>
        <div class="stat-card danger">
            <div class="stat-number">${report.stats.removedTokens}</div>
            <div>Removed Unused</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-number">${report.stats.duplicatesRemoved}</div>
            <div>Duplicates Eliminated</div>
        </div>
        <div class="stat-card primary">
            <div class="stat-number">${report.stats.inlinedTokens}</div>
            <div>Critical Inlined</div>
        </div>
        <div class="stat-card ${report.performance.targetAchieved ? 'success' : 'warning'}">
            <div class="stat-number">${report.stats.reductionPercent}%</div>
            <div>Size Reduction</div>
        </div>
    </div>

    <div class="${report.performance.targetAchieved ? 'achievement' : 'achievement warning'}">
        <h3>${report.performance.targetAchieved ? '🎯 Target Achieved!' : '⚠️ Target Not Met'}</h3>
        <p>
            <strong>Target:</strong> ${report.performance.targetReduction} reduction<br>
            <strong>Achieved:</strong> ${report.performance.actualReduction} reduction<br>
            <strong>Performance Impact:</strong> ~${report.performance.estimatedLoadTime} improvement in initial paint
        </p>
    </div>

    <div class="section">
        <h2>📊 Performance Analysis</h2>
        <div class="performance-chart">
            <h3>Bundle Size Reduction</h3>
            <div class="bar" style="width: ${Math.min(report.stats.reductionPercent * 4, 100)}%;">
                ${report.stats.reductionPercent}% Reduction
            </div>
        </div>

        <div class="performance-chart">
            <h3>Token Optimization</h3>
            <div class="bar" style="width: ${Math.min((report.stats.removedTokens / report.stats.originalTokens) * 400, 100)}%; background: #dc3545;">
                ${report.stats.removedTokens} Unused Tokens Removed
            </div>
            <div class="bar" style="width: ${Math.min((report.stats.duplicatesRemoved / report.stats.originalTokens) * 400, 100)}%; background: #ffc107;">
                ${report.stats.duplicatesRemoved} Duplicates Eliminated
            </div>
            <div class="bar" style="width: ${Math.min((report.stats.inlinedTokens / report.stats.originalTokens) * 400, 100)}%; background: #007bff;">
                ${report.stats.inlinedTokens} Critical Tokens Inlined
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📦 Generated Files</h2>
        <div class="files-list">
            ${Object.entries(report.files).map(([filename, description]) => `
                <div class="file-card">
                    <h3>${filename}</h3>
                    <p>${description}</p>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>🎯 Optimization Summary</h2>
        <ul>
            <li><strong>Tree Shaking:</strong> Removed ${report.stats.removedTokens} unused tokens</li>
            <li><strong>Deduplication:</strong> Eliminated ${report.stats.duplicatesRemoved} duplicate definitions</li>
            <li><strong>Critical Path:</strong> Inlined ${report.stats.inlinedTokens} critical tokens</li>
            <li><strong>Bundle Size:</strong> Reduced by ${report.stats.reductionPercent}% (${Math.round(report.stats.sizeBefore / 1024)} KB → ${Math.round(report.stats.sizeAfter / 1024)} KB)</li>
            <li><strong>Performance:</strong> Estimated ${report.performance.estimatedLoadTime} improvement in initial paint</li>
        </ul>
    </div>
</body>
</html>`;

    fs.writeFileSync(htmlPath, html);
  }

  /**
   * Extract token definitions from CSS content
   */
  extractTokenDefinitions(content) {
    const tokens = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const match = line.match(/^\s*(--.+?):\s*(.+?);/);
      if (match) {
        const [, name, value] = match;
        tokens.push({
          name: name.trim(),
          value: value.trim(),
          line: index + 1
        });
      }
    });

    return tokens;
  }

  /**
   * Get all CSS files for optimization
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
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    analyzeUsage: !args.includes('--no-analysis'),
    removeDuplicates: !args.includes('--no-dedup'),
    inlineCritical: args.includes('--critical'),
    generateSeparateFiles: !args.includes('--no-separate')
  };

  const optimizer = new CSSTokenOptimizer(options);

  optimizer.optimize()
    .then(stats => {
      console.log('\n🎉 Optimization completed successfully!');
      console.log(`📈 Results: ${stats.reductionPercent}% size reduction`);
      console.log(`🎯 Target: ${stats.reductionPercent >= 25 ? 'ACHIEVED' : 'NOT MET'} (25% target)`);
    })
    .catch(error => {
      console.error('❌ Optimization failed:', error);
      process.exit(1);
    });
}

export { CSSTokenOptimizer };