#!/usr/bin/env node

/**
 * Table Component Consistency Validator
 * 
 * Ensures all table components in the CRM follow standardized patterns:
 * 1. Must use DataTable component
 * 2. Must be wrapped in Card/CardContent
 * 3. Must use BulkActionsProvider
 * 4. Must use semantic spacing tokens
 * 5. Must follow consistent hook patterns
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Validation rules
const REQUIRED_PATTERNS = {
  dataTable: {
    pattern: /<DataTable|from ['"]@\/components\/ui\/DataTable['"]/,
    message: 'Must use DataTable component',
    severity: 'error'
  },
  cardWrapper: {
    pattern: /<Card[\s>][\s\S]*?<CardContent/,
    message: 'Must wrap table in Card/CardContent',
    severity: 'error'
  },
  bulkActions: {
    pattern: /<BulkActionsProvider|from ['"]@\/components\/shared\/BulkActions/,
    message: 'Must use BulkActionsProvider for bulk operations',
    severity: 'error'
  },
  semanticTokens: {
    pattern: /semanticSpacing\.|semanticTypography\.|semanticColors\./,
    message: 'Should use semantic design tokens',
    severity: 'warning'
  },
  noHardcodedTailwind: {
    pattern: /className=["'][^"']*?(p-\d|m-\d|space-[xy]-\d|gap-\d)[^"']*?["']/,
    message: 'Avoid hardcoded Tailwind spacing classes',
    severity: 'warning',
    inverse: true // This pattern should NOT be found
  }
};

// Hook patterns to validate
const HOOK_PATTERNS = {
  tableDataHook: {
    pattern: /use\w+TableData|useEntityTable/,
    message: 'Should use standardized table data hook',
    severity: 'warning'
  },
  actionsHook: {
    pattern: /use\w+Actions/,
    message: 'Should use standardized actions hook',
    severity: 'info'
  }
};

// Files to scan
const TABLE_FILE_PATTERNS = [
  'src/features/**/components/*Table*.tsx',
  'src/features/**/components/*table*.tsx',
  'src/components/tables/*.tsx'
];

// Files to exclude from validation
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/*.test.tsx',
  '**/*.spec.tsx',
  '**/*.stories.tsx',
  '**/EntityTableTemplate.tsx' // Don't validate the template itself
];

class TableConsistencyValidator {
  constructor() {
    this.results = {
      totalFiles: 0,
      compliantFiles: 0,
      violations: [],
      warnings: [],
      info: []
    };
  }

  /**
   * Find all table component files
   */
  findTableFiles() {
    const files = new Set();
    
    TABLE_FILE_PATTERNS.forEach(pattern => {
      const matches = glob.sync(pattern, {
        ignore: EXCLUDE_PATTERNS
      });
      matches.forEach(file => files.add(file));
    });

    return Array.from(files);
  }

  /**
   * Validate a single file
   */
  validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const violations = [];
    const warnings = [];
    const info = [];

    // Check required patterns
    Object.entries(REQUIRED_PATTERNS).forEach(([key, rule]) => {
      const hasPattern = rule.pattern.test(content);
      const shouldHavePattern = !rule.inverse;
      
      if (hasPattern !== shouldHavePattern) {
        const issue = {
          file: filePath,
          rule: key,
          message: rule.message,
          line: this.findLineNumber(content, rule.pattern)
        };

        if (rule.severity === 'error') {
          violations.push(issue);
        } else if (rule.severity === 'warning') {
          warnings.push(issue);
        }
      }
    });

    // Check hook patterns
    Object.entries(HOOK_PATTERNS).forEach(([key, rule]) => {
      if (!rule.pattern.test(content)) {
        const issue = {
          file: filePath,
          rule: key,
          message: rule.message
        };

        if (rule.severity === 'warning') {
          warnings.push(issue);
        } else if (rule.severity === 'info') {
          info.push(issue);
        }
      }
    });

    // Additional checks
    this.checkExpandableContent(content, filePath, violations);
    this.checkEmptyStates(content, filePath, warnings);
    this.checkVirtualization(content, filePath, info);

    return { violations, warnings, info };
  }

  /**
   * Check for proper expandable content implementation
   */
  checkExpandableContent(content, filePath, violations) {
    if (content.includes('expandableContent') || content.includes('ExpandedContent')) {
      if (!content.includes('expandedRows')) {
        violations.push({
          file: filePath,
          rule: 'expandableContent',
          message: 'Expandable content requires expandedRows prop'
        });
      }
    }
  }

  /**
   * Check for consistent empty states
   */
  checkEmptyStates(content, filePath, warnings) {
    if (content.includes('<DataTable')) {
      if (!content.includes('emptyState') && !content.includes('empty=')) {
        warnings.push({
          file: filePath,
          rule: 'emptyState',
          message: 'DataTable should define emptyState prop'
        });
      }
    }
  }

  /**
   * Check for virtualization settings
   */
  checkVirtualization(content, filePath, info) {
    if (content.includes('<DataTable')) {
      if (!content.includes('virtualization')) {
        info.push({
          file: filePath,
          rule: 'virtualization',
          message: 'Consider enabling auto-virtualization for large datasets'
        });
      }
    }
  }

  /**
   * Find line number for a pattern match
   */
  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return null;
  }

  /**
   * Generate consistency score
   */
  calculateScore() {
    const { totalFiles, compliantFiles, violations, warnings } = this.results;
    
    if (totalFiles === 0) return 100;
    
    const violationPenalty = violations.length * 10;
    const warningPenalty = warnings.length * 3;
    
    const score = Math.max(0, 100 - violationPenalty - warningPenalty);
    return Math.round(score);
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const score = this.calculateScore();
    const { totalFiles, compliantFiles, violations, warnings, info } = this.results;

    console.log(`\n${colors.bold}📊 Table Component Consistency Report${colors.reset}`);
    console.log('=' .repeat(50));
    
    console.log(`\n${colors.cyan}Files Scanned:${colors.reset} ${totalFiles}`);
    console.log(`${colors.cyan}Compliant Files:${colors.reset} ${compliantFiles}`);
    console.log(`${colors.cyan}Consistency Score:${colors.reset} ${this.getScoreColor(score)}${score}%${colors.reset}`);
    
    if (violations.length > 0) {
      console.log(`\n${colors.red}❌ Violations (${violations.length}):${colors.reset}`);
      violations.forEach(v => {
        console.log(`  ${colors.red}•${colors.reset} ${path.relative(process.cwd(), v.file)}`);
        console.log(`    ${v.message}${v.line ? ` (line ${v.line})` : ''}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  Warnings (${warnings.length}):${colors.reset}`);
      warnings.forEach(w => {
        console.log(`  ${colors.yellow}•${colors.reset} ${path.relative(process.cwd(), w.file)}`);
        console.log(`    ${w.message}`);
      });
    }
    
    if (info.length > 0 && process.env.VERBOSE) {
      console.log(`\n${colors.blue}ℹ️  Suggestions (${info.length}):${colors.reset}`);
      info.forEach(i => {
        console.log(`  ${colors.blue}•${colors.reset} ${path.relative(process.cwd(), i.file)}`);
        console.log(`    ${i.message}`);
      });
    }

    // Summary
    console.log(`\n${colors.bold}Summary:${colors.reset}`);
    if (violations.length === 0 && warnings.length === 0) {
      console.log(`${colors.green}✅ All table components follow consistent patterns!${colors.reset}`);
    } else if (violations.length === 0) {
      console.log(`${colors.yellow}⚠️  Some minor improvements suggested${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${violations.length} violations must be fixed${colors.reset}`);
    }

    // Write detailed JSON report
    this.writeJsonReport();
    
    return score;
  }

  /**
   * Write JSON report for CI/CD integration
   */
  writeJsonReport() {
    const reportPath = path.join(process.cwd(), 'table-consistency-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      score: this.calculateScore(),
      summary: this.results,
      details: {
        violations: this.results.violations,
        warnings: this.results.warnings,
        info: this.results.info
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${colors.cyan}📄 Detailed report: ${reportPath}${colors.reset}`);
  }

  /**
   * Get color for score
   */
  getScoreColor(score) {
    if (score >= 90) return colors.green;
    if (score >= 70) return colors.yellow;
    return colors.red;
  }

  /**
   * Run validation
   */
  run() {
    console.log(`${colors.bold}🔍 Validating Table Component Consistency...${colors.reset}`);
    
    const files = this.findTableFiles();
    this.results.totalFiles = files.length;
    
    if (files.length === 0) {
      console.log(`${colors.yellow}No table component files found${colors.reset}`);
      return 100;
    }
    
    console.log(`Found ${files.length} table component files to validate\n`);
    
    files.forEach(file => {
      const { violations, warnings, info } = this.validateFile(file);
      
      if (violations.length === 0) {
        this.results.compliantFiles++;
        console.log(`${colors.green}✓${colors.reset} ${path.relative(process.cwd(), file)}`);
      } else {
        console.log(`${colors.red}✗${colors.reset} ${path.relative(process.cwd(), file)}`);
      }
      
      this.results.violations.push(...violations);
      this.results.warnings.push(...warnings);
      this.results.info.push(...info);
    });
    
    const score = this.generateReport();
    
    // Exit with error if there are violations
    if (this.results.violations.length > 0) {
      process.exit(1);
    }
    
    return score;
  }
}

// Run validator
if (require.main === module) {
  const validator = new TableConsistencyValidator();
  validator.run();
}

module.exports = TableConsistencyValidator;