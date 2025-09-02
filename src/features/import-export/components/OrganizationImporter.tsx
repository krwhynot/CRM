import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import { FileUploadArea } from './FileUploadArea'
import { DataPreviewTable } from './DataPreviewTable'
import { ImportProgress } from './ImportProgress'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useImportProgress } from '../hooks/useImportProgress'

export function OrganizationImporter() {
  // Use extracted hooks for state management
  const fileUpload = useFileUpload()
  const importProgress = useImportProgress()

  // Handle combined reset
  const handleReset = () => {
    fileUpload.resetUpload()
    importProgress.resetImport()
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5 text-blue-600" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadArea
            file={fileUpload.uploadState.file}
            isDragOver={fileUpload.uploadState.isDragOver}
            isUploading={fileUpload.uploadState.isUploading}
            uploadProgress={fileUpload.uploadState.uploadProgress}
            error={fileUpload.uploadState.error || importProgress.importState.error}
            onFileSelect={fileUpload.handleFileSelect}
            onReset={handleReset}
            onDownloadTemplate={fileUpload.downloadTemplate}
            onDragOver={fileUpload.handleDragOver}
            onDragLeave={fileUpload.handleDragLeave}
            onDrop={fileUpload.handleDrop}
          />
        </CardContent>
      </Card>

      {/* Data Preview and Import Progress */}
      {fileUpload.uploadState.parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">File Processed Successfully</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <DataPreviewTable parsedData={fileUpload.uploadState.parsedData} />

              <ImportProgress
                isImporting={importProgress.importState.isImporting}
                importProgress={importProgress.importState.importProgress}
                importResult={importProgress.importState.importResult}
                validRowsCount={fileUpload.uploadState.parsedData.validRows.length}
                onImport={() =>
                  importProgress.importOrganizations(fileUpload.uploadState.parsedData!.validRows)
                }
                onReset={handleReset}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
