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

---

## 🏢 Master Page Template

```typescript
/**
 * ORGANIZATIONS PAGE TEMPLATE
 * File location: src/pages/Organizations/index.tsx
 */

import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

// Layout Components (Required)
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { ContentArea } from '@/components/ui/ContentArea'

// UI Components (Required)
import { SimpleTable } from '@/components/ui/simple-table'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'

// Icons (Consistent set)
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronRight 
} from 'lucide-react'

// Feature Components
import { OrganizationsFilters } from '@/features/organizations/components/OrganizationsFilters'
import { OrganizationRow } from '@/features/organizations/components/OrganizationRow'
import { OrganizationDialogs } from '@/features/organizations/components/OrganizationDialogs'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'

/**
 * ORGANIZATIONS PAGE COMPONENT
 */
export function OrganizationsPage() {
  const navigate = useNavigate()
  
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
  // Data Fetching
  const { data: organizations, isLoading, error, refetch } = useOrganizations({
    page: currentPage, 
    search: searchTerm 
  })
  
  // Responsive Detection
  const isMobile = window.innerWidth < 1024
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
  const isDesktop = window.innerWidth >= 1024
  
  // Handlers
  const handleAdd = () => navigate('/organizations/new')
  const handleRowClick = (org: Organization) => navigate(`/organizations/${org.id}`)
  const handleExport = () => {
    console.log('Exporting organizations...')
  }
  
  // Table Headers
  const headers = [
    'Organization',
    'Type', 
    'Location',
    'Status',
    'Contacts',
    'Actions'
  ]
  
  // Main Render
  return (
    <PageLayout>
      <PageHeader
        title="Organizations"
        subtitle="Manage customer accounts and distributor relationships efficiently"
        primaryAction={
          <Button size="lg" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        }
        secondaryActions={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      />
      
      <OrganizationsFilters />
      
      <ContentArea>
        <SimpleTable
          data={organizations || []}
          loading={isLoading}
          headers={headers}
          renderRow={(organization, isExpanded, onToggle) => (
            <OrganizationRow
              key={organization.id}
              organization={organization}
              isExpanded={isExpanded}
              onToggle={onToggle}
              onClick={() => handleRowClick(organization)}
            />
          )}
          emptyMessage="No organizations found"
          emptySubtext="Get started by adding your first organization"
        />
      </ContentArea>
      
      <OrganizationDialogs />
    </PageLayout>
  )
}
```

---

## 🎨 CSS/Tailwind Standards

```css
/**
 * ORGANIZATIONS PAGE STYLES
 * Add to: src/styles/organizations.css
 */

:root {
  /* Organization-specific colors */
  --org-primary: #2563EB;
  --org-customer: #10B981;
  --org-distributor: #F59E0B;
  --org-principal: #8B5CF6;
  
  /* Status colors */
  --org-active: #10B981;
  --org-inactive: #DC2626;
  --org-pending: #F59E0B;
  
  /* Layout dimensions */
  --org-card-height: 100px;
  --org-row-height: 64px;
  --org-logo-size: 48px;
}

/* Organization-specific utility classes */
.org-card {
  min-height: var(--org-card-height);
  transition: all var(--transition-normal);
}

.org-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.org-type-customer {
  color: var(--org-customer);
}

.org-type-distributor {
  color: var(--org-distributor);
}

.org-type-principal {
  color: var(--org-principal);
}

.org-status-active {
  color: var(--org-active);
}

.org-status-inactive {
  color: var(--org-inactive);
}

.org-status-pending {
  color: var(--org-pending);
}
```

---

## 🧩 Required Component Templates

### OrganizationRow Component
```typescript
/**
 * ORGANIZATION ROW COMPONENT
 * File: src/features/organizations/components/OrganizationRow.tsx
 */
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Building2, MapPin, Users } from 'lucide-react'

interface OrganizationRowProps {
  organization: Organization
  isExpanded: boolean
  onToggle: () => void
  onClick: () => void
}

export function OrganizationRow({ organization, isExpanded, onToggle, onClick }: OrganizationRowProps) {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'customer': return 'org-type-customer'
      case 'distributor': return 'org-type-distributor' 
      case 'principal': return 'org-type-principal'
      default: return 'text-gray-600'
    }
  }
  
  return (
    <TableRow className="cursor-pointer hover:bg-gray-50" onClick={onClick}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={organization.logoUrl} />
            <AvatarFallback>
              <Building2 className="h-5 w-5 text-gray-600" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{organization.name}</div>
            <div className="text-sm text-gray-500">{organization.industry}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={getTypeColor(organization.type)}
        >
          {organization.type}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span>{organization.city}, {organization.state}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant={organization.isActive ? 'default' : 'secondary'}
          className={organization.isActive ? 'org-status-active' : 'org-status-inactive'}
        >
          {organization.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-gray-400" />
          <span className="text-sm">{organization.contactCount || 0}</span>
        </div>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); /* Handle actions */ }}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
```

---

## 📱 Responsive Breakpoint Mixins

```scss
/**
 * ORGANIZATIONS PAGE RESPONSIVE MIXINS
 * File: src/styles/organizations-responsive.scss
 */

// Organization-specific responsive behavior
@mixin org-mobile {
  @media (max-width: 767px) {
    .org-table {
      display: none;
    }
    
    .org-cards {
      display: block;
    }
    
    .org-filters {
      flex-direction: column;
      gap: 12px;
    }
    
    .org-header-actions {
      flex-direction: column;
      gap: 8px;
    }
    @content;
  }
}

@mixin org-tablet {
  @media (min-width: 768px) and (max-width: 1023px) {
    .org-row {
      font-size: 14px;
    }
    
    .org-secondary-actions {
      display: none;
    }
    
    .org-mobile-menu {
      display: block;
    }
    @content;
  }
}

@mixin org-desktop {
  @media (min-width: 1024px) {
    .org-table {
      display: table;
    }
    
    .org-cards {
      display: none;
    }
    
    .org-filters {
      flex-direction: row;
      justify-content: space-between;
    }
    
    .org-header-actions {
      flex-direction: row;
      gap: 12px;
    }
    @content;
  }
}

// Usage Example
.organizations-page {
  @include org-mobile {
    padding: 16px;
  }
  
  @include org-tablet {
    padding: 20px;
  }
  
  @include org-desktop {
    padding: 24px;
  }
}
```

---

## 🚀 Quick Start Commands

```bash
# Create new organization component from template
cp src/templates/OrganizationTemplate.tsx src/features/organizations/components/NewOrganization.tsx

# Run development server
npm run dev

# Type checking
npm run type-check

# Run tests
npm run test

# Build for production
npm run build

# Check bundle size
npm run analyze

# Format code
npm run format

# Lint code
npm run lint

# Run organization-specific tests
npm run test:organizations
```

---

## 📐 Grid System Reference

```css
/**
 * ORGANIZATIONS PAGE GRID CLASSES
 */

/* Mobile First Grid */
.org-grid-1 { grid-template-columns: repeat(1, 1fr); }
.org-grid-2 { grid-template-columns: repeat(2, 1fr); }

/* Tablet Overrides */
@media (min-width: 768px) {
  .md\:org-grid-1 { grid-template-columns: repeat(1, 1fr); }
  .md\:org-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:org-grid-3 { grid-template-columns: repeat(3, 1fr); }
}

/* Desktop Overrides */
@media (min-width: 1024px) {
  .lg\:org-grid-1 { grid-template-columns: repeat(1, 1fr); }
  .lg\:org-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .lg\:org-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:org-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .lg\:org-grid-5 { grid-template-columns: repeat(5, 1fr); }
  .lg\:org-grid-6 { grid-template-columns: repeat(6, 1fr); }
}

/* Organization Table Specific */
.org-table-columns {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1.5fr 1fr 0.8fr 0.5fr;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 1023px) {
  .org-table-columns {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
```

---

## 📚 Additional Resources

### Documentation Links
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Radix UI Components](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/icons/)

### Design Resources
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ipad)
- [Material Design 3](https://m3.material.io/)
- [Figma iOS/iPadOS UI Kit](https://www.figma.com/community/file/809487622678629513)

### Testing Tools
- [iPad Simulator](https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator)
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [BrowserStack](https://www.browserstack.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## 📝 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Aug 2025 | Initial organizations page documentation following master template | Team |
| | | | |

---

## 🤝 Contributing

To propose changes to these standards:
1. Create a branch: `organizations-docs-[change-name]`
2. Update this document with your proposed changes
3. Add examples and justification
4. Submit PR for team review
5. Requires 2 approvals to merge

---

*End of Organizations Page Documentation*