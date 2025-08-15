#!/usr/bin/env node

/**
 * Stage 6-2 Test Setup Validation Script
 * Validates that all test files and dependencies are properly configured
 * for Stage 6-2 Principal CRM comprehensive testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m', 
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`${message}`, colors.bright);
  log(`${'='.repeat(60)}`, colors.cyan);
}

// Validation configuration
const VALIDATION_CONFIG = {
  requiredTestFiles: [
    'principal-contact-workflow-tests.spec.js',
    'auto-opportunity-naming-tests.spec.js', 
    'organization-contact-warnings-tests.spec.js',
    'stage-6-2-principal-crm-comprehensive-tests.spec.js',
    'run-stage-6-2-comprehensive-tests.mjs',
    'STAGE-6-2-TESTING-GUIDE.md'
  ],
  requiredDependencies: [
    '@playwright/test'
  ],
  requiredDirectories: [
    'tests',
    'tests/test-results'
  ]
};

// Check if file exists and is readable
function validateFile(filePath, description = '') {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        logSuccess(`${description || path.basename(filePath)} exists`);
        return true;
      } else {
        logError(`${description || filePath} exists but is not a file`);
        return false;
      }
    } else {
      logError(`${description || filePath} does not exist`);
      return false;
    }
  } catch (error) {
    logError(`Cannot access ${description || filePath}: ${error.message}`);
    return false;
  }
}

// Check if directory exists
function validateDirectory(dirPath, description = '') {
  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        logSuccess(`${description || path.basename(dirPath)} directory exists`);
        return true;
      } else {
        logError(`${description || dirPath} exists but is not a directory`);
        return false;
      }
    } else {
      logWarning(`${description || dirPath} directory does not exist - will be created during test execution`);
      return true; // This is okay, will be created later
    }
  } catch (error) {
    logError(`Cannot access ${description || dirPath}: ${error.message}`);
    return false;
  }
}

// Validate test file content
function validateTestFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const validationChecks = [
      {
        name: 'Stage 6-2 reference',
        pattern: /stage.?6.?2/i,
        required: true
      },
      {
        name: 'Playwright test import',
        pattern: /require.*@playwright\/test|import.*@playwright\/test/,
        required: true
      },
      {
        name: 'Test describe blocks',
        pattern: /test\.describe\s*\(/,
        required: true
      },
      {
        name: 'Performance validation',
        pattern: /performance|timeout|speed/i,
        required: false
      },
      {
        name: 'Principal CRM validation',
        pattern: /principal.*crm|crm.*principal/i,
        required: true
      }
    ];
    
    let passedChecks = 0;
    let requiredChecks = 0;
    
    validationChecks.forEach(check => {
      if (check.required) requiredChecks++;
      
      if (check.pattern.test(content)) {
        logSuccess(`  ✓ ${check.name} found`);
        passedChecks++;
      } else if (check.required) {
        logError(`  ✗ ${check.name} missing (required)`);
      } else {
        logWarning(`  ~ ${check.name} not found (optional)`);
      }
    });
    
    return passedChecks >= requiredChecks;
    
  } catch (error) {
    logError(`Cannot read ${filePath}: ${error.message}`);
    return false;
  }
}

// Check package.json dependencies
function validateDependencies() {
  logInfo('Validating package dependencies...');
  
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      logError('package.json not found');
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    
    let allDepsValid = true;
    
    VALIDATION_CONFIG.requiredDependencies.forEach(dep => {
      if (allDeps[dep]) {
        logSuccess(`${dep} dependency found (${allDeps[dep]})`);
      } else {
        logError(`${dep} dependency missing`);
        allDepsValid = false;
      }
    });
    
    return allDepsValid;
    
  } catch (error) {
    logError(`Cannot validate dependencies: ${error.message}`);
    return false;
  }
}

// Check if development server configuration exists
function validateServerConfig() {
  logInfo('Validating development server configuration...');
  
  const configFiles = [
    'vite.config.ts',
    'vite.config.js', 
    'package.json'
  ];
  
  let configFound = false;
  
  configFiles.forEach(configFile => {
    const configPath = path.join(process.cwd(), configFile);
    if (fs.existsSync(configPath)) {
      logSuccess(`${configFile} configuration found`);
      configFound = true;
      
      if (configFile === 'package.json') {
        try {
          const packageJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          if (packageJson.scripts && packageJson.scripts.dev) {
            logSuccess('Development server script found');
          } else {
            logWarning('No "dev" script found in package.json');
          }
        } catch (error) {
          logWarning(`Cannot parse ${configFile}: ${error.message}`);
        }
      }
    }
  });
  
  if (!configFound) {
    logError('No development server configuration found');
  }
  
  return configFound;
}

// Validate Playwright configuration
function validatePlaywrightConfig() {
  logInfo('Validating Playwright configuration...');
  
  const playwrightConfigs = [
    'playwright.config.js',
    'playwright.config.ts'
  ];
  
  let configFound = false;
  
  playwrightConfigs.forEach(configFile => {
    const configPath = path.join(process.cwd(), configFile);
    if (fs.existsSync(configPath)) {
      logSuccess(`${configFile} found`);
      configFound = true;
    }
  });
  
  if (!configFound) {
    logWarning('No Playwright configuration found - using defaults');
  }
  
  return true; // Not critical, Playwright can use defaults
}

// Main validation function
function main() {
  logHeader('STAGE 6-2 PRINCIPAL CRM TEST SETUP VALIDATION');
  
  let allValid = true;
  
  // 1. Validate required directories
  logInfo('Validating required directories...');
  VALIDATION_CONFIG.requiredDirectories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!validateDirectory(dirPath, dir)) {
      if (dir !== 'tests/test-results') { // test-results will be created automatically
        allValid = false;
      }
    }
  });
  
  // 2. Validate required test files
  logInfo('\nValidating required test files...');
  VALIDATION_CONFIG.requiredTestFiles.forEach(file => {
    const filePath = path.join(process.cwd(), 'tests', file);
    if (!validateFile(filePath, file)) {
      allValid = false;
    } else if (file.endsWith('.spec.js')) {
      // Validate test file content
      logInfo(`  Validating content of ${file}...`);
      if (!validateTestFileContent(filePath)) {
        logWarning(`  ${file} content validation failed`);
      }
    }
  });
  
  // 3. Validate dependencies
  if (!validateDependencies()) {
    allValid = false;
  }
  
  // 4. Validate server configuration
  if (!validateServerConfig()) {
    allValid = false;
  }
  
  // 5. Validate Playwright configuration
  validatePlaywrightConfig();
  
  // 6. Summary
  logHeader('VALIDATION SUMMARY');
  
  if (allValid) {
    logSuccess('✅ ALL VALIDATIONS PASSED');
    logSuccess('🚀 Stage 6-2 test setup is ready for execution');
    log('\nNext steps:', colors.cyan);
    log('1. Start development server: npm run dev');
    log('2. Run comprehensive tests: node tests/run-stage-6-2-comprehensive-tests.mjs');
    log('3. Review test results in: tests/stage-6-2-test-report.json');
  } else {
    logError('❌ VALIDATION FAILED');
    logError('🚨 Please fix the issues above before running Stage 6-2 tests');
    log('\nRecommended fixes:', colors.yellow);
    log('1. Ensure all test files are present and properly formatted');
    log('2. Install missing dependencies: npm install @playwright/test');
    log('3. Verify development server configuration');
  }
  
  log('\nFor detailed information, see: tests/STAGE-6-2-TESTING-GUIDE.md', colors.blue);
  
  return allValid;
}

// Execute validation
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isValid = main();
  process.exit(isValid ? 0 : 1);
}

export { main, validateFile, validateDirectory, validateTestFileContent };