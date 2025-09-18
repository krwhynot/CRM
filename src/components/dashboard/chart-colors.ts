/**
 * Professional Chart Colors - New Brand Palette
 *
 * Uses CSS custom properties from the new design token system for consistency
 * and theme compatibility. All colors reference the semantic tokens defined
 * in src/styles/tokens/semantic-new.css to maintain design token integrity.
 *
 * Updated for fresh brand system with proper color distribution for data visualization.
 * New brand features yellow-green primary (#88B869), purple secondary (#8B5A8A), 
 * and blue accent (#6B8ACD) for enhanced contrast and accessibility.
 */

// Helper function to get CSS variable value
const getCSSVar = (variable: string): string => `hsl(var(${variable}))`

export const chartColors = {
  // Primary colors using new brand design system variables
  primary: getCSSVar('--chart-primary'),
  success: getCSSVar('--chart-success'),
  warning: getCSSVar('--chart-warning'),
  info: getCSSVar('--chart-info'),
  accent: getCSSVar('--chart-accent'),
  muted: getCSSVar('--muted'),

  // Enhanced series colors using new brand palette for better data visualization
  // Optimized color distribution: Primary yellow-green → Secondary purple → Accent blue → Success green
  series: [
    getCSSVar('--chart-1'),     // New brand primary (yellow-green) - Primary data
    getCSSVar('--chart-2'),     // Light primary variation - Secondary data
    getCSSVar('--chart-3'),     // Brand secondary (purple) - Tertiary data
    getCSSVar('--chart-4'),     // Brand accent (blue) - Quaternary data
    getCSSVar('--chart-5'),     // Success green - Additional data
    getCSSVar('--chart-info'),  // Info blue - Contrast data
    getCSSVar('--chart-accent'), // Purple accent - Highlight data
  ],

  // Enhanced bar chart gradient colors using new brand primary palette
  barColors: [
    getCSSVar('--primary'),      // Main brand color (yellow-green)
    getCSSVar('--chart-1'),      // Brand primary variant
    getCSSVar('--chart-2'),      // Lighter brand variant
    getCSSVar('--chart-3'),      // Secondary brand (purple) variant
  ],

  // Pipeline funnel colors using new brand semantic variables
  pipeline: {
    qualified: getCSSVar('--chart-info'),    // Info blue for new opportunities
    proposal: getCSSVar('--chart-primary'),  // Brand primary (yellow-green) for proposals
    negotiation: getCSSVar('--chart-warning'), // Warning amber for negotiations
    closed: getCSSVar('--chart-success'),    // Success green for closed won
    lost: getCSSVar('--destructive'),        // Destructive red for lost opportunities
  },

  // Activity type colors using new brand semantic variables
  activity: {
    opportunity: getCSSVar('--chart-info'),    // Info blue for opportunities
    interaction: getCSSVar('--chart-warning'), // Warning amber for interactions
    task: getCSSVar('--chart-success'),       // Success green for tasks
    follow_up: getCSSVar('--chart-accent'),   // Purple accent for follow-ups
  },

  // Organization type colors for enhanced data visualization
  // Updated to use new org-specific tokens with proper contrast
  organization: {
    customer: getCSSVar('--org-customer'),       // Brand accent blue for customers
    distributor: getCSSVar('--org-distributor'), // Success green for distributors
    principal: getCSSVar('--org-principal'),     // Brand secondary purple for principals
    supplier: getCSSVar('--org-supplier'),       // Light brand accent for suppliers
    vendor: getCSSVar('--org-vendor'),           // Orange for vendors
    prospect: getCSSVar('--org-prospect'),       // Teal for prospects
    unknown: getCSSVar('--org-unknown'),         // Gray for unknown
  },

  // Priority indicator colors for data visualization
  // Updated to use new priority system: Critical→High→Medium→Low
  priority: {
    critical: getCSSVar('--priority-critical'),  // Red for critical
    high: getCSSVar('--priority-high'),          // Orange for high
    medium: getCSSVar('--priority-medium'),      // Amber for medium
    low: getCSSVar('--priority-low'),            // Gray for low
    // Legacy aliases maintained for backward compatibility
    a_plus: getCSSVar('--priority-a-plus'),      // Critical alias
    a: getCSSVar('--priority-a'),                // High alias
    b: getCSSVar('--priority-b'),                // Medium alias
    c: getCSSVar('--priority-c'),                // Normal/low alias
    d: getCSSVar('--priority-d'),                // Minimal alias
  },
}

// Enhanced CSS variable access for components that need direct variable names
export const cssVariables = {
  // Core chart colors
  chartPrimary: '--chart-primary',
  chartSuccess: '--chart-success',
  chartWarning: '--chart-warning',
  chartInfo: '--chart-info',
  chartAccent: '--chart-accent',

  // Series colors
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',

  // Organization type variables - Enhanced with new types
  orgCustomer: '--org-customer',
  orgDistributor: '--org-distributor',
  orgPrincipal: '--org-principal',
  orgSupplier: '--org-supplier',
  orgVendor: '--org-vendor',
  orgProspect: '--org-prospect',
  orgUnknown: '--org-unknown',

  // Priority variables - Updated to new priority system
  priorityCritical: '--priority-critical',
  priorityHigh: '--priority-high',
  priorityMedium: '--priority-medium',
  priorityLow: '--priority-low',
  // Legacy aliases maintained for compatibility
  priorityAPlus: '--priority-a-plus',
  priorityA: '--priority-a',
  priorityB: '--priority-b',
  priorityC: '--priority-c',
  priorityD: '--priority-d',
} as const

// Utility function to get all available chart colors as an array
export const getChartColorArray = () => [
  chartColors.series[0], // chart-1
  chartColors.series[1], // chart-2
  chartColors.series[2], // chart-3
  chartColors.series[3], // chart-4
  chartColors.series[4], // chart-5
  chartColors.info,      // chart-info
  chartColors.accent,    // chart-accent
]

// Utility function to get organization colors as an array
// Enhanced with new organization types for comprehensive data visualization
export const getOrganizationColorArray = () => [
  chartColors.organization.customer,
  chartColors.organization.distributor,
  chartColors.organization.principal,
  chartColors.organization.supplier,
  chartColors.organization.vendor,
  chartColors.organization.prospect,
  chartColors.organization.unknown,
]

// Utility function to get priority colors as an array
export const getPriorityColorArray = () => [
  chartColors.priority.critical,
  chartColors.priority.high,
  chartColors.priority.medium,
  chartColors.priority.low,
]
