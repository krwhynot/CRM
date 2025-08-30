# DataTable Migration Guide

This guide helps you migrate from the legacy `SimpleTable` and table primitives to the new unified `DataTable` component.

## Quick Migration Reference

### Before (SimpleTable)
```tsx
import { SimpleTable } from '@/components/ui/simple-table'

<SimpleTable
  data={users}
  loading={loading}
  headers={['Name', 'Email', 'Role']}
  renderRow={(user) => (
    <TableRow key={user.id}>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.role}</TableCell>
    </TableRow>
  )}
  emptyMessage="No users found"
  colSpan={3}
/>
```

### After (DataTable)
```tsx
import { DataTable, type Column } from '@/components/ui/DataTable'

const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (user) => <span className="font-medium">{user.name}</span>
  },
  {
    key: 'email', 
    header: 'Email'
  },
  {
    key: 'role',
    header: 'Role'
  }
]

<DataTable
  data={users}
  columns={columns}
  loading={loading}
  rowKey={(user) => user.id}
  empty={{
    title: "No users found",
    description: "Get started by adding your first user"
  }}
/>
```

## Step-by-Step Migration

### 1. Update Imports

```tsx
// Old imports
import { SimpleTable } from '@/components/ui/simple-table'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'

// New imports
import { DataTable, type Column } from '@/components/ui/DataTable'
```

### 2. Define Column Definitions

Replace the `headers` array with properly typed `Column<T>` definitions:

```tsx
// Old headers
const headers = ['Name', 'Email', 'Actions']

// New columns
const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (user) => <span className="font-semibold">{user.name}</span>
  },
  {
    key: 'email',
    header: 'Email Address',
    className: 'min-w-[200px]'
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (user) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onEdit(user)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(user)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
]
```

### 3. Replace SimpleTable Component

```tsx
// Old SimpleTable
<SimpleTable
  data={users}
  loading={loading}
  headers={headers}
  renderRow={(user) => (
    <UserRow key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} />
  )}
  emptyMessage="No users found"
  emptySubtext="Add some users to get started"
/>

// New DataTable
<DataTable
  data={users}
  columns={columns}
  loading={loading}
  rowKey={(user) => user.id}
  empty={{
    title: "No users found",
    description: "Add some users to get started"
  }}
  onRowClick={onRowClick} // Optional row click handler
/>
```

### 4. Handle Responsive Design

```tsx
const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name'
    // Always visible
  },
  {
    key: 'email',
    header: 'Email',
    hidden: { sm: true } // Hidden on small screens, visible on sm and up
  },
  {
    key: 'role',
    header: 'Role', 
    hidden: { md: true } // Hidden up to medium screens, visible on md and up
  },
  {
    key: 'lastLogin',
    header: 'Last Login',
    hidden: { lg: true } // Hidden up to large screens, visible on lg and up
  }
]
```

## Advanced Migration Patterns

### Complex Cell Rendering

```tsx
// Old approach with renderRow
renderRow={(organization) => (
  <TableRow>
    <TableCell>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary">{organization.priority}</Badge>
        <span className="font-medium">{organization.name}</span>
      </div>
    </TableCell>
    <TableCell>{organization.phone}</TableCell>
  </TableRow>
)}

// New approach with column cells
const columns: Column<Organization>[] = [
  {
    key: 'name',
    header: 'Organization',
    cell: (org) => (
      <div className="flex items-center space-x-2">
        <Badge variant="secondary">{org.priority}</Badge>
        <span className="font-medium">{org.name}</span>
      </div>
    )
  },
  {
    key: 'phone',
    header: 'Phone Number',
    cell: (org) => org.phone || 'No phone'
  }
]
```

### Selection Support

For tables with selection/bulk actions, you'll need to handle this in your parent component:

```tsx
// Selection state
const [selectedIds, setSelectedIds] = useState<string[]>([])

// Selection column
const columns: Column<User>[] = [
  {
    key: 'select',
    header: (
      <Checkbox
        checked={selectedIds.length === users.length && users.length > 0}
        onCheckedChange={(checked) => {
          if (checked) {
            setSelectedIds(users.map(u => u.id))
          } else {
            setSelectedIds([])
          }
        }}
        aria-label="Select all"
      />
    ),
    cell: (user) => (
      <Checkbox
        checked={selectedIds.includes(user.id)}
        onCheckedChange={(checked) => {
          if (checked) {
            setSelectedIds(prev => [...prev, user.id])
          } else {
            setSelectedIds(prev => prev.filter(id => id !== user.id))
          }
        }}
        aria-label={`Select ${user.name}`}
      />
    )
  },
  // ... other columns
]
```

### Sorting Support

```tsx
// Sorting state
const [sortField, setSortField] = useState<keyof User>('name')
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

// Sortable column
{
  key: 'name',
  header: (
    <button
      className="flex items-center gap-1 font-medium hover:text-foreground"
      onClick={() => {
        if (sortField === 'name') {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
          setSortField('name')
          setSortDirection('asc')
        }
      }}
    >
      Name
      {sortField === 'name' && (
        sortDirection === 'desc' 
          ? <ChevronDown className="h-3 w-3" />
          : <ChevronUp className="h-3 w-3" />
      )}
    </button>
  ),
  cell: (user) => user.name
}
```

## Migration Checklist

### For Each Table Component:

- [ ] **Import DataTable**: Replace SimpleTable imports with DataTable
- [ ] **Define Columns**: Convert headers array to Column<T> definitions
- [ ] **Update Props**: Replace SimpleTable props with DataTable props
- [ ] **Handle Custom Rendering**: Move renderRow logic to column.cell functions
- [ ] **Add Row Key**: Provide rowKey function for unique row identification
- [ ] **Update Empty States**: Convert emptyMessage/emptySubtext to empty object
- [ ] **Test Functionality**: Verify all existing features work correctly
- [ ] **Remove Legacy Code**: Clean up old renderRow and related functions

### Common Props Mapping:

| SimpleTable Prop | DataTable Equivalent | Notes |
|------------------|---------------------|--------|
| `data` | `data` | Same |
| `loading` | `loading` | Same |
| `headers` | `columns` | Convert to Column<T>[] |
| `renderRow` | `columns[].cell` | Move logic to individual column cells |
| `emptyMessage` | `empty.title` | Part of empty object |
| `emptySubtext` | `empty.description` | Part of empty object |
| `colSpan` | Not needed | Automatically calculated |
| `onSelectAll` | Handle in column header | Custom selection column |
| `selectedCount` | Handle in parent | Custom selection logic |

## TypeScript Benefits

The new DataTable provides full TypeScript support:

```tsx
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

// Full type safety and autocomplete
const columns: Column<User>[] = [
  {
    key: 'name', // ✅ Autocomplete suggests User properties
    header: 'Name',
    cell: (user) => user.name // ✅ user is fully typed as User
  }
]

<DataTable<User> // ✅ Full generic type support
  data={users}
  columns={columns}
  rowKey={(user) => user.id} // ✅ user parameter is typed
/>
```

## Performance Considerations

### Before Migration
- Multiple table implementations with duplicate code
- Inconsistent rendering patterns
- Large bundle size due to code duplication

### After Migration  
- Single table implementation
- Consistent rendering patterns
- Reduced bundle size
- Better performance with optimized DataTable

## Common Migration Issues

### Issue: Custom Row Components Not Working
**Problem**: Existing custom row components (like `UserRow`, `OrganizationRow`) don't work with DataTable.

**Solution**: Extract the cell-level logic from row components and move it to column definitions:

```tsx
// Old: Custom row component
const UserRow = ({ user, onEdit, onDelete }) => (
  <TableRow>
    <TableCell>{user.name}</TableCell>
    <TableCell>
      <Button onClick={() => onEdit(user)}>Edit</Button>
    </TableCell>
  </TableRow>
)

// New: Extract to column cells
const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (user) => user.name
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (user) => <Button onClick={() => onEdit(user)}>Edit</Button>
  }
]
```

### Issue: Responsive Behavior Not Working
**Problem**: Responsive column hiding isn't working as expected.

**Solution**: Use the `hidden` property correctly:

```tsx
{
  key: 'email',
  header: 'Email',
  hidden: { sm: true } // Hidden on mobile, visible on sm screens and up
}
```

### Issue: Selection State Management
**Problem**: Bulk selection and row selection logic is complex.

**Solution**: Create a custom hook for selection management:

```tsx
const useTableSelection = <T extends { id: string }>(items: T[]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const selectAll = () => setSelectedIds(items.map(item => item.id))
  const selectNone = () => setSelectedIds([])
  const toggleItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }
  
  return { selectedIds, selectAll, selectNone, toggleItem }
}
```

## Getting Help

- **Documentation**: See `/docs/ui/datatable.md` for full API reference
- **Examples**: Check existing migrated tables in the codebase
- **Testing**: Run tests to ensure migration doesn't break functionality
- **Type Errors**: Use TypeScript compiler to catch migration issues early

## Rollback Plan

If you encounter issues during migration:

1. **Revert Changes**: Git checkout the previous version
2. **Use Wrapper**: The SimpleTable wrapper provides backward compatibility
3. **Incremental Migration**: Migrate one table at a time
4. **Report Issues**: Document any problems for future reference