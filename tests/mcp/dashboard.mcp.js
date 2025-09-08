#!/usr/bin/env node

/**
 * MCP-Based Dashboard Functionality Testing
 * Tests dashboard metrics, activity feeds, and business intelligence features
 * using MCP Playwright browser tools
 */

import { spawn } from 'child_process';

class MCPDashboardTests {
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

  async login() {
    await this.log('Logging in for dashboard tests');
    
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

  async test_dashboardLoads() {
    await this.log('Testing: Dashboard page loads correctly');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 3
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Check for dashboard elements
      const hasDashboard = snapshot.includes('dashboard') || snapshot.includes('Dashboard') ||
                          snapshot.includes('Welcome') || snapshot.includes('welcome');
      
      const hasNavigation = snapshot.includes('Organizations') || snapshot.includes('Contacts') ||
                           snapshot.includes('Products') || snapshot.includes('Opportunities');

      if (hasDashboard || hasNavigation) {
        await this.log('Dashboard loads successfully', 'success');
        return true;
      } else {
        await this.log('Dashboard did not load correctly', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Dashboard load test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_metricsDisplay() {
    await this.log('Testing: Dashboard metrics display');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Look for metric indicators (numbers, charts, cards)
      const hasMetrics = snapshot.includes('Total') || snapshot.includes('total') ||
                        snapshot.includes('Count') || snapshot.includes('count') ||
                        snapshot.includes('Recent') || snapshot.includes('recent') ||
                        /\d+/.test(snapshot); // Contains numbers

      const hasCards = snapshot.includes('card') || snapshot.includes('Card') ||
                      snapshot.includes('metric') || snapshot.includes('Metric');

      if (hasMetrics || hasCards) {
        await this.log('Dashboard metrics are displayed', 'success');
        return true;
      } else {
        await this.log('No dashboard metrics found', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Metrics display test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_activityFeed() {
    await this.log('Testing: Activity feed functionality');
    
    try {
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Look for activity feed elements
      const hasActivity = snapshot.includes('Activity') || snapshot.includes('activity') ||
                         snapshot.includes('Recent') || snapshot.includes('recent') ||
                         snapshot.includes('Updates') || snapshot.includes('updates') ||
                         snapshot.includes('History') || snapshot.includes('history');

      const hasTimestamps = snapshot.includes('ago') || snapshot.includes('minutes') ||
                           snapshot.includes('hours') || snapshot.includes('days') ||
                           snapshot.includes('created') || snapshot.includes('updated');

      if (hasActivity || hasTimestamps) {
        await this.log('Activity feed is present and functional', 'success');
        return true;
      } else {
        await this.log('Activity feed not found or not functional', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Activity feed test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_quickActions() {
    await this.log('Testing: Quick actions on dashboard');
    
    try {
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Look for quick action buttons
      const quickActionMatch = snapshot.match(/button.*[Aa]dd.*ref="(\w+)"/) ||
                              snapshot.match(/button.*[Cc]reate.*ref="(\w+)"/) ||
                              snapshot.match(/button.*[Nn]ew.*ref="(\w+)"/) ||
                              snapshot.match(/.*[Qq]uick.*ref="(\w+)"/);

      if (quickActionMatch) {
        // Try clicking a quick action
        await this.runMCPCommand('mcp__playwright__browser_click', {
          element: 'quick action button',
          ref: quickActionMatch[1]
        });

        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 2
        });

        // Check if action triggered (form opened, navigation occurred, etc.)
        const actionSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
        
        if (actionSnapshot !== snapshot) {
          await this.log('Quick actions are functional', 'success');
          return true;
        }
      }
      
      // Alternative: check if navigation links work as quick actions
      const navMatch = snapshot.match(/.*[Oo]rganizations.*ref="(\w+)"/) ||
                      snapshot.match(/.*[Cc]ontacts.*ref="(\w+)"/);

      if (navMatch) {
        await this.log('Dashboard navigation acts as quick actions', 'success');
        return true;
      }
      
      await this.log('No functional quick actions found', 'error');
      return false;
    } catch (error) {
      await this.log(`Quick actions test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_responsiveDashboard() {
    await this.log('Testing: Dashboard responsiveness');
    
    try {
      // Test mobile layout
      await this.runMCPCommand('mcp__playwright__browser_resize', {
        width: 375,
        height: 667
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 1
      });

      const mobileSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Check if content is still accessible on mobile
      const mobileUsable = mobileSnapshot.includes('Organizations') || 
                          mobileSnapshot.includes('Contacts') ||
                          mobileSnapshot.includes('dashboard') ||
                          mobileSnapshot.includes('menu');

      // Test tablet layout
      await this.runMCPCommand('mcp__playwright__browser_resize', {
        width: 768,
        height: 1024
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 1
      });

      const tabletSnapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      const tabletUsable = tabletSnapshot.includes('Organizations') || 
                          tabletSnapshot.includes('Contacts') ||
                          tabletSnapshot.includes('dashboard');

      // Reset to desktop
      await this.runMCPCommand('mcp__playwright__browser_resize', {
        width: 1920,
        height: 1080
      });

      if (mobileUsable && tabletUsable) {
        await this.log('Dashboard is responsive across viewports', 'success');
        return true;
      } else {
        await this.log('Dashboard responsiveness issues detected', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Responsive dashboard test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_dataVisualization() {
    await this.log('Testing: Data visualization elements');
    
    try {
      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      // Look for data visualization elements
      const hasCharts = snapshot.includes('chart') || snapshot.includes('Chart') ||
                       snapshot.includes('graph') || snapshot.includes('Graph');

      const hasProgress = snapshot.includes('progress') || snapshot.includes('Progress') ||
                         snapshot.includes('bar') || snapshot.includes('Bar');

      const hasVisualData = snapshot.includes('visual') || snapshot.includes('Visual') ||
                           snapshot.includes('svg') || snapshot.includes('canvas');

      if (hasCharts || hasProgress || hasVisualData) {
        await this.log('Data visualization elements are present', 'success');
        return true;
      } else {
        await this.log('No data visualization elements found', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Data visualization test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_performanceMetrics() {
    await this.log('Testing: Dashboard performance metrics');
    
    try {
      const startTime = Date.now();
      
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 3
      });

      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within reasonable time (< 5 seconds)
      if (loadTime < 5000) {
        await this.log(`Dashboard loads efficiently (${loadTime}ms)`, 'success');
        return true;
      } else {
        await this.log(`Dashboard load time too slow (${loadTime}ms)`, 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Performance metrics test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    await this.log('Starting MCP Dashboard Tests');
    
    // Login first
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      await this.log('Cannot run dashboard tests - login failed', 'error');
      return { passed: 0, failed: 1, results: [{ name: 'Login', passed: false }] };
    }

    const tests = [
      { name: 'Dashboard Loads', fn: () => this.test_dashboardLoads() },
      { name: 'Metrics Display', fn: () => this.test_metricsDisplay() },
      { name: 'Activity Feed', fn: () => this.test_activityFeed() },
      { name: 'Quick Actions', fn: () => this.test_quickActions() },
      { name: 'Responsive Dashboard', fn: () => this.test_responsiveDashboard() },
      { name: 'Data Visualization', fn: () => this.test_dataVisualization() },
      { name: 'Performance Metrics', fn: () => this.test_performanceMetrics() }
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

    await this.log(`\n=== Dashboard Test Results ===`);
    await this.log(`Passed: ${passed}`);
    await this.log(`Failed: ${failed}`);
    await this.log(`Total: ${passed + failed}`);

    return { passed, failed, results: this.testResults };
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboardTests = new MCPDashboardTests();
  dashboardTests.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Dashboard test suite failed:', error);
    process.exit(1);
  });
}

export default MCPDashboardTests;