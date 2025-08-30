import { useState, useCallback } from 'react'
import { WizardStep } from '../components/SmartImportWizard'
import { suggestFieldMappings, validateRowsWithAI, detectDuplicatesWithAI, isOpenAIAvailable } from '@/lib/openai'
import { 
  type FieldMappingResponseType, 
  type BatchValidationResponseType,
  type DuplicateDetectionResponseType
} from '@/lib/aiSchemas'
import type { ParsedData } from '@/hooks/useFileUpload'

// Enhanced field mapping with AI insights
export interface SmartFieldMapping {
  csvHeader: string
  crmField: string | null
  confidence: number
  isUserOverridden: boolean
  aiSuggestion: string | null
  alternatives: string[]
  reason?: string
  status: 'auto' | 'confirmed' | 'needs_review' | 'skipped'
}

// Import configuration
export interface ImportConfig {
  entityType: 'organization' | 'contact'
  skipValidation: boolean
  allowDuplicates: boolean
  batchSize: number
}

// Wizard state interface
interface SmartImportState {
  // Wizard navigation
  currentStep: WizardStep
  completedSteps: WizardStep[]
  
  // File handling
  file: File | null
  parsedData: ParsedData | null
  
  // AI-powered mapping
  fieldMappings: SmartFieldMapping[]
  aiMappingResponse: FieldMappingResponseType | null
  mappingInProgress: boolean
  
  // Validation
  validationResults: BatchValidationResponseType | null
  duplicateResults: DuplicateDetectionResponseType | null
  validationInProgress: boolean
  
  // Import process
  importInProgress: boolean
  importProgress: number
  importResult: {
    success: boolean
    imported: number
    failed: number  
    errors: Array<{ row: number; error: string }>
  } | null
  
  // Configuration
  config: ImportConfig
  
  // Error handling
  error: string | null
  warnings: string[]
}

interface UseSmartImportReturn {
  state: SmartImportState
  actions: {
    // Navigation
    goToStep: (step: WizardStep) => void
    nextStep: () => void
    previousStep: () => void
    
    // File handling
    uploadFile: (file: File) => Promise<void>
    clearFile: () => void
    
    // AI mapping
    generateAIMappings: () => Promise<void>
    updateFieldMapping: (csvHeader: string, crmField: string | null, userOverride?: boolean) => void
    confirmMapping: (csvHeader: string) => void
    skipField: (csvHeader: string) => void
    
    // Validation
    validateData: () => Promise<void>
    checkDuplicates: () => Promise<void>
    
    // Import
    executeImport: () => Promise<void>
    
    // Configuration
    updateConfig: (updates: Partial<ImportConfig>) => void
    
    // Reset
    resetWizard: () => void
  }
}

const STEP_ORDER: WizardStep[] = ['upload', 'map', 'preview', 'import', 'complete']

const defaultConfig: ImportConfig = {
  entityType: 'organization',
  skipValidation: false,
  allowDuplicates: false,
  batchSize: 50
}

const initialState: SmartImportState = {
  currentStep: 'upload',
  completedSteps: [],
  file: null,
  parsedData: null,
  fieldMappings: [],
  aiMappingResponse: null,
  mappingInProgress: false,
  validationResults: null,
  duplicateResults: null,
  validationInProgress: false,
  importInProgress: false,
  importProgress: 0,
  importResult: null,
  config: defaultConfig,
  error: null,
  warnings: []
}

export function useSmartImport(): UseSmartImportReturn {
  const [state, setState] = useState<SmartImportState>(initialState)

  // Navigation actions
  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }, [])

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep)
    if (currentIndex < STEP_ORDER.length - 1) {
      const newStep = STEP_ORDER[currentIndex + 1]
      setState(prev => ({
        ...prev,
        currentStep: newStep,
        completedSteps: prev.completedSteps.includes(prev.currentStep) 
          ? prev.completedSteps 
          : [...prev.completedSteps, prev.currentStep]
      }))
    }
  }, [state.currentStep])

  const previousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep)
    if (currentIndex > 0) {
      setState(prev => ({ ...prev, currentStep: STEP_ORDER[currentIndex - 1] }))
    }
  }, [state.currentStep])

  // File handling
  const uploadFile = useCallback(async (file: File) => {
    try {
      setState(prev => ({ 
        ...prev, 
        file, 
        error: null,
        warnings: []
      }))

      // Import parseCSV logic from useFileUpload
      const Papa = (await import('papaparse')).default
      
      return new Promise<void>((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.toLowerCase().trim(),
          complete: (results) => {
            try {
              const headers = results.meta.fields || []
              const rows = results.data

              // Check for required columns based on entity type (validation happens later)

              const parsedData: ParsedData = {
                headers,
                rows,
                validRows: [], // Will be populated after field mapping
                invalidRows: []
              }

              setState(prev => ({
                ...prev,
                parsedData,
                fieldMappings: headers.map(header => ({
                  csvHeader: header,
                  crmField: null,
                  confidence: 0,
                  isUserOverridden: false,
                  aiSuggestion: null,
                  alternatives: [],
                  status: 'needs_review' as const
                }))
              }))

              resolve()
            } catch (error) {
              reject(new Error('Failed to parse CSV file'))
            }
          },
          error: (error) => {
            reject(new Error(`CSV parsing error: ${error.message}`))
          }
        })
      })

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'File upload failed' 
      }))
      throw error
    }
  }, [state.config.entityType])

  const clearFile = useCallback(() => {
    setState(prev => ({
      ...prev,
      file: null,
      parsedData: null,
      fieldMappings: [],
      aiMappingResponse: null,
      validationResults: null,
      duplicateResults: null,
      importResult: null,
      currentStep: 'upload',
      completedSteps: [],
      error: null,
      warnings: []
    }))
  }, [])

  // AI mapping actions
  const generateAIMappings = useCallback(async () => {
    if (!state.parsedData || !isOpenAIAvailable()) {
      setState(prev => ({
        ...prev,
        warnings: [...prev.warnings, 'OpenAI not available - using manual mapping']
      }))
      return
    }

    setState(prev => ({ ...prev, mappingInProgress: true, error: null }))

    try {
      const aiResponse = await suggestFieldMappings(
        state.parsedData.headers,
        state.parsedData.rows.slice(0, 3), // Sample for AI
        state.config.entityType
      )

      const updatedMappings: SmartFieldMapping[] = state.fieldMappings.map(mapping => {
        const aiMapping = aiResponse.mappings.find(m => 
          m.header.toLowerCase() === mapping.csvHeader.toLowerCase()
        )

        if (aiMapping && aiMapping.suggestedField && aiMapping.confidence >= 0.5) {
          return {
            ...mapping,
            crmField: aiMapping.suggestedField,
            confidence: aiMapping.confidence,
            aiSuggestion: aiMapping.suggestedField,
            alternatives: aiMapping.alternatives || [],
            reason: aiMapping.reason,
            status: aiMapping.confidence >= 0.85 ? 'auto' : 'needs_review'
          }
        }

        return mapping
      })

      setState(prev => ({
        ...prev,
        fieldMappings: updatedMappings,
        aiMappingResponse: aiResponse,
        mappingInProgress: false
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        mappingInProgress: false,
        warnings: [...prev.warnings, 'AI mapping failed - using manual mapping']
      }))
    }
  }, [state.parsedData, state.fieldMappings, state.config.entityType])

  const updateFieldMapping = useCallback((csvHeader: string, crmField: string | null, userOverride = true) => {
    setState(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map(mapping =>
        mapping.csvHeader === csvHeader
          ? {
              ...mapping,
              crmField,
              isUserOverridden: userOverride,
              status: crmField ? 'confirmed' : 'skipped'
            }
          : mapping
      )
    }))
  }, [])

  const confirmMapping = useCallback((csvHeader: string) => {
    setState(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map(mapping =>
        mapping.csvHeader === csvHeader
          ? { ...mapping, status: 'confirmed' }
          : mapping
      )
    }))
  }, [])

  const skipField = useCallback((csvHeader: string) => {
    setState(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map(mapping =>
        mapping.csvHeader === csvHeader
          ? { ...mapping, crmField: null, status: 'skipped' }
          : mapping
      )
    }))
  }, [])

  // Validation actions
  const validateData = useCallback(async () => {
    if (!state.parsedData || !isOpenAIAvailable() || state.config.skipValidation) {
      return
    }

    setState(prev => ({ ...prev, validationInProgress: true }))

    try {
      const fieldMappingDict = Object.fromEntries(
        state.fieldMappings
          .filter(m => m.crmField && m.status !== 'skipped')
          .map(m => [m.csvHeader, m.crmField!])
      )

      const validationResults = await validateRowsWithAI(
        state.parsedData.rows,
        fieldMappingDict,
        50 // Sample size
      )

      setState(prev => ({
        ...prev,
        validationResults,
        validationInProgress: false
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        validationInProgress: false,
        warnings: [...prev.warnings, 'AI validation failed - using basic validation']
      }))
    }
  }, [state.parsedData, state.fieldMappings, state.config.skipValidation])

  const checkDuplicates = useCallback(async () => {
    if (!state.parsedData || !isOpenAIAvailable() || state.config.allowDuplicates) {
      return
    }

    try {
      const duplicateResults = await detectDuplicatesWithAI(state.parsedData.rows, 100)
      setState(prev => ({ ...prev, duplicateResults }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        warnings: [...prev.warnings, 'AI duplicate detection failed']
      }))
    }
  }, [state.parsedData, state.config.allowDuplicates])

  // Import execution (placeholder - will integrate with existing import logic)
  const executeImport = useCallback(async () => {
    setState(prev => ({ ...prev, importInProgress: true, importProgress: 0 }))

    try {
      // TODO: Integrate with existing useImportProgress hook
      // This is a placeholder for the actual import implementation
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setState(prev => ({ ...prev, importProgress: i }))
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setState(prev => ({
        ...prev,
        importInProgress: false,
        importResult: {
          success: true,
          imported: state.parsedData?.rows.length || 0,
          failed: 0,
          errors: []
        }
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        importInProgress: false,
        error: error instanceof Error ? error.message : 'Import failed'
      }))
    }
  }, [state.parsedData])

  // Configuration
  const updateConfig = useCallback((updates: Partial<ImportConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }))
  }, [])

  // Reset
  const resetWizard = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    state,
    actions: {
      goToStep,
      nextStep,
      previousStep,
      uploadFile,
      clearFile,
      generateAIMappings,
      updateFieldMapping,
      confirmMapping,
      skipField,
      validateData,
      checkDuplicates,
      executeImport,
      updateConfig,
      resetWizard
    }
  }
}