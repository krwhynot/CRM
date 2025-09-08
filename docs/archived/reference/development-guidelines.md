# CRM Development Guidelines

**Version:** 1.0  
**Based on:** Comprehensive Architecture Audit (2025-08-18)  
**Target:** Consistent pattern adoption and faster developer onboarding

## 🎯 Core Principles

1. **Respect the Architecture**: The audit showed our codebase is already excellent - build on existing patterns
2. **Mobile-First Performance**: Every change should consider iPad field sales experience
3. **Type-Safe Everything**: Use schema inference, never `any` types
4. **Component Reuse**: Prefer shared components over duplication

---

## 📁 File Organization Standards

### ✅ Current Pattern (Maintain)
```
/src/
  /components/
    /contacts/           # ✅ Feature-based entity components
    /organizations/      # ✅ Feature-based entity components  
    /ui/                # ✅ shadcn/ui components
  /hooks/               # ✅ Feature-specific hooks (useContacts, useOrganizations)
  /types/               # ✅ Feature-specific types with validation
```

### 🎯 Enhanced Pattern (Implement)
```
/src/
  /components/
    /forms/             # 🆕 Shared form components (FormCard, FormField, etc.)
    /data-display/      # 🆕 Shared tables, lists, cards
    /feedback/          # 🆕 Loading, error states, confirmations
```

---

## 🏗️ Form Development Standards

### Three-Tier Form System

**Tier 1: Simple Forms** (<8 fields, basic validation)
- Use shared `SimpleForm` component
- Native HTML validation
- Quick implementation for filters, searches

**Tier 2: Business Forms** (8-15 fields, Yup validation)  
- Use `BusinessForm` component with Yup schema
- React Hook Form integration
- Standard for entity CRUD operations

**Tier 3: Complex Forms** (>15 fields, conditional logic)
- Custom React Hook Form implementation
- Multi-step wizards, complex validation
- Import/export, advanced configuration

### Form Component Standards

```typescript
// ✅ GOOD: Use shared components
<FormCard title="Contact Information">
  <FormField name="firstName" label="First Name" required />
  <FormField name="email" label="Email" type="email" />
  <FormSubmitButton loading={isSubmitting}>Save Contact</FormSubmitButton>
</FormCard>

// ❌ BAD: Manual form structure duplication
<Card>
  <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
  <CardContent>
    <FormField control={form.control} name="firstName" render={({ field }) => (
      // 15 lines of repeated FormItem/FormLabel/FormControl/FormMessage
    )} />
  </CardContent>
</Card>
```

---

## 🔌 API Integration Standards

### Hook Usage Patterns

```typescript
// ✅ GOOD: Use feature-specific hooks
const { data: contacts, isLoading, error } = useContacts(filters)
const createContact = useCreateContact()

// ❌ BAD: Direct Supabase calls in components
const contacts = await supabase.from('contacts').select()
```

### Query Key Standards
```typescript
// ✅ GOOD: Consistent query key factories (already implemented)
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: ContactFilters) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
}
```

### State Management Boundaries

**TanStack Query**: Server state (CRUD operations, caching)
```typescript
const { data, isLoading } = useContacts()  // ✅ Server data
const mutation = useCreateContact()        // ✅ Server mutations
```

**Zustand**: Complex client state, business logic  
```typescript
const { computeAdvocacyScore } = useAdvocacyActions()  // ✅ Business logic
const { autoName } = useOpportunityAutoNaming()       // ✅ UI behavior
```

**React Hook Form**: Form state only
```typescript
const form = useForm<ContactFormData>({
  resolver: yupResolver(contactSchema)  // ✅ Form validation
})
```

---

## 🎨 Component Development Standards

### Component Props Pattern
```typescript
// ✅ GOOD: Clear interface with optional variants
interface ContactCardProps {
  contact: Contact
  variant?: 'compact' | 'detailed'
  onEdit?: (contact: Contact) => void
  className?: string
}

// ❌ BAD: Unclear or overly complex props
interface ContactCardProps {
  data: any
  config: { showEdit: boolean; style: string; handler: Function }
}
```

### Error Handling Pattern
```typescript
// ✅ GOOD: Consistent error handling
if (error) {
  return <ErrorAlert message="Failed to load contacts" onRetry={refetch} />
}

if (isLoading) {
  return <LoadingSpinner />
}
```

### Mobile-First Responsive Design
```typescript
// ✅ GOOD: Mobile-first with breakpoint considerations
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards automatically responsive */}
</div>

// ✅ GOOD: Consider field sales context
<Button 
  size="lg"           // Larger touch targets for iPad
  className="h-11"    // Consistent minimum touch height
>
  Save Changes
</Button>
```

---

## 🔍 Type Safety Standards

### Schema-First Validation
```typescript
// ✅ GOOD: Schema drives types
const contactSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  email: yup.string().email().nullable(),
})

type ContactFormData = yup.InferType<typeof contactSchema>  // ✅ Auto-generated
```

### Database Type Integration
```typescript
// ✅ GOOD: Extend generated Supabase types
interface Contact extends Database['public']['Tables']['contacts']['Row'] {
  organization?: Organization  // Relationship typing
}

// ❌ BAD: Manual type definitions that drift from schema
interface Contact {
  id: string
  name: string  // What if DB has first_name, last_name?
}
```

---

## ⚡ Performance Standards

### Bundle Optimization
```typescript
// ✅ GOOD: Lazy load heavy components
const ContactForm = lazy(() => import('./components/contacts/ContactForm'))
const ImportExportDialog = lazy(() => import('./components/import-export'))

// ✅ GOOD: Dynamic imports for utilities
const exportToExcel = async (data: Contact[]) => {
  const XLSX = await import('xlsx')  // Only load when needed
  return XLSX.writeFile(...)
}
```

### Loading State Patterns
```typescript
// ✅ GOOD: Consistent loading patterns
<Suspense fallback={<LoadingSpinner />}>
  <ContactForm />
</Suspense>

// ✅ GOOD: Progressive loading for lists
const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(...)
```

---

## 🧪 Testing Standards

### Component Testing
```typescript
// ✅ GOOD: Test user interactions, not implementation
test('creates contact when form is submitted', async () => {
  render(<ContactForm onSubmit={mockSubmit} />)
  
  await user.type(screen.getByLabelText(/first name/i), 'John')
  await user.type(screen.getByLabelText(/email/i), 'john@example.com')
  await user.click(screen.getByRole('button', { name: /save/i }))
  
  expect(mockSubmit).toHaveBeenCalledWith({
    firstName: 'John',
    email: 'john@example.com'
  })
})
```

### Hook Testing  
```typescript
// ✅ GOOD: Test hook behavior with React Query Testing Library
test('useContacts returns filtered contacts', async () => {
  const { result } = renderHook(() => useContacts({ organization_id: '123' }))
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined()
  })
})
```

---

## 🚨 Code Quality Gates

### Pre-Commit Checks
```bash
# Required to pass before commit
npx tsc --noEmit     # TypeScript validation
npm run lint         # ESLint validation  
npm run build        # Build validation
```

### Performance Monitoring
```bash
# Monitor bundle size changes
npm run build:analyze

# Check Core Web Vitals in development
# Performance metrics automatically logged to localStorage
```

---

## 🔧 Tooling Configuration

### ESLint Rules (Enhanced)
```javascript
// .eslintrc.js additions for form patterns
rules: {
  // Prevent direct Supabase usage in components
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['@supabase/supabase-js'],
      importNames: ['createClient'],
      message: 'Use feature-specific hooks instead of direct Supabase calls'
    }]
  }],
  
  // Enforce consistent form patterns
  'react-hook-form/prefer-schema-resolver': 'error',
}
```

### TypeScript Configuration
```json
// tsconfig.json - strict mode for quality
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 📚 Quick Reference

### New Developer Checklist
- [ ] Read this guidelines document
- [ ] Review audit findings in `/docs/architecture/`
- [ ] Study existing hook patterns (`useContacts`, `useOrganizations`)
- [ ] Understand 3-tier form system
- [ ] Run quality gates: `npm run lint && npm run build`

### Before Creating New Forms
- [ ] Determine tier (Simple/Business/Complex)
- [ ] Check for existing shared components
- [ ] Use schema-first validation with Yup
- [ ] Consider mobile/iPad UX
- [ ] Add proper loading and error states

### Before Adding Features
- [ ] Use existing hooks for data fetching
- [ ] Follow mobile-first responsive patterns
- [ ] Add TypeScript types/interfaces
- [ ] Consider bundle impact for heavy dependencies
- [ ] Test on actual iPad device when possible

---

**Next Steps**: These guidelines will evolve as we implement the form abstraction system. All patterns shown here build on our existing excellent architecture while addressing the specific improvement areas identified in the audit.