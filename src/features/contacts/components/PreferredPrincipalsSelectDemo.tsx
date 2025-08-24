/**
 * Demo and Usage Example for PreferredPrincipalsSelect Component
 * 
 * This file demonstrates how to integrate the PreferredPrincipalsSelect
 * component with React Hook Form in the CRM system.
 */

// React import removed - not needed for TSX files in modern React
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PreferredPrincipalsSelect } from './PreferredPrincipalsSelect'

// Example form schema
const demoSchema = yup.object({
  contactName: yup.string().required('Contact name is required'),
  preferredPrincipals: yup.array()
    .of(yup.string().uuid('Invalid principal organization ID'))
    .min(1, 'At least one preferred principal is required')
    .default([])
})

// Use yup.InferType to ensure type alignment
type DemoFormData = yup.InferType<typeof demoSchema>

export function PreferredPrincipalsSelectDemo() {
  const form = useForm<DemoFormData>({
    resolver: yupResolver(demoSchema),
    defaultValues: {
      contactName: '',
      preferredPrincipals: []
    }
  })

  const onSubmit = (data: DemoFormData) => {
    console.log('Form submitted:', data)
    console.log('Selected principals:', data.preferredPrincipals)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Preferred Principals Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Example field */}
            <FormField control={form.control} name="contactName" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <input {...field} className="w-full h-11 px-3 border rounded-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* PreferredPrincipalsSelect Integration */}
            <FormField control={form.control} name="preferredPrincipals" render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Principals</FormLabel>
                <FormControl>
                  <PreferredPrincipalsSelect
                    value={(field.value || []).filter((id): id is string => typeof id === 'string')}
                    onChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full h-11">
              {form.formState.isSubmitting ? 'Saving...' : 'Save Contact'}
            </Button>
          </form>
        </Form>

        {/* Debug Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Form State (Debug)</h4>
          <pre className="text-xs">
            {JSON.stringify(form.getValues(), null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Usage in ContactForm:
 * 
 * 1. Import the component:
 *    import { PreferredPrincipalsSelect } from './PreferredPrincipalsSelect'
 * 
 * 2. Add to form schema (already done in contact.types.ts):
 *    preferred_principals: yup.array()
 *      .of(yup.string().uuid('Invalid principal organization ID'))
 *      .nullable()
 * 
 * 3. Add to default values:
 *    preferred_principals: initialData?.preferred_principals || []
 * 
 * 4. Add FormField to render function:
 *    <FormField control={form.control} name="preferred_principals" render={({ field }) => (
 *      <FormItem>
 *        <FormLabel>Preferred Principals</FormLabel>
 *        <FormControl>
 *          <PreferredPrincipalsSelect
 *            value={field.value || []}
 *            onChange={field.onChange}
 *            disabled={loading}
 *          />
 *        </FormControl>
 *        <FormMessage />
 *      </FormItem>
 *    )} />
 * 
 * Key Features:
 * - Multi-select dropdown for principal organizations
 * - Search/filter functionality
 * - Tag-based display with remove buttons
 * - Proper React Hook Form integration
 * - Loading and error states
 * - Mobile-responsive design
 * - Accessibility support (keyboard navigation)
 * - Consistent with existing form field patterns
 */