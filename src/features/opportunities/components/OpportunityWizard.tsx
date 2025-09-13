import type { OpportunityFormData } from '@/types/opportunity.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Building, Users, DollarSign, Calendar, FileText } from 'lucide-react'
import { useOpportunityWizard } from '../hooks/useOpportunityWizard'
import { useOpportunityForm } from '../hooks/useOpportunityForm'
import { semanticSpacing, semanticTypography, semanticRadius, fontWeight } from '@/styles/tokens'
import { WizardNavigation } from './WizardNavigation'
import { WizardStepBasicInfo } from './WizardStepBasicInfo'
import { WizardStepOrganization } from './WizardStepOrganization'
import { WizardStepDetails } from './WizardStepDetails'
import { WizardStepFinancial } from './WizardStepFinancial'
import { WizardStepTimeline } from './WizardStepTimeline'

import { cn } from '@/lib/utils'
interface OpportunityWizardProps {
  onSubmit: (data: OpportunityFormData) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
  preselectedOrganization?: string
  preselectedContact?: string
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: FileText, description: 'Opportunity name and type' },
  { id: 2, title: 'Organization', icon: Building, description: 'Select organization and contact' },
  { id: 3, title: 'Details', icon: Users, description: 'Stage, priority, and description' },
  { id: 4, title: 'Financial', icon: DollarSign, description: 'Value and probability' },
  { id: 5, title: 'Timeline', icon: Calendar, description: 'Dates and next steps' },
] as const

export function OpportunityWizard({
  onSubmit,
  onCancel,
  loading = false,
  preselectedOrganization,
  preselectedContact,
}: OpportunityWizardProps) {
  // Use extracted hooks for state management
  const wizard = useOpportunityWizard(STEPS.length, 1)
  const form = useOpportunityForm({ preselectedOrganization, preselectedContact })

  const progress = ((wizard.currentStep - 1) / (STEPS.length - 1)) * 100

  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case 1:
        return (
          <WizardStepBasicInfo register={form.register} errors={form.errors} loading={loading} />
        )

      case 2:
        return (
          <WizardStepOrganization
            organizations={form.organizations || []}
            filteredContacts={form.filteredContacts || []}
            selectedOrganization={form.selectedOrganization}
            contactValue={form.watchedValues.contact_id || null}
            setValue={form.setValue}
            errors={form.errors}
            loading={loading}
            preselectedOrganization={preselectedOrganization}
            preselectedContact={preselectedContact}
          />
        )

      case 3:
        return (
          <WizardStepDetails
            register={form.register}
            setValue={form.setValue}
            stageValue={form.watchedValues.stage}
            errors={form.errors}
            loading={loading}
          />
        )

      case 4:
        return (
          <WizardStepFinancial register={form.register} errors={form.errors} loading={loading} />
        )

      case 5:
        return (
          <WizardStepTimeline
            register={form.register}
            setValue={form.setValue}
            opportunityContextValue={form.watchedValues.opportunity_context || null}
            errors={form.errors}
            loading={loading}
          />
        )

      default:
        return null
    }
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Add Opportunity</CardTitle>
        <div className={semanticSpacing.topGap.lg}>
          <Progress value={progress} className="h-2" />
          <div
            className={`${semanticSpacing.topGap.xs} flex justify-between ${semanticTypography.body} ${text - muted - foreground}`}
          >
            <span>
              Step {wizard.currentStep} of {STEPS.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Step Navigation */}
        <WizardNavigation
          steps={STEPS}
          currentStep={wizard.currentStep}
          progress={wizard.progress}
          getStepStatus={wizard.getStepStatus}
          onStepClick={(step: number) => wizard.handleStepClick(step, form.validateStepsRange)}
          onPrevious={wizard.handlePrevious}
          onNext={() => wizard.handleNext(() => form.getStepValidation(wizard.currentStep))}
          onCancel={onCancel}
          onSubmit={() => {}} // This will be handled by the form submit
          isFirstStep={wizard.isFirstStep}
          isLastStep={wizard.isLastStep}
          loading={loading}
        />

        {/* Step Content */}
        <form
          onSubmit={form.handleSubmit((data: OpportunityFormData) => {
            // Filter out undefined values from principals array
            const cleanedData = {
              ...data,
              principals: data.principals.filter((id): id is string => id !== undefined),
            }
            onSubmit(cleanedData)
          })}
        >
          <div className={`${semanticSpacing.bottomGap.xl} min-h-72`}>{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {wizard.currentStep > 1 && (
                <button
                  type="button"
                  className={`inline-flex items-center ${semanticRadius.default} border ${border - border} bg-white ${semanticSpacing.horizontalPadding.xl} ${semanticSpacing.verticalPadding.xs} ${semanticTypography.body} ${fontWeight.medium} ${text - foreground} hover:${bg - muted} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
                  onClick={wizard.handlePrevious}
                  disabled={loading}
                >
                  Previous
                </button>
              )}
            </div>

            <div className={`${semanticSpacing.gap.xs}`} style={{ display: 'flex' }}>
              <button
                type="button"
                className={cn(
                  semanticSpacing.cardX,
                  semanticSpacing.compactY,
                  'inline-flex items-center',
                  semanticRadius.default,
                  '-md border',
                  border - border,
                  'bg-white',
                  semanticTypography.body,
                  fontWeight.medium,
                  text - foreground,
                  'hover:',
                  bg - muted,
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
                )}
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>

              {wizard.currentStep < STEPS.length ? (
                <button
                  type="button"
                  className={`inline-flex items-center ${semanticRadius.default} border border-transparent bg-blue-600 ${semanticSpacing.horizontalPadding.xl} ${semanticSpacing.verticalPadding.xs} ${semanticTypography.body} ${fontWeight.medium} text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
                  onClick={() =>
                    wizard.handleNext(() => form.getStepValidation(wizard.currentStep))
                  }
                  disabled={loading}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className={`inline-flex items-center ${semanticRadius.default} border border-transparent bg-blue-600 ${semanticSpacing.horizontalPadding.xl} ${semanticSpacing.verticalPadding.xs} ${semanticTypography.body} ${fontWeight.medium} text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Opportunity'}
                </button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
