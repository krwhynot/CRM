import React, { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileSpreadsheet,
  AlertCircle,
  X,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  onDrop
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-4">
      {/* Download Template Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
          <Download className="mr-2 size-4" />
          Download Template
        </Button>
      </div>

      {/* Drag and Drop Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          file && "border-green-500 bg-green-50"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-gray-100">
            <FileSpreadsheet className="size-6 text-gray-600" />
          </div>
          
          {file ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-700">
                File selected: {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Size: {(file.size / 1024).toFixed(1)} KB
              </p>
              <Button variant="outline" size="sm" onClick={onReset}>
                <X className="mr-2 size-4" />
                Remove File
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Drag and drop your CSV file here, or{' '}
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-700"
                  onClick={handleBrowseClick}
                >
                  browse to upload
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
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