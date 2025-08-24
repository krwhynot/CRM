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
      'CommandPalette', 'LoadingSpinner', 'ErrorBoundary'
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

  // File size limits (in bytes)
  fileSizeLimits: {
    component: 15000,    // ~500 lines
    hook: 10000,         // ~300 lines
    utility: 8000,       // ~250 lines
    type: 5000          // ~150 lines
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
      isValid = ARCHITECTURE_RULES.namingConventions.componentFiles.test(fileName);
      expectedPattern = 'PascalCase.tsx (e.g., MyComponent.tsx)';
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

/**
 * Main validation function
 */
async function runArchitectureValidation() {
  try {
    console.log('🚀 Starting architecture validation...\n');
    
    await validateComponentOrganization();
    await validateImportPatterns();
    await validateNamingConventions();
    await validateFileSizes();
    
    calculateArchitectureScore();
    generateReport();
    
    // Exit with error code if there are errors or score is too low
    const hasErrors = validationResults.errors.length > 0;
    const lowScore = validationResults.metrics.architectureScore < 60;
    
    if (hasErrors || lowScore) {
      console.log('\n❌ Validation failed');
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

export { runArchitectureValidation, validationResults, ARCHITECTURE_RULES };