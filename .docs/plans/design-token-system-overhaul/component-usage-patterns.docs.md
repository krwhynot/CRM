# Component Usage Patterns Research

Research analysis of component usage patterns and MFB color references throughout the CRM codebase to inform the design token system overhaul.

## Relevant Files

### Design Token Variant Systems (Well-Architected)
- `/src/components/ui/button-variants.ts`: CVA variants using semantic tokens (primary, destructive, success, warning)
- `/src/components/ui/badge.variants.ts`: Comprehensive badge system with priority, orgType, segment, status, influence variants
- `/src/components/ui/priority-indicator.variants.ts`: Priority indicator with semantic token usage
- `/src/components/ui/status-indicator.variants.ts`: Status indicators using design system variables

### Chart Color System (Exemplary Implementation)
- `/src/components/dashboard/chart-colors.ts`: CSS variable-based chart colors with getCSSVar helper function
- `/src/styles/tokens/semantic.css`: Semantic token definitions mapping MFB primitives
- `/src/styles/tokens/primitives.css`: MFB brand primitive tokens in OKLCH format

### Theme Provider & Theming
- `/src/components/theme-provider.tsx`: Enhanced theme provider with DOM class management
- `/src/contexts/ThemeContext.tsx`: Theme context with light/dark/system modes
- `/src/hooks/use-theme.ts`: Theme hook for component consumption

### Components with Hardcoded Colors (High Priority Migration)
- `/src/components/data-table/columns/organizations.tsx`: 11 hardcoded color instances (bg-red-100, bg-green-500, etc.)
- `/src/components/data-table/columns/interactions.tsx`: Entity table with hardcoded status colors
- `/src/components/data-table/columns/opportunities.tsx`: Pipeline status colors hardcoded
- `/src/components/data-table/columns/contacts.tsx`: Contact status and priority colors
- `/src/components/data-table/columns/products.tsx`: Product category and status colors
- `/src/features/interactions/components/timeline/TimelineItems.tsx`: Timeline interaction colors
- `/src/features/import-export/wizard/components/SmartPreviewComponent.tsx`: Import status colors

### Form Components (Medium Priority)
- `/src/components/forms/FormField.tsx`: Uses design system through shadcn/ui primitives
- `/src/components/forms/SimpleForm.tsx`: Well-integrated with semantic tokens
- `/src/components/forms/FormInput.tsx`: Leverages existing token system

### Entity List Components (Medium Priority)
- `/src/features/organizations/components/OrganizationsList.tsx`: Some hardcoded colors for status indicators
- `/src/features/contacts/components/ContactsList.tsx`: Contact status and engagement colors
- `/src/features/products/components/ProductsList.tsx`: Product category hardcoded colors

## Architectural Patterns

### Well-Implemented Design Token Usage
- **CVA Pattern**: Class Variance Authority used consistently in variant files with semantic token references
- **Chart Colors**: Exemplary implementation using `getCSSVar()` helper and CSS custom properties
- **Badge System**: Comprehensive variant system with compound variants for complex combinations
- **Theme Integration**: Proper light/dark mode support with CSS class-based switching

### MFB Brand Token Architecture (Already Established)
- **2-Layer Architecture**: Primitives (`--mfb-green`) → Semantic (`--primary`) mapping
- **OKLCH Format**: All primitive colors use OKLCH for perceptual uniformity and wide gamut support
- **Contrast Compliance**: Built-in contrast ratios documented (15.8:1, 12.6:1, 7.5:1)
- **State Variants**: Hover, focus, active states defined for all brand colors

### Data Flow Pattern
- **Primitives** (`/src/styles/tokens/primitives.css`): MFB brand colors in OKLCH
- **Semantic** (`/src/styles/tokens/semantic.css`): Business context mapping (primary, success, warning, etc.)
- **Component Variants** (`/src/components/ui/*.variants.ts`): CVA implementations referencing semantics
- **Component Usage**: Direct semantic token consumption in components

## Edge Cases & Gotchas

### Hardcoded Color Patterns Found
- **Entity Tables**: Extensive use of `bg-green-100 text-green-800` pattern in data table columns
- **Status Indicators**: Direct Tailwind color classes for success/warning/error states
- **Compound Variants**: Some badge.variants.ts uses hardcoded gradient combinations for special cases
- **Timeline Components**: Interaction type colors hardcoded for visual differentiation

### Legacy Workarounds
- **Badge Compound Variants**: Lines 60-72 in badge.variants.ts use hardcoded gradient classes for A+ priority customers
- **Chart Color Legacy**: cssVariables export in chart-colors.ts maintains backward compatibility
- **Priority Indicator Inconsistency**: Uses `organization-customer` token for medium priority (line 10-11)

### Migration Challenges
- **25+ Files with Hardcoded Colors**: Systematic replacement needed across entity components
- **Gradient Combinations**: Special visual effects may need new semantic token definitions
- **Status Color Consistency**: Different components use different color schemes for similar states

## Relevant Docs

### Internal Documentation
- `/src/styles/design-tokens.md`: Current design token documentation
- `/docs/DESIGN_TOKEN_HIERARCHY.md`: Token hierarchy documentation
- `/docs/DESIGN_TOKEN_GOVERNANCE.md`: Token governance guidelines

### External Standards
- [CSS Custom Properties Specification](https://www.w3.org/TR/css-variables-1/): CSS variable implementation
- [OKLCH Color Space](https://oklch.com/): Color format used in primitives
- [Class Variance Authority](https://cva.style/docs): CVA pattern documentation

## Migration Priorities

### Priority 1: High Impact (Immediate)
1. **Data Table Columns** (5 files): Most visible hardcoded colors in primary UI
2. **Entity Status Indicators**: Inconsistent status color usage across components
3. **Timeline Components**: User-facing interaction visualizations

### Priority 2: Medium Impact
1. **Import/Export Wizard**: Functional but less frequently used
2. **Entity List Components**: Secondary views with some hardcoded elements
3. **Form Component Enhancements**: Already well-integrated, minor improvements

### Priority 3: Low Impact (Future Enhancement)
1. **Compound Variant Refinement**: Special case gradients and combinations
2. **Chart Color Expansion**: Additional semantic mappings for new chart types
3. **Legacy Support Cleanup**: Remove backward compatibility exports

## Impact Assessment

### Development Impact
- **25+ Component Files**: Require systematic color class replacement
- **Token Addition Needed**: New semantic tokens for entity-specific states
- **Testing Required**: Visual regression testing for color consistency

### User Experience Impact
- **High**: Data table and entity management (primary workflows)
- **Medium**: Import/export and secondary views
- **Low**: Administrative and configuration interfaces

### Technical Debt Reduction
- **Color Consistency**: Eliminate 100+ hardcoded color instances
- **Theme Compliance**: Ensure all components respect light/dark modes
- **Maintenance**: Centralized color management through token system

### Performance Considerations
- **Bundle Size**: Minimal impact (CSS custom properties)
- **Runtime**: No performance degradation expected
- **Build Time**: Potential reduction through simplified CSS generation