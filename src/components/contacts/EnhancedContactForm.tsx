import { useState } from 'react'
import { ProgressiveDetails } from '@/components/forms'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useForm } from 'react-hook-form'
import { contactSchema, type ContactFormData, CONTACT_ROLES } from '@/types/contact.types'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import { useOrganizations } from '@/hooks/useOrganizations'
import { PreferredPrincipalsSelect } from './PreferredPrincipalsSelect'
import type { ContactWithOrganizationData } from '@/hooks/useContacts'
import { Building2, Plus, User } from 'lucide-react'

interface EnhancedContactFormProps {
  onSubmit: (data: ContactWithOrganizationData) => void
  initialData?: Partial<ContactFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

type OrganizationMode = 'existing' | 'new'

export function EnhancedContactForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Contact',
  preselectedOrganization
}: EnhancedContactFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const [organizationMode, setOrganizationMode] = useState<OrganizationMode>(
    preselectedOrganization ? 'existing' : 'new'
  )
  
  const form = useForm<ContactFormData>({
    resolver: createTypeSafeResolver<ContactFormData>(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      purchase_influence: initialData?.purchase_influence || 'Unknown',
      decision_authority: initialData?.decision_authority || 'Gatekeeper',
      role: initialData?.role || null,
      email: initialData?.email || null,
      title: initialData?.title || null,
      department: initialData?.department || null,
      phone: initialData?.phone || null,
      mobile_phone: initialData?.mobile_phone || null,
      linkedin_url: initialData?.linkedin_url || null,
      is_primary_contact: initialData?.is_primary_contact || false,
      notes: initialData?.notes || null,
      preferred_principals: initialData?.preferred_principals || []
    }
  })

  // Additional form fields for new organization creation
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    type: 'customer' as const,
    phone: '',
    email: '',
    website: '',
    notes: ''
  })

  const handleSubmit = (contactData: ContactFormData) => {
    let enhancedData: ContactWithOrganizationData

    if (organizationMode === 'existing') {
      // Use existing organization
      enhancedData = {
        ...contactData,
        organization_id: contactData.organization_id
      }
    } else {
      // Create new organization
      enhancedData = {
        ...contactData,
        organization_name: newOrgData.name,
        organization_type: newOrgData.type,
        organization_data: {
          phone: newOrgData.phone || null,
          email: newOrgData.email || null,
          website: newOrgData.website || null,
          notes: newOrgData.notes || null
        }
      }
    }

    onSubmit(enhancedData)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {initialData ? 'Edit Contact' : 'New Contact'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            {/* Contact Basic Info */}
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} value={field.value || ''} className="h-11" disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CONTACT_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Organization Selection */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2 font-medium">
                <Building2 className="h-4 w-4" />
                Organization *
              </div>
              
              <RadioGroup 
                value={organizationMode} 
                onValueChange={(value: OrganizationMode) => setOrganizationMode(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <label htmlFor="existing" className="text-sm">Select existing</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <label htmlFor="new" className="text-sm">Create new</label>
                </div>
              </RadioGroup>

              {organizationMode === 'existing' ? (
                <FormField control={form.control} name="organization_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Organization *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Choose organization" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Organization Name *</label>
                    <Input 
                      value={newOrgData.name}
                      onChange={(e) => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11 mt-1"
                      placeholder="Enter organization name"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Organization Type *</label>
                    <Select 
                      value={newOrgData.type}
                      onValueChange={(value: 'customer' | 'prospect' | 'partner' | 'distributor' | 'principal') => 
                        setNewOrgData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="h-11 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <ProgressiveDetails buttonText="Add Organization Details" size="sm">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input 
                          value={newOrgData.phone}
                          onChange={(e) => setNewOrgData(prev => ({ ...prev, phone: e.target.value }))}
                          className="h-9 mt-1"
                          placeholder="Organization phone"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input 
                          value={newOrgData.email}
                          onChange={(e) => setNewOrgData(prev => ({ ...prev, email: e.target.value }))}
                          className="h-9 mt-1"
                          type="email"
                          placeholder="Organization email"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Website</label>
                        <Input 
                          value={newOrgData.website}
                          onChange={(e) => setNewOrgData(prev => ({ ...prev, website: e.target.value }))}
                          className="h-9 mt-1"
                          placeholder="https://..."
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </ProgressiveDetails>
                </div>
              )}
            </div>

            {/* Contact Classification */}
            <FormField control={form.control} name="purchase_influence" render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Influence *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="decision_authority" render={({ field }) => (
              <FormItem>
                <FormLabel>Decision Authority *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                    <SelectItem value="Influencer">Influencer</SelectItem>
                    <SelectItem value="End User">End User</SelectItem>
                    <SelectItem value="Gatekeeper">Gatekeeper</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Contact Details */}
            <ProgressiveDetails buttonText="Add Contact Details">
              <div className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} value={field.value || ''} type="email" className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} type="tel" className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mobile_phone" render={({ field }) => (
                  <FormItem><FormLabel>Mobile Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} type="tel" className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} value={field.value || ''} className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="preferred_principals" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Principals</FormLabel>
                    <FormControl>
                      <PreferredPrincipalsSelect
                        value={field.value?.filter((v): v is string => v !== undefined) || []}
                        onChange={(value) => field.onChange(value)}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="is_primary_contact" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Primary Contact</FormLabel>
                    </div>
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} value={field.value || ''} rows={3} disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </ProgressiveDetails>

            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}