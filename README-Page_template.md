# CRM Design Standards & Page Templates
*Master Food Brokers - iPad-First Design System*

Version 1.0 | Last Updated: August 2025

---

## 📱 Design System Overview

### Core Philosophy
Every page in the CRM should feel like the same application. Users should never have to relearn patterns when navigating between sections.

### Target Devices
- **Primary:** iPad (1024x768 to 1366x1024)
- **Secondary:** Desktop (1440x900+)
- **Tertiary:** Mobile (375x667+)

---

## 🏗️ Master Page Template

```typescript
/**
 * MASTER PAGE TEMPLATE
 * Copy this for every new page in the CRM
 * File location: src/pages/[feature]/index.tsx
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
import { DataTable } from '@/components/ui/DataTable'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'

// Icons (Consistent set)
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronRight 
} from 'lucide-react'

// Types
interface PageDataItem {
  id: string
  // Add your data structure
}

/**
 * PAGE COMPONENT TEMPLATE
 * Replace [Feature] with your feature name
 */
export function [Feature]Page() {
  const navigate = useNavigate()
  
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
  // Data Fetching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['[feature]', currentPage, searchTerm],
    queryFn: async () => {
      // Your API call here
      return fetch[Feature]Data({ page: currentPage, search: searchTerm })
    },
  })
  
  // Responsive Detection
  const isMobile = window.innerWidth < 1024
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
  const isDesktop = window.innerWidth >= 1024
  
  // Computed Values
  const itemsPerPage = isMobile ? 10 : 20
  const filteredData = useMemo(() => {
    if (!data) return []
    // Apply client-side filtering if needed
    return data
  }, [data, searchTerm])
  
  // Handlers
  const handleAdd = () => navigate('/[feature]/new')
  const handleRowClick = (item: PageDataItem) => navigate(`/[feature]/${item.id}`)
  const handleExport = () => {
    // Export logic
    console.log('Exporting data...')
  }
  
  // Column Definitions (Desktop Table)
  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (item: PageDataItem) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item: PageDataItem) => (
        <Badge variant="default">{item.status}</Badge>
      ),
    },
    // Add more columns
  ]
  
  // Mobile Card Component
  const MobileCard = ({ item }: { item: PageDataItem }) => (
    <div 
      className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
      onClick={() => handleRowClick(item)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-1">
        <Badge>{item.status}</Badge>
        {/* Add more mobile-specific content */}
      </div>
    </div>
  )
  
  // Loading State
  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="[Feature]" />
        <LoadingState message="Loading [feature]..." />
      </PageLayout>
    )
  }
  
  // Error State
  if (error) {
    return (
      <PageLayout>
        <PageHeader title="[Feature]" />
        <ErrorState 
          message="Failed to load [feature]"
          onRetry={refetch}
        />
      </PageLayout>
    )
  }
  
  // Main Render
  return (
    <PageLayout>
      {/* Page Header - Required */}
      <PageHeader
        title="[Feature]"
        subtitle="Manage your [feature] efficiently"
        primaryAction={
          <Button size="lg" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add [Item]
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
      
      {/* Filter Bar - Required for List Pages */}
      <FilterBar>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search [feature]..."
          className="max-w-sm"
        />
        
        {/* Add filter dropdowns as needed */}
        <select className="px-3 py-2 border rounded-md">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        
        {/* View toggle for desktop */}
        {isDesktop && (
          <div className="ml-auto flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </div>
        )}
      </FilterBar>
      
      {/* Main Content Area */}
      <ContentArea>
        {filteredData.length === 0 ? (
          <EmptyState
            icon={<Plus className="h-12 w-12" />}
            title="No [feature] found"
            message="Get started by adding your first [item]"
            action={
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add First [Item]
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop: Table View */}
            {isDesktop && viewMode === 'list' && (
              <DataTable
                data={filteredData}
                columns={columns}
                onRowClick={handleRowClick}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
              />
            )}
            
            {/* Desktop: Grid View */}
            {isDesktop && viewMode === 'grid' && (
              <div className="grid grid-cols-3 gap-4">
                {filteredData.map(item => (
                  <MobileCard key={item.id} item={item} />
                ))}
              </div>
            )}
            
            {/* Mobile/Tablet: Card View */}
            {!isDesktop && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredData.map(item => (
                  <MobileCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </ContentArea>
      
      {/* Pagination - Required for Lists */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil((data?.total || 0) / itemsPerPage)}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={data?.total || 0}
        />
      )}
    </PageLayout>
  )
}
```

---

## 🎨 CSS/Tailwind Standards

```css
/**
 * GLOBAL CSS VARIABLES
 * Add to: src/styles/globals.css
 */

:root {
  /* Layout Dimensions */
  --sidebar-width: 180px;
  --sidebar-collapsed: 56px;
  --header-height: 64px;
  --footer-height: 48px;
  
  /* Spacing Scale (8px grid) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  
  /* Touch Targets */
  --min-touch-target: 44px;
  --table-row-height: 56px;
  --button-height: 44px;
  --input-height: 44px;
  
  /* Breakpoints */
  --mobile-max: 767px;
  --tablet-min: 768px;
  --tablet-max: 1023px;
  --desktop-min: 1024px;
  --wide-min: 1440px;
  
  /* Colors - Primary */
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-light: #DBEAFE;
  
  /* Colors - Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #DC2626;
  --color-info: #3B82F6;
  
  /* Colors - Priority */
  --priority-a: #DC2626;
  --priority-b: #EA580C;
  --priority-c: #2563EB;
  --priority-d: #6B7280;
  
  /* Colors - Neutral */
  --color-text: #111827;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-hover: #F3F4F6;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}

/**
 * TAILWIND CONFIG EXTENSION
 * Add to: tailwind.config.js
 */
module.exports = {
  theme: {
    extend: {
      spacing: {
        'sidebar': '180px',
        'sidebar-collapsed': '56px',
        'header': '64px',
        'touch': '44px',
        'row': '56px',
      },
      minHeight: {
        'touch': '44px',
        'row': '56px',
      },
      colors: {
        priority: {
          a: '#DC2626',
          b: '#EA580C',
          c: '#2563EB',
          d: '#6B7280',
        },
      },
    },
  },
}
```

---

## 🧩 Required Component Templates

### PageLayout Component
```typescript
/**
 * PAGE LAYOUT WRAPPER
 * File: src/components/layout/PageLayout.tsx
 */
import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface PageLayoutProps {
  children: ReactNode
  fullWidth?: boolean
}

export function PageLayout({ children, fullWidth = false }: PageLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="w-sidebar flex-shrink-0" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header className="h-header flex-shrink-0" />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className={fullWidth ? '' : 'max-w-7xl mx-auto p-6'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### PageHeader Component
```typescript
/**
 * PAGE HEADER COMPONENT
 * File: src/components/ui/PageHeader.tsx
 */
interface PageHeaderProps {
  title: string
  subtitle?: string
  primaryAction?: ReactNode
  secondaryActions?: ReactNode
}

export function PageHeader({ 
  title, 
  subtitle, 
  primaryAction, 
  secondaryActions 
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {secondaryActions}
          {primaryAction}
        </div>
      </div>
    </div>
  )
}
```

### FilterBar Component
```typescript
/**
 * FILTER BAR COMPONENT
 * File: src/components/ui/FilterBar.tsx
 */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border">
      {children}
    </div>
  )
}
```

### DataTable Component (Simplified)
```typescript
/**
 * DATA TABLE COMPONENT
 * File: src/components/ui/DataTable.tsx
 */
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
}

export function DataTable<T>({ 
  data, 
  columns, 
  onRowClick,
  selectedItems = [],
  onSelectionChange 
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden bg-white rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th 
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr 
              key={idx}
              onClick={() => onRowClick?.(item)}
              className="hover:bg-gray-50 cursor-pointer h-row"
            >
              {columns.map(column => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 📱 Responsive Breakpoint Mixins

```scss
/**
 * SCSS MIXINS FOR RESPONSIVE DESIGN
 * File: src/styles/mixins.scss
 */

// Mobile First Approach
@mixin mobile {
  @media (max-width: 767px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: 768px) and (max-width: 1023px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 1024px) {
    @content;
  }
}

@mixin wide {
  @media (min-width: 1440px) {
    @content;
  }
}

// iPad Specific
@mixin ipad-portrait {
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    @content;
  }
}

@mixin ipad-landscape {
  @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
    @content;
  }
}

// Touch Device Detection
@mixin touch-device {
  @media (hover: none) and (pointer: coarse) {
    @content;
  }
}

// Usage Example:
.component {
  padding: 16px;
  
  @include mobile {
    padding: 8px;
  }
  
  @include tablet {
    padding: 12px;
  }
  
  @include desktop {
    padding: 24px;
  }
}
```

---

## 🎯 Component Checklist

```markdown
## Component Development Checklist

### Before Starting
- [ ] Review this design standards document
- [ ] Check if similar component exists
- [ ] Plan mobile-first approach

### During Development
- [ ] Use only defined color variables
- [ ] Follow 8px spacing grid
- [ ] Ensure 44px minimum touch targets
- [ ] Add loading states
- [ ] Add error states
- [ ] Add empty states

### Testing
- [ ] Test on desktop (1440px)
- [ ] Test on iPad landscape (1024px)
- [ ] Test on iPad portrait (768px)
- [ ] Test on mobile (375px)
- [ ] Test with keyboard navigation
- [ ] Test with screen reader

### Before PR
- [ ] All TypeScript errors resolved
- [ ] Props documented with JSDoc
- [ ] Storybook story created
- [ ] Unit tests written
- [ ] Responsive behavior verified
- [ ] Accessibility audit passed
```

---

## 📋 Page Implementation Checklist

```markdown
## New Page Implementation Checklist

### Structure
- [ ] Uses PageLayout wrapper
- [ ] Has PageHeader with title
- [ ] Includes FilterBar (if list page)
- [ ] Has proper loading state
- [ ] Has error state with retry
- [ ] Has empty state with CTA

### Data
- [ ] Uses React Query for fetching
- [ ] Has proper TypeScript types
- [ ] Implements pagination
- [ ] Search works instantly
- [ ] Sort is functional
- [ ] Filters apply correctly

### Responsive
- [ ] Mobile card view implemented
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scroll
- [ ] Text readable without zoom
- [ ] Images properly sized

### Performance
- [ ] Page loads < 2 seconds
- [ ] Search responds < 100ms
- [ ] Scroll is 60fps smooth
- [ ] Images are optimized
- [ ] Code is split/lazy loaded

### Accessibility
- [ ] Keyboard navigable
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes
- [ ] Screen reader tested
```

---

## 🚀 Quick Start Commands

```bash
# Create new page from template
cp src/templates/PageTemplate.tsx src/pages/NewFeature/index.tsx

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
```

---

## 📐 Grid System Reference

```css
/**
 * RESPONSIVE GRID CLASSES
 */

/* Mobile First Grid */
.grid-1 { grid-template-columns: repeat(1, 1fr); }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

/* Tablet Overrides */
@media (min-width: 768px) {
  .md\:grid-1 { grid-template-columns: repeat(1, 1fr); }
  .md\:grid-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-3 { grid-template-columns: repeat(3, 1fr); }
  .md\:grid-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Desktop Overrides */
@media (min-width: 1024px) {
  .lg\:grid-1 { grid-template-columns: repeat(1, 1fr); }
  .lg\:grid-2 { grid-template-columns: repeat(2, 1fr); }
  .lg\:grid-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:grid-4 { grid-template-columns: repeat(4, 1fr); }
  .lg\:grid-5 { grid-template-columns: repeat(5, 1fr); }
  .lg\:grid-6 { grid-template-columns: repeat(6, 1fr); }
}
```

---

## 📚 Additional Resources

### Documentation Links
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
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
| 1.0 | Aug 2025 | Initial design standards | Team |
| | | | |

---

## 🤝 Contributing

To propose changes to these standards:
1. Create a branch: `design-standards-[change-name]`
2. Update this document with your proposed changes
3. Add examples and justification
4. Submit PR for team review
5. Requires 2 approvals to merge

---

*End of Design Standards Document*