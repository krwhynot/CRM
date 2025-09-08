# StandardDialog Component

The `StandardDialog` is the unified dialog component for the CRM system, providing consistent UX patterns, accessibility, and focus management for all dialog interactions.

## Overview

StandardDialog consolidates both regular dialogs (forms, content) and alert dialogs (confirmations) into a single API with consistent sizing, scrolling, and interaction patterns.

## API Reference

### Basic Usage

```typescript
import { StandardDialog } from '@/components/ui/StandardDialog'

// Regular dialog for forms/content
<StandardDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Add Contact"
  description="Fill in the contact details below"
  size="lg"
  scroll="content"
  footer={<Button>Save</Button>}
>
  <ContactForm />
</StandardDialog>

// Alert dialog for confirmations
<StandardDialog
  variant="alert"
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Contact"
  description="Are you sure you want to delete this contact?"
  confirmText="Delete"
  confirmVariant="destructive"
  onConfirm={handleDelete}
  onCancel={handleCancel}
  isLoading={isDeleting}
>
  <p>This action cannot be undone.</p>
</StandardDialog>
```

### Props Interface

#### Base Props (Common to all variants)
```typescript
interface BaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"  // Default: "md"
  headerActions?: React.ReactNode
  children: React.ReactNode
}
```

#### Regular Dialog Props (Default variant)
```typescript
interface RegularDialogProps extends BaseDialogProps {
  footer?: React.ReactNode
  scroll?: "content" | "body"  // Default: "content"
}
```

#### Alert Dialog Props (variant="alert")
```typescript
interface AlertDialogProps extends BaseDialogProps {
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string  // Default: "Confirm"
  cancelText?: string   // Default: "Cancel"
  confirmVariant?: "default" | "destructive"  // Default: "default"
  isLoading?: boolean   // Default: false
}
```

## Size Variants

| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | `max-w-sm` | Simple confirmations, small forms |
| `md` | `max-w-lg` | Standard forms, medium content |
| `lg` | `max-w-2xl` | Complex forms, detailed content |
| `xl` | `max-w-4xl` | Large forms, extensive content |

## Scroll Behavior

- **`scroll="content"`** (default): Content area scrolls, dialog size is fixed
- **`scroll="body"`**: Entire dialog scrolls, no fixed height restrictions

## Accessibility Features

### Built-in ARIA Support
- `role="dialog"` with proper labeling
- `aria-labelledby` pointing to dialog title
- `aria-describedby` pointing to description (if provided)
- Focus trap within dialog boundaries
- ESC key closes dialog

### Keyboard Navigation
- **Tab/Shift+Tab**: Navigate between focusable elements
- **ESC**: Close dialog
- **Enter**: Activate default button (confirm button in alerts)
- Focus returns to trigger element when dialog closes

## Migration from Legacy Dialogs

### From Raw Dialog Components
```typescript
// ❌ Before (raw shadcn/ui)
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Add Product</DialogTitle>
      <DialogDescription>Add product details</DialogDescription>
    </DialogHeader>
    <div className="max-h-96 overflow-y-auto">
      <ProductForm />
    </div>
  </DialogContent>
</Dialog>

// ✅ After (StandardDialog)
<StandardDialog
  open={open}
  onOpenChange={setOpen}
  title="Add Product"
  description="Add product details"
  size="xl"
  scroll="content"
>
  <ProductForm />
</StandardDialog>
```

### From AlertDialog Components
```typescript
// ❌ Before (raw AlertDialog)
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Product</AlertDialogTitle>
      <AlertDialogDescription>Are you sure?</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// ✅ After (StandardDialog alert variant)
<StandardDialog
  variant="alert"
  open={open}
  onOpenChange={setOpen}
  title="Delete Product"
  description="Are you sure?"
  onConfirm={handleDelete}
  confirmText="Delete"
  confirmVariant="destructive"
  isLoading={loading}
>
  <div>Additional context or warnings can go here.</div>
</StandardDialog>
```

## Usage Examples

### Form Dialog with Custom Footer
```typescript
<StandardDialog
  open={isCreateOpen}
  onOpenChange={setIsCreateOpen}
  title="Create Organization"
  description="Add a new organization to the CRM"
  size="lg"
  scroll="content"
  footer={
    <div className="flex justify-between w-full">
      <Button variant="ghost" onClick={handleSaveDraft}>
        Save Draft
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Organization'}
        </Button>
      </div>
    </div>
  }
>
  <OrganizationForm onSubmit={handleSubmit} />
</StandardDialog>
```

### Alert Dialog with Additional Context
```typescript
<StandardDialog
  variant="alert"
  open={isBulkDeleteOpen}
  onOpenChange={setIsBulkDeleteOpen}
  title={`Delete ${selectedCount} Organizations?`}
  description="This will archive the selected organizations."
  onConfirm={handleBulkDelete}
  confirmText="Archive Organizations"
  confirmVariant="destructive"
  isLoading={isDeleting}
  size="md"
>
  <div className="space-y-3">
    <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
      <ul className="text-sm space-y-1">
        {selectedOrganizations.map(org => (
          <li key={org.id} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            {org.name}
          </li>
        ))}
      </ul>
    </div>
    <p className="text-sm font-medium text-amber-700 bg-amber-50 p-2 rounded">
      ⚠️ Organizations will be soft-deleted and can be restored later
    </p>
  </div>
</StandardDialog>
```

### Dialog with Header Actions
```typescript
<StandardDialog
  open={isEditOpen}
  onOpenChange={setIsEditOpen}
  title="Edit Contact"
  description="Update contact information"
  size="lg"
  headerActions={
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDuplicate}>
          Duplicate Contact
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleArchive}>
          Archive Contact
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  }
>
  <ContactForm initialData={selectedContact} />
</StandardDialog>
```

## ESLint Rules and Architectural Compliance

The codebase enforces StandardDialog usage through ESLint rules:

```javascript
// .eslintrc.cjs
'no-restricted-imports': ['error', {
  patterns: [
    {
      group: ['@/components/ui/dialog', '@/components/ui/alert-dialog'],
      message: 'Use StandardDialog from @/components/ui/StandardDialog instead of raw dialog components for consistent UX patterns.'
    }
  ]
}]
```

### Allowed Exceptions
- **Command Palette**: `src/components/ui/command.tsx` legitimately uses Dialog for modal command interface
- **Base Components**: The StandardDialog component itself imports raw components

## Testing

StandardDialog includes comprehensive tests covering:
- **Accessibility**: ARIA attributes, screen reader support, keyboard navigation
- **Focus Management**: Focus trap, ESC handling, initial focus
- **Size Variants**: All size classes applied correctly
- **Scroll Behavior**: Content vs body scroll modes
- **Alert Functionality**: Confirm/cancel actions, loading states, destructive styling
- **Props Validation**: TypeScript interface compliance

Run tests with:
```bash
npm test __tests__/components/ui/StandardDialog.test.tsx
```

## Performance Considerations

- **Bundle Size**: Single component replaces multiple dialog patterns
- **Tree Shaking**: Unused dialog variants are eliminated in production builds
- **Lazy Loading**: Dialog content only renders when `open={true}`
- **Focus Management**: Uses efficient focus trap implementation

## Migration Checklist

- [ ] Replace raw `Dialog`/`AlertDialog` imports with `StandardDialog`
- [ ] Convert dialog JSX to StandardDialog props API
- [ ] Update size classes to standardized size prop
- [ ] Replace custom scroll implementations with `scroll` prop
- [ ] Test keyboard navigation and accessibility
- [ ] Verify ESLint passes without dialog import violations

## Best Practices

1. **Always provide `title`**: Required for accessibility labeling
2. **Use appropriate `size`**: Match dialog size to content complexity
3. **Prefer `scroll="content"`**: Better UX for long forms
4. **Add `description`** for clarity: Helps users understand dialog purpose
5. **Use `confirmVariant="destructive"`**: For delete/dangerous actions
6. **Handle `isLoading` states**: Provide feedback during async operations
7. **Test keyboard navigation**: Ensure tab order and ESC handling work
8. **Provide meaningful children**: Even alert dialogs benefit from additional context

## Future Enhancements

- **Animation Presets**: Customizable enter/exit animations
- **Position Variants**: Support for different dialog positioning
- **Responsive Sizing**: Size adaptation based on viewport
- **Custom Themes**: Support for different visual themes
- **Nested Dialogs**: Support for dialog-within-dialog scenarios