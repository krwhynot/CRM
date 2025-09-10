/**
 * Executive Chef Professional Chart Colors
 * 
 * Uses CSS custom properties from the design system for consistency
 * and theme compatibility. All colors reference the variables defined
 * in src/index.css to maintain design token integrity.
 */

// Helper function to get CSS variable value
const getCSSVar = (variable: string): string => `hsl(var(${variable}))`

export const chartColors = {
  // Primary colors using design system variables
  primary: getCSSVar('--chart-primary'),
  success: getCSSVar('--chart-success'), 
  warning: getCSSVar('--chart-warning'),
  info: getCSSVar('--chart-info'),
  accent: getCSSVar('--chart-accent'),
  muted: getCSSVar('--muted'),

  // Professional series colors using chart variables
  series: [
    getCSSVar('--chart-1'),
    getCSSVar('--chart-2'), 
    getCSSVar('--chart-3'),
    getCSSVar('--chart-4'),
    getCSSVar('--chart-5'),
    getCSSVar('--chart-success'),
    getCSSVar('--chart-info'),
  ],

  // Bar chart gradient colors using primary palette
  barColors: [
    getCSSVar('--primary-600'),
    getCSSVar('--primary'),
    getCSSVar('--primary-400'),
    getCSSVar('--primary-100'),
  ],

  // Pipeline funnel colors using semantic variables
  pipeline: {
    qualified: getCSSVar('--chart-info'),     // Deep blue for new opportunities
    proposal: getCSSVar('--chart-primary'),  // Primary green for proposals
    negotiation: getCSSVar('--chart-warning'), // Warning amber for negotiations
    closed: getCSSVar('--chart-success'),    // Success green for closed won
  },

  // Activity type colors using semantic variables
  activity: {
    opportunity: getCSSVar('--chart-info'),     // Info blue for opportunities
    interaction: getCSSVar('--chart-warning'),  // Warning amber for interactions
    task: getCSSVar('--chart-success'),         // Success green for tasks
  },
}

// Legacy support - direct CSS variable access for components that need it
export const cssVariables = {
  chartPrimary: '--chart-primary',
  chartSuccess: '--chart-success',
  chartWarning: '--chart-warning',
  chartInfo: '--chart-info',
  chartAccent: '--chart-accent',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
} as const
