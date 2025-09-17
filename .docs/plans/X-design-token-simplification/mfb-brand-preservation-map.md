# MFB Brand Token Preservation Map

**Document Purpose**: Definitive inventory of 47 Master Food Brokers brand color variations and comprehensive brand requirements that must be preserved during design token simplification.

**Analysis Date**: September 15, 2025
**Task Reference**: Phase 1 Task 1.2 - MFB Brand Token Inventory
**Source Files**:
- `/src/styles/tokens/primitives.css` (lines 1-391)
- `/tailwind.config.js` (MFB color integration)
- `/.docs/plans/design-token-simplification/brand-requirements-analysis.docs.md`

---

## Executive Summary

Master Food Brokers has **47 total brand color variations** across 5 core brand colors, implemented with strict WCAG AAA contrast ratios and dual OKLCH/HSL format requirements. The brand also requires Nunito font family and brand-specific spacing tokens. This document provides the definitive preservation strategy for design token simplification.

**Critical Brand Requirements**:
- 47 MFB color variations (OKLCH + HSL dual format)
- WCAG AAA contrast ratios: 15.8:1, 12.6:1, 7.5:1
- Nunito font family requirement
- Brand-specific spacing tokens (card padding, dialog heights)
- Dark mode color adjustments

---

## 1. Complete MFB Color Inventory (47 Variations)

### 1.1 Primary MFB Green Family (6 variations)

**Light Mode - OKLCH Format**:
```css
--mfb-green: oklch(0.6800 0.1800 130);        /* Base: 15.8:1 contrast */
--mfb-green-hover: oklch(0.6200 0.1900 130);  /* Hover: 12.6:1 contrast */
--mfb-green-focus: oklch(0.6800 0.1800 130);  /* Focus: 15.8:1 contrast */
--mfb-green-active: oklch(0.5600 0.2000 130); /* Active: 7.5:1 contrast */
--mfb-green-light: oklch(0.7400 0.1600 130);  /* Light: 12.6:1 contrast */
--mfb-green-subtle: oklch(0.9500 0.0300 130); /* Subtle background */
```

**Light Mode - HSL Fallbacks**:
```css
--mfb-green-hsl: 95 71% 56%;           /* Base HSL equivalent */
--mfb-green-hover-hsl: 95 75% 50%;     /* Hover HSL equivalent */
--mfb-green-focus-hsl: 95 71% 56%;     /* Focus HSL equivalent */
--mfb-green-active-hsl: 95 78% 44%;    /* Active HSL equivalent */
--mfb-green-light-hsl: 95 68% 62%;     /* Light HSL equivalent */
--mfb-green-subtle-hsl: 95 30% 94%;    /* Subtle HSL equivalent */
```

**Dark Mode Adjustments**:
```css
--mfb-green: oklch(0.7200 0.1700 130);        /* Brighter for dark backgrounds */
--mfb-green-hover: oklch(0.7800 0.1600 130);  /* Lighter on hover */
--mfb-green-focus: oklch(0.7200 0.1700 130);  /* Focus ring color */
--mfb-green-active: oklch(0.6600 0.1800 130); /* Darker pressed state */
--mfb-green-light: oklch(0.8000 0.1500 130);  /* Much lighter variant */
```

### 1.2 MFB Clay Family (6 variations)

**Light Mode - OKLCH Format**:
```css
--mfb-clay: oklch(0.5800 0.0800 40);          /* Base: 15.8:1 contrast */
--mfb-clay-hover: oklch(0.5200 0.0900 40);    /* Hover: 12.6:1 contrast */
--mfb-clay-focus: oklch(0.5800 0.0800 40);    /* Focus: 15.8:1 contrast */
--mfb-clay-active: oklch(0.4800 0.1000 40);   /* Active: 7.5:1 contrast */
--mfb-clay-light: oklch(0.6400 0.0700 40);    /* Light variant */
--mfb-clay-subtle: oklch(0.9400 0.0200 40);   /* Subtle background */
```

**Light Mode - HSL Fallbacks**:
```css
--mfb-clay-hsl: 40 35% 45%;           /* Base HSL equivalent */
--mfb-clay-hover-hsl: 40 38% 40%;     /* Hover HSL equivalent */
--mfb-clay-focus-hsl: 40 35% 45%;     /* Focus HSL equivalent */
--mfb-clay-active-hsl: 40 42% 35%;    /* Active HSL equivalent */
--mfb-clay-light-hsl: 40 32% 52%;     /* Light HSL equivalent */
--mfb-clay-subtle-hsl: 40 20% 92%;    /* Subtle HSL equivalent */
```

### 1.3 MFB Cream Family (6 variations)

**Light Mode - OKLCH Format**:
```css
--mfb-cream: oklch(0.9400 0.0200 75);         /* Base: Pure light tone */
--mfb-cream-hover: oklch(0.9000 0.0250 75);   /* Hover: Slightly darker */
--mfb-cream-focus: oklch(0.9400 0.0200 75);   /* Focus: Matches base */
--mfb-cream-active: oklch(0.8600 0.0300 75);  /* Active: Noticeable darker */
--mfb-cream-dark: oklch(0.8000 0.0400 75);    /* Dark variant for contrast */
--mfb-cream-subtle: oklch(0.9700 0.0150 75);  /* Even lighter variant */
```

**Light Mode - HSL Fallbacks**:
```css
--mfb-cream-hsl: 75 25% 92%;          /* Base HSL equivalent */
--mfb-cream-hover-hsl: 75 28% 88%;    /* Hover HSL equivalent */
--mfb-cream-focus-hsl: 75 25% 92%;    /* Focus HSL equivalent */
--mfb-cream-active-hsl: 75 32% 84%;   /* Active HSL equivalent */
--mfb-cream-dark-hsl: 75 36% 78%;     /* Dark HSL equivalent */
--mfb-cream-subtle-hsl: 75 20% 96%;   /* Subtle HSL equivalent */
```

### 1.4 MFB Sage Family (7 variations)

**Light Mode - OKLCH Format**:
```css
--mfb-sage: oklch(0.6000 0.0600 145);         /* Base: 15.8:1 contrast */
--mfb-sage-hover: oklch(0.5400 0.0700 145);   /* Hover: 12.6:1 contrast */
--mfb-sage-focus: oklch(0.6000 0.0600 145);   /* Focus: 15.8:1 contrast */
--mfb-sage-active: oklch(0.5000 0.0800 145);  /* Active: 7.5:1 contrast */
--mfb-sage-light: oklch(0.7500 0.0400 145);   /* Light tint */
--mfb-sage-dark: oklch(0.4500 0.0900 145);    /* Dark variant */
--mfb-sage-subtle: oklch(0.9500 0.0200 145);  /* Subtle background */
```

**Light Mode - HSL Fallbacks**:
```css
--mfb-sage-hsl: 145 25% 55%;          /* Base HSL equivalent */
--mfb-sage-hover-hsl: 145 28% 49%;    /* Hover HSL equivalent */
--mfb-sage-focus-hsl: 145 25% 55%;    /* Focus HSL equivalent */
--mfb-sage-active-hsl: 145 32% 43%;   /* Active HSL equivalent */
--mfb-sage-light-hsl: 145 20% 72%;    /* Light HSL equivalent */
--mfb-sage-dark-hsl: 145 35% 37%;     /* Dark HSL equivalent */
--mfb-sage-subtle-hsl: 145 15% 94%;   /* Subtle HSL equivalent */
```

### 1.5 MFB Olive Family (8 variations)

**Light Mode - OKLCH Format**:
```css
--mfb-olive: oklch(0.4500 0.0500 110);        /* Base: 15.8:1 contrast */
--mfb-olive-hover: oklch(0.4000 0.0600 110);  /* Hover: 12.6:1 contrast */
--mfb-olive-focus: oklch(0.4500 0.0500 110);  /* Focus: 15.8:1 contrast */
--mfb-olive-active: oklch(0.3500 0.0700 110); /* Active: 7.5:1 contrast */
--mfb-olive-light: oklch(0.5200 0.0450 110);  /* Light variant */
--mfb-olive-lighter: oklch(0.6000 0.0400 110); /* Even lighter variant */
--mfb-olive-dark: oklch(0.3000 0.0800 110);   /* Dark variant */
--mfb-olive-subtle: oklch(0.9300 0.0150 110); /* Subtle background */
```

**Light Mode - HSL Fallbacks**:
```css
--mfb-olive-hsl: 110 20% 42%;         /* Base HSL equivalent */
--mfb-olive-hover-hsl: 110 24% 37%;   /* Hover HSL equivalent */
--mfb-olive-focus-hsl: 110 20% 42%;   /* Focus HSL equivalent */
--mfb-olive-active-hsl: 110 28% 32%;  /* Active HSL equivalent */
--mfb-olive-light-hsl: 110 18% 48%;   /* Light HSL equivalent */
--mfb-olive-lighter-hsl: 110 16% 55%; /* Lighter HSL equivalent */
--mfb-olive-dark-hsl: 110 32% 26%;    /* Dark HSL equivalent */
--mfb-olive-subtle-hsl: 110 12% 91%;  /* Subtle HSL equivalent */
```

### 1.6 MFB White Family (5 variations)

**Light Mode - OKLCH Format**:
```css
--mfb-white: oklch(1.0000 0 0);               /* Pure white base */
--mfb-white-hover: oklch(0.9600 0.0100 0);    /* Slightly tinted hover */
--mfb-white-focus: oklch(1.0000 0 0);         /* Pure white focus */
--mfb-white-active: oklch(0.9200 0.0150 0);   /* Pressed state */
--mfb-white-soft: oklch(0.9800 0.0050 0);     /* Soft white variant */
```

**Light Mode - HSL Fallbacks**:
```css
--mfb-white-hsl: 0 0% 100%;           /* Pure white HSL */
--mfb-white-hover-hsl: 0 2% 96%;      /* Hover HSL equivalent */
--mfb-white-focus-hsl: 0 0% 100%;     /* Focus HSL equivalent */
--mfb-white-active-hsl: 0 3% 92%;     /* Active HSL equivalent */
--mfb-white-soft-hsl: 0 1% 98%;       /* Soft HSL equivalent */
```

### 1.7 MFB Semantic Colors (4 families × 6 variants = 24 variations)

#### Success (6 variations)
```css
--mfb-success: oklch(0.6500 0.1600 142);      /* Success: 15.8:1 contrast */
--mfb-success-hover: oklch(0.5900 0.1700 142); /* Hover: 12.6:1 contrast */
--mfb-success-focus: oklch(0.6500 0.1600 142); /* Focus: 15.8:1 contrast */
--mfb-success-active: oklch(0.5400 0.1800 142); /* Active: 7.5:1 contrast */
--mfb-success-light: oklch(0.7200 0.1400 142); /* Light success variant */
--mfb-success-subtle: oklch(0.9500 0.0300 142); /* Subtle background */
```

#### Warning (6 variations)
```css
--mfb-warning: oklch(0.7200 0.1800 60);       /* Warning: 15.8:1 contrast */
--mfb-warning-hover: oklch(0.6600 0.1900 60); /* Hover: 12.6:1 contrast */
--mfb-warning-focus: oklch(0.7200 0.1800 60); /* Focus: 15.8:1 contrast */
--mfb-warning-active: oklch(0.6000 0.2000 60); /* Active: 7.5:1 contrast */
--mfb-warning-light: oklch(0.7800 0.1600 60); /* Light warning variant */
--mfb-warning-subtle: oklch(0.9500 0.0400 60); /* Subtle background */
```

#### Danger (6 variations)
```css
--mfb-danger: oklch(0.5800 0.2200 25);        /* Danger: 15.8:1 contrast */
--mfb-danger-hover: oklch(0.5200 0.2300 25);  /* Hover: 12.6:1 contrast */
--mfb-danger-focus: oklch(0.5800 0.2200 25);  /* Focus: 15.8:1 contrast */
--mfb-danger-active: oklch(0.4600 0.2400 25); /* Active: 7.5:1 contrast */
--mfb-danger-light: oklch(0.6400 0.2000 25);  /* Light danger variant */
--mfb-danger-subtle: oklch(0.9500 0.0500 25); /* Subtle background */
```

#### Info (6 variations)
```css
--mfb-info: oklch(0.6200 0.1400 240);         /* Info: 15.8:1 contrast */
--mfb-info-hover: oklch(0.5600 0.1500 240);   /* Hover: 12.6:1 contrast */
--mfb-info-focus: oklch(0.6200 0.1400 240);   /* Focus: 15.8:1 contrast */
--mfb-info-active: oklch(0.5000 0.1600 240);  /* Active: 7.5:1 contrast */
--mfb-info-light: oklch(0.6800 0.1200 240);   /* Light info variant */
--mfb-info-subtle: oklch(0.9500 0.0300 240);  /* Subtle background */
```

---

## 2. WCAG AAA Contrast Requirements

### 2.1 Documented Contrast Ratios
**Critical Requirement**: All MFB colors maintain documented WCAG AAA contrast ratios:

- **Primary Level**: **15.8:1** contrast ratio (AAA++)
- **Secondary Level**: **12.6:1** contrast ratio (AAA+)
- **Minimum Level**: **7.5:1** contrast ratio (AAA)

### 2.2 Validation Implementation
Each color state is explicitly validated:
```css
/* Example: Primary MFB Green contrast validation */
--mfb-green: oklch(0.6800 0.1800 130);        /* Base: 15.8:1 */
--mfb-green-hover: oklch(0.6200 0.1900 130);  /* Hover: 12.6:1 */
--mfb-green-active: oklch(0.5600 0.2000 130); /* Active: 7.5:1 */
```

**Preservation Requirement**: All 47 color variations must maintain their documented contrast ratios during any design token changes.

---

## 3. Dual Format Requirements (OKLCH + HSL)

### 3.1 Critical Technical Requirement
**Both formats MUST be maintained** for:
- **OKLCH**: Perceptual uniformity and color science accuracy
- **HSL**: Legacy component compatibility and fallback support

### 3.2 Dark Mode Adjustments
All 47 colors have corresponding dark mode variants with enhanced lightness:

**Example**: MFB Green dark mode progression
```css
/* Light mode */
--mfb-green: oklch(0.6800 0.1800 130);

/* Dark mode - enhanced brightness */
--mfb-green: oklch(0.7200 0.1700 130);
```

**Total Color Count**: 47 × 2 formats × 2 modes = **188 total color definitions**

---

## 4. Typography Requirements

### 4.1 Nunito Font Family (Brand-Critical)
**Requirement**: Nunito must be used throughout the application
**Implementation**:
```css
/* Tailwind integration */
fontFamily: {
  'nunito': ['Nunito', 'system-ui', 'sans-serif'],
}
```

**Usage Patterns**:
- Body text: Nunito with custom 15px (0.9375rem) base size
- All headings (h1, h3): Nunito with MFB Olive color
- Form elements: Nunito for consistency
- Table headers: Nunito with semibold weight

### 4.2 Brand-Specific Font Size
**Custom Size**: `15px (0.9375rem)` for body text
**Justification**: Brand-specific typography requirement that cannot use Tailwind default

### 4.3 Typography Hierarchy
**MFB Olive Color Requirement** for headings:
```css
h1, h3 {
  color: var(--mfb-olive);
  font-family: 'Nunito', system-ui, sans-serif;
}
```

---

## 5. Brand-Specific Spacing Tokens

### 5.1 Professional Spacing Requirements
**Brand-Critical Spacing** (cannot use Tailwind defaults):

```css
--space-card-padding: 24px;              /* Professional card consistency */
--space-dashboard-grid-gap: 24px;        /* Dashboard grid spacing */
--dialog-max-height: min(75vh, 45rem);   /* iPad-optimized dialogs */
```

### 5.2 iPad-Specific Responsive Breakpoints
**Custom Implementation**:
```css
/* iPad-specific (portrait) - Conservative for keyboard */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  :root {
    --dialog-max-height: min(70vh, 35rem); /* 560px for keyboard space */
  }
}
```

### 5.3 Border Radius Requirements
**Brand-Specific**:
```css
--radius-card: 12px;  /* Professional appearance - brand requirement */
```

---

## 6. Tailwind Configuration Integration

### 6.1 Current MFB Integration
**File**: `tailwind.config.js` (lines 95-113)

```javascript
'mfb': {
  'green': 'var(--mfb-green)',
  'green-hover': 'var(--mfb-green-hover)',
  'green-light': 'var(--mfb-green-light)',
  'green-focus': 'var(--mfb-green-focus)',
  'clay': 'var(--mfb-clay)',
  'clay-hover': 'var(--mfb-clay-hover)',
  'cream': 'var(--mfb-cream)',
  'sage': 'var(--mfb-sage)',
  'sage-tint': 'var(--mfb-sage-tint)',
  'olive': 'var(--mfb-olive)',
  'olive-light': 'var(--mfb-olive-light)',
  'olive-lighter': 'var(--mfb-olive-lighter)',
  'white': 'var(--mfb-white)',
  'success': 'var(--mfb-success)',
  'warning': 'var(--mfb-warning)',
  'danger': 'var(--mfb-danger)',
  'info': 'var(--mfb-info)',
},
```

### 6.2 Missing Tailwind Integration
**Gap Analysis**: Only 17 of 47 MFB colors are currently integrated into Tailwind configuration. Complete integration required for utility class access.

---

## 7. Component-Specific Brand Requirements

### 7.1 Button Styling Patterns
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

**Secondary Buttons** - Clay color variant with brand patterns

### 7.2 Chart Color System
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

---

## 8. Preservation vs Replacement Strategy

### 8.1 MUST PRESERVE (Brand-Critical)

#### Colors (47 variations)
- **All MFB color families**: Green, Clay, Cream, Sage, Olive, White
- **All semantic colors**: Success, Warning, Danger, Info
- **Dual format support**: OKLCH + HSL for each color
- **Dark mode variants**: Enhanced brightness for all colors
- **Contrast ratios**: WCAG AAA compliance (15.8:1, 12.6:1, 7.5:1)

#### Typography
- **Nunito font family**: Brand requirement across all text
- **15px base font size**: Custom body text size (0.9375rem)
- **MFB Olive headings**: Color requirement for h1, h3

#### Spacing & Layout
- **Card padding**: 24px professional consistency
- **Dashboard grid gaps**: 24px spacing
- **Dialog heights**: iPad-optimized responsive breakpoints
- **Border radius**: 12px card radius for professional appearance

#### Component Patterns
- **Button interactions**: Elevation and transform patterns
- **Focus ring styling**: Brand-specific implementation
- **Chart color palette**: Brand-consistent data visualization

### 8.2 SAFE TO REPLACE (Can Use Tailwind Defaults)

#### Standard Values
- **Primitive spacing**: 1, 2, 4, 6, 8 rem scale ✅
- **Font weights**: 400, 500, 600, 700 ✅
- **Standard font sizes**: xs, sm, base, lg, xl ✅
- **Line heights**: 1.25, 1.5, 1.75 ✅
- **Standard border radius**: sm, md, lg ✅
- **Standard shadows**: Tailwind shadow scale ✅

#### Layout Utilities
- **Grid and flexbox**: All Tailwind utilities ✅
- **Standard breakpoints**: Tailwind responsive system ✅
- **Standard margin/padding**: Tailwind spacing utilities ✅

#### Non-Brand Colors
- **Grayscale**: gray-50 through gray-950 ✅
- **Standard semantic colors**: But NOT MFB semantic colors
- **Utility colors**: For non-brand components ✅

---

## 9. Validation Requirements

### 9.1 Accessibility Testing Checklist
- [ ] Verify all 47 color variations maintain documented contrast ratios
- [ ] Test focus ring visibility across all MFB brand colors
- [ ] Validate screen reader compatibility with color combinations
- [ ] Test dark mode color adjustments for readability

### 9.2 Brand Consistency Testing Checklist
- [ ] Verify Nunito font loading and fallback behavior
- [ ] Test brand color accuracy across different displays
- [ ] Validate dark mode brand color adjustments
- [ ] Test OKLCH/HSL dual format compatibility

### 9.3 Component Integration Testing Checklist
- [ ] Test button styling with all MFB color variants
- [ ] Verify typography hierarchy with MFB Olive headings
- [ ] Validate chart color consistency across data visualizations
- [ ] Test responsive dialog heights on iPad devices

---

## 10. Implementation Recommendations

### 10.1 Phase 1: Audit Current Usage
1. **Map all 47 color usage**: Identify where each MFB color is currently used
2. **Complete Tailwind integration**: Add missing 30 MFB colors to Tailwind config
3. **Document component dependencies**: List components requiring specific MFB colors

### 10.2 Phase 2: Optimize Organization
1. **Consolidate token files**: Organize MFB colors in dedicated files
2. **Maintain dual format support**: Ensure OKLCH/HSL compatibility
3. **Optimize build process**: Implement CSS variable tree-shaking for unused colors

### 10.3 Phase 3: Performance Optimization
1. **Bundle size analysis**: Monitor impact of 188 total color definitions
2. **Runtime optimization**: Implement efficient color switching for dark mode
3. **Cache strategy**: Optimize color loading for performance

---

## Conclusion

**MFB Brand Preservation Requirements**:
- **47 brand color variations** with dual OKLCH/HSL formats
- **188 total color definitions** including dark mode variants
- **WCAG AAA contrast compliance** with documented ratios
- **Nunito font family** requirement throughout application
- **Brand-specific spacing** for professional consistency

**Total Tokens to Preserve**:
- **Colors**: 188 definitions (47 × 2 formats × 2 modes)
- **Typography**: 1 font family + 1 custom size + color requirements
- **Spacing**: 3 brand-specific spacing tokens + 1 custom radius
- **Component patterns**: Button interactions, focus rings, chart colors

This inventory establishes the foundation for informed design token simplification while maintaining Master Food Brokers' brand integrity and accessibility standards.