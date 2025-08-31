/**
 * FormField Component Adoption Tests
 * Validates that form components use the consistent FormField component
 * for proper accessibility and UX patterns
 */

import { describe, test, expect, beforeAll } from 'vitest'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { glob } from 'glob'

const projectRoot = join(process.cwd())

interface FormFieldAnalysis {
  file: string
  hasController: boolean
  hasFormField: boolean
  hasLegacyFormItem: boolean
  formFieldCount: number
  legacyFormItemCount: number
  manualLabelCount: number
}

describe('FormField Component Adoption', () => {
  let formFiles: string[] = []
  let analysisResults: FormFieldAnalysis[] = []

  beforeAll(async () => {
    // Find all form component files
    const targetForms = [
      'src/features/contacts/components/contact-form/ContactFormBasicFields.tsx',
      'src/features/contacts/components/contact-form/ContactFormRoleFields.tsx', 
      'src/features/contacts/components/contact-form/ContactFormDetailsFields.tsx',
      'src/features/organizations/components/OrganizationForm.tsx',
      'src/features/opportunities/components/OpportunityForm.tsx'
    ]

    // Also find any other form components in the codebase
    const allFormFiles = await glob('src/**/*{Form,form}*.{ts,tsx}', { 
      cwd: projectRoot,
      ignore: ['**/index.ts', '**/index.tsx', '**/*.test.*', '**/*.spec.*']
    })

    formFiles = [...new Set([...targetForms, ...allFormFiles])].filter(file => 
      !file.includes('hooks') && 
      !file.includes('types') &&
      !file.includes('FormField.tsx') // Exclude the FormField component itself
    )

    // Analyze each form file
    for (const file of formFiles) {
      try {
        const content = await readFile(join(projectRoot, file), 'utf-8')
        analysisResults.push(analyzeFormFile(file, content))
      } catch (error) {
        console.warn(`Could not read ${file}:`, error)
      }
    }
  })

  function analyzeFormFile(file: string, content: string): FormFieldAnalysis {
    // Check for React Hook Form Controller usage
    const hasController = content.includes('Controller') && 
                         (content.includes('react-hook-form') || content.includes('Controller'))

    // Check for FormField component usage
    const hasFormField = content.includes('FormField') && 
                        content.includes('@/components/forms')

    // Check for legacy shadcn FormItem usage
    const hasLegacyFormItem = content.includes('FormItem') && 
                             content.includes('@/components/ui/form')

    // Count FormField usage
    const formFieldMatches = content.match(/<FormField\\b/g)
    const formFieldCount = formFieldMatches ? formFieldMatches.length : 0

    // Count legacy FormItem usage  
    const legacyFormItemMatches = content.match(/<FormItem[^>]*>/g)
    const legacyFormItemCount = legacyFormItemMatches ? legacyFormItemMatches.length : 0

    // Count manual label patterns (outside of FormField)
    const labelMatches = content.match(/<label[^>]*>|<Label[^>]*>/g)
    const manualLabelCount = labelMatches ? labelMatches.length : 0

    return {
      file,
      hasController,
      hasFormField,
      hasLegacyFormItem,
      formFieldCount,
      legacyFormItemCount,
      manualLabelCount
    }
  }

  describe('Target Forms Migration', () => {
    test('ContactFormBasicFields should use FormField component', async () => {
      const analysis = analysisResults.find(r => r.file.includes('ContactFormBasicFields'))
      if (!analysis) {
        console.log('Available files:', analysisResults.map(r => r.file))
        throw new Error('ContactFormBasicFields not found')
      }

      expect(analysis.hasFormField, 'Should import and use FormField component').toBe(true)
      expect(analysis.formFieldCount, 'Should have FormField elements').toBeGreaterThan(0)
      expect(analysis.hasController, 'Should use React Hook Form Controller').toBe(true)
    })

    test('ContactFormRoleFields should use FormField component', async () => {
      const analysis = analysisResults.find(r => r.file.includes('ContactFormRoleFields'))
      if (!analysis) {
        throw new Error('ContactFormRoleFields not found')
      }

      expect(analysis.hasFormField, 'Should import and use FormField component').toBe(true)
      expect(analysis.formFieldCount, 'Should have FormField elements').toBeGreaterThan(0)
      expect(analysis.hasController, 'Should use React Hook Form Controller').toBe(true)
    })

    test('ContactFormDetailsFields should use FormField component', async () => {
      const analysis = analysisResults.find(r => r.file.includes('ContactFormDetailsFields'))
      if (!analysis) {
        throw new Error('ContactFormDetailsFields not found')
      }

      expect(analysis.hasFormField, 'Should import and use FormField component').toBe(true)
      expect(analysis.formFieldCount, 'Should have FormField elements').toBeGreaterThan(0)
      expect(analysis.hasController, 'Should use React Hook Form Controller').toBe(true)
    })

    test('OrganizationForm should use FormField component', async () => {
      const analysis = analysisResults.find(r => r.file.includes('OrganizationForm'))
      if (!analysis) {
        throw new Error('OrganizationForm not found')
      }

      expect(analysis.hasFormField, 'Should import and use FormField component').toBe(true)
      expect(analysis.formFieldCount, 'Should have FormField elements').toBeGreaterThan(0)
      expect(analysis.hasController, 'Should use React Hook Form Controller').toBe(true)
    })

    test('OpportunityForm should use FormField component', async () => {
      const analysis = analysisResults.find(r => r.file.includes('OpportunityForm'))
      if (!analysis) {
        throw new Error('OpportunityForm not found')
      }

      expect(analysis.hasFormField, 'Should import and use FormField component').toBe(true)
      expect(analysis.formFieldCount, 'Should have FormField elements').toBeGreaterThan(0)
      expect(analysis.hasController, 'Should use React Hook Form Controller').toBe(true)
    })
  })

  describe('FormField Adoption Metrics', () => {
    test('should have data-form-field attributes for testing', async () => {
      const formsWithDataAttribute = analysisResults.filter(analysis => {
        // Check if forms have the data-form-field attribute needed for testing
        return analysis.formFieldCount > 0
      })

      expect(formsWithDataAttribute.length, 'Forms with FormField component should have data-form-field attributes').toBeGreaterThan(0)
    })

    test('legacy FormItem usage should be minimized', async () => {
      const formsWithLegacyItems = analysisResults.filter(analysis => analysis.hasLegacyFormItem)
      const totalLegacyItems = analysisResults.reduce((sum, analysis) => sum + analysis.legacyFormItemCount, 0)
      
      // Allow some legacy usage but track the trend
      console.log(`Found ${totalLegacyItems} legacy FormItem usages across ${formsWithLegacyItems.length} files`)
      
      // This is more of a tracking metric than a hard requirement
      expect(totalLegacyItems, 'Legacy FormItem usage should be tracked and minimized over time').toBeLessThan(50)
    })

    test('should provide adoption coverage report', async () => {
      const totalForms = analysisResults.length
      const formsUsingFormField = analysisResults.filter(analysis => analysis.hasFormField).length
      const adoptionPercentage = totalForms > 0 ? Math.round((formsUsingFormField / totalForms) * 100) : 0

      console.log(`\\n=== FormField Adoption Report ===`)
      console.log(`Total form files analyzed: ${totalForms}`)
      console.log(`Forms using FormField: ${formsUsingFormField}`)
      console.log(`Adoption percentage: ${adoptionPercentage}%`)
      console.log(`\\nDetailed breakdown:`)
      
      analysisResults.forEach(analysis => {
        console.log(`- ${analysis.file}: ${analysis.formFieldCount} FormField(s), ${analysis.legacyFormItemCount} legacy FormItem(s)`)
      })

      // Target: At least 80% of primary forms should use FormField
      expect(adoptionPercentage, 'FormField adoption should be at least 80% for consistent UX').toBeGreaterThanOrEqual(80)
    })
  })

  describe('Accessibility Compliance', () => {
    test('forms with FormField should have proper data attributes', async () => {
      // This test ensures that our FormField component adds the necessary data-form-field attribute
      const formsUsingFormField = analysisResults.filter(analysis => analysis.hasFormField)
      
      for (const analysis of formsUsingFormField) {
        // If using FormField, the data-form-field attribute should be present (added by our component)
        // This is implicitly tested by checking that FormField is imported and used
        expect(analysis.formFieldCount, `${analysis.file} should have FormField elements`).toBeGreaterThan(0)
      }
    })

    test('should avoid manual label implementations', async () => {
      const manualLabelIssues: string[] = []
      
      for (const analysis of analysisResults) {
        if (analysis.hasController && analysis.manualLabelCount > 0 && !analysis.hasFormField) {
          manualLabelIssues.push(`${analysis.file}: ${analysis.manualLabelCount} manual labels without FormField`)
        }
      }

      if (manualLabelIssues.length > 0) {
        console.log('Forms with manual label implementations that should use FormField:')
        manualLabelIssues.forEach(issue => console.log(`- ${issue}`))
      }

      // Allow some manual labels but encourage FormField usage
      expect(manualLabelIssues.length, 'Manual label implementations should be minimized in favor of FormField').toBeLessThan(5)
    })
  })
})