import { formatCurrency } from '@/lib/formatters'

export const formatPrice = (price: number | null): string => {
  if (!price || price <= 0) return 'N/A'
  return formatCurrency(price)
}

export const formatShelfLife = (days: number | null): string => {
  if (!days || days <= 0) return 'N/A'
  if (days === 1) return '1 day'
  if (days < 30) return `${days} days`
  if (days < 365) {
    const months = Math.round(days / 30)
    return months === 1 ? '1 month' : `${months} months`
  }
  const years = Math.round(days / 365)
  return years === 1 ? '1 year' : `${years} years`
}
