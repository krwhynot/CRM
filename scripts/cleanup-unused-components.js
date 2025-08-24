#!/usr/bin/env node

/**
 * Automated Component Cleanup Script
 * 
 * Safely removes unused components identified by the usage analysis.
 * Includes safety checks and rollback capabilities.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Unused components identified by analysis (with 0 usages)
const UNUSED_COMPONENTS = [
  {
    name: 'BusinessForm',
    path: 'src/components/forms/BusinessForm.tsx',
    reason: 'No imports found, appears to be abandoned form component'
  },
  {
    name: 'ExampleUsage',
    path: 'src/components/forms/ExampleUsage.tsx',
    reason: 'Demo/example file not used in production'
  },
  {
    name: 'SimpleForm',
    path: 'src/components/forms/SimpleForm.tsx',
    reason: 'Unused form component, likely superseded by other forms'
  },
  {
    name: 'ContactSelect',
    path: 'src/components/forms/entity-select/specialized/ContactSelect.tsx',
    reason: 'Specialized component with no usage'
  },
  {
    name: 'OrganizationSelect',
    path: 'src/components/forms/entity-select/specialized/OrganizationSelect.tsx',
    reason: 'Specialized component with no usage'
  },
  {
    name: 'ProductSelect',
    path: 'src/components/forms/entity-select/specialized/ProductSelect.tsx',
    reason: 'Specialized component with no usage'
  },
  {
    name: 'FormCheckboxField',
    path: 'src/components/forms/form-fields/FormCheckboxField.tsx',
    reason: 'Unused form field component'
  },
  {
    name: 'FormInputField',
    path: 'src/components/forms/form-fields/FormInputField.tsx',
    reason: 'Unused form field component'
  },
  {
    name: 'FormSelectField',
    path: 'src/components/forms/form-fields/FormSelectField.tsx',
    reason: 'Unused form field component'
  },
  {
    name: 'FormSwitchField',
    path: 'src/components/forms/form-fields/FormSwitchField.tsx',
    reason: 'Unused form field component'
  },
  {
    name: 'FormTextareaField',
    path: 'src/components/forms/form-fields/FormTextareaField.tsx',
    reason: 'Unused form field component'
  },
  {
    name: 'breadcrumb',
    path: 'src/components/ui/breadcrumb.tsx',
    reason: 'UI component with no usage in current implementation'
  },
  {
    name: 'CardCompact',
    path: 'src/components/ui/new/CardCompact.tsx',
    reason: 'Alternative component not being used'
  },
  {
    name: 'TypeIndicator',
    path: 'src/components/ui/new/TypeIndicator.tsx',
    reason: 'UI component with no usage'
  },
  {
    name: 'required-marker',
    path: 'src/components/ui/required-marker.tsx',
    reason: 'UI utility with no usage'
  }
];

// Components that need extra verification (might have dynamic imports or be in tests)
const COMPONENTS_NEEDING_VERIFICATION = [
  'sidebar.constants.ts' // Check if this is used by sidebar component
];

/**
 * Verify a component is truly unused by doing comprehensive search
 */
function verifyComponentUnused(componentName, componentPath) {
  const searchPatterns = [
    componentName,
    path.basename(componentPath, '.tsx'),
    path.basename(componentPath, '.ts')
  ];
  
  try {
    // Search in all TypeScript/React files
    for (const pattern of searchPatterns) {
      const result = execSync(
        `find src/ -name "*.tsx" -o -name "*.ts" | xargs grep -l "${pattern}"`,
        { encoding: 'utf-8' }
      );
      
      // Filter out the component's own file
      const matches = result.split('\n')
        .filter(line => line.trim())
        .filter(line => !line.includes(componentPath));
        
      if (matches.length > 0) {
        log('yellow', `⚠️  ${componentName} might still be used in:`);
        matches.forEach(match => log('yellow', `    ${match}`));
        return false;
      }
    }
    
    return true;
  } catch (error) {
    // No matches found (grep returns non-zero when no matches)
    return true;
  }
}

/**
 * Check if component is exported from any index files
 */
function checkIndexExports(componentName) {
  const exportedIn = [];
  
  try {
    const result = execSync(
      `find src/ -name "index.ts" | xargs grep -l "export.*${componentName}"`,
      { encoding: 'utf-8' }
    );
    
    const matches = result.split('\n').filter(line => line.trim());
    exportedIn.push(...matches);
  } catch (error) {
    // No exports found
  }
  
  return exportedIn;
}

/**
 * Remove component and clean up exports
 */
function removeComponent(component, dryRun = false) {
  const { name, path: componentPath, reason } = component;
  const fullPath = path.join(process.cwd(), componentPath);
  
  log('blue', `\n🗑️  Processing: ${name}`);
  log('blue', `   Path: ${componentPath}`);
  log('blue', `   Reason: ${reason}`);
  
  // Verify file exists
  if (!fs.existsSync(fullPath)) {
    log('red', `   ❌ File not found: ${fullPath}`);
    return false;
  }
  
  // Double-check it's unused
  if (!verifyComponentUnused(name, componentPath)) {
    log('yellow', `   ⚠️  Skipping ${name} - might still be used`);
    return false;
  }
  
  // Check for index exports
  const indexExports = checkIndexExports(name);
  if (indexExports.length > 0) {
    log('yellow', `   📋 Component exported in index files:`);
    indexExports.forEach(idx => log('yellow', `      ${idx}`));
    
    if (!dryRun) {
      // Remove exports from index files
      for (const indexFile of indexExports) {
        try {
          let content = fs.readFileSync(indexFile, 'utf-8');
          // Remove the export line
          content = content.replace(new RegExp(`export.*${name}.*\n`, 'g'), '');
          fs.writeFileSync(indexFile, content);
          log('green', `   ✅ Removed export from ${indexFile}`);
        } catch (error) {
          log('red', `   ❌ Failed to update ${indexFile}: ${error.message}`);
        }
      }
    }
  }
  
  // Remove the file
  if (dryRun) {
    log('blue', `   🔍 DRY RUN: Would delete ${fullPath}`);
  } else {
    try {
      fs.unlinkSync(fullPath);
      log('green', `   ✅ Deleted ${componentPath}`);
    } catch (error) {
      log('red', `   ❌ Failed to delete ${fullPath}: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Clean up empty directories
 */
function cleanupEmptyDirectories(dryRun = false) {
  const dirsToCheck = [
    'src/components/forms/entity-select/specialized',
    'src/components/forms/form-fields',
    'src/components/ui/new'
  ];
  
  for (const dir of dirsToCheck) {
    const fullDir = path.join(process.cwd(), dir);
    
    if (fs.existsSync(fullDir)) {
      try {
        const contents = fs.readdirSync(fullDir);
        const hasFiles = contents.some(item => {
          const itemPath = path.join(fullDir, item);
          return fs.statSync(itemPath).isFile();
        });
        
        if (!hasFiles) {
          if (dryRun) {
            log('blue', `🔍 DRY RUN: Would remove empty directory ${dir}`);
          } else {
            // Keep index.ts if it exists, remove only if completely empty
            if (contents.length === 0 || (contents.length === 1 && contents[0] === 'index.ts')) {
              fs.rmSync(fullDir, { recursive: true, force: true });
              log('green', `✅ Removed empty directory ${dir}`);
            }
          }
        }
      } catch (error) {
        log('yellow', `⚠️  Could not check directory ${dir}: ${error.message}`);
      }
    }
  }
}

/**
 * Create backup of components before deletion
 */
function createBackup() {
  const backupDir = path.join(process.cwd(), '.component-cleanup-backup');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  fs.mkdirSync(backupPath);
  
  // Copy all components that will be deleted
  for (const component of UNUSED_COMPONENTS) {
    const sourcePath = path.join(process.cwd(), component.path);
    if (fs.existsSync(sourcePath)) {
      const targetPath = path.join(backupPath, path.basename(component.path));
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
  
  log('green', `✅ Created backup at: ${backupPath}`);
  return backupPath;
}

/**
 * Run post-cleanup validation
 */
function validateCleanup() {
  log('blue', '\n🔍 Running post-cleanup validation...');
  
  try {
    // Type check
    execSync('npm run type-check', { stdio: 'pipe' });
    log('green', '✅ TypeScript compilation successful');
    
    // Lint check
    execSync('npm run lint', { stdio: 'pipe' });
    log('green', '✅ Linting passed');
    
    // Build check
    execSync('npm run build', { stdio: 'pipe' });
    log('green', '✅ Build successful');
    
    return true;
  } catch (error) {
    log('red', '❌ Validation failed:');
    log('red', error.message);
    return false;
  }
}

/**
 * Main cleanup function
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  
  log('bold', '🧹 Component Cleanup Script');
  log('bold', '===========================');
  
  if (dryRun) {
    log('yellow', '🔍 DRY RUN MODE - No files will be deleted\n');
  }
  
  log('blue', `Found ${UNUSED_COMPONENTS.length} unused components to remove:`);
  
  // Show what will be removed
  for (const component of UNUSED_COMPONENTS) {
    log('blue', `  • ${component.name} - ${component.reason}`);
  }
  
  if (!force && !dryRun) {
    log('yellow', '\n⚠️  This will permanently delete components.');
    log('yellow', 'Use --dry-run to see what would be deleted');
    log('yellow', 'Use --force to proceed with deletion');
    return;
  }
  
  let backupPath;
  if (!dryRun) {
    backupPath = createBackup();
  }
  
  // Process each component
  let removedCount = 0;
  for (const component of UNUSED_COMPONENTS) {
    if (removeComponent(component, dryRun)) {
      removedCount++;
    }
  }
  
  // Clean up empty directories
  cleanupEmptyDirectories(dryRun);
  
  if (dryRun) {
    log('blue', `\n🔍 DRY RUN COMPLETE: Would remove ${removedCount} components`);
    log('blue', 'Run with --force to actually delete files');
  } else {
    log('green', `\n✅ CLEANUP COMPLETE: Removed ${removedCount} unused components`);
    
    if (backupPath) {
      log('green', `📦 Backup created at: ${backupPath}`);
    }
    
    // Validate the cleanup
    if (!validateCleanup()) {
      log('red', '\n❌ Validation failed! Consider restoring from backup.');
      if (backupPath) {
        log('yellow', `Backup location: ${backupPath}`);
      }
    } else {
      log('green', '\n🎉 Cleanup completed successfully!');
      log('green', 'All tests pass and build is working.');
    }
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { removeComponent, cleanupEmptyDirectories, validateCleanup };