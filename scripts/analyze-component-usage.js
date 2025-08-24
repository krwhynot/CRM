#!/usr/bin/env node

/**
 * Component Usage Analytics Script
 * 
 * Analyzes component usage across the codebase to identify:
 * 1. Components that might need to be moved between shared/feature directories
 * 2. Unused components that could be removed
 * 3. Components that are truly shared vs feature-specific
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const FEATURES_DIR = path.join(SRC_DIR, 'features');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const PAGES_DIR = path.join(SRC_DIR, 'pages');

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

/**
 * Find all TypeScript/React files in a directory
 */
function findTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Extract component name from file path
 */
function getComponentName(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  return basename;
}

/**
 * Find all imports of a component
 */
function findComponentUsages(componentName, searchDir = SRC_DIR) {
  try {
    const result = execSync(
      `grep -r --include="*.tsx" --include="*.ts" -l "import.*${componentName}" "${searchDir}"`,
      { encoding: 'utf-8' }
    );
    return result.split('\n').filter(line => line.trim()).length;
  } catch (error) {
    return 0;
  }
}

/**
 * Analyze which features use a component
 */
function analyzeFeatureUsage(componentName) {
  const features = [];
  
  try {
    const featuresInDir = fs.readdirSync(FEATURES_DIR);
    
    for (const feature of featuresInDir) {
      const featureDir = path.join(FEATURES_DIR, feature);
      if (fs.statSync(featureDir).isDirectory()) {
        try {
          const result = execSync(
            `grep -r --include="*.tsx" --include="*.ts" -l "import.*${componentName}" "${featureDir}"`,
            { encoding: 'utf-8' }
          );
          if (result.trim()) {
            features.push(feature);
          }
        } catch (error) {
          // No usage in this feature
        }
      }
    }
  } catch (error) {
    // Can't read features directory
  }
  
  return features;
}

/**
 * Check if component is used in pages
 */
function isUsedInPages(componentName) {
  try {
    const result = execSync(
      `grep -r --include="*.tsx" --include="*.ts" -l "import.*${componentName}" "${PAGES_DIR}"`,
      { encoding: 'utf-8' }
    );
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Analyze all components in a directory
 */
function analyzeComponents(dir, dirType) {
  log('blue', `\n${colors.bold}=== Analyzing ${dirType} Components ===${colors.reset}`);
  
  const tsxFiles = findTsxFiles(dir);
  const results = [];
  
  for (const file of tsxFiles) {
    const componentName = getComponentName(file);
    const relativePath = path.relative(SRC_DIR, file);
    
    // Skip index files and test files
    if (componentName === 'index' || componentName.includes('.test') || componentName.includes('.spec')) {
      continue;
    }
    
    const totalUsages = findComponentUsages(componentName);
    const featuresUsing = analyzeFeatureUsage(componentName);
    const usedInPages = isUsedInPages(componentName);
    
    const analysis = {
      name: componentName,
      path: relativePath,
      totalUsages,
      featuresUsing,
      featureCount: featuresUsing.length,
      usedInPages,
      type: dirType
    };
    
    results.push(analysis);
    
    // Color coding based on usage patterns
    let statusColor = 'reset';
    let recommendation = '';
    
    if (totalUsages === 0) {
      statusColor = 'red';
      recommendation = '⚠️  UNUSED - Consider removing';
    } else if (dirType === 'Shared' && analysis.featureCount === 1 && !usedInPages) {
      statusColor = 'yellow';
      recommendation = `📦 Consider moving to features/${featuresUsing[0]}/`;
    } else if (dirType === 'Feature' && analysis.featureCount > 1) {
      statusColor = 'green';
      recommendation = '🔄 Consider moving to shared components';
    } else if (dirType === 'Shared' && analysis.featureCount > 1) {
      statusColor = 'green';
      recommendation = '✅ Correctly placed in shared';
    } else if (dirType === 'Feature' && analysis.featureCount === 1) {
      statusColor = 'green';
      recommendation = '✅ Correctly placed in feature';
    }
    
    log(statusColor, `${componentName.padEnd(25)} | Usages: ${totalUsages.toString().padEnd(2)} | Features: ${analysis.featureCount} ${featuresUsing.length > 0 ? '(' + featuresUsing.join(', ') + ')' : ''} | Pages: ${usedInPages ? 'Yes' : 'No'}`);
    
    if (recommendation) {
      log('blue', `  └─ ${recommendation}`);
    }
  }
  
  return results;
}

/**
 * Generate summary report
 */
function generateSummary(allResults) {
  log('bold', '\n=== SUMMARY REPORT ===');
  
  const unused = allResults.filter(r => r.totalUsages === 0);
  const sharedUsedBySingleFeature = allResults.filter(r => 
    r.type === 'Shared' && r.featureCount === 1 && !r.usedInPages
  );
  const featureUsedByMultiple = allResults.filter(r => 
    r.type === 'Feature' && r.featureCount > 1
  );
  
  log('red', `📊 Unused components: ${unused.length}`);
  if (unused.length > 0) {
    unused.forEach(comp => log('red', `   - ${comp.name} (${comp.path})`));
  }
  
  log('yellow', `📦 Shared components used by single feature: ${sharedUsedBySingleFeature.length}`);
  if (sharedUsedBySingleFeature.length > 0) {
    sharedUsedBySingleFeature.forEach(comp => 
      log('yellow', `   - ${comp.name} → should move to features/${comp.featuresUsing[0]}/`)
    );
  }
  
  log('green', `🔄 Feature components used by multiple features: ${featureUsedByMultiple.length}`);
  if (featureUsedByMultiple.length > 0) {
    featureUsedByMultiple.forEach(comp => 
      log('green', `   - ${comp.name} → should move to shared (used by: ${comp.featuresUsing.join(', ')})`)
    );
  }
  
  const totalComponents = allResults.length;
  const wellPlaced = allResults.length - unused.length - sharedUsedBySingleFeature.length - featureUsedByMultiple.length;
  
  log('bold', `\n📈 Architecture Health: ${wellPlaced}/${totalComponents} components (${Math.round(wellPlaced/totalComponents*100)}%) are correctly placed`);
}

// Main execution
function main() {
  log('bold', 'Component Usage Analytics');
  log('bold', '========================');
  
  const allResults = [];
  
  // Analyze shared components
  const sharedResults = analyzeComponents(COMPONENTS_DIR, 'Shared');
  allResults.push(...sharedResults.map(r => ({...r, type: 'Shared'})));
  
  // Analyze feature components
  try {
    const features = fs.readdirSync(FEATURES_DIR);
    for (const feature of features) {
      const featureDir = path.join(FEATURES_DIR, feature);
      if (fs.statSync(featureDir).isDirectory()) {
        const componentsDir = path.join(featureDir, 'components');
        if (fs.existsSync(componentsDir)) {
          const featureResults = analyzeComponents(componentsDir, 'Feature');
          allResults.push(...featureResults.map(r => ({...r, type: 'Feature', feature})));
        }
      }
    }
  } catch (error) {
    log('red', 'Error reading features directory');
  }
  
  // Generate summary
  generateSummary(allResults);
  
  // Save results to JSON for further analysis
  const reportPath = path.join(__dirname, '../component-usage-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
  log('blue', `\n📄 Detailed report saved to: ${reportPath}`);
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeComponents, generateSummary };