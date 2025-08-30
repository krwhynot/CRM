const fs = require('fs')
const path = require('path')
const glob = require('glob')

/**
 * Architectural tests for PageHeader consistency across the application
 * These tests ensure all pages follow the consistent header patterns
 */

describe('PageHeader Architecture', () => {
  const pagesDir = path.resolve('src/pages')
  
  // Helper function to recursively get all TypeScript files
  function getTsxFiles(dir) {
    try {
      return glob.sync(path.join(dir, '**/*.tsx'), { absolute: true })
    } catch (error) {
      console.warn(`Could not scan directory ${dir}:`, error)
      return []
    }
  }

  test('all pages render a PageHeader (directly or via template)', () => {
    const pageFiles = getTsxFiles(pagesDir)
    const offenders = []
    
    for (const file of pageFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8')
        const relativePath = path.relative(process.cwd(), file)
        
        // Check if page uses PageHeader directly or EntityManagementTemplate
        const hasPageHeader = content.includes('data-page-header') || 
                             content.includes('<PageHeader') ||
                             content.includes('ManagementTemplate')
        
        // Skip test files and special cases (Home page uses dashboard, not header)
        const isTestFile = file.includes('.test.') || file.includes('.spec.')
        const isSpecialPage = relativePath.includes('Home.tsx') // Dashboard page, not entity page
        
        if (!hasPageHeader && !isTestFile && !isSpecialPage) {
          offenders.push(relativePath)
        }
      } catch (error) {
        console.warn(`Could not read file ${file}:`, error)
      }
    }
    
    if (offenders.length > 0) {
      console.log('Pages missing PageHeader or EntityManagementTemplate:')
      offenders.forEach(file => console.log(`  - ${file}`))
    }
    
    expect(offenders).toEqual([])
  })

  test('no deprecated PageHeader components remain in codebase', () => {
    const deprecatedHeaderPaths = [
      'src/features/opportunities/components/OpportunitiesPageHeader.tsx',
      'src/features/organizations/components/OrganizationsPageHeader.tsx',
      'src/features/contacts/components/ContactsPageHeader.tsx'
    ]
    
    // Verify all deprecated wrappers have been removed
    for (const headerPath of deprecatedHeaderPaths) {
      const fullPath = path.resolve(headerPath)
      expect(fs.existsSync(fullPath)).toBe(false)
    }
  })

  test('EntityManagementTemplate uses PageHeader v2', () => {
    const templatePath = path.resolve('src/components/templates/EntityManagementTemplate.tsx')
    
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf8')
      
      // Ensure it imports and uses the new PageHeader
      expect(content).toContain("import { PageHeader } from '@/components/ui/new/PageHeader'")
      expect(content).toContain('<PageHeader')
      // Note: data-page-header is rendered by PageHeader component, not visible in template source
    }
  })

  test('no direct usage of deprecated header patterns in pages', () => {
    const pageFiles = getTsxFiles(pagesDir)
    const violatingFiles = []
    
    // Patterns that indicate old header implementation
    const deprecatedPatterns = [
      /className="[^"]*text-(2xl|3xl|display)/,
      /<h1[^>]*className="[^"]*text-display/,
      /flex.*items-center.*justify-between.*h1/
    ]
    
    for (const file of pageFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8')
        const relativePath = path.relative(process.cwd(), file)
        
        // Skip if file already uses PageHeader or template
        if (content.includes('<PageHeader') || content.includes('ManagementTemplate')) {
          continue
        }
        
        for (const pattern of deprecatedPatterns) {
          if (pattern.test(content)) {
            violatingFiles.push(relativePath)
            break
          }
        }
      } catch (error) {
        console.warn(`Could not read file ${file}:`, error)
      }
    }
    
    if (violatingFiles.length > 0) {
      console.log('Files with deprecated header patterns:')
      violatingFiles.forEach(file => console.log(`  - ${file}`))
    }
    
    expect(violatingFiles).toEqual([])
  })
})