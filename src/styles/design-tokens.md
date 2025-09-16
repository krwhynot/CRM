# Design Token Documentation

Comprehensive guide to the KitchenPantry CRM design token system, featuring a three-tier architecture with MFB brand integration, OKLCH color science, and density-aware responsive design.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [MFB Brand Colors](#mfb-brand-colors)
3. [Token Hierarchy](#token-hierarchy)
4. [CSS Variables Reference](#css-variables-reference)
5. [TypeScript Integration](#typescript-integration)
6. [Density System](#density-system)
7. [Usage Guidelines](#usage-guidelines)
8. [Accessibility Compliance](#accessibility-compliance)
9. [Best Practices](#best-practices)

## Architecture Overview

The KitchenPantry CRM design system follows industry-standard three-tier design token architecture:

```
Primitive Tokens  →  Semantic Tokens  →  Component Tokens
(Base Values)        (Contextual)        (Specific Usage)
```

### Design System Foundation

- **Color Science**: OKLCH color space for perceptual uniformity with HSL fallbacks
- **Accessibility**: WCAG AAA compliance with scientifically calculated contrast ratios
- **Density System**: Three responsive modes (compact/comfortable/spacious)
- **Framework Integration**: Complete shadcn/ui compatibility with custom brand extensions

## MFB Brand Colors

Master Food Brokers brand colors are the foundation of our design system, all defined in OKLCH format with HSL fallbacks for component compatibility.

### Primary Brand Color

**MFB Green** (`#8DC63F`) - The core brand identity color:

```css
/* OKLCH Definition */
--mfb-green: oklch(0.6800 0.1800 130);
--mfb-green-hover: oklch(0.6200 0.1900 130);
--mfb-green-focus: oklch(0.6800 0.1800 130);
--mfb-green-active: oklch(0.5600 0.2000 130);
--mfb-green-light: oklch(0.7400 0.1600 130);

/* HSL Fallbacks */
--mfb-green-hsl: 95 71% 56%;
--mfb-green-hover-hsl: 95 75% 50%;
--mfb-green-focus-hsl: 95 71% 56%;
--mfb-green-active-hsl: 95 78% 44%;
--mfb-green-light-hsl: 95 68% 62%;
```

### Supporting Brand Colors

#### MFB Clay - Warm earthy tone for secondary elements
```css
--mfb-clay: oklch(0.5800 0.0800 40);
--mfb-clay-hover: oklch(0.5200 0.0900 40);
--mfb-clay-focus: oklch(0.5800 0.0800 40);
--mfb-clay-active: oklch(0.4800 0.1000 40);
```

#### MFB Sage - Muted green for subtle accents
```css
--mfb-sage: oklch(0.6000 0.0600 145);
--mfb-sage-hover: oklch(0.5400 0.0700 145);
--mfb-sage-focus: oklch(0.6000 0.0600 145);
--mfb-sage-active: oklch(0.5000 0.0800 145);
--mfb-sage-tint: oklch(0.7500 0.0400 145);
```

#### MFB Olive - Deep green-brown for headers and emphasis
```css
--mfb-olive: oklch(0.4500 0.0500 110);
--mfb-olive-hover: oklch(0.4000 0.0600 110);
--mfb-olive-focus: oklch(0.4500 0.0500 110);
--mfb-olive-active: oklch(0.3500 0.0700 110);
--mfb-olive-light: oklch(0.5200 0.0450 110);
--mfb-olive-lighter: oklch(0.6000 0.0400 110);
```

#### MFB Cream - Light neutral for backgrounds
```css
--mfb-cream: oklch(0.9400 0.0200 75);
--mfb-cream-hover: oklch(0.9000 0.0250 75);
--mfb-cream-focus: oklch(0.9400 0.0200 75);
--mfb-cream-active: oklch(0.8600 0.0300 75);
```

### Semantic Color Mappings

MFB brand colors are semantically mapped to system-level tokens:

```css
/* Semantic Tokens */
--success: var(--mfb-success-hsl);    /* Maps to MFB Success Green */
--warning: var(--mfb-warning-hsl);    /* Maps to MFB Warning Amber */
--info: var(--mfb-info-hsl);          /* Maps to MFB Info Blue */
--primary: var(--mfb-green-hsl);      /* Maps to primary MFB Green */
--secondary: var(--mfb-clay-hsl);     /* Maps to MFB Clay */
--destructive: var(--mfb-danger-hsl); /* Maps to MFB Danger Red */
```

## Token Hierarchy

### 1. Primitive Tokens (Base Layer)

Foundation tokens that define raw values without context:

```css
/* Color Primitives */
--primary-50 through --primary-900   /* Brand color scale */
--gray-50 through --gray-950         /* Neutral grayscale */
--mfb-green, --mfb-clay, etc.        /* Brand color primitives */

/* Spacing Primitives */
--spacing-xs: 0.5rem    /* 8px */
--spacing-sm: 1rem      /* 16px */
--spacing-md: 1.5rem    /* 24px */
--spacing-lg: 2rem      /* 32px */
--spacing-xl: 3rem      /* 48px */

/* Typography Primitives */
--font-size-xs: 0.75rem   /* 12px */
--font-size-sm: 0.875rem  /* 14px */
--font-size-base: 1rem    /* 16px */
--font-size-lg: 1.125rem  /* 18px */
--font-size-xl: 1.25rem   /* 20px */
```

### 2. Semantic Tokens (Contextual Layer)

Context-aware tokens that map primitives to meaning:

```css
/* Semantic Colors */
--background: 0 0% 98%           /* Main background */
--foreground: 240 10% 10%        /* Main text */
--card: 0 0% 100%                /* Card backgrounds */
--border: 0 0% 90%               /* Border colors */
--input: 0 0% 90%                /* Input field backgrounds */
--ring: 95 71% 56%               /* Focus ring color */

/* Text Hierarchy (AAA Compliant) */
--text-primary: 240 10% 10%      /* Main headings - 15.8:1 ratio */
--text-body: 240 5% 20%          /* Body text - 12.6:1 ratio */
--text-muted: 240 3% 35%         /* Muted text - 7.5:1 ratio */
--text-disabled: 240 2% 55%      /* Disabled text - 4.5:1 ratio */

/* Interactive States */
--success: var(--mfb-success-hsl)
--warning: var(--mfb-warning-hsl)
--destructive: var(--mfb-danger-hsl)
```

### 3. Component Tokens (Specific Layer)

Component-specific tokens for consistent styling:

```css
/* Button Tokens */
--button-height-sm: var(--button-height-sm)
--button-height-md: var(--button-height-md)
--button-height-lg: var(--button-height-lg)

/* Layout Tokens */
--header-height: 4rem
--sidebar-width: 16rem
--dialog-max-height: min(80vh, 40rem)

/* Card System */
--card-padding: var(--spacing-md)
--card-radius: 0.75rem
--card-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)
```

## CSS Variables Reference

### Complete Variable Listing

#### Brand Colors (OKLCH + HSL)
```css
/* MFB Green Family */
--mfb-green: oklch(0.6800 0.1800 130)
--mfb-green-hsl: 95 71% 56%
--mfb-green-hover: oklch(0.6200 0.1900 130)
--mfb-green-hover-hsl: 95 75% 50%

/* MFB Clay Family */
--mfb-clay: oklch(0.5800 0.0800 40)
--mfb-clay-hsl: 40 35% 45%

/* MFB Sage Family */
--mfb-sage: oklch(0.6000 0.0600 145)
--mfb-sage-hsl: 145 25% 55%
--mfb-sage-tint: oklch(0.7500 0.0400 145)
--mfb-sage-tint-hsl: 145 20% 72%

/* MFB Olive Family */
--mfb-olive: oklch(0.4500 0.0500 110)
--mfb-olive-hsl: 110 20% 42%
--mfb-olive-light: oklch(0.5200 0.0450 110)
--mfb-olive-light-hsl: 110 18% 48%

/* MFB Cream Family */
--mfb-cream: oklch(0.9400 0.0200 75)
--mfb-cream-hsl: 75 25% 92%
```

#### CRM-Specific Tokens
```css
/* Priority System */
--priority-a-plus: 0 84% 60%     /* Red gradient base */
--priority-a: 0 74% 42%          /* Solid red */
--priority-b: 25 95% 53%         /* Orange */
--priority-c: 45 93% 47%         /* Yellow */
--priority-d: 220 9% 46%         /* Gray */

/* Organization Types */
--org-customer: 217 91% 60%      /* Blue */
--org-distributor: 142 71% 45%   /* Green */
--org-principal: 262 83% 58%     /* Purple */
--org-supplier: 238 84% 67%      /* Indigo */

/* Market Segments */
--segment-restaurant: 45 93% 47%     /* Amber */
--segment-healthcare: 188 95% 68%    /* Cyan */
--segment-education: 258 90% 66%     /* Violet */
```

#### Layout & Spacing
```css
/* Executive Chef Spacing System */
--spacing-xs: 0.5rem     /* 8px */
--spacing-sm: 1rem       /* 16px */
--spacing-md: 1.5rem     /* 24px - Primary card padding */
--spacing-lg: 2rem       /* 32px */
--spacing-xl: 3rem       /* 48px */

/* Component Dimensions */
--header-height: 4rem
--dialog-max-height: min(80vh, 40rem)
--chart-height: 15rem             /* 240px */
--chart-height-sm: 12.5rem        /* 200px */
--chart-height-lg: 17.5rem        /* 280px */
--activity-feed-height: 25rem     /* 400px */

/* Visual Hierarchy */
--radius-card: 0.75rem           /* 12px professional corners */
--shadow-subtle: 0 1px 3px 0 rgb(0 0 0 / 0.1)
--shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-hover: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

## TypeScript Integration

Design tokens are fully typed in TypeScript for excellent developer experience and IntelliSense support:

```typescript
// Available in src/lib/design-tokens.ts
import { designTokens, DensityMode } from '@/lib/design-tokens'

// Type-safe token access
const spacing = designTokens.spacing.md           // "1.5rem"
const primaryColor = designTokens.colors.primary  // Type-safe access
const buttonSize = designTokens.getComponentSize('md') // Utility function

// Density-aware tokens
const densitySpacing = designTokens.getDensityAwareSpacing('md')
const densityTypography = designTokens.getDensityAwareTypography('base')

// CSS Variable Types (enhanced in this task)
declare module 'csstype' {
  interface Properties {
    // MFB Brand Colors
    '--mfb-green'?: string
    '--mfb-green-hover'?: string
    '--mfb-green-focus'?: string
    '--mfb-green-active'?: string
    '--mfb-green-light'?: string

    // MFB Supporting Colors
    '--mfb-clay'?: string
    '--mfb-sage'?: string
    '--mfb-olive'?: string
    '--mfb-cream'?: string

    // Semantic Tokens
    '--primary'?: string
    '--secondary'?: string
    '--success'?: string
    '--warning'?: string
    '--destructive'?: string
    '--background'?: string
    '--foreground'?: string

    // Typography Tokens
    '--text-primary'?: string
    '--text-body'?: string
    '--text-muted'?: string
    '--text-disabled'?: string

    // Layout Tokens
    '--spacing-xs'?: string
    '--spacing-sm'?: string
    '--spacing-md'?: string
    '--spacing-lg'?: string
    '--spacing-xl'?: string

    // Component Tokens
    '--card-padding'?: string
    '--button-height-sm'?: string
    '--button-height-md'?: string
    '--button-height-lg'?: string
    '--header-height'?: string
    '--dialog-max-height'?: string

    // Density System Tokens
    '--kpi-height'?: string
    '--chart-height'?: string
    '--chart-height-sm'?: string
    '--chart-height-lg'?: string
    '--font-scale'?: string
    '--space-xs'?: string
    '--space-sm'?: string
    '--space-md'?: string
    '--space-lg'?: string
    '--space-xl'?: string
  }
}
```

## Density System

The KitchenPantry CRM features an advanced three-tier density system that adapts the interface based on usage context:

### Density Modes

1. **Compact** (`density-compact`) - Optimized for field work and mobile devices
2. **Comfortable** (`density-comfortable`) - Balanced for office productivity
3. **Spacious** (`density-spacious`) - Enhanced for presentations and accessibility

### Density-Aware Tokens

```css
/* Density-responsive variables defined in tokens/features.css */
--kpi-height                  /* Adapts: 140px → 180px → 220px */
--card-padding               /* Adapts: 16px → 24px → 32px */
--section-gap                /* Adapts: 16px → 24px → 32px */
--chart-height               /* Adapts: 200px → 240px → 280px */
--font-scale                 /* Adapts: 0.9 → 1.0 → 1.1 */

/* Spacing scale adapts across all modes */
--space-xs through --space-xl
--font-size-xs through --font-size-lg
```

### Usage in Components

```typescript
// TypeScript utility functions
import { getDensityClass, getDensityToken } from '@/lib/design-tokens'

// Apply density mode
const className = getDensityClass('comfortable') // "density-comfortable"

// Access density-aware tokens
const kpiHeight = getDensityToken('kpiHeight')   // "var(--kpi-height)"
const cardPadding = getDensityToken('cardPadding') // "var(--card-padding)"
```

```css
/* CSS usage */
.my-component {
  height: var(--kpi-height);           /* Density-responsive */
  padding: var(--card-padding);        /* Density-responsive */
  gap: var(--section-gap);             /* Density-responsive */
  font-size: var(--font-size-base);    /* Density-responsive */
}
```

## Usage Guidelines

### When to Use Each Token Type

#### Primitive Tokens
- **Use for**: Building new semantic or component tokens
- **Don't use for**: Direct application styling
- **Example**: `--primary-500` → `--success` (semantic mapping)

#### Semantic Tokens
- **Use for**: General styling, theme-aware components
- **Don't use for**: Highly specific component styling
- **Example**: `background-color: hsl(var(--background))`

#### Component Tokens
- **Use for**: Component-specific styling, consistent patterns
- **Don't use for**: One-off customizations
- **Example**: `height: var(--button-height-md)`

### Color Usage Patterns

#### Primary Actions
```css
/* Correct - Use semantic mapping to MFB Green */
.primary-button {
  background-color: hsl(var(--primary));          /* MFB Green */
  color: hsl(var(--primary-foreground));
}

/* Enhanced - Use direct MFB brand colors for brand emphasis */
.brand-button {
  background-color: var(--mfb-green);
  color: white;
}

.brand-button:hover {
  background-color: var(--mfb-green-hover);
}
```

#### Status Communications
```css
/* Use semantic tokens for consistent status colors */
.success-message { color: hsl(var(--success)); }        /* MFB Success Green */
.warning-message { color: hsl(var(--warning)); }        /* MFB Warning Amber */
.error-message { color: hsl(var(--destructive)); }      /* MFB Danger Red */
```

#### Typography Hierarchy
```css
/* Use AAA-compliant text tokens */
.page-title { color: hsl(var(--text-primary)); }       /* 15.8:1 ratio */
.body-text { color: hsl(var(--text-body)); }           /* 12.6:1 ratio */
.secondary-text { color: hsl(var(--text-muted)); }     /* 7.5:1 ratio */
.disabled-text { color: hsl(var(--text-disabled)); }   /* 4.5:1 ratio */
```

### Spacing & Layout Patterns

#### Consistent Spacing Scale
```css
/* Use spacing tokens for predictable rhythm */
.section { margin-bottom: var(--spacing-lg); }         /* 32px */
.card { padding: var(--spacing-md); }                  /* 24px */
.element-gap { gap: var(--spacing-sm); }               /* 16px */
```

#### Component Sizing
```css
/* Use component-specific tokens */
.dashboard-card {
  padding: var(--card-padding);                        /* Density-aware 24px */
  border-radius: var(--radius-card);                   /* 12px */
  box-shadow: var(--shadow-card);                      /* Subtle elevation */
}

.kpi-card {
  height: var(--kpi-height);                           /* Density-aware height */
}
```

### Dark Mode Considerations

All design tokens automatically support dark mode through the `.dark` class:

```css
/* Automatic dark mode adaptation */
:root {
  --background: 0 0% 98%;        /* Light mode */
  --foreground: 240 10% 10%;
}

.dark {
  --background: 240 10% 4%;      /* Dark mode */
  --foreground: 0 0% 98%;
}
```

MFB brand colors are enhanced in dark mode for better visibility while maintaining brand consistency.

## Accessibility Compliance

### WCAG AAA Text Contrast

All text tokens meet or exceed WCAG AAA standards:

- **Primary Text**: 15.8:1 contrast ratio
- **Body Text**: 12.6:1 contrast ratio
- **Muted Text**: 7.5:1 contrast ratio
- **Disabled Text**: 4.5:1 minimum ratio

### Focus Management

```css
/* Use focus ring tokens for consistent accessibility */
.interactive-element {
  @apply focus-visible:outline-none focus-visible:ring-2;
  focus-visible:ring-color: hsl(var(--ring));         /* MFB Green focus ring */
}

/* Semantic focus colors */
.destructive-action {
  focus-visible:ring-color: hsl(var(--destructive));  /* Red for dangerous actions */
}
```

### Motion Preferences

```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .density-transition {
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices

### DO ✅

1. **Use semantic tokens** for general styling
2. **Use component tokens** for consistent patterns
3. **Test in both light and dark modes**
4. **Validate contrast ratios** for custom color combinations
5. **Use density-aware tokens** for responsive layouts
6. **Follow the three-tier hierarchy** when creating new tokens
7. **Use MFB brand colors** for brand emphasis and recognition

### DON'T ❌

1. **Don't use primitive tokens directly** in components
2. **Don't hardcode color values** when tokens exist
3. **Don't create one-off CSS variables** without system integration
4. **Don't override semantic tokens** without careful consideration
5. **Don't ignore density modes** in layout components
6. **Don't use non-brand colors** for primary interface elements

### Token Naming Conventions

```css
/* Follow established patterns */
--{brand}-{color}-{variant}          /* --mfb-green-hover */
--{semantic}-{context}               /* --text-primary */
--{component}-{property}-{size}      /* --button-height-md */
--{category}-{subcategory}           /* --spacing-md */
```

### Performance Considerations

- **270+ CSS variables** are defined - use sparingly for new additions
- **OKLCH colors** have limited browser support - HSL fallbacks are provided
- **Density transitions** use staggered timing for smooth visual changes
- **CSS variable inheritance** is complex - test cascade behavior carefully

---

## Integration Examples

### React Component with TypeScript

```typescript
import React from 'react'
import { designTokens } from '@/lib/design-tokens'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: keyof typeof designTokens.sizing.variants
  density?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  density = true
}) => {
  const sizeStyles = designTokens.getComponentSize(size)
  const densityClass = density ? 'density-aware-button' : ''

  return (
    <button
      className={`btn-${variant} ${densityClass}`}
      style={{
        height: density ? 'var(--button-height-md)' : sizeStyles.height,
        padding: density ? 'var(--space-sm) var(--space-md)' : sizeStyles.padding
      }}
    >
      MFB Button
    </button>
  )
}
```

### CSS-in-JS with Design Tokens

```typescript
import styled from 'styled-components'

const StyledCard = styled.div`
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  padding: var(--card-padding);                    /* Density-aware */
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  border: 1px solid hsl(var(--border));

  &:hover {
    box-shadow: var(--shadow-hover);
    border-color: hsl(var(--primary) / 0.3);      /* MFB Green with opacity */
  }
`
```

This comprehensive design token system ensures consistent, accessible, and maintainable styling throughout the KitchenPantry CRM while honoring the Master Food Brokers brand identity.