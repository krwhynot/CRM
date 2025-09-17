#!/usr/bin/env node

/**
 * Design Token Governance - Automated Change Tracking & Documentation
 *
 * This script provides comprehensive token governance including:
 * - Automated change tracking and changelog generation
 * - Duplicate token detection and prevention
 * - Hierarchy boundary enforcement
 * - Design tool export capabilities
 * - Automated token documentation generation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TokenGovernance {
  constructor() {
    this.baseDir = process.cwd();
    this.tokenFiles = [
      'src/index.css',
      'src/styles/semantic-tokens.css',
      'src/styles/component-tokens.css',
      'src/styles/advanced-colors.css',
      'src/styles/density.css',
      'src/styles/accessibility.css'
    ];
    this.changelogPath = 'DESIGN_TOKENS_CHANGELOG.md';
    this.exportDir = 'design-tokens-export';
    this.governanceRules = {
      primitivesOnly: 'src/index.css',
      allowedPrefixes: {
        'src/styles/component-tokens.css': ['btn-', 'card-', 'dialog-', 'input-', 'select-', 'popover-', 'table-'],
        'src/styles/semantic-tokens.css': ['primary', 'secondary', 'success', 'warning', 'destructive', 'info'],
        'src/styles/advanced-colors.css': ['high-contrast', 'colorblind', 'accessibility'],
        'src/styles/density.css': ['density', 'spacing'],
        'src/styles/accessibility.css': ['wcag', 'contrast', 'focus']
      }
    };
  }

  /**
   * Main governance execution
   */
  async execute() {
    const validateOnly = process.argv.includes('--validate-only');

    if (validateOnly) {
      console.log('🏛️  Design Token Governance Validation');
      console.log('=====================================');
    } else {
      console.log('🏛️  Design Token Governance System');
      console.log('==================================');
    }

    try {
      // 1. Track changes since last commit
      const changes = this.trackTokenChanges();

      // 2. Validate governance rules
      const violations = this.validateGovernanceRules();

      // 3. Generate changelog if changes found (skip in validate-only mode)
      if (changes.length > 0 && !validateOnly) {
        this.generateChangelog(changes);
      }

      // 4. Export tokens for design tools (skip in validate-only mode)
      if (!validateOnly) {
        this.exportForDesignTools();
      }

      // 5. Generate documentation (skip in validate-only mode)
      if (!validateOnly) {
        this.generateDocumentation();
      }

      // 6. Report results
      this.reportResults(changes, violations);

      // Exit with error if violations found
      if (violations.length > 0) {
        if (validateOnly) {
          console.error('❌ Governance validation failed.');
        } else {
          console.error('❌ Governance violations detected. Review required before merge.');
        }
        process.exit(1);
      }

      if (validateOnly) {
        console.log('✅ Governance validation passed.');
      }

    } catch (error) {
      console.error('❌ Token governance execution failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Track token changes since last commit
   */
  trackTokenChanges() {
    console.log('\n📊 Tracking Token Changes');
    console.log('========================');

    const changes = [];

    for (const file of this.tokenFiles) {
      const filePath = path.join(this.baseDir, file);

      if (!fs.existsSync(filePath)) {
        continue;
      }

      try {
        // Get git diff for this file
        const gitDiff = execSync(`git diff HEAD~1 HEAD -- ${file}`, { encoding: 'utf8' }).trim();

        if (!gitDiff) {
          continue;
        }

        // Parse changes
        const fileChanges = this.parseTokenChanges(file, gitDiff);
        if (fileChanges.length > 0) {
          changes.push(...fileChanges);
          console.log(`✅ ${file}: ${fileChanges.length} token changes detected`);
        }

      } catch (error) {
        // File might be new or no git history
        console.log(`⚠️  ${file}: No git history or new file`);
      }
    }

    if (changes.length === 0) {
      console.log('📝 No token changes detected since last commit');
    }

    return changes;
  }

  /**
   * Parse token changes from git diff
   */
  parseTokenChanges(file, gitDiff) {
    const changes = [];
    const lines = gitDiff.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Look for added/modified CSS variables
      if (line.startsWith('+') && line.includes('--') && line.includes(':')) {
        const tokenMatch = line.match(/\+\s*(--.+?):\s*(.+?);/);
        if (tokenMatch) {
          changes.push({
            file,
            type: 'added',
            token: tokenMatch[1],
            value: tokenMatch[2].trim(),
            timestamp: new Date().toISOString()
          });
        }
      }

      // Look for removed CSS variables
      if (line.startsWith('-') && line.includes('--') && line.includes(':')) {
        const tokenMatch = line.match(/\-\s*(--.+?):\s*(.+?);/);
        if (tokenMatch) {
          changes.push({
            file,
            type: 'removed',
            token: tokenMatch[1],
            value: tokenMatch[2].trim(),
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    return changes;
  }

  /**
   * Validate governance rules
   */
  validateGovernanceRules() {
    console.log('\n🏛️  Validating Governance Rules');
    console.log('==============================');

    const violations = [];

    for (const file of this.tokenFiles) {
      const filePath = path.join(this.baseDir, file);

      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const fileViolations = this.validateFileGovernance(file, content);

      if (fileViolations.length > 0) {
        violations.push(...fileViolations);
        console.log(`❌ ${file}: ${fileViolations.length} governance violations`);
      } else {
        console.log(`✅ ${file}: Compliant with governance rules`);
      }
    }

    return violations;
  }

  /**
   * Validate governance rules for a specific file
   */
  validateFileGovernance(file, content) {
    const violations = [];

    // Rule 1: Only primitives file can define primitive tokens
    if (file !== this.governanceRules.primitivesOnly) {
      const primitivePattern = /--(?:primary|secondary|mfb|color|spacing|font|shadow)-[0-9]+\s*:/g;
      const primitiveMatches = content.match(primitivePattern) || [];

      for (const match of primitiveMatches) {
        violations.push({
          file,
          rule: 'primitives-only',
          violation: `Primitive token ${match.replace(':', '')} defined outside primitives file`,
          severity: 'error'
        });
      }
    }

    // Rule 2: Check component prefixes
    if (this.governanceRules.allowedPrefixes[file]) {
      const allowedPrefixes = this.governanceRules.allowedPrefixes[file];
      const tokenPattern = /--([a-zA-Z0-9-]+)\s*:/g;
      let match;

      while ((match = tokenPattern.exec(content)) !== null) {
        const tokenName = match[1];

        // Skip common base tokens
        if (['background', 'foreground', 'border', 'ring', 'muted'].includes(tokenName)) {
          continue;
        }

        const hasAllowedPrefix = allowedPrefixes.some(prefix => tokenName.startsWith(prefix));

        if (!hasAllowedPrefix) {
          violations.push({
            file,
            rule: 'component-prefix',
            violation: `Token --${tokenName} doesn't use allowed prefixes: ${allowedPrefixes.join(', ')}`,
            severity: 'warning'
          });
        }
      }
    }

    // Rule 3: Check for circular references
    const circularRefs = this.detectCircularReferences(content);
    for (const ref of circularRefs) {
      violations.push({
        file,
        rule: 'circular-reference',
        violation: `Circular reference detected: ${ref}`,
        severity: 'error'
      });
    }

    // Rule 4: Check for duplicate definitions
    const duplicates = this.detectDuplicateDefinitions(content);
    for (const dup of duplicates) {
      violations.push({
        file,
        rule: 'duplicate-definition',
        violation: `Duplicate token definition: ${dup}`,
        severity: 'error'
      });
    }

    return violations;
  }

  /**
   * Detect circular references in CSS variables
   */
  detectCircularReferences(content) {
    const circularRefs = [];
    const tokenPattern = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
    let match;

    while ((match = tokenPattern.exec(content)) !== null) {
      const tokenName = match[1];
      const tokenValue = match[2];

      // Check if token references itself
      if (tokenValue.includes(`var(--${tokenName})`)) {
        circularRefs.push(`--${tokenName}`);
      }
    }

    return circularRefs;
  }

  /**
   * Detect duplicate token definitions
   */
  detectDuplicateDefinitions(content) {
    const duplicates = [];
    const tokenCounts = {};
    const tokenPattern = /--([a-zA-Z0-9-]+)\s*:/g;
    let match;

    while ((match = tokenPattern.exec(content)) !== null) {
      const tokenName = match[1];
      tokenCounts[tokenName] = (tokenCounts[tokenName] || 0) + 1;
    }

    for (const [token, count] of Object.entries(tokenCounts)) {
      if (count > 1) {
        duplicates.push(`--${token} (defined ${count} times)`);
      }
    }

    return duplicates;
  }

  /**
   * Generate changelog
   */
  generateChangelog(changes) {
    console.log('\n📝 Generating Token Changelog');
    console.log('============================');

    const changelogPath = path.join(this.baseDir, this.changelogPath);
    const timestamp = new Date().toISOString().split('T')[0];

    let changelogContent = '';

    // Read existing changelog if it exists
    if (fs.existsSync(changelogPath)) {
      changelogContent = fs.readFileSync(changelogPath, 'utf8');
    } else {
      changelogContent = '# Design Tokens Changelog\n\nAll notable changes to design tokens will be documented in this file.\n\n';
    }

    // Group changes by type
    const addedTokens = changes.filter(c => c.type === 'added');
    const removedTokens = changes.filter(c => c.type === 'removed');

    // Generate new changelog entry
    let newEntry = `## [${timestamp}]\n\n`;

    if (addedTokens.length > 0) {
      newEntry += '### Added\n';
      for (const change of addedTokens) {
        newEntry += `- \`${change.token}\`: ${change.value} (${change.file})\n`;
      }
      newEntry += '\n';
    }

    if (removedTokens.length > 0) {
      newEntry += '### Removed\n';
      for (const change of removedTokens) {
        newEntry += `- \`${change.token}\`: ${change.value} (${change.file})\n`;
      }
      newEntry += '\n';
    }

    // Insert new entry after the header
    const lines = changelogContent.split('\n');
    const insertIndex = lines.findIndex(line => line.startsWith('## [')) || lines.length;
    lines.splice(insertIndex, 0, newEntry);

    // Write updated changelog
    fs.writeFileSync(changelogPath, lines.join('\n'));
    console.log(`✅ Changelog updated: ${changes.length} changes documented`);
  }

  /**
   * Export tokens for design tools
   */
  exportForDesignTools() {
    console.log('\n🎨 Exporting for Design Tools');
    console.log('============================');

    const exportPath = path.join(this.baseDir, this.exportDir);

    // Create export directory
    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }

    // Extract all tokens
    const allTokens = this.extractAllTokens();

    // Export as JSON for design tools (Figma, Sketch, etc.)
    const jsonExport = this.generateJsonExport(allTokens);
    fs.writeFileSync(path.join(exportPath, 'design-tokens.json'), JSON.stringify(jsonExport, null, 2));

    // Export as CSS custom properties
    const cssExport = this.generateCssExport(allTokens);
    fs.writeFileSync(path.join(exportPath, 'design-tokens.css'), cssExport);

    // Export as SCSS variables
    const scssExport = this.generateScssExport(allTokens);
    fs.writeFileSync(path.join(exportPath, 'design-tokens.scss'), scssExport);

    console.log(`✅ Design tokens exported to ${this.exportDir}/`);
    console.log(`   - design-tokens.json (${Object.keys(allTokens).length} tokens)`);
    console.log('   - design-tokens.css');
    console.log('   - design-tokens.scss');
  }

  /**
   * Extract all tokens from files
   */
  extractAllTokens() {
    const allTokens = {};

    for (const file of this.tokenFiles) {
      const filePath = path.join(this.baseDir, file);

      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = this.parseTokensFromContent(content, file);

      Object.assign(allTokens, tokens);
    }

    return allTokens;
  }

  /**
   * Parse tokens from CSS content
   */
  parseTokensFromContent(content, file) {
    const tokens = {};
    const tokenPattern = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
    let match;

    while ((match = tokenPattern.exec(content)) !== null) {
      const tokenName = match[1];
      const tokenValue = match[2].trim();

      tokens[tokenName] = {
        value: tokenValue,
        file: file,
        type: this.categorizeToken(tokenName)
      };
    }

    return tokens;
  }

  /**
   * Categorize token type
   */
  categorizeToken(tokenName) {
    if (tokenName.includes('color') || tokenName.includes('primary') || tokenName.includes('secondary') || tokenName.includes('mfb')) {
      return 'color';
    }
    if (tokenName.includes('spacing') || tokenName.includes('gap') || tokenName.includes('padding') || tokenName.includes('margin')) {
      return 'spacing';
    }
    if (tokenName.includes('font') || tokenName.includes('text') || tokenName.includes('size')) {
      return 'typography';
    }
    if (tokenName.includes('shadow') || tokenName.includes('elevation')) {
      return 'shadow';
    }
    if (tokenName.includes('radius') || tokenName.includes('border')) {
      return 'border';
    }
    return 'other';
  }

  /**
   * Generate JSON export for design tools
   */
  generateJsonExport(tokens) {
    const export_data = {
      meta: {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        source: 'KitchenPantry CRM Design System'
      },
      tokens: {}
    };

    // Group by category
    for (const [name, data] of Object.entries(tokens)) {
      const category = data.type;

      if (!export_data.tokens[category]) {
        export_data.tokens[category] = {};
      }

      export_data.tokens[category][name] = {
        value: data.value,
        source: data.file
      };
    }

    return export_data;
  }

  /**
   * Generate CSS export
   */
  generateCssExport(tokens) {
    let css = '/* Design Tokens Export - Generated automatically */\n';
    css += `/* Generated at: ${new Date().toISOString()} */\n\n`;
    css += ':root {\n';

    for (const [name, data] of Object.entries(tokens)) {
      css += `  --${name}: ${data.value};\n`;
    }

    css += '}\n';
    return css;
  }

  /**
   * Generate SCSS export
   */
  generateScssExport(tokens) {
    let scss = '// Design Tokens Export - Generated automatically\n';
    scss += `// Generated at: ${new Date().toISOString()}\n\n`;

    for (const [name, data] of Object.entries(tokens)) {
      const scssName = name.replace(/-/g, '_');
      scss += `$${scssName}: ${data.value};\n`;
    }

    return scss;
  }

  /**
   * Generate documentation
   */
  generateDocumentation() {
    console.log('\n📚 Generating Token Documentation');
    console.log('=================================');

    const allTokens = this.extractAllTokens();
    const docPath = path.join(this.baseDir, 'DESIGN_TOKENS.md');

    let doc = '# Design Tokens Documentation\n\n';
    doc += `Generated automatically on ${new Date().toISOString().split('T')[0]}\n\n`;
    doc += `Total tokens: ${Object.keys(allTokens).length}\n\n`;

    // Group by category
    const categories = {};
    for (const [name, data] of Object.entries(allTokens)) {
      const category = data.type;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ name, ...data });
    }

    // Generate sections for each category
    for (const [category, tokens] of Object.entries(categories)) {
      doc += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Tokens\n\n`;
      doc += '| Token | Value | Source |\n';
      doc += '|-------|-------|--------|\n';

      for (const token of tokens.sort((a, b) => a.name.localeCompare(b.name))) {
        doc += `| \`--${token.name}\` | \`${token.value}\` | ${token.file} |\n`;
      }

      doc += '\n';
    }

    // Add governance rules section
    doc += '## Governance Rules\n\n';
    doc += '### Token Hierarchy\n\n';
    doc += '1. **Primitives Layer**: `src/index.css` - Base values only\n';
    doc += '2. **Semantic Layer**: `src/styles/semantic-tokens.css` - Meaningful abstractions\n';
    doc += '3. **Component Layer**: `src/styles/component-tokens.css` - Component-specific tokens\n';
    doc += '4. **Feature Layer**: Advanced feature files - Specialized use cases\n\n';
    doc += '### Naming Conventions\n\n';
    doc += '- Use kebab-case for all token names\n';
    doc += '- Follow semantic naming patterns\n';
    doc += '- Use appropriate prefixes for component tokens\n\n';
    doc += '### Validation\n\n';
    doc += 'Run `npm run validate:design-tokens` to check compliance.\n';

    fs.writeFileSync(docPath, doc);
    console.log('✅ Documentation generated: DESIGN_TOKENS.md');
  }

  /**
   * Report results
   */
  reportResults(changes, violations) {
    console.log('\n📊 Governance Summary');
    console.log('====================');

    console.log(`Token Changes: ${changes.length}`);
    console.log(`Governance Violations: ${violations.length}`);

    if (violations.length > 0) {
      console.log('\n❌ Violations Found:');
      violations.forEach((v, i) => {
        console.log(`${i + 1}. [${v.severity.toUpperCase()}] ${v.file}: ${v.violation}`);
      });
    }

    if (violations.length === 0 && changes.length > 0) {
      console.log('\n✅ All changes comply with governance rules!');
    } else if (violations.length === 0 && changes.length === 0) {
      console.log('\n✅ No changes detected. System compliant.');
    }
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const governance = new TokenGovernance();
  governance.execute();
}

export default TokenGovernance;