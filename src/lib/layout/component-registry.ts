/**
 * Component Registry
 *
 * Stub implementation to resolve missing module imports.
 * This provides basic functionality to prevent compilation errors while
 * the full schema-driven layout system is being implemented.
 */

import type {
  LayoutComponentRegistry,
  RegistryMetadata,
  RegisteredComponent,
  ComponentFilter,
  ComponentCategory,
  ResolverContext,
  ResolvedComponent,
  ValidationContext,
  ValidationResult,
  ValidationWarning,
} from '../../types/layout/registry.types'

/**
 * Factory function to create a component registry
 *
 * Currently returns a stub implementation that prevents compilation errors.
 * Uses any casting to bypass type conflicts in the interface definition.
 *
 * @returns A component registry instance
 */
export function getComponentRegistry(): LayoutComponentRegistry {
  console.warn('[Component Registry] Using stub implementation - full component registry not yet implemented')

  // Stub implementation that satisfies the interface requirements
  const stubRegistry = {
    components: new Map<string, RegisteredComponent>(),
    resolvers: new Map<string, any>(),
    validators: new Map<string, any>(),
    metadata: {
      version: '0.0.1-stub',
      lastUpdated: new Date().toISOString(),
      totalComponents: 0,
      categories: [],
      supportedSlotTypes: [],
      supportedEntityTypes: [],
    } as RegistryMetadata,

    async register(component: RegisteredComponent): Promise<void> {
      console.warn('[Component Registry] register() called on stub implementation')
    },

    async unregister(componentId: string): Promise<void> {
      console.warn('[Component Registry] unregister() called on stub implementation')
    },

    async update(componentId: string, updates: Partial<RegisteredComponent>): Promise<void> {
      console.warn('[Component Registry] update() called on stub implementation')
    },

    get(componentId: string): RegisteredComponent | undefined {
      console.warn('[Component Registry] get() called on stub implementation')
      return undefined
    },

    list(filter?: ComponentFilter): RegisteredComponent[] {
      console.warn('[Component Registry] list() called on stub implementation')
      return []
    },

    categories(): ComponentCategory[] {
      console.warn('[Component Registry] categories() called on stub implementation')
      return []
    },

    async resolve(componentId: string, context: ResolverContext): Promise<ResolvedComponent> {
      console.warn('[Component Registry] resolve() called on stub implementation')
      throw new Error('Component resolution not implemented in stub registry')
    },

    validate(componentId: string, props: Record<string, any>, context: ValidationContext): ValidationResult {
      console.warn('[Component Registry] validate() called on stub implementation')
      const warning: ValidationWarning = {
        property: undefined,
        message: 'Validation not implemented in stub registry',
        code: 'STUB_VALIDATION',
        suggestion: 'Implement proper validation when full registry is available'
      }
      return {
        valid: true,
        errors: [],
        warnings: [warning]
      }
    }
  }

  // Add the categories property manually to avoid object literal conflict
  Object.defineProperty(stubRegistry, 'categories', {
    value: new Map<string, ComponentCategory>(),
    writable: true,
    enumerable: true,
    configurable: true
  })

  // Cast to the required type to bypass the interface conflict
  return stubRegistry as LayoutComponentRegistry
}

/**
 * Create a new component registry instance
 *
 * @returns New LayoutComponentRegistry instance
 */
export function createComponentRegistry(): LayoutComponentRegistry {
  return getComponentRegistry()
}

/**
 * Default export for convenience
 */
export default getComponentRegistry