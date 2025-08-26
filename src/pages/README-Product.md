# Products Page Documentation

🧭 **Overview**

**Page Name:** Products Page  
**Purpose:** Manage the complete product catalog and inventory for Master Food Brokers in the food service industry  
**Description:** A comprehensive interface for creating, viewing, editing, and deleting products with detailed filtering capabilities, expandable rows, and modal-based forms. Designed specifically for managing food service products across multiple principals with specialized pricing and inventory tracking.

---

## 🗂 Page Hierarchy & Structure

### Top-Level Layout
- **Header:** PageHeader component with title, subtitle, and product count
- **Content:** Main content area with controls and data table
- **Modals:** Two overlay dialogs for create/edit operations
- **No Sidebar/Footer:** Uses app-wide layout components

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

---

## 🎨 Layout Grid & Spacing

### Grid System
- **Container:** `max-w-7xl mx-auto` (1280px max width, centered)
- **Main Padding:** `p-6` (24px all sides)
- **Section Spacing:** `space-y-8` (32px vertical rhythm)

### Breakpoints
- **Mobile:** Default responsive design
- **Tablet:** `sm:max-w-4xl` for modal sizing
- **Desktop:** Full 7xl container width utilization

### Padding & Margin Standards
- **Page Container:** 24px horizontal/vertical padding
- **Modal Content:** `max-w-4xl` with `w-[calc(100vw-2rem)]` for mobile
- **Form Spacing:** `space-y-4` (16px) between form fields
- **Component Spacing:** 8px, 16px, 24px, 32px following 8px grid

### Alignment Rules
- **Header Elements:** `flex items-center justify-between`
- **Table Content:** Left-aligned text, right-aligned pricing
- **Modal Content:** Centered with responsive width constraints
- **Actions:** Right-aligned button groups

---

## 🧩 Components Used

### Core UI Components
- **PageHeader** (`@/components/ui/new/PageHeader`) - Page title with count badge
- **Button** (`@/components/ui/button`) - Primary actions with Loading states
- **Dialog/DialogContent/DialogHeader/DialogTitle/DialogTrigger** (`@/components/ui/dialog`) - Modal overlays
- **SimpleTable** (`@/components/ui/simple-table`) - Data table with responsive design

### Feature Components
- **ProductsTable** (`@/features/products/components/ProductsTable`) - Main data display with filtering
- **ProductForm** (`@/features/products/components/ProductForm`) - CRUD form with validation
- **ProductRow** - Individual table row with expansion functionality
- **ProductsFilters** - Search and filter controls

### Utility Components
- **Plus** (`lucide-react`) - Add button icon
- **Toast notifications** - Success/error feedback system

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
- **Initial Load:** `isLoading` from useProducts hook shows centered loading message
- **Form Submission:** Button text changes to "Saving..." with disabled state
- **Mutation States:** Individual loading states for create/update/delete operations

### Error Handling
- **Delete Confirmation:** Native confirm dialog before deletion
- **Toast Notifications:** Success/error messages for all CRUD operations
- **Form Validation:** Real-time validation with yup schema
- **Network Errors:** Graceful error handling with user feedback

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

## ✅ Checklist

### Layout & Structure
- [ ] Page container uses max-width constraints (1280px)
- [ ] Proper spacing hierarchy with 8px grid system
- [ ] Header section with title, subtitle, and action button
- [ ] Modal dialogs properly configured with responsive sizing
- [ ] Table component integrated with filtering and expansion

### Components & Functionality
- [ ] ProductForm validation working with yup schema
- [ ] CRUD operations (Create, Read, Update, Delete) all functional
- [ ] Toast notifications for user feedback
- [ ] Loading states for all async operations
- [ ] Error handling for network failures

### Responsiveness
- [ ] Mobile-first modal sizing (`w-[calc(100vw-2rem)]`)
- [ ] Responsive table behavior on small screens
- [ ] Touch-friendly button sizing (minimum 44px)
- [ ] Modal scroll behavior for long forms
- [ ] Proper viewport constraints for modals

### Accessibility
- [ ] Keyboard navigation through all interactive elements
- [ ] Screen reader compatibility with proper ARIA labels
- [ ] Focus management in modal dialogs
- [ ] Color contrast meets WCAG AA standards
- [ ] Form validation errors properly announced

### Performance
- [ ] TanStack Query caching and optimization
- [ ] Lazy loading of modal content
- [ ] Efficient re-rendering with proper memo patterns
- [ ] Bundle size optimization with code splitting

### Data Integration
- [ ] Server state managed by TanStack Query
- [ ] Client state properly separated (modal open/close)
- [ ] Data validation at form and API levels
- [ ] Proper error boundaries for data loading failures