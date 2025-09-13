#!/usr/bin/env node

/**
 * Fix malformed template strings in cn() calls
 *
 * This script finds patterns like:
 * cn(semantic, "${variable} other-classes")
 *
 * And converts them to:
 * cn(semantic, variable, "other-classes")
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Get all TypeScript/TSX files
function getAllTsFiles(dir) {
  const files = []

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath)

    for (const item of items) {
      const fullPath = path.join(currentPath, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory() && !item.startsWith('.') && !['node_modules', 'dist', 'build'].includes(item)) {
        walk(fullPath)
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath)
      }
    }
  }

  walk(dir)
  return files
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = content
  let changesMade = 0

  // Pattern 1: cn(args, "${variable}")
  // Replace with: cn(args, variable)
  const pattern1 = /cn\(([^)]+),\s*"\$\{([^}]+)\}"\)/g
  modified = modified.replace(pattern1, (match, beforeVar, variable) => {
    changesMade++
    return `cn(${beforeVar}, ${variable})`
  })

  // Pattern 2: cn(args, "${variable} other-classes")
  // Replace with: cn(args, variable, "other-classes")
  const pattern2 = /cn\(([^)]+),\s*"\$\{([^}]+)\}\s+([^"]+)"\)/g
  modified = modified.replace(pattern2, (match, beforeVar, variable, otherClasses) => {
    changesMade++
    return `cn(${beforeVar}, ${variable}, "${otherClasses}")`
  })

  // Pattern 3: cn(args, "other-classes ${variable}")
  // Replace with: cn(args, "other-classes", variable)
  const pattern3 = /cn\(([^)]+),\s*"([^"]*)\s+\$\{([^}]+)\}"\)/g
  modified = modified.replace(pattern3, (match, beforeVar, otherClasses, variable) => {
    changesMade++
    if (otherClasses.trim()) {
      return `cn(${beforeVar}, "${otherClasses}", ${variable})`
    } else {
      return `cn(${beforeVar}, ${variable})`
    }
  })

  // Pattern 4: cn(args, "class1 ${var1} class2 ${var2}")
  // Replace with: cn(args, "class1", var1, "class2", var2)
  const pattern4 = /cn\(([^)]+),\s*"([^"]*\$\{[^"]+)"\)/g
  modified = modified.replace(pattern4, (match, beforeVar, complexString) => {
    // Split by ${...} and rebuild
    const parts = []
    let remaining = complexString
    let lastIndex = 0

    const varPattern = /\$\{([^}]+)\}/g
    let varMatch

    while ((varMatch = varPattern.exec(complexString)) !== null) {
      // Add text before the variable
      const textBefore = complexString.slice(lastIndex, varMatch.index).trim()
      if (textBefore) {
        parts.push(`"${textBefore}"`)
      }

      // Add the variable
      parts.push(varMatch[1])

      lastIndex = varMatch.index + varMatch[0].length
    }

    // Add remaining text
    const textAfter = complexString.slice(lastIndex).trim()
    if (textAfter) {
      parts.push(`"${textAfter}"`)
    }

    if (parts.length > 0) {
      changesMade++
      return `cn(${beforeVar}, ${parts.join(', ')})`
    }

    return match
  })

  if (changesMade > 0) {
    fs.writeFileSync(filePath, modified)
    console.log(`Fixed ${changesMade} template string issues in ${filePath}`)
    return changesMade
  }

  return 0
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src')
const files = getAllTsFiles(srcDir)

let totalChanges = 0

for (const file of files) {
  try {
    const changes = fixFile(file)
    totalChanges += changes
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message)
  }
}

console.log(`\nCompleted: Fixed ${totalChanges} template string issues across ${files.length} files`)

if (totalChanges > 0) {
  console.log('\nRunning prettier to format fixed files...')
  try {
    execSync('npm run format', { stdio: 'inherit' })
  } catch (error) {
    console.warn('Warning: Could not run prettier formatting')
  }
}