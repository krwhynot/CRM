#!/usr/bin/env node

/**
 * MCP Test Suite Runner
 * Runs all MCP-based tests in sequence
 * Replaces complex Playwright configuration with simple Node.js execution
 */

import MCPAuthTests from './auth.mcp.js';
import MCPCrudTests from './crud.mcp.js';
import MCPMobileTests from './mobile.mcp.js';
import MCPDashboardTests from './dashboard.mcp.js';

class MCPTestRunner {
  constructor() {
    this.totalResults = {
      passed: 0,
      failed: 0,
      results: []
    };

    // Configuration from environment variables
    this.config = {
      mode: process.env.MCP_TEST_MODE || 'default',
      verbose: process.env.MCP_TEST_VERBOSE === 'true',
      format: process.env.MCP_TEST_FORMAT || 'standard',
      timeout: parseInt(process.env.MCP_TEST_TIMEOUT) || 300000 // 5 minutes default
    };
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

    // Respect verbose and CI mode settings
    if (this.config.mode === 'ci' || this.config.verbose || type === 'error' || type === 'success') {
      if (this.config.format === 'json') {
        console.log(JSON.stringify({
          timestamp,
          level: type,
          message,
          mode: this.config.mode
        }));
      } else if (this.config.format === 'ci') {
        const ciType = type === 'error' ? '::error::' : type === 'success' ? '::notice::' : '::debug::';
        console.log(`${ciType}${message}`);
      } else {
        console.log(`${prefix} [${timestamp}] ${message}`);
      }
    }
  }

  async runTestSuite(TestClass, suiteName) {
    await this.log(`\n=== Starting ${suiteName} ===`);

    try {
      const testInstance = new TestClass();

      // Apply timeout to test execution
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Test suite timeout after ${this.config.timeout / 1000}s`)), this.config.timeout);
      });

      const testPromise = testInstance.runAllTests();
      const results = await Promise.race([testPromise, timeoutPromise]);
      
      this.totalResults.passed += results.passed;
      this.totalResults.failed += results.failed;
      this.totalResults.results.push({
        suite: suiteName,
        ...results
      });

      if (results.failed === 0) {
        await this.log(`${suiteName} completed successfully`, 'success');
      } else {
        await this.log(`${suiteName} completed with failures`, 'error');
      }

      return results;
    } catch (error) {
      await this.log(`${suiteName} failed to run: ${error.message}`, 'error');
      this.totalResults.failed += 1;
      this.totalResults.results.push({
        suite: suiteName,
        passed: 0,
        failed: 1,
        error: error.message
      });
      return { passed: 0, failed: 1, error: error.message };
    }
  }

  async runAllTests(selectedSuites = null) {
    await this.log('🚀 Starting MCP Comprehensive Test Suite');
    await this.log('Testing Kitchen Pantry CRM with MCP Playwright Tools');

    const startTime = Date.now();

    // Define all available test suites
    const allTestSuites = [
      { class: MCPAuthTests, name: 'Authentication Tests', key: 'auth' },
      { class: MCPCrudTests, name: 'CRUD Operations Tests', key: 'crud' },
      { class: MCPDashboardTests, name: 'Dashboard Functionality Tests', key: 'dashboard' },
      { class: MCPMobileTests, name: 'Mobile Responsiveness Tests', key: 'mobile' }
    ];

    // Filter test suites based on selection
    const testSuites = selectedSuites
      ? allTestSuites.filter(suite => selectedSuites.includes(suite.key))
      : allTestSuites;

    if (selectedSuites) {
      await this.log(`Running selected test suites: ${selectedSuites.join(', ')}`);
    } else {
      await this.log('Running all test suites');
    }

    // Check for parallel execution
    const parallelMode = process.env.MCP_TEST_PARALLEL === 'true';
    const failFastMode = process.env.MCP_TEST_FAIL_FAST === 'true';
    const fastMode = process.env.MCP_TEST_MODE === 'fast';

    if (parallelMode) {
      await this.log('⚡ Parallel execution mode enabled');
      await this.runTestSuitesParallel(testSuites, failFastMode);
    } else {
      await this.runTestSuitesSequential(testSuites, failFastMode, fastMode);
    }

    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);

    // Generate final report
    await this.generateReport(totalTime);

    return this.totalResults;
  }

  async runTestSuitesSequential(testSuites, failFastMode, fastMode) {
    for (const suite of testSuites) {
      await this.runTestSuite(suite.class, suite.name);

      // Stop on first failure if fail-fast mode is enabled
      if (failFastMode && this.totalResults.failed > 0) {
        await this.log('🛑 Stopping execution due to test failure (fail-fast mode)', 'error');
        break;
      }

      // Add delay between test suites to prevent resource conflicts (unless fast mode)
      if (!fastMode && testSuites.indexOf(suite) < testSuites.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async runTestSuitesParallel(testSuites, failFastMode) {
    await this.log('⚠️  Running test suites in parallel - use with caution', 'warn');

    try {
      const suitePromises = testSuites.map(suite =>
        this.runTestSuite(suite.class, suite.name)
      );

      if (failFastMode) {
        // Use Promise.race to stop on first failure
        const results = await Promise.allSettled(suitePromises);
        const hasFailures = results.some(result =>
          result.status === 'fulfilled' && result.value.failed > 0
        );

        if (hasFailures) {
          await this.log('🛑 Test failures detected in parallel execution', 'error');
        }
      } else {
        // Wait for all suites to complete
        await Promise.all(suitePromises);
      }
    } catch (error) {
      await this.log(`Parallel execution failed: ${error.message}`, 'error');
    }
  }

  async generateReport(totalTime) {
    await this.log('\n' + '='.repeat(60));
    await this.log('📊 MCP TEST SUITE FINAL REPORT');
    await this.log('='.repeat(60));
    
    await this.log(`Total Execution Time: ${totalTime}s`);
    await this.log(`Total Tests Passed: ${this.totalResults.passed}`);
    await this.log(`Total Tests Failed: ${this.totalResults.failed}`);
    await this.log(`Total Tests Run: ${this.totalResults.passed + this.totalResults.failed}`);
    
    if (this.totalResults.failed === 0) {
      await this.log('🎉 ALL TESTS PASSED!', 'success');
    } else {
      await this.log(`⚠️  ${this.totalResults.failed} TESTS FAILED`, 'error');
    }

    await this.log('\nDetailed Results by Suite:');
    for (const suite of this.totalResults.results) {
      const status = suite.failed === 0 ? '✅' : '❌';
      await this.log(`${status} ${suite.suite}: ${suite.passed} passed, ${suite.failed} failed`);
      
      if (suite.error) {
        await this.log(`   Error: ${suite.error}`, 'error');
      }
    }

    await this.log('\n' + '='.repeat(60));
  }
}

// Enhanced command line argument parsing with selective execution support
const args = process.argv.slice(2);
const singleSuite = args.find(arg => ['auth', 'crud', 'dashboard', 'mobile'].includes(arg));
const verboseFlag = args.includes('--verbose') || args.includes('-v');
const helpFlag = args.includes('--help') || args.includes('-h');
const fastFlag = args.includes('--fast');
const parallelFlag = args.includes('--parallel');
const failFastFlag = args.includes('--fail-fast');

// Support for multiple suite selection
const multipleSuites = args.filter(arg => ['auth', 'crud', 'dashboard', 'mobile'].includes(arg));
const selectedSuites = multipleSuites.length > 1 ? multipleSuites : (singleSuite ? [singleSuite] : null);

// Support for additional command line options
if (verboseFlag) {
  process.env.MCP_TEST_VERBOSE = 'true';
}

if (fastFlag) {
  process.env.MCP_TEST_MODE = 'fast';
}

if (parallelFlag) {
  process.env.MCP_TEST_PARALLEL = 'true';
}

if (failFastFlag) {
  process.env.MCP_TEST_FAIL_FAST = 'true';
}

if (helpFlag) {
  console.log(`
MCP Test Suite Runner - Enhanced Selective Execution

USAGE:
  node run-all.js [SUITE...] [OPTIONS]

SUITES:
  auth          Authentication flow tests
  crud          CRUD operations tests
  dashboard     Dashboard functionality tests
  mobile        Mobile responsiveness tests
  (no suite)    Run all test suites

SELECTIVE EXECUTION:
  node run-all.js auth crud           # Run auth and crud tests only
  node run-all.js mobile dashboard    # Run mobile and dashboard tests only

OPTIONS:
  --verbose, -v     Enable verbose logging
  --fast            Skip delay between test suites (fast execution)
  --parallel        Run test suites in parallel (experimental)
  --fail-fast       Stop execution on first test failure
  --help, -h        Show this help message

EXAMPLES:
  node run-all.js                     # Run all tests
  node run-all.js auth                # Run authentication tests only
  node run-all.js auth crud --fast    # Run auth and crud tests quickly
  node run-all.js --verbose           # Run all tests with verbose output
  node run-all.js mobile --fail-fast  # Run mobile tests, stop on failure

ENVIRONMENT VARIABLES:
  MCP_TEST_MODE         Test execution mode (default, ci, watch, fast)
  MCP_TEST_VERBOSE      Enable verbose logging (true/false)
  MCP_TEST_FORMAT       Output format (standard, json, ci)
  MCP_TEST_TIMEOUT      Test timeout in milliseconds (default: 300000)
  MCP_TEST_PARALLEL     Enable parallel execution (true/false)
  MCP_TEST_FAIL_FAST    Stop on first failure (true/false)

CONFIGURATION:
  Fast mode reduces inter-suite delays for quicker feedback
  Parallel mode runs suites concurrently (use with caution)
  Fail-fast mode provides immediate feedback on test failures
`);
  process.exit(0);
}

async function main() {
  const runner = new MCPTestRunner();

  if (selectedSuites) {
    // Run selected test suites (can be multiple)
    const results = await runner.runAllTests(selectedSuites);
    process.exit(results.failed > 0 ? 1 : 0);
  } else if (singleSuite) {
    // Maintain backward compatibility for single suite execution
    let TestClass;
    switch (singleSuite) {
      case 'auth':
        TestClass = MCPAuthTests;
        break;
      case 'crud':
        TestClass = MCPCrudTests;
        break;
      case 'dashboard':
        TestClass = MCPDashboardTests;
        break;
      case 'mobile':
        TestClass = MCPMobileTests;
        break;
      default:
        console.error('Unknown test suite:', singleSuite);
        process.exit(1);
    }

    const results = await runner.runTestSuite(TestClass, `${singleSuite} tests`);
    process.exit(results.failed > 0 ? 1 : 0);
  } else {
    // Run all test suites
    const results = await runner.runAllTests();
    process.exit(results.failed > 0 ? 1 : 0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default MCPTestRunner;