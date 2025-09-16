/**
 * Production Feature Flags System
 *
 * This system provides runtime toggles for incomplete or experimental features.
 * Based on Vercel Flags SDK patterns with TypeScript-first approach.
 *
 * Usage:
 * - Import flags where needed: `import { FEATURE_FLAGS } from '@/lib/feature-flags'`
 * - Check feature state: `if (FEATURE_FLAGS.bulkOperations.enabled) { ... }`
 * - Get user message: `FEATURE_FLAGS.xlsxExport.userMessage`
 */

import { isDevelopment } from '@/config/environment'

interface FeatureFlag {
  enabled: boolean
  userMessage?: string
  description: string
  githubIssue?: string
  targetRelease?: string
}

interface FeatureFlagsConfig {
  // Interaction Management Features
  bulkOperations: FeatureFlag
  markInteractionComplete: FeatureFlag

  // Export Features
  xlsxExport: FeatureFlag

  // Contact Management Features
  rpcContactCreation: FeatureFlag

  // Opportunity Features
  opportunityStageTracking: FeatureFlag

  // Table Features
  contactDateSorting: FeatureFlag

  // UI/UX Features
  responsiveFilters: FeatureFlag

  // Development Features
  debugMode: FeatureFlag
}

/**
 * Production Feature Flags Configuration
 *
 * Set enabled: false for incomplete features to hide them from users
 * Provide userMessage for user-facing explanations
 * Link to GitHub issues for tracking
 */
export const FEATURE_FLAGS: FeatureFlagsConfig = {
  bulkOperations: {
    enabled: true, // Now implemented with selection and basic actions
    userMessage: 'Bulk operations available for interactions',
    description: 'Bulk select and operations for interaction management',
    githubIssue: '#TBD', // Will be updated when GitHub issue is created
    targetRelease: 'v1.1.0',
  },

  markInteractionComplete: {
    enabled: false,
    userMessage: 'Mark complete feature in development',
    description: 'Mark interaction timeline items as complete',
    githubIssue: '#TBD',
    targetRelease: 'v1.1.0',
  },

  xlsxExport: {
    enabled: true, // Now implemented with SheetJS
    userMessage: 'Excel export available',
    description: 'Native XLSX export using SheetJS library',
    githubIssue: '#TBD',
    targetRelease: 'v1.0.1',
  },

  rpcContactCreation: {
    enabled: false, // Currently throws error
    userMessage: 'Contact creation temporarily disabled - use import for now',
    description: 'Server-side contact creation via RPC function',
    githubIssue: '#TBD',
    targetRelease: 'v1.0.1',
  },

  opportunityStageTracking: {
    enabled: false,
    userMessage: 'Stage history tracking in development',
    description: 'Track opportunity stage changes over time',
    githubIssue: '#TBD',
    targetRelease: 'v1.2.0',
  },

  contactDateSorting: {
    enabled: false,
    userMessage: 'Advanced date sorting coming soon',
    description: 'Sort contacts by created_at date with filters',
    githubIssue: '#TBD',
    targetRelease: 'v1.1.0',
  },

  responsiveFilters: {
    enabled: import.meta.env.VITE_ENABLE_RESPONSIVE_FILTERS === 'true',
    userMessage: 'Responsive filters are being rolled out gradually',
    description: 'Enable responsive filter layouts with mobile drawer, tablet sheet, and desktop inline modes',
    githubIssue: '#TBD',
    targetRelease: 'v1.2.0',
  },

  debugMode: {
    enabled: isDevelopment,
    description: 'Development debugging features and logging',
    targetRelease: 'Development only',
  },
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlagsConfig): boolean {
  return FEATURE_FLAGS[feature].enabled
}

/**
 * Get user-friendly message for disabled feature
 */
export function getFeatureMessage(feature: keyof FeatureFlagsConfig): string {
  const flag = FEATURE_FLAGS[feature]
  return flag.userMessage || `${feature} is currently disabled`
}

/**
 * Get all disabled features for admin dashboard
 */
export function getDisabledFeatures(): Array<{
  key: keyof FeatureFlagsConfig
  flag: FeatureFlag
}> {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, flag]) => !flag.enabled)
    .map(([key, flag]) => ({
      key: key as keyof FeatureFlagsConfig,
      flag,
    }))
}

/**
 * Get features by target release
 */
export function getFeaturesByRelease(release: string): Array<{
  key: keyof FeatureFlagsConfig
  flag: FeatureFlag
}> {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, flag]) => flag.targetRelease === release)
    .map(([key, flag]) => ({
      key: key as keyof FeatureFlagsConfig,
      flag,
    }))
}

/**
 * Runtime feature flag override (development only)
 * Allows temporary enabling of features for testing
 */
export function overrideFeatureFlag(feature: keyof FeatureFlagsConfig, enabled: boolean): void {
  if (isDevelopment) {
    FEATURE_FLAGS[feature].enabled = enabled
    // Feature flag changes are handled silently
  }
}
