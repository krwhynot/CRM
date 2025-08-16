import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { productSchema, type ProductFormData } from '@/types/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Constants } from '@/types/database.types'
import { DynamicSelectField, type SelectOption } from '@/components/forms/DynamicSelectField'
import { CollapsibleFormSection, FormSectionPresets } from '@/components/forms/CollapsibleFormSection'
import { FormErrorBoundary } from '@/components/ui/form-error-boundary'
import { supabase } from '@/lib/supabase'
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
  
  
  const form = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      principal_id: initialData?.principal_id ?? '',
      category: initialData?.category ?? 'dry_goods',
      description: initialData?.description ?? '',
      sku: initialData?.sku ?? '',
      unit_of_measure: initialData?.unit_of_measure ?? '',
      unit_cost: initialData?.unit_cost ?? undefined,
      list_price: initialData?.list_price ?? undefined,
      min_order_quantity: initialData?.min_order_quantity ?? undefined,
      season_start: initialData?.season_start ?? undefined,
      season_end: initialData?.season_end ?? undefined,
      shelf_life_days: initialData?.shelf_life_days ?? undefined,
      storage_requirements: initialData?.storage_requirements ?? '',
      specifications: initialData?.specifications ?? ''
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors }
  } = form

  // Async search function for principal organizations
  const searchPrincipalOrganizations = useCallback(async (query: string): Promise<SelectOption[]> => {
    try {
      if (!supabase) {
        console.error('Supabase client not available')
        return []
      }

      let dbQuery = supabase
        .from('organizations')
        .select('id, name, city, state_province')
        .eq('type', 'principal')
        .is('deleted_at', null)
        .order('name')
        .limit(25)

      if (query && query.trim().length >= 1) {
        const trimmedQuery = query.trim()
        dbQuery = dbQuery.or(`name.ilike.%${trimmedQuery}%,city.ilike.%${trimmedQuery}%`)
      }

      const { data, error } = await dbQuery
      if (error) {
        console.error('Database error:', error)
        throw error
      }

      return (data || []).map(org => ({
        value: org.id || '',
        label: org.name || 'Unknown Organization',
        description: org.city && org.state_province 
          ? `${org.city}, ${org.state_province}` 
          : org.city || org.state_province || '',
        badge: {
          text: 'PRINCIPAL',
          variant: 'default' as const
        }
      }))
    } catch (error) {
      console.error('Error searching principal organizations:', error)
      return []
    }
  }, [])

  // Handle quick create principal organization
  const handleCreatePrincipalOrganization = useCallback(async () => {
    console.log('Create new principal organization')
  }, [])

  const selectedCategory = watch('category')

  return (
    <FormErrorBoundary>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>
            {initialData ? 'Edit Product' : 'New Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
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
                <p className="text-sm text-red-600">{errors.name?.message}</p>
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
                <p className="text-sm text-red-600">{errors.sku?.message}</p>
              )}
            </div>
          </div>

          {/* Principal Organization and Category */}
          <CollapsibleFormSection
            {...FormSectionPresets.productBasic}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DynamicSelectField
                name="principal_id"
                control={control}
                label="Principal Organization"
                placeholder="Search and select principal organization..."
                searchPlaceholder="Search principal organizations by name or city..."
                createNewText="Create New Principal Organization"
                disabled={loading}
                required
                onSearch={searchPrincipalOrganizations}
                onCreateNew={handleCreatePrincipalOrganization}
                showCreateWhenEmpty
                clearable
                debounceMs={300}
                minSearchLength={1}
                description="The principal organization that manufactures this product"
              />

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category *
                </label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => setValue('category', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Constants.public?.Enums?.product_category || []).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category?.message}</p>
                )}
              </div>
            </div>
          </CollapsibleFormSection>

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
              <p className="text-sm text-red-600">{errors.description?.message}</p>
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
                  {...register('unit_cost', { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : Number(v)
                  })}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.unit_cost && (
                  <p className="text-sm text-red-600">{errors.unit_cost?.message}</p>
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
                  {...register('list_price', { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : Number(v)
                  })}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.list_price && (
                  <p className="text-sm text-red-600">{errors.list_price?.message}</p>
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
                  <p className="text-sm text-red-600">{errors.unit_of_measure?.message}</p>
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
                {...register('min_order_quantity', { 
                  valueAsNumber: true,
                  setValueAs: (v) => v === '' ? null : Number(v)
                })}
                placeholder="1"
                disabled={loading}
              />
              {errors.min_order_quantity && (
                <p className="text-sm text-red-600">{errors.min_order_quantity?.message}</p>
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
                  {...register('season_start', { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : Number(v)
                  })}
                  placeholder="1"
                  disabled={loading}
                />
                {errors.season_start && (
                  <p className="text-sm text-red-600">{errors.season_start?.message}</p>
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
                  {...register('season_end', { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : Number(v)
                  })}
                  placeholder="12"
                  disabled={loading}
                />
                {errors.season_end && (
                  <p className="text-sm text-red-600">{errors.season_end?.message}</p>
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
                  <p className="text-sm text-red-600">{errors.storage_requirements?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="shelf_life_days" className="text-sm font-medium">
                  Shelf Life (Days)
                </label>
                <Input
                  id="shelf_life_days"
                  type="number"
                  {...register('shelf_life_days', { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : Number(v)
                  })}
                  placeholder="365"
                  disabled={loading}
                />
                {errors.shelf_life_days && (
                  <p className="text-sm text-red-600">{errors.shelf_life_days?.message}</p>
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
              <p className="text-sm text-red-600">{errors.specifications?.message}</p>
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
    </FormErrorBoundary>
  )
}