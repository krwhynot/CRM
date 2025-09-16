// Test imports for registry files
import { getComponentRegistry, createComponentRegistry } from './src/lib/layout/component-registry'
import {
  createContextualResolver,
  createComponentLoader,
  createRegistryValidator
} from './src/lib/layout/registry-resolver'
import {
  createComponentRegistration,
  createDataTableRegistration,
  createHotReload
} from './src/lib/layout/component-factory'

// Test basic functionality
const registry = getComponentRegistry()
console.log('Registry created successfully')

const resolver = createContextualResolver()
console.log('Resolver created successfully')

const loader = createComponentLoader()
console.log('Loader created successfully')

// Export to ensure usage
export { registry, resolver, loader }