# KitchenPantry CRM - Playwright E2E Test Suite

Comprehensive end-to-end test suite for the KitchenPantry CRM system built with Playwright and TypeScript.

## Overview

This test suite provides complete coverage of the CRM application including:

- **Authentication Flow** - Login, logout, signup, password reset
- **CRUD Operations** - Create, read, update, delete for all 5 core entities
- **Dashboard Functionality** - Metrics, activity feed, principal cards
- **Excel Import Feature** - File upload, validation, progress tracking
- **Mobile Responsiveness** - iPad and mobile phone compatibility
- **Form Validation** - Field validation, business rules, accessibility
- **Performance Testing** - Load times, API response times
- **Error Handling** - Network errors, validation errors, edge cases

## Test Structure

```
tests/
├── auth/                 # Authentication tests
├── crud/                 # CRUD operation tests
├── dashboard/            # Dashboard functionality tests
├── import-export/        # Excel import/export tests
├── mobile/              # Responsive design tests
├── forms/               # Form validation tests
├── page-objects/        # Page Object Model classes
├── utils/               # Test utilities and helpers
├── fixtures/            # Test data and fixtures
└── README.md           # This file
```

## Page Object Model Architecture

The test suite follows the Page Object Model (POM) pattern for maintainable and reusable tests:

### Core Page Objects

- **BasePage** - Common functionality for all pages
- **AuthPage** - Authentication-related operations
- **DashboardPage** - Dashboard interactions and data extraction
- **OrganizationsPage** - Organization CRUD operations
- **ImportExportPage** - File import/export functionality

### Key Features

- **Type-safe** - Full TypeScript support with strict typing
- **Responsive-aware** - Built-in responsive testing capabilities
- **Performance monitoring** - Integrated performance measurement
- **Error handling** - Comprehensive error state testing
- **Accessibility** - ARIA compliance and keyboard navigation testing

## Test Configuration

The test suite supports multiple browsers and devices:

### Supported Browsers
- **Chromium** (Desktop)
- **Firefox** (Desktop)
- **Safari/WebKit** (Desktop)

### Supported Devices
- **iPad Pro** (1024x768)
- **iPhone 13** (375x667)
- **Android Tablet** (768x1024)
- **Desktop** (1920x1080)

### Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `global-setup.ts` - Global test setup and authentication
- `global-teardown.ts` - Global cleanup and reporting

## Running Tests

### Prerequisites

1. **Node.js** 18+ installed
2. **Dependencies** installed: `npm install`
3. **Application** running on `http://localhost:5173`
4. **Test user** configured in environment variables

### Environment Variables

```bash
# Test user credentials
TEST_USER_EMAIL=test@kitchenpantrycrm.com
TEST_USER_PASSWORD=TestPassword123!

# Admin user (for advanced tests)
ADMIN_USER_EMAIL=admin@kitchenpantrycrm.com  
ADMIN_USER_PASSWORD=AdminPassword123!

# Application URL (optional)
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

### Running All Tests

```bash
# Run all tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# Run specific test suite
npx playwright test tests/auth/
npx playwright test tests/crud/
npx playwright test tests/dashboard/
```

### Running Tests by Device

```bash
# Run iPad tests only
npx playwright test --project=ipad

# Run mobile tests only  
npx playwright test --project=iphone

# Run desktop tests only
npx playwright test --project=chromium-desktop
```

### Debugging Tests

```bash
# Run in debug mode
npx playwright test --debug

# Run with trace viewer
npx playwright test --trace on

# Generate and view test report
npx playwright show-report
```

## Test Data Management

### Test Data Generation

The test suite includes comprehensive test data generators:

```typescript
import { TestDataGenerator } from './utils/test-data';

// Generate test organization
const testOrg = TestDataGenerator.generateOrganization({
  name: 'Test Food Distribution',
  type: 'principal',
  industry: 'Food Service'
});

// Generate related test data
const relatedData = TestDataGenerator.generateRelatedTestData();
```

### CSV Test Data

Pre-built CSV datasets for import testing:

```typescript
import { TestCSVData } from './utils/test-data';

// Valid organizations CSV
const validCSV = TestCSVData.validOrganizations;

// Invalid organizations (for error testing)  
const invalidCSV = TestCSVData.invalidOrganizations;

// Large dataset (for performance testing)
const largeCSV = TestCSVData.largeDataset(1000);
```

## Test Utilities

### Common Helper Functions

```typescript
import { 
  AuthHelpers, 
  FormHelpers, 
  TableHelpers, 
  PerformanceHelpers 
} from './utils/test-helpers';

// Authentication
await AuthHelpers.login(page, email, password);
await AuthHelpers.logout(page);

// Form interactions
await FormHelpers.fillForm(page, formData);
await FormHelpers.validateFormErrors(page, expectedErrors);

// Table operations
const tableData = await TableHelpers.getTableData(table);
await TableHelpers.testTableSorting(page, header, selector);

// Performance measurement
const metrics = await PerformanceHelpers.measurePageLoad(page);
```

### Responsive Testing

```typescript
import { ResponsiveHelpers, TestViewports } from './utils/test-helpers';

// Test mobile navigation
const mobileNav = await ResponsiveHelpers.testMobileNavigation(page);

// Test component across viewports
const responsive = await ResponsiveHelpers.testResponsiveComponent(
  page, 
  component, 
  [TestViewports.mobile, TestViewports.tablet, TestViewports.desktop]
);
```

## Test Categories

### 1. Authentication Tests (`auth/auth.spec.ts`)

**Coverage:**
- Login with valid/invalid credentials
- Logout functionality
- Password reset flow
- Protected route access
- Session management
- Form validation
- Performance testing
- Mobile compatibility

**Key Test Cases:**
- ✅ Login form display and validation
- ✅ Successful login with valid credentials
- ✅ Error handling for invalid credentials
- ✅ Remember me functionality
- ✅ Logout and session cleanup
- ✅ Protected route redirects
- ✅ Password reset workflow
- ✅ Session persistence across page refreshes

### 2. CRUD Operations (`crud/organizations.spec.ts`)

**Coverage:**
- Create organizations with validation
- Read/display organization data
- Update organization information  
- Delete organizations (single and bulk)
- Search and filtering
- Pagination
- Sorting
- Data integrity

**Key Test Cases:**
- ✅ Organization form validation
- ✅ Create organization with valid data
- ✅ Edit existing organizations
- ✅ Delete organizations with confirmation
- ✅ Search functionality
- ✅ Filter by type and industry
- ✅ Table pagination and sorting
- ✅ Bulk operations
- ✅ Performance testing
- ✅ Concurrent operations

### 3. Dashboard Tests (`dashboard/dashboard.spec.ts`)

**Coverage:**
- Dashboard layout and components
- Metrics display and accuracy
- Principal cards functionality
- Activity feed display
- Real-time updates
- Responsive design
- Performance optimization

**Key Test Cases:**
- ✅ Dashboard layout verification
- ✅ Stats cards display correct metrics
- ✅ Principal cards show proper data
- ✅ Activity feed functionality
- ✅ Interactive elements (cards, activities)
- ✅ Responsive behavior across viewports
- ✅ Performance standards compliance
- ✅ Accessibility standards
- ✅ Error state handling

### 4. Excel Import Tests (`import-export/excel-import.spec.ts`)

**Coverage:**
- File upload (drag/drop and input)
- CSV validation and error reporting
- Import progress tracking
- Data transformation and validation
- Error handling and recovery
- Performance with large files
- Mobile file upload

**Key Test Cases:**
- ✅ Import interface display
- ✅ File upload validation
- ✅ CSV data validation with errors
- ✅ Complete import workflow
- ✅ Progress tracking and cancellation
- ✅ Error reporting and download
- ✅ Performance with various file sizes
- ✅ Mobile file upload interface
- ✅ Data integrity preservation

### 5. Mobile Responsiveness (`mobile/mobile-responsiveness.spec.ts`)

**Coverage:**
- iPad portrait and landscape orientations
- Mobile phone compatibility
- Touch interactions
- Responsive layouts
- Navigation patterns
- Form optimization
- Performance on mobile devices

**Key Test Cases:**
- ✅ iPad portrait layout optimization
- ✅ iPad landscape layout adaptation
- ✅ Touch interaction handling
- ✅ Table responsiveness on tablets
- ✅ Form optimization for tablet input
- ✅ Mobile navigation patterns
- ✅ Screen orientation handling
- ✅ Performance on mobile devices
- ✅ Text readability optimization

### 6. Form Validation (`forms/form-validation.spec.ts`)

**Coverage:**
- Required field validation
- Format validation (email, phone, URL)
- Length constraints
- Business rule validation
- Real-time validation
- Cross-field validation
- Accessibility compliance

**Key Test Cases:**
- ✅ Required field validation
- ✅ Email format validation
- ✅ Phone number format validation
- ✅ Website URL validation
- ✅ Field length constraints
- ✅ Real-time validation feedback
- ✅ Cross-field validation rules
- ✅ Form accessibility (ARIA, keyboard navigation)
- ✅ Error message clarity

## Performance Standards

The test suite enforces the following performance standards:

### Page Load Times
- **Dashboard**: < 3 seconds
- **Organizations Page**: < 3 seconds
- **Import Page**: < 2 seconds
- **Form Submission**: < 2 seconds

### API Response Times  
- **Login**: < 2 seconds
- **CRUD Operations**: < 1 second
- **Search**: < 500ms
- **File Upload**: < 5 seconds (per MB)

### Mobile Performance
- **iPad Load Time**: < 5 seconds
- **Mobile Load Time**: < 5 seconds
- **Touch Response**: < 100ms

## Accessibility Standards

Tests verify compliance with:

- **WCAG 2.1 Level AA** guidelines
- **ARIA** labels and roles
- **Keyboard navigation** support
- **Color contrast** ratios
- **Focus management**
- **Screen reader** compatibility

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install
      - run: npm run dev &
      - run: npx playwright test
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Reports and Artifacts

### Generated Reports
- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`
- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/videos/`
- **Traces**: `test-results/traces/`

### Custom Reports
- **Performance Summary**: `test-results/performance-summary.json`
- **Accessibility Report**: `test-results/accessibility-report.json`
- **Test Coverage**: `test-results/coverage-report.html`

## Troubleshooting

### Common Issues

**1. Tests timing out**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000 // 60 seconds
```

**2. Application not ready**  
```bash
# Ensure dev server is running
npm run dev
```

**3. Authentication failures**
```bash
# Check environment variables
echo $TEST_USER_EMAIL
echo $TEST_USER_PASSWORD
```

**4. Flaky tests**
```bash
# Run with retries
npx playwright test --retries=2
```

### Debug Mode

```bash
# Run single test in debug mode
npx playwright test tests/auth/auth.spec.ts --debug

# Run with trace viewer
npx playwright test --trace on
npx playwright show-trace test-results/trace.zip
```

## Contributing

### Adding New Tests

1. **Create test file** in appropriate directory
2. **Follow naming convention**: `feature.spec.ts`
3. **Use Page Object Model** for interactions
4. **Include performance checks** where relevant
5. **Add responsive tests** for UI features
6. **Update documentation**

### Test Writing Guidelines

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    // Act  
    // Assert
  });
});
```

### Code Style

- **TypeScript strict mode** enabled
- **ESLint** for code quality
- **Prettier** for formatting
- **Meaningful test names** describing behavior
- **Page Object Model** for maintainability

## Support

For questions or issues with the test suite:

1. **Check documentation** in `/docs/testing/`
2. **Review test logs** in `test-results/`
3. **Run with debug mode** for detailed output
4. **Check GitHub issues** for known problems

## License

This test suite is part of the KitchenPantry CRM project and follows the same license terms.