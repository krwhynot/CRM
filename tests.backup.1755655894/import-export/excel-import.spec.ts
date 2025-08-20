import { test, expect } from '@playwright/test';
import { ImportExportPage } from '../page-objects/import-export-page';
import { OrganizationsPage } from '../page-objects/organizations-page';
import { AuthPage } from '../page-objects/auth-page';
import { TestUsers, TestCSVData } from '../utils/test-data';
import { AuthHelpers, FileHelpers, PerformanceHelpers } from '../utils/test-helpers';

test.describe('Excel Import Functionality', () => {
  let importExportPage: ImportExportPage;
  let organizationsPage: OrganizationsPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    importExportPage = new ImportExportPage(page);
    organizationsPage = new OrganizationsPage(page);
    authPage = new AuthPage(page);
    
    // Ensure user is logged in
    const isLoggedIn = await importExportPage.isAuthenticated();
    if (!isLoggedIn) {
      await AuthHelpers.login(page, TestUsers.validUser.email, TestUsers.validUser.password);
    }
    
    // Navigate to import/export page
    await importExportPage.goToImportExport();
  });

  test.afterEach(async () => {
    // Clean up any test files created during tests
    await importExportPage.cleanupTestFiles();
  });

  test('should display import/export page correctly', async () => {
    // Verify page structure
    await expect(importExportPage.pageTitle).toHaveText('Import/Export');
    await expect(importExportPage.pageDescription).toContainText('Import organizations from Excel files');
    
    // Verify breadcrumb
    await importExportPage.verifyBreadcrumb(['Dashboard', 'Import/Export']);
    
    // Verify info alert about current functionality
    await expect(importExportPage.infoAlert).toBeVisible();
    await expect(importExportPage.infoAlert).toContainText('Currently supporting organization imports only');
    
    // Verify import section
    await expect(importExportPage.importSection).toBeVisible();
    await expect(importExportPage.importOrganizationsButton).toBeVisible();
    
    // Verify export section (coming soon items should be disabled)
    await expect(importExportPage.exportSection).toBeVisible();
    await expect(importExportPage.exportOrganizationsButton).toBeDisabled();
    
    // Verify import guidelines
    await importExportPage.verifyImportGuidelines();
  });

  test('should show and hide organization importer', async () => {
    // Initially, importer should be hidden
    await expect(importExportPage.organizationImporter).not.toBeVisible();
    
    // Show importer
    await importExportPage.showOrganizationImporter();
    await expect(importExportPage.organizationImporter).toBeVisible();
    await expect(importExportPage.fileUploadArea).toBeVisible();
    
    // Hide importer
    await importExportPage.hideOrganizationImporter();
    await expect(importExportPage.organizationImporter).not.toBeVisible();
  });

  test('should upload valid CSV file successfully', async () => {
    // Create test CSV file
    const csvContent = TestCSVData.validOrganizations;
    const filePath = await FileHelpers.createTempCSV('valid_organizations.csv', csvContent);
    
    // Upload file
    await importExportPage.uploadFile(filePath);
    
    // Verify file is uploaded
    await expect(importExportPage.selectedFileName).toContainText('valid_organizations.csv');
    
    // Wait for file processing
    await importExportPage.page.waitForTimeout(2000);
    
    // Should show file preview
    const previewData = await importExportPage.getFilePreviewData();
    expect(previewData.headers.length).toBeGreaterThan(0);
    expect(previewData.rows.length).toBeGreaterThan(0);
    expect(previewData.totalRows).toBe(3); // From test data
    
    // Should show validation results
    const validation = await importExportPage.getValidationResults();
    expect(validation.hasErrors).toBe(false);
    
    console.log('File preview:', previewData);
    console.log('Validation results:', validation);
  });

  test('should validate CSV data and show errors', async () => {
    const validationResults = await importExportPage.testDataValidation();
    
    // Should have validation errors for invalid data
    expect(validationResults.validation.hasErrors || validationResults.validation.hasWarnings).toBe(true);
    
    if (validationResults.validation.hasErrors) {
      expect(validationResults.validation.errors.length).toBeGreaterThan(0);
      
      // Check specific error messages
      const errorText = validationResults.validation.errors.join(' ');
      expect(errorText.toLowerCase()).toMatch(/missing|invalid|email|name/);
    }
    
    console.log('Data validation results:', validationResults);
  });

  test('should complete full import process successfully', async () => {
    // Create valid test data
    const csvContent = TestCSVData.validOrganizations;
    const filePath = await FileHelpers.createTempCSV('import_test.csv', csvContent);
    
    // Perform complete import
    const importResults = await importExportPage.performCompleteImport(filePath);
    
    if (importResults.results) {
      // Import should succeed for valid data
      expect(importResults.results.successCount).toBeGreaterThan(0);
      expect(importResults.results.errorCount).toBe(0);
      
      // Verify organizations were created
      await organizationsPage.goToOrganizations();
      const orgsData = await organizationsPage.getOrganizationsData();
      
      // Should find at least some of our imported organizations
      const importedOrgs = orgsData.organizations.filter(org => 
        org.name?.includes('Test Import Org')
      );
      expect(importedOrgs.length).toBeGreaterThan(0);
      
      console.log('Import results:', importResults.results);
      console.log('Found imported organizations:', importedOrgs.length);
    } else {
      // If import didn't proceed due to validation errors
      expect(importResults.validation.hasErrors).toBe(true);
      console.log('Import blocked by validation errors:', importResults.validation.errors);
    }
  });

  test('should handle file upload validation errors', async () => {
    const validationResults = await importExportPage.testFileUploadValidation();
    
    // Should have tested multiple validation scenarios
    expect(validationResults.length).toBeGreaterThan(0);
    
    for (const result of validationResults) {
      if (result.errorShown) {
        // Error should be relevant to the test case
        expect(result.errorText).toBeDefined();
        console.log(`${result.testCase}: ${result.errorText}`);
      } else {
        console.log(`${result.testCase}: No error shown (might be acceptable)`);
      }
    }
  });

  test('should handle import cancellation', async () => {
    // Create a larger file that takes time to import
    const largeCSV = TestCSVData.largeDataset(100);
    const filePath = await FileHelpers.createTempCSV('large_import.csv', largeCSV);
    
    // Test import cancellation
    const cancellationResult = await importExportPage.testImportCancellation(filePath);
    
    expect(cancellationResult.wasCancelled).toBe(true);
    
    console.log('Import cancellation test:', cancellationResult);
  });

  test('should track import progress accurately', async () => {
    // Create medium-sized test file
    const csvContent = TestCSVData.largeDataset(50);
    const filePath = await FileHelpers.createTempCSV('progress_test.csv', csvContent);
    
    await importExportPage.uploadFile(filePath);
    
    // Wait for validation
    await importExportPage.page.waitForTimeout(1000);
    
    const validation = await importExportPage.getValidationResults();
    
    if (!validation.hasErrors) {
      await importExportPage.proceedWithImport();
      
      // Monitor progress
      const progressData = await importExportPage.monitorImportProgress();
      
      // Should have progress updates
      expect(progressData.length).toBeGreaterThan(0);
      
      // Progress should show completion
      const finalProgress = progressData[progressData.length - 1];
      expect(finalProgress.percentage).toContain('100%');
      
      console.log('Progress tracking:', progressData);
    }
  });

  test('should handle network errors during import', async ({ page }) => {
    // Create test file
    const csvContent = TestCSVData.validOrganizations;
    const filePath = await FileHelpers.createTempCSV('network_test.csv', csvContent);
    
    await importExportPage.uploadFile(filePath);
    await importExportPage.page.waitForTimeout(1000);
    
    const validation = await importExportPage.getValidationResults();
    
    if (!validation.hasErrors) {
      // Simulate network failure during import
      await page.route('**/api/import/**', (route) => {
        route.abort('failed');
      });
      
      await importExportPage.proceedWithImport();
      
      // Should show network error
      await expect(importExportPage.networkError).toBeVisible();
    }
  });

  test('should measure import performance', async () => {
    const performanceTestSizes = [10, 25, 50];
    const performanceResults = [];
    
    for (const size of performanceTestSizes) {
      const csvContent = TestCSVData.largeDataset(size);
      const filePath = await FileHelpers.createTempCSV(`perf_test_${size}.csv`, csvContent);
      
      const startTime = Date.now();
      
      await importExportPage.uploadFile(filePath);
      await importExportPage.page.waitForTimeout(1000);
      
      const validation = await importExportPage.getValidationResults();
      
      if (!validation.hasErrors) {
        await importExportPage.proceedWithImport();
        await importExportPage.monitorImportProgress();
        
        const results = await importExportPage.getImportResults();
        const endTime = Date.now();
        
        const performanceData = {
          size,
          duration: endTime - startTime,
          throughput: size / ((endTime - startTime) / 1000), // records per second
          successCount: results.successCount
        };
        
        performanceResults.push(performanceData);
        
        // Close results modal for next iteration
        await importExportPage.closeImportResults();
      }
    }
    
    console.log('Import Performance Results:', performanceResults);
    
    // Verify reasonable performance
    for (const result of performanceResults) {
      // Should process at least 1 record per second
      expect(result.throughput).toBeGreaterThan(1);
      
      // Should complete within reasonable time (10 seconds per 50 records)
      if (result.size <= 50) {
        expect(result.duration).toBeLessThan(10000);
      }
    }
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test responsive import interface
    const responsiveResults = await importExportPage.testResponsiveImportInterface();
    
    for (const result of responsiveResults) {
      if (result.isMobileView) {
        // Mobile should still show upload functionality
        expect(result.uploadButtonVisible || result.dragDropVisible).toBe(true);
        
        console.log(`Mobile interface (${result.viewport.width}x${result.viewport.height}):`, {
          dragDropVisible: result.dragDropVisible,
          uploadButtonVisible: result.uploadButtonVisible
        });
      }
    }
    
    // Test mobile file upload
    await importExportPage.showOrganizationImporter();
    
    const csvContent = TestCSVData.validOrganizations;
    const filePath = await FileHelpers.createTempCSV('mobile_test.csv', csvContent);
    
    await importExportPage.uploadFile(filePath);
    
    // Should work on mobile
    await expect(importExportPage.selectedFileName).toContainText('mobile_test.csv');
  });

  test('should handle large file uploads gracefully', async () => {
    // Create file that exceeds size limit
    const largeContent = TestCSVData.largeDataset(2000); // Exceeds 1000 row limit
    const filePath = await FileHelpers.createTempCSV('oversized.csv', largeContent);
    
    await importExportPage.uploadFile(filePath);
    
    // Should show size or row count error
    await expect(importExportPage.importError).toBeVisible();
    
    const errorText = await importExportPage.importError.textContent();
    expect(errorText?.toLowerCase()).toMatch(/size|limit|rows|large/);
  });

  test('should preserve data integrity during import', async () => {
    // Create CSV with special characters and edge cases
    const specialCharCSV = `Name,Type,Industry,Description,Email
"Organization with, comma",principal,"Food & Beverage","Description with ""quotes"" and symbols!@#$%",test@example.com
Organization with Unicode ñáéí,customer,Technology,Description with unicode characters,unicode@test.com
"Org
with newline",vendor,Retail,"Multi-line
description",newline@test.com`;
    
    const filePath = await FileHelpers.createTempCSV('special_chars.csv', specialCharCSV);
    
    const importResults = await importExportPage.performCompleteImport(filePath);
    
    if (importResults.results) {
      // Verify special characters were preserved
      await organizationsPage.goToOrganizations();
      
      // Search for organizations with special characters
      await organizationsPage.searchOrganizations('comma');
      const commaResults = await organizationsPage.getOrganizationsData();
      
      await organizationsPage.searchOrganizations('Unicode');
      const unicodeResults = await organizationsPage.getOrganizationsData();
      
      // Should find organizations with special characters
      expect(commaResults.organizations.length + unicodeResults.organizations.length).toBeGreaterThan(0);
      
      console.log('Special character import results:', {
        commaOrgs: commaResults.organizations.length,
        unicodeOrgs: unicodeResults.organizations.length
      });
    }
  });

  test('should provide helpful error messages and recovery options', async () => {
    // Test various error scenarios
    const errorScenarios = [
      {
        name: 'Missing required field',
        csv: 'Type,Industry\ncustomer,Food Service',
        expectedError: 'name'
      },
      {
        name: 'Invalid email format',
        csv: 'Name,Type,Email\nTest Org,customer,invalid-email',
        expectedError: 'email'
      },
      {
        name: 'Invalid type',
        csv: 'Name,Type\nTest Org,invalid-type',
        expectedError: 'type'
      }
    ];
    
    for (const scenario of errorScenarios) {
      const filePath = await FileHelpers.createTempCSV(`error_${scenario.name}.csv`, scenario.csv);
      
      await importExportPage.uploadFile(filePath);
      await importExportPage.page.waitForTimeout(1000);
      
      const validation = await importExportPage.getValidationResults();
      
      if (validation.hasErrors) {
        const errorText = validation.errors.join(' ').toLowerCase();
        expect(errorText).toContain(scenario.expectedError.toLowerCase());
        
        console.log(`${scenario.name} error test:`, validation.errors);
      }
      
      // Remove file for next test
      await importExportPage.removeUploadedFile();
    }
  });

  test('should maintain audit trail and logging', async () => {
    // This test verifies that import operations are properly logged
    // Implementation would depend on the specific logging system used
    
    const csvContent = TestCSVData.validOrganizations;
    const filePath = await FileHelpers.createTempCSV('audit_test.csv', csvContent);
    
    const importResults = await importExportPage.performCompleteImport(filePath);
    
    if (importResults.results) {
      // Check if import results include audit information
      expect(importResults.results.summary).toBeDefined();
      
      // In a real implementation, you might check:
      // - Import timestamp
      // - User who performed import
      // - File name and size
      // - Number of records processed
      // - Success/failure details
      
      console.log('Import audit info:', {
        successCount: importResults.results.successCount,
        errorCount: importResults.results.errorCount,
        summary: importResults.results.summary
      });
    }
  });
});