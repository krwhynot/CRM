/**
 * Opportunity Auto-Naming Store - Principal CRM Business Logic
 * 
 * Manages comprehensive auto-naming functionality for opportunities with advanced
 * multi-principal support, context-aware naming patterns, and business rule validation.
 * 
 * Key Features:
 * - Multi-principal opportunity naming with configurable patterns
 * - Context-aware naming templates (Site Visit, Food Show, etc.)
 * - 7-point sales funnel integration
 * - Real-time name preview and validation
 * - Business rule enforcement (255 char limit, principal validation)
 * - Custom context support with fallback handling
 */

import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type {
  MultiPrincipalOpportunityFormData,
  OpportunityContext
} from '@/types/opportunity.types'

// Enhanced naming template types
export interface NamingTemplate {
  id: string
  name: string
  pattern: string
  context_types: OpportunityContext[]
  max_length: number
  supports_multi_principal: boolean
  description: string
}

export interface NamingConfiguration {
  use_auto_naming: boolean
  default_template_id: string
  max_name_length: number
  include_date_format: 'MonthYear' | 'FullDate' | 'YearOnly'
  principal_display_format: 'Full' | 'Abbreviated' | 'Count'
  context_abbreviations: Record<OpportunityContext, string>
}

export interface NameValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  final_length: number
  truncated: boolean
  suggested_alternatives?: string[]
}

export interface NamePreview {
  full_name: string
  truncated_name: string
  character_count: number
  is_within_limit: boolean
  template_used: string
  components: {
    organization: string
    principals: string
    context: string
    date: string
  }
}

export interface OpportunityAutoNamingState {
  // Core State
  templates: NamingTemplate[]
  configuration: NamingConfiguration
  
  // Current Naming Session
  current_preview: NamePreview | null
  current_validation: NameValidationResult | null
  selected_template_id: string | null
  
  // Loading States
  isLoading: boolean
  isValidating: boolean
  isGenerating: boolean
  
  // Cache Management - simplified for naming purposes
  principal_cache: Record<string, { id: string; name: string }>
  organization_cache: Record<string, { id: string; name: string }>
  last_cache_update: number | null
  cache_timeout: number // 10 minutes default
  
  // Error Handling
  error: string | null
  
  // Business Logic Methods
  actions: {
    // Core Auto-Naming Functions
    generateAutoName: (data: MultiPrincipalOpportunityFormData, organizationName: string, principalNames: string[]) => Promise<string>
    previewName: (data: Partial<MultiPrincipalOpportunityFormData>, organizationName?: string, principalNames?: string[]) => Promise<NamePreview>
    validateName: (name: string, context?: { max_length?: number }) => NameValidationResult
    
    // Template Management
    fetchTemplates: () => Promise<void>
    getTemplate: (templateId: string) => NamingTemplate | null
    setSelectedTemplate: (templateId: string) => void
    createCustomTemplate: (template: Omit<NamingTemplate, 'id'>) => Promise<NamingTemplate>
    
    // Configuration Management
    updateConfiguration: (config: Partial<NamingConfiguration>) => void
    resetConfiguration: () => void
    getConfiguration: () => NamingConfiguration
    
    // Principal & Organization Data
    fetchPrincipalNames: (principalIds: string[]) => Promise<string[]>
    fetchOrganizationName: (organizationId: string) => Promise<string>
    validatePrincipals: (principalIds: string[]) => Promise<{ valid: boolean; invalid_ids: string[] }>
    
    // Advanced Naming Logic
    generateMultiPrincipalName: (organizationName: string, principalNames: string[], context: OpportunityContext | string, customContext?: string) => string
    generateSuggestions: (baseData: Partial<MultiPrincipalOpportunityFormData>) => Promise<string[]>
    optimizeNameLength: (name: string, maxLength: number) => string
    
    // Context & Date Utilities
    formatContext: (context: OpportunityContext, customContext?: string) => string
    formatDateForNaming: (format: 'MonthYear' | 'FullDate' | 'YearOnly') => string
    getContextAbbreviation: (context: OpportunityContext) => string
    
    // Cache Management
    invalidateCache: () => void
    refreshPrincipalCache: (principalIds: string[]) => Promise<void>
    
    // Utility Methods
    clearPreview: () => void
    clearValidation: () => void
    clearError: () => void
    reset: () => void
  }
}

// Default naming templates
const DEFAULT_TEMPLATES: NamingTemplate[] = [
  {
    id: 'standard-single',
    name: 'Standard Single Principal',
    pattern: '{organization} - {principal} - {context} - {date}',
    context_types: ['Site Visit', 'Food Show', 'New Product Interest', 'Follow-up', 'Demo Request', 'Sampling', 'Custom'],
    max_length: 255,
    supports_multi_principal: false,
    description: 'Standard format for single principal opportunities'
  },
  {
    id: 'standard-multi',
    name: 'Standard Multi-Principal',
    pattern: '{organization} - Multi-Principal ({count}) - {context} - {date}',
    context_types: ['Site Visit', 'Food Show', 'New Product Interest', 'Follow-up', 'Demo Request', 'Sampling', 'Custom'],
    max_length: 255,
    supports_multi_principal: true,
    description: 'Standard format for multi-principal opportunities'
  },
  {
    id: 'abbreviated-multi',
    name: 'Abbreviated Multi-Principal',
    pattern: '{organization} - Multi ({count}) - {context_abbrev} - {date}',
    context_types: ['Site Visit', 'Food Show', 'New Product Interest', 'Follow-up', 'Demo Request', 'Sampling', 'Custom'],
    max_length: 200,
    supports_multi_principal: true,
    description: 'Abbreviated format for longer organization names'
  }
]

// Default configuration
const DEFAULT_CONFIGURATION: NamingConfiguration = {
  use_auto_naming: true,
  default_template_id: 'standard-single',
  max_name_length: 255,
  include_date_format: 'MonthYear',
  principal_display_format: 'Full',
  context_abbreviations: {
    'Site Visit': 'SV',
    'Food Show': 'FS',
    'New Product Interest': 'NPI',
    'Follow-up': 'FU',
    'Demo Request': 'Demo',
    'Sampling': 'Sample',
    'Custom': 'Custom'
  }
}

// Business logic constants
const DEFAULT_CACHE_TIMEOUT = 10 * 60 * 1000 // 10 minutes
const ORGANIZATION_MAX_DISPLAY_LENGTH = 50
const PRINCIPAL_MAX_DISPLAY_LENGTH = 40
const CONTEXT_MAX_DISPLAY_LENGTH = 30

// Initial state
const initialState = {
  templates: DEFAULT_TEMPLATES,
  configuration: DEFAULT_CONFIGURATION,
  current_preview: null,
  current_validation: null,
  selected_template_id: null,
  isLoading: false,
  isValidating: false,
  isGenerating: false,
  principal_cache: {},
  organization_cache: {},
  last_cache_update: null,
  cache_timeout: DEFAULT_CACHE_TIMEOUT,
  error: null
}

export const useOpportunityAutoNamingStore = create<OpportunityAutoNamingState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        ...initialState,
        
        actions: {
          // Core Auto-Naming Functions
          generateAutoName: async (data: MultiPrincipalOpportunityFormData, organizationName: string, principalNames: string[]) => {
            set({ isGenerating: true, error: null })

            try {
              const { configuration } = get()
              
              // Validate inputs
              if (!organizationName || principalNames.length === 0) {
                throw new Error('Organization name and at least one principal are required')
              }

              // Generate the name
              const generatedName = get().actions.generateMultiPrincipalName(
                organizationName,
                principalNames,
                data.opportunity_context,
                data.custom_context
              )

              // Validate the generated name
              const validation = get().actions.validateName(generatedName)
              
              if (!validation.is_valid) {
                // Try to optimize the name if too long
                const optimizedName = get().actions.optimizeNameLength(generatedName, configuration.max_name_length)
                const revalidation = get().actions.validateName(optimizedName)
                
                if (revalidation.is_valid) {
                  set({ isGenerating: false })
                  return optimizedName
                } else {
                  throw new Error(`Unable to generate valid name: ${validation.errors.join(', ')}`)
                }
              }

              set({ isGenerating: false })
              return generatedName

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to generate opportunity name',
                isGenerating: false
              })
              throw error
            }
          },

          previewName: async (data: Partial<MultiPrincipalOpportunityFormData>, organizationName?: string, principalNames?: string[]) => {
            set({ isValidating: true, error: null })

            try {
              // Get required data if not provided
              let orgName = organizationName
              let principals = principalNames || []

              if (!orgName && data.organization_id) {
                orgName = await get().actions.fetchOrganizationName(data.organization_id)
              }

              if (principals.length === 0 && data.principals && data.principals.length > 0) {
                const validPrincipalIds = data.principals.filter((id): id is string => Boolean(id))
                principals = await get().actions.fetchPrincipalNames(validPrincipalIds)
              }

              if (!orgName || principals.length === 0) {
                throw new Error('Organization and principal information required for preview')
              }

              // Generate preview name
              const previewName = get().actions.generateMultiPrincipalName(
                orgName,
                principals,
                data.opportunity_context || 'Follow-up',
                data.custom_context
              )

              // Create preview object
              const preview: NamePreview = {
                full_name: previewName,
                truncated_name: get().actions.optimizeNameLength(previewName, get().configuration.max_name_length),
                character_count: previewName.length,
                is_within_limit: previewName.length <= get().configuration.max_name_length,
                template_used: principals.length > 1 ? 'standard-multi' : 'standard-single',
                components: {
                  organization: orgName,
                  principals: principals.length > 1 ? `Multi-Principal (${principals.length})` : principals[0],
                  context: get().actions.formatContext(data.opportunity_context || 'Follow-up', data.custom_context),
                  date: get().actions.formatDateForNaming(get().configuration.include_date_format)
                }
              }

              set({ 
                current_preview: preview,
                isValidating: false 
              })

              return preview

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to generate name preview',
                isValidating: false
              })
              throw error
            }
          },

          validateName: (name: string, context?: { max_length?: number }) => {
            const maxLength = context?.max_length || get().configuration.max_name_length
            const errors: string[] = []
            const warnings: string[] = []

            // Check required name
            if (!name || name.trim().length === 0) {
              errors.push('Opportunity name is required')
            }

            // Check length constraints
            const trimmedName = name.trim()
            if (trimmedName.length > maxLength) {
              errors.push(`Name exceeds maximum length of ${maxLength} characters`)
            }

            // Check for potential issues
            if (trimmedName.length > maxLength * 0.9) {
              warnings.push('Name is approaching maximum length limit')
            }

            // Check for invalid characters (optional business rule)
            const invalidChars = /[<>:"\\|?*]/g
            if (invalidChars.test(trimmedName)) {
              warnings.push('Name contains characters that may cause issues in some systems')
            }

            const validation: NameValidationResult = {
              is_valid: errors.length === 0,
              errors,
              warnings,
              final_length: trimmedName.length,
              truncated: false
            }

            set({ current_validation: validation })
            return validation
          },

          // Template Management
          fetchTemplates: async () => {
            // For now, use default templates
            // In future, this could fetch from database
            set({ templates: DEFAULT_TEMPLATES })
          },

          getTemplate: (templateId: string) => {
            const { templates } = get()
            return templates.find(t => t.id === templateId) || null
          },

          setSelectedTemplate: (templateId: string) => {
            set({ selected_template_id: templateId })
          },

          createCustomTemplate: async (template: Omit<NamingTemplate, 'id'>) => {
            const newTemplate: NamingTemplate = {
              ...template,
              id: `custom-${Date.now()}`
            }

            set(state => ({
              templates: [...state.templates, newTemplate]
            }))

            return newTemplate
          },

          // Configuration Management
          updateConfiguration: (config: Partial<NamingConfiguration>) => {
            set(state => ({
              configuration: { ...state.configuration, ...config }
            }))
          },

          resetConfiguration: () => {
            set({ configuration: DEFAULT_CONFIGURATION })
          },

          getConfiguration: () => {
            return get().configuration
          },

          // Principal & Organization Data
          fetchPrincipalNames: async (principalIds: string[]) => {
            try {
              const { principal_cache, last_cache_update, cache_timeout } = get()
              const now = Date.now()

              // Check cache validity
              const needsFresh = !last_cache_update || (now - last_cache_update) > cache_timeout

              if (!needsFresh) {
                // Return cached names if available
                const cachedNames = principalIds
                  .map(id => principal_cache[id]?.name)
                  .filter((name): name is string => Boolean(name))

                if (cachedNames.length === principalIds.length) {
                  return cachedNames
                }
              }

              // Fetch from database
              const { data, error } = await supabase
                .from('organizations')
                .select('id, name')
                .in('id', principalIds)
                .eq('type', 'principal')
                .is('deleted_at', null)

              if (error) throw error

              // Update cache
              const newCache = { ...principal_cache }
              data.forEach(org => {
                newCache[org.id] = org
              })

              set({
                principal_cache: newCache,
                last_cache_update: now
              })

              return data.map(org => org.name)

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to fetch principal names'
              })
              return []
            }
          },

          fetchOrganizationName: async (organizationId: string) => {
            try {
              const { organization_cache } = get()

              // Check cache first
              if (organization_cache[organizationId]) {
                return organization_cache[organizationId].name
              }

              // Fetch from database
              const { data, error } = await supabase
                .from('organizations')
                .select('id, name')
                .eq('id', organizationId)
                .is('deleted_at', null)
                .single()

              if (error) throw error

              // Update cache
              set(state => ({
                organization_cache: {
                  ...state.organization_cache,
                  [organizationId]: data
                }
              }))

              return data.name

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to fetch organization name'
              })
              return ''
            }
          },

          validatePrincipals: async (principalIds: string[]) => {
            try {
              const { data, error } = await supabase
                .from('organizations')
                .select('id')
                .in('id', principalIds)
                .eq('type', 'principal')
                .is('deleted_at', null)

              if (error) throw error

              const validIds = data.map(org => org.id)
              const invalidIds = principalIds.filter(id => !validIds.includes(id))

              return {
                valid: invalidIds.length === 0,
                invalid_ids: invalidIds
              }

            } catch (error) {
              return {
                valid: false,
                invalid_ids: principalIds
              }
            }
          },

          // Advanced Naming Logic
          generateMultiPrincipalName: (organizationName: string, principalNames: string[], context: OpportunityContext | string, customContext?: string) => {
            const { configuration } = get()
            
            // Truncate organization name if too long
            const truncatedOrg = organizationName.length > ORGANIZATION_MAX_DISPLAY_LENGTH
              ? organizationName.substring(0, ORGANIZATION_MAX_DISPLAY_LENGTH) + '...'
              : organizationName

            // Handle principal display
            let principalDisplay: string
            if (principalNames.length === 1) {
              principalDisplay = principalNames[0].length > PRINCIPAL_MAX_DISPLAY_LENGTH
                ? principalNames[0].substring(0, PRINCIPAL_MAX_DISPLAY_LENGTH) + '...'
                : principalNames[0]
            } else {
              principalDisplay = `Multi-Principal (${principalNames.length})`
            }

            // Format context
            const contextDisplay = get().actions.formatContext(context as OpportunityContext, customContext)

            // Format date
            const dateDisplay = get().actions.formatDateForNaming(configuration.include_date_format)

            // Combine components
            return `${truncatedOrg} - ${principalDisplay} - ${contextDisplay} - ${dateDisplay}`
          },

          generateSuggestions: async (baseData: Partial<MultiPrincipalOpportunityFormData>) => {
            try {
              const suggestions: string[] = []
              
              if (!baseData.organization_id || !baseData.principals || baseData.principals.length === 0) {
                return suggestions
              }

              const orgName = await get().actions.fetchOrganizationName(baseData.organization_id)
              const validPrincipalIds = baseData.principals.filter((id): id is string => Boolean(id))
              const principalNames = await get().actions.fetchPrincipalNames(validPrincipalIds)

              // Generate variations with different contexts
              const contexts: OpportunityContext[] = ['Site Visit', 'Food Show', 'New Product Interest', 'Follow-up', 'Demo Request']
              
              for (const context of contexts) {
                const name = get().actions.generateMultiPrincipalName(orgName, principalNames, context)
                const validation = get().actions.validateName(name)
                
                if (validation.is_valid) {
                  suggestions.push(name)
                }
              }

              return suggestions.slice(0, 5) // Return top 5 suggestions

            } catch (error) {
              return []
            }
          },

          optimizeNameLength: (name: string, maxLength: number) => {
            if (name.length <= maxLength) {
              return name
            }

            // Try different truncation strategies
            const parts = name.split(' - ')
            if (parts.length >= 4) {
              // Truncate organization name first
              if (parts[0].length > 30) {
                parts[0] = parts[0].substring(0, 27) + '...'
              }
              
              const optimized = parts.join(' - ')
              if (optimized.length <= maxLength) {
                return optimized
              }

              // Truncate context if still too long
              if (parts[2].length > 20) {
                parts[2] = parts[2].substring(0, 17) + '...'
              }

              return parts.join(' - ').substring(0, maxLength)
            }

            // Fallback: simple truncation
            return name.substring(0, maxLength - 3) + '...'
          },

          // Context & Date Utilities
          formatContext: (context: OpportunityContext, customContext?: string) => {
            if (context === 'Custom' && customContext) {
              return customContext.length > CONTEXT_MAX_DISPLAY_LENGTH
                ? customContext.substring(0, CONTEXT_MAX_DISPLAY_LENGTH - 3) + '...'
                : customContext
            }
            return context
          },

          formatDateForNaming: (format: 'MonthYear' | 'FullDate' | 'YearOnly') => {
            const date = new Date()
            
            switch (format) {
              case 'MonthYear':
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              case 'FullDate':
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              case 'YearOnly':
                return date.getFullYear().toString()
              default:
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            }
          },

          getContextAbbreviation: (context: OpportunityContext) => {
            return get().configuration.context_abbreviations[context] || context
          },

          // Cache Management
          invalidateCache: () => {
            set({
              principal_cache: {},
              organization_cache: {},
              last_cache_update: null
            })
          },

          refreshPrincipalCache: async (principalIds: string[]) => {
            try {
              const { data, error } = await supabase
                .from('organizations')
                .select('id, name')
                .in('id', principalIds)
                .eq('type', 'principal')
                .is('deleted_at', null)

              if (error) throw error

              const newCache: Record<string, { id: string; name: string }> = {}
              data.forEach(org => {
                newCache[org.id] = org
              })

              set({
                principal_cache: newCache,
                last_cache_update: Date.now()
              })

            } catch (error) {
              set({
                error: error instanceof Error ? error.message : 'Failed to refresh principal cache'
              })
            }
          },

          // Utility Methods
          clearPreview: () => {
            set({ current_preview: null })
          },

          clearValidation: () => {
            set({ current_validation: null })
          },

          clearError: () => {
            set({ error: null })
          },

          reset: () => {
            set({ ...initialState, templates: DEFAULT_TEMPLATES, configuration: DEFAULT_CONFIGURATION })
          }
        }
      })),
      {
        name: 'opportunity-auto-naming-store',
        partialize: (state) => ({
          // Persist configuration and templates
          configuration: state.configuration,
          templates: state.templates,
          selected_template_id: state.selected_template_id,
          cache_timeout: state.cache_timeout
        })
      }
    ),
    {
      name: 'opportunity-auto-naming-store'
    }
  )
)

// Export helper hooks for common use cases
export const useOpportunityNaming = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    generateAutoName: store.actions.generateAutoName,
    previewName: store.actions.previewName,
    validateName: store.actions.validateName,
    currentPreview: store.current_preview,
    currentValidation: store.current_validation,
    isGenerating: store.isGenerating,
    isValidating: store.isValidating,
    error: store.error
  }
}

export const useNamingTemplates = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    templates: store.templates,
    selectedTemplateId: store.selected_template_id,
    getTemplate: store.actions.getTemplate,
    setSelectedTemplate: store.actions.setSelectedTemplate,
    createCustomTemplate: store.actions.createCustomTemplate,
    fetchTemplates: store.actions.fetchTemplates
  }
}

export const useNamingConfiguration = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    configuration: store.configuration,
    updateConfiguration: store.actions.updateConfiguration,
    resetConfiguration: store.actions.resetConfiguration,
    getConfiguration: store.actions.getConfiguration
  }
}

export const useNamingSuggestions = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    generateSuggestions: store.actions.generateSuggestions,
    optimizeNameLength: store.actions.optimizeNameLength,
    formatContext: store.actions.formatContext,
    formatDateForNaming: store.actions.formatDateForNaming
  }
}

export const useNamingValidation = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    validateName: store.actions.validateName,
    validatePrincipals: store.actions.validatePrincipals,
    currentValidation: store.current_validation,
    clearValidation: store.actions.clearValidation,
    isValidating: store.isValidating
  }
}