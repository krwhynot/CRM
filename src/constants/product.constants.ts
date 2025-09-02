/**
 * Product Constants
 *
 * Extracted constants to prevent react-refresh violations and improve maintainability
 */

export const PRODUCT_CATEGORIES = [
  'dry_goods',
  'refrigerated',
  'frozen',
  'beverages',
  'equipment',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
