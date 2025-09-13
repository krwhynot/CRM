/**
 * Formatting Utilities
 * Consolidated formatting functions to avoid duplication across the codebase
 */

/**
 * Formats a number as currency (USD)
 * @param value - Number to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | null | undefined,
  options: {
    showCents?: boolean
    defaultValue?: string
  } = {}
): string {
  const { showCents = true, defaultValue = '-' } = options

  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  return formatter.format(value)
}

/**
 * Formats a number as a percentage
 * @param value - Number to format (0-100 scale)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '-'
  }

  return `${value.toFixed(decimals)}%`
}

/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Formats a phone number to US format
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-'

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')

  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return cleaned.replace(/1(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3')
  }

  return phone // Return original if format doesn't match
}

/**
 * Formats a number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '-'
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text) return ''
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength - suffix.length) + suffix
}
