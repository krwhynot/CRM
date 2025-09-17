#!/usr/bin/env node

/**
 * Architecture Validation Script
 * Enforces component organization rules and architectural patterns
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, basename, dirname, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Architecture rules configuration
const ARCHITECTURE_RULES = {
  // Component organization rules
  componentOrganization: {
    sharedComponentsPath: 'src/components',
    featureComponentsPattern: /^src\/features\/[^\/]+\/components$/,
    allowedSharedComponents: [
      'ui', 'error-boundaries', 'forms', 'layout', 
      'CommandPalette', 'LoadingSpinner', 'ErrorBoundary',
      // shadcn/ui components use kebab-case - allow them
      'alert-dialog', 'alert', 'avatar', 'badge', 'button', 'card', 'chart',
      'checkbox', 'command', 'dialog', 'dropdown-menu', 'form', 'input',
      'label', 'popover', 'select', 'separator', 'sheet', 'sidebar'
    ],
    forbiddenInShared: [
      'Dashboard', 'Organization', 'Contact', 'Product', 
      'Opportunity', 'Interaction', 'Chart', 'Stats'
    ]
  },

  // Import rules
  importRules: {
    // Disallow direct imports from feature directories outside of their own feature
    crossFeatureImports: false,
    // Require index.js exports for feature components
    requireIndexExports: true,
    // Prefer relative imports within same feature
    preferRelativeImports: true
  },

  // Naming conventions
  namingConventions: {
    componentFiles: /^[A-Z][a-zA-Z0-9]*\.(tsx|jsx)$/,
    hookFiles: /^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/,
    typeFiles: /^[a-z][a-zA-Z0-9]*\.types\.(ts|tsx)$/,
    testFiles: /^[A-Z][a-zA-Z0-9]*\.(test|spec)\.(ts|tsx|js)$/
  },

  // File size limits (in bytes) - adjusted for real-world usage
  fileSizeLimits: {
    component: 25000,    // ~800 lines (tables can be large)
    hook: 20000,         // ~600 lines (complex hooks with server interactions)
    utility: 15000,      // ~450 lines (utils can have many helper functions)
    type: 50000         // ~1500 lines (generated types can be very large)
  },

  // State management rules
  stateManagement: {
    zustandStorePattern: /Store.*\.(ts|tsx)$/,
    serverDataFields: ['id', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by'],
    tanStackQueryFields: ['data', 'isLoading', 'error', 'refetch', 'isPending', 'isFetching'],
    clientStateOnlyFields: ['viewMode', 'filters', 'searchQuery', 'selectedId', 'isFormOpen', 'preferences']
  }
};

// Validation results
const validationResults = {
  passed: [],
  warnings: [],
  errors: [],
  metrics: {
    totalComponents: 0,
    featureComponents: 0,
    sharedComponents: 0,
    architectureScore: 0
  }
};

/**
 * Get all TypeScript/React files in a directory recursively
 */
async function getFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
          files.push(...await getFiles(fullPath, extensions));
        }
      } else if (extensions.includes(extname(entry.name))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files;
}

/**
 * Check if a file is in the shared components directory
 */
function isSharedComponent(filePath) {
  const relativePath = relative(projectRoot, filePath);
  return relativePath.startsWith(ARCHITECTURE_RULES.componentOrganization.sharedComponentsPath);
}

/**
 * Check if a file is in a feature components directory
 */
function isFeatureComponent(filePath) {
  const relativePath = relative(projectRoot, filePath);
  return ARCHITECTURE_RULES.componentOrganization.featureComponentsPattern.test(dirname(relativePath));
}

/**
 * Get the feature name from a file path
 */
function getFeatureName(filePath) {
  const relativePath = relative(projectRoot, filePath);
  const match = relativePath.match(/^src\/features\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * Validate component organization
 */
async function validateComponentOrganization() {
  console.log('🏗️  Validating component organization...');
  
  const srcFiles = await getFiles(join(projectRoot, 'src'), ['.tsx', '.jsx']);
  const componentFiles = srcFiles.filter(file => 
    basename(file, extname(file)).match(/^[A-Z]/) && !file.includes('.test.')
  );
  
  validationResults.metrics.totalComponents = componentFiles.length;
  
  for (const file of componentFiles) {
    const fileName = basename(file, extname(file));
    const relativePath = relative(projectRoot, file);
    
    if (isSharedComponent(file)) {
      validationResults.metrics.sharedComponents++;
      
      // Check if component should be in a feature directory
      const shouldBeFeatureComponent = ARCHITECTURE_RULES.componentOrganization.forbiddenInShared
        .some(forbidden => fileName.includes(forbidden));
      
      if (shouldBeFeatureComponent) {
        validationResults.errors.push({
          type: 'component-organization',
          file: relativePath,
          message: `Component "${fileName}" appears to be feature-specific but is in shared components directory`,
          suggestion: `Move to appropriate feature directory (src/features/*/components/)`
        });
      } else {
        validationResults.passed.push({
          type: 'component-organization',
          file: relativePath,
          message: `Correctly placed in shared components`
        });
      }
    } else if (isFeatureComponent(file)) {
      validationResults.metrics.featureComponents++;
      validationResults.passed.push({
        type: 'component-organization',
        file: relativePath,
        message: `Correctly placed in feature directory`
      });
    } else {
      // Component is neither in shared nor feature directory
      validationResults.warnings.push({
        type: 'component-organization',
        file: relativePath,
        message: `Component not in standard directory structure`,
        suggestion: `Move to either src/components (if shared) or src/features/*/components/ (if feature-specific)`
      });
    }
  }
}

/**
 * Validate import patterns
 */
async function validateImportPatterns() {
  console.log('📦 Validating import patterns...');
  
  const sourceFiles = await getFiles(join(projectRoot, 'src'), ['.ts', '.tsx', '.js', '.jsx']);
  
  for (const file of sourceFiles) {
    try {
      const content = await readFile(file, 'utf8');
      const relativePath = relative(projectRoot, file);
      const imports = content.match(/^import .+ from ['"](.*)['"]/gm) || [];
      
      for (const importLine of imports) {
        const importPath = importLine.match(/from ['"](.*)['"]/)?.[1];
        if (!importPath) continue;
        
        // Check for cross-feature imports
        if (importPath.startsWith('src/features/') || importPath.startsWith('../features/')) {
          const currentFeature = getFeatureName(file);
          const importedFeature = importPath.match(/features\/([^\/]+)/)?.[1];
          
          if (currentFeature && importedFeature && currentFeature !== importedFeature) {
            validationResults.warnings.push({
              type: 'import-pattern',
              file: relativePath,
              message: `Cross-feature import detected: ${currentFeature} -> ${importedFeature}`,
              suggestion: `Consider moving shared code to src/lib or src/components, or use feature's index exports`
            });
          }
        }
        
        // Check for proper use of path aliases
        if (importPath.startsWith('../../../') || importPath.startsWith('../../../../')) {
          validationResults.warnings.push({
            type: 'import-pattern',
            file: relativePath,
            message: `Deep relative import detected: ${importPath}`,
            suggestion: `Use path alias (@/) instead of deep relative imports`
          });
        }
      }
    } catch (error) {
      // File read error
    }
  }
}

/**
 * Validate naming conventions
 */
async function validateNamingConventions() {
  console.log('📝 Validating naming conventions...');
  
  const sourceFiles = await getFiles(join(projectRoot, 'src'), ['.ts', '.tsx', '.js', '.jsx']);
  
  for (const file of sourceFiles) {
    const fileName = basename(file);
    const relativePath = relative(projectRoot, file);
    
    // Skip index files and configuration files
    if (fileName === 'index.ts' || fileName === 'index.tsx' || fileName.startsWith('vite.')) {
      continue;
    }
    
    let isValid = false;
    let expectedPattern = '';
    
    // Check component files
    if (fileName.match(/\.(tsx|jsx)$/) && !fileName.includes('.test.')) {
      // Allow kebab-case for shadcn/ui components in /ui directory
      if (relativePath.includes('src/components/ui/')) {
        isValid = true; // shadcn/ui uses kebab-case by convention
      } else {
        isValid = ARCHITECTURE_RULES.namingConventions.componentFiles.test(fileName);
        expectedPattern = 'PascalCase.tsx (e.g., MyComponent.tsx)';
      }
    }
    // Check hook files
    else if (fileName.startsWith('use')) {
      isValid = ARCHITECTURE_RULES.namingConventions.hookFiles.test(fileName);
      expectedPattern = 'useCamelCase.ts (e.g., useMyHook.ts)';
    }
    // Check type files
    else if (fileName.includes('.types.')) {
      isValid = ARCHITECTURE_RULES.namingConventions.typeFiles.test(fileName);
      expectedPattern = 'camelCase.types.ts (e.g., myTypes.types.ts)';
    }
    // Check test files
    else if (fileName.includes('.test.') || fileName.includes('.spec.')) {
      isValid = ARCHITECTURE_RULES.namingConventions.testFiles.test(fileName);
      expectedPattern = 'PascalCase.test.ts (e.g., MyComponent.test.ts)';
    }
    else {
      // Other files - less strict validation
      isValid = true;
    }
    
    if (!isValid) {
      validationResults.errors.push({
        type: 'naming-convention',
        file: relativePath,
        message: `File name "${fileName}" doesn't follow naming convention`,
        suggestion: `Use ${expectedPattern}`
      });
    } else {
      validationResults.passed.push({
        type: 'naming-convention',
        file: relativePath,
        message: `Follows naming convention`
      });
    }
  }
}

/**
 * Validate state management patterns
 */
async function validateStateManagement() {
  console.log('🏪 Validating state management patterns...');
  
  const storeFiles = await getFiles(join(projectRoot, 'src/stores'), ['.ts', '.tsx']);
  const hookFiles = await getFiles(join(projectRoot, 'src'), ['.ts', '.tsx']);
  
  // Validate Zustand stores
  for (const file of storeFiles) {
    try {
      const content = await readFile(file, 'utf8');
      const relativePath = relative(projectRoot, file);
      
      // Check for server data fields in store interfaces
      const serverDataFields = ARCHITECTURE_RULES.stateManagement.serverDataFields;
      const tanStackFields = ARCHITECTURE_RULES.stateManagement.tanStackQueryFields;
      
      for (const field of serverDataFields) {
        if (content.includes(`${field}:`)) {
          // Check if it's in an interface that looks like a store
          const interfaceMatch = content.match(new RegExp(`interface.*Store.*{[^}]*${field}:`, 's'));
          if (interfaceMatch) {
            validationResults.errors.push({
              type: 'state-management',
              file: relativePath,
              message: `Server data field "${field}" found in Zustand store interface`,
              suggestion: `Store only IDs in client state. Use TanStack Query hooks for server data.`
            });
          }
        }
      }
      
      for (const field of tanStackFields) {
        if (content.includes(`${field}:`)) {
          const interfaceMatch = content.match(new RegExp(`interface.*Store.*{[^}]*${field}:`, 's'));
          if (interfaceMatch) {
            validationResults.errors.push({
              type: 'state-management',
              file: relativePath,
              message: `TanStack Query field "${field}" found in Zustand store interface`,
              suggestion: `Use TanStack Query hooks directly instead of storing query state in Zustand.`
            });
          }
        }
      }
      
      // Check for proper client state patterns
      const hasClientStateFields = ARCHITECTURE_RULES.stateManagement.clientStateOnlyFields
        .some(field => content.includes(`${field}:`));
      
      if (hasClientStateFields) {
        validationResults.passed.push({
          type: 'state-management',
          file: relativePath,
          message: `Contains appropriate client-side state fields`
        });
      }
      
    } catch (error) {
      // File read error
    }
  }
  
  // Validate hooks for proper state separation
  const hookFilesFiltered = hookFiles.filter(file => 
    basename(file).startsWith('use') && !file.includes('.test.')
  );
  
  for (const file of hookFilesFiltered) {
    try {
      const content = await readFile(file, 'utf8');
      const relativePath = relative(projectRoot, file);
      
      // Check for proper use of useQuery vs useState
      const hasUseQuery = content.includes('useQuery') || content.includes('useMutation');
      const hasUseState = content.includes('useState');
      const hasServerData = content.includes('supabase') || content.includes('api');
      
      if (hasServerData && hasUseState && !hasUseQuery) {
        validationResults.warnings.push({
          type: 'state-management',
          file: relativePath,
          message: `Hook managing server data uses useState instead of TanStack Query`,
          suggestion: `Consider using useQuery or useMutation for server state management`
        });
      } else if (hasUseQuery) {
        validationResults.passed.push({
          type: 'state-management',
          file: relativePath,
          message: `Uses TanStack Query for server state management`
        });
      }
      
    } catch (error) {
      // File read error
    }
  }
}

/**
 * Validate file sizes
 */
async function validateFileSizes() {
  console.log('📏 Validating file sizes...');
  
  const sourceFiles = await getFiles(join(projectRoot, 'src'), ['.ts', '.tsx', '.js', '.jsx']);
  
  for (const file of sourceFiles) {
    try {
      const stats = await stat(file);
      const relativePath = relative(projectRoot, file);
      const fileName = basename(file);
      
      let sizeLimit = ARCHITECTURE_RULES.fileSizeLimits.utility; // default
      
      if (fileName.match(/\.(tsx|jsx)$/) && !fileName.includes('.test.')) {
        sizeLimit = ARCHITECTURE_RULES.fileSizeLimits.component;
      } else if (fileName.startsWith('use')) {
        sizeLimit = ARCHITECTURE_RULES.fileSizeLimits.hook;
      } else if (fileName.includes('.types.')) {
        sizeLimit = ARCHITECTURE_RULES.fileSizeLimits.type;
      }
      
      if (stats.size > sizeLimit) {
        validationResults.warnings.push({
          type: 'file-size',
          file: relativePath,
          message: `File size ${Math.round(stats.size/1024)}KB exceeds recommended ${Math.round(sizeLimit/1024)}KB`,
          suggestion: `Consider breaking down into smaller, focused components or utilities`
        });
      } else {
        validationResults.passed.push({
          type: 'file-size',
          file: relativePath,
          message: `File size within limits`
        });
      }
    } catch (error) {
      // File stat error
    }
  }
}

/**
 * Calculate architecture score
 */
function calculateArchitectureScore() {
  const totalRules = validationResults.passed.length + validationResults.warnings.length + validationResults.errors.length;
  const successfulRules = validationResults.passed.length + (validationResults.warnings.length * 0.5);
  
  validationResults.metrics.architectureScore = Math.round((successfulRules / totalRules) * 100) || 0;
}

/**
 * Generate summary report
 */
function generateReport() {
  console.log('\n🔍 Architecture Validation Report');
  console.log('================================');
  
  console.log('\n📊 Metrics:');
  console.log(`Total Components: ${validationResults.metrics.totalComponents}`);
  console.log(`Feature Components: ${validationResults.metrics.featureComponents}`);
  console.log(`Shared Components: ${validationResults.metrics.sharedComponents}`);
  console.log(`Architecture Score: ${validationResults.metrics.architectureScore}%`);
  
  if (validationResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    validationResults.errors.forEach(error => {
      console.log(`  • ${error.file}: ${error.message}`);
      if (error.suggestion) {
        console.log(`    💡 ${error.suggestion}`);
      }
    });
  }
  
  if (validationResults.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validationResults.warnings.forEach(warning => {
      console.log(`  • ${warning.file}: ${warning.message}`);
      if (warning.suggestion) {
        console.log(`    💡 ${warning.suggestion}`);
      }
    });
  }
  
  console.log(`\n✅ Total validations passed: ${validationResults.passed.length}`);
  
  if (validationResults.metrics.architectureScore >= 80) {
    console.log('🎉 Architecture health is good!');
  } else if (validationResults.metrics.architectureScore >= 60) {
    console.log('⚠️  Architecture health needs improvement');
  } else {
    console.log('🚨 Architecture health requires attention');
  }
}

// Original function moved below with parameter support

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🏗️  CRM Architecture Validation Tool

USAGE:
  node scripts/validate-architecture.js [focus-area]

FOCUS AREAS:
  (no args)      Run all standard validations
  state          State management patterns (Zustand vs TanStack Query)
  components     Component organization and placement
  performance    Performance architecture patterns
  eslint         ESLint architecture rules validation
  naming         File and component naming conventions
  imports        Import patterns and path validation
  lint           Comprehensive lint validation (TypeScript + ESLint + organization)
  comprehensive  All validations including external dependency checks

EXAMPLES:
  npm run validate:architecture                    # Run all standard validations
  npm run validate:architecture state             # Focus on state management
  npm run validate:architecture lint              # Comprehensive lint check
  npm run validate:architecture comprehensive     # All validations

CONSOLIDATED COMMANDS:
  This script consolidates functionality from:
  • validate-architecture.js (original)
  • check-state-architecture.cjs (advanced state patterns)
  • lint-architecture.sh (comprehensive lint validation)

QUALITY THRESHOLDS:
  • Architecture Score: ≥80% required
  • Component Organization: Enforced
  • State Management: Server/client separation enforced
  • Performance Patterns: Anti-patterns flagged
`);
}

/**
 * Parse command line arguments for focus areas
 */
function parseArguments() {
  const args = process.argv.slice(2);

  // Show help if requested
  if (args.includes('--help') || args.includes('-h') || args.includes('help')) {
    showHelp();
    process.exit(0);
  }

  const focus = {
    all: args.length === 0,
    state: args.includes('state'),
    components: args.includes('components'),
    performance: args.includes('performance'),
    eslint: args.includes('eslint'),
    naming: args.includes('naming'),
    imports: args.includes('imports'),
    lint: args.includes('lint'), // Comprehensive lint-architecture.sh functionality
    comprehensive: args.includes('comprehensive') // All validations + external checks
  };

  // If specific focus areas are specified, disable 'all'
  if (args.length > 0) {
    focus.all = false;
  }

  return focus;
}

/**
 * Run ESLint validation focused on architecture rules
 */
async function validateESLintArchitecture() {
  console.log('🔍 Validating ESLint architecture rules...');

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Run ESLint with architecture-specific rules
    const { stdout, stderr } = await execAsync('npx eslint src --ext ts,tsx --format json --max-warnings 0');

    if (stderr && !stderr.includes('warning')) {
      const eslintResults = JSON.parse(stdout || '[]');
      const architectureErrors = eslintResults
        .flatMap(result => result.messages)
        .filter(message =>
          message.ruleId && (
            message.ruleId.includes('react-hooks') ||
            message.ruleId.includes('react') ||
            message.ruleId.includes('@typescript-eslint')
          )
        );

      if (architectureErrors.length > 0) {
        architectureErrors.forEach(error => {
          validationResults.errors.push({
            type: 'eslint-architecture',
            file: error.filePath || 'unknown',
            message: `${error.ruleId}: ${error.message}`,
            suggestion: `Fix ESLint rule violation for architectural compliance`
          });
        });
      } else {
        validationResults.passed.push({
          type: 'eslint-architecture',
          file: 'all files',
          message: 'ESLint architecture rules passing'
        });
      }
    } else {
      validationResults.passed.push({
        type: 'eslint-architecture',
        file: 'all files',
        message: 'ESLint architecture rules passing'
      });
    }
  } catch (error) {
    validationResults.warnings.push({
      type: 'eslint-architecture',
      file: 'eslint execution',
      message: `ESLint validation failed: ${error.message}`,
      suggestion: 'Check ESLint configuration and dependencies'
    });
  }
}

/**
 * Run performance-focused architecture validation
 */
async function validatePerformanceArchitecture() {
  console.log('⚡ Validating performance architecture patterns...');

  const sourceFiles = await getFiles(join(projectRoot, 'src'), ['.ts', '.tsx']);

  for (const file of sourceFiles) {
    try {
      const content = await readFile(file, 'utf8');
      const relativePath = relative(projectRoot, file);

      // Check for performance anti-patterns
      const antiPatterns = [
        { pattern: /useEffect\(\s*\(\)\s*=>.*\[\]\)/, message: 'Empty dependency array in useEffect might cause performance issues' },
        { pattern: /console\.(log|warn|error)/, message: 'Console statements should be removed in production' },
        { pattern: /JSON\.parse\(JSON\.stringify/, message: 'Deep cloning with JSON is inefficient' },
        { pattern: /new Date\(\).*new Date\(\)/, message: 'Multiple Date instantiations in same scope' },
      ];

      antiPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(content)) {
          validationResults.warnings.push({
            type: 'performance-architecture',
            file: relativePath,
            message,
            suggestion: 'Consider performance optimization alternatives'
          });
        }
      });

      // Check for performance optimizations
      const optimizations = [
        /React\.memo/,
        /useMemo/,
        /useCallback/,
        /React\.lazy/,
        /Suspense/,
      ];

      const hasOptimizations = optimizations.some(pattern => pattern.test(content));
      if (hasOptimizations) {
        validationResults.passed.push({
          type: 'performance-architecture',
          file: relativePath,
          message: 'Contains performance optimizations'
        });
      }

    } catch (error) {
      // File read error
    }
  }
}

/**
 * Advanced state management architecture validation
 */
async function validateAdvancedStateArchitecture() {
  console.log('🏪 Validating advanced state management architecture...');

  const sourceFiles = await getFiles(join(projectRoot, 'src'), ['.ts', '.tsx', '.js', '.jsx']);

  // Anti-patterns to check for
  const antiPatterns = {
    ZUSTAND_SERVER_OPS: {
      pattern: /create\([^)]*\).*(?:supabase|fetch|axios|api)/s,
      message: 'Zustand store contains server operations - should use TanStack Query',
      severity: 'error'
    },
    COMPONENT_DIRECT_DB: {
      pattern: /supabase\.from\(/,
      message: 'Component directly accessing Supabase - should use TanStack Query hooks',
      severity: 'warning',
      excludeFiles: ['/hooks/', '/lib/']
    },
    MANUAL_CACHE: {
      pattern: /(?:cache|lastFetched|cacheTimeout).*supabase/s,
      message: 'Manual cache management detected - TanStack Query handles this automatically',
      severity: 'warning'
    },
    LOCAL_SERVER_STATE: {
      pattern: /useState.*(?:organizations|contacts|opportunities|products)/,
      message: 'Server data in useState - should use TanStack Query',
      severity: 'warning'
    }
  };

  const goodPatterns = {
    TANSTACK_QUERY: {
      pattern: /useQuery\s*\(\s*{/,
      message: 'Proper server state management with TanStack Query'
    },
    ZUSTAND_CLIENT: {
      pattern: /create.*\(set\).*(?:viewMode|sortBy|isOpen|preferences)/s,
      message: 'Proper client state management with Zustand'
    }
  };

  let goodPatternCount = 0;

  for (const file of sourceFiles) {
    try {
      const content = await readFile(file, 'utf8');
      const relativePath = relative(projectRoot, file);

      // Skip test files
      if (relativePath.includes('.test.') || relativePath.includes('.spec.')) {
        continue;
      }

      // Check for anti-patterns
      for (const [name, config] of Object.entries(antiPatterns)) {
        if (config.excludeFiles && config.excludeFiles.some(exclude => relativePath.includes(exclude))) {
          continue;
        }

        if (config.pattern.test(content)) {
          if (config.severity === 'error') {
            validationResults.errors.push({
              type: 'advanced-state-architecture',
              file: relativePath,
              message: config.message,
              suggestion: 'Refactor to use proper state management patterns'
            });
          } else {
            validationResults.warnings.push({
              type: 'advanced-state-architecture',
              file: relativePath,
              message: config.message,
              suggestion: 'Consider using TanStack Query for server state'
            });
          }
        }
      }

      // Check for good patterns
      for (const [name, config] of Object.entries(goodPatterns)) {
        if (config.pattern.test(content)) {
          goodPatternCount++;
          validationResults.passed.push({
            type: 'advanced-state-architecture',
            file: relativePath,
            message: config.message
          });
        }
      }

    } catch (error) {
      // File read error
    }
  }

  console.log(`   Found ${goodPatternCount} files with proper state patterns`);
}

/**
 * Run comprehensive lint-architecture validation
 */
async function validateComprehensiveLint() {
  console.log('🔍 Running comprehensive lint architecture validation...');

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // 1. TypeScript compilation check
    console.log('   Checking TypeScript compilation...');
    try {
      await execAsync('npm run type-check');
      validationResults.passed.push({
        type: 'comprehensive-lint',
        file: 'all files',
        message: 'TypeScript compilation passed'
      });
    } catch (error) {
      validationResults.errors.push({
        type: 'comprehensive-lint',
        file: 'TypeScript compilation',
        message: 'TypeScript compilation failed',
        suggestion: 'Run "npm run type-check" for details'
      });
    }

    // 2. ESLint architecture rules
    console.log('   Running ESLint with architecture rules...');
    try {
      await execAsync('npm run lint');
      validationResults.passed.push({
        type: 'comprehensive-lint',
        file: 'all files',
        message: 'ESLint validation passed'
      });
    } catch (error) {
      validationResults.warnings.push({
        type: 'comprehensive-lint',
        file: 'ESLint validation',
        message: 'ESLint found issues (some may be technical debt)',
        suggestion: 'Run "npm run lint" for details'
      });
    }

    // 3. Component organization checks
    console.log('   Validating component organization...');
    const sourceFiles = await getFiles(join(projectRoot, 'src'), ['.ts', '.tsx']);

    // Check for legacy specialized imports
    let legacyImportsFound = false;
    let crossImportsFound = false;
    let misplacedComponentsFound = false;

    for (const file of sourceFiles) {
      try {
        const content = await readFile(file, 'utf8');
        const relativePath = relative(projectRoot, file);

        // Check for old specialized imports
        if (content.includes('from.*specialized')) {
          legacyImportsFound = true;
          validationResults.errors.push({
            type: 'comprehensive-lint',
            file: relativePath,
            message: 'Found legacy specialized entity select imports',
            suggestion: 'Update to use new import patterns'
          });
        }

        // Check for cross-feature component imports
        if (relativePath.startsWith('src/features/') &&
            content.includes('from.*@/features/') &&
            content.includes('components') &&
            !relativePath.includes('index.ts')) {
          crossImportsFound = true;
          validationResults.warnings.push({
            type: 'comprehensive-lint',
            file: relativePath,
            message: 'Potential cross-feature component import',
            suggestion: 'Use feature index exports or move to shared components'
          });
        }

        // Check for feature-specific components in shared directory
        const fileName = basename(file);
        if (relativePath.startsWith('src/components/') &&
            (fileName.includes('Contact') || fileName.includes('Organization') ||
             fileName.includes('Product') || fileName.includes('Opportunity'))) {
          misplacedComponentsFound = true;
          validationResults.errors.push({
            type: 'comprehensive-lint',
            file: relativePath,
            message: 'Feature-specific component in shared directory',
            suggestion: 'Move to appropriate feature directory'
          });
        }

      } catch (error) {
        // File read error
      }
    }

    if (!legacyImportsFound) {
      validationResults.passed.push({
        type: 'comprehensive-lint',
        file: 'all files',
        message: 'No legacy import patterns found'
      });
    }

    if (!crossImportsFound) {
      validationResults.passed.push({
        type: 'comprehensive-lint',
        file: 'all files',
        message: 'No cross-feature component imports found'
      });
    }

    if (!misplacedComponentsFound) {
      validationResults.passed.push({
        type: 'comprehensive-lint',
        file: 'all files',
        message: 'Component organization is correct'
      });
    }

  } catch (error) {
    validationResults.errors.push({
      type: 'comprehensive-lint',
      file: 'lint execution',
      message: `Comprehensive lint validation failed: ${error.message}`,
      suggestion: 'Check system dependencies and configurations'
    });
  }
}

/**
 * Main validation function with focus area support
 */
async function runArchitectureValidation(focusAreas = null) {
  try {
    const focus = focusAreas || parseArguments();

    console.log('🚀 Starting architecture validation...\n');

    // Standard validations
    if (focus.all || focus.components) {
      await validateComponentOrganization();
    }

    if (focus.all || focus.imports) {
      await validateImportPatterns();
    }

    if (focus.all || focus.naming) {
      await validateNamingConventions();
    }

    if (focus.all || focus.state) {
      await validateStateManagement();
      await validateAdvancedStateArchitecture();
    }

    if (focus.all) {
      await validateFileSizes();
    }

    // Focus area specific validations
    if (focus.eslint) {
      await validateESLintArchitecture();
    }

    if (focus.performance) {
      await validatePerformanceArchitecture();
    }

    // Comprehensive lint validation (includes TypeScript, ESLint, component organization)
    if (focus.lint) {
      await validateComprehensiveLint();
    }

    // Comprehensive validation (all checks including external dependencies)
    if (focus.comprehensive) {
      await validateComponentOrganization();
      await validateImportPatterns();
      await validateNamingConventions();
      await validateStateManagement();
      await validateAdvancedStateArchitecture();
      await validateFileSizes();
      await validateESLintArchitecture();
      await validatePerformanceArchitecture();
      await validateComprehensiveLint();
    }

    calculateArchitectureScore();
    generateReport();

    // Exit with error code if there are errors or score is too low
    const hasErrors = validationResults.errors.length > 0;
    const lowScore = validationResults.metrics.architectureScore < 80; // Maintain 80% threshold

    if (hasErrors || lowScore) {
      console.log('\n❌ Validation failed');
      if (lowScore) {
        console.log(`   Architecture score ${validationResults.metrics.architectureScore}% is below required 80% threshold`);
      }
      process.exit(1);
    } else {
      console.log('\n✅ Validation passed');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Architecture validation error:', error.message);
    process.exit(1);
  }
}

// Run validation if called directly
if (process.argv[1] === __filename) {
  runArchitectureValidation();
}

export { runArchitectureValidation, validationResults, ARCHITECTURE_RULES, parseArguments };