# CoreFormLayout Component

The CoreFormLayout component is a foundational, reusable form layout designed for all CRM entities in the Principal CRM system. It provides a consistent, iPad-first user experience with TypeScript safety and shadcn-ui compliance.

## Features

- **iPad-First Design**: 44px minimum touch targets, 16px base font size, single-column layout
- **TypeScript Safety**: Full type safety with React Hook Form integration
- **Progressive Disclosure**: Core fields always visible, optional sections collapsible
- **Entity-Type Awareness**: Supports all 5 CRM entities (organization, contact, product, opportunity, interaction)
- **Accessibility Compliant**: ARIA labels, focus management, screen reader support
- **Performance Optimized**: Memoized components, conditional rendering

## Usage

### Basic Usage

```typescript
import { CoreFormLayout } from '@/components/forms'
import { createOrganizationFormConfig } from '@/configs/forms/organization.config'
import type { OrganizationFormData } from '@/types/organization.types'

function MyOrganizationForm() {
  const handleSubmit = (data: OrganizationFormData) => {
    console.log('Form submitted:', data)
    // Handle form submission
  }

  const formConfig = createOrganizationFormConfig()
  
  return (
    <CoreFormLayout
      {...formConfig}
      onSubmit={handleSubmit}
      submitLabel="Create Organization"
    />
  )
}
```

### With Initial Data

```typescript
function EditOrganizationForm({ organizationId }: { organizationId: string }) {
  const initialData = {
    name: 'Example Restaurant',
    priority: 'B' as const,
    segment: 'Fine Dining',
    is_principal: false,
    is_distributor: true
  }

  const formConfig = createOrganizationFormConfig(initialData)
  
  return (
    <CoreFormLayout
      {...formConfig}
      onSubmit={handleSubmit}
      loading={isSubmitting}
      submitLabel="Update Organization"
    />
  )
}
```

## Configuration

Form configurations are stored in `/src/configs/forms/` and define:

- **Core Sections**: Always visible, essential fields
- **Optional Sections**: Collapsible sections with additional details
- **Contextual Sections**: Conditionally visible based on field values

### Creating a Form Configuration

```typescript
export function createEntityFormConfig(
  initialData?: Partial<EntityFormData>
): Omit<CoreFormLayoutProps<EntityFormData>, 'onSubmit'> {
  return {
    entityType: 'entity',
    title: 'Entity',
    icon: EntityIcon,
    formSchema: entitySchema,
    initialData,
    
    coreSections: [
      {
        id: 'basic-info',
        title: 'Essential Information',
        layout: 'double',
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Entity Name',
            required: true
          }
        ]
      }
    ],
    
    optionalSections: [
      {
        id: 'details',
        title: 'Additional Details',
        fields: [/* ... */]
      }
    ],
    
    contextualSections: [
      {
        condition: (values) => values.someField === 'someValue',
        section: {
          id: 'conditional',
          title: 'Conditional Section',
          fields: [/* ... */]
        }
      }
    ]
  }
}
```

## Component Structure

```
CoreFormLayout/
├── CoreFormLayout.tsx          # Main component
├── index.ts                    # Exports
├── ExampleUsage.tsx           # Usage examples
└── README.md                  # This file
```

## Field Types

Supported field types:
- `text` - Standard text input
- `email` - Email input with validation
- `tel` - Phone number input
- `url` - URL input with validation
- `number` - Numeric input
- `textarea` - Multi-line text
- `select` - Dropdown selection
- `switch` - Boolean toggle
- `checkbox` - Boolean checkbox

## Layout Options

Section layouts:
- `single` - Single column (default)
- `double` - Two columns on md+ screens
- `triple` - Three columns on md+ screens
- `auto` - Responsive: 1 col mobile, 2 col md, 3 col lg

## iPad Optimization

- **Touch Targets**: All interactive elements have 44px minimum height
- **Typography**: 16px base font size prevents iOS zoom
- **Spacing**: Generous gap-4 and space-y-6 for easy touch interaction
- **Single Column**: Primary layout optimized for portrait iPad usage

## Accessibility

- **ARIA Labels**: All form fields have proper labels and descriptions
- **Focus Management**: Logical tab order and focus indicators
- **Screen Readers**: Live regions for status updates
- **Keyboard Navigation**: Full keyboard accessibility

## Performance

- **Memoization**: Expensive calculations are memoized
- **Conditional Rendering**: Hidden sections are not rendered
- **Field-Level Validation**: Real-time validation with debouncing
- **Auto-Save**: Optional draft persistence (configurable)

## Testing

The component is tested with:
- Unit tests for individual field renderers
- Integration tests with real form schemas
- Accessibility tests with axe-core
- Performance tests for large forms

## Migration from Existing Forms

The CoreFormLayout can be gradually adopted:

1. Create configuration for existing form
2. Use `LegacyFormWrapper` for A/B testing
3. Migrate users gradually with feature flags
4. Remove legacy form once migration is complete

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 14+ (iPad optimized)
- Android Chrome 90+

## Dependencies

- React 18+
- React Hook Form 7+
- Yup validation schemas
- shadcn-ui components
- Tailwind CSS