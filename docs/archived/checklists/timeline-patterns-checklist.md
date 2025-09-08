<checklist>

# 📋 Inline Timeline Pattern Implementation Checklist

## Phase 1: Planning & Preparation
### Research & Analysis
- [ ] Review existing InteractionsTable component to identify reusable elements
- [ ] Document current useInteractionsByOpportunity hook parameters and return structure
- [ ] List all interaction types currently supported (email, call, demo, meeting, etc.)
- [ ] Identify which interaction fields should display in timeline view vs detail view
- [ ] Determine optimal number of interactions to show initially (recommend 5-10)
- [ ] Map out loading states, empty states, and error states needed

### Design Decisions
- [ ] Decide on timeline orientation (left-border vs centered line vs cards)
- [ ] Choose date display format for mobile (relative time) vs desktop (absolute time)
- [ ] Determine interaction grouping strategy (by day, individual, or continuous)
- [ ] Define collapsed vs expanded states for each interaction item
- [ ] Establish color coding system for different interaction types
- [ ] Plan icon usage for each interaction type

## Phase 2: Layout Scaffolding
### Opportunity Page Modifications
- [ ] Add new section container below opportunity details card
- [ ] Create responsive grid wrapper that handles iPad and desktop layouts
- [ ] Add spacing utilities between opportunity info and timeline section
- [ ] Ensure section maintains max-width constraints for readability
- [ ] Test layout at key breakpoints (mobile: 375px, iPad: 768px, desktop: 1024px+)

### Timeline Container Structure
- [ ] Create timeline section card with header and content areas
- [ ] Add section title "Activity Timeline" or "Recent Interactions"
- [ ] Position "Log Activity" button in header (right-aligned on desktop, full-width on mobile)
- [ ] Add interaction count badge next to section title
- [ ] Create scrollable container for timeline items with proper overflow handling
- [ ] Add bottom padding for iPad thumb-reach comfort zone

## Phase 3: Component Logic
### Data Fetching
- [ ] Import useInteractionsByOpportunity hook in opportunity detail component
- [ ] Pass current opportunity.id to the hook
- [ ] Handle loading state while interactions fetch
- [ ] Implement error boundary for failed interaction fetches
- [ ] Sort interactions by date (most recent first)
- [ ] Slice array to show initial set (5-10 items)

### State Management
- [ ] Add local state for expanded/collapsed timeline items
- [ ] Create state for "show all" vs "show limited" interactions
- [ ] Track which interactions user has interacted with (for read/unread styling)
- [ ] Manage dialog open/close state for new interaction form
- [ ] Store user's view preference (compact/expanded) in localStorage

### Interaction Handlers
- [ ] Create handler for "Log Activity" button click
- [ ] Implement expand/collapse toggle for individual timeline items
- [ ] Add "Show More" button handler to load additional interactions
- [ ] Create click handler for timeline items (navigate to edit or view details)
- [ ] Implement quick action handlers (edit, delete) for each timeline item
- [ ] Add keyboard navigation support between timeline items

## Phase 4: Timeline Item Component
### Visual Structure
- [ ] Create timeline item container with consistent padding
- [ ] Add vertical line connector (border-left or pseudo-element)
- [ ] Position timeline dot/icon on the line
- [ ] Create header row with interaction type badge and timestamp
- [ ] Add subject line with proper text truncation
- [ ] Include description preview with line clamping (2-3 lines)
- [ ] Add contact name and organization if different from opportunity

### Interactive Elements
- [ ] Make entire timeline item clickable/tappable
- [ ] Add hover state for desktop (background color change)
- [ ] Implement touch feedback for iPad (tap highlight)
- [ ] Create action menu (three dots) for edit/delete options
- [ ] Add expansion chevron if item has more content
- [ ] Include follow-up indicator if follow-up is required

## Phase 5: Styling & Theming
### Responsive Styles
- [ ] Set minimum touch target size of 44px for iPad
- [ ] Adjust padding and margins for mobile vs desktop
- [ ] Hide/show different elements based on screen size
- [ ] Implement flexible typography scaling
- [ ] Ensure timeline line connects properly at all sizes
- [ ] Test landscape orientation on iPad

### Visual Polish
- [ ] Apply color coding to interaction type badges
- [ ] Add subtle animations for expand/collapse
- [ ] Implement smooth scroll when loading more items
- [ ] Style active/hover/focus states consistently
- [ ] Add loading skeleton that matches timeline item height
- [ ] Create empty state illustration or message

### Dark Mode Support
- [ ] Define dark mode color palette for timeline elements
- [ ] Adjust timeline line and dot colors for visibility
- [ ] Ensure sufficient contrast for all text elements
- [ ] Test interaction type badge colors in dark mode
- [ ] Verify hover states remain visible

## Phase 6: Accessibility
### Keyboard Navigation
- [ ] Add tabindex to timeline items and actions
- [ ] Implement arrow key navigation between items
- [ ] Enable Enter key to expand/collapse items
- [ ] Add keyboard shortcut for "Log Activity" (e.g., Cmd+N)
- [ ] Ensure focus indicators are clearly visible
- [ ] Test tab order flows logically

### Screen Reader Support
- [ ] Add descriptive aria-labels to all buttons
- [ ] Include aria-expanded for collapsible items
- [ ] Set proper heading hierarchy for timeline section
- [ ] Add aria-live region for new interactions
- [ ] Include screen reader only text for relative timestamps
- [ ] Test with VoiceOver (iPad) and NVDA/JAWS (desktop)

### Visual Accessibility
- [ ] Ensure color coding isn't sole indicator of information
- [ ] Maintain WCAG AA contrast ratios (4.5:1 for text)
- [ ] Add icons alongside color badges for interaction types
- [ ] Test with Windows High Contrast mode
- [ ] Verify timeline is usable at 200% zoom

## Phase 7: Interaction Behavior
### Form Integration
- [ ] Modify InteractionForm to accept defaultOpportunityId prop
- [ ] Pre-select current opportunity in form dropdown
- [ ] Disable opportunity field when opened from opportunity page
- [ ] Add form validation to ensure opportunity_id is always set
- [ ] Implement optimistic UI update after form submission
- [ ] Refresh timeline immediately after new interaction created

### Quick Actions
- [ ] Add inline edit capability for interaction subject/description
- [ ] Implement swipe-to-delete on iPad (with confirmation)
- [ ] Create quick status update buttons (mark complete, requires follow-up)
- [ ] Add one-tap options for common interaction types
- [ ] Enable drag-to-reorder for manual sorting (optional)

### Performance Optimizations
- [ ] Implement virtual scrolling if more than 20 items
- [ ] Add pagination or infinite scroll for large datasets
- [ ] Cache interaction data to prevent refetches
- [ ] Debounce rapid expand/collapse actions
- [ ] Lazy load interaction details on expansion
- [ ] Preload next batch when user nears bottom

## Phase 8: Testing & Refinement
### Functional Testing
- [ ] Test with 0, 1, 5, 50+ interactions
- [ ] Verify opportunity_id is always set on new interactions
- [ ] Confirm timeline updates immediately after CRUD operations
- [ ] Test filter/sort functionality if implemented
- [ ] Verify deep linking to specific interactions works
- [ ] Test offline behavior and error recovery

### Device Testing
- [ ] Test on iPad (portrait and landscape orientations)
- [ ] Verify on iPad Mini and iPad Pro sizes
- [ ] Test on iPhone for mobile experience
- [ ] Verify desktop experience at various resolutions
- [ ] Test with both touch and mouse inputs
- [ ] Verify print layout looks acceptable

### User Testing
- [ ] Conduct 5-minute usability test with 3-5 users
- [ ] Measure time to find most recent interaction
- [ ] Test discoverability of "Log Activity" button
- [ ] Verify users understand collapsed vs expanded states
- [ ] Gather feedback on initial number of items shown
- [ ] Ask about missing features or confusion points

## Phase 9: Documentation & Deployment
### Documentation
- [ ] Update component documentation with timeline props
- [ ] Document accessibility features and keyboard shortcuts
- [ ] Create usage examples for common scenarios
- [ ] Write troubleshooting guide for common issues
- [ ] Add performance considerations to technical docs

### Deployment Preparation
- [ ] Run full test suite including new timeline tests
- [ ] Check bundle size impact of new components
- [ ] Verify no breaking changes to existing interaction features
- [ ] Test database query performance with production data
- [ ] Create feature flag if rolling out gradually
- [ ] Prepare rollback plan if issues arise

### Post-Deployment
- [ ] Monitor error logs for timeline-related issues
- [ ] Track interaction creation rate changes
- [ ] Measure page load time impact
- [ ] Gather user feedback through in-app survey
- [ ] Document any bug fixes or adjustments needed
- [ ] Plan iteration based on usage analytics

</checklist>