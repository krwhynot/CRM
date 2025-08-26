# Contacts Page - UI/UX Documentation

## 🧭 Overview

**Page Name:** Contacts Page

**Purpose:** Comprehensive contact management interface for sales teams to view, create, edit, and delete customer contacts with advanced filtering and search capabilities.

**Description:** The Contacts page serves as the primary interface for managing individual contacts within the CRM system. It provides a data-rich table view with expandable row details, multi-criteria filtering, full-text search, and streamlined CRUD operations through modal dialogs. The page is optimized for iPad-first responsive design and supports real-time data updates.

## 🗂 Page Hierarchy & Structure

**Top-Level Layout:** Header (global navigation) → Sidebar (navigation menu) → Content Area (contacts interface)

### Section Breakdown:

| Section Name | Description | Type | Key Elements |
|--------------|-------------|------|--------------|
| Page Header | Contact count display and primary CTA | Static/Dynamic | Page title, contact count, "Add Contact" button |
| Search & Filters | Multi-criteria filtering interface | Dynamic | Search input, filter pills with counts, active filter state |
| Data Table | Contact listing with expandable rows | Dynamic | Contact cards, organization links, status indicators, action buttons |
| Modal Dialogs | CRUD operation forms | Dynamic | Create/Edit/Delete modals with form validation |
| Loading States | Data fetching indicators | Dynamic | Skeleton loaders, loading spinners |
| Error Boundaries | Error handling and recovery | Dynamic | Error messages, retry buttons, fallback UI |

## 🎨 Layout Grid & Spacing

**Grid System:** CSS Grid with responsive 12-column layout using Tailwind CSS

**Breakpoints:**
- Mobile: 320px - 768px (stack layout)
- Tablet: 768px - 1024px (primary target - iPad)
- Desktop: 1024px+ (expanded table view)

**Padding & Margin Standards:**
- Container: `max-w-7xl mx-auto p-6`
- Section spacing: `space-y-8` (32px)
- Component spacing: `space-y-4` (16px)
- Internal spacing: `gap-2` (8px)

**Alignment Rules:**
- Left-aligned content with center-aligned actions
- Right-aligned primary actions (Add Contact button)
- Center-aligned empty states and loading indicators

## 🧩 Components Used

### Core UI Components:
- **SimpleTable** - Main data display with responsive columns and row expansion
- **ContactsFilters** - Search input and filter pill interface
- **ContactRow** - Individual contact display with organization links and quick actions
- **ContactsDialogs** - Modal forms for Create/Edit/Delete operations
- **ContactsPageHeader** - Page title, count display, and primary CTA

### shadcn/ui Primitives:
- **Button** (primary, outline, ghost variants)
- **Input** (search with icon)
- **Dialog** (modal containers)
- **Table** (data structure)
- **Badge** (status indicators)

### Custom Components:
- **ContactsErrorBoundary** - Error handling wrapper
- **QueryErrorBoundary** - TanStack Query error recovery

## 🗃 Data & States

### Static Content:
- Page title and labels
- Filter pill labels
- Empty state messages
- Form field labels

### Dynamic Content:
- Contact data from Supabase via TanStack Query
- Real-time contact counts
- Filter results and search matches
- Organization relationship data

### Loading States:
- **Initial Load:** Skeleton table with animated placeholders
- **Search/Filter:** Debounced updates with visual feedback
- **CRUD Operations:** Loading spinners on form submission
- **Row Expansion:** Smooth accordion animation

### Error Handling:
- **Network Errors:** Retry mechanism with user feedback
- **Validation Errors:** Inline form field validation
- **Authorization Errors:** Redirect to login
- **Data Errors:** Fallback to sample data with warning

## 🧪 Accessibility & UX Considerations

### Navigation:
- **Keyboard Navigation:** Full tab order support
- **Screen Readers:** ARIA labels on interactive elements
- **Focus Management:** Proper focus trapping in modals

### ARIA Implementation:
- `aria-label` on icon buttons and search input
- `aria-expanded` on expandable table rows
- `role="dialog"` on modal components
- `aria-describedby` for form validation messages

### Color Contrast:
- WCAG AA compliant color ratios
- High contrast focus indicators
- Status badges with both color and text indicators

### Mobile-First Strategy:
- Touch-optimized button sizes (minimum 44px)
- Responsive table with horizontal scroll
- Collapsible sections on smaller screens
- iPad-optimized layout as primary target

## 📐 Visual Annotations

### Layout Specifications:
- **Container Width:** max-width: 1280px (7xl)
- **Table Minimum Width:** 800px with horizontal scroll
- **Filter Pills:** Flexible wrap with consistent spacing
- **Modal Dimensions:** Responsive with max-width constraints
- **Button Sizes:** Standard (40px), Small (32px), Large (48px)

### Component States:
- **Hover States:** 200ms transition on interactive elements
- **Active States:** Immediate feedback on button press
- **Loading States:** 300ms fade-in for skeleton loaders
- **Expansion Animation:** 250ms ease-in-out for row details

## 🛠 Tech Stack

### Framework & Libraries:
- **React 18** with TypeScript in strict mode
- **Vite** build system with hot module replacement
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library (New York variant)

### State Management:
- **TanStack Query** for server state and caching
- **Zustand** for client-side UI state (dialogs, filters)
- **Custom Hooks** for feature-specific logic encapsulation

### Data & API:
- **Supabase** PostgreSQL database with real-time subscriptions
- **Row Level Security** for data access control
- **Optimistic Updates** for immediate UI feedback

### Performance Optimizations:
- **React.memo** for component re-render prevention
- **Debounced Search** (300ms delay) for API efficiency
- **Virtualization** for large contact lists (>100 items)
- **Code Splitting** with lazy loading for modal components

## ✅ Checklist

### Layout & Structure:
- [ ] Header displays correct contact count
- [ ] Add Contact button is prominently positioned
- [ ] Search input has proper placeholder text
- [ ] Filter pills show accurate counts
- [ ] Table headers are properly aligned
- [ ] Empty states display appropriate messages

### Components & Functionality:
- [ ] Contact rows expand/collapse smoothly
- [ ] Organization links navigate correctly
- [ ] Quick action buttons trigger appropriate dialogs
- [ ] Modal forms validate input data
- [ ] Success/error messages display appropriately
- [ ] Delete confirmation prevents accidental deletions

### Responsiveness:
- [ ] Layout adapts properly on mobile devices (320px+)
- [ ] iPad layout is optimized for touch interaction
- [ ] Table scrolls horizontally on narrow screens
- [ ] Filter pills wrap appropriately
- [ ] Modal dialogs are responsive and accessible

### Accessibility:
- [ ] All interactive elements are keyboard accessible
- [ ] Screen readers can navigate the interface
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible and consistent
- [ ] ARIA attributes are properly implemented
- [ ] Error messages are announced to screen readers

### Performance:
- [ ] Initial page load is under 3 seconds
- [ ] Search results update within 300ms
- [ ] Table renders smoothly with 100+ contacts
- [ ] No unnecessary re-renders during filtering
- [ ] Images and icons load efficiently
- [ ] Network requests are properly cached