# Organization Creation Troubleshooting Guide

## Overview
This document provides solutions for common issues encountered when creating organizations in the KitchenPantry CRM system.

## Common Issues & Solutions

### 1. 🚫 RLS Policy Violation (Error Code 42501)

**Symptom:**
```
POST /rest/v1/organizations?select=* 403 (Forbidden)
{code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "organizations"'}
```

**Root Cause:**
Supabase RLS policies require `created_by` and `updated_by` fields to be set with the authenticated user's ID, but the form submission wasn't providing these fields.

**Solution:**
Update the `useCreateOrganization` hook to automatically inject authentication context:

```typescript
// In src/hooks/useOrganizations.ts
export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (organization: OrganizationInsert) => {
      // Get current user ID for RLS policy compliance
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Authentication required to create organization')
      }

      // Ensure required audit fields are set for RLS policy
      const organizationData = {
        ...organization,
        created_by: user.id,
        updated_by: user.id,
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert(organizationData)
        .select()
        .single()

      if (error) throw error
      return data as Organization
    },
    // ... rest of the hook
  })
}
```

**Prevention:**
- Always include `created_by` and `updated_by` fields in INSERT operations
- Verify user authentication before database operations
- Test RLS policies with actual authenticated users, not anonymous access

### 2. ⚠️ React Dialog Ref Warnings

**Symptom:**
```
Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?

Check the render method of `Primitive.div.SlotClone`.
Error Component Stack at DialogOverlay (dialog.tsx:34:3)
```

**Root Cause:**
shadcn/ui Dialog components mixing functional and forwardRef patterns, causing ref forwarding issues.

**Solution:**
Update all Dialog components to use consistent `React.forwardRef` patterns:

```typescript
// In src/components/ui/dialog.tsx
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Repeat for DialogContent, DialogTitle, DialogDescription
```

**Prevention:**
- Use consistent component patterns across all shadcn/ui implementations
- Always add `displayName` properties for debugging
- Test Dialog components for ref warnings in development

### 3. 🔐 Email Confirmation Issues

**Symptom:**
```
"Email not confirmed" error on sign-in attempt
```

**Root Cause:**
Supabase requires email confirmation by default, even in development.

**Solution:**
For development/testing, manually confirm users:

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

**Production Solution:**
Configure email templates and SMTP settings in Supabase dashboard.

### 4. 📝 Form Validation Errors

**Symptom:**
- TypeScript errors about "not_specified" values
- Form submission with invalid data types

**Root Cause:**
Mismatch between form placeholder values and database schema types.

**Solution:**
Sanitize form data before submission:

```typescript
const handleFormSubmit = (data: OrganizationFormData) => {
  // Convert placeholder values to null before submission
  const cleanData = {
    ...data,
    size: data.size === 'not_specified' ? null : data.size
  }
  onSubmit(cleanData as any)
}
```

**Prevention:**
- Use schema-first validation with `yup.InferType`
- Always sanitize form data before database operations
- Test form validation with edge cases

## Debugging Steps

### 1. Check Authentication Status
```typescript
// In browser console or component
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

### 2. Test RLS Policies
```sql
-- Check if user can select from organizations
SELECT * FROM organizations LIMIT 1;

-- Check current auth context
SELECT auth.uid() as user_id, auth.role() as role;
```

### 3. Verify Database Schema
```sql
-- Check organizations table structure
\d organizations

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'organizations';
```

### 4. Monitor Console Errors
- Open browser DevTools → Console
- Look for React warnings
- Check Network tab for failed requests
- Monitor Supabase logs

## Production Considerations

### Security Checklist
- ✅ RLS policies properly configured
- ✅ Authentication required for all CRUD operations
- ✅ Audit fields (`created_by`, `updated_by`) populated
- ✅ Input validation and sanitization

### Performance Optimizations
- ✅ Database indexes on foreign keys
- ✅ React Query caching for organizations
- ✅ Optimistic UI updates
- ✅ Proper error handling and retry logic

### Testing Requirements
- ✅ End-to-end organization creation flow
- ✅ Authentication edge cases
- ✅ Form validation scenarios
- ✅ RLS policy compliance
- ✅ UI component behavior

## Related Files
- `/src/hooks/useOrganizations.ts` - Organization database operations
- `/src/components/ui/dialog.tsx` - Dialog component implementation
- `/src/pages/Organizations.tsx` - Organization listing page
- `/src/components/organizations/OrganizationForm.tsx` - Form component
- `/src/types/validation.ts` - Form validation schemas

## Support Resources
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [shadcn/ui Dialog Documentation](https://ui.shadcn.com/docs/components/dialog)
- [React Hook Form Documentation](https://react-hook-form.com/)

---
*Last updated: 2025-08-14*
*Status: ✅ All critical issues resolved*