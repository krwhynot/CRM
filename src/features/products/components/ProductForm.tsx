import { ProgressiveDetails } from '@/components/forms'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import {
  FormValidationFeedback,
  FieldValidationIndicator,
} from '@/components/forms/FormValidationFeedback'
import { useForm } from 'react-hook-form'
import { useFormValidationFeedback } from '@/hooks/useFormValidationFeedback'
import { productSchema, type ProductFormData } from '@/types/validation'
import { createTypedYupResolver } from '@/types/forms'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { PRODUCT_CATEGORIES } from '@/constants/product.constants'

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void
  initialData?: Partial<ProductFormData>
  loading?: boolean
  submitLabel?: string
}

export function ProductForm({
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save Product',
}: ProductFormProps) {
  const { data: organizations = [] } = useOrganizations()
  const principalOrganizations = organizations.filter((org) => org.type === 'principal')

  const form = useForm<ProductFormData>({
    resolver: createTypedYupResolver<ProductFormData>(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      principal_id: initialData?.principal_id || '',
      category: initialData?.category || 'dry_goods',
      description: initialData?.description || '',
      unit_of_measure: initialData?.unit_of_measure || '',
      list_price: initialData?.list_price || null,
      min_order_quantity: initialData?.min_order_quantity || null,
    },
  })

  const validationState = useFormValidationFeedback<ProductFormData>(form.control, {
    requiredFields: ['name', 'sku', 'principal_id'],
    warningValidations: {
      description: (value: unknown) => {
        const str = String(value || '')
        return !str || str.length < 10 ? 'Consider adding a more detailed description' : null
      },
      list_price: (value: unknown) => {
        const num = Number(value || 0)
        return !num || num <= 0 ? 'Adding a price helps with cost calculations' : null
      },
    },
  })

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Product' : 'Add Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form validation feedback */}
            <FormValidationFeedback {...validationState} />

            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Name *</FormLabel>
                    <FieldValidationIndicator
                      hasError={!!fieldState.error}
                      isValid={!fieldState.error && fieldState.isTouched && Boolean(field.value)}
                    />
                  </div>
                  <FormControl>
                    <Input {...field} className="h-11" disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>SKU *</FormLabel>
                    <FieldValidationIndicator
                      hasError={!!fieldState.error}
                      isValid={!fieldState.error && fieldState.isTouched && Boolean(field.value)}
                    />
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      className="h-11"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="principal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select principal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {principalOrganizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ProgressiveDetails buttonText="Add Details">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ''}
                          rows={3}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit_of_measure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className="h-11"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="list_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          type="number"
                          step="0.01"
                          className="h-11"
                          disabled={loading}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="min_order_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Order Qty</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          type="number"
                          className="h-11"
                          disabled={loading}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ProgressiveDetails>

            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? 'Saving...' : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
