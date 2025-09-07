# Interactions Feature

The interactions feature manages customer communication tracking and activity timelines within the CRM system. This module provides components and hooks for displaying, creating, and managing interactions linked to opportunities, contacts, and organizations.

## Components

### InteractionTimelineEmbed

An embedded timeline component that displays interactions for a specific opportunity with mobile-responsive design and lazy loading support.

**Usage:**
```tsx
import { InteractionTimelineEmbed } from '@/features/interactions/components/InteractionTimelineEmbed'

function OpportunityDetails() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <InteractionTimelineEmbed
      opportunityId="opp-123"
      variant="compact"
      maxHeight="400px"
      onAddNew={() => setShowQuickAdd(true)}
      enabled={isExpanded} // Lazy loading
    />
  )
}
```

**Props:**
- `opportunityId` (string): The opportunity ID to show interactions for
- `maxHeight` (string, optional): Maximum height of timeline container (default: '400px')
- `showEmptyState` (boolean, optional): Show empty state when no interactions (default: true)
- `variant` ('default' | 'compact', optional): Display variant (default: 'compact')
- `onAddNew` (function, optional): Callback for "Add New" button in empty state
- `className` (string, optional): Additional CSS classes
- `enabled` (boolean, optional): Enable data fetching for lazy loading (default: true)

**Features:**
- Mobile-responsive design with touch-optimized interactions
- Lazy loading support for performance optimization
- Expandable interaction items with detailed views
- "Show More/Less" functionality for large datasets
- Color-coded interaction types with icons
- Loading states and error handling
- Empty state with call-to-action

### QuickInteractionBar

A compact form component for quickly adding interactions to opportunities with mobile-optimized touch targets.

**Usage:**
```tsx
import { QuickInteractionBar } from '@/features/interactions/components/QuickInteractionBar'

function OpportunityRow() {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  
  return showQuickAdd && (
    <QuickInteractionBar
      opportunityId="opp-123"
      contactId="contact-456"
      organizationId="org-789"
      onSuccess={() => {
        toast.success('Interaction added!')
        setShowQuickAdd(false)
      }}
      onCancel={() => setShowQuickAdd(false)}
    />
  )
}
```

**Props:**
- `opportunityId` (string): The opportunity ID to create interaction for
- `contactId` (string | null, optional): Associated contact ID
- `organizationId` (string | null, optional): Associated organization ID
- `onSuccess` (function, optional): Callback when interaction is created successfully
- `onCancel` (function, optional): Callback when user cancels the form
- `className` (string, optional): Additional CSS classes

**Features:**
- Auto-fill subject based on interaction type selection
- Mobile-optimized with 44px minimum touch targets
- Real-time form validation with loading states
- Follow-up scheduling with automatic date calculation
- Type selection with visual feedback and icons
- Keyboard-friendly with proper focus management
- Error handling with user-friendly messages

## Hooks

### useInteractionsByOpportunity

Fetches interactions for a specific opportunity with lazy loading support.

**Usage:**
```tsx
import { useInteractionsByOpportunity } from '@/features/interactions/hooks/useInteractions'

function InteractionsList() {
  const { data: interactions, isLoading, error } = useInteractionsByOpportunity(
    'opp-123',
    { enabled: isRowExpanded } // Lazy loading
  )
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage />
  
  return <InteractionsList interactions={interactions} />
}
```

**Parameters:**
- `opportunityId` (string): The opportunity ID to fetch interactions for
- `options` (object, optional):
  - `enabled` (boolean): Whether to fetch data (for lazy loading)

**Returns:**
- TanStack Query result with interaction data
- Automatically includes related contact, organization, and opportunity data
- 2-minute stale time for optimal caching

### useCreateInteraction

Mutation hook for creating new interactions with automatic cache updates.

**Usage:**
```tsx
import { useCreateInteraction } from '@/features/interactions/hooks/useInteractions'

function AddInteractionForm() {
  const createInteraction = useCreateInteraction()
  
  const handleSubmit = async (data) => {
    try {
      await createInteraction.mutateAsync({
        type: 'call',
        subject: 'Follow-up call',
        description: 'Discussed requirements',
        opportunity_id: 'opp-123',
        interaction_date: new Date().toISOString(),
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      toast.success('Interaction added!')
    } catch (error) {
      toast.error('Failed to add interaction')
    }
  }
}
```

## Types

### InteractionType

Valid interaction types supported by the system:

```tsx
type InteractionType = 
  | 'call'
  | 'email' 
  | 'meeting'
  | 'demo'
  | 'proposal'
  | 'follow_up'
  | 'trade_show'
  | 'site_visit'
  | 'contract_review'
```

### InteractionInsert

Data structure for creating new interactions:

```tsx
interface InteractionInsert {
  type: InteractionType
  subject: string
  description?: string | null
  opportunity_id: string
  contact_id?: string | null
  organization_id?: string | null
  interaction_date: string
  duration_minutes?: number | null
  follow_up_required?: boolean
  follow_up_date?: string | null
  follow_up_notes?: string | null
  outcome?: string | null
}
```

### InteractionWithRelations

Full interaction data including related entities:

```tsx
interface InteractionWithRelations extends Interaction {
  contact?: Contact | null
  organization?: Organization | null
  opportunity?: Opportunity | null
}
```

## Mobile Optimization

The interactions feature is optimized for mobile devices, particularly iPad usage:

### Touch Targets
- All interactive elements have minimum 44px touch targets
- Buttons and form controls are sized appropriately for touch
- Touch events are optimized with `touch-manipulation` CSS

### Responsive Layout
- Timeline items have tighter spacing on mobile (space-y-4 vs space-y-6)
- Form layouts adapt to available screen space
- Tab buttons expand to full width on mobile
- Text sizes adjust for mobile readability

### Performance Considerations
- Lazy loading prevents unnecessary data fetching
- Fewer items shown initially on mobile devices
- Optimized re-renders with React.memo and useCallback
- Efficient caching with TanStack Query

### Device-Specific Features
- iPad detection for optimal tablet experience
- Mobile keyboard handling for form inputs
- No auto-focus on mobile to prevent keyboard popup
- Responsive max heights for different screen sizes

## Architecture Decisions

### Lazy Loading Strategy
Interactions are only fetched when opportunity rows are expanded, improving initial page load performance and reducing unnecessary API calls.

### Component Separation
- `InteractionTimelineEmbed`: Read-only timeline display
- `QuickInteractionBar`: Form for creating interactions
- Clear separation allows independent testing and reuse

### Mobile-First Design
Components are designed mobile-first with progressive enhancement for larger screens, ensuring optimal experience across all devices.

### Error Boundaries
All components include proper error handling with fallback UI states to prevent crashes and provide helpful error messages.

### Cache Management
TanStack Query integration provides:
- Automatic cache invalidation after mutations
- Optimistic updates for better UX
- Background refetching for data freshness
- Proper error handling and retry logic

## Testing

### Unit Tests
- Hook functionality and data fetching
- Form validation and submission logic
- Mobile responsiveness and touch targets
- Error handling and edge cases

**Location:** `tests/backend/hooks/` and `tests/components/interactions/`

### Integration Tests
- Complete user flows (expand → add → see update)
- Cross-component communication
- Error scenarios and recovery
- Performance with various data sizes

**Location:** `tests/integration/interactions/`

### Manual Testing
- Device testing (desktop, iPad, mobile)
- Browser compatibility (Chrome, Safari, Firefox)
- Performance testing with different interaction counts
- Accessibility testing

**Checklist:** `docs/testing/MANUAL_TESTING_CHECKLIST.md`

## Performance Guidelines

### Data Loading
- Use lazy loading for interaction timelines
- Implement pagination for large datasets
- Cache interaction data appropriately
- Monitor query performance

### Mobile Performance
- Test on actual devices, not just simulators
- Monitor memory usage with large datasets
- Ensure smooth scrolling and animations
- Optimize touch interactions

### Bundle Size
- Components are tree-shakeable
- Icons are imported individually
- No unnecessary dependencies
- Minimal runtime overhead

## Future Enhancements

### Planned Features
- Real-time updates via WebSocket connections
- Advanced filtering and search capabilities
- Bulk interaction operations
- Export functionality
- Interaction templates

### Performance Improvements
- Virtual scrolling for very large datasets
- More aggressive caching strategies
- Background sync capabilities
- Offline support

### Mobile Enhancements
- Swipe gestures for interaction actions
- Voice-to-text for quick notes
- Camera integration for attachments
- Push notifications for follow-ups

## Migration Guide

### From Legacy Components
If migrating from older interaction components:

1. **Update imports:**
```tsx
// Old
import { InteractionTimeline } from '@/components/InteractionTimeline'

// New
import { InteractionTimelineEmbed } from '@/features/interactions/components/InteractionTimelineEmbed'
```

2. **Update props:**
```tsx
// Old
<InteractionTimeline 
  interactions={interactions}
  loading={loading}
/>

// New
<InteractionTimelineEmbed
  opportunityId={opportunityId}
  enabled={isExpanded}
/>
```

3. **Update hooks:**
```tsx
// Old
const { interactions, loading } = useGetInteractions(opportunityId)

// New
const { data: interactions, isLoading } = useInteractionsByOpportunity(opportunityId)
```

### Breaking Changes
- Component props have been restructured for better TypeScript support
- Hook names have been updated to follow consistent naming patterns
- CSS classes have been updated for better mobile support

---

For more information, see the [Technical Documentation](../../docs/TECHNICAL_GUIDE.md) and [User Guide](../../docs/USER_GUIDE.md).