# CRM Architecture Guidelines

This document establishes the architectural standards and guidelines for the KitchenPantry CRM system, capturing the comprehensive directory reorganization and optimization work completed.

## 🏗️ Directory Organization Principles

### 1. Feature-Based Architecture
- **Principle**: Organize code by business feature, not by technical layer
- **Structure**: Each feature contains its own components, hooks, types, and logic
- **Benefits**: Better maintainability, clear ownership, easier testing

```
src/features/
├── organizations/     # Organization management feature
├── contacts/         # Contact management feature
├── opportunities/    # Sales opportunity tracking
├── products/         # Product catalog
├── interactions/     # Communication tracking
├── dashboard/        # Analytics and metrics
├── auth/            # Authentication flows
├── import-export/   # Data migration
└── monitoring/      # System health
```

### 2. Shared Components Strategy
- **Location**: `/src/components/` for truly generic, reusable components
- **Criteria**: Component must be used by 3+ features OR be foundational UI
- **Examples**: `CommandPalette`, `ChartCard`, `QuickActions`, `ErrorBoundary`

### 3. Barrel Export System
- **Purpose**: Simplify imports and create logical API surfaces
- **Pattern**: Every directory with multiple exports must have an `index.ts`
- **Organization**: Group exports by functionality with clear comments

## 📦 Import Organization Standards

### 1. Import Hierarchy (in order)
```typescript
// 1. React and external libraries
import React from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal UI components and utilities
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib'

// 3. Feature-specific imports (same feature)
import { useOpportunityForm } from '../hooks/useOpportunityForm'

// 4. Cross-feature imports (different features)
import { useOrganizations } from '@/features/organizations'

// 5. Type imports (separate section)
import type { Opportunity, Contact } from '@/types'
```

### 2. Preferred Import Patterns
```typescript
// ✅ GOOD: Use barrel exports for cleaner imports
import { ChartCard, ErrorBoundary, CommandPalette } from '@/components'
import { useCoreFormSetup, useDebounce, useMobile } from '@/hooks'
import { supabase, dateUtils, formUtils } from '@/lib'

// ❌ AVOID: Long individual import paths
import { ChartCard } from '@/components/shared/charts/chart-card'
import { useCoreFormSetup } from '@/hooks/useCoreFormSetup'
import { useDebounce } from '@/hooks/useDebounce'
```

### 3. Cross-Feature Import Guidelines
- **Rule**: Cross-feature imports should be explicit and intentional
- **Pattern**: Always use the feature's main barrel export
- **Example**: `import { OrganizationForm } from '@/features/organizations'`

## 🗂️ File Naming and Organization

### 1. File Naming Standards
- **Components**: PascalCase (e.g., `OpportunityForm.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useOpportunityForm.ts`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Types**: camelCase with ".types" suffix (e.g., `opportunity.types.ts`)

### 2. Directory Structure Standards
```
feature/
├── components/           # Feature UI components
│   ├── index.ts         # Barrel export (required)
│   ├── FeatureForm.tsx  # Main components
│   ├── FeatureTable.tsx
│   └── sub-feature/     # Complex sub-components
│       ├── index.ts     # Sub-feature barrel export
│       └── Component.tsx
├── hooks/               # Feature business logic
│   ├── index.ts         # Hook barrel export
│   └── useFeature*.ts   # Individual hooks
├── types/               # Feature-specific types
└── index.ts            # Feature main export
```

### 3. Index File Organization
```typescript
// Feature index.ts structure
// Main Components - Most commonly used
export { FeatureForm } from './components/FeatureForm'
export { FeatureTable } from './components/FeatureTable'

// Sub-components - Organized by logical groups
export * from './components/sub-feature'

// Hooks - Business logic
export { useFeature } from './hooks/useFeature'
export { useFeatureActions } from './hooks/useFeatureActions'

// Types - For external consumption
export type { FeatureData, FeatureFormData } from './types'
```

## 🏛️ Architecture Patterns

### 1. Component Organization Patterns
- **Simple Components**: Direct in feature/components/
- **Complex Components**: Sub-directory with barrel export
- **Shared Sub-components**: Use barrel exports for clean imports

### 2. Hook Organization Patterns
- **Data Hooks**: `useFeatureData`, `useFeatureQuery`
- **Form Hooks**: `useFeatureForm`, `useFeatureValidation`
- **Action Hooks**: `useFeatureActions`, `useFeatureSubmission`
- **State Hooks**: `useFeatureState`, `useFeatureFiltering`

### 3. Type Organization Patterns
- **Entity Types**: `/src/types/entities.ts`
- **Form Types**: `/src/types/forms/` with barrel export
- **Feature Types**: Within feature directory
- **Database Types**: `/src/types/database.types.ts`

## 🚀 Development Workflow

### 1. Adding New Features
```bash
# 1. Create feature directory structure
mkdir -p src/features/new-feature/{components,hooks,types}

# 2. Create index files
touch src/features/new-feature/index.ts
touch src/features/new-feature/components/index.ts
touch src/features/new-feature/hooks/index.ts

# 3. Implement components with proper imports
# 4. Create barrel exports
# 5. Update feature main index
```

### 2. Adding New Components
```typescript
// 1. Create component in appropriate directory
// 2. Add to local index.ts barrel export
// 3. Use from parent via barrel import
import { NewComponent } from './components'
```

### 3. Refactoring Guidelines
- **Move Components**: Update all imports and barrel exports
- **Rename Components**: Use IDE refactoring to update all references
- **Split Components**: Create sub-directory with barrel export
- **Consolidate**: Remove old exports and update imports

## 📋 Quality Standards

### 1. Import Quality Checks
- No import paths longer than 3 segments (use barrel exports)
- No duplicate imports from same feature
- Consistent import grouping and ordering
- Type imports separated from value imports

### 2. Barrel Export Quality
- Every multi-file directory has index.ts
- Exports grouped logically with comments
- Re-exports used appropriately for convenience
- No circular dependencies in exports

### 3. Architecture Compliance
- Components in correct feature directory
- Shared components truly generic
- Cross-feature dependencies documented
- Consistent naming conventions

## 🔍 Architecture Review Checklist

### Before Merging Code
- [ ] Components placed in correct feature directory
- [ ] Barrel exports updated for new components
- [ ] Import paths use barrel exports where possible
- [ ] File naming follows conventions
- [ ] Cross-feature imports are intentional
- [ ] Index files properly organized
- [ ] No circular dependencies
- [ ] TypeScript compilation successful

### Periodic Architecture Review
- [ ] Directory structure follows feature-based organization
- [ ] Shared components are truly reusable
- [ ] Import patterns consistent across codebase
- [ ] Barrel exports comprehensive and well-organized
- [ ] Documentation reflects current structure
- [ ] No architectural debt accumulation

## 📚 Examples and Templates

### Feature Template
See `/src/features/opportunities/` for a complete example of:
- Complex component organization with sub-directories
- Comprehensive hook organization
- Proper barrel exports at all levels
- Cross-feature integration patterns

### Component Template
See `/src/components/` for examples of:
- Shared component organization
- Comprehensive barrel exports
- Error boundary patterns
- Form system organization

---

## 🎯 Architecture Benefits Achieved

### Developer Experience
- **Reduced Import Complexity**: Clean barrel exports eliminate long import paths
- **Logical Organization**: Feature-based structure matches mental models
- **Consistent Patterns**: Standardized approaches across all features
- **Easy Navigation**: Predictable file locations and naming

### Maintainability
- **Clear Ownership**: Each feature contains its complete implementation
- **Modular Design**: Components can be moved/refactored independently
- **Scalable Structure**: Easy to add new features following established patterns
- **Reduced Coupling**: Barrel exports create clean API boundaries

### Code Quality
- **Import Hygiene**: Standardized import patterns and organization
- **Architectural Consistency**: All features follow same organizational principles
- **Future-Proof**: Structure supports continued growth and evolution
- **Documentation Alignment**: Architecture matches documented patterns

---

*This document reflects the comprehensive architecture optimization completed for the CRM system and should be referenced for all future development work.*