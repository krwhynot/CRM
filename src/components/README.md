# Shared Components Directory

This directory contains **only shared, reusable components** that are used across multiple features in the CRM application.

## 🎯 Purpose

Components in this directory should be:
- **Generic and reusable** across different features
- **Free of business logic** specific to any single domain
- **Focused on UI patterns** rather than business functionality

## 📁 Structure

```
src/components/
├── README.md                 # This file
├── index.ts                  # Main exports for shared components
├── CommandPalette.tsx        # Global navigation/search
├── error-boundaries/         # Global error handling
├── forms/                    # Generic form system
│   ├── FormInput.tsx         # Reusable form inputs
│   ├── FormCard.tsx          # Form layout components
│   ├── entity-select/        # Generic entity selection
│   └── ...
└── ui/                       # shadcn/ui design system
    ├── button.tsx            # UI primitives
    ├── card.tsx              # Layout components
    ├── input.tsx             # Form controls
    └── ...
```

## 🚫 What Does NOT Belong Here

- ❌ **Feature-specific components** (ContactForm, DashboardStats, etc.)
- ❌ **Business logic components** (OpportunityWizard, InteractionTimeline)
- ❌ **Domain-specific UI** (OrganizationCard, ProductTable)

These belong in `/src/features/{feature-name}/components/`

## ✅ What DOES Belong Here

- ✅ **Global navigation** (CommandPalette)
- ✅ **Generic form components** (FormInput, FormCard)
- ✅ **UI primitives** (Button, Card, Modal from shadcn/ui)
- ✅ **Error boundaries** (Global error handling)
- ✅ **Utility components** used by multiple features

## 📝 Guidelines

### Before Adding a Component Here:

1. **Is it used by 2+ features?** If no, put it in the feature directory
2. **Is it generic/reusable?** If no, it's probably feature-specific
3. **Does it contain business logic?** If yes, it belongs in a feature

### Import Examples:

```typescript
// ✅ Importing shared components
import { CommandPalette } from '@/components/CommandPalette'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/forms'

// ❌ Don't import feature components here
// import { ContactForm } from '@/features/contacts'
```

## 🔄 Component Migration

If a component grows to be feature-specific or contains business logic:

1. Move it to appropriate `/src/features/{feature}/components/`
2. Update all imports
3. Remove from `/src/components/index.ts`
4. Add to feature's `index.ts`

## 📚 Documentation

For detailed component organization guidelines, see:
- [`/docs/COMPONENT_ORGANIZATION_GUIDELINES.md`](/docs/COMPONENT_ORGANIZATION_GUIDELINES.md)

## 🏗️ Architecture

This follows React best practices for scalable applications:
- **Feature-based organization** for domain logic
- **Shared components** for reusable UI patterns
- **Clear separation of concerns**
- **Consistent import patterns**

---

💡 **Remember**: When in doubt, start with a feature-specific location and move to shared only when actually needed by multiple features.