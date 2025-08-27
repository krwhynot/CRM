# Contacts Page - UI/UX Documentation
*Master Food Brokers - iPad-First Design System*

Version 1.0 | Last Updated: August 2025

---

## 🧭 Overview

**Page Name:** Contacts Page

**Purpose:** Comprehensive contact management interface for sales teams to view, create, edit, and delete customer contacts with advanced filtering and search capabilities within the KitchenPantry CRM system.

**Description:** The Contacts page serves as the primary interface for managing individual contacts within the CRM system. It provides a data-rich SimpleTable view with expandable row details, multi-criteria filtering, full-text search, and streamlined CRUD operations through modal dialogs. The page is optimized for iPad-first responsive design and supports real-time data updates following the Master Food Brokers design standards.

## 🗂 Page Hierarchy & Structure

### Top-Level Layout
```
Layout Component (SidebarProvider)
├── AppSidebar (Navigation)
└── SidebarInset
    ├── Header (Global app header)
    └── Main Content Area
        └── Contacts Page Container
```

### Section Breakdown

| Section Name | Description | Type | Key Elements |
|--------------|-------------|------|--------------|
| Page Header | Contact count display and primary CTA | Static/Dynamic | Page title, contact count, "Add Contact" button |
| Search & Filters | Multi-criteria filtering interface | Dynamic | Search input, filter pills with counts, active filter state |
| Data Table | Contact listing with expandable rows | Dynamic | Contact cards, organization links, status indicators, action buttons |
| Modal Dialogs | CRUD operation forms | Dynamic | Create/Edit/Delete modals with form validation |
| Loading States | Data fetching indicators | Dynamic | Skeleton loaders, loading spinners |
| Error Boundaries | Error handling and recovery | Dynamic | Error messages, retry buttons, fallback UI |

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
- **Section Spacing**: `space-y-8` (32px vertical gap)
- **Component Spacing**: `space-y-4` (16px vertical gap)
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
- **ContactRow**: Individual contact display with organization links and quick actions
- **ContactsFilters**: Search input and filter pill interface
- **ContactsDialogs**: Modal forms for Create/Edit/Delete operations
- **ContactsPageHeader**: Page title, count display, and primary CTA

### State Management Hooks
- **useContacts**: TanStack Query for data fetching
- **useContactsPageState**: Zustand for UI state management
- **useContactsFiltering**: Custom filtering logic
- **useContactsDisplay**: Row expansion state

### Layout Components
- **ContactsErrorBoundary**: Error handling wrapper
- **ContactsPageHeader**: Title and primary actions
- **ContactsDataDisplay**: Main content area

## 🗃 Data & States

### Static Content
- Page title and navigation structure
- Table headers and action labels
- Filter pill labels and icons
- Empty state messages and CTAs

### Dynamic Content
- **Contact List**: Real-time data from Supabase
- **Search Results**: Filtered and sorted data
- **Row Details**: Expandable contact information
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
- **Query Errors**: Displayed via ContactsErrorBoundary
- **Network Errors**: Toast notifications for transient issues
- **Validation Errors**: Inline form validation feedback
- **Optimistic Updates**: Immediate UI updates with rollback on failure

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

---

## 🏢 Master Page Template

```typescript
/**
 * CONTACTS PAGE TEMPLATE
 * File location: src/pages/Contacts/index.tsx
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
import { ContactsFilters } from '@/features/contacts/components/ContactsFilters'
import { ContactRow } from '@/features/contacts/components/ContactRow'
import { ContactsDialogs } from '@/features/contacts/components/ContactsDialogs'
import { useContacts } from '@/features/contacts/hooks/useContacts'

/**
 * CONTACTS PAGE COMPONENT
 */
export function ContactsPage() {
  const navigate = useNavigate()
  
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
  // Data Fetching
  const { data: contacts, isLoading, error, refetch } = useContacts({
    page: currentPage, 
    search: searchTerm 
  })
  
  // Responsive Detection
  const isMobile = window.innerWidth < 1024
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
  const isDesktop = window.innerWidth >= 1024
  
  // Handlers
  const handleAdd = () => navigate('/contacts/new')
  const handleRowClick = (contact: Contact) => navigate(`/contacts/${contact.id}`)
  
  // Table Headers
  const headers = [
    'Name',
    'Organization', 
    'Email',
    'Phone',
    'Status',
    'Actions'
  ]
  
  // Main Render
  return (
    <PageLayout>
      <PageHeader
        title="Contacts"
        subtitle="Manage customer relationships efficiently"
        primaryAction={
          <Button size="lg" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        }
      />
      
      <ContactsFilters />
      
      <ContentArea>
        <SimpleTable
          data={contacts || []}
          loading={isLoading}
          headers={headers}
          renderRow={(contact, isExpanded, onToggle) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              isExpanded={isExpanded}
              onToggle={onToggle}
              onClick={() => handleRowClick(contact)}
            />
          )}
          emptyMessage="No contacts found"
          emptySubtext="Get started by adding your first contact"
        />
      </ContentArea>
      
      <ContactsDialogs />
    </PageLayout>
  )
}
```

---

## 🎨 CSS/Tailwind Standards

```css
/**
 * CONTACTS PAGE STYLES
 * Add to: src/styles/contacts.css
 */

:root {
  /* Contact-specific colors */
  --contact-primary: #2563EB;
  --contact-secondary: #10B981;
  --contact-accent: #F59E0B;
  
  /* Status colors */
  --contact-active: #10B981;
  --contact-inactive: #DC2626;
  --contact-pending: #F59E0B;
  
  /* Layout dimensions */
  --contact-card-height: 80px;
  --contact-row-height: 56px;
  --contact-avatar-size: 40px;
}

/* Contact-specific utility classes */
.contact-card {
  min-height: var(--contact-card-height);
  transition: all var(--transition-normal);
}

.contact-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.contact-status-active {
  color: var(--contact-active);
}

.contact-status-inactive {
  color: var(--contact-inactive);
}

.contact-status-pending {
  color: var(--contact-pending);
}
```

---

## 🧩 Required Component Templates

### ContactRow Component
```typescript
/**
 * CONTACT ROW COMPONENT
 * File: src/features/contacts/components/ContactRow.tsx
 */
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Mail, Phone } from 'lucide-react'

interface ContactRowProps {
  contact: Contact
  isExpanded: boolean
  onToggle: () => void
  onClick: () => void
}

export function ContactRow({ contact, isExpanded, onToggle, onClick }: ContactRowProps) {
  return (
    <TableRow className="cursor-pointer hover:bg-gray-50" onClick={onClick}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback>
              {contact.firstName?.[0]}{contact.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {contact.firstName} {contact.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {contact.title}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium text-blue-600 hover:underline">
          {contact.organization?.name}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-gray-400" />
          {contact.email}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-gray-400" />
          {contact.phone}
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant={contact.isActive ? 'default' : 'secondary'}
          className={contact.isActive ? 'contact-status-active' : 'contact-status-inactive'}
        >
          {contact.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">
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
 * CONTACTS PAGE RESPONSIVE MIXINS
 * File: src/styles/contacts-responsive.scss
 */

// Contact-specific responsive behavior
@mixin contact-mobile {
  @media (max-width: 767px) {
    .contact-table {
      display: none;
    }
    
    .contact-cards {
      display: block;
    }
    
    .contact-filters {
      flex-direction: column;
      gap: 12px;
    }
    @content;
  }
}

@mixin contact-tablet {
  @media (min-width: 768px) and (max-width: 1023px) {
    .contact-row {
      font-size: 14px;
    }
    
    .contact-actions {
      display: none;
    }
    
    .contact-mobile-actions {
      display: block;
    }
    @content;
  }
}

@mixin contact-desktop {
  @media (min-width: 1024px) {
    .contact-table {
      display: table;
    }
    
    .contact-cards {
      display: none;
    }
    
    .contact-filters {
      flex-direction: row;
      justify-content: space-between;
    }
    @content;
  }
}

// Usage Example
.contacts-page {
  @include contact-mobile {
    padding: 16px;
  }
  
  @include contact-tablet {
    padding: 20px;
  }
  
  @include contact-desktop {
    padding: 24px;
  }
}
```

---

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

## 🚀 Quick Start Commands

```bash
# Create new contact component from template
cp src/templates/ContactTemplate.tsx src/features/contacts/components/NewContact.tsx

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

# Run contact-specific tests
npm run test:contacts
```

---

## 📠 Grid System Reference

```css
/**
 * CONTACTS PAGE GRID CLASSES
 */

/* Mobile First Grid */
.contact-grid-1 { grid-template-columns: repeat(1, 1fr); }
.contact-grid-2 { grid-template-columns: repeat(2, 1fr); }

/* Tablet Overrides */
@media (min-width: 768px) {
  .md\:contact-grid-1 { grid-template-columns: repeat(1, 1fr); }
  .md\:contact-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:contact-grid-3 { grid-template-columns: repeat(3, 1fr); }
}

/* Desktop Overrides */
@media (min-width: 1024px) {
  .lg\:contact-grid-1 { grid-template-columns: repeat(1, 1fr); }
  .lg\:contact-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .lg\:contact-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:contact-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .lg\:contact-grid-5 { grid-template-columns: repeat(5, 1fr); }
  .lg\:contact-grid-6 { grid-template-columns: repeat(6, 1fr); }
}

/* Contact Table Specific */
.contact-table-columns {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1.5fr 1fr 0.5fr;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 1023px) {
  .contact-table-columns {
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

## 🗏 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Aug 2025 | Initial contacts page documentation following master template | Team |
| | | | |

---

## 🤝 Contributing

To propose changes to these standards:
1. Create a branch: `contacts-docs-[change-name]`
2. Update this document with your proposed changes
3. Add examples and justification
4. Submit PR for team review
5. Requires 2 approvals to merge

---

*End of Contacts Page Documentation*