# Products Page - UI/UX Documentation
*Master Food Brokers - iPad-First Design System*

Version 1.0 | Last Updated: August 2025

---

## 🧭 Overview

**Page Name:** Products Page

**Purpose:** Manage the complete product catalog and inventory for Master Food Brokers in the food service industry within the KitchenPantry CRM system.

**Description:** A comprehensive interface for creating, viewing, editing, and deleting products with detailed filtering capabilities, expandable rows, and modal-based forms. Built using SimpleTable architecture and designed specifically for managing food service products across multiple principals with specialized pricing and inventory tracking.

> **Note**: This documentation describes the UI/UX patterns for the Products page. For implementation details, see the actual component files in `/src/features/products/`.

## 🗂 Page Hierarchy & Structure

### Top-Level Layout
```
Layout Component (SidebarProvider)
├── AppSidebar (Navigation)
└── SidebarInset
    ├── Header (Global app header)
    └── Main Content Area
        └── Products Page Container
```

### Section Breakdown

| Section Name | Description | Type | Key Elements |
|--------------|-------------|------|---------------|
| Page Header | Title area with action button | Static | Title "Manage Products", subtitle "Catalog & Inventory", product count badge |
| Action Controls | Primary CTA and dialog triggers | Dynamic | "Add Product" button with Plus icon |
| Filters Bar | Search and filter controls | Dynamic | Search input, filter pills, active filter state |
| Data Table | Product listings with expandable rows | Dynamic | SimpleTable with ProductRow components, pagination |
| Results Summary | Filter/search result indicators | Dynamic | Count display, active filter labels |
| Create Modal | New product form overlay | Dynamic | Full-width ProductForm in Dialog |
| Edit Modal | Existing product form overlay | Dynamic | Pre-populated ProductForm in Dialog |
| Loading States | Progress indicators | Dynamic | Centered loading text with branded styling |

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
- **ProductRow**: Individual product row with inline details
- **ProductsFilters**: Search and filter interface
- **ProductDialogs**: Modal management for CRUD operations

### State Management Hooks
- **useProducts**: TanStack Query for data fetching
- **useProductsPageState**: Zustand for UI state management
- **useProductsFiltering**: Custom filtering logic
- **useProductsDisplay**: Row expansion state

### Layout Components
- **ProductsErrorBoundary**: Error handling wrapper
- **ProductsPageHeader**: Title and primary actions
- **ProductsDataDisplay**: Main content area

---

## 🗃 Data & States

### Static Content
- Page title: "Manage Products"
- Page subtitle: "Catalog & Inventory"  
- Modal titles: "Create New Product" / "Edit Product"
- Button labels: "Add Product", loading states

### Dynamic Content
- **Product List:** Fetched via `useProducts()` hook with TanStack Query
- **Product Count:** Real-time count in PageHeader
- **Filter Results:** Live filtering based on search terms and categories
- **Form Data:** Pre-populated for edit operations

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
- **Query Errors**: Displayed via ProductsErrorBoundary
- **Network Errors**: Toast notifications for transient issues
- **Validation Errors**: Inline form validation feedback
- **Optimistic Updates**: Immediate UI updates with rollback on failure

---

## 🏢 Page Structure Overview

The Products page follows the standard CRM page template with these key components:

- **PageLayout**: Main container with sidebar navigation
- **PageHeader**: Title, subtitle, and primary actions (Add Product button)
- **ProductsFilters**: Search and filtering interface
- **SimpleTable**: Data display with expandable rows
- **Product Modals**: Create and Edit modals with ProductForm

### Key Features:
- Real-time data fetching with TanStack Query
- Responsive design with mobile-first approach
- Modal-based CRUD operations (Create/Edit)
- Stock status indicators with color coding
- Category-based filtering and organization
- Optimistic UI updates with error handling

> For actual implementation details, refer to `/src/pages/Products.tsx` and related components in `/src/features/products/`.

---

## 🎨 CSS/Tailwind Standards

```css
/**
 * PRODUCTS PAGE STYLES
 * Add to: src/styles/products.css
 */

:root {
  /* Product-specific colors */
  --product-primary: #2563EB;
  --product-secondary: #10B981;
  --product-accent: #F59E0B;
  
  /* Stock status colors */
  --stock-in-stock: #10B981;
  --stock-low-stock: #F59E0B;
  --stock-out-of-stock: #DC2626;
  
  /* Layout dimensions */
  --product-card-height: 120px;
  --product-row-height: 64px;
  --product-image-size: 48px;
}

/* Product-specific utility classes */
.product-card {
  min-height: var(--product-card-height);
  transition: all var(--transition-normal);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stock-status-high {
  color: var(--stock-in-stock);
}

.stock-status-medium {
  color: var(--stock-low-stock);
}

.stock-status-low {
  color: var(--stock-out-of-stock);
}
```

---

## 🧪 Accessibility & UX Considerations

### Navigation
- **Keyboard Navigation:** Full keyboard support for all interactive elements
- **Focus Management:** Proper focus trapping in modal dialogs
- **Tab Order:** Logical tab sequence through forms and table actions

### ARIA & Semantic HTML
- **Dialog ARIA:** Proper dialog labeling and focus management
- **Form Labels:** All form fields have associated labels
- **Button States:** Loading and disabled states properly announced
- **Table Headers:** Semantic table structure with proper headers

### Color Contrast
- **Brand Colors:** MFB green (`text-mfb-green`) meets WCAG standards
- **Interactive States:** Clear hover, focus, and active states
- **Error States:** High contrast error messages and validation feedback

### Mobile-First Strategy
- **Responsive Modals:** `w-[calc(100vw-2rem)]` for mobile optimization
- **Touch Targets:** Minimum 44px touch targets for mobile interaction
- **Responsive Table:** SimpleTable handles mobile responsive behavior
- **Modal Scrolling:** `max-h-[75vh] overflow-y-auto` for long forms

---

## 📐 Visual Annotations

### Layout Specifications
- **Modal Width:** `max-w-4xl` on desktop, full-width minus 2rem margin on mobile
- **Modal Height:** `max-h-[90vh]` for viewport awareness
- **Form Height:** `max-h-[75vh]` with scroll for long forms
- **Table Columns:** Defined minimum widths for responsive behavior

### Component Spacing
- **Header Section:** 32px margin bottom (`space-y-8`)
- **Form Fields:** 16px spacing (`space-y-4`)
- **Modal Padding:** Standard dialog padding with 8px right padding for scrollbar

---

## 🛠 Tech Stack

### Framework & Libraries
- **React 18** with TypeScript strict mode
- **Vite** build tool with optimizations
- **TanStack Query** for server state management
- **React Hook Form** with yup validation
- **Lucide React** for consistent iconography

### UI Framework
- **shadcn/ui** component library (new-york variant)
- **Tailwind CSS** with design tokens
- **Radix UI** primitives for accessibility

### CMS/API Integration
- **Supabase** backend with PostgreSQL
- **Custom hooks** for data fetching (`useProducts`, `useCreateProduct`, etc.)
- **Optimistic updates** with proper error handling

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

### Data Integration
- [x] Server state managed by TanStack Query
- [x] Client state properly separated (modal open/close)
- [x] Data validation at form and API levels
- [x] Proper error boundaries for data loading failures

---

## 🧩 Required Component Templates

### ProductRow Component

The ProductRow component displays individual product data in table format with:

- **Product Info**: Package icon placeholder, product name, and SKU
- **Category Badge**: Outlined category indicator
- **Price**: Dollar sign icon with formatted price display
- **Stock Count**: Numeric stock level with color-coded status
- **Stock Status Badge**: Color-coded status (In Stock/Low Stock/Out of Stock)
- **Actions**: More options menu for row actions (Edit)

> Implementation: `/src/features/products/components/ProductRow.tsx`

---

## 📱 Responsive Breakpoint Mixins

```scss
/**
 * PRODUCTS PAGE RESPONSIVE MIXINS
 * File: src/styles/products-responsive.scss
 */

// Product-specific responsive behavior
@mixin product-mobile {
  @media (max-width: 767px) {
    .product-table {
      display: none;
    }
    
    .product-cards {
      display: block;
    }
    
    .product-filters {
      flex-direction: column;
      gap: 12px;
    }
    
    .product-modal {
      width: calc(100vw - 2rem);
      max-height: 75vh;
    }
    @content;
  }
}

@mixin product-tablet {
  @media (min-width: 768px) and (max-width: 1023px) {
    .product-row {
      font-size: 14px;
    }
    
    .product-actions {
      display: none;
    }
    
    .product-mobile-actions {
      display: block;
    }
    @content;
  }
}

@mixin product-desktop {
  @media (min-width: 1024px) {
    .product-table {
      display: table;
    }
    
    .product-cards {
      display: none;
    }
    
    .product-modal {
      max-width: 4xl;
      max-height: 90vh;
    }
    @content;
  }
}
```

---

## 🚀 Quick Start Commands

```bash
# Create new product component from template
cp src/templates/ProductTemplate.tsx src/features/products/components/NewProduct.tsx

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

# Run product-specific tests
npm run test:products
```

---

## 📐 Grid System Reference

```css
/**
 * PRODUCTS PAGE GRID CLASSES
 */

/* Mobile First Grid */
.product-grid-1 { grid-template-columns: repeat(1, 1fr); }
.product-grid-2 { grid-template-columns: repeat(2, 1fr); }

/* Tablet Overrides */
@media (min-width: 768px) {
  .md\:product-grid-1 { grid-template-columns: repeat(1, 1fr); }
  .md\:product-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:product-grid-3 { grid-template-columns: repeat(3, 1fr); }
}

/* Desktop Overrides */
@media (min-width: 1024px) {
  .lg\:product-grid-1 { grid-template-columns: repeat(1, 1fr); }
  .lg\:product-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .lg\:product-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:product-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .lg\:product-grid-5 { grid-template-columns: repeat(5, 1fr); }
  .lg\:product-grid-6 { grid-template-columns: repeat(6, 1fr); }
}

/* Product Table Specific */
.product-table-columns {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 0.8fr 1fr 0.5fr;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 1023px) {
  .product-table-columns {
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
| 1.0 | Aug 2025 | Initial products page documentation following master template | Team |
| | | | |

---

## 🤝 Contributing

To propose changes to these standards:
1. Create a branch: `products-docs-[change-name]`
2. Update this document with your proposed changes
3. Add examples and justification
4. Submit PR for team review
5. Requires 2 approvals to merge

---

*End of Products Page Documentation*