# Design Token Duplication Audit Report

This audit identifies token duplication and hierarchy violations across the codebase to inform the parallel implementation plan for consolidating design tokens into a proper four-tier hierarchy.

## Overview

The codebase currently has **massive token duplication** across 5+ files with **multiple sources of truth** for MFB brand colors, semantic mappings, and component tokens. The current system violates design token hierarchy principles with tokens defined at wrong levels and extensive primitive value duplication.

## Token Distribution Analysis

### `/src/index.css` - Primary Token Definitions
**Status**: Primary source of truth with extensive token definitions

**Tokens Defined**:
- **Primitive Colors**: 50+ MFB brand color definitions in both OKLCH and HSL formats
- **Semantic Mappings**: Priority system, organization types, market segments
- **Advanced Color Science**: OKLCH perceptual uniformity system, color harmony generation
- **shadcn/ui Integration**: Complete semantic mapping to shadcn system
- **Layout Dimensions**: Header heights, dialog constraints, chart dimensions

**Major Issues**:
- Mixes primitive (`--mfb-green: oklch(0.6800 0.1800 130)`) with semantic mappings (`--primary: var(--mfb-green-hsl)`)
- Duplicates HSL fallbacks for every OKLCH color (100+ duplicate definitions)
- Contains both primitive values AND component-specific tokens
- Dark theme overrides duplicate light theme definitions with different values

### `/src/styles/component-tokens.css` - Component Layer
**Status**: Proper component-level implementation but references duplicated primitives

**Tokens Defined**:
- **Button Variants**: Primary, secondary, success, warning, destructive states
- **Card Components**: Background, borders, shadows, spacing
- **Input States**: Validation, focus, sizing variants
- **Badge Systems**: Semantic color mappings
- **Navigation Components**: Header, sidebar, link states

**Violations Found**:
- References primitive tokens that are duplicated across files
- Creates component tokens that should reference semantic tokens but go directly to primitives
- Missing semantic layer - jumps from primitive to component

### `/src/styles/advanced-colors.css` - Color Science Layer
**Status**: Advanced features with extensive primitive duplication

**Tokens Defined**:
- **High Contrast Variants**: Enhanced visibility alternatives for all MFB colors
- **Colorblind-Safe Alternatives**: Deuteranopia/Protanopia/Tritanopia accessible versions
- **Perceptual Uniformity**: OKLCH-based color generation system
- **CRM Semantic Colors**: Opportunity states, organization types, priority systems

**Critical Duplication Issues**:
- Redefines MFB colors with different values than index.css
- Creates parallel semantic systems that should be unified
- Duplicates accessibility color definitions found in accessibility-tokens.css

### `/src/styles/accessibility-tokens.css` - Accessibility Layer
**Status**: WCAG AAA compliant tokens with controlled duplication

**Tokens Defined**:
- **Contrast-Validated Colors**: All colors with verified contrast ratios
- **Focus Ring System**: Enhanced focus management tokens
- **Motion Preferences**: Animation duration tokens
- **Form Validation**: Input state colors

**Overlap Issues**:
- Defines `--a11y-mfb-green-bg: var(--mfb-green)` - references duplicated primitive
- Creates accessibility-specific semantic mappings that conflict with main semantic system
- Has own high contrast system parallel to advanced-colors.css

### `/src/styles/density.css` - Density System
**Status**: Proper density implementation but references duplicated tokens

**Tokens Defined**:
- **Spacing Scales**: Density-aware spacing tokens
- **Component Sizing**: Button heights, card padding per density mode
- **Typography Scales**: Font sizes per density level
- **Design System Integration**: References MFB colors properly

**Integration Issues**:
- References `--mfb-green-hsl` which exists in multiple sources
- Creates density-specific component tokens that bypass semantic layer

### `/tailwind.config.js` - Framework Integration
**Status**: Proper framework configuration but relies on duplicated CSS variables

**Color References**:
- Maps to HSL versions of CSS custom properties
- References `var(--mfb-*)` tokens that are duplicated across files
- Creates framework-level semantic mappings (`priority`, `organization`, `segment`)

**Alignment Issues**:
- Assumes single source of truth for CSS variables but variables are duplicated
- Framework semantic naming doesn't align with CSS token architecture

## Critical Duplication Violations

### 1. MFB Brand Color Definitions (Multiple Sources of Truth)

**Primary Definition** (`/src/index.css`):
```css
--mfb-green: oklch(0.6800 0.1800 130);
--mfb-green-hsl: 95 71% 56%;
```

**Accessibility Override** (`/src/styles/accessibility-tokens.css`):
```css
--a11y-mfb-green-bg: var(--mfb-green);  /* References index.css */
```

**Advanced Colors Override** (`/src/styles/advanced-colors.css`):
```css
--hc-primary-bg: oklch(0.5500 0.2200 130);  /* Different value! */
```

**Issue**: Three different systems defining MFB green with potential value conflicts.

### 2. Semantic Color System Duplication

**Main System** (`/src/index.css`):
```css
--success: var(--mfb-success-hsl);
--primary: var(--mfb-green-hsl);
```

**Advanced System** (`/src/styles/advanced-colors.css`):
```css
--cb-success-bg: oklch(0.6000 0.1500 200);  /* Different semantic success */
```

**Accessibility System** (`/src/styles/accessibility-tokens.css`):
```css
--a11y-success-bg: 142 76% 36%;  /* Third success definition */
```

**Issue**: Three parallel semantic systems with different success color definitions.

### 3. Component Token Architecture Violations

**Button System Hierarchy Violation**:
- **Should be**: Primitive → Semantic → Component
- **Actually is**: Primitive → Component (bypasses semantic layer)

```css
/* component-tokens.css - VIOLATION */
--btn-primary-bg: var(--mfb-green);  /* Skips semantic layer */

/* Should be */
--btn-primary-bg: var(--semantic-primary);  /* References semantic */
```

### 4. HSL/OKLCH Format Duplication

**Every MFB color has duplicate definitions**:
```css
/* OKLCH primary definition */
--mfb-green: oklch(0.6800 0.1800 130);

/* HSL duplicate for compatibility */
--mfb-green-hsl: 95 71% 56%;
```

**Issue**: 50+ colors × 2 formats = 100+ duplicate token definitions for format compatibility.

## Token Hierarchy Violations

### Current Broken Hierarchy
```
❌ CURRENT (Violates design token principles)
├── Primitives mixed with semantics (index.css)
├── Components reference primitives directly
├── Multiple semantic systems in parallel
└── No clear source of truth
```

### Missing Proper Hierarchy
```
✅ REQUIRED (Proper design token architecture)
├── Tier 1: Primitives (colors, spacing, typography)
├── Tier 2: Semantic (primary, success, warning)
├── Tier 3: Component (button, card, input)
└── Tier 4: Pattern (layouts, themes)
```

## Naming Convention Inconsistencies

### Multiple Naming Patterns Found
- **MFB Brand**: `--mfb-green`, `--mfb-green-hsl`, `--mfb-green-hover`
- **Accessibility**: `--a11y-success-bg`, `--a11y-focus-ring`
- **Component**: `--btn-primary-bg`, `--card-shadow`
- **Semantic**: `--primary`, `--success`, `--destructive`
- **Advanced**: `--hc-primary-bg`, `--cb-success-bg`

**Issue**: Five different naming conventions with overlapping scopes.

## File-Specific Duplication Details

### Primitive Value Duplication
- **MFB Green**: Defined 6 times across files
- **Success Colors**: 4 different definitions
- **Focus Ring**: 3 different implementations
- **Shadow Tokens**: Duplicated in component-tokens.css and advanced-colors.css

### Reference Chain Complexity
```
tailwind.config.js → CSS variables → Multiple sources
├── --primary → --mfb-green-hsl (index.css)
├── --success → --mfb-success-hsl (index.css)
│                └── CONFLICTS with --cb-success-bg (advanced-colors.css)
└── --destructive → --mfb-danger-hsl (index.css)
                    └── CONFLICTS with --hc-danger-bg (advanced-colors.css)
```

## Consolidation Requirements for Four-Tier Implementation

### 1. Primitive Consolidation
- **Eliminate**: 100+ HSL/OKLCH duplicates
- **Centralize**: All MFB brand colors in primitives file
- **Standardize**: Single format (OKLCH) with computed HSL references

### 2. Semantic Layer Creation
- **Extract**: All semantic mappings from index.css
- **Unify**: Parallel semantic systems in advanced-colors.css and accessibility-tokens.css
- **Standardize**: Semantic naming conventions

### 3. Component Token Cleanup
- **Fix**: Direct primitive references to go through semantic layer
- **Consolidate**: Scattered component tokens into unified component file
- **Eliminate**: Component tokens mixed into primitive files

### 4. Pattern Level Implementation
- **Create**: New pattern tier for density, theme, and layout combinations
- **Migrate**: Pattern-specific tokens from multiple files

## Impact Assessment

### Files Requiring Major Changes
1. **`/src/index.css`**: Split into primitives and semantics (90% of content moves)
2. **`/src/styles/advanced-colors.css`**: Remove primitive redefinitions (60% reduction)
3. **`/src/styles/component-tokens.css`**: Fix semantic references (30% changes)
4. **`/src/styles/accessibility-tokens.css`**: Align with unified semantic system (40% changes)

### Breaking Changes Required
- All component references to primitives must go through semantic layer
- Tailwind config color mappings need semantic alignment
- Custom component implementations may need token reference updates

### Migration Complexity
- **High**: Primitive/semantic separation in index.css
- **Medium**: Component token hierarchy fixes
- **Low**: Tailwind config alignment after CSS token consolidation

## Recommendations for Parallel Implementation

1. **Phase 1**: Create proper primitive tier by extracting from index.css
2. **Phase 2**: Build semantic tier by consolidating parallel semantic systems
3. **Phase 3**: Fix component tier to reference semantic instead of primitives
4. **Phase 4**: Create pattern tier for density/theme combinations

This audit confirms the need for comprehensive token architecture refactoring to eliminate duplication and establish proper design token hierarchy.