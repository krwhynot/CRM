/**
 * Opportunity Auto-Naming Store - Client-Side UI State Management
 * 
 * Manages client-side state for opportunity auto-naming functionality.
 * Server data (principals, organizations) is handled via TanStack Query hooks.
 * 
 * Key Features:
 * - Naming configuration and templates
 * - Preview and validation UI state
 * - Form state management
 * - Client-side naming preferences
 */

import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import type { OpportunityContext } from '@/types/opportunity.types'

// Client-side naming template types
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

export interface OpportunityNamingUIState {
  // Templates (client-side)
  templates: NamingTemplate[]
  selectedTemplateId: string | null
  
  // Configuration (client-side preferences)
  configuration: NamingConfiguration
  
  // Preview and validation state
  currentPreview: NamePreview | null
  currentValidation: NameValidationResult | null
  
  // Form state
  isPreviewMode: boolean
  showAdvancedOptions: boolean
  
  // Generation state (for UI feedback)
  isGenerating: boolean
  isValidating: boolean
  
  // Client-side actions
  actions: {
    // Template Management
    setSelectedTemplate: (templateId: string) => void
    addCustomTemplate: (template: Omit<NamingTemplate, 'id'>) => NamingTemplate
    removeTemplate: (templateId: string) => void
    
    // Configuration Management
    updateConfiguration: (config: Partial<NamingConfiguration>) => void
    resetConfiguration: () => void
    
    // Preview and Validation
    setCurrentPreview: (preview: NamePreview | null) => void
    setCurrentValidation: (validation: NameValidationResult | null) => void
    
    // UI State Management
    setPreviewMode: (enabled: boolean) => void
    toggleAdvancedOptions: () => void
    setGenerating: (generating: boolean) => void
    setValidating: (validating: boolean) => void
    
    // Utility Functions (client-side only)
    formatContext: (context: OpportunityContext, customContext?: string) => string
    formatDateForNaming: (format: 'MonthYear' | 'FullDate' | 'YearOnly') => string
    getContextAbbreviation: (context: OpportunityContext) => string
    optimizeNameLength: (name: string, maxLength: number) => string
    validateName: (name: string, maxLength?: number) => NameValidationResult
    
    // Generate naming patterns (client-side logic)
    generateMultiPrincipalName: (
      organizationName: string, 
      principalNames: string[], 
      context: OpportunityContext | string, 
      customContext?: string
    ) => string
    
    // Reset and cleanup
    clearPreview: () => void
    clearValidation: () => void
    reset: () => void
  }
}

// Default naming templates (client-side)
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
const ORGANIZATION_MAX_DISPLAY_LENGTH = 50
const PRINCIPAL_MAX_DISPLAY_LENGTH = 40
const CONTEXT_MAX_DISPLAY_LENGTH = 30

// Initial state
const initialUIState: Omit<OpportunityNamingUIState, 'actions'> = {
  templates: DEFAULT_TEMPLATES,
  selectedTemplateId: null,
  configuration: DEFAULT_CONFIGURATION,
  currentPreview: null,
  currentValidation: null,
  isPreviewMode: false,
  showAdvancedOptions: false,
  isGenerating: false,
  isValidating: false
}

export const useOpportunityAutoNamingStore = create<OpportunityNamingUIState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        ...initialUIState,
        
        actions: {
          // Template Management
          setSelectedTemplate: (templateId: string) => {
            set({ selectedTemplateId: templateId })
          },

          addCustomTemplate: (template: Omit<NamingTemplate, 'id'>) => {
            const newTemplate: NamingTemplate = {
              ...template,
              id: `custom-${Date.now()}`
            }

            set(state => ({
              templates: [...state.templates, newTemplate]
            }))

            return newTemplate
          },

          removeTemplate: (templateId: string) => {
            set(state => ({
              templates: state.templates.filter(t => t.id !== templateId),
              selectedTemplateId: state.selectedTemplateId === templateId 
                ? null 
                : state.selectedTemplateId
            }))
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
          
          // Preview and Validation
          setCurrentPreview: (preview: NamePreview | null) => {
            set({ currentPreview: preview })
          },

          setCurrentValidation: (validation: NameValidationResult | null) => {
            set({ currentValidation: validation })
          },
          
          // UI State Management
          setPreviewMode: (enabled: boolean) => {
            set({ isPreviewMode: enabled })
          },

          toggleAdvancedOptions: () => {
            set(state => ({ showAdvancedOptions: !state.showAdvancedOptions }))
          },

          setGenerating: (generating: boolean) => {
            set({ isGenerating: generating })
          },

          setValidating: (validating: boolean) => {
            set({ isValidating: validating })
          },
          
          // Utility Functions (client-side only)
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

          validateName: (name: string, maxLength?: number) => {
            const { configuration } = get()
            const limit = maxLength || configuration.max_name_length
            const errors: string[] = []
            const warnings: string[] = []

            // Check required name
            if (!name || name.trim().length === 0) {
              errors.push('Opportunity name is required')
            }

            // Check length constraints
            const trimmedName = name.trim()
            if (trimmedName.length > limit) {
              errors.push(`Name exceeds maximum length of ${limit} characters`)
            }

            // Check for potential issues
            if (trimmedName.length > limit * 0.9) {
              warnings.push('Name is approaching maximum length limit')
            }

            // Check for invalid characters (optional business rule)
            const invalidChars = /[<>:"\\|?*]/g
            if (invalidChars.test(trimmedName)) {
              warnings.push('Name contains characters that may cause issues in some systems')
            }

            return {
              is_valid: errors.length === 0,
              errors,
              warnings,
              final_length: trimmedName.length,
              truncated: false
            }
          },
          
          // Generate naming patterns (client-side logic)
          generateMultiPrincipalName: (
            organizationName: string, 
            principalNames: string[], 
            context: OpportunityContext | string, 
            customContext?: string
          ) => {
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
          
          // Reset and cleanup
          clearPreview: () => {
            set({ currentPreview: null })
          },

          clearValidation: () => {
            set({ currentValidation: null })
          },

          reset: () => {
            set({ 
              ...initialUIState, 
              templates: DEFAULT_TEMPLATES, 
              configuration: DEFAULT_CONFIGURATION 
            })
          }
        }
      })),
      {
        name: 'opportunity-naming-ui-store',
        partialize: (state) => ({
          // Persist configuration, templates, and UI preferences
          configuration: state.configuration,
          templates: state.templates,
          selectedTemplateId: state.selectedTemplateId,
          showAdvancedOptions: state.showAdvancedOptions,
          isPreviewMode: state.isPreviewMode
        })
      }
    ),
    {
      name: 'opportunity-naming-ui-store'
    }
  )
)

// Export convenience hooks for different aspects of the store
export const useNamingTemplates = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    templates: store.templates,
    selectedTemplateId: store.selectedTemplateId,
    setSelectedTemplate: store.actions.setSelectedTemplate,
    addCustomTemplate: store.actions.addCustomTemplate,
    removeTemplate: store.actions.removeTemplate
  }
}

export const useNamingConfiguration = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    configuration: store.configuration,
    updateConfiguration: store.actions.updateConfiguration,
    resetConfiguration: store.actions.resetConfiguration
  }
}

export const useNamingPreview = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    currentPreview: store.currentPreview,
    currentValidation: store.currentValidation,
    isGenerating: store.isGenerating,
    isValidating: store.isValidating,
    setCurrentPreview: store.actions.setCurrentPreview,
    setCurrentValidation: store.actions.setCurrentValidation,
    setGenerating: store.actions.setGenerating,
    setValidating: store.actions.setValidating,
    clearPreview: store.actions.clearPreview,
    clearValidation: store.actions.clearValidation
  }
}

export const useNamingUtilities = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    formatContext: store.actions.formatContext,
    formatDateForNaming: store.actions.formatDateForNaming,
    getContextAbbreviation: store.actions.getContextAbbreviation,
    optimizeNameLength: store.actions.optimizeNameLength,
    validateName: store.actions.validateName,
    generateMultiPrincipalName: store.actions.generateMultiPrincipalName
  }
}

export const useNamingUI = () => {
  const store = useOpportunityAutoNamingStore()
  return {
    isPreviewMode: store.isPreviewMode,
    showAdvancedOptions: store.showAdvancedOptions,
    setPreviewMode: store.actions.setPreviewMode,
    toggleAdvancedOptions: store.actions.toggleAdvancedOptions
  }
}