<checklist>

# 📋 CRM Inline Timeline Implementation Checklist for Claude Code

## Phase 1: Create New Timeline Components

### Step 1.1: Create InteractionTimeline Component
- [ ] Create new file: `src/components/interactions/InteractionTimeline.tsx`
- [ ] Import dependencies: `Card, CardHeader, CardContent, CardTitle from '@/components/ui/card'`
- [ ] Import `Button from '@/components/ui/button'`
- [ ] Import `Badge from '@/components/ui/badge'`
- [ ] Import icons: `Plus, Clock, MessageSquare, Phone, Mail, Users, Calendar, FileText, Activity from 'lucide-react'`
- [ ] Import `format, formatDistanceToNow from 'date-fns'`
- [ ] Import `InteractionWithRelations from '@/types/entities'`
- [ ] Import `cn from '@/lib/utils'` for className merging
- [ ] Define InteractionTimelineProps interface with: interactions array, onAddNew callback, onItemClick callback, opportunityId string, loading boolean

### Step 1.2: Create InteractionTimelineItem Component
- [ ] Create new file: `src/components/interactions/InteractionTimelineItem.tsx`
- [ ] Import same UI components as timeline
- [ ] Import `useState from 'react'` for expand/collapse state
- [ ] Import `ChevronDown, ChevronRight, MoreHorizontal from 'lucide-react'`
- [ ] Import DropdownMenu components from `@/components/ui/dropdown-menu`
- [ ] Define props: interaction data, onEdit callback, onDelete callback, isExpanded boolean, onToggleExpand callback
- [ ] Map interaction types to icons using switch statement matching INTERACTION_TYPES from constants
- [ ] Create getInteractionIcon function returning appropriate Lucide icon based on type

### Step 1.3: Create Timeline Loading Skeleton
- [ ] Create new file: `src/components/interactions/InteractionTimelineSkeleton.tsx`
- [ ] Import `Skeleton from '@/components/ui/skeleton'`
- [ ] Create skeleton that matches timeline item height and structure
- [ ] Export component showing 3-5 skeleton items

## Phase 2: Modify Opportunities Page

### Step 2.1: Update Imports in src/pages/Opportunities.tsx
- [ ] Add import for `useInteractionsByOpportunity from '@/hooks/useInteractions'`
- [ ] Add import for new InteractionTimeline component
- [ ] Add import for `useCreateInteraction from '@/hooks/useInteractions'`
- [ ] Add import for InteractionForm component
- [ ] Add import for `Clock, MessageSquare from 'lucide-react'` icons

### Step 2.2: Add State Management
- [ ] Add state: `const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null)`
- [ ] Add state: `const [showAllInteractions, setShowAllInteractions] = useState(false)`
- [ ] Add state: `const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false)`
- [ ] Add hook call: `const { data: opportunityInteractions = [], isLoading: interactionsLoading } = useInteractionsByOpportunity(selectedOpportunityId || '')`
- [ ] Add mutation: `const createInteractionMutation = useCreateInteraction()`
- [ ] Add derived state: `const displayedInteractions = showAllInteractions ? opportunityInteractions : opportunityInteractions.slice(0, 5)`

### Step 2.3: Create Opportunity Detail View
- [ ] After the existing statistics cards section, add conditional rendering for selected opportunity
- [ ] Wrap in: `{selectedOpportunityId && (`
- [ ] Create a new Card component for opportunity details
- [ ] Add CardHeader with opportunity name and close button
- [ ] Add CardContent with opportunity information grid
- [ ] Below opportunity info, embed the InteractionTimeline component

## Phase 3: Integrate Timeline into Opportunity View

### Step 3.1: Add Timeline Section Structure
- [ ] Inside the opportunity detail Card, after the info grid, add new Card for timeline
- [ ] Set Card className to include margin top: `className="mt-4"`
- [ ] Add CardHeader with flex layout: `className="flex flex-row items-center justify-between"`
- [ ] Add title "Activity Timeline" with interaction count badge
- [ ] Add "Log Activity" button in header with Plus icon
- [ ] Set button size="sm" on desktop, size="lg" on mobile using responsive classes

### Step 3.2: Embed Timeline Component
- [ ] In CardContent, add loading check: `{interactionsLoading ? <InteractionTimelineSkeleton /> : ...}`
- [ ] Pass InteractionTimeline with props: interactions={displayedInteractions}
- [ ] Add onAddNew prop that opens interaction dialog with opportunity pre-selected
- [ ] Add onItemClick prop for editing interactions
- [ ] Pass opportunityId prop for context
- [ ] Below timeline, add conditional "Show More" button if more than 5 interactions exist

### Step 3.3: Add Empty State
- [ ] Create empty state when no interactions exist
- [ ] Use centered layout with muted text color
- [ ] Add message: "No activities logged yet"
- [ ] Include call-to-action button: "Log First Activity"
- [ ] Use Activity icon from lucide-react

## Phase 4: Modify Interaction Form for Context

### Step 4.1: Update InteractionForm Component
- [ ] Modify InteractionFormProps to add optional `defaultOpportunityId?: string`
- [ ] Update defaultValues to use: `opportunity_id: initialData?.opportunity_id || defaultOpportunityId || ''`
- [ ] Add conditional to disable opportunity Select when defaultOpportunityId is provided
- [ ] Add helper text when field is disabled: "Linked to current opportunity"

### Step 4.2: Create Add Interaction Dialog
- [ ] In Opportunities.tsx, add Dialog component for new interactions
- [ ] Use same pattern as existing create/edit dialogs
- [ ] Set dialog open state: `open={isInteractionDialogOpen}`
- [ ] Add onOpenChange handler: `onOpenChange={setIsInteractionDialogOpen}`
- [ ] In DialogContent, embed InteractionForm with defaultOpportunityId
- [ ] Pass onSubmit handler that calls createInteractionMutation

### Step 4.3: Handle Form Submission
- [ ] Create handleCreateInteraction async function
- [ ] Call createInteractionMutation.mutateAsync with form data
- [ ] On success, close dialog and show toast.success('Activity logged successfully!')
- [ ] On error, show toast.error('Failed to log activity. Please try again.')
- [ ] Ensure form data includes opportunity_id from selected opportunity

## Phase 5: Add Responsive Styles

### Step 5.1: Update Timeline Component Styles
- [ ] Add responsive padding: `className="p-3 md:p-4"`
- [ ] Set touch target size: add `min-h-[44px]` class to all buttons
- [ ] Add hover states: `hover:bg-gray-50` for desktop only using `md:hover:bg-gray-50`
- [ ] Ensure timeline line uses `border-l-2 border-gray-200`
- [ ] Position timeline dots with `absolute -left-[9px]` positioning

### Step 5.2: Mobile Optimizations
- [ ] Hide secondary information on mobile using `hidden md:block` classes
- [ ] Use relative time on mobile: `className="text-sm text-gray-500 md:hidden"`
- [ ] Use absolute time on desktop: `className="hidden md:block text-sm text-gray-500"`
- [ ] Make interaction items full width on mobile
- [ ] Add bottom padding for thumb reach: `pb-20 md:pb-4`

### Step 5.3: Typography Adjustments
- [ ] Use text-sm for mobile, text-base for desktop on main content
- [ ] Apply line-clamp-2 to descriptions in collapsed state
- [ ] Remove line clamp in expanded state
- [ ] Ensure consistent font weights: font-medium for subjects, normal for descriptions

## Phase 6: Add Interaction Type Styling

### Step 6.1: Create Type-to-Color Mapping
- [ ] Define getInteractionTypeColor function in timeline component
- [ ] Map 'email' to blue badge variant
- [ ] Map 'call' to green badge variant  
- [ ] Map 'meeting' to purple badge variant
- [ ] Map 'demo' to orange badge variant
- [ ] Map 'note' to gray badge variant
- [ ] Map 'follow_up' to yellow badge variant
- [ ] Map 'trade_show' to pink badge variant
- [ ] Map 'site_visit' to indigo badge variant
- [ ] Map 'contract_review' to red badge variant

### Step 6.2: Create Type-to-Icon Mapping
- [ ] Use Mail icon for email type
- [ ] Use Phone icon for call type
- [ ] Use Users icon for meeting type
- [ ] Use Calendar icon for demo type
- [ ] Use FileText icon for note type
- [ ] Use Clock icon for follow_up type
- [ ] Use Activity icon for trade_show type
- [ ] Use MapPin icon for site_visit type
- [ ] Use FileCheck icon for contract_review type

## Phase 7: Add Quick Actions

### Step 7.1: Add Inline Actions to Timeline Items
- [ ] Add DropdownMenu to each timeline item (three dots icon)
- [ ] Include "Edit" option with Pencil icon
- [ ] Include "Delete" option with Trash2 icon
- [ ] Include "Mark Complete" option if follow_up_required is true
- [ ] Add divider between actions using DropdownMenuSeparator

### Step 7.2: Implement Action Handlers
- [ ] Create handleEditInteraction function that opens edit dialog
- [ ] Create handleDeleteInteraction with confirmation using window.confirm
- [ ] Create handleMarkComplete that updates interaction follow_up_required to false
- [ ] Use appropriate mutations from useUpdateInteraction and useDeleteInteraction hooks
- [ ] Show toast notifications for success/error states

### Step 7.3: Add Keyboard Shortcuts
- [ ] Add tabIndex={0} to timeline items for keyboard navigation
- [ ] Add onKeyDown handler for Enter key to expand/collapse
- [ ] Add aria-expanded attribute for accessibility
- [ ] Add aria-label to buttons describing their actions

## Phase 8: Implement Show More/Less

### Step 8.1: Add Pagination Logic
- [ ] Create INITIAL_DISPLAY_COUNT constant set to 5
- [ ] Track displayed count in state
- [ ] Calculate hasMore: `opportunityInteractions.length > displayedInteractions.length`
- [ ] Calculate remaining: `opportunityInteractions.length - displayedInteractions.length`

### Step 8.2: Create Show More Button
- [ ] Place button below timeline items
- [ ] Use full width on mobile: `className="w-full md:w-auto"`
- [ ] Show remaining count: `Show {remaining} More Activities`
- [ ] Use variant="outline" for secondary action
- [ ] Add ChevronDown icon to indicate expansion

### Step 8.3: Add Collapse Option
- [ ] When all items shown, change button to "Show Less"
- [ ] Use ChevronUp icon when expanded
- [ ] Reset to show only initial count when clicked
- [ ] Smooth scroll to top of timeline section after collapse

## Phase 9: Performance Optimizations

### Step 9.1: Optimize Re-renders
- [ ] Wrap InteractionTimelineItem in React.memo
- [ ] Use useCallback for event handlers in parent component
- [ ] Memoize filtered/sorted interactions with useMemo
- [ ] Add key prop using interaction.id for list items

### Step 9.2: Optimize Data Fetching
- [ ] Add enabled condition to useInteractionsByOpportunity: `enabled: !!selectedOpportunityId`
- [ ] Set staleTime on the query to prevent refetches
- [ ] Use queryClient.invalidateQueries after mutations
- [ ] Prefetch interactions when opportunity is hovered (optional)

### Step 9.3: Optimize Bundle Size
- [ ] Import specific icons instead of entire lucide-react
- [ ] Lazy load InteractionForm only when dialog opens
- [ ] Use dynamic imports for date-fns functions
- [ ] Tree-shake unused shadcn/ui components

## Phase 10: Testing & Polish

### Step 10.1: Test Different Data Scenarios
- [ ] Test with 0 interactions (empty state)
- [ ] Test with 1-5 interactions (no pagination)
- [ ] Test with 10+ interactions (pagination needed)
- [ ] Test with very long subject/description text
- [ ] Test with missing optional fields (contact, description)

### Step 10.2: Test Responsive Behavior
- [ ] Test on iPhone SE size (375px width)
- [ ] Test on iPad portrait (768px width)
- [ ] Test on iPad landscape (1024px width)
- [ ] Test on desktop (1440px width)
- [ ] Verify touch targets are 44px minimum on mobile

### Step 10.3: Final Polish
- [ ] Add subtle fade animation when expanding/collapsing items
- [ ] Ensure loading skeleton matches actual content height
- [ ] Verify all toast messages are consistent with existing patterns
- [ ] Check that all icons align properly with text
- [ ] Ensure timeline line connects smoothly between items
- [ ] Test dark mode if implemented in the app
- [ ] Verify print layout hides unnecessary UI elements

## Phase 11: Integration Verification

### Step 11.1: Verify Opportunity Context
- [ ] Confirm opportunity_id is always set on new interactions from timeline
- [ ] Verify interactions refresh immediately after creation
- [ ] Check that interaction count updates in timeline header
- [ ] Ensure opportunity name shows correctly in interaction details

### Step 11.2: Test Navigation Flow
- [ ] Verify clicking opportunity in table shows detail with timeline
- [ ] Test closing opportunity detail returns to table view
- [ ] Ensure browser back button works as expected
- [ ] Check that deep links to specific opportunities work

### Step 11.3: Verify Data Consistency
- [ ] Confirm deleted interactions disappear from timeline
- [ ] Check edited interactions update immediately
- [ ] Verify follow-up indicators show correctly
- [ ] Ensure interaction types display with correct icons/colors

</checklist>