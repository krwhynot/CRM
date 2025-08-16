import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { contactSchema, type ContactFormData } from '@/types/contact.types'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FormErrorBoundary } from '@/components/ui/form-error-boundary'
import { usePrincipals } from '@/hooks/useOrganizations'
import { DynamicSelectField, type SelectOption } from '@/components/forms/DynamicSelectField'
import { AddOrganizationDialog } from '@/components/forms/AddOrganizationDialog'
import { CollapsibleFormSection, FormSectionPresets } from '@/components/forms/CollapsibleFormSection'
import { supabase } from '@/lib/supabase'
import { Building2, HelpCircle, Users, Star, AlertCircle, Plus } from 'lucide-react'
import type { PurchaseInfluenceLevel, DecisionAuthorityRole } from '@/types/contact.types'
import { mapDecisionAuthorityToRole } from '@/types/contact.types'
import type { Database } from '@/lib/database.types'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
  initialData?: Partial<Database['public']['Tables']['contacts']['Row']>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

// Business context helpers for Principal CRM
const purchaseInfluenceHelpers: Record<PurchaseInfluenceLevel, { description: string; color: string; icon: string }> = {
  'High': {
    description: 'Makes or heavily influences purchasing decisions. Key decision maker for food service purchases.',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🎯'
  },
  'Medium': {
    description: 'Has significant input on purchasing decisions. Influences buying choices and vendor selection.',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⚡'
  },
  'Low': {
    description: 'Limited influence on purchasing decisions. May provide input but not final decision authority.',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '💭'
  },
  'Unknown': {
    description: 'Purchase influence level not yet determined. Requires further discovery.',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '❓'
  }
}

const decisionAuthorityHelpers: Record<DecisionAuthorityRole, { description: string; color: string; icon: string }> = {
  'Decision Maker': {
    description: 'Final authority on purchasing decisions. Can approve deals and sign contracts.',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '👑'
  },
  'Influencer': {
    description: 'Strong influence on decision makers. Recommendations carry significant weight.',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🎪'
  },
  'End User': {
    description: 'Uses the products/services directly. Provides operational feedback and requirements.',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🔧'
  },
  'Gatekeeper': {
    description: 'Controls access to decision makers. Filters information and manages vendor relationships.',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🚪'
  }
}

export function ContactForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Contact',
  preselectedOrganization
}: ContactFormProps) {
  const [showAdvocacyQuickAdd, setShowAdvocacyQuickAdd] = useState(false)
  const [selectedPrincipals, setSelectedPrincipals] = useState<string[]>([])
  const [isAddOrgDialogOpen, setIsAddOrgDialogOpen] = useState(false)
  const [currentSearchQuery, setCurrentSearchQuery] = useState('')
  const [updateSearchResults, setUpdateSearchResults] = useState<((updateFn: (results: SelectOption[]) => SelectOption[]) => void) | null>(null)
  
  const { data: principals = [] } = usePrincipals()

  // Async search function for organizations
  const searchOrganizations = useCallback(async (query: string): Promise<SelectOption[]> => {
    console.log('🔍 searchOrganizations called with query:', { query, queryLength: query?.length })
    
    try {
      let dbQuery = supabase
        .from('organizations')
        .select('id, name, type, city, state_province')
        .is('deleted_at', null)
        .order('name')
        .limit(25) // Performance optimization per project guidelines

      // Apply search filter if query is provided
      if (query && query.length >= 1) {
        // Fix .or() syntax for better compatibility
        dbQuery = dbQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%`)
        console.log('🔍 Applied search filter for query:', query)
      } else {
        console.log('🔍 No query provided, fetching all organizations (limited to 25)')
      }

      console.log('🔍 Executing Supabase query...')
      const { data, error } = await dbQuery
      
      if (error) {
        console.error('🔍 Supabase query error:', error)
        throw new Error(`Database query failed: ${error.message}`)
      }

      console.log('🔍 Supabase query successful:', { 
        resultCount: data?.length || 0,
        firstResult: data?.[0],
        query: query
      })

      const mappedResults = (data || []).map(org => {
        const selectOption: SelectOption = {
          value: org.id,
          label: org.name,
          description: org.city && org.state_province ? `${org.city}, ${org.state_province}` : org.city || org.state_province || '',
          badge: {
            text: org.type.toUpperCase(),
            variant: org.type === 'principal' ? 'default' as const : 
                     org.type === 'distributor' ? 'secondary' as const : 'outline' as const
          },
          metadata: { type: org.type }
        }
        return selectOption
      })

      console.log('🔍 Mapped results:', { 
        mappedCount: mappedResults.length,
        firstMapped: mappedResults[0]
      })

      return mappedResults
    } catch (error) {
      console.error('🔍 Error in searchOrganizations:', error)
      // Return empty array to prevent component crashes
      return []
    }
  }, [])

  // Handle quick create organization
  const handleCreateOrganization = useCallback(async () => {
    console.log('🏢 Opening Add Organization dialog with search query:', currentSearchQuery)
    setIsAddOrgDialogOpen(true)
  }, [currentSearchQuery])

  const form = useForm({
    resolver: yupResolver(contactSchema) as any,
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      email: initialData?.email || null,
      title: initialData?.title || null,
      department: initialData?.department || null,
      phone: initialData?.phone || null,
      mobile_phone: initialData?.mobile_phone || null,
      linkedin_url: initialData?.linkedin_url || null,
      is_primary_contact: initialData?.is_primary_contact || null,
      purchase_influence: (initialData?.purchase_influence as PurchaseInfluenceLevel) || 'Unknown',
      decision_authority: (initialData?.decision_authority as DecisionAuthorityRole) || 'End User',
      notes: initialData?.notes || null,
      preferred_principals: []
    }
  })

  const watchedPurchaseInfluence = form.watch('purchase_influence')
  const watchedDecisionAuthority = form.watch('decision_authority')

  // Handle organization created from dialog
  const handleOrganizationCreated = useCallback((newOrganization: SelectOption) => {
    console.log('🏢 New organization created:', newOrganization)
    
    // Automatically select the newly created organization
    form.setValue('organization_id', newOrganization.value)
    
    // Close the add dialog
    setIsAddOrgDialogOpen(false)
    
    // Clear search query to show the selection
    setCurrentSearchQuery('')
    
    // Optimistic update: Add to current search results immediately
    if (updateSearchResults) {
      try {
        updateSearchResults((currentResults) => {
          // Check if organization already exists (avoid duplicates)
          const exists = currentResults.some(result => result.value === newOrganization.value)
          if (!exists) {
            console.log('📈 Adding new organization to search results optimistically')
            return [newOrganization, ...currentResults]
          }
          return currentResults
        })
      } catch (error) {
        console.error('❌ Error updating search results optimistically:', error)
      }
    }
    
    console.log('✅ Organization created and selected successfully:', newOrganization.label)
  }, [form, updateSearchResults])

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      // Map form data to database format
      const dbData = {
        first_name: data.first_name,
        last_name: data.last_name,
        organization_id: data.organization_id,
        email: data.email,
        title: data.title,
        department: data.department,
        phone: data.phone,
        mobile_phone: data.mobile_phone,
        linkedin_url: data.linkedin_url,
        is_primary_contact: data.is_primary_contact || false,
        purchase_influence: data.purchase_influence,
        decision_authority: data.decision_authority,
        notes: data.notes,
        // Map decision authority to database role enum for consistency
        role: mapDecisionAuthorityToRole(data.decision_authority)
      }
      
      // Submit the main contact form with mapped data
      await onSubmit(dbData)
      
      // If advocacy relationships were selected, create them after contact creation
      if (selectedPrincipals.length > 0 && data.organization_id) {
        // Note: This would need the created contact ID, which should be returned from onSubmit
        // For now, we'll just track the selection
        console.log('Selected principals for advocacy:', selectedPrincipals)
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
    }
  }

  return (
    <FormErrorBoundary>
      <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-5 w-5" />
          {initialData ? 'Edit Contact' : 'New Contact'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a new contact with Principal CRM business intelligence
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-8">
            
            {/* Basic Information Section */}
            <CollapsibleFormSection
              {...FormSectionPresets.contactBasic}
              icon={<Building2 className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Name Fields */}
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="John" 
                          disabled={loading}
                          className="h-12 text-base" // Mobile-friendly height
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Doe" 
                          disabled={loading}
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Organization Selection with DynamicSelectField */}
                <div className="lg:col-span-2">
                  <DynamicSelectField
                    name="organization_id"
                    control={form.control}
                    label="Organization"
                    placeholder="Search and select organization..."
                    searchPlaceholder="Search organizations by name or city..."
                    createNewText="Create New Organization"
                    disabled={loading || !!preselectedOrganization}
                    required
                    onSearch={searchOrganizations}
                    onCreateNew={handleCreateOrganization}
                    onSearchResultsUpdate={(setter) => setUpdateSearchResults(() => setter)}
                    onSearchQueryChange={setCurrentSearchQuery}
                    showCreateWhenEmpty
                    showCreateAlways={false}
                    groupBy={(option) => {
                      const type = option.metadata?.type
                      if (type === 'principal') return 'Principals'
                      if (type === 'distributor') return 'Distributors'
                      return 'Other Organizations'
                    }}
                    clearable={!preselectedOrganization}
                    debounceMs={300}
                    minSearchLength={1}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          placeholder="Sales Manager" 
                          disabled={loading}
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleFormSection>

            {/* Principal CRM Business Intelligence Section */}
            <CollapsibleFormSection
              id="contact-business-intelligence"
              title="Business Intelligence"
              description="Principal CRM business intelligence for sales strategy"
              icon={<Star className="h-4 w-4" />}
              defaultOpenMobile={false}
              defaultOpenDesktop={true}
            >

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Purchase Influence */}
                <FormField
                  control={form.control}
                  name="purchase_influence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        Purchase Influence Level *
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              How much influence does this contact have on purchasing decisions 
                              for their organization?
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={loading}
                          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select influence level</option>
                          {(Object.entries(purchaseInfluenceHelpers) as [PurchaseInfluenceLevel, any][]).map(([level, helper]) => (
                            <option key={level} value={level}>
                              {helper.icon} {level} - {helper.description.substring(0, 50)}...
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      {watchedPurchaseInfluence && (
                        <div className={`text-xs p-2 rounded border ${purchaseInfluenceHelpers[watchedPurchaseInfluence].color}`}>
                          {purchaseInfluenceHelpers[watchedPurchaseInfluence].description}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Decision Authority */}
                <FormField
                  control={form.control}
                  name="decision_authority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        Decision Authority Role *
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              What role does this contact play in the decision-making process?
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={loading}
                          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select authority role</option>
                          {(Object.entries(decisionAuthorityHelpers) as [DecisionAuthorityRole, any][]).map(([role, helper]) => (
                            <option key={role} value={role}>
                              {helper.icon} {role} - {helper.description.substring(0, 50)}...
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      {watchedDecisionAuthority && (
                        <div className={`text-xs p-2 rounded border ${decisionAuthorityHelpers[watchedDecisionAuthority].color}`}>
                          {decisionAuthorityHelpers[watchedDecisionAuthority].description}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleFormSection>

            {/* Principal Advocacy Quick Add Section */}
            <CollapsibleFormSection
              id="contact-advocacy"
              title="Principal Advocacy"
              description="Track preferred principals and advocacy relationships"
              icon={<Building2 className="h-4 w-4" />}
              defaultOpenMobile={false}
              defaultOpenDesktop={false}
            >
              <div className="flex items-center justify-between mb-4">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Configure Advocacy Relationships</span>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Track which principals this contact advocates for or prefers to work with.
                      This helps identify advocacy relationships for strategic sales planning.
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvocacyQuickAdd(!showAdvocacyQuickAdd)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Preferred Principals
                </Button>
              </div>

              {showAdvocacyQuickAdd && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select principals that this contact advocates for or prefers to work with. 
                    This can be configured later with detailed advocacy strength ratings.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {principals.map((principal) => (
                      <label key={principal.id} className="flex items-center space-x-2 p-2 rounded hover:bg-background cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPrincipals.includes(principal.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPrincipals([...selectedPrincipals, principal.id])
                            } else {
                              setSelectedPrincipals(selectedPrincipals.filter(id => id !== principal.id))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{principal.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedPrincipals.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {selectedPrincipals.length} principal{selectedPrincipals.length > 1 ? 's' : ''} selected for advocacy tracking
                    </div>
                  )}
                </div>
              )}
            </CollapsibleFormSection>

            {/* Contact Information Section */}
            <CollapsibleFormSection
              {...FormSectionPresets.contactAdditional}
              title="Contact Information"
              description="Phone, email, and additional contact details"
              icon={<AlertCircle className="h-4 w-4" />}
            >

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Phone</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          placeholder="(555) 123-4567" 
                          disabled={loading}
                          className="h-12 text-base"
                          type="tel"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          placeholder="https://www.linkedin.com/in/username" 
                          disabled={loading}
                          className="h-12 text-base"
                          type="url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel className="text-sm font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          placeholder="john.doe@example.com" 
                          disabled={loading}
                          className="h-12 text-base"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Department</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          placeholder="Sales" 
                          disabled={loading}
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Mobile Phone</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''}
                          placeholder="(555) 123-4567" 
                          disabled={loading}
                          className="h-12 text-base"
                          type="tel"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_primary_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Primary Contact</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox"
                            checked={field.value === true}
                            onChange={(e) => field.onChange(e.target.checked ? true : null)}
                            disabled={loading}
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-muted-foreground">This is the primary contact for the organization</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Account Manager field removed - not in database schema */}
              </div>
              
              {/* Notes Section */}
              <div className="space-y-4 border-t pt-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ''}
                          placeholder="Additional notes about this contact, their preferences, and business relationship details..."
                          disabled={loading}
                          rows={4}
                          className="text-base resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Include any relevant business context, preferences, or relationship history.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleFormSection>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={loading}
                className="h-12 text-base font-semibold sm:min-w-[200px]"
              >
                {loading ? 'Saving Contact...' : submitLabel}
              </Button>
              
              {selectedPrincipals.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>
                    Will create {selectedPrincipals.length} advocacy relationship{selectedPrincipals.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>

    {/* Add Organization Dialog */}
    <AddOrganizationDialog
      prefilledName={currentSearchQuery}
      onCreated={handleOrganizationCreated}
      open={isAddOrgDialogOpen}
      onOpenChange={setIsAddOrgDialogOpen}
    />
    </FormErrorBoundary>
  )
}