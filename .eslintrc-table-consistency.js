/**
 * ESLint rules for enforcing table component consistency
 * These rules ensure all table components follow standardized patterns
 */

module.exports = {
  rules: {
    /**
     * Rule: Ensure DataTable component is used
     */
    'crm/use-datatable-component': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce use of DataTable component in table files',
          category: 'Best Practices',
        },
        messages: {
          missingDataTable: 'Table components must use the DataTable component from @/components/ui/DataTable',
        },
      },
      create(context) {
        const filename = context.getFilename();
        
        // Only check table files
        if (!filename.includes('Table') && !filename.includes('table')) {
          return {};
        }
        
        let hasDataTableImport = false;
        let hasDataTableUsage = false;
        
        return {
          ImportDeclaration(node) {
            if (node.source.value === '@/components/ui/DataTable') {
              hasDataTableImport = true;
            }
          },
          JSXElement(node) {
            if (node.openingElement.name.name === 'DataTable') {
              hasDataTableUsage = true;
            }
          },
          'Program:exit'() {
            if (filename.includes('Table') || filename.includes('table')) {
              if (!hasDataTableImport || !hasDataTableUsage) {
                context.report({
                  node: context.getSourceCode().ast,
                  messageId: 'missingDataTable',
                });
              }
            }
          },
        };
      },
    },
    
    /**
     * Rule: Ensure Card wrapper pattern
     */
    'crm/table-card-wrapper': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce Card wrapper pattern for tables',
          category: 'Best Practices',
        },
        messages: {
          missingCardWrapper: 'DataTable should be wrapped in Card/CardContent components',
        },
      },
      create(context) {
        let hasCard = false;
        let hasCardContent = false;
        let hasDataTable = false;
        
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (source === '@/components/ui/card') {
              node.specifiers.forEach(spec => {
                if (spec.imported) {
                  if (spec.imported.name === 'Card') hasCard = true;
                  if (spec.imported.name === 'CardContent') hasCardContent = true;
                }
              });
            }
          },
          JSXElement(node) {
            if (node.openingElement.name.name === 'DataTable') {
              hasDataTable = true;
              
              // Check if DataTable is wrapped in Card
              let parent = node.parent;
              let foundCard = false;
              let foundCardContent = false;
              
              while (parent) {
                if (parent.type === 'JSXElement') {
                  const name = parent.openingElement.name.name;
                  if (name === 'Card') foundCard = true;
                  if (name === 'CardContent') foundCardContent = true;
                }
                parent = parent.parent;
              }
              
              if (!foundCard || !foundCardContent) {
                context.report({
                  node: node,
                  messageId: 'missingCardWrapper',
                });
              }
            }
          },
        };
      },
    },
    
    /**
     * Rule: Enforce semantic token usage
     */
    'crm/use-semantic-tokens': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce semantic token usage over hardcoded Tailwind classes',
          category: 'Best Practices',
        },
        messages: {
          useSemanticTokens: 'Use semantic tokens instead of hardcoded Tailwind spacing classes: {{class}}',
        },
      },
      create(context) {
        const hardcodedPattern = /\b(p-\d+|m-\d+|px-\d+|py-\d+|mx-\d+|my-\d+|space-[xy]-\d+|gap-\d+)\b/g;
        
        return {
          JSXAttribute(node) {
            if (node.name.name === 'className') {
              const value = node.value;
              
              if (value && value.type === 'Literal') {
                const matches = value.value.match(hardcodedPattern);
                
                if (matches) {
                  matches.forEach(match => {
                    context.report({
                      node: node,
                      messageId: 'useSemanticTokens',
                      data: { class: match },
                    });
                  });
                }
              }
            }
          },
        };
      },
    },
    
    /**
     * Rule: Ensure BulkActionsProvider usage
     */
    'crm/table-bulk-actions': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce BulkActionsProvider for table components',
          category: 'Best Practices',
        },
        messages: {
          missingBulkActions: 'Table components should use BulkActionsProvider for consistency',
        },
      },
      create(context) {
        const filename = context.getFilename();
        
        if (!filename.includes('Table') && !filename.includes('table')) {
          return {};
        }
        
        let hasBulkActionsProvider = false;
        
        return {
          ImportDeclaration(node) {
            if (node.source.value === '@/components/shared/BulkActions') {
              node.specifiers.forEach(spec => {
                if (spec.imported && spec.imported.name === 'BulkActionsProvider') {
                  hasBulkActionsProvider = true;
                }
              });
            }
          },
          'Program:exit'() {
            if (!hasBulkActionsProvider) {
              context.report({
                node: context.getSourceCode().ast,
                messageId: 'missingBulkActions',
              });
            }
          },
        };
      },
    },
    
    /**
     * Rule: Consistent hook naming
     */
    'crm/table-hook-naming': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent hook naming for table components',
          category: 'Best Practices',
        },
        messages: {
          inconsistentHookName: 'Table data hook should follow pattern: use{Entity}TableData',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            if (node.callee.type === 'Identifier') {
              const name = node.callee.name;
              
              // Check for table data hooks
              if (name.includes('Table') && name.startsWith('use')) {
                if (!name.match(/^use[A-Z]\w+TableData$/)) {
                  context.report({
                    node: node,
                    messageId: 'inconsistentHookName',
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};