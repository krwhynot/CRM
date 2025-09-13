#!/usr/bin/env node

/**
 * Table Component Generator
 * 
 * Interactive CLI tool to generate new table components
 * that follow standardized patterns and conventions.
 * 
 * Usage: npm run generate:table
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Template for the table component
const generateTableComponent = (config) => {
  const {
    entityName,
    entityNamePlural,
    entityNameLower,
    entityNamePluralLower,
    featurePath,
    hasFilters,
    hasExpandableRows,
    hasBulkDelete,
    customFields
  } = config;

  return `import { DataTable } from '@/components/ui/DataTable'
import { Card, CardContent } from '@/components/ui/card'
import { BulkActionsProvider } from '@/components/shared/BulkActions/BulkActionsProvider'
import { BulkActionsToolbar } from '@/components/shared/BulkActions/BulkActionsToolbar'
${hasBulkDelete ? `import { BulkDeleteDialog } from '@/components/shared/BulkActions/BulkDeleteDialog'` : ''}
${hasFilters ? `import { ${entityName}Filters } from './${entityName}Filters'` : ''}
${hasExpandableRows ? `import { ${entityName}ExpandedContent } from './table/${entityName}ExpandedContent'` : ''}
import { use${entityName}Columns } from './table/${entityName}Row'
import { use${entityName}TableData } from '../hooks/use${entityName}TableData'
import { use${entityName}Actions } from '../hooks/use${entityName}Actions'
import { semanticSpacing } from '@/styles/tokens'
import type { ${entityName} } from '@/types/entities'

interface ${entityName}WithContext extends ${entityName} {
  // Add any additional context fields here
${customFields.map(field => `  ${field.name}?: ${field.type}`).join('\n')}
}

interface ${entityNamePlural}TableProps {
  ${entityNamePluralLower}?: ${entityName}WithContext[]
  loading?: boolean
  onEdit?: (${entityNameLower}: ${entityName}) => void
  onDelete?: (${entityNameLower}: ${entityName}) => void
  onView?: (${entityNameLower}: ${entityName}) => void
${hasFilters ? `  filters?: any
  onFiltersChange?: (filters: any) => void` : ''}
}

function ${entityNamePlural}TableContainer({
  ${entityNamePluralLower} = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
${hasFilters ? `  filters,
  onFiltersChange,` : ''}
}: ${entityNamePlural}TableProps) {
${hasBulkDelete ? `  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)` : ''}
  
  // Data management
  const {
    filtered${entityNamePlural},
    isLoading,
    toggleRowExpansion,
    isRowExpanded,
    emptyMessage,
    emptySubtext
  } = use${entityName}TableData({ 
    ${entityNamePluralLower}${hasFilters ? ',\n    filters' : ''} 
  })

  // Actions
  const {
    selectedItems,
    handleSelectItem,
    handleEdit${entityName},
    handleDelete${entityName},
  } = use${entityName}Actions()

  // Use passed props if available, otherwise use local handlers
  const handleEdit = onEdit || handleEdit${entityName}
  const handleDelete = onDelete || handleDelete${entityName}

  // Column definitions with actions
  const columns = use${entityName}Columns({
    selectedItems,
    handleSelectItem,
    toggleRowExpansion,
    isRowExpanded,
    onEdit${entityName}: handleEdit,
    onDelete${entityName}: handleDelete,
  })

  return (
    <div className={semanticSpacing.layoutContainer}>
${hasFilters ? `      {/* Filters */}
      <${entityName}Filters
        filters={filters}
        onFiltersChange={onFiltersChange}
        total${entityNamePlural}={${entityNamePluralLower}.length}
        filteredCount={filtered${entityNamePlural}.length}
        isLoading={isLoading}
      />
` : ''}
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar 
        entityType="${entityNameLower}" 
        entityTypePlural="${entityNamePluralLower}" 
      />

      {/* Data Table */}
      <Card>
        <CardContent className={semanticSpacing.cardContainer}>
          <DataTable<${entityName}WithContext>
            data={filtered${entityNamePlural}}
            columns={columns}
            rowKey={(row) => row.id}
            loading={isLoading || loading}
            emptyState={{
              message: emptyMessage,
              description: emptySubtext,
            }}
${hasExpandableRows ? `            expandableContent={(${entityNameLower}) => (
              <${entityName}ExpandedContent ${entityNameLower}={${entityNameLower}} />
            )}
            expandedRows={filtered${entityNamePlural}
              .filter(${entityNameLower} => isRowExpanded(${entityNameLower}.id))
              .map(${entityNameLower} => ${entityNameLower}.id)}
            onToggleRow={toggleRowExpansion}` : ''}
            features={{ 
              virtualization: 'auto' // Auto-virtualization at 500+ rows
            }}
          />
        </CardContent>
      </Card>
${hasBulkDelete ? `
      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        items={selectedItems}
        onConfirm={handleConfirmDelete}
        isDeleting={bulkActions.progress.isRunning}
        entityType="${entityNameLower}"
        entityTypePlural="${entityNamePluralLower}"
      />` : ''}
    </div>
  )
}

export function ${entityNamePlural}Table(props: ${entityNamePlural}TableProps) {
  const display${entityNamePlural} = props.${entityNamePluralLower} || []

  return (
    <BulkActionsProvider<${entityName}WithContext>
      items={display${entityNamePlural}}
      getItemId={(item) => item.id}
      getItemName={(item) => item.name || 'Unnamed ${entityName}'}
      entityType="${entityNameLower}"
      entityTypePlural="${entityNamePluralLower}"
    >
      <${entityNamePlural}TableContainer {...props} />
    </BulkActionsProvider>
  )
}`;
};

// Template for the table data hook
const generateTableDataHook = (config) => {
  const { entityName, entityNamePlural, entityNameLower, entityNamePluralLower } = config;
  
  return `import { useState, useMemo } from 'react'
import { useEntityTable } from '@/hooks/table/useEntityTable'
import type { ${entityName} } from '@/types/entities'

export interface ${entityName}TableDataConfig {
  ${entityNamePluralLower}?: ${entityName}[]
  filters?: any
  loading?: boolean
}

export function use${entityName}TableData(config: ${entityName}TableDataConfig) {
  const { ${entityNamePluralLower} = [], filters = {}, loading = false } = config

  // Filter function
  const filterFunction = (items: ${entityName}[], filters: any) => {
    return items.filter(${entityNameLower} => {
      // Add your filtering logic here
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = ${entityNameLower}.name?.toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }
      
      return true
    })
  }

  // Use the shared entity table hook
  const tableState = useEntityTable({
    data: ${entityNamePluralLower},
    filters,
    filterFunction,
    entityName: '${entityNameLower}',
    entityNamePlural: '${entityNamePluralLower}',
    emptyMessage: 'No ${entityNamePluralLower} found',
    emptyFilteredMessage: 'No ${entityNamePluralLower} match your criteria',
    emptyDescription: 'Get started by adding your first ${entityNameLower}',
    emptyFilteredDescription: 'Try adjusting your filters',
  })

  return {
    filtered${entityNamePlural}: tableState.processedData,
    isLoading: loading || tableState.isLoading,
    ...tableState
  }
}`;
};

// Interactive CLI
class TableComponentGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(`${colors.cyan}${question}${colors.reset} `, resolve);
    });
  }

  async confirm(question) {
    const answer = await this.prompt(`${question} (y/n)`);
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  pluralize(str) {
    if (str.endsWith('y')) {
      return str.slice(0, -1) + 'ies';
    }
    if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch')) {
      return str + 'es';
    }
    return str + 's';
  }

  async run() {
    console.log(`\n${colors.bold}📊 Table Component Generator${colors.reset}`);
    console.log('=' .repeat(40));
    console.log('This tool will generate a standardized table component.\n');

    // Get entity name
    const entityNameInput = await this.prompt('Entity name (e.g., Supplier, Invoice):');
    const entityName = this.capitalize(entityNameInput.trim());
    const entityNameLower = entityName.toLowerCase();
    
    // Get plural form
    const defaultPlural = this.pluralize(entityName);
    const pluralInput = await this.prompt(`Plural form (default: ${defaultPlural}):`);
    const entityNamePlural = pluralInput.trim() || defaultPlural;
    const entityNamePluralLower = entityNamePlural.toLowerCase();

    // Get feature path
    const featurePath = await this.prompt('Feature folder name (e.g., suppliers, invoices):');

    // Feature options
    const hasFilters = await this.confirm('Include filters?');
    const hasExpandableRows = await this.confirm('Include expandable rows?');
    const hasBulkDelete = await this.confirm('Include bulk delete?');

    // Custom fields
    const customFields = [];
    if (await this.confirm('Add custom context fields?')) {
      let addingFields = true;
      while (addingFields) {
        const fieldName = await this.prompt('Field name (or press enter to finish):');
        if (!fieldName) {
          addingFields = false;
        } else {
          const fieldType = await this.prompt('Field type (e.g., string, number, boolean):');
          customFields.push({ name: fieldName, type: fieldType || 'any' });
        }
      }
    }

    const config = {
      entityName,
      entityNamePlural,
      entityNameLower,
      entityNamePluralLower,
      featurePath,
      hasFilters,
      hasExpandableRows,
      hasBulkDelete,
      customFields
    };

    // Generate files
    console.log(`\n${colors.green}Generating components...${colors.reset}\n`);

    // Create directories
    const basePath = path.join(process.cwd(), 'src', 'features', featurePath);
    const componentsPath = path.join(basePath, 'components');
    const tablePath = path.join(componentsPath, 'table');
    const hooksPath = path.join(basePath, 'hooks');

    // Ensure directories exist
    [basePath, componentsPath, tablePath, hooksPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`${colors.green}✓${colors.reset} Created directory: ${path.relative(process.cwd(), dir)}`);
      }
    });

    // Generate table component
    const tableComponentPath = path.join(componentsPath, `${entityNamePlural}Table.tsx`);
    fs.writeFileSync(tableComponentPath, generateTableComponent(config));
    console.log(`${colors.green}✓${colors.reset} Generated: ${path.relative(process.cwd(), tableComponentPath)}`);

    // Generate table data hook
    const tableDataHookPath = path.join(hooksPath, `use${entityName}TableData.ts`);
    fs.writeFileSync(tableDataHookPath, generateTableDataHook(config));
    console.log(`${colors.green}✓${colors.reset} Generated: ${path.relative(process.cwd(), tableDataHookPath)}`);

    // Generate stub files
    const stubs = [
      {
        path: path.join(hooksPath, `use${entityName}Actions.ts`),
        content: `export function use${entityName}Actions() {
  // TODO: Implement action handlers
  return {
    selectedItems: new Set(),
    handleSelectItem: (id: string) => {},
    handleEdit${entityName}: (item: any) => {},
    handleDelete${entityName}: (item: any) => {},
  }
}`
      },
      {
        path: path.join(tablePath, `${entityName}Row.tsx`),
        content: `import type { Column } from '@/components/ui/DataTable'
import type { ${entityName} } from '@/types/entities'

export function use${entityName}Columns(props: any): Column<${entityName}>[] {
  return [
    {
      key: 'name',
      header: 'Name',
      cell: (${entityNameLower}) => <span>{${entityNameLower}.name}</span>
    },
    // TODO: Add more columns
  ]
}`
      }
    ];

    if (hasFilters) {
      stubs.push({
        path: path.join(componentsPath, `${entityName}Filters.tsx`),
        content: `export function ${entityName}Filters(props: any) {
  // TODO: Implement filters
  return <div>Filters placeholder</div>
}`
      });
    }

    if (hasExpandableRows) {
      stubs.push({
        path: path.join(tablePath, `${entityName}ExpandedContent.tsx`),
        content: `export function ${entityName}ExpandedContent({ ${entityNameLower} }: any) {
  // TODO: Implement expanded content
  return <div>Expanded content for {${entityNameLower}.name}</div>
}`
      });
    }

    stubs.forEach(stub => {
      fs.writeFileSync(stub.path, stub.content);
      console.log(`${colors.green}✓${colors.reset} Generated stub: ${path.relative(process.cwd(), stub.path)}`);
    });

    console.log(`\n${colors.bold}${colors.green}✨ Table component generated successfully!${colors.reset}`);
    console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
    console.log(`1. Define the ${entityName} type in src/types/entities.ts`);
    console.log(`2. Implement the column definitions in ${entityName}Row.tsx`);
    console.log(`3. Implement the action handlers in use${entityName}Actions.ts`);
    if (hasFilters) {
      console.log(`4. Implement the filters in ${entityName}Filters.tsx`);
    }
    if (hasExpandableRows) {
      console.log(`5. Implement the expanded content in ${entityName}ExpandedContent.tsx`);
    }
    console.log(`\n${colors.cyan}Run 'npm run validate:table-consistency' to verify compliance${colors.reset}\n`);

    this.rl.close();
  }
}

// Run the generator
if (require.main === module) {
  const generator = new TableComponentGenerator();
  generator.run().catch(console.error);
}

module.exports = TableComponentGenerator;