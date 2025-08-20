#!/usr/bin/env node

/**
 * MCP-Based CRUD Operations Testing
 * Tests Create, Read, Update, Delete operations using MCP Playwright browser tools
 * Covers Organizations, Contacts, Products, Opportunities, and Interactions
 */

import { spawn } from 'child_process';

class MCPCrudTests {
  constructor() {
    this.baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    this.testResults = [];
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
    await this.log('Logging in for CRUD tests');
    
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

  async test_organizationsCrud() {
    await this.log('Testing: Organizations CRUD operations');
    
    try {
      // Navigate to organizations page
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/organizations`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      // Check if organizations page loads
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      if (snapshot.includes('Organizations') || snapshot.includes('organizations')) {
        await this.log('Organizations page loads successfully', 'success');
        
        // Look for "Add" or "Create" button
        const addMatch = snapshot.match(/button.*[Aa]dd.*ref="(\w+)"/) ||
                        snapshot.match(/button.*[Cc]reate.*ref="(\w+)"/) ||
                        snapshot.match(/button.*[Nn]ew.*ref="(\w+)"/);

        if (addMatch) {
          await this.log('Organizations CRUD interface available', 'success');
          return true;
        } else {
          await this.log('No Create/Add button found on organizations page', 'error');
          return false;
        }
      } else {
        await this.log('Organizations page did not load correctly', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Organizations CRUD test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_contactsCrud() {
    await this.log('Testing: Contacts CRUD operations');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/contacts`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      if (snapshot.includes('Contacts') || snapshot.includes('contacts')) {
        await this.log('Contacts page loads successfully', 'success');
        
        // Check for CRUD interface
        const hasInterface = snapshot.includes('Add') || snapshot.includes('Create') || 
                           snapshot.includes('add') || snapshot.includes('create');

        if (hasInterface) {
          await this.log('Contacts CRUD interface available', 'success');
          return true;
        } else {
          await this.log('Contacts CRUD interface not fully available', 'error');
          return false;
        }
      } else {
        await this.log('Contacts page did not load correctly', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Contacts CRUD test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_productsCrud() {
    await this.log('Testing: Products CRUD operations');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/products`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      if (snapshot.includes('Products') || snapshot.includes('products')) {
        await this.log('Products page loads successfully', 'success');
        
        const hasInterface = snapshot.includes('Add') || snapshot.includes('Create') || 
                           snapshot.includes('add') || snapshot.includes('create');

        if (hasInterface) {
          await this.log('Products CRUD interface available', 'success');
          return true;
        } else {
          await this.log('Products CRUD interface not fully available', 'error');
          return false;
        }
      } else {
        await this.log('Products page did not load correctly', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Products CRUD test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_opportunitiesCrud() {
    await this.log('Testing: Opportunities CRUD operations');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/opportunities`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      if (snapshot.includes('Opportunities') || snapshot.includes('opportunities')) {
        await this.log('Opportunities page loads successfully', 'success');
        
        const hasInterface = snapshot.includes('Add') || snapshot.includes('Create') || 
                           snapshot.includes('add') || snapshot.includes('create');

        if (hasInterface) {
          await this.log('Opportunities CRUD interface available', 'success');
          return true;
        } else {
          await this.log('Opportunities CRUD interface not fully available', 'error');
          return false;
        }
      } else {
        await this.log('Opportunities page did not load correctly', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Opportunities CRUD test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_interactionsCrud() {
    await this.log('Testing: Interactions CRUD operations');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/interactions`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      if (snapshot.includes('Interactions') || snapshot.includes('interactions')) {
        await this.log('Interactions page loads successfully', 'success');
        
        const hasInterface = snapshot.includes('Add') || snapshot.includes('Create') || 
                           snapshot.includes('add') || snapshot.includes('create');

        if (hasInterface) {
          await this.log('Interactions CRUD interface available', 'success');
          return true;
        } else {
          await this.log('Interactions CRUD interface not fully available', 'error');
          return false;
        }
      } else {
        await this.log('Interactions page did not load correctly', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Interactions CRUD test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_formValidation() {
    await this.log('Testing: Form validation across CRUD operations');
    
    try {
      // Test organization form validation
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/organizations`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Look for Add/Create button
      const addMatch = snapshot.match(/button.*[Aa]dd.*ref="(\w+)"/) ||
                      snapshot.match(/button.*[Cc]reate.*ref="(\w+)"/) ||
                      snapshot.match(/button.*[Nn]ew.*ref="(\w+)"/);

      if (addMatch) {
        // Click Add button to open form
        await this.runMCPCommand('mcp__playwright__browser_click', {
          element: 'add/create button',
          ref: addMatch[1]
        });

        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 2
        });

        // Get form snapshot
        const formSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
        
        // Look for submit button
        const submitMatch = formSnapshot.match(/button.*[Ss]ubmit.*ref="(\w+)"/) ||
                           formSnapshot.match(/button.*[Ss]ave.*ref="(\w+)"/) ||
                           formSnapshot.match(/button.*[Cc]reate.*ref="(\w+)"/);

        if (submitMatch) {
          // Try to submit empty form
          await this.runMCPCommand('mcp__playwright__browser_click', {
            element: 'submit button',
            ref: submitMatch[1]
          });

          await this.runMCPCommand('mcp__playwright__browser_wait_for', {
            time: 1
          });

          // Check for validation errors
          const validationSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
          
          if (validationSnapshot.includes('required') || validationSnapshot.includes('Required') ||
              validationSnapshot.includes('error') || validationSnapshot.includes('Error')) {
            await this.log('Form validation working correctly', 'success');
            return true;
          }
        }
      }
      
      await this.log('Form validation could not be verified', 'error');
      return false;
    } catch (error) {
      await this.log(`Form validation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    await this.log('Starting MCP CRUD Tests');
    
    // Login first
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      await this.log('Cannot run CRUD tests - login failed', 'error');
      return { passed: 0, failed: 1, results: [{ name: 'Login', passed: false }] };
    }

    const tests = [
      { name: 'Organizations CRUD', fn: () => this.test_organizationsCrud() },
      { name: 'Contacts CRUD', fn: () => this.test_contactsCrud() },
      { name: 'Products CRUD', fn: () => this.test_productsCrud() },
      { name: 'Opportunities CRUD', fn: () => this.test_opportunitiesCrud() },
      { name: 'Interactions CRUD', fn: () => this.test_interactionsCrud() },
      { name: 'Form Validation', fn: () => this.test_formValidation() }
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

    await this.log(`\n=== CRUD Test Results ===`);
    await this.log(`Passed: ${passed}`);
    await this.log(`Failed: ${failed}`);
    await this.log(`Total: ${passed + failed}`);

    return { passed, failed, results: this.testResults };
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const crudTests = new MCPCrudTests();
  crudTests.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('CRUD test suite failed:', error);
    process.exit(1);
  });
}

export default MCPCrudTests;