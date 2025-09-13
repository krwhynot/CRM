import { useState, useCallback, useMemo, useEffect } from 'react'
import type { WizardStep } from '../components/SmartImportWizard'
import {
  suggestFieldMappings,
  validateRowsWithAI,
  detectDuplicatesWithAI,
  isOpenAIAvailable,
} from '@/lib/openai'
import {
  type FieldMappingResponseType,
  type BatchValidationResponseType,
  type DuplicateDetectionResponseType,
} from '@/lib/aiSchemas'
import type { ParsedData, TransformedOrganizationRow } from '@/hooks/useFileUpload'
import { useImportProgress } from '../../hooks/useImportProgress'

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

export interface UseSmartImportReturn {
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

const STEP_ORDER: WizardStep[] = ['upload', 'review', 'import', 'complete']

const defaultConfig: ImportConfig = {
  entityType: 'organization',
  skipValidation: false,
  allowDuplicates: false,
  batchSize: 50,
}

// Enhanced fuzzy matching patterns for CRM fields
interface FieldPattern {
  field: string
  patterns: string[]
  contentMatchers?: RegExp[]
  confidence: number
}

const ENHANCED_FIELD_PATTERNS: FieldPattern[] = [
  // Organization name patterns with 95% confidence
  {
    field: 'name',
    patterns: [
      'name',
      'organization',
      'company',
      'business',
      'org',
      'firm',
      'client',
      'customer',
      'vendor',
      'supplier',
    ],
    confidence: 0.95,
  },
  // Contact patterns
  {
    field: 'contact_name',
    patterns: ['contact', 'person', 'rep', 'representative', 'manager', 'owner', 'buyer'],
    confidence: 0.9,
  },
  // Email patterns with content validation
  {
    field: 'email',
    patterns: ['email', 'e-mail', 'mail', 'contact'],
    contentMatchers: [/\S+@\S+\.\S+/],
    confidence: 0.98,
  },
  // Phone patterns with content validation
  {
    field: 'phone',
    patterns: ['phone', 'tel', 'telephone', 'number', 'mobile', 'cell'],
    contentMatchers: [/[\+]?[1-9]?[\d\s\-\(\)\.]{10,}/],
    confidence: 0.95,
  },
  // Website patterns
  {
    field: 'website',
    patterns: ['website', 'url', 'web', 'site', 'linkedin', 'homepage'],
    contentMatchers: [/https?:\/\//, /www\./, /\.com|\.org|\.net/],
    confidence: 0.92,
  },
  // Address patterns
  {
    field: 'address_line_1',
    patterns: ['address', 'street', 'location', 'addr'],
    confidence: 0.9,
  },
  // City patterns
  {
    field: 'city',
    patterns: ['city', 'town', 'municipality'],
    confidence: 0.95,
  },
  // State patterns
  {
    field: 'state_province',
    patterns: ['state', 'province', 'region', 'st'],
    confidence: 0.95,
  },
  // ZIP/Postal code patterns
  {
    field: 'postal_code',
    patterns: ['zip', 'postal', 'postcode', 'zipcode'],
    contentMatchers: [/^\d{5}(-\d{4})?$/, /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/],
    confidence: 0.95,
  },
  // Priority patterns with content validation
  {
    field: 'priority',
    patterns: ['priority', 'tier', 'level', 'rank', 'focus'],
    contentMatchers: [/^[ABCD]$/i, /^(high|medium|low)$/i, /^[1-4]$/],
    confidence: 0.9,
  },
  // Segment patterns
  {
    field: 'segment',
    patterns: ['segment', 'category', 'type', 'class', 'group'],
    confidence: 0.85,
  },
  // Manager patterns
  {
    field: 'primary_manager_name',
    patterns: ['primary', 'main', 'lead', 'account manager', 'acct manager', 'manager'],
    confidence: 0.88,
  },
  {
    field: 'secondary_manager_name',
    patterns: ['secondary', 'backup', 'co-manager', 'assistant manager'],
    confidence: 0.88,
  },
  // Notes patterns
  {
    field: 'notes',
    patterns: ['notes', 'comments', 'remarks', 'description', 'details'],
    confidence: 0.85,
  },
]

// Enhanced fuzzy matching function
function fuzzyMatchField(
  headerName: string,
  sampleValues: string[] = []
): { field: string; confidence: number; reason: string } | null {
  const normalizedHeader = headerName.toLowerCase().trim()
  let bestMatch: { field: string; confidence: number; reason: string } | null = null

  for (const pattern of ENHANCED_FIELD_PATTERNS) {
    let confidence = 0
    let reason = ''

    // Check header name patterns
    for (const headerPattern of pattern.patterns) {
      const patternWords = headerPattern.split(/\s+/)

      // Exact match gets full confidence
      if (normalizedHeader === headerPattern) {
        confidence = pattern.confidence
        reason = `Exact header match: "${headerPattern}"`
        break
      }

      // Contains pattern gets high confidence
      if (normalizedHeader.includes(headerPattern)) {
        confidence = Math.max(confidence, pattern.confidence - 0.05)
        reason = `Header contains: "${headerPattern}"`
        continue
      }

      // Word-by-word matching for compound headers
      const headerWords = normalizedHeader.split(/[\s\-_\.]+/)
      const matchingWords = headerWords.filter((word) =>
        patternWords.some(
          (patternWord) =>
            word === patternWord || patternWord.includes(word) || word.includes(patternWord)
        )
      )

      if (matchingWords.length > 0) {
        const wordMatchRatio =
          matchingWords.length / Math.max(headerWords.length, patternWords.length)
        confidence = Math.max(confidence, pattern.confidence * wordMatchRatio * 0.8)
        reason = `Partial word match: ${matchingWords.join(', ')}`
      }
    }

    // Boost confidence with content validation
    if (pattern.contentMatchers && sampleValues.length > 0) {
      const matchingValues = sampleValues.filter(
        (value) => value && pattern.contentMatchers!.some((matcher) => matcher.test(value.trim()))
      )

      if (matchingValues.length > 0) {
        const contentMatchRatio = matchingValues.length / sampleValues.length
        if (contentMatchRatio > 0.3) {
          // 30% of values match pattern
          confidence = Math.min(0.98, confidence + contentMatchRatio * 0.15)
          reason += ` + content validation (${Math.round(contentMatchRatio * 100)}% match)`
        }
      }
    }

    // Update best match if this is better
    if (confidence > 0.5 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { field: pattern.field, confidence, reason }
    }
  }

  return bestMatch
}

// Legacy mapping for backward compatibility with actual CSV headers
const COMMON_HEADER_MAPPINGS: Record<string, string> = {
  // Organization Data.csv specific mappings (actual cleaned headers)
  'priority level': 'priority',
  'priority-focus (a-d) a-highest': 'priority',
  'priority-focus': 'priority',
  organizations: 'name',
  'organization name': 'name',
  organization: 'name',
  company: 'name',
  'business segment': 'segment',
  segment: 'segment',
  distributor: 'type',
  'distributor rep': 'notes', // Store as additional info
  'distr rep': 'notes',
  'primary manager': 'primary_manager_name',
  'primary acct. manager': 'primary_manager_name',
  'secondary manager': 'secondary_manager_name',
  'secondary acct. manager': 'secondary_manager_name',
  'weekly priority': 'notes', // Store as additional info
  linkedin: 'website',
  'phone number': 'phone',
  phone: 'phone',
  'street address': 'address_line_1',
  city: 'city',
  state: 'state_province',
  'zip code': 'postal_code',
  notes: 'notes',
  // Common variations
  'company name': 'name',
  'business name': 'name',
  'org name': 'name',
  website: 'website',
  url: 'website',
  address: 'address_line_1',
  street: 'address_line_1',
  zip: 'postal_code',
  postal: 'postal_code',
  'state/province': 'state_province',
  province: 'state_province',
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
  warnings: [],
}

export function useSmartImport(): UseSmartImportReturn {
  const [state, setState] = useState<SmartImportState>(initialState)
  const { importState, importOrganizations, resetImport } = useImportProgress()

  // Sync import progress from useImportProgress with Smart Import state
  useEffect(() => {
    if (importState.isImporting) {
      setState((prev) => ({
        ...prev,
        importInProgress: true,
        importProgress: importState.importProgress,
      }))
    } else if (importState.importResult) {
      setState((prev) => ({
        ...prev,
        importInProgress: false,
        importProgress: 100,
        importResult: {
          success: importState.importResult.success,
          imported: importState.importResult.imported,
          failed: importState.importResult.failed,
          errors: importState.importResult.errors || [],
        },
      }))
    } else if (importState.error) {
      setState((prev) => ({
        ...prev,
        importInProgress: false,
        importProgress: 0,
        error: importState.error,
      }))
    }
  }, [
    importState.isImporting,
    importState.importProgress,
    importState.importResult,
    importState.error,
  ])

  // Transform AI-mapped data to database format
  const transformDataForImport = useCallback(
    (parsedData: ParsedData, fieldMappings: SmartFieldMapping[]): TransformedOrganizationRow[] => {
      if (!parsedData || !parsedData.rows) return []

      // Create mapping dictionary from AI field mappings
      const mappingDict = Object.fromEntries(
        fieldMappings
          .filter((m) => m.crmField && m.status !== 'skipped')
          .map((m) => [m.csvHeader, m.crmField!])
      )

      return parsedData.rows
        .map((row) => {
          const transformedRow: TransformedOrganizationRow = {
            name: '',
            type: 'customer',
            priority: 'C',
            segment: 'General',
            website: null,
            phone: null,
            address_line_1: null,
            city: null,
            state_province: null,
            postal_code: null,
            country: 'US',
            notes: null,
            primary_manager_name: null,
            secondary_manager_name: null,
            import_notes: null,
            is_active: true,
          }

          // Apply AI field mappings
          Object.entries(mappingDict).forEach(([csvHeader, crmField]) => {
            const value = row[csvHeader]?.trim()
            if (value && crmField in transformedRow) {
              if (crmField === 'type') {
                transformedRow.type = value as any // Will be validated by import logic
              } else if (crmField === 'priority') {
                // Normalize priority values
                const normalizedPriority = value.toLowerCase()
                if (['a', 'high', 'priority a', 'top', '1'].includes(normalizedPriority)) {
                  transformedRow.priority = 'A'
                } else if (
                  ['b', 'medium-high', 'priority b', 'above average', '2'].includes(
                    normalizedPriority
                  )
                ) {
                  transformedRow.priority = 'B'
                } else if (
                  ['c', 'medium', 'priority c', 'standard', 'average', '3'].includes(
                    normalizedPriority
                  )
                ) {
                  transformedRow.priority = 'C'
                } else if (
                  ['d', 'low', 'priority d', 'minimal', '4'].includes(normalizedPriority)
                ) {
                  transformedRow.priority = 'D'
                } else {
                  transformedRow.priority = 'C' // Default fallback
                }
              } else if (crmField === 'is_active') {
                transformedRow.is_active = Boolean(value)
              } else {
                ;(transformedRow as any)[crmField] = value
              }
            }
          })

          // Ensure required fields have values
          if (!transformedRow.name) {
            // Try various header names for organization name
            transformedRow.name =
              row['Organizations'] ||
              row['Organization Name'] ||
              row['Company'] ||
              row['name'] ||
              'Unknown Organization'
          }

          // Determine organization type if not explicitly mapped
          const distributorIndicators = ['distributor', 'distribution', 'dist']
          const rowValues = Object.values(row).join(' ').toLowerCase()
          if (distributorIndicators.some((indicator) => rowValues.includes(indicator))) {
            transformedRow.type = 'distributor'
          }

          // Store unmapped data in import_notes
          const unmappedData = Object.entries(row)
            .filter(([key]) => !Object.keys(mappingDict).includes(key))
            .filter(([, value]) => value && value.trim())
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ')

          if (unmappedData) {
            transformedRow.import_notes = unmappedData
          }

          return transformedRow
        })
        .filter((row) => row.name.trim()) // Filter out rows without names
    },
    []
  )

  // Navigation actions
  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }))
  }, [])

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep)
      if (currentIndex < STEP_ORDER.length - 1) {
        const newStep = STEP_ORDER[currentIndex + 1]
        return {
          ...prev,
          currentStep: newStep,
          completedSteps: prev.completedSteps.includes(prev.currentStep)
            ? prev.completedSteps
            : [...prev.completedSteps, prev.currentStep],
        }
      }
      return prev
    })
  }, [])

  const previousStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep)
      if (currentIndex > 0) {
        return { ...prev, currentStep: STEP_ORDER[currentIndex - 1] }
      }
      return prev
    })
  }, [])

  // File handling
  const uploadFile = useCallback(async (file: File) => {
    try {
      setState((prev) => ({
        ...prev,
        file,
        error: null,
        warnings: [],
      }))

      // Import parseCSV logic - use direct object building to avoid "_1", "_2" generation
      const Papa = (await import('papaparse')).default

      return new Promise<void>((resolve, reject) => {
        Papa.parse<string[]>(file, {
          header: false, // Parse as array to avoid PapaParse header generation
          skipEmptyLines: 'greedy',
          complete: (results) => {
            try {
              const allRows = results.data as string[][]

              // Find header row (row with most non-empty cells)
              function findHeaderRow(rows: string[][]): {
                headerRow: string[]
                headerIndex: number
              } {
                let bestRow: string[] = []
                let bestIndex = 0
                let maxNonEmptyCells = 0

                rows.forEach((row, index) => {
                  const nonEmptyCells = row.filter(
                    (cell) =>
                      cell &&
                      cell.trim() &&
                      !cell.startsWith('=') && // Skip Excel formulas
                      !cell.toLowerCase().includes('instruction') &&
                      !cell.toLowerCase().includes('enter your')
                  ).length

                  if (nonEmptyCells > maxNonEmptyCells && nonEmptyCells > 3) {
                    // Need at least 4 columns
                    maxNonEmptyCells = nonEmptyCells
                    bestRow = row
                    bestIndex = index
                  }
                })

                return { headerRow: bestRow, headerIndex: bestIndex }
              }

              const { headerRow, headerIndex } = findHeaderRow(allRows)
              const dataRows = allRows.slice(headerIndex + 1)

              // Process headers directly to avoid PapaParse "_1" generation
              const processedHeaders = headerRow.map((header, index) => {
                const trimmed = header ? header.trim() : ''
                if (!trimmed) {
                  if (index === 0) return 'Row_Number'
                  return `Column_${index + 1}`
                }
                return trimmed
              })

              // Build data objects directly
              const rows = dataRows
                .filter((row) => row.some((cell) => cell && cell.trim().length > 0))
                .map((row) => {
                  const rowObj: Record<string, string> = {}
                  processedHeaders.forEach((header, index) => {
                    rowObj[header] = (row[index] && row[index].trim()) || ''
                  })
                  return rowObj
                })

              // Filter out invalid rows
              const validRows = rows.filter((row) => {
                const values = Object.values(row)
                return values.some(
                  (val) =>
                    val &&
                    val.trim() &&
                    !val.startsWith('=') && // Skip Excel formulas
                    !val.toLowerCase().includes('instruction') && // Skip instruction rows
                    !val.toLowerCase().includes('enter your') // Skip template instructions
                )
              })

              const parsedData: ParsedData = {
                headers: processedHeaders,
                rows: validRows,
                validRows: [], // Will be populated after field mapping
                invalidRows: [],
              }

              // Enhanced field mapping using fuzzy matching and content analysis
              const preConfiguredMappings = processedHeaders.map((header) => {
                const normalizedHeader = header.toLowerCase().trim()

                // Get sample values for this header for content analysis
                const sampleValues = validRows
                  .slice(0, 5)
                  .map((row) => row[header])
                  .filter(Boolean)

                // Try enhanced fuzzy matching first
                const fuzzyMatch = fuzzyMatchField(header, sampleValues)

                // Fallback to legacy mapping if fuzzy matching fails
                let legacyMatch: string | null = null
                if (!fuzzyMatch || fuzzyMatch.confidence < 0.7) {
                  const exactMatch = COMMON_HEADER_MAPPINGS[normalizedHeader]
                  const partialMatch = !exactMatch
                    ? Object.entries(COMMON_HEADER_MAPPINGS).find(
                        ([key]) =>
                          normalizedHeader.includes(key.toLowerCase()) ||
                          key.toLowerCase().includes(normalizedHeader)
                      )?.[1]
                    : null
                  legacyMatch = exactMatch || partialMatch
                }

                const bestMatch =
                  fuzzyMatch && fuzzyMatch.confidence >= 0.7
                    ? fuzzyMatch
                    : legacyMatch
                      ? { field: legacyMatch, confidence: 0.85, reason: 'Legacy mapping' }
                      : null

                return {
                  csvHeader: header,
                  crmField: bestMatch?.field || null,
                  confidence: bestMatch?.confidence || 0,
                  isUserOverridden: false,
                  aiSuggestion: bestMatch?.field || null,
                  alternatives: [],
                  reason: bestMatch?.reason,
                  status:
                    bestMatch?.confidence >= 0.95
                      ? 'auto'
                      : bestMatch?.confidence >= 0.7
                        ? 'needs_review'
                        : ('needs_review' as const),
                }
              })

              setState((prev) => ({
                ...prev,
                parsedData,
                fieldMappings: preConfiguredMappings,
              }))

              resolve()
            } catch (error) {
              reject(new Error('Failed to parse CSV file'))
            }
          },
          error: (error) => {
            reject(new Error(`CSV parsing error: ${error.message}`))
          },
        })
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'File upload failed',
      }))
      throw error
    }
  }, [])

  const clearFile = useCallback(() => {
    setState((prev) => ({
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
      warnings: [],
    }))
  }, [])

  // AI mapping actions
  const generateAIMappings = useCallback(async () => {
    setState((prev) => {
      if (!prev.parsedData || !isOpenAIAvailable()) {
        return {
          ...prev,
          warnings: [...prev.warnings, 'OpenAI not available - using manual mapping'],
        }
      }
      return { ...prev, mappingInProgress: true, error: null }
    })

    // Access current state inside setState to avoid dependency issues
    setState((currentState) => {
      if (!currentState.parsedData || !isOpenAIAvailable()) {
        return currentState
      }

      // Perform AI mapping asynchronously
      ;(async () => {
        try {
          // For large files, use a smaller sample to reduce API costs and processing time
          const sampleSize = currentState.parsedData!.rows.length > 100 ? 10 : 3
          const aiResponse = await suggestFieldMappings(
            currentState.parsedData!.headers,
            currentState.parsedData!.rows.slice(0, sampleSize), // Reduced sample for large files
            currentState.config.entityType
          )

          const updatedMappings: SmartFieldMapping[] = currentState.fieldMappings.map((mapping) => {
            const aiMapping = aiResponse.mappings.find(
              (m) => m.header.toLowerCase() === mapping.csvHeader.toLowerCase()
            )

            if (aiMapping && aiMapping.suggestedField && aiMapping.confidence >= 0.5) {
              return {
                ...mapping,
                crmField: aiMapping.suggestedField,
                confidence: aiMapping.confidence,
                aiSuggestion: aiMapping.suggestedField,
                alternatives: aiMapping.alternatives || [],
                reason: aiMapping.reason ?? undefined,
                status: aiMapping.confidence >= 0.85 ? 'auto' : 'needs_review',
              }
            }

            return mapping
          })

          setState((prev) => ({
            ...prev,
            fieldMappings: updatedMappings,
            aiMappingResponse: aiResponse,
            mappingInProgress: false,
          }))
        } catch (error) {
          setState((prev) => ({
            ...prev,
            mappingInProgress: false,
            warnings: [...prev.warnings, 'AI mapping failed - using manual mapping'],
          }))
        }
      })()

      return currentState
    })
  }, [])

  const updateFieldMapping = useCallback(
    (csvHeader: string, crmField: string | null, userOverride = true) => {
      setState((prev) => ({
        ...prev,
        fieldMappings: prev.fieldMappings.map((mapping) =>
          mapping.csvHeader === csvHeader
            ? {
                ...mapping,
                crmField,
                isUserOverridden: userOverride,
                status: crmField ? 'confirmed' : 'skipped',
              }
            : mapping
        ),
      }))
    },
    []
  )

  const confirmMapping = useCallback((csvHeader: string) => {
    setState((prev) => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map((mapping) =>
        mapping.csvHeader === csvHeader ? { ...mapping, status: 'confirmed' } : mapping
      ),
    }))
  }, [])

  const skipField = useCallback((csvHeader: string) => {
    setState((prev) => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map((mapping) =>
        mapping.csvHeader === csvHeader
          ? { ...mapping, crmField: null, status: 'skipped' }
          : mapping
      ),
    }))
  }, [])

  // Validation actions
  const validateData = useCallback(async () => {
    setState((prev) => {
      if (!prev.parsedData || !isOpenAIAvailable() || prev.config.skipValidation) {
        return prev
      }

      setState((currentState) => {
        // Perform validation asynchronously
        ;(async () => {
          try {
            const fieldMappingDict = Object.fromEntries(
              currentState.fieldMappings
                .filter((m) => m.crmField && m.status !== 'skipped')
                .map((m) => [m.csvHeader, m.crmField!])
            )

            // For large files, use a smaller validation sample
            const validationSample = currentState.parsedData!.rows.length > 500 ? 25 : 50
            const validationResults = await validateRowsWithAI(
              currentState.parsedData!.rows,
              fieldMappingDict,
              validationSample // Adaptive sample size
            )

            setState((prev) => ({
              ...prev,
              validationResults,
              validationInProgress: false,
            }))
          } catch (error) {
            setState((prev) => ({
              ...prev,
              validationInProgress: false,
              warnings: [...prev.warnings, 'AI validation failed - using basic validation'],
            }))
          }
        })()

        return { ...currentState, validationInProgress: true }
      })

      return prev
    })
  }, [])

  const checkDuplicates = useCallback(async () => {
    setState((prev) => {
      if (!prev.parsedData || !isOpenAIAvailable() || prev.config.allowDuplicates) {
        return prev
      }

      // Perform duplicate detection asynchronously
      ;(async () => {
        try {
          const duplicateResults = await detectDuplicatesWithAI(prev.parsedData!.rows, 100)
          setState((prevState) => ({ ...prevState, duplicateResults }))
        } catch (error) {
          setState((prevState) => ({
            ...prevState,
            warnings: [...prevState.warnings, 'AI duplicate detection failed'],
          }))
        }
      })()

      return prev
    })
  }, [])

  // Import execution - integrates with useImportProgress hook
  const executeImport = useCallback(async () => {
    try {
      if (!state.parsedData || !state.fieldMappings.length) {
        setState((prev) => ({
          ...prev,
          error: 'No data to import',
        }))
        return
      }

      // Transform AI-mapped data to database format
      const transformedRows = transformDataForImport(state.parsedData, state.fieldMappings)

      if (transformedRows.length === 0) {
        setState((prev) => ({
          ...prev,
          error: 'No valid records to import',
        }))
        return
      }

      // Execute actual database import
      // Progress and results will be synced via useEffect
      await importOrganizations(transformedRows)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Import failed',
      }))
    }
  }, [state.parsedData, state.fieldMappings, transformDataForImport, importOrganizations])

  // Configuration
  const updateConfig = useCallback((updates: Partial<ImportConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }))
  }, [])

  // Reset
  const resetWizard = useCallback(() => {
    setState(initialState)
    resetImport()
  }, [resetImport])

  const actions = useMemo(
    () => ({
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
      resetWizard,
    }),
    [
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
      resetWizard,
    ]
  )

  return {
    state,
    actions,
  }
}
