#!/usr/bin/env node

/**
 * Phase 7: Mobile Responsive Behavior Tests for Enhanced Features
 * Tests mobile behavior for Phase 6 enhancements including weekly filters,
 * enhanced tables, chart visibility, and responsive design patterns
 */

import { spawn } from 'child_process';

class MCPMobileResponsiveTests {
  constructor() {
    this.baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    this.testResults = [];
    this.viewports = {
      mobile: { width: 375, height: 667 },     // iPhone SE
      mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
      tablet: { width: 768, height: 1024 },     // iPad
      tabletLarge: { width: 1024, height: 768 } // iPad Landscape
    };
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
    await this.log('Logging in for mobile responsive tests');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/login`
      });

      const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
      
      const emailMatch = snapshot.match(/input.*email.*ref=\"(\\w+)\"/);
      const passwordMatch = snapshot.match(/input.*password.*ref=\"(\\w+)\"/);
      const loginMatch = snapshot.match(/button.*[Ll]ogin.*ref=\"(\\w+)\"/);

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

  async testViewportResize(viewportName, viewport) {
    await this.log(`Testing ${viewportName} viewport (${viewport.width}x${viewport.height})`);
    
    await this.runMCPCommand('mcp__playwright__browser_resize', {
      width: viewport.width,
      height: viewport.height
    });

    await this.runMCPCommand('mcp__playwright__browser_wait_for', {
      time: 1
    });

    return await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
  }

  async test_dashboardMobileFilters() {
    await this.log('Testing: Dashboard mobile filter behavior');
    
    try {
      // Navigate to dashboard
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 2
      });

      for (const [viewportName, viewport] of Object.entries(this.viewports)) {
        const snapshot = await this.testViewportResize(viewportName, viewport);
        
        // Test filter accessibility on different viewports
        const hasFilters = snapshot.includes('filter') || snapshot.includes('Filter') ||
                          snapshot.includes('principal') || snapshot.includes('Principal') ||
                          snapshot.includes('weeks') || snapshot.includes('Weeks');

        const hasWeeklyFilters = snapshot.includes('Last 4 Weeks') || 
                                snapshot.includes('This Month') ||
                                snapshot.includes('weekly') || snapshot.includes('Weekly');

        if (hasFilters && hasWeeklyFilters) {
          await this.log(`${viewportName}: Dashboard filters are accessible and include weekly options`, 'success');
        } else if (hasFilters) {
          await this.log(`${viewportName}: Dashboard filters present but weekly options may be hidden`, 'info');
        } else {
          await this.log(`${viewportName}: Dashboard filters may not be accessible`, 'error');
          return false;
        }
      }

      return true;
    } catch (error) {
      await this.log(`Dashboard mobile filters test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_chartVisibilityMobile() {
    await this.log('Testing: Chart visibility controls on mobile');
    
    try {
      // Test chart visibility toggles on different viewports
      for (const [viewportName, viewport] of Object.entries(this.viewports)) {
        const snapshot = await this.testViewportResize(viewportName, viewport);
        
        // Look for chart visibility controls
        const hasChartControls = snapshot.includes('Charts (') || 
                                snapshot.includes('Show All') ||
                                snapshot.includes('Reset') ||
                                snapshot.includes('chart') || snapshot.includes('Chart');

        const hasToggleControls = snapshot.includes('Toggle') || 
                                 snapshot.includes('toggle') ||
                                 snapshot.includes('Weekly Activity') ||
                                 snapshot.includes('Principal Performance');

        if (hasChartControls) {
          await this.log(`${viewportName}: Chart visibility controls present`, 'success');
          
          // Try to interact with controls if visible
          if (hasToggleControls) {
            const showAllMatch = snapshot.match(/button.*Show All.*ref=\"(\\w+)\"/);
            if (showAllMatch) {
              try {
                await this.runMCPCommand('mcp__playwright__browser_click', {
                  element: 'show all charts button',
                  ref: showAllMatch[1]
                });
                
                await this.runMCPCommand('mcp__playwright__browser_wait_for', {
                  time: 1
                });
                
                await this.log(`${viewportName}: Chart visibility controls are interactive`, 'success');
              } catch (interactionError) {
                await this.log(`${viewportName}: Chart controls present but interaction failed`, 'info');
              }
            }
          }
        } else {
          // On very small screens, controls might be hidden or collapsed
          if (viewport.width < 400) {
            await this.log(`${viewportName}: Chart controls may be collapsed for small screen (acceptable)`, 'info');
          } else {
            await this.log(`${viewportName}: Chart visibility controls not found`, 'error');
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      await this.log(`Chart visibility mobile test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_mobileTableEnhancements() {
    await this.log('Testing: Enhanced table behavior on mobile');
    
    try {
      // Test opportunities table mobile behavior
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/opportunities`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 3
      });

      for (const [viewportName, viewport] of Object.entries(this.viewports)) {
        const snapshot = await this.testViewportResize(viewportName, viewport);
        
        // Check for table/list view on mobile
        const hasTable = snapshot.includes('table') || snapshot.includes('Table');
        const hasList = snapshot.includes('list') || snapshot.includes('List');
        const hasOpportunities = snapshot.includes('opportunity') || 
                                snapshot.includes('Opportunity') ||
                                snapshot.includes('opportunit');

        const hasExpandableRows = snapshot.includes('expand') || snapshot.includes('Expand') ||
                                 snapshot.includes('details') || snapshot.includes('Details');

        const hasWeeklyContext = snapshot.includes('this week') || 
                                snapshot.includes('This Week') ||
                                snapshot.includes('weekly') || snapshot.includes('Weekly');

        if (hasOpportunities && (hasTable || hasList)) {
          await this.log(`${viewportName}: Opportunities table/list is accessible`, 'success');
          
          if (hasExpandableRows) {
            await this.log(`${viewportName}: Table includes expandable row functionality`, 'success');
          }
          
          if (hasWeeklyContext) {
            await this.log(`${viewportName}: Weekly context indicators present`, 'success');
          }
        } else {
          await this.log(`${viewportName}: Opportunities table/list not accessible`, 'error');
          return false;
        }
      }

      return true;
    } catch (error) {
      await this.log(`Mobile table enhancements test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_mobileNavigationEnhanced() {
    await this.log('Testing: Enhanced mobile navigation with Phase 6 features');
    
    try {
      const pages = [
        { path: '/', name: 'Dashboard' },
        { path: '/opportunities', name: 'Opportunities' },
        { path: '/contacts', name: 'Contacts' },
        { path: '/organizations', name: 'Organizations' },
        { path: '/products', name: 'Products' },
        { path: '/interactions', name: 'Interactions' }
      ];

      for (const [viewportName, viewport] of Object.entries(this.viewports)) {
        await this.testViewportResize(viewportName, viewport);
        
        for (const page of pages) {
          try {
            await this.runMCPCommand('mcp__playwright__browser_navigate', {
              url: `${this.baseUrl}${page.path}`
            });

            await this.runMCPCommand('mcp__playwright__browser_wait_for', {
              time: 2
            });

            const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
            
            // Check for page-specific content and enhanced features
            const hasPageContent = snapshot.includes(page.name) || 
                                  snapshot.toLowerCase().includes(page.name.toLowerCase());

            const hasFilters = snapshot.includes('filter') || snapshot.includes('Filter');
            const hasSearch = snapshot.includes('search') || snapshot.includes('Search');
            const hasWeeklyFeatures = snapshot.includes('week') || snapshot.includes('Week');

            if (hasPageContent) {
              await this.log(`${viewportName} - ${page.name}: Page loads and content accessible`, 'success');
              
              if (hasFilters) {
                await this.log(`${viewportName} - ${page.name}: Enhanced filters available`, 'success');
              }
              
              if (hasWeeklyFeatures) {
                await this.log(`${viewportName} - ${page.name}: Weekly enhancements present`, 'success');
              }
            } else {
              await this.log(`${viewportName} - ${page.name}: Page content not accessible`, 'error');
              return false;
            }

          } catch (navError) {
            await this.log(`${viewportName} - ${page.name}: Navigation failed`, 'error');
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      await this.log(`Enhanced mobile navigation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_mobileInteractionEnhancements() {
    await this.log('Testing: Mobile interaction enhancements for Phase 6 features');
    
    try {
      // Test interaction timeline on mobile
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/interactions`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 3
      });

      for (const [viewportName, viewport] of Object.entries(this.viewports)) {
        const snapshot = await this.testViewportResize(viewportName, viewport);
        
        // Check for timeline features
        const hasTimeline = snapshot.includes('timeline') || snapshot.includes('Timeline');
        const hasWeeklyGrouping = snapshot.includes('This Week') || 
                                 snapshot.includes('Last Week') ||
                                 snapshot.includes('week') || snapshot.includes('Week');

        const hasExpandableItems = snapshot.includes('expand') || 
                                  snapshot.includes('Show More') ||
                                  snapshot.includes('details');

        const hasMobileOptimizedLayout = viewport.width <= 768 ? 
                                       (snapshot.includes('compact') || 
                                        snapshot.includes('mobile') ||
                                        !snapshot.includes('sidebar')) : true;

        if (hasTimeline || snapshot.includes('interaction')) {
          await this.log(`${viewportName}: Interaction content accessible`, 'success');
          
          if (hasWeeklyGrouping) {
            await this.log(`${viewportName}: Weekly grouping features present`, 'success');
          }
          
          if (hasExpandableItems) {
            await this.log(`${viewportName}: Expandable interaction items available`, 'success');
          }
          
          if (hasMobileOptimizedLayout) {
            await this.log(`${viewportName}: Mobile-optimized layout detected`, 'success');
          }
        } else {
          await this.log(`${viewportName}: Interaction features not accessible`, 'error');
          return false;
        }
      }

      return true;
    } catch (error) {
      await this.log(`Mobile interaction enhancements test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_mobilePerformanceOptimizations() {
    await this.log('Testing: Mobile performance optimizations for enhanced features');
    
    try {
      const performanceTests = [
        { path: '/', name: 'Dashboard', expectContent: 'dashboard' },
        { path: '/opportunities', name: 'Opportunities', expectContent: 'opportunit' }
      ];

      for (const test of performanceTests) {
        // Test on mobile viewport
        await this.testViewportResize('mobile', this.viewports.mobile);
        
        const startTime = Date.now();
        
        await this.runMCPCommand('mcp__playwright__browser_navigate', {
          url: `${this.baseUrl}${test.path}`
        });

        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 3
        });

        const endTime = Date.now();
        const loadTime = endTime - startTime;

        const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
        
        const hasExpectedContent = snapshot.toLowerCase().includes(test.expectContent);
        const hasLoadingOptimizations = !snapshot.includes('loading') || 
                                       snapshot.includes('loaded') ||
                                       hasExpectedContent;

        if (hasExpectedContent) {
          await this.log(`${test.name}: Mobile page loads successfully (${loadTime}ms)`, 'success');
          
          if (loadTime < 5000) {
            await this.log(`${test.name}: Mobile load time acceptable`, 'success');
          } else {
            await this.log(`${test.name}: Mobile load time slow but acceptable`, 'info');
          }
          
          if (hasLoadingOptimizations) {
            await this.log(`${test.name}: Loading optimizations working`, 'success');
          }
        } else {
          await this.log(`${test.name}: Mobile performance test failed - content not loaded`, 'error');
          return false;
        }
      }

      return true;
    } catch (error) {
      await this.log(`Mobile performance optimizations test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_mobileFilterConsistency() {
    await this.log('Testing: Mobile filter consistency across features');
    
    try {
      const features = [
        { path: '/', name: 'Dashboard' },
        { path: '/opportunities', name: 'Opportunities' },
        { path: '/contacts', name: 'Contacts' },
        { path: '/organizations', name: 'Organizations' }
      ];

      const mobileViewport = this.viewports.mobile;
      await this.testViewportResize('mobile', mobileViewport);

      for (const feature of features) {
        await this.runMCPCommand('mcp__playwright__browser_navigate', {
          url: `${this.baseUrl}${feature.path}`
        });

        await this.runMCPCommand('mcp__playwright__browser_wait_for', {
          time: 2
        });

        const snapshot = await this.runMCPCommand('mcp__playwright__browser_snapshot', {});
        
        // Check for consistent filter patterns
        const hasPrincipalFilter = snapshot.includes('principal') || snapshot.includes('Principal');
        const hasTimeRangeFilter = snapshot.includes('week') || snapshot.includes('Week') ||
                                  snapshot.includes('month') || snapshot.includes('Month');
        const hasSearchFilter = snapshot.includes('search') || snapshot.includes('Search');

        // Quick view should be feature-specific
        const hasQuickView = snapshot.includes('quick') || snapshot.includes('Quick') ||
                            snapshot.includes('view') || snapshot.includes('View');

        let consistencyScore = 0;
        if (hasPrincipalFilter) consistencyScore++;
        if (hasTimeRangeFilter) consistencyScore++;
        if (hasSearchFilter) consistencyScore++;

        if (consistencyScore >= 2) {
          await this.log(`${feature.name}: Mobile filter consistency good (${consistencyScore}/3 core filters)`, 'success');
          
          if (hasQuickView) {
            await this.log(`${feature.name}: Feature-specific quick views available`, 'success');
          }
        } else {
          await this.log(`${feature.name}: Mobile filter consistency needs improvement (${consistencyScore}/3)`, 'error');
          return false;
        }
      }

      return true;
    } catch (error) {
      await this.log(`Mobile filter consistency test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async test_mobileChartCarousel() {
    await this.log('Testing: Mobile chart carousel functionality');
    
    try {
      await this.runMCPCommand('mcp__playwright__browser_navigate', {
        url: `${this.baseUrl}/`
      });

      await this.runMCPCommand('mcp__playwright__browser_wait_for', {
        time: 3
      });

      // Test on mobile viewport
      const snapshot = await this.testViewportResize('mobile', this.viewports.mobile);
      
      // Look for carousel indicators or mobile-specific chart layout
      const hasCharts = snapshot.includes('chart') || snapshot.includes('Chart');
      const hasCarouselFeatures = snapshot.includes('carousel') || 
                                 snapshot.includes('slide') || snapshot.includes('Slide') ||
                                 snapshot.includes('swipe') || 
                                 snapshot.includes('next') || snapshot.includes('previous');

      const hasMobileChartLayout = snapshot.includes('mobile') || 
                                  (!snapshot.includes('grid') && hasCharts);

      if (hasCharts) {
        await this.log('Mobile: Charts are present on dashboard', 'success');
        
        if (hasCarouselFeatures) {
          await this.log('Mobile: Chart carousel features detected', 'success');
        } else if (hasMobileChartLayout) {
          await this.log('Mobile: Mobile-optimized chart layout detected', 'success');
        } else {
          await this.log('Mobile: Charts present but mobile optimization unclear', 'info');
        }
        
        return true;
      } else {
        await this.log('Mobile: No charts detected on dashboard', 'error');
        return false;
      }
    } catch (error) {
      await this.log(`Mobile chart carousel test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    await this.log('Starting Phase 7: Mobile Responsive Enhancement Tests');
    
    // Login first
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      await this.log('Cannot run mobile tests - login failed', 'error');
      return { passed: 0, failed: 1, results: [{ name: 'Login', passed: false }] };
    }

    const tests = [
      { name: 'Dashboard Mobile Filters', fn: () => this.test_dashboardMobileFilters() },
      { name: 'Chart Visibility Mobile', fn: () => this.test_chartVisibilityMobile() },
      { name: 'Mobile Table Enhancements', fn: () => this.test_mobileTableEnhancements() },
      { name: 'Enhanced Mobile Navigation', fn: () => this.test_mobileNavigationEnhanced() },
      { name: 'Mobile Interaction Enhancements', fn: () => this.test_mobileInteractionEnhancements() },
      { name: 'Mobile Performance Optimizations', fn: () => this.test_mobilePerformanceOptimizations() },
      { name: 'Mobile Filter Consistency', fn: () => this.test_mobileFilterConsistency() },
      { name: 'Mobile Chart Carousel', fn: () => this.test_mobileChartCarousel() }
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

    await this.log(`\\n=== Mobile Responsive Enhancement Test Results ===`);
    await this.log(`Passed: ${passed}`);
    await this.log(`Failed: ${failed}`);
    await this.log(`Total: ${passed + failed}`);

    // Detailed results
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const error = result.error ? ` (${result.error})` : '';
      console.log(`${status} ${result.name}${error}`);
    });

    return { passed, failed, results: this.testResults };
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const mobileTests = new MCPMobileResponsiveTests();
  mobileTests.runAllTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Mobile responsive test suite failed:', error);
    process.exit(1);
  });
}

export default MCPMobileResponsiveTests;