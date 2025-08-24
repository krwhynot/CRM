import React from 'react'
import type { OpportunityFormData } from '@/types/opportunity.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Building, Users, DollarSign, Calendar, FileText } from 'lucide-react'
import { useOpportunityWizard } from '@/hooks/useOpportunityWizard'
import { useOpportunityForm } from '@/hooks/useOpportunityForm'
import { WizardNavigation } from '@/components/opportunities/WizardNavigation'
import { WizardStepBasicInfo } from '@/components/opportunities/WizardStepBasicInfo'
import { WizardStepOrganization } from '@/components/opportunities/WizardStepOrganization'
import { WizardStepDetails } from '@/components/opportunities/WizardStepDetails'
import { WizardStepFinancial } from '@/components/opportunities/WizardStepFinancial'
import { WizardStepTimeline } from '@/components/opportunities/WizardStepTimeline'

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
  { id: 5, title: 'Timeline', icon: Calendar, description: 'Dates and next steps' }
] as const

export function OpportunityWizard({
  onSubmit,
  onCancel,
  loading = false,
  preselectedOrganization,
  preselectedContact
}: OpportunityWizardProps) {
  // Use extracted hooks for state management
  const wizard = useOpportunityWizard(STEPS.length, 1)
  const form = useOpportunityForm({ preselectedOrganization, preselectedContact })

  const progress = ((wizard.currentStep - 1) / (STEPS.length - 1)) * 100

  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case 1:
        return (
          <WizardStepBasicInfo
            register={form.register}
            errors={form.errors}
            loading={loading}
          />
        )

      case 2:
        return (
          <WizardStepOrganization
            organizations={form.organizations}
            filteredContacts={form.filteredContacts}
            selectedOrganization={form.selectedOrganization}
            contactValue={form.watchedValues.contact_id}
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
          <WizardStepFinancial
            register={form.register}
            errors={form.errors}
            loading={loading}
          />
        )

      case 5:
        return (
          <WizardStepTimeline
            register={form.register}
            setValue={form.setValue}
            opportunityContextValue={form.watchedValues.opportunity_context}
            errors={form.errors}
            loading={loading}
          />
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Opportunity</CardTitle>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Step {wizard.currentStep} of {STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Step Navigation */}
        <WizardNavigation
          steps={STEPS}
          currentStep={wizard.currentStep}
          onStepClick={wizard.handleStepClick}
          getStepValidation={form.getStepValidation}
        />

        {/* Step Content */}
        <form onSubmit={form.handleSubmit((data: OpportunityFormData) => {
          // Filter out undefined values from principals array
          const cleanedData = {
            ...data,
            principals: data.principals.filter((id): id is string => id !== undefined)
          }
          onSubmit(cleanedData)
        })}>
          <div className="min-h-[300px] mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {wizard.currentStep > 1 && (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={wizard.handlePrevious}
                  disabled={loading}
                >
                  Previous
                </button>
              )}
            </div>

            <div className="space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              
              {wizard.currentStep < STEPS.length ? (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={() => wizard.handleNext(form.getStepValidation)}
                  disabled={loading}
                >
                  Next
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
