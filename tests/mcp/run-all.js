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
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTestSuite(TestClass, suiteName) {
    await this.log(`\n=== Starting ${suiteName} ===`);
    
    try {
      const testInstance = new TestClass();
      const results = await testInstance.runAllTests();
      
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

  async runAllTests() {
    await this.log('🚀 Starting MCP Comprehensive Test Suite');
    await this.log('Testing Kitchen Pantry CRM with MCP Playwright Tools');
    
    const startTime = Date.now();

    // Define test suites in order
    const testSuites = [
      { class: MCPAuthTests, name: 'Authentication Tests' },
      { class: MCPCrudTests, name: 'CRUD Operations Tests' },
      { class: MCPDashboardTests, name: 'Dashboard Functionality Tests' },
      { class: MCPMobileTests, name: 'Mobile Responsiveness Tests' }
    ];

    // Run each test suite
    for (const suite of testSuites) {
      await this.runTestSuite(suite.class, suite.name);
      
      // Add delay between test suites to prevent resource conflicts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);

    // Generate final report
    await this.generateReport(totalTime);

    return this.totalResults;
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

// Command line argument parsing
const args = process.argv.slice(2);
const singleSuite = args.find(arg => ['auth', 'crud', 'dashboard', 'mobile'].includes(arg));

async function main() {
  const runner = new MCPTestRunner();
  
  if (singleSuite) {
    // Run single test suite
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