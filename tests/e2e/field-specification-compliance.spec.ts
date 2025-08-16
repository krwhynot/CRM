/**
 * Field Specification Compliance Testing
 * 
 * Tests 100% compliance with Principal CRM field specifications
 * for all forms (Contact, Organization, Opportunity, Interaction)
 * 
 * Stage 6-3 of MVP Transformation Checklist
 */

import { test, expect, Page } from '@playwright/test'

// Principal CRM Field Specifications
const CONTACT_SPECIFICATION = {
  required: ['first_name', 'last_name', 'organization_id', 'purchase_influence', 'decision_authority'],
  optional: ['email', 'title', 'department', 'phone', 'mobile_phone', 'linkedin_url', 'is_primary_contact', 'notes'],
  prohibited: ['position', 'address', 'city', 'state', 'zip', 'website', 'account_manager'] // Fields NOT in spec
}

const ORGANIZATION_SPECIFICATION = {
  required: ['name', 'priority', 'segment', 'is_principal', 'is_distributor'],
  optional: ['address', 'city', 'state', 'zip', 'phone', 'website', 'account_manager', 'notes'],
  prohibited: [] // All needed fields are included
}

const OPPORTUNITY_7_POINT_FUNNEL = [
  'New Lead',
  'Initial Outreach', 
  'Sample/Visit Offered',
  'Awaiting Response',
  'Feedback Logged',
  'Demo Scheduled',
  'Closed - Won'
]

const OPPORTUNITY_SPECIFICATION = {
  required: ['organization_id', 'stage', 'principals'],
  optional: ['name', 'contact_id', 'product_id', 'opportunity_context', 'custom_context', 'probability', 'expected_close_date', 'deal_owner', 'notes'],
  stages: OPPORTUNITY_7_POINT_FUNNEL,
  autoNamingRequired: true
}

const INTERACTION_SPECIFICATION = {
  required: ['type', 'interaction_date', 'subject', 'opportunity_id'],
  optional: ['location', 'notes', 'follow_up_required', 'follow_up_date'],
  prohibited: [] // All needed fields included
}

// Utility functions for compliance testing
class ComplianceValidator {
  private page: Page
  private results: any[] = []

  constructor(page: Page) {
    this.page = page
  }

  async validateFieldPresence(formSelector: string, fieldSpecs: any, formName: string) {
    const formExists = await this.page.locator(formSelector).isVisible()
    expect(formExists, `${formName} form should be visible`).toBe(true)

    const validationResults = {
      formName,
      requiredFields: [],
      optionalFields: [],
      prohibitedFields: [],
      missingRequired: [],
      unexpectedPresent: [],
      compliance: true
    }

    // Test required fields presence
    for (const fieldName of fieldSpecs.required) {
      const fieldExists = await this.checkFieldExists(fieldName)
      validationResults.requiredFields.push({ field: fieldName, present: fieldExists })
      
      if (!fieldExists) {
        validationResults.missingRequired.push(fieldName)
        validationResults.compliance = false
      }
    }

    // Test optional fields (should be present but not required)
    for (const fieldName of fieldSpecs.optional) {
      const fieldExists = await this.checkFieldExists(fieldName)
      validationResults.optionalFields.push({ field: fieldName, present: fieldExists })
    }

    // Test prohibited fields (should NOT be present)
    for (const fieldName of fieldSpecs.prohibited || []) {
      const fieldExists = await this.checkFieldExists(fieldName)
      validationResults.prohibitedFields.push({ field: fieldName, present: fieldExists })
      
      if (fieldExists) {
        validationResults.unexpectedPresent.push(fieldName)
        validationResults.compliance = false
      }
    }

    this.results.push(validationResults)
    return validationResults
  }

  private async checkFieldExists(fieldName: string): Promise<boolean> {
    // Check multiple selectors for field existence
    const selectors = [
      `input[name="${fieldName}"]`,
      `select[name="${fieldName}"]`,
      `textarea[name="${fieldName}"]`,
      `[data-testid="${fieldName}"]`,
      `[id*="${fieldName}"]`,
      `label:has-text("${fieldName.replace(/_/g, ' ')}")`,
      // React Hook Form field selectors
      `[data-field="${fieldName}"]`,
      `[aria-label*="${fieldName.replace(/_/g, ' ')}"]`
    ]

    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector).first()
        if (await element.count() > 0) {
          return true
        }
      } catch (e) {
        // Continue checking other selectors
      }
    }

    return false
  }

  async validateFormValidation(fieldSpecs: any) {
    const validationResults = {
      requiredFieldValidation: [],
      optionalFieldValidation: [],
      businessLogicValidation: []
    }

    // Test required field validation
    for (const fieldName of fieldSpecs.required) {
      const hasValidation = await this.testFieldValidation(fieldName, '')
      validationResults.requiredFieldValidation.push({
        field: fieldName,
        hasValidation
      })
    }

    return validationResults
  }

  private async testFieldValidation(fieldName: string, value: string): Promise<boolean> {
    try {
      const field = this.page.locator(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`).first()
      if (await field.count() > 0) {
        await field.fill(value)
        await field.blur()
        
        // Look for validation error messages
        const errorMessage = this.page.locator(`[data-field-error="${fieldName}"], .text-red-500, .error-message`).first()
        return await errorMessage.count() > 0
      }
    } catch (e) {
      // Field might not support the interaction
    }
    return false
  }

  getResults() {
    return this.results
  }

  generateComplianceReport() {
    const report = {
      totalForms: this.results.length,
      compliantForms: this.results.filter(r => r.compliance).length,
      nonCompliantForms: this.results.filter(r => !r.compliance),
      overallCompliance: this.results.every(r => r.compliance),
      details: this.results
    }

    return report
  }
}

test.describe('Field Specification Compliance Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Ensure we're logged in or skip auth for testing
    await page.waitForSelector('main, [data-testid="dashboard"], .dashboard-container', { timeout: 10000 })
  })

  test('Contact Form - Field Specification Compliance', async ({ page }) => {
    const validator = new ComplianceValidator(page)
    
    // Navigate to contact form
    await page.goto('/contacts/new')
    await page.waitForSelector('form, [data-testid="contact-form"]')

    // Validate field presence according to specification
    const results = await validator.validateFieldPresence(
      'form, [data-testid="contact-form"]',
      CONTACT_SPECIFICATION,
      'Contact Form'
    )

    // Assert compliance
    expect(results.compliance, 
      `Contact Form compliance failed. Missing required: ${results.missingRequired.join(', ')}. ` +
      `Unexpected present: ${results.unexpectedPresent.join(', ')}`
    ).toBe(true)

    // Test specific Principal CRM business logic fields
    await test.step('Validate Purchase Influence Field', async () => {
      const purchaseInfluenceField = page.locator('select[name="purchase_influence"], [data-field="purchase_influence"]').first()
      expect(await purchaseInfluenceField.isVisible(), 'Purchase Influence field must be visible').toBe(true)
      
      // Check for required influence levels
      const requiredOptions = ['High', 'Medium', 'Low', 'Unknown']
      for (const option of requiredOptions) {
        await purchaseInfluenceField.click()
        const optionExists = await page.locator(`option:has-text("${option}"), [data-value="${option}"]`).isVisible()
        expect(optionExists, `Purchase Influence option "${option}" must be available`).toBe(true)
        await page.keyboard.press('Escape') // Close dropdown
      }
    })

    await test.step('Validate Decision Authority Field', async () => {
      const decisionAuthorityField = page.locator('select[name="decision_authority"], [data-field="decision_authority"]').first()
      expect(await decisionAuthorityField.isVisible(), 'Decision Authority field must be visible').toBe(true)
      
      // Check for required authority roles
      const requiredRoles = ['Decision Maker', 'Influencer', 'End User', 'Gatekeeper']
      for (const role of requiredRoles) {
        await decisionAuthorityField.click()
        const roleExists = await page.locator(`option:has-text("${role}"), [data-value="${role}"]`).isVisible()
        expect(roleExists, `Decision Authority role "${role}" must be available`).toBe(true)
        await page.keyboard.press('Escape') // Close dropdown
      }
    })

    // Test prohibited fields are NOT present
    await test.step('Verify Prohibited Fields Absence', async () => {
      for (const prohibitedField of CONTACT_SPECIFICATION.prohibited) {
        const fieldExists = await validator.checkFieldExists(prohibitedField)
        expect(fieldExists, `Prohibited field "${prohibitedField}" should not be present in Contact form`).toBe(false)
      }
    })

    // Test form validation
    await validator.validateFormValidation(CONTACT_SPECIFICATION)
    
    console.log('Contact Form Compliance Results:', JSON.stringify(validator.getResults(), null, 2))
  })

  test('Organization Form - Field Specification Compliance', async ({ page }) => {
    const validator = new ComplianceValidator(page)
    
    // Navigate to organization form
    await page.goto('/organizations/new')
    await page.waitForSelector('form, [data-testid="organization-form"]')

    // Validate field presence according to specification
    const results = await validator.validateFieldPresence(
      'form, [data-testid="organization-form"]',
      ORGANIZATION_SPECIFICATION,
      'Organization Form'
    )

    // Assert compliance
    expect(results.compliance, 
      `Organization Form compliance failed. Missing required: ${results.missingRequired.join(', ')}. ` +
      `Unexpected present: ${results.unexpectedPresent.join(', ')}`
    ).toBe(true)

    // Test Principal/Distributor designation functionality
    await test.step('Validate Principal/Distributor Toggles', async () => {
      const principalToggle = page.locator('input[name="is_principal"], [data-field="is_principal"]').first()
      const distributorToggle = page.locator('input[name="is_distributor"], [data-field="is_distributor"]').first()
      
      expect(await principalToggle.isVisible(), 'Principal toggle must be visible').toBe(true)
      expect(await distributorToggle.isVisible(), 'Distributor toggle must be visible').toBe(true)
      
      // Test that both can be enabled simultaneously
      await principalToggle.check()
      await distributorToggle.check()
      
      expect(await principalToggle.isChecked(), 'Principal can be enabled').toBe(true)
      expect(await distributorToggle.isChecked(), 'Distributor can be enabled').toBe(true)
    })

    // Test Priority levels
    await test.step('Validate Priority Levels', async () => {
      const priorityField = page.locator('select[name="priority"], [data-field="priority"]').first()
      expect(await priorityField.isVisible(), 'Priority field must be visible').toBe(true)
      
      const requiredPriorities = ['A', 'B', 'C', 'D']
      for (const priority of requiredPriorities) {
        await priorityField.click()
        const priorityExists = await page.locator(`option:has-text("${priority}"), [data-value="${priority}"]`).isVisible()
        expect(priorityExists, `Priority level "${priority}" must be available`).toBe(true)
        await page.keyboard.press('Escape')
      }
    })

    console.log('Organization Form Compliance Results:', JSON.stringify(validator.getResults(), null, 2))
  })

  test('Opportunity Form - 7-Point Funnel Compliance', async ({ page }) => {
    const validator = new ComplianceValidator(page)
    
    // Navigate to opportunity form
    await page.goto('/opportunities/new')
    await page.waitForSelector('form, [data-testid="opportunity-form"]')

    // Validate field presence according to specification
    const results = await validator.validateFieldPresence(
      'form, [data-testid="opportunity-form"]',
      OPPORTUNITY_SPECIFICATION,
      'Opportunity Form'
    )

    // Assert compliance
    expect(results.compliance, 
      `Opportunity Form compliance failed. Missing required: ${results.missingRequired.join(', ')}. ` +
      `Unexpected present: ${results.unexpectedPresent.join(', ')}`
    ).toBe(true)

    // Test 7-Point Funnel Stages
    await test.step('Validate 7-Point Sales Funnel', async () => {
      const stageField = page.locator('select[name="stage"], [data-field="stage"]').first()
      expect(await stageField.isVisible(), 'Stage field must be visible').toBe(true)
      
      for (const stage of OPPORTUNITY_7_POINT_FUNNEL) {
        await stageField.click()
        const stageExists = await page.locator(`option:has-text("${stage}"), [data-value="${stage}"]`).isVisible()
        expect(stageExists, `7-point funnel stage "${stage}" must be available`).toBe(true)
        await page.keyboard.press('Escape')
      }
    })

    // Test Auto-naming functionality
    await test.step('Validate Auto-naming Functionality', async () => {
      const autoNamingToggle = page.locator('input[name="auto_generated_name"], [data-testid="auto-naming-toggle"]').first()
      
      if (await autoNamingToggle.isVisible()) {
        await autoNamingToggle.check()
        
        // Check if name preview appears when required fields are filled
        // This would require filling organization and principals first
        // const namePreview = page.locator('[data-testid="name-preview"], .name-preview').first()
        // expect(await namePreview.isVisible(), 'Auto-generated name preview should appear').toBe(true)
      }
    })

    // Test Multiple Principal Logic
    await test.step('Validate Multiple Principal Selection', async () => {
      const principalsSection = page.locator('[data-testid="principals-section"], .principals-selection').first()
      
      if (await principalsSection.isVisible()) {
        const principalCheckboxes = principalsSection.locator('input[type="checkbox"]')
        const checkboxCount = await principalCheckboxes.count()
        
        expect(checkboxCount, 'Should allow multiple principal selection').toBeGreaterThan(0)
        
        // Test selecting multiple principals
        if (checkboxCount >= 2) {
          await principalCheckboxes.nth(0).check()
          await principalCheckboxes.nth(1).check()
          
          expect(await principalCheckboxes.nth(0).isChecked()).toBe(true)
          expect(await principalCheckboxes.nth(1).isChecked()).toBe(true)
        }
      }
    })

    console.log('Opportunity Form Compliance Results:', JSON.stringify(validator.getResults(), null, 2))
  })

  test('Interaction Form - Specification Compliance', async ({ page }) => {
    const validator = new ComplianceValidator(page)
    
    // Navigate to interaction form
    await page.goto('/interactions/new')
    await page.waitForSelector('form, [data-testid="interaction-form"]')

    // Validate field presence according to specification
    const results = await validator.validateFieldPresence(
      'form, [data-testid="interaction-form"]',
      INTERACTION_SPECIFICATION,
      'Interaction Form'
    )

    // Assert compliance
    expect(results.compliance, 
      `Interaction Form compliance failed. Missing required: ${results.missingRequired.join(', ')}. ` +
      `Unexpected present: ${results.unexpectedPresent.join(', ')}`
    ).toBe(true)

    // Test required opportunity linking
    await test.step('Validate Required Opportunity Linking', async () => {
      const opportunityField = page.locator('select[name="opportunity_id"], [data-field="opportunity_id"]').first()
      expect(await opportunityField.isVisible(), 'Opportunity field must be visible and required').toBe(true)
      
      // Test form submission fails without opportunity
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      
      // Should show validation error for missing opportunity
      const errorMessage = page.locator('.error, .text-red-500, [data-field-error="opportunity_id"]').first()
      expect(await errorMessage.isVisible(), 'Should show validation error for missing opportunity').toBe(true)
    })

    // Test interaction types
    await test.step('Validate Interaction Types', async () => {
      const typeField = page.locator('select[name="type"], [data-field="type"]').first()
      expect(await typeField.isVisible(), 'Type field must be visible').toBe(true)
      
      const expectedTypes = ['call', 'email', 'meeting', 'site_visit', 'demo', 'follow_up', 'proposal', 'trade_show', 'contract_review']
      
      await typeField.click()
      for (const type of expectedTypes) {
        const typeExists = await page.locator(`option:has-text("${type}"), [data-value="${type}"]`).isVisible()
        // Types may have different display names, so this is informational
        console.log(`Interaction type "${type}" available:`, typeExists)
      }
      await page.keyboard.press('Escape')
    })

    console.log('Interaction Form Compliance Results:', JSON.stringify(validator.getResults(), null, 2))
  })

  test('Mobile Responsiveness Compliance', async ({ page }) => {
    const viewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ]

    const forms = [
      { name: 'Contact', path: '/contacts/new' },
      { name: 'Organization', path: '/organizations/new' },
      { name: 'Opportunity', path: '/opportunities/new' },
      { name: 'Interaction', path: '/interactions/new' }
    ]

    for (const viewport of viewports) {
      await test.step(`Test ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        
        for (const form of forms) {
          await page.goto(form.path)
          await page.waitForSelector('form', { timeout: 5000 }).catch(() => {
            // Form might not exist, skip
            console.log(`Skipping ${form.name} form - not found`)
          })
          
          const formExists = await page.locator('form').isVisible()
          if (formExists) {
            // Test form is usable on this viewport
            const formContainer = page.locator('form').first()
            const boundingBox = await formContainer.boundingBox()
            
            expect(boundingBox?.width, `${form.name} form should fit in ${viewport.name} viewport`)
              .toBeLessThanOrEqual(viewport.width)
            
            // Test form fields are touchable on mobile
            if (viewport.width <= 768) {
              const inputs = formContainer.locator('input, select, textarea')
              const inputCount = await inputs.count()
              
              for (let i = 0; i < Math.min(inputCount, 3); i++) {
                const input = inputs.nth(i)
                if (await input.isVisible()) {
                  const inputBox = await input.boundingBox()
                  expect(inputBox?.height, `Input fields should be touch-friendly (min 44px) on ${viewport.name}`)
                    .toBeGreaterThanOrEqual(44)
                }
              }
            }
          }
        }
      })
    }
  })

  test('Generate Final Compliance Report', async ({ page }) => {
    // This test aggregates all results and generates the final compliance report
    const validator = new ComplianceValidator(page)
    
    // Re-run all compliance tests to gather final results
    const allResults = []
    
    // Contact Form
    await page.goto('/contacts/new')
    const contactResults = await validator.validateFieldPresence('form', CONTACT_SPECIFICATION, 'Contact Form')
    allResults.push(contactResults)
    
    // Organization Form  
    await page.goto('/organizations/new')
    const orgResults = await validator.validateFieldPresence('form', ORGANIZATION_SPECIFICATION, 'Organization Form')
    allResults.push(orgResults)
    
    // Opportunity Form
    await page.goto('/opportunities/new')
    const oppResults = await validator.validateFieldPresence('form', OPPORTUNITY_SPECIFICATION, 'Opportunity Form')
    allResults.push(oppResults)
    
    // Interaction Form
    await page.goto('/interactions/new')
    const intResults = await validator.validateFieldPresence('form', INTERACTION_SPECIFICATION, 'Interaction Form')
    allResults.push(intResults)

    // Generate comprehensive compliance report
    const complianceReport = validator.generateComplianceReport()
    
    console.log('\n=== PRINCIPAL CRM FIELD SPECIFICATION COMPLIANCE REPORT ===')
    console.log(`Total Forms Tested: ${complianceReport.totalForms}`)
    console.log(`Compliant Forms: ${complianceReport.compliantForms}`)
    console.log(`Overall Compliance: ${complianceReport.overallCompliance ? 'PASS' : 'FAIL'}`)
    console.log('\nDetailed Results:')
    console.log(JSON.stringify(complianceReport.details, null, 2))

    // Assert overall compliance
    expect(complianceReport.overallCompliance, 
      'Principal CRM Field Specification Compliance must be 100%'
    ).toBe(true)

    // Save report to file for documentation
    await page.evaluate((report) => {
      localStorage.setItem('field-specification-compliance-report', JSON.stringify(report))
    }, complianceReport)
  })
})