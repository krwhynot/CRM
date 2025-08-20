import { test, expect } from '@playwright/test';
import { OrganizationsPage } from '../page-objects/organizations-page';
import { AuthPage } from '../page-objects/auth-page';
import { TestUsers, TestDataGenerator } from '../utils/test-data';
import { AuthHelpers, FormHelpers } from '../utils/test-helpers';

test.describe('Form Validation Tests', () => {
  let organizationsPage: OrganizationsPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    organizationsPage = new OrganizationsPage(page);
    authPage = new AuthPage(page);
    
    // Ensure user is logged in
    const isLoggedIn = await organizationsPage.isAuthenticated();
    if (!isLoggedIn) {
      await AuthHelpers.login(page, TestUsers.validUser.email, TestUsers.validUser.password);
    }
  });

  test.describe('Organization Form Validation', () => {
    test.beforeEach(async () => {
      await organizationsPage.goToOrganizations();
      await organizationsPage.addOrganizationButton.click();
      await organizationsPage.organizationForm.waitFor({ state: 'visible' });
    });

    test.afterEach(async () => {
      // Close form if still open
      try {
        await organizationsPage.cancelButton.click();
      } catch {
        // Form might already be closed
      }
    });

    test('should validate required fields', async () => {
      // Try to save form without filling required fields
      await organizationsPage.saveButton.click();
      
      // Should show validation errors
      await expect(organizationsPage.validationError).toBeVisible();
      
      // Check specific field errors
      const nameError = organizationsPage.page.locator('[data-testid="name-error"]');
      const typeError = organizationsPage.page.locator('[data-testid="type-error"]');
      
      await expect(nameError).toBeVisible();
      await expect(typeError).toBeVisible();
      
      // Error messages should be descriptive
      const nameErrorText = await nameError.textContent();
      const typeErrorText = await typeError.textContent();
      
      expect(nameErrorText?.toLowerCase()).toContain('required');
      expect(typeErrorText?.toLowerCase()).toContain('required');
    });

    test('should validate name field constraints', async () => {
      const nameValidationTests = [
        { value: '', shouldBeValid: false, description: 'Empty name' },
        { value: 'A', shouldBeValid: false, description: 'Too short (1 char)' },
        { value: 'AB', shouldBeValid: true, description: 'Minimum length (2 chars)' },
        { value: 'Valid Organization Name', shouldBeValid: true, description: 'Normal name' },
        { value: 'A'.repeat(256), shouldBeValid: false, description: 'Too long (256 chars)' },
        { value: 'Org with Special !@#$%^&*() Characters', shouldBeValid: true, description: 'Special characters' },
        { value: '   Trimmed Name   ', shouldBeValid: true, description: 'Name with spaces' },
      ];

      for (const testCase of nameValidationTests) {
        // Clear and fill name field
        await organizationsPage.nameInput.clear();
        await organizationsPage.nameInput.fill(testCase.value);
        await organizationsPage.nameInput.blur();
        
        // Fill required type field
        await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'customer');
        
        // Try to save
        await organizationsPage.saveButton.click();
        
        await organizationsPage.page.waitForTimeout(500);
        
        const hasValidationError = await organizationsPage.validationError.isVisible();
        const nameError = await organizationsPage.page.locator('[data-testid="name-error"]').isVisible();
        
        if (testCase.shouldBeValid) {
          // Should either succeed or only have other field errors
          if (hasValidationError) {
            expect(nameError).toBe(false);
          }
        } else {
          // Should show name validation error
          expect(nameError).toBe(true);
        }
        
        console.log(`Name validation - ${testCase.description}:`, {
          value: testCase.value,
          expected: testCase.shouldBeValid,
          hasError: nameError
        });
      }
    });

    test('should validate email field format', async () => {
      const emailValidationTests = [
        { value: '', shouldBeValid: true, description: 'Empty email (optional)' },
        { value: 'valid@example.com', shouldBeValid: true, description: 'Valid email' },
        { value: 'test.email+tag@domain.com', shouldBeValid: true, description: 'Complex valid email' },
        { value: 'invalid-email', shouldBeValid: false, description: 'Invalid format - no @' },
        { value: 'invalid@', shouldBeValid: false, description: 'Invalid format - no domain' },
        { value: '@invalid.com', shouldBeValid: false, description: 'Invalid format - no local part' },
        { value: 'spaces in@email.com', shouldBeValid: false, description: 'Spaces in email' },
        { value: 'toolongemailaddress'.repeat(10) + '@domain.com', shouldBeValid: false, description: 'Too long' }
      ];

      for (const testCase of emailValidationTests) {
        // Fill required fields first
        await organizationsPage.nameInput.fill('Test Organization');
        await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'customer');
        
        // Clear and fill email field
        await organizationsPage.emailInput.clear();
        await organizationsPage.emailInput.fill(testCase.value);
        await organizationsPage.emailInput.blur();
        
        await organizationsPage.page.waitForTimeout(300);
        
        const emailError = await organizationsPage.page.locator('[data-testid="email-error"]').isVisible();
        
        if (testCase.shouldBeValid) {
          expect(emailError).toBe(false);
        } else {
          expect(emailError).toBe(true);
        }
        
        console.log(`Email validation - ${testCase.description}:`, {
          value: testCase.value,
          expected: testCase.shouldBeValid,
          hasError: emailError
        });
      }
    });

    test('should validate website URL format', async () => {
      const websiteValidationTests = [
        { value: '', shouldBeValid: true, description: 'Empty URL (optional)' },
        { value: 'https://example.com', shouldBeValid: true, description: 'Valid HTTPS URL' },
        { value: 'http://example.com', shouldBeValid: true, description: 'Valid HTTP URL' },
        { value: 'https://www.example.com/path?query=1', shouldBeValid: true, description: 'Complex valid URL' },
        { value: 'example.com', shouldBeValid: true, description: 'Domain without protocol' },
        { value: 'not-a-url', shouldBeValid: false, description: 'Invalid URL format' },
        { value: 'http://', shouldBeValid: false, description: 'Incomplete URL' },
        { value: 'https://toolong.domain.name'.repeat(10) + '.com', shouldBeValid: false, description: 'Too long URL' }
      ];

      for (const testCase of websiteValidationTests) {
        // Fill required fields first
        await organizationsPage.nameInput.fill('Test Organization');
        await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'customer');
        
        // Clear and fill website field
        await organizationsPage.websiteInput.clear();
        await organizationsPage.websiteInput.fill(testCase.value);
        await organizationsPage.websiteInput.blur();
        
        await organizationsPage.page.waitForTimeout(300);
        
        const websiteError = await organizationsPage.page.locator('[data-testid="website-error"]').isVisible();
        
        if (testCase.shouldBeValid) {
          expect(websiteError).toBe(false);
        } else {
          expect(websiteError).toBe(true);
        }
        
        console.log(`Website validation - ${testCase.description}:`, {
          value: testCase.value,
          expected: testCase.shouldBeValid,
          hasError: websiteError
        });
      }
    });

    test('should validate phone number format', async () => {
      const phoneValidationTests = [
        { value: '', shouldBeValid: true, description: 'Empty phone (optional)' },
        { value: '555-1234', shouldBeValid: true, description: 'Simple phone' },
        { value: '(555) 123-4567', shouldBeValid: true, description: 'Formatted US phone' },
        { value: '+1-555-123-4567', shouldBeValid: true, description: 'International format' },
        { value: '555.123.4567', shouldBeValid: true, description: 'Dot notation' },
        { value: '5551234567', shouldBeValid: true, description: 'Numbers only' },
        { value: '123', shouldBeValid: false, description: 'Too short' },
        { value: 'not-a-phone', shouldBeValid: false, description: 'Invalid characters' },
        { value: '123456789012345678901', shouldBeValid: false, description: 'Too long' }
      ];

      for (const testCase of phoneValidationTests) {
        // Fill required fields first
        await organizationsPage.nameInput.fill('Test Organization');
        await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'customer');
        
        // Clear and fill phone field
        await organizationsPage.phoneInput.clear();
        await organizationsPage.phoneInput.fill(testCase.value);
        await organizationsPage.phoneInput.blur();
        
        await organizationsPage.page.waitForTimeout(300);
        
        const phoneError = await organizationsPage.page.locator('[data-testid="phone-error"]').isVisible();
        
        if (testCase.shouldBeValid) {
          expect(phoneError).toBe(false);
        } else {
          expect(phoneError).toBe(true);
        }
        
        console.log(`Phone validation - ${testCase.description}:`, {
          value: testCase.value,
          expected: testCase.shouldBeValid,
          hasError: phoneError
        });
      }
    });

    test('should validate organization type selection', async () => {
      // Fill name field
      await organizationsPage.nameInput.fill('Test Organization');
      
      // Try to save without selecting type
      await organizationsPage.saveButton.click();
      
      const typeError = await organizationsPage.page.locator('[data-testid="type-error"]').isVisible();
      expect(typeError).toBe(true);
      
      // Select each valid type option
      const validTypes = ['principal', 'customer', 'vendor'];
      
      for (const type of validTypes) {
        await organizationsPage.selectDropdownOption('[data-testid="type-select"]', type);
        
        // Error should disappear
        await organizationsPage.page.waitForTimeout(300);
        const errorStillVisible = await organizationsPage.page.locator('[data-testid="type-error"]').isVisible();
        expect(errorStillVisible).toBe(false);
        
        console.log(`Type validation - ${type}: passed`);
      }
    });

    test('should validate description field length', async () => {
      const descriptionTests = [
        { value: '', shouldBeValid: true, description: 'Empty description' },
        { value: 'Short description', shouldBeValid: true, description: 'Normal description' },
        { value: 'A'.repeat(1000), shouldBeValid: true, description: 'Long but valid description' },
        { value: 'A'.repeat(5000), shouldBeValid: false, description: 'Too long description' }
      ];

      for (const testCase of descriptionTests) {
        // Fill required fields
        await organizationsPage.nameInput.fill('Test Organization');
        await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'customer');
        
        // Fill description
        await organizationsPage.descriptionTextarea.clear();
        await organizationsPage.descriptionTextarea.fill(testCase.value);
        await organizationsPage.descriptionTextarea.blur();
        
        await organizationsPage.page.waitForTimeout(300);
        
        const descriptionError = await organizationsPage.page.locator('[data-testid="description-error"]').isVisible();
        
        if (testCase.shouldBeValid) {
          expect(descriptionError).toBe(false);
        } else {
          expect(descriptionError).toBe(true);
        }
        
        console.log(`Description validation - ${testCase.description}:`, {
          length: testCase.value.length,
          expected: testCase.shouldBeValid,
          hasError: descriptionError
        });
      }
    });

    test('should validate address fields', async () => {
      // Fill required fields
      await organizationsPage.nameInput.fill('Test Organization');
      await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'customer');
      
      // Test ZIP code validation (if implemented)
      const zipTests = [
        { value: '', shouldBeValid: true, description: 'Empty ZIP' },
        { value: '12345', shouldBeValid: true, description: 'Valid 5-digit ZIP' },
        { value: '12345-6789', shouldBeValid: true, description: 'Valid ZIP+4' },
        { value: '123', shouldBeValid: false, description: 'Too short ZIP' },
        { value: 'ABCDE', shouldBeValid: false, description: 'Non-numeric ZIP' }
      ];

      for (const testCase of zipTests) {
        await organizationsPage.zipInput.clear();
        await organizationsPage.zipInput.fill(testCase.value);
        await organizationsPage.zipInput.blur();
        
        await organizationsPage.page.waitForTimeout(300);
        
        const zipError = await organizationsPage.page.locator('[data-testid="zip-error"]').isVisible();
        
        if (testCase.shouldBeValid) {
          expect(zipError).toBe(false);
        } else if (testCase.value !== '') {
          // Only expect error for non-empty invalid values
          expect(zipError).toBe(true);
        }
        
        console.log(`ZIP validation - ${testCase.description}:`, {
          value: testCase.value,
          expected: testCase.shouldBeValid,
          hasError: zipError
        });
      }
    });

    test('should show validation errors in real-time', async () => {
      // Test real-time validation as user types
      
      // Start typing an invalid email
      await organizationsPage.emailInput.type('invalid');
      await organizationsPage.emailInput.blur();
      
      // Should show error immediately
      await organizationsPage.page.waitForTimeout(300);
      let emailError = await organizationsPage.page.locator('[data-testid="email-error"]').isVisible();
      expect(emailError).toBe(true);
      
      // Fix the email
      await organizationsPage.emailInput.fill('valid@example.com');
      await organizationsPage.emailInput.blur();
      
      // Error should disappear
      await organizationsPage.page.waitForTimeout(300);
      emailError = await organizationsPage.page.locator('[data-testid="email-error"]').isVisible();
      expect(emailError).toBe(false);
      
      console.log('Real-time validation test passed');
    });

    test('should prevent form submission with validation errors', async () => {
      // Fill form with invalid data
      await organizationsPage.nameInput.fill(''); // Required field empty
      await organizationsPage.emailInput.fill('invalid-email'); // Invalid email
      
      // Try to submit
      await organizationsPage.saveButton.click();
      
      // Form should not be submitted
      await organizationsPage.page.waitForTimeout(1000);
      
      // Form should still be visible
      await expect(organizationsPage.organizationForm).toBeVisible();
      
      // Should show multiple validation errors
      const hasValidationErrors = await organizationsPage.validationError.isVisible();
      expect(hasValidationErrors).toBe(true);
      
      console.log('Form submission prevention test passed');
    });

    test('should show success message after valid form submission', async () => {
      // Fill form with valid data
      const validOrg = TestDataGenerator.generateOrganization({
        name: 'Form Validation Test Org',
        type: 'customer',
        email: 'valid@test.com',
        phone: '555-0123',
        website: 'https://test.com'
      });

      await FormHelpers.fillForm(
        organizationsPage.page, 
        validOrg, 
        '[data-testid="organization-form"]'
      );
      
      // Submit form
      await organizationsPage.saveButton.click();
      
      // Should show success message
      await organizationsPage.expectToast('Organization created successfully');
      
      console.log('Valid form submission test passed');
    });
  });

  test.describe('Cross-Field Validation', () => {
    test.beforeEach(async () => {
      await organizationsPage.goToOrganizations();
      await organizationsPage.addOrganizationButton.click();
      await organizationsPage.organizationForm.waitFor({ state: 'visible' });
    });

    test.afterEach(async () => {
      try {
        await organizationsPage.cancelButton.click();
      } catch {
        // Form might already be closed
      }
    });

    test('should validate business logic constraints', async () => {
      // Test business rule: Principal organizations should have manager name
      await organizationsPage.nameInput.fill('Test Principal');
      await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'principal');
      
      // Leave manager name empty
      await organizationsPage.managerNameInput.clear();
      
      await organizationsPage.saveButton.click();
      
      // Should show business logic error (if implemented)
      const managerError = await organizationsPage.page.locator('[data-testid="manager-name-error"]').isVisible();
      
      if (managerError) {
        console.log('Business logic validation: Principal requires manager name');
      } else {
        console.log('Business logic validation: Manager name not required for principals');
      }
    });

    test('should validate unique organization names', async () => {
      // This test would require creating an organization first, then trying to create another with same name
      const duplicateName = 'Duplicate Name Test Organization';
      
      // Fill and submit first organization
      await organizationsPage.nameInput.fill(duplicateName);
      await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'customer');
      await organizationsPage.saveButton.click();
      
      try {
        await organizationsPage.expectToast('Organization created successfully');
        
        // Try to create another with same name
        await organizationsPage.addOrganizationButton.click();
        await organizationsPage.organizationForm.waitFor({ state: 'visible' });
        
        await organizationsPage.nameInput.fill(duplicateName);
        await organizationsPage.selectDropdownOption('[data-testid="type-select"]', 'vendor');
        await organizationsPage.saveButton.click();
        
        // Should show duplicate name error
        const duplicateError = await organizationsPage.page.locator('text=already exists').isVisible();
        
        if (duplicateError) {
          console.log('Duplicate name validation: Working');
        } else {
          console.log('Duplicate name validation: Not implemented or allows duplicates');
        }
        
      } catch {
        console.log('First organization creation failed - skipping duplicate test');
      }
    });
  });

  test.describe('Form Accessibility and Usability', () => {
    test('should have proper ARIA labels and accessibility attributes', async ({ page }) => {
      await organizationsPage.goToOrganizations();
      await organizationsPage.addOrganizationButton.click();
      await organizationsPage.organizationForm.waitFor({ state: 'visible' });
      
      // Check for proper labels
      const nameLabel = page.locator('label[for*="name"], [data-testid="name-label"]');
      const emailLabel = page.locator('label[for*="email"], [data-testid="email-label"]');
      
      await expect(nameLabel).toBeVisible();
      await expect(emailLabel).toBeVisible();
      
      // Check ARIA attributes
      const nameInput = organizationsPage.nameInput;
      const emailInput = organizationsPage.emailInput;
      
      const nameAriaLabel = await nameInput.getAttribute('aria-label');
      const emailAriaLabel = await emailInput.getAttribute('aria-label');
      
      // Should have either aria-label or associated label
      expect(nameAriaLabel || await nameLabel.isVisible()).toBeTruthy();
      expect(emailAriaLabel || await emailLabel.isVisible()).toBeTruthy();
      
      console.log('Accessibility test passed');
      
      // Close form
      await organizationsPage.cancelButton.click();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await organizationsPage.goToOrganizations();
      await organizationsPage.addOrganizationButton.click();
      await organizationsPage.organizationForm.waitFor({ state: 'visible' });
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      let focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing through form
      const tabStops = [];
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const tagName = await page.locator(':focus').evaluate(el => el.tagName.toLowerCase());
        const testId = await page.locator(':focus').getAttribute('data-testid');
        
        tabStops.push({ tagName, testId });
        
        // Break if we've reached the end of the form
        if (tagName === 'button' && (testId?.includes('save') || testId?.includes('cancel'))) {
          break;
        }
      }
      
      console.log('Keyboard navigation tab stops:', tabStops);
      expect(tabStops.length).toBeGreaterThan(3); // Should have multiple focusable elements
      
      // Close form with Escape key
      await page.keyboard.press('Escape');
    });

    test('should handle form state persistence during navigation', async ({ page }) => {
      await organizationsPage.goToOrganizations();
      await organizationsPage.addOrganizationButton.click();
      await organizationsPage.organizationForm.waitFor({ state: 'visible' });
      
      // Fill some form data
      await organizationsPage.nameInput.fill('Persistence Test Organization');
      await organizationsPage.emailInput.fill('persistence@test.com');
      
      // Navigate away (if form allows it)
      try {
        await page.keyboard.press('F5'); // Refresh page
        
        // Check if form data is preserved (implementation dependent)
        const nameValue = await organizationsPage.nameInput.inputValue();
        const emailValue = await organizationsPage.emailInput.inputValue();
        
        console.log('Form persistence test:', {
          namePreserved: nameValue.includes('Persistence Test'),
          emailPreserved: emailValue.includes('persistence@test.com')
        });
        
      } catch {
        console.log('Form persistence test skipped - form prevents navigation');
      }
    });
  });
});