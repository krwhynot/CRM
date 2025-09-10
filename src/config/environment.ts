/**
 * Centralized Environment Configuration
 * 
 * This file provides a single source of truth for all environment variables
 * used throughout the application. All components should import from this
 * file rather than directly accessing import.meta.env.
 */

// Supabase Configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const

// OpenAI Configuration
export const openaiConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
} as const

// Application Configuration
export const appConfig = {
  nodeEnv: import.meta.env.NODE_ENV || 'development',
  baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:5173',
  passwordResetUrl: import.meta.env.VITE_PASSWORD_RESET_URL || '',
  devBypassAuth: import.meta.env.VITE_DEV_BYPASS_AUTH === 'true',
} as const

// Test Configuration
export const testConfig = {
  userEmail: import.meta.env.VITE_TEST_USER_EMAIL || '',
  userPassword: import.meta.env.VITE_TEST_USER_PASSWORD || '',
  userRole: (import.meta.env.VITE_TEST_USER_ROLE || 'user') as 'admin' | 'user' | 'manager',
  playwrightBaseUrl: import.meta.env.VITE_PLAYWRIGHT_BASE_URL || '',
  isCI: !!import.meta.env.VITE_CI,
} as const

// Environment Checks
export const isDevelopment = appConfig.nodeEnv === 'development'
export const isProduction = appConfig.nodeEnv === 'production'
export const isTest = appConfig.nodeEnv === 'test'

// Feature Flags based on environment
export const featureFlags = {
  enableDevTools: isDevelopment,
  enableDebugLogs: isDevelopment,
  enableTestMode: isTest,
  enableProductionMonitoring: isProduction,
} as const

// Validation helpers
export const validateEnvironment = () => {
  const requiredVars = [
    { key: 'VITE_SUPABASE_URL', value: supabaseConfig.url },
    { key: 'VITE_SUPABASE_ANON_KEY', value: supabaseConfig.anonKey },
  ]

  const missing = requiredVars.filter(({ value }) => !value)
  
  if (missing.length > 0) {
    const missingKeys = missing.map(({ key }) => key).join(', ')
    throw new Error(
      `Missing required environment variables: ${missingKeys}. ` +
      'Please check your .env file and ensure all required variables are set.'
    )
  }
}

// Optional environment variables check
export const hasOptionalFeatures = {
  openai: !!openaiConfig.apiKey,
  passwordReset: !!appConfig.passwordResetUrl,
} as const

// Test environment helper
export const getTestEnvironment = () => ({
  baseURL: testConfig.playwrightBaseUrl || appConfig.baseUrl,
  isCI: testConfig.isCI,
  environment: appConfig.nodeEnv,
})