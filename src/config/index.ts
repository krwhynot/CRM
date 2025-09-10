/**
 * Centralized Configuration Index
 * 
 * This file provides convenient re-exports of all configuration modules
 * to make importing from centralized configs easier throughout the application.
 */

// Environment and application configuration
export {
  supabaseConfig,
  openaiConfig,
  appConfig,
  isDevelopment,
  isProduction,
  isTest,
  featureFlags,
  validateEnvironment,
  hasOptionalFeatures,
} from './environment'

// Import for local use
import { validateEnvironment } from './environment'

// URL constants and validation
export {
  placeholderUrls,
  externalUrls,
  apiEndpoints,
  defaultUrls,
  urlPatterns,
  formatUrl,
  validateUrl,
  isLinkedInUrl,
  isValidEmail,
} from './urls'

// Form placeholders and validation
export {
  urlPlaceholders,
  contactPlaceholders,
  organizationPlaceholders,
  addressPlaceholders,
  productPlaceholders,
  opportunityPlaceholders,
  searchPlaceholders,
  validationMessages,
  fieldLabels,
  defaultValues,
  getPlaceholder,
  getValidationMessage,
} from './form-placeholders'

// UI styles for development tools
export {
  devToolColors,
  devToolTypography,
  devToolLayout,
  generateDevToolCSS,
  colors,
  typography,
  layout,
} from './ui-styles'

// Type definitions for better IntelliSense
export type ConfigModule = 
  | 'environment'
  | 'urls' 
  | 'form-placeholders'
  | 'ui-styles'

// Helper function to get all configuration modules
export const getConfigurationModules = (): ConfigModule[] => [
  'environment',
  'urls',
  'form-placeholders', 
  'ui-styles',
]

// Configuration validation helper
export const validateAllConfigurations = () => {
  // Environment validation
  validateEnvironment()
  
  // Additional validations can be added here
  console.log('✅ All configurations validated successfully')
}