import { ProgressiveDetails } from '@/components/shared/forms/forms'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ButtonNew } from '@/components/ui/new/Button'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { organizationSchema, FOOD_SERVICE_SEGMENTS, type OrganizationFormData } from '@/types/organization.types'
import { createTypeSafeResolver } from '@/lib/form-resolver'
import { deriveOrganizationFlags } from '@/lib/organization-utils'

interface OrganizationFormProps {
  onSubmit: (data: OrganizationFormData) => void
  initialData?: Partial<OrganizationFormData>
  loading?: boolean
  submitLabel?: string
}

export function OrganizationForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Organization'
}: OrganizationFormProps) {
  // Feature flag for new MFB styling
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') === 'true';
  
  const form = useForm<OrganizationFormData>({
    resolver: createTypeSafeResolver<OrganizationFormData>(organizationSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'customer',
      priority: initialData?.priority || 'C',
      segment: initialData?.segment || '',
      is_principal: initialData?.is_principal || false,
      is_distributor: initialData?.is_distributor || false,
      description: initialData?.description || null,
      email: initialData?.email || null,
      phone: initialData?.phone || null,
      website: initialData?.website || null,
      address_line_1: initialData?.address_line_1 || null,
      address_line_2: initialData?.address_line_2 || null,
      city: initialData?.city || null,
      state_province: initialData?.state_province || null,
      postal_code: initialData?.postal_code || null,
      country: initialData?.country || null,
      industry: initialData?.industry || null,
      annual_revenue: initialData?.annual_revenue || null,
      employee_count: initialData?.employee_count || null,
      notes: initialData?.notes || null
    }
  })

  const handleSubmit = (data: OrganizationFormData) => {
    // Automatically derive boolean flags from the selected type
    const derivedFlags = deriveOrganizationFlags(data.type)
    const submitData = { ...data, ...derivedFlags }
    onSubmit(submitData)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader><CardTitle>{initialData ? 'Edit Organization' : 'New Organization'}</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl><Input {...field} className="h-11" disabled={loading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="priority" render={({ field }) => (
              <FormItem>
                <FormLabel>Priority *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="segment" render={({ field }) => (
              <FormItem>
                <FormLabel>Segment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select segment" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {FOOD_SERVICE_SEGMENTS.map((segment) => (
                      <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />


            <ProgressiveDetails buttonText="Add Details">
              <div className="space-y-4">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} value={field.value || ''} className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="state_province" render={({ field }) => (
                  <FormItem><FormLabel>State/Province</FormLabel><FormControl><Input {...field} value={field.value || ''} className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} value={field.value || ''} className="h-11" disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} value={field.value || ''} rows={3} disabled={loading} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </ProgressiveDetails>

            {USE_NEW_STYLE ? (
              <ButtonNew type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : submitLabel}
              </ButtonNew>
            ) : (
              <Button type="submit" disabled={loading} className="w-full h-11">
                {loading ? 'Saving...' : submitLabel}
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}