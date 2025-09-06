/**
 * Product Constants
 *
 * Extracted constants to prevent react-refresh violations and improve maintainability
 */

export const PRODUCT_CATEGORIES = [
  'beverages',
  'dairy',
  'frozen',
  'fresh_produce',
  'meat_poultry',
  'seafood',
  'dry_goods',
  'spices_seasonings',
  'baking_supplies',
  'cleaning_supplies',
  'paper_products',
  'equipment',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
