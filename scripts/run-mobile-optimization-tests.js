#!/usr/bin/env node

/**
 * Mobile Optimization Test Runner - Stage 6-4
 * Executes comprehensive mobile touch interface validation tests
 * for Principal CRM transformation
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const MOBILE_TEST_CONFIG = {
  testFile: 'tests/mobile-optimization-tests.spec.js',
  reportDir: 'test-results',
  devices: ['iPad Landscape', 'iPad Portrait', 'Mobile Safari'],
  timeout: 600000, // 10 minutes for comprehensive mobile tests
};

// Performance thresholds for reporting
const PERFORMANCE_THRESHOLDS = {
  touchTargetCompliance: 100, // % of touch targets that must meet WCAG AA
  formLoadTime: 3000,        // ms
  templateLoadTime: 1000,    // ms
  quickTemplateTime: 500,    // ms
  formSubmissionTime: 2000,  // ms
  navigationTime: 3000       // ms
};

/**
 * Console colors for better output readability
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Logger utility with colors and timestamps
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const colorMap = {
    info: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
    test: colors.magenta
  };
  
  const color = colorMap[level] || colors.reset;
  console.log(`${color}[${timestamp}] [${level.toUpperCase()}] ${message}${colors.reset}`);
  
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Check if development server is running
 */
async function checkDevServer() {
  return new Promise((resolve) => {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 5173,
      path: '/',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

/**
 * Start development server if not running
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    log('info', 'Starting development server...');
    
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: false
    });

    let serverReady = false;

    devServer.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && output.includes('5173')) {
        if (!serverReady) {
          serverReady = true;
          log('success', 'Development server is ready');
          resolve(devServer);
        }
      }
    });

    devServer.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('EADDRINUSE')) {
        log('info', 'Development server already running');
        resolve(null);
      }
    });

    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Development server failed to start within timeout'));
      }
    }, 30000);
  });
}

/**
 * Execute Playwright mobile tests
 */
function runMobileTests(projectName = null) {
  return new Promise((resolve, reject) => {
    log('test', `Running mobile optimization tests${projectName ? ` for ${projectName}` : ''}...`);

    const args = [
      'npx',
      'playwright',
      'test',
      MOBILE_TEST_CONFIG.testFile,
      '--reporter=html,json,line',
      `--timeout=${MOBILE_TEST_CONFIG.timeout}`
    ];

    if (projectName) {
      args.push(`--project=${projectName}`);
    }

    const testProcess = spawn('node', args, {
      stdio: 'pipe',
      env: { ...process.env, PWTEST_SKIP_TEST_OUTPUT: 'true' }
    });

    let testOutput = '';
    let errorOutput = '';

    testProcess.stdout.on('data', (data) => {
      const output = data.toString();
      testOutput += output;
      
      // Log important test progress
      if (output.includes('Running') || output.includes('✓') || output.includes('✗')) {
        process.stdout.write(output);
      }
    });

    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        log('success', 'Mobile optimization tests completed successfully');
        resolve({ success: true, output: testOutput });
      } else {
        log('error', `Mobile tests failed with code ${code}`);
        log('error', 'Error output:', errorOutput);
        resolve({ success: false, output: testOutput, error: errorOutput, code });
      }
    });

    testProcess.on('error', (error) => {
      log('error', 'Failed to start test process:', error.message);
      reject(error);
    });
  });
}

/**
 * Parse test results and generate mobile optimization report
 */
async function generateMobileOptimizationReport() {
  const reportPath = path.join(MOBILE_TEST_CONFIG.reportDir, 'test-results.json');
  
  if (!fs.existsSync(reportPath)) {
    log('warning', 'No test results found for reporting');
    return null;
  }

  try {
    const testResults = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        duration: 0
      },
      mobileOptimization: {
        touchTargetCompliance: {
          tested: 0,
          compliant: 0,
          percentage: 0,
          meetThreshold: false
        },
        performanceMetrics: {
          averageFormLoadTime: 0,
          averageTemplateLoadTime: 0,
          averageNavigationTime: 0,
          allWithinThresholds: false
        },
        deviceCompatibility: {
          iPadLandscape: { tested: false, passed: false },
          iPadPortrait: { tested: false, passed: false },
          mobileSafari: { tested: false, passed: false }
        },
        workflowEfficiency: {
          contactCreation: { tested: false, passed: false, avgTime: 0 },
          formSubmission: { tested: false, passed: false, avgTime: 0 },
          navigation: { tested: false, passed: false, avgTime: 0 }
        }
      },
      recommendations: []
    };

    // Parse test results
    if (testResults.suites) {
      for (const suite of testResults.suites) {
        for (const spec of suite.specs || []) {
          report.summary.totalTests++;
          
          const testPassed = spec.tests?.every(test => 
            test.results?.every(result => result.status === 'passed')
          );
          
          if (testPassed) {
            report.summary.passedTests++;
          } else {
            report.summary.failedTests++;
          }
        }
      }
    }

    // Calculate performance metrics (this would need actual test data parsing)
    report.mobileOptimization.touchTargetCompliance.meetThreshold = 
      report.mobileOptimization.touchTargetCompliance.percentage >= PERFORMANCE_THRESHOLDS.touchTargetCompliance;

    // Generate recommendations based on results
    if (report.summary.failedTests > 0) {
      report.recommendations.push('Review failed mobile optimization tests and address touch interface issues');
    }
    
    if (!report.mobileOptimization.touchTargetCompliance.meetThreshold) {
      report.recommendations.push('Increase touch target sizes to meet WCAG AA standards (≥48px)');
    }
    
    if (!report.mobileOptimization.performanceMetrics.allWithinThresholds) {
      report.recommendations.push('Optimize mobile performance - forms and templates should load faster');
    }

    // Save detailed report
    const detailedReportPath = path.join(MOBILE_TEST_CONFIG.reportDir, 'mobile-optimization-report.json');
    fs.writeFileSync(detailedReportPath, JSON.stringify(report, null, 2));
    
    log('success', `Mobile optimization report generated: ${detailedReportPath}`);
    return report;

  } catch (error) {
    log('error', 'Failed to generate mobile optimization report:', error.message);
    return null;
  }
}

/**
 * Display mobile optimization summary
 */
function displaySummary(report) {
  if (!report) return;

  console.log(`\n${colors.bright}=== MOBILE OPTIMIZATION TEST SUMMARY ===${colors.reset}\n`);

  // Test Results Summary
  console.log(`${colors.blue}Test Results:${colors.reset}`);
  console.log(`  Total Tests: ${report.summary.totalTests}`);
  console.log(`  Passed: ${colors.green}${report.summary.passedTests}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${report.summary.failedTests}${colors.reset}`);
  console.log(`  Skipped: ${colors.yellow}${report.summary.skippedTests}${colors.reset}\n`);

  // Mobile Optimization Metrics
  console.log(`${colors.blue}Mobile Optimization Metrics:${colors.reset}`);
  console.log(`  Touch Target Compliance: ${
    report.mobileOptimization.touchTargetCompliance.meetThreshold 
      ? colors.green + '✓ PASS' 
      : colors.red + '✗ FAIL'
  }${colors.reset}`);
  
  console.log(`  Performance Thresholds: ${
    report.mobileOptimization.performanceMetrics.allWithinThresholds 
      ? colors.green + '✓ PASS' 
      : colors.red + '✗ FAIL'
  }${colors.reset}`);

  // Device Compatibility
  console.log(`\n${colors.blue}Device Compatibility:${colors.reset}`);
  Object.entries(report.mobileOptimization.deviceCompatibility).forEach(([device, result]) => {
    const status = result.passed ? colors.green + '✓' : colors.red + '✗';
    console.log(`  ${device}: ${status}${colors.reset}`);
  });

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  // Overall Status
  const overallPass = report.summary.failedTests === 0;
  const statusColor = overallPass ? colors.green : colors.red;
  const statusText = overallPass ? 'PASSED' : 'FAILED';
  
  console.log(`\n${colors.bright}Overall Status: ${statusColor}${statusText}${colors.reset}`);
  console.log(`${colors.bright}Stage 6-4 Mobile Optimization: ${statusColor}${overallPass ? 'COMPLETE' : 'NEEDS ATTENTION'}${colors.reset}\n`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    log('info', 'Starting Mobile Optimization Testing - Stage 6-4');
    log('info', 'Validating touch interface and iPad optimization for field sales teams');

    // Ensure results directory exists
    if (!fs.existsSync(MOBILE_TEST_CONFIG.reportDir)) {
      fs.mkdirSync(MOBILE_TEST_CONFIG.reportDir, { recursive: true });
    }

    // Check development server
    const devServerRunning = await checkDevServer();
    let devServer = null;

    if (!devServerRunning) {
      devServer = await startDevServer();
      // Wait for server to be fully ready
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      log('info', 'Development server is already running');
    }

    // Run mobile optimization tests
    log('info', 'Executing mobile optimization test suite...');
    const testResults = await runMobileTests();

    if (!testResults.success) {
      log('error', 'Mobile optimization tests failed');
      if (devServer) {
        log('info', 'Stopping development server...');
        devServer.kill();
      }
      process.exit(1);
    }

    // Generate comprehensive report
    log('info', 'Generating mobile optimization report...');
    const report = await generateMobileOptimizationReport();
    
    // Display results summary
    displaySummary(report);

    // Cleanup
    if (devServer) {
      log('info', 'Stopping development server...');
      devServer.kill();
    }

    log('success', 'Mobile Optimization Testing completed successfully');
    log('info', 'Check test-results/ directory for detailed reports and screenshots');

  } catch (error) {
    log('error', 'Mobile optimization testing failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    log('error', 'Unhandled error:', error.message);
    process.exit(1);
  });
}

module.exports = { main, runMobileTests, generateMobileOptimizationReport };