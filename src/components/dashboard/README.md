# Dashboard Components

This directory contains specialized dashboard components for the KitchenPantry CRM analytics and reporting system.

## Components Overview

### PrincipalCard

A comprehensive card component that displays detailed information about principal organizations.

**Features:**
- Real-time opportunity and interaction counts
- Priority-based color coding (A+ to D)
- Last activity tracking
- Total estimated value calculation
- Mobile-responsive design
- Loading states and error handling
- Hover effects for interactivity

**Usage:**
```typescript
import { PrincipalCard } from '@/components/dashboard'
import { Organization } from '@/types/entities'

const principal: Organization = {
  // ... organization data
}

<PrincipalCard principal={principal} />
```

**Props:**
- `principal: Organization` - The principal organization to display
- `className?: string` - Optional CSS classes for styling

### PrincipalCardsGrid

A responsive grid layout that displays multiple PrincipalCard components.

**Features:**
- Responsive grid (1-4 columns based on screen size)
- Loading states with skeleton placeholders
- Error handling with user-friendly messages
- Optional item limit
- Automatic sorting by priority and name

**Usage:**
```typescript
import { PrincipalCardsGrid } from '@/components/dashboard'

<PrincipalCardsGrid maxItems={12} />
```

**Props:**
- `className?: string` - Optional CSS classes
- `maxItems?: number` - Optional limit on displayed items

### PrincipalsDashboard

A complete dashboard view for principal organizations management.

**Features:**
- Key performance indicators (KPIs)
- Summary statistics
- Priority system legend
- Integrated PrincipalCardsGrid
- Quick actions toolbar

**Usage:**
```typescript
import { PrincipalsDashboard } from '@/components/dashboard'

<PrincipalsDashboard />
```

## Priority System

The component uses organization size to determine priority levels:

| Priority | Badge Color | Organization Size | Description |
|----------|-------------|-------------------|-------------|
| A+ | Red | Enterprise | Highest priority principals |
| A | Orange | Large | High priority principals |
| B | Yellow | Medium | Medium priority principals |
| C | Blue | Small | Low priority principals |
| D | Gray | Unassigned | No size specified |

## Data Integration

### Hooks Used
- `usePrincipals()` - Fetches principal organizations
- `useOpportunities()` - Fetches opportunities with filtering
- `useInteractions()` - Fetches interaction history

### Performance Optimizations
- React Query caching with 5-minute stale time
- Client-side filtering for related data
- Memoized calculations for metrics
- Skeleton loading states
- Optimistic updates

### Error Handling
- Graceful degradation on API failures
- User-friendly error messages
- Fallback states for missing data
- Loading state management

## Styling Guidelines

### Design System
- Uses shadcn/ui components for consistency
- Follows Tailwind CSS utility-first approach
- Implements "new-york" style theme
- Mobile-first responsive design

### Color Scheme
- Priority badges use semantic colors
- Muted foreground for secondary text
- Border and background follow theme
- Hover states for interactivity

### Typography
- Clear hierarchy with proper font weights
- Consistent spacing using design tokens
- Accessible contrast ratios
- Responsive text sizing

## Accessibility

- Semantic HTML structure
- Proper ARIA labels where needed
- Keyboard navigation support
- High contrast color schemes
- Screen reader friendly

## Performance Considerations

- Efficient data fetching with React Query
- Memoized calculations to prevent re-renders
- Skeleton loading for perceived performance
- Optimized re-rendering with proper dependencies
- Client-side filtering and sorting

## Integration Examples

### Basic Usage
```typescript
// In a dashboard page
import { PrincipalCard } from '@/components/dashboard'

export function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PrincipalCard principal={principalData} />
    </div>
  )
}
```

### Custom Grid Layout
```typescript
// Custom implementation with filtering
import { PrincipalCardsGrid } from '@/components/dashboard'

export function FilteredPrincipals() {
  return (
    <div className="space-y-6">
      <h2>Top 6 Principals</h2>
      <PrincipalCardsGrid maxItems={6} className="grid-cols-2" />
    </div>
  )
}
```

### Full Dashboard
```typescript
// Complete dashboard implementation
import { PrincipalsDashboard } from '@/components/dashboard'

export function PrincipalsPage() {
  return <PrincipalsDashboard />
}
```

## Future Enhancements

- Click handlers for navigation to detail views
- Export functionality for reports
- Advanced filtering and search
- Real-time updates with WebSocket integration
- Drag-and-drop for priority reordering
- Bulk actions for multiple principals
- Integration with calendar for scheduling
- Advanced analytics and trend visualization

## Testing

Components are designed to be easily testable with:
- Clear prop interfaces
- Predictable data transformations
- Isolated business logic
- Mocked hook dependencies
- Snapshot testing compatibility

```typescript
// Example test setup
import { render } from '@testing-library/react'
import { PrincipalCard } from './PrincipalCard'

const mockPrincipal = {
  id: '1',
  name: 'Test Principal',
  type: 'principal',
  size: 'enterprise',
  // ... other properties
}

test('renders principal information correctly', () => {
  render(<PrincipalCard principal={mockPrincipal} />)
  // ... test assertions
})
```