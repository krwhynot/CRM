#!/usr/bin/env node

/**
 * Badge Component Migration Script
 * 
 * Automatically migrates Badge components to appropriate replacements:
 * - StatusIndicator for status/type displays
 * - PriorityIndicator for priority levels
 * - RequiredMarker for form field requirements
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Migration target files
const migrationTargets = [
  'src/components/app-sidebar.tsx',
  'src/components/opportunities/OpportunitiesTable.tsx', 
  'src/components/opportunities/SimpleMultiPrincipalForm.tsx',
  'src/components/dashboard/PrincipalsDashboard.tsx'
]

// Badge replacement patterns
const migrations = [
  {
    // Primary Entry Badge → StatusIndicator
    pattern: /<Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs px-1 py-0">\s*Primary Entry\s*<\/Badge>/g,
    replacement: '<StatusIndicator variant="success" size="sm" ariaLabel="Primary workflow entry">Primary Entry</StatusIndicator>'
  },
  {
    // Count Badge → StatusIndicator  
    pattern: /<Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-1\.5 py-0">\s*{[^}]+}\s*<\/Badge>/g,
    replacement: (match) => {
      const countMatch = match.match(/{([^}]+)}/);
      const countVar = countMatch ? countMatch[1] : 'count';
      return `<StatusIndicator variant="secondary" size="sm">{${countVar}}</StatusIndicator>`;
    }
  },
  {
    // Warning Badge → StatusIndicator
    pattern: /<Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-300 text-xs px-1 py-0 flex items-center gap-1">\s*<AlertTriangle className="size-3" \/>\s*{[^}]+}\s*<\/Badge>/g,
    replacement: (match) => {
      const countMatch = match.match(/{([^}]+)}/);
      const countVar = countMatch ? countMatch[1] : 'count';
      return `<StatusIndicator variant="warning" size="sm" className="flex items-center gap-1">
                <AlertTriangle className="size-3" />
                {${countVar}}
              </StatusIndicator>`;
    }
  },
  {
    // Multi-Principal Badge → StatusIndicator
    pattern: /<Badge variant="secondary" className="text-xs flex items-center gap-1">\s*<Users className="h-3 w-3" \/>\s*Multi-Principal\s*<\/Badge>/g,
    replacement: '<StatusIndicator variant="secondary" size="sm" className="flex items-center gap-1"><Users className="h-3 w-3" />Multi-Principal</StatusIndicator>'
  },
  {
    // Organization Type Badge → StatusIndicator
    pattern: /<Badge variant="outline" className="ml-2">\s*{[^}]+}\s*<\/Badge>/g,
    replacement: (match) => {
      const typeMatch = match.match(/{([^}]+)}/);
      const typeVar = typeMatch ? typeMatch[1] : 'org.type';
      return `<StatusIndicator variant="outline" size="sm">{${typeVar}}</StatusIndicator>`;
    }
  },
  {
    // Stage Badge → StatusIndicator (with dynamic color)
    pattern: /<Badge className={getStageColor\(([^)]+)\)}>\s*{[^}]+}\s*<\/Badge>/g,
    replacement: (match, stageVar) => {
      const contentMatch = match.match(/{([^}]+)}/);
      const contentVar = contentMatch ? contentMatch[1] : 'stage';
      return `<StatusIndicator 
                variant={getStageVariant(${stageVar})} 
                size="sm"
              >
                {${contentVar}}
              </StatusIndicator>`;
    }
  },
  {
    // Priority Badge → PriorityIndicator 
    pattern: /<Badge className={getPriorityColor\(([^)]+)\)}>\s*{[^}]+}\s*<\/Badge>/g,
    replacement: (match, priorityVar) => {
      const contentMatch = match.match(/{([^}]+)}/);
      return `<PriorityIndicator 
                priority={${priorityVar}} 
                showLabel={true}
              />`;
    }
  },
  {
    // Priority system legend → StatusIndicator
    pattern: /<Badge className="bg-red-500 hover:bg-red-600 text-white border-red-500">A\+<\/Badge>/g,
    replacement: '<StatusIndicator variant="destructive" size="sm">A+</StatusIndicator>'
  },
  {
    pattern: /<Badge className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500">A<\/Badge>/g,
    replacement: '<StatusIndicator variant="warning" size="sm">A</StatusIndicator>'
  },
  {
    pattern: /<Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500">B<\/Badge>/g,
    replacement: '<StatusIndicator variant="outline" size="sm" className="bg-yellow-100 text-yellow-800 border-yellow-300">B</StatusIndicator>'
  },
  {
    pattern: /<Badge className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500">C<\/Badge>/g,
    replacement: '<StatusIndicator variant="secondary" size="sm">C</StatusIndicator>'
  },
  {
    pattern: /<Badge className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500">D<\/Badge>/g,
    replacement: '<StatusIndicator variant="outline" size="sm">D</StatusIndicator>'
  },
  {
    // Active Badge → StatusIndicator
    pattern: /<Badge variant="outline" className="text-xs">\s*{[^}]+} Active\s*<\/Badge>/g,
    replacement: (match) => {
      const countMatch = match.match(/{([^}]+)}/);
      const countVar = countMatch ? countMatch[1] : 'count';
      return `<StatusIndicator variant="success" size="sm">{${countVar}} Active</StatusIndicator>`;
    }
  },
  {
    // Selected Principal Badge → StatusIndicator (removable)
    pattern: /<Badge key={[^}]+} variant="secondary" className="flex items-center gap-1">\s*{[^}]+}\s*<button[^>]*>\s*<X className="h-3 w-3" \/>\s*<\/button>\s*<\/Badge>/g,
    replacement: (match) => {
      const keyMatch = match.match(/key={([^}]+)}/);
      const nameMatch = match.match(/{([^}]+)}\s*<button/);
      const keyVar = keyMatch ? keyMatch[1] : 'principalId';
      const nameVar = nameMatch ? nameMatch[1] : 'principal.name';
      return `<StatusIndicator 
                key={${keyVar}} 
                variant="secondary" 
                size="sm" 
                className="flex items-center gap-1"
              >
                {${nameVar}}
                <button
                  type="button"
                  onClick={() => handleRemovePrincipal(${keyVar})}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </StatusIndicator>`;
    }
  }
]

// Import additions needed for each file
const importAdditions = {
  'src/components/app-sidebar.tsx': `import { StatusIndicator } from "@/components/ui/status-indicator"`,
  'src/components/opportunities/OpportunitiesTable.tsx': `import { StatusIndicator } from "@/components/ui/status-indicator"\nimport { PriorityIndicator } from "@/components/ui/priority-indicator"`,
  'src/components/opportunities/SimpleMultiPrincipalForm.tsx': `import { StatusIndicator } from "@/components/ui/status-indicator"`,
  'src/components/dashboard/PrincipalsDashboard.tsx': `import { StatusIndicator } from "@/components/ui/status-indicator"`
}

// Helper functions to add to files
const helperFunctions = {
  'src/components/opportunities/OpportunitiesTable.tsx': `
  const getStageVariant = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'outline'
      case 'qualified':
        return 'secondary'
      case 'proposal':
        return 'warning'
      case 'negotiation':
        return 'warning'
      case 'closed_won':
        return 'success'
      case 'closed_lost':
        return 'destructive'
      default:
        return 'outline'
    }
  }
`
}

function migrateFile(filePath) {
  console.log(`\nMigrating ${filePath}...`)
  
  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ File not found: ${filePath}`)
    return false
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let changesMade = 0

  // Add imports
  if (importAdditions[filePath]) {
    const badgeImportPattern = /import { Badge } from ["']@\/components\/ui\/badge["']/
    if (badgeImportPattern.test(content)) {
      content = content.replace(
        badgeImportPattern,
        `${importAdditions[filePath]}`
      )
      changesMade++
      console.log(`  ✅ Updated imports`)
    }
  }

  // Add helper functions
  if (helperFunctions[filePath]) {
    // Add after existing helper functions or before the main component
    const insertPoint = content.indexOf('export function') || content.indexOf('export default')
    if (insertPoint > 0) {
      content = content.slice(0, insertPoint) + helperFunctions[filePath] + '\n' + content.slice(insertPoint)
      changesMade++
      console.log(`  ✅ Added helper functions`)
    }
  }

  // Apply migrations
  migrations.forEach((migration, index) => {
    const beforeContent = content
    
    if (typeof migration.replacement === 'function') {
      content = content.replace(migration.pattern, migration.replacement)
    } else {
      content = content.replace(migration.pattern, migration.replacement)
    }
    
    if (content !== beforeContent) {
      changesMade++
      console.log(`  ✅ Applied migration pattern ${index + 1}`)
    }
  })

  if (changesMade > 0) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`  ✅ Successfully migrated ${filePath} (${changesMade} changes)`)
    return true
  } else {
    console.log(`  ℹ️  No changes needed for ${filePath}`)
    return false
  }
}

function main() {
  console.log('🚀 Starting Badge component migration...\n')

  const results = migrationTargets.map(filePath => {
    const fullPath = path.join(process.cwd(), filePath)
    return {
      file: filePath,
      success: migrateFile(fullPath)
    }
  })

  console.log('\n📋 Migration Summary:')
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`  ${status} ${result.file}`)
  })

  const successCount = results.filter(r => r.success).length
  console.log(`\n🎉 Migration complete! ${successCount}/${results.length} files migrated successfully.`)

  if (successCount > 0) {
    console.log('\n📝 Next steps:')
    console.log('1. Test the migrated components in your browser')
    console.log('2. Run TypeScript compilation: npm run type-check')
    console.log('3. Update any remaining Badge references manually')
    console.log('4. Consider updating tests to use new component names')
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { migrateFile, migrations }