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
  FileSpreadsheet
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

const ENTITY_TYPE_OPTIONS = [
  {
    value: 'organization' as const,
    label: 'Organizations',
    description: 'Companies, businesses, distributors',
    icon: '🏢',
    examples: ['Company names', 'Contact info', 'Addresses']
  },
  {
    value: 'contact' as const,
    label: 'Contacts',
    description: 'Individual people within organizations',
    icon: '👤',
    examples: ['First/last names', 'Email addresses', 'Job titles']
  }
]

const FILE_REQUIREMENTS = {
  formats: ['.csv'],
  maxSize: '5MB',
  encoding: 'UTF-8',
  requirements: [
    'CSV format with headers in first row',
    'UTF-8 encoding recommended',
    'Organization name column required',
    'Maximum 5MB file size'
  ]
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
  className
}: SmartUploadStepProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [uploadProgress, _setUploadProgress] = React.useState(0)

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

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0].name.toLowerCase().endsWith('.csv')) {
      await onFileUpload(files[0])
    }
  }, [onFileUpload])

  // File input handler
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await onFileUpload(selectedFile)
    }
  }, [onFileUpload])

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

  return (
    <div className={cn("space-y-6", className)}>
      
      {/* Entity Type Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-card-foreground">
            What type of data are you importing?
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ENTITY_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onConfigUpdate({ entityType: option.value })}
                className={cn(
                  "p-4 border-2 rounded-lg text-left transition-all",
                  "min-h-[120px] touch-manipulation", // iPad optimization
                  "hover:shadow-md active:scale-98",
                  config.entityType === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                )}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-card-foreground">{option.label}</h4>
                      {config.entityType === option.value && (
                        <CheckCircle2 className="size-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {option.examples.map((example, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            
            {!file ? (
              // Upload Interface
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  "min-h-[200px] flex flex-col justify-center",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-slate-300 hover:border-slate-400"
                )}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      isDragOver ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      <Upload className="size-8" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {isDragOver ? 'Drop your CSV file here' : 'Upload your CSV file'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Drag and drop your file here, or click to browse
                    </p>
                  </div>

                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button 
                      onClick={handleBrowseClick}
                      className="h-12 px-6" // iPad touch-friendly
                    >
                      <FileSpreadsheet className="mr-2 size-4" />
                      Browse Files
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={onDownloadTemplate}
                      className="h-12 px-6"
                    >
                      <Download className="mr-2 size-4" />
                      Download Template
                    </Button>
                  </div>

                  {/* File Requirements */}
                  <div className="pt-4 text-xs text-slate-500">
                    <div className="flex items-center justify-center space-x-4 text-xs">
                      <span>Max {FILE_REQUIREMENTS.maxSize}</span>
                      <span>•</span>
                      <span>{FILE_REQUIREMENTS.formats.join(', ')} files</span>
                      <span>•</span>
                      <span>{FILE_REQUIREMENTS.encoding} encoding</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // File Preview
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                        <FileText className="size-5 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-slate-900">{file.name}</h4>
                        <p className="text-sm text-slate-600">
                          {formatFileSize(file.size)} • {file.type || 'CSV file'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="size-4 text-green-600" />
                          <span className="text-sm text-green-700">File uploaded successfully</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearFile}
                      className="size-8 p-0"
                    >
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
                  <span className="text-slate-600">Uploading...</span>
                  <span className="text-slate-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Enhancement Notice */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Sparkles className="mt-0.5 size-5 text-amber-500" />
            <div>
              <h4 className="font-semibold text-slate-900">AI-Enhanced Import</h4>
              <p className="mt-1 text-sm text-slate-700">
                After uploading, our AI will automatically suggest field mappings and validate your data 
                to ensure the best import quality.
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li>• Smart field detection (Company → Organization Name)</li>
                <li>• Data quality validation and suggestions</li>
                <li>• Duplicate detection and handling</li>
                <li>• Confidence scoring for all mappings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Requirements Card */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <h4 className="mb-3 font-medium text-slate-900">File Requirements</h4>
          <div className="space-y-2 text-sm text-slate-700">
            {FILE_REQUIREMENTS.requirements.map((req, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="size-1.5 rounded-full bg-slate-400" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                <div key={idx} className="text-amber-800">{warning}</div>
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