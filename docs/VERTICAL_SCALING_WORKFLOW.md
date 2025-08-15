# Vertical Scaling Workflow for Small Business CRM
## Adding New Features to React + TypeScript + Vite + Supabase Application

---

## Overview

This workflow template provides a systematic approach for adding new features to your CRM application. Follow this process for consistent, reliable feature development that maintains code quality and business value.

**Target Audience**: Small business (5-10 users)  
**Development Approach**: Single developer, phased implementation  
**Tech Stack**: React 18 + TypeScript + Vite + Supabase + shadcn/ui  
**Timeline per Feature**: 1-2 weeks depending on complexity

---

## Pre-Development Planning

### 1. Feature Requirements Definition

**Business Requirements Checklist**:
- [ ] **User Story**: Who needs this feature and why?
- [ ] **Business Value**: What problem does this solve?
- [ ] **Success Criteria**: How will you measure success?
- [ ] **Priority Level**: Critical, Important, or Nice-to-have?

**Example Template**:
```markdown
## Feature: Customer Follow-up Reminders

**User Story**: As a sales team member, I want automated reminders for customer follow-ups so I never miss important touchpoints.

**Business Value**: Improves customer retention and sales conversion by ensuring timely follow-ups.

**Success Criteria**: 
- Zero missed follow-ups in first month
- 20% improvement in follow-up response rate
- User adoption by all team members

**Priority**: Important (Phase 2 feature)
```

### 2. Technical Planning

**Technical Requirements**:
- [ ] **Database Changes**: New tables, columns, or relationships needed?
- [ ] **API Changes**: New endpoints or modifications to existing ones?
- [ ] **UI Components**: New forms, views, or component modifications?
- [ ] **Authentication**: Any changes to user access or permissions?

**Complexity Assessment**:
- **Simple** (1-3 days): Form fields, basic UI changes, simple data display
- **Medium** (4-7 days): New database tables, business logic, integrations
- **Complex** (1-2 weeks): Multiple integrations, complex workflows, advanced features

---

## Stage 1: Database Implementation (Day 1-2)

### Database Schema Design

**Step 1: Design Database Changes**
```sql
-- Example: Customer Follow-up Feature
-- File: sql/migrations/003_add_followup_reminders.sql

-- Create new table for follow-up reminders
CREATE TABLE customer_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES user_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business fields
  follow_up_date DATE NOT NULL,
  follow_up_type VARCHAR(50) NOT NULL CHECK (follow_up_type IN ('call', 'email', 'meeting', 'task')),
  notes TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_customer_followups_user_id ON customer_followups(user_id);
CREATE INDEX idx_customer_followups_follow_up_date ON customer_followups(follow_up_date);
CREATE INDEX idx_customer_followups_status ON customer_followups(status);

-- Add RLS policies for security
ALTER TABLE customer_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own follow-ups" ON customer_followups
  FOR ALL USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON customer_followups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**Step 2: Apply Database Migration**
```bash
# Run migration in Supabase dashboard SQL editor
# Or using local development setup
supabase db reset  # For development environment
```

**Step 3: Generate TypeScript Types**
```bash
# Generate new types including the new table
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
# OR for local development:
# npx supabase gen types typescript --local > src/types/database.types.ts
```

**Validation Checklist**:
- [ ] Migration runs without errors
- [ ] RLS policies tested with different users
- [ ] Indexes improve query performance
- [ ] TypeScript types generated correctly

---

## Stage 2: Type Definitions & Interfaces (Day 2-3)

### Create Feature-Specific Types

**Step 1: Create Type Definitions**
```typescript
// src/types/followup.types.ts
import type { Database } from '@/types/database.types'
import * as yup from 'yup'

// Database types
export type FollowupRecord = Database['public']['Tables']['customer_followups']['Row']
export type FollowupInsert = Database['public']['Tables']['customer_followups']['Insert']
export type FollowupUpdate = Database['public']['Tables']['customer_followups']['Update']

// Extended types with relationships
export interface FollowupWithCustomer extends FollowupRecord {
  customer?: {
    first_name: string
    last_name: string
    favorite_color: string
  }
}

// Form validation schema
export const followupSchema = yup.object({
  customer_id: yup.string().required('Customer is required'),
  follow_up_date: yup.date().required('Follow-up date is required').min(new Date(), 'Date must be in the future'),
  follow_up_type: yup.string().oneOf(['call', 'email', 'meeting', 'task']).required('Type is required'),
  notes: yup.string().max(500, 'Notes must be less than 500 characters'),
  priority: yup.string().oneOf(['low', 'medium', 'high']).default('medium')
})

export type FollowupFormData = yup.InferType<typeof followupSchema>

// UI-specific types
export interface FollowupListItem {
  id: string
  customerName: string
  followUpDate: string
  type: string
  priority: string
  status: string
  isOverdue: boolean
}
```

**Step 2: Create Custom Hooks**
```typescript
// src/hooks/useFollowups.ts
import { useState, useEffect, useMemo } from 'react'
import type { FollowupRecord, FollowupWithCustomer } from '@/types/followup.types'

export function useFollowups() {
  const [followups, setFollowups] = useState<FollowupWithCustomer[]>([])
  const [loading, setLoading] = useState(false)

  const overdueFollowups = useMemo(() => 
    followups.filter(f => 
      f.status === 'pending' && new Date(f.follow_up_date) < new Date()
    ), [followups]
  )

  const upcomingFollowups = useMemo(() =>
    followups.filter(f =>
      f.status === 'pending' && new Date(f.follow_up_date) >= new Date()
    ), [followups]
  )

  return {
    followups,
    setFollowups,
    loading,
    setLoading,
    overdueFollowups,
    upcomingFollowups
  }
}
```

---

## Stage 3: Data Management Implementation (Day 3-4)

### Create React Query Hooks for API Operations

```typescript
// src/hooks/useFollowupsQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { 
  FollowupRecord, 
  FollowupInsert, 
  FollowupUpdate,
  FollowupWithCustomer 
} from '@/types/followup.types'

// Query keys
export const followupKeys = {
  all: ['followups'] as const,
  lists: () => [...followupKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...followupKeys.lists(), { filters }] as const,
}

// Fetch followups
export function useFollowups() {
  return useQuery({
    queryKey: followupKeys.lists(),
    queryFn: async (): Promise<FollowupWithCustomer[]> => {
      const { data, error } = await supabase
        .from('customer_followups')
        .select(`
          *,
          customer:user_submissions(first_name, last_name, favorite_color)
        `)
        .order('follow_up_date', { ascending: true })

      if (error) throw error
      return data || []
    },
  })
}

// Create followup mutation
export function useCreateFollowup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (followupData: FollowupInsert) => {
      const { data, error } = await supabase
        .from('customer_followups')
        .insert(followupData)
        .select(`
          *,
          customer:user_submissions(first_name, last_name, favorite_color)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followupKeys.lists() })
      toast.success('Follow-up created successfully!')
    },
    onError: (error) => {
      console.error('Error creating follow-up:', error)
      toast.error('Failed to create follow-up. Please try again.')
    },
  })
}

// Update followup mutation
export function useUpdateFollowup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FollowupUpdate }) => {
      const { data, error } = await supabase
        .from('customer_followups')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customer:user_submissions(first_name, last_name, favorite_color)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followupKeys.lists() })
      toast.success('Follow-up updated successfully!')
    },
    onError: (error) => {
      console.error('Error updating follow-up:', error)
      toast.error('Failed to update follow-up. Please try again.')
    },
  })
}

// Complete followup mutation
export function useCompleteFollowup() {
  const updateMutation = useUpdateFollowup()
  
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      return updateMutation.mutateAsync({
        id,
        updates: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: notes || undefined
        }
      })
    },
  })
}

// Delete followup mutation
export function useDeleteFollowup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_followups')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followupKeys.lists() })
      toast.success('Follow-up deleted successfully!')
    },
    onError: (error) => {
      console.error('Error deleting follow-up:', error)
      toast.error('Failed to delete follow-up. Please try again.')
    },
  })
}
```

---

## Stage 4: Component Implementation (Day 4-6)

### Create Form Component

```tsx
// src/components/FollowupForm.tsx
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { followupSchema, type FollowupFormData } from '@/types/followup.types'
import { useCreateFollowup } from '@/hooks/useFollowupsQueries'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FollowupFormProps {
  onSuccess?: (id: string) => void
  onCancel?: () => void
}

export function FollowupForm({ onSuccess, onCancel }: FollowupFormProps) {
  const createFollowupMutation = useCreateFollowup()
  const { data: customers = [] } = useCustomers()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<FollowupFormData>({
    resolver: yupResolver(followupSchema),
    defaultValues: {
      customer_id: '',
      follow_up_date: '',
      follow_up_type: 'call',
      notes: '',
      priority: 'medium'
    }
  })

  const followupTypeOptions = [
    { value: 'call', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'task', label: 'Task' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ]

  const onSubmit = async (data: FollowupFormData) => {
    try {
      const result = await createFollowupMutation.mutateAsync({
        ...data,
        follow_up_date: data.follow_up_date,
        // user_id will be set by RLS
      })

      if (result) {
        onSuccess?.(result.id)
        reset()
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label htmlFor="customer_id">Customer *</Label>
          <Select onValueChange={(value) => setValue('customer_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customer_id && (
            <p className="text-sm text-red-600">{errors.customer_id.message}</p>
          )}
        </div>

        {/* Follow-up Type */}
        <div className="space-y-2">
          <Label htmlFor="follow_up_type">Follow-up Type *</Label>
          <Select onValueChange={(value) => setValue('follow_up_type', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {followupTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.follow_up_type && (
            <p className="text-sm text-red-600">{errors.follow_up_type.message}</p>
          )}
        </div>

        {/* Follow-up Date */}
        <div className="space-y-2">
          <Label htmlFor="follow_up_date">Follow-up Date *</Label>
          <Input
            type="date"
            {...register('follow_up_date')}
            className={errors.follow_up_date ? 'border-red-500' : ''}
          />
          {errors.follow_up_date && (
            <p className="text-sm text-red-600">{errors.follow_up_date.message}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select onValueChange={(value) => setValue('priority', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          {...register('notes')}
          placeholder="Additional notes about this follow-up..."
          rows={3}
          className={errors.notes ? 'border-red-500' : ''}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Follow-up'}
        </Button>
      </div>
    </form>
  )
}
```

### Create List Component

```tsx
// src/components/FollowupList.tsx
import React, { useState } from 'react'
import { useFollowups, useCompleteFollowup, useDeleteFollowup } from '@/hooks/useFollowupsQueries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FollowupForm } from './FollowupForm'
import { ExclamationTriangleIcon, ClockIcon, CheckCircleIcon, TrashIcon } from 'lucide-react'

export function FollowupList() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { data: followups = [], isLoading, error } = useFollowups()
  const completeFollowupMutation = useCompleteFollowup()
  const deleteFollowupMutation = useDeleteFollowup()

  const overdueCount = followups.filter(f => 
    f.status === 'pending' && new Date(f.follow_up_date) < new Date()
  ).length

  const todayFollowups = followups.filter(f => {
    const today = new Date().toDateString()
    const followupDate = new Date(f.follow_up_date).toDateString()
    return f.status === 'pending' && followupDate === today
  })

  const completedCount = followups.filter(f => f.status === 'completed').length

  const handleComplete = async (id: string) => {
    await completeFollowupMutation.mutateAsync({ id })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      await deleteFollowupMutation.mutateAsync(id)
    }
  }

  // Note: This is a simplified version. The full implementation would include:
  // - Complete stats cards with proper styling
  // - Full followup list with sorting and filtering
  // - Proper loading and error states
  // - Complete modal handling
  // - All the UI patterns shown in the Vue version converted to React
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Follow-ups</h3>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>Add Follow-up</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Follow-up</DialogTitle>
            </DialogHeader>
            <FollowupForm
              onSuccess={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - simplified version */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-900">{overdueCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-900">{todayFollowups.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading/Error States */}
      {isLoading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-red-600">Error loading followups</div>}

      {/* Followups List - simplified */}
      <div className="space-y-3">
        {followups.map((followup) => (
          <Card key={followup.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {followup.customer?.first_name} {followup.customer?.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {followup.follow_up_type} • {new Date(followup.follow_up_date).toLocaleDateString()}
                  </p>
                  {followup.notes && <p className="text-sm mt-2">{followup.notes}</p>}
                </div>
                <div className="flex gap-2">
                  {followup.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(followup.id)}
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(followup.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default FollowupList

/* 
 * Note: This is a simplified React version of the Vue component.
 * The full implementation should include all features from the Vue version:
 * - Complete styling and state management
 * - Proper responsive design
 * - All interaction patterns and animations
 * - Complete error handling and loading states
 */
```

---

## Stage 5: Route Integration (Day 6-7)

### Add New Routes

```typescript
// src/App.tsx - Add new routes using React Router DOM
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomeView from '@/pages/HomeView'
import FollowupsView from '@/pages/FollowupsView'
import AppNavigation from '@/components/AppNavigation'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppNavigation />
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/followups" element={<FollowupsView />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
```

### Create Page Component

```tsx
// src/pages/FollowupsView.tsx
import React, { useEffect } from 'react'
import { FollowupList } from '@/components/FollowupList'

export function FollowupsView() {
  useEffect(() => {
    document.title = 'Follow-ups - CRM'
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Follow-up Management</h1>
          <p className="mt-2 text-gray-600">
            Track and manage customer follow-ups to ensure no opportunities are missed.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <FollowupList />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FollowupsView
```

### Update Navigation

```tsx
// src/components/AppNavigation.tsx
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useFollowups } from '@/hooks/useFollowupsQueries'

export function AppNavigation() {
  const location = useLocation()
  const { data: followups = [] } = useFollowups()

  const overdueCount = followups.filter(f => 
    f.status === 'pending' && new Date(f.follow_up_date) < new Date()
  ).length

  const getLinkClasses = (isActive: boolean) => {
    return `inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => getLinkClasses(isActive)}
            >
              Dashboard
            </NavLink>
            
            <NavLink
              to="/followups"
              className={({ isActive }) => getLinkClasses(isActive)}
            >
              Follow-ups
              {overdueCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {overdueCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AppNavigation
```

---

## Stage 6: Testing & Validation (Day 7-8)

### Manual Testing Checklist

**Database Testing**:
- [ ] Create follow-up record successfully
- [ ] RLS policies prevent unauthorized access
- [ ] Data relationships work correctly (customer lookup)
- [ ] Date validations prevent past dates
- [ ] Required fields validation works

**UI Testing**:
- [ ] Form validation displays appropriate errors
- [ ] Success states show confirmation
- [ ] Loading states display during operations
- [ ] Mobile responsiveness works
- [ ] Accessibility features function (keyboard navigation, screen readers)

**Business Logic Testing**:
- [ ] Overdue follow-ups are highlighted
- [ ] Priority levels display correctly
- [ ] Status changes work (pending → completed)
- [ ] Sorting and filtering work as expected

### User Acceptance Testing

**Test Scenarios**:
1. **Create Follow-up Flow**
   - User creates a follow-up for existing customer
   - System sends confirmation
   - Follow-up appears in list with correct details

2. **Daily Workflow**
   - User sees overdue follow-ups highlighted
   - User sees today's follow-ups prominently
   - User can mark follow-ups as completed

3. **Mobile Usage**
   - User can view follow-ups on mobile device
   - User can create follow-ups on mobile
   - Touch interface works correctly

### Performance Testing

**Load Testing**:
- [ ] Page loads in <3 seconds
- [ ] Form submissions complete in <2 seconds
- [ ] List view handles 100+ follow-ups smoothly
- [ ] Database queries are optimized (check query plans)

---

## Stage 7: Deployment & Documentation (Day 8)

### Production Deployment

**Pre-Deployment Checklist**:
- [ ] Database migration tested in staging
- [ ] Environment variables configured
- [ ] Build process successful
- [ ] No TypeScript errors
- [ ] All tests passing

**Deployment Steps**:
```bash
# 1. Commit changes
git add .
git commit -m "feat: add customer follow-up management

- Add follow-up database schema with RLS policies
- Implement follow-up store with CRUD operations
- Create follow-up form and list components
- Add follow-up management view and routing
- Include overdue/today follow-up highlighting"

# 2. Push to staging (if using staging branch)
git push origin staging

# 3. Test in staging environment
# 4. Merge to main and deploy to production
git checkout main
git merge staging
git push origin main
```

### User Documentation

**Create Feature Documentation**:
```markdown
<!-- docs/features/followup-management.md -->
# Follow-up Management

## Overview
The follow-up management feature helps you track and manage customer follow-ups to ensure no opportunities are missed.

## How to Use

### Creating a Follow-up
1. Go to the Follow-ups page
2. Click "Add Follow-up"
3. Select the customer from the dropdown
4. Choose the follow-up type (call, email, meeting, task)
5. Set the follow-up date
6. Add notes if needed
7. Click "Create Follow-up"

### Managing Follow-ups
- **Overdue follow-ups** are highlighted in red
- **Today's follow-ups** are highlighted in yellow
- **Completed follow-ups** are shown in green
- Click the checkmark icon to mark a follow-up as completed
- Click the trash icon to delete a follow-up

### Mobile Usage
The follow-up system is fully responsive and works on mobile devices for field teams.

## Business Benefits
- Never miss important customer touchpoints
- Improve follow-up response rates
- Track team performance on customer engagement
- Increase sales conversion through timely follow-ups
```

### Technical Documentation

**Update Development Documentation**:
```markdown
<!-- Update CLAUDE.md with new feature -->
## Follow-up Management Feature

### Database Schema
- Table: `customer_followups`
- RLS enabled with user-scoped policies
- Indexes on user_id, follow_up_date, and status

### Key Components
- `FollowupForm.vue` - Form for creating/editing follow-ups
- `FollowupList.vue` - List view with status indicators
- `useFollowupStore.ts` - Pinia store for state management
- `followup.types.ts` - TypeScript definitions

### API Endpoints
All operations use Supabase client-side SDK:
- CREATE: Insert into customer_followups table
- READ: Select with customer relationship join
- UPDATE: Update status and completion timestamp
- DELETE: Hard delete with confirmation

### Business Logic
- Overdue calculation based on current date vs follow_up_date
- Priority-based visual indicators
- Status workflow: pending → completed/cancelled
```

---

## Post-Deployment Checklist

### Week 1: Monitoring & Support
- [ ] Monitor error logs for issues
- [ ] Gather user feedback on new feature
- [ ] Track usage analytics (if implemented)
- [ ] Provide user support and training

### Week 2: Optimization
- [ ] Review performance metrics
- [ ] Identify improvement opportunities
- [ ] Plan next iteration based on feedback
- [ ] Document lessons learned

### Future Enhancements
- [ ] Email notifications for overdue follow-ups
- [ ] Calendar integration for follow-up scheduling
- [ ] Automated follow-up creation based on customer interactions
- [ ] Follow-up analytics and reporting

---

## Quick Reference

### Commands
```bash
# Generate types after database changes
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Common Patterns
- Always create types file for new features
- Use React Query for state management and API calls
- Follow existing component patterns using shadcn/ui components
- Implement proper error handling and loading states
- Add proper TypeScript types throughout
- Include mobile responsiveness with Tailwind CSS
- Test RLS policies thoroughly
- Use React Hook Form + Yup for form validation

### Troubleshooting
- **Build errors**: Check TypeScript types and imports
- **Database errors**: Verify RLS policies and user authentication
- **UI issues**: Check responsive design classes and accessibility
- **Performance issues**: Review database queries and component optimization

---

This workflow ensures consistent, high-quality feature development while maintaining the codebase's architecture and business value focus.