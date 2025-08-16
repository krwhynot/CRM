import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { 
  ProductInsert, 
  ProductUpdate, 
  ProductFilters,
  ProductWithPrincipal 
} from '@/types/entities'
import type { Database } from '@/types/database.types'

// Query key factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byPrincipal: (principalId: string) => [...productKeys.all, 'principal', principalId] as const,
  byCategory: (category: string) => [...productKeys.all, 'category', category] as const,
}

// Hook to fetch all products with optional filtering
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          principal_id,
          category,
          description,
          sku,
          unit_of_measure,
          unit_cost,
          list_price,
          min_order_quantity,
          created_at,
          principal:organizations!products_principal_id_fkey(id, name, type)
        `)
        .is('deleted_at', null)
        .order('name')
        .limit(100)

      // Apply filters
      if (filters?.principal_id) {
        query = query.eq('principal_id', filters.principal_id)
      }

      if (filters?.category) {
        if (Array.isArray(filters.category)) {
          query = query.in('category', filters.category)
        } else {
          query = query.eq('category', filters.category)
        }
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
      }

      query = query.order('name')

      const { data, error } = await query

      if (error) throw error
      return data as ProductWithPrincipal[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch a single product by ID with principal details
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as ProductWithPrincipal
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch products for a specific principal
export function useProductsByPrincipal(principalId: string) {
  return useQuery({
    queryKey: productKeys.byPrincipal(principalId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .eq('principal_id', principalId)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      return data as ProductWithPrincipal[]
    },
    enabled: !!principalId,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch products by category
export function useProductsByCategory(category: Database['public']['Enums']['product_category']) {
  return useQuery({
    queryKey: productKeys.byCategory(category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .eq('category', category)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      return data as ProductWithPrincipal[]
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to get seasonal products (current season)
export function useSeasonalProducts() {
  const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-indexed

  return useQuery({
    queryKey: [...productKeys.all, 'seasonal', currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .is('deleted_at', null)
        .or(`and(season_start.lte.${currentMonth},season_end.gte.${currentMonth}),and(season_start.is.null,season_end.is.null)`)
        .order('name')

      if (error) throw error
      return data as ProductWithPrincipal[]
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour (seasonal data doesn't change often)
  })
}

// Hook to create a new product
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      // Get current user ID for RLS policy compliance
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Authentication required to create product')
      }

      // Ensure required audit fields are set for RLS policy
      const productData = {
        ...product,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .single()

      if (error) {
        // Handle specific database constraint violations with user-friendly messages
        if (error.code === '23505') { // Unique constraint violation
          if (error.message?.includes('sku')) {
            throw new Error('A product with this SKU already exists. Please use a different SKU.')
          }
          throw new Error('This product information conflicts with an existing product. Please check for duplicates.')
        }
        throw error
      }
      return data as ProductWithPrincipal
    },
    onSuccess: (newProduct) => {
      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.byPrincipal(newProduct.principal_id) })
      queryClient.invalidateQueries({ queryKey: productKeys.byCategory(newProduct.category) })
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'seasonal'] })
      
      // Add the new product to the cache
      queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct)
    },
  })
}

// Hook to update a product
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProductUpdate }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data as ProductWithPrincipal
    },
    onSuccess: (updatedProduct) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.byPrincipal(updatedProduct.principal_id) })
      queryClient.invalidateQueries({ queryKey: productKeys.byCategory(updatedProduct.category) })
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'seasonal'] })
      
      // Update the specific product in the cache
      queryClient.setQueryData(productKeys.detail(updatedProduct.id), updatedProduct)
    },
  })
}

// Hook to soft delete a product
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data as ProductWithPrincipal
    },
    onSuccess: (deletedProduct) => {
      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.byPrincipal(deletedProduct.principal_id) })
      queryClient.invalidateQueries({ queryKey: productKeys.byCategory(deletedProduct.category) })
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'seasonal'] })
      
      // Remove from individual cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedProduct.id) })
    },
  })
}

// Hook to restore a soft-deleted product
export function useRestoreProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data as ProductWithPrincipal
    },
    onSuccess: (restoredProduct) => {
      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.byPrincipal(restoredProduct.principal_id) })
      queryClient.invalidateQueries({ queryKey: productKeys.byCategory(restoredProduct.category) })
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'seasonal'] })
      
      // Add back to individual cache
      queryClient.setQueryData(productKeys.detail(restoredProduct.id), restoredProduct)
    },
  })
}

// Hook to duplicate a product
export function useDuplicateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates?: Partial<ProductInsert> }) => {
      // First, get the original product
      const { data: originalProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Create new product with modified data
      const newProductData: ProductInsert = {
        ...originalProduct,
        id: undefined, // Let Supabase generate new ID
        name: `${originalProduct.name} (Copy)`,
        sku: originalProduct.sku ? `${originalProduct.sku}-copy` : undefined,
        created_at: undefined,
        updated_at: undefined,
        ...updates, // Apply any overrides
      }

      const { data, error } = await supabase
        .from('products')
        .insert(newProductData)
        .select(`
          *,
          principal:organizations!products_principal_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data as ProductWithPrincipal
    },
    onSuccess: (duplicatedProduct) => {
      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.byPrincipal(duplicatedProduct.principal_id) })
      queryClient.invalidateQueries({ queryKey: productKeys.byCategory(duplicatedProduct.category) })
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'seasonal'] })
      
      // Add the duplicated product to the cache
      queryClient.setQueryData(productKeys.detail(duplicatedProduct.id), duplicatedProduct)
    },
  })
}