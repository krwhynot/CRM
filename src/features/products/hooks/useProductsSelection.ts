import { useEntitySelection } from '@/hooks/useEntitySelection'
import type { Product } from '@/types/entities'

/**
 * Products multi-selection hook
 *
 * Provides consistent multi-selection capabilities for products
 * using the generic useEntitySelection pattern. Supports bulk operations
 * like export, delete, and modify.
 *
 * @returns Multi-selection state and handlers for products
 */
export const useProductsSelection = () => {
  return useEntitySelection<Product>()
}