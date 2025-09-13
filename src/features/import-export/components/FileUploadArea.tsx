import React, { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileSpreadsheet, AlertCircle, X, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius, fontWeight } from '@/styles/tokens'

interface FileUploadAreaProps {
  file: File | null
  isDragOver: boolean
  isUploading: boolean
  uploadProgress: number
  error: string | null
  onFileSelect: (file: File) => void
  onReset: () => void
  onDownloadTemplate: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export function FileUploadArea({
  file,
  isDragOver,
  isUploading,
  uploadProgress,
  error,
  onFileSelect,
  onReset,
  onDownloadTemplate,
  onDragOver,
  onDragLeave,
  onDrop,
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onFileSelect(files[0])
      }
    },
    [onFileSelect]
  )

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={semanticSpacing.layoutContainer}>
      {/* Download Template Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
          <Download className={`${semanticSpacing.rightGap.xs} size-4`} />
          Download Template
        </Button>
      </div>

      {/* Drag and Drop Area */}
      <div
        className={cn(
          `border-2 border-dashed ${semanticRadius.lg} text-center transition-colors`,
          semanticSpacing.layoutPadding.xxl,
          isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-border/60',
          file && 'border-success bg-success/5'
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={semanticSpacing.layoutContainer}>
          <div
            className={`mx-auto flex size-12 items-center justify-center ${semanticRadius.lg} bg-muted`}
          >
            <FileSpreadsheet className="size-6 text-muted-foreground" />
          </div>

          {file ? (
            <div className={semanticSpacing.stack.xs}>
              <p className={`${semanticTypography.body} ${fontWeight.medium} text-success`}>
                File selected: {file.name}
              </p>
              <p className={`${semanticTypography.caption} text-muted-foreground`}>
                Size: {(file.size / 1024).toFixed(1)} KB
              </p>
              <Button variant="outline" size="sm" onClick={onReset}>
                <X className={`${semanticSpacing.rightGap.xs} size-4`} />
                Remove File
              </Button>
            </div>
          ) : (
            <div className={semanticSpacing.stack.xs}>
              <p className={`${semanticTypography.caption} text-muted-foreground`}>
                Drag and drop your CSV file here, or{' '}
                <button
                  type="button"
                  className={`${fontWeight.medium} text-primary hover:text-primary/80`}
                  onClick={handleBrowseClick}
                >
                  browse to upload
                </button>
              </p>
              <p className={`${semanticTypography.detail} text-muted-foreground`}>
                Supports CSV files up to 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className={`${semanticSpacing.stack.xs}`}>
          <div className={`flex items-center justify-between ${semanticTypography.caption}`}>
            <span>Processing file...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
