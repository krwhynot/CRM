#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files with errors
const errors = execSync('npm run type-check 2>&1 || true', { encoding: 'utf8' });

// Fix readonly array assignments (TS4104)
const readonlyArrayErrors = {};
errors.split('\n').forEach(line => {
  const match = line.match(/(.+?)\((\d+),(\d+)\): error TS4104:/);
  if (match) {
    const [, file] = match;
    if (!readonlyArrayErrors[file]) {
      readonlyArrayErrors[file] = true;
    }
  }
});

console.log(`Found ${Object.keys(readonlyArrayErrors).length} files with readonly array errors`);

// Fix each file
Object.keys(readonlyArrayErrors).forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace queryKey assignments with spread operator to make them mutable
  content = content.replace(/queryKey:\s*(\[.*?\])/g, (match, arrayContent) => {
    if (match.includes('...')) return match; // Already using spread
    return `queryKey: [...${arrayContent}]`;
  });
  
  // Replace invalidateQueries calls
  content = content.replace(/invalidateQueries\(\s*{\s*queryKey:\s*(\[.*?\])/g, (match, arrayContent) => {
    if (match.includes('...')) return match; // Already using spread
    return `invalidateQueries({ queryKey: [...${arrayContent}]`;
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed readonly array issues in ${path.basename(filePath)}`);
});

// Fix unused parameter warnings in service files
const serviceFiles = execSync('find src/services src/domain -name "*.ts" 2>/dev/null || true', { encoding: 'utf8' })
  .split('\n')
  .filter(f => f.endsWith('.ts'));

serviceFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Add underscore to unused constructor parameters
  content = content.replace(/constructor\(([\s\S]*?)\)/g, (match, params) => {
    let newParams = params.replace(/private readonly (\w+):/g, (m, name) => {
      // Check if the parameter is used in the file
      const regex = new RegExp(`this\\.${name}\\b`, 'g');
      if (!content.match(regex)) {
        modified = true;
        return `private readonly _${name}:`;
      }
      return m;
    });
    return `constructor(${newParams})`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed unused parameters in ${path.basename(filePath)}`);
  }
});

console.log('Done fixing common type errors');