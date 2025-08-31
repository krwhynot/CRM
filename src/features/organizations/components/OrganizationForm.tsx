import { ProgressiveDetails, FormField } from '@/components/forms'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useForm, Controller } from 'react-hook-form'
import {
  organizationSchema,
  FOOD_SERVICE_SEGMENTS,
  type OrganizationFormData,
} from '@/types/organization.types'
import { yupResolver } from '@hookform/resolvers/yup'
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
  submitLabel = 'Save Organization',
}: OrganizationFormProps) {
  const form = useForm<OrganizationFormData>({
    resolver: yupResolver(organizationSchema) as any,
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
      notes: initialData?.notes || null,
    },
  })

  const handleSubmit = (data: OrganizationFormData) => {
    // Automatically derive boolean flags from the selected type
    const derivedFlags = deriveOrganizationFlags(data.type)
    const submitData = { ...data, ...derivedFlags }
    onSubmit(submitData)
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Organization' : 'Add Organization'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormField label="Name" required error={fieldState.error?.message}>
                  <Input {...field} className="h-11" disabled={loading} />
                </FormField>
              )}
            />

            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <FormField label="Type" required error={fieldState.error?.message}>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              control={form.control}
              name="priority"
              render={({ field, fieldState }) => (
                <FormField label="Priority" required error={fieldState.error?.message}>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              control={form.control}
              name="segment"
              render={({ field, fieldState }) => (
                <FormField label="Segment" error={fieldState.error?.message}>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_SERVICE_SEGMENTS.map((segment) => (
                        <SelectItem key={segment} value={segment}>
                          {segment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <ProgressiveDetails buttonText="Add Details">
              <div className="space-y-4">
                <Controller
                  control={form.control}
                  name="city"
                  render={({ field, fieldState }) => (
                    <FormField label="City" error={fieldState.error?.message}>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="h-11"
                        disabled={loading}
                      />
                    </FormField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="state_province"
                  render={({ field, fieldState }) => (
                    <FormField label="State/Province" error={fieldState.error?.message}>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="h-11"
                        disabled={loading}
                      />
                    </FormField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormField label="Phone" error={fieldState.error?.message}>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="h-11"
                        disabled={loading}
                      />
                    </FormField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="website"
                  render={({ field, fieldState }) => (
                    <FormField label="Website" error={fieldState.error?.message}>
                      <Input
                        {...field}
                        value={field.value || ''}
                        className="h-11"
                        disabled={loading}
                      />
                    </FormField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <FormField label="Notes" error={fieldState.error?.message}>
                      <Textarea {...field} value={field.value || ''} rows={3} disabled={loading} />
                    </FormField>
                  )}
                />
              </div>
            </ProgressiveDetails>

            <Button type="submit" disabled={loading} className="focus-ring w-full">
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
