# Master Food Brokers CRM Visual Style Guide

**Professional B2B CRM Design System for the Food Service Industry**

*Version 1.0 | Generated: January 2025*

---

## Table of Contents

1. [Brand Foundation](#brand-foundation)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Library](#component-library)
6. [Data Visualization](#data-visualization)
7. [Accessibility Standards](#accessibility-standards)
8. [Motion & Animation](#motion--animation)
9. [Implementation Guidelines](#implementation-guidelines)
10. [Usage Examples](#usage-examples)

---

## Brand Foundation

### Brand Identity
- **Company**: Master Food Brokers (MFB)
- **Industry**: Food service industry, B2B sales and distribution
- **Users**: Field sales teams (iPad-focused), office staff (desktop), executives
- **Design Philosophy**: Professional, efficient, relationship-centric

### Primary Brand Color
**MFB Green**: `#8DC63F` (HSL: 95 71% 56%)
- Represents growth, freshness, and the food industry
- Professional yet approachable for B2B relationships
- Optimized for both digital and print applications

---

## Color Palette

### 1. Primary Color System

#### MFB Green Palette
```css
/* Primary Green Scale */
--primary-50:  oklch(0.9600 0.0300 130)  /* #F6FBF1 - Lightest tint */
--primary-100: oklch(0.9200 0.0600 130)  /* #E8F5D8 - Light tint */
--primary-200: oklch(0.8500 0.1000 130)  /* #D1EA9F - Light */
--primary-300: oklch(0.7800 0.1400 130)  /* #B8DE66 - Medium light */
--primary-400: oklch(0.7000 0.1700 130)  /* #9DD32D - Medium */
--primary-500: oklch(0.6200 0.2000 130)  /* #8DC63F - Brand primary */
--primary-600: oklch(0.5600 0.1800 130)  /* #7CB342 - Medium dark */
--primary-700: oklch(0.4800 0.1600 130)  /* #689F38 - Dark */
--primary-800: oklch(0.4000 0.1400 130)  /* #558B2F - Darker */
--primary-900: oklch(0.3200 0.1200 130)  /* #33691E - Darkest */
```

#### Tailwind Usage
```html
<!-- Primary color applications -->
<button class="bg-primary text-primary-foreground">Primary Action</button>
<div class="bg-primary-50 border-primary-200">Light background</div>
<span class="text-primary-600">Medium dark text</span>
```

### 2. Semantic Color System

#### Status Colors
```css
/* Success - Green family */
--success: 142 76% 36%        /* #16A34A */
--success-foreground: 0 0% 98% /* #FAFAFA */

/* Warning - Amber family */
--warning: 38 92% 50%         /* #F59E0B */
--warning-foreground: 0 0% 98% /* #FAFAFA */

/* Error/Destructive - Red family */
--destructive: 20 100% 50%    /* #FF3333 */
--destructive-foreground: 0 0% 98% /* #FAFAFA */

/* Info - Blue family */
--info: 199 89% 48%           /* #0EA5E9 */
--info-foreground: 0 0% 98%   /* #FAFAFA */
```

#### Tailwind Usage
```html
<!-- Semantic color applications -->
<div class="bg-success text-success-foreground">Success message</div>
<div class="bg-warning text-warning-foreground">Warning alert</div>
<div class="bg-destructive text-destructive-foreground">Error state</div>
<div class="bg-info text-info-foreground">Information panel</div>
```

### 3. CRM-Specific Color Systems

#### Priority Rating System (A+ through D)
```css
/* Priority A+ - Highest priority with gradient */
--priority-a-plus: 0 84% 60%            /* #E53E3E - Red gradient base */
--priority-a-plus-foreground: 0 0% 98%  /* White text */

/* Priority A - High priority */
--priority-a: 0 74% 42%                 /* #C53030 - Solid red */
--priority-a-foreground: 0 0% 98%       /* White text */

/* Priority B - Medium priority */
--priority-b: 25 95% 53%                /* #F56500 - Orange */
--priority-b-foreground: 0 0% 98%       /* White text */

/* Priority C - Lower priority */
--priority-c: 45 93% 47%                /* #D69E2E - Yellow */
--priority-c-foreground: 240 10% 10%    /* Dark text */

/* Priority D - Lowest priority */
--priority-d: 220 9% 46%                /* #718096 - Gray */
--priority-d-foreground: 0 0% 98%       /* White text */
```

#### Organization Type Colors
```css
/* Customer - Blue */
--org-customer: 217 91% 60%             /* #3182CE */
--org-customer-foreground: 0 0% 98%     /* White text */

/* Distributor - Green */
--org-distributor: 142 71% 45%          /* #38A169 */
--org-distributor-foreground: 0 0% 98%  /* White text */

/* Principal - Purple */
--org-principal: 262 83% 58%            /* #805AD5 */
--org-principal-foreground: 0 0% 98%    /* White text */

/* Supplier - Indigo */
--org-supplier: 238 84% 67%             /* #667EEA */
--org-supplier-foreground: 0 0% 98%     /* White text */
```

#### Market Segment Colors
```css
/* Restaurant - Amber */
--segment-restaurant: 45 93% 47%        /* #D69E2E */
--segment-restaurant-foreground: 240 10% 10% /* Dark text */

/* Healthcare - Cyan */
--segment-healthcare: 188 95% 68%       /* #00D9FF */
--segment-healthcare-foreground: 0 0% 98% /* White text */

/* Education - Violet */
--segment-education: 258 90% 66%        /* #9F7AEA */
--segment-education-foreground: 0 0% 98% /* White text */
```

### 4. Neutral Color System

#### Grayscale Palette
```css
/* Neutral grays using OKLCH for perceptual uniformity */
--gray-50:  oklch(0.9800 0 0)  /* #FAFAFA - Almost white */
--gray-100: oklch(0.9500 0 0)  /* #F5F5F5 - Very light */
--gray-200: oklch(0.9000 0 0)  /* #E5E5E5 - Light */
--gray-300: oklch(0.8000 0 0)  /* #D4D4D4 - Medium light */
--gray-400: oklch(0.6500 0 0)  /* #A3A3A3 - Medium */
--gray-500: oklch(0.5000 0 0)  /* #737373 - True gray */
--gray-600: oklch(0.4000 0 0)  /* #525252 - Medium dark */
--gray-700: oklch(0.3000 0 0)  /* #404040 - Dark */
--gray-800: oklch(0.2000 0 0)  /* #262626 - Very dark */
--gray-900: oklch(0.1000 0 0)  /* #171717 - Almost black */
--gray-950: oklch(0.0500 0 0)  /* #0A0A0A - Darkest */
```

### 5. AAA Accessibility Compliance

#### Text Contrast Levels
```css
/* AAA compliant text colors */
--text-primary: 240 10% 10%    /* #1A1D23 - 15.8:1 ratio */
--text-body: 240 5% 20%        /* #2E3338 - 12.6:1 ratio */
--text-muted: 240 3% 35%       /* #575A5E - 7.5:1 ratio */
--text-disabled: 240 2% 55%    /* #898B8D - 4.5:1 minimum */
```

#### Dark Mode Variants
```css
/* Dark mode AAA compliant text */
--text-primary: 0 0% 98%       /* #FAFAFA - 15.8:1 ratio */
--text-body: 0 0% 85%          /* #D9D9D9 - 12.1:1 ratio */
--text-muted: 0 0% 70%         /* #B3B3B3 - 7.4:1 ratio */
--text-disabled: 0 0% 50%      /* #808080 - 4.5:1 minimum */
```

---

## Typography

### Font Family
**Nunito** - Professional, readable sans-serif optimized for business applications
```css
font-family: 'Nunito', system-ui, -apple-system, sans-serif;
```

### Type Scale & Hierarchy

#### Display & Headings
```css
/* Display Text - Page titles, hero sections */
.text-display {
  font-size: 2rem;        /* 32px */
  font-weight: 700;       /* Bold */
  line-height: 1.2;       /* 38.4px */
  letter-spacing: -0.025em;
}

/* Main Headings - Section titles */
.text-title {
  font-size: 1.5rem;      /* 24px */
  font-weight: 600;       /* Semibold */
  line-height: 1.3;       /* 31.2px */
  letter-spacing: -0.015em;
}

/* Sub Headings - Card titles, form sections */
.text-subtitle {
  font-size: 1.125rem;    /* 18px */
  font-weight: 600;       /* Semibold */
  line-height: 1.4;       /* 25.2px */
}

/* Section Labels - Table headers, form labels */
.text-label {
  font-size: 0.875rem;    /* 14px */
  font-weight: 600;       /* Semibold */
  line-height: 1.5;       /* 21px */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

#### Body Text
```css
/* Primary Body Text - Main content */
.text-body {
  font-size: 0.9375rem;   /* 15px - optimized for business software */
  font-weight: 400;       /* Regular */
  line-height: 1.5;       /* 22.5px */
}

/* Caption Text - Metadata, help text */
.text-caption {
  font-size: 0.875rem;    /* 14px */
  font-weight: 400;       /* Regular */
  line-height: 1.4;       /* 19.6px */
}

/* Small Text - Fine print, timestamps */
.text-small {
  font-size: 0.75rem;     /* 12px */
  font-weight: 400;       /* Regular */
  line-height: 1.4;       /* 16.8px */
}
```

#### Utility Text Classes
```css
/* Weight Variants */
.font-regular { font-weight: 400; }
.font-medium  { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold    { font-weight: 700; }

/* Semantic Text Colors */
.text-primary { color: hsl(var(--text-primary)); }
.text-body    { color: hsl(var(--text-body)); }
.text-muted   { color: hsl(var(--text-muted)); }
.text-disabled { color: hsl(var(--text-disabled)); }
```

### Typography Usage Examples
```html
<!-- Page header -->
<h1 class="text-display text-primary">Organization Management</h1>

<!-- Section title -->
<h2 class="text-title text-primary">Active Customers</h2>

<!-- Card title -->
<h3 class="text-subtitle text-body">Premier Restaurant Group</h3>

<!-- Form label -->
<label class="text-label text-muted">Organization Type</label>

<!-- Body content -->
<p class="text-body text-body">Complete customer profile with contact information...</p>

<!-- Metadata -->
<span class="text-caption text-muted">Last updated 2 hours ago</span>

<!-- Fine print -->
<small class="text-small text-disabled">Data updated every 15 minutes</small>
```

---

## Spacing & Layout

### 8-Point Grid System

#### Base Spacing Scale
```css
/* CSS Custom Properties */
--spacing-xs: 0.5rem;     /* 8px - Tight spacing */
--spacing-sm: 1rem;       /* 16px - Small spacing */
--spacing-md: 1.5rem;     /* 24px - Medium spacing (standard) */
--spacing-lg: 2rem;       /* 32px - Large spacing */
--spacing-xl: 3rem;       /* 48px - Extra large spacing */
--spacing-2xl: 4rem;      /* 64px - Section breaks */
--spacing-3xl: 5rem;      /* 80px - Page sections */
```

#### Tailwind Utilities
```html
<!-- Internal spacing -->
<div class="p-6">        <!-- 24px padding (standard card) -->
<div class="px-4 py-3">  <!-- 16px horizontal, 12px vertical -->
<div class="space-y-4">  <!-- 16px vertical gaps between children -->

<!-- External spacing -->
<div class="mb-6">       <!-- 24px bottom margin -->
<div class="mt-8">       <!-- 32px top margin -->
<div class="gap-6">      <!-- 24px gap in grid/flex -->
```

### Layout Containers

#### Dashboard Container
```css
.dashboard-container {
  max-width: 1600px;      /* Executive Chef breathing room */
  margin: 0 auto;
  padding: 2rem 1.5rem;   /* Professional padding */
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .dashboard-container {
    padding: 2rem 2rem;    /* More breathing room on tablets+ */
  }
}

@media (min-width: 1024px) {
  .dashboard-container {
    padding: 2rem 3rem;    /* Generous breathing room on desktop */
  }
}
```

#### Grid Systems
```html
<!-- KPI Cards Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- 4-column responsive grid with 24px gaps -->
</div>

<!-- Content Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- 2-column layout on larger screens -->
</div>

<!-- Mobile-optimized Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-4">
  <!-- Progressive enhancement for different screen sizes -->
</div>
```

### Border Radius System

#### Radius Scale
```css
/* Border radius using CSS custom properties */
--radius: 0.375rem;               /* 6px - Base radius */
--radius-card: 0.75rem;           /* 12px - Professional cards */

/* Tailwind utilities */
.rounded-sm  { border-radius: calc(var(--radius) - 4px); } /* 2px */
.rounded-md  { border-radius: calc(var(--radius) - 2px); } /* 4px */
.rounded-lg  { border-radius: var(--radius); }             /* 6px */
.rounded-xl  { border-radius: var(--radius-card); }        /* 12px */
.rounded-2xl { border-radius: 1rem; }                      /* 16px */
```

#### Usage Guidelines
```html
<!-- Form inputs -->
<input class="rounded-lg">    <!-- 6px - Standard inputs -->

<!-- Buttons -->
<button class="rounded-lg">   <!-- 6px - Standard buttons -->

<!-- Cards -->
<div class="rounded-xl">      <!-- 12px - Professional cards -->

<!-- Modals -->
<div class="rounded-2xl">     <!-- 16px - Large containers -->
```

### Shadow System

#### Elevation Levels
```css
/* Material Design inspired shadows */
--shadow-subtle: 0 1px 3px 0 rgb(0 0 0 / 0.1);           /* 1dp */
--shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.1);          /* 4dp */
--shadow-hover: 0 10px 15px -3px rgb(0 0 0 / 0.1);       /* 8dp */

/* Branded shadows with MFB green tint */
--header-shadow: 0 2px 8px rgba(141, 198, 63, 0.15);
--dashboard-shadow: 0 2px 8px rgba(141, 198, 63, 0.15);
```

#### Tailwind Utilities
```html
<!-- Data tables (flat) -->
<div class="shadow-none">

<!-- Form inputs -->
<input class="shadow-sm">

<!-- Cards -->
<div class="shadow-card">

<!-- Interactive hover states -->
<div class="hover:shadow-hover">

<!-- Modals and dialogs -->
<div class="shadow-2xl">
```

---

## Component Library

### 1. Button System

#### Button Variants
```typescript
// Button variant configuration
const buttonVariants = {
  variant: {
    default:     'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success:     'bg-success text-success-foreground hover:bg-success/90',
    warning:     'bg-warning text-warning-foreground hover:bg-warning/90',
    outline:     'border border-input bg-background hover:bg-accent',
    secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost:       'hover:bg-accent hover:text-accent-foreground',
    link:        'text-primary underline-offset-4 hover:underline'
  },
  size: {
    sm:      'h-11 px-3 py-1.5 text-sm',      /* 44px height */
    default: 'h-12 px-6 py-3 text-base',      /* 48px height */
    lg:      'h-14 px-8 py-4 text-lg',        /* 56px height */
    icon:    'size-12'                        /* 48px square */
  }
}
```

#### Usage Examples
```html
<!-- Primary actions -->
<button class="btn-primary">Create Organization</button>

<!-- Destructive actions -->
<button class="btn-destructive">Delete Record</button>

<!-- Secondary actions -->
<button class="btn-outline">Cancel</button>

<!-- Ghost buttons -->
<button class="btn-ghost">View Details</button>

<!-- Different sizes -->
<button class="btn-primary btn-sm">Small Action</button>
<button class="btn-primary btn-lg">Large Action</button>
```

#### Motion Specifications
```css
.btn-primary {
  transition: all 200ms ease-in-out;
  
  /* Hover state - Elevation and darkening */
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  /* Active state - Return to base */
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
}
```

### 2. Badge System

#### Badge Variants
```typescript
// Badge variant system for CRM entities
const badgeVariants = {
  // Priority ratings (A+ through D)
  priority: {
    'a-plus': 'bg-gradient-to-r from-priority-a-plus to-priority-a text-white shadow-lg',
    'a':      'bg-priority-a text-priority-a-foreground',
    'b':      'bg-priority-b text-priority-b-foreground',
    'c':      'bg-priority-c text-priority-c-foreground',
    'd':      'bg-priority-d text-priority-d-foreground'
  },
  
  // Organization types
  orgType: {
    customer:    'bg-organization-customer text-organization-customer-foreground',
    distributor: 'bg-organization-distributor text-organization-distributor-foreground',
    principal:   'bg-organization-principal text-organization-principal-foreground',
    supplier:    'bg-organization-supplier text-organization-supplier-foreground'
  },
  
  // Status indicators
  status: {
    active:   'bg-success text-success-foreground',
    inactive: 'bg-destructive text-destructive-foreground',
    pending:  'bg-warning text-warning-foreground'
  }
}
```

#### Usage Examples
```html
<!-- Priority badges -->
<Badge priority="a-plus">A+</Badge>
<Badge priority="a">A</Badge>
<Badge priority="b">B</Badge>

<!-- Organization type badges -->
<Badge orgType="customer">Customer</Badge>
<Badge orgType="distributor">Distributor</Badge>

<!-- Status badges -->
<Badge status="active">Active</Badge>
<Badge status="pending">Pending</Badge>
```

### 3. Card System

#### Card Structure
```typescript
// Card component hierarchy
Card
├── CardHeader (flex flex-col space-y-1.5 p-6)
│   ├── CardTitle (text-2xl font-semibold)
│   └── CardDescription (text-sm text-muted-foreground)
├── CardContent (p-6 pt-0)
└── CardFooter (flex items-center p-6 pt-0)
```

#### KPI Card Specifications
```css
.kpi-card {
  height: 180px !important;        /* Uniform height */
  padding: 24px !important;        /* Consistent padding */
  border-radius: 12px;             /* Professional corners */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 200ms ease-in-out;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: hsl(var(--primary));
}
```

#### Dashboard Card Classes
```css
.dashboard-card {
  @apply bg-card rounded-xl border border-border shadow-sm;
  @apply transition-all duration-200 ease-in-out;
  @apply hover:shadow-md hover:border-primary/20;
  padding: var(--spacing-md);       /* 24px consistent padding */
  border-radius: var(--radius-card); /* 12px professional corners */
}
```

### 4. Form Components

#### Input Specifications
```css
.form-input {
  @apply flex h-12 w-full rounded-lg border border-input;
  @apply bg-background px-3 py-2 text-base;
  @apply placeholder:text-muted-foreground;
  @apply focus-visible:outline-none focus-visible:ring-2;
  @apply focus-visible:ring-primary focus-visible:ring-offset-2;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
}
```

#### Form Field Structure
```html
<!-- Standard form field pattern -->
<div class="space-y-2">
  <label class="text-label text-muted">
    Organization Name
    <span class="text-destructive">*</span>
  </label>
  <input 
    type="text" 
    class="form-input"
    placeholder="Enter organization name"
  />
  <p class="text-caption text-muted">
    This will be displayed in all customer communications
  </p>
</div>
```

### 5. Table Components

#### DataTable Specifications
```typescript
// DataTable with TypeScript generics and expandable rows
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  rowKey: (row: T) => string
  loading?: boolean
  expandableContent?: (row: T) => React.ReactNode
  expandedRows?: Set<string>
  onToggleRow?: (rowId: string) => void
}
```

#### Table Classes
```css
.compact-table {
  @apply text-sm;
}

.compact-table th {
  @apply py-4 px-4 font-semibold;
  background-color: var(--table-header-bg);
  color: var(--table-header-text);
  border-bottom: 1px solid var(--table-border);
}

.compact-table td {
  @apply py-4 px-4;
  min-height: 48px;
}

.compact-table tbody tr:hover {
  background-color: var(--table-row-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
```

---

## Data Visualization

### Chart Color Palette

#### Primary Chart Colors
```css
/* Professional chart colors using design system variables */
--chart-1: 130 62% 50%;    /* MFB Green - Primary brand */
--chart-2: 130 57% 60%;    /* Lighter Green */
--chart-3: 130 58% 46%;    /* Medium Green */
--chart-4: 160 42% 56%;    /* Teal Green */
--chart-5: 110 35% 42%;    /* Olive Green */

/* Extended palette for complex datasets */
--chart-success: 142 76% 52%;  /* Success Green */
--chart-warning: 38 92% 50%;   /* Warning Amber */
--chart-info: 217 91% 60%;     /* Info Blue */
--chart-accent: 262 83% 58%;   /* Purple accent */
```

#### Semantic Chart Applications
```javascript
// Pipeline funnel colors
const pipelineColors = {
  qualified: 'hsl(var(--chart-info))',     // Deep blue for new opportunities
  proposal: 'hsl(var(--chart-primary))',  // Primary green for proposals
  negotiation: 'hsl(var(--chart-warning))', // Warning amber for negotiations
  closed: 'hsl(var(--chart-success))'     // Success green for closed won
}

// Activity type colors
const activityColors = {
  opportunity: 'hsl(var(--chart-info))',     // Info blue
  interaction: 'hsl(var(--chart-warning))',  // Warning amber
  task: 'hsl(var(--chart-success))'         // Success green
}
```

#### Chart Implementation
```html
<!-- Chart container with configuration -->
<ChartContainer config={chartConfig} className="h-[300px]">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="value" fill="hsl(var(--chart-1))" />
    </BarChart>
  </ResponsiveContainer>
</ChartContainer>
```

### Data Visualization Guidelines

#### Color Usage Rules
1. **Primary Data**: Use MFB Green (`--chart-1`) for primary metrics
2. **Comparative Data**: Use sequential colors (`--chart-2`, `--chart-3`, etc.)
3. **Status Data**: Use semantic colors (success, warning, destructive)
4. **Neutral Data**: Use gray scale for inactive or background data

#### Accessibility Considerations
- Minimum 3:1 contrast ratio for chart elements
- Use patterns or textures in addition to color for critical distinctions
- Provide alternative data representations (tables, text summaries)
- Support for colorblind users with distinct color choices

---

## Accessibility Standards

### WCAG AAA Compliance

#### Contrast Requirements
- **AAA Large Text (18px+)**: 4.5:1 minimum contrast ratio
- **AAA Normal Text (under 18px)**: 7:1 minimum contrast ratio
- **UI Components**: 3:1 minimum contrast ratio

#### Color Accessibility
```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  .text-muted {
    color: hsl(var(--text-body)) !important;
  }
  
  .border {
    @apply border-2;  /* Thicker borders */
  }
  
  .shadow-sm {
    @apply shadow-md;  /* Enhanced shadows */
  }
}
```

### Motion & Animation Accessibility

#### Reduced Motion Support
```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Disable button hover animations */
  .btn-primary:hover,
  button:hover {
    transform: none !important;
  }
}
```

### Focus Management

#### Enhanced Focus Patterns
```css
/* Primary focus ring */
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2;
  @apply focus-visible:ring-primary focus-visible:ring-offset-2;
  @apply focus-visible:ring-offset-background;
}

/* Context-specific focus rings */
.focus-ring-destructive {
  @apply focus-visible:ring-destructive;
}

.focus-ring-success {
  @apply focus-visible:ring-success;
}
```

### Screen Reader Support

#### Screen Reader Only Content
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

#### Skip Links
```css
.sr-skip-link {
  @apply absolute -top-full left-4 z-50;
  @apply bg-primary text-primary-foreground;
  @apply px-4 py-2 rounded-md shadow-lg;
  @apply transition-all;
}

.sr-skip-link:focus {
  @apply top-4;
}
```

### Touch Accessibility

#### Touch Target Sizing
```css
/* Minimum 44px touch targets for accessibility */
.touch-target {
  @apply min-h-[2.75rem] min-w-[2.75rem]; /* 44px minimum */
}

.mobile-touch-target {
  min-width: 44px;
  min-height: 44px;
  @apply flex items-center justify-center;
}
```

---

## Motion & Animation

### Motion System Hierarchy

#### Timing Functions
```css
/* Professional motion timing */
--timing-quick: 150ms;      /* Micro-interactions, hover states */
--timing-standard: 250ms;   /* Standard interactions, focus states */
--timing-slow: 400ms;       /* Page transitions, major state changes */

/* Easing functions */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);     /* Quick start, slow end */
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);  /* Smooth both ends */
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Subtle bounce */
```

#### Animation Classes
```css
/* Hover animations */
.hover-lift {
  @apply transition-all duration-200 ease-in-out;
}

.hover-lift:hover {
  @apply transform translate-y-[-1px] shadow-md;
}

/* Interactive elements */
.interactive-element {
  @apply transition-all duration-200 ease-in-out;
  @apply hover:scale-105 hover:shadow-lg;
  @apply active:scale-95 active:shadow-sm;
}

/* Button press feedback */
.button-press {
  @apply transition-all duration-150 ease-in-out;
  @apply active:scale-95;
}
```

#### Loading Animations
```css
/* MFB branded loading shimmer */
.loading-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(141, 198, 63, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Success feedback pulse */
.success-pulse {
  animation: success-pulse 0.6s ease-out;
}

@keyframes success-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(141, 198, 63, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(141, 198, 63, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(141, 198, 63, 0);
  }
}
```

### Motion Guidelines

#### Usage Principles
1. **Quick (150ms)**: Hover states, micro-interactions
2. **Standard (250ms)**: Click actions, state changes
3. **Slow (400ms)**: Page transitions, major state changes

#### Performance Considerations
- Use `transform` and `opacity` for hardware acceleration
- Avoid animating layout properties (`width`, `height`, `padding`)
- Implement `will-change` for complex animations
- Respect user motion preferences

---

## Implementation Guidelines

### CSS Variable Architecture

#### Design Token Structure
```css
:root {
  /* Brand Foundation */
  --primary: 95 71% 56%;                    /* MFB Green */
  --primary-foreground: 0 0% 98%;           /* White text */
  
  /* Extended Primary Palette */
  --primary-50: 95 60% 95%;
  --primary-100: 95 65% 90%;
  --primary-400: 95 68% 48%;
  --primary-600: 95 75% 42%;
  
  /* Semantic Colors */
  --success: 142 76% 36%;
  --success-foreground: 0 0% 98%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 98%;
  --destructive: 20 100% 50%;
  --destructive-foreground: 0 0% 98%;
  --info: 199 89% 48%;
  --info-foreground: 0 0% 98%;
  
  /* Layout & Spacing */
  --radius: 0.375rem;                       /* 6px base radius */
  --radius-card: 0.75rem;                   /* 12px card radius */
  --spacing-md: 1.5rem;                     /* 24px standard spacing */
  
  /* Typography */
  --text-primary: 240 10% 10%;              /* AAA compliant primary text */
  --text-body: 240 5% 20%;                  /* AAA compliant body text */
  --text-muted: 240 3% 35%;                 /* AAA compliant muted text */
}
```

### Tailwind Configuration

#### Extended Theme Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary color system
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          400: "hsl(var(--primary-400))",
          600: "hsl(var(--primary-600))",
        },
        
        // CRM-specific colors
        priority: {
          'a-plus': 'hsl(var(--priority-a-plus))',
          'a': 'hsl(var(--priority-a))',
          'b': 'hsl(var(--priority-b))',
          'c': 'hsl(var(--priority-c))',
          'd': 'hsl(var(--priority-d))',
        },
        
        organization: {
          'customer': 'hsl(var(--org-customer))',
          'distributor': 'hsl(var(--org-distributor))',
          'principal': 'hsl(var(--org-principal))',
          'supplier': 'hsl(var(--org-supplier))',
        }
      },
      
      fontFamily: {
        'nunito': ['Nunito', 'system-ui', 'sans-serif'],
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      }
    }
  }
}
```

### Component Implementation Patterns

#### Atomic Design Structure
```
src/components/
├── ui/                    # Atoms (shadcn/ui primitives)
│   ├── button.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   └── ...
├── forms/                 # Molecules (composed form components)
│   ├── FormField.tsx
│   ├── FormSection.tsx
│   └── ...
├── layout/                # Organisms (layout components)
│   ├── PageHeader.tsx
│   ├── DataTable.tsx
│   └── ...
└── templates/             # Templates (page layouts)
    ├── EntityManagementTemplate.tsx
    ├── DashboardTemplate.tsx
    └── ...
```

#### Component Variant Pattern
```typescript
// Example: Button component with CVA
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base classes
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-nunito font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-0.5 hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-11 px-3 py-1.5 text-sm",
        default: "h-12 px-6 py-3 text-base",
        lg: "h-14 px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
```

---

## Usage Examples

### Complete Component Examples

#### 1. KPI Dashboard Card
```html
<div class="kpi-card">
  <div class="flex items-center justify-between mb-3">
    <span class="text-label text-muted">Total Customers</span>
    <TrendingUp class="w-4 h-4 text-success" />
  </div>
  
  <div class="space-y-2">
    <div class="kpi-value text-primary">247</div>
    <div class="flex items-center space-x-2">
      <Badge status="active">+12%</Badge>
      <span class="text-caption text-muted">vs last month</span>
    </div>
  </div>
</div>
```

#### 2. Organization Data Table Row
```html
<tr class="hover:bg-muted/50 transition-all duration-200">
  <td class="py-4 px-4">
    <div class="flex items-center space-x-3">
      <div class="font-medium text-body">Premier Restaurant Group</div>
      <Badge priority="a-plus">A+</Badge>
    </div>
  </td>
  
  <td class="py-4 px-4">
    <Badge orgType="customer">Customer</Badge>
  </td>
  
  <td class="py-4 px-4">
    <span class="text-body">John Smith</span>
  </td>
  
  <td class="py-4 px-4">
    <Badge status="active">Active</Badge>
  </td>
  
  <td class="py-4 px-4">
    <button class="btn-ghost btn-sm">
      <MoreHorizontal class="w-4 h-4" />
    </button>
  </td>
</tr>
```

#### 3. Form Section
```html
<div class="space-y-6">
  <div class="space-y-2">
    <h3 class="text-subtitle text-primary">Organization Details</h3>
    <p class="text-caption text-muted">
      Basic information about the organization
    </p>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label class="text-label text-muted">
        Organization Name
        <span class="text-destructive">*</span>
      </label>
      <input 
        type="text" 
        class="form-input"
        placeholder="Enter organization name"
      />
    </div>
    
    <div class="space-y-2">
      <label class="text-label text-muted">Organization Type</label>
      <select class="form-input">
        <option>Customer</option>
        <option>Distributor</option>
        <option>Principal</option>
        <option>Supplier</option>
      </select>
    </div>
  </div>
  
  <div class="flex justify-end space-x-3">
    <button class="btn-outline">Cancel</button>
    <button class="btn-primary">Save Organization</button>
  </div>
</div>
```

#### 4. Mobile-Optimized Card View
```html
<!-- Mobile card view (hidden on desktop) -->
<div class="mobile-card lg:hidden">
  <div class="mobile-card-header">
    <div class="mobile-card-title">Premier Restaurant Group</div>
    <Badge priority="a-plus">A+</Badge>
  </div>
  
  <div class="mobile-card-content">
    <div class="mobile-card-field">
      <span class="mobile-card-label">Type:</span>
      <Badge orgType="customer">Customer</Badge>
    </div>
    
    <div class="mobile-card-field">
      <span class="mobile-card-label">Contact:</span>
      <span class="mobile-card-value">John Smith</span>
    </div>
    
    <div class="mobile-card-field">
      <span class="mobile-card-label">Status:</span>
      <Badge status="active">Active</Badge>
    </div>
  </div>
  
  <div class="mobile-card-actions">
    <button class="btn-primary btn-sm">View Details</button>
  </div>
</div>
```

### Dark Mode Implementation

#### Dark Mode Color Overrides
```css
.dark {
  /* Primary colors remain the same for brand consistency */
  --primary: 95 71% 56%;
  --primary-foreground: 0 0% 98%;
  
  /* Background adjustments */
  --background: 240 10% 4%;
  --foreground: 0 0% 98%;
  --card: 240 10% 8%;
  --card-foreground: 0 0% 98%;
  
  /* Text adjustments for AAA compliance */
  --text-primary: 0 0% 98%;      /* 15.8:1 ratio */
  --text-body: 0 0% 85%;         /* 12.1:1 ratio */
  --text-muted: 0 0% 70%;        /* 7.4:1 ratio */
  --text-disabled: 0 0% 50%;     /* 4.5:1 minimum */
  
  /* Chart colors - slightly brighter for dark mode visibility */
  --chart-1: 130 62% 55%;
  --chart-2: 130 57% 65%;
  --chart-3: 130 58% 51%;
  --chart-4: 160 42% 61%;
  --chart-5: 110 35% 47%;
}
```

### Responsive Implementation

#### Mobile-First Breakpoints
```css
/* Tailwind breakpoint system */
.xs  { min-width: 475px; }   /* Large phones */
.sm  { min-width: 640px; }   /* Small tablets */
.md  { min-width: 768px; }   /* Tablets */
.lg  { min-width: 1024px; }  /* Laptops */
.xl  { min-width: 1280px; }  /* Desktops */
.2xl { min-width: 1536px; }  /* Large desktops */

/* Custom breakpoints */
.tablet  { min-width: 768px; }  /* iPad specific */
.laptop  { min-width: 1024px; } /* Laptop specific */
.desktop { min-width: 1280px; } /* Desktop specific */
```

#### Responsive Grid Patterns
```html
<!-- Progressive enhancement grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  <!-- Cards automatically adapt to screen size -->
</div>

<!-- KPI cards with optimal distribution -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- 1 column mobile, 2 tablet, 4 desktop -->
</div>

<!-- Content layout -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2">
    <!-- Main content takes 2/3 on desktop -->
  </div>
  <div class="lg:col-span-1">
    <!-- Sidebar takes 1/3 on desktop -->
  </div>
</div>
```

---

## Design System Maintenance

### Version Control
- **Version**: 1.0 (January 2025)
- **Last Updated**: Design system implementation complete
- **Review Cycle**: Quarterly reviews for updates and improvements

### Implementation Checklist

#### Development Standards
- [ ] All components use CSS custom properties for theming
- [ ] Dark mode support implemented for all components
- [ ] AAA accessibility compliance verified
- [ ] Mobile-first responsive design implemented
- [ ] Motion preferences respected
- [ ] TypeScript types defined for all component variants

#### Brand Consistency
- [ ] MFB Green primary color used consistently
- [ ] Nunito font family applied throughout
- [ ] 8-point grid spacing maintained
- [ ] Professional motion timing implemented
- [ ] CRM-specific color coding applied (priorities, org types, segments)

#### Documentation
- [ ] Component usage examples provided
- [ ] Implementation guidelines documented
- [ ] Accessibility standards defined
- [ ] Mobile optimization patterns documented
- [ ] Code examples tested and verified

### Support and Updates

For questions about this design system or requests for updates, please refer to the development team or create an issue in the project repository.

This style guide serves as the definitive reference for maintaining visual consistency and professional standards across the Master Food Brokers CRM application.

---

*Master Food Brokers CRM Design System © 2025*