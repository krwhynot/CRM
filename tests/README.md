# CRM UI Testing Guide

## Quick Start

To run the comprehensive Interactions page UI tests:

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Set Up Test Authentication**
   - Create a test user account or use existing credentials
   - Update credentials in `interactions-ui-tests.js`:
   ```javascript
   testCredentials: {
     email: 'your-test-email@example.com',
     password: 'YourTestPassword123'
   }
   ```

3. **Install Playwright (if not already installed)**
   ```bash
   npm install playwright
   npx playwright install
   ```

4. **Run Tests**
   ```bash
   node tests/interactions-ui-tests.js
   ```

## Test Coverage

The test suite covers:
- ✅ Page navigation and loading
- ✅ Mobile responsiveness (Desktop, iPad, Mobile)
- ✅ Form validation (empty fields, invalid data, length limits)
- ✅ Touch interactions and mobile usability
- ✅ Table responsiveness across screen sizes
- ✅ Edge cases and security testing

## Expected Results

- **Screenshots:** Saved to `./test-screenshots/`
- **Test Results:** Saved to `./test-results.json`
- **Console Output:** Real-time test progress and results

## Troubleshooting

### Authentication Issues
If tests fail on authentication:
1. Verify development server is running on http://localhost:5173
2. Check test credentials are valid
3. Ensure user account exists in Supabase

### Test Element Not Found
If tests fail to find elements:
1. Add `data-testid` attributes to components
2. Update selectors in test file
3. Check element names match component implementation

## Test Data Requirements

For complete testing, ensure test database has:
- At least 1 organization
- At least 1 contact linked to organization
- At least 1 opportunity linked to organization
- Test interactions for table display testing

## Manual Testing Checklist

While automated tests are running, manually verify:
- [ ] Form scrolling behavior on mobile
- [ ] Touch feedback on buttons and inputs
- [ ] Keyboard navigation (tab order)
- [ ] Screen reader compatibility
- [ ] Performance with large datasets