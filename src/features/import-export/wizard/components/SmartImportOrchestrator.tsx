import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { SmartImportWizard, getNextStep } from './SmartImportWizard'
import { SmartUploadStep } from './SmartUploadStep'
import { SmartFieldMapping } from './SmartFieldMapping'
import { SmartPreviewStep } from './SmartPreviewStep'
import { useSmartImport } from '../hooks/useSmartImport'
import { useFileUpload } from '@/hooks/useFileUpload' // For template download
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SmartImportOrchestratorProps {
  onImportComplete?: (result: { success: boolean; imported: number; failed: number }) => void
  onCancel?: () => void
  className?: string
}

export function SmartImportOrchestrator({
  onImportComplete,
  onCancel,
  className
}: SmartImportOrchestratorProps) {
  
  const { state, actions } = useSmartImport()
  const { downloadTemplate } = useFileUpload() // Reuse existing template logic

  // Auto-generate AI mappings when file is uploaded
  useEffect(() => {
    if (state.parsedData && state.fieldMappings.length > 0 && !state.aiMappingResponse) {
      actions.generateAIMappings()
    }
  }, [state.parsedData, state.fieldMappings, state.aiMappingResponse, actions])

  // Handle import completion
  useEffect(() => {
    if (state.importResult && onImportComplete) {
      onImportComplete(state.importResult)
    }
  }, [state.importResult, onImportComplete])

  // Navigation helpers
  const canGoNext = () => {
    switch (state.currentStep) {
      case 'upload':
        return !!state.file && !!state.parsedData
      case 'map':
        return state.fieldMappings.filter(m => m.status === 'needs_review').length === 0 &&
               state.fieldMappings.some(m => m.crmField && m.status !== 'skipped')
      case 'preview':
        return !state.validationResults || state.validationResults.summary.errorRows === 0
      case 'import':
        return false // Can't go forward from import step
      case 'complete':
        return false
      default:
        return false
    }
  }

  const canGoPrevious = () => {
    return state.currentStep !== 'upload' && state.currentStep !== 'complete'
  }

  const handleNext = () => {
    const nextStep = getNextStep(state.currentStep)
    if (nextStep) {
      // Auto-run validation when entering preview step
      if (nextStep === 'preview') {
        actions.validateData()
        actions.checkDuplicates()
      }
      // Start import when entering import step
      if (nextStep === 'import') {
        actions.executeImport()
      }
      actions.nextStep()
    }
  }

  const handlePrevious = () => {
    actions.previousStep()
  }

  // Render step content
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'upload':
        return (
          <SmartUploadStep
            file={state.file}
            config={state.config}
            error={state.error}
            warnings={state.warnings}
            onFileUpload={actions.uploadFile}
            onConfigUpdate={actions.updateConfig}
            onDownloadTemplate={downloadTemplate}
            onClearFile={actions.clearFile}
          />
        )

      case 'map':
        return (
          <SmartFieldMapping
            mappings={state.fieldMappings}
            aiInProgress={state.mappingInProgress}
            onGenerateAIMappings={actions.generateAIMappings}
            onUpdateMapping={actions.updateFieldMapping}
            onConfirmMapping={actions.confirmMapping}
            onSkipField={actions.skipField}
          />
        )

      case 'preview':
        return (
          <SmartPreviewStep
            parsedData={state.parsedData}
            fieldMappings={state.fieldMappings}
            validationResults={state.validationResults}
            duplicateResults={state.duplicateResults}
            validationInProgress={state.validationInProgress}
            config={state.config}
            onRunValidation={actions.validateData}
            onCheckDuplicates={actions.checkDuplicates}
          />
        )

      case 'import':
        return (
          <ImportProgressStep
            inProgress={state.importInProgress}
            progress={state.importProgress}
            result={state.importResult}
            error={state.error}
          />
        )

      case 'complete':
        return (
          <ImportCompleteStep
            result={state.importResult}
            onStartNew={actions.resetWizard}
            onClose={onCancel}
          />
        )

      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <SmartImportWizard
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
        onStepClick={actions.goToStep}
      >
        {renderStepContent()}

        {/* Navigation Footer */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          
          {/* Left side - Previous button */}
          <div>
            {canGoPrevious() ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="h-12 px-6" // iPad touch-friendly
              >
                <ArrowLeft className="mr-2 size-4" />
                Previous
              </Button>
            ) : (
              <div /> // Spacer
            )}
          </div>

          {/* Center - Status or warnings */}
          <div className="mx-4 flex-1">
            {state.error && (
              <Alert variant="destructive" className="mb-0">
                <AlertCircle className="size-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            
            {state.warnings.length > 0 && !state.error && (
              <Alert className="mb-0 border-amber-200 bg-amber-50">
                <AlertCircle className="size-4 text-amber-600" />
                <AlertDescription>
                  <div className="space-y-1">
                    {state.warnings.slice(0, 2).map((warning, idx) => (
                      <div key={idx} className="text-sm text-amber-800">{warning}</div>
                    ))}
                    {state.warnings.length > 2 && (
                      <div className="text-xs text-amber-700">
                        +{state.warnings.length - 2} more warnings
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right side - Next/Action buttons */}
          <div className="flex space-x-3">
            {onCancel && state.currentStep !== 'complete' && (
              <Button
                variant="ghost"
                onClick={onCancel}
                className="h-12 px-6"
              >
                Cancel
              </Button>
            )}

            {state.currentStep !== 'import' && state.currentStep !== 'complete' && (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="h-12 px-6"
              >
                {state.currentStep === 'preview' ? 'Start Import' : 'Next'}
                {state.currentStep !== 'preview' && (
                  <ArrowRight className="ml-2 size-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </SmartImportWizard>
    </div>
  )
}

// Import progress step component
function ImportProgressStep({
  inProgress,
  progress,
  result,
  error
}: {
  inProgress: boolean
  progress: number
  result: any
  error: string | null
}) {
  return (
    <div className="space-y-6">
      
      {inProgress && (
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Importing your data...</h3>
                <p className="mt-1 text-sm text-slate-600">
                  This may take a few moments depending on the size of your file
                </p>
              </div>

              <div className="mx-auto w-full max-w-sm space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="p-6">
            <div className="text-center">
              {result.success ? (
                <CheckCircle2 className="mx-auto mb-3 size-12 text-green-500" />
              ) : (
                <AlertCircle className="mx-auto mb-3 size-12 text-red-500" />
              )}
              
              <h3 className="text-lg font-semibold text-slate-900">
                {result.success ? 'Import Successful!' : 'Import Failed'}
              </h3>
              
              <div className="mt-4 space-y-2">
                <div className="text-sm text-slate-600">
                  <strong>{result.imported}</strong> records imported successfully
                  {result.failed > 0 && (
                    <span>, <strong className="text-red-600">{result.failed}</strong> failed</span>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800">
                      View errors ({result.errors.length})
                    </summary>
                    <div className="mt-2 space-y-1 text-left text-xs">
                      {result.errors.slice(0, 5).map((error: any, idx: number) => (
                        <div key={idx} className="text-red-600">
                          Row {error.row}: {error.error}
                        </div>
                      ))}
                      {result.errors.length > 5 && (
                        <div className="text-slate-500">
                          ...and {result.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Import complete step component
function ImportCompleteStep({
  result,
  onStartNew,
  onClose
}: {
  result: any
  onStartNew: () => void
  onClose?: () => void
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="size-8 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Import Complete!</h2>
        <p className="mt-2 text-slate-600">
          Your data has been successfully imported into the CRM system.
        </p>
      </div>

      {result && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-slate-600">Records Imported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                <div className="text-sm text-slate-600">Failed Records</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={onStartNew} className="h-12 px-6">
          Import Another File
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="h-12 px-6">
            Close
          </Button>
        )}
      </div>
    </div>
  )
}

export default SmartImportOrchestrator