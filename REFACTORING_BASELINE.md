# CRM Architecture Refactoring Baseline

## Pre-Refactoring Measurements (September 10, 2025)

### Bundle Size Baseline
- **Total Bundle Size**: 3.6MB
- **Largest Components**:
  - `vendor-Bu7vW2en.js`: 313.86 kB (96.50 kB gzipped)
  - `StyleGuide-DzjEti9E.js`: 332.30 kB (46.25 kB gzipped)
  - `ImportExport--Yq0cxkV.js`: 320.95 kB (71.04 kB gzipped)
  - `index-CMha2ZpL.js`: 281.09 kB (74.42 kB gzipped)

### Large Table Components Identified
1. **OpportunitiesTable.tsx**: 571 lines
2. **OrganizationsTable.tsx**: 746 lines  
3. **ContactsTable.tsx**: 664 lines
4. **ProductsTable.tsx**: 535 lines

**Total**: ~2,500 lines of table-related code to refactor

### Technical Debt Identified
- Duplicated selection logic across all 4 table components
- Repeated bulk delete operations (~100 lines each)
- Expandable content rendering embedded in each component
- Mobile responsiveness logic duplicated
- Column definitions are massive (100+ lines each)
- Filter logic is component-specific rather than shared

### Success Targets
- **Bundle Size**: Reduce by 15-20% (target: <3.0MB)
- **Component Size**: No file exceeds 200 lines
- **Code Duplication**: Reduce table-related duplication by 60%
- **Maintainability**: Shared hooks for common table patterns

### Refactoring Branch
- Branch: `feature/architecture-refactor`
- Backup Tag: `pre-refactor-v1.0`