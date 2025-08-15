#!/usr/bin/env node

/**
 * Test Coverage Baseline Establishment Script
 * 
 * This script establishes comprehensive test coverage baselines for the CRM system.
 * It analyzes existing tests, identifies coverage gaps, and sets requirements for transformation stages.
 * 
 * Usage: node scripts/establish-test-baseline.js [--generate] [--run] [--coverage]
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Test Coverage Configuration
const TEST_COVERAGE_CONFIG = {
  criticalBusinessWorkflows: [
    {
      name: 'Authentication Flow',
      components: ['AuthContext', 'Login', 'ProtectedRoute'],
      priority: 'critical',
      coverage: {
        unit: 95,
        integration: 90,
        e2e: 100
      },
      scenarios: [
        'successful login',
        'failed login with invalid credentials',
        'logout functionality',
        'session persistence',
        'route protection'
      ]
    },
    {
      name: 'Organization CRUD',
      components: ['OrganizationForm', 'OrganizationsList', 'organization API'],
      priority: 'critical',
      coverage: {
        unit: 90,
        integration: 85,
        e2e: 100
      },
      scenarios: [
        'create organization',
        'read organization details',
        'update organization',
        'soft delete organization',
        'organization validation'
      ]
    },
    {
      name: 'Contact Management',
      components: ['ContactForm', 'ContactsList', 'contact API'],
      priority: 'critical',
      coverage: {
        unit: 90,
        integration: 85,
        e2e: 100
      },
      scenarios: [
        'create contact with organization',
        'update contact information',
        'link contact to opportunities',
        'contact search and filtering',
        'contact deletion with relationship handling'
      ]
    },
    {
      name: 'Opportunity Tracking',
      components: ['OpportunityForm', 'OpportunitysList', 'opportunity API'],
      priority: 'critical',
      coverage: {
        unit: 90,
        integration: 85,
        e2e: 95
      },
      scenarios: [
        'create opportunity',
        'update opportunity stage',
        'link products to opportunity',
        'set opportunity value and close date',
        'opportunity pipeline view'
      ]
    },
    {
      name: 'Interaction Logging',
      components: ['InteractionForm', 'InteractionsList', 'interaction API'],
      priority: 'high',
      coverage: {
        unit: 85,
        integration: 80,
        e2e: 90
      },
      scenarios: [
        'log interaction with contact',
        'link interaction to opportunity',
        'set follow-up reminders',
        'interaction history view',
        'interaction search and filtering'
      ]
    },
    {
      name: 'Search and Filtering',
      components: ['SearchComponent', 'FilterComponent', 'search API'],
      priority: 'high',
      coverage: {
        unit: 80,
        integration: 75,
        e2e: 85
      },
      scenarios: [
        'full-text search across entities',
        'advanced filtering combinations',
        'search performance with large datasets',
        'search result sorting',
        'saved search functionality'
      ]
    },
    {
      name: 'Dashboard and Metrics',
      components: ['Dashboard', 'MetricsCards', 'ActivityFeed'],
      priority: 'medium',
      coverage: {
        unit: 75,
        integration: 70,
        e2e: 80
      },
      scenarios: [
        'dashboard load performance',
        'metrics calculation accuracy',
        'activity feed real-time updates',
        'dashboard responsive design',
        'metrics export functionality'
      ]
    }
  ],
  testTypes: {
    unit: {
      framework: 'Jest',
      coverage: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      focus: ['utility functions', 'hooks', 'form validation', 'data transformations']
    },
    integration: {
      framework: 'Jest + React Testing Library',
      coverage: {
        components: 75,
        apiIntegration: 80,
        userFlows: 70
      },
      focus: ['component interactions', 'API integration', 'form submissions', 'state management']
    },
    e2e: {
      framework: 'Playwright',
      coverage: {
        criticalPaths: 95,
        userJourneys: 85,
        errorScenarios: 70
      },
      focus: ['complete user workflows', 'cross-browser compatibility', 'responsive design', 'error handling']
    }
  },
  performanceThresholds: {
    testExecution: {
      unit: 30000, // 30 seconds max
      integration: 60000, // 60 seconds max
      e2e: 300000 // 5 minutes max
    },
    testStability: {
      flakyTestThreshold: 5, // Max 5% flaky tests
      retryCount: 3,
      timeoutMultiplier: 1.5
    }
  }
};

class TestBaselineEstablisher {
  constructor(options = {}) {
    this.generateTests = options.generate || false;
    this.runTests = options.run || false;
    this.measureCoverage = options.coverage || false;
    this.results = {};
    this.startTime = Date.now();
  }

  async run() {
    console.log('🧪 Test Coverage Baseline Establishment Started');
    console.log(`🔧 Mode: ${this.generateTests ? 'Generate' : 'Analyze'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      await this.analyzeExistingTests();
      await this.identifyCoverageGaps();
      await this.establishTestRequirements();
      
      if (this.runTests) {
        await this.executeExistingTests();
      }
      
      if (this.generateTests) {
        await this.generateMissingTests();
      }
      
      if (this.measureCoverage) {
        await this.measureCurrentCoverage();
      }

      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test baseline establishment failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeExistingTests() {
    console.log('\n📊 Analyzing Existing Tests');
    const result = { name: 'Existing Test Analysis', analysis: {}, passed: true };

    try {
      // Analyze test directory structure
      const testDirs = ['tests', 'src/__tests__', 'src/**/*.test.{ts,tsx,js,jsx}'];
      const testFiles = [];
      
      for (const pattern of testDirs) {
        try {
          const files = this.findFiles(pattern);
          testFiles.push(...files);
        } catch (error) {
          // Directory might not exist
        }
      }

      result.analysis.testFiles = {
        total: testFiles.length,
        byType: this.categorizeTestFiles(testFiles),
        structure: testFiles
      };

      // Analyze existing test frameworks
      const packageJson = this.readPackageJson();
      const testFrameworks = this.identifyTestFrameworks(packageJson);

      result.analysis.frameworks = testFrameworks;

      // Analyze test scripts in package.json
      const testScripts = Object.keys(packageJson.scripts || {})
        .filter(script => script.includes('test'))
        .reduce((acc, script) => {
          acc[script] = packageJson.scripts[script];
          return acc;
        }, {});

      result.analysis.testScripts = testScripts;

      // Check for existing E2E tests
      const e2eFiles = testFiles.filter(file => 
        file.includes('e2e') || 
        file.includes('spec.js') || 
        file.includes('playwright')
      );

      result.analysis.e2eTests = {
        count: e2eFiles.length,
        files: e2eFiles,
        playwrightConfig: fs.existsSync(path.join(rootDir, 'playwright.config.js'))
      };

      console.log(`   📁 Found ${testFiles.length} test files`);
      console.log(`   🧪 E2E tests: ${e2eFiles.length}`);
      console.log(`   🔧 Frameworks: ${Object.keys(testFrameworks).join(', ')}`);

    } catch (error) {
      result.analysis.error = { message: error.message };
      result.passed = false;
    }

    this.results.existingTests = result;
  }

  async identifyCoverageGaps() {
    console.log('\n🔍 Identifying Coverage Gaps');
    const result = { name: 'Coverage Gap Analysis', gaps: {}, passed: true };

    try {
      // Analyze source code structure
      const sourceFiles = this.findFiles('src/**/*.{ts,tsx}');
      const componentFiles = sourceFiles.filter(file => file.includes('components/'));
      const hookFiles = sourceFiles.filter(file => file.includes('hooks/'));
      const utilityFiles = sourceFiles.filter(file => file.includes('lib/') || file.includes('utils/'));

      result.gaps.sourceCodeStructure = {
        totalFiles: sourceFiles.length,
        components: componentFiles.length,
        hooks: hookFiles.length,
        utilities: utilityFiles.length
      };

      // Map existing tests to components
      const existingTests = this.results.existingTests?.analysis?.testFiles?.structure || [];
      const testedComponents = this.mapTestsToComponents(existingTests, componentFiles);

      result.gaps.componentCoverage = {
        totalComponents: componentFiles.length,
        testedComponents: testedComponents.tested.length,
        untestedComponents: testedComponents.untested,
        coveragePercentage: Math.round((testedComponents.tested.length / componentFiles.length) * 100)
      };

      // Identify missing test types for each critical workflow
      const missingTests = {};
      for (const workflow of TEST_COVERAGE_CONFIG.criticalBusinessWorkflows) {
        const workflowTests = this.analyzeWorkflowCoverage(workflow, existingTests);
        if (workflowTests.missing.length > 0) {
          missingTests[workflow.name] = workflowTests;
        }
      }

      result.gaps.workflowCoverage = missingTests;

      // Performance testing gaps
      const performanceTests = existingTests.filter(file => 
        file.includes('performance') || 
        file.includes('benchmark') ||
        file.includes('load')
      );

      result.gaps.performanceTesting = {
        hasPerformanceTests: performanceTests.length > 0,
        count: performanceTests.length,
        missing: performanceTests.length === 0
      };

      console.log(`   📊 Component coverage: ${result.gaps.componentCoverage.coveragePercentage}%`);
      console.log(`   🔧 Missing workflow tests: ${Object.keys(missingTests).length}`);

    } catch (error) {
      result.gaps.error = { message: error.message };
      result.passed = false;
    }

    this.results.coverageGaps = result;
  }

  async establishTestRequirements() {
    console.log('\n📋 Establishing Test Requirements');
    const result = { name: 'Test Requirements', requirements: {}, passed: true };

    try {
      // Generate requirements based on coverage gaps
      const gaps = this.results.coverageGaps?.gaps || {};
      
      result.requirements.immediate = {
        description: 'Tests required before any transformation stage',
        items: [
          'Authentication flow E2E tests',
          'Core CRUD operation tests',
          'Database constraint validation tests',
          'Form validation unit tests'
        ]
      };

      result.requirements.transformation = {
        description: 'Tests required during transformation stages',
        stages: {
          'Principal Entity Integration': [
            'Principal entity CRUD tests',
            'Principal relationship validation tests',
            'Principal UI component tests',
            'Principal API integration tests'
          ],
          'Distributor Relationship Mapping': [
            'Many-to-many relationship tests',
            'Distributor assignment workflow tests',
            'Relationship constraint tests',
            'UI relationship management tests'
          ],
          'Business Logic Integration': [
            'Complex business rule tests',
            'Validation logic tests',
            'Error handling tests',
            'Edge case scenario tests'
          ],
          'UI/UX Transformation': [
            'Responsive design tests',
            'Form interaction tests',
            'Navigation flow tests',
            'Accessibility tests'
          ]
        }
      };

      result.requirements.ongoing = {
        description: 'Continuous testing requirements',
        items: [
          'Regression test suite',
          'Performance monitoring tests',
          'Security validation tests',
          'Data integrity tests'
        ]
      };

      // Generate test templates
      result.requirements.templates = this.generateTestTemplates();

      // Define coverage thresholds
      result.requirements.thresholds = TEST_COVERAGE_CONFIG.testTypes;

      console.log(`   📝 Immediate requirements: ${result.requirements.immediate.items.length}`);
      console.log(`   🔄 Transformation stages: ${Object.keys(result.requirements.transformation.stages).length}`);

    } catch (error) {
      result.requirements.error = { message: error.message };
      result.passed = false;
    }

    this.results.testRequirements = result;
  }

  async executeExistingTests() {
    console.log('\n🏃 Executing Existing Tests');
    const result = { name: 'Test Execution', execution: {}, passed: true };

    try {
      // Run E2E tests if they exist
      const e2eFiles = this.results.existingTests?.analysis?.e2eTests?.files || [];
      
      if (e2eFiles.length > 0) {
        console.log('   🎭 Running E2E tests...');
        const e2eStart = Date.now();
        
        try {
          const e2eOutput = this.runCommand('cd tests && node run-interactions-e2e-tests.js', { throwOnError: false });
          const e2eTime = Date.now() - e2eStart;
          
          result.execution.e2e = {
            passed: e2eOutput.exitCode === 0,
            duration: e2eTime,
            output: e2eOutput.stdout,
            errors: e2eOutput.stderr
          };
        } catch (error) {
          result.execution.e2e = {
            passed: false,
            error: error.message
          };
        }
      }

      // Check for unit tests
      const packageJson = this.readPackageJson();
      if (packageJson.scripts?.test) {
        console.log('   🧪 Running unit tests...');
        const unitStart = Date.now();
        
        try {
          const unitOutput = this.runCommand('npm test', { throwOnError: false });
          const unitTime = Date.now() - unitStart;
          
          result.execution.unit = {
            passed: unitOutput.exitCode === 0,
            duration: unitTime,
            output: unitOutput.stdout,
            errors: unitOutput.stderr
          };
        } catch (error) {
          result.execution.unit = {
            passed: false,
            error: error.message
          };
        }
      }

      console.log(`   ✅ E2E tests: ${result.execution.e2e?.passed ? 'PASSED' : 'NOT RUN'}`);
      console.log(`   ✅ Unit tests: ${result.execution.unit?.passed ? 'PASSED' : 'NOT RUN'}`);

    } catch (error) {
      result.execution.error = { message: error.message };
      result.passed = false;
    }

    this.results.testExecution = result;
  }

  async generateMissingTests() {
    console.log('\n🏗️  Generating Missing Test Templates');
    const result = { name: 'Test Generation', generated: {}, passed: true };

    try {
      const gaps = this.results.coverageGaps?.gaps || {};
      const requirements = this.results.testRequirements?.requirements || {};
      
      // Generate component test templates
      if (gaps.componentCoverage?.untestedComponents?.length > 0) {
        const componentTests = this.generateComponentTestTemplates(gaps.componentCoverage.untestedComponents);
        result.generated.componentTests = componentTests;
      }

      // Generate workflow test templates
      if (gaps.workflowCoverage) {
        const workflowTests = this.generateWorkflowTestTemplates(gaps.workflowCoverage);
        result.generated.workflowTests = workflowTests;
      }

      // Generate performance test templates
      if (gaps.performanceTesting?.missing) {
        const performanceTests = this.generatePerformanceTestTemplates();
        result.generated.performanceTests = performanceTests;
      }

      console.log(`   📝 Generated component tests: ${result.generated.componentTests?.length || 0}`);
      console.log(`   🔄 Generated workflow tests: ${Object.keys(result.generated.workflowTests || {}).length}`);

    } catch (error) {
      result.generated.error = { message: error.message };
      result.passed = false;
    }

    this.results.testGeneration = result;
  }

  async measureCurrentCoverage() {
    console.log('\n📊 Measuring Current Coverage');
    const result = { name: 'Coverage Measurement', coverage: {}, passed: true };

    try {
      // This would integrate with actual coverage tools
      // For now, we'll provide estimates based on analysis
      
      const gaps = this.results.coverageGaps?.gaps || {};
      
      result.coverage.estimated = {
        components: gaps.componentCoverage?.coveragePercentage || 0,
        unit: 30, // Estimated based on existing test structure
        integration: 20, // Estimated based on existing test structure
        e2e: gaps.e2eTests?.count > 0 ? 60 : 0 // Based on existing E2E tests
      };

      result.coverage.targets = {
        components: 90,
        unit: 80,
        integration: 75,
        e2e: 95
      };

      result.coverage.gaps = {
        components: Math.max(0, result.coverage.targets.components - result.coverage.estimated.components),
        unit: Math.max(0, result.coverage.targets.unit - result.coverage.estimated.unit),
        integration: Math.max(0, result.coverage.targets.integration - result.coverage.estimated.integration),
        e2e: Math.max(0, result.coverage.targets.e2e - result.coverage.estimated.e2e)
      };

      console.log(`   📊 Estimated coverage: ${JSON.stringify(result.coverage.estimated, null, 2)}`);

    } catch (error) {
      result.coverage.error = { message: error.message };
      result.passed = false;
    }

    this.results.coverageMeasurement = result;
  }

  // Helper methods
  findFiles(pattern) {
    try {
      const output = execSync(`find ${rootDir} -path "*/node_modules" -prune -o -name "${pattern}" -print`, { encoding: 'utf8' });
      return output.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      return [];
    }
  }

  categorizeTestFiles(files) {
    return {
      unit: files.filter(f => f.includes('.test.') || f.includes('__tests__')),
      integration: files.filter(f => f.includes('.integration.') || f.includes('.spec.')),
      e2e: files.filter(f => f.includes('e2e') || f.includes('playwright'))
    };
  }

  readPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    } catch (error) {
      return {};
    }
  }

  identifyTestFrameworks(packageJson) {
    const frameworks = {};
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.jest) frameworks.jest = deps.jest;
    if (deps.playwright) frameworks.playwright = deps.playwright;
    if (deps.vitest) frameworks.vitest = deps.vitest;
    if (deps['@testing-library/react']) frameworks.reactTestingLibrary = deps['@testing-library/react'];
    
    return frameworks;
  }

  mapTestsToComponents(testFiles, componentFiles) {
    const tested = [];
    const untested = [];
    
    for (const component of componentFiles) {
      const componentName = path.basename(component, path.extname(component));
      const hasTest = testFiles.some(test => 
        test.includes(componentName) || 
        test.includes(component.replace('src/', ''))
      );
      
      if (hasTest) {
        tested.push(component);
      } else {
        untested.push(component);
      }
    }
    
    return { tested, untested };
  }

  analyzeWorkflowCoverage(workflow, existingTests) {
    const existing = [];
    const missing = [];
    
    for (const scenario of workflow.scenarios) {
      const hasTest = existingTests.some(test => 
        test.toLowerCase().includes(scenario.toLowerCase().replace(/\s+/g, '-'))
      );
      
      if (hasTest) {
        existing.push(scenario);
      } else {
        missing.push(scenario);
      }
    }
    
    return { existing, missing, coverage: (existing.length / workflow.scenarios.length) * 100 };
  }

  generateTestTemplates() {
    return {
      unit: `
// Unit Test Template
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('should handle user interactions', () => {
    // Test user interactions
  });
  
  it('should validate props', () => {
    // Test prop validation
  });
});
`,
      integration: `
// Integration Test Template
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComponentName } from './ComponentName';

describe('ComponentName Integration', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient();
  });
  
  it('should integrate with API', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ComponentName />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
`,
      e2e: `
// E2E Test Template
import { test, expect } from '@playwright/test';

test.describe('Workflow Name', () => {
  test('should complete user journey', async ({ page }) => {
    await page.goto('/');
    
    // Navigate through workflow
    await page.click('[data-testid="button"]');
    await page.fill('[data-testid="input"]', 'test value');
    await page.click('[data-testid="submit"]');
    
    // Verify outcome
    await expect(page.locator('[data-testid="success"]')).toBeVisible();
  });
});
`
    };
  }

  generateComponentTestTemplates(untestedComponents) {
    return untestedComponents.map(component => ({
      component,
      testFile: component.replace('.tsx', '.test.tsx').replace('.ts', '.test.ts'),
      template: 'unit' // Reference to template type
    }));
  }

  generateWorkflowTestTemplates(workflowCoverage) {
    const templates = {};
    
    for (const [workflowName, coverage] of Object.entries(workflowCoverage)) {
      templates[workflowName] = {
        missing: coverage.missing,
        testFiles: coverage.missing.map(scenario => ({
          scenario,
          testFile: `tests/workflows/${workflowName.toLowerCase().replace(/\s+/g, '-')}/${scenario.toLowerCase().replace(/\s+/g, '-')}.spec.js`,
          template: 'e2e'
        }))
      };
    }
    
    return templates;
  }

  generatePerformanceTestTemplates() {
    return [
      {
        name: 'Page Load Performance',
        testFile: 'tests/performance/page-load.spec.js',
        template: 'performance'
      },
      {
        name: 'API Response Performance',
        testFile: 'tests/performance/api-response.spec.js',
        template: 'performance'
      }
    ];
  }

  runCommand(command, options = {}) {
    const { throwOnError = true, cwd = rootDir } = options;
    
    try {
      const output = execSync(command, { 
        cwd, 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return { stdout: output, stderr: '', exitCode: 0 };
    } catch (error) {
      if (throwOnError) {
        throw error;
      }
      return { 
        stdout: error.stdout || '', 
        stderr: error.stderr || error.message, 
        exitCode: error.status || 1 
      };
    }
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Test Baseline Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    Object.values(this.results).forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
    });

    console.log(`\n⏱️  Total execution time: ${Math.round(duration / 1000)}s`);
    
    // Test readiness assessment
    const existingTests = this.results.existingTests?.analysis?.testFiles?.total || 0;
    const coverageGaps = Object.keys(this.results.coverageGaps?.gaps?.workflowCoverage || {}).length;
    
    console.log(`📊 Existing tests: ${existingTests}`);
    console.log(`🔍 Coverage gaps identified: ${coverageGaps}`);
    
    if (existingTests > 0 && coverageGaps < 5) {
      console.log('✅ Test baseline ADEQUATE for transformation');
    } else {
      console.log('⚠️  Test baseline NEEDS IMPROVEMENT before transformation');
      console.log('📝 Recommend implementing missing critical workflow tests');
    }

    // Save results
    this.saveResults();
  }

  saveResults() {
    const reportPath = path.join(rootDir, 'test-baseline-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      mode: this.generateTests ? 'generate' : 'analyze',
      duration: Date.now() - this.startTime,
      results: this.results,
      config: TEST_COVERAGE_CONFIG,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${reportPath}`);
  }
}

// CLI handling
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
  if (arg === '--generate') {
    options.generate = true;
  } else if (arg === '--run') {
    options.run = true;
  } else if (arg === '--coverage') {
    options.coverage = true;
  }
});

// Run baseline establishment
const establisher = new TestBaselineEstablisher(options);
establisher.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});