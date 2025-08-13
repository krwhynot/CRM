import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { contactSchema, type ContactFormData } from '@/types/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Constants } from '@/types/database.types'
import { useOrganizations } from '@/hooks/useOrganizations'
import type { Contact } from '@/types/entities'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
  initialData?: Partial<Contact>
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
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      title: initialData?.title || '',
      role: initialData?.role || null,
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      mobile_phone: initialData?.mobile_phone || '',
      department: initialData?.department || '',
      linkedin_url: initialData?.linkedin_url || '',
      is_primary_contact: initialData?.is_primary_contact || false,
      notes: initialData?.notes || ''
    }
  })

  const selectedOrganization = watch('organization_id')
  const selectedRole = watch('role')
  const isPrimaryContact = watch('is_primary_contact')

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Contact' : 'New Contact'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium">
                First Name *
              </label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="John"
                disabled={loading}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium">
                Last Name *
              </label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Doe"
                disabled={loading}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Organization and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="organization_id" className="text-sm font-medium">
                Organization *
              </label>
              <Select 
                value={selectedOrganization} 
                onValueChange={(value) => setValue('organization_id', value)}
                disabled={loading || !!preselectedOrganization}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organization_id && (
                <p className="text-sm text-red-600">{errors.organization_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select 
                value={selectedRole || ''} 
                onValueChange={(value) => setValue('role', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  {Constants.public.Enums.contact_role.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
          </div>

          {/* Title and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Job Title
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Sales Manager"
                disabled={loading}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department
              </label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Sales"
                disabled={loading}
              />
              {errors.department && (
                <p className="text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john.doe@company.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

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
                <label htmlFor="mobile_phone" className="text-sm font-medium">
                  Mobile Phone
                </label>
                <Input
                  id="mobile_phone"
                  {...register('mobile_phone')}
                  placeholder="(555) 987-6543"
                  disabled={loading}
                />
                {errors.mobile_phone && (
                  <p className="text-sm text-red-600">{errors.mobile_phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social/Professional */}
          <div className="space-y-2">
            <label htmlFor="linkedin_url" className="text-sm font-medium">
              LinkedIn Profile
            </label>
            <Input
              id="linkedin_url"
              {...register('linkedin_url')}
              placeholder="https://www.linkedin.com/in/johndoe"
              disabled={loading}
            />
            {errors.linkedin_url && (
              <p className="text-sm text-red-600">{errors.linkedin_url.message}</p>
            )}
          </div>

          {/* Primary Contact Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_primary_contact"
              checked={isPrimaryContact}
              onCheckedChange={(checked) => setValue('is_primary_contact', !!checked)}
              disabled={loading}
            />
            <label
              htmlFor="is_primary_contact"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Primary Contact for this organization
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this contact"
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