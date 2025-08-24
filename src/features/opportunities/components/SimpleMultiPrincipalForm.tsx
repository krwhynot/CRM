import { Users } from 'lucide-react'
import { Form } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { useMultiPrincipalFormState } from '@/hooks/useMultiPrincipalFormState'
import { usePrincipalSelection } from '@/hooks/usePrincipalSelection'
import { useOpportunityFormSubmission } from '@/hooks/useOpportunityFormSubmission'
import { OpportunityBasicFields } from './multi-principal-form/OpportunityBasicFields'
import { PrincipalSelector } from './multi-principal-form/PrincipalSelector'
import { OpportunityFormActions } from './multi-principal-form/OpportunityFormActions'

interface SimpleMultiPrincipalFormProps {
  onSuccess?: (opportunityId: string) => void
  preselectedOrganization?: string
  className?: string
}

export function SimpleMultiPrincipalForm({
  onSuccess,
  preselectedOrganization,
  className
}: SimpleMultiPrincipalFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()
  
  const { form, watchedOrganization } = useMultiPrincipalFormState(preselectedOrganization)
  
  const {
    selectedPrincipals,
    principalOrganizations,
    handleAddPrincipal,
    handleRemovePrincipal
  } = usePrincipalSelection(organizations, form)
  
  const { handleSubmit, isLoading, canSubmit } = useOpportunityFormSubmission(
    organizations,
    selectedPrincipals,
    onSuccess
  )
  const filteredContacts = contacts.filter(contact => 
    contact.organization_id === watchedOrganization
  )
  
  const submitCanSubmit = canSubmit(selectedPrincipals, form.formState.isValid)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          New Multi-Principal Opportunity
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <OpportunityBasicFields 
              form={form}
              organizations={organizations}
              filteredContacts={filteredContacts}
            />
            
            <PrincipalSelector
              principalOrganizations={principalOrganizations}
              selectedPrincipals={selectedPrincipals}
              organizations={organizations}
              onAddPrincipal={handleAddPrincipal}
              onRemovePrincipal={handleRemovePrincipal}
            />

            <OpportunityFormActions
              canSubmit={submitCanSubmit}
              isLoading={isLoading}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
