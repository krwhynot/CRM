# Semantic Tokens Implementation Analysis

Analysis of current semantic token implementation and identification of gaps for the strict token hierarchy. Based on requirement from shared.md for a new `/src/styles/semantic-tokens.css` file that "Maps primitives to meanings (--color-primary: var(--mfb-green))".

## Relevant Files

- `/src/index.css`: Contains scattered semantic mappings mixed with primitives (lines 286-310)
- `/src/styles/component-tokens.css`: Well-structured component tokens referencing semantics
- `/src/styles/accessibility-tokens.css`: Comprehensive accessibility token system with WCAG AAA compliance
- `/src/styles/advanced-colors.css`: Advanced color features with high contrast and colorblind variants
- `/src/styles/density.css`: Proper semantic token usage for density-aware design
- `/tailwind.config.js`: Defines expected semantic token structure for shadcn/ui integration
- `/src/components/`: Mixed semantic and hardcoded color usage patterns

## Architectural Patterns

**Current Token Hierarchy**:
- **Primitives** → **Semantics** → **Components** → **Advanced Features**
- Primitives are well-defined with MFB brand colors in OKLCH and HSL formats
- Semantic layer EXISTS but is disorganized and mixed with primitives
- Component layer properly references semantic tokens
- Advanced layer (accessibility, density, special modes) properly structured

**Semantic Mappings Currently Exist**:
- ✅ `--primary: var(--mfb-green-hsl)` (MFB Green as primary)
- ✅ `--secondary: var(--mfb-clay-hsl)` (MFB Clay as secondary)
- ✅ `--destructive: var(--mfb-danger-hsl)` (MFB Danger Red)
- ✅ `--success: var(--mfb-success-hsl)` (MFB Success Green)
- ✅ `--warning: var(--mfb-warning-hsl)` (MFB Warning Amber)
- ✅ `--info: var(--mfb-info-hsl)` (MFB Info Blue)

**Integration Points Working**:
- Tailwind config properly expects these semantic tokens
- Component tokens correctly reference semantic layer
- Density system uses semantic tokens appropriately
- Accessibility system provides enhanced semantic variants

## Edge Cases & Gotchas

**Missing Dedicated Semantic File**: The main issue identified in shared.md - semantic mappings exist in `/src/index.css` lines 286-310 but need extraction to dedicated `/src/styles/semantic-tokens.css`

**Component Color Usage Inconsistencies**:
- Components mix semantic tokens (good) with hardcoded Tailwind colors (problematic)
- Examples found: `text-gray-500`, `hover:bg-gray-50`, `focus:bg-blue-50` in entity select components
- Should use semantic tokens like `text-muted`, `hover:bg-muted/50`, `focus:bg-accent` instead

**Advanced Color System Complexity**:
- `advanced-colors.css` defines sophisticated variants but only maps to semantics in high contrast mode
- Main semantic tokens not defined in main `:root` section of advanced-colors.css
- Creates confusion about primary semantic token source

**Dark Mode Semantic Handling**:
- Semantic tokens properly redefined for dark mode in index.css
- Advanced color system provides enhanced dark mode variants
- Accessibility tokens include dark mode considerations

## Current Semantic Token Usage Patterns in Components

**Well-Implemented Patterns**:
```css
/* Density system - exemplary semantic usage */
--density-surface: hsl(var(--background));
--density-surface-elevated: hsl(var(--card));
--density-border: hsl(var(--border));
--density-focus-ring: hsl(var(--mfb-green-hsl));

/* Component tokens - proper semantic referencing */
--btn-primary-bg: var(--mfb-green);
--input-border-focus: var(--mfb-green);
--card-bg: hsl(var(--card));
```

**Problematic Patterns Found**:
```tsx
// Hardcoded colors instead of semantic tokens
className="text-gray-500"  // Should be: text-muted
className="hover:bg-gray-50"  // Should be: hover:bg-muted/50
className="focus:bg-blue-50"  // Should be: focus:bg-accent
```

## Missing Semantic Layer Mappings

The semantic mappings DO exist but need to be extracted from index.css into a dedicated file. Currently missing organized structure for:

### Core shadcn/ui Semantic Tokens
All exist in index.css but scattered, need consolidation in semantic-tokens.css:

```css
/* These mappings exist but need organization */
--primary: var(--mfb-green-hsl);  /* ✅ MFB Green as primary */
--secondary: var(--mfb-clay-hsl);  /* ✅ MFB Clay as secondary */
--destructive: var(--mfb-danger-hsl);  /* ✅ MFB Red */
--success: var(--mfb-success-hsl);  /* ✅ MFB Success Green */
--warning: var(--mfb-warning-hsl);  /* ✅ MFB Warning Amber */
--info: var(--mfb-info-hsl);  /* ✅ MFB Info Blue */
--background: 0 0% 98%;  /* ✅ Light background */
--foreground: 240 10% 10%;  /* ✅ Dark text */
--card: 0 0% 100%;  /* ✅ White cards */
--muted: 0 0% 95%;  /* ✅ Muted backgrounds */
--accent: 0 0% 95%;  /* ✅ Accent backgrounds */
--border: 0 0% 90%;  /* ✅ Border colors */
--input: 0 0% 90%;  /* ✅ Input borders */
--ring: 95 71% 56%;  /* ✅ Focus rings */
```

## Recommended Mappings (Already Implemented)

The mappings are already correctly implemented but need reorganization:

### MFB Brand → Semantic Meanings
- **MFB Green** (`#8DC63F`) → `--primary` ✅ Already mapped correctly
- **MFB Clay** → `--secondary` ✅ Already mapped correctly
- **MFB Success Green** → `--success` ✅ Already mapped correctly
- **MFB Warning Amber** → `--warning` ✅ Already mapped correctly
- **MFB Danger Red** → `--destructive` ✅ Already mapped correctly
- **MFB Info Blue** → `--info` ✅ Already mapped correctly

### Neutral Colors → Interface Elements
All properly mapped in index.css, need extraction to semantic file:
- Light Gray → `--muted`, `--accent` (95% lightness)
- Medium Gray → `--border`, `--input` (90% lightness)
- White → `--background`, `--card`
- Dark → `--foreground`, `--text-primary`

## Components Needing Updates

**High Priority - Hardcoded Color Cleanup**:
- `/src/components/forms/entity-select/EntitySelectOptionsList.tsx`: Replace hardcoded grays and blues
- `/src/components/data-table/data-table.tsx`: Some hardcoded values remain
- Search for pattern: `text-gray-*`, `bg-gray-*`, `hover:bg-gray-*`, `focus:bg-blue-*`

**Component Token Integration**:
- Most components properly use component tokens
- Component tokens properly reference semantic tokens
- Integration between semantic and component layers working well

## Integration Points Summary

### shadcn/ui Integration ✅ Working Well
- Tailwind config expects correct semantic tokens
- All required tokens are defined and mapped properly
- Dark mode variants correctly implemented

### Density System Integration ✅ Excellent
- Density system exemplifies proper semantic token usage
- Integrates semantic colors with density-aware spacing
- Proper fallback patterns for token inheritance

### Accessibility System Integration ✅ Comprehensive
- Accessibility tokens extend semantic tokens appropriately
- WCAG AAA compliance with documented contrast ratios
- Enhanced semantic variants for accessibility needs
- Proper high contrast and colorblind-safe alternatives

## Next Steps for Implementation

1. **Extract Semantic Mappings**: Create `/src/styles/semantic-tokens.css` by extracting lines 286-310 from `/src/index.css`

2. **Organize Semantic Structure**: Structure the semantic tokens file with clear sections:
   - Core shadcn/ui mappings
   - MFB brand semantic assignments
   - Extended CRM semantic tokens (priority, organization, segment)
   - Dark mode overrides

3. **Clean Up Component Usage**: Replace hardcoded Tailwind colors with semantic tokens in components

4. **Update Import Order**: Ensure semantic-tokens.css is imported after primitives but before component tokens

5. **Validation**: Verify all semantic token references resolve correctly across the system

The semantic token architecture is fundamentally sound and comprehensive - it just needs organizational restructuring into the dedicated file structure outlined in the design token architecture plan.