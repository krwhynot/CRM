# PageHeader Component

The `PageHeader` component provides a consistent, accessible header structure for all CRM pages. It replaces feature-specific header implementations with a unified design system component.

## Location & Import

```tsx
import { PageHeader } from '@/components/ui/new/PageHeader'
```

## Props API

### Core Props
- `title: React.ReactNode` - Page title (required)
- `subtitle?: React.ReactNode` - Optional subtitle/description
- `description?: React.ReactNode` - Alias for subtitle (backward compatibility)
- `icon?: React.ReactNode` - Optional icon beside the title
- `className?: string` - Additional CSS classes

### Navigation
- `backButton?: PageHeaderBackButton` - Optional back navigation button

### Actions & Meta
- `actions?: PageHeaderAction[] | React.ReactNode` - Page action buttons
- `meta?: React.ReactNode` - Metadata display (e.g., counts, status)
- `count?: number` - Backward compatibility for simple counts

## Accessibility Features

- **Semantic Structure**: Uses `<header>` element with `data-page-header` attribute
- **ARIA Labels**: All interactive elements include proper ARIA labeling
- **Focus Order**: Logical tab order from back button → title → actions
- **Navigation**: Actions wrapped in `<nav aria-label="Page actions">`

## Responsive Design

- **Mobile-First**: Stacks vertically on small screens, horizontal on desktop
- **Action Wrapping**: Action buttons wrap gracefully on narrow screens
- **Text Truncation**: Long titles handle gracefully with `min-w-0` and `flex-1`

## Usage Examples

### Basic Page Header
```tsx
<PageHeader 
  title="Manage Contacts"
  subtitle="Professional Network & Relationships"
/>
```

### With Count Meta
```tsx
<PageHeader 
  title="Organizations"
  subtitle="Companies and business entities"
  meta={<span className="text-sm text-muted-foreground">({organizations.length})</span>}
/>
```

### With Actions
```tsx
<PageHeader
  title="Opportunities"
  subtitle="Sales pipeline management"
  actions={[
    {
      type: 'button',
      label: 'Add Opportunity',
      onClick: handleAdd,
      icon: <Plus className="h-4 w-4" />,
      'aria-label': 'Create new sales opportunity'
    },
    {
      type: 'link',
      label: 'Export',
      to: '/opportunities/export',
      variant: 'secondary',
      icon: <Download className="h-4 w-4" />
    }
  ]}
/>
```

### With Back Button
```tsx
<PageHeader
  title="Edit Contact"
  backButton={{
    to: '/contacts',
    'aria-label': 'Return to contacts list'
  }}
/>
```

### Custom Actions (React Node)
```tsx
<PageHeader
  title="Dashboard"
  actions={
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </DropdownMenuTrigger>
        {/* ... dropdown content ... */}
      </DropdownMenu>
    </div>
  }
/>
```

## Action Button Configuration

```tsx
interface PageHeaderAction {
  type: 'button' | 'link'
  label: string
  onClick?: () => void
  to?: string
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  icon?: React.ReactNode
  'aria-label'?: string
}
```

## Back Button Configuration

```tsx
interface PageHeaderBackButton {
  to?: string
  onClick?: () => void
  label?: string
  'aria-label'?: string
  icon?: React.ReactNode
}
```

## Migration Guide

### From Feature-Specific Headers

**Before (deprecated - direct import):**
```tsx
import { ContactsPageHeader } from '@/features/contacts/components/ContactsPageHeader'

<ContactsPageHeader 
  contactsCount={contacts.length}
  onAddClick={handleAdd}
/>
```

**After (recommended):**
```tsx
import { PageHeader } from '@/components/ui/new/PageHeader'

<PageHeader
  title="Manage Contacts"
  subtitle="Professional Network & Relationships"  
  meta={<span className="text-sm text-muted-foreground">({contacts.length})</span>}
  actions={[
    {
      type: 'button',
      label: 'Add Contact',
      onClick: handleAdd,
      icon: <Plus className="h-4 w-4" />,
      'aria-label': 'Create new contact'
    }
  ]}
/>
```

### From Manual Headers

**Before:**
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
    <p className="text-sm text-muted-foreground">Inventory management</p>
  </div>
  <Button onClick={handleAdd}>
    <Plus className="h-4 w-4 mr-2" />
    Add Product
  </Button>
</div>
```

**After:**
```tsx
<PageHeader
  title="Products"
  subtitle="Inventory management"
  actions={[
    {
      type: 'button',
      label: 'Add Product',
      onClick: handleAdd,
      icon: <Plus className="h-4 w-4" />
    }
  ]}
/>
```

## Best Practices

1. **Consistent Titles**: Use clear, descriptive page titles that match navigation
2. **Action Hierarchy**: Primary actions first, secondary actions with appropriate variants
3. **Icon Usage**: Include icons for better visual recognition and accessibility
4. **ARIA Labels**: Always provide meaningful ARIA labels for screen readers
5. **Mobile Testing**: Verify layout works well on tablet/mobile viewports

## Architecture Integration

- **EntityManagementTemplate**: Uses PageHeader internally for consistent page structure
- **ESLint Enforcement**: Prevents usage of deprecated feature-specific headers
- **Visual Testing**: Included in visual regression test suites
- **A11y Testing**: Automated accessibility validation for header regions

## Performance Considerations

- **Bundle Size**: Minimal impact (~2KB) with proper tree-shaking
- **Rendering**: No CLS issues with consistent header heights
- **Memoization**: Actions array should be memoized for optimal performance

```tsx
const actions = useMemo(() => [
  { type: 'button', label: 'Add', onClick: handleAdd }
], [handleAdd])

<PageHeader title="Page" actions={actions} />
```

## Testing

The PageHeader component includes comprehensive test coverage:

- **Architecture Tests**: Ensures all pages use PageHeader consistently
- **A11y Tests**: Validates accessibility requirements
- **Visual Tests**: Screenshots for design regression detection
- **Unit Tests**: Props handling and rendering logic