import { supabase } from '@/lib/supabase'
import type {
  LayoutTemplate,
  CreateLayoutTemplate,
  TemplateWithMetadata,
  ShareTemplateRequest,
  ShareTemplateResult,
  TemplateExportFormat,
  TemplateImportResult,
  TemplateValidationResult,
  TemplateAnalytics,
  TemplateRecommendation,
  TemplateActionType,
} from '@/features/layout-templates/types/template.types'
import type { LayoutConfiguration, LayoutEntityType } from '@/types/layout/schema.types'

/**
 * Layout Sharing Service
 *
 * Provides comprehensive functionality for:
 * - Template sharing and access control
 * - Import/export operations
 * - Template validation and compatibility checking
 * - Analytics and usage tracking
 * - Recommendation system
 * - Organization-level template management
 */
export class LayoutSharingService {
  /**
   * Share a template with specified visibility and permissions
   */
  static async shareTemplate(request: ShareTemplateRequest): Promise<ShareTemplateResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Verify template ownership or admin access
      const { data: template, error: templateError } = await supabase
        .from('layout_templates')
        .select('*')
        .eq('id', request.templateId)
        .single()

      if (templateError) throw templateError
      if (template.created_by !== user.id) {
        // Check if user is admin (would need admin function)
        throw new Error('Insufficient permissions to share this template')
      }

      // Update template visibility
      const updateData: any = {
        visibility: request.shareWith,
        updated_by: user.id,
      }

      if (request.shareWith === 'organization' && request.organizationId) {
        updateData.organization_id = request.organizationId
      }

      const { error: updateError } = await supabase
        .from('layout_templates')
        .update(updateData)
        .eq('id', request.templateId)

      if (updateError) throw updateError

      // Track sharing action
      await this.trackTemplateUsage(request.templateId, 'share', {
        shareWith: request.shareWith,
        organizationId: request.organizationId,
      })

      // Generate share URL
      const shareUrl = this.generateShareUrl(request.templateId)

      return {
        success: true,
        shareUrl,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      }
    }
  }

  /**
   * Export a template with all its data and metadata
   */
  static async exportTemplate(templateId: string): Promise<TemplateExportFormat | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get template with full data
      const { data: template, error: templateError } = await supabase
        .from('layout_templates')
        .select(`
          *,
          template_versions!template_versions_template_id_fkey(*)
        `)
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError

      // Verify access permissions
      const hasAccess = await this.checkTemplateAccess(templateId, user.id)
      if (!hasAccess) {
        throw new Error('Insufficient permissions to export this template')
      }

      // Track export action
      await this.trackTemplateUsage(templateId, 'export')

      // Create export format
      const exportData: TemplateExportFormat = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: user.id,
        template: template,
        layout_config: template.layout_config as LayoutConfiguration,
        versions: template.template_versions || [],
        metadata: {
          checksums: {
            template: await this.generateChecksum(template),
            layout_config: await this.generateChecksum(template.layout_config),
          },
          dependencies: this.extractDependencies(template.layout_config as LayoutConfiguration),
          compatibility: {
            minVersion: '1.0.0',
          },
        },
      }

      return exportData
    } catch (error) {
      console.error('Template export error:', error)
      return null
    }
  }

  /**
   * Import a template from export format
   */
  static async importTemplate(
    exportData: TemplateExportFormat,
    options: {
      conflictResolution?: 'skip' | 'overwrite' | 'rename'
      organizationId?: string
    } = {}
  ): Promise<TemplateImportResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { conflictResolution = 'rename' } = options

      // Validate import data
      const validation = await this.validateImportData(exportData)
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors.map(e => e.message),
          warnings: validation.warnings.map(w => w.message),
        }
      }

      // Check for naming conflicts
      const { data: existingTemplate } = await supabase
        .from('layout_templates')
        .select('id, name')
        .eq('name', exportData.template.name)
        .eq('entity_type', exportData.template.entity_type)
        .eq('created_by', user.id)
        .maybeSingle()

      let templateName = exportData.template.name

      if (existingTemplate) {
        switch (conflictResolution) {
          case 'skip':
            return {
              success: false,
              errors: [`Template with name "${templateName}" already exists`],
              warnings: [],
              conflictResolution: 'skip',
            }
          case 'overwrite':
            // Delete existing template
            await supabase
              .from('layout_templates')
              .delete()
              .eq('id', existingTemplate.id)
            break
          case 'rename':
            templateName = await this.generateUniqueTemplateName(templateName, user.id)
            break
        }
      }

      // Create imported template
      const templateData: CreateLayoutTemplate = {
        name: templateName,
        description: exportData.template.description,
        category: 'custom', // Imported templates are always custom
        entity_type: exportData.template.entity_type,
        visibility: 'private', // Imported templates are private by default
        organization_id: options.organizationId,
        layout_config: exportData.layout_config as any,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data: newTemplate, error: insertError } = await supabase
        .from('layout_templates')
        .insert(templateData)
        .select()
        .single()

      if (insertError) throw insertError

      // Import versions if present
      if (exportData.versions && exportData.versions.length > 0) {
        const versionsToImport = exportData.versions.map(version => ({
          template_id: newTemplate.id,
          version_number: version.version_number,
          version_name: version.version_name,
          changelog: version.changelog,
          layout_config: version.layout_config,
          is_current: version.is_current,
          is_stable: version.is_stable,
          created_by: user.id,
        }))

        const { error: versionsError } = await supabase
          .from('template_versions')
          .insert(versionsToImport)

        if (versionsError) {
          console.warn('Failed to import versions:', versionsError)
          // Don't fail the entire import for version issues
        }
      } else {
        // Create initial version
        await supabase
          .from('template_versions')
          .insert({
            template_id: newTemplate.id,
            version_number: '1.0.0',
            version_name: 'Imported version',
            changelog: 'Template imported from external source',
            layout_config: exportData.layout_config as any,
            is_current: true,
            created_by: user.id,
          })
      }

      return {
        success: true,
        template: newTemplate,
        errors: [],
        warnings: validation.warnings.map(w => w.message),
        conflictResolution,
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown import error'],
        warnings: [],
      }
    }
  }

  /**
   * Validate import data for compatibility and correctness
   */
  static async validateImportData(exportData: TemplateExportFormat): Promise<TemplateValidationResult> {
    const errors: any[] = []
    const warnings: any[] = []

    // Validate export format version
    if (!exportData.version || exportData.version !== '1.0.0') {
      warnings.push({
        code: 'VERSION_MISMATCH',
        message: `Export format version ${exportData.version} may not be fully compatible`,
        suggestion: 'Consider updating the export format',
      })
    }

    // Validate required fields
    if (!exportData.template.name) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Template name is required',
        severity: 'error',
      })
    }

    if (!exportData.template.entity_type) {
      errors.push({
        code: 'MISSING_ENTITY_TYPE',
        message: 'Template entity type is required',
        severity: 'error',
      })
    }

    if (!exportData.layout_config) {
      errors.push({
        code: 'MISSING_LAYOUT_CONFIG',
        message: 'Layout configuration is required',
        severity: 'error',
      })
    }

    // Validate layout configuration structure
    if (exportData.layout_config) {
      try {
        const layoutValidation = await this.validateLayoutConfiguration(exportData.layout_config)
        if (!layoutValidation.isValid) {
          errors.push(...layoutValidation.errors)
          warnings.push(...layoutValidation.warnings)
        }
      } catch (error) {
        errors.push({
          code: 'LAYOUT_VALIDATION_FAILED',
          message: 'Failed to validate layout configuration',
          severity: 'error',
        })
      }
    }

    // Check dependencies
    const dependencies = this.extractDependencies(exportData.layout_config)
    const missingDependencies = await this.checkDependencies(dependencies)
    if (missingDependencies.length > 0) {
      warnings.push({
        code: 'MISSING_DEPENDENCIES',
        message: `Missing dependencies: ${missingDependencies.join(', ')}`,
        suggestion: 'Some features may not work correctly without these dependencies',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      compatibility: {
        entityType: !errors.some(e => e.code === 'MISSING_ENTITY_TYPE'),
        schemaVersion: !errors.some(e => e.code === 'VERSION_MISMATCH'),
        dependencies: missingDependencies.length === 0,
        features: dependencies,
      },
    }
  }

  /**
   * Get template analytics and usage statistics
   */
  static async getTemplateAnalytics(templateId: string): Promise<TemplateAnalytics | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check template ownership for analytics access
      const { data: template } = await supabase
        .from('layout_templates')
        .select('created_by')
        .eq('id', templateId)
        .single()

      if (!template || template.created_by !== user.id) {
        throw new Error('Insufficient permissions to view analytics')
      }

      // Get usage analytics
      const { data: usageData } = await supabase
        .from('template_usage_analytics')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false })

      if (!usageData) return null

      // Aggregate analytics data
      const analytics: TemplateAnalytics = {
        templateId,
        totalViews: usageData.filter(u => u.action_type === 'view').length,
        totalForks: usageData.filter(u => u.action_type === 'fork').length,
        totalApplies: usageData.filter(u => u.action_type === 'apply').length,
        totalExports: usageData.filter(u => u.action_type === 'export').length,
        totalShares: usageData.filter(u => u.action_type === 'share').length,

        // Time-based analytics (simplified)
        viewsOverTime: this.aggregateTimeSeriesData(
          usageData.filter(u => u.action_type === 'view')
        ),

        // Entity type breakdown
        usageByEntityType: {} as Record<LayoutEntityType, number>,

        // Organization breakdown (if applicable)
        usageByOrganization: {},

        // User engagement metrics
        uniqueUsers: new Set(usageData.map(u => u.user_id)).size,
        returningUsers: this.countReturningUsers(usageData),
        averageEngagementTime: 0, // Would need session tracking

        // Performance metrics (placeholder values)
        loadTime: 0,
        errorRate: 0,
        conversionRate: usageData.length > 0
          ? (usageData.filter(u => u.action_type === 'apply').length / usageData.filter(u => u.action_type === 'view').length) * 100
          : 0,
      }

      return analytics
    } catch (error) {
      console.error('Analytics error:', error)
      return null
    }
  }

  /**
   * Get template recommendations for a user
   */
  static async getTemplateRecommendations(
    entityType: LayoutEntityType,
    limit: number = 10
  ): Promise<TemplateRecommendation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get user's usage history for collaborative filtering
      const { data: userUsage } = await supabase
        .from('template_usage_analytics')
        .select('template_id, action_type')
        .eq('user_id', user.id)

      // Get highly rated templates
      const { data: highRatedTemplates } = await supabase
        .from('layout_templates')
        .select(`
          *,
          template_versions!template_versions_template_id_fkey(
            id,
            version_number,
            is_current
          )
        `)
        .eq('entity_type', entityType)
        .gte('rating_average', 4.0)
        .gte('rating_count', 3)
        .order('rating_average', { ascending: false })
        .limit(limit)

      if (!highRatedTemplates) return []

      // Convert to recommendations with scoring
      const recommendations: TemplateRecommendation[] = highRatedTemplates.map(template => {
        const hasUsed = userUsage?.some(u => u.template_id === template.id) || false
        const isPopular = template.usage_count > 10
        const isRecentlyUpdated = new Date(template.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        let score = template.rating_average * 10 // Base score from rating
        let reason: any = 'high_rating'

        if (isPopular) {
          score += 10
          reason = 'organization_popular'
        }

        if (isRecentlyUpdated) {
          score += 5
          reason = 'recently_updated'
        }

        if (hasUsed) {
          score -= 20 // Lower score for already used templates
        }

        return {
          template: {
            ...template,
            current_version: template.template_versions?.find(v => v.is_current),
            version_count: template.template_versions?.length || 0,
            rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // Would be populated from ratings
            user_has_used: hasUsed,
            creator_name: 'Unknown', // Would be populated from user data
          },
          score,
          reason,
          metadata: {
            confidence: Math.min(score / 50, 1), // Normalize confidence score
            explanation: this.generateRecommendationExplanation(reason, template),
            relatedTemplates: [], // Would be populated by similarity algorithm
          },
        }
      })

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    } catch (error) {
      console.error('Recommendation error:', error)
      return []
    }
  }

  /**
   * Track template usage analytics
   */
  static async trackTemplateUsage(
    templateId: string,
    action: TemplateActionType,
    context?: any
  ): Promise<void> {
    try {
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

      // Update template usage count for certain actions
      if (['apply', 'fork', 'export'].includes(action)) {
        await supabase.rpc('increment_template_usage', {
          template_id: templateId,
        })
      }
    } catch (error) {
      console.error('Usage tracking error:', error)
      // Don't throw - analytics failures shouldn't break user experience
    }
  }

  // Private helper methods

  private static generateShareUrl(templateId: string): string {
    return `${window.location.origin}/templates/${templateId}`
  }

  private static async checkTemplateAccess(templateId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('layout_templates')
      .select('visibility, created_by, organization_id')
      .eq('id', templateId)
      .single()

    if (!data) return false

    // Owner always has access
    if (data.created_by === userId) return true

    // Public templates are accessible
    if (data.visibility === 'public') return true

    // Organization templates require org membership (simplified check)
    if (data.visibility === 'organization' && data.organization_id) {
      // Would need to check user's organization membership
      return true // Simplified for now
    }

    return false
  }

  private static async generateChecksum(data: any): Promise<string> {
    const jsonString = JSON.stringify(data, null, 0)
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(jsonString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private static extractDependencies(layoutConfig: LayoutConfiguration): string[] {
    // Extract component dependencies from layout configuration
    // This would analyze the layout config and return required components/features
    const dependencies: string[] = []

    // Add entity-specific dependencies
    dependencies.push(`entity-${layoutConfig.entityType}`)

    // Add layout type dependencies
    dependencies.push(`layout-${layoutConfig.type}`)

    return dependencies
  }

  private static async checkDependencies(dependencies: string[]): Promise<string[]> {
    // Check which dependencies are missing
    // This would verify against available components/features
    return [] // Simplified - assume all dependencies are available
  }

  private static async validateLayoutConfiguration(config: LayoutConfiguration): Promise<TemplateValidationResult> {
    // Validate layout configuration structure
    const errors: any[] = []
    const warnings: any[] = []

    if (!config.id) {
      errors.push({
        code: 'MISSING_LAYOUT_ID',
        message: 'Layout configuration must have an ID',
        severity: 'error',
      })
    }

    if (!config.entityType) {
      errors.push({
        code: 'MISSING_ENTITY_TYPE',
        message: 'Layout configuration must specify an entity type',
        severity: 'error',
      })
    }

    if (!config.type) {
      errors.push({
        code: 'MISSING_LAYOUT_TYPE',
        message: 'Layout configuration must specify a layout type',
        severity: 'error',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      compatibility: {
        entityType: !!config.entityType,
        schemaVersion: true,
        dependencies: true,
        features: [],
      },
    }
  }

  private static async generateUniqueTemplateName(baseName: string, userId: string): Promise<string> {
    let counter = 1
    let uniqueName = `${baseName} (${counter})`

    while (true) {
      const { data } = await supabase
        .from('layout_templates')
        .select('id')
        .eq('name', uniqueName)
        .eq('created_by', userId)
        .maybeSingle()

      if (!data) break

      counter++
      uniqueName = `${baseName} (${counter})`
    }

    return uniqueName
  }

  private static aggregateTimeSeriesData(usageData: any[]): any[] {
    // Aggregate usage data by day for time series
    const aggregated: Record<string, number> = {}

    usageData.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      aggregated[date] = (aggregated[date] || 0) + 1
    })

    return Object.entries(aggregated).map(([timestamp, value]) => ({
      timestamp,
      value,
    }))
  }

  private static countReturningUsers(usageData: any[]): number {
    const userActionCounts: Record<string, number> = {}

    usageData.forEach(item => {
      userActionCounts[item.user_id] = (userActionCounts[item.user_id] || 0) + 1
    })

    return Object.values(userActionCounts).filter(count => count > 1).length
  }

  private static generateRecommendationExplanation(reason: any, template: any): string {
    switch (reason) {
      case 'high_rating':
        return `This template has a high rating (${template.rating_average.toFixed(1)}/5.0) from ${template.rating_count} users.`
      case 'organization_popular':
        return `This template is popular in your organization with ${template.usage_count} uses.`
      case 'recently_updated':
        return `This template was recently updated and includes the latest features.`
      default:
        return 'This template is recommended based on your usage patterns.'
    }
  }
}