import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import path from 'path';

/**
 * Page Object Model for Import/Export functionality
 * Handles Excel/CSV file imports, progress tracking, error handling, and data validation
 */
export class ImportExportPage extends BasePage {
  // Page header elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly breadcrumb: Locator;
  readonly infoAlert: Locator;
  
  // Import section elements
  readonly importSection: Locator;
  readonly importOrganizationsButton: Locator;
  readonly hideImporterButton: Locator;
  readonly organizationImporter: Locator;
  
  // File upload elements
  readonly fileUploadArea: Locator;
  readonly fileInput: Locator;
  readonly dragDropZone: Locator;
  readonly uploadButton: Locator;
  readonly removeFileButton: Locator;
  readonly selectedFileName: Locator;
  readonly filePreview: Locator;
  
  // Progress tracking
  readonly progressBar: Locator;
  readonly progressText: Locator;
  readonly progressPercentage: Locator;
  readonly cancelImportButton: Locator;
  
  // Data preview and validation
  readonly dataPreviewTable: Locator;
  readonly previewHeaders: Locator;
  readonly previewRows: Locator;
  readonly validationErrors: Locator;
  readonly validationWarnings: Locator;
  readonly fieldMappingSection: Locator;
  
  // Import controls
  readonly proceedButton: Locator;
  readonly cancelButton: Locator;
  readonly skipRowsInput: Locator;
  readonly validateOnlyCheckbox: Locator;
  
  // Import results
  readonly importResultsModal: Locator;
  readonly successCount: Locator;
  readonly errorCount: Locator;
  readonly warningCount: Locator;
  readonly importSummary: Locator;
  readonly downloadErrorsButton: Locator;
  readonly closeResultsButton: Locator;
  
  // Export section elements (future functionality)
  readonly exportSection: Locator;
  readonly exportOrganizationsButton: Locator;
  readonly exportContactsButton: Locator;
  readonly exportFullButton: Locator;
  
  // Import guidelines section
  readonly guidelinesSection: Locator;
  readonly requirementsSection: Locator;
  readonly fileFormatsSection: Locator;
  readonly importProcessSection: Locator;
  
  // Error handling
  readonly importError: Locator;
  readonly networkError: Locator;
  readonly fileTypeError: Locator;
  readonly fileSizeError: Locator;

  constructor(page: Page) {
    super(page);
    
    // Page header
    this.pageTitle = page.locator('h1').filter({ hasText: 'Import/Export' });
    this.pageDescription = page.locator('text=Import organizations from Excel files');
    this.breadcrumb = page.locator('[data-testid="breadcrumb"]');
    this.infoAlert = page.locator('[role="alert"]').filter({ hasText: 'Currently supporting organization imports only' });
    
    // Import section
    this.importSection = page.locator('[data-testid="import-section"]');
    this.importOrganizationsButton = page.locator('text=Import Organizations');
    this.hideImporterButton = page.locator('text=Hide Importer');
    this.organizationImporter = page.locator('[data-testid="organization-importer"]');
    
    // File upload
    this.fileUploadArea = page.locator('[data-testid="file-upload-area"]');
    this.fileInput = page.locator('input[type="file"]');
    this.dragDropZone = page.locator('[data-testid="drag-drop-zone"]');
    this.uploadButton = page.locator('[data-testid="upload-button"]');
    this.removeFileButton = page.locator('[data-testid="remove-file-button"]');
    this.selectedFileName = page.locator('[data-testid="selected-file-name"]');
    this.filePreview = page.locator('[data-testid="file-preview"]');
    
    // Progress tracking
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.progressText = page.locator('[data-testid="progress-text"]');
    this.progressPercentage = page.locator('[data-testid="progress-percentage"]');
    this.cancelImportButton = page.locator('[data-testid="cancel-import-button"]');
    
    // Data preview and validation
    this.dataPreviewTable = page.locator('[data-testid="data-preview-table"]');
    this.previewHeaders = this.dataPreviewTable.locator('thead th');
    this.previewRows = this.dataPreviewTable.locator('tbody tr');
    this.validationErrors = page.locator('[data-testid="validation-errors"]');
    this.validationWarnings = page.locator('[data-testid="validation-warnings"]');
    this.fieldMappingSection = page.locator('[data-testid="field-mapping"]');
    
    // Import controls
    this.proceedButton = page.locator('[data-testid="proceed-import-button"]');
    this.cancelButton = page.locator('[data-testid="cancel-import-button"]');
    this.skipRowsInput = page.locator('[data-testid="skip-rows-input"]');
    this.validateOnlyCheckbox = page.locator('[data-testid="validate-only-checkbox"]');
    
    // Import results
    this.importResultsModal = page.locator('[data-testid="import-results-modal"]');
    this.successCount = page.locator('[data-testid="success-count"]');
    this.errorCount = page.locator('[data-testid="error-count"]');
    this.warningCount = page.locator('[data-testid="warning-count"]');
    this.importSummary = page.locator('[data-testid="import-summary"]');
    this.downloadErrorsButton = page.locator('[data-testid="download-errors-button"]');
    this.closeResultsButton = page.locator('[data-testid="close-results-button"]');
    
    // Export section
    this.exportSection = page.locator('[data-testid="export-section"]');
    this.exportOrganizationsButton = page.locator('text=Export Organizations');
    this.exportContactsButton = page.locator('text=Export Contacts');
    this.exportFullButton = page.locator('text=Export All Data');
    
    // Guidelines section
    this.guidelinesSection = page.locator('[data-testid="import-guidelines"]');
    this.requirementsSection = page.locator('text=Organization Import Requirements');
    this.fileFormatsSection = page.locator('text=Supported File Formats');
    this.importProcessSection = page.locator('text=Import Process');
    
    // Error handling
    this.importError = page.locator('[data-testid="import-error"]');
    this.networkError = page.locator('[data-testid="network-error"]');
    this.fileTypeError = page.locator('[data-testid="file-type-error"]');
    this.fileSizeError = page.locator('[data-testid="file-size-error"]');
  }

  /**
   * Navigate to import/export page
   */
  async goToImportExport() {
    await this.goto('/import-export');
    await this.waitForImportExportLoad();
  }

  /**
   * Wait for import/export page to fully load
   */
  async waitForImportExportLoad() {
    await this.waitForPageLoad();
    await this.pageTitle.waitFor({ state: 'visible' });
    await this.importSection.waitFor({ state: 'visible' });
    await this.exportSection.waitFor({ state: 'visible' });
  }

  /**
   * Show organization importer
   */
  async showOrganizationImporter() {
    await this.importOrganizationsButton.click();
    await this.organizationImporter.waitFor({ state: 'visible' });
  }

  /**
   * Hide organization importer
   */
  async hideOrganizationImporter() {
    await this.hideImporterButton.click();
    await this.organizationImporter.waitFor({ state: 'hidden' });
  }

  /**
   * Upload file using file input
   */
  async uploadFile(filePath: string) {
    await this.showOrganizationImporter();
    
    // Set the file input
    await this.fileInput.setInputFiles(filePath);
    
    // Wait for file to be processed
    await this.selectedFileName.waitFor({ state: 'visible' });
    
    // Verify file name is displayed
    const fileName = path.basename(filePath);
    await expect(this.selectedFileName).toContainText(fileName);
  }

  /**
   * Upload file using drag and drop
   */
  async dragAndDropFile(filePath: string) {
    await this.showOrganizationImporter();
    
    // Create a data transfer with the file
    const dataTransfer = await this.page.evaluateHandle((filePath) => {
      const dt = new DataTransfer();
      // Note: In real tests, you might need to create an actual File object
      return dt;
    }, filePath);

    // Perform drag and drop
    await this.dragDropZone.dispatchEvent('dragover', { dataTransfer });
    await this.dragDropZone.dispatchEvent('drop', { dataTransfer });
    
    // Wait for file processing
    await this.selectedFileName.waitFor({ state: 'visible' });
  }

  /**
   * Remove uploaded file
   */
  async removeUploadedFile() {
    await this.removeFileButton.click();
    await this.selectedFileName.waitFor({ state: 'hidden' });
  }

  /**
   * Get file preview data
   */
  async getFilePreviewData() {
    await this.filePreview.waitFor({ state: 'visible' });
    
    const headers = await this.previewHeaders.allTextContents();
    const rows = [];
    const rowCount = await this.previewRows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = this.previewRows.nth(i);
      const cells = await row.locator('td').allTextContents();
      rows.push(cells);
    }
    
    return { headers, rows, totalRows: rowCount };
  }

  /**
   * Get validation errors and warnings
   */
  async getValidationResults() {
    const hasErrors = await this.validationErrors.isVisible();
    const hasWarnings = await this.validationWarnings.isVisible();
    
    let errors = [];
    let warnings = [];
    
    if (hasErrors) {
      errors = await this.validationErrors.locator('li').allTextContents();
    }
    
    if (hasWarnings) {
      warnings = await this.validationWarnings.locator('li').allTextContents();
    }
    
    return { hasErrors, hasWarnings, errors, warnings };
  }

  /**
   * Proceed with import after validation
   */
  async proceedWithImport() {
    await this.proceedButton.click();
    
    // Wait for import to start
    await this.progressBar.waitFor({ state: 'visible' });
  }

  /**
   * Cancel import process
   */
  async cancelImport() {
    await this.cancelImportButton.click();
    
    // Wait for cancellation confirmation
    await this.progressBar.waitFor({ state: 'hidden' });
  }

  /**
   * Monitor import progress
   */
  async monitorImportProgress() {
    const progressData = [];
    
    // Monitor progress until completion
    while (await this.progressBar.isVisible()) {
      const progressText = await this.progressText.textContent();
      const progressPercent = await this.progressPercentage.textContent();
      
      progressData.push({
        text: progressText?.trim(),
        percentage: progressPercent?.trim(),
        timestamp: Date.now()
      });
      
      // Wait a bit before next check
      await this.page.waitForTimeout(100);
    }
    
    return progressData;
  }

  /**
   * Get import results
   */
  async getImportResults() {
    await this.importResultsModal.waitFor({ state: 'visible' });
    
    const successCountText = await this.successCount.textContent();
    const errorCountText = await this.errorCount.textContent();
    const warningCountText = await this.warningCount.textContent();
    const summaryText = await this.importSummary.textContent();
    
    return {
      successCount: parseInt(successCountText?.match(/\d+/)?.[0] || '0', 10),
      errorCount: parseInt(errorCountText?.match(/\d+/)?.[0] || '0', 10),
      warningCount: parseInt(warningCountText?.match(/\d+/)?.[0] || '0', 10),
      summary: summaryText?.trim()
    };
  }

  /**
   * Download error report
   */
  async downloadErrorReport() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadErrorsButton.click();
    const download = await downloadPromise;
    
    return {
      fileName: download.suggestedFilename(),
      path: await download.path()
    };
  }

  /**
   * Close import results modal
   */
  async closeImportResults() {
    await this.closeResultsButton.click();
    await this.importResultsModal.waitFor({ state: 'hidden' });
  }

  /**
   * Complete import workflow with file
   */
  async performCompleteImport(filePath: string) {
    // Upload file
    await this.uploadFile(filePath);
    
    // Wait for validation
    await this.page.waitForTimeout(2000);
    
    // Get validation results
    const validation = await this.getValidationResults();
    
    // Proceed only if no critical errors
    if (!validation.hasErrors) {
      await this.proceedWithImport();
      
      // Monitor progress
      const progress = await this.monitorImportProgress();
      
      // Get final results
      const results = await this.getImportResults();
      
      return { validation, progress, results };
    }
    
    return { validation, progress: [], results: null };
  }

  /**
   * Test file upload validation
   */
  async testFileUploadValidation() {
    await this.showOrganizationImporter();
    
    const testCases = [
      {
        name: 'Invalid file type',
        filePath: await this.createTestFile('test.txt', 'Invalid file content'),
        expectedError: 'file type'
      },
      {
        name: 'Large file size',
        filePath: await this.createLargeTestFile(),
        expectedError: 'file size'
      },
      {
        name: 'Empty file',
        filePath: await this.createTestFile('empty.csv', ''),
        expectedError: 'empty file'
      }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      try {
        await this.uploadFile(testCase.filePath);
        
        // Wait for error message
        await this.importError.waitFor({ state: 'visible', timeout: 5000 });
        
        const errorText = await this.importError.textContent();
        
        results.push({
          testCase: testCase.name,
          errorShown: true,
          errorText: errorText?.toLowerCase().includes(testCase.expectedError.toLowerCase())
        });
        
        // Clear the error for next test
        await this.removeUploadedFile();
        
      } catch (error) {
        results.push({
          testCase: testCase.name,
          errorShown: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Test CSV data validation
   */
  async testDataValidation() {
    // Create test CSV with various validation scenarios
    const csvContent = `Name,Type,Industry,Description,Email,Phone
Valid Organization,principal,Food Service,Valid description,valid@email.com,123-456-7890
,customer,Retail,Missing name,test@email.com,123-456-7890
Invalid Email Org,vendor,Technology,Has invalid email,invalid-email,123-456-7890
Duplicate Name,principal,Food Service,First duplicate,test1@email.com,123-456-7890
Duplicate Name,customer,Retail,Second duplicate,test2@email.com,987-654-3210`;
    
    const testFilePath = await this.createTestFile('validation_test.csv', csvContent);
    
    await this.uploadFile(testFilePath);
    
    // Wait for validation to complete
    await this.page.waitForTimeout(2000);
    
    const validation = await this.getValidationResults();
    const previewData = await this.getFilePreviewData();
    
    return { validation, previewData };
  }

  /**
   * Test import progress cancellation
   */
  async testImportCancellation(filePath: string) {
    await this.uploadFile(filePath);
    await this.proceedWithImport();
    
    // Wait for import to start
    await this.progressBar.waitFor({ state: 'visible' });
    
    // Cancel after a short delay
    await this.page.waitForTimeout(1000);
    await this.cancelImport();
    
    // Verify cancellation
    const wasCancelled = await this.progressBar.isHidden();
    
    return { wasCancelled };
  }

  /**
   * Verify import guidelines content
   */
  async verifyImportGuidelines() {
    await expect(this.guidelinesSection).toBeVisible();
    await expect(this.requirementsSection).toBeVisible();
    await expect(this.fileFormatsSection).toBeVisible();
    await expect(this.importProcessSection).toBeVisible();
    
    // Check specific requirements
    const requirementsText = await this.requirementsSection.locator('..').textContent();
    expect(requirementsText).toContain('Required columns: Name, Type');
    expect(requirementsText).toContain('File size limit: 5MB');
    expect(requirementsText).toContain('Maximum 1,000 rows');
  }

  /**
   * Test responsive import interface
   */
  async testResponsiveImportInterface() {
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];
    
    const results = [];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500);
      
      await this.showOrganizationImporter();
      
      const isMobileView = viewport.width < 768;
      const dragDropVisible = await this.dragDropZone.isVisible();
      const uploadButtonVisible = await this.uploadButton.isVisible();
      
      results.push({
        viewport,
        isMobileView,
        dragDropVisible,
        uploadButtonVisible
      });
      
      await this.hideOrganizationImporter();
    }
    
    return results;
  }

  /**
   * Helper: Create test file
   */
  private async createTestFile(fileName: string, content: string): Promise<string> {
    const testFilePath = path.join(process.cwd(), 'test-results', fileName);
    const fs = await import('fs/promises');
    
    await fs.writeFile(testFilePath, content);
    
    return testFilePath;
  }

  /**
   * Helper: Create large test file (for size validation)
   */
  private async createLargeTestFile(): Promise<string> {
    const fileName = 'large_test.csv';
    const testFilePath = path.join(process.cwd(), 'test-results', fileName);
    
    // Create a CSV with many rows to exceed size limit
    let content = 'Name,Type,Industry,Description\n';
    
    for (let i = 0; i < 10000; i++) {
      content += `Organization ${i},customer,Food Service,Description for organization ${i}\n`;
    }
    
    const fs = await import('fs/promises');
    await fs.writeFile(testFilePath, content);
    
    return testFilePath;
  }

  /**
   * Cleanup test files
   */
  async cleanupTestFiles() {
    const testDir = path.join(process.cwd(), 'test-results');
    const fs = await import('fs/promises');
    
    try {
      const files = await fs.readdir(testDir);
      const testFiles = files.filter(file => 
        file.includes('test') && (file.endsWith('.csv') || file.endsWith('.txt'))
      );
      
      for (const file of testFiles) {
        await fs.unlink(path.join(testDir, file));
      }
    } catch {
      // Directory might not exist or no files to clean
    }
  }
}