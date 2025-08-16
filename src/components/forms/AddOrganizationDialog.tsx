"use client"

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'sonner'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Loader2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SelectOption } from './DynamicSelectField'

// Validation schema for organization creation
const organizationSchema = yup.object({
  name: yup.string().required('Organization name is required').min(1, 'Name cannot be empty'),
  type: yup.string().oneOf(['customer', 'principal', 'distributor'], 'Please select a valid organization type').required('Organization type is required'),
  city: yup.string().notRequired(),
  state_province: yup.string().notRequired(),
  email: yup.string().email('Invalid email format').notRequired(),
  website: yup.string().url('Invalid website format').notRequired()
})

type OrganizationFormData = yup.InferType<typeof organizationSchema>

interface AddOrganizationDialogProps {
  trigger?: React.ReactNode
  prefilledName?: string
  onCreated?: (organization: SelectOption) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddOrganizationDialog({
  trigger,
  prefilledName = '',
  onCreated,
  open,
  onOpenChange
}: AddOrganizationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Use controlled or internal state for dialog open
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const form = useForm({
    resolver: yupResolver(organizationSchema) as any,
    defaultValues: {
      name: prefilledName,
      type: 'customer',
      city: '',
      state_province: '',
      email: '',
      website: ''
    }
  })

  // Reset form when dialog opens with prefilled name
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (open && prefilledName !== form.getValues('name')) {
      form.reset({
        name: prefilledName,
        type: 'customer',
        city: '',
        state_province: '',
        email: '',
        website: ''
      })
    }
  }, [setIsOpen, prefilledName, form])

  const handleSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true)
    
    try {
      console.log('🏢 Creating organization:', data)
      
      // Show loading toast
      const loadingToast = toast.loading('Creating organization...', {
        description: `Creating ${data.name}`
      })
      
      const { data: organization, error } = await supabase
        .from('organizations')
        .insert([{
          name: data.name.trim(),
          type: data.type,
          city: data.city?.trim() || null,
          state_province: data.state_province?.trim() || null,
          email: data.email?.trim() || null,
          website: data.website?.trim() || null
        }])
        .select()
        .single()

      if (error) {
        console.error('🏢 Error creating organization:', error)
        toast.dismiss(loadingToast)
        toast.error('Failed to create organization', {
          description: `Error: ${error.message}`
        })
        throw error
      }

      console.log('🏢 Organization created successfully:', organization)

      // Transform to SelectOption format
      const selectOption: SelectOption = {
        value: organization.id,
        label: organization.name,
        description: organization.city && organization.state_province 
          ? `${organization.city}, ${organization.state_province}` 
          : organization.city || organization.state_province || '',
        badge: {
          text: organization.type.toUpperCase(),
          variant: organization.type === 'principal' ? 'default' as const : 
                   organization.type === 'distributor' ? 'secondary' as const : 'outline' as const
        },
        metadata: { type: organization.type }
      }

      // Show success toast
      toast.dismiss(loadingToast)
      toast.success('Organization created successfully!', {
        description: `${organization.name} has been added to your CRM`
      })

      // Call success callback
      onCreated?.(selectOption)

      // Reset form and close dialog
      form.reset()
      setIsOpen(false)

    } catch (error) {
      console.error('🏢 Failed to create organization:', error)
      // Error toast is already shown in the error handling above
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Add Organization
    </Button>
  )

  // Form content that will be shared between Dialog and Sheet
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
        {/* Organization Name */}
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
                  disabled={isLoading}
                  className="h-12 text-base" // Mobile-friendly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organization Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Type *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="City"
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state_province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="State/Province"
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Info */}
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
                  placeholder="contact@organization.com"
                  disabled={isLoading}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="url"
                  placeholder="https://organization.com"
                  disabled={isLoading}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="h-12 text-base order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 text-base order-1 sm:order-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isLoading ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </Form>
  )

  // Mobile-first: use Sheet on small screens, Dialog on larger screens
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>Create New Organization</SheetTitle>
            <SheetDescription>
              Add a new organization to the system. This organization will be available for selection immediately.
            </SheetDescription>
          </SheetHeader>
          <div className="px-1">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Add a new organization to the system. This organization will be available for selection immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  )
}