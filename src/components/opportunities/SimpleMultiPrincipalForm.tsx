import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Building2, Users, X } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { opportunitySchema, type OpportunityFormData } from '@/types/opportunity.types'
import type { OpportunityInsert } from '@/types/entities'
import type { Database } from '@/types/database.types'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { useCreateOpportunity } from '@/hooks/useOpportunities'
import { toast } from 'sonner'
import { OPPORTUNITY_CONTEXTS, OPPORTUNITY_STAGES } from '@/constants/opportunity.constants'

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
  const [selectedPrincipals, setSelectedPrincipals] = useState<string[]>([])
  
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContacts()
  const createOpportunity = useCreateOpportunity()
  
  const form = useForm<OpportunityFormData>({
    resolver: createTypeSafeResolver<OpportunityFormData>(opportunitySchema),
    defaultValues: {
      name: '',
      organization_id: preselectedOrganization || '',
      estimated_value: 0,
      stage: 'New Lead',
      contact_id: null,
      estimated_close_date: null,
      description: null,
      notes: null,
      principals: [],
      product_id: null,
      opportunity_context: 'New Product Interest',
      auto_generated_name: true,
      principal_id: null,
      probability: null,
      deal_owner: null
    }
  })

  const watchedOrganization = form.watch('organization_id')
  
  // Filter contacts by selected organization
  const filteredContacts = contacts.filter(contact => 
    contact.organization_id === watchedOrganization
  )

  // Filter organizations to show only principals
  const principalOrganizations = organizations.filter(org => 
    org.type && (org.type.toLowerCase() === 'principal')
  )

  const handleAddPrincipal = (principalId: string) => {
    if (principalId && !selectedPrincipals.includes(principalId)) {
      const newPrincipals = [...selectedPrincipals, principalId]
      setSelectedPrincipals(newPrincipals)
      form.setValue('principals', newPrincipals)
    }
  }

  const handleRemovePrincipal = (principalId: string) => {
    const newPrincipals = selectedPrincipals.filter(id => id !== principalId)
    setSelectedPrincipals(newPrincipals)
    form.setValue('principals', newPrincipals)
  }

  const handleSubmit = async (data: OpportunityFormData) => {
    try {
      // Generate opportunity name if auto-generated
      let opportunityName = 'Multi-Principal Opportunity'
      if (data.auto_generated_name) {
        const customerOrg = organizations.find(org => org.id === data.organization_id)
        const principalNames = selectedPrincipals
          .map(id => organizations.find(org => org.id === id)?.name)
          .filter(Boolean)
          .join(', ')
        
        const context = data.opportunity_context || 'Opportunity'
        
        const date = new Date()
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        
        if (customerOrg && principalNames) {
          opportunityName = `${customerOrg.name} - ${principalNames} - ${context} - ${monthYear}`
        }
      }

      // Remove the principals field and prepare data for OpportunityInsert
      const { principals: _principals, auto_generated_name: _auto_generated_name, ...opportunityFormData } = data
      
      // Normalize stage value to match database enum
      const normalizeStage = (stage: string): Database['public']['Enums']['opportunity_stage'] => {
        // Database enum values match the form values exactly
        const validStages = [
          'New Lead',
          'Initial Outreach', 
          'Sample/Visit Offered',
          'Awaiting Response',
          'Feedback Logged',
          'Demo Scheduled',
          'Closed - Won',
          'Closed - Lost'
        ] as const
        
        if (validStages.includes(stage as any)) {
          return stage as Database['public']['Enums']['opportunity_stage']
        }
        
        // Default fallback
        return 'New Lead' as Database['public']['Enums']['opportunity_stage']
      }

      // Create the opportunity with basic data compatible with OpportunityInsert
      // Note: The hook will add created_by and updated_by fields automatically
      const opportunityData: OpportunityInsert = {
        name: opportunityName,
        organization_id: opportunityFormData.organization_id,
        estimated_value: data.estimated_value || 0,
        stage: normalizeStage(opportunityFormData.stage as string),
        contact_id: opportunityFormData.contact_id,
        estimated_close_date: opportunityFormData.estimated_close_date,
        notes: opportunityFormData.notes,
        description: `Multi-Principal Opportunity with principals: ${selectedPrincipals.map(id => 
          organizations.find(org => org.id === id)?.name
        ).filter(Boolean).join(', ')}`
      }

      const result = await createOpportunity.mutateAsync(opportunityData)
      
      // TODO: In a future iteration, we'll use the atomic RPC to create participants
      // For now, we'll create a basic opportunity and show the principals in the description
      
      toast.success('Multi-principal opportunity created successfully!')
      onSuccess?.(result.id)
    } catch (error) {
      console.error('Failed to create opportunity:', error)
      toast.error('Failed to create opportunity. Please try again.')
    }
  }

  const isLoading = createOpportunity.isPending
  const canSubmit = selectedPrincipals.length > 0 && form.formState.isValid

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
            {/* Customer Organization */}
            <FormField control={form.control} name="organization_id" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Customer Organization *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="customer-organization-select">
                      <SelectValue placeholder="Select customer organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{org.name}</span>
                          {org.type && (
                            <StatusIndicator variant="outline" size="sm">{org.type}</StatusIndicator>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Contact */}
            <FormField control={form.control} name="contact_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Contact</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary contact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Principals Selection */}
            <div className="space-y-4">
              <FormLabel>Principals *</FormLabel>
              
              {/* Add Principal Dropdown */}
              <Select onValueChange={handleAddPrincipal}>
                <SelectTrigger data-testid="add-organization-select">
                  <SelectValue placeholder="Add principal organization" />
                </SelectTrigger>
                <SelectContent>
                  {principalOrganizations
                    .filter(org => !selectedPrincipals.includes(org.id))
                    .map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>

              {/* Selected Principals */}
              {selectedPrincipals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Selected Principals:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrincipals.map((principalId) => {
                      const principal = organizations.find(org => org.id === principalId)
                      return principal ? (
                        <StatusIndicator 
                          key={principalId} 
                          variant="secondary" 
                          size="sm" 
                          className="flex items-center gap-1"
                        >
                          {principal.name}
                          <button
                            type="button"
                            onClick={() => handleRemovePrincipal(principalId)}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </StatusIndicator>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Opportunity Context */}
            <FormField control={form.control} name="opportunity_context" render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity Context *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger data-testid="opportunity-context-select">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {OPPORTUNITY_CONTEXTS.map((context) => (
                      <SelectItem key={context} value={context}>
                        {context}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />


            {/* Stage */}
            <FormField control={form.control} name="stage" render={({ field }) => (
              <FormItem>
                <FormLabel>Stage</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {OPPORTUNITY_STAGES.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Notes */}
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    rows={3}
                    placeholder="Additional notes about this opportunity..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Submit Button */}
            <div className="flex flex-col gap-4 pt-4 border-t">
              {!canSubmit && (
                <Alert>
                  <AlertDescription>
                    Please select at least one principal and complete all required fields.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="w-full"
                data-testid="create-opportunity-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Multi-Principal Opportunity'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}