# ActivityFeed Component

A comprehensive, real-time activity tracking component for the KitchenPantry CRM system that displays interactions across all CRM entities with advanced filtering, grouping, and real-time capabilities.

## Features

### Core Functionality
- **Real-time Activity Tracking**: Displays recent interactions from the database using existing hooks
- **Multi-entity Activity**: Tracks activity across Organizations, Contacts, Products, Opportunities, and Interactions
- **Activity Types**: Supports Email, Call, Demo, Meeting, Note, Follow-up, Trade Show, Site Visit, and Contract Review interaction types
- **Relationship Mapping**: Shows how activities link between contacts, opportunities, and organizations
- **Time-based Sorting**: Most recent activities first with proper date formatting
- **Activity Filtering**: Allow filtering by interaction type and date range

### Real-time Features
- **Live Activity Stream**: Shows activities as they happen using Supabase real-time subscriptions
- **Activity Grouping**: Groups activities by time periods (today, yesterday, this week, this month, earlier)
- **Activity Context**: Shows relevant context (which opportunity, which contact, which organization)
- **Activity Status**: Tracks completion status and follow-up requirements
- **Manual Refresh**: Refresh button with loading indicator

### UI/UX Features
- **Responsive Design**: Mobile-first responsive design with touch-friendly interactions
- **Visual Hierarchy**: Proper interaction type icons and color coding
- **Loading States**: Skeleton loading states during data fetching
- **Collapsible Groups**: Time-based activity groups can be expanded/collapsed
- **Empty States**: Appropriate messaging when no activities are found

## Usage

### Basic Usage

```tsx
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export function Dashboard() {
  return (
    <div>
      <ActivityFeed />
    </div>
  )
}
```

### Advanced Usage with All Options

```tsx
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import type { InteractionWithRelations } from '@/types/entities'

export function AdvancedDashboard() {
  const handleActivityClick = (activity: InteractionWithRelations) => {
    // Navigate to activity details or related record
    console.log('Activity clicked:', activity)
  }

  return (
    <ActivityFeed
      limit={50}                    // Maximum number of activities to load
      showFilters={true}            // Show filter controls
      enableRealTime={true}         // Enable real-time updates
      onActivityClick={handleActivityClick}  // Handle activity clicks
      className="custom-styling"    // Additional CSS classes
    />
  )
}
```

### Integration Examples

#### Replace Existing Mock Activity Component

```tsx
// Before (using mock data)
import { RecentActivity } from "@/components/recent-activity"

// After (using real data)
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"

export function Dashboard() {
  return (
    <div>
      {/* Replace this */}
      {/* <RecentActivity /> */}
      
      {/* With this */}
      <ActivityFeed 
        limit={25}
        showFilters={true}
        enableRealTime={true}
      />
    </div>
  )
}
```

#### Side-by-side Activity Views

```tsx
<div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
  {/* All Activities */}
  <ActivityFeed
    limit={20}
    showFilters={true}
    enableRealTime={true}
  />
  
  {/* Follow-up Required Activities */}
  <ActivityFeed
    limit={10}
    showFilters={false}
    enableRealTime={true}
    className="h-96"
  />
</div>
```

#### Widget-style Compact View

```tsx
<div className="sidebar">
  <ActivityFeed
    limit={10}
    showFilters={false}
    enableRealTime={true}
    className="h-64"
  />
</div>
```

## Props API

### ActivityFeedProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `limit` | `number` | `50` | Maximum number of activities to display |
| `showFilters` | `boolean` | `true` | Whether to show filter controls |
| `className` | `string` | `''` | Additional CSS classes |
| `onActivityClick` | `(activity: InteractionWithRelations) => void` | `undefined` | Callback when an activity is clicked |
| `enableRealTime` | `boolean` | `true` | Enable real-time updates via Supabase subscriptions |

## Activity Types and Icons

The component supports all interaction types defined in the database schema:

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `call` | Phone | Blue | Phone calls |
| `email` | Mail | Green | Email communications |
| `meeting` | Calendar | Purple | Meetings and appointments |
| `demo` | Target | Orange | Product demonstrations |
| `proposal` | FileText | Indigo | Proposals and quotes |
| `follow_up` | Clock | Yellow | Follow-up activities |
| `trade_show` | Building2 | Red | Trade show interactions |
| `site_visit` | Building2 | Cyan | Site visits |
| `contract_review` | FileText | Gray | Contract reviews |

## Filtering Options

### Type Filters
- All Types
- Individual activity types (Call, Email, Meeting, etc.)

### Date Range Filters
- All Time
- Today
- Yesterday
- This Week
- This Month

## Real-time Updates

The component automatically subscribes to Supabase real-time changes when `enableRealTime` is true:

```typescript
// Automatically handles real-time updates
useEffect(() => {
  if (!enableRealTime) return
  
  const channel = supabase
    .channel('activity-feed-updates')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'interactions',
        filter: 'deleted_at=is.null'
      }, 
      () => {
        refetch() // Refresh data when changes occur
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [enableRealTime, refetch])
```

## Data Integration

### Required Hooks
The component uses the existing CRM hooks:
- `useRecentActivity()` from `@/hooks/useInteractions`
- Automatically includes related data (contacts, organizations, opportunities)

### Database Requirements
- `interactions` table with proper relationships
- `contacts`, `organizations`, `opportunities` tables for context
- Soft delete support (`deleted_at` field)

## Performance Considerations

### Optimization Features
- React Query caching for efficient data fetching
- Memoized filtering and grouping calculations
- Skeleton loading states for better perceived performance
- Pagination support through `limit` prop

### Best Practices
- Use reasonable `limit` values (25-50 for most cases)
- Enable real-time updates only when necessary
- Implement proper activity click handlers for navigation

## Utility Functions

The component uses utility functions from `@/lib/activity-utils.ts`:

```typescript
import {
  groupActivitiesByTime,
  filterActivitiesByDateRange,
  filterActivitiesByType,
  buildActivityContext,
  sortActivityGroups,
  formatActivityDuration
} from '@/lib/activity-utils'
```

These functions are also available for use in other components that need activity processing.

## Styling and Theming

The component uses the existing shadcn/ui design system:
- Consistent with CRM design patterns
- Mobile-responsive layouts
- Proper color coding for activity types
- Touch-friendly interactions

### Custom Styling
Pass additional classes via the `className` prop for custom styling:

```tsx
<ActivityFeed 
  className="border-2 border-blue-500 rounded-lg"
/>
```

## Error Handling

The component includes comprehensive error handling:
- Database connection errors
- Missing relationship data
- Real-time subscription failures
- Loading state management

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatible
- High contrast color schemes
- Focus management

## Browser Support

- Modern browsers with ES2020+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Real-time features require WebSocket support