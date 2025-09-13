#!/usr/bin/env node
/**
 * Token Migration Codemod
 * 
 * Automatically migrates hardcoded Tailwind classes to design tokens
 * across the CRM codebase. This ensures consistent use of the design system.
 */

import fs from 'fs'
import { glob } from 'glob'

// Migration patterns for converting hardcoded values to tokens
const migrationPatterns = [
  // SPACING MIGRATIONS
  {
    pattern: /className="([^"]*)\bp-4\b([^"]*)"/g,
    replacement: 'className={cn("$1{semanticSpacing.cardContainer}$2")}',
    type: 'spacing',
    description: 'Card container padding',
  },
  {
    pattern: /className="([^"]*)\bspace-y-4\b([^"]*)"/g,
    replacement: 'className={cn("$1{semanticSpacing.stack.md}$2")}',
    type: 'spacing',
    description: 'Medium vertical stack',
  },
  {
    pattern: /className="([^"]*)\bspace-y-2\b([^"]*)"/g,
    replacement: 'className={cn("$1{semanticSpacing.stack.sm}$2")}',
    type: 'spacing',
    description: 'Small vertical stack',
  },
  {
    pattern: /className="([^"]*)\bgap-4\b([^"]*)"/g,
    replacement: 'className={cn("$1{semanticSpacing.gap.md}$2")}',
    type: 'spacing',
    description: 'Medium gap',
  },

  // TYPOGRAPHY MIGRATIONS
  {
    pattern: /className="([^"]*)\btext-sm\b([^"]*)"/g,
    replacement: 'className={cn("$1{semanticTypography.caption}$2")}',
    type: 'typography',
    description: 'Caption text size',
  },
  {
    pattern: /className="([^"]*)\btext-base\b([^"]*)"/g,
    replacement: 'className={cn("$1{semanticTypography.body}$2")}',
    type: 'typography',
    description: 'Body text size',
  },

  // COLOR MIGRATIONS
  {
    pattern: /className="([^"]*)\bbg-white\b([^"]*)"/g,
    replacement: 'className={cn("$1{semanticColors.cardBackground}$2")}',
    type: 'colors',
    description: 'Card background color',
  },
  {
    pattern: /className="([^"]*)\btext-gray-500\b([^"]*)"/g,
    replacement: 'className={cn("$1{textColors.secondary}$2")}',
    type: 'colors',
    description: 'Secondary text color',
  },
]

// Test the migration script with dry-run
async function dryRun() {
  console.log('🧪 Token Migration - DRY RUN MODE\n')
  
  const pattern = 'src/**/*.{ts,tsx}'
  const files = await glob(pattern)
  
  let totalMatches = 0
  
  for (const file of files.slice(0, 5)) { // Just check first 5 files
    const content = fs.readFileSync(file, 'utf8')
    let matches = 0
    
    for (const migrationPattern of migrationPatterns) {
      const found = content.match(migrationPattern.pattern)
      if (found) {
        matches += found.length
      }
    }
    
    if (matches > 0) {
      console.log(`${file}: ${matches} potential migrations`)
      totalMatches += matches
    }
  }
  
  console.log(`\nFound ${totalMatches} potential migrations in first 5 files`)
  console.log('This is just a preview - full migration would process all files')
}

dryRun().catch(console.error)