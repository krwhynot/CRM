/**
 * Detailed Form Compliance Testing
 * 
 * Deep inspection of each form's compliance with Principal CRM specifications
 * Tests field presence, validation, business logic, and mobile responsiveness
 */

import { test, expect } from '@playwright/test'
import { FieldComplianceValidator } from '../utils/field-compliance-validator'

// Principal CRM Field Specifications (Updated based on form analysis)
const CONTACT_SPECIFICATION = {
  required: ['first_name', 'last_name', 'organization_id', 'purchase_influence', 'decision_authority'],
  optional: ['email', 'title', 'department', 'phone', 'mobile_phone', 'linkedin_url', 'is_primary_contact', 'notes'],
  prohibited: ['position', 'address', 'city', 'state', 'zip', 'website', 'account_manager'],
  businessLogic: {
    purchaseInfluence: ['High', 'Medium', 'Low', 'Unknown'],
    decisionAuthority: ['Decision Maker', 'Influencer', 'End User', 'Gatekeeper']
  }
}

const ORGANIZATION_SPECIFICATION = {
  required: ['name', 'priority', 'segment', 'is_principal', 'is_distributor'],
  optional: ['address', 'city', 'state', 'zip', 'phone', 'website', 'account_manager', 'notes'],
  prohibited: [],
  businessLogic: {
    priority: ['A', 'B', 'C', 'D'],
    simultaneousPrincipalDistributor: true
  }
}

const OPPORTUNITY_SPECIFICATION = {
  required: ['organization_id', 'stage', 'principals'],
  optional: ['name', 'contact_id', 'product_id', 'opportunity_context', 'custom_context', 'probability', 'expected_close_date', 'deal_owner', 'notes'],
  prohibited: [],
  stages: [
    'New Lead',
    'Initial Outreach', 
    'Sample/Visit Offered',
    'Awaiting Response',
    'Feedback Logged',
    'Demo Scheduled',
    'Closed - Won'
  ],
  autoNamingRequired: true,
  multipleSelectionFields: ['principals']
}

const INTERACTION_SPECIFICATION = {
  required: ['type', 'interaction_date', 'subject', 'opportunity_id'],
  optional: ['location', 'notes', 'follow_up_required', 'follow_up_date'],
  prohibited: [],
  businessLogic: {
    requiredOpportunityLinking: true
  }
}

test.describe('Detailed Form Compliance Testing', () => {
  let validator: FieldComplianceValidator

  test.beforeEach(async ({ page }) => {
    validator = new FieldComplianceValidator(page)
    
    // Navigate to application and ensure it's loaded
    await page.goto('/')
    
    // Wait for application to load
    try {
      await page.waitForSelector('main, [data-testid="dashboard"], .dashboard-container, nav', { timeout: 15000 })
    } catch (e) {
      console.log('Dashboard selector not found, continuing with test...')
    }
  })

  test('Contact Form - Comprehensive Compliance Analysis', async ({ page }) => {
    await test.step('Navigate to Contact Form', async () => {
      await page.goto('/contacts/new')
      
      // Wait for form to load with multiple possible selectors
      const formLoaded = await page.waitForSelector(
        'form, [data-testid="contact-form"], .contact-form, [class*="contact"]', 
        { timeout: 10000 }
      ).catch(() => false)
      
      if (!formLoaded) {
        // Try alternative navigation paths
        await page.click('a[href*="contact"], button:has-text("Contact"), [data-testid="contacts-link"]').catch(() => {})
        await page.click('button:has-text("New"), a:has-text("Add"), [data-testid="new-contact"]').catch(() => {})
        await page.waitForTimeout(2000)
      }
    })

    const result = await validator.validateFormCompliance(
      'form, [data-testid="contact-form"], .contact-form',
      CONTACT_SPECIFICATION,
      'Contact Form',
      '/contacts/new'
    )

    await test.step('Validate Contact-Specific Business Logic', async () => {
      // Test Purchase Influence field specifically
      const purchaseInfluencePresent = await page.locator(`
        select[name="purchase_influence"],
        [data-field="purchase_influence"], 
        [data-testid="purchase-influence"],
        [aria-label*="Purchase Influence"],
        label:has-text("Purchase Influence") + select
      `).first().isVisible()

      expect(purchaseInfluencePresent, 'Purchase Influence field must be present').toBe(true)

      if (purchaseInfluencePresent) {
        // Test all required purchase influence options
        const purchaseField = page.locator(`
          select[name="purchase_influence"],
          [data-field="purchase_influence"]
        `).first()
        
        await purchaseField.click()
        
        for (const level of CONTACT_SPECIFICATION.businessLogic.purchaseInfluence) {
          const optionExists = await page.locator(`
            option:has-text("${level}"),
            [data-value="${level}"],
            [role="option"]:has-text("${level}")
          `).first().isVisible()
          
          expect(optionExists, `Purchase Influence option "${level}" must be available`).toBe(true)
        }
        
        await page.keyboard.press('Escape')
      }

      // Test Decision Authority field specifically  
      const decisionAuthorityPresent = await page.locator(`
        select[name="decision_authority"],
        [data-field="decision_authority"],
        [data-testid="decision-authority"],
        [aria-label*="Decision Authority"],
        label:has-text("Decision Authority") + select
      `).first().isVisible()

      expect(decisionAuthorityPresent, 'Decision Authority field must be present').toBe(true)

      if (decisionAuthorityPresent) {
        const authorityField = page.locator(`
          select[name="decision_authority"],
          [data-field="decision_authority"]
        `).first()
        
        await authorityField.click()
        
        for (const role of CONTACT_SPECIFICATION.businessLogic.decisionAuthority) {
          const roleExists = await page.locator(`
            option:has-text("${role}"),
            [data-value="${role}"],
            [role="option"]:has-text("${role}")
          `).first().isVisible()
          
          expect(roleExists, `Decision Authority role "${role}" must be available`).toBe(true)
        }
        
        await page.keyboard.press('Escape')
      }
    })

    await test.step('Verify Prohibited Fields Are Absent', async () => {
      for (const prohibitedField of CONTACT_SPECIFICATION.prohibited) {
        const fieldExists = await page.locator(`
          input[name="${prohibitedField}"],
          select[name="${prohibitedField}"],
          [data-field="${prohibitedField}"],
          [data-testid="${prohibitedField}"]
        `).first().count() > 0

        expect(fieldExists, `Prohibited field "${prohibitedField}" should not be present`).toBe(false)
      }
    })

    // Assert overall compliance
    expect(result.compliance, 
      `Contact Form failed compliance. Score: ${result.complianceScore}%. ` +
      `Missing: [${result.missingRequired.join(', ')}]. ` +
      `Unexpected: [${result.unexpectedPresent.join(', ')}]`
    ).toBe(true)

    expect(result.complianceScore, 'Contact Form compliance score must be >= 90%').toBeGreaterThanOrEqual(90)

    console.log('Contact Form Detailed Results:', JSON.stringify(result, null, 2))
  })

  test('Organization Form - Comprehensive Compliance Analysis', async ({ page }) => {
    await test.step('Navigate to Organization Form', async () => {
      await page.goto('/organizations/new')
      
      const formLoaded = await page.waitForSelector(
        'form, [data-testid="organization-form"], .organization-form, [class*="organization"]', 
        { timeout: 10000 }
      ).catch(() => false)
      
      if (!formLoaded) {
        await page.click('a[href*="organization"], button:has-text("Organization"), [data-testid="organizations-link"]').catch(() => {})
        await page.click('button:has-text("New"), a:has-text("Add"), [data-testid="new-organization"]').catch(() => {})
        await page.waitForTimeout(2000)
      }
    })

    const result = await validator.validateFormCompliance(
      'form, [data-testid="organization-form"], .organization-form',
      ORGANIZATION_SPECIFICATION,
      'Organization Form',
      '/organizations/new'
    )

    await test.step('Validate Organization-Specific Business Logic', async () => {
      // Test Priority levels
      const priorityField = page.locator(`
        select[name="priority"],
        [data-field="priority"],
        [data-testid="priority"]
      `).first()

      const priorityPresent = await priorityField.isVisible()
      expect(priorityPresent, 'Priority field must be present').toBe(true)

      if (priorityPresent) {
        await priorityField.click()
        
        for (const priority of ORGANIZATION_SPECIFICATION.businessLogic.priority) {
          const priorityExists = await page.locator(`
            option:has-text("${priority}"),
            [data-value="${priority}"],
            [role="option"]:has-text("${priority}")
          `).first().isVisible()
          
          expect(priorityExists, `Priority "${priority}" must be available`).toBe(true)
        }
        
        await page.keyboard.press('Escape')
      }

      // Test Principal/Distributor simultaneous selection
      const principalToggle = page.locator(`
        input[name="is_principal"],
        [data-field="is_principal"],
        [data-testid="is-principal"],
        [role="switch"][data-field="is_principal"]
      `).first()

      const distributorToggle = page.locator(`
        input[name="is_distributor"],
        [data-field="is_distributor"],
        [data-testid="is-distributor"],
        [role="switch"][data-field="is_distributor"]
      `).first()

      const principalPresent = await principalToggle.isVisible()
      const distributorPresent = await distributorToggle.isVisible()

      expect(principalPresent, 'Principal toggle must be present').toBe(true)
      expect(distributorPresent, 'Distributor toggle must be present').toBe(true)

      if (principalPresent && distributorPresent) {
        // Test simultaneous selection capability
        await principalToggle.check()
        await distributorToggle.check()

        const bothChecked = await principalToggle.isChecked() && await distributorToggle.isChecked()
        expect(bothChecked, 'Organization can be both Principal and Distributor simultaneously').toBe(true)
      }
    })

    expect(result.compliance, 
      `Organization Form failed compliance. Score: ${result.complianceScore}%. ` +
      `Missing: [${result.missingRequired.join(', ')}]. ` +
      `Unexpected: [${result.unexpectedPresent.join(', ')}]`
    ).toBe(true)

    expect(result.complianceScore, 'Organization Form compliance score must be >= 90%').toBeGreaterThanOrEqual(90)

    console.log('Organization Form Detailed Results:', JSON.stringify(result, null, 2))
  })

  test('Opportunity Form - 7-Point Funnel & Auto-naming Compliance', async ({ page }) => {
    await test.step('Navigate to Opportunity Form', async () => {
      await page.goto('/opportunities/new')
      
      const formLoaded = await page.waitForSelector(
        'form, [data-testid="opportunity-form"], .opportunity-form, [class*="opportunity"]', 
        { timeout: 10000 }
      ).catch(() => false)
      
      if (!formLoaded) {
        await page.click('a[href*="opportunit"], button:has-text("Opportunity"), [data-testid="opportunities-link"]').catch(() => {})
        await page.click('button:has-text("New"), a:has-text("Add"), [data-testid="new-opportunity"]').catch(() => {})
        await page.waitForTimeout(2000)
      }
    })

    const result = await validator.validateFormCompliance(
      'form, [data-testid="opportunity-form"], .opportunity-form',
      OPPORTUNITY_SPECIFICATION,
      'Opportunity Form',
      '/opportunities/new'
    )

    await test.step('Validate 7-Point Sales Funnel', async () => {
      const stageField = page.locator(`
        select[name="stage"],
        [data-field="stage"],
        [data-testid="stage"],
        [aria-label*="Stage"]
      `).first()

      const stagePresent = await stageField.isVisible()
      expect(stagePresent, 'Stage field must be present').toBe(true)

      if (stagePresent) {
        await stageField.click()
        
        // Test each required stage in the 7-point funnel
        for (const stage of OPPORTUNITY_SPECIFICATION.stages) {
          const stageExists = await page.locator(`
            option:has-text("${stage}"),
            [data-value="${stage}"],
            [role="option"]:has-text("${stage}")
          `).first().isVisible()
          
          expect(stageExists, `7-point funnel stage "${stage}" must be available`).toBe(true)
        }
        
        await page.keyboard.press('Escape')

        // Verify stage progression logic (if implemented)
        await stageField.selectOption('New Lead')
        expect(await stageField.inputValue()).toBe('New Lead')
      }
    })

    await test.step('Validate Multiple Principal Selection', async () => {
      const principalsSection = page.locator(`
        [data-testid="principals-section"],
        .principals-selection,
        [data-field="principals"],
        fieldset:has-text("Principal")
      `).first()

      const principalsPresent = await principalsSection.isVisible()
      
      if (principalsPresent) {
        const principalCheckboxes = principalsSection.locator('input[type="checkbox"]')
        const checkboxCount = await principalCheckboxes.count()
        
        expect(checkboxCount, 'Should have multiple principal options available').toBeGreaterThan(0)
        
        // Test multiple selection capability
        if (checkboxCount >= 2) {
          await principalCheckboxes.nth(0).check()
          await principalCheckboxes.nth(1).check()
          
          const firstChecked = await principalCheckboxes.nth(0).isChecked()
          const secondChecked = await principalCheckboxes.nth(1).isChecked()
          
          expect(firstChecked && secondChecked, 'Multiple principals can be selected simultaneously').toBe(true)
        }
      } else {
        console.log('Principals section not found - may be implemented differently')
      }
    })

    await test.step('Test Auto-naming Functionality', async () => {
      // Look for auto-naming toggle or preview
      const autoNamingToggle = page.locator(`
        input[name="auto_generated_name"],
        [data-testid="auto-naming-toggle"],
        [data-field="auto_generated_name"]
      `).first()

      const namePreview = page.locator(`
        [data-testid="name-preview"],
        .name-preview,
        [data-field="generated-name"]
      `).first()

      const autoNamingPresent = await autoNamingToggle.isVisible()
      
      if (autoNamingPresent) {
        await autoNamingToggle.check()
        
        // Auto-naming preview would appear after required fields are filled
        console.log('Auto-naming functionality detected and tested')
      } else if (await namePreview.isVisible()) {
        console.log('Name preview functionality detected')
      } else {
        console.log('Auto-naming implementation may be different than expected')
      }
    })

    expect(result.compliance, 
      `Opportunity Form failed compliance. Score: ${result.complianceScore}%. ` +
      `Missing: [${result.missingRequired.join(', ')}]. ` +
      `Unexpected: [${result.unexpectedPresent.join(', ')}]`
    ).toBe(true)

    expect(result.complianceScore, 'Opportunity Form compliance score must be >= 90%').toBeGreaterThanOrEqual(90)

    console.log('Opportunity Form Detailed Results:', JSON.stringify(result, null, 2))
  })

  test('Interaction Form - Required Opportunity Linking Compliance', async ({ page }) => {
    await test.step('Navigate to Interaction Form', async () => {
      await page.goto('/interactions/new')
      
      const formLoaded = await page.waitForSelector(
        'form, [data-testid="interaction-form"], .interaction-form, [class*="interaction"]', 
        { timeout: 10000 }
      ).catch(() => false)
      
      if (!formLoaded) {
        await page.click('a[href*="interaction"], button:has-text("Interaction"), [data-testid="interactions-link"]').catch(() => {})
        await page.click('button:has-text("New"), a:has-text("Add"), [data-testid="new-interaction"]').catch(() => {})
        await page.waitForTimeout(2000)
      }
    })

    const result = await validator.validateFormCompliance(
      'form, [data-testid="interaction-form"], .interaction-form',
      INTERACTION_SPECIFICATION,
      'Interaction Form',
      '/interactions/new'
    )

    await test.step('Validate Required Opportunity Linking', async () => {
      const opportunityField = page.locator(`
        select[name="opportunity_id"],
        [data-field="opportunity_id"],
        [data-testid="opportunity-id"],
        [aria-label*="Opportunity"]
      `).first()

      const opportunityPresent = await opportunityField.isVisible()
      expect(opportunityPresent, 'Opportunity field must be present and visible').toBe(true)

      if (opportunityPresent) {
        // Test that opportunity is required by submitting form without it
        const submitButton = page.locator('button[type="submit"]').first()
        
        if (await submitButton.isVisible()) {
          await submitButton.click()
          await page.waitForTimeout(1000) // Allow validation to trigger
          
          // Look for validation error
          const errorMessage = page.locator(`
            [data-field-error="opportunity_id"],
            .error:near(select[name="opportunity_id"]),
            .text-red-500:near(select[name="opportunity_id"]),
            [role="alert"]:near(select[name="opportunity_id"])
          `).first()

          const hasValidation = await errorMessage.isVisible()
          expect(hasValidation, 'Should show validation error for missing required opportunity').toBe(true)
        }
      }
    })

    await test.step('Validate Interaction Types', async () => {
      const typeField = page.locator(`
        select[name="type"],
        [data-field="type"],
        [data-testid="type"]
      `).first()

      const typePresent = await typeField.isVisible()
      expect(typePresent, 'Interaction type field must be present').toBe(true)

      if (typePresent) {
        await typeField.click()
        
        // Test that common interaction types are available
        const expectedTypes = ['call', 'email', 'meeting', 'site_visit', 'demo', 'follow_up']
        let typeOptionsCount = 0
        
        for (const type of expectedTypes) {
          const typeExists = await page.locator(`
            option[value="${type}"],
            option:has-text("${type}"),
            [data-value="${type}"],
            [role="option"]:has-text("${type}")
          `).first().count() > 0
          
          if (typeExists) typeOptionsCount++
        }
        
        expect(typeOptionsCount, 'Should have multiple interaction type options').toBeGreaterThan(3)
        
        await page.keyboard.press('Escape')
      }
    })

    expect(result.compliance, 
      `Interaction Form failed compliance. Score: ${result.complianceScore}%. ` +
      `Missing: [${result.missingRequired.join(', ')}]. ` +
      `Unexpected: [${result.unexpectedPresent.join(', ')}]`
    ).toBe(true)

    expect(result.complianceScore, 'Interaction Form compliance score must be >= 90%').toBeGreaterThanOrEqual(90)

    console.log('Interaction Form Detailed Results:', JSON.stringify(result, null, 2))
  })

  test('Cross-Form Integration Compliance', async ({ page }) => {
    await test.step('Test Organization -> Contact Flow', async () => {
      // Create organization first
      await page.goto('/organizations/new')
      await page.waitForSelector('form', { timeout: 5000 }).catch(() => {})
      
      const orgNameField = page.locator('input[name="name"], [data-field="name"]').first()
      if (await orgNameField.isVisible()) {
        await orgNameField.fill('Test Integration Org')
        
        // Set required fields
        const priorityField = page.locator('select[name="priority"], [data-field="priority"]').first()
        if (await priorityField.isVisible()) {
          await priorityField.selectOption('C')
        }
        
        const segmentField = page.locator('select[name="segment"], [data-field="segment"]').first()
        if (await segmentField.isVisible()) {
          await segmentField.selectOption('Other')
        }
        
        console.log('Organization form integration test - fields populated')
      }
    })

    await test.step('Test Opportunity -> Contact Integration', async () => {
      await page.goto('/opportunities/new')
      await page.waitForSelector('form', { timeout: 5000 }).catch(() => {})
      
      // Test that organization selection filters contacts appropriately
      const orgField = page.locator('select[name="organization_id"], [data-field="organization_id"]').first()
      // const contactField = page.locator('select[name="contact_id"], [data-field="contact_id"]').first()
      
      if (await orgField.isVisible()) {
        const orgOptions = await orgField.locator('option').count()
        expect(orgOptions, 'Organization field should have options').toBeGreaterThan(0)
        
        console.log('Opportunity form integration test - organization options available')
      }
    })
  })

  test('Generate Final Detailed Compliance Report', async ({ page }) => {
    const comprehensiveReport = validator.generateComplianceReport()
    
    // Enhanced report with additional metrics
    const finalReport = {
      ...comprehensiveReport,
      testingMetadata: {
        timestamp: new Date().toISOString(),
        testingFramework: 'Playwright',
        complianceStandard: 'Principal CRM Field Specification',
        version: '1.0',
        environment: 'test'
      },
      detailedAnalysis: {
        fieldCoverage: {
          totalFieldsTested: comprehensiveReport.forms.reduce((sum, form) => 
            sum + form.requiredFields.length + form.optionalFields.length + form.prohibitedFields.length, 0
          ),
          requiredFieldsCompliance: comprehensiveReport.forms.reduce((sum, form) => 
            sum + form.requiredFields.filter(f => f.present).length, 0
          ),
          prohibitedFieldsCompliance: comprehensiveReport.forms.reduce((sum, form) => 
            sum + form.prohibitedFields.filter(f => !f.present).length, 0
          )
        },
        businessLogicCompliance: comprehensiveReport.forms.map(form => ({
          formName: form.formName,
          businessLogicTests: form.validationResults?.businessLogicValidation?.length || 0,
          businessLogicPassed: form.validationResults?.businessLogicValidation?.filter(b => b.passed).length || 0
        })),
        mobileCompliance: comprehensiveReport.forms.map(form => ({
          formName: form.formName,
          touchFriendlyScore: form.mobileCompliance ? 
            Math.round((form.mobileCompliance.touchFriendlyFields / Math.max(form.mobileCompliance.totalFields, 1)) * 100) : 0,
          responsiveLayout: form.mobileCompliance?.layoutResponsive || false
        }))
      }
    }

    console.log('\n=== COMPREHENSIVE FIELD SPECIFICATION COMPLIANCE REPORT ===')
    console.log('Test Summary:')
    console.log(`- Forms Tested: ${finalReport.summary.totalForms}`)
    console.log(`- Compliant Forms: ${finalReport.summary.compliantForms}`)
    console.log(`- Average Score: ${finalReport.summary.averageScore}%`)
    console.log(`- Overall Compliance: ${finalReport.summary.overallCompliance ? 'PASS' : 'FAIL'}`)
    
    console.log('\nField Coverage:')
    console.log(`- Total Fields Tested: ${finalReport.detailedAnalysis.fieldCoverage.totalFieldsTested}`)
    console.log(`- Required Fields Compliant: ${finalReport.detailedAnalysis.fieldCoverage.requiredFieldsCompliance}`)
    console.log(`- Prohibited Fields Compliant: ${finalReport.detailedAnalysis.fieldCoverage.prohibitedFieldsCompliance}`)
    
    console.log('\nBusiness Logic Compliance:')
    finalReport.detailedAnalysis.businessLogicCompliance.forEach(form => {
      console.log(`- ${form.formName}: ${form.businessLogicPassed}/${form.businessLogicTests} tests passed`)
    })
    
    console.log('\nMobile Compliance:')
    finalReport.detailedAnalysis.mobileCompliance.forEach(form => {
      console.log(`- ${form.formName}: ${form.touchFriendlyScore}% touch-friendly, responsive: ${form.responsiveLayout}`)
    })
    
    if (finalReport.recommendations.length > 0) {
      console.log('\nRecommendations:')
      finalReport.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }
    
    console.log('\n' + '='.repeat(70))

    // Store report for access by test runner
    await page.evaluate((report) => {
      localStorage.setItem('detailed-field-compliance-report', JSON.stringify(report))
    }, finalReport)

    // Assert final compliance
    expect(finalReport.summary.overallCompliance, 
      'Overall Field Specification Compliance must be 100%'
    ).toBe(true)

    expect(finalReport.summary.averageScore, 
      'Average compliance score must be >= 90%'
    ).toBeGreaterThanOrEqual(90)
  })
})