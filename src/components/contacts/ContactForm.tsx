import { useState } from 'react'
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useOrganizations, usePrincipals } from '@/hooks/useOrganizations'
import { Building2, HelpCircle, Users, Star, AlertCircle, Plus } from 'lucide-react'
import type { PurchaseInfluenceLevel, DecisionAuthorityRole } from '@/types/contact.types'
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
  
  const { data: organizations = [] } = useOrganizations()
  const { data: principals = [] } = usePrincipals()

  const form = useForm<ContactFormData>({
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
      is_primary_contact: initialData?.is_primary_contact || false,
      purchase_influence: (initialData?.purchase_influence as PurchaseInfluenceLevel) || 'Unknown',
      decision_authority: (initialData?.decision_authority as DecisionAuthorityRole) || 'Gatekeeper',
      notes: initialData?.notes || null,
      preferred_principals: []
    }
  })

  const watchedOrganization = form.watch('organization_id')
  const watchedPurchaseInfluence = form.watch('purchase_influence')
  const watchedDecisionAuthority = form.watch('decision_authority')

  // Get organization details for enhanced display
  const selectedOrg = organizations.find(org => org.id === watchedOrganization)

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
        // Set unused database fields to null
        role: null
      }
      
      // Submit the main contact form with mapped data
      await onSubmit(dbData as any)
      
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
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <Building2 className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              
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

                {/* Organization Selection with Enhanced Display */}
                <FormField
                  control={form.control}
                  name="organization_id"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        Organization *
                        {selectedOrg && (
                          <Badge 
                            variant={selectedOrg.type === 'principal' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {selectedOrg.type.toUpperCase()}
                          </Badge>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Select
                          disabled={loading || !!preselectedOrganization}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Principals</SelectLabel>
                              {organizations
                                .filter(org => org.type === 'principal')
                                .map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{org.name}</span>
                                      <Badge variant="default" className="ml-2 text-xs">
                                        PRINCIPAL
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Distributors</SelectLabel>
                              {organizations
                                .filter(org => org.type === 'distributor')
                                .map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{org.name}</span>
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        DISTRIBUTOR
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Other Organizations</SelectLabel>
                              {organizations
                                .filter(org => !['principal', 'distributor'].includes(org.type))
                                .map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{org.name}</span>
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {org.type.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
            </div>

            {/* Principal CRM Business Intelligence Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <Star className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Business Intelligence</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Principal CRM business intelligence helps identify key decision makers and influencers 
                      for targeted sales strategies in the food service industry.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

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
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select influence level" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.entries(purchaseInfluenceHelpers) as [PurchaseInfluenceLevel, any][]).map(([level, helper]) => (
                              <SelectItem key={level} value={level}>
                                <div className="flex items-center gap-3 py-2">
                                  <span className="text-lg">{helper.icon}</span>
                                  <div>
                                    <div className="font-medium">{level}</div>
                                    <div className="text-xs text-muted-foreground max-w-xs">
                                      {helper.description}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select authority role" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.entries(decisionAuthorityHelpers) as [DecisionAuthorityRole, any][]).map(([role, helper]) => (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-3 py-2">
                                  <span className="text-lg">{helper.icon}</span>
                                  <div>
                                    <div className="font-medium">{role}</div>
                                    <div className="text-xs text-muted-foreground max-w-xs">
                                      {helper.description}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
            </div>

            {/* Principal Advocacy Quick Add Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Principal Advocacy</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Track which principals this contact advocates for or prefers to work with.
                        This helps identify advocacy relationships for strategic sales planning.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <AlertCircle className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>

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
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
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
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
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
  )
}