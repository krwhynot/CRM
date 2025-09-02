import { SimpleForm, type SimpleFormField } from '@/components/forms'
import { productSchema, type ProductFormData } from '@/types/validation'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { PRODUCT_CATEGORIES } from '@/constants/product.constants'

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void> | void
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

  // Product category options
  const categoryOptions = PRODUCT_CATEGORIES.map((category) => ({
    value: category,
    label: getCategoryLabel(category),
    description: getCategoryDescription(category),
  }))

  // Create field definitions using SimpleForm pattern
  const fields: SimpleFormField[] = [
    // Basic Information
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      placeholder: 'Enter product name',
    },
    {
      name: 'sku',
      label: 'SKU / Product Code',
      type: 'text',
      placeholder: 'e.g. ABC-123',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
      placeholder: 'Product description...',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: categoryOptions,
      placeholder: 'Select category',
    },

    // Pricing Information
    {
      name: 'list_price',
      label: 'List Price',
      type: 'number',
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      name: 'unit_cost',
      label: 'Unit Cost',
      type: 'number',
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      name: 'unit_of_measure',
      label: 'Unit of Measure',
      type: 'text',
      placeholder: 'e.g. Each, Case, Pound',
    },

    // Principal Assignment
    {
      name: 'principal_id',
      label: 'Principal Organization',
      type: 'select',
      required: true,
      options: principalOrganizations.map((org) => ({
        value: org.id,
        label: org.name,
        description: `${org.type} - ${org.segment || 'No segment'}`,
      })),
      placeholder: 'Select principal',
    },

    // Inventory Information
    {
      name: 'min_order_quantity',
      label: 'Minimum Order Quantity',
      type: 'number',
      min: 1,
      placeholder: '1',
    },

    // Seasonal Information
    {
      name: 'season_start',
      label: 'Season Start Month',
      type: 'number',
      min: 1,
      max: 12,
      placeholder: '1-12',
    },
    {
      name: 'season_end',
      label: 'Season End Month',
      type: 'number',
      min: 1,
      max: 12,
      placeholder: '1-12',
    },
    {
      name: 'shelf_life_days',
      label: 'Shelf Life (Days)',
      type: 'number',
      min: 1,
      placeholder: '30',
    },

    // Additional Information
    {
      name: 'storage_requirements',
      label: 'Storage Requirements',
      type: 'textarea',
      rows: 2,
      placeholder: 'Storage and handling requirements...',
    },
    {
      name: 'specifications',
      label: 'Specifications',
      type: 'textarea',
      rows: 3,
      placeholder: 'Product specifications and details...',
    },
  ]

  return (
    <SimpleForm<ProductFormData>
      fields={fields}
      onSubmit={onSubmit}
      validationSchema={productSchema}
      defaultValues={initialData}
      loading={loading}
      submitLabel={submitLabel}
      showReset={true}
    />
  )
}

// Helper functions for category display
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    beverages: 'Beverages',
    dairy: 'Dairy Products',
    frozen: 'Frozen Foods',
    dry_goods: 'Dry Goods',
    produce: 'Fresh Produce',
    meat: 'Meat Products',
    seafood: 'Seafood',
    bakery: 'Bakery Items',
    snacks: 'Snacks & Confections',
    condiments: 'Condiments & Sauces',
    equipment: 'Equipment & Supplies',
  }
  return labels[category] || category.replace('_', ' ').toUpperCase()
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    beverages: 'Soft drinks, juices, water, and other beverages',
    dairy: 'Milk, cheese, yogurt, and dairy products',
    frozen: 'Frozen meals, ice cream, and frozen foods',
    dry_goods: 'Canned goods, grains, pasta, and shelf-stable items',
    produce: 'Fresh fruits, vegetables, and herbs',
    meat: 'Fresh and processed meat products',
    seafood: 'Fresh and processed seafood products',
    bakery: 'Bread, pastries, and baked goods',
    snacks: 'Chips, candy, cookies, and snack foods',
    condiments: 'Sauces, dressings, and flavor enhancers',
    equipment: 'Kitchen equipment, supplies, and accessories',
  }
  return descriptions[category] || 'Product category'
}
