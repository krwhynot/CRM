#!/usr/bin/env node

/**
 * MCP-Based Authentication Testing
 * Tests authentication flows using MCP Playwright browser tools
 * Replaces traditional Playwright page object model approach
 */

import { spawn } from 'child_process';

class MCPAuthTests {
  constructor() {
    this.baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    this.testResults = [];
  }

  async runMCPCommand(tool, params) {
    return new Promise((resolve, reject) => {
      const claude = spawn('claude', ['--permission-mode', 'plan'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const command = {
        tool: tool,
        parameters: params
      };

      claude.stdin.write(JSON.stringify(command));
      claude.stdin.end();

      let output = '';
      let error = '';

      claude.stdout.on('data', (data) => {
        output += data.toString();
      });

      claude.stderr.on('data', (data) => {
        error += data.toString();
      });

      claude.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output));
          } catch (e) {
            resolve(output);
          }
        } else {
          reject(new Error(`MCP command failed: ${error}`));
        }
      });
    });
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test_loginPageDisplay() {
    await this.log('Testing: Login page displays correctly');
    
    try {
      // Navigate to login page
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/login`
      });

      // Take snapshot to verify page structure
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Check if login form elements are present
      if (snapshot.includes('email') && snapshot.includes('password') && snapshot.includes('login')) {
        await this.log('Login page displays correctly', 'success');
        return true;
      } else {
        await this.log('Login form elements not found', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Login page test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_validLogin() {
    await this.log('Testing: Valid login credentials');
    
    try {
      // Navigate to login page
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/login`
      });

      // Get page snapshot to find form elements
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Find email input (look for email type input)
      const emailMatch = snapshot.match(/input.*email.*ref="(\w+)"/);
      const passwordMatch = snapshot.match(/input.*password.*ref="(\w+)"/);
      const loginMatch = snapshot.match(/button.*[Ll]ogin.*ref="(\w+)"/);

      if (!emailMatch || !passwordMatch || !loginMatch) {
        await this.log('Could not find login form elements', 'error');
        return false;
      }

      // Fill email field
      await this.runMCPCommand('mcp__playwright__browser_type', {
        element: 'email input field',
        ref: emailMatch[1],
        text: process.env.TEST_USER_EMAIL || 'test@example.com'
      });

      // Fill password field  
      await this.runMCPCommand('mcp__playwright__browser_type', {
        element: 'password input field',
        ref: passwordMatch[1],
        text: process.env.TEST_USER_PASSWORD || 'testpassword'
      });

      // Click login button
      await this.runMCPCommand('mcp__playwright__browser_click', {
        element: 'login button',
        ref: loginMatch[1]
      });

      // Wait for navigation/response
      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 3
      });

      // Check if we're redirected to dashboard
      const finalSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      if (finalSnapshot.includes('dashboard') || finalSnapshot.includes('Dashboard') || 
          finalSnapshot.includes('welcome') || finalSnapshot.includes('Welcome')) {
        await this.log('Valid login successful - redirected to dashboard', 'success');
        return true;
      } else {
        await this.log('Login did not redirect to expected page', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Valid login test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_invalidLogin() {
    await this.log('Testing: Invalid login credentials');
    
    try {
      // Navigate to login page
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/login`
      });

      // Get page snapshot
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Find form elements
      const emailMatch = snapshot.match(/input.*email.*ref="(\w+)"/);
      const passwordMatch = snapshot.match(/input.*password.*ref="(\w+)"/);
      const loginMatch = snapshot.match(/button.*[Ll]ogin.*ref="(\w+)"/);

      if (!emailMatch || !passwordMatch || !loginMatch) {
        await this.log('Could not find login form elements', 'error');
        return false;
      }

      // Fill with invalid credentials
      await this.runMCPCommand('mcp__playwright__browser_type', {
        element: 'email input field',
        ref: emailMatch[1],
        text: 'invalid@example.com'
      });

      await this.runMCPCommand('mcp__playwright__browser_type', {
        element: 'password input field',
        ref: passwordMatch[1],
        text: 'wrongpassword'
      });

      // Click login button
      await this.runMCPCommand('mcp__playwright__browser_click', {
        element: 'login button',
        ref: loginMatch[1]
      });

      // Wait for error response
      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      // Check for error message
      const errorSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      if (errorSnapshot.includes('error') || errorSnapshot.includes('Error') || 
          errorSnapshot.includes('invalid') || errorSnapshot.includes('Invalid')) {
        await this.log('Invalid login correctly shows error message', 'success');
        return true;
      } else {
        await this.log('No error message displayed for invalid login', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Invalid login test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_protectedRouteAccess() {
    await this.log('Testing: Protected route access when not logged in');
    
    try {
      // Try to access protected route directly
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/organizations`
      });

      // Wait for redirect
      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      // Check if we're redirected to login
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      if (snapshot.includes('login') || snapshot.includes('Login') || 
          snapshot.includes('email') && snapshot.includes('password')) {
        await this.log('Protected route correctly redirects to login', 'success');
        return true;
      } else {
        await this.log('Protected route access was not blocked', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Protected route test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_logoutFunctionality() {
    await this.log('Testing: Logout functionality');
    
    try {
      // First login
      const loginSuccess = await this.test_validLogin();
      if (!loginSuccess) {
        await this.log('Cannot test logout - login failed', 'error');
        return false;
      }

      // Look for user menu or logout option
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Find logout button/menu
      const logoutMatch = snapshot.match(/button.*[Ll]ogout.*ref="(\w+)"/) ||
                         snapshot.match(/.*[Uu]ser.*menu.*ref="(\w+)"/);

      if (logoutMatch) {
        // Click logout
        await this.runMCPCommand('mcp__playwright__browser_click', {
          element: 'logout button or user menu',
          ref: logoutMatch[1]
        });

        // Wait for logout
        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 2
        });

        // Check if redirected to login
        const logoutSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
        
        if (logoutSnapshot.includes('login') || logoutSnapshot.includes('Login')) {
          await this.log('Logout successfully redirects to login page', 'success');
          return true;
        }
      }
      
      await this.log('Logout functionality could not be verified', 'error');
      return false;
    } catch (error) {
      await this.log(`Logout test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    await this.log('Starting MCP Authentication Tests');
    
    const tests = [
      { name: 'Login Page Display', fn: () => this.test_loginPageDisplay() },
      { name: 'Valid Login', fn: () => this.test_validLogin() },
      { name: 'Invalid Login', fn: () => this.test_invalidLogin() },
      { name: 'Protected Route Access', fn: () => this.test_protectedRouteAccess() },
      { name: 'Logout Functionality', fn: () => this.test_logoutFunctionality() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          passed++;
        } else {
          failed++;
        }
        this.testResults.push({ name: test.name, passed: result });
      } catch (error) {
        await this.log(`Test ${test.name} threw error: ${error.message}`, 'error');
        failed++;
        this.testResults.push({ name: test.name, passed: false, error: error.message });
      }
    }

    // Close browser
    await this.runMCPCommand('mcp__playwright__browser_close', {});

    await this.log(`\n=== Test Results ===`);
    await this.log(`Passed: ${passed}`);
    await this.log(`Failed: ${failed}`);
    await this.log(`Total: ${passed + failed}`);

    return { passed, failed, results: this.testResults };
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const authTests = new MCPAuthTests();
  authTests.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export default MCPAuthTests;