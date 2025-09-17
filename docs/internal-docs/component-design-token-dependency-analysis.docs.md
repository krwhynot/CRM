# Component Design Token Dependency Analysis

Critical analysis of component dependency chains for design tokens, revealing significant architectural violations and parallel migration plan blockers in button variants, badge variants, and data table columns.

## Overview

Component analysis reveals a **fundamental architectural violation** where components use hardcoded Tailwind colors instead of semantic design tokens, despite proper token infrastructure being available. This creates a critical blocker for any parallel migration plan and requires immediate remediation before design system evolution can proceed safely.

## Relevant Files

### UI Component Variants (Mixed Compliance)
- `/src/components/ui/button-variants.ts`: **✅ GOOD** - Uses semantic tokens correctly (`bg-primary`, `text-primary-foreground`)
- `/src/components/ui/badge.variants.ts`: **⚠️ MIXED** - Uses semantic tokens but has hardcoded compound variants (`border-yellow-300`, `from-green-400`)
- `/src/components/ui/badge.tsx`: References badge variants with mixed token compliance

### Data Table Columns (Major Violations)
- `/src/components/data-table/columns/contacts.tsx`: **❌ CRITICAL** - Extensive hardcoded colors throughout authority badges, status indicators
- `/src/components/data-table/columns/organizations.tsx`: **❌ CRITICAL** - Hardcoded priority and organization type colors
- `/src/components/data-table/columns/opportunities.tsx`: **❌ LIKELY** - Pattern analysis suggests similar violations
- `/src/components/data-table/columns/interactions.tsx`: **❌ LIKELY** - Pattern analysis suggests similar violations
- `/src/components/data-table/columns/products.tsx`: **❌ LIKELY** - Pattern analysis suggests similar violations

### Design Token Infrastructure (Well-Implemented)
- `/src/styles/tokens/semantic.css`: **✅ COMPLETE** - All required CRM semantic tokens properly defined
- `/tailwind.config.js`: **✅ COMPLETE** - All semantic tokens mapped to Tailwind classes
- `/src/styles/tokens/primitives.css`: **✅ COMPLETE** - MFB brand color primitives with OKLCH/HSL variants

## Architectural Patterns

### **Current Token Infrastructure (Well-Designed)**
- **2-Layer Architecture**: Primitives → Semantic tokens properly implemented
- **CRM Domain Tokens**: Complete coverage for priorities, organization types, segments
- **Tailwind Integration**: Perfect mapping from semantic tokens to utility classes
- **Theme Support**: Full light/dark mode variants for all tokens

### **Component Usage Patterns (Severely Broken)**
- **Button Variants**: ✅ Correct semantic token usage (`bg-primary`, `text-destructive-foreground`)
- **Badge Variants**: ⚠️ Mixed patterns with some hardcoded fallbacks in compound variants
- **Data Table Columns**: ❌ Systematic violations using hardcoded Tailwind colors throughout

### **Available vs. Used Token Mapping**

#### Priority System
```css
/* AVAILABLE TOKENS */
--priority-a-plus: 0 84% 60%     /* Critical Priority → Red */
--priority-a: 0 74% 42%          /* High Priority → Solid Red */
--priority-b: 25 95% 53%         /* Medium Priority → Orange */
--priority-c: 45 93% 47%         /* Low Priority → Yellow */
--priority-d: 220 9% 46%         /* Minimal Priority → Gray */

/* TAILWIND CLASSES */
bg-priority-a, text-priority-a-foreground, border-priority-a
```

```typescript
/* COMPONENTS SHOULD USE */
<Badge className="bg-priority-a text-priority-a-foreground border-priority-a">A</Badge>

/* COMPONENTS ACTUALLY USE (VIOLATION) */
className={cn(
  priority === 'A'
    ? 'bg-red-100 text-red-800 border-red-300'  // ❌ HARDCODED
    : 'bg-gray-100 text-gray-700 border-gray-300'
)}
```

#### Organization Types
```css
/* AVAILABLE TOKENS */
--org-customer: 217 91% 60%      /* Customer → Blue */
--org-distributor: 142 71% 45%   /* Distributor → Green */
--org-principal: 262 83% 58%     /* Principal → Purple */
--org-supplier: 238 84% 67%      /* Supplier → Indigo */

/* TAILWIND CLASSES */
bg-organization-customer, text-organization-customer-foreground
```

```typescript
/* COMPONENTS SHOULD USE */
<Badge className="bg-organization-customer text-organization-customer-foreground">Customer</Badge>

/* COMPONENTS ACTUALLY USE (VIOLATION) */
className={cn(
  type === 'customer'
    ? 'bg-blue-100 text-blue-800 border-blue-300'  // ❌ HARDCODED
    : 'bg-green-100 text-green-800 border-green-300'
)}
```

## Edge Cases & Gotchas

### **Critical Architecture Violations**
- **Semantic Token Bypass**: Components directly use hardcoded Tailwind colors instead of semantic tokens
- **Brand Inconsistency**: Hardcoded colors break MFB brand color relationships and dark mode support
- **Theme Breaking**: Direct color usage prevents proper light/dark theme transitions
- **Maintenance Overhead**: Changes require updates across multiple hardcoded locations instead of single token definitions

### **Badge Compound Variant Issues**
```typescript
// ❌ VIOLATION: Hardcoded compound variants in badge.variants.ts (lines 64, 70)
{
  priority: 'a-plus',
  orgType: 'customer',
  className: 'border-yellow-300 bg-gradient-to-r from-yellow-400 to-orange-500'  // ❌ HARDCODED
}
```

### **Data Table Column Systematic Violations**
```typescript
// ❌ CRITICAL: Hardcoded colors throughout contacts.tsx
const EmptyCell = () => <span className="italic text-gray-400">Not provided</span>  // Should use text-muted

// ❌ Authority badges with hardcoded colors
purchaseInfluence === 'High'
  ? 'bg-green-100 text-green-800 border-green-300'  // Should use bg-success text-success-foreground
  : purchaseInfluence === 'Medium'
    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'  // Should use bg-warning text-warning-foreground
    : 'bg-red-100 text-red-800 border-red-300'  // Should use bg-destructive text-destructive-foreground

// ❌ Status badges with hardcoded colors
<Badge className="border-green-200 bg-green-50 text-green-700">High Value</Badge>  // Should use success variant
<Badge className="border-orange-200 bg-orange-50 text-orange-700">Follow-up</Badge>  // Should use warning variant
```

### **Text Hierarchy Violations**
```typescript
// ❌ AVAILABLE TEXT TOKENS NOT USED
--text-primary: 240 10% 10%      /* Main headings - 15.8:1 ratio */
--text-body: 240 5% 20%          /* Body text - 12.6:1 ratio */
--text-muted: 240 3% 35%         /* Muted text - 7.5:1 ratio */
--text-disabled: 240 2% 55%      /* Disabled text - 4.5:1 ratio */

// ❌ COMPONENTS USE HARDCODED INSTEAD
className="text-gray-400"        // Should use text-muted
className="text-gray-600"        // Should use text-body
className="text-blue-600"        // Should use semantic link color
```

### **Parallel Migration Plan Blockers**
- **Foundation Instability**: Cannot migrate design system when components don't use existing token infrastructure
- **Breaking Changes Risk**: Any token updates would miss hardcoded component colors
- **Testing Blind Spots**: Component color changes wouldn't be caught by design token tests
- **Theme Incompatibility**: Hardcoded colors prevent proper theme provider functionality

## Relevant Docs

### Internal Architecture Documentation
- `/docs/internal-docs/design-token-architecture-analysis.docs.md`: Comprehensive 2-layer vs 4-layer architecture analysis
- `/src/styles/design-tokens.md`: Complete design token documentation with usage guidelines
- `/CLAUDE.md`: Project guidelines emphasizing semantic token usage patterns

### Design System References
- [shadcn/ui Badge Component](https://ui.shadcn.com/docs/components/badge): Semantic variant patterns
- [shadcn/ui Button Component](https://ui.shadcn.com/docs/components/button): Correct semantic token implementation
- [Tailwind CSS Variables](https://tailwindcss.com/docs/customizing-colors#using-css-variables): CSS variable integration best practices

### Critical Remediation Priority
This analysis reveals that **any parallel migration plan will fail** until component token compliance is restored. The infrastructure exists and is well-designed, but components systematically violate the token architecture, creating maintenance debt and theme incompatibility that must be resolved before design system evolution can proceed safely.