# Design Token System Overhaul Requirements

## Overview

Complete overhaul of the design token system to resolve 6 critical issues causing runtime failures and architectural inconsistencies. This is a breaking change approach that will create a clean, robust 2-layer token architecture with proper OKLCH→HSL conversion pipeline.

## Problem Statement

The current design token system has critical architectural flaws:

1. **Circular Dependencies**: Semantic spacing tokens reference themselves, causing layout failures
2. **Missing Theme Provider**: Theme switching doesn't work without proper DOM class management
3. **Format Inconsistencies**: OKLCH vs HSL conflicts between layers
4. **Type Mismatches**: TypeScript definitions don't match actual CSS implementation
5. **Missing Fallbacks**: CSS variables lack fallback values, causing potential white screens
6. **Redundant Definitions**: Chart colors defined in 4+ locations with different values

## Goals

- **Immediate**: Fix all blocking runtime failures (circular dependencies, missing fallbacks)
- **Architectural**: Standardize on clean 2-layer architecture aligned with implementation
- **Performance**: Maintain OKLCH color accuracy with efficient HSL conversion
- **Developer Experience**: Clear error messages, TypeScript autocompletion, fail-fast validation

## Requirements

### 1. Architecture Standardization

**2-Layer Token System**:
- **Layer 1: Primitives** (`/src/styles/tokens/primitives.css`) - MFB brand colors in OKLCH + spacing/typography
- **Layer 2: Semantic** (`/src/styles/tokens/semantic.css`) - shadcn/ui mappings + CRM-specific tokens

**Documentation Alignment**:
- Update all documentation to reflect 2-layer reality (not 4-layer)
- Remove references to missing Component/Feature layers
- Simplify TypeScript definitions to match actual implementation

### 2. Color Format Pipeline

**OKLCH with HSL Fallbacks**:
- **Primitives**: OKLCH format for color accuracy and future-proofing
- **HSL Conversion**: Automatic conversion to HSL for shadcn/ui compatibility
- **Format Consistency**: No mixed OKLCH/HSL usage within same layer

**Implementation**:
```css
/* Primitives - OKLCH primary */
--mfb-green: oklch(0.6800 0.1800 130);

/* HSL fallbacks - auto-generated */
--mfb-green-hsl: 95 71% 56%;

/* Semantic mappings - HSL only */
--primary: var(--mfb-green-hsl);
```

### 3. Circular Dependency Resolution

**Critical Fixes**:
- Fix `--space-card-padding: var(--space-card-padding);` circular reference
- Fix `--space-dashboard-grid-gap: var(--space-dashboard-grid-gap);` circular reference
- Map to actual primitive values or hardcoded fallbacks

**Validation**:
- Build-time validation to prevent circular dependencies
- Development error messages for invalid references

### 4. Theme Provider Implementation

**Basic Theme Switching**:
- Light/dark mode with proper CSS class management on `document.documentElement`
- localStorage persistence for user preferences
- System preference detection and auto-switching

**DOM Integration**:
```typescript
// Apply theme classes to DOM
document.documentElement.className = theme === 'dark' ? 'dark' : '';
```

**No Advanced Features**: No density modes or accessibility enhancements (future scope)

### 5. Smart Fallback Strategy

**Color Fallbacks**:
- Use hardcoded MFB brand values as fallbacks to maintain branding
- Example: `var(--primary, hsl(95 71% 56%))`

**Spacing Fallbacks**:
- Use standard rem units for layout consistency
- Example: `var(--space-card-padding, 1.5rem)`

**Typography Fallbacks**:
- Use system font stack and standard sizes
- Example: `var(--font-size-base, 1rem)`

### 6. Redundant Definition Consolidation

**Chart Colors**:
- Single source of truth in semantic layer
- Remove duplicate definitions from:
  - `/src/index.css` (legacy chart colors)
  - `/src/components/dashboard/chart-colors.ts` (utilities)
  - `/build/design-tokens.json` (conflicting definitions)

**Color Organization**:
- All chart colors in semantic layer with proper semantic naming
- Utilities reference semantic tokens, not hardcoded values

### 7. TypeScript Type Alignment

**Simplified Type Definitions**:
- Remove references to missing Component/Feature layers
- Align interface definitions with actual CSS implementation
- Maintain autocompletion for existing tokens only

**Type Safety**:
```typescript
interface DesignTokens {
  primitives: PrimitiveTokens;  // Only what exists in CSS
  semantic: SemanticTokens;     // Only what exists in CSS
}
```

## Technical Implementation

### File Structure Changes

```
src/styles/tokens/
├── primitives.css          # OKLCH brand colors + HSL fallbacks
├── semantic.css            # HSL-only semantic mappings
└── index.css              # Import coordination

src/lib/
├── design-token-types.ts   # Simplified 2-layer types
└── design-token-utils.ts   # OKLCH→HSL conversion utilities

src/components/
└── theme-provider.tsx      # DOM class management
```

### Breaking Changes

**Component Updates Required**:
- Update all components using old token references
- Migrate from hardcoded colors to semantic tokens
- Update chart components to use consolidated color definitions

**Build Pipeline Changes**:
- Add token validation to build process
- Remove unused token optimization scripts
- Update design token export format

### Development Tools

**Error Handling (Fail Fast)**:
- Clear error messages for invalid token references
- Development-time validation for circular dependencies
- TypeScript errors for non-existent token usage

**Validation Tools**:
```bash
npm run validate:design-tokens    # Comprehensive token validation
npm run test:design-tokens       # Contract and visual regression tests
```

## Success Criteria

### Technical Metrics
- ✅ Zero circular dependencies in CSS variables
- ✅ All CSS variables have appropriate fallbacks
- ✅ Consistent OKLCH→HSL conversion pipeline
- ✅ TypeScript definitions match actual CSS implementation
- ✅ Single source of truth for all color definitions
- ✅ Build process validates token integrity

### User Experience Metrics
- ✅ Theme switching works reliably (light/dark)
- ✅ No visual bugs or layout failures
- ✅ Proper contrast ratios maintained (WCAG AA minimum)
- ✅ Consistent branding across all components
- ✅ Graceful degradation when tokens fail

### Developer Experience
- ✅ Clear error messages for token issues
- ✅ TypeScript autocompletion for valid tokens
- ✅ Fast development feedback on token problems
- ✅ Simplified architecture easy to understand and maintain

## Migration Strategy

**Breaking Change Approach**:
1. Fix all critical issues simultaneously
2. Update all consuming components in same change
3. Remove all legacy/redundant implementations
4. Deploy as single comprehensive update

**Testing Strategy**:
- Visual regression tests for all major components
- Contrast validation for all color combinations
- Build validation for token dependency resolution
- Manual QA for theme switching functionality

## Timeline Estimate

- **Analysis & Planning**: 0.5 days
- **Core Token System Fixes**: 1.5 days
- **Component Migration**: 1 day
- **Testing & Validation**: 0.5 days
- **Documentation Updates**: 0.5 days

**Total**: ~4 days for complete overhaul

## Risk Mitigation

**Deployment Risks**:
- Comprehensive testing before deployment
- Visual regression test suite
- Rollback plan via git revert

**User Impact**:
- Brief visual inconsistencies during deployment (acceptable)
- Communication to team about breaking changes
- Post-deployment validation checklist

## Future Considerations

**Not in Scope**:
- Density modes (compact/comfortable/spacious)
- Accessibility enhancements (high contrast, motion preferences)
- Component token layer expansion
- Feature token layer implementation

**Potential Follow-up Features**:
- Advanced theming capabilities
- Runtime token switching
- Design token documentation generator
- Visual token explorer tool