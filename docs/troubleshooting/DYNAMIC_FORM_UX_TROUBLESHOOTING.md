# Dynamic Form UX Troubleshooting Guide

**Kitchen Pantry CRM System - Comprehensive Troubleshooting Knowledge Base**

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [User-Facing Issues](#user-facing-issues)
3. [Developer/Technical Issues](#developertechnical-issues)
4. [Common Error Messages & Solutions](#common-error-messages--solutions)
5. [Performance Optimization](#performance-optimization)
6. [Accessibility Issues](#accessibility-issues)
7. [Integration Troubleshooting](#integration-troubleshooting)
8. [Known Issues & Workarounds](#known-issues--workarounds)
9. [Diagnostic Procedures](#diagnostic-procedures)
10. [Escalation Paths](#escalation-paths)

---

## Quick Reference

### Emergency Commands
```bash
# Development server issues
npm run dev                    # Restart development server
npm run build                  # Check for build errors
npm run type-check             # TypeScript validation

# Database connectivity
mcp__supabase__execute_sql --query="SELECT 1"

# Component testing
mcp__playwright__browser_navigate --url="http://localhost:3000"
```

### Common Fix Patterns
- **Form validation errors**: Check Yup schema alignment with TypeScript types
- **Dropdown not loading**: Verify async search debounce and database queries
- **Mobile responsiveness**: Test Dialog/Sheet component switching at 768px
- **Performance issues**: Enable debounce (300ms), limit results (25 items)

---

## User-Facing Issues

### 🔍 Dynamic Dropdown Search Issues

#### **Issue**: Dynamic dropdown search not returning results
**Tags**: `search`, `dropdown`, `async`, `user-experience`

**Symptoms**:
- User types in search field but no results appear
- Loading indicator shows but search completes with empty results
- Previously working search suddenly stops returning data

**Diagnostic Steps**:
1. **Check Network Tab**: Verify API calls are being made
2. **Verify Search Query**: Ensure minimum 2 characters for async search
3. **Check Database**: Confirm organizations/contacts exist in database
4. **Test Direct Query**: 
   ```bash
   mcp__supabase__execute_sql --query="SELECT name FROM organizations WHERE name ILIKE '%test%' LIMIT 5"
   ```

**Solutions**:
- **Empty Database**: Ensure test data exists in target entity tables
- **RLS Policy Issues**: Verify user has read access to entity data
- **Search Term Too Short**: Dynamic search requires 2+ characters minimum
- **Network Issues**: Check browser Network tab for failed requests

**Code Example**:
```tsx
// Verify async search implementation
const searchOrganizations = async (query: string): Promise<SelectOption[]> => {
  if (query.length < 2) return []
  
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, type')
    .ilike('name', `%${query}%`)
    .limit(25)
  
  if (error) throw error
  return data.map(org => ({ value: org.id, label: org.name }))
}
```

---

#### **Issue**: Form validation errors with dynamic fields
**Tags**: `validation`, `forms`, `react-hook-form`, `yup`

**Symptoms**:
- "Invalid organization ID" error appears
- Form submission blocked despite selecting valid option
- Validation errors persist after correcting field values

**Diagnostic Steps**:
1. **Check Browser Console**: Look for validation-related errors
2. **Verify Form State**: Use React Developer Tools to inspect form values
3. **Test Schema Validation**: Manually validate form data against Yup schema

**Solutions**:
- **Required Field Missing**: Ensure all required fields have values
- **Type Mismatch**: Verify selected IDs match expected string format
- **Schema Mismatch**: Align Yup schema with actual form data structure

**Prevention**:
```tsx
// Proper TypeScript + Yup alignment
const contactSchema = yup.object({
  organization_id: yup.string().required('Organization is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required')
})

type ContactFormData = yup.InferType<typeof contactSchema>
```

---

#### **Issue**: Organization creation dialog not working
**Tags**: `modal`, `creation`, `TODO`, `known-issue`

**Symptoms**:
- Clicking "Create New Organization" shows error or no response
- Modal appears but form doesn't function properly
- Console shows "TODO: handleCreateOrganization" message

**Current Status**: **KNOWN ISSUE** - Organization creation dialog not implemented

**Workaround**:
1. Navigate to Organizations page directly
2. Create organization manually
3. Return to original form and search for new organization

**Implementation Required**:
```tsx
// TODO: Implement organization creation modal
const handleCreateOrganization = async (orgData: OrganizationFormData) => {
  // Implementation needed for quick organization creation
  console.log('TODO: handleCreateOrganization', orgData)
}
```

**Timeline**: Scheduled for Phase 4 implementation

---

### 📱 Mobile Responsiveness Issues

#### **Issue**: Touch targets too small on mobile
**Tags**: `mobile`, `touch`, `accessibility`, `ux`

**Symptoms**:
- Difficulty tapping dropdown triggers on mobile devices
- Form inputs hard to select on touch devices
- Buttons require precise tapping

**Requirements**: Minimum 44px touch targets (iOS/Android standard)

**Solutions**:
- **Dropdown Triggers**: Ensure 48px height minimum
- **Form Inputs**: Use `h-12` class (48px height)
- **Buttons**: Apply proper touch-friendly sizing

**Code Example**:
```tsx
// Touch-friendly component sizing
<Input className="h-12 text-base" />  // 48px height
<Button className="h-12 min-w-[44px]"> // Touch target standards
<SelectTrigger className="h-12">      // Dropdown triggers
```

---

#### **Issue**: Modal behavior problems on mobile
**Tags**: `mobile`, `modal`, `responsive`, `dialog`, `sheet`

**Symptoms**:
- Modal doesn't appear properly on mobile
- Content cut off or not scrollable
- Incorrect modal type displayed (Dialog instead of Sheet)

**Expected Behavior**: 
- Desktop (≥768px): Dialog modal
- Mobile (<768px): Bottom Sheet

**Diagnostic Steps**:
1. **Check Viewport Width**: Verify screen size detection
2. **Test Component Switching**: Ensure Dialog/Sheet toggle works
3. **Verify CSS**: Check for viewport-specific styling issues

**Solution**:
```tsx
// Proper responsive modal implementation
const isMobile = useMediaQuery('(max-width: 767px)')

return isMobile ? (
  <Sheet> {/* Mobile bottom sheet */}
    <SheetContent side="bottom" className="h-[80vh]">
      {content}
    </SheetContent>
  </Sheet>
) : (
  <Dialog> {/* Desktop modal */}
    <DialogContent className="max-w-md">
      {content}
    </DialogContent>
  </Dialog>
)
```

---

#### **Issue**: Collapsible sections not remembering state
**Tags**: `persistence`, `localStorage`, `state`, `collapsible`

**Symptoms**:
- Sections reset to default state on page reload
- User preferences not saved across sessions
- Inconsistent expand/collapse behavior

**Diagnostic Steps**:
1. **Check localStorage**: Verify keys are being saved
2. **Inspect Key Format**: Ensure proper naming convention
3. **Test State Persistence**: Toggle sections and reload page

**Solution Pattern**:
```tsx
// Proper state persistence implementation
const [isExpanded, setIsExpanded] = useState(() => {
  const saved = localStorage.getItem(`form-section-${formName}-${sectionName}-expanded`)
  return saved ? JSON.parse(saved) : defaultExpanded
})

useEffect(() => {
  localStorage.setItem(
    `form-section-${formName}-${sectionName}-expanded`,
    JSON.stringify(isExpanded)
  )
}, [isExpanded, formName, sectionName])
```

---

### ⚡ Performance Issues

#### **Issue**: Slow search response times
**Tags**: `performance`, `search`, `debounce`, `optimization`

**Symptoms**:
- Search takes >1 second to show results
- Frequent API calls during typing
- Browser becomes unresponsive during search

**Target Performance**: <500ms search response time

**Solutions**:
1. **Enable Debounce**: 300ms delay minimum
2. **Limit Results**: Maximum 25 items per search
3. **Optimize Queries**: Add database indexes

**Implementation**:
```tsx
// Optimized search with debounce
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

const { data: results } = useQuery({
  queryKey: ['search', entity, debouncedSearch],
  queryFn: () => searchFunction(debouncedSearch),
  enabled: debouncedSearch.length >= 2
})
```

---

#### **Issue**: Large dataset loading issues
**Tags**: `performance`, `datasets`, `pagination`, `memory`

**Symptoms**:
- Page freezes when opening dropdowns
- Memory usage increases significantly
- Browser tab becomes unresponsive

**Root Cause**: Loading 1000+ entities upfront

**Solution**: Implement async search with pagination
```sql
-- Optimized database query
SELECT id, name, type, city 
FROM organizations 
WHERE name ILIKE $1 
ORDER BY name 
LIMIT 25
```

---

## Developer/Technical Issues

### 🔧 TypeScript Compilation Errors

#### **Issue**: Form schema type mismatches
**Tags**: `typescript`, `types`, `schema`, `validation`

**Error Example**:
```
Type 'string | undefined' is not assignable to type 'string'
Property 'organization_id' is missing in type 'ContactFormData'
```

**Diagnostic Steps**:
1. **Run Type Check**: `npm run type-check`
2. **Check Schema Definition**: Verify Yup schema matches TypeScript types
3. **Inspect Form Data**: Use debugger to examine actual vs expected types

**Solutions**:
- **Align Types**: Ensure Yup schema and TypeScript interface match exactly
- **Handle Nullables**: Properly type optional/nullable fields
- **Use InferType**: Generate types from schema instead of manual definition

**Best Practice Example**:
```tsx
// Schema-first approach
const contactSchema = yup.object({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  organization_id: yup.string().required(),
  email: yup.string().email().nullable()
})

// Infer TypeScript type from schema
type ContactFormData = yup.InferType<typeof contactSchema>

// This guarantees alignment between validation and types
```

---

#### **Issue**: React Hook Form integration problems
**Tags**: `react-hook-form`, `integration`, `resolver`, `validation`

**Common Errors**:
- `yupResolver` type errors
- Form submission not triggering validation
- Field registration issues

**Solutions**:
```tsx
// Proper React Hook Form setup
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

const form = useForm<ContactFormData>({
  resolver: yupResolver(contactSchema),
  defaultValues: {
    first_name: '',
    last_name: '',
    organization_id: '',
    email: null
  }
})
```

---

### 🔄 Async Search Implementation Problems

#### **Issue**: Search requests not canceling properly
**Tags**: `async`, `cleanup`, `memory-leaks`, `requests`

**Symptoms**:
- Multiple concurrent search requests
- Stale results appearing after newer searches
- Console warnings about memory leaks

**Solution**: Implement proper request cancellation
```tsx
// Proper async search with cleanup
const searchEntities = useCallback(async (query: string) => {
  const controller = new AbortController()
  
  try {
    const { data } = await supabase
      .from('entities')
      .select('*')
      .ilike('name', `%${query}%`)
      .abortSignal(controller.signal)
    
    return data
  } catch (error) {
    if (error.name === 'AbortError') return []
    throw error
  }
}, [])

// Cleanup on unmount
useEffect(() => {
  return () => controller.abort()
}, [])
```

---

#### **Issue**: State management conflicts
**Tags**: `state`, `conflicts`, `react-query`, `form-state`

**Symptoms**:
- Form state and search results out of sync
- Selected values disappearing unexpectedly
- Inconsistent component behavior

**Root Cause**: Multiple state management systems conflicting

**Solution**: Centralize state management
```tsx
// Use React Query for server state
const { data: searchResults } = useQuery({
  queryKey: ['search', entityType, searchTerm],
  queryFn: () => searchFunction(searchTerm)
})

// Use React Hook Form for form state
const form = useForm<FormData>({
  resolver: yupResolver(schema)
})

// Coordinate between the two systems
const handleSelection = (value: string) => {
  form.setValue('entity_id', value)
  queryClient.invalidateQueries(['search'])
}
```

---

### 🗄️ Database Query Performance Issues

#### **Issue**: Slow database queries for search
**Tags**: `database`, `performance`, `indexes`, `optimization`

**Symptoms**:
- Search queries taking >5 seconds
- Database timeouts during peak usage
- High CPU usage on database server

**Diagnostic Commands**:
```bash
# Check query performance
mcp__postgres__explain_query --sql="SELECT * FROM organizations WHERE name ILIKE '%test%'"

# Analyze slow queries
mcp__postgres__get_top_queries --sort_by="total_time" --limit=10
```

**Solutions**:
1. **Add Indexes**: Create indexes for search columns
2. **Optimize Queries**: Use appropriate WHERE clauses
3. **Limit Results**: Always include LIMIT clause

**Index Creation**:
```sql
-- Add search indexes for better performance
CREATE INDEX idx_organizations_name_search ON organizations USING gin(name gin_trgm_ops);
CREATE INDEX idx_contacts_name_search ON contacts USING gin((first_name || ' ' || last_name) gin_trgm_ops);
```

---

### 🎭 Modal Focus Management Problems

#### **Issue**: Focus trap not working in modals
**Tags**: `accessibility`, `focus`, `modal`, `keyboard-navigation`

**Symptoms**:
- Tab key escapes modal content
- Focus moves to background elements
- Screen readers lose context

**Requirements**: Proper focus trap implementation

**Solution**:
```tsx
// Implement focus trap in modal
import { useFocusTrap } from '@/hooks/useFocusTrap'

function Modal({ isOpen, onClose, children }) {
  const modalRef = useFocusTrap(isOpen)
  
  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      const firstFocusable = modalRef.current?.querySelector('[tabindex="0"]')
      firstFocusable?.focus()
    }
  }, [isOpen])
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
```

---

## Common Error Messages & Solutions

### 🚨 "Invalid organization ID" Error

**Full Error**: `Validation error: organization_id is required`

**Context**: Appears in Contact and Opportunity forms

**Causes**:
1. Organization field left empty
2. Selected organization value doesn't match expected format
3. Form submission attempted before organization selection

**Solution Steps**:
1. **Verify Selection**: Ensure organization is actually selected
2. **Check Value Format**: Confirm selected value is valid UUID
3. **Test Direct Selection**: Try selecting organization manually

**Debug Code**:
```tsx
// Add debugging to form submission
const handleSubmit = (data: ContactFormData) => {
  console.log('Form data:', data)
  console.log('Organization ID:', data.organization_id)
  
  if (!data.organization_id) {
    console.error('Organization ID is missing')
    return
  }
  
  // Proceed with submission
  onSubmit(data)
}
```

---

### 🚨 Form Submission Failures

**Error Types**:
- Network errors (500, 502, 503)
- Validation errors from server
- Authentication/authorization errors

**Diagnostic Approach**:
1. **Check Network Tab**: Identify specific error response
2. **Verify Payload**: Ensure form data is properly formatted
3. **Test Authentication**: Confirm user session is valid

**Common Solutions**:
```tsx
// Enhanced error handling
const handleSubmit = async (data: FormData) => {
  try {
    await onSubmit(data)
  } catch (error) {
    if (error.status === 401) {
      // Authentication error
      toast.error('Session expired. Please log in again.')
      router.push('/login')
    } else if (error.status === 422) {
      // Validation error
      setFormErrors(error.details)
    } else {
      // Generic error
      toast.error('Something went wrong. Please try again.')
    }
  }
}
```

---

### 🚨 Console Errors During Development

#### **React Warnings**

**Warning**: `Cannot update a component while rendering a different component`

**Cause**: State updates during render cycle

**Solution**: Move state updates to useEffect or event handlers
```tsx
// Incorrect - state update during render
if (condition) {
  setState(newValue) // ❌ Don't do this
}

// Correct - state update in effect
useEffect(() => {
  if (condition) {
    setState(newValue) // ✅ Do this instead
  }
}, [condition])
```

---

#### **Memory Leak Warnings**

**Warning**: `Can't perform a React state update on an unmounted component`

**Solution**: Cleanup effects and cancel requests
```tsx
useEffect(() => {
  let cancelled = false
  
  const fetchData = async () => {
    const result = await apiCall()
    if (!cancelled) {
      setData(result)
    }
  }
  
  fetchData()
  
  return () => {
    cancelled = true
  }
}, [])
```

---

### 🏗️ Build-Time TypeScript Errors

#### **Error**: `Type 'any' is not assignable to type 'never'`

**Context**: Using `as any` type assertions

**Solution**: Remove type assertions and fix underlying type issues
```tsx
// Before - problematic
const result = apiCall() as any

// After - proper typing
const result: ApiResponse = await apiCall()
```

---

#### **Error**: `Property does not exist on type`

**Context**: Accessing properties that TypeScript can't verify

**Solutions**:
1. **Update Interface**: Add missing properties to type definition
2. **Use Optional Chaining**: Safely access potentially undefined properties
3. **Type Guards**: Verify object shape before accessing properties

```tsx
// Solution 1: Update interface
interface Contact {
  id: string
  name: string
  organization?: Organization // Add missing property
}

// Solution 2: Optional chaining
const orgName = contact.organization?.name

// Solution 3: Type guard
function hasOrganization(contact: Contact): contact is Contact & { organization: Organization } {
  return contact.organization !== undefined
}
```

---

## Performance Optimization

### 🏃 Debounce Configuration Issues

#### **Issue**: Search triggering too frequently
**Tags**: `debounce`, `performance`, `search-optimization`

**Problem**: Search API called on every keystroke

**Optimal Configuration**:
- **Search Debounce**: 300ms
- **Auto-save Debounce**: 2000ms (2 seconds)
- **Validation Debounce**: 500ms

**Implementation**:
```tsx
// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage in search component
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 300)

useEffect(() => {
  if (debouncedSearchTerm.length >= 2) {
    performSearch(debouncedSearchTerm)
  }
}, [debouncedSearchTerm])
```

---

### 📊 Large Dataset Handling

#### **Issue**: Browser freezing with large entity lists
**Tags**: `performance`, `datasets`, `virtualization`, `pagination`

**Solutions**:

1. **Implement Virtualization** (for static lists):
```tsx
import { FixedSizeList as List } from 'react-window'

const VirtualizedSelect = ({ items, onSelect }) => (
  <List
    height={300}
    itemCount={items.length}
    itemSize={40}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style} onClick={() => onSelect(data[index])}>
        {data[index].label}
      </div>
    )}
  </List>
)
```

2. **Server-Side Pagination**:
```tsx
const searchWithPagination = async (query: string, page = 1, limit = 25) => {
  const { data, count } = await supabase
    .from('organizations')
    .select('*', { count: 'exact' })
    .ilike('name', `%${query}%`)
    .range((page - 1) * limit, page * limit - 1)
    
  return {
    items: data,
    totalCount: count,
    hasMore: count > page * limit
  }
}
```

3. **Infinite Scrolling**:
```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

const useInfiniteSearch = (searchTerm: string) => {
  return useInfiniteQuery({
    queryKey: ['search', searchTerm],
    queryFn: ({ pageParam = 1 }) => searchWithPagination(searchTerm, pageParam),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length + 1 : undefined
  })
}
```

---

### 📱 Mobile Network Optimization

#### **Issue**: Slow loading on mobile networks
**Tags**: `mobile`, `network`, `optimization`, `performance`

**Strategies**:

1. **Reduce Payload Size**:
```tsx
// Only select necessary fields
const { data } = await supabase
  .from('organizations')
  .select('id, name, type') // Don't select unnecessary columns
  .limit(25)
```

2. **Implement Caching**:
```tsx
// Cache search results
const { data } = useQuery({
  queryKey: ['search', entityType, searchTerm],
  queryFn: () => searchFunction(searchTerm),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
})
```

3. **Progressive Loading**:
```tsx
// Load critical data first, optional data later
const useContactForm = () => {
  const { data: organizations } = useQuery(['organizations'], fetchOrganizations)
  const { data: principals } = useQuery(
    ['principals'], 
    fetchPrincipals,
    { enabled: !!organizations } // Load after organizations
  )
}
```

---

### 🧮 Component Rendering Performance

#### **Issue**: Slow form rendering with many fields
**Tags**: `rendering`, `performance`, `react`, `optimization`

**Solutions**:

1. **Memoize Expensive Components**:
```tsx
const ExpensiveFormField = memo(({ field, options }) => {
  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field }) => (
        // Expensive rendering logic
        <Select>
          {options.map(opt => <SelectItem key={opt.id} value={opt.id} />)}
        </Select>
      )}
    />
  )
})
```

2. **Lazy Load Sections**:
```tsx
const LazyFormSection = lazy(() => import('./FormSection'))

const MyForm = () => (
  <form>
    <Suspense fallback={<div>Loading...</div>}>
      <LazyFormSection />
    </Suspense>
  </form>
)
```

3. **Optimize Re-renders**:
```tsx
// Use React.memo for stable components
const FormSection = memo(({ title, children, isExpanded }) => {
  return (
    <Collapsible open={isExpanded}>
      <CollapsibleTrigger>{title}</CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
})
```

---

## Accessibility Issues

### ♿ Keyboard Navigation Problems

#### **Issue**: Dropdowns not accessible via keyboard
**Tags**: `accessibility`, `keyboard`, `navigation`, `a11y`

**Requirements**:
- Tab to focus dropdown trigger
- Arrow keys to navigate options
- Enter/Space to select
- Escape to close

**Implementation**:
```tsx
const AccessibleSelect = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectOption(options[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }
  
  return (
    <div
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Select implementation */}
    </div>
  )
}
```

---

#### **Issue**: Modal focus management
**Tags**: `accessibility`, `focus`, `modal`, `trap`

**Problem**: Focus escapes modal and moves to background

**Solution**: Implement proper focus trap
```tsx
import { useEffect, useRef } from 'react'

const useFocusTrap = (isActive: boolean) => {
  const trapRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isActive || !trapRef.current) return
    
    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }
    
    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()
    
    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])
  
  return trapRef
}
```

---

### 🔊 Screen Reader Compatibility

#### **Issue**: Screen readers not announcing form changes
**Tags**: `accessibility`, `screen-reader`, `aria`, `announcements`

**Solutions**:

1. **Live Regions for Dynamic Content**:
```tsx
const FormWithAnnouncements = () => {
  const [announcement, setAnnouncement] = useState('')
  
  const handleSelectionChange = (value: string, label: string) => {
    setAnnouncement(`Selected ${label}`)
    // Clear announcement after it's been read
    setTimeout(() => setAnnouncement(''), 1000)
  }
  
  return (
    <div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <Select onValueChange={handleSelectionChange}>
        {/* Select options */}
      </Select>
    </div>
  )
}
```

2. **Proper ARIA Labels**:
```tsx
const AccessibleFormField = () => (
  <FormField
    control={form.control}
    name="organization_id"
    render={({ field }) => (
      <FormItem>
        <FormLabel id="org-label">Organization</FormLabel>
        <FormControl>
          <Select
            {...field}
            aria-labelledby="org-label"
            aria-describedby="org-description org-error"
            aria-required="true"
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose organization" />
            </SelectTrigger>
            <SelectContent>
              {/* Options */}
            </SelectContent>
          </Select>
        </FormControl>
        <FormDescription id="org-description">
          Select the organization this contact belongs to
        </FormDescription>
        <FormMessage id="org-error" />
      </FormItem>
    )}
  />
)
```

---

### 🎨 Color Contrast Issues

#### **Issue**: Insufficient color contrast for text
**Tags**: `accessibility`, `contrast`, `colors`, `wcag`

**Requirements**: WCAG 2.1 AA compliance (4.5:1 contrast ratio)

**Testing Tools**:
- Browser DevTools Accessibility panel
- WebAIM Contrast Checker
- axe-core accessibility testing

**Common Issues & Fixes**:
```css
/* Before - insufficient contrast */
.muted-text {
  color: #999999; /* Only 2.85:1 contrast ratio */
}

/* After - WCAG compliant */
.muted-text {
  color: #6b7280; /* 4.5:1 contrast ratio */
}

/* Error states */
.error-text {
  color: #dc2626; /* Ensure error text is readable */
}

/* Focus indicators */
.focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

---

### 📏 Touch Target Sizing on Mobile

#### **Issue**: Touch targets too small for mobile interaction
**Tags**: `mobile`, `touch`, `accessibility`, `sizing`

**Requirements**: 
- Minimum 44px × 44px touch targets
- Adequate spacing between interactive elements

**Solutions**:
```tsx
// Touch-friendly component styling
const MobileOptimizedForm = () => (
  <form className="space-y-6"> {/* Adequate spacing */}
    <Input 
      className="h-12 text-base" // 48px height for easy touch
      placeholder="Touch-friendly input"
    />
    <Button 
      className="h-12 min-w-[120px] text-base" // Large enough touch target
      type="submit"
    >
      Submit
    </Button>
    <div className="flex gap-4"> {/* Space between touch targets */}
      <Button variant="outline" className="h-12 flex-1">
        Cancel
      </Button>
      <Button className="h-12 flex-1">
        Save
      </Button>
    </div>
  </form>
)
```

---

## Integration Troubleshooting

### 🔗 Cascading Dropdown Failures

#### **Issue**: Contact dropdown not updating when Organization changes
**Tags**: `cascading`, `relationships`, `state-management`

**Expected Behavior**: When organization is selected, contact dropdown should:
1. Clear current selection
2. Filter contacts by selected organization
3. Show only relevant contacts

**Diagnostic Steps**:
1. **Check State Flow**: Verify organization change triggers contact update
2. **Inspect Filter Logic**: Ensure contact filtering works correctly
3. **Test API Calls**: Confirm filtered contact requests are made

**Implementation**:
```tsx
const CascadingDropdowns = () => {
  const [selectedOrg, setSelectedOrg] = useState('')
  const [selectedContact, setSelectedContact] = useState('')
  
  // Clear contact when organization changes
  useEffect(() => {
    if (selectedOrg) {
      setSelectedContact('') // Clear contact selection
      form.setValue('contact_id', '') // Clear form value
    }
  }, [selectedOrg])
  
  const { data: contacts } = useQuery({
    queryKey: ['contacts', selectedOrg],
    queryFn: () => fetchContactsByOrganization(selectedOrg),
    enabled: !!selectedOrg // Only fetch when org is selected
  })
  
  return (
    <>
      <OrganizationSelect
        value={selectedOrg}
        onValueChange={setSelectedOrg}
      />
      <ContactSelect
        value={selectedContact}
        onValueChange={setSelectedContact}
        options={contacts}
        disabled={!selectedOrg} // Disable until org selected
      />
    </>
  )
}
```

---

### 🔄 Form State Synchronization Issues

#### **Issue**: Form state out of sync with UI components
**Tags**: `state-sync`, `react-hook-form`, `component-state`

**Symptoms**:
- Form shows different values than component state
- Validation errors don't clear when fixed
- Form submission uses stale data

**Root Cause**: Multiple sources of truth for form state

**Solution**: Use React Hook Form as single source of truth
```tsx
const SynchronizedForm = () => {
  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData
  })
  
  // Watch form values for UI updates
  const watchedOrganization = form.watch('organization_id')
  const watchedContact = form.watch('contact_id')
  
  // Use form methods for all state updates
  const handleOrganizationChange = (orgId: string) => {
    form.setValue('organization_id', orgId)
    form.setValue('contact_id', '') // Clear dependent field
    form.trigger('organization_id') // Trigger validation
  }
  
  return (
    <Form {...form}>
      <DynamicSelectField
        name="organization_id"
        value={watchedOrganization}
        onValueChange={handleOrganizationChange}
      />
      <DynamicSelectField
        name="contact_id"
        value={watchedContact}
        disabled={!watchedOrganization}
        options={filterContactsByOrg(contacts, watchedOrganization)}
      />
    </Form>
  )
}
```

---

### ⚡ Quick Create Workflow Problems

#### **Issue**: Newly created entities not appearing in dropdown
**Tags**: `quick-create`, `cache`, `optimistic-updates`

**Expected Flow**:
1. User searches for entity
2. No results found → "Create New" option appears
3. User creates entity in modal
4. New entity appears selected in original dropdown
5. Modal closes, form continues

**Common Problems**:
- Cache not invalidated after creation
- New entity not auto-selected
- Modal doesn't close properly

**Solution**:
```tsx
const QuickCreateWorkflow = () => {
  const queryClient = useQueryClient()
  
  const createEntity = useMutation({
    mutationFn: createNewOrganization,
    onSuccess: (newEntity) => {
      // Invalidate and update cache
      queryClient.invalidateQueries(['organizations'])
      
      // Auto-select new entity
      form.setValue('organization_id', newEntity.id)
      
      // Close modal
      setShowCreateModal(false)
      
      // Announce success
      toast.success(`${newEntity.name} created successfully`)
    },
    onError: (error) => {
      toast.error('Failed to create organization')
      console.error('Creation error:', error)
    }
  })
  
  const handleQuickCreate = async (orgData: OrganizationData) => {
    try {
      await createEntity.mutateAsync(orgData)
    } catch (error) {
      // Error handled by onError callback
    }
  }
  
  return (
    <DynamicSelectField
      name="organization_id"
      searchFunction={searchOrganizations}
      onCreateNew={handleQuickCreate}
      createNewLabel="Create New Organization"
    />
  )
}
```

---

### 📋 Validation Schema Mismatches

#### **Issue**: Client validation differs from server validation
**Tags**: `validation`, `schema`, `sync`, `server-client`

**Problem**: Form passes client validation but fails on server

**Prevention Strategy**:
1. **Shared Schema**: Use same validation schema on client and server
2. **Server Validation**: Always validate on server regardless of client
3. **Error Mapping**: Map server errors to form fields

**Implementation**:
```tsx
// Shared validation schema (e.g., in shared package)
export const contactValidationSchema = yup.object({
  first_name: yup.string().required().max(50),
  last_name: yup.string().required().max(50),
  email: yup.string().email().nullable(),
  organization_id: yup.string().uuid().required()
})

// Client-side usage
const form = useForm({
  resolver: yupResolver(contactValidationSchema)
})

// Server error handling
const handleSubmit = async (data: ContactData) => {
  try {
    await createContact(data)
  } catch (error) {
    if (error.status === 422) {
      // Map server validation errors to form fields
      const serverErrors = error.details
      Object.keys(serverErrors).forEach(field => {
        form.setError(field as keyof ContactData, {
          message: serverErrors[field]
        })
      })
    }
  }
}
```

---

### 🧩 Component Prop Type Conflicts

#### **Issue**: TypeScript errors with component prop types
**Tags**: `typescript`, `props`, `components`, `integration`

**Common Error**: `Type 'X' is not assignable to type 'Y'`

**Solutions**:

1. **Extend Base Types**:
```tsx
// Extend existing component props
interface DynamicSelectProps extends Omit<SelectProps, 'onValueChange'> {
  onValueChange: (value: string, option: SelectOption) => void
  searchFunction: (query: string) => Promise<SelectOption[]>
}
```

2. **Use Generic Types**:
```tsx
// Generic component for type safety
interface FormFieldProps<T> {
  name: keyof T
  control: Control<T>
  render: (props: FieldRenderProps) => ReactNode
}

const FormField = <T,>({ name, control, render }: FormFieldProps<T>) => {
  // Implementation
}
```

3. **Proper Type Assertions**:
```tsx
// When type assertion is necessary, be specific
const selectValue = form.getValues('organization_id') as string
// Better: Use type guards
const isValidOrgId = (value: unknown): value is string => 
  typeof value === 'string' && value.length > 0
```

---

## Known Issues & Workarounds

### 🚧 Organization Creation Dialog (TODO)

**Status**: NOT IMPLEMENTED  
**Priority**: Medium  
**Affected Components**: ContactForm, OpportunityWizard, InteractionForm  

**Current Behavior**:
- "Create New Organization" option appears in dropdowns
- Clicking shows console message: "TODO: handleCreateOrganization"
- No actual creation functionality implemented

**Workaround**:
1. Open Organizations page in new tab
2. Create organization manually
3. Return to original form
4. Search for newly created organization

**Implementation Plan**:
```tsx
// TODO: Implement in Phase 4
const QuickCreateOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
  const form = useForm({
    resolver: yupResolver(organizationSchema),
    defaultValues: {
      name: '',
      type: 'customer',
      // Minimal required fields only
    }
  })
  
  const createOrg = async (data: OrganizationData) => {
    const newOrg = await supabase
      .from('organizations')
      .insert(data)
      .select()
      .single()
    
    onSuccess(newOrg)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          {/* Minimal organization creation form */}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

**Timeline**: Target for next sprint

---

### 🔧 TypeScript Strict Mode Conflicts

**Issue**: Some legacy code conflicts with strict TypeScript settings

**Affected Files**:
- Older form components before type safety improvements
- Some utility functions with loose typing

**Current Status**: Resolved in Phase 1 improvements

**Remaining Issues**: 
- Legacy browser compatibility code
- Third-party library type definitions

**Workarounds**:
```tsx
// Temporary type assertion for third-party libraries
const thirdPartyResult = (libraryFunction() as unknown) as ExpectedType

// TODO: Update when library types are improved
```

---

### 📱 Mobile Safari Specific Issues

#### **Issue**: Virtual keyboard behavior on iOS
**Tags**: `ios`, `safari`, `mobile`, `keyboard`

**Symptoms**:
- Form inputs scroll out of view when keyboard appears
- Viewport height changes causing layout shifts
- Modal positioning issues

**Workarounds**:
```css
/* CSS fixes for iOS Safari */
.form-container {
  /* Prevent zoom on input focus */
  input, select, textarea {
    font-size: 16px; /* iOS won't zoom if font-size >= 16px */
  }
  
  /* Handle viewport height changes */
  min-height: 100vh;
  min-height: 100dvh; /* Use dynamic viewport height when supported */
}

/* Modal positioning fix */
.modal-content {
  position: fixed;
  top: env(safe-area-inset-top);
  bottom: env(safe-area-inset-bottom);
}
```

**JavaScript Solution**:
```tsx
const useiOSKeyboardFix = () => {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (!isIOS) return
    
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Scroll element into view after keyboard appears
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }
    
    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [])
}
```

---

### 🎯 Edge Cases in Form Validation

#### **Issue**: Complex validation scenarios not handled
**Tags**: `validation`, `edge-cases`, `business-logic`

**Known Edge Cases**:

1. **Duplicate Contact Prevention**:
   - Same name + email in same organization
   - Currently not validated

2. **Circular Reference Prevention**:
   - Organization cannot be its own parent
   - Contact cannot be primary contact of multiple orgs

3. **Business Rule Validation**:
   - Principal organizations require specific fields
   - Customer contact limits based on organization type

**Temporary Workarounds**:
```tsx
// Client-side duplicate checking
const checkDuplicateContact = async (formData: ContactData) => {
  const { data: existing } = await supabase
    .from('contacts')
    .select('id')
    .eq('first_name', formData.first_name)
    .eq('last_name', formData.last_name)
    .eq('organization_id', formData.organization_id)
    .maybeSingle()
  
  if (existing) {
    form.setError('first_name', {
      message: 'Contact with this name already exists in this organization'
    })
    return false
  }
  return true
}
```

**Long-term Solution**: Implement comprehensive business rule validation engine

---

## Diagnostic Procedures

### 🔍 Step-by-Step Debugging Process

#### **General Form Issues**

1. **Initial Assessment**:
   ```bash
   # Check if development server is running
   curl http://localhost:3000
   
   # Verify TypeScript compilation
   npm run type-check
   
   # Check for console errors
   # Open browser DevTools > Console
   ```

2. **Component-Level Debugging**:
   ```jsx
   // Add debugging to form component
   const DebugForm = () => {
     const form = useForm()
     
     // Watch all form values
     const formValues = form.watch()
     console.log('Current form state:', formValues)
     
     // Monitor form errors
     useEffect(() => {
       console.log('Form errors:', form.formState.errors)
     }, [form.formState.errors])
     
     return <YourFormComponent />
   }
   ```

3. **Database Connectivity Test**:
   ```bash
   # Test database connection
   mcp__supabase__execute_sql --query="SELECT current_timestamp"
   
   # Check table accessibility
   mcp__supabase__execute_sql --query="SELECT COUNT(*) FROM organizations"
   
   # Verify RLS policies
   mcp__supabase__execute_sql --query="SELECT * FROM organizations LIMIT 1"
   ```

#### **Search Functionality Issues**

1. **API Request Debugging**:
   ```javascript
   // Add to browser console
   // Monitor network requests
   const observer = new PerformanceObserver((list) => {
     list.getEntries().forEach((entry) => {
       if (entry.name.includes('supabase')) {
         console.log('Supabase request:', entry)
       }
     })
   })
   observer.observe({ entryTypes: ['navigation', 'resource'] })
   ```

2. **Database Query Testing**:
   ```sql
   -- Test search query directly
   SELECT id, name, type 
   FROM organizations 
   WHERE name ILIKE '%search_term%' 
   LIMIT 25;
   
   -- Check for data existence
   SELECT COUNT(*) as total_orgs FROM organizations;
   
   -- Verify user access
   SELECT * FROM organizations WHERE id = 'specific-id';
   ```

#### **Performance Investigation**

1. **React DevTools Profiler**:
   - Enable Profiler in React DevTools
   - Record interaction performance
   - Identify slow component renders
   - Check for unnecessary re-renders

2. **Network Performance**:
   ```javascript
   // Measure API response times
   const measureApiTime = async (apiCall) => {
     const start = performance.now()
     try {
       const result = await apiCall()
       const end = performance.now()
       console.log(`API call took ${end - start} milliseconds`)
       return result
     } catch (error) {
       console.error('API call failed:', error)
       throw error
     }
   }
   ```

3. **Database Performance**:
   ```bash
   # Analyze slow queries
   mcp__postgres__get_top_queries --sort_by="mean_time" --limit=5
   
   # Explain query execution
   mcp__postgres__explain_query --sql="YOUR_QUERY_HERE" --analyze=true
   ```

---

### 🧪 Component Isolation Testing

#### **Test Individual Components**

1. **Create Test Wrapper**:
   ```tsx
   // Test component in isolation
   const TestWrapper = ({ children }) => (
     <QueryClient client={new QueryClient()}>
       <TooltipProvider>
         {children}
       </TooltipProvider>
     </QueryClient>
   )
   
   // Test DynamicSelectField
   const TestDynamicSelect = () => (
     <TestWrapper>
       <DynamicSelectField
         name="test"
         searchFunction={mockSearchFunction}
         onValueChange={(value) => console.log('Selected:', value)}
       />
     </TestWrapper>
   )
   ```

2. **Mock Data for Testing**:
   ```tsx
   const mockOrganizations = [
     { id: '1', name: 'Test Org 1', type: 'customer' },
     { id: '2', name: 'Test Org 2', type: 'principal' },
   ]
   
   const mockSearchFunction = async (query: string) => {
     return mockOrganizations
       .filter(org => org.name.toLowerCase().includes(query.toLowerCase()))
       .map(org => ({ value: org.id, label: org.name }))
   }
   ```

#### **Browser-Based Testing**

1. **Manual Testing Checklist**:
   ```markdown
   ## Form Testing Checklist
   
   ### Basic Functionality
   - [ ] Form loads without errors
   - [ ] All fields are accessible
   - [ ] Validation messages appear correctly
   - [ ] Form submission works
   
   ### Dynamic Features
   - [ ] Search returns results
   - [ ] Dropdown selection works
   - [ ] Create new entity option appears
   - [ ] Collapsible sections toggle correctly
   
   ### Mobile Testing
   - [ ] Touch targets are adequate (44px+)
   - [ ] Modal appears as sheet on mobile
   - [ ] Keyboard doesn't break layout
   - [ ] Scrolling works correctly
   
   ### Accessibility
   - [ ] Tab navigation works
   - [ ] Screen reader announcements
   - [ ] Color contrast is sufficient
   - [ ] Focus indicators are visible
   ```

2. **Automated Browser Testing**:
   ```bash
   # Use Playwright for automated testing
   mcp__playwright__browser_navigate --url="http://localhost:3000"
   mcp__playwright__browser_click --element="Contact form" --ref="contact-form-trigger"
   mcp__playwright__browser_type --element="First name field" --ref="first-name" --text="John"
   mcp__playwright__browser_click --element="Organization dropdown" --ref="org-select"
   mcp__playwright__browser_type --element="Search field" --ref="search-input" --text="test"
   ```

---

### 📊 Data Flow Analysis

#### **Trace Data Through System**

1. **Form Submission Flow**:
   ```mermaid
   graph TD
     A[User Input] --> B[Form Validation]
     B --> C{Valid?}
     C -->|Yes| D[API Call]
     C -->|No| E[Show Errors]
     D --> F{Success?}
     F -->|Yes| G[Update UI]
     F -->|No| H[Show Error Message]
   ```

2. **Search Data Flow**:
   ```mermaid
   graph TD
     A[User Types] --> B[Debounce 300ms]
     B --> C[API Call]
     C --> D[Database Query]
     D --> E[Return Results]
     E --> F[Update Dropdown]
   ```

3. **Debug Data Flow**:
   ```tsx
   // Add logging at each step
   const trackedSearchFunction = async (query: string) => {
     console.log('1. Search initiated:', query)
     
     try {
       console.log('2. Making API call...')
       const { data, error } = await supabase
         .from('organizations')
         .select('*')
         .ilike('name', `%${query}%`)
       
       console.log('3. API response:', { data, error })
       
       if (error) throw error
       
       const formatted = data.map(item => ({
         value: item.id,
         label: item.name
       }))
       
       console.log('4. Formatted results:', formatted)
       return formatted
       
     } catch (error) {
       console.error('5. Search error:', error)
       throw error
     }
   }
   ```

---

## Escalation Paths

### 📞 Issue Severity Levels

#### **P0 - Critical (Immediate Response)**
- System completely broken
- Data loss or corruption
- Security vulnerabilities
- Authentication failures

**Response Time**: 1 hour  
**Escalation**: Technical Lead + Product Manager

#### **P1 - High (Same Day Response)**
- Major feature not working
- Performance degradation >50%
- Accessibility failures (WCAG violations)
- Mobile app unusable

**Response Time**: 4 hours  
**Escalation**: Development Team Lead

#### **P2 - Medium (Next Business Day)**
- Minor feature issues
- UI/UX problems
- Non-critical performance issues
- Documentation gaps

**Response Time**: 24 hours  
**Escalation**: Assigned Developer

#### **P3 - Low (Planned Sprint)**
- Enhancement requests
- Code quality improvements
- Non-urgent bug fixes
- Technical debt

**Response Time**: Next sprint planning  
**Escalation**: Product Backlog

---

### 🆘 Emergency Procedures

#### **System Down Scenarios**

1. **Complete Application Failure**:
   ```bash
   # Immediate rollback to last known good state
   git checkout main
   git reset --hard [last-known-good-commit]
   npm run build
   npm run deploy
   
   # Verify rollback
   curl -I https://your-app-url.com
   ```

2. **Database Connection Issues**:
   ```bash
   # Check Supabase status
   mcp__supabase__get_project --id="your-project-id"
   
   # Test connection
   mcp__supabase__execute_sql --query="SELECT 1"
   
   # Check for outages
   # Visit: https://status.supabase.com
   ```

3. **Authentication Failures**:
   ```bash
   # Verify auth configuration
   mcp__supabase__get_project --id="your-project-id"
   
   # Check auth settings in Supabase dashboard
   # Verify JWT secrets and configuration
   ```

#### **Performance Emergency Response**

1. **Immediate Performance Issues**:
   ```javascript
   // Enable performance monitoring
   const observer = new PerformanceObserver((list) => {
     list.getEntries().forEach((entry) => {
       if (entry.duration > 1000) { // Log slow operations
         console.warn('Slow operation detected:', entry)
       }
     })
   })
   observer.observe({ entryTypes: ['measure', 'navigation'] })
   ```

2. **Database Performance Issues**:
   ```bash
   # Check for blocking queries
   mcp__postgres__get_top_queries --sort_by="total_time" --limit=10
   
   # Analyze database health
   mcp__postgres__analyze_db_health --health_type="all"
   ```

---

### 📋 Bug Report Template

#### **For User-Reported Issues**

```markdown
## Bug Report

### Issue Description
Brief description of the problem

### Steps to Reproduce
1. Go to...
2. Click on...
3. Enter...
4. See error

### Expected Behavior
What should have happened

### Actual Behavior
What actually happened

### Environment
- Browser: [Chrome/Safari/Firefox] [Version]
- Device: [Desktop/Mobile/Tablet]
- Screen Size: [e.g., 1920x1080, iPhone 12]
- Operating System: [Windows/Mac/iOS/Android]

### Screenshots/Videos
[Attach visual evidence if possible]

### Console Logs
[Paste any console errors]

### Additional Context
Any other relevant information
```

#### **For Developer Issues**

```markdown
## Technical Issue Report

### Component/Feature
Which component or feature is affected

### Error Details
- Error Message: [Exact error text]
- Stack Trace: [Full stack trace if available]
- File/Line: [Where the error occurs]

### Reproduction Steps
Detailed technical steps to reproduce

### Investigation Done
- [ ] Checked browser console
- [ ] Verified TypeScript compilation
- [ ] Tested database connectivity
- [ ] Reviewed network requests
- [ ] Checked component props/state

### Code Context
```tsx
// Relevant code snippets
```

### Proposed Solution
Initial thoughts on how to fix

### Impact Assessment
- [ ] Blocks development
- [ ] Affects user experience
- [ ] Performance impact
- [ ] Security concern
```

---

### 🎯 Resolution Tracking

#### **Issue Status Workflow**

1. **Reported** → Initial bug report or issue identification
2. **Triaged** → Severity assigned, owner determined
3. **In Progress** → Actively being worked on
4. **Fixed** → Solution implemented and tested
5. **Verified** → Fix confirmed working in production
6. **Closed** → Issue fully resolved and documented

#### **Follow-up Procedures**

1. **Post-Resolution Review**:
   - Document root cause analysis
   - Update troubleshooting guide with new solutions
   - Consider preventive measures for similar issues

2. **Knowledge Base Updates**:
   - Add new troubleshooting entries
   - Update existing procedures based on learnings
   - Share solutions with development team

3. **Process Improvements**:
   - Review detection methods
   - Improve error handling
   - Enhance monitoring and alerting

---

## Additional Resources

### 📚 Documentation Links

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Yup Validation Schema Guide](https://github.com/jquense/yup)
- [shadcn/ui Component Documentation](https://ui.shadcn.com/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### 🛠️ Development Tools

- **React Developer Tools**: Browser extension for debugging React components
- **React Hook Form DevTools**: Debugging tool for form state
- **Supabase Dashboard**: Database management and monitoring
- **Browser DevTools**: Network, Performance, and Accessibility tabs
- **axe-core**: Accessibility testing library

### 🔧 Useful Commands Reference

```bash
# Development
npm run dev                 # Start development server
npm run build              # Production build
npm run type-check         # TypeScript validation
npm run lint               # ESLint checking

# Database
mcp__supabase__list_tables                    # List all tables
mcp__supabase__execute_sql --query="..."      # Run SQL query
mcp__postgres__explain_query --sql="..."     # Analyze query performance

# Testing
mcp__playwright__browser_navigate --url="..." # Navigate to page
mcp__playwright__browser_snapshot             # Take accessibility snapshot
mcp__playwright__browser_resize --width=... --height=... # Test responsive design
```

---

**Last Updated**: 2024-11-14  
**Version**: 1.0  
**Maintained By**: Documentation & Knowledge Management Agent

For additional support or to report issues with this troubleshooting guide, please create an issue in the project repository or contact the development team.