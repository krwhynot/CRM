import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page Object Model for Authentication-related pages
 * Handles login, signup, forgot password, and logout functionality
 */
export class AuthPage extends BasePage {
  // Login form elements
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  
  // Sign up form elements
  readonly signUpForm: Locator;
  readonly signUpEmailInput: Locator;
  readonly signUpPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signUpButton: Locator;
  
  // Forgot password form elements
  readonly forgotPasswordForm: Locator;
  readonly forgotEmailInput: Locator;
  readonly resetPasswordButton: Locator;
  readonly backToLoginLink: Locator;
  
  // Reset password form elements
  readonly resetPasswordForm: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmNewPasswordInput: Locator;
  readonly submitResetButton: Locator;
  
  // User menu elements (for logout)
  readonly logoutButton: Locator;
  
  // Error and success messages
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Login form
    this.loginForm = page.locator('[data-testid="login-form"]');
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me-checkbox"]');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    this.signUpLink = page.locator('[data-testid="signup-link"]');
    
    // Sign up form
    this.signUpForm = page.locator('[data-testid="signup-form"]');
    this.signUpEmailInput = page.locator('[data-testid="signup-email-input"]');
    this.signUpPasswordInput = page.locator('[data-testid="signup-password-input"]');
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]');
    this.signUpButton = page.locator('[data-testid="signup-button"]');
    
    // Forgot password form
    this.forgotPasswordForm = page.locator('[data-testid="forgot-password-form"]');
    this.forgotEmailInput = page.locator('[data-testid="forgot-email-input"]');
    this.resetPasswordButton = page.locator('[data-testid="reset-password-button"]');
    this.backToLoginLink = page.locator('[data-testid="back-to-login-link"]');
    
    // Reset password form
    this.resetPasswordForm = page.locator('[data-testid="reset-password-form"]');
    this.newPasswordInput = page.locator('[data-testid="new-password-input"]');
    this.confirmNewPasswordInput = page.locator('[data-testid="confirm-new-password-input"]');
    this.submitResetButton = page.locator('[data-testid="submit-reset-button"]');
    
    // User menu
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    
    // Messages
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.goto('/login');
    await this.loginForm.waitFor({ state: 'visible' });
  }

  /**
   * Navigate to sign up page
   */
  async goToSignUp() {
    await this.goto('/signup');
    // Or click signup link from login page
    if (await this.signUpLink.isVisible()) {
      await this.signUpLink.click();
    }
    await this.signUpForm.waitFor({ state: 'visible' });
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword() {
    await this.goto('/forgot-password');
    // Or click forgot password link from login page
    if (await this.forgotPasswordLink.isVisible()) {
      await this.forgotPasswordLink.click();
    }
    await this.forgotPasswordForm.waitFor({ state: 'visible' });
  }

  /**
   * Perform login with email and password
   */
  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.goToLogin();
    
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    await this.loginButton.click();
    
    // Wait for either dashboard or error message
    await Promise.race([
      this.page.waitForURL('/', { timeout: 10000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 })
    ]);
  }

  /**
   * Perform signup with email and password
   */
  async signUp(email: string, password: string, confirmPassword?: string) {
    await this.goToSignUp();
    
    await this.signUpEmailInput.fill(email);
    await this.signUpPasswordInput.fill(password);
    
    if (confirmPassword) {
      await this.confirmPasswordInput.fill(confirmPassword);
    } else {
      await this.confirmPasswordInput.fill(password);
    }
    
    await this.signUpButton.click();
    
    // Wait for either dashboard or error message
    await Promise.race([
      this.page.waitForURL('/', { timeout: 10000 }),
      this.successMessage.waitFor({ state: 'visible', timeout: 5000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 })
    ]);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    await this.goToForgotPassword();
    
    await this.forgotEmailInput.fill(email);
    await this.resetPasswordButton.click();
    
    // Wait for success or error message
    await Promise.race([
      this.successMessage.waitFor({ state: 'visible', timeout: 5000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 })
    ]);
  }

  /**
   * Reset password with new password
   */
  async resetPassword(newPassword: string, confirmPassword?: string) {
    // Assumes we're already on the reset password page with valid token
    await this.resetPasswordForm.waitFor({ state: 'visible' });
    
    await this.newPasswordInput.fill(newPassword);
    await this.confirmNewPasswordInput.fill(confirmPassword || newPassword);
    
    await this.submitResetButton.click();
    
    // Wait for success or error
    await Promise.race([
      this.page.waitForURL('/login', { timeout: 10000 }),
      this.successMessage.waitFor({ state: 'visible', timeout: 5000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 })
    ]);
  }

  /**
   * Logout from the application
   */
  async logout() {
    // Click user menu to reveal logout option
    await this.userMenu.click();
    await this.logoutButton.waitFor({ state: 'visible' });
    await this.logoutButton.click();
    
    // Wait for redirect to login page
    await this.page.waitForURL('/login', { timeout: 10000 });
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.isAuthenticated();
  }

  /**
   * Verify login form is visible and interactive
   */
  async verifyLoginForm() {
    await expect(this.loginForm).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
    
    // Check if form is interactive
    await expect(this.emailInput).toBeEditable();
    await expect(this.passwordInput).toBeEditable();
    await expect(this.loginButton).toBeEnabled();
  }

  /**
   * Verify sign up form is visible and interactive
   */
  async verifySignUpForm() {
    await expect(this.signUpForm).toBeVisible();
    await expect(this.signUpEmailInput).toBeVisible();
    await expect(this.signUpPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.signUpButton).toBeVisible();
    
    // Check if form is interactive
    await expect(this.signUpEmailInput).toBeEditable();
    await expect(this.signUpPasswordInput).toBeEditable();
    await expect(this.confirmPasswordInput).toBeEditable();
    await expect(this.signUpButton).toBeEnabled();
  }

  /**
   * Verify password reset form is visible
   */
  async verifyForgotPasswordForm() {
    await expect(this.forgotPasswordForm).toBeVisible();
    await expect(this.forgotEmailInput).toBeVisible();
    await expect(this.resetPasswordButton).toBeVisible();
    await expect(this.backToLoginLink).toBeVisible();
  }

  /**
   * Get current error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Get current success message text
   */
  async getSuccessMessage(): Promise<string> {
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
    return await this.successMessage.textContent() || '';
  }

  /**
   * Verify protected route redirects to login
   */
  async verifyProtectedRouteRedirect(protectedPath: string) {
    await this.goto(protectedPath);
    await this.page.waitForURL('/login', { timeout: 10000 });
    await this.verifyLoginForm();
  }

  /**
   * Test login with invalid credentials
   */
  async testInvalidLogin() {
    const invalidCredentials = [
      { email: 'invalid@email.com', password: 'wrongpassword' },
      { email: 'test@example.com', password: 'wrongpassword' },
      { email: 'notanemail', password: 'password123' },
      { email: '', password: 'password123' },
      { email: 'test@example.com', password: '' }
    ];

    for (const { email, password } of invalidCredentials) {
      await this.login(email, password);
      
      // Should stay on login page with error
      expect(this.page.url()).toContain('/login');
      
      const hasError = await this.errorMessage.isVisible();
      expect(hasError).toBe(true);
      
      // Clear form for next iteration
      await this.emailInput.clear();
      await this.passwordInput.clear();
    }
  }

  /**
   * Test form validation messages
   */
  async testFormValidation() {
    await this.goToLogin();
    
    // Test empty form submission
    await this.loginButton.click();
    
    // Should show validation errors
    const emailError = this.page.locator('[data-testid="email-error"]');
    const passwordError = this.page.locator('[data-testid="password-error"]');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
    
    // Test invalid email format
    await this.emailInput.fill('invalid-email');
    await this.emailInput.blur();
    await expect(emailError).toContainText('email');
    
    // Test password requirements (if any)
    await this.passwordInput.fill('123');
    await this.passwordInput.blur();
    // Check if password length validation appears
  }
}