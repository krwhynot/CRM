import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  LayoutTemplate,
  CreateLayoutTemplate,
  UpdateLayoutTemplate,
  TemplateWithMetadata,
  TemplateGalleryFilters,
  TemplateActionType,
  ForkTemplateRequest,
  ForkTemplateResult,
} from '../types/template.types'
import type { LayoutConfiguration, LayoutEntityType } from '@/types/layout/schema.types'
import { validateAuthentication } from '@/lib/error-utils'

// Query key factories
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters: TemplateGalleryFilters) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  versions: (id: string) => [...templateKeys.detail(id), 'versions'] as const,
  ratings: (id: string) => [...templateKeys.detail(id), 'ratings'] as const,
  analytics: (id: string) => [...templateKeys.detail(id), 'analytics'] as const,
  recommendations: (entityType: LayoutEntityType) => [...templateKeys.all, 'recommendations', entityType] as const,
  search: (query: string) => [...templateKeys.all, 'search', query] as const,
}

/**
 * Hook to fetch templates with filtering and pagination
 */
export function useTemplates(filters: TemplateGalleryFilters = {}) {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('layout_templates')
        .select(`
          *,
          template_versions!template_versions_template_id_fkey(
            id,
            version_number,
            version_name,
            changelog,
            is_current,
            created_at
          ),
          template_ratings(
            rating,
            user_id
          ),
          creator:created_by(
            id,
            email
          )
        `)

      // Apply entity type filter
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType)
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Apply visibility filter
      if (filters.visibility) {
        query = query.eq('visibility', filters.visibility)
      }

      // Apply minimum rating filter
      if (filters.minRating) {
        query = query.gte('rating_average', filters.minRating)
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'updated_at'
      const sortOrder = filters.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error, count } = await query

      if (error) throw error

      // Transform data to include metadata
      const templatesWithMetadata: TemplateWithMetadata[] = data?.map(template => ({
        ...template,
        current_version: template.template_versions?.find(v => v.is_current),
        version_count: template.template_versions?.length || 0,
        rating_distribution: calculateRatingDistribution(template.template_ratings || []),
        user_has_used: false, // Will be populated by separate query
        creator_name: (template.creator as any)?.email?.split('@')[0] || 'Unknown',
      })) || []

      return {
        templates: templatesWithMetadata,
        total: count || 0,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single template with full details
 */
export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: templateKeys.detail(templateId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('layout_templates')
        .select(`
          *,
          template_versions!template_versions_template_id_fkey(
            *
          ),
          template_ratings(
            *,
            user:user_id(
              id,
              email
            )
          ),
          creator:created_by(
            id,
            email
          )
        `)
        .eq('id', templateId)
        .single()

      if (error) throw error

      // Transform to include metadata
      const templateWithMetadata: TemplateWithMetadata = {
        ...data,
        current_version: data.template_versions?.find(v => v.is_current),
        version_count: data.template_versions?.length || 0,
        rating_distribution: calculateRatingDistribution(data.template_ratings || []),
        user_has_used: false, // TODO: Check usage analytics
        creator_name: (data.creator as any)?.email?.split('@')[0] || 'Unknown',
      }

      return templateWithMetadata
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!templateId,
  })
}

/**
 * Hook to fetch user's own templates
 */
export function useMyTemplates() {
  return useQuery({
    queryKey: [...templateKeys.lists(), 'my-templates'],
    queryFn: async () => {
      const { user, error: authError } = await validateAuthentication(supabase)
      if (authError || !user) {
        throw new Error(authError || 'Authentication required')
      }

      const { data, error } = await supabase
        .from('layout_templates')
        .select(`
          *,
          template_versions!template_versions_template_id_fkey(
            id,
            version_number,
            is_current,
            created_at
          )
        `)
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return data?.map(template => ({
        ...template,
        current_version: template.template_versions?.find(v => v.is_current),
        version_count: template.template_versions?.length || 0,
      })) || []
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      template: Omit<CreateLayoutTemplate, 'created_by'>
      layoutConfig: LayoutConfiguration
    }) => {
      const { user, error: authError } = await validateAuthentication(supabase)
      if (authError || !user) {
        throw new Error(authError || 'Authentication required')
      }

      const templateData: CreateLayoutTemplate = {
        ...data.template,
        layout_config: data.layoutConfig as any,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data: result, error } = await supabase
        .from('layout_templates')
        .insert(templateData)
        .select()
        .single()

      if (error) throw error

      // Create initial version
      const { error: versionError } = await supabase
        .from('template_versions')
        .insert({
          template_id: result.id,
          version_number: '1.0.0',
          version_name: 'Initial version',
          layout_config: data.layoutConfig as any,
          is_current: true,
          created_by: user.id,
        })

      if (versionError) throw versionError

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

/**
 * Hook to update a template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string
      template: UpdateLayoutTemplate
      layoutConfig?: LayoutConfiguration
      createNewVersion?: boolean
      versionName?: string
      changelog?: string
    }) => {
      const { user, error: authError } = await validateAuthentication(supabase)
      if (authError || !user) {
        throw new Error(authError || 'Authentication required')
      }

      const updateData: UpdateLayoutTemplate = {
        ...data.template,
        updated_by: user.id,
      }

      // Include layout_config if provided
      if (data.layoutConfig) {
        updateData.layout_config = data.layoutConfig as any
      }

      const { data: result, error } = await supabase
        .from('layout_templates')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error

      // Create new version if requested
      if (data.createNewVersion && data.layoutConfig) {
        // Mark current version as not current
        await supabase
          .from('template_versions')
          .update({ is_current: false })
          .eq('template_id', data.id)
          .eq('is_current', true)

        // Create new version
        const { error: versionError } = await supabase
          .from('template_versions')
          .insert({
            template_id: data.id,
            version_number: generateNextVersion(data.id), // TODO: Implement version generation
            version_name: data.versionName || 'New version',
            changelog: data.changelog,
            layout_config: data.layoutConfig as any,
            is_current: true,
            created_by: user.id,
          })

        if (versionError) throw versionError
      }

      return result
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('layout_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

/**
 * Hook to fork a template
 */
export function useForkTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ForkTemplateRequest): Promise<ForkTemplateResult> => {
      const { user, error: authError } = await validateAuthentication(supabase)
      if (authError || !user) {
        throw new Error(authError || 'Authentication required')
      }

      try {
        // Get source template
        const { data: sourceTemplate, error: sourceError } = await supabase
          .from('layout_templates')
          .select(`
            *,
            template_versions!template_versions_template_id_fkey(*)
          `)
          .eq('id', request.sourceTemplateId)
          .single()

        if (sourceError) throw sourceError

        // Get current version's layout config
        const currentVersion = sourceTemplate.template_versions?.find(v => v.is_current)
        if (!currentVersion) throw new Error('No current version found')

        let layoutConfig = currentVersion.layout_config as LayoutConfiguration

        // Apply customizations if provided
        if (request.customizations) {
          layoutConfig = {
            ...layoutConfig,
            ...request.customizations,
          }
        }

        // Create forked template
        const forkedTemplate: CreateLayoutTemplate = {
          name: request.name,
          description: request.description,
          category: 'custom',
          entity_type: sourceTemplate.entity_type,
          visibility: request.visibility,
          organization_id: request.organizationId,
          layout_config: layoutConfig as any,
          created_by: user.id,
          updated_by: user.id,
        }

        const { data: result, error } = await supabase
          .from('layout_templates')
          .insert(forkedTemplate)
          .select()
          .single()

        if (error) throw error

        // Create initial version for forked template
        const { error: versionError } = await supabase
          .from('template_versions')
          .insert({
            template_id: result.id,
            version_number: '1.0.0',
            version_name: `Forked from ${sourceTemplate.name}`,
            changelog: `Forked from template: ${sourceTemplate.name}`,
            layout_config: layoutConfig as any,
            is_current: true,
            created_by: user.id,
          })

        if (versionError) throw versionError

        // Track fork action
        await trackTemplateUsage(request.sourceTemplateId, 'fork')

        return {
          success: true,
          template: result,
          errors: [],
        }
      } catch (error) {
        return {
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

/**
 * Hook to track template usage
 */
export function useTrackTemplateUsage() {
  return useMutation({
    mutationFn: async (data: { templateId: string; action: TemplateActionType; context?: any }) => {
      const { user } = await validateAuthentication(supabase)
      if (!user) return

      await trackTemplateUsage(data.templateId, data.action, data.context)
    },
  })
}

// Helper functions

/**
 * Calculate rating distribution from ratings array
 */
function calculateRatingDistribution(ratings: any[]): Record<1 | 2 | 3 | 4 | 5, number> {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  ratings.forEach(rating => {
    if (rating.rating >= 1 && rating.rating <= 5) {
      distribution[rating.rating as 1 | 2 | 3 | 4 | 5]++
    }
  })

  return distribution
}

/**
 * Track template usage analytics
 */
async function trackTemplateUsage(templateId: string, action: TemplateActionType, context?: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('template_usage_analytics')
    .insert({
      template_id: templateId,
      user_id: user.id,
      action_type: action,
      context: context || {},
    })

  // Update template usage count
  await supabase.rpc('increment_template_usage', { template_id: templateId })
}

/**
 * Generate next version number (simplified version)
 * TODO: Implement proper semantic versioning logic
 */
function generateNextVersion(templateId: string): string {
  // This is a simplified version - in a real implementation,
  // you would query existing versions and calculate the next version
  const timestamp = Date.now()
  return `1.${Math.floor(timestamp / 1000)}.0`
}