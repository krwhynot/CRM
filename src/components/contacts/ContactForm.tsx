import { ProgressiveDetails } from '@/components/forms'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { contactSchema, type ContactFormData, CONTACT_ROLES } from '@/types/contact.types'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import { useOrganizations } from '@/hooks/useOrganizations'
import { PreferredPrincipalsSelect } from './PreferredPrincipalsSelect'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
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
  const { data: organizations = [] } = useOrganizations()
  
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader><CardTitle>{initialData ? 'Edit Contact' : 'New Contact'}</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
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

            <FormField control={form.control} name="organization_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Organization *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select organization" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

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

            <ProgressiveDetails buttonText="Add Details">
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