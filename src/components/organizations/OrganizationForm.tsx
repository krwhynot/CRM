import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { organizationSchema, type OrganizationFormData } from '@/types/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Constants } from '@/types/database.types'
import type { Organization } from '@/types/entities'

interface OrganizationFormProps {
  onSubmit: (data: OrganizationFormData) => void
  initialData?: Partial<Organization>
  loading?: boolean
  submitLabel?: string
}

export function OrganizationForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Organization'
}: OrganizationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(organizationSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'customer',
      description: initialData?.description || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      website: initialData?.website || '',
      address_line_1: initialData?.address_line_1 || '',
      address_line_2: initialData?.address_line_2 || '',
      city: initialData?.city || '',
      state_province: initialData?.state_province || '',
      postal_code: initialData?.postal_code || '',
      country: initialData?.country || '',
      industry: initialData?.industry || '',
      size: initialData?.size || null,
      annual_revenue: initialData?.annual_revenue || null,
      employee_count: initialData?.employee_count || null,
      notes: initialData?.notes || ''
    }
  })

  const selectedType = watch('type')

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Organization' : 'New Organization'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Organization Name *
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter organization name"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Organization Type *
              </label>
              <Select 
                value={selectedType} 
                onValueChange={(value) => setValue('type', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.organization_type.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the organization"
              disabled={loading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(555) 123-4567"
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contact@company.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium">
                  Website
                </label>
                <Input
                  id="website"
                  {...register('website')}
                  placeholder="https://www.company.com"
                  disabled={loading}
                />
                {errors.website && (
                  <p className="text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="address_line_1" className="text-sm font-medium">
                  Address Line 1
                </label>
                <Input
                  id="address_line_1"
                  {...register('address_line_1')}
                  placeholder="123 Main Street"
                  disabled={loading}
                />
                {errors.address_line_1 && (
                  <p className="text-sm text-red-600">{errors.address_line_1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="address_line_2" className="text-sm font-medium">
                  Address Line 2
                </label>
                <Input
                  id="address_line_2"
                  {...register('address_line_2')}
                  placeholder="Suite 100"
                  disabled={loading}
                />
                {errors.address_line_2 && (
                  <p className="text-sm text-red-600">{errors.address_line_2.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">
                  City
                </label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="City"
                  disabled={loading}
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="state_province" className="text-sm font-medium">
                  State/Province
                </label>
                <Input
                  id="state_province"
                  {...register('state_province')}
                  placeholder="State"
                  disabled={loading}
                />
                {errors.state_province && (
                  <p className="text-sm text-red-600">{errors.state_province.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="postal_code" className="text-sm font-medium">
                  Postal Code
                </label>
                <Input
                  id="postal_code"
                  {...register('postal_code')}
                  placeholder="12345"
                  disabled={loading}
                />
                {errors.postal_code && (
                  <p className="text-sm text-red-600">{errors.postal_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Country
                </label>
                <Input
                  id="country"
                  {...register('country')}
                  placeholder="Country"
                  disabled={loading}
                />
                {errors.country && (
                  <p className="text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium">
                  Industry
                </label>
                <Input
                  id="industry"
                  {...register('industry')}
                  placeholder="e.g., Food Service, Restaurant"
                  disabled={loading}
                />
                {errors.industry && (
                  <p className="text-sm text-red-600">{errors.industry.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="size" className="text-sm font-medium">
                  Organization Size
                </label>
                <Select 
                  value={watch('size') || ''} 
                  onValueChange={(value) => setValue('size', value as any)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not specified</SelectItem>
                    {Constants.public.Enums.organization_size.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size.replace('_', '-').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.size && (
                  <p className="text-sm text-red-600">{errors.size.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="annual_revenue" className="text-sm font-medium">
                  Annual Revenue ($)
                </label>
                <Input
                  id="annual_revenue"
                  type="number"
                  {...register('annual_revenue', { valueAsNumber: true })}
                  placeholder="1000000"
                  disabled={loading}
                />
                {errors.annual_revenue && (
                  <p className="text-sm text-red-600">{errors.annual_revenue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="employee_count" className="text-sm font-medium">
                  Employee Count
                </label>
                <Input
                  id="employee_count"
                  type="number"
                  {...register('employee_count', { valueAsNumber: true })}
                  placeholder="50"
                  disabled={loading}
                />
                {errors.employee_count && (
                  <p className="text-sm text-red-600">{errors.employee_count.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this organization"
              disabled={loading}
              rows={4}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}