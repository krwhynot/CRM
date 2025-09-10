/**
 * URL Constants Configuration
 * 
 * Centralized configuration for all URLs used throughout the application,
 * including form placeholders, external service URLs, and default values.
 */

// Form Placeholder URLs
export const placeholderUrls = {
  organization: 'https://www.organization.com',
  linkedin: 'https://linkedin.com/in/profile',
  companyLinkedin: 'https://linkedin.com/company/company-name',
  principal: 'https://www.principal.com',
  website: 'https://example.com',
} as const

// External Service URLs
export const externalUrls = {
  linkedin: {
    base: 'https://linkedin.com',
    company: 'https://linkedin.com/company',
    profile: 'https://linkedin.com/in',
  },
  documentation: {
    supabase: 'https://supabase.com/docs',
    react: 'https://react.dev',
    tailwind: 'https://tailwindcss.com/docs',
  },
} as const

// API Endpoints (relative to base URL)
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    signup: '/auth/signup',
    resetPassword: '/auth/reset-password',
  },
  organizations: '/api/organizations',
  contacts: '/api/contacts',
  opportunities: '/api/opportunities',
  products: '/api/products',
  interactions: '/api/interactions',
} as const

// Default URLs for development and testing
export const defaultUrls = {
  development: 'http://localhost:5173',
  test: 'http://localhost:5175',
  resetPassword: '/reset-password',
} as const

// URL Validation Patterns
export const urlPatterns = {
  website: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  linkedin: /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-_]+\/?$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// Helper functions for URL formatting
export const formatUrl = (url: string): string => {
  if (!url) return ''
  
  // Add https:// if no protocol is specified
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`
  }
  
  return url
}

export const validateUrl = (url: string, type: keyof typeof urlPatterns = 'website'): boolean => {
  if (!url) return false
  return urlPatterns[type].test(url)
}

export const isLinkedInUrl = (url: string): boolean => {
  return validateUrl(url, 'linkedin')
}

export const isValidEmail = (email: string): boolean => {
  return validateUrl(email, 'email')
}