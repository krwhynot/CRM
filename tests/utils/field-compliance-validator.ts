/**
 * Field Compliance Validator Utility
 * 
 * Comprehensive utility for validating Principal CRM field specifications
 * Supports DOM inspection, validation testing, and compliance reporting
 */

import { Page } from '@playwright/test'

export interface FieldSpecification {
  required: string[]
  optional: string[]
  prohibited?: string[]
  stages?: string[]
  autoNamingRequired?: boolean
  multipleSelectionFields?: string[]
}

export interface FieldValidationResult {
  field: string
  present: boolean
  accessible: boolean
  hasValidation?: boolean
  validationMessage?: string
  touchFriendly?: boolean
  responsiveLayout?: boolean
}

export interface FormComplianceResult {
  formName: string
  formPath: string
  requiredFields: FieldValidationResult[]
  optionalFields: FieldValidationResult[]
  prohibitedFields: FieldValidationResult[]
  missingRequired: string[]
  unexpectedPresent: string[]
  compliance: boolean
  complianceScore: number
  validationResults: ValidationTestResults
  mobileCompliance: MobileComplianceResult
  timestamp: string
}

export interface ValidationTestResults {
  requiredFieldValidation: FieldValidationResult[]
  businessLogicValidation: BusinessLogicTest[]
  formSubmissionValidation: FormSubmissionTest[]
}

export interface BusinessLogicTest {
  testName: string
  passed: boolean
  details: string
  errorMessage?: string
}

export interface FormSubmissionTest {
  scenario: string
  passed: boolean
  validationTriggered: boolean
  errorCount: number
}

export interface MobileComplianceResult {
  touchFriendlyFields: number
  totalFields: number
  minTouchSize: number
  layoutResponsive: boolean
  viewportCompliance: ViewportTest[]
}

export interface ViewportTest {
  name: string
  width: number
  height: number
  formVisible: boolean
  fieldsUsable: boolean
  layoutOverflow: boolean
}

export class FieldComplianceValidator {
  private page: Page
  private results: FormComplianceResult[] = []
  private currentFormResult: Partial<FormComplianceResult> = {}

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Validate complete form compliance against specification
   */
  async validateFormCompliance(
    formSelector: string, 
    fieldSpecs: FieldSpecification, 
    formName: string,
    formPath: string = ''
  ): Promise<FormComplianceResult> {
    
    this.currentFormResult = {
      formName,
      formPath,
      requiredFields: [],
      optionalFields: [],
      prohibitedFields: [],
      missingRequired: [],
      unexpectedPresent: [],
      compliance: true,
      complianceScore: 0,
      timestamp: new Date().toISOString()
    }

    // Ensure form is visible
    await this.page.waitForSelector(formSelector, { timeout: 10000 })
    const formExists = await this.page.locator(formSelector).isVisible()
    if (!formExists) {
      throw new Error(`Form not found: ${formSelector}`)
    }

    // Validate field presence and accessibility
    await this.validateFieldPresence(fieldSpecs)
    
    // Test form validation logic
    const validationResults = await this.validateFormValidation(fieldSpecs)
    this.currentFormResult.validationResults = validationResults

    // Test mobile compliance
    const mobileCompliance = await this.validateMobileCompliance(formSelector)
    this.currentFormResult.mobileCompliance = mobileCompliance

    // Calculate compliance score
    this.calculateComplianceScore()

    const result = this.currentFormResult as FormComplianceResult
    this.results.push(result)
    return result
  }

  /**
   * Check if field exists and is accessible
   */
  private async validateFieldPresence(fieldSpecs: FieldSpecification): Promise<void> {
    // Test required fields
    for (const fieldName of fieldSpecs.required) {
      const fieldResult = await this.checkFieldAccessibility(fieldName)
      this.currentFormResult.requiredFields!.push(fieldResult)
      
      if (!fieldResult.present) {
        this.currentFormResult.missingRequired!.push(fieldName)
        this.currentFormResult.compliance = false
      }
    }

    // Test optional fields
    for (const fieldName of fieldSpecs.optional) {
      const fieldResult = await this.checkFieldAccessibility(fieldName)
      this.currentFormResult.optionalFields!.push(fieldResult)
    }

    // Test prohibited fields
    for (const fieldName of fieldSpecs.prohibited || []) {
      const fieldResult = await this.checkFieldAccessibility(fieldName)
      this.currentFormResult.prohibitedFields!.push(fieldResult)
      
      if (fieldResult.present) {
        this.currentFormResult.unexpectedPresent!.push(fieldName)
        this.currentFormResult.compliance = false
      }
    }
  }

  /**
   * Check field accessibility and usability
   */
  private async checkFieldAccessibility(fieldName: string): Promise<FieldValidationResult> {
    const selectors = this.getFieldSelectors(fieldName)
    
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector).first()
        const count = await element.count()
        
        if (count > 0) {
          const isVisible = await element.isVisible()
          const isEnabled = await element.isEnabled()
          const boundingBox = await element.boundingBox()
          
          return {
            field: fieldName,
            present: true,
            accessible: isVisible && isEnabled,
            touchFriendly: boundingBox ? boundingBox.height >= 44 : false,
            responsiveLayout: true // Will be validated separately
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    return {
      field: fieldName,
      present: false,
      accessible: false,
      touchFriendly: false,
      responsiveLayout: false
    }
  }

  /**
   * Get possible selectors for a field
   */
  private getFieldSelectors(fieldName: string): string[] {
    const displayName = this.fieldNameToDisplayName(fieldName)
    
    return [
      // Direct name/id selectors
      `input[name="${fieldName}"]`,
      `select[name="${fieldName}"]`,
      `textarea[name="${fieldName}"]`,
      `[data-testid="${fieldName}"]`,
      `[data-field="${fieldName}"]`,
      `[id="${fieldName}"]`,
      `[id$="${fieldName}"]`,
      
      // React Hook Form field selectors
      `[data-field-name="${fieldName}"]`,
      `[aria-labelledby*="${fieldName}"]`,
      
      // Label-based selectors
      `label:has-text("${displayName}") + input`,
      `label:has-text("${displayName}") + select`,
      `label:has-text("${displayName}") + textarea`,
      
      // Partial text matching
      `[aria-label*="${displayName}"]`,
      `[placeholder*="${displayName}"]`,
      
      // Form control containers
      `[data-field-container="${fieldName}"]`,
      `.form-field-${fieldName}`,
      
      // Switch/Toggle specific
      fieldName.startsWith('is_') ? `[role="switch"][data-field="${fieldName}"]` : '',
      fieldName.startsWith('is_') ? `input[type="checkbox"][name="${fieldName}"]` : '',
      
      // Select dropdown specific
      `[data-select="${fieldName}"]`,
      `[data-select-trigger="${fieldName}"]`
    ].filter(Boolean)
  }

  /**
   * Convert field name to display name
   */
  private fieldNameToDisplayName(fieldName: string): string {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Id$/, 'ID')
      .replace(/Url$/, 'URL')
  }

  /**
   * Test form validation logic
   */
  private async validateFormValidation(fieldSpecs: FieldSpecification): Promise<ValidationTestResults> {
    const results: ValidationTestResults = {
      requiredFieldValidation: [],
      businessLogicValidation: [],
      formSubmissionValidation: []
    }

    // Test required field validation
    for (const fieldName of fieldSpecs.required) {
      const validationResult = await this.testFieldValidation(fieldName)
      results.requiredFieldValidation.push(validationResult)
    }

    // Test business logic validation
    if (this.currentFormResult.formName === 'Contact Form') {
      results.businessLogicValidation = await this.testContactBusinessLogic()
    } else if (this.currentFormResult.formName === 'Organization Form') {
      results.businessLogicValidation = await this.testOrganizationBusinessLogic()
    } else if (this.currentFormResult.formName === 'Opportunity Form') {
      results.businessLogicValidation = await this.testOpportunityBusinessLogic(fieldSpecs)
    } else if (this.currentFormResult.formName === 'Interaction Form') {
      results.businessLogicValidation = await this.testInteractionBusinessLogic()
    }

    // Test form submission validation
    results.formSubmissionValidation = await this.testFormSubmissionValidation()

    return results
  }

  /**
   * Test individual field validation
   */
  private async testFieldValidation(fieldName: string): Promise<FieldValidationResult> {
    const fieldResult: FieldValidationResult = {
      field: fieldName,
      present: false,
      accessible: false,
      hasValidation: false
    }

    try {
      const selectors = this.getFieldSelectors(fieldName)
      
      for (const selector of selectors) {
        const field = this.page.locator(selector).first()
        
        if (await field.count() > 0 && await field.isVisible()) {
          fieldResult.present = true
          fieldResult.accessible = await field.isEnabled()
          
          // Test validation by clearing field and checking for error
          if (fieldResult.accessible) {
            await field.clear()
            await field.blur()
            await this.page.waitForTimeout(500) // Wait for validation
            
            // Look for validation error messages
            const errorMessages = [
              `[data-field-error="${fieldName}"]`,
              `[aria-describedby*="${fieldName}"]`,
              '.text-red-500',
              '.error-message',
              '.field-error',
              '[role="alert"]'
            ]
            
            for (const errorSelector of errorMessages) {
              const errorElement = this.page.locator(errorSelector).first()
              if (await errorElement.count() > 0 && await errorElement.isVisible()) {
                fieldResult.hasValidation = true
                fieldResult.validationMessage = await errorElement.textContent() || ''
                break
              }
            }
          }
          break
        }
      }
    } catch (e) {
      console.warn(`Error testing validation for field ${fieldName}:`, e)
    }

    return fieldResult
  }

  /**
   * Test Contact form business logic
   */
  private async testContactBusinessLogic(): Promise<BusinessLogicTest[]> {
    const tests: BusinessLogicTest[] = []

    // Test Purchase Influence options
    try {
      const purchaseInfluenceField = this.page.locator('select[name="purchase_influence"], [data-field="purchase_influence"]').first()
      const requiredOptions = ['High', 'Medium', 'Low', 'Unknown']
      
      if (await purchaseInfluenceField.isVisible()) {
        await purchaseInfluenceField.click()
        let allOptionsPresent = true
        
        for (const option of requiredOptions) {
          const optionExists = await this.page.locator(`option:has-text("${option}"), [data-value="${option}"]`).isVisible()
          if (!optionExists) {
            allOptionsPresent = false
            break
          }
        }
        
        tests.push({
          testName: 'Purchase Influence Options',
          passed: allOptionsPresent,
          details: `Required options: ${requiredOptions.join(', ')}`
        })
        
        await this.page.keyboard.press('Escape')
      }
    } catch (e) {
      tests.push({
        testName: 'Purchase Influence Options',
        passed: false,
        details: 'Field not found or inaccessible',
        errorMessage: String(e)
      })
    }

    // Test Decision Authority options
    try {
      const decisionAuthorityField = this.page.locator('select[name="decision_authority"], [data-field="decision_authority"]').first()
      const requiredRoles = ['Decision Maker', 'Influencer', 'End User', 'Gatekeeper']
      
      if (await decisionAuthorityField.isVisible()) {
        await decisionAuthorityField.click()
        let allRolesPresent = true
        
        for (const role of requiredRoles) {
          const roleExists = await this.page.locator(`option:has-text("${role}"), [data-value="${role}"]`).isVisible()
          if (!roleExists) {
            allRolesPresent = false
            break
          }
        }
        
        tests.push({
          testName: 'Decision Authority Roles',
          passed: allRolesPresent,
          details: `Required roles: ${requiredRoles.join(', ')}`
        })
        
        await this.page.keyboard.press('Escape')
      }
    } catch (e) {
      tests.push({
        testName: 'Decision Authority Roles',
        passed: false,
        details: 'Field not found or inaccessible',
        errorMessage: String(e)
      })
    }

    return tests
  }

  /**
   * Test Organization form business logic
   */
  private async testOrganizationBusinessLogic(): Promise<BusinessLogicTest[]> {
    const tests: BusinessLogicTest[] = []

    // Test Principal/Distributor simultaneous selection
    try {
      const principalToggle = this.page.locator('input[name="is_principal"], [data-field="is_principal"]').first()
      const distributorToggle = this.page.locator('input[name="is_distributor"], [data-field="is_distributor"]').first()
      
      if (await principalToggle.isVisible() && await distributorToggle.isVisible()) {
        await principalToggle.check()
        await distributorToggle.check()
        
        const bothChecked = await principalToggle.isChecked() && await distributorToggle.isChecked()
        
        tests.push({
          testName: 'Principal/Distributor Simultaneous Selection',
          passed: bothChecked,
          details: 'Organizations can be both Principal and Distributor'
        })
      }
    } catch (e) {
      tests.push({
        testName: 'Principal/Distributor Simultaneous Selection',
        passed: false,
        details: 'Toggle fields not found or inaccessible',
        errorMessage: String(e)
      })
    }

    return tests
  }

  /**
   * Test Opportunity form business logic
   */
  private async testOpportunityBusinessLogic(fieldSpecs: FieldSpecification): Promise<BusinessLogicTest[]> {
    const tests: BusinessLogicTest[] = []

    // Test 7-point funnel stages
    if (fieldSpecs.stages) {
      try {
        const stageField = this.page.locator('select[name="stage"], [data-field="stage"]').first()
        
        if (await stageField.isVisible()) {
          await stageField.click()
          let allStagesPresent = true
          
          for (const stage of fieldSpecs.stages) {
            const stageExists = await this.page.locator(`option:has-text("${stage}"), [data-value="${stage}"]`).isVisible()
            if (!stageExists) {
              allStagesPresent = false
              break
            }
          }
          
          tests.push({
            testName: '7-Point Sales Funnel Stages',
            passed: allStagesPresent,
            details: `Required stages: ${fieldSpecs.stages.join(', ')}`
          })
          
          await this.page.keyboard.press('Escape')
        }
      } catch (e) {
        tests.push({
          testName: '7-Point Sales Funnel Stages',
          passed: false,
          details: 'Stage field not found or inaccessible',
          errorMessage: String(e)
        })
      }
    }

    return tests
  }

  /**
   * Test Interaction form business logic
   */
  private async testInteractionBusinessLogic(): Promise<BusinessLogicTest[]> {
    const tests: BusinessLogicTest[] = []

    // Test required opportunity linking
    try {
      const opportunityField = this.page.locator('select[name="opportunity_id"], [data-field="opportunity_id"]').first()
      
      if (await opportunityField.isVisible()) {
        // Try to submit form without selecting opportunity
        const submitButton = this.page.locator('button[type="submit"]').first()
        await submitButton.click()
        
        // Check for validation error
        const errorMessage = this.page.locator('.error, .text-red-500, [data-field-error="opportunity_id"]').first()
        const hasValidation = await errorMessage.isVisible()
        
        tests.push({
          testName: 'Required Opportunity Linking',
          passed: hasValidation,
          details: 'Form should require opportunity selection'
        })
      }
    } catch (e) {
      tests.push({
        testName: 'Required Opportunity Linking',
        passed: false,
        details: 'Opportunity field not found or inaccessible',
        errorMessage: String(e)
      })
    }

    return tests
  }

  /**
   * Test form submission validation
   */
  private async testFormSubmissionValidation(): Promise<FormSubmissionTest[]> {
    const tests: FormSubmissionTest[] = []

    try {
      // Test empty form submission
      const submitButton = this.page.locator('button[type="submit"]').first()
      
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await this.page.waitForTimeout(1000) // Wait for validation
        
        // Count validation errors
        const errorElements = this.page.locator('.error, .text-red-500, [role="alert"], .field-error')
        const errorCount = await errorElements.count()
        
        tests.push({
          scenario: 'Empty Form Submission',
          passed: errorCount > 0,
          validationTriggered: errorCount > 0,
          errorCount
        })
      }
    } catch (e) {
      tests.push({
        scenario: 'Empty Form Submission',
        passed: false,
        validationTriggered: false,
        errorCount: 0
      })
    }

    return tests
  }

  /**
   * Test mobile compliance
   */
  private async validateMobileCompliance(formSelector: string): Promise<MobileComplianceResult> {
    const viewports: ViewportTest[] = []
    const originalViewport = this.page.viewportSize()
    
    const testViewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 }
    ]

    for (const viewport of testViewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height })
      await this.page.waitForTimeout(500) // Allow layout to settle
      
      const formVisible = await this.page.locator(formSelector).isVisible()
      const form = this.page.locator(formSelector)
      const formBoundingBox = await form.boundingBox()
      const layoutOverflow = formBoundingBox ? formBoundingBox.width > viewport.width : true
      
      viewports.push({
        name: viewport.name,
        width: viewport.width,
        height: viewport.height,
        formVisible,
        fieldsUsable: formVisible && !layoutOverflow,
        layoutOverflow
      })
    }

    // Test touch-friendly field sizes on mobile
    await this.page.setViewportSize({ width: 375, height: 667 })
    const inputs = this.page.locator('input, select, textarea, button').all()
    let touchFriendlyCount = 0
    let totalFields = 0

    try {
      const allInputs = await inputs
      for (const input of allInputs) {
        if (await input.isVisible()) {
          totalFields++
          const boundingBox = await input.boundingBox()
          if (boundingBox && boundingBox.height >= 44) {
            touchFriendlyCount++
          }
        }
      }
    } catch (e) {
      console.warn('Error testing touch-friendly fields:', e)
    }

    // Restore original viewport
    if (originalViewport) {
      await this.page.setViewportSize(originalViewport)
    }

    return {
      touchFriendlyFields: touchFriendlyCount,
      totalFields,
      minTouchSize: 44,
      layoutResponsive: viewports.every(v => !v.layoutOverflow),
      viewportCompliance: viewports
    }
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(): void {
    let totalPoints = 0
    let earnedPoints = 0

    // Required fields compliance (40 points)
    const requiredTotal = this.currentFormResult.requiredFields!.length
    const requiredPresent = this.currentFormResult.requiredFields!.filter(f => f.present).length
    totalPoints += 40
    earnedPoints += Math.round((requiredPresent / Math.max(requiredTotal, 1)) * 40)

    // Prohibited fields compliance (20 points)
    const prohibitedTotal = this.currentFormResult.prohibitedFields!.length
    const prohibitedAbsent = this.currentFormResult.prohibitedFields!.filter(f => !f.present).length
    if (prohibitedTotal > 0) {
      totalPoints += 20
      earnedPoints += Math.round((prohibitedAbsent / prohibitedTotal) * 20)
    } else {
      totalPoints += 20
      earnedPoints += 20 // Perfect score if no prohibited fields defined
    }

    // Validation compliance (20 points)
    if (this.currentFormResult.validationResults) {
      const validationTests = this.currentFormResult.validationResults.requiredFieldValidation.length +
                             this.currentFormResult.validationResults.businessLogicValidation.length
      const validationPassed = this.currentFormResult.validationResults.requiredFieldValidation.filter(v => v.hasValidation).length +
                              this.currentFormResult.validationResults.businessLogicValidation.filter(b => b.passed).length
      
      totalPoints += 20
      if (validationTests > 0) {
        earnedPoints += Math.round((validationPassed / validationTests) * 20)
      } else {
        earnedPoints += 20 // No validation tests = perfect score
      }
    }

    // Mobile compliance (20 points)
    if (this.currentFormResult.mobileCompliance) {
      const mobile = this.currentFormResult.mobileCompliance
      const mobileScore = mobile.layoutResponsive ? 10 : 0
      const touchScore = mobile.totalFields > 0 ? 
        Math.round((mobile.touchFriendlyFields / mobile.totalFields) * 10) : 10
      
      totalPoints += 20
      earnedPoints += mobileScore + touchScore
    }

    this.currentFormResult.complianceScore = Math.round((earnedPoints / totalPoints) * 100)
  }

  /**
   * Get all validation results
   */
  getResults(): FormComplianceResult[] {
    return this.results
  }

  /**
   * Generate comprehensive compliance report
   */
  generateComplianceReport(): {
    summary: {
      totalForms: number
      compliantForms: number
      averageScore: number
      overallCompliance: boolean
    }
    forms: FormComplianceResult[]
    recommendations: string[]
  } {
    const compliantForms = this.results.filter(r => r.compliance && r.complianceScore >= 90)
    const averageScore = this.results.length > 0 ? 
      this.results.reduce((sum, r) => sum + r.complianceScore, 0) / this.results.length : 0
    
    const recommendations: string[] = []
    
    // Generate recommendations based on common issues
    const allMissingRequired = this.results.flatMap(r => r.missingRequired)
    const allUnexpectedPresent = this.results.flatMap(r => r.unexpectedPresent)
    
    if (allMissingRequired.length > 0) {
      recommendations.push(`Add missing required fields: ${[...new Set(allMissingRequired)].join(', ')}`)
    }
    
    if (allUnexpectedPresent.length > 0) {
      recommendations.push(`Remove prohibited fields: ${[...new Set(allUnexpectedPresent)].join(', ')}`)
    }

    const lowMobileCompliance = this.results.filter(r => 
      r.mobileCompliance && !r.mobileCompliance.layoutResponsive
    )
    
    if (lowMobileCompliance.length > 0) {
      recommendations.push('Improve mobile responsive layout for better touch accessibility')
    }

    return {
      summary: {
        totalForms: this.results.length,
        compliantForms: compliantForms.length,
        averageScore: Math.round(averageScore),
        overallCompliance: this.results.every(r => r.compliance && r.complianceScore >= 90)
      },
      forms: this.results,
      recommendations
    }
  }
}

export default FieldComplianceValidator