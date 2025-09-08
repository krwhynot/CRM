# Component Naming Conventions

## Current State Analysis

The codebase currently has mixed naming conventions:

### Existing Patterns
- **PascalCase**: `CommandPalette.tsx`, `StatsCards.tsx`, `ActivityFeed.tsx`
- **kebab-case**: `dashboard-header.tsx`, `radio-group.tsx`, `alert-dialog.tsx`

## Recommended Standard

### **Choose PascalCase for All React Components**

**Rationale:**
1. **React Community Standard**: Most React projects use PascalCase for component files
2. **Matches Component Names**: File name matches the exported component name
3. **Better IDE Support**: Most React tooling expects PascalCase
4. **Consistency with JSX**: `<ComponentName>` matches `ComponentName.tsx`

### **File Naming Rules**

#### ✅ **DO** - Use PascalCase
```
CommandPalette.tsx
DashboardHeader.tsx
UserProfile.tsx
ContactForm.tsx
OrganizationTable.tsx
```

#### ❌ **DON'T** - Use kebab-case for components
```
command-palette.tsx
dashboard-header.tsx
user-profile.tsx
```

#### ✅ **EXCEPTION** - Keep kebab-case for non-component files
```
utils.ts
api-client.ts
database.types.ts
form-validation.ts
```

## Migration Strategy

### Phase 1: Document Current State
- [x] Identify all files with inconsistent naming
- [x] Create migration priority list

### Phase 2: Gradual Migration (Recommended)
1. **New components**: Use PascalCase
2. **When modifying existing**: Rename to PascalCase
3. **Batch renames**: Group related components together

### Phase 3: Update Tooling
- Add ESLint rules to enforce naming
- Update import patterns
- Document exceptions

## Files to Rename (Priority Order)

### High Priority (Frequently Modified)
```bash
src/features/dashboard/components/dashboard-header.tsx → DashboardHeader.tsx
src/features/dashboard/components/dashboard.tsx → Dashboard.tsx
src/features/dashboard/components/dashboard-with-activity-feed.tsx → DashboardWithActivityFeed.tsx
src/features/dashboard/components/recent-activity.tsx → RecentActivity.tsx
```

### Medium Priority (UI Components)
```bash
src/components/ui/alert-dialog.tsx → AlertDialog.tsx
src/components/ui/dropdown-menu.tsx → DropdownMenu.tsx
src/components/ui/radio-group.tsx → RadioGroup.tsx
src/components/ui/scroll-area.tsx → ScrollArea.tsx
```

### Low Priority (Stable Components)
```bash
# Keep existing names until next major refactor
src/components/ui/loading-spinner.tsx
src/components/ui/priority-indicator.tsx
src/components/ui/status-indicator.tsx
```

## Implementation Checklist

When renaming a component:

- [ ] Rename the file to PascalCase
- [ ] Update all imports in other files
- [ ] Update export statements in index.ts files
- [ ] Update any documentation references
- [ ] Run type checking to verify all imports work
- [ ] Test the component still renders correctly

## ESLint Rule Recommendation

Add to `.eslintrc.js`:

```javascript
{
  "rules": {
    "filenames/match-exported": [2, "pascal"],
    // For component files specifically
    "react/jsx-filename-extension": [
      1,
      {
        "extensions": [".tsx"],
        "allow": "as-needed"
      }
    ]
  }
}
```

## IDE Configuration

### VS Code Settings
```json
{
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.tsx": "typescriptreact"
  }
}
```

## Examples

### Before (Inconsistent)
```typescript
// Mixed naming makes imports confusing
import { DashboardHeader } from './dashboard-header'  // kebab-case file
import { StatsCards } from './StatsCards'             // PascalCase file
import { CommandPalette } from './CommandPalette'     // PascalCase file
```

### After (Consistent)
```typescript
// All components use consistent PascalCase
import { DashboardHeader } from './DashboardHeader'
import { StatsCards } from './StatsCards'
import { CommandPalette } from './CommandPalette'
```

## Benefits

1. **Consistency**: All React components follow the same pattern
2. **Developer Experience**: Predictable file names
3. **Tooling Support**: Better IDE autocomplete and refactoring
4. **Community Standards**: Follows React ecosystem conventions
5. **Reduced Cognitive Load**: One naming pattern to remember

## Migration Timeline

- **Immediate**: Apply to all new components
- **Sprint 1**: Rename high-priority dashboard components
- **Sprint 2**: Rename UI components in `/components/ui/`
- **Sprint 3**: Add ESLint rules and complete remaining renames

---

*This document should be updated as the migration progresses*