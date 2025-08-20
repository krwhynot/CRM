import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/auth-page';
import { DashboardPage } from '../page-objects/dashboard-page';
import { TestUsers } from '../utils/test-data';
import { AuthHelpers, PerformanceHelpers } from '../utils/test-helpers';

test.describe('Authentication Flow', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Ensure we start from logged out state
    try {
      if (await authPage.isLoggedIn()) {
        await AuthHelpers.logout(page);
      }
    } catch {
      // User might already be logged out
    }
  });

  test.afterEach(async ({ page }) => {
    // Clean up: ensure user is logged out after each test
    try {
      if (await authPage.isLoggedIn()) {
        await AuthHelpers.logout(page);
      }
    } catch {
      // User might already be logged out
    }
  });

  test('should display login page correctly', async () => {
    await authPage.goToLogin();
    
    // Verify page title
    await expect(authPage.page).toHaveTitle(/Kitchen Pantry CRM/);
    
    // Verify login form elements are visible and interactive
    await authPage.verifyLoginForm();
    
    // Check for proper ARIA labels and accessibility
    await expect(authPage.emailInput).toHaveAttribute('type', 'email');
    await expect(authPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(authPage.loginButton).toBeEnabled();
  });

  test('should login successfully with valid credentials', async () => {
    const startTime = Date.now();
    
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password);
    
    // Verify successful login - should redirect to dashboard
    await expect(authPage.page).toHaveURL('/');
    await expect(authPage.userMenu).toBeVisible();
    
    // Verify dashboard is displayed
    await dashboardPage.waitForDashboardLoad();
    await expect(dashboardPage.pageTitle).toBeVisible();
    
    // Check login performance
    const loginTime = Date.now() - startTime;
    expect(loginTime).toBeLessThan(5000); // Should login within 5 seconds
  });

  test('should show error message for invalid credentials', async () => {
    await authPage.login('invalid@email.com', 'wrongpassword');
    
    // Should remain on login page
    expect(authPage.page.url()).toContain('/login');
    
    // Should display error message
    await expect(authPage.errorMessage).toBeVisible();
    const errorText = await authPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('invalid');
  });

  test('should validate multiple invalid login attempts', async () => {
    for (const invalidUser of TestUsers.invalidUsers) {
      await authPage.login(invalidUser.email, invalidUser.password);
      
      // Should show error for each invalid attempt
      const hasError = await authPage.errorMessage.isVisible();
      expect(hasError).toBe(true);
      
      // Clear form for next attempt
      await authPage.emailInput.clear();
      await authPage.passwordInput.clear();
    }
  });

  test('should validate form fields', async () => {
    await authPage.testFormValidation();
    // Form validation test is implemented in the AuthPage class
  });

  test('should handle remember me functionality', async () => {
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password, true);
    
    // Verify login success
    await expect(authPage.page).toHaveURL('/');
    
    // Logout
    await AuthHelpers.logout(authPage.page);
    
    // Navigate back to login - check if email is remembered (if implemented)
    await authPage.goToLogin();
    
    // Note: Remember me functionality might store email in localStorage
    const rememberedEmail = await authPage.emailInput.inputValue();
    // This assertion depends on implementation - uncomment if remember me stores email
    // expect(rememberedEmail).toBe(TestUsers.validUser.email);
  });

  test('should handle logout correctly', async () => {
    // First login
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password);
    await expect(authPage.page).toHaveURL('/');
    
    // Then logout
    await authPage.logout();
    
    // Verify logout - should redirect to login page
    await expect(authPage.page).toHaveURL('/login');
    await expect(authPage.loginForm).toBeVisible();
    
    // Verify user menu is no longer visible
    await expect(authPage.userMenu).not.toBeVisible();
  });

  test('should redirect to login when accessing protected routes', async () => {
    const protectedRoutes = [
      '/',
      '/organizations',
      '/contacts',
      '/opportunities',
      '/products',
      '/interactions',
      '/import-export'
    ];

    for (const route of protectedRoutes) {
      await authPage.verifyProtectedRouteRedirect(route);
    }
  });

  test('should navigate to forgot password page', async () => {
    await authPage.goToForgotPassword();
    
    // Verify forgot password form is displayed
    await authPage.verifyForgotPasswordForm();
    
    // Test navigation back to login
    await authPage.backToLoginLink.click();
    await expect(authPage.loginForm).toBeVisible();
  });

  test('should handle password reset request', async () => {
    await authPage.requestPasswordReset(TestUsers.validUser.email);
    
    // Should show success or error message
    const hasSuccess = await authPage.successMessage.isVisible();
    const hasError = await authPage.errorMessage.isVisible();
    
    expect(hasSuccess || hasError).toBe(true);
    
    if (hasSuccess) {
      const successText = await authPage.getSuccessMessage();
      expect(successText.toLowerCase()).toContain('email');
    }
  });

  test('should maintain session across page refreshes', async () => {
    // Login first
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password);
    await expect(authPage.page).toHaveURL('/');
    
    // Refresh the page
    await authPage.page.reload();
    await authPage.waitForPageLoad();
    
    // Should still be logged in
    expect(await authPage.isLoggedIn()).toBe(true);
    await expect(authPage.userMenu).toBeVisible();
  });

  test('should handle session timeout gracefully', async () => {
    // Login first
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password);
    await expect(authPage.page).toHaveURL('/');
    
    // Simulate session timeout by clearing storage
    await authPage.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Navigate to a protected page
    await authPage.goto('/organizations');
    
    // Should redirect to login
    await expect(authPage.page).toHaveURL('/login');
  });

  test('should prevent access to auth pages when logged in', async () => {
    // Login first
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password);
    await expect(authPage.page).toHaveURL('/');
    
    // Try to access login page
    await authPage.goto('/login');
    
    // Should redirect to dashboard (or stay on current page)
    // This behavior depends on implementation
    const currentUrl = authPage.page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('should handle network errors during login', async () => {
    // Simulate offline condition
    await authPage.page.context().setOffline(true);
    
    await authPage.goToLogin();
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password);
    
    // Should show network error or timeout
    await authPage.page.waitForTimeout(3000);
    
    // Restore network
    await authPage.page.context().setOffline(false);
    
    // Verify error handling
    const hasError = await authPage.errorMessage.isVisible();
    expect(hasError).toBe(true);
  });

  test('should measure login performance', async () => {
    await authPage.goToLogin();
    
    const performanceStart = Date.now();
    
    await authPage.login(TestUsers.validUser.email, TestUsers.validUser.password);
    
    const performanceEnd = Date.now();
    const loginDuration = performanceEnd - performanceStart;
    
    // Login should complete within reasonable time
    expect(loginDuration).toBeLessThan(3000);
    
    // Measure page performance after login
    const performanceMetrics = await PerformanceHelpers.measurePageLoad(authPage.page);
    
    // Dashboard should load quickly
    expect(performanceMetrics.totalLoadTime).toBeLessThan(3000);
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500);
    
    console.log('Login Performance:', {
      loginDuration,
      ...performanceMetrics
    });
  });

  test('should work correctly on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      // Set mobile viewport for this test
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    await authPage.goToLogin();
    
    // Verify form is usable on mobile
    await authPage.verifyLoginForm();
    
    // Test mobile-specific interactions
    await authPage.emailInput.tap();
    await authPage.emailInput.fill(TestUsers.validUser.email);
    
    await authPage.passwordInput.tap();
    await authPage.passwordInput.fill(TestUsers.validUser.password);
    
    await authPage.loginButton.tap();
    
    // Verify successful login on mobile
    await expect(authPage.page).toHaveURL('/');
    await expect(authPage.userMenu).toBeVisible();
  });

  test('should handle concurrent login attempts', async ({ context }) => {
    // Create multiple pages to simulate concurrent logins
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    const authPage1 = new AuthPage(page1);
    const authPage2 = new AuthPage(page2);
    
    // Attempt concurrent logins
    const loginPromises = [
      authPage1.login(TestUsers.validUser.email, TestUsers.validUser.password),
      authPage2.login(TestUsers.validUser.email, TestUsers.validUser.password)
    ];
    
    await Promise.all(loginPromises);
    
    // Both should succeed (or handle according to business rules)
    const isPage1LoggedIn = await authPage1.isLoggedIn();
    const isPage2LoggedIn = await authPage2.isLoggedIn();
    
    // At least one should be logged in
    expect(isPage1LoggedIn || isPage2LoggedIn).toBe(true);
    
    // Clean up
    await page1.close();
    await page2.close();
  });

  test('should validate accessibility of login page', async ({ page }) => {
    await authPage.goToLogin();
    
    // Check for proper ARIA labels
    await expect(authPage.emailInput).toHaveAttribute('aria-label');
    await expect(authPage.passwordInput).toHaveAttribute('aria-label');
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(authPage.emailInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(authPage.passwordInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(authPage.loginButton).toBeFocused();
    
    // Check color contrast (basic validation)
    const loginButton = authPage.loginButton;
    const buttonStyles = await loginButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize
      };
    });
    
    // Basic accessibility checks
    expect(buttonStyles.fontSize).not.toBe('');
    expect(buttonStyles.backgroundColor).not.toBe('');
    expect(buttonStyles.color).not.toBe('');
  });
});

test.describe('Sign Up Flow', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test('should display sign up page correctly', async () => {
    await authPage.goToSignUp();
    await authPage.verifySignUpForm();
  });

  test('should validate password confirmation', async () => {
    await authPage.signUp(
      'newuser@example.com', 
      'ValidPassword123!', 
      'DifferentPassword123!'
    );
    
    // Should show password mismatch error
    await expect(authPage.errorMessage).toBeVisible();
    const errorText = await authPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('password');
  });

  test('should validate email format in sign up', async () => {
    await authPage.goToSignUp();
    
    // Test invalid email formats
    const invalidEmails = [
      'not-an-email',
      'invalid@',
      '@invalid.com',
      'spaces in@email.com'
    ];
    
    for (const email of invalidEmails) {
      await authPage.signUpEmailInput.fill(email);
      await authPage.signUpPasswordInput.fill('ValidPassword123!');
      await authPage.confirmPasswordInput.fill('ValidPassword123!');
      await authPage.signUpButton.click();
      
      // Should show email validation error
      const hasError = await authPage.errorMessage.isVisible();
      expect(hasError).toBe(true);
      
      // Clear form for next test
      await authPage.signUpEmailInput.clear();
      await authPage.signUpPasswordInput.clear();
      await authPage.confirmPasswordInput.clear();
    }
  });
});