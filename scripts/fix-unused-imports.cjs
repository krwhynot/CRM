#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get TypeScript errors
const errors = execSync('npm run type-check 2>&1 || true', { encoding: 'utf8' });

// Parse TS6133 errors (unused imports)
const unusedImports = {};
errors.split('\n').forEach(line => {
  const match = line.match(/(.+?)\((\d+),(\d+)\): error TS6133: '(.+?)' is declared but its value is never read\./);
  if (match) {
    const [, file, lineNum, , varName] = match;
    if (!unusedImports[file]) {
      unusedImports[file] = new Set();
    }
    unusedImports[file].add(varName);
  }
});

console.log(`Found ${Object.keys(unusedImports).length} files with unused imports`);

// Fix each file
Object.entries(unusedImports).forEach(([filePath, unusedVars]) => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Process each line
  const newLines = lines.map(line => {
    // Check if this is an import line
    if (line.includes('import')) {
      let modifiedLine = line;
      
      // Handle named imports
      unusedVars.forEach(varName => {
        // Remove from named imports
        modifiedLine = modifiedLine
          // Remove entire named import if it's the only one
          .replace(new RegExp(`^import\\s+{\\s*${varName}\\s*}\\s+from`, 'g'), '// Removed unused: import { ' + varName + ' } from')
          // Remove from beginning of list
          .replace(new RegExp(`{\\s*${varName}\\s*,`, 'g'), '{')
          // Remove from middle of list
          .replace(new RegExp(`,\\s*${varName}\\s*,`, 'g'), ',')
          // Remove from end of list
          .replace(new RegExp(`,\\s*${varName}\\s*}`, 'g'), '}')
          // Remove if it's the only one with other items
          .replace(new RegExp(`{([^}]*),\\s*${varName}\\s*,([^}]*)}`, 'g'), '{$1,$2}')
          // Handle default imports
          .replace(new RegExp(`^import\\s+${varName}\\s+from`, 'g'), '// Removed unused: import ' + varName + ' from')
          // Handle import * as
          .replace(new RegExp(`^import\\s+\\*\\s+as\\s+${varName}\\s+from`, 'g'), '// Removed unused: import * as ' + varName + ' from');
      });
      
      // Clean up empty imports
      modifiedLine = modifiedLine
        .replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"]/g, '// Removed empty import')
        .replace(/,\s*,/g, ',')
        .replace(/{\s*,/g, '{')
        .replace(/,\s*}/g, '}');
      
      return modifiedLine;
    }
    return line;
  });
  
  const newContent = newLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${unusedVars.size} unused imports in ${path.basename(filePath)}`);
  }
});

console.log('Done fixing unused imports');