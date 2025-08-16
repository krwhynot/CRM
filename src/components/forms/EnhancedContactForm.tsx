import { useState } from 'react'
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
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormErrorBoundary } from '@/components/ui/form-error-boundary'
import { FormValidationSummary } from '@/components/ui/form-validation-summary'
import { useEnhancedForm, useUnsavedChangesWarning } from '@/hooks/useEnhancedForm'
import { useOrganizations } from '@/hooks/useOrganizations'
import { Building2, Users, Save, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import type { PurchaseInfluenceLevel, DecisionAuthorityRole } from '@/types/contact.types'
import type { Database } from '@/lib/database.types'

interface EnhancedContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>
  initialData?: Partial<Database['public']['Tables']['contacts']['Row']>
  submitLabel?: string
  preselectedOrganization?: string
  persistKey?: string
  autoSave?: boolean
}

export function EnhancedContactForm({ 
  onSubmit, 
  initialData, 
  submitLabel = 'Save Contact',
  preselectedOrganization,
  persistKey = 'contact-form',
  autoSave = true
}: EnhancedContactFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const [showValidationSummary, setShowValidationSummary] = useState(false)

  // Enhanced form with comprehensive error handling and persistence
  const form = useEnhancedForm({
    schema: contactSchema,
    onSubmit: async (data) => {
      setShowValidationSummary(false)
      await onSubmit(data)
    },
    persistKey,
    autoSave,
    autoSaveDelay: 2000, // Auto-save after 2 seconds of inactivity
    onError: (error) => {
      console.error('Contact form submission error:', error)
      setShowValidationSummary(true)
    },
    onSuccess: () => {
      console.log('Contact saved successfully')
      // Reset form on success if needed
      // form.resetForm()
    },
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

  // Enable unsaved changes warning
  useUnsavedChangesWarning(form.hasUnsavedChanges)

  const watchedOrganization = form.watch('organization_id')
  const selectedOrg = organizations.find(org => org.id === watchedOrganization)

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      setShowValidationSummary(true)
      throw error // Re-throw to let the enhanced form handle it
    }
  }

  return (
    <FormErrorBoundary>
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                {initialData ? 'Edit Contact' : 'New Contact'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enhanced form with auto-save and comprehensive validation
              </p>
            </div>
            
            {/* Form Status Indicators */}
            <div className="flex items-center gap-2 text-sm">
              {form.hasPersisted && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Auto-saved
                </Badge>
              )}
              {form.isSubmitting && (
                <Badge variant="default" className="text-xs">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Saving...
                </Badge>
              )}
              {!form.hasUnsavedChanges && !form.isSubmitting && initialData && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Global Form Error Display */}
          {form.submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{form.submitError}</AlertDescription>
            </Alert>
          )}

          {/* Form Validation Summary */}
          {showValidationSummary && (
            <FormValidationSummary 
              errors={form.formState.errors}
              isSubmitting={form.isSubmitting}
              onClearErrors={() => setShowValidationSummary(false)}
            />
          )}

          {/* Unsaved Changes Warning */}
          {form.hasUnsavedChanges && !form.isSubmitting && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You have unsaved changes. {autoSave ? 'Changes are auto-saved.' : 'Make sure to save your work.'}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
              
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
                            disabled={form.isSubmitting}
                            className="h-12 text-base"
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
                            disabled={form.isSubmitting}
                            className="h-12 text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Organization Selection */}
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
                            disabled={form.isSubmitting || !!preselectedOrganization}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select organization" />
                            </SelectTrigger>
                            <SelectContent>
                              {organizations.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{org.name}</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {org.type.toUpperCase()}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ''}
                            placeholder="john.doe@example.com" 
                            disabled={form.isSubmitting}
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Title</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ''}
                            placeholder="Sales Manager" 
                            disabled={form.isSubmitting}
                            className="h-12 text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                          placeholder="Additional notes about this contact..."
                          disabled={form.isSubmitting}
                          rows={4}
                          className="text-base resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Include any relevant business context or relationship history.
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
                  disabled={form.isSubmitting}
                  className="h-12 text-base font-semibold sm:min-w-[200px]"
                >
                  {form.isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Saving Contact...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {submitLabel}
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={form.resetForm}
                  disabled={form.isSubmitting}
                  className="h-12 text-base"
                >
                  Reset Form
                </Button>

                {form.hasPersisted && (
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={form.clearPersistedData}
                    disabled={form.isSubmitting}
                    className="h-12 text-base text-muted-foreground"
                  >
                    Clear Saved Data
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </FormErrorBoundary>
  )
}