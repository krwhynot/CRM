import type { LayoutConfiguration, LayoutEntityType } from '@/types/layout/schema.types'
import type { Database } from '@/lib/database.types'

// Database row types
export type LayoutTemplate = Database['public']['Tables']['layout_templates']['Row']
export type TemplateVersion = Database['public']['Tables']['template_versions']['Row']
export type TemplateRating = Database['public']['Tables']['template_ratings']['Row']
export type TemplateUsageAnalytics = Database['public']['Tables']['template_usage_analytics']['Row']

// Insert types
export type CreateLayoutTemplate = Database['public']['Tables']['layout_templates']['Insert']
export type CreateTemplateVersion = Database['public']['Tables']['template_versions']['Insert']
export type CreateTemplateRating = Database['public']['Tables']['template_ratings']['Insert']
export type CreateTemplateUsageAnalytics = Database['public']['Tables']['template_usage_analytics']['Insert']

// Update types
export type UpdateLayoutTemplate = Database['public']['Tables']['layout_templates']['Update']
export type UpdateTemplateVersion = Database['public']['Tables']['template_versions']['Update']
export type UpdateTemplateRating = Database['public']['Tables']['template_ratings']['Update']

// Enhanced template types with computed fields
export interface TemplateWithMetadata extends LayoutTemplate {
  // Version information
  current_version?: TemplateVersion
  version_count: number

  // Rating information
  user_rating?: number // Current user's rating
  rating_distribution: Record<1 | 2 | 3 | 4 | 5, number>

  // Usage information
  recent_usage?: TemplateUsageAnalytics[]
  user_has_used: boolean

  // Creator information
  creator_name?: string
  creator_avatar?: string

  // Organization information (if applicable)
  organization_name?: string
}

// Template gallery types
export interface TemplateGalleryFilters {
  entityType?: LayoutEntityType
  category?: TemplateCategory
  visibility?: TemplateVisibility
  minRating?: number
  search?: string
  tags?: string[]
  sortBy?: TemplateSortBy
  sortOrder?: 'asc' | 'desc'
}

export interface TemplateGalleryState {
  templates: TemplateWithMetadata[]
  total: number
  page: number
  pageSize: number
  filters: TemplateGalleryFilters
  loading: boolean
  error?: string
}

// Template categories
export type TemplateCategory =
  | 'system'        // Built-in system templates
  | 'community'     // Community contributed templates
  | 'organization'  // Organization-specific templates
  | 'personal'      // Personal templates
  | 'custom'        // Custom user-created templates

// Template visibility levels
export type TemplateVisibility =
  | 'private'       // Only visible to creator
  | 'organization'  // Visible to organization members
  | 'public'        // Publicly visible

// Template sorting options
export type TemplateSortBy =
  | 'name'
  | 'created_at'
  | 'updated_at'
  | 'rating_average'
  | 'usage_count'
  | 'rating_count'

// Template action types for analytics
export type TemplateActionType =
  | 'view'      // User viewed template details
  | 'fork'      // User forked template to their own
  | 'apply'     // User applied template to their layout
  | 'export'    // User exported template
  | 'share'     // User shared template with others

// Template import/export types
export interface TemplateExportFormat {
  version: string
  exportedAt: string
  exportedBy: string
  template: LayoutTemplate
  layout_config: LayoutConfiguration
  versions?: TemplateVersion[]
  metadata: {
    checksums: Record<string, string>
    dependencies: string[]
    compatibility: {
      minVersion: string
      maxVersion?: string
    }
  }
}

export interface TemplateImportResult {
  success: boolean
  template?: LayoutTemplate
  errors: string[]
  warnings: string[]
  conflictResolution?: 'skip' | 'overwrite' | 'rename'
}

// Template validation types
export interface TemplateValidationResult {
  isValid: boolean
  errors: TemplateValidationError[]
  warnings: TemplateValidationWarning[]
  compatibility: TemplateCompatibility
}

export interface TemplateValidationError {
  code: string
  message: string
  path?: string
  severity: 'error' | 'warning'
}

export interface TemplateValidationWarning {
  code: string
  message: string
  path?: string
  suggestion?: string
}

export interface TemplateCompatibility {
  entityType: boolean
  schemaVersion: boolean
  dependencies: boolean
  features: string[] // List of required features
}

// Template forking types
export interface ForkTemplateRequest {
  sourceTemplateId: string
  name: string
  description?: string
  visibility: TemplateVisibility
  organizationId?: string
  customizations?: Partial<LayoutConfiguration>
}

export interface ForkTemplateResult {
  success: boolean
  template?: LayoutTemplate
  errors: string[]
}

// Template sharing types
export interface ShareTemplateRequest {
  templateId: string
  shareWith: 'organization' | 'public'
  organizationId?: string
  permissions: SharePermissions
}

export interface SharePermissions {
  canView: boolean
  canFork: boolean
  canRate: boolean
  canComment: boolean
}

export interface ShareTemplateResult {
  success: boolean
  shareUrl?: string
  errors: string[]
}

// Template analytics types
export interface TemplateAnalytics {
  templateId: string
  totalViews: number
  totalForks: number
  totalApplies: number
  totalExports: number
  totalShares: number

  // Time-based analytics
  viewsOverTime: TimeSeriesData[]
  usageByEntityType: Record<LayoutEntityType, number>
  usageByOrganization: Record<string, number>

  // User engagement
  uniqueUsers: number
  returningUsers: number
  averageEngagementTime: number

  // Performance metrics
  loadTime: number
  errorRate: number
  conversionRate: number // Views to applies
}

export interface TimeSeriesData {
  timestamp: string
  value: number
}

// Template recommendation types
export interface TemplateRecommendation {
  template: TemplateWithMetadata
  score: number
  reason: RecommendationReason
  metadata: RecommendationMetadata
}

export type RecommendationReason =
  | 'similar_usage'       // Based on similar user patterns
  | 'high_rating'         // Highly rated templates
  | 'organization_popular' // Popular in user's organization
  | 'recently_updated'    // Recently updated templates
  | 'matching_entity'     // Matches current entity type
  | 'collaborative_filter' // Collaborative filtering

export interface RecommendationMetadata {
  confidence: number
  explanation: string
  relatedTemplates: string[]
}

// Template collection types (for organizing templates)
export interface TemplateCollection {
  id: string
  name: string
  description?: string
  templateIds: string[]
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

// Template search types
export interface TemplateSearchRequest {
  query: string
  entityType?: LayoutEntityType
  filters: TemplateGalleryFilters
  limit?: number
  offset?: number
}

export interface TemplateSearchResult {
  templates: TemplateWithMetadata[]
  total: number
  facets: SearchFacets
  suggestions: string[]
}

export interface SearchFacets {
  categories: Record<TemplateCategory, number>
  entityTypes: Record<LayoutEntityType, number>
  ratings: Record<1 | 2 | 3 | 4 | 5, number>
  tags: Record<string, number>
}

// Template preview types
export interface TemplatePreview {
  templateId: string
  screenshot?: string
  thumbnails: PreviewThumbnail[]
  interactivePreview: boolean
  responsivePreviews: ResponsivePreview[]
}

export interface PreviewThumbnail {
  size: 'small' | 'medium' | 'large'
  width: number
  height: number
  url: string
}

export interface ResponsivePreview {
  breakpoint: 'mobile' | 'tablet' | 'desktop'
  screenshot: string
  dimensions: { width: number; height: number }
}

// Template comparison types
export interface TemplateComparison {
  templates: TemplateWithMetadata[]
  differences: TemplateDifference[]
  similarities: TemplateSimilarity[]
  recommendation: string
}

export interface TemplateDifference {
  category: 'layout' | 'components' | 'styling' | 'data_binding'
  description: string
  templateIds: string[]
  impact: 'low' | 'medium' | 'high'
}

export interface TemplateSimilarity {
  category: 'layout' | 'components' | 'styling' | 'data_binding'
  description: string
  confidence: number
}