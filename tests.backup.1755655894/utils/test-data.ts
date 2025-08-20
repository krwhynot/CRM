/**
 * Test data utilities for CRM testing
 * Provides consistent test data across all test suites
 */

export interface TestOrganization {
  name: string;
  type: 'principal' | 'customer' | 'vendor';
  industry?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  managerName?: string;
}

export interface TestContact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  organizationId?: string;
  notes?: string;
}

export interface TestOpportunity {
  name: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value?: number;
  expectedCloseDate?: string;
  probability?: number;
  organizationId?: string;
  contactId?: string;
  description?: string;
}

export interface TestProduct {
  name: string;
  category?: string;
  description?: string;
  price?: number;
  sku?: string;
  status?: 'active' | 'inactive';
}

export interface TestInteraction {
  type: 'call' | 'email' | 'meeting' | 'note';
  direction: 'inbound' | 'outbound';
  summary: string;
  description?: string;
  interactionDate?: string;
  organizationId?: string;
  contactId?: string;
}

/**
 * Generate test organizations
 */
export class TestDataGenerator {
  private static organizationCounter = 0;
  private static contactCounter = 0;
  private static opportunityCounter = 0;
  private static productCounter = 0;
  private static interactionCounter = 0;

  static generateOrganization(overrides: Partial<TestOrganization> = {}): TestOrganization {
    this.organizationCounter++;
    const suffix = this.organizationCounter;

    return {
      name: `Test Organization ${suffix}`,
      type: 'customer',
      industry: 'Food Service',
      description: `Test organization description ${suffix}`,
      website: `https://test-org-${suffix}.com`,
      phone: `555-${String(suffix).padStart(4, '0')}`,
      email: `contact@test-org-${suffix}.com`,
      address: `${suffix} Test Street`,
      city: 'Test City',
      state: 'CA',
      zip: '90210',
      country: 'United States',
      managerName: `Test Manager ${suffix}`,
      ...overrides
    };
  }

  static generateContact(overrides: Partial<TestContact> = {}): TestContact {
    this.contactCounter++;
    const suffix = this.contactCounter;

    return {
      firstName: `TestFirst${suffix}`,
      lastName: `TestLast${suffix}`,
      email: `test.contact${suffix}@example.com`,
      phone: `555-${String(suffix + 1000).padStart(4, '0')}`,
      position: `Test Position ${suffix}`,
      notes: `Test contact notes ${suffix}`,
      ...overrides
    };
  }

  static generateOpportunity(overrides: Partial<TestOpportunity> = {}): TestOpportunity {
    this.opportunityCounter++;
    const suffix = this.opportunityCounter;

    return {
      name: `Test Opportunity ${suffix}`,
      stage: 'prospecting',
      value: 10000 + (suffix * 1000),
      expectedCloseDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      probability: 25,
      description: `Test opportunity description ${suffix}`,
      ...overrides
    };
  }

  static generateProduct(overrides: Partial<TestProduct> = {}): TestProduct {
    this.productCounter++;
    const suffix = this.productCounter;

    return {
      name: `Test Product ${suffix}`,
      category: 'Test Category',
      description: `Test product description ${suffix}`,
      price: 99.99 + suffix,
      sku: `TEST-SKU-${suffix}`,
      status: 'active',
      ...overrides
    };
  }

  static generateInteraction(overrides: Partial<TestInteraction> = {}): TestInteraction {
    this.interactionCounter++;
    const suffix = this.interactionCounter;

    return {
      type: 'call',
      direction: 'outbound',
      summary: `Test interaction summary ${suffix}`,
      description: `Test interaction description ${suffix}`,
      interactionDate: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate a set of related test data
   */
  static generateRelatedTestData() {
    const organization = this.generateOrganization({
      name: 'Master Food Distribution',
      type: 'principal',
      industry: 'Food Distribution'
    });

    const contact = this.generateContact({
      firstName: 'John',
      lastName: 'Smith',
      position: 'Sales Manager'
    });

    const opportunity = this.generateOpportunity({
      name: 'Q4 Product Launch',
      stage: 'negotiation',
      value: 50000,
      probability: 75
    });

    const product = this.generateProduct({
      name: 'Premium Food Product',
      category: 'Premium Items',
      price: 299.99
    });

    const interaction = this.generateInteraction({
      type: 'meeting',
      summary: 'Discussed product launch strategy'
    });

    return {
      organization,
      contact,
      opportunity,
      product,
      interaction
    };
  }

  /**
   * Generate bulk test data for performance testing
   */
  static generateBulkOrganizations(count: number): TestOrganization[] {
    const organizations = [];
    for (let i = 0; i < count; i++) {
      organizations.push(this.generateOrganization({
        name: `Bulk Test Organization ${i + 1}`,
        type: i % 3 === 0 ? 'principal' : i % 3 === 1 ? 'customer' : 'vendor'
      }));
    }
    return organizations;
  }

  /**
   * Reset counters (useful for test isolation)
   */
  static resetCounters() {
    this.organizationCounter = 0;
    this.contactCounter = 0;
    this.opportunityCounter = 0;
    this.productCounter = 0;
    this.interactionCounter = 0;
  }
}

/**
 * Test user credentials
 */
export const TestUsers = {
  validUser: {
    email: process.env.TEST_USER_EMAIL || 'test@kitchenpantrycrm.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
  },
  adminUser: {
    email: process.env.ADMIN_USER_EMAIL || 'admin@kitchenpantrycrm.com',
    password: process.env.ADMIN_USER_PASSWORD || 'AdminPassword123!'
  },
  invalidUsers: [
    { email: 'invalid@email.com', password: 'wrongpassword' },
    { email: 'test@example.com', password: 'wrongpassword' },
    { email: 'notanemail', password: 'password123' },
    { email: '', password: 'password123' },
    { email: 'test@example.com', password: '' }
  ]
};

/**
 * CSV test data for import testing
 */
export const TestCSVData = {
  validOrganizations: `Name,Type,Industry,Description,Website,Phone,Email,Address,City,State,Zip,Country,Manager Name
Test Import Org 1,principal,Food Service,First test organization,https://test1.com,555-0001,test1@example.com,123 Test St,Test City,CA,90210,United States,John Manager
Test Import Org 2,customer,Retail,Second test organization,https://test2.com,555-0002,test2@example.com,456 Test Ave,Test City,NY,10001,United States,Jane Manager
Test Import Org 3,vendor,Technology,Third test organization,https://test3.com,555-0003,test3@example.com,789 Test Blvd,Test City,TX,75001,United States,Bob Manager`,

  invalidOrganizations: `Name,Type,Industry,Description,Email,Phone
,customer,Retail,Missing name,test@email.com,123-456-7890
Invalid Email Org,vendor,Technology,Has invalid email,invalid-email,123-456-7890
Duplicate Name,principal,Food Service,First duplicate,test1@email.com,123-456-7890
Duplicate Name,customer,Retail,Second duplicate,test2@email.com,987-654-3210`,

  largeDataset: function(count: number): string {
    let csv = 'Name,Type,Industry,Description\n';
    for (let i = 1; i <= count; i++) {
      const type = i % 3 === 0 ? 'principal' : i % 3 === 1 ? 'customer' : 'vendor';
      csv += `Bulk Import Org ${i},${type},Food Service,Bulk import test organization ${i}\n`;
    }
    return csv;
  }
};

/**
 * Common test assertions and expectations
 */
export const TestExpectations = {
  // Performance thresholds
  pageLoadTime: 3000, // 3 seconds
  apiResponseTime: 1000, // 1 second
  searchResponseTime: 500, // 500ms
  formSubmissionTime: 2000, // 2 seconds

  // Data validation
  maxTableRows: 100,
  maxSearchResults: 50,
  minPasswordLength: 8,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxImportRows: 1000,

  // UI expectations
  mobileBreakopoint: 768,
  tabletBreakpoint: 1024,
  desktopBreakpoint: 1920
};

/**
 * Mock API responses for testing
 */
export const MockResponses = {
  organizations: {
    list: {
      data: [
        TestDataGenerator.generateOrganization({ name: 'Mock Org 1' }),
        TestDataGenerator.generateOrganization({ name: 'Mock Org 2' })
      ],
      count: 2,
      totalCount: 2
    },
    single: TestDataGenerator.generateOrganization({ name: 'Mock Single Org' }),
    created: { id: 'mock-id-123', message: 'Organization created successfully' },
    updated: { id: 'mock-id-123', message: 'Organization updated successfully' },
    deleted: { id: 'mock-id-123', message: 'Organization deleted successfully' }
  },

  auth: {
    loginSuccess: { 
      access_token: 'mock-access-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    },
    loginError: { 
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    },
    signupSuccess: {
      message: 'Account created successfully',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com'
      }
    }
  },

  import: {
    validationSuccess: {
      valid: true,
      validRows: 100,
      invalidRows: 0,
      warnings: []
    },
    validationWithWarnings: {
      valid: true,
      validRows: 95,
      invalidRows: 0,
      warnings: ['5 rows have missing optional fields']
    },
    validationError: {
      valid: false,
      validRows: 80,
      invalidRows: 20,
      errors: ['Row 5: Missing required field "Name"', 'Row 12: Invalid email format']
    },
    importSuccess: {
      success: true,
      imported: 100,
      errors: 0,
      warnings: 0
    }
  }
};

/**
 * Viewport configurations for responsive testing
 */
export const TestViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  ipadLandscape: { width: 1024, height: 768 },
  desktop: { width: 1920, height: 1080 },
  largeDesktop: { width: 2560, height: 1440 }
};