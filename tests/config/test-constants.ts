/**
 * Test Constants Configuration
 * 
 * Centralized configuration for all test-specific constants, URLs,
 * viewport sizes, and other hardcoded values used in test files.
 */

// Test Server URLs
export const testUrls = {
  development: 'http://localhost:5173',
  test: 'http://localhost:5175',
  visualCompliance: 'http://localhost:5175',
} as const

// Viewport Dimensions for Responsive Testing
export const viewportSizes = {
  mobileSmall: { width: 320, height: 568, name: 'mobile-small' },
  mobileMedium: { width: 375, height: 667, name: 'mobile-medium' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktopSmall: { width: 1024, height: 768, name: 'desktop-small' },
  desktopLarge: { width: 1440, height: 900, name: 'desktop-large' },
  desktopXL: { width: 1920, height: 1080, name: 'desktop-xl' },
} as const

// Common viewport breakpoints for testing
export const breakpoints = [
  viewportSizes.mobileSmall,
  viewportSizes.tablet,
  viewportSizes.desktopSmall,
  viewportSizes.desktopLarge,
] as const

// Test Data URLs and Placeholders
export const testDataUrls = {
  organization: 'https://test.com',
  linkedin: 'https://linkedin.com/in/johnsmith',
  companyLinkedin: 'https://linkedin.com/company/acmefood',
  sample: (id: number) => `https://test${id}.com`,
  placeholder: 'https://example.com',
} as const

// Mock Data Constants
export const mockData = {
  defaultColor: '#666',
  sampleColorHex: '#3b82f6',
  testEmail: (id: number) => `test${id}@example.com`,
  testPhone: (id: number) => `555-${String(id).padStart(4, '0')}`,
  testAddress: (id: number) => `${id} Test St, Test City, CA, 90210, United States`,
  testManager: (id: number) => `Manager ${id}`,
} as const

// Test Environment Configuration
export const testConfig = {
  timeouts: {
    apiResponse: 1000,
    pageLoad: 5000,
    animation: 500,
  },
  
  performance: {
    maxBundleSize: 3 * 1024 * 1024, // 3MB
    maxPageLoadTime: 5000, // 5 seconds
    maxApiResponseTime: 1000, // 1 second
  },
  
  database: {
    maxQueryTime: 5, // 5ms
    testBatchSize: 100,
    maxTestRecords: 1000,
  },
} as const

// Test Selectors and IDs
export const testSelectors = {
  forms: {
    opportunity: '[data-testid="opportunity-form"]',
    organization: '[data-testid="organization-form"]',
    contact: '[data-testid="contact-form"]',
  },
  
  buttons: {
    submit: '[data-testid="submit-button"]',
    cancel: '[data-testid="cancel-button"]',
    add: '[data-testid="add-button"]',
  },
  
  tables: {
    dataTable: '[data-testid="data-table"]',
    tableRow: '[data-testid="table-row"]',
    tableCell: '[data-testid="table-cell"]',
  },
} as const

// Default Test UUIDs (for consistent testing)
export const testUUIDs = {
  defaultOrganization: '00000000-0000-0000-0000-000000000001',
  defaultContact: '00000000-0000-0000-0000-000000000002',
  defaultProduct: '00000000-0000-0000-0000-000000000003',
  defaultOpportunity: '00000000-0000-0000-0000-000000000004',
} as const

// Test Routes
export const testRoutes = {
  home: '/',
  organizations: '/organizations',
  contacts: '/contacts',
  opportunities: '/opportunities',
  products: '/products',
  dashboard: '/dashboard',
  importExport: '/import-export',
} as const

// Helper functions for test configuration
export const getTestUrl = (baseUrl: keyof typeof testUrls, route?: string): string => {
  const base = testUrls[baseUrl]
  return route ? `${base}${route}` : base
}

export const getViewportSize = (name: keyof typeof viewportSizes) => {
  return viewportSizes[name]
}

export const generateTestData = {
  organization: (id: number) => ({
    name: `Import Test Org ${id}`,
    type: 'Customer',
    industry: 'Food Service',
    description: `Test organization ${id}`,
    website: testDataUrls.sample(id),
    phone: mockData.testPhone(id),
    email: mockData.testEmail(id),
    address: mockData.testAddress(id),
  }),
  
  contact: (id: number) => ({
    first_name: `Test`,
    last_name: `Contact ${id}`,
    title: `Manager ${id}`,
    email: mockData.testEmail(id),
    phone: mockData.testPhone(id),
    linkedin_url: testDataUrls.linkedin,
  }),
}