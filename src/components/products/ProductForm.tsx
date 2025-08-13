import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { productSchema, type ProductFormData } from '@/types/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Constants } from '@/types/database.types'
import { useOrganizations } from '@/hooks/useOrganizations'
import type { Product } from '@/types/entities'

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void
  initialData?: Partial<Product>
  loading?: boolean
  submitLabel?: string
}

export function ProductForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Product'
}: ProductFormProps) {
  const { data: organizations = [] } = useOrganizations()
  
  // Filter for principal organizations
  const principalOrganizations = organizations.filter(org => org.type === 'principal')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      principal_id: initialData?.principal_id || '',
      category: initialData?.category || 'dry_goods',
      description: initialData?.description || '',
      sku: initialData?.sku || '',
      unit_of_measure: initialData?.unit_of_measure || '',
      unit_cost: initialData?.unit_cost || null,
      list_price: initialData?.list_price || null,
      min_order_quantity: initialData?.min_order_quantity || null,
      season_start: initialData?.season_start || null,
      season_end: initialData?.season_end || null,
      shelf_life_days: initialData?.shelf_life_days || null,
      storage_requirements: initialData?.storage_requirements || '',
      specifications: initialData?.specifications || ''
    }
  })

  const selectedPrincipal = watch('principal_id')
  const selectedCategory = watch('category')

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Product' : 'New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Product Name *
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Product name"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="sku" className="text-sm font-medium">
                SKU
              </label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="Product SKU"
                disabled={loading}
              />
              {errors.sku && (
                <p className="text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>
          </div>

          {/* Principal Organization and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="principal_id" className="text-sm font-medium">
                Principal Organization *
              </label>
              <Select 
                value={selectedPrincipal} 
                onValueChange={(value) => setValue('principal_id', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select principal organization" />
                </SelectTrigger>
                <SelectContent>
                  {principalOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.principal_id && (
                <p className="text-sm text-red-600">{errors.principal_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category *
              </label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => setValue('category', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.product_category.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
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
              placeholder="Product description"
              disabled={loading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Pricing and Units */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing & Units</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="unit_cost" className="text-sm font-medium">
                  Unit Cost ($)
                </label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  {...register('unit_cost', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.unit_cost && (
                  <p className="text-sm text-red-600">{errors.unit_cost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="list_price" className="text-sm font-medium">
                  List Price ($)
                </label>
                <Input
                  id="list_price"
                  type="number"
                  step="0.01"
                  {...register('list_price', { valueAsNumber: true })}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.list_price && (
                  <p className="text-sm text-red-600">{errors.list_price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="unit_of_measure" className="text-sm font-medium">
                  Unit of Measure
                </label>
                <Input
                  id="unit_of_measure"
                  {...register('unit_of_measure')}
                  placeholder="e.g., case, box, lb"
                  disabled={loading}
                />
                {errors.unit_of_measure && (
                  <p className="text-sm text-red-600">{errors.unit_of_measure.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Order Information</h3>
            <div className="space-y-2">
              <label htmlFor="min_order_quantity" className="text-sm font-medium">
                Minimum Order Quantity
              </label>
              <Input
                id="min_order_quantity"
                type="number"
                {...register('min_order_quantity', { valueAsNumber: true })}
                placeholder="1"
                disabled={loading}
              />
              {errors.min_order_quantity && (
                <p className="text-sm text-red-600">{errors.min_order_quantity.message}</p>
              )}
            </div>
          </div>

          {/* Seasonal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Seasonal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="season_start" className="text-sm font-medium">
                  Season Start (Month 1-12)
                </label>
                <Input
                  id="season_start"
                  type="number"
                  min="1"
                  max="12"
                  {...register('season_start', { valueAsNumber: true })}
                  placeholder="1"
                  disabled={loading}
                />
                {errors.season_start && (
                  <p className="text-sm text-red-600">{errors.season_start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="season_end" className="text-sm font-medium">
                  Season End (Month 1-12)
                </label>
                <Input
                  id="season_end"
                  type="number"
                  min="1"
                  max="12"
                  {...register('season_end', { valueAsNumber: true })}
                  placeholder="12"
                  disabled={loading}
                />
                {errors.season_end && (
                  <p className="text-sm text-red-600">{errors.season_end.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Storage and Shelf Life */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Storage & Shelf Life</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="storage_requirements" className="text-sm font-medium">
                  Storage Requirements
                </label>
                <Textarea
                  id="storage_requirements"
                  {...register('storage_requirements')}
                  placeholder="e.g., Refrigerated, Frozen, Dry storage"
                  disabled={loading}
                  rows={3}
                />
                {errors.storage_requirements && (
                  <p className="text-sm text-red-600">{errors.storage_requirements.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="shelf_life_days" className="text-sm font-medium">
                  Shelf Life (Days)
                </label>
                <Input
                  id="shelf_life_days"
                  type="number"
                  {...register('shelf_life_days', { valueAsNumber: true })}
                  placeholder="365"
                  disabled={loading}
                />
                {errors.shelf_life_days && (
                  <p className="text-sm text-red-600">{errors.shelf_life_days.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <label htmlFor="specifications" className="text-sm font-medium">
              Specifications
            </label>
            <Textarea
              id="specifications"
              {...register('specifications')}
              placeholder="Technical specifications and details"
              disabled={loading}
              rows={4}
            />
            {errors.specifications && (
              <p className="text-sm text-red-600">{errors.specifications.message}</p>
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