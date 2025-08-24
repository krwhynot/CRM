/**
 * Custom ESLint plugin for CRM architecture enforcement
 * Prevents violations of client/server state separation and component organization
 */

module.exports = {
  rules: {
    'no-server-data-in-stores': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent storing server data objects in Zustand stores',
          category: 'Architectural',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          // Check for server-like objects in store interfaces
          TSPropertySignature(node) {
            const parent = node.parent?.parent
            if (parent?.type === 'TSInterfaceDeclaration' && 
                parent.id?.name?.includes('Store') || parent.id?.name?.includes('State')) {
              
              const propertyName = node.key?.name
              const serverDataFields = ['id', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by']
              
              if (serverDataFields.includes(propertyName)) {
                context.report({
                  node,
                  message: `Server data field "${propertyName}" should not be stored in client state. Use TanStack Query hooks instead.`
                })
              }
            }
          },

          // Check for TanStack Query-like properties in Zustand stores
          Property(node) {
            const parent = node.parent?.parent?.parent
            if (parent?.type === 'VariableDeclarator' && 
                parent.id?.name?.includes('Store')) {
              
              const propertyName = node.key?.name
              const queryFields = ['data', 'isLoading', 'error', 'refetch', 'isPending', 'isFetching']
              
              if (queryFields.includes(propertyName)) {
                context.report({
                  node,
                  message: `TanStack Query property "${propertyName}" should not be stored in Zustand stores. Use query hooks instead.`
                })
              }
            }
          }
        }
      }
    },

    'enforce-feature-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce proper feature-based imports',
          category: 'Architectural',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value
            
            // Check for imports from old specialized directory
            if (source.includes('@/components/forms/entity-select/specialized')) {
              context.report({
                node,
                message: 'Import specialized entity selects from feature directories: @/features/{entity}/components/{Entity}Select'
              })
            }

            // Check for cross-feature component imports
            const featureMatch = source.match(/@\/features\/([^/]+)\/components\//)
            if (featureMatch) {
              const currentFile = context.getFilename()
              const currentFeature = currentFile.match(/src\/features\/([^/]+)\//)
              
              if (currentFeature && currentFeature[1] !== featureMatch[1]) {
                // Allow imports from shared components but warn about cross-feature imports
                if (!source.includes('/hooks/') && !source.includes('/types/')) {
                  context.report({
                    node,
                    message: `Avoid importing components from other features. Consider moving shared logic to /src/components/ or using feature hooks.`
                  })
                }
              }
            }
          }
        }
      }
    },

    'validate-client-state': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Validate that client state stores only contain UI state and IDs',
          category: 'Architectural', 
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          TSInterfaceDeclaration(node) {
            if (node.id.name.includes('Store') || node.id.name.includes('UIState')) {
              node.body.body.forEach(member => {
                if (member.type === 'TSPropertySignature' && member.key) {
                  const propName = member.key.name
                  const propType = member.typeAnnotation?.typeAnnotation
                  
                  // Check for array of objects (likely server data)
                  if (propType?.type === 'TSArrayType' && 
                      propType.elementType?.type === 'TSTypeReference') {
                    const typeName = propType.elementType.typeName?.name
                    if (typeName && /^[A-Z]/.test(typeName) && !typeName.includes('Option')) {
                      context.report({
                        node: member,
                        message: `Arrays of server objects (${typeName}[]) should not be stored in client state. Store arrays of IDs instead.`
                      })
                    }
                  }

                  // Check for single objects (likely server data)  
                  if (propType?.type === 'TSTypeReference') {
                    const typeName = propType.typeName?.name
                    if (typeName && /^[A-Z]/.test(typeName) && 
                        !typeName.includes('Props') && 
                        !typeName.includes('Option') &&
                        !propName.endsWith('Id') && 
                        !propName.endsWith('Mode') &&
                        !propName.includes('preferences')) {
                      context.report({
                        node: member,
                        message: `Server data objects (${typeName}) should not be stored in client state. Store IDs instead and fetch data via TanStack Query.`
                      })
                    }
                  }
                }
              })
            }
          }
        }
      }
    }
  }
}