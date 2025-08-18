import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Loader2 } from 'lucide-react'
import * as yup from 'yup'

// UI Components
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'

// Business Logic
import { useCreateOrganization } from '@/hooks/useOrganizations'
import type { Organization } from '@/types/entities'
import { toast } from 'sonner'

// Quick create schema - simplified for modal creation
const organizationQuickCreateSchema = yup.object({
  name: yup
    .string()
    .required('Organization name is required')
    .max(255, 'Name must be 255 characters or less')
    .trim(),
  type: yup
    .string()
    .nullable()
    .oneOf([
      'restaurant',
      'hotel', 
      'catering',
      'healthcare',
      'education',
      'corporate',
      'government',
      'non-profit',
      null
    ], 'Invalid organization type'),
  segment: yup
    .string()
    .nullable()
    .max(100, 'Segment must be 100 characters or less')
    .trim(),
  size: yup
    .string()
    .nullable()
    .oneOf(['Small', 'Medium', 'Large', 'Enterprise', null], 'Invalid organization size')
})

type OrganizationQuickCreateData = yup.InferType<typeof organizationQuickCreateSchema>

interface OrganizationCreateModalProps {
  onSuccess: (organization: Organization) => void
  onCancel?: () => void
}

export function OrganizationCreateModal({ 
  onSuccess, 
  onCancel 
}: OrganizationCreateModalProps) {
  const form = useForm<OrganizationQuickCreateData>({
    resolver: yupResolver(organizationQuickCreateSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      type: null,
      segment: null,
      size: null,
    }
  })

  const createOrganization = useCreateOrganization()

  const handleSubmit = async (data: OrganizationQuickCreateData) => {
    try {
      const organization = await createOrganization.mutateAsync({
        name: data.name.trim(),
        type: data.type || null,
        segment: data.segment?.trim() || null,
        size: data.size || null,
        // Default values for quick creation
        is_active: true,
        priority: 'Medium',
        is_principal: false,
        is_distributor: false,
      })
      
      onSuccess(organization)
      form.reset()
      
      toast.success('Organization created successfully', {
        description: `${organization.name} has been added to your organizations.`
      })
    } catch (error) {
      console.error('Failed to create organization:', error)
      toast.error('Failed to create organization', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    }
  }

  const organizationTypes = [
    { value: 'restaurant', label: 'Restaurant', description: 'Full-service restaurants, fast food, cafes' },
    { value: 'hotel', label: 'Hotel', description: 'Hotels, resorts, hospitality venues' },
    { value: 'catering', label: 'Catering', description: 'Catering companies, event services' },
    { value: 'healthcare', label: 'Healthcare', description: 'Hospitals, clinics, care facilities' },
    { value: 'education', label: 'Education', description: 'Schools, universities, institutions' },
    { value: 'corporate', label: 'Corporate', description: 'Corporate dining, office cafeterias' },
    { value: 'government', label: 'Government', description: 'Government facilities, military' },
    { value: 'non-profit', label: 'Non-Profit', description: 'Non-profit organizations, charities' },
  ]

  const organizationSizes = [
    { value: 'Small', label: 'Small', description: '1-50 employees' },
    { value: 'Medium', label: 'Medium', description: '51-200 employees' },
    { value: 'Large', label: 'Large', description: '201-1000 employees' },
    { value: 'Enterprise', label: 'Enterprise', description: '1000+ employees' },
  ]

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Create New Organization</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          
          {/* Organization Name - Required */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter organization name"
                    className="h-11"
                    disabled={createOrganization.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Organization Type - Optional */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                  disabled={createOrganization.isPending}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Organization Size - Optional */}
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                  disabled={createOrganization.isPending}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select size (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizationSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{size.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {size.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Market Segment - Optional */}
          <FormField
            control={form.control}
            name="segment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Market Segment</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., Fine Dining, Quick Service, Specialty"
                    className="h-11"
                    disabled={createOrganization.isPending}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Optional: Specify the market segment or specialization
                </p>
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={createOrganization.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createOrganization.isPending || !form.formState.isValid}
              className="min-w-[120px]"
            >
              {createOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </DialogFooter>

          {/* Quick Info Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Quick Create</h4>
            <p className="text-xs text-blue-700">
              This creates a basic organization record. You can add more details like 
              address, contacts, and preferences later from the organization page.
            </p>
          </div>

        </form>
      </Form>
    </DialogContent>
  )
}

export default OrganizationCreateModal