import { useEffect, useState, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SmartImportWizard } from './SmartImportWizard'
import { getNextStep } from '../utils/wizard-steps'
import { useSmartImport } from '../hooks/useSmartImport'
import { useFileUpload } from '@/hooks/useFileUpload' // For template download
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius, fontWeight } from '@/styles/tokens'
import { TableSkeleton } from '@/components/loading'

// Lazy load heavy import/export processing components
const SmartUploadStep = lazy(() => import('./SmartUploadStep'))
const SmartFieldMapping = lazy(() => import('./SmartFieldMapping'))

// Import result type - matching the structure from useSmartImport
interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

interface SmartImportOrchestratorProps {
  onImportComplete?: (result: { success: boolean; imported: number; failed: number }) => void
  onCancel?: () => void
  className?: string
}

export function SmartImportOrchestrator({
  onImportComplete,
  onCancel,
  className,
}: SmartImportOrchestratorProps) {
  const { state, actions } = useSmartImport()
  const { downloadTemplate } = useFileUpload() // Reuse existing template logic
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean
    loading: boolean
    error: string | null
  }>({ isAuthenticated: false, loading: true, error: null })

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error('Auth check error:', error)
          setAuthState({ isAuthenticated: false, loading: false, error: error.message })
        } else {
          setAuthState({ isAuthenticated: !!user, loading: false, error: null })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState({
          isAuthenticated: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication check failed',
        })
      }
    }

    checkAuth()
  }, [])

  // Auto-generate AI mappings when file is uploaded
  useEffect(() => {
    if (state.parsedData && state.fieldMappings.length > 0 && !state.aiMappingResponse) {
      actions.generateAIMappings()
    }
  }, [state.parsedData, state.fieldMappings.length, state.aiMappingResponse])

  // Handle import completion
  useEffect(() => {
    if (state.importResult && onImportComplete) {
      onImportComplete(state.importResult)
    }
  }, [state.importResult, onImportComplete])

  // Navigation helpers with better error messages - Updated for 3-step flow
  const canGoNext = () => {
    switch (state.currentStep) {
      case 'upload':
        return !!state.file && !!state.parsedData
      case 'review':
        return (
          authState.isAuthenticated &&
          state.fieldMappings.filter((m) => m.status === 'needs_review').length === 0 &&
          state.fieldMappings.some((m) => m.crmField && m.status !== 'skipped')
        )
      case 'import':
        return false // Can't go forward from import step
      case 'complete':
        return false
      default:
        return false
    }
  }

  const getNextStepMessage = () => {
    // Check auth for import step
    if (state.currentStep === 'review' && !authState.isAuthenticated) {
      return 'You must be signed in to import data'
    }

    switch (state.currentStep) {
      case 'upload':
        if (!state.file) return 'Please upload a CSV file'
        if (!state.parsedData) return 'File is being processed...'
        return null
      case 'review':
        const needsReview = state.fieldMappings.filter((m) => m.status === 'needs_review').length
        const hasMapped = state.fieldMappings.some((m) => m.crmField && m.status !== 'skipped')
        if (needsReview > 0) return `${needsReview} fields need review`
        if (!hasMapped) return 'Please map at least one field'
        return null
      default:
        return null
    }
  }

  const canGoPrevious = () => {
    return state.currentStep !== 'upload' && state.currentStep !== 'complete'
  }

  const handleNext = async () => {
    const nextStep = getNextStep(state.currentStep)
    if (nextStep) {
      // Check auth before starting import
      if (nextStep === 'import') {
        if (!authState.isAuthenticated) {
          setAuthState((prev) => ({
            ...prev,
            error: 'You must be signed in to import data. Please sign in and try again.',
          }))
          return
        }

        // Double-check auth right before import
        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser()
          if (error || !user) {
            setAuthState((prev) => ({
              ...prev,
              error: 'Authentication expired. Please sign in again.',
            }))
            return
          }

          actions.executeImport()
        } catch (error) {
          setAuthState((prev) => ({
            ...prev,
            error: 'Authentication check failed. Please try again.',
          }))
          return
        }
      }
      actions.nextStep()
    }
  }

  const handleSignIn = () => {
    // Redirect to sign-in page or open auth modal
    window.location.href = '/auth/login'
  }

  const handlePrevious = () => {
    actions.previousStep()
  }

  // Render step content - Updated for 3-step flow
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'upload':
        return (
          <Suspense fallback={<TableSkeleton />}>
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
          </Suspense>
        )

      case 'review':
        return (
          <Suspense fallback={<TableSkeleton />}>
            <SmartFieldMapping
              parsedData={state.parsedData}
              mappings={state.fieldMappings}
              aiInProgress={state.mappingInProgress}
              onGenerateAIMappings={actions.generateAIMappings}
              onUpdateMapping={actions.updateFieldMapping}
              onConfirmMapping={actions.confirmMapping}
              onSkipField={actions.skipField}
              onConfirmAll={() => {
                // Confirm all mappings that need review
                state.fieldMappings.forEach((mapping) => {
                  if (mapping.status === 'needs_review' && mapping.crmField) {
                    actions.confirmMapping(mapping.csvHeader)
                  }
                })
              }}
              onProceedToImport={handleNext}
            />
          </Suspense>
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

  // Render navigation buttons for header
  const renderHeaderButtons = () => {
    if (state.currentStep === 'import' || state.currentStep === 'complete') {
      return null
    }

    return (
      <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
        {/* Previous Button */}
        {canGoPrevious() && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className={semanticSpacing.interactiveElement}
          >
            <ArrowLeft className={`${semanticSpacing.rightGap.xs} size-4`} />
            Previous
          </Button>
        )}

        {/* Next Button */}
        <div className={`flex flex-col items-end ${semanticSpacing.stack.xs}`}>
          <Button
            onClick={handleNext}
            disabled={!canGoNext()}
            className={semanticSpacing.interactiveElement}
          >
            {state.currentStep === 'review' ? 'Start Import' : 'Next'}
            {state.currentStep !== 'review' && (
              <ArrowRight className={`${semanticSpacing.leftGap.xs} size-4`} />
            )}
          </Button>
          {!canGoNext() && getNextStepMessage() && (
            <span className={cn('max-w-40 text-right text-amber-600', semanticTypography.caption)}>
              {getNextStepMessage()}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <SmartImportWizard
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
        onStepClick={actions.goToStep}
        rightHeaderContent={renderHeaderButtons()}
      >
        {renderStepContent()}

        {/* Minimal Footer */}
        {onCancel && state.currentStep !== 'complete' && (
          <div
            className={`${semanticSpacing.topGap.xl} flex justify-center border-t ${semanticSpacing.topPadding.md}`}
          >
            <Button
              variant="ghost"
              onClick={onCancel}
              className={semanticSpacing.interactiveElement}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Authentication Error */}
        {authState.error && (
          <div className={semanticSpacing.topGap.md}>
            <Alert variant="destructive">
              <LogIn className="size-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{authState.error}</span>
                  {!authState.isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignIn}
                      className={`${semanticSpacing.leftGap.md} shrink-0`}
                    >
                      <LogIn className={`${semanticSpacing.rightGap.xs} size-3`} />
                      Sign In
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Errors/Warnings - Now separate section */}
        {(state.error || state.warnings.length > 0) && (
          <div className={semanticSpacing.topGap.md}>
            {state.error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {state.warnings.length > 0 && !state.error && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="size-4 text-amber-600" />
                <AlertDescription>
                  <div className={semanticSpacing.stack.xs}>
                    {state.warnings.slice(0, 2).map((warning, idx) => (
                      <div key={idx} className={cn('text-amber-800', semanticTypography.body)}>
                        {warning}
                      </div>
                    ))}
                    {state.warnings.length > 2 && (
                      <div className={cn('text-amber-700', semanticTypography.caption)}>
                        +{state.warnings.length - 2} more warnings
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </SmartImportWizard>
    </div>
  )
}

// Import progress step component
function ImportProgressStep({
  inProgress,
  progress,
  result,
  error,
}: {
  inProgress: boolean
  progress: number
  result: ImportResult | null
  error: string | null
}) {
  return (
    <div className={semanticSpacing.stack.xl}>
      {inProgress && (
        <Card>
          <CardContent className={semanticSpacing.cardContainer}>
            <div className={`${semanticSpacing.stack.md} text-center`}>
              <div
                className={cn(
                  'mx-auto flex size-16 items-center justify-center bg-primary/10',
                  semanticRadius.full
                )}
              >
                <div
                  className={cn(
                    'size-8 animate-spin border-2 border-primary border-t-transparent',
                    semanticRadius.full
                  )}
                />
              </div>

              <div>
                <h3 className={cn('font-semibold text-foreground', semanticTypography.heading)}>
                  Adding your organizations...
                </h3>
                <p
                  className={cn(
                    `${semanticSpacing.topGap.xs} text-muted-foreground`,
                    semanticTypography.body
                  )}
                >
                  We're processing your data and adding it to the CRM
                </p>
              </div>

              <div className={`mx-auto w-full max-w-sm ${semanticSpacing.stack.xs}`}>
                <div
                  className={cn(
                    'flex justify-between text-muted-foreground',
                    semanticTypography.body
                  )}
                >
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
      {result && result !== null && (
        <Card
          className={
            result.success
              ? 'border-success/20 bg-success/5'
              : 'border-destructive/20 bg-destructive/5'
          }
        >
          <CardContent className="${semanticSpacing.layoutPadding.lg}">
            <div className="text-center">
              {result.success ? (
                <CheckCircle2 className="mx-auto ${semanticSpacing.bottomGap.sm} size-12 text-success" />
              ) : (
                <AlertCircle className="mx-auto ${semanticSpacing.bottomGap.sm} size-12 text-destructive" />
              )}

              <h3 className="${semanticTypography.subtitle} ${fontWeight.semibold} text-foreground">
                {result.success ? 'Successfully Added to CRM!' : 'Import Had Issues'}
              </h3>

              <div className="${semanticSpacing.topGap.md} ${semanticSpacing.stack.xs}">
                <div className="${semanticTypography.body} text-muted-foreground">
                  <strong>{result.imported}</strong> organizations added to your CRM
                  {result.failed > 0 && (
                    <span>
                      , <strong className="text-destructive">{result.failed}</strong> could not be
                      added
                    </span>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <details className="${semanticSpacing.topGap.md}">
                    <summary className="cursor-pointer ${semanticTypography.body} text-muted-foreground hover:text-slate-800">
                      View errors ({result.errors.length})
                    </summary>
                    <div
                      className={cn(
                        semanticSpacing.stack.xs,
                        semanticSpacing.topGap.xs,
                        'text-left',
                        semanticTypography.caption
                      )}
                    >
                      {result.errors.slice(0, 5).map((error, idx: number) => (
                        <div key={idx} className="text-destructive">
                          Row {error.row}: {error.error}
                        </div>
                      ))}
                      {result.errors.length > 5 && (
                        <div className="text-muted-foreground">
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
  onClose,
}: {
  result: ImportResult | null
  onStartNew: () => void
  onClose?: () => void
}) {
  return (
    <div className={`${semanticSpacing.stack.xl} text-center`}>
      <div
        className={cn(
          'mx-auto flex size-16 items-center justify-center bg-success/10',
          semanticRadius.full
        )}
      >
        <CheckCircle2 className="size-8 text-success" />
      </div>
      <div>
        <h2 className={cn('font-bold text-foreground', semanticTypography.title)}>
          Import Complete!
        </h2>
        <p
          className={cn(
            `${semanticSpacing.topGap.xs} text-muted-foreground`,
            semanticTypography.body
          )}
        >
          Your data has been successfully imported into the CRM system.
        </p>
      </div>
      {result && result !== null && (
        <Card>
          <CardContent className={semanticSpacing.cardContainer}>
            <div className={cn('grid grid-cols-2 text-center', semanticSpacing.gap.md)}>
              <div>
                <div className={cn('font-bold text-success', semanticTypography.title)}>
                  {result.imported}
                </div>
                <div className={cn('text-muted-foreground', semanticTypography.body)}>
                  Records Imported
                </div>
              </div>
              <div>
                <div className={cn('font-bold text-destructive', semanticTypography.title)}>
                  {result.failed}
                </div>
                <div className={cn('text-muted-foreground', semanticTypography.body)}>
                  Failed Records
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-col justify-center ${semanticSpacing.gap.sm} sm:flex-row">
        <Button onClick={onStartNew} className={cn(semanticSpacing.cardX, 'h-12')}>
          Import Another File
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose} className={cn(semanticSpacing.cardX, 'h-12')}>
            Close
          </Button>
        )}
      </div>
    </div>
  )
}

export default SmartImportOrchestrator
