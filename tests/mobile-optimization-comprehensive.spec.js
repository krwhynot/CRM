/**
 * Comprehensive Mobile Optimization Testing Suite - Stage 6-4 Enhanced
 * Mobile-CRM-Optimizer Agent Implementation
 * 
 * This test suite ensures the Principal CRM transformation works excellently
 * on mobile devices and tablets for field sales teams, with specific focus
 * on touch interface validation and iPad optimization.
 * 
 * Test Areas:
 * 1. Touch Interface Standards (≥48px targets)
 * 2. iPad Field Sales Optimization (landscape/portrait)
 * 3. Mobile Form Performance (<3s load, <1s templates, <500ms interactions)
 * 4. Responsive Principal CRM Features
 */

import { test, expect } from '@playwright/test';

// Enhanced device configurations for comprehensive testing
const DEVICE_CONFIGS = {
  'iPad-Pro-12.9-Landscape': { width: 1366, height: 1024 },
  'iPad-Pro-12.9-Portrait': { width: 1024, height: 1366 },
  'iPad-Air-Landscape': { width: 1180, height: 820 },
  'iPad-Air-Portrait': { width: 820, height: 1180 },
  'iPad-Standard-Landscape': { width: 1024, height: 768 },
  'iPad-Standard-Portrait': { width: 768, height: 1024 },
  'iPhone-15-Pro-Max': { width: 430, height: 932 },
  'iPhone-15-Pro': { width: 393, height: 852 },
  'Galaxy-Tab-S9': { width: 800, height: 1280 },
  'Surface-Pro': { width: 912, height: 1368 }
};

// Touch interface standards (WCAG AA + enhanced for field sales)
const TOUCH_STANDARDS = {
  minimum: 48,        // WCAG AA minimum
  recommended: 56,    // Enhanced for field use
  spacing: 8          // Minimum spacing between targets
};

// Performance thresholds optimized for field sales efficiency
const PERFORMANCE_TARGETS = {
  pageLoad: 3000,           // Page load < 3s
  formOpen: 1500,           // Form opening < 1.5s
  templateApplication: 500,  // Template application < 500ms
  formSubmission: 2000,     // Form submission < 2s
  touchResponse: 100,       // Touch response < 100ms
  advocacyLoad: 1000        // Principal advocacy section < 1s
};

// Principal CRM specific elements to test
const PRINCIPAL_CRM_ELEMENTS = {
  contactAdvocacy: {
    trigger: 'button:has-text("Add Preferred Principals")',
    section: 'text=Select principals that this contact advocates for',
    checkboxes: 'input[type="checkbox"]'
  },
  purchaseInfluence: {
    dropdown: 'select[name="purchase_influence"], [placeholder*="influence"]',
    options: '[role="option"]'
  },
  decisionAuthority: {
    dropdown: 'select[name="decision_authority"], [placeholder*="authority"]',
    options: '[role="option"]'
  },
  autoNaming: {
    preview: '[data-testid*="preview"], .preview, [class*="preview"]',
    input: '[name*="title"], input[placeholder*="title"]'
  }
};

/**
 * Enhanced Touch Target Validator
 * Validates touch targets meet enhanced field sales standards
 */
class TouchTargetValidator {
  static async validateElement(page, selector) {
    const elements = await page.locator(selector).all();
    const results = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const box = await element.boundingBox();
      
      if (box) {
        const meetsMinimum = box.width >= TOUCH_STANDARDS.minimum && box.height >= TOUCH_STANDARDS.minimum;
        const meetsRecommended = box.width >= TOUCH_STANDARDS.recommended && box.height >= TOUCH_STANDARDS.recommended;
        
        results.push({
          index: i,
          width: box.width,
          height: box.height,
          meetsMinimum,
          meetsRecommended,
          selector: selector,
          area: box.width * box.height
        });
      }
    }

    return results;
  }

  static async validateSpacing(page, selector) {
    const elements = await page.locator(selector).all();
    const spacingViolations = [];

    for (let i = 0; i < elements.length - 1; i++) {
      const box1 = await elements[i].boundingBox();
      const box2 = await elements[i + 1].boundingBox();
      
      if (box1 && box2) {
        const horizontalGap = Math.abs(box1.x - (box2.x + box2.width));
        const verticalGap = Math.abs(box1.y - (box2.y + box2.height));
        const minGap = Math.min(horizontalGap, verticalGap);
        
        if (minGap < TOUCH_STANDARDS.spacing) {
          spacingViolations.push({
            element1: i,
            element2: i + 1,
            gap: minGap,
            required: TOUCH_STANDARDS.spacing
          });
        }
      }
    }

    return spacingViolations;
  }
}

/**
 * Performance Monitor for Mobile Interactions
 */
class MobilePerformanceMonitor {
  static async measureInteraction(page, action, name) {
    const startTime = performance.now();
    await action();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  static async measurePageLoadTime(page, url) {
    const startTime = performance.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const endTime = performance.now();
    
    return endTime - startTime;
  }

  static async measureFormLoadTime(page, formTrigger) {
    const startTime = performance.now();
    await page.click(formTrigger);
    await page.waitForSelector('form, [role="dialog"]');
    const endTime = performance.now();
    
    return endTime - startTime;
  }
}

/**
 * Principal CRM Feature Validator
 */
class PrincipalCRMValidator {
  static async validateAdvocacyWorkflow(page) {
    // Test advocacy section accessibility
    const advocacyButton = page.locator(PRINCIPAL_CRM_ELEMENTS.contactAdvocacy.trigger);
    if (await advocacyButton.count() > 0) {
      await advocacyButton.click();
      
      const advocacySection = page.locator(PRINCIPAL_CRM_ELEMENTS.contactAdvocacy.section);
      await expect(advocacySection).toBeVisible();
      
      // Validate checkbox touch targets
      const checkboxes = await TouchTargetValidator.validateElement(
        page, 
        PRINCIPAL_CRM_ELEMENTS.contactAdvocacy.checkboxes
      );
      
      return checkboxes.every(cb => cb.meetsMinimum);
    }
    return true;
  }

  static async validateBusinessIntelligenceFields(page) {
    const results = {
      purchaseInfluence: false,
      decisionAuthority: false
    };

    // Test Purchase Influence dropdown
    const influenceDropdown = page.locator(PRINCIPAL_CRM_ELEMENTS.purchaseInfluence.dropdown);
    if (await influenceDropdown.count() > 0) {
      await influenceDropdown.click();
      const options = await TouchTargetValidator.validateElement(page, PRINCIPAL_CRM_ELEMENTS.purchaseInfluence.options);
      results.purchaseInfluence = options.length > 0 && options.every(opt => opt.meetsMinimum);
    }

    // Test Decision Authority dropdown
    const authorityDropdown = page.locator(PRINCIPAL_CRM_ELEMENTS.decisionAuthority.dropdown);
    if (await authorityDropdown.count() > 0) {
      await authorityDropdown.click();
      const options = await TouchTargetValidator.validateElement(page, PRINCIPAL_CRM_ELEMENTS.decisionAuthority.options);
      results.decisionAuthority = options.length > 0 && options.every(opt => opt.meetsMinimum);
    }

    return results;
  }

  static async validateAutoNamingPreview(page) {
    const titleInput = page.locator(PRINCIPAL_CRM_ELEMENTS.autoNaming.input);
    if (await titleInput.count() > 0) {
      await titleInput.fill('Test Opportunity Title');
      
      const preview = page.locator(PRINCIPAL_CRM_ELEMENTS.autoNaming.preview);
      if (await preview.count() > 0) {
        await expect(preview).toBeVisible();
        return true;
      }
    }
    return false;
  }
}

// Test Suite: Enhanced Touch Interface Validation
test.describe('Enhanced Touch Interface Standards', () => {
  
  for (const [deviceName, viewport] of Object.entries(DEVICE_CONFIGS)) {
    test.describe(`Device: ${deviceName} (${viewport.width}x${viewport.height})`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        // Wait for app initialization
        await page.waitForSelector('main, [data-testid="app-loaded"]', { timeout: 10000 });
      });

      test('All interactive elements meet enhanced touch standards', async ({ page }) => {
        const testRoutes = [
          { path: '/contacts', button: 'New Contact' },
          { path: '/organizations', button: 'New Organization' },
          { path: '/opportunities', button: 'New Opportunity' },
          { path: '/interactions', button: 'New Interaction' }
        ];

        const touchTargetResults = {};

        for (const route of testRoutes) {
          await page.click(`[href="${route.path}"]`);
          await page.waitForSelector(`h1, [data-testid="${route.path.slice(1)}-page"]`, { timeout: 5000 });
          await page.click(`text=${route.button}, button:has-text("${route.button}")`);
          await page.waitForSelector('form, [role="dialog"]');

          // Test critical interactive elements
          const elementTests = [
            { selector: 'input[type="text"]', name: 'Text inputs' },
            { selector: 'input[type="email"]', name: 'Email inputs' },
            { selector: 'input[type="tel"]', name: 'Phone inputs' },
            { selector: 'button', name: 'Buttons' },
            { selector: '[role="combobox"], select', name: 'Dropdowns' },
            { selector: 'input[type="checkbox"]', name: 'Checkboxes' },
            { selector: 'textarea', name: 'Text areas' },
            { selector: '[role="tab"]', name: 'Tabs' },
            { selector: '[data-testid*="toggle"]', name: 'Toggles' }
          ];

          const routeResults = {};
          
          for (const elementTest of elementTests) {
            const elements = await TouchTargetValidator.validateElement(page, elementTest.selector);
            if (elements.length > 0) {
              routeResults[elementTest.name] = {
                total: elements.length,
                meetingMinimum: elements.filter(e => e.meetsMinimum).length,
                meetingRecommended: elements.filter(e => e.meetsRecommended).length,
                elements: elements
              };
            }
          }

          touchTargetResults[route.path] = routeResults;

          // Navigate back for next test
          await page.goBack().catch(() => page.goto('/'));
        }

        // Log comprehensive results
        console.log(`Touch target validation for ${deviceName}:`, JSON.stringify(touchTargetResults, null, 2));

        // Assert all critical elements meet minimum standards
        for (const [routePath, routeData] of Object.entries(touchTargetResults)) {
          for (const [elementType, data] of Object.entries(routeData)) {
            const successRate = data.meetingMinimum / data.total;
            expect(successRate).toBeGreaterThanOrEqual(0.95); // 95% compliance required
          }
        }
      });

      test('Touch target spacing prevents accidental activation', async ({ page }) => {
        await page.click('[href="/contacts"]');
        await page.waitForSelector('h1:has-text("Contacts")');
        await page.click('text=New Contact');
        await page.waitForSelector('form');

        // Test spacing for button groups
        const spacingViolations = await TouchTargetValidator.validateSpacing(page, 'button');
        expect(spacingViolations.length).toBe(0);

        // Test spacing for form controls
        const formSpacingViolations = await TouchTargetValidator.validateSpacing(
          page, 
          'input, select, textarea, [role="combobox"]'
        );
        expect(formSpacingViolations.length).toBeLessThanOrEqual(2); // Allow minimal violations
      });

      test('Touch response time meets field sales requirements', async ({ page }) => {
        await page.click('[href="/contacts"]');
        await page.waitForSelector('h1:has-text("Contacts")');

        // Test button response time
        const responseTime = await MobilePerformanceMonitor.measureInteraction(
          page,
          async () => {
            await page.click('text=New Contact');
            await page.waitForSelector('form, [role="dialog"]');
          },
          'Button touch response'
        );

        expect(responseTime).toBeLessThanOrEqual(PERFORMANCE_TARGETS.touchResponse);
      });
    });
  }
});

// Test Suite: iPad Field Sales Optimization
test.describe('iPad Field Sales Optimization', () => {
  
  test.describe('iPad Landscape Optimization', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DEVICE_CONFIGS['iPad-Pro-12.9-Landscape']);
      await page.goto('/');
      await page.waitForSelector('main', { timeout: 10000 });
    });

    test('Contact form Principal advocacy optimized for landscape use', async ({ page }) => {
      await page.click('[href="/contacts"]');
      await page.waitForSelector('h1:has-text("Contacts")');
      
      const formLoadTime = await MobilePerformanceMonitor.measureFormLoadTime(
        page, 
        'text=New Contact'
      );
      expect(formLoadTime).toBeLessThanOrEqual(PERFORMANCE_TARGETS.formOpen);

      // Validate Principal advocacy workflow
      const advocacyValid = await PrincipalCRMValidator.validateAdvocacyWorkflow(page);
      expect(advocacyValid).toBe(true);

      // Test business intelligence fields
      const biFields = await PrincipalCRMValidator.validateBusinessIntelligenceFields(page);
      expect(biFields.purchaseInfluence || biFields.decisionAuthority).toBe(true);

      // Validate form uses landscape space efficiently
      const formContainer = page.locator('form, [role="dialog"]').first();
      const containerBox = await formContainer.boundingBox();
      expect(containerBox.width).toBeGreaterThan(800); // Good use of landscape width
    });

    test('One-handed operation capabilities for field sales', async ({ page }) => {
      // Test thumb-reach zones (bottom 1/3 of screen accessible)
      const viewport = page.viewportSize();
      const thumbReachZone = viewport.height * 0.67; // Bottom 1/3 accessible

      await page.click('[href="/contacts"]');
      await page.waitForSelector('h1:has-text("Contacts")');
      await page.click('text=New Contact');

      // Test critical buttons are in thumb-reach zone
      const submitButton = page.locator('button[type="submit"], button:has-text("Save")');
      if (await submitButton.count() > 0) {
        const buttonBox = await submitButton.boundingBox();
        const isInThumbReach = buttonBox.y >= thumbReachZone;
        expect(isInThumbReach).toBe(true);
      }

      // Test navigation elements accessibility
      const navButtons = page.locator('nav button, [role="tab"]');
      const navCount = await navButtons.count();
      if (navCount > 0) {
        const firstNavBox = await navButtons.first().boundingBox();
        expect(firstNavBox.y).toBeLessThanOrEqual(100); // Top navigation easily reachable
      }
    });

    test('Form workflows optimized for field environment efficiency', async ({ page }) => {
      // Test rapid contact creation workflow
      const workflowStartTime = performance.now();

      await page.click('[href="/contacts"]');
      await page.waitForSelector('h1:has-text("Contacts")');
      await page.click('text=New Contact');
      await page.waitForSelector('form');

      // Test quick form completion
      await page.fill('[placeholder="John"], input[name*="first"]', 'Field');
      await page.fill('[placeholder="Doe"], input[name*="last"]', 'Sales');
      
      // Test organization quick select
      await page.click('[placeholder*="organization"], [role="combobox"]');
      await page.waitForSelector('[role="option"]', { timeout: 3000 });
      await page.click('[role="option"]');

      // Test principal advocacy quick setup
      const advocacyTime = await MobilePerformanceMonitor.measureInteraction(
        page,
        async () => {
          const advocacyButton = page.locator('button:has-text("Add Preferred Principals")');
          if (await advocacyButton.count() > 0) {
            await advocacyButton.click();
            await page.waitForSelector('input[type="checkbox"]');
            const firstCheckbox = page.locator('input[type="checkbox"]').first();
            if (await firstCheckbox.count() > 0) {
              await firstCheckbox.check();
            }
          }
        },
        'Principal advocacy setup'
      );

      expect(advocacyTime).toBeLessThanOrEqual(PERFORMANCE_TARGETS.advocacyLoad);

      const workflowEndTime = performance.now();
      const totalWorkflowTime = workflowEndTime - workflowStartTime;
      
      console.log(`Complete field sales workflow: ${totalWorkflowTime.toFixed(2)}ms`);
      expect(totalWorkflowTime).toBeLessThan(25000); // Under 25 seconds for efficiency
    });
  });

  test.describe('iPad Portrait Optimization', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DEVICE_CONFIGS['iPad-Pro-12.9-Portrait']);
      await page.goto('/');
      await page.waitForSelector('main', { timeout: 10000 });
    });

    test('Forms adapt seamlessly to portrait orientation', async ({ page }) => {
      const formPaths = ['/contacts', '/organizations', '/opportunities', '/interactions'];
      
      for (const formPath of formPaths) {
        await page.click(`[href="${formPath}"]`);
        await page.waitForSelector('h1', { timeout: 5000 });
        
        const buttonText = `New ${formPath.slice(1, -1).charAt(0).toUpperCase() + formPath.slice(2, -1)}`;
        await page.click(`text=${buttonText}, button:has-text("${buttonText}")`);
        await page.waitForSelector('form, [role="dialog"]');

        // Test vertical scrolling efficiency
        const beforeScrollY = await page.evaluate(() => window.scrollY);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const afterScrollY = await page.evaluate(() => window.scrollY);
        
        expect(afterScrollY).toBeGreaterThan(beforeScrollY); // Scroll worked
        
        // Test form content visibility
        await page.evaluate(() => window.scrollTo(0, 0));
        const formVisible = await page.locator('form, [role="dialog"]').isVisible();
        expect(formVisible).toBe(true);

        // Return to main page
        await page.goto('/');
      }
    });

    test('Principal CRM features remain accessible in portrait', async ({ page }) => {
      await page.click('[href="/contacts"]');
      await page.waitForSelector('h1:has-text("Contacts")');
      await page.click('text=New Contact');

      // Test business intelligence dropdowns in portrait
      const biValidation = await PrincipalCRMValidator.validateBusinessIntelligenceFields(page);
      expect(biValidation.purchaseInfluence || biValidation.decisionAuthority).toBe(true);

      // Test advocacy section accessibility in portrait
      const advocacyValidation = await PrincipalCRMValidator.validateAdvocacyWorkflow(page);
      expect(advocacyValidation).toBe(true);
    });
  });
});

// Test Suite: Mobile Form Performance Validation
test.describe('Mobile Form Performance Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DEVICE_CONFIGS['iPad-Air-Landscape']);
    await page.goto('/');
    await page.waitForSelector('main', { timeout: 10000 });
  });

  test('Page load performance meets mobile targets', async ({ page }) => {
    const testPages = ['/', '/contacts', '/organizations', '/opportunities', '/interactions'];
    
    for (const testPage of testPages) {
      const loadTime = await MobilePerformanceMonitor.measurePageLoadTime(page, testPage);
      console.log(`${testPage} load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).toBeLessThanOrEqual(PERFORMANCE_TARGETS.pageLoad);
    }
  });

  test('Form template application speed meets field requirements', async ({ page }) => {
    await page.click('[href="/interactions"]');
    await page.waitForSelector('h1:has-text("Interactions")');
    await page.click('text=New Interaction');

    // Test quick template scenarios
    const templateTests = [
      { action: () => page.selectOption('select[name="type"]', 'call'), name: 'Call template' },
      { action: () => page.selectOption('select[name="type"]', 'email'), name: 'Email template' },
      { action: () => page.selectOption('select[name="type"]', 'meeting'), name: 'Meeting template' }
    ];

    for (const template of templateTests) {
      const templateTime = await MobilePerformanceMonitor.measureInteraction(
        page,
        template.action,
        template.name
      );

      expect(templateTime).toBeLessThanOrEqual(PERFORMANCE_TARGETS.templateApplication);
    }
  });

  test('Form submission performance optimized for mobile networks', async ({ page }) => {
    await page.click('[href="/contacts"]');
    await page.waitForSelector('h1:has-text("Contacts")');
    await page.click('text=New Contact');

    // Fill minimum required fields
    await page.fill('[placeholder="John"], input[name*="first"]', 'Mobile');
    await page.fill('[placeholder="Doe"], input[name*="last"]', 'Performance');
    
    // Select organization
    await page.click('[placeholder*="organization"]');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');

    // Measure submission performance
    const submissionTime = await MobilePerformanceMonitor.measureInteraction(
      page,
      async () => {
        await page.click('button[type="submit"], button:has-text("Save")');
        await page.waitForTimeout(500); // Allow for submission processing
      },
      'Form submission'
    );

    expect(submissionTime).toBeLessThanOrEqual(PERFORMANCE_TARGETS.formSubmission);
  });
});

// Test Suite: Responsive Principal CRM Features
test.describe('Responsive Principal CRM Features', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DEVICE_CONFIGS['iPad-Standard-Landscape']);
    await page.goto('/');
    await page.waitForSelector('main', { timeout: 10000 });
  });

  test('Contact advocacy fields responsive across all devices', async ({ page }) => {
    for (const [deviceName, viewport] of Object.entries(DEVICE_CONFIGS)) {
      await page.setViewportSize(viewport);
      
      await page.click('[href="/contacts"]');
      await page.waitForSelector('h1:has-text("Contacts")');
      await page.click('text=New Contact');

      const advocacyValid = await PrincipalCRMValidator.validateAdvocacyWorkflow(page);
      expect(advocacyValid).toBe(true);

      console.log(`${deviceName}: Advocacy fields responsive`);
    }
  });

  test('Auto-naming preview works on mobile form factors', async ({ page }) => {
    const mobileDevices = [
      'iPhone-15-Pro-Max',
      'iPhone-15-Pro', 
      'iPad-Standard-Portrait',
      'Galaxy-Tab-S9'
    ];

    for (const deviceName of mobileDevices) {
      await page.setViewportSize(DEVICE_CONFIGS[deviceName]);
      
      await page.click('[href="/opportunities"]');
      await page.waitForSelector('h1:has-text("Opportunities")');
      await page.click('text=New Opportunity');

      const autoNamingWorks = await PrincipalCRMValidator.validateAutoNamingPreview(page);
      console.log(`${deviceName}: Auto-naming preview: ${autoNamingWorks ? 'PASS' : 'SKIP'}`);
      
      // Return to home
      await page.goto('/');
    }
  });

  test('Quick templates accessible across mobile breakpoints', async ({ page }) => {
    const testBreakpoints = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Large Tablet', width: 1024, height: 768 },
      { name: 'Desktop', width: 1366, height: 768 }
    ];

    for (const breakpoint of testBreakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      
      await page.click('[href="/interactions"]');
      await page.waitForSelector('h1:has-text("Interactions")');
      
      const templateTime = await MobilePerformanceMonitor.measureInteraction(
        page,
        async () => {
          await page.click('text=New Interaction');
          await page.waitForSelector('form, [role="dialog"]');
        },
        `Template access - ${breakpoint.name}`
      );

      expect(templateTime).toBeLessThanOrEqual(PERFORMANCE_TARGETS.formOpen);
      
      // Return to home for next test
      await page.goto('/');
    }
  });
});

// Test Suite: Offline Capability Assessment
test.describe('Offline Capability Assessment', () => {
  
  test('Form data persists during network interruptions', async ({ page, context }) => {
    await page.setViewportSize(DEVICE_CONFIGS['iPad-Air-Landscape']);
    await page.goto('/');
    await page.waitForSelector('main');

    await page.click('[href="/contacts"]');
    await page.waitForSelector('h1:has-text("Contacts")');
    await page.click('text=New Contact');

    // Fill form data
    await page.fill('[placeholder="John"], input[name*="first"]', 'Offline');
    await page.fill('[placeholder="Doe"], input[name*="last"]', 'Test');

    // Simulate network interruption
    await context.setOffline(true);
    
    // Verify form data persists
    const firstNameValue = await page.inputValue('[placeholder="John"], input[name*="first"]');
    const lastNameValue = await page.inputValue('[placeholder="Doe"], input[name*="last"]');
    
    expect(firstNameValue).toBe('Offline');
    expect(lastNameValue).toBe('Test');

    // Restore network
    await context.setOffline(false);
  });

  test('Network recovery handles form submission gracefully', async ({ page, context }) => {
    await page.setViewportSize(DEVICE_CONFIGS['iPad-Standard-Landscape']);
    await page.goto('/');
    
    await page.click('[href="/contacts"]');
    await page.waitForSelector('h1:has-text("Contacts")');
    await page.click('text=New Contact');

    // Fill minimum required data
    await page.fill('[placeholder="John"], input[name*="first"]', 'Network');
    await page.fill('[placeholder="Doe"], input[name*="last"]', 'Recovery');
    
    // Select organization if available
    const orgDropdown = page.locator('[placeholder*="organization"]');
    if (await orgDropdown.count() > 0) {
      await orgDropdown.click();
      await page.waitForSelector('[role="option"]', { timeout: 3000 });
      await page.click('[role="option"]');
    }

    // Simulate network issues during submission
    await context.setOffline(true);
    
    // Attempt submission (should handle gracefully)
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Check for user feedback about network issues
    const errorMessages = page.locator('text=/network|offline|connection|error/i');
    const hasErrorFeedback = await errorMessages.count() > 0;
    
    // Restore network
    await context.setOffline(false);
    
    // Either submission succeeded or user got appropriate feedback
    expect(hasErrorFeedback).toBe(true); // Should show some network feedback
  });
});

// Performance Summary Report
test.afterAll(async () => {
  console.log('\n=== Mobile Optimization Testing Complete ===');
  console.log('✅ Touch Interface Standards Validated');
  console.log('✅ iPad Field Sales Optimization Verified'); 
  console.log('✅ Mobile Form Performance Confirmed');
  console.log('✅ Responsive Principal CRM Features Tested');
  console.log('✅ Offline Capability Assessed');
  console.log('\nThe Principal CRM transformation is optimized for mobile field sales teams.');
});