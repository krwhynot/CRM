# Organizations Page - UI/UX Documentation

## 🧭 Overview

**Page Name**: Organizations

**Purpose**: Centralized organization management for the KitchenPantry CRM system, enabling Sales Managers to effectively manage customer accounts, distributor relationships, and business entities within the food service industry.

**Description**: A comprehensive CRUD interface for managing organizations with advanced filtering, search capabilities, inline editing, and expandable row details. Designed specifically for Master Food Brokers to track relationships between customers, distributors, and principals in the food service ecosystem.

## 🗂 Page Hierarchy & Structure

### Top-Level Layout
```
Layout Component (SidebarProvider)
├── AppSidebar (Navigation)
└── SidebarInset
    ├── Header (Global app header)
    └── Main Content Area
        └── Organizations Page Container
```

### Section Breakdown

| Section Name | Description | Type | Key Elements |
|--------------|-------------|------|-------------|
| **Error Boundary** | React error boundary wrapper | Static | OrganizationsErrorBoundary component |
| **Page Container** | Main page wrapper with responsive design | Static | max-w-7xl, mx-auto, p-6 classes |
| **Page Header** | Title, count, and primary actions | Dynamic | OrganizationsPageHeader component |
| **Filters & Search** | Interactive filtering and search interface | Dynamic | OrganizationsFilters component |
| **Data Display** | Main table with expandable rows | Dynamic | OrganizationsDataDisplay via SimpleTable |
| **Action Dialogs** | Create, Edit, Delete modals | Dynamic | OrganizationDialogs component |
| **Results Summary** | Pagination and filter status | Dynamic | Results count and active filter display |

## 🎨 Layout Grid & Spacing

### Grid System
- **Framework**: Tailwind CSS 12-column responsive grid
- **Container**: `max-w-7xl mx-auto` (1280px max width, centered)
- **Content Padding**: `p-6` (24px all sides)

### Breakpoints
```javascript
'xs': '475px',   // Extra small devices
'sm': '640px',   // Small devices  
'md': '768px',   // Medium devices (tablets)
'lg': '1024px',  // Large devices (laptops)
'xl': '1280px',  // Extra large devices
'2xl': '1536px', // 2X large devices
'tablet': '768px',   // Custom tablet breakpoint
'laptop': '1024px',  // Custom laptop breakpoint  
'desktop': '1280px'  // Custom desktop breakpoint
```

### Padding & Margin Standards
- **Page Container**: `p-6` (24px)
- **Section Spacing**: `space-y-8` (32px vertical gap) with new style
- **Component Spacing**: `space-y-4` (16px vertical gap) standard
- **Filter Pills**: `gap-2` (8px horizontal gap)
- **Button Groups**: `gap-2` (8px between buttons)

### Alignment Rules
- **Page Content**: Centered with `mx-auto`
- **Headers**: Left-aligned with right-aligned actions
- **Table Content**: Left-aligned text, center-aligned actions
- **Form Elements**: Full-width with consistent spacing

## 🧩 Components Used

### shadcn/ui Primitives
- **Button**: Primary actions, filter pills, row actions
- **Input**: Search field with icon
- **Dialog**: Create, edit, delete modals  
- **Table**: Data display via SimpleTable wrapper
- **Badge**: Priority indicators, status displays

### Custom CRM Components
- **SimpleTable**: Reusable table wrapper with loading states
- **OrganizationRow**: Expandable table row with inline details
- **OrganizationsFilters**: Search and filter interface
- **OrganizationDialogs**: Modal management for CRUD operations

### State Management Hooks
- **useOrganizations**: TanStack Query for data fetching
- **useOrganizationsPageState**: Zustand for UI state management
- **useOrganizationsFiltering**: Custom filtering logic
- **useOrganizationsDisplay**: Row expansion state

### Layout Components
- **OrganizationsErrorBoundary**: Error handling wrapper
- **OrganizationsPageHeader**: Title and primary actions
- **OrganizationsDataDisplay**: Main content area

## 🗃 Data & States

### Static Content
- Page title and navigation structure
- Table headers and action labels
- Filter pill labels and icons
- Empty state messages and CTAs

### Dynamic Content
- **Organization List**: Real-time data from Supabase
- **Search Results**: Filtered and sorted data
- **Row Details**: Expandable organization information
- **Loading States**: Skeleton screens during data fetching
- **Error States**: Error messages and retry options

### Loading States
```javascript
// Table loading state
if (loading) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-8 bg-gray-200 rounded" />
      <div className="h-16 bg-gray-200 rounded" />
    </div>
  )
}
```

### Error Handling
- **Query Errors**: Displayed via OrganizationsErrorBoundary
- **Network Errors**: Toast notifications for transient issues
- **Validation Errors**: Inline form validation feedback
- **Optimistic Updates**: Immediate UI updates with rollback on failure

## 🧪 Accessibility & UX Considerations

### Navigation
- **Keyboard Support**: Full keyboard navigation via Radix UI primitives
- **Tab Order**: Logical focus progression through interactive elements
- **Focus Indicators**: Clear visual focus states on all interactive elements
- **Screen Reader**: Semantic HTML structure with ARIA labels

### ARIA Compliance
- **Role Attributes**: Proper table, button, and dialog roles
- **Label Associations**: Form inputs properly labeled
- **Live Regions**: Dynamic content updates announced
- **Expanded States**: Row expansion states communicated

### Color Contrast
- **CSS Variables**: Theme-aware color system
- **Brand Colors**: MFB green (#7CB342), clay (#EA580C), cream (#FEFEF9)
- **Text Contrast**: Minimum 4.5:1 ratio maintained
- **Interactive States**: Clear hover and focus indicators

### Mobile-First Strategies
- **Progressive Enhancement**: Desktop features added at larger breakpoints
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Responsive Tables**: Horizontal scrolling with sticky actions
- **Simplified Navigation**: Collapsible filters on small screens

## 📐 Visual Annotations

### Component Architecture Reference
- **Location**: `/src/features/organizations/components/`
- **Design System**: shadcn/ui "new-york" style variant
- **Theme Config**: `/tailwind.config.js` with custom MFB brand colors
- **Component Docs**: Individual component README files in feature directories

### Layout Specifications
- **Grid System**: 12-column responsive grid with container max-width
- **Typography**: Nunito font family with system fallbacks
- **Border Radius**: CSS custom properties for consistent rounding
- **Spacing Scale**: Tailwind's default 4px base unit scaling

## 🛠 Tech Stack

### Framework & Build
- **React 18**: Component library with hooks and concurrent features
- **TypeScript**: Strict mode for type safety
- **Vite**: Fast build tool with HMR and optimized bundling
- **Path Aliases**: `@/*` imports for clean module resolution

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **shadcn/ui**: High-quality component library built on Radix UI
- **CSS Variables**: Dynamic theming support
- **Responsive Design**: Mobile-first approach with custom breakpoints

### State Management
- **TanStack Query**: Server state management with caching and synchronization
- **Zustand**: Lightweight client state management
- **React Hook Form**: Form state and validation

### Database & Backend  
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security**: Data access control and multi-tenancy
- **TypeScript Types**: Auto-generated from database schema

## ✅ Implementation Checklist

### Layout & Structure
- [x] Responsive container with proper max-width constraints
- [x] Semantic HTML structure for accessibility
- [x] Proper component composition and separation of concerns
- [x] Error boundary implementation for graceful error handling

### Components & Functionality
- [x] CRUD operations with optimistic updates
- [x] Advanced filtering and search capabilities
- [x] Expandable row details with inline information
- [x] Modal dialogs for create, edit, and delete actions
- [x] Loading and empty states properly implemented

### Responsiveness & Mobile
- [x] Mobile-first responsive design approach
- [x] Touch-friendly interface elements (44px minimum)
- [x] Horizontal scrolling for tables on small screens
- [x] Collapsible navigation and filters on mobile

### Accessibility Compliance
- [x] ARIA labels and roles properly implemented
- [x] Keyboard navigation support throughout interface
- [x] Color contrast ratios meet WCAG 2.1 AA standards
- [x] Screen reader compatibility with semantic markup

### Performance & UX
- [x] Optimized data fetching with TanStack Query
- [x] Debounced search to reduce API calls
- [x] Virtualization for large datasets (if needed)
- [x] Error handling with user-friendly messaging

### Code Quality & Maintainability
- [x] TypeScript strict mode with proper type definitions
- [x] Feature-based architecture with clear boundaries
- [x] Consistent component patterns and naming conventions
- [x] Comprehensive error boundaries and fallback UI

### Testing & Validation
- [x] Unit tests for component logic and interactions
- [x] Integration tests for CRUD operations
- [x] Accessibility testing with automated tools
- [x] Cross-browser compatibility verification

### Documentation & Development
- [x] Component documentation with usage examples
- [x] Storybook stories for component variants
- [x] Development guidelines and coding standards
- [x] Architecture decision records (ADRs) for major decisions