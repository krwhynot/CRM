# Feature-Based Architecture Migration Plan

## Overview

This document outlines the comprehensive migration strategy from the current component-based structure to the new feature-based architecture. The migration will be executed in phases to minimize risk and ensure continuous system operation.

## Migration Strategy

### Core Principles

1. **Gradual Migration**: Migrate one feature at a time
2. **Backward Compatibility**: Maintain existing functionality during transition
3. **Zero Downtime**: No interruption to production services
4. **Rollback Ready**: Each phase can be reverted independently
5. **Testing First**: Comprehensive testing before each phase
6. **Documentation**: Update documentation as we migrate

### Pre-Migration Setup

#### 1. Create New Directory Structure

```bash
# Create the new feature-based directory structure
mkdir -p src/features/{contacts,organizations,products,opportunities,interactions}
mkdir -p src/shared/{components,services,hooks,stores,types,schemas,utils,lib}

# Create subdirectories for each feature
for feature in contacts organizations products opportunities interactions; do
  mkdir -p src/features/$feature/{api,components,hooks,stores,types,schemas,services}
done

# Create shared component subdirectories  
mkdir -p src/shared/components/{ui,forms,data-display,feedback,layout}
mkdir -p src/shared/services/{api,auth,storage}
```

#### 2. Set Up Base Service Layer

Create the foundational service infrastructure that all features will use.

## Phase 1: Foundation Setup (Week 1)

### Goals
- Set up the new directory structure
- Create base service classes and shared utilities
- Establish TypeScript configuration updates
- Set up build system modifications

### Tasks

#### 1.1 Directory Structure Creation
```bash
# Execute directory creation script
./scripts/create-feature-structure.sh
```

#### 1.2 Base Service Implementation
```typescript
// Implementation of shared/services/api/base.service.ts
// (Full implementation provided in API_SERVICE_LAYER.md)
```

#### 1.3 Shared Types Migration
```typescript
// Move database types to shared/types/database.types.ts
// Create common types in shared/types/common.types.ts
// Set up API response types in shared/types/api.types.ts
```

#### 1.4 Build Configuration Updates
```typescript
// Update vite.config.ts with new path aliases
export default defineConfig({
  // ... existing config
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
})

// Update tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

#### 1.5 Validation & Testing
- Run `npm run build` to ensure no build errors
- Run `npm run type-check` to verify TypeScript configuration
- Test that existing functionality still works

### Success Criteria
- [ ] New directory structure created
- [ ] Base service classes implemented and tested
- [ ] Build system updated and working
- [ ] All existing functionality preserved
- [ ] TypeScript compilation successful

### Rollback Plan
If issues arise:
1. Revert vite.config.ts and tsconfig.json changes
2. Remove new directories
3. Restore original configuration

---

## Phase 2: Contacts Feature Migration (Week 2)

### Goals
- Migrate the contacts feature as proof of concept
- Validate the new architecture patterns
- Establish migration procedures for remaining features

### Tasks

#### 2.1 Create Contacts Service Layer
```typescript
// features/contacts/services/contactService.ts
import { BaseService } from '@/shared/services/api/base.service'

export class ContactService extends BaseService<Contact, ContactInsert, ContactUpdate, ContactFilters> {
  constructor() {
    super('contacts', '*, organization:organizations(*)')
  }

  protected applySearchFilter(query: any, search: string) {
    return query.or(
      `first_name.ilike.%${search}%,` +
      `last_name.ilike.%${search}%,` +
      `title.ilike.%${search}%,` +
      `email.ilike.%${search}%`
    )
  }

  // Implement contact-specific methods
  async getContactsWithOrganization(filters?: ContactFilters) {
    return this.getAll(filters)
  }

  async getContactsByOrganization(organizationId: string) {
    // Implementation...
  }

  async setPrimaryContact(contactId: string) {
    // Implementation...
  }
}

export const contactService = new ContactService()
```

#### 2.2 Create Contacts API Layer
```typescript
// features/contacts/api/queries.ts
export const contactQueries = {
  all: ['contacts'] as const,
  lists: () => [...contactQueries.all, 'list'] as const,
  list: (filters?: ContactFilters) => [...contactQueries.lists(), { filters }] as const,
  details: () => [...contactQueries.all, 'detail'] as const,
  detail: (id: string) => [...contactQueries.details(), id] as const,
  byOrganization: (organizationId: string) => [...contactQueries.all, 'organization', organizationId] as const,
}

export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: contactQueries.list(filters),
    queryFn: () => contactService.getContactsWithOrganization(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// Additional query hooks...
```

#### 2.3 Migrate Contact Types
```typescript
// Move src/types/contact.types.ts to features/contacts/types/contact.types.ts
// Update imports across the application
// Create features/contacts/types/index.ts with exports
```

#### 2.4 Create Contact Schemas
```typescript
// features/contacts/schemas/contact.schema.ts
import * as yup from 'yup'

export const contactSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  // ... additional validation rules
})

export type ContactFormData = yup.InferType<typeof contactSchema>
```

#### 2.5 Migrate Contact Components
```typescript
// Create features/contacts/components/ContactForm/ContactForm.tsx
// Refactor existing src/components/contacts/ContactForm.tsx
// Update to use shared components and new service layer

import { CoreFormLayout, EntitySelect, FormFieldWrapper } from '@/shared/components/forms'
import { useContacts, useCreateContact, useUpdateContact } from '../api'
import { contactSchema } from '../schemas'

export function ContactForm({ onSubmit, initialData }: ContactFormProps) {
  // Implementation using new architecture...
}
```

#### 2.6 Update Import Paths
```typescript
// Update all imports in pages/Contacts.tsx
// Before:
import { useContacts } from '@/hooks/useContacts'
import { ContactForm } from '@/components/contacts/ContactForm'

// After:
import { useContacts, ContactForm } from '@/features/contacts'
```

#### 2.7 Create Feature Public API
```typescript
// features/contacts/index.ts
// Public API exports
export * from './api'
export * from './components'
export * from './types'
export * from './schemas'

// Specific exports
export { ContactForm } from './components/ContactForm'
export { ContactsTable } from './components/ContactsTable'
export { useContacts, useContact, useCreateContact, useUpdateContact } from './api'
export type { Contact, ContactInsert, ContactUpdate, ContactFilters } from './types'
```

### Testing Phase 2
```bash
# Run comprehensive tests
npm run test -- --testPathPattern=contacts
npm run build
npm run type-check

# Manual testing checklist:
# [ ] Contact list loads correctly
# [ ] Contact form creates new contacts
# [ ] Contact form updates existing contacts
# [ ] Contact search functionality works
# [ ] Contact deletion (soft delete) works
# [ ] Contact restoration works
# [ ] Primary contact selection works
```

### Success Criteria
- [ ] All contact functionality working with new architecture
- [ ] No regression in existing features
- [ ] Improved type safety and error handling
- [ ] Reduced code duplication in contact-related components
- [ ] All tests passing

### Rollback Plan
1. Revert import statements in pages/Contacts.tsx
2. Restore original contact hooks and components
3. Remove features/contacts directory
4. Verify all functionality restored

---

## Phase 3: Organizations Feature Migration (Week 3)

### Goals
- Apply lessons learned from contacts migration
- Migrate organizations with improved efficiency
- Validate architecture scalability

### Tasks

#### 3.1 Organizations Service Layer
```typescript
// features/organizations/services/organizationService.ts
export class OrganizationService extends BaseService<Organization, OrganizationInsert, OrganizationUpdate, OrganizationFilters> {
  constructor() {
    super('organizations', '*, contacts(*)')
  }

  protected applySearchFilter(query: any, search: string) {
    return query.or(
      `name.ilike.%${search}%,` +
      `city.ilike.%${search}%,` +
      `state.ilike.%${search}%`
    )
  }

  async getOrganizationsWithContacts(filters?: OrganizationFilters) {
    return this.getAll(filters)
  }

  async getOrganizationsBySegment(segment: FoodServiceSegment) {
    // Implementation...
  }
}
```

#### 3.2 Organizations API Layer
```typescript
// features/organizations/api/queries.ts
export function useOrganizations(filters?: OrganizationFilters) {
  return useQuery({
    queryKey: organizationQueries.list(filters),
    queryFn: () => organizationService.getOrganizationsWithContacts(filters),
    staleTime: 5 * 60 * 1000,
  })
}
```

#### 3.3 Component Migration
```typescript
// Migrate and refactor:
// - OrganizationForm.tsx
// - OrganizationsTable.tsx
// - OrganizationCard component (new)
```

### Success Criteria
- [ ] Organizations feature fully migrated
- [ ] Excel import functionality maintained
- [ ] All organization-contact relationships working
- [ ] Performance maintained or improved

---

## Phase 4: Products Feature Migration (Week 4)

### Goals
- Continue systematic migration
- Focus on product-principal relationships
- Optimize for performance

### Tasks

#### 4.1 Products Service Layer
```typescript
// features/products/services/productService.ts
export class ProductService extends BaseService<Product, ProductInsert, ProductUpdate, ProductFilters> {
  constructor() {
    super('products', '*, principal:organizations(*)')
  }

  async getProductsByPrincipal(principalId: string) {
    // Implementation...
  }

  async getProductsByCategory(category: ProductCategory) {
    // Implementation...
  }
}
```

### Success Criteria
- [ ] Products feature fully migrated
- [ ] Principal-product relationships maintained
- [ ] Product search and filtering optimized

---

## Phase 5: Opportunities Feature Migration (Week 5)

### Goals
- Migrate complex opportunity management
- Maintain opportunity wizard functionality
- Optimize relationship queries

### Tasks

#### 5.1 Opportunities Service Layer
```typescript
// features/opportunities/services/opportunityService.ts
export class OpportunityService extends BaseService<Opportunity, OpportunityInsert, OpportunityUpdate, OpportunityFilters> {
  constructor() {
    super('opportunities', `
      *,
      organization:organizations(*),
      contact:contacts(*),
      principal_organization:organizations!principal_id(*),
      opportunity_products(*, product:products(*)),
      founding_interaction:interactions(*)
    `)
  }

  async getOpportunitiesWithFullRelations(filters?: OpportunityFilters) {
    return this.getAll(filters)
  }

  async getOpportunityPipeline(stage?: OpportunityStage) {
    // Implementation...
  }
}
```

### Success Criteria
- [ ] Opportunity wizard functionality preserved
- [ ] Pipeline views working correctly
- [ ] Multi-principal opportunity support maintained

---

## Phase 6: Interactions Feature Migration (Week 6)

### Goals
- Complete the feature migration process
- Migrate activity feeds and interaction tracking
- Optimize interaction queries

### Tasks

#### 6.1 Interactions Service Layer
```typescript
// features/interactions/services/interactionService.ts
export class InteractionService extends BaseService<Interaction, InteractionInsert, InteractionUpdate, InteractionFilters> {
  constructor() {
    super('interactions', `
      *,
      contact:contacts(*, organization:organizations(*)),
      organization:organizations(*),
      opportunity:opportunities(*)
    `)
  }

  async getRecentInteractions(limit = 10) {
    return this.getAll({ 
      limit, 
      order_by: 'interaction_date', 
      order_direction: 'desc' 
    })
  }

  async getInteractionsByEntity(entityType: string, entityId: string) {
    // Implementation...
  }
}
```

### Success Criteria
- [ ] Activity feeds working correctly
- [ ] Interaction forms and templates preserved
- [ ] Mobile interaction templates functional

---

## Phase 7: Cleanup and Optimization (Week 7)

### Goals
- Remove legacy code and unused files
- Optimize bundle size and performance
- Update documentation

### Tasks

#### 7.1 Legacy Code Removal
```bash
# Remove old directories after confirming migration success
rm -rf src/components/contacts
rm -rf src/components/organizations  
rm -rf src/components/products
rm -rf src/components/opportunities
rm -rf src/components/interactions

# Remove legacy hooks
rm -rf src/hooks/useContacts.ts
rm -rf src/hooks/useOrganizations.ts
rm -rf src/hooks/useProducts.ts
rm -rf src/hooks/useOpportunities.ts
rm -rf src/hooks/useInteractions.ts

# Remove legacy types
rm -rf src/types/contact.types.ts
rm -rf src/types/organization.types.ts
# ... etc
```

#### 7.2 Import Path Updates
```typescript
// Update all remaining import paths throughout the application
// Use automated refactoring tools where possible

// Before:
import { useContacts } from '@/hooks/useContacts'
import { ContactForm } from '@/components/contacts/ContactForm'

// After:  
import { useContacts, ContactForm } from '@/features/contacts'
```

#### 7.3 Bundle Analysis
```bash
# Analyze bundle size improvements
npm run build -- --analyze

# Expected improvements:
# - Smaller bundle sizes due to better tree-shaking
# - Faster build times due to better module organization
# - Improved code splitting by feature
```

#### 7.4 Performance Testing
```bash
# Run performance tests
npm run test:performance

# Verify metrics:
# - Page load times maintained or improved
# - Bundle sizes reduced
# - Memory usage optimized
```

### Success Criteria
- [ ] All legacy code removed
- [ ] Import paths updated throughout application
- [ ] Bundle size reduced by estimated 15-20%
- [ ] No functionality regressions
- [ ] Performance maintained or improved

---

## Risk Assessment and Mitigation

### High Risk Areas

#### 1. Import Path Changes
**Risk**: Breaking changes due to import path updates  
**Mitigation**: 
- Use automated refactoring tools
- Comprehensive testing after each change
- Gradual migration with rollback plans

#### 2. Type System Changes  
**Risk**: TypeScript compilation errors during migration  
**Mitigation**:
- Maintain existing type exports during transition
- Use type aliases for backward compatibility
- Thorough type checking at each phase

#### 3. React Query Cache Invalidation
**Risk**: Cached data inconsistencies during migration  
**Mitigation**:
- Maintain query key compatibility
- Clear caches during migration if necessary
- Test all data refresh scenarios

### Medium Risk Areas

#### 1. Component Prop Changes
**Risk**: Component interface changes breaking existing usage  
**Mitigation**:
- Maintain backward compatible props during transition
- Use deprecation warnings for old prop names
- Update all usage sites systematically

#### 2. Service Layer Abstraction
**Risk**: New service layer introduces bugs or performance issues  
**Mitigation**:
- Extensive testing of service layer
- Performance benchmarking
- Rollback to direct Supabase calls if needed

### Low Risk Areas

#### 1. Directory Structure Changes
**Risk**: Build system confusion  
**Mitigation**:
- Update build tools configuration first
- Test build process thoroughly
- Simple rollback by reverting directory changes

## Testing Strategy

### Automated Testing
```bash
# Unit tests for each feature
npm run test:features

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance

# Type checking
npm run type-check
```

### Manual Testing Checklist

#### After Each Phase:
- [ ] All CRUD operations work correctly
- [ ] Search and filtering functionality preserved
- [ ] Form validation working
- [ ] Error handling properly implemented
- [ ] Loading states display correctly
- [ ] Mobile responsiveness maintained
- [ ] Performance meets benchmarks

#### Final Validation:
- [ ] Complete user journey testing
- [ ] Cross-browser compatibility
- [ ] Accessibility compliance maintained
- [ ] Performance metrics improved or maintained
- [ ] Bundle size analysis shows improvements

## Success Metrics

### Code Quality Metrics
- **Code Duplication**: Reduce to <5% (from current ~15%)
- **TypeScript Strict Mode**: 100% compliance
- **Test Coverage**: Maintain >90% coverage
- **ESLint Errors**: Zero errors, minimal warnings

### Performance Metrics  
- **Bundle Size**: Reduce main bundle by 15-20%
- **Build Time**: Improve by 20-30%
- **Page Load Time**: Maintain <3 seconds
- **Memory Usage**: Optimize by 10-15%

### Developer Experience Metrics
- **Feature Development Time**: Reduce by 50% for new features  
- **Bug Fix Time**: Reduce by 30% due to better organization
- **Onboarding Time**: Reduce by 40% with clearer architecture

## Timeline Summary

| Phase | Duration | Focus | Risk Level |
|-------|----------|-------|------------|
| 1 | Week 1 | Foundation Setup | Medium |
| 2 | Week 2 | Contacts Migration (POC) | High |
| 3 | Week 3 | Organizations Migration | Medium |
| 4 | Week 4 | Products Migration | Low |
| 5 | Week 5 | Opportunities Migration | Medium |
| 6 | Week 6 | Interactions Migration | Low |
| 7 | Week 7 | Cleanup & Optimization | Low |

**Total Duration**: 7 weeks  
**Rollback Windows**: After each phase completion  
**Go/No-Go Decision Points**: End of Phase 2 and Phase 5

## Post-Migration Benefits

### For Developers
1. **Faster Feature Development**: Clear patterns and reusable components
2. **Better Code Organization**: Easy to find and modify code
3. **Improved Type Safety**: Schema-first development approach
4. **Easier Testing**: Components and services in isolation
5. **Better Documentation**: Self-documenting code structure

### For the Application
1. **Reduced Bundle Size**: Better tree-shaking and code splitting
2. **Improved Performance**: Optimized service layer and caching
3. **Better Maintainability**: Clear separation of concerns
4. **Enhanced Scalability**: Easy to add new features
5. **Improved Developer Experience**: Consistent patterns across features

### For Users
1. **Faster Load Times**: Optimized bundles and lazy loading
2. **Better Reliability**: Improved error handling and testing
3. **Consistent UI/UX**: Shared component library
4. **Enhanced Performance**: Optimized data fetching and caching