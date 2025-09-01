import { Package } from 'lucide-react'
import { productSchema } from '@/types/validation'
import { PRODUCT_CATEGORIES } from '@/constants/product.constants'
import type { CoreFormLayoutProps, SelectOption } from '@/components/forms/CoreFormLayout'
import type * as yup from 'yup'

// Product form data type
export type ProductFormData = yup.InferType<typeof productSchema>

// Product category configuration
const categoryOptions: SelectOption[] = PRODUCT_CATEGORIES.map(category => ({
  value: category,
  label: getCategoryLabel(category),
  description: getCategoryDescription(category),
  icon: getCategoryIcon(category)
}))

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'dry_goods': 'Dry Goods',
    'refrigerated': 'Refrigerated',
    'frozen': 'Frozen',
    'beverages': 'Beverages',
    'equipment': 'Equipment'
  }
  return labels[category] || category.replace('_', ' ').toUpperCase()
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    'dry_goods': 'Non-perishable products stored at room temperature',
    'refrigerated': 'Products requiring cold storage (32-40°F)',
    'frozen': 'Products requiring freezer storage (0°F or below)',
    'beverages': 'Liquid products including alcoholic and non-alcoholic drinks',
    'equipment': 'Kitchen equipment, tools, and appliances'
  }
  return descriptions[category] || 'Product category'
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'dry_goods': '📦',
    'refrigerated': '🧊',
    'frozen': '❄️',
    'beverages': '🥤',
    'equipment': '🔧'
  }
  return icons[category] || '📦'
}

// Unit of measure common options
const unitOptions: SelectOption[] = [
  { value: 'each', label: 'Each', description: 'Individual units' },
  { value: 'case', label: 'Case', description: 'Cases or boxes' },
  { value: 'lb', label: 'Pound', description: 'Weight in pounds' },
  { value: 'oz', label: 'Ounce', description: 'Weight in ounces' },
  { value: 'kg', label: 'Kilogram', description: 'Weight in kilograms' },
  { value: 'liter', label: 'Liter', description: 'Volume in liters' },
  { value: 'gallon', label: 'Gallon', description: 'Volume in gallons' }
]

export function createProductFormConfig(
  initialData?: Partial<ProductFormData>
): Omit<CoreFormLayoutProps<ProductFormData>, 'onSubmit'> {
  return {
    entityType: 'product',
    title: 'Product',
    icon: Package,
    formSchema: productSchema,
    initialData,
    
    coreSections: [
      {
        id: 'basic-info',
        title: 'Product Information',
        layout: 'double',
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Product Name',
            placeholder: 'Enter product name',
            required: true,
            className: 'md:col-span-2'
          },
          {
            name: 'sku',
            type: 'text',
            label: 'SKU',
            placeholder: 'Product code or SKU',
            tooltip: 'Stock Keeping Unit - unique product identifier'
          },
          {
            name: 'category',
            type: 'select',
            label: 'Category',
            required: true,
            tooltip: 'Product category for classification and inventory management',
            options: categoryOptions
          }
        ]
      },
      {
        id: 'principal-assignment',
        title: 'Principal Assignment',
        description: 'Assign this product to a principal organization',
        layout: 'single',
        fields: [
          {
            name: 'principal_id',
            type: 'select',
            label: 'Principal Organization',
            required: true,
            tooltip: 'The principal organization that manufactures or supplies this product',
            // Note: options will be populated dynamically from principal organizations data
            options: []
          }
        ]
      }
    ],
    
    optionalSections: [
      {
        id: 'product-details',
        title: 'Product Details',
        layout: 'single',
        fields: [
          {
            name: 'description',
            type: 'textarea',
            label: 'Description',
            placeholder: 'Detailed product description...',
            description: 'Comprehensive product description for sales and marketing'
          },
          {
            name: 'specifications',
            type: 'textarea',
            label: 'Specifications',
            placeholder: 'Technical specifications...',
            description: 'Technical specifications, ingredients, or detailed product attributes'
          }
        ]
      },
      {
        id: 'pricing-inventory',
        title: 'Pricing & Inventory',
        layout: 'double',
        fields: [
          {
            name: 'unit_of_measure',
            type: 'select',
            label: 'Unit of Measure',
            placeholder: 'Select unit type',
            options: unitOptions
          },
          {
            name: 'min_order_quantity',
            type: 'number',
            label: 'Minimum Order Qty',
            placeholder: '1',
            description: 'Minimum quantity required for orders'
          },
          {
            name: 'unit_cost',
            type: 'number',
            label: 'Unit Cost',
            placeholder: '0.00',
            tooltip: 'Cost per unit (for internal calculations)'
          },
          {
            name: 'list_price',
            type: 'number',
            label: 'List Price',
            placeholder: '0.00',
            tooltip: 'Suggested retail or list price'
          }
        ]
      },
      {
        id: 'storage-seasonal',
        title: 'Storage & Seasonal Information',
        layout: 'double',
        fields: [
          {
            name: 'storage_requirements',
            type: 'text',
            label: 'Storage Requirements',
            placeholder: 'e.g., Keep refrigerated at 35-40°F',
            description: 'Special storage or handling requirements',
            className: 'md:col-span-2'
          },
          {
            name: 'shelf_life_days',
            type: 'number',
            label: 'Shelf Life (Days)',
            placeholder: '365',
            description: 'Product shelf life in days'
          },
          {
            name: 'season_start',
            type: 'number',
            label: 'Season Start (Month)',
            placeholder: '1-12',
            description: 'Month when product season begins (1=January)'
          },
          {
            name: 'season_end',
            type: 'number',
            label: 'Season End (Month)',
            placeholder: '1-12',
            description: 'Month when product season ends (12=December)'
          }
        ]
      }
    ],
    
    contextualSections: [
      {
        condition: (values: ProductFormData) => values.category === 'refrigerated' || values.category === 'frozen',
        section: {
          id: 'cold-chain-requirements',
          title: 'Cold Chain Requirements',
          description: 'Additional requirements for temperature-sensitive products',
          fields: [
            {
              name: 'storage_requirements',
              type: 'textarea',
              label: 'Temperature Storage Requirements',
              placeholder: 'Specific temperature ranges and handling requirements...',
              description: 'Detailed cold chain and temperature control requirements'
            }
          ]
        }
      },
      {
        condition: (values: ProductFormData) => Boolean(values.season_start) || Boolean(values.season_end),
        section: {
          id: 'seasonal-notes',
          title: 'Seasonal Product Notes',
          description: 'Additional information for seasonal products',
          fields: [
            {
              name: 'specifications',
              type: 'textarea',
              label: 'Seasonal Availability Notes',
              placeholder: 'Details about seasonal availability, peak times, etc...',
              description: 'Information about peak seasons, availability windows, and seasonal considerations'
            }
          ]
        }
      }
    ]
  }
}

export default createProductFormConfig