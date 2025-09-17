/**
 * Professional Chart Colors - New Brand Palette
 *
 * Uses CSS custom properties from the new design token system for consistency
 * and theme compatibility. All colors reference the semantic tokens defined
 * in src/styles/tokens/semantic.css to maintain design token integrity.
 *
 * Updated for fresh brand system with proper color distribution for data visualization.
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
  series: [
    getCSSVar('--chart-1'),     // Brand Green - Primary data
    getCSSVar('--chart-2'),     // Lighter Green - Secondary data
    getCSSVar('--chart-3'),     // Medium Green - Tertiary data
    getCSSVar('--chart-4'),     // Teal Green - Quaternary data
    getCSSVar('--chart-5'),     // Olive Green - Additional data
    getCSSVar('--chart-info'),  // Info Blue - Contrast data
    getCSSVar('--chart-accent'), // Purple Accent - Highlight data
  ],

  // Enhanced bar chart gradient colors using new brand primary palette
  barColors: [
    getCSSVar('--primary'),      // Main brand color
    getCSSVar('--chart-1'),      // Brand green variant
    getCSSVar('--chart-2'),      // Lighter brand variant
    getCSSVar('--chart-3'),      // Medium brand variant
  ],

  // Pipeline funnel colors using new brand semantic variables
  pipeline: {
    qualified: getCSSVar('--chart-info'),    // Info blue for new opportunities
    proposal: getCSSVar('--chart-primary'),  // Brand primary for proposals
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
  organization: {
    customer: getCSSVar('--org-customer'),       // Blue for customers
    distributor: getCSSVar('--org-distributor'), // Green for distributors
    principal: getCSSVar('--org-principal'),     // Purple for principals
    supplier: getCSSVar('--org-supplier'),       // Indigo for suppliers
  },

  // Priority indicator colors for data visualization
  priority: {
    critical: getCSSVar('--priority-a-plus'),    // Red for critical
    high: getCSSVar('--priority-a'),             // Solid red for high
    medium: getCSSVar('--priority-b'),           // Orange for medium
    low: getCSSVar('--priority-c'),              // Yellow for low
    minimal: getCSSVar('--priority-d'),          // Gray for minimal
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

  // Organization type variables
  orgCustomer: '--org-customer',
  orgDistributor: '--org-distributor',
  orgPrincipal: '--org-principal',
  orgSupplier: '--org-supplier',

  // Priority variables
  priorityCritical: '--priority-a-plus',
  priorityHigh: '--priority-a',
  priorityMedium: '--priority-b',
  priorityLow: '--priority-c',
  priorityMinimal: '--priority-d',
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
export const getOrganizationColorArray = () => [
  chartColors.organization.customer,
  chartColors.organization.distributor,
  chartColors.organization.principal,
  chartColors.organization.supplier,
]
