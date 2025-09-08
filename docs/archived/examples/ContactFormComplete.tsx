import React, { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Loader2, Plus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// UI Components
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog'
import { ProgressiveDetails } from '@/components/forms/ProgressiveDetails'

// Business Logic
import { contactSchema, type ContactFormData, CONTACT_POSITIONS } from '@/types/contact.types'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useBulkUpdateContactPreferredPrincipals } from '@/hooks/useContactPreferredPrincipals'
import { PreferredPrincipalsSelect } from '@/components/contacts/PreferredPrincipalsSelect'
import { toast } from 'sonner'

// Modal Components (would be separate files in real implementation)
import { OrganizationCreateModal } from './OrganizationCreateModal'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<any>
  initialData?: Partial<ContactFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

export function ContactForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Contact',
  preselectedOrganization
}: ContactFormProps) {
  // Modal state management
  const [showCreateOrganization, setShowCreateOrganization] = useState(false)
  const [showAddPosition, setShowAddPosition] = useState(false)

  // React Hook Form setup with yup validation
  const form = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema),
    mode: 'onChange', // Real-time validation
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      title: initialData?.title || '',
      position: initialData?.position || '',
      custom_position: initialData?.custom_position || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      purchase_influence: initialData?.purchase_influence || 'Unknown',
      decision_authority: initialData?.decision_authority || 'Gatekeeper',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      mobile_phone: initialData?.mobile_phone || '',
      department: initialData?.department || '',
      linkedin_url: initialData?.linkedin_url || '',
      is_primary_contact: initialData?.is_primary_contact || false,
      notes: initialData?.notes || '',
      preferred_principals: initialData?.preferred_principals || []
    }
  })

  // Custom hooks for data fetching
  const { data: organizations = [], isLoading: organizationsLoading } = useOrganizations()
  const bulkUpdatePrincipals = useBulkUpdateContactPreferredPrincipals()

  // Watch for form value changes
  const watchPosition = form.watch('position')
  const watchPreferredPrincipals = form.watch('preferred_principals')

  // Derived state with useMemo
  const isCustomPosition = useMemo(() => watchPosition === 'Custom', [watchPosition])
  const selectedPrincipalCount = useMemo(() => 
    watchPreferredPrincipals?.length || 0, 
    [watchPreferredPrincipals]
  )

  // Organization creation success handler
  const handleOrganizationCreated = useCallback((organization: any) => {
    form.setValue('organization_id', organization.id, {
      shouldValidate: true,
      shouldDirty: true
    })
    setShowCreateOrganization(false)
    toast.success('Organization created', {
      description: `${organization.name} has been added to your organizations.`
    })
  }, [form])

  // Form submission handler
  const handleSubmit = useCallback(async (data: ContactFormData) => {
    try {
      // Transform data for API submission
      const submitData = {
        ...data,
        // Use custom position if "Custom" was selected
        position: data.position === 'Custom' ? data.custom_position : data.position,
        // Remove virtual fields that don't exist in database
        custom_position: undefined,
        preferred_principals: undefined
      }

      // Submit main contact data
      const contact = await onSubmit(submitData)

      // Handle preferred principals if contact was created successfully
      if (contact && data.preferred_principals?.length) {
        await bulkUpdatePrincipals.mutateAsync({
          contactId: contact.id,
          principalOrganizationIds: data.preferred_principals
        })
      }

      toast.success('Contact saved successfully', {
        description: `${data.first_name} ${data.last_name} has been saved.`
      })

    } catch (error) {
      console.error('Contact form submission error:', error)
      toast.error('Failed to save contact', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        action: {
          label: 'Try Again',
          onClick: () => form.handleSubmit(handleSubmit)()
        }
      })
    }
  }, [onSubmit, bulkUpdatePrincipals, form])

  // Field validation helper
  const getFieldError = useCallback((fieldName: keyof ContactFormData) => {
    return form.formState.errors[fieldName]
  }, [form.formState.errors])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Contact' : 'New Contact'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Required Fields Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-11" 
                          disabled={loading}
                          placeholder="Enter first name"
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
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-11" 
                          disabled={loading}
                          placeholder="Enter last name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="h-11" 
                        disabled={loading}
                        placeholder="e.g., Executive Chef, Manager"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position Select with Custom Option */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTACT_POSITIONS.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                        <SelectItem value="Custom">Custom Position</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Custom Position Field */}
              {isCustomPosition && (
                <FormField
                  control={form.control}
                  name="custom_position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Position *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-11" 
                          disabled={loading}
                          placeholder="Enter custom position"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Organization Select with Modal Integration */}
              <FormField
                control={form.control}
                name="organization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Organization *
                      <Dialog open={showCreateOrganization} onOpenChange={setShowCreateOrganization}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="ghost" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            New
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Organization</DialogTitle>
                          </DialogHeader>
                          <OrganizationCreateModal 
                            onSuccess={handleOrganizationCreated}
                            onCancel={() => setShowCreateOrganization(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={organizationsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={
                            organizationsLoading ? "Loading organizations..." : "Select organization"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{org.name}</span>
                              {org.type && (
                                <span className="text-xs text-muted-foreground">
                                  {org.type}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Decision Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchase_influence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Influence *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">
                            <div className="flex flex-col">
                              <span className="font-medium">High</span>
                              <span className="text-xs text-muted-foreground">
                                Significant decision-making power
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Medium">
                            <div className="flex flex-col">
                              <span className="font-medium">Medium</span>
                              <span className="text-xs text-muted-foreground">
                                Moderate influence on purchases
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Low">
                            <div className="flex flex-col">
                              <span className="font-medium">Low</span>
                              <span className="text-xs text-muted-foreground">
                                Limited purchase decision impact
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Unknown">
                            <div className="flex flex-col">
                              <span className="font-medium">Unknown</span>
                              <span className="text-xs text-muted-foreground">
                                Influence level needs assessment
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decision_authority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision Authority *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Decision Maker">
                            <div className="flex flex-col">
                              <span className="font-medium">Decision Maker</span>
                              <span className="text-xs text-muted-foreground">
                                Final approval authority
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Influencer">
                            <div className="flex flex-col">
                              <span className="font-medium">Influencer</span>
                              <span className="text-xs text-muted-foreground">
                                Influences purchase decisions
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="End User">
                            <div className="flex flex-col">
                              <span className="font-medium">End User</span>
                              <span className="text-xs text-muted-foreground">
                                Uses the products/services
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Gatekeeper">
                            <div className="flex flex-col">
                              <span className="font-medium">Gatekeeper</span>
                              <span className="text-xs text-muted-foreground">
                                Controls access to decision makers
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Progressive Disclosure for Optional Fields */}
            <ProgressiveDetails buttonText="Add Contact Details">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-muted-foreground">Contact Information</h4>
                
                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email" 
                            className="h-11" 
                            disabled={loading}
                            placeholder="contact@organization.com"
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
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="h-11" 
                            disabled={loading}
                            placeholder="e.g., Kitchen, Management"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel" 
                            className="h-11" 
                            disabled={loading}
                            placeholder="(555) 123-4567"
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
                        <FormLabel>Mobile Phone</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel" 
                            className="h-11" 
                            disabled={loading}
                            placeholder="(555) 987-6543"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* LinkedIn URL */}
                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="url" 
                          className="h-11" 
                          disabled={loading}
                          placeholder="https://linkedin.com/in/profile"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferred Principals Multi-Select */}
                <FormField
                  control={form.control}
                  name="preferred_principals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Preferred Principals
                        {selectedPrincipalCount > 0 && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({selectedPrincipalCount} selected)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <PreferredPrincipalsSelect
                          value={field.value || []}
                          onChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Select principal brands this contact advocates for within their organization.
                      </p>
                    </FormItem>
                  )}
                />

                {/* Primary Contact Designation */}
                <FormField
                  control={form.control}
                  name="is_primary_contact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Primary Contact
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Designate this person as the main contact for their organization.
                          This helps prioritize communication and relationship management.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4} 
                          disabled={loading}
                          placeholder="Additional notes about this contact, their preferences, or relationship details..."
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        {field.value?.length || 0}/500 characters
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </ProgressiveDetails>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                disabled={loading}
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !form.formState.isValid} 
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>

            {/* Development Helper: Form State Debug */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 p-4 bg-gray-50 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 mb-2">
                  Debug: Form State
                </summary>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify({
                    values: form.getValues(),
                    errors: form.formState.errors,
                    isDirty: form.formState.isDirty,
                    isValid: form.formState.isValid,
                    touchedFields: form.formState.touchedFields
                  }, null, 2)}
                </pre>
              </details>
            )}

          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Error display component with accessibility
function FormErrorMessage({ error }: { error?: any }) {
  if (!error) return null

  return (
    <div 
      role="alert" 
      className="flex items-center space-x-1 text-sm text-destructive mt-1"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  )
}

export default ContactForm