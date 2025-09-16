// Layout Templates Feature Module
// Public exports for the layout template management system

// Core components
export { TemplateGallery } from './components/TemplateGallery'
export { TemplatePreviewCard } from './components/TemplatePreviewCard'
export { TemplateDetailsModal } from './components/TemplateDetailsModal'
export { TemplateIntegration } from './components/TemplateIntegration'

// Hooks
export {
  useTemplates,
  useTemplate,
  useMyTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useForkTemplate,
  useTrackTemplateUsage,
  templateKeys,
} from './hooks/useTemplates'

export {
  useTemplateRatings,
  useUserTemplateRating,
  useRateTemplate,
  useDeleteTemplateRating,
  useTemplateRatingStats,
  useTopRatedTemplates,
  useTemplateReviews,
} from './hooks/useTemplateRatings'

// Services
export { LayoutSharingService } from '../services/layout-sharing'

// Types
export type {
  // Database types
  LayoutTemplate,
  TemplateVersion,
  TemplateRating,
  TemplateUsageAnalytics,
  CreateLayoutTemplate,
  CreateTemplateVersion,
  CreateTemplateRating,
  CreateTemplateUsageAnalytics,
  UpdateLayoutTemplate,
  UpdateTemplateVersion,
  UpdateTemplateRating,

  // Enhanced types
  TemplateWithMetadata,
  TemplateGalleryFilters,
  TemplateGalleryState,

  // Enums and constants
  TemplateCategory,
  TemplateVisibility,
  TemplateSortBy,
  TemplateActionType,

  // Import/Export types
  TemplateExportFormat,
  TemplateImportResult,
  TemplateValidationResult,
  TemplateValidationError,
  TemplateValidationWarning,
  TemplateCompatibility,

  // Sharing and collaboration
  ForkTemplateRequest,
  ForkTemplateResult,
  ShareTemplateRequest,
  ShareTemplateResult,
  SharePermissions,

  // Analytics and recommendations
  TemplateAnalytics,
  TimeSeriesData,
  TemplateRecommendation,
  RecommendationReason,
  RecommendationMetadata,

  // Collections and search
  TemplateCollection,
  TemplateSearchRequest,
  TemplateSearchResult,
  SearchFacets,

  // Preview and comparison
  TemplatePreview,
  PreviewThumbnail,
  ResponsivePreview,
  TemplateComparison,
  TemplateDifference,
  TemplateSimilarity,
} from './types/template.types'

// Constants and utilities
export const TEMPLATE_CATEGORIES = [
  'system',
  'community',
  'organization',
  'personal',
  'custom',
] as const

export const TEMPLATE_VISIBILITY_OPTIONS = [
  'private',
  'organization',
  'public',
] as const

export const TEMPLATE_ACTION_TYPES = [
  'view',
  'fork',
  'apply',
  'export',
  'share',
] as const

export const TEMPLATE_SORT_OPTIONS = [
  { value: 'updated_at', label: 'Recently Updated' },
  { value: 'created_at', label: 'Recently Created' },
  { value: 'name', label: 'Name' },
  { value: 'rating_average', label: 'Rating' },
  { value: 'usage_count', label: 'Popularity' },
  { value: 'rating_count', label: 'Most Reviewed' },
] as const