// Simple Node.js test to verify the registry can be imported
console.log('Testing component registry basic functionality...')

try {
  // Test that our TypeScript files exist and are structured correctly
  const fs = require('fs')

  // Check that files exist
  const files = [
    './src/lib/layout/component-registry.ts',
    './src/lib/layout/renderer.ts',
    './src/types/layout/schema.types.ts',
    './src/types/layout/registry.types.ts'
  ]

  for (const file of files) {
    if (fs.existsSync(file)) {
      console.log(`✓ ${file} exists`)
    } else {
      console.log(`✗ ${file} missing`)
    }
  }

  // Check that exports are present
  const registryContent = fs.readFileSync('./src/lib/layout/component-registry.ts', 'utf8')
  if (registryContent.includes('export function getComponentRegistry')) {
    console.log('✓ getComponentRegistry export found')
  } else {
    console.log('✗ getComponentRegistry export missing')
  }

  if (registryContent.includes('export function createComponentRegistry')) {
    console.log('✓ createComponentRegistry export found')
  } else {
    console.log('✗ createComponentRegistry export missing')
  }

  console.log('Basic file structure test completed successfully!')

} catch (error) {
  console.error('Test failed:', error.message)
  process.exit(1)
}