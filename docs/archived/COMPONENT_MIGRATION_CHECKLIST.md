# Component Migration Checklist

Use this checklist when moving components between shared and feature directories, or when restructuring component organization.

## Pre-Migration Analysis

### ✅ **Step 1: Analyze Component Usage**
- [ ] Run component usage analysis: `node scripts/analyze-component-usage.js`
- [ ] Identify which features use the component
- [ ] Check if component is used in pages directory
- [ ] Determine if component contains business logic
- [ ] Verify component dependencies (what it imports)

### ✅ **Step 2: Decision Framework**
- [ ] **Single Feature Usage**: Component used by only one feature → Move to feature directory
- [ ] **Multi-Feature Usage**: Component used by 2+ features → Keep in/move to shared
- [ ] **Business Logic**: Component contains domain-specific logic → Move to feature directory
- [ ] **UI Primitive**: Generic UI component → Keep in shared components
- [ ] **Page-Level Usage**: Component used directly in pages → Consider shared placement

### ✅ **Step 3: Plan Migration Path**
- [ ] Determine source directory: `/src/components/` or `/src/features/*/components/`
- [ ] Determine target directory based on usage analysis
- [ ] Check for naming conflicts in target directory
- [ ] Plan any necessary file renaming (PascalCase convention)

## Migration Execution

### ✅ **Step 4: Backup and Safety**
- [ ] Create git branch for migration: `git checkout -b migrate-component-[component-name]`
- [ ] Run tests before migration: `npm test`
- [ ] Run type check before migration: `npm run type-check`
- [ ] Take note of current component location for rollback

### ✅ **Step 5: Move Component File**
- [ ] Move component file to target directory
- [ ] Rename file to PascalCase if needed (e.g., `component-name.tsx` → `ComponentName.tsx`)
- [ ] Move any associated files (tests, styles, sub-components)

```bash
# Example commands
mv src/components/ComponentName.tsx src/features/feature-name/components/ComponentName.tsx
mv src/components/ComponentName.test.tsx src/features/feature-name/components/__tests__/ComponentName.test.tsx
```

### ✅ **Step 6: Update Imports**
- [ ] Find all files importing the component:
  ```bash
  grep -r --include="*.tsx" --include="*.ts" "ComponentName" src/
  ```
- [ ] Update import statements in all files
  
**From shared to feature:**
```typescript
// Before
import { ComponentName } from '@/components/ComponentName'
// After  
import { ComponentName } from '@/features/feature-name/components/ComponentName'
// Or relative (within same feature)
import { ComponentName } from './ComponentName'
```

**From feature to shared:**
```typescript
// Before
import { ComponentName } from './ComponentName'
// After
import { ComponentName } from '@/components/ComponentName'
```

### ✅ **Step 7: Update Index Files**

#### Remove from source index.ts:
- [ ] Remove export from `/src/components/index.ts` (if moving from shared)
- [ ] Remove export from `/src/features/*/components/index.ts` (if moving from feature)

#### Add to target index.ts:
- [ ] Add export to target `index.ts` file
- [ ] Verify export syntax matches file name

```typescript
// Add to index.ts
export { ComponentName } from './ComponentName'
```

### ✅ **Step 8: Update Documentation**
- [ ] Update any README files referencing the component
- [ ] Update component documentation with new location
- [ ] Update any architectural diagrams or guides

## Post-Migration Verification

### ✅ **Step 9: Technical Verification**
- [ ] Run TypeScript type check: `npm run type-check`
- [ ] Fix any import resolution errors
- [ ] Run linting: `npm run lint`
- [ ] Fix any linting errors related to imports
- [ ] Run build process: `npm run build`
- [ ] Verify build completes successfully

### ✅ **Step 10: Functional Testing**
- [ ] Run test suite: `npm test`
- [ ] Fix any broken tests
- [ ] Test component functionality in development: `npm run dev`
- [ ] Verify component renders correctly
- [ ] Test component interactions and props
- [ ] Check for console errors or warnings

### ✅ **Step 11: Integration Testing**
- [ ] Test all pages/features that use the component
- [ ] Verify no broken imports in browser dev tools
- [ ] Test component in different contexts (mobile/desktop)
- [ ] Verify component styling and behavior unchanged

## Quality Assurance

### ✅ **Step 12: Code Review Preparation**
- [ ] Run usage analysis again to verify correct placement
- [ ] Document migration reasoning in commit message
- [ ] Ensure all related files moved together
- [ ] Verify no dead code left behind

### ✅ **Step 13: Final Cleanup**
- [ ] Remove any unused import statements
- [ ] Clean up any empty directories
- [ ] Update any hard-coded references in comments
- [ ] Run final validation: `npm run validate`

### ✅ **Step 14: Documentation Update**
- [ ] Update component location in team documentation
- [ ] Add migration to changelog if significant
- [ ] Update any developer guides or onboarding docs

## Commit and Deploy

### ✅ **Step 15: Git Management**
- [ ] Stage all changes: `git add .`
- [ ] Write descriptive commit message:
  ```
  refactor: move ComponentName to appropriate feature directory
  
  - Move ComponentName from shared to features/feature-name/components/
  - Update all import statements across codebase  
  - Component used only by feature-name feature
  - Maintains all functionality and styling
  
  Breaking Change: Import path changed from @/components/ComponentName 
  to @/features/feature-name/components/ComponentName
  ```
- [ ] Commit changes: `git commit -m "..."`

### ✅ **Step 16: Team Communication**
- [ ] Notify team of import path changes
- [ ] Update any shared documentation
- [ ] Consider adding temporary re-export for gradual migration if needed

## Rollback Plan

### ✅ **If Migration Fails**
- [ ] Revert git changes: `git checkout main` or `git reset --hard HEAD~1`
- [ ] Restore original component location
- [ ] Run tests to verify rollback successful
- [ ] Document issues encountered for future attempts

## Common Pitfalls

### ⚠️ **Watch Out For:**
- [ ] **Circular Imports**: Ensure moved component doesn't create import cycles
- [ ] **Missing Sub-Components**: Move all related files together
- [ ] **Test Files**: Update test imports and move test files
- [ ] **Type Imports**: Update TypeScript type imports
- [ ] **Dynamic Imports**: Check for any lazy/dynamic imports
- [ ] **Build Tool Cache**: Clear build cache if imports seem cached

### 🔧 **Tools That Help:**
- [ ] Use VS Code "Find and Replace in Files" for bulk import updates
- [ ] Use TypeScript compiler to find missing imports
- [ ] Use component usage analysis script to verify placement
- [ ] Use ESLint to catch import violations

## Post-Migration Best Practices

### ✅ **Going Forward**
- [ ] Update team guidelines with migration learnings
- [ ] Consider adding automated checks to prevent misplacement
- [ ] Document component placement decisions for future reference
- [ ] Use migration checklist for all future component moves

---

## Quick Reference Commands

```bash
# Find component usage
grep -r --include="*.tsx" --include="*.ts" "ComponentName" src/

# Run analysis
node scripts/analyze-component-usage.js

# Validation commands
npm run type-check
npm run lint  
npm run build
npm test
npm run validate

# Git workflow
git checkout -b migrate-component-name
git add .
git commit -m "refactor: move component to appropriate directory"
```

---

*This checklist should be updated based on team feedback and migration experiences*