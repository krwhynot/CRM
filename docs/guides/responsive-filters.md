# Responsive Filters Guide

A comprehensive guide to using and implementing responsive filters in the KitchenPantry CRM using the ResponsiveFilterWrapper system.

## Overview

The ResponsiveFilterWrapper system provides automatic responsive filter layouts that adapt seamlessly between mobile drawer, tablet sheet, and desktop inline modes. The system features special optimizations for iPad devices and enterprise workflows.

## Quick Start

### Basic Usage

```tsx
import { ResponsiveFilterWrapper } from '@/components/data-table/filters/ResponsiveFilterWrapper'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

// Wrap your component with FilterLayoutProvider
<FilterLayoutProvider>
  <ResponsiveFilterWrapper
    entityType="contacts"
    filters={filters}
    onFiltersChange={setFilters}
    title="Filter Contacts"
    description="Refine your contact search"
  />
</FilterLayoutProvider>
```

### DataTable Integration

```tsx
import { DataTable } from '@/components/data-table/data-table'

<DataTable
  data={contacts}
  columns={contactColumns}
  useResponsiveFilters={true}
  entityType="contacts"
  entityFilters={filters}
  onEntityFiltersChange={setFilters}
  responsiveFilterTitle="Contact Filters"
  responsiveFilterDescription="Find the contacts you need"
/>
```

## Architecture

### Component Hierarchy

```
FilterLayoutProvider (Context)
├── ResponsiveFilterWrapper (Smart wrapper)
│   ├── FilterTriggerButton (Mobile/Tablet trigger)
│   ├── StandardSheet (Overlay container)
│   └── EntityFilters (Filter content)
└── useFilterLayout hooks (State management)
```

### Device Behavior

| Device | Mode | Layout | Trigger |
|--------|------|--------|---------|
| Mobile | Drawer | Bottom sheet | Filter button |
| Tablet Portrait | Sheet | Side panel | Filter button |
| Tablet Landscape | Inline | Embedded | None |
| Desktop | Inline | Embedded | None |
| iPad Portrait | Drawer | Bottom sheet | Filter button |
| iPad Landscape | Inline | Embedded | None |

## Implementation Patterns

### 1. Basic Entity Filters

Simple responsive filters for standard entity lists:

```tsx
import { ResponsiveFilterWrapper } from '@/components/data-table/filters/ResponsiveFilterWrapper'
import { type EntityFilterState } from '@/components/data-table/filters/EntityFilters'

function ContactsList() {
  const [filters, setFilters] = useState<EntityFilterState>({})

  return (
    <FilterLayoutProvider>
      <ResponsiveFilterWrapper
        entityType="contacts"
        filters={filters}
        onFiltersChange={setFilters}
        principals={principals}
        showTimeRange={true}
        showQuickFilters={true}
      />
      <DataTable
        data={contacts}
        columns={contactColumns}
        // ... other props
      />
    </FilterLayoutProvider>
  )
}
```

### 2. DataTable Integration

Using the integrated approach with DataTable:

```tsx
function ProductsList() {
  const [filters, setFilters] = useState<EntityFilterState>({})

  return (
    <FilterLayoutProvider>
      <DataTable
        data={products}
        columns={productColumns}
        useResponsiveFilters={true}
        entityType="products"
        entityFilters={filters}
        onEntityFiltersChange={setFilters}
        responsiveFilterTitle="Product Filters"
        responsiveFilterDescription="Filter products by category, price, and availability"
        showTimeRange={false}
        showPrincipalFilter={true}
        showStatusFilter={true}
      />
    </FilterLayoutProvider>
  )
}
```

### 3. Custom Filter Layouts

Advanced customization with custom triggers and content:

```tsx
function OpportunitiesList() {
  const [filters, setFilters] = useState<EntityFilterState>({})
  const { isOpen, toggleFilters } = useResponsiveFilterWrapper()

  const customTrigger = (
    <Button
      variant="outline"
      onClick={toggleFilters}
      className="flex items-center gap-2"
    >
      <Filter className="h-4 w-4" />
      Advanced Filters
      {activeFilterCount > 0 && (
        <Badge variant="secondary">{activeFilterCount}</Badge>
      )}
    </Button>
  )

  return (
    <FilterLayoutProvider>
      <ResponsiveFilterWrapper
        entityType="opportunities"
        filters={filters}
        onFiltersChange={setFilters}
        customTrigger={customTrigger}
        lazyRender={true}
        showTimeRange={true}
        showPrincipalFilter={true}
        showStatusFilter={true}
        showPriorityFilter={true}
      />
    </FilterLayoutProvider>
  )
}
```

## Filter Configuration

### Entity Filter State

All filters use the standardized `EntityFilterState` interface:

```tsx
interface EntityFilterState {
  // Text search
  search?: string

  // Selection filters
  principal?: string
  status?: string
  priority?: string

  // Time-based filters
  timeRange?: 'all' | 'week' | 'month' | 'quarter' | 'year'
  startDate?: string
  endDate?: string

  // Quick filters (entity-specific)
  quickView?: string
  category?: string

  // Advanced filters (extensible)
  [key: string]: any
}
```

### Common Filter Props

```tsx
interface ResponsiveFilterWrapperProps {
  // Required
  entityType: 'organizations' | 'contacts' | 'opportunities' | 'products' | 'interactions'
  filters: EntityFilterState
  onFiltersChange: (filters: EntityFilterState) => void

  // Display
  title?: string
  description?: string

  // Behavior
  layoutModeOverride?: 'inline' | 'sheet' | 'drawer' | 'auto'
  forceInline?: boolean
  lazyRender?: boolean

  // Customization
  customTrigger?: React.ReactNode
  wrapperClassName?: string
  triggerClassName?: string

  // Entity-specific options
  principals?: Array<{ value: string; label: string }>
  statuses?: Array<{ value: string; label: string }>
  priorities?: Array<{ value: string; label: string }>

  // Feature toggles
  showTimeRange?: boolean
  showQuickFilters?: boolean
  showPrincipalFilter?: boolean
  showStatusFilter?: boolean
  showPriorityFilter?: boolean

  // Events
  onLayoutModeChange?: (mode: FilterLayoutMode) => void
  onOpenChange?: (open: boolean) => void
}
```

## Migration from Legacy Filters

### Step 1: Replace Filter Components

**Before:**
```tsx
import { ContactsFilters } from '@/features/contacts/components/ContactsFilters'

function ContactsPage() {
  return (
    <div>
      <ContactsFilters filters={filters} onFiltersChange={setFilters} />
      <ContactsList />
    </div>
  )
}
```

**After:**
```tsx
import { ResponsiveFilterWrapper } from '@/components/data-table/filters/ResponsiveFilterWrapper'
import { FilterLayoutProvider } from '@/contexts/FilterLayoutContext'

function ContactsPage() {
  return (
    <FilterLayoutProvider>
      <ResponsiveFilterWrapper
        entityType="contacts"
        filters={filters}
        onFiltersChange={setFilters}
      />
      <ContactsList />
    </FilterLayoutProvider>
  )
}
```

### Step 2: Update DataTable Configuration

**Before:**
```tsx
<DataTable
  data={products}
  columns={productColumns}
  filters={<ProductsFilters />}
/>
```

**After:**
```tsx
<DataTable
  data={products}
  columns={productColumns}
  useResponsiveFilters={true}
  entityType="products"
  entityFilters={filters}
  onEntityFiltersChange={setFilters}
/>
```

### Step 3: Convert Filter State

Map existing filter interfaces to `EntityFilterState`:

```tsx
// Legacy filter interface
interface ContactWeeklyFilters {
  search: string
  principal: string
  decisionMakers: boolean
  recentInteractions: boolean
  needsFollowUp: boolean
}

// Migration function
function convertToEntityFilterState(legacy: ContactWeeklyFilters): EntityFilterState {
  return {
    search: legacy.search,
    principal: legacy.principal,
    quickView: legacy.decisionMakers ? 'decision-makers'
      : legacy.recentInteractions ? 'recent-interactions'
      : legacy.needsFollowUp ? 'needs-follow-up'
      : 'all'
  }
}
```

## Device-Specific Optimizations

### iPad Enterprise Support

The system provides special handling for iPad devices:

```tsx
// iPad-specific behavior
const isIPad = useIsIPad()
const orientation = useOrientation()

// iPad portrait = drawer mode (like mobile)
// iPad landscape = inline mode (like desktop)
const recommendedMode = isIPad
  ? (orientation === 'portrait' ? 'drawer' : 'inline')
  : 'auto'
```

### Touch Optimizations

- **44px minimum touch targets** (Apple guidelines)
- **Enhanced touch feedback** with active states
- **Scroll optimization** with `overscroll-contain`
- **Touch manipulation** CSS for better responsiveness

### Performance Features

- **Lazy rendering**: Filters only render when overlay is open
- **React.memo optimization**: Automatic component memoization
- **Efficient state management**: Minimal re-renders with proper dependency tracking
- **Orientation tracking**: Smooth iPad rotation handling

## Advanced Usage

### Custom Hooks

```tsx
import { useResponsiveFilterWrapper } from '@/components/data-table/filters/ResponsiveFilterWrapper'

function MyCustomComponent() {
  const {
    currentMode,
    isOverlayMode,
    isOpen,
    deviceContext,
    isIPad,
    orientation,
    openFilters,
    closeFilters,
    toggleFilters
  } = useResponsiveFilterWrapper()

  // Custom logic based on current state
  useEffect(() => {
    if (isIPad && orientation === 'landscape') {
      // iPad landscape-specific behavior
    }
  }, [isIPad, orientation])
}
```

### Performance Monitoring

```tsx
import { ResponsiveFilterWrapperUtils } from '@/components/data-table/filters/ResponsiveFilterWrapper'

// Check if current mode is optimal for device
const isOptimal = ResponsiveFilterWrapperUtils.isModeOptimal(
  currentMode,
  deviceContext,
  isIPad
)

// Get recommended mode for device
const recommended = ResponsiveFilterWrapperUtils.getRecommendedMode(
  deviceContext,
  isIPad,
  orientation
)

// Calculate transition performance impact
const transitionCost = ResponsiveFilterWrapperUtils.getTransitionCost(
  fromMode,
  toMode
)
```

### Feature Flags

```tsx
import { FEATURE_FLAGS } from '@/lib/feature-flags'

// Gradual rollout support
<DataTable
  useResponsiveFilters={FEATURE_FLAGS.ENABLE_RESPONSIVE_FILTERS}
  // ... fallback to legacy patterns when disabled
/>
```

## Best Practices

### 1. Context Providers

Always wrap at the appropriate level:

```tsx
// ✅ Good: App or page level
function App() {
  return (
    <FilterLayoutProvider>
      <Routes>
        <Route path="/contacts" element={<ContactsPage />} />
      </Routes>
    </FilterLayoutProvider>
  )
}

// ❌ Bad: Component level
function ContactsList() {
  return (
    <FilterLayoutProvider>
      <ResponsiveFilterWrapper {...props} />
    </FilterLayoutProvider>
  )
}
```

### 2. Performance Optimization

```tsx
// ✅ Enable lazy rendering for complex filters
<ResponsiveFilterWrapper
  lazyRender={true}
  // ... other props
/>

// ✅ Use React.memo for expensive filter components
const CustomFilterComponent = React.memo(function CustomFilterComponent({ ... }) {
  // Component implementation
})
```

### 3. Accessibility

```tsx
// ✅ Provide descriptive titles and descriptions
<ResponsiveFilterWrapper
  title="Contact Filters"
  description="Search and filter contacts by name, company, role, and interaction history"
  // ... other props
/>
```

### 4. Testing

```tsx
// Test across device orientations
import { useOrientation, useIsIPad } from '@/hooks/useMediaQuery'

// Monitor filter state during layout transitions
const handleLayoutModeChange = (mode: FilterLayoutMode) => {
  console.log('Layout mode changed to:', mode)
  // Ensure filter state is preserved
}
```

## Troubleshooting

### Common Issues

**1. Filters not responding on mobile/tablet**
- Ensure `FilterLayoutProvider` is wrapped at appropriate level
- Check that `useResponsiveFilters={true}` is set on DataTable

**2. iPad orientation changes causing issues**
- Verify iPad detection is working: `useIsIPad()` hook
- Check orientation tracking: `useOrientation()` hook
- Ensure smooth transitions with proper state management

**3. Performance issues with complex filters**
- Enable `lazyRender={true}` for overlay modes
- Use `React.memo` for expensive filter components
- Monitor re-renders with React DevTools

**4. Context not available errors**
- Add `FilterLayoutProvider` at app/page level
- Use `forceInline={true}` as fallback for components without context

### Debug Tools

```tsx
// Enable debug mode for layout development
<FilterLayoutProvider debug={true}>
  {/* Components */}
</FilterLayoutProvider>

// Log filter state changes
const handleFiltersChange = (filters: EntityFilterState) => {
  console.log('Filters changed:', filters)
  setFilters(filters)
}
```

## Migration Checklist

- [ ] Install `FilterLayoutProvider` at app/page level
- [ ] Replace legacy filter components with `ResponsiveFilterWrapper`
- [ ] Update DataTable to use `useResponsiveFilters={true}`
- [ ] Convert filter state to `EntityFilterState` interface
- [ ] Test responsive behavior across devices
- [ ] Verify iPad orientation handling
- [ ] Enable performance optimizations (`lazyRender`, `React.memo`)
- [ ] Add proper accessibility attributes
- [ ] Test with feature flags for gradual rollout
- [ ] Validate filter state preservation during layout transitions

## Related Documentation

- [FilterLayoutProvider Context](/src/contexts/FilterLayoutContext.tsx)
- [EntityFilters Component](/src/components/data-table/filters/EntityFilters.tsx)
- [DataTable Integration](/src/components/data-table/data-table.tsx)
- [ResponsiveFilterWrapper Migration Plan](/.docs/plans/responsive-filters-migration/parallel-plan.md)
- [Architecture Overview](/.docs/plans/responsive-filters-migration/shared.md)