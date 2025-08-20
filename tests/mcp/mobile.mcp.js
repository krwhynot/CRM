#!/usr/bin/env node

/**
 * MCP-Based Mobile Responsiveness Testing
 * Tests mobile and tablet responsiveness using MCP Playwright browser tools
 * Focus on iPad optimization as specified in project requirements
 */

import { spawn } from 'child_process';

class MCPMobileTests {
  constructor() {
    this.baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    this.testResults = [];
    this.viewports = {
      mobile: { width: 375, height: 667 },    // iPhone
      tablet: { width: 768, height: 1024 },   // iPad
      ipad: { width: 1024, height: 768 },     // iPad landscape
      desktop: { width: 1920, height: 1080 }  // Desktop baseline
    };
  }

  async runMCPCommand(tool, params) {
    return new Promise((resolve, reject) => {
      const claude = spawn('claude', ['code', '--tools-only'], {
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

  async login() {
    await this.log('Logging in for mobile tests');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/login`
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      const emailMatch = snapshot.match(/input.*email.*ref="(\w+)"/);
      const passwordMatch = snapshot.match(/input.*password.*ref="(\w+)"/);
      const loginMatch = snapshot.match(/button.*[Ll]ogin.*ref="(\w+)"/);

      if (emailMatch && passwordMatch && loginMatch) {
        await this.runMCPCommand('mcp__playwright__browser_type', {
          element: 'email input field',
          ref: emailMatch[1],
          text: process.env.TEST_USER_EMAIL || 'test@example.com'
        });

        await this.runMCPCommand('mcp__playwright__browser_type', {
          element: 'password input field',
          ref: passwordMatch[1],
          text: process.env.TEST_USER_PASSWORD || 'testpassword'
        });

        await this.runMCPCommand('mcp__playwright__browser_click', {
          element: 'login button',
          ref: loginMatch[1]
        });

        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 3
        });

        return true;
      }
      return false;
    } catch (error) {
      await this.log(`Login failed: ${error.message}`, 'error');
      return false;
    }
  }

  async setViewport(viewportName) {
    const viewport = this.viewports[viewportName];
    if (!viewport) {
      throw new Error(`Unknown viewport: ${viewportName}`);
    }

    await this.runMCPCommand('mcp__playwright__browser_resize', {
      width: viewport.width,
      height: viewport.height
    });

    await this.runMCPCommand('mcp__playwright__browser_wait_for', {
      time: 1
    });
  }

  async test_mobileLoginInterface() {
    await this.log('Testing: Mobile login interface');
    
    try {
      // Test mobile viewport
      await this.setViewport('mobile');
      
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/login`
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Check if form elements are accessible
      const hasEmail = snapshot.includes('email');
      const hasPassword = snapshot.includes('password');
      const hasLogin = snapshot.includes('login') || snapshot.includes('Login');
      
      if (hasEmail && hasPassword && hasLogin) {
        await this.log('Mobile login interface displays correctly', 'success');
        return true;
      } else {
        await this.log('Mobile login interface missing elements', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Mobile login test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_tabletDashboard() {
    await this.log('Testing: Tablet dashboard (iPad optimized)');
    
    try {
      // Set iPad viewport
      await this.setViewport('ipad');
      
      // Login first
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        return false;
      }

      // Navigate to dashboard
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Check for dashboard elements optimized for iPad
      const hasDashboard = snapshot.includes('dashboard') || snapshot.includes('Dashboard');
      const hasNavigation = snapshot.includes('nav') || snapshot.includes('menu');
      const hasContent = snapshot.includes('Organizations') || snapshot.includes('Contacts');
      
      if (hasDashboard && hasNavigation && hasContent) {
        await this.log('iPad dashboard displays correctly', 'success');
        return true;
      } else {
        await this.log('iPad dashboard layout issues detected', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Tablet dashboard test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_mobileNavigation() {
    await this.log('Testing: Mobile navigation functionality');
    
    try {
      await this.setViewport('mobile');
      
      // Should be logged in from previous test
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/`
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Look for mobile menu/hamburger button
      const menuMatch = snapshot.match(/button.*[Mm]enu.*ref="(\w+)"/) ||
                       snapshot.match(/.*hamburger.*ref="(\w+)"/) ||
                       snapshot.match(/.*☰.*ref="(\w+)"/);

      if (menuMatch) {
        // Click mobile menu
        await this.runMCPCommand('mcp__playwright__browser_click', {
          element: 'mobile menu button',
          ref: menuMatch[1]
        });

        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 1
        });

        // Check if navigation options appear
        const menuSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
        
        if (menuSnapshot.includes('Organizations') || menuSnapshot.includes('Contacts') ||
            menuSnapshot.includes('Products') || menuSnapshot.includes('Opportunities')) {
          await this.log('Mobile navigation menu works correctly', 'success');
          return true;
        }
      }
      
      // Alternative: check if navigation is always visible on mobile
      if (snapshot.includes('Organizations') && snapshot.includes('Contacts')) {
        await this.log('Mobile navigation always visible (alternative layout)', 'success');
        return true;
      }
      
      await this.log('Mobile navigation not functioning properly', 'error');
      return false;
    } catch (error) {
      await this.log(`Mobile navigation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_tabletFormsUsability() {
    await this.log('Testing: Tablet forms usability (iPad)');
    
    try {
      await this.setViewport('tablet');
      
      // Navigate to organizations to test form
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/organizations`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Look for Add button
      const addMatch = snapshot.match(/button.*[Aa]dd.*ref="(\w+)"/) ||
                      snapshot.match(/button.*[Cc]reate.*ref="(\w+)"/);

      if (addMatch) {
        // Click Add button
        await this.runMCPCommand('mcp__playwright__browser_click', {
          element: 'add button',
          ref: addMatch[1]
        });

        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 2
        });

        // Check form layout on tablet
        const formSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
        
        // Look for form fields
        const hasFormFields = formSnapshot.includes('input') || formSnapshot.includes('textarea');
        const hasLabels = formSnapshot.includes('label') || formSnapshot.includes('Name');
        
        if (hasFormFields && hasLabels) {
          await this.log('Tablet form layout is usable', 'success');
          return true;
        }
      }
      
      await this.log('Tablet form usability issues detected', 'error');
      return false;
    } catch (error) {
      await this.log(`Tablet forms test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_responsiveDataTables() {
    await this.log('Testing: Responsive data tables');
    
    try {
      // Test on mobile first
      await this.setViewport('mobile');
      
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/organizations`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const mobileSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Check if table data is accessible on mobile
      const hasMobileData = mobileSnapshot.includes('organization') || 
                           mobileSnapshot.includes('Organization') ||
                           mobileSnapshot.includes('table') ||
                           mobileSnapshot.includes('list');

      // Test on tablet
      await this.setViewport('tablet');
      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 1
      });

      const tabletSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      const hasTabletData = tabletSnapshot.includes('organization') || 
                           tabletSnapshot.includes('Organization') ||
                           tabletSnapshot.includes('table');

      if (hasMobileData && hasTabletData) {
        await this.log('Data tables responsive across viewports', 'success');
        return true;
      } else {
        await this.log('Data tables not properly responsive', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Responsive tables test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_touchInteractions() {
    await this.log('Testing: Touch interactions on mobile');
    
    try {
      await this.setViewport('mobile');
      
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/organizations`
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Look for interactive elements
      const buttonMatch = snapshot.match(/button.*ref="(\w+)"/);
      
      if (buttonMatch) {
        // Test touch interaction by clicking
        await this.runMCPCommand('mcp__playwright__browser_click', {
          element: 'button element',
          ref: buttonMatch[1]
        });

        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 1
        });

        await this.log('Touch interactions working on mobile', 'success');
        return true;
      }
      
      await this.log('No interactive elements found for touch testing', 'error');
      return false;
    } catch (error) {
      await this.log(`Touch interactions test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    await this.log('Starting MCP Mobile Responsiveness Tests');
    
    const tests = [
      { name: 'Mobile Login Interface', fn: () => this.test_mobileLoginInterface() },
      { name: 'Tablet Dashboard (iPad)', fn: () => this.test_tabletDashboard() },
      { name: 'Mobile Navigation', fn: () => this.test_mobileNavigation() },
      { name: 'Tablet Forms Usability', fn: () => this.test_tabletFormsUsability() },
      { name: 'Responsive Data Tables', fn: () => this.test_responsiveDataTables() },
      { name: 'Touch Interactions', fn: () => this.test_touchInteractions() }
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

    // Reset viewport to desktop
    await this.setViewport('desktop');

    // Close browser
    await this.runMCPCommand('mcp__playwright__browser_close', {});

    await this.log(`\n=== Mobile Test Results ===`);
    await this.log(`Passed: ${passed}`);
    await this.log(`Failed: ${failed}`);
    await this.log(`Total: ${passed + failed}`);

    return { passed, failed, results: this.testResults };
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const mobileTests = new MCPMobileTests();
  mobileTests.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Mobile test suite failed:', error);
    process.exit(1);
  });
}

export default MCPMobileTests;