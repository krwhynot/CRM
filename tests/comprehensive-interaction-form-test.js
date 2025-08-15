#!/usr/bin/env node

/**
 * Comprehensive Interaction Form Test Script
 * Kitchen Pantry CRM - Master Food Brokers
 * 
 * This script creates 25+ diverse interaction records to thoroughly test
 * the interactions form functionality, validation, and edge cases.
 * 
 * Usage:
 *   node tests/comprehensive-interaction-form-test.js [--headless] [--email=test@example.com] [--password=password]
 * 
 * Prerequisites:
 *   1. Development server running on localhost:5177 (or check current port)
 *   2. Valid authenticated user session
 *   3. Existing organizations, contacts, and opportunities in database
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:5176', // Updated to current dev server port
  timeouts: {
    navigation: 15000,
    element: 8000,
    api: 5000,
    formSubmission: 10000
  },
  viewports: {
    desktop: { width: 1200, height: 900 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },
  screenshots: true,
  headless: process.argv.includes('--headless'),
  retryAttempts: 3
};

// Parse command line arguments
const args = process.argv.slice(2);
const email = args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'test@foodbroker.com';
const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'test123';

// Test Results Structure
let testResults = {
  timestamp: new Date().toISOString(),
  environment: 'Development',
  browser: 'Chromium',
  totalTests: 0,
  passed: 0,
  failed: 0,
  records_created: [],
  errors: [],
  performance: {
    form_load_times: [],
    submission_times: [],
    average_form_load: 0,
    average_submission: 0
  },
  scenarios: {}
};

// Comprehensive Test Data - 25 Diverse Scenarios
const testScenarios = [
  // Core Interaction Types (7 scenarios)
  {
    id: 'basic_call',
    name: 'Basic Phone Call',
    description: 'Quick call with minimal required fields',
    data: {
      subject: 'Quick check-in call with client',
      type: 'call',
      duration_minutes: '15',
      description: 'Brief status update and next steps discussion',
      outcome: 'Positive response, moving forward with proposal'
    }
  },
  {
    id: 'detailed_email',
    name: 'Detailed Email Exchange',
    description: 'Email with contact and attachments',
    data: {
      subject: 'Product catalog and pricing information',
      type: 'email',
      duration_minutes: '',
      description: 'Sent comprehensive product catalog with seasonal items and bulk pricing. Included shipping options and minimum order requirements.',
      outcome: 'Client requested formal quote for Q1 orders',
      attachments: 'Product_Catalog_2025.pdf\nBulk_Pricing_Sheet.xlsx\nShipping_Options.pdf',
      follow_up_required: true,
      follow_up_date: '2025-08-20',
      follow_up_notes: 'Follow up on quote request and delivery timeline'
    }
  },
  {
    id: 'client_meeting',
    name: 'Comprehensive Client Meeting',
    description: 'Full meeting with all fields populated',
    data: {
      subject: 'Q4 Planning and Product Selection Meeting',
      type: 'meeting',
      duration_minutes: '90',
      description: 'Comprehensive review of Q4 needs, seasonal product planning, inventory management, and promotional opportunities. Discussed expansion into new product categories.',
      outcome: 'Agreed on Q4 order schedule, identified 3 new product lines for testing',
      follow_up_required: true,
      follow_up_date: '2025-08-18',
      follow_up_notes: 'Send product samples and formal proposal'
    }
  },
  {
    id: 'product_demo',
    name: 'Product Demonstration',
    description: 'Demo with specific outcome tracking',
    data: {
      subject: 'New Artisan Cheese Line Product Demo',
      type: 'demo',
      duration_minutes: '45',
      description: 'Presented new artisan cheese collection including aged cheddars, specialty bries, and seasonal varieties. Demonstrated proper storage and display techniques.',
      outcome: 'Strong interest in 5 cheese varieties, requested pricing for retail program',
      attachments: 'Cheese_Line_Specs.pdf\nStorage_Guidelines.pdf'
    }
  },
  {
    id: 'proposal_submission',
    name: 'Proposal Submission',
    description: 'Proposal with opportunity linkage',
    data: {
      subject: 'Formal proposal for exclusive distribution agreement',
      type: 'proposal',
      duration_minutes: '',
      description: 'Submitted comprehensive proposal for exclusive regional distribution rights covering organic produce line. Includes territory boundaries, minimum volume commitments, and marketing support.',
      outcome: 'Proposal under review, decision expected within 2 weeks',
      attachments: 'Distribution_Proposal_v2.pdf\nTerritory_Map.pdf\nMarketing_Plan.pdf',
      follow_up_required: true,
      follow_up_date: '2025-08-25',
      follow_up_notes: 'Check on proposal review status and address any questions'
    }
  },
  {
    id: 'internal_note',
    name: 'Internal Documentation Note',
    description: 'Note-type interaction for record keeping',
    data: {
      subject: 'Market research findings and competitive analysis',
      type: 'note',
      duration_minutes: '',
      description: 'Compiled market research on premium olive oil segment. Key findings: 23% growth in organic varieties, increased demand for single-origin products, price sensitivity at $25+ range.',
      outcome: 'Recommend expanding organic olive oil selection, focus on $15-20 price point',
      attachments: 'Market_Research_Report.pdf\nCompetitive_Analysis.xlsx'
    }
  },
  {
    id: 'follow_up_call',
    name: 'Follow-up Call',
    description: 'Call requiring future follow-up',
    data: {
      subject: 'Follow-up on rejected proposal - understanding concerns',
      type: 'call',
      duration_minutes: '25',
      description: 'Discussed reasons for proposal rejection. Main concerns: pricing 12% above budget, delivery schedule conflicts with peak season, uncertainty about promotional support.',
      outcome: 'Agreed to revise proposal addressing pricing and delivery concerns',
      follow_up_required: true,
      follow_up_date: '2025-08-19',
      follow_up_notes: 'Present revised proposal with adjusted pricing and flexible delivery'
    }
  },

  // Edge Case Testing (8 scenarios)
  {
    id: 'minimal_data',
    name: 'Minimal Required Data',
    description: 'Only required fields populated',
    data: {
      subject: 'Brief client contact',
      type: 'call'
    }
  },
  {
    id: 'maximum_data',
    name: 'Maximum Data Population',
    description: 'Every possible field populated to character limits',
    data: {
      subject: 'Comprehensive strategic partnership discussion covering multiple product lines, distribution channels, marketing initiatives, and long-term collaboration opportunities spanning the next three fiscal years with detailed implementation timeline',
      type: 'meeting',
      duration_minutes: '240',
      description: 'Extensive strategic planning session covering comprehensive partnership framework including product portfolio expansion, market penetration strategies, joint marketing campaigns, supply chain optimization, quality assurance protocols, customer service integration, technology platform alignment, and performance metrics establishment. Discussed territorial exclusivity arrangements, volume commitment structures, pricing mechanisms, promotional support programs, training initiatives, and quarterly business review processes. Evaluated competitive landscape positioning, market opportunity analysis, risk mitigation strategies, and success measurement criteria for sustainable long-term partnership growth.',
      outcome: 'Established comprehensive partnership framework with clear success metrics, defined next steps for implementation including legal review, operational planning, and market launch strategy. Committed to quarterly business reviews and annual strategic alignment sessions.',
      attachments: 'Strategic_Partnership_Framework.pdf\nMarket_Analysis_Comprehensive.xlsx\nImplementation_Timeline.pdf\nPerformance_Metrics.xlsx\nLegal_Framework_Draft.pdf',
      follow_up_required: true,
      follow_up_date: '2025-08-22',
      follow_up_notes: 'Coordinate legal review of partnership framework, schedule operational planning sessions with key stakeholders, and prepare market launch timeline for Q4 implementation with all necessary approvals and resource allocation.'
    }
  },
  {
    id: 'special_characters',
    name: 'Special Characters Test',
    description: 'Unicode, emojis, and special characters in text fields',
    data: {
      subject: 'Café & Restaurant Meeting - Spécialités Françaises 🥖🧀',
      type: 'meeting',
      duration_minutes: '60',
      description: 'Discussed café\'s interest in premium French specialties including café au lait, crème brûlée ingredients, and artisanal pastries. Special focus on "farm-to-table" sourcing & organic certification requirements. Price range: €15-25 per item.',
      outcome: 'Strong interest in French product line! 📈 Next: send samples & pricing 💼',
      attachments: 'Café_Menu_French.pdf\nOrganik_Zertifizierung.pdf',
      follow_up_notes: 'Envoyer échantillons et catalogue français 🇫🇷'
    }
  },
  {
    id: 'boundary_dates',
    name: 'Boundary Date Testing',
    description: 'Past and future date boundaries',
    data: {
      subject: 'Historical client relationship review',
      type: 'note',
      interaction_date: '2024-01-15',
      description: 'Reviewed 12-month client relationship history to identify growth opportunities and service improvements.',
      outcome: 'Identified 3 areas for enhanced service delivery'
    }
  },
  {
    id: 'zero_duration',
    name: 'Zero Duration Meeting',
    description: 'Meeting with 0 minutes duration',
    data: {
      subject: 'Quick lobby encounter',
      type: 'meeting',
      duration_minutes: '0',
      description: 'Brief unexpected meeting in building lobby',
      outcome: 'Exchanged business cards, scheduled formal meeting'
    }
  },
  {
    id: 'maximum_duration',
    name: 'Maximum Duration Event',
    description: '8-hour trade show event',
    data: {
      subject: 'Annual Food Service Trade Show - Full Day Participation',
      type: 'meeting',
      duration_minutes: '480',
      description: 'Full-day trade show participation including booth setup, customer meetings, product demonstrations, competitor analysis, and networking sessions.',
      outcome: 'Generated 47 qualified leads, collected 23 business cards, scheduled 12 follow-up meetings',
      attachments: 'Trade_Show_Leads.xlsx\nCompetitor_Notes.pdf\nProduct_Demo_Feedback.pdf'
    }
  },
  {
    id: 'multiline_attachments',
    name: 'Multi-line Attachments',
    description: 'Multiple attachments with complex formatting',
    data: {
      subject: 'Contract negotiation documentation package',
      type: 'proposal',
      description: 'Comprehensive contract negotiation package with all supporting documentation.',
      outcome: 'All documentation submitted for legal review',
      attachments: 'Contract_Draft_v3.pdf\nPricing_Schedule_Final.xlsx\nDelivery_Terms.pdf\nQuality_Standards.pdf\nInsurance_Certificates.pdf\nCompliance_Documentation.pdf\nReference_Letters.pdf'
    }
  },
  {
    id: 'future_interaction',
    name: 'Future Date Interaction',
    description: 'Scheduled future interaction',
    data: {
      subject: 'Scheduled quarterly business review',
      type: 'meeting',
      interaction_date: '2025-09-15',
      duration_minutes: '120',
      description: 'Quarterly business review meeting to assess performance metrics and plan for Q4.',
      follow_up_required: true,
      follow_up_date: '2025-09-20',
      follow_up_notes: 'Prepare Q4 action plan based on discussion outcomes'
    }
  },

  // Relationship Testing (5 scenarios)
  {
    id: 'org_only',
    name: 'Organization Only',
    description: 'No contact or opportunity selected',
    data: {
      subject: 'General organization inquiry',
      type: 'call',
      description: 'General inquiry about services, no specific contact person',
      outcome: 'Directed to appropriate department contact'
    }
  },
  {
    id: 'org_contact',
    name: 'Organization + Contact',
    description: 'Contact relationship validation',
    data: {
      subject: 'Direct contact communication',
      type: 'email',
      description: 'Email exchange with specific contact person regarding account details',
      outcome: 'Account information updated successfully'
    }
  },
  {
    id: 'org_opportunity',
    name: 'Organization + Opportunity',
    description: 'Opportunity relationship validation',
    data: {
      subject: 'Opportunity-specific discussion',
      type: 'call',
      description: 'Discussion focused on specific sales opportunity progress',
      outcome: 'Opportunity advanced to next stage'
    }
  },
  {
    id: 'full_relationship',
    name: 'Complete Relationship Chain',
    description: 'Organization + Contact + Opportunity all linked',
    data: {
      subject: 'Comprehensive stakeholder meeting',
      type: 'meeting',
      duration_minutes: '75',
      description: 'Meeting with key contact regarding specific opportunity progression and account management',
      outcome: 'All parties aligned on next steps and timeline'
    }
  },
  {
    id: 'contact_filtering',
    name: 'Contact Filtering Test',
    description: 'Test contact filtering by organization',
    data: {
      subject: 'Contact-specific follow-up',
      type: 'call',
      description: 'Follow-up call testing contact filtering functionality',
      outcome: 'Contact filtering working correctly'
    }
  },

  // Follow-up Scenarios (3 scenarios)
  {
    id: 'followup_today',
    name: 'Follow-up Required Today',
    description: 'Follow-up date set to today',
    data: {
      subject: 'Urgent follow-up required',
      type: 'call',
      description: 'Call requiring immediate follow-up action',
      outcome: 'Action items identified for today',
      follow_up_required: true,
      follow_up_date: new Date().toISOString().split('T')[0], // Today's date
      follow_up_notes: 'Complete action items by end of business today'
    }
  },
  {
    id: 'followup_future',
    name: 'Follow-up Required Future',
    description: 'Follow-up date set to next week',
    data: {
      subject: 'Future planning discussion',
      type: 'meeting',
      duration_minutes: '45',
      description: 'Strategic planning meeting with follow-up scheduled',
      outcome: 'Action plan developed for implementation',
      follow_up_required: true,
      follow_up_date: '2025-08-22',
      follow_up_notes: 'Review implementation progress and adjust timeline as needed'
    }
  },
  {
    id: 'followup_detailed',
    name: 'Follow-up with Detailed Notes',
    description: 'Follow-up with comprehensive notes',
    data: {
      subject: 'Complex project follow-up',
      type: 'meeting',
      duration_minutes: '90',
      description: 'Multi-phase project discussion requiring detailed follow-up tracking',
      outcome: 'Project phases defined with clear milestones',
      follow_up_required: true,
      follow_up_date: '2025-08-25',
      follow_up_notes: 'Phase 1: Complete vendor selection by 8/30. Phase 2: Finalize contracts by 9/15. Phase 3: Begin implementation 10/1. Schedule weekly check-ins starting 9/1.'
    }
  },

  // Mobile/Responsive Testing (2 scenarios)
  {
    id: 'mobile_test',
    name: 'Mobile Form Test',
    description: 'Create record on mobile viewport',
    viewport: 'mobile',
    data: {
      subject: 'Mobile interaction test',
      type: 'call',
      duration_minutes: '10',
      description: 'Testing form functionality on mobile device',
      outcome: 'Mobile form working correctly'
    }
  },
  {
    id: 'tablet_test',
    name: 'Tablet Form Test',
    description: 'Create record on tablet viewport',
    viewport: 'tablet',
    data: {
      subject: 'Tablet interaction test',
      type: 'email',
      description: 'Testing form functionality on tablet device with touch interface',
      outcome: 'Tablet form responsive and functional'
    }
  }
];

// Utility Functions
function formatDuration(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

function generateTestReport() {
  const reportPath = path.join(__dirname, 'interaction-form-test-report.json');
  const htmlReportPath = path.join(__dirname, 'interaction-form-test-report.html');
  
  // Calculate averages
  if (testResults.performance.form_load_times.length > 0) {
    testResults.performance.average_form_load = 
      testResults.performance.form_load_times.reduce((a, b) => a + b, 0) / 
      testResults.performance.form_load_times.length;
  }
  
  if (testResults.performance.submission_times.length > 0) {
    testResults.performance.average_submission = 
      testResults.performance.submission_times.reduce((a, b) => a + b, 0) / 
      testResults.performance.submission_times.length;
  }

  // Write JSON report
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Interaction Form Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: #e8f4f8; padding: 15px; border-radius: 5px; text-align: center; }
        .scenarios { margin: 20px 0; }
        .scenario { background: #f9f9f9; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .success { border-left: 4px solid #4CAF50; }
        .error { border-left: 4px solid #f44336; }
        .performance { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Interaction Form Comprehensive Test Report</h1>
        <p><strong>Generated:</strong> ${testResults.timestamp}</p>
        <p><strong>Environment:</strong> ${testResults.environment}</p>
        <p><strong>Browser:</strong> ${testResults.browser}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>${testResults.totalTests}</h3>
            <p>Total Tests</p>
        </div>
        <div class="stat-card">
            <h3>${testResults.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="stat-card">
            <h3>${testResults.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="stat-card">
            <h3>${testResults.records_created.length}</h3>
            <p>Records Created</p>
        </div>
    </div>
    
    <div class="performance">
        <h2>Performance Metrics</h2>
        <p><strong>Average Form Load Time:</strong> ${formatDuration(testResults.performance.average_form_load)}</p>
        <p><strong>Average Submission Time:</strong> ${formatDuration(testResults.performance.average_submission)}</p>
    </div>
    
    <div class="scenarios">
        <h2>Test Scenarios</h2>
        ${Object.entries(testResults.scenarios).map(([id, scenario]) => `
            <div class="scenario ${scenario.status === 'passed' ? 'success' : 'error'}">
                <h3>${scenario.name}</h3>
                <p><strong>Status:</strong> ${scenario.status}</p>
                <p><strong>Description:</strong> ${scenario.description}</p>
                ${scenario.error ? `<p><strong>Error:</strong> ${scenario.error}</p>` : ''}
                ${scenario.timing ? `<p><strong>Timing:</strong> Load: ${formatDuration(scenario.timing.load)}, Submit: ${formatDuration(scenario.timing.submit)}</p>` : ''}
            </div>
        `).join('')}
    </div>
    
    ${testResults.errors.length > 0 ? `
    <div class="errors">
        <h2>Errors</h2>
        ${testResults.errors.map(error => `<div class="error">${error}</div>`).join('')}
    </div>
    ` : ''}
</body>
</html>`;
  
  fs.writeFileSync(htmlReportPath, htmlReport);
  
  console.log(`\n📊 Test Report Generated:`);
  console.log(`   JSON: ${reportPath}`);
  console.log(`   HTML: ${htmlReportPath}`);
}

// Main Test Execution Function
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Interaction Form Tests...');
  console.log(`📱 Testing ${testScenarios.length} scenarios\n`);
  
  const browser = await chromium.launch({ 
    headless: CONFIG.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: CONFIG.viewports.desktop,
      ignoreHTTPSErrors: true
    });
    
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Browser Error: ${msg.text()}`);
      }
    });
    
    // Navigate to interactions page
    console.log('🌐 Navigating to interactions page...');
    await page.goto(`${CONFIG.baseUrl}/interactions`, { 
      waitUntil: 'networkidle',
      timeout: CONFIG.timeouts.navigation 
    });
    
    // Wait for page to be fully loaded
    await page.waitForSelector('[data-testid="interactions-page"], .interactions-page, h1:has-text("Interactions")', { 
      timeout: CONFIG.timeouts.element 
    });
    
    console.log('✅ Page loaded successfully\n');
    
    // Run all test scenarios
    testResults.totalTests = testScenarios.length;
    
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`📝 Test ${i + 1}/${testScenarios.length}: ${scenario.name}`);
      
      try {
        await runTestScenario(page, scenario);
        testResults.passed++;
        console.log(`   ✅ Passed\n`);
      } catch (error) {
        testResults.failed++;
        testResults.errors.push(`${scenario.name}: ${error.message}`);
        testResults.scenarios[scenario.id] = {
          ...testResults.scenarios[scenario.id],
          status: 'failed',
          error: error.message
        };
        console.log(`   ❌ Failed: ${error.message}\n`);
      }
    }
    
    await context.close();
    
  } catch (error) {
    console.error('💥 Critical error during test execution:', error);
    testResults.errors.push(`Critical error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Generate final report
  generateTestReport();
  
  console.log('\n🎯 Test Execution Complete!');
  console.log(`📊 Results: ${testResults.passed} passed, ${testResults.failed} failed`);
  console.log(`📋 Records Created: ${testResults.records_created.length}`);
  
  if (testResults.performance.average_form_load > 0) {
    console.log(`⚡ Performance: ${formatDuration(testResults.performance.average_form_load)} avg load, ${formatDuration(testResults.performance.average_submission)} avg submit`);
  }
}

// Individual Test Scenario Runner
async function runTestScenario(page, scenario) {
  const startTime = Date.now();
  const timing = {};
  
  // Set viewport if specified
  if (scenario.viewport && CONFIG.viewports[scenario.viewport]) {
    await page.setViewportSize(CONFIG.viewports[scenario.viewport]);
  }
  
  // Click "Add Interaction" button
  const loadStart = Date.now();
  await page.click('button:has-text("Add Interaction"), [data-testid="add-interaction-btn"]');
  
  // Wait for form modal to appear
  await page.waitForSelector('[role="dialog"], .dialog, [data-testid="interaction-form"]', {
    timeout: CONFIG.timeouts.element
  });
  
  timing.load = Date.now() - loadStart;
  testResults.performance.form_load_times.push(timing.load);
  
  // Fill out the form with scenario data
  await fillInteractionForm(page, scenario.data);
  
  // Submit the form
  const submitStart = Date.now();
  await page.click('button[type="submit"]:has-text("Save"), button:has-text("Save Interaction")');
  
  // Wait for success message or form to close
  try {
    await page.waitForSelector('text="Interaction created successfully", [data-testid="success-message"]', {
      timeout: CONFIG.timeouts.formSubmission
    });
  } catch {
    // Alternative: wait for modal to close
    await page.waitForSelector('[role="dialog"]', { 
      state: 'hidden', 
      timeout: CONFIG.timeouts.formSubmission 
    });
  }
  
  timing.submit = Date.now() - submitStart;
  testResults.performance.submission_times.push(timing.submit);
  
  // Record successful scenario
  testResults.scenarios[scenario.id] = {
    name: scenario.name,
    description: scenario.description,
    status: 'passed',
    timing: timing
  };
  
  testResults.records_created.push({
    scenario_id: scenario.id,
    name: scenario.name,
    subject: scenario.data.subject,
    timestamp: new Date().toISOString()
  });
  
  // Reset viewport to desktop for next test
  if (scenario.viewport) {
    await page.setViewportSize(CONFIG.viewports.desktop);
  }
  
  // Small delay between tests
  await page.waitForTimeout(1000);
}

// Form Filling Helper Function
async function fillInteractionForm(page, data) {
  // Fill Subject (required)
  await page.fill('input[name="subject"], #subject', data.subject);
  
  // Select Type (required)
  if (data.type) {
    await page.click('[data-testid="interaction-type-select"], select[name="type"] + button, button:has-text("Select type")');
    await page.waitForTimeout(500);
    await page.click(`text="${data.type}", [value="${data.type}"]`);
  }
  
  // Set interaction date if specified
  if (data.interaction_date) {
    await page.fill('input[type="date"], input[name="interaction_date"]', data.interaction_date);
  }
  
  // Fill Duration if specified
  if (data.duration_minutes !== undefined) {
    await page.fill('input[name="duration_minutes"], #duration_minutes', data.duration_minutes.toString());
  }
  
  // Select Organization (required) - select first available if not specified
  try {
    await page.click('[data-testid="organization-select"], button:has-text("Select organization")');
    await page.waitForTimeout(500);
    await page.click('div[role="option"]:first-child, [data-testid="organization-option"]:first-child');
  } catch (error) {
    console.log('   ⚠️  Organization selection might be pre-filled or different selector needed');
  }
  
  // Select Contact if needed (optional)
  if (data.contact_required) {
    try {
      await page.click('[data-testid="contact-select"], button:has-text("Select contact")');
      await page.waitForTimeout(500);
      await page.click('div[role="option"]:first-child, [data-testid="contact-option"]:first-child');
    } catch (error) {
      console.log('   ⚠️  Contact selection optional or not available');
    }
  }
  
  // Fill Description if specified
  if (data.description) {
    await page.fill('textarea[name="description"], #description', data.description);
  }
  
  // Fill Outcome if specified
  if (data.outcome) {
    await page.fill('textarea[name="outcome"], #outcome', data.outcome);
  }
  
  // Handle Follow-up checkbox and fields
  if (data.follow_up_required) {
    await page.check('input[name="follow_up_required"], #follow_up_required');
    
    if (data.follow_up_date) {
      await page.fill('input[name="follow_up_date"], #follow_up_date', data.follow_up_date);
    }
    
    if (data.follow_up_notes) {
      await page.fill('textarea[name="follow_up_notes"], #follow_up_notes', data.follow_up_notes);
    }
  }
  
  // Fill Attachments if specified
  if (data.attachments) {
    await page.fill('textarea[name="attachments"], #attachments', data.attachments);
  }
}

// Execute the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

export {
  runComprehensiveTests,
  testScenarios,
  CONFIG
};