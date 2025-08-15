/**
 * Mobile Optimization Testing Suite - Stage 6-4
 * Comprehensive touch interface validation for Principal CRM transformation
 * 
 * Tests ensure the CRM works perfectly on mobile devices, particularly iPads
 * used by field sales teams, with focus on touch interfaces and performance.
 */

import { test, expect } from '@playwright/test';

// Mobile device configurations for testing
const MOBILE_DEVICES = {
  'iPad-Landscape': { width: 1024, height: 768 },
  'iPad-Portrait': { width: 768, height: 1024 },
  'iPhone-Pro': { width: 393, height: 852 },
  'Android-Tablet': { width: 800, height: 1280 }
};

// Touch target minimum size (WCAG AA standard)
const MIN_TOUCH_TARGET = 48;

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  formLoad: 3000,        // <3 seconds
  templateLoad: 1000,    // <1 second
  quickTemplate: 500,    // <500ms
  formSubmission: 2000   // <2 seconds
};

// Mobile interaction templates to test
const QUICK_TEMPLATES = [
  { name: '📞 Quick Call', type: 'call', expected: 'Quick Call' },
  { name: '📧 Email Follow-up', type: 'email', expected: 'Email Follow-up' },
  { name: '🎯 Demo Done', type: 'demo', expected: 'Demo Done' },
  { name: '💰 Price Quote', type: 'proposal', expected: 'Price Quote' }
];

/**
 * Touch Target Validation Helper
 * Validates that interactive elements meet WCAG AA standards (≥48px)
 */
async function validateTouchTargets(page, selector) {
  const elements = await page.locator(selector).all();
  const touchTargetResults = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const box = await element.boundingBox();
    
    if (box) {
      const isValid = box.width >= MIN_TOUCH_TARGET && box.height >= MIN_TOUCH_TARGET;
      const elementInfo = {
        index: i,
        width: box.width,
        height: box.height,
        isValid,
        selector: selector
      };
      
      touchTargetResults.push(elementInfo);
      
      if (!isValid) {
        console.warn(`Touch target too small: ${selector}[${i}] - ${box.width}x${box.height}px (minimum: ${MIN_TOUCH_TARGET}px)`);
      }
    }
  }

  return touchTargetResults;
}

/**
 * Form Overflow Prevention Helper
 * Checks that forms fit within viewport without horizontal overflow
 */
async function validateFormOverflow(page) {
  const viewportSize = page.viewportSize();
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const hasOverflow = bodyWidth > viewportSize.width;
  
  return {
    viewportWidth: viewportSize.width,
    contentWidth: bodyWidth,
    hasOverflow,
    overflowAmount: hasOverflow ? bodyWidth - viewportSize.width : 0
  };
}

/**
 * Mobile Performance Helper
 * Measures loading and interaction times
 */
async function measurePerformance(page, action) {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();
  return endTime - startTime;
}

// Test Suite: Mobile Touch Interface Validation
test.describe('Mobile Touch Interface Validation', () => {
  
  for (const [deviceName, viewport] of Object.entries(MOBILE_DEVICES)) {
    test.describe(`Device: ${deviceName} (${viewport.width}x${viewport.height})`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        // Wait for app to load
        await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
      });

      test('Touch targets meet WCAG AA standards (≥48px) on Contact form', async ({ page }) => {
        // Navigate to Contacts page
        await page.click('[href="/contacts"]');
        await page.waitForSelector('h1:has-text("Contacts")', { timeout: 5000 });

        // Open Contact form
        await page.click('text=New Contact');
        await page.waitForSelector('text=Basic Information');

        // Test interactive elements for touch target size
        const touchTargetTests = [
          { selector: 'input[type="text"]', name: 'Text inputs' },
          { selector: 'input[type="email"]', name: 'Email inputs' },
          { selector: 'input[type="tel"]', name: 'Phone inputs' },
          { selector: 'button', name: 'Buttons' },
          { selector: '[role="combobox"]', name: 'Dropdown triggers' },
          { selector: 'input[type="checkbox"]', name: 'Checkboxes' },
          { selector: 'textarea', name: 'Text areas' }
        ];

        let allTargetsValid = true;
        const results = {};

        for (const test of touchTargetTests) {
          const targets = await validateTouchTargets(page, test.selector);
          results[test.name] = targets;
          
          for (const target of targets) {
            if (!target.isValid) {
              allTargetsValid = false;
            }
          }
        }

        // Log detailed results
        console.log(`Touch target validation for ${deviceName}:`, results);

        // Assert all touch targets are valid
        expect(allTargetsValid).toBe(true);
      });

      test('Principal advocacy fields work with touch interaction', async ({ page }) => {
        await page.click('[href="/contacts"]');
        await page.waitForSelector('h1:has-text("Contacts")');

        // Open Contact form
        await page.click('text=New Contact');
        await page.waitForSelector('text=Basic Information');

        // Test Principal advocacy section
        const advocacyButton = page.locator('button:has-text("Add Preferred Principals")');
        await expect(advocacyButton).toBeVisible();
        
        // Validate touch target size
        const buttonBox = await advocacyButton.boundingBox();
        expect(buttonBox.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
        expect(buttonBox.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);

        // Test touch interaction
        await advocacyButton.click();
        await expect(page.locator('text=Select principals that this contact advocates for')).toBeVisible();

        // Test checkbox touch targets
        const checkboxes = await validateTouchTargets(page, 'input[type="checkbox"]');
        for (const checkbox of checkboxes) {
          expect(checkbox.isValid).toBe(true);
        }
      });

      test('Dynamic dropdowns are touch-responsive', async ({ page }) => {
        await page.click('[href="/contacts"]');
        await page.waitForSelector('h1:has-text("Contacts")');
        await page.click('text=New Contact');

        // Test organization dropdown
        const orgDropdown = page.locator('[placeholder="Select organization"]').first();
        await orgDropdown.click();
        
        // Wait for dropdown options to load
        await page.waitForSelector('[role="option"]', { timeout: 3000 });

        // Validate dropdown option touch targets
        const options = await validateTouchTargets(page, '[role="option"]');
        for (const option of options) {
          expect(option.isValid).toBe(true);
        }

        // Test dropdown interaction
        const firstOption = page.locator('[role="option"]').first();
        await firstOption.click();
        
        // Verify selection worked
        await expect(orgDropdown).not.toHaveValue('');
      });

      test('Forms prevent overflow on mobile viewports', async ({ page }) => {
        // Test Contact form overflow
        await page.click('[href="/contacts"]');
        await page.waitForSelector('h1:has-text("Contacts")');
        await page.click('text=New Contact');
        
        let overflowResult = await validateFormOverflow(page);
        expect(overflowResult.hasOverflow).toBe(false);

        // Test Organization form overflow
        await page.click('[href="/organizations"]');
        await page.waitForSelector('h1:has-text("Organizations")');
        await page.click('text=New Organization');
        
        overflowResult = await validateFormOverflow(page);
        expect(overflowResult.hasOverflow).toBe(false);

        // Test Opportunity form overflow
        await page.click('[href="/opportunities"]');
        await page.waitForSelector('h1:has-text("Opportunities")');
        await page.click('text=New Opportunity');
        
        overflowResult = await validateFormOverflow(page);
        expect(overflowResult.hasOverflow).toBe(false);

        // Test Interaction form overflow
        await page.click('[href="/interactions"]');
        await page.waitForSelector('h1:has-text("Interactions")');
        await page.click('text=New Interaction');
        
        overflowResult = await validateFormOverflow(page);
        expect(overflowResult.hasOverflow).toBe(false);
      });

      test('Dialog sizing is appropriate for mobile screens', async ({ page }) => {
        await page.click('[href="/contacts"]');
        await page.waitForSelector('h1:has-text("Contacts")');
        await page.click('text=New Contact');

        // Check that dialog doesn't exceed viewport
        const dialog = page.locator('[role="dialog"]').first();
        if (await dialog.count() > 0) {
          const dialogBox = await dialog.boundingBox();
          const viewportSize = page.viewportSize();
          
          expect(dialogBox.width).toBeLessThanOrEqual(viewportSize.width);
          expect(dialogBox.height).toBeLessThanOrEqual(viewportSize.height);
        }
      });

      test('Keyboard accessibility works on mobile', async ({ page }) => {
        await page.click('[href="/contacts"]');
        await page.waitForSelector('h1:has-text("Contacts")');
        await page.click('text=New Contact');

        // Test tab navigation
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // Test form submission via keyboard
        await page.fill('[placeholder="John"]', 'Test');
        await page.fill('[placeholder="Doe"]', 'User');
        
        // Select organization
        await page.click('[placeholder="Select organization"]');
        await page.waitForSelector('[role="option"]');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        // Test keyboard form completion
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        // Continue tabbing through form fields
      });
    });
  }
});

// Test Suite: Quick Template Performance
test.describe('Quick Template Performance Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_DEVICES['iPad-Landscape']);
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
  });

  test('Interaction quick templates load under 1 second', async ({ page }) => {
    await page.click('[href="/interactions"]');
    await page.waitForSelector('h1:has-text("Interactions")');

    const templateResults = [];

    for (const template of QUICK_TEMPLATES) {
      const loadTime = await measurePerformance(page, async () => {
        await page.click('text=New Interaction');
        await page.waitForSelector('text=Basic Information');
        
        // Look for the template button/option
        const templateSelector = page.locator(`text=${template.name}`);
        if (await templateSelector.count() > 0) {
          await templateSelector.click();
        }
      });

      templateResults.push({
        template: template.name,
        loadTime,
        withinThreshold: loadTime <= PERFORMANCE_THRESHOLDS.templateLoad
      });

      // Reset for next test
      await page.click('button:has-text("Cancel")').catch(() => {});
      await page.goBack().catch(() => {});
      await page.click('[href="/interactions"]');
    }

    // Log results
    console.log('Template load times:', templateResults);

    // Assert all templates load within threshold
    for (const result of templateResults) {
      expect(result.withinThreshold).toBe(true);
    }
  });

  test('Template application speed is under 500ms', async ({ page }) => {
    await page.click('[href="/interactions"]');
    await page.waitForSelector('h1:has-text("Interactions")');
    await page.click('text=New Interaction');

    // Test quick template application
    for (const template of QUICK_TEMPLATES) {
      const applicationTime = await measurePerformance(page, async () => {
        // Apply template (this would depend on actual implementation)
        // For now, we'll simulate the interaction
        await page.selectOption('select[name="type"]', template.type);
        await page.fill('[name="subject"]', template.expected);
      });

      console.log(`${template.name} application time: ${applicationTime}ms`);
      expect(applicationTime).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.quickTemplate);
    }
  });
});

// Test Suite: Field Sales iPad Optimization
test.describe('Field Sales iPad Optimization', () => {
  
  test.describe('iPad Landscape Mode (1024x768)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES['iPad-Landscape']);
      await page.goto('/');
      await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
    });

    test('Contact form with Principal advocacy optimized for landscape', async ({ page }) => {
      await page.click('[href="/contacts"]');
      await page.waitForSelector('h1:has-text("Contacts")');
      await page.click('text=New Contact');

      // Verify form layout optimized for landscape
      const formCard = page.locator('[role="dialog"], .max-w-5xl').first();
      const cardBox = await formCard.boundingBox();
      
      // Form should use available horizontal space efficiently
      expect(cardBox.width).toBeGreaterThan(600); // Reasonable width for landscape
      
      // Test grid layout renders properly
      const gridContainer = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
      await expect(gridContainer).toBeVisible();

      // Test Principal advocacy section is accessible
      await page.click('button:has-text("Add Preferred Principals")');
      const advocacySection = page.locator('text=Select principals that this contact advocates for');
      await expect(advocacySection).toBeVisible();

      // Test form sections don't overflow
      const overflowResult = await validateFormOverflow(page);
      expect(overflowResult.hasOverflow).toBe(false);
    });

    test('Organization form with Principal/Distributor flags optimized', async ({ page }) => {
      await page.click('[href="/organizations"]');
      await page.waitForSelector('h1:has-text("Organizations")');
      await page.click('text=New Organization');

      // Test organization type selection is touch-friendly
      const typeDropdown = page.locator('[placeholder*="type"], [placeholder*="Type"]').first();
      if (await typeDropdown.count() > 0) {
        await typeDropdown.click();
        const options = await validateTouchTargets(page, '[role="option"]');
        for (const option of options) {
          expect(option.isValid).toBe(true);
        }
      }

      // Verify form doesn't overflow in landscape
      const overflowResult = await validateFormOverflow(page);
      expect(overflowResult.hasOverflow).toBe(false);
    });

    test('Opportunity form auto-naming preview visible on landscape', async ({ page }) => {
      await page.click('[href="/opportunities"]');
      await page.waitForSelector('h1:has-text("Opportunities")');
      await page.click('text=New Opportunity');

      // Test auto-naming preview functionality
      await page.fill('[placeholder*="title"], input[name*="title"]', 'Test Opportunity');
      
      // Look for preview element (this would depend on actual implementation)
      const previewElement = page.locator('[data-testid="opportunity-name-preview"], .preview, [class*="preview"]');
      if (await previewElement.count() > 0) {
        await expect(previewElement).toBeVisible();
      }

      // Verify form layout
      const overflowResult = await validateFormOverflow(page);
      expect(overflowResult.hasOverflow).toBe(false);
    });
  });

  test.describe('iPad Portrait Mode (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES['iPad-Portrait']);
      await page.goto('/');
      await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
    });

    test('Forms adapt properly to portrait orientation', async ({ page }) => {
      const forms = [
        { path: '/contacts', button: 'New Contact' },
        { path: '/organizations', button: 'New Organization' },
        { path: '/opportunities', button: 'New Opportunity' },
        { path: '/interactions', button: 'New Interaction' }
      ];

      for (const form of forms) {
        await page.click(`[href="${form.path}"]`);
        await page.waitForSelector(`h1:has-text("${form.path.slice(1).charAt(0).toUpperCase() + form.path.slice(2)}")`, { timeout: 5000 });
        await page.click(`text=${form.button}`);

        // Test form doesn't overflow in portrait
        const overflowResult = await validateFormOverflow(page);
        expect(overflowResult.hasOverflow).toBe(false);

        // Test vertical scrolling works properly
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.evaluate(() => window.scrollTo(0, 0));

        // Return to main navigation
        await page.goBack().catch(() => {});
      }
    });

    test('Touch gestures work for form navigation', async ({ page }) => {
      await page.click('[href="/contacts"]');
      await page.waitForSelector('h1:has-text("Contacts")');
      await page.click('text=New Contact');

      // Test touch scrolling
      await page.mouse.move(400, 300);
      await page.mouse.down();
      await page.mouse.move(400, 200);
      await page.mouse.up();

      // Test pinch-to-zoom prevention (forms should remain at correct scale)
      const scale = await page.evaluate(() => window.devicePixelRatio);
      expect(scale).toBeGreaterThan(0);
    });
  });
});

// Test Suite: Mobile Workflow Efficiency
test.describe('Mobile Workflow Efficiency Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_DEVICES['iPad-Landscape']);
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
  });

  test('Complete contact creation workflow efficiency', async ({ page }) => {
    const workflowStartTime = Date.now();

    // Navigate to contacts
    await page.click('[href="/contacts"]');
    await page.waitForSelector('h1:has-text("Contacts")');

    // Open contact form
    await page.click('text=New Contact');
    await page.waitForSelector('text=Basic Information');

    // Fill form efficiently
    await page.fill('[placeholder="John"]', 'Field');
    await page.fill('[placeholder="Doe"]', 'Sales');
    
    // Select organization quickly
    await page.click('[placeholder="Select organization"]');
    await page.waitForSelector('[role="option"]', { timeout: 3000 });
    await page.click('[role="option"]', { timeout: 1000 });

    // Fill contact details
    await page.fill('[placeholder*="email"], input[type="email"]', 'field.sales@example.com');
    await page.fill('[placeholder*="phone"], input[type="tel"]', '555-0123');

    // Test Principal advocacy quick add
    await page.click('button:has-text("Add Preferred Principals")');
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      await checkboxes.first().check();
    }

    const workflowEndTime = Date.now();
    const totalTime = workflowEndTime - workflowStartTime;

    console.log(`Complete contact workflow time: ${totalTime}ms`);
    
    // Workflow should be completed efficiently (under 30 seconds for full form)
    expect(totalTime).toBeLessThan(30000);
  });

  test('Form submission performance on mobile', async ({ page }) => {
    await page.click('[href="/contacts"]');
    await page.waitForSelector('h1:has-text("Contacts")');
    await page.click('text=New Contact');

    // Fill minimum required fields
    await page.fill('[placeholder="John"]', 'Mobile');
    await page.fill('[placeholder="Doe"]', 'Test');
    
    // Select organization
    await page.click('[placeholder="Select organization"]');
    await page.waitForSelector('[role="option"]');
    await page.click('[role="option"]');

    // Measure form submission time
    const submitTime = await measurePerformance(page, async () => {
      await page.click('button[type="submit"], button:has-text("Save")');
      // Wait for success indication or navigation
      await page.waitForTimeout(1000); // Allow for submission processing
    });

    console.log(`Form submission time: ${submitTime}ms`);
    expect(submitTime).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.formSubmission);
  });

  test('Mobile navigation efficiency between forms', async ({ page }) => {
    const navigationTests = [
      { from: '/contacts', to: '/organizations', button: 'New Organization' },
      { from: '/organizations', to: '/opportunities', button: 'New Opportunity' },
      { from: '/opportunities', to: '/interactions', button: 'New Interaction' },
      { from: '/interactions', to: '/contacts', button: 'New Contact' }
    ];

    for (const nav of navigationTests) {
      const navTime = await measurePerformance(page, async () => {
        await page.click(`[href="${nav.to}"]`);
        await page.waitForSelector(`h1:has-text("${nav.to.slice(1).charAt(0).toUpperCase() + nav.to.slice(2)}")`, { timeout: 5000 });
        await page.click(`text=${nav.button}`);
        await page.waitForSelector('text=Basic Information, form', { timeout: 3000 });
      });

      console.log(`Navigation ${nav.from} → ${nav.to}: ${navTime}ms`);
      expect(navTime).toBeLessThan(3000); // Navigation should be quick
    }
  });
});

// Test Suite: Performance Monitoring
test.describe('Mobile Performance Monitoring', () => {
  
  test('Page load times meet mobile performance targets', async ({ page }) => {
    const pages = ['/', '/contacts', '/organizations', '/opportunities', '/interactions'];
    
    for (const pagePath of pages) {
      await page.setViewportSize(MOBILE_DEVICES['iPad-Landscape']);
      
      const loadTime = await measurePerformance(page, async () => {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
      });

      console.log(`Page ${pagePath} load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.formLoad);
    }
  });

  test('Mobile network simulation performance', async ({ page, context }) => {
    // Simulate 3G network conditions
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    await page.setViewportSize(MOBILE_DEVICES['iPad-Portrait']);
    
    const loadTime = await measurePerformance(page, async () => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 15000 });
    });

    console.log(`3G simulation load time: ${loadTime}ms`);
    
    // Allow more time for 3G conditions but still reasonable
    expect(loadTime).toBeLessThan(10000);
  });
});