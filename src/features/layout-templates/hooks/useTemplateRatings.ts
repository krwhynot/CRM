import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  TemplateRating,
  CreateTemplateRating,
  UpdateTemplateRating,
} from '../types/template.types'
import { validateAuthentication } from '@/lib/error-utils'
import { templateKeys } from './useTemplates'

/**
 * Hook to fetch ratings for a template
 */
export function useTemplateRatings(templateId: string) {
  return useQuery({
    queryKey: templateKeys.ratings(templateId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_ratings')
        .select(`
          *,
          user:user_id(
            id,
            email
          )
        `)
        .eq('template_id', templateId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(rating => ({
        ...rating,
        user_name: (rating.user as any)?.email?.split('@')[0] || 'Anonymous',
      })) || []
    },
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get the current user's rating for a template
 */
export function useUserTemplateRating(templateId: string) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: [...templateKeys.ratings(templateId), 'user-rating'],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('template_ratings')
        .select('*')
        .eq('template_id', templateId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!user && !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to create or update a template rating
 */
export function useRateTemplate() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (data: {
      templateId: string
      rating: number
      review?: string
    }) => {
      if (!user) throw new Error('User not authenticated')

      const { templateId, rating, review } = data

      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5')
      }

      // Check if user already has a rating for this template
      const { data: existingRating } = await supabase
        .from('template_ratings')
        .select('id')
        .eq('template_id', templateId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingRating) {
        // Update existing rating
        const { data: result, error } = await supabase
          .from('template_ratings')
          .update({
            rating,
            review,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRating.id)
          .select()
          .single()

        if (error) throw error
        return result
      } else {
        // Create new rating
        const ratingData: CreateTemplateRating = {
          template_id: templateId,
          user_id: user.id,
          rating,
          review,
        }

        const { data: result, error } = await supabase
          .from('template_ratings')
          .insert(ratingData)
          .select()
          .single()

        if (error) throw error
        return result
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: templateKeys.ratings(variables.templateId) })
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.templateId) })
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

/**
 * Hook to delete a template rating
 */
export function useDeleteTemplateRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { user, error: authError } = await validateAuthentication(supabase)
      if (authError || !user) {
        throw new Error(authError || 'Authentication required')
      }

      const { error } = await supabase
        .from('template_ratings')
        .delete()
        .eq('template_id', templateId)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.ratings(templateId) })
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(templateId) })
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

/**
 * Hook to get template rating statistics
 */
export function useTemplateRatingStats(templateId: string) {
  return useQuery({
    queryKey: [...templateKeys.ratings(templateId), 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_ratings')
        .select('rating')
        .eq('template_id', templateId)

      if (error) throw error

      const ratings = data || []
      const total = ratings.length

      if (total === 0) {
        return {
          average: 0,
          total: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        }
      }

      const sum = ratings.reduce((acc, { rating }) => acc + rating, 0)
      const average = sum / total

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      ratings.forEach(({ rating }) => {
        if (rating >= 1 && rating <= 5) {
          distribution[rating as 1 | 2 | 3 | 4 | 5]++
        }
      })

      return {
        average: Math.round(average * 100) / 100, // Round to 2 decimal places
        total,
        distribution,
      }
    },
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get top-rated templates
 */
export function useTopRatedTemplates(entityType?: string, limit = 10) {
  return useQuery({
    queryKey: [...templateKeys.lists(), 'top-rated', entityType, limit],
    queryFn: async () => {
      let query = supabase
        .from('layout_templates')
        .select(`
          *,
          template_versions!template_versions_template_id_fkey(
            id,
            version_number,
            is_current
          )
        `)
        .gte('rating_count', 3) // Minimum 3 ratings to be considered
        .order('rating_average', { ascending: false })
        .limit(limit)

      if (entityType) {
        query = query.eq('entity_type', entityType)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map(template => ({
        ...template,
        current_version: template.template_versions?.find(v => v.is_current),
        version_count: template.template_versions?.length || 0,
      })) || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to get recent reviews for a template
 */
export function useTemplateReviews(templateId: string, limit = 5) {
  return useQuery({
    queryKey: [...templateKeys.ratings(templateId), 'reviews', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_ratings')
        .select(`
          *,
          user:user_id(
            id,
            email
          )
        `)
        .eq('template_id', templateId)
        .not('review', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data?.map(rating => ({
        ...rating,
        user_name: (rating.user as any)?.email?.split('@')[0] || 'Anonymous',
      })) || []
    },
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}