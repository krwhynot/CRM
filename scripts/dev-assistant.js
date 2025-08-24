#!/usr/bin/env node

/**
 * CRM Developer Assistant
 * Provides intelligent development tools and shortcuts for CRM development
 */

import { readdir, readFile, writeFile, stat, mkdir } from 'fs/promises'
import { join, basename, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Command line interface
const COMMANDS = {
  'create-component': 'Create a new CRM component with proper architecture',
  'create-feature': 'Create a new feature with complete structure',
  'create-hook': 'Create a TanStack Query hook with proper patterns',
  'create-store': 'Create a Zustand store with type safety',
  'analyze': 'Analyze codebase health and provide suggestions',
  'validate': 'Run all validation checks',
  'fix': 'Auto-fix common issues',
  'help': 'Show this help message'
}

/**
 * Create a new CRM component with proper architecture
 */
async function createComponent(name, feature, options = {}) {
  const { shared = false, withTests = true, withStorybook = false } = options
  
  const componentDir = shared 
    ? join(projectRoot, 'src/components')
    : join(projectRoot, `src/features/${feature}/components`)
  
  const componentPath = join(componentDir, `${name}.tsx`)
  
  // Ensure directory exists
  await mkdir(dirname(componentPath), { recursive: true })
  
  // Generate component template
  const template = generateComponentTemplate(name, feature, shared)
  await writeFile(componentPath, template)
  
  console.log(`✅ Created component: ${relative(projectRoot, componentPath)}`)
  
  // Create test file if requested
  if (withTests) {
    const testPath = join(dirname(componentPath), `${name}.test.tsx`)
    const testTemplate = generateTestTemplate(name, feature, shared)
    await writeFile(testPath, testTemplate)
    console.log(`✅ Created test: ${relative(projectRoot, testPath)}`)
  }
  
  // Update index exports
  await updateFeatureIndex(feature, name, 'component')
  
  return componentPath
}

/**
 * Create a new feature with complete structure
 */
async function createFeature(featureName) {
  const featureDir = join(projectRoot, `src/features/${featureName}`)
  
  const directories = [
    join(featureDir, 'components'),
    join(featureDir, 'hooks'),
    join(featureDir, 'types')
  ]
  
  // Create directory structure
  for (const dir of directories) {
    await mkdir(dir, { recursive: true })
  }
  
  // Create index.ts
  const indexContent = generateFeatureIndexTemplate(featureName)
  await writeFile(join(featureDir, 'index.ts'), indexContent)
  
  // Create initial hook
  const hookContent = generateHookTemplate(featureName)
  await writeFile(join(featureDir, 'hooks', `use${featureName}.ts`), hookContent)
  
  // Create types file
  const typesContent = generateTypesTemplate(featureName)
  await writeFile(join(featureDir, 'types', 'index.ts'), typesContent)
  
  console.log(`✅ Created feature structure for: ${featureName}`)
  console.log(`📁 Created directories: components, hooks, types`)
  
  return featureDir
}

/**
 * Create a TanStack Query hook with proper patterns
 */
async function createHook(name, feature, entity) {
  const hookDir = join(projectRoot, `src/features/${feature}/hooks`)
  const hookPath = join(hookDir, `${name}.ts`)
  
  await mkdir(hookDir, { recursive: true })
  
  const template = generateQueryHookTemplate(name, feature, entity)
  await writeFile(hookPath, template)
  
  console.log(`✅ Created hook: ${relative(projectRoot, hookPath)}`)
  
  // Update feature index
  await updateFeatureIndex(feature, name, 'hook')
  
  return hookPath
}

/**
 * Create a Zustand store with type safety
 */
async function createStore(name, options = {}) {
  const { withPersist = true, withDevtools = true } = options
  const storeDir = join(projectRoot, 'src/stores')
  const storePath = join(storeDir, `${name}Store.ts`)
  
  await mkdir(storeDir, { recursive: true })
  
  const template = generateStoreTemplate(name, withPersist, withDevtools)
  await writeFile(storePath, template)
  
  console.log(`✅ Created store: ${relative(projectRoot, storePath)}`)
  
  return storePath
}

/**
 * Analyze codebase health
 */
async function analyzeCodebase() {
  console.log('🔍 Analyzing CRM codebase health...\n')
  
  const checks = [
    { name: 'Architecture Validation', command: 'npm run validate:architecture' },
    { name: 'Performance Analysis', command: 'npm run optimize:performance' },
    { name: 'TypeScript Check', command: 'npm run type-check' }
  ]
  
  const results = []
  
  for (const check of checks) {
    try {
      console.log(`Running ${check.name}...`)
      const { stdout } = await execAsync(check.command)
      results.push({
        name: check.name,
        status: 'passed',
        output: stdout
      })
      console.log(`✅ ${check.name} passed`)
    } catch (error) {
      results.push({
        name: check.name,
        status: 'failed',
        output: error.stdout || error.message
      })
      console.log(`❌ ${check.name} failed`)
    }
  }
  
  // Generate health report
  const healthScore = Math.round((results.filter(r => r.status === 'passed').length / results.length) * 100)
  
  console.log(`\n📊 Codebase Health Score: ${healthScore}%`)
  
  if (healthScore >= 80) {
    console.log('🎉 Codebase health is excellent!')
  } else if (healthScore >= 60) {
    console.log('⚠️ Codebase health needs improvement')
  } else {
    console.log('🚨 Codebase health requires immediate attention')
  }
  
  return results
}

/**
 * Auto-fix common issues
 */
async function autoFix() {
  console.log('🔧 Running auto-fixes...\n')
  
  const fixes = []
  
  try {
    // Fix formatting
    console.log('Fixing code formatting...')
    await execAsync('npm run format')
    fixes.push('Code formatting')
  } catch (error) {
    console.log('⚠️ Could not fix formatting:', error.message)
  }
  
  try {
    // Fix linting issues (auto-fixable only)
    console.log('Fixing linting issues...')
    await execAsync('npx eslint . --fix --ext ts,tsx')
    fixes.push('ESLint auto-fixes')
  } catch (error) {
    console.log('⚠️ Some linting issues require manual attention')
  }
  
  console.log(`\n✅ Applied ${fixes.length} auto-fixes:`)
  fixes.forEach(fix => console.log(`  • ${fix}`))
  
  return fixes
}

/**
 * Update feature index exports
 */
async function updateFeatureIndex(feature, name, type) {
  if (!feature || feature === 'shared') return
  
  const indexPath = join(projectRoot, `src/features/${feature}/index.ts`)
  
  try {
    let content = await readFile(indexPath, 'utf8')
    
    const exportLine = type === 'component' 
      ? `export { ${name} } from './components/${name}'`
      : `export { ${name} } from './hooks/${name}'`
    
    // Add export if not already present
    if (!content.includes(exportLine)) {
      const sectionComment = type === 'component' ? '// Components' : '// Hooks'
      
      if (content.includes(sectionComment)) {
        content = content.replace(sectionComment, `${sectionComment}\n${exportLine}`)
      } else {
        content += `\n\n${sectionComment}\n${exportLine}`
      }
      
      await writeFile(indexPath, content)
      console.log(`✅ Updated ${feature} index exports`)
    }
  } catch (error) {
    console.log(`⚠️ Could not update index exports: ${error.message}`)
  }
}

/**
 * Template generators
 */
function generateComponentTemplate(name, feature, shared) {
  const imports = shared 
    ? `import React from 'react'\nimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'`
    : `import React from 'react'\nimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'`
  
  return `${imports}

interface ${name}Props {
  // Define your props here
  className?: string
}

export function ${name}({ className, ...props }: ${name}Props) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>${name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component implementation */}
        <p>This is the ${name} component.</p>
      </CardContent>
    </Card>
  )
}
`
}

function generateTestTemplate(name, feature, shared) {
  return `import { render, screen } from '@testing-library/react'
import { ${name} } from './${name}'

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />)
    expect(screen.getByText('${name}')).toBeInTheDocument()
  })

  // Add more tests as needed
})
`
}

function generateFeatureIndexTemplate(featureName) {
  return `// ${featureName} Feature - Main Exports

// Components
// (Components will be added here)

// Hooks
export { use${featureName} } from './hooks/use${featureName}'

// Types
export type * from './types'
`
}

function generateHookTemplate(featureName) {
  const entity = featureName.toLowerCase()
  return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Query key factory
export const ${entity}Keys = {
  all: ['${entity}s'] as const,
  lists: () => [...${entity}Keys.all, 'list'] as const,
  list: (filters?: any) => [...${entity}Keys.lists(), { filters }] as const,
  details: () => [...${entity}Keys.all, 'detail'] as const,
  detail: (id: string) => [...${entity}Keys.details(), id] as const,
}

// Hook to fetch all ${entity}s
export function use${featureName}s(filters?: any) {
  return useQuery({
    queryKey: ${entity}Keys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('${entity}s')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.search) {
        query = query.ilike('name', \`%\${filters.search}%\`)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch single ${entity}
export function use${featureName}(id: string) {
  return useQuery({
    queryKey: ${entity}Keys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('${entity}s')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to create a new ${entity}
export function useCreate${featureName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (${entity}Data: any) => {
      const { data, error } = await supabase
        .from('${entity}s')
        .insert(${entity}Data)
        .select('*')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${entity}Keys.lists() })
    },
  })
}
`
}

function generateTypesTemplate(featureName) {
  const entity = featureName.toLowerCase()
  return `// ${featureName} Feature Types

export interface ${featureName}Base {
  id: string
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ${featureName}Insert {
  name: string
  // Add other required fields
}

export interface ${featureName}Update {
  name?: string
  // Add other updatable fields
}

export interface ${featureName}Filters {
  search?: string
  // Add other filter fields
}

// Export the main type
export type ${featureName} = ${featureName}Base
`
}

function generateStoreTemplate(name, withPersist, withDevtools) {
  const imports = []
  if (withPersist || withDevtools) {
    imports.push("import { create } from 'zustand'")
    const middleware = []
    if (withPersist) middleware.push('persist')
    if (withDevtools) middleware.push('devtools')
    imports.push(`import { ${middleware.join(', ')} } from 'zustand/middleware'`)
  } else {
    imports.push("import { create } from 'zustand'")
  }
  
  imports.push(`import { BaseClientState, validateClientState } from '@/lib/state-type-safety'`)

  const middlewareWrapper = []
  if (withDevtools) middlewareWrapper.push('devtools(')
  if (withPersist) middlewareWrapper.push('persist(')
  
  const middlewareCloser = []
  if (withPersist) {
    middlewareCloser.push(`, {
    name: '${name.toLowerCase()}-store',
    partialize: (state) => ({
      // Only persist UI preferences
      preferences: state.preferences
    })
  })`)
  }
  if (withDevtools) {
    middlewareCloser.push(`, { name: '${name.toLowerCase()}-store' })`)
  }

  return `${imports.join('\n')}

export interface ${name}State extends BaseClientState {
  // Client-side UI state only
  selectedItemId: string | null
  isFormOpen: boolean
  searchQuery: string
  
  // Actions
  actions: BaseClientState['actions'] & {
    setSelectedItemId: (id: string | null) => void
    setFormOpen: (open: boolean) => void
    setSearchQuery: (query: string) => void
    reset: () => void
  }
}

const initialState: Omit<${name}State, 'actions'> = {
  selectedItemId: null,
  isFormOpen: false,
  searchQuery: '',
  preferences: {
    autoRefresh: true
  }
}

export const use${name}Store = create<${name}State>()(
  ${middlewareWrapper.join('')}((set) => ({
    ...initialState,
    
    actions: {
      setSelectedItemId: (id: string | null) => {
        set({ selectedItemId: id })
      },
      
      setFormOpen: (open: boolean) => {
        set({ isFormOpen: open })
      },
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },
      
      updatePreferences: (preferences: Partial<${name}State['preferences']>) => {
        if (process.env.NODE_ENV === 'development') {
          validateClientState(preferences, '${name.toLowerCase()}-store')
        }
        set(state => ({ 
          preferences: { ...state.preferences, ...preferences } 
        }))
      },
      
      reset: () => {
        set(initialState)
        if (process.env.NODE_ENV === 'development') {
          validateClientState(initialState, '${name.toLowerCase()}-store')
        }
      }
    }
  }))${middlewareCloser.join('')}
)

// Convenience hooks
export const use${name}Selection = () => {
  const store = use${name}Store()
  return {
    selectedItemId: store.selectedItemId,
    setSelectedItemId: store.actions.setSelectedItemId
  }
}

export const use${name}Form = () => {
  const store = use${name}Store()
  return {
    isFormOpen: store.isFormOpen,
    setFormOpen: store.actions.setFormOpen
  }
}
`
}

/**
 * Command line interface
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (!command || command === 'help') {
    console.log('🛠️ CRM Developer Assistant\n')
    console.log('Available commands:')
    Object.entries(COMMANDS).forEach(([cmd, desc]) => {
      console.log(`  ${cmd.padEnd(20)} ${desc}`)
    })
    console.log('\nExamples:')
    console.log('  node dev-assistant.js create-component UserCard contacts')
    console.log('  node dev-assistant.js create-feature notifications')
    console.log('  node dev-assistant.js create-hook useNotifications notifications notification')
    console.log('  node dev-assistant.js analyze')
    return
  }
  
  switch (command) {
    case 'create-component':
      const [componentName, feature] = args.slice(1)
      if (!componentName) {
        console.error('❌ Component name is required')
        return
      }
      await createComponent(componentName, feature)
      break
      
    case 'create-feature':
      const [featureName] = args.slice(1)
      if (!featureName) {
        console.error('❌ Feature name is required')
        return
      }
      await createFeature(featureName)
      break
      
    case 'create-hook':
      const [hookName, hookFeature, entity] = args.slice(1)
      if (!hookName || !hookFeature) {
        console.error('❌ Hook name and feature are required')
        return
      }
      await createHook(hookName, hookFeature, entity)
      break
      
    case 'create-store':
      const [storeName] = args.slice(1)
      if (!storeName) {
        console.error('❌ Store name is required')
        return
      }
      await createStore(storeName)
      break
      
    case 'analyze':
      await analyzeCodebase()
      break
      
    case 'validate':
      console.log('🔍 Running validation checks...')
      await execAsync('npm run lint:architecture')
      break
      
    case 'fix':
      await autoFix()
      break
      
    default:
      console.error(`❌ Unknown command: ${command}`)
      console.log('Run "node dev-assistant.js help" for available commands')
  }
}

if (process.argv[1] === __filename) {
  main().catch(error => {
    console.error('❌ Error:', error.message)
    process.exit(1)
  })
}

export { createComponent, createFeature, createHook, createStore, analyzeCodebase }