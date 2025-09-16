# Master Food Brokers (MFB) Brand Requirements Analysis

**Document Purpose**: Define essential MFB brand elements that must be preserved during design token simplification and identify opportunities to replace custom tokens with Tailwind defaults.

**Analysis Date**: September 15, 2025
**Scope**: Brand color palette, typography, spacing, accessibility requirements

## Executive Summary

Master Food Brokers has a comprehensive brand identity built around 5 core colors with strict accessibility requirements. The brand requires WCAG AAA compliance with documented contrast ratios. While some design tokens can be replaced with Tailwind defaults, critical brand elements must be maintained to preserve visual identity and accessibility standards.

## 1. MFB Brand Color System

### 1.1 Core Brand Palette

The MFB brand is built around 5 primary colors, each with comprehensive interaction states and accessibility-validated contrast ratios:

#### Primary MFB Green (`#8DC63F`)
- **Base**: `oklch(0.6800 0.1800 130)` / HSL: `95 71% 56%`
- **Hover**: `oklch(0.6200 0.1900 130)` / HSL: `95 75% 50%`
- **Focus**: `oklch(0.6800 0.1800 130)` / HSL: `95 71% 56%`
- **Active**: `oklch(0.5600 0.2000 130)` / HSL: `95 78% 44%`
- **Light**: `oklch(0.7400 0.1600 130)` / HSL: `95 68% 62%`
- **Subtle**: `oklch(0.9500 0.0300 130)` / HSL: `95 30% 94%`

#### MFB Clay (Warm Earthy)
- **Base**: `oklch(0.5800 0.0800 40)` / HSL: `40 35% 45%`
- **Hover**: `oklch(0.5200 0.0900 40)` / HSL: `40 38% 40%`
- **Focus**: `oklch(0.5800 0.0800 40)` / HSL: `40 35% 45%`
- **Active**: `oklch(0.4800 0.1000 40)` / HSL: `40 42% 35%`
- **Light**: `oklch(0.6400 0.0700 40)` / HSL: `40 32% 52%`
- **Subtle**: `oklch(0.9400 0.0200 40)` / HSL: `40 20% 92%`

#### MFB Cream (Light Neutral)
- **Base**: `oklch(0.9400 0.0200 75)` / HSL: `75 25% 92%`
- **Hover**: `oklch(0.9000 0.0250 75)` / HSL: `75 28% 88%`
- **Focus**: `oklch(0.9400 0.0200 75)` / HSL: `75 25% 92%`
- **Active**: `oklch(0.8600 0.0300 75)` / HSL: `75 32% 84%`
- **Dark**: `oklch(0.8000 0.0400 75)` / HSL: `75 36% 78%`
- **Subtle**: `oklch(0.9700 0.0150 75)` / HSL: `75 20% 96%`

#### MFB Sage (Muted Green)
- **Base**: `oklch(0.6000 0.0600 145)` / HSL: `145 25% 55%`
- **Hover**: `oklch(0.5400 0.0700 145)` / HSL: `145 28% 49%`
- **Focus**: `oklch(0.6000 0.0600 145)` / HSL: `145 25% 55%`
- **Active**: `oklch(0.5000 0.0800 145)` / HSL: `145 32% 43%`
- **Light**: `oklch(0.7500 0.0400 145)` / HSL: `145 20% 72%`
- **Dark**: `oklch(0.4500 0.0900 145)` / HSL: `145 35% 37%`
- **Subtle**: `oklch(0.9500 0.0200 145)` / HSL: `145 15% 94%`

#### MFB Olive (Deep Green-Brown)
- **Base**: `oklch(0.4500 0.0500 110)` / HSL: `110 20% 42%`
- **Hover**: `oklch(0.4000 0.0600 110)` / HSL: `110 24% 37%`
- **Focus**: `oklch(0.4500 0.0500 110)` / HSL: `110 20% 42%`
- **Active**: `oklch(0.3500 0.0700 110)` / HSL: `110 28% 32%`
- **Light**: `oklch(0.5200 0.0450 110)` / HSL: `110 18% 48%`
- **Lighter**: `oklch(0.6000 0.0400 110)` / HSL: `110 16% 55%`
- **Dark**: `oklch(0.3000 0.0800 110)` / HSL: `110 32% 26%`
- **Subtle**: `oklch(0.9300 0.0150 110)` / HSL: `110 12% 91%`

### 1.2 Semantic Color Extensions

**MFB Success**: `oklch(0.6500 0.1600 142)` / HSL: `142 65% 50%`
**MFB Warning**: `oklch(0.7200 0.1800 60)` / HSL: `60 85% 65%`
**MFB Danger**: `oklch(0.5800 0.2200 25)` / HSL: `25 80% 45%`
**MFB Info**: `oklch(0.6200 0.1400 240)` / HSL: `240 70% 55%`

### 1.3 Dark Mode Variants

Each brand color has specific dark mode adjustments with enhanced lightness for better visibility:
- **Green**: Increased to `oklch(0.7200 0.1700 130)` (brighter)
- **Clay**: Enhanced to `oklch(0.6200 0.0750 40)`
- **Sage**: Brightened to `oklch(0.6500 0.0550 145)`
- **Olive**: Adjusted to `oklch(0.5000 0.0450 110)`

### 1.4 Tailwind Integration

Brand colors are integrated into Tailwind configuration as custom color families:

```javascript
// tailwind.config.js - MFB color integration
'mfb': {
  'green': 'var(--mfb-green)',
  'green-hover': 'var(--mfb-green-hover)',
  'clay': 'var(--mfb-clay)',
  'sage': 'var(--mfb-sage)',
  'olive': 'var(--mfb-olive)',
  // ... all variants
}
```

## 2. Typography Requirements

### 2.1 Font Family Requirement

**Primary Font**: **Nunito** - Required throughout the application
**Fallback Stack**: `'Nunito', system-ui, -apple-system, sans-serif`

**Tailwind Integration**:
```javascript
fontFamily: {
  'nunito': ['Nunito', 'system-ui', 'sans-serif'],
}
```

**Usage Patterns**:
- Body text: `font-family: 'Nunito', system-ui, -apple-system, sans-serif`
- All headings (h1, h3): Nunito with MFB Olive color
- Form elements: Nunito for consistency
- Table headers: Nunito with semibold weight

### 2.2 Font Size Scale

Current implementation uses both standard and custom font sizes:

**Standard Sizes (Can use Tailwind defaults)**:
- `--font-size-xs: 0.75rem` (12px) ✅ matches `text-xs`
- `--font-size-sm: 0.875rem` (14px) ✅ matches `text-sm`
- `--font-size-base: 1rem` (16px) ✅ matches `text-base`
- `--font-size-lg: 1.125rem` (18px) ✅ matches `text-lg`

**Custom Brand Size**:
- Body text: `0.9375rem` (15px) - **Brand-specific, must preserve**

### 2.3 Font Weight Requirements

- **Normal**: 400 (matches Tailwind `font-normal`)
- **Medium**: 500 (matches Tailwind `font-medium`)
- **Semibold**: 600 (matches Tailwind `font-semibold`)
- **Bold**: 700 (matches Tailwind `font-bold`)

## 3. Accessibility Requirements

### 3.1 WCAG AAA Compliance

**Documented Contrast Ratios**:
- **Primary Level**: 15.8:1 contrast ratio (AAA++)
- **Secondary Level**: 12.6:1 contrast ratio (AAA+)
- **Minimum Level**: 7.5:1 contrast ratio (AAA)

**Implementation**:
```css
/* Primary MFB Green - contrast-validated states */
--mfb-green: oklch(0.6800 0.1800 130);        /* Base: 15.8:1 contrast ratio */
--mfb-green-hover: oklch(0.6200 0.1900 130);  /* Hover: 12.6:1 contrast ratio */
--mfb-green-active: oklch(0.5600 0.2000 130); /* Active: 7.5:1 contrast ratio */
```

### 3.2 Color Format Requirements

**Primary Format**: OKLCH for perceptual uniformity
**Fallback Format**: HSL for legacy component compatibility

**Critical Requirement**: Both formats must be maintained for accessibility compliance and browser compatibility.

### 3.3 Focus Management

Brand-specific focus ring implementation:
```css
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}
```

## 4. Spacing and Layout Requirements

### 4.1 Standard Spacing (Can use Tailwind defaults)

**Primitive Spacing Scale** - Matches Tailwind:
- `--space-1: 0.25rem` (4px) ✅ matches `space-1`
- `--space-2: 0.5rem` (8px) ✅ matches `space-2`
- `--space-4: 1rem` (16px) ✅ matches `space-4`
- `--space-6: 1.5rem` (24px) ✅ matches `space-6`
- `--space-8: 2rem` (32px) ✅ matches `space-8`

### 4.2 Brand-Specific Spacing (Must preserve)

**Semantic Spacing Tokens**:
- `--space-card-padding: 24px` - Professional card consistency
- `--space-dashboard-grid-gap: 24px` - Dashboard grid spacing
- `--dialog-max-height: min(75vh, 45rem)` - iPad-optimized dialogs

**Custom Responsive Breakpoints**:
```css
/* iPad-specific (portrait) - Conservative for keyboard */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  :root {
    --dialog-max-height: min(70vh, 35rem); /* 560px for keyboard space */
  }
}
```

### 4.3 Border Radius

**Standard Values (Can use Tailwind defaults)**:
- Small: `0.25rem` (4px) ✅ matches `rounded-sm`
- Medium: `0.375rem` (6px) ✅ matches `rounded-md`
- Large: `0.5rem` (8px) ✅ matches `rounded-lg`

**Brand-Specific**:
- Cards: `--radius-card: 12px` - Professional appearance

## 5. Component-Specific Brand Requirements

### 5.1 Button Styling

**Primary Buttons** - Brand green with elevation:
```css
.btn-primary {
  background-color: var(--mfb-green);
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  &:hover:not(:disabled) {
    background-color: var(--mfb-green-hover);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    transform: translateY(-1px);
  }
}
```

**Secondary Buttons** - Clay color variant:
```css
.btn-secondary {
  background-color: var(--mfb-clay);
  &:hover:not(:disabled) {
    background-color: var(--mfb-clay-hover);
  }
}
```

### 5.2 Typography Hierarchy

**Headings** - MFB Olive color requirement:
```css
h1, h3 {
  color: var(--mfb-olive);
  font-family: 'Nunito', system-ui, sans-serif;
}

.table-header {
  color: var(--mfb-olive);
  font-weight: 600;
}
```

### 5.3 Chart Colors

**Brand-consistent chart palette**:
```css
:root {
  --chart-1: 130 62% 50%; /* MFB Green */
  --chart-2: 130 57% 60%; /* Lighter Green */
  --chart-3: 130 58% 46%; /* Medium Green */
  --chart-4: 160 42% 56%; /* Teal Green */
  --chart-5: 110 35% 42%; /* Olive Green */
}
```

## 6. Simplification Opportunities

### 6.1 Safe to Replace with Tailwind Defaults

**Spacing Values**:
- Standard spacing scale (1, 2, 4, 6, 8, etc.)
- Standard margin/padding utilities

**Typography**:
- Font weights (400, 500, 600, 700)
- Standard font sizes (xs, sm, base, lg, xl)
- Line heights (1.25, 1.5, 1.75)

**Layout**:
- Standard border radius values
- Standard shadow scale
- Grid and flexbox utilities

**Colors**:
- Standard grayscale (gray-50 through gray-950)
- Standard semantic colors (but not MFB semantic colors)

### 6.2 Must Preserve (Brand-Critical)

**Color System**:
- All 47 MFB color variations and states
- OKLCH and HSL dual-format support
- Dark mode brand color variants
- Accessibility-validated contrast ratios

**Typography**:
- Nunito font family requirement
- 15px (0.9375rem) base font size for body text
- MFB Olive color for headings

**Brand-Specific Spacing**:
- Card padding (24px) for professional consistency
- Dashboard grid gaps
- iPad-optimized dialog heights

**Component Styling**:
- Button interaction patterns with elevation
- Brand-specific focus ring styling
- Chart color palette

## 7. Migration Strategy Recommendations

### 7.1 Phase 1: Replace Standard Values
Replace custom tokens that exactly match Tailwind defaults:
- Spacing scale (space-1 through space-20)
- Standard font sizes and weights
- Standard border radius values

### 7.2 Phase 2: Consolidate Brand-Specific Tokens
Maintain essential brand tokens but optimize organization:
- Consolidate MFB color variations
- Preserve accessibility compliance
- Maintain dual OKLCH/HSL format support

### 7.3 Phase 3: Component Token Optimization
Optimize component-specific tokens while preserving brand identity:
- Maintain button styling patterns
- Preserve typography hierarchy
- Keep brand-consistent chart colors

## 8. Validation Requirements

### 8.1 Accessibility Testing
- Verify all contrast ratios maintain WCAG AAA compliance
- Test focus ring visibility across all brand colors
- Validate screen reader compatibility

### 8.2 Brand Consistency Testing
- Verify Nunito font loading and fallback behavior
- Test brand color accuracy across different displays
- Validate dark mode brand color adjustments

### 8.3 Component Integration Testing
- Test button styling with brand colors
- Verify typography hierarchy with MFB Olive
- Validate chart color consistency

## Conclusion

The MFB brand has specific requirements that must be preserved during design token simplification:

**Essential Brand Elements**:
- 5-color brand palette with 47 total variations
- Nunito font family requirement
- WCAG AAA contrast ratio compliance
- Brand-specific spacing for professional appearance

**Simplification Opportunities**:
- Standard spacing, typography, and layout values
- Grayscale and non-brand color utilities
- Standard component variants that don't conflict with brand identity

The brand requirements justify maintaining custom design tokens for color system, typography, and brand-specific spacing while leveraging Tailwind defaults for standard values that don't impact brand identity.