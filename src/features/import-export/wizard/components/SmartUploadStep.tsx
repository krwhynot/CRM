import React, { useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImportConfig } from '../hooks/useSmartImport'

interface SmartUploadStepProps {
  file: File | null
  config: ImportConfig
  error: string | null
  warnings: string[]
  onFileUpload: (file: File) => Promise<void>
  onConfigUpdate: (updates: Partial<ImportConfig>) => void
  onDownloadTemplate: () => void
  onClearFile: () => void
  className?: string
}

const FILE_REQUIREMENTS = {
  formats: ['.csv'],
  maxSize: '5MB',
  encoding: 'UTF-8',
  requirements: [
    'Spreadsheet saved as CSV format',
    'First row should contain column headers', 
    'Must include company/organization names',
    'Files up to 5MB accepted',
    'Large files may take a few minutes to process',
  ],
}

export function SmartUploadStep({
  file,
  config,
  error,
  warnings,
  onFileUpload,
  onConfigUpdate,
  onDownloadTemplate,
  onClearFile,
  className,
}: SmartUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [uploadProgress] = React.useState(0)

  // File drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0 && files[0].name.toLowerCase().endsWith('.csv')) {
        await onFileUpload(files[0])
      }
    },
    [onFileUpload]
  )

  // File input handler
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        await onFileUpload(selectedFile)
      }
    },
    [onFileUpload]
  )

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getProcessingEstimate = (bytes: number) => {
    // Rough estimate: 1MB = ~10,000 rows, ~30 seconds processing
    const mbSize = bytes / (1024 * 1024)
    if (mbSize < 0.5) return 'Less than 1 minute'
    if (mbSize < 2) return '1-2 minutes'
    if (mbSize < 5) return '2-5 minutes'
    return '5+ minutes'
  }

  const isLargeFile = file && file.size > 1024 * 1024 // 1MB threshold

  // Auto-set entity type to organization (simplified UX)
  React.useEffect(() => {
    if (config.entityType !== 'organization') {
      onConfigUpdate({ entityType: 'organization' })
    }
  }, [config.entityType, onConfigUpdate])

  return (
    <div className={cn('space-y-3', className)}>

      {/* File Upload Area */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-2">
            {!file ? (
              // Upload Interface
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
                  'min-h-[100px] flex flex-col justify-center',
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-300 hover:border-slate-400'
                )}
              >
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isDragOver ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Upload className="size-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {isDragOver ? 'Drop your file here' : 'Choose your organization data'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop your spreadsheet or browse to select
                    </p>
                  </div>

                  <div className="flex flex-col justify-center gap-2 sm:flex-row">
                    <Button
                      onClick={handleBrowseClick}
                      className="h-8 px-3 text-sm"
                    >
                      <FileSpreadsheet className="mr-2 size-4" />
                      Browse Files
                    </Button>

                    <Button variant="outline" onClick={onDownloadTemplate} className="h-8 px-3 text-sm">
                      <Download className="mr-2 size-4" />
                      Download Template
                    </Button>
                  </div>

                  {/* File Requirements */}
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center justify-center space-x-3 text-xs">
                      <span>Excel or CSV files</span>
                      <span>•</span>
                      <span>Up to {FILE_REQUIREMENTS.maxSize}</span>
                      <span>•</span>
                      <span>Include company names</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // File Preview
              <Card className="bg-success/5/50 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                        <FileText className="size-5 text-success" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-foreground">{file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type || 'CSV file'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="size-4 text-success" />
                          <span className="text-sm text-success">File uploaded successfully</span>
                        </div>
                        {isLargeFile && (
                          <div className="mt-2 flex items-center space-x-2">
                            <AlertCircle className="size-4 text-amber-500" />
                            <span className="text-sm text-amber-600">
                              Large file detected - estimated processing time: {getProcessingEstimate(file.size)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={onClearFile} className="size-8 p-0">
                      <X className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compact AI Enhancement & Requirements */}
      <div className="grid gap-2 md:grid-cols-2">
        {/* AI Enhancement Notice */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="size-4 text-amber-500" />
              <h4 className="text-sm font-medium text-foreground">AI-Enhanced</h4>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Smart mapping & validation
            </p>
          </CardContent>
        </Card>

        {/* File Requirements Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="size-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Requirements</h4>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              CSV • Max 5MB • UTF-8
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Warnings Display */}
      {warnings.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="size-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-1">
              {warnings.map((warning, idx) => (
                <div key={idx} className="text-warning">
                  {warning}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
