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
export const debugLog = (...args: unknown[]) => {
  if (isDevelopment) {
    // eslint-disable-next-line no-console -- Intentional debug utility for development
    console.log('[DEBUG]', ...args)
  }
}

/**
 * Debug warning function that only outputs in development mode
 * @param args - Arguments to warn about
 */
export const debugWarn = (...args: unknown[]) => {
  if (isDevelopment) {
    // eslint-disable-next-line no-console -- Intentional debug utility for development
    console.warn('[WARNING]', ...args)
  }
}

/**
 * Debug error function that only outputs in development mode
 * @param args - Arguments to error about
 */
export const debugError = (...args: unknown[]) => {
  if (isDevelopment) {
    // eslint-disable-next-line no-console -- Intentional debug utility for development
    console.error('[ERROR]', ...args)
  }
}

/**
 * Debug info function that only outputs in development mode
 * @param args - Arguments to info about
 */
export const debugInfo = (...args: unknown[]) => {
  if (isDevelopment) {
    // eslint-disable-next-line no-console -- Intentional debug utility for development
    console.info('[INFO]', ...args)
  }
}