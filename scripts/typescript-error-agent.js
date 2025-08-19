#!/usr/bin/env node

/**
 * TypeScript Error Prevention Agent
 * 
 * A specialized agent for the KitchenPantry CRM system that:
 * - Analyzes and fixes common TypeScript patterns
 * - Provides automated error detection and resolution
 * - Integrates with existing CRM development workflow
 * - Generates comprehensive reports on type safety improvements
 * 
 * @version 1.0.0
 * @author KitchenPantry CRM Team
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');

// Agent Configuration
const AGENT_CONFIG = {
  name: 'TypeScript Error Prevention Agent',
  version: '1.0.0',
  crmDirectory: process.cwd(),
  srcDirectory: path.join(process.cwd(), 'src'),
  
  // Patterns to detect and fix
  patterns: {
    formResolverMismatches: /Resolver<.*>\s*is not assignable to type 'Resolver<.*>/,
    missingControlProps: /Property 'control' is missing/,
    nullabilityConflicts: /Type 'null' is not assignable to type/,
    enumValueErrors: /Type '".*"' is not assignable to type/,
    anyTypeUsage: /:\s*any\b/,
    missingReactHookFormProps: /Missing required prop.*control/,
    incorrectFormDefaults: /undefined.*is not assignable.*null/,
    typeGuardFailures: /is not assignable to parameter of type/
  },

  // Files to prioritize for scanning
  priorityFiles: [
    'src/components/contacts/ContactForm.tsx',
    'src/components/contacts/ContactFormRefactored.tsx',
    'src/components/organizations/OrganizationForm.tsx',
    'src/components/opportunities/OpportunityForm.tsx',
    'src/hooks/useContacts.ts',
    'src/hooks/useOrganizations.ts',
    'src/hooks/useOpportunities.ts',
    'src/lib/form-resolver.ts',
    'src/lib/typescript-guardian.ts',
    'src/types/forms/'
  ],

  // Report configuration
  reportPath: path.join(process.cwd(), 'reports'),
  backupPath: path.join(process.cwd(), 'backups/typescript-fixes')
};

/**
 * Main Agent Class
 */
class TypeScriptErrorAgent {
  constructor() {
    this.errors = [];
    this.fixes = [];
    this.warnings = [];
    this.scanResults = {
      totalFiles: 0,
      errorsFound: 0,
      fixesApplied: 0,
      warningsGenerated: 0
    };
    this.startTime = Date.now();
  }

  /**
   * Main entry point
   */
  async run(mode = 'analyze') {
    console.log(chalk.blue.bold(`\n🤖 ${AGENT_CONFIG.name} v${AGENT_CONFIG.version}`));
    console.log(chalk.blue(`📍 Working directory: ${AGENT_CONFIG.crmDirectory}`));
    console.log(chalk.blue(`🎯 Mode: ${mode.toUpperCase()}\n`));

    try {
      await this.ensureDirectories();
      
      switch (mode) {
        case 'analyze':
          await this.performAnalysis();
          break;
        case 'fix':
          await this.performAnalysisAndFix();
          break;
        case 'watch':
          await this.startWatchMode();
          break;
        case 'validate':
          await this.performValidation();
          break;
        case 'report':
          await this.generateDetailedReport();
          break;
        default:
          throw new Error(`Unknown mode: ${mode}`);
      }

      await this.generateReport();
      this.displaySummary();

    } catch (error) {
      console.error(chalk.red('❌ Agent failed:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    await fs.mkdir(AGENT_CONFIG.reportPath, { recursive: true });
    await fs.mkdir(AGENT_CONFIG.backupPath, { recursive: true });
  }

  /**
   * Core Analysis Functions
   */
  async performAnalysis() {
    console.log(chalk.yellow('🔍 Performing TypeScript error analysis...\n'));

    // 1. Run TypeScript compiler for baseline errors
    const tscErrors = await this.runTypeScriptCompiler();
    
    // 2. Scan source files for patterns
    const sourceFiles = await this.getSourceFiles();
    
    for (const file of sourceFiles) {
      await this.analyzeFile(file);
    }

    // 3. Check form resolver patterns
    await this.analyzeFormResolverPatterns();
    
    // 4. Validate form component props
    await this.validateFormComponentProps();
    
    // 5. Check type safety in hooks
    await this.analyzeHookTypeSafety();

    console.log(chalk.green('✅ Analysis complete\n'));
  }

  /**
   * Run TypeScript compiler to get baseline errors
   */
  async runTypeScriptCompiler() {
    console.log(chalk.cyan('📋 Running TypeScript compiler...'));
    
    try {
      const output = execSync('npx tsc --noEmit', { 
        cwd: AGENT_CONFIG.crmDirectory,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log(chalk.green('✅ No TypeScript compilation errors found'));
      return [];
    } catch (error) {
      const errors = this.parseTypeScriptErrors(error.stdout || error.stderr);
      console.log(chalk.yellow(`⚠️  Found ${errors.length} TypeScript compilation errors`));
      
      errors.forEach(err => this.errors.push({
        type: 'compilation',
        severity: 'error',
        ...err
      }));
      
      return errors;
    }
  }

  /**
   * Parse TypeScript compiler output
   */
  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(.+\.tsx?)\((\d+),(\d+)\):\s*error\s+TS(\d+):\s*(.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5]
        });
      }
    }
    
    return errors;
  }

  /**
   * Get all TypeScript source files
   */
  async getSourceFiles() {
    const files = [];
    
    async function scanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
    
    await scanDirectory(AGENT_CONFIG.srcDirectory);
    this.scanResults.totalFiles = files.length;
    
    return files;
  }

  /**
   * Analyze individual file for patterns
   */
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relativePath = path.relative(AGENT_CONFIG.crmDirectory, filePath);
      
      console.log(chalk.dim(`📄 Analyzing: ${relativePath}`));

      // Check for each pattern
      for (const [patternName, regex] of Object.entries(AGENT_CONFIG.patterns)) {
        const matches = [...content.matchAll(new RegExp(regex.source, 'g'))];
        
        if (matches.length > 0) {
          this.errors.push({
            type: 'pattern',
            severity: this.getPatternSeverity(patternName),
            file: relativePath,
            pattern: patternName,
            matches: matches.length,
            lines: this.getMatchingLines(content, regex)
          });
          
          this.scanResults.errorsFound++;
        }
      }

      // Specific CRM form validation
      if (filePath.includes('Form.tsx') || filePath.includes('form.ts')) {
        await this.validateCRMFormFile(filePath, content);
      }

    } catch (error) {
      this.warnings.push({
        type: 'file_read_error',
        file: path.relative(AGENT_CONFIG.crmDirectory, filePath),
        message: error.message
      });
    }
  }

  /**
   * Get pattern severity level
   */
  getPatternSeverity(patternName) {
    const highSeverity = ['formResolverMismatches', 'missingControlProps', 'anyTypeUsage'];
    const mediumSeverity = ['nullabilityConflicts', 'enumValueErrors'];
    
    if (highSeverity.includes(patternName)) return 'error';
    if (mediumSeverity.includes(patternName)) return 'warning';
    return 'info';
  }

  /**
   * Get line numbers for matches
   */
  getMatchingLines(content, regex) {
    const lines = content.split('\n');
    const matchingLines = [];
    
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        matchingLines.push({
          number: index + 1,
          content: line.trim()
        });
      }
    });
    
    return matchingLines;
  }

  /**
   * Validate CRM-specific form patterns
   */
  async validateCRMFormFile(filePath, content) {
    const relativePath = path.relative(AGENT_CONFIG.crmDirectory, filePath);
    
    // Check for required imports
    const requiredImports = [
      'useForm',
      'Control',
      'FieldValues'
    ];
    
    const missingImports = requiredImports.filter(imp => 
      !content.includes(imp)
    );
    
    if (missingImports.length > 0) {
      this.warnings.push({
        type: 'missing_imports',
        file: relativePath,
        missing: missingImports,
        suggestion: 'Import required React Hook Form types'
      });
    }

    // Check for proper resolver usage
    if (content.includes('yupResolver') && !content.includes('createTypeSafeResolver')) {
      this.warnings.push({
        type: 'suboptimal_resolver',
        file: relativePath,
        suggestion: 'Consider using createTypeSafeResolver from form-resolver.ts for better type safety'
      });
    }

    // Check for form interface usage
    const formInterfaces = ['ContactFormInterface', 'OrganizationFormInterface', 'OpportunityFormInterface'];
    const hasFormInterface = formInterfaces.some(iface => content.includes(iface));
    
    if (!hasFormInterface && content.includes('useForm<')) {
      this.warnings.push({
        type: 'missing_form_interface',
        file: relativePath,
        suggestion: 'Use explicit form interfaces from src/types/forms/form-interfaces.ts'
      });
    }
  }

  /**
   * Analyze form resolver patterns
   */
  async analyzeFormResolverPatterns() {
    console.log(chalk.cyan('🔧 Analyzing form resolver patterns...'));
    
    const formResolverPath = path.join(AGENT_CONFIG.srcDirectory, 'lib/form-resolver.ts');
    
    try {
      const content = await fs.readFile(formResolverPath, 'utf8');
      
      // Check for proper exports
      const expectedExports = [
        'createTypeSafeResolver',
        'FormDataTransformer',
        'CRMResolverFactory'
      ];
      
      expectedExports.forEach(exportName => {
        if (!content.includes(`export.*${exportName}`)) {
          this.warnings.push({
            type: 'missing_export',
            file: 'src/lib/form-resolver.ts',
            missing: exportName,
            suggestion: `Ensure ${exportName} is properly exported`
          });
        }
      });
      
    } catch (error) {
      this.errors.push({
        type: 'file_missing',
        severity: 'error',
        file: 'src/lib/form-resolver.ts',
        message: 'Form resolver utility file is missing'
      });
    }
  }

  /**
   * Validate form component props
   */
  async validateFormComponentProps() {
    console.log(chalk.cyan('🎛️  Validating form component props...'));
    
    const formComponents = await this.getFormComponents();
    
    for (const component of formComponents) {
      await this.validateComponentProps(component);
    }
  }

  /**
   * Get form component files
   */
  async getFormComponents() {
    const components = [];
    const formDirectories = [
      'src/components/contacts/',
      'src/components/organizations/',
      'src/components/opportunities/',
      'src/components/forms/'
    ];
    
    for (const dir of formDirectories) {
      const fullDir = path.join(AGENT_CONFIG.crmDirectory, dir);
      
      try {
        const files = await fs.readdir(fullDir);
        
        for (const file of files) {
          if (file.endsWith('.tsx') && file.includes('Form')) {
            components.push(path.join(fullDir, file));
          }
        }
      } catch (error) {
        // Directory might not exist, skip
      }
    }
    
    return components;
  }

  /**
   * Validate individual component props
   */
  async validateComponentProps(componentPath) {
    try {
      const content = await fs.readFile(componentPath, 'utf8');
      const relativePath = path.relative(AGENT_CONFIG.crmDirectory, componentPath);
      
      // Check for missing control props in form fields
      const formFieldPattern = /<(\w+)(?=\s)[^>]*name=["']([^"']+)["'][^>]*>/g;
      const matches = [...content.matchAll(formFieldPattern)];
      
      matches.forEach(match => {
        const fullMatch = match[0];
        if (!fullMatch.includes('control=')) {
          this.errors.push({
            type: 'missing_control_prop',
            severity: 'error',
            file: relativePath,
            component: match[1],
            field: match[2],
            suggestion: 'Add control prop to form field component'
          });
        }
      });
      
    } catch (error) {
      this.warnings.push({
        type: 'component_analysis_error',
        file: path.relative(AGENT_CONFIG.crmDirectory, componentPath),
        message: error.message
      });
    }
  }

  /**
   * Analyze hook type safety
   */
  async analyzeHookTypeSafety() {
    console.log(chalk.cyan('🪝 Analyzing hook type safety...'));
    
    const hookFiles = [
      'src/hooks/useContacts.ts',
      'src/hooks/useOrganizations.ts',
      'src/hooks/useOpportunities.ts'
    ];
    
    for (const hookFile of hookFiles) {
      await this.validateHookFile(hookFile);
    }
  }

  /**
   * Validate individual hook file
   */
  async validateHookFile(hookPath) {
    const fullPath = path.join(AGENT_CONFIG.crmDirectory, hookPath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      
      // Check for proper return type annotations
      if (!content.includes('Promise<') && content.includes('async ')) {
        this.warnings.push({
          type: 'missing_return_type',
          file: hookPath,
          suggestion: 'Add explicit Promise return types for async functions'
        });
      }
      
      // Check for proper error handling
      if (content.includes('catch') && !content.includes('console.error')) {
        this.warnings.push({
          type: 'incomplete_error_handling',
          file: hookPath,
          suggestion: 'Ensure error handling includes proper logging'
        });
      }
      
    } catch (error) {
      // File might not exist, skip
    }
  }

  /**
   * Auto-fix Functions
   */
  async performAnalysisAndFix() {
    console.log(chalk.yellow('🔧 Performing analysis and auto-fixing errors...\n'));
    
    // First, run analysis
    await this.performAnalysis();
    
    // Then apply fixes
    await this.applyAutomaticFixes();
    
    console.log(chalk.green('✅ Analysis and fixes complete\n'));
  }

  /**
   * Apply automatic fixes
   */
  async applyAutomaticFixes() {
    console.log(chalk.cyan('🛠️  Applying automatic fixes...'));
    
    // Create backup first
    await this.createBackup();
    
    const fixableErrors = this.errors.filter(error => this.canAutoFix(error));
    
    console.log(chalk.blue(`📝 Found ${fixableErrors.length} fixable errors`));
    
    for (const error of fixableErrors) {
      await this.applyFix(error);
    }
    
    // Verify fixes by running TypeScript compiler again
    await this.verifyFixes();
  }

  /**
   * Check if error can be auto-fixed
   */
  canAutoFix(error) {
    const autoFixableTypes = [
      'missing_control_prop',
      'missing_imports',
      'suboptimal_resolver'
    ];
    
    return autoFixableTypes.includes(error.type);
  }

  /**
   * Apply individual fix
   */
  async applyFix(error) {
    const filePath = path.join(AGENT_CONFIG.crmDirectory, error.file);
    
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;
      
      switch (error.type) {
        case 'missing_control_prop':
          content = this.fixMissingControlProp(content, error);
          modified = true;
          break;
          
        case 'missing_imports':
          content = this.fixMissingImports(content, error);
          modified = true;
          break;
          
        case 'suboptimal_resolver':
          content = this.fixSuboptimalResolver(content, error);
          modified = true;
          break;
      }
      
      if (modified) {
        await fs.writeFile(filePath, content, 'utf8');
        this.fixes.push({
          type: error.type,
          file: error.file,
          description: this.getFixDescription(error.type)
        });
        this.scanResults.fixesApplied++;
        
        console.log(chalk.green(`✅ Fixed: ${error.type} in ${error.file}`));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Failed to fix ${error.file}:`, error.message));
    }
  }

  /**
   * Fix missing control prop
   */
  fixMissingControlProp(content, error) {
    // Add control prop to form field components
    const pattern = new RegExp(
      `<${error.component}([^>]*name=["']${error.field}["'][^>]*)>`,
      'g'
    );
    
    return content.replace(pattern, (match, props) => {
      if (!props.includes('control=')) {
        return `<${error.component}${props} control={control}>`;
      }
      return match;
    });
  }

  /**
   * Fix missing imports
   */
  fixMissingImports(content, error) {
    const imports = error.missing;
    
    // Find existing react-hook-form import
    const hookFormImportPattern = /import\s*\{([^}]+)\}\s*from\s*['"]react-hook-form['"]/;
    const match = content.match(hookFormImportPattern);
    
    if (match) {
      const existingImports = match[1].split(',').map(imp => imp.trim());
      const newImports = [...new Set([...existingImports, ...imports])];
      const newImportLine = `import { ${newImports.join(', ')} } from 'react-hook-form'`;
      
      return content.replace(hookFormImportPattern, newImportLine);
    } else {
      // Add new import at the top
      const importLine = `import { ${imports.join(', ')} } from 'react-hook-form'\n`;
      return importLine + content;
    }
  }

  /**
   * Fix suboptimal resolver
   */
  fixSuboptimalResolver(content, error) {
    // Replace yupResolver with createTypeSafeResolver
    const resolverImportPattern = /import\s*\{([^}]+)\}\s*from\s*['"]@hookform\/resolvers\/yup['"]/;
    const formResolverImport = "import { createTypeSafeResolver } from '@/lib/form-resolver'";
    
    // Add form-resolver import if missing
    if (!content.includes('@/lib/form-resolver')) {
      content = formResolverImport + '\n' + content;
    }
    
    // Replace yupResolver usage
    content = content.replace(/yupResolver\s*\(\s*([^)]+)\s*\)/g, 'createTypeSafeResolver($1)');
    
    return content;
  }

  /**
   * Get fix description
   */
  getFixDescription(fixType) {
    const descriptions = {
      'missing_control_prop': 'Added missing control prop to form field component',
      'missing_imports': 'Added missing React Hook Form imports',
      'suboptimal_resolver': 'Replaced yupResolver with createTypeSafeResolver for better type safety'
    };
    
    return descriptions[fixType] || 'Applied automatic fix';
  }

  /**
   * Create backup before applying fixes
   */
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(AGENT_CONFIG.backupPath, `backup-${timestamp}`);
    
    console.log(chalk.blue(`💾 Creating backup at: ${backupDir}`));
    
    await fs.mkdir(backupDir, { recursive: true });
    
    // Copy source files
    await this.copyDirectory(AGENT_CONFIG.srcDirectory, path.join(backupDir, 'src'));
    
    console.log(chalk.green('✅ Backup created successfully'));
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Verify fixes by running TypeScript compiler
   */
  async verifyFixes() {
    console.log(chalk.cyan('🔍 Verifying fixes...'));
    
    try {
      execSync('npx tsc --noEmit', { 
        cwd: AGENT_CONFIG.crmDirectory,
        stdio: 'pipe'
      });
      
      console.log(chalk.green('✅ All fixes verified - no TypeScript errors'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Some TypeScript errors remain after fixes'));
      const remainingErrors = this.parseTypeScriptErrors(error.stdout || error.stderr);
      
      if (remainingErrors.length > 0) {
        console.log(chalk.yellow(`📋 ${remainingErrors.length} errors still need manual attention`));
      }
    }
  }

  /**
   * Watch mode for real-time error prevention
   */
  async startWatchMode() {
    console.log(chalk.yellow('👀 Starting watch mode for real-time error prevention...\n'));
    
    const chokidar = require('chokidar');
    
    const watcher = chokidar.watch(AGENT_CONFIG.srcDirectory, {
      ignored: /node_modules/,
      persistent: true
    });
    
    watcher.on('change', async (filePath) => {
      if (/\.(ts|tsx)$/.test(filePath)) {
        console.log(chalk.blue(`📝 File changed: ${path.relative(AGENT_CONFIG.crmDirectory, filePath)}`));
        await this.analyzeFile(filePath);
        
        if (this.errors.length > 0) {
          console.log(chalk.red(`❌ Found ${this.errors.length} new errors`));
        } else {
          console.log(chalk.green('✅ No errors detected'));
        }
      }
    });
    
    console.log(chalk.green('👀 Watching for changes... Press Ctrl+C to stop\n'));
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n👋 Stopping watch mode...'));
      watcher.close();
      process.exit(0);
    });
  }

  /**
   * Perform validation only
   */
  async performValidation() {
    console.log(chalk.yellow('✅ Performing comprehensive validation...\n'));
    
    // Run analysis
    await this.performAnalysis();
    
    // Additional validation checks
    await this.validateProjectStructure();
    await this.validateDependencies();
    await this.validateCodingStandards();
    
    console.log(chalk.green('✅ Validation complete\n'));
  }

  /**
   * Validate project structure
   */
  async validateProjectStructure() {
    console.log(chalk.cyan('📁 Validating project structure...'));
    
    const requiredFiles = [
      'src/lib/typescript-guardian.ts',
      'src/lib/form-resolver.ts',
      'src/types/forms/form-interfaces.ts',
      'tsconfig.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(AGENT_CONFIG.crmDirectory, file);
      
      try {
        await fs.access(filePath);
      } catch (error) {
        this.errors.push({
          type: 'missing_required_file',
          severity: 'error',
          file: file,
          message: 'Required file is missing'
        });
      }
    }
  }

  /**
   * Validate dependencies
   */
  async validateDependencies() {
    console.log(chalk.cyan('📦 Validating dependencies...'));
    
    const packageJsonPath = path.join(AGENT_CONFIG.crmDirectory, 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const requiredDeps = [
        'react-hook-form',
        '@hookform/resolvers',
        'yup',
        'typescript'
      ];
      
      requiredDeps.forEach(dep => {
        if (!dependencies[dep]) {
          this.warnings.push({
            type: 'missing_dependency',
            dependency: dep,
            suggestion: `Install ${dep} for proper TypeScript form handling`
          });
        }
      });
      
    } catch (error) {
      this.errors.push({
        type: 'package_json_error',
        severity: 'error',
        message: 'Unable to read package.json'
      });
    }
  }

  /**
   * Validate coding standards
   */
  async validateCodingStandards() {
    console.log(chalk.cyan('📋 Validating coding standards...'));
    
    // Check for adherence to the 10 Essential Coding Rules
    const sourceFiles = await this.getSourceFiles();
    
    for (const file of sourceFiles) {
      await this.validateCodingStandardsInFile(file);
    }
  }

  /**
   * Validate coding standards in individual file
   */
  async validateCodingStandardsInFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relativePath = path.relative(AGENT_CONFIG.crmDirectory, filePath);
      
      // Rule 3: TypeScript-First Development
      if (content.includes(': any')) {
        this.warnings.push({
          type: 'coding_standard_violation',
          rule: 'Rule 3: TypeScript-First Development',
          file: relativePath,
          issue: 'Usage of `any` type detected',
          suggestion: 'Replace `any` with explicit types'
        });
      }
      
      // Check for proper component composition
      if (filePath.includes('components/') && content.includes('className') && !content.includes('shadcn')) {
        this.warnings.push({
          type: 'coding_standard_suggestion',
          rule: 'Rule 4: Component Composition',
          file: relativePath,
          suggestion: 'Consider using shadcn/ui components for consistent styling'
        });
      }
      
    } catch (error) {
      // Skip files that can't be read
    }
  }

  /**
   * Report Generation
   */
  async generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(AGENT_CONFIG.reportPath, `typescript-agent-report-${timestamp}.json`);
    
    const report = {
      agent: {
        name: AGENT_CONFIG.name,
        version: AGENT_CONFIG.version,
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.startTime
      },
      summary: this.scanResults,
      errors: this.errors,
      fixes: this.fixes,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };
    
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf8');
    
    console.log(chalk.blue(`📊 Report saved to: ${reportFile}`));
  }

  /**
   * Generate detailed report
   */
  async generateDetailedReport() {
    console.log(chalk.yellow('📊 Generating detailed TypeScript analysis report...\n'));
    
    await this.performAnalysis();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlReportFile = path.join(AGENT_CONFIG.reportPath, `typescript-detailed-report-${timestamp}.html`);
    
    const htmlReport = this.generateHTMLReport();
    await fs.writeFile(htmlReportFile, htmlReport, 'utf8');
    
    console.log(chalk.green(`📋 Detailed HTML report generated: ${htmlReportFile}`));
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeScript Error Prevention Agent Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #2563eb; }
        .error { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 10px 0; }
        .success { background: #d1fae5; border-left: 4px solid #059669; padding: 15px; margin: 10px 0; }
        .code { background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 TypeScript Error Prevention Agent</h1>
            <p>Comprehensive Analysis Report for KitchenPantry CRM</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${this.scanResults.totalFiles}</div>
                <div>Files Scanned</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.scanResults.errorsFound}</div>
                <div>Errors Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.scanResults.fixesApplied}</div>
                <div>Fixes Applied</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.scanResults.warningsGenerated}</div>
                <div>Warnings Generated</div>
            </div>
        </div>
        
        <h2>🚨 Errors Found</h2>
        ${this.errors.map(error => `
            <div class="error">
                <strong>${error.type}</strong> in <code>${error.file}</code>
                <p>${error.message || error.suggestion || 'See details for more information'}</p>
                ${error.lines ? `<div class="code">${error.lines.map(line => `Line ${line.number}: ${line.content}`).join('<br>')}</div>` : ''}
            </div>
        `).join('')}
        
        <h2>⚠️ Warnings</h2>
        ${this.warnings.map(warning => `
            <div class="warning">
                <strong>${warning.type}</strong>${warning.file ? ` in <code>${warning.file}</code>` : ''}
                <p>${warning.message || warning.suggestion}</p>
            </div>
        `).join('')}
        
        <h2>✅ Applied Fixes</h2>
        ${this.fixes.map(fix => `
            <div class="success">
                <strong>${fix.type}</strong> in <code>${fix.file}</code>
                <p>${fix.description}</p>
            </div>
        `).join('')}
        
        <h2>💡 Recommendations</h2>
        ${this.generateRecommendations().map(rec => `
            <div class="warning">
                <strong>${rec.category}</strong>
                <p>${rec.recommendation}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.some(e => e.type === 'formResolverMismatches')) {
      recommendations.push({
        category: 'Form Type Safety',
        recommendation: 'Use createTypeSafeResolver from form-resolver.ts for all form validation to prevent type conflicts'
      });
    }
    
    if (this.errors.some(e => e.type === 'missing_control_prop')) {
      recommendations.push({
        category: 'Component Props',
        recommendation: 'Implement FormPropGuardian.withTypeSafety() HOC for automatic prop validation and fixing'
      });
    }
    
    if (this.warnings.some(w => w.type === 'missing_form_interface')) {
      recommendations.push({
        category: 'Type Definitions',
        recommendation: 'Always use explicit form interfaces from src/types/forms/form-interfaces.ts for better type safety'
      });
    }
    
    if (this.errors.some(e => e.severity === 'error')) {
      recommendations.push({
        category: 'Development Workflow',
        recommendation: 'Integrate the TypeScript Error Agent into your development workflow with watch mode or CI/CD pipeline'
      });
    }
    
    recommendations.push({
      category: 'Best Practices',
      recommendation: 'Follow the 10 Essential Coding Rules documented in docs/Coding_Rules.md'
    });
    
    return recommendations;
  }

  /**
   * Display summary
   */
  displaySummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    console.log(chalk.blue.bold('\n📊 TYPESCRIPT ERROR AGENT SUMMARY'));
    console.log(chalk.blue('═'.repeat(50)));
    console.log(chalk.white(`⏱️  Duration: ${duration}s`));
    console.log(chalk.white(`📁 Files Scanned: ${this.scanResults.totalFiles}`));
    console.log(chalk.red(`❌ Errors Found: ${this.scanResults.errorsFound}`));
    console.log(chalk.green(`✅ Fixes Applied: ${this.scanResults.fixesApplied}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${this.warnings.length}`));
    
    if (this.errors.length > 0) {
      console.log(chalk.red('\n🚨 Error Summary:'));
      const errorsByType = this.errors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(errorsByType).forEach(([type, count]) => {
        console.log(chalk.red(`  • ${type}: ${count}`));
      });
    }
    
    if (this.fixes.length > 0) {
      console.log(chalk.green('\n✅ Fixes Applied:'));
      this.fixes.forEach(fix => {
        console.log(chalk.green(`  • ${fix.type} in ${fix.file}`));
      });
    }
    
    console.log(chalk.blue('\n🎯 Next Steps:'));
    if (this.errors.length > 0) {
      console.log(chalk.yellow('  • Review and fix remaining errors manually'));
      console.log(chalk.yellow('  • Run in fix mode: npm run typescript-agent:fix'));
    } else {
      console.log(chalk.green('  • Great! No TypeScript errors detected'));
    }
    console.log(chalk.blue('  • Set up watch mode for real-time monitoring'));
    console.log(chalk.blue('  • Integrate into CI/CD pipeline for automated checks'));
    
    console.log(chalk.blue.bold('\n🤖 TypeScript Error Agent Complete!'));
  }
}

/**
 * CLI Interface
 */
function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'analyze';
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🤖 TypeScript Error Prevention Agent v${AGENT_CONFIG.version}

Usage: node typescript-error-agent.js [mode] [options]

Modes:
  analyze   - Analyze codebase for TypeScript errors (default)
  fix       - Analyze and automatically fix errors
  watch     - Start watch mode for real-time error prevention
  validate  - Perform comprehensive validation
  report    - Generate detailed HTML report

Options:
  --help, -h    Show this help message

Examples:
  node typescript-error-agent.js analyze
  node typescript-error-agent.js fix
  node typescript-error-agent.js watch
  node typescript-error-agent.js validate
  node typescript-error-agent.js report
`);
    process.exit(0);
  }
  
  const agent = new TypeScriptErrorAgent();
  agent.run(mode).catch(error => {
    console.error(chalk.red('💥 Agent crashed:'), error);
    process.exit(1);
  });
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { TypeScriptErrorAgent, AGENT_CONFIG };