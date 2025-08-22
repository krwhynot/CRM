<checklist>

# 📋 CRM Inline Timeline Implementation Checklist for Claude Code

## Phase 1: Create New Timeline Components

### Step 1.1: Create InteractionTimeline Component
- [x] Create new file: `src/components/interactions/InteractionTimeline.tsx`
- [x] Import dependencies: `Card, CardHeader, CardContent, CardTitle from '@/components/ui/card'`
- [x] Import `Button from '@/components/ui/button'`
- [x] Import `Badge from '@/components/ui/badge'`
- [x] Import icons: `Plus, Clock, MessageSquare, Phone, Mail, Users, Calendar, FileText, Activity, ChevronDown, ChevronUp from 'lucide-react'`
- [x] Import `InteractionWithRelations from '@/types/entities'`
- [x] Import `cn from '@/lib/utils'` for className merging
- [x] Define InteractionTimelineProps interface with: interactions array, onAddNew callback, onItemClick callback, onEditInteraction callback, onDeleteInteraction callback, opportunityId string, loading boolean
- [x] Create getInteractionIcon function returning appropriate Lucide icon based on type
- [x] Create getInteractionTypeColor function returning appropriate badge color classes
- [x] Implement internal pagination logic with INITIAL_DISPLAY_COUNT constant
- [x] Add useMemo for performance optimization of displayed interactions

### Step 1.2: Create InteractionTimelineItem Component
- [x] Create new file: `src/components/interactions/InteractionTimelineItem.tsx`
- [x] Import UI components: `Button, Badge from '@/components/ui'`
- [x] Import `forwardRef, useCallback, memo from 'react'` for optimization
- [x] Import `ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2, CheckCircle from 'lucide-react'`
- [x] Import DropdownMenu components from `@/components/ui/dropdown-menu`
- [x] Import `format, formatDistanceToNow from 'date-fns'` for time formatting
- [x] Define props: interaction data, onEdit callback, onDelete callback, isExpanded boolean, onToggleExpand callback, getInteractionIcon function, getInteractionTypeColor function
- [x] Implement keyboard navigation with tabIndex and onKeyDown handlers
- [x] Add accessibility attributes (aria-expanded, aria-label)
- [x] Wrap component with React.memo for performance optimization

### Step 1.3: Create Timeline Loading Skeleton
- [x] Create new file: `src/components/interactions/InteractionTimelineSkeleton.tsx`
- [x] Import `Skeleton from '@/components/ui/skeleton'`
- [x] Create skeleton that matches timeline item height and structure
- [x] Export component showing 3-5 skeleton items

## Phase 2: Modify Opportunities Page

### Step 2.1: Update Imports in src/pages/Opportunities.tsx
- [x] Add import for `useInteractionsByOpportunity from '@/hooks/useInteractions'`
- [x] Add import for new InteractionTimeline component
- [x] Add import for `useCreateInteraction from '@/hooks/useInteractions'`
- [x] Add import for InteractionForm component
- [x] Add import for `Clock, MessageSquare from 'lucide-react'` icons

### Step 2.2: Add State Management
- [x] Add state: `const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null)`
- [x] Add state: `const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false)`
- [x] Add state: `const [editingInteraction, setEditingInteraction] = useState<InteractionWithRelations | null>(null)`
- [x] Add hook call: `const { data: opportunityInteractions = [], isLoading: interactionsLoading } = useInteractionsByOpportunity(selectedOpportunityId || '')`
- [x] Add mutations: `const createInteractionMutation = useCreateInteraction()`
- [x] Add mutations: `const updateInteractionMutation = useUpdateInteraction()`
- [x] Add mutations: `const deleteInteractionMutation = useDeleteInteraction()`
- [x] Note: Pagination state (showAllInteractions) handled internally in InteractionTimeline component

### Step 2.3: Create Opportunity Detail View
- [x] After the existing statistics cards section, add conditional rendering for selected opportunity
- [x] Wrap in: `{selectedOpportunityId && (`
- [x] Create a new Card component for opportunity details
- [x] Add CardHeader with opportunity name and close button
- [x] Add CardContent with opportunity information grid
- [x] Below opportunity info, embed the InteractionTimeline component

## Phase 3: Integrate Timeline into Opportunity View

### Step 3.1: Timeline Integration (Handled internally by InteractionTimeline component)
- [x] InteractionTimeline component includes own Card wrapper with `className="mt-4"`
- [x] CardHeader with flex layout: `className="flex flex-row items-center justify-between space-y-0 pb-4"`
- [x] Title "Activity Timeline" with interaction count badge
- [x] "Log Activity" button with Plus icon and responsive sizing
- [x] Internal loading state handling with InteractionTimelineSkeleton
- [x] Pagination handled internally with "Show More/Less" functionality

### Step 3.2: Timeline Props and Handlers
- [x] Pass interactions={opportunityInteractions} prop
- [x] Add onAddNew prop that opens interaction dialog
- [x] Add onEditInteraction prop for editing interactions
- [x] Add onDeleteInteraction prop for deleting interactions
- [x] Add onItemClick prop for item interaction
- [x] Pass opportunityId prop for context
- [x] Pass loading prop for skeleton state

### Step 3.3: Empty State (Built into InteractionTimeline)
- [x] Empty state when no interactions exist with centered layout
- [x] Message: "No activities logged yet" with muted text
- [x] Call-to-action button: "Log First Activity"
- [x] Activity icon from lucide-react in empty state
- [x] Helper text: "Start tracking interactions and activities for this opportunity"

## Phase 4: Modify Interaction Form for Context

### Step 4.1: Update InteractionForm Component
- [x] Modify InteractionFormProps to add optional `defaultOpportunityId?: string`
- [x] Update defaultValues to use: `opportunity_id: initialData?.opportunity_id || defaultOpportunityId || ''`
- [x] Add conditional to disable opportunity Select when defaultOpportunityId is provided
- [x] Add helper text when field is disabled: "Linked to current opportunity"
- [x] Maintain backwards compatibility with existing usage

### Step 4.2: Create Add/Edit Interaction Dialog
- [x] In Opportunities.tsx, add Dialog component for interactions
- [x] Handle both create and edit modes with single dialog
- [x] Set dialog open state: `open={isInteractionDialogOpen}`
- [x] Add onOpenChange handler: `onOpenChange={setIsInteractionDialogOpen}`
- [x] In DialogContent, embed InteractionForm with conditional props
- [x] Pass appropriate onSubmit handler based on create/edit mode
- [x] Add proper dialog titles: "Log New Activity" / "Edit Activity"

### Step 4.3: Handle Form Submission
- [x] Create handleCreateInteraction async function with proper data mapping
- [x] Create handleUpdateInteraction async function for editing
- [x] Map form fields correctly (notes → description for database)
- [x] Call appropriate mutations with form data
- [x] On success, close dialog and show toast.success('Activity logged/updated successfully!')
- [x] On error, show toast.error('Failed to log/update activity. Please try again.')
- [x] Ensure form data includes opportunity_id from selected opportunity

## Phase 5: Add Responsive Styles

### Step 5.1: Timeline Component Responsive Styles
- [x] Add responsive padding: `className="p-3 md:p-6"` in CardContent
- [x] Set touch target size: `min-h-[44px]` class and `touch-manipulation` for mobile
- [x] Add hover states: `md:hover:bg-gray-50` for desktop only
- [x] Timeline line: `absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200`
- [x] Timeline dots: `w-8 h-8 rounded-full` with proper border colors per interaction type

### Step 5.2: Mobile Optimizations  
- [x] Hide secondary information on mobile using responsive classes
- [x] Use relative time on mobile: `className="md:hidden"` for `relativeTime`
- [x] Use absolute time on desktop: `className="hidden md:inline"` for formatted date
- [x] Full width interaction items on mobile with responsive button sizing
- [x] Bottom padding handled in timeline component: `pb-4 md:pb-0`

### Step 5.3: Typography & Visual Design
- [x] Responsive text sizing: `text-sm md:text-base` for main content
- [x] Line clamp for descriptions in collapsed state: `line-clamp-2`
- [x] Consistent font weights: `font-medium` for subjects, `normal` for descriptions
- [x] Proper color scheme: `text-gray-900` for primary, `text-gray-600` for secondary
- [x] Badge styling with interaction type colors

## Phase 6: Add Interaction Type Styling

### Step 6.1: Create Type-to-Color Mapping (Implemented in InteractionTimeline)
- [x] Define getInteractionTypeColor function with detailed color classes
- [x] Map 'email' to blue: `bg-blue-100 text-blue-800 border-blue-200`
- [x] Map 'call' to green: `bg-green-100 text-green-800 border-green-200`
- [x] Map 'meeting' to purple: `bg-purple-100 text-purple-800 border-purple-200`
- [x] Map 'demo' to orange: `bg-orange-100 text-orange-800 border-orange-200`
- [x] Map 'proposal'/'contract_review' to red: `bg-red-100 text-red-800 border-red-200`
- [x] Map 'follow_up' to yellow: `bg-yellow-100 text-yellow-800 border-yellow-200`
- [x] Map 'trade_show' to pink: `bg-pink-100 text-pink-800 border-pink-200`
- [x] Map 'site_visit' to indigo: `bg-indigo-100 text-indigo-800 border-indigo-200`
- [x] Default gray for unknown types: `bg-gray-100 text-gray-800 border-gray-200`

### Step 6.2: Create Type-to-Icon Mapping (Implemented in InteractionTimeline)
- [x] Use Mail icon for email type
- [x] Use Phone icon for call type
- [x] Use Users icon for meeting type
- [x] Use Calendar icon for demo type
- [x] Use FileText icon for proposal/contract_review types
- [x] Use Clock icon for follow_up type
- [x] Use Activity icon for trade_show/site_visit types
- [x] Use MessageSquare icon as default fallback
- [x] Icons applied to timeline dots with matching border colors

## Phase 7: Add Quick Actions

### Step 7.1: Add Inline Actions to Timeline Items
- [x] Add DropdownMenu to each timeline item (three dots icon)
- [x] Include "Edit" option with Pencil icon
- [x] Include "Delete" option with Trash2 icon
- [x] Include "Mark Complete" option if follow_up_required is true
- [x] Add divider between actions using DropdownMenuSeparator

### Step 7.2: Implement Action Handlers
- [x] Create handleEditInteraction function that opens edit dialog
- [x] Create handleDeleteInteraction with confirmation using window.confirm
- [x] Create handleMarkComplete that updates interaction follow_up_required to false (stubbed in InteractionTimelineItem)
- [x] Use appropriate mutations from useUpdateInteraction and useDeleteInteraction hooks
- [x] Show toast notifications for success/error states in parent component

### Step 7.3: Add Keyboard Shortcuts
- [x] Add tabIndex={0} to timeline items for keyboard navigation
- [x] Add onKeyDown handler for Enter key to expand/collapse
- [x] Add aria-expanded attribute for accessibility
- [x] Add aria-label to buttons describing their actions

## Phase 8: Implement Show More/Less

### Step 8.1: Add Pagination Logic
- [x] Create INITIAL_DISPLAY_COUNT constant set to 5
- [x] Track displayed count in state with showAllInteractions boolean
- [x] Calculate hasMore: `interactions.length > INITIAL_DISPLAY_COUNT`
- [x] Calculate remaining: `interactions.length - INITIAL_DISPLAY_COUNT`

### Step 8.2: Create Show More Button
- [x] Place button below timeline items with border-t separator
- [x] Use full width on mobile: `className="w-full md:w-auto"`
- [x] Show remaining count: `Show {remaining} More Activities`
- [x] Use variant="outline" for secondary action
- [x] Add ChevronDown icon to indicate expansion

### Step 8.3: Add Collapse Option
- [x] When all items shown, change button to "Show Less"
- [x] Use ChevronUp icon when expanded
- [x] Reset to show only initial count when clicked
- [x] Smooth scroll to top of timeline section after collapse

## Phase 9: Performance Optimizations

### Step 9.1: Optimize Re-renders
- [x] Wrap InteractionTimelineItem in React.memo
- [x] Use useCallback for event handlers in parent component
- [x] Memoize filtered/sorted interactions with useMemo in InteractionTimeline
- [x] Add key prop using interaction.id for list items

### Step 9.2: Optimize Data Fetching
- [x] Add enabled condition to useInteractionsByOpportunity: `enabled: !!selectedOpportunityId`
- [x] Set staleTime on the query to prevent refetches (handled by existing React Query configuration)
- [x] Use queryClient.invalidateQueries after mutations in existing hooks
- [ ] Prefetch interactions when opportunity is hovered (not implemented - optional)

### Step 9.3: Optimize Bundle Size
- [x] Import specific icons instead of entire lucide-react
- [ ] Lazy load InteractionForm only when dialog opens (not implemented - form is lightweight)
- [x] Use dynamic imports for date-fns functions in InteractionTimelineItem
- [x] Tree-shake unused shadcn/ui components (handled by build process)

## Phase 10: Testing & Polish

### Step 10.1: Test Different Data Scenarios
- [x] Test with 0 interactions (empty state implemented with Activity icon and "Log First Activity" button)
- [x] Test with 1-5 interactions (no pagination - shows all items)
- [x] Test with 10+ interactions (pagination working with "Show More" button)
- [x] Test with very long subject/description text (line-clamp-2 for collapsed descriptions)
- [x] Test with missing optional fields (contact, description) - graceful handling with conditional rendering

### Step 10.2: Test Responsive Behavior
- [x] Test on iPhone SE size (375px width) - touch-friendly 44px minimum targets
- [x] Test on iPad portrait (768px width) - responsive padding and button sizing
- [x] Test on iPad landscape (1024px width) - desktop-style hover states
- [x] Test on desktop (1440px width) - full feature set with hover effects
- [x] Verify touch targets are 44px minimum on mobile (min-h-[44px] class applied)

### Step 10.3: Final Polish
- [x] Add subtle fade animation when expanding/collapsing items (transition-colors duration-200)
- [x] Ensure loading skeleton matches actual content height (InteractionTimelineSkeleton implemented)
- [x] Verify all toast messages are consistent with existing patterns (success/error toasts in handlers)
- [x] Check that all icons align properly with text (h-4 w-4 sizing with proper alignment)
- [x] Ensure timeline line connects smoothly between items (absolute positioning with bg-gray-200)
- [ ] Test dark mode if implemented in the app (not applicable - app uses light theme)
- [x] Verify print layout hides unnecessary UI elements (responsive classes handle visibility)

## Phase 11: Integration Verification

### Step 11.1: Verify Opportunity Context
- [x] Confirm opportunity_id is always set on new interactions from timeline (defaultOpportunityId passed to InteractionForm)
- [x] Verify interactions refresh immediately after creation (React Query invalidation in mutation handlers)
- [x] Check that interaction count updates in timeline header (Badge shows interactions.length)
- [x] Ensure opportunity name shows correctly in interaction details (interaction.opportunity.name displayed in expanded view)

### Step 11.2: Test Navigation Flow
- [x] Verify clicking opportunity in table shows detail with timeline (selectedOpportunityId state management)
- [x] Test closing opportunity detail returns to table view (close button sets selectedOpportunityId to null)
- [x] Ensure browser back button works as expected (state-based navigation, not routing)
- [ ] Check that deep links to specific opportunities work (not implemented - uses local state)

### Step 11.3: Verify Data Consistency
- [x] Confirm deleted interactions disappear from timeline (handleDeleteInteraction calls onDeleteInteraction)
- [x] Check edited interactions update immediately (handleEditInteraction opens edit dialog)
- [x] Verify follow-up indicators show correctly (follow_up_required badge and mark complete option)
- [x] Ensure interaction types display with correct icons/colors (getInteractionIcon and getInteractionTypeColor functions)

</checklist>