# Design Token System Overhaul - Requirements

## Overview

Complete replacement of the existing Master Food Brokers (MFB) design token system with a modern, accessible, and enhanced color system. This is a **FRESH CLEAN SLATE** approach - all existing MFB colors will be removed and replaced with a new comprehensive token system.

## Business Objectives

### Primary Goals
- **Complete MFB Color Removal**: Eliminate all 47 existing MFB brand color definitions
- **Modern Color System**: Implement OKLCH-based color system with enhanced accessibility
- **UX Improvements**: Opportunity for visual improvements across all components
- **Enhanced Accessibility**: Comprehensive interactive states, focus management, and color blindness support
- **Immediate Implementation**: No gradual migration - complete replacement

### Success Criteria
- Zero references to `--mfb-*` variables in codebase
- All components using new semantic color system
- Enhanced accessibility with comprehensive interactive states
- Improved visual hierarchy and user experience
- WCAG AAA compliance for all color combinations

## Technical Scope

### Phase 1: Primitives Layer Complete Replacement

#### 1.1 Remove Existing MFB System
**Files**: `src/styles/tokens/primitives.css`
- **DELETE**: All 47 MFB brand color definitions (lines 20-226)
- **DELETE**: All HSL fallbacks for MFB colors
- **DELETE**: All "Master Food Brokers" branding comments
- **CLEAN SLATE**: Treat as if no colors existed previously

#### 1.2 Implement New Brand Primitives
**New Primary Color System**:
```css
--brand-primary: oklch(0.747 0.1309 124.48);        /* New yellow-green primary */
--brand-primary-hover: oklch(0.697 0.1409 124.48);
--brand-primary-active: oklch(0.647 0.1509 124.48);
--brand-primary-light: oklch(0.847 0.0909 124.48);
--brand-primary-subtle: oklch(0.95 0.025 124.48);
```

**Secondary & Accent Systems**:
```css
--brand-secondary: oklch(0.62 0.11 285);             /* Purple secondary */
--brand-accent: oklch(0.65 0.12 220);                /* Blue accent */
```

#### 1.3 Enhanced Interactive State Primitives (NEW)
```css
/* CRITICAL GAP #1 - Interactive States */
--state-disabled-opacity: 0.5;
--state-disabled-color: oklch(0.62 0 0);
--state-visited: oklch(0.55 0.08 285);
--state-selected-bg: oklch(0.95 0.04 124.48);
--state-selected-border: oklch(0.747 0.1309 124.48);
--state-pressed: oklch(0.627 0.1509 124.48);
--state-loading: oklch(0.74 0 0);
--state-readonly: oklch(0.97 0 0);
```

#### 1.4 Typography Color Primitives (NEW)
```css
/* CRITICAL GAP #2 - Typography System */
--text-primary: oklch(0.13 0 0);
--text-secondary: oklch(0.40 0 0);
--text-tertiary: oklch(0.55 0 0);
--text-disabled: oklch(0.62 0 0);
--text-placeholder: oklch(0.70 0 0);
--text-inverse: oklch(0.98 0 0);
--text-link: oklch(0.58 0.14 245);
--text-link-visited: oklch(0.55 0.08 285);
--text-danger: oklch(0.55 0.22 25);
--text-success: oklch(0.52 0.17 142);
--icon-default: oklch(0.40 0 0);
--icon-muted: oklch(0.62 0 0);
--icon-disabled: oklch(0.74 0 0);
```

#### 1.5 Overlay & Utility Colors (NEW)
```css
/* CRITICAL GAP #5 - Overlays & Shadows */
--overlay-background: oklch(0 0 0 / 0.5);
--overlay-light: oklch(1 0 0 / 0.8);
--shadow-elevation-1: 0 1px 2px oklch(0 0 0 / 0.08);
--shadow-elevation-5: 0 16px 32px oklch(0 0 0 / 0.25);
--border-default: oklch(0.87 0 0);
--border-focus: oklch(0.747 0.1309 124.48);
```

### Phase 2: Semantic Layer Complete Replacement

#### 2.1 Replace All MFB Mappings
**Files**: `src/styles/tokens/semantic.css`
- **REPLACE**: All `var(--mfb-*)` references with new `var(--brand-*)` or semantic tokens
- **UPDATE**: Primary/secondary/accent mappings to new brand colors
- **ENHANCE**: Focus system with context-specific variants

#### 2.2 Enhanced Focus System (NEW)
```css
/* CRITICAL GAP #3 - Comprehensive Focus */
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
--focus-ring-primary: var(--brand-primary-hsl);
--focus-ring-success: var(--semantic-success-hsl);
--focus-ring-error: var(--semantic-error-hsl);
--hover-focus-primary: var(--brand-primary-hover-hsl);
```

#### 2.3 CRM Entity Color Mapping (FRESH APPROACH)
**Priority System** (UX Improvement Opportunity):
```css
--priority-a-plus: var(--semantic-error-hsl);        /* Critical red */
--priority-a: var(--semantic-error-light-hsl);       /* High red-light */
--priority-b: var(--semantic-warning-hsl);           /* Medium orange */
--priority-c: var(--brand-primary-hsl);              /* Normal yellow-green */
--priority-d: var(--gray-500-hsl);                   /* Low gray */
```

**Organization Types** (Fresh Visual Hierarchy):
```css
--org-customer: var(--brand-accent-hsl);             /* Blue */
--org-distributor: var(--semantic-success-hsl);      /* Green */
--org-principal: var(--brand-secondary-hsl);         /* Purple */
--org-supplier: var(--brand-accent-light-hsl);       /* Light blue */
```

### Phase 3: Component System Overhaul

#### 3.1 Major Components Requiring Fresh Implementation
**Immediate UX Improvements**:

1. **Button System** (`src/components/ui/button-variants.ts`)
   - Fresh visual hierarchy with new brand colors
   - Enhanced interactive states (pressed, loading, disabled)
   - Improved focus management

2. **Badge System** (`src/components/ui/badge.variants.ts`)
   - Priority badges with enhanced visual distinction
   - Organization type indicators with new color mapping
   - Better accessibility with icon supplements

3. **Data Table System** (`src/components/data-table/`)
   - Fresh selection states with new primary color
   - Enhanced row hover states
   - Improved status indicators

4. **Form Components** (`src/components/forms/`)
   - New focus ring implementation
   - Enhanced disabled/readonly states
   - Better placeholder and helper text colors

#### 3.2 CRM-Specific Components (Fresh Clean Slate)
- **Priority Indicators**: Complete visual redesign with new color hierarchy
- **Organization Badges**: Fresh color coding with enhanced accessibility
- **Status Indicators**: Improved semantic color usage
- **Dashboard Cards**: New visual hierarchy with enhanced color system

### Phase 4: Tailwind Configuration Overhaul

#### 4.1 Complete MFB Removal
**Files**: `tailwind.config.js`
- **DELETE**: Entire 'mfb' color object (lines 110-128)
- **REMOVE**: All `var(--mfb-*)` references
- **CLEAN**: Legacy color definitions

#### 4.2 New Brand Integration
```javascript
colors: {
  brand: {
    DEFAULT: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    accent: "hsl(var(--accent))",
  },
  // Enhanced semantic colors with new mappings
}
```

### Phase 5: Technical Implementation

#### 5.1 OKLCH → HSL Conversion Utility
**New Implementation**:
```typescript
// src/lib/color-conversion.ts
function oklchToHsl(l: number, c: number, h: number): string {
  // Convert OKLCH → RGB → HSL
  // Return "h s% l%" format for CSS
}

// Generate all HSL fallbacks for browser compatibility
```

#### 5.2 Dark Mode Implementation
**Enhanced Dark Mode**:
- Adjust all primitives for dark theme
- Increase lightness by 5-10% for dark surfaces
- Flip grayscale system for proper contrast
- Maintain semantic color relationships

### Phase 6: Validation & Testing

#### 6.1 Color Accessibility Validation
**WCAG AAA Compliance**:
- Foreground/Background: ≥15:1 contrast (AAA+)
- Interactive elements: ≥7:1 contrast (AAA)
- Large text: ≥4.5:1 contrast (AA)
- Focus indicators: ≥3:1 contrast (minimum)

#### 6.2 Component Testing Strategy
**Visual Regression Testing**:
- All button states and variants
- Form input states (focus, disabled, error)
- Data table row states and selection
- Badge and indicator components
- Modal and dialog overlays

#### 6.3 Color Blindness Validation (Future Enhancement)
**Testing Protocol**:
- Protanopia (red-blind) simulation
- Deuteranopia (green-blind) simulation
- Tritanopia (blue-blind) simulation
- Ensure semantic color distinction without relying on color alone

## User Experience Impact

### Immediate Visual Changes
- **Fresh Brand Identity**: Complete visual refresh with new yellow-green primary
- **Enhanced Interactivity**: Improved button states, focus indicators, and hover effects
- **Better Hierarchy**: Clearer visual distinction between priority levels and organization types
- **Modern Aesthetics**: OKLCH color space provides more vibrant and consistent colors

### CRM-Specific Improvements
- **Priority System**: Enhanced visual hierarchy (Critical red → High orange → Medium yellow-green → Low gray)
- **Organization Types**: Fresh color coding with better semantic meaning
- **Data Tables**: Improved selection states and row interactions
- **Forms**: Better focus management and state indication

## Implementation Constraints

### Technical Requirements
- **No Gradual Migration**: Complete "big bang" replacement
- **Immediate Changes**: All updates must be user-facing immediately
- **Browser Compatibility**: Maintain HSL fallbacks for older browsers
- **Performance**: No impact on bundle size or runtime performance

### Breaking Changes (Acceptable)
- All existing color references will break
- Component appearances will change completely
- User interface will have fresh visual identity
- No backward compatibility with MFB color system

## Success Metrics

### Technical Validation
- [ ] Zero `--mfb-*` variable references in codebase
- [ ] All components using new semantic color system
- [ ] WCAG AAA compliance achieved for all color combinations
- [ ] Dark mode properly implemented with new color system
- [ ] HSL fallbacks generated for all OKLCH colors

### User Experience Validation
- [ ] Enhanced visual hierarchy across all CRM entities
- [ ] Improved interactive states and focus management
- [ ] Better accessibility with comprehensive color system
- [ ] Fresh modern appearance with new brand identity
- [ ] Seamless immediate deployment without user training

### Component Coverage
- [ ] Button system completely updated
- [ ] Badge and indicator systems fresh implementation
- [ ] Data table system with new selection states
- [ ] Form components with enhanced states
- [ ] Dashboard cards with new visual hierarchy

## Files Requiring Changes

### Core Token Files
- `src/styles/tokens/primitives.css` - Complete replacement
- `src/styles/tokens/semantic.css` - Complete MFB removal and new mappings
- `tailwind.config.js` - Remove MFB colors, add new brand system

### Component Files
- `src/components/ui/button-variants.ts` - Fresh color implementation
- `src/components/ui/badge.variants.ts` - New priority and organization colors
- `src/components/ui/*.tsx` - All UI components updated to new system
- `src/components/data-table/` - Selection states and row colors
- `src/components/forms/` - Focus states and interactive colors

### Utility Files
- `src/lib/color-conversion.ts` - New OKLCH → HSL utility
- `src/lib/design-token-utils.ts` - Updated token references
- `src/types/` - Updated color type definitions

## Timeline Expectation

### Single Implementation Phase
This is a **COMPLETE OVERHAUL** requiring:
1. **Day 1**: Remove all MFB colors and implement new primitives
2. **Day 1**: Update semantic mappings and component systems
3. **Day 1**: Test and validate all visual changes
4. **Day 1**: Deploy immediately with fresh visual identity

**No phased approach** - this is a fresh clean slate implementation with immediate user-facing changes and complete visual transformation of the CRM system.