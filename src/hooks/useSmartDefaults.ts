/**
 * useSmartDefaults Hook
 * 
 * Provides intelligent form field auto-population based on Tesler's Law.
 * Reduces cognitive load by automatically filling predictable values.
 */

import { useCallback } from 'react'
import type { ContactFormData } from '@/types/contact.types'
import { 
  detectOrganizationType, 
  getDetectionConfidence
} from '@/lib/smart-defaults/patterns'
import {
  getSmartRoleDefaults,
  detectContactRoleFromTitle,
  getRoleCorrelations,
  validateSmartDefaults
} from '@/lib/smart-defaults/correlations'

/**
 * Smart default suggestion with metadata
 */
export interface SmartDefaultSuggestion {
  field: keyof ContactFormData
  value: any
  confidence: number // 0-100
  source: 'pattern_match' | 'correlation' | 'job_title' | 'org_type'
  reason: string // Human-readable explanation
}

/**
 * Options for smart defaults behavior
 */
export interface SmartDefaultsOptions {
  minConfidence?: number // Minimum confidence to auto-apply (default: 70)
  enableAutoApply?: boolean // Whether to auto-apply or just suggest (default: true)
  enableVisualFeedback?: boolean // Show visual indicators for auto-filled fields (default: true)
}

/**
 * Hook return type
 */
export interface UseSmartDefaultsReturn {
  // Core functions
  analyzeOrganizationName: (name: string) => SmartDefaultSuggestion[]
  analyzeJobTitle: (title: string) => SmartDefaultSuggestion[]
  analyzeRoleChange: (role: string) => SmartDefaultSuggestion[]
  getEnhancedDefaults: (initialData: Partial<ContactFormData>) => Partial<ContactFormData>
  
  // Validation
  validateFieldCombination: (values: Partial<ContactFormData>) => boolean
  getSmartSuggestions: (currentValues: Partial<ContactFormData>) => SmartDefaultSuggestion[]
  
  // Utilities
  shouldAutoFill: (suggestion: SmartDefaultSuggestion) => boolean
  formatSuggestionReason: (suggestion: SmartDefaultSuggestion) => string
}

/**
 * Smart Defaults Hook Implementation
 */
export function useSmartDefaults(options: SmartDefaultsOptions = {}): UseSmartDefaultsReturn {
  const {
    minConfidence = 70,
    enableAutoApply = true
  } = options

  /**
   * Analyzes organization name and returns smart suggestions
   */
  const analyzeOrganizationName = useCallback((name: string): SmartDefaultSuggestion[] => {
    if (!name || name.trim().length < 2) return []

    const suggestions: SmartDefaultSuggestion[] = []
    const detectedType = detectOrganizationType(name)
    
    if (detectedType) {
      const confidence = getDetectionConfidence(name, detectedType)
      
      suggestions.push({
        field: 'organization_type',
        value: detectedType,
        confidence,
        source: 'pattern_match',
        reason: `Detected "${detectedType}" based on organization name patterns`
      })

      // Add role suggestion based on organization type
      const roleDefaults = getSmartRoleDefaults(detectedType)
      if (roleDefaults) {
        suggestions.push({
          field: 'role',
          value: roleDefaults.role,
          confidence: roleDefaults.confidence,
          source: 'org_type',
          reason: `"${roleDefaults.role}" is common for ${detectedType} organizations`
        })

        // Add correlated fields
        suggestions.push({
          field: 'purchase_influence',
          value: roleDefaults.purchase_influence,
          confidence: roleDefaults.confidence,
          source: 'correlation',
          reason: `"${roleDefaults.purchase_influence}" influence typically correlates with ${roleDefaults.role} role`
        })

        suggestions.push({
          field: 'decision_authority',
          value: roleDefaults.decision_authority,
          confidence: roleDefaults.confidence,
          source: 'correlation',
          reason: `"${roleDefaults.decision_authority}" authority matches ${roleDefaults.role} responsibilities`
        })
      }
    }

    return suggestions
  }, [])

  /**
   * Analyzes job title and returns smart suggestions
   */
  const analyzeJobTitle = useCallback((title: string): SmartDefaultSuggestion[] => {
    if (!title || title.trim().length < 2) return []

    const suggestions: SmartDefaultSuggestion[] = []
    const roleDetection = detectContactRoleFromTitle(title)
    
    if (roleDetection) {
      suggestions.push({
        field: 'role',
        value: roleDetection.role,
        confidence: roleDetection.confidence,
        source: 'job_title',
        reason: `Job title "${title}" suggests "${roleDetection.role}" role`
      })

      // Add correlated fields
      const correlations = getRoleCorrelations(roleDetection.role)
      
      suggestions.push({
        field: 'purchase_influence',
        value: correlations.purchase_influence,
        confidence: Math.min(roleDetection.confidence, correlations.confidence),
        source: 'correlation',
        reason: `"${correlations.purchase_influence}" influence typically associated with ${roleDetection.role} role`
      })

      suggestions.push({
        field: 'decision_authority',
        value: correlations.decision_authority,
        confidence: Math.min(roleDetection.confidence, correlations.confidence),
        source: 'correlation',
        reason: `"${correlations.decision_authority}" authority matches ${roleDetection.role} responsibilities`
      })
    }

    return suggestions
  }, [])

  /**
   * Analyzes role change and suggests correlated fields
   */
  const analyzeRoleChange = useCallback((role: string): SmartDefaultSuggestion[] => {
    if (!role) return []

    const suggestions: SmartDefaultSuggestion[] = []
    const correlations = getRoleCorrelations(role as any)
    
    if (correlations) {
      suggestions.push({
        field: 'purchase_influence',
        value: correlations.purchase_influence,
        confidence: correlations.confidence,
        source: 'correlation',
        reason: `"${correlations.purchase_influence}" influence commonly associated with ${role} role`
      })

      suggestions.push({
        field: 'decision_authority', 
        value: correlations.decision_authority,
        confidence: correlations.confidence,
        source: 'correlation',
        reason: `"${correlations.decision_authority}" authority matches ${role} responsibilities`
      })
    }

    return suggestions
  }, [])

  /**
   * Gets enhanced default values with smart suggestions applied
   */
  const getEnhancedDefaults = useCallback((initialData: Partial<ContactFormData>): Partial<ContactFormData> => {
    if (!enableAutoApply) return initialData

    let enhanced = { ...initialData }
    const allSuggestions: SmartDefaultSuggestion[] = []

    // Analyze organization name
    if (initialData.organization_name) {
      allSuggestions.push(...analyzeOrganizationName(initialData.organization_name))
    }

    // Analyze job title
    if (initialData.title) {
      allSuggestions.push(...analyzeJobTitle(initialData.title))
    }

    // Apply high-confidence suggestions that don't conflict with existing values
    allSuggestions
      .filter(suggestion => shouldAutoFill(suggestion))
      .forEach(suggestion => {
        // Only apply if field is empty and meets confidence threshold
        if (!enhanced[suggestion.field] && suggestion.confidence >= minConfidence) {
          enhanced[suggestion.field] = suggestion.value
        }
      })

    return enhanced
  }, [enableAutoApply, minConfidence, analyzeOrganizationName, analyzeJobTitle])

  /**
   * Validates field combination makes business sense
   */
  const validateFieldCombination = useCallback((values: Partial<ContactFormData>): boolean => {
    return validateSmartDefaults({
      role: values.role as any,
      purchase_influence: values.purchase_influence as any,
      decision_authority: values.decision_authority as any,
      organization_type: values.organization_type as any
    })
  }, [])

  /**
   * Gets all smart suggestions for current form values
   */
  const getSmartSuggestions = useCallback((currentValues: Partial<ContactFormData>): SmartDefaultSuggestion[] => {
    const suggestions: SmartDefaultSuggestion[] = []

    // Organization-based suggestions
    if (currentValues.organization_name && currentValues.organization_mode === 'new') {
      suggestions.push(...analyzeOrganizationName(currentValues.organization_name))
    }

    // Title-based suggestions  
    if (currentValues.title) {
      suggestions.push(...analyzeJobTitle(currentValues.title))
    }

    // Role-based correlations
    if (currentValues.role) {
      suggestions.push(...analyzeRoleChange(currentValues.role))
    }

    // Deduplicate and filter
    const uniqueSuggestions = suggestions.reduce((acc, suggestion) => {
      const key = `${suggestion.field}-${suggestion.value}`
      if (!acc.find(s => `${s.field}-${s.value}` === key)) {
        acc.push(suggestion)
      }
      return acc
    }, [] as SmartDefaultSuggestion[])

    return uniqueSuggestions.filter(s => s.confidence >= 50) // Show suggestions above 50% confidence
  }, [analyzeOrganizationName, analyzeJobTitle, analyzeRoleChange])

  /**
   * Determines if a suggestion should be auto-applied
   */
  const shouldAutoFill = useCallback((suggestion: SmartDefaultSuggestion): boolean => {
    return enableAutoApply && suggestion.confidence >= minConfidence
  }, [enableAutoApply, minConfidence])

  /**
   * Formats suggestion reason for user display
   */
  const formatSuggestionReason = useCallback((suggestion: SmartDefaultSuggestion): string => {
    return `${suggestion.reason} (${suggestion.confidence}% confidence)`
  }, [])

  return {
    analyzeOrganizationName,
    analyzeJobTitle,
    analyzeRoleChange,
    getEnhancedDefaults,
    validateFieldCombination,
    getSmartSuggestions,
    shouldAutoFill,
    formatSuggestionReason
  }
}