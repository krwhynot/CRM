/**
 * Layout Standardization Architecture Tests
 * Validates that the layout standardization has been properly implemented across entity pages
 */

import { describe, test, expect, beforeAll } from 'vitest'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { glob } from 'glob'

const projectRoot = join(process.cwd())

describe('Layout Standardization Architecture', () => {
  let entityListComponents: string[] = []
  let entityPages: string[] = []
  let filterComponents: string[] = []
  let dataTableComponents: string[] = []

  beforeAll(async () => {
    // Get all entity list components
    entityListComponents = await glob('src/features/*/components/*List.tsx', {
      cwd: projectRoot
    })

    // Get all entity pages
    entityPages = await glob('src/pages/{Organizations,Contacts,Opportunities,Products,Interactions}.tsx', {
      cwd: projectRoot
    })

    // Get all filter components
    filterComponents = await glob('src/features/*/components/*Filters.tsx', {
      cwd: projectRoot
    })

    // Get data table related components
    dataTableComponents = await glob('src/components/data-table/**/*.tsx', {
      cwd: projectRoot,
      ignore: ['**/index.ts', '**/index.tsx']
    })
  })

  describe('EntityListWrapper Pattern Adoption', () => {
    test('all entity list components should use EntityListWrapper', async () => {
      const violations: Array<{ file: string; reason: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        // Check if EntityListWrapper is imported
        const hasEntityListWrapperImport = content.includes('EntityListWrapper')

        // Check if EntityListWrapper is used in JSX
        const hasEntityListWrapperUsage = /<EntityListWrapper/.test(content)

        if (!hasEntityListWrapperImport) {
          violations.push({
            file,
            reason: 'Missing EntityListWrapper import'
          })
        } else if (!hasEntityListWrapperUsage) {
          violations.push({
            file,
            reason: 'EntityListWrapper imported but not used in JSX'
          })
        }
      }

      expect(violations).toEqual([])
    })

    test('EntityListWrapper should have consistent prop usage', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        if (!content.includes('EntityListWrapper')) continue

        // Check for required props
        const hasTitle = /title=/.test(content)
        const hasDescription = /description=/.test(content)

        if (!hasTitle) {
          violations.push({ file, issue: 'Missing title prop on EntityListWrapper' })
        }

        if (!hasDescription) {
          violations.push({ file, issue: 'Missing description prop on EntityListWrapper' })
        }

        // Check for proper action prop structure (optional but should be consistent when present)
        const actionMatch = content.match(/action=\{([^}]+)\}/s)
        if (actionMatch) {
          const actionContent = actionMatch[1]
          const hasLabel = actionContent.includes('label')
          const hasOnClick = actionContent.includes('onClick')

          if (!hasLabel || !hasOnClick) {
            violations.push({
              file,
              issue: 'EntityListWrapper action prop missing required label or onClick'
            })
          }
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('No Duplicate Headers', () => {
    test('entity pages should not have duplicate headers', async () => {
      const violations: Array<{ file: string; duplicateHeaders: string[] }> = []

      for (const file of [...entityListComponents, ...entityPages]) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        // Look for multiple header-like elements
        const headerPatterns = [
          /<h1[^>]*>/g,
          /<PageHeader[^>]*>/g,
          /<EntityListWrapper[^>]*title=/g,
          /className="[^"]*text-2xl[^"]*"/g, // h1-like classes
          /className="[^"]*text-3xl[^"]*"/g, // header-like classes
        ]

        const foundHeaders: string[] = []

        for (const pattern of headerPatterns) {
          const matches = content.match(pattern)
          if (matches && matches.length > 0) {
            foundHeaders.push(...matches)
          }
        }

        // Check for duplicate header content (same title appearing multiple times)
        const titleMatches = content.match(/title="([^"]+)"/g)
        if (titleMatches && titleMatches.length > 1) {
          const titles = titleMatches.map(match => match.replace(/title="([^"]+)"/, '$1'))
          const uniqueTitles = [...new Set(titles)]

          if (uniqueTitles.length < titles.length) {
            violations.push({
              file,
              duplicateHeaders: titles
            })
          }
        }

        // Also check for hardcoded headers that might conflict with EntityListWrapper
        const hardcodedHeaderPattern = /<h[1-6][^>]*>([^<]*)<\/h[1-6]>/g
        const hardcodedHeaders = content.match(hardcodedHeaderPattern)
        const hasEntityListWrapper = content.includes('<EntityListWrapper')

        if (hardcodedHeaders && hasEntityListWrapper) {
          // Filter out headers that are clearly not page headers (like in expandable content)
          const pageHeaders = hardcodedHeaders.filter(header => {
            const headerText = header.replace(/<[^>]*>/g, '').trim()
            return ['Organizations', 'Contacts', 'Opportunities', 'Products', 'Interactions']
              .some(entity => headerText.includes(entity))
          })

          if (pageHeaders.length > 0) {
            violations.push({
              file,
              duplicateHeaders: pageHeaders
            })
          }
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('No Duplicate Checkboxes in DataTables', () => {
    test('DataTable should not render duplicate selection checkboxes', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      // Check the main DataTable component for duplicate rendering
      const dataTableFile = 'src/components/data-table/data-table.tsx'
      const dataTableContent = await readFile(join(projectRoot, dataTableFile), 'utf8')

      // Look for checkbox rendering in multiple places
      const checkboxPatterns = [
        /type="checkbox"/g,
        /<Checkbox[^>]*>/g,
        /cell\.getCanSelect/g,
        /row\.getCanSelect/g,
        /table\.getToggleAllRowsSelectedHandler/g,
      ]

      let checkboxRenderingLocations = 0
      for (const pattern of checkboxPatterns) {
        const matches = dataTableContent.match(pattern)
        if (matches) {
          checkboxRenderingLocations += matches.length
        }
      }

      // Check column definitions for selection columns
      const columnFiles = await glob('src/components/data-table/columns/*.tsx', {
        cwd: projectRoot
      })

      for (const file of columnFiles) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        // Look for selection column definitions
        const selectionColumnPattern = /id:\s*["']select["']/g
        const selectionMatches = content.match(selectionColumnPattern)

        if (selectionMatches && selectionMatches.length > 1) {
          violations.push({
            file,
            issue: `Multiple selection column definitions found: ${selectionMatches.length}`
          })
        }

        // Check for manual checkbox rendering in columns when DataTable handles it
        const manualCheckboxInColumn = content.includes('type="checkbox"') || content.includes('<Checkbox')
        const hasDataTableImport = content.includes('DataTable')

        if (manualCheckboxInColumn && hasDataTableImport) {
          violations.push({
            file,
            issue: 'Manual checkbox rendering in column when DataTable should handle selection'
          })
        }
      }

      expect(violations).toEqual([])
    })

    test('entity list components should not duplicate DataTable selection logic', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        if (!content.includes('DataTable')) continue

        // Check for manual selection state management when DataTable handles it
        const hasOnSelectionChange = content.includes('onSelectionChange')
        const hasManualSelectionState = content.includes('selectedIds') || content.includes('selectedItems')

        if (hasOnSelectionChange && hasManualSelectionState) {
          // This is expected - components need to manage selection for bulk actions
          continue
        }

        // Look for duplicate checkbox rendering
        const duplicateCheckboxIndicators = [
          content.includes('type="checkbox"') && content.includes('<DataTable'),
          content.includes('<Checkbox') && content.includes('<DataTable'),
          content.match(/cell\.getCanSelect/g)?.length > 1,
        ]

        if (duplicateCheckboxIndicators.some(Boolean)) {
          violations.push({
            file,
            issue: 'Potential duplicate checkbox rendering alongside DataTable'
          })
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('EntityFilters Migration Completion', () => {
    test('all entity filter components should use EntityFilters component', async () => {
      const violations: Array<{ file: string; status: string }> = []

      for (const file of filterComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        // Check if it's using the new EntityFilters component
        const usesEntityFilters = content.includes('EntityFilters')
        const hasEntityFiltersImport = content.includes("from '@/components/data-table/filters/EntityFilters'")

        // Check for legacy filter patterns
        const hasLegacyFilters = [
          content.includes('TODO'), // Legacy TODOs for migration
          content.includes('// Legacy'), // Legacy comments
          content.includes('useFilters') && !content.includes('EntityFilters'), // Old filter hooks
          content.includes('QuickFilters') && !content.includes('EntityFilters'), // Old QuickFilters
        ].some(Boolean)

        if (hasLegacyFilters && !usesEntityFilters) {
          violations.push({
            file,
            status: 'Legacy filter implementation, needs EntityFilters migration'
          })
        } else if (!usesEntityFilters && !hasEntityFiltersImport) {
          violations.push({
            file,
            status: 'Not using EntityFilters component'
          })
        } else if (usesEntityFilters && !hasEntityFiltersImport) {
          violations.push({
            file,
            status: 'Using EntityFilters but missing proper import'
          })
        }
      }

      expect(violations).toEqual([])
    })

    test('EntityFilters should have consistent configuration across entities', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        if (!content.includes('EntityFilters')) continue

        // Check for required EntityFilters props
        const requiredProps = ['entityType', 'filters', 'onFiltersChange']
        const missingProps = requiredProps.filter(prop => !content.includes(prop))

        if (missingProps.length > 0) {
          violations.push({
            file,
            issue: `Missing required EntityFilters props: ${missingProps.join(', ')}`
          })
        }

        // Check for consistent prop patterns
        const hasSearchPlaceholder = content.includes('searchPlaceholder')
        const hasShowTimeRange = content.includes('showTimeRange')
        const hasShowQuickFilters = content.includes('showQuickFilters')

        // These are not required but should be consistent when present
        if (content.includes('<EntityFilters') && !hasSearchPlaceholder) {
          violations.push({
            file,
            issue: 'EntityFilters missing searchPlaceholder for better UX'
          })
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('useStandardDataTable Adoption', () => {
    test('all entity list components should use useStandardDataTable hook', async () => {
      const violations: Array<{ file: string; status: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        if (!content.includes('DataTable')) continue

        const hasUseStandardDataTable = content.includes('useStandardDataTable')
        const hasStandardDataTableImport = content.includes("from '@/hooks/useStandardDataTable'")

        if (!hasUseStandardDataTable) {
          violations.push({
            file,
            status: 'Not using useStandardDataTable hook for consistent configuration'
          })
        } else if (!hasStandardDataTableImport) {
          violations.push({
            file,
            status: 'Using useStandardDataTable but missing proper import'
          })
        }

        // Check for proper usage pattern
        if (hasUseStandardDataTable) {
          const hasDataTableProps = content.includes('dataTableProps')
          const hasSpreadOperator = content.includes('...dataTableProps')

          if (!hasDataTableProps) {
            violations.push({
              file,
              status: 'useStandardDataTable hook used but dataTableProps not extracted'
            })
          } else if (!hasSpreadOperator) {
            violations.push({
              file,
              status: 'dataTableProps extracted but not spread into DataTable component'
            })
          }
        }
      }

      expect(violations).toEqual([])
    })

    test('useStandardDataTable should have appropriate entity-specific configuration', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        if (!content.includes('useStandardDataTable')) continue

        // Extract entity type from file path
        const entityMatch = file.match(/features\/([^\/]+)\//)
        if (!entityMatch) continue

        const entityName = entityMatch[1]
        const expectedEntityType = entityName // organizations, contacts, etc.

        // Check if entityType is configured correctly
        const configMatch = content.match(/useStandardDataTable\s*\(\s*\{([^}]+)\}/s)
        if (configMatch) {
          const config = configMatch[1]

          if (config.includes('entityType')) {
            const entityTypeMatch = config.match(/entityType:\s*['"]([^'"]+)['"]/s)
            if (entityTypeMatch) {
              const configuredEntityType = entityTypeMatch[1]
              if (configuredEntityType !== expectedEntityType) {
                violations.push({
                  file,
                  issue: `Entity type mismatch: expected '${expectedEntityType}', got '${configuredEntityType}'`
                })
              }
            }
          } else {
            violations.push({
              file,
              issue: `Missing entityType configuration for ${expectedEntityType}`
            })
          }

          // Check for appropriate boolean configurations
          const shouldHaveSelectable = content.includes('BulkActionsToolbar') || content.includes('selectedItems')
          const hasSelectable = config.includes('selectable: true')

          if (shouldHaveSelectable && !hasSelectable) {
            violations.push({
              file,
              issue: 'Component uses bulk actions but useStandardDataTable not configured with selectable: true'
            })
          }

          const shouldHaveExpandable = content.includes('expandedContent') || content.includes('renderExpandableContent')
          const hasExpandable = config.includes('expandable: true')

          if (shouldHaveExpandable && !hasExpandable) {
            violations.push({
              file,
              issue: 'Component uses expanded content but useStandardDataTable not configured with expandable: true'
            })
          }
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('Consistent DataTable Configuration', () => {
    test('all DataTable components should have consistent prop patterns', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        if (!content.includes('<DataTable')) continue

        // Check for required DataTable props
        const requiredProps = ['data', 'columns']
        const missingProps = requiredProps.filter(prop => {
          const propPattern = new RegExp(`${prop}=`)
          return !propPattern.test(content)
        })

        if (missingProps.length > 0) {
          violations.push({
            file,
            issue: `Missing required DataTable props: ${missingProps.join(', ')}`
          })
        }

        // Check for consistent prop ordering (data, columns, loading, ...dataTableProps)
        const dataTableMatch = content.match(/<DataTable[^>]*>/s)
        if (dataTableMatch) {
          const propsString = dataTableMatch[0]

          // Check if required props come before optional ones
          const dataIndex = propsString.indexOf('data=')
          const columnsIndex = propsString.indexOf('columns=')
          const loadingIndex = propsString.indexOf('loading=')
          const dataTablePropsIndex = propsString.indexOf('...dataTableProps')

          if (dataIndex > -1 && columnsIndex > -1 && dataIndex > columnsIndex) {
            violations.push({
              file,
              issue: 'DataTable props not in recommended order: data should come before columns'
            })
          }

          if (dataTablePropsIndex > -1 && loadingIndex > -1 && dataTablePropsIndex < loadingIndex) {
            violations.push({
              file,
              issue: 'DataTable props order: ...dataTableProps should come after explicit props'
            })
          }
        }

        // Check for proper TypeScript generics
        const genericMatch = content.match(/<DataTable<([^>]+)>/)
        if (genericMatch) {
          const generics = genericMatch[1]
          if (!generics.includes(',')) {
            violations.push({
              file,
              issue: 'DataTable missing second generic parameter (TValue)'
            })
          }
        } else if (content.includes('<DataTable')) {
          violations.push({
            file,
            issue: 'DataTable missing TypeScript generics for type safety'
          })
        }
      }

      expect(violations).toEqual([])
    })

    test('DataTable components should have proper empty state configuration', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        if (!content.includes('<DataTable')) continue

        // Check for emptyState prop
        const hasEmptyState = content.includes('emptyState=')

        if (!hasEmptyState) {
          violations.push({
            file,
            issue: 'DataTable missing emptyState configuration for better UX'
          })
          continue
        }

        // Check for proper emptyState structure
        const emptyStateMatch = content.match(/emptyState=\{([^}]+)\}/s)
        if (emptyStateMatch) {
          const emptyStateContent = emptyStateMatch[1]

          const hasTitle = emptyStateContent.includes('title')
          const hasDescription = emptyStateContent.includes('description')

          if (!hasTitle) {
            violations.push({
              file,
              issue: 'emptyState missing title property'
            })
          }

          if (!hasDescription) {
            violations.push({
              file,
              issue: 'emptyState missing description property'
            })
          }

          // Check for conditional empty states based on filters
          const hasConditionalMessage = emptyStateContent.includes('filters') ||
                                       emptyStateContent.includes('search') ||
                                       emptyStateContent.includes('quickView')

          if (!hasConditionalMessage) {
            violations.push({
              file,
              issue: 'emptyState should have conditional messages based on active filters'
            })
          }
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('Bulk Actions Integration', () => {
    test('components with selection should use BulkActionsToolbar', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        // Check if component has selection capability
        const hasSelection = content.includes('selectedItems') ||
                           content.includes('selectedIds') ||
                           content.includes('onSelectionChange')

        if (!hasSelection) continue

        // Check for BulkActionsToolbar usage
        const hasBulkActionsToolbar = content.includes('BulkActionsToolbar')
        const hasBulkActionsImport = content.includes('BulkActionsToolbar') &&
                                   content.includes("from '@/components/bulk-actions'")

        if (!hasBulkActionsToolbar) {
          violations.push({
            file,
            issue: 'Component has selection but missing BulkActionsToolbar'
          })
        } else if (!hasBulkActionsImport) {
          violations.push({
            file,
            issue: 'BulkActionsToolbar used but missing proper import'
          })
        }

        // Check for BulkDeleteDialog when bulk delete is used
        const hasBulkDelete = content.includes('onBulkDelete') || content.includes('handleBulkDelete')
        const hasBulkDeleteDialog = content.includes('BulkDeleteDialog')

        if (hasBulkDelete && !hasBulkDeleteDialog) {
          violations.push({
            file,
            issue: 'Component has bulk delete but missing BulkDeleteDialog'
          })
        }

        // Check for proper bulk action props
        if (hasBulkActionsToolbar) {
          const requiredBulkProps = ['selectedCount', 'totalCount', 'onClearSelection']
          const missingBulkProps = requiredBulkProps.filter(prop => !content.includes(prop))

          if (missingBulkProps.length > 0) {
            violations.push({
              file,
              issue: `BulkActionsToolbar missing required props: ${missingBulkProps.join(', ')}`
            })
          }
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('Expandable Rows Implementation', () => {
    test('components with expandable rows should have consistent implementation', async () => {
      const violations: Array<{ file: string; issue: string }> = []

      for (const file of entityListComponents) {
        const content = await readFile(join(projectRoot, file), 'utf8')

        // Check if component has expandable functionality
        const hasExpandable = content.includes('expandedContent') ||
                            content.includes('renderExpandableContent') ||
                            content.includes('toggleRowExpansion')

        if (!hasExpandable) continue

        // Check for proper expandable content renderer
        const hasExpandableRenderer = content.includes('renderExpandableContent') ||
                                    content.includes('expandedContent=')

        if (!hasExpandableRenderer) {
          violations.push({
            file,
            issue: 'Component has expandable functionality but missing content renderer'
          })
        }

        // Check for display hook usage
        const hasDisplayHook = content.includes('useDisplayHook') ||
                             content.includes('useOrganizationsDisplay') ||
                             content.includes('useContactsDisplay') ||
                             content.includes('useOpportunitiesDisplay') ||
                             content.includes('useProductsDisplay')

        if (!hasDisplayHook) {
          violations.push({
            file,
            issue: 'Component has expandable rows but missing display hook for state management'
          })
        }

        // Check for expandable configuration in useStandardDataTable
        if (content.includes('useStandardDataTable')) {
          const configMatch = content.match(/useStandardDataTable\s*\(\s*\{([^}]+)\}/s)
          if (configMatch) {
            const config = configMatch[1]
            const hasExpandableConfig = config.includes('expandable: true')

            if (!hasExpandableConfig) {
              violations.push({
                file,
                issue: 'Component has expandable content but useStandardDataTable not configured with expandable: true'
              })
            }
          }
        }
      }

      expect(violations).toEqual([])
    })
  })
})