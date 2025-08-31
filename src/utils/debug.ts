/**
 * Debug Utility for Development
 * 
 * Provides environment-aware debug logging that only outputs to console
 * in development mode. Replaces direct console.log/console.warn usage
 * to ensure clean production builds.
 */

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Debug log function that only outputs in development mode
 * @param args - Arguments to log
 */
export const debugLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log('[DEBUG]', ...args)
  }
}

/**
 * Debug warning function that only outputs in development mode
 * @param args - Arguments to warn about
 */
export const debugWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn('[WARNING]', ...args)
  }
}

/**
 * Debug error function that only outputs in development mode
 * @param args - Arguments to error about
 */
export const debugError = (...args: any[]) => {
  if (isDevelopment) {
    console.error('[ERROR]', ...args)
  }
}

/**
 * Debug info function that only outputs in development mode
 * @param args - Arguments to info about
 */
export const debugInfo = (...args: any[]) => {
  if (isDevelopment) {
    console.info('[INFO]', ...args)
  }
}