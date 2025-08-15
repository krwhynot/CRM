#!/usr/bin/env node

/**
 * Mobile Optimization Validation Script - Stage 6-4
 * Mobile-CRM-Optimizer Agent Implementation
 * 
 * This script provides comprehensive validation of mobile optimization
 * requirements for the Principal CRM transformation, ensuring field
 * sales teams have excellent mobile experiences.
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Mobile optimization validation configuration
const VALIDATION_CONFIG = {
  testSuites: [
    'tests/mobile-optimization-comprehensive.spec.js',
    'tests/mobile-optimization-tests.spec.js'
  ],
  outputDir: join(rootDir, 'mobile-optimization-results'),
  reportFile: 'mobile-optimization-validation-report.json',
  devices: [
    'iPad Pro 12.9',
    'iPad Air',
    'iPad (10th generation)',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'Galaxy Tab S9'
  ],
  requirements: {
    touchTargetMinimum: 48,      // WCAG AA standard
    touchTargetRecommended: 56,   // Enhanced for field sales
    pageLoadMax: 3000,           // < 3 seconds
    formOpenMax: 1500,           // < 1.5 seconds  
    templateApplicationMax: 500,  // < 500ms
    formSubmissionMax: 2000,     // < 2 seconds
    touchResponseMax: 100        // < 100ms
  }
};

/**
 * Mobile Optimization Validator
 */
class MobileOptimizationValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overallStatus: 'UNKNOWN',
      touchInterfaceValidation: {},
      performanceValidation: {},
      principalCRMFeatures: {},
      deviceCompatibility: {},
      fieldSalesOptimization: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        criticalIssues: []
      }
    };
    
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!existsSync(VALIDATION_CONFIG.outputDir)) {
      mkdirSync(VALIDATION_CONFIG.outputDir, { recursive: true });
    }
  }

  /**
   * Run comprehensive mobile optimization validation
   */
  async runValidation() {
    console.log('🚀 Starting Mobile Optimization Validation - Stage 6-4');
    console.log('================================================\n');

    try {
      // Step 1: Touch Interface Validation
      await this.validateTouchInterface();
      
      // Step 2: Performance Validation
      await this.validatePerformance();
      
      // Step 3: Principal CRM Features
      await this.validatePrincipalCRMFeatures();
      
      // Step 4: Device Compatibility
      await this.validateDeviceCompatibility();
      
      // Step 5: Field Sales Optimization
      await this.validateFieldSalesOptimization();
      
      // Step 6: Generate comprehensive report
      await this.generateReport();
      
      this.logSummary();
      
    } catch (error) {
      console.error('❌ Mobile optimization validation failed:', error.message);
      this.results.overallStatus = 'FAILED';
      this.results.summary.criticalIssues.push({
        type: 'VALIDATION_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return this.results;
  }

  /**
   * Validate touch interface standards
   */
  async validateTouchInterface() {
    console.log('🖱️  Validating Touch Interface Standards...');
    
    const touchTests = [
      {
        name: 'Touch Target Size Validation',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "Touch Interface Standards"',
        critical: true
      },
      {
        name: 'Touch Target Spacing Validation', 
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "spacing prevents accidental"',
        critical: true
      },
      {
        name: 'Touch Response Time',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "response time meets field"',
        critical: false
      }
    ];

    this.results.touchInterfaceValidation = await this.runTestSuite(touchTests);
    console.log(`✅ Touch Interface: ${this.results.touchInterfaceValidation.status}\n`);
  }

  /**
   * Validate mobile performance requirements
   */
  async validatePerformance() {
    console.log('⚡ Validating Mobile Performance Requirements...');
    
    const performanceTests = [
      {
        name: 'Page Load Performance',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "Page load performance"',
        critical: true
      },
      {
        name: 'Form Template Speed',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "template application speed"',
        critical: true
      },
      {
        name: 'Form Submission Performance',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "submission performance"',
        critical: false
      }
    ];

    this.results.performanceValidation = await this.runTestSuite(performanceTests);
    console.log(`✅ Performance: ${this.results.performanceValidation.status}\n`);
  }

  /**
   * Validate Principal CRM specific features
   */
  async validatePrincipalCRMFeatures() {
    console.log('🎯 Validating Principal CRM Mobile Features...');
    
    const principalTests = [
      {
        name: 'Contact Advocacy Fields',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "advocacy fields responsive"',
        critical: true
      },
      {
        name: 'Auto-naming Preview',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "Auto-naming preview"',
        critical: false
      },
      {
        name: 'Business Intelligence Dropdowns',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "Purchase influence|Decision authority"',
        critical: true
      },
      {
        name: 'Quick Templates',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "Quick templates accessible"',
        critical: false
      }
    ];

    this.results.principalCRMFeatures = await this.runTestSuite(principalTests);
    console.log(`✅ Principal CRM Features: ${this.results.principalCRMFeatures.status}\n`);
  }

  /**
   * Validate device compatibility
   */
  async validateDeviceCompatibility() {
    console.log('📱 Validating Device Compatibility...');
    
    const deviceTests = [
      {
        name: 'iPad Landscape Optimization',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "iPad Landscape"',
        critical: true
      },
      {
        name: 'iPad Portrait Optimization',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "iPad Portrait"',
        critical: true
      },
      {
        name: 'iPhone Compatibility',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "iPhone"',
        critical: false
      },
      {
        name: 'Form Overflow Prevention',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "prevent overflow"',
        critical: true
      }
    ];

    this.results.deviceCompatibility = await this.runTestSuite(deviceTests);
    console.log(`✅ Device Compatibility: ${this.results.deviceCompatibility.status}\n`);
  }

  /**
   * Validate field sales specific optimizations
   */
  async validateFieldSalesOptimization() {
    console.log('👥 Validating Field Sales Optimizations...');
    
    const fieldSalesTests = [
      {
        name: 'One-handed Operation',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "One-handed operation"',
        critical: true
      },
      {
        name: 'Field Workflow Efficiency',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "workflows optimized for field"',
        critical: true
      },
      {
        name: 'Offline Capability',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "Offline Capability"',
        critical: false
      },
      {
        name: 'Network Recovery',
        command: 'npx playwright test tests/mobile-optimization-comprehensive.spec.js --grep "Network recovery"',
        critical: false
      }
    ];

    this.results.fieldSalesOptimization = await this.runTestSuite(fieldSalesTests);
    console.log(`✅ Field Sales Optimization: ${this.results.fieldSalesOptimization.status}\n`);
  }

  /**
   * Run a test suite and collect results
   */
  async runTestSuite(tests) {
    const suiteResult = {
      status: 'PASSED',
      tests: [],
      summary: {
        total: tests.length,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };

    for (const test of tests) {
      const testResult = await this.runSingleTest(test);
      suiteResult.tests.push(testResult);
      
      if (testResult.status === 'PASSED') {
        suiteResult.summary.passed++;
      } else if (testResult.status === 'FAILED') {
        suiteResult.summary.failed++;
        if (test.critical) {
          suiteResult.status = 'FAILED';
          this.results.summary.criticalIssues.push({
            type: 'CRITICAL_TEST_FAILURE',
            test: test.name,
            message: testResult.error || 'Test failed',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        suiteResult.summary.skipped++;
      }
    }

    this.results.summary.totalTests += suiteResult.summary.total;
    this.results.summary.passedTests += suiteResult.summary.passed;
    this.results.summary.failedTests += suiteResult.summary.failed;

    return suiteResult;
  }

  /**
   * Run a single test and return result
   */
  async runSingleTest(test) {
    const result = {
      name: test.name,
      command: test.command,
      status: 'UNKNOWN',
      duration: 0,
      output: '',
      error: null
    };

    const startTime = Date.now();
    
    try {
      console.log(`  Running: ${test.name}...`);
      
      // Run the test with timeout
      const output = execSync(test.command, {
        cwd: rootDir,
        encoding: 'utf8',
        timeout: 120000, // 2 minute timeout
        stdio: 'pipe'
      });
      
      result.output = output;
      result.status = 'PASSED';
      console.log(`  ✅ ${test.name}: PASSED`);
      
    } catch (error) {
      result.error = error.message;
      result.output = error.stdout || error.stderr || '';
      result.status = 'FAILED';
      console.log(`  ❌ ${test.name}: FAILED`);
      
      if (test.critical) {
        console.log(`     CRITICAL FAILURE: ${error.message.substring(0, 100)}...`);
      }
    }
    
    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Generate comprehensive validation report
   */
  async generateReport() {
    console.log('📊 Generating Mobile Optimization Report...');
    
    // Calculate overall status
    const criticalFailures = this.results.summary.criticalIssues.filter(
      issue => issue.type === 'CRITICAL_TEST_FAILURE'
    ).length;
    
    if (criticalFailures > 0) {
      this.results.overallStatus = 'FAILED';
    } else if (this.results.summary.failedTests > 0) {
      this.results.overallStatus = 'WARNING';
    } else {
      this.results.overallStatus = 'PASSED';
    }

    // Add performance metrics
    this.results.performanceMetrics = {
      touchTargetCompliance: this.calculateTouchTargetCompliance(),
      averageLoadTime: this.calculateAverageLoadTime(),
      mobileOptimizationScore: this.calculateOptimizationScore(),
      fieldSalesReadiness: this.calculateFieldSalesReadiness()
    };

    // Add recommendations
    this.results.recommendations = this.generateRecommendations();

    // Write detailed report
    const reportPath = join(VALIDATION_CONFIG.outputDir, VALIDATION_CONFIG.reportFile);
    writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(`📁 Report saved to: ${reportPath}`);
  }

  /**
   * Calculate touch target compliance percentage
   */
  calculateTouchTargetCompliance() {
    const touchTests = this.results.touchInterfaceValidation.tests || [];
    const passedTouchTests = touchTests.filter(test => test.status === 'PASSED').length;
    return touchTests.length > 0 ? (passedTouchTests / touchTests.length) * 100 : 0;
  }

  /**
   * Calculate average load time (estimated)
   */
  calculateAverageLoadTime() {
    const performanceTests = this.results.performanceValidation.tests || [];
    const avgDuration = performanceTests.reduce((sum, test) => sum + test.duration, 0) / performanceTests.length;
    return avgDuration || 0;
  }

  /**
   * Calculate overall mobile optimization score
   */
  calculateOptimizationScore() {
    const categories = [
      this.results.touchInterfaceValidation,
      this.results.performanceValidation,
      this.results.principalCRMFeatures,
      this.results.deviceCompatibility,
      this.results.fieldSalesOptimization
    ];

    let totalScore = 0;
    let totalCategories = 0;

    categories.forEach(category => {
      if (category.summary) {
        const categoryScore = (category.summary.passed / category.summary.total) * 100;
        totalScore += categoryScore;
        totalCategories++;
      }
    });

    return totalCategories > 0 ? Math.round(totalScore / totalCategories) : 0;
  }

  /**
   * Calculate field sales readiness score
   */
  calculateFieldSalesReadiness() {
    const fieldSalesTests = this.results.fieldSalesOptimization.tests || [];
    const criticalFieldTests = fieldSalesTests.filter(test => 
      test.name.includes('One-handed') || test.name.includes('Workflow')
    );
    
    const passedCritical = criticalFieldTests.filter(test => test.status === 'PASSED').length;
    return criticalFieldTests.length > 0 ? (passedCritical / criticalFieldTests.length) * 100 : 0;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Touch interface recommendations
    if (this.calculateTouchTargetCompliance() < 95) {
      recommendations.push({
        category: 'Touch Interface',
        priority: 'HIGH',
        issue: 'Touch target compliance below 95%',
        recommendation: 'Increase button and interactive element sizes to meet WCAG AA standards (≥48px)',
        impact: 'Critical for field sales accessibility'
      });
    }

    // Performance recommendations
    if (this.calculateAverageLoadTime() > VALIDATION_CONFIG.requirements.pageLoadMax) {
      recommendations.push({
        category: 'Performance',
        priority: 'HIGH',
        issue: 'Page load times exceed 3 seconds',
        recommendation: 'Optimize assets, implement code splitting, and use lazy loading',
        impact: 'Affects field productivity on slower networks'
      });
    }

    // Field sales readiness
    if (this.calculateFieldSalesReadiness() < 90) {
      recommendations.push({
        category: 'Field Sales',
        priority: 'MEDIUM',
        issue: 'Field sales optimizations incomplete',
        recommendation: 'Implement one-handed operation features and offline capabilities',
        impact: 'Reduces efficiency for mobile sales teams'
      });
    }

    // Principal CRM features
    const principalCRMPassed = this.results.principalCRMFeatures.summary?.passed || 0;
    const principalCRMTotal = this.results.principalCRMFeatures.summary?.total || 1;
    if ((principalCRMPassed / principalCRMTotal) < 0.8) {
      recommendations.push({
        category: 'Principal CRM',
        priority: 'MEDIUM',
        issue: 'Principal CRM mobile features need improvement',
        recommendation: 'Optimize advocacy fields and auto-naming for mobile use',
        impact: 'Reduces effectiveness of Principal CRM transformation'
      });
    }

    return recommendations;
  }

  /**
   * Log validation summary
   */
  logSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 MOBILE OPTIMIZATION VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`📊 Overall Status: ${this.getStatusIcon(this.results.overallStatus)} ${this.results.overallStatus}`);
    console.log(`📈 Optimization Score: ${this.results.performanceMetrics.mobileOptimizationScore}%`);
    console.log(`🎯 Field Sales Readiness: ${this.results.performanceMetrics.fieldSalesReadiness}%`);
    console.log(`👆 Touch Target Compliance: ${this.results.performanceMetrics.touchTargetCompliance.toFixed(1)}%`);
    
    console.log(`\n📋 Test Results:`);
    console.log(`   Total Tests: ${this.results.summary.totalTests}`);
    console.log(`   Passed: ${this.results.summary.passedTests}`);
    console.log(`   Failed: ${this.results.summary.failedTests}`);
    console.log(`   Critical Issues: ${this.results.summary.criticalIssues.length}`);

    if (this.results.recommendations.length > 0) {
      console.log(`\n💡 Key Recommendations:`);
      this.results.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority}] ${rec.recommendation}`);
      });
    }

    console.log(`\n📁 Detailed report: ${VALIDATION_CONFIG.outputDir}/${VALIDATION_CONFIG.reportFile}`);
    console.log('='.repeat(60));
  }

  getStatusIcon(status) {
    switch (status) {
      case 'PASSED': return '✅';
      case 'WARNING': return '⚠️';
      case 'FAILED': return '❌';
      default: return '❓';
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const validator = new MobileOptimizationValidator();
  
  try {
    const results = await validator.runValidation();
    
    // Exit with appropriate code
    if (results.overallStatus === 'FAILED') {
      process.exit(1);
    } else if (results.overallStatus === 'WARNING') {
      process.exit(2);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Fatal error during mobile optimization validation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MobileOptimizationValidator, VALIDATION_CONFIG };