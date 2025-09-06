import { SimpleForm, type SimpleFormField } from '@/components/forms'
import { productSchema, type ProductFormData } from '@/types/validation'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { PRODUCT_CATEGORIES } from '@/constants/product.constants'
import { FOOD_SERVICE_SEGMENTS } from '@/types/organization.types'

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

  // Segment options for new principal creation
  const segmentOptions = FOOD_SERVICE_SEGMENTS.map((segment) => ({
    value: segment,
    label: segment,
    description: getSegmentDescription(segment),
  }))

  // Create field definitions using SimpleForm pattern with logical groupings
  const fields: SimpleFormField[] = [
    // Product Info Section
    {
      type: 'heading',
      label: 'Product Info',
    },
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

    // Pricing Information Section
    {
      type: 'heading',
      label: 'Pricing Information',
    },
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

    // Principal Assignment Section
    {
      type: 'heading',
      label: 'Principal Assignment',
    },
    {
      name: 'principal_mode',
      label: 'Principal Setup',
      type: 'radio',
      options: [
        { value: 'existing', label: 'Select Existing Principal' },
        { value: 'new', label: 'Create New Principal' },
      ],
    },

    // Existing Principal Selection (shown when mode = 'existing')
    {
      name: 'principal_id',
      label: 'Select Principal',
      type: 'select',
      required: true,
      options: principalOrganizations.map((org) => ({
        value: org.id,
        label: org.name,
        description: `${org.type} - ${org.segment || 'No segment'}`,
      })),
      placeholder: 'Select principal',
      condition: (values) => values.principal_mode === 'existing',
    },

    // New Principal Fields (shown when mode = 'new')
    {
      name: 'principal_name',
      label: 'Principal Name',
      type: 'text',
      required: true,
      placeholder: 'Enter principal organization name',
      condition: (values) => values.principal_mode === 'new',
    },
    {
      name: 'principal_segment',
      label: 'Market Segment',
      type: 'select',
      options: segmentOptions,
      placeholder: 'Select market segment (optional)',
      condition: (values) => values.principal_mode === 'new',
    },
    {
      name: 'principal_phone',
      label: 'Principal Phone',
      type: 'tel',
      placeholder: '(555) 123-4567',
      condition: (values) => values.principal_mode === 'new',
    },
    {
      name: 'principal_email',
      label: 'Principal Email',
      type: 'email',
      placeholder: 'contact@principal.com',
      condition: (values) => values.principal_mode === 'new',
    },
    {
      name: 'principal_website',
      label: 'Principal Website',
      type: 'url',
      placeholder: 'https://www.principal.com',
      condition: (values) => values.principal_mode === 'new',
    },

    // Inventory Management Section
    {
      type: 'heading',
      label: 'Inventory Management',
    },
    {
      name: 'min_order_quantity',
      label: 'Minimum Order Quantity',
      type: 'number',
      min: 1,
      placeholder: '1',
    },

    // Product Specifications Section
    {
      type: 'heading',
      label: 'Product Specifications',
    },
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

    // Additional Details Section
    {
      type: 'heading',
      label: 'Additional Details',
    },
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

  // Handle enhanced initial data with principal mode default
  const enhancedInitialData = {
    principal_mode: 'existing' as 'existing' | 'new',
    ...initialData,
  }

  return (
    <SimpleForm<ProductFormData>
      fields={fields}
      onSubmit={onSubmit}
      validationSchema={productSchema}
      defaultValues={enhancedInitialData}
      loading={loading}
      submitLabel={submitLabel}
      showReset={true}
    />
  )
}

// Helper functions for category display
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    dry_goods: 'Dry Goods',
    refrigerated: 'Refrigerated Items',
    frozen: 'Frozen Foods',
    beverages: 'Beverages',
    equipment: 'Equipment & Supplies',
  }
  return labels[category] || category.replace('_', ' ').toUpperCase()
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    dry_goods: 'Canned goods, grains, pasta, and shelf-stable items',
    refrigerated: 'Dairy products, fresh items requiring refrigeration',
    frozen: 'Frozen meals, ice cream, and frozen foods',
    beverages: 'Soft drinks, juices, water, and other beverages',
    equipment: 'Kitchen equipment, supplies, and accessories',
  }
  return descriptions[category] || 'Product category'
}

// Helper function for segment descriptions
function getSegmentDescription(segment: string): string {
  const descriptions: Record<string, string> = {
    'Fine Dining': 'Upscale restaurants with premium service and cuisine',
    'Fast Food': 'Quick service restaurants with limited menus',
    'Fast Casual': 'Higher quality fast food with customizable options',
    'Healthcare': 'Hospitals, clinics, and medical facilities',
    'Education': 'Schools, universities, and educational institutions',
    'Corporate Catering': 'Office buildings and corporate dining',
    'Hotel & Resort': 'Hotels, resorts, and hospitality venues',
    'Entertainment Venue': 'Sports venues, theaters, and entertainment facilities',
    'Retail Food Service': 'Grocery stores and retail food operations',
    'Government': 'Military, government facilities, and public institutions',
    'Senior Living': 'Retirement homes and senior care facilities',
    'Other': 'Other food service segments not listed above',
  }
  return descriptions[segment] || 'Food service segment'
}
