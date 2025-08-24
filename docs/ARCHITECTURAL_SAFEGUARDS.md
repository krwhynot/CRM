# Architectural Safeguards Documentation

## Overview

This document outlines the comprehensive architectural safeguards implemented to maintain code quality, enforce design patterns, and prevent architectural violations in the CRM system.

## 🛡️ Implemented Safeguards

### 1. ESLint Architecture Rules

**File**: `.eslintrc.cjs`

#### State Management Enforcement
```javascript
// Prevents direct Supabase client imports in components
'no-restricted-imports': {
  paths: [{
    name: '@supabase/supabase-js',
    importNames: ['createClient'],
    message: 'Use feature-specific hooks instead of direct Supabase calls'
  }]
}
```

#### Import Pattern Validation
```javascript
// Prevents imports from old specialized entity select paths
patterns: [{
  group: ['@/components/forms/entity-select/specialized/*'],
  message: 'Import specialized entity selects from feature directories'
}]
```

#### Server Data Detection
```javascript
// Detects server data patterns in client state
'no-restricted-syntax': [{
  selector: "VariableDeclarator[id.name=/.*Store$/] Property[key.name=/^(data|isLoading|error|refetch)$/]",
  message: 'Server data properties should not be stored in Zustand stores'
}]
```

### 2. Custom ESLint Plugin

**File**: `eslint-plugins/crm-architecture.js`

#### State Boundary Validation
- **no-server-data-in-stores**: Prevents server data fields (`id`, `created_at`, etc.) in Zustand stores
- **enforce-feature-imports**: Validates proper feature-based import patterns  
- **validate-client-state**: Ensures client state stores only contain UI state and IDs

#### Cross-Feature Import Detection
```javascript
// Warns about cross-feature component imports
if (currentFeature && importedFeature && currentFeature !== importedFeature) {
  // Suggest moving to shared components or using feature hooks
}
```

### 3. Architecture Validation Script

**File**: `scripts/validate-architecture.js`

#### Component Organization
- ✅ Validates feature-specific components are in correct directories
- ✅ Ensures shared components don't contain business logic
- ✅ Checks for proper component placement

#### Import Pattern Analysis
- ✅ Detects deep relative imports (suggests path aliases)
- ✅ Identifies cross-feature component imports
- ✅ Validates proper use of index exports

#### State Management Validation
- ✅ Scans Zustand stores for server data violations
- ✅ Checks hooks for proper TanStack Query usage
- ✅ Validates client-server state separation

#### Naming Convention Enforcement
- ✅ Components: PascalCase.tsx (except shadcn/ui kebab-case)
- ✅ Hooks: useCamelCase.ts
- ✅ Types: camelCase.types.ts
- ✅ Tests: PascalCase.test.ts

#### File Size Monitoring
- Components: 25KB limit (~800 lines)
- Hooks: 20KB limit (~600 lines)  
- Utilities: 15KB limit (~450 lines)
- Types: 50KB limit (~1500 lines, for generated types)

### 4. TypeScript Architectural Constraints

**File**: `tsconfig.architectural.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 5. Comprehensive Linting Script

**File**: `scripts/lint-architecture.sh`

Provides a complete architectural health check:

1. **TypeScript Compilation**: Ensures type safety
2. **ESLint Architecture Rules**: Validates import patterns and restrictions  
3. **Custom Architecture Validation**: Runs component organization checks
4. **State Management Validation**: Verifies client-server boundaries
5. **Import Pattern Analysis**: Checks for legacy patterns
6. **Component Organization Check**: Validates proper placement

## 🚀 Usage

### Daily Development
```bash
# Quick architecture check
npm run lint:architecture

# Detailed validation
npm run validate:architecture

# Type safety check
npm run type-check

# Full validation (includes build)
npm run validate
```

### CI/CD Integration
```bash
# Add to your pipeline
npm run lint:architecture || exit 1
```

## 📋 Architecture Rules Summary

### ✅ Enforced Patterns

1. **State Separation**
   - Zustand stores: Only UI state, preferences, and IDs
   - TanStack Query: All server data and API operations
   - No server objects in client state

2. **Component Organization**  
   - Feature components: `/src/features/{feature}/components/`
   - Shared components: `/src/components/` (generic only)
   - No cross-feature component imports

3. **Import Patterns**
   - Use path aliases (`@/`) instead of relative imports
   - Import specialized selects from feature directories
   - No direct Supabase client imports in components

4. **Naming Conventions**
   - Components: PascalCase (except shadcn/ui)
   - Hooks: useCamelCase  
   - Types: camelCase.types
   - Tests: PascalCase.test

### ⚠️ Prevented Anti-Patterns

1. **❌ Server Data in Client State**
   ```typescript
   // WRONG - Server object in Zustand store
   interface BadStore {
     selectedContact: ContactWithOrganization // ❌
   }
   
   // CORRECT - Only ID in Zustand store  
   interface GoodStore {
     selectedContactId: string | null // ✅
   }
   ```

2. **❌ Cross-Feature Component Imports**
   ```typescript
   // WRONG - Importing from another feature
   import { OrganizationCard } from '@/features/organizations/components/OrganizationCard' // ❌
   
   // CORRECT - Use feature's index export or move to shared
   import { OrganizationCard } from '@/features/organizations' // ✅
   ```

3. **❌ Direct Database Operations**
   ```typescript
   // WRONG - Direct Supabase in component
   import { createClient } from '@supabase/supabase-js' // ❌
   
   // CORRECT - Use feature hooks
   import { useContacts } from '@/features/contacts/hooks/useContacts' // ✅
   ```

## 🎯 Benefits

1. **Consistency**: Enforced patterns across the entire codebase
2. **Maintainability**: Clear boundaries between features and concerns
3. **Performance**: Prevents common anti-patterns that hurt performance
4. **Developer Experience**: Clear rules with helpful error messages
5. **Scalability**: Architecture that scales with team size and complexity

## 📊 Metrics

The architectural validation provides:
- **Architecture Score**: Overall health percentage
- **Component Organization**: Feature vs shared component distribution
- **Violation Detection**: Specific issues with suggestions
- **File Size Monitoring**: Identifies components that may need refactoring

Current benchmark: **90% architecture score** ✅

## 🔧 Customization

To modify architectural rules:

1. **ESLint rules**: Edit `.eslintrc.cjs` 
2. **Custom validations**: Modify `eslint-plugins/crm-architecture.js`
3. **Architecture patterns**: Update `scripts/validate-architecture.js`
4. **TypeScript constraints**: Adjust `tsconfig.architectural.json`

## 🚨 Troubleshooting

### Common Issues

1. **"Server data in client state"**: Move server objects to TanStack Query hooks
2. **"Cross-feature imports"**: Use shared components or feature index exports
3. **"Legacy import patterns"**: Update to use new feature-based imports
4. **"Component misplacement"**: Move feature-specific components to feature directories

### Getting Help

- Run `npm run lint:architecture` for detailed error messages
- Check this documentation for pattern examples
- Review `/docs/TYPE_SAFETY_GUIDE.md` for state management patterns

---

*This document is automatically maintained. Last updated with architectural refactoring completion.*