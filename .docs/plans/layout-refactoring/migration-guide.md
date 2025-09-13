# PageLayout Migration Guide

This guide helps you migrate from the old template-based layout system (`EntityManagementTemplate`) to the new slot-based `PageLayout` system.

## Table of Contents

- [Why Migrate?](#why-migrate)
- [Quick Migration with `usePageLayout`](#quick-migration-with-usepageLayout)
- [Manual Migration Steps](#manual-migration-steps)
- [Composite Slot Components](#composite-slot-components)
- [Filter Sidebar Integration](#filter-sidebar-integration)
- [Complete Examples](#complete-examples)
- [Storybook Documentation](#storybook-documentation)
- [Troubleshooting](#troubleshooting)

## Why Migrate?

The new slot-based PageLayout system offers significant advantages:

- **5-10x faster development** for adding new UI elements
- **Direct composition** - any ReactNode in any slot
- **Better TypeScript support** with direct prop passing
- **Flexible filtering** with optional sidebar support
- **Consistent spacing** using semantic design tokens
- **Mobile-first responsive design**
- **Easier testing** with predictable component structure

## Quick Migration with `usePageLayout`

The fastest way to migrate is using the `usePageLayout` hook, which automatically generates common page elements:

### Before (EntityManagementTemplate)
```tsx
import { EntityManagementTemplate } from '@/components/layout'

function OrganizationsPage() {
  return (
    <EntityManagementTemplate
      entityType="ORGANIZATION"
      entityCount={organizations.length}
      onAddClick={openCreateDialog}
      headerActions={[
        { label: 'Export', onClick: handleExport, variant: 'outline' },
        { label: 'Add Organization', onClick: openCreateDialog, primary: true },
      ]}
    >
      <OrganizationsTable />
    </EntityManagementTemplate>
  )
}
```

### After (PageLayout with usePageLayout hook)
```tsx
import { PageLayout, usePageLayout } from '@/components/layout'

function OrganizationsPage() {
  const { pageLayoutProps } = usePageLayout({
    entityType: 'ORGANIZATION',
    entityCount: organizations.length,
    onAddClick: openCreateDialog,
  })

  return (
    <PageLayout {...pageLayoutProps}>
      <OrganizationsTable />
    </PageLayout>
  )
}
```

### With Additional Actions
```tsx
const { pageLayoutProps } = usePageLayout({
  entityType: 'ORGANIZATION',
  entityCount: organizations.length,
  onAddClick: openCreateDialog,
  headerActions: (
    <Button variant="outline" onClick={handleExport}>
      <Download className="size-4" />
      Export
    </Button>
  ),
})
```

## Manual Migration Steps

For more control, you can migrate manually by mapping template props to slots:

### 1. Title and Subtitle
```tsx
// Old
<EntityManagementTemplate entityType="CONTACT" />

// New
<PageLayout
  title="Contacts"
  subtitle="Manage contacts and their relationships"
/>
```

### 2. Actions Slot
```tsx
// Old
headerActions={[
  { label: 'Export', onClick: handleExport, variant: 'outline' },
  { label: 'Add', onClick: handleAdd, primary: true },
]}

// New
actions={
  <ActionGroup
    actions={[
      {
        type: 'button',
        label: 'Export',
        onClick: handleExport,
        variant: 'outline',
        icon: <Download className="size-4" />,
      },
      {
        type: 'button',
        label: 'Add Contact',
        onClick: handleAdd,
        icon: <Plus className="size-4" />,
      },
    ]}
  />
}
```

### 3. Meta Information
```tsx
// Old - computed internally from entityCount
// New - explicit control
meta={
  <MetaBadge
    items={[
      { type: 'count', value: contacts.length, label: 'contacts' },
      { type: 'status', value: 'synced', color: 'success' },
    ]}
  />
}
```

## Composite Slot Components

The new system includes three composite components for common slot patterns:

### ActionGroup
For organizing multiple actions with consistent spacing:
```tsx
<ActionGroup
  actions={[
    {
      type: 'button',
      label: 'Export',
      onClick: handleExport,
      variant: 'outline',
      icon: <Download className="size-4" />,
    },
    {
      type: 'custom',
      component: <StatusFilter />,
    },
    {
      type: 'button',
      label: 'Add Item',
      onClick: handleAdd,
      icon: <Plus className="size-4" />,
    },
  ]}
  spacing="sm"
  direction="horizontal"
/>
```

### MetaBadge
For displaying meta information with consistent formatting:
```tsx
<MetaBadge
  items={[
    { type: 'count', value: 342, label: 'contacts' },
    { type: 'badge', label: 'Active', value: '89%', variant: 'secondary' },
    { type: 'status', value: 'healthy', color: 'success' },
  ]}
  spacing="sm"
  separator={true}
/>
```

### FilterGroup
For organizing filter controls into collapsible sections:
```tsx
<FilterGroup
  groups={[
    {
      id: 'search',
      title: 'Search',
      icon: <Search className="h-4 w-4" />,
      defaultExpanded: true,
      controls: [
        {
          type: 'search',
          id: 'query',
          label: 'Search organizations',
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Type to search...',
        },
      ],
    },
    {
      id: 'type',
      title: 'Organization Type',
      icon: <Building2 className="h-4 w-4" />,
      badge: activeFilter !== 'all' ? '1' : undefined,
      controls: [
        {
          type: 'select',
          id: 'orgType',
          label: 'Type',
          value: selectedType,
          onChange: setSelectedType,
          options: [
            { label: 'All Types', value: 'all' },
            { label: 'Customers', value: 'customer', count: 89 },
            { label: 'Distributors', value: 'distributor', count: 67 },
          ],
        },
      ],
    },
  ]}
/>
```

## Filter Sidebar Integration

The new system supports an optional collapsible filter sidebar:

### Basic Filter Sidebar
```tsx
<PageLayout
  title="Organizations"
  withFilterSidebar={true}
  filterSidebarConfig={{
    persistKey: 'organizations-filters',
    defaultCollapsed: false,
  }}
  filters={
    <FilterGroup
      groups={filterSections}
    />
  }
>
  <OrganizationsTable />
</PageLayout>
```

### Mobile-Responsive Filters
The filter sidebar automatically becomes a sheet modal on mobile devices. No additional configuration needed.

## Complete Examples

### Simple Page Migration
```tsx
// Before
function ProductsPage() {
  return (
    <ProductManagementTemplate
      onAddClick={openCreateDialog}
    >
      <ProductsTable />
    </ProductManagementTemplate>
  )
}

// After
function ProductsPage() {
  const { pageLayoutProps } = usePageLayout({
    entityType: 'PRODUCT',
    entityCount: products.length,
    onAddClick: openCreateDialog,
  })

  return (
    <PageLayout {...pageLayoutProps}>
      <ProductsTable />
    </PageLayout>
  )
}
```

### Complex Page with Filters
```tsx
// Before (lots of boilerplate filter code)
function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // 68+ lines of filter UI code...

  return (
    <OrganizationManagementTemplate
      onAddClick={openCreateDialog}
      headerActions={[
        { label: 'Export', onClick: handleExport },
        { label: 'Add Organization', onClick: openCreateDialog },
      ]}
    >
      <div className="flex gap-6">
        <div className="w-80">
          {/* Complex filter sidebar code... */}
        </div>
        <div className="flex-1">
          <OrganizationsTable />
        </div>
      </div>
    </OrganizationManagementTemplate>
  )
}

// After (68 lines removed!)
function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const { pageLayoutProps } = usePageLayout({
    entityType: 'ORGANIZATION',
    entityCount: filteredOrganizations.length,
    onAddClick: openCreateDialog,
    headerActions: (
      <span className="text-sm text-muted-foreground">
        {filteredOrganizations.length} of {organizations.length}
      </span>
    ),
    filters: (
      <FilterGroup
        groups={[
          {
            id: 'search',
            title: 'Search',
            icon: <Search className="h-4 w-4" />,
            defaultExpanded: true,
            controls: [
              {
                type: 'search',
                id: 'query',
                label: 'Search organizations',
                value: searchTerm,
                onChange: setSearchTerm,
                placeholder: 'Type to search...',
              },
            ],
          },
          // More filter groups...
        ]}
      />
    ),
    withFilterSidebar: true,
  })

  return (
    <PageLayout {...pageLayoutProps}>
      <OrganizationsTable />
    </PageLayout>
  )
}
```

### Custom Slot Composition
```tsx
function DashboardPage() {
  return (
    <PageLayout
      title="Dashboard"
      subtitle="Overview of your CRM metrics"
      meta={
        <MetaBadge
          items={[
            { type: 'count', value: 1247, label: 'total contacts' },
            { type: 'status', value: 'healthy', color: 'success' },
          ]}
        />
      }
      actions={
        <ActionGroup
          actions={[
            {
              type: 'custom',
              component: (
                <Select defaultValue="30d">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                  </SelectContent>
                </Select>
              ),
            },
            {
              type: 'button',
              label: 'Export Report',
              onClick: handleExportReport,
              variant: 'outline',
              icon: <Download className="size-4" />,
            },
          ]}
        />
      }
    >
      <DashboardContent />
    </PageLayout>
  )
}
```

## Storybook Documentation

Comprehensive Storybook documentation is available at `http://localhost:6006` when you run:

```bash
npm run storybook
```

The Storybook includes:
- **PageLayout** - Main layout component with all slot examples
- **ActionGroup** - Action composition patterns
- **MetaBadge** - Meta information display patterns
- **FilterGroup** - Filter organization patterns

Each story includes interactive controls and detailed documentation.

## Troubleshooting

### Common Migration Issues

#### 1. Missing Types
If you see TypeScript errors about missing types:
```tsx
// Add proper imports
import type { PageLayoutProps } from '@/components/layout'
```

#### 2. Slot Content Not Rendering
Make sure you're passing ReactNode, not functions:
```tsx
// Wrong
actions={() => <Button>Add</Button>}

// Correct
actions={<Button>Add</Button>}
```

#### 3. Filter Sidebar Not Working
Ensure you set both props:
```tsx
<PageLayout
  withFilterSidebar={true}  // Enable the sidebar
  filters={<YourFilters />} // Provide filter content
>
```

#### 4. Responsive Issues
The layout is mobile-first. Test on different screen sizes:
- Mobile: < 768px (filter sidebar becomes sheet)
- Tablet: 768px+ (filter sidebar visible)
- Desktop: 1024px+ (full layout)

### Migration Checklist

- [ ] Identify template type (`EntityManagementTemplate`, `OrganizationManagementTemplate`, etc.)
- [ ] Choose migration approach (usePageLayout vs manual)
- [ ] Map template props to slots
- [ ] Replace action arrays with ActionGroup
- [ ] Convert filter UI to FilterGroup (if applicable)
- [ ] Add meta information with MetaBadge
- [ ] Test responsive behavior
- [ ] Update any tests that reference old template structure
- [ ] Remove old template imports

### Performance Considerations

The new slot-based system is generally more performant:
- **Reduced bundle size** - only load components you use
- **Better tree shaking** - unused slot components are eliminated
- **Simpler re-renders** - direct composition reduces prop drilling
- **Semantic tokens** - consistent spacing without style recalculation

### Backward Compatibility

The old template system remains available through `TemplateAdapter` during the migration period:
- All existing template components still work
- Deprecation warnings in development mode
- Will be removed in a future major version

```tsx
// Still works, but deprecated
import { EntityManagementTemplate } from '@/components/layout'
```

## Getting Help

If you encounter issues during migration:

1. **Check Storybook** - Run `npm run storybook` for interactive examples
2. **Review existing migrations** - Look at migrated pages like Organizations.tsx
3. **Use TypeScript** - The compiler will catch most slot composition issues
4. **Test mobile responsiveness** - Especially with filter sidebars
5. **Check the console** - Development mode shows helpful warnings

The slot-based system is designed to be more intuitive and flexible than the template system. Most migrations should be straightforward with the `usePageLayout` hook!