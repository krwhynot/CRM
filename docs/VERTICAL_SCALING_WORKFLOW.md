# Vertical Scaling Workflow for Small Business CRM
## Adding New Features to Vue 3 + Supabase Application

---

## Overview

This workflow template provides a systematic approach for adding new features to your CRM application. Follow this process for consistent, reliable feature development that maintains code quality and business value.

**Target Audience**: Small business (5-10 users)  
**Development Approach**: Single developer, phased implementation  
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
npx supabase gen types typescript --local > src/types/database.types.ts
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

**Step 2: Create Composables (if needed)**
```typescript
// src/composables/useFollowups.ts
import { ref, computed } from 'vue'
import type { FollowupRecord, FollowupWithCustomer } from '@/types/followup.types'

export function useFollowups() {
  const followups = ref<FollowupWithCustomer[]>([])
  const loading = ref(false)

  const overdueFollowups = computed(() => 
    followups.value.filter(f => 
      f.status === 'pending' && new Date(f.follow_up_date) < new Date()
    )
  )

  const upcomingFollowups = computed(() =>
    followups.value.filter(f =>
      f.status === 'pending' && new Date(f.follow_up_date) >= new Date()
    )
  )

  return {
    followups,
    loading,
    overdueFollowups,
    upcomingFollowups
  }
}
```

---

## Stage 3: Store Implementation (Day 3-4)

### Create Pinia Store

```typescript
// src/stores/followupStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabaseClient'
import type { 
  FollowupRecord, 
  FollowupInsert, 
  FollowupUpdate,
  FollowupWithCustomer 
} from '@/types/followup.types'

export const useFollowupStore = defineStore('followup', () => {
  // State
  const followups = ref<FollowupWithCustomer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const overdueCount = computed(() => 
    followups.value.filter(f => 
      f.status === 'pending' && new Date(f.follow_up_date) < new Date()
    ).length
  )

  const todayFollowups = computed(() =>
    followups.value.filter(f => {
      const today = new Date().toDateString()
      const followupDate = new Date(f.follow_up_date).toDateString()
      return f.status === 'pending' && followupDate === today
    })
  )

  // Actions
  const fetchFollowups = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('customer_followups')
        .select(`
          *,
          customer:user_submissions(first_name, last_name, favorite_color)
        `)
        .order('follow_up_date', { ascending: true })

      if (fetchError) throw fetchError
      followups.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch follow-ups'
      console.error('Error fetching follow-ups:', err)
    } finally {
      loading.value = false
    }
  }

  const createFollowup = async (followupData: FollowupInsert) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('customer_followups')
        .insert(followupData)
        .select(`
          *,
          customer:user_submissions(first_name, last_name, favorite_color)
        `)
        .single()

      if (insertError) throw insertError
      
      if (data) {
        followups.value.push(data)
        // Sort by date after adding
        followups.value.sort((a, b) => 
          new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime()
        )
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create follow-up'
      console.error('Error creating follow-up:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateFollowup = async (id: string, updates: FollowupUpdate) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('customer_followups')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customer:user_submissions(first_name, last_name, favorite_color)
        `)
        .single()

      if (updateError) throw updateError

      if (data) {
        const index = followups.value.findIndex(f => f.id === id)
        if (index !== -1) {
          followups.value[index] = data
        }
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update follow-up'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const completeFollowup = async (id: string, notes?: string) => {
    return updateFollowup(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes: notes || undefined
    })
  }

  const deleteFollowup = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('customer_followups')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      followups.value = followups.value.filter(f => f.id !== id)
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete follow-up'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    followups: readonly(followups),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    overdueCount,
    todayFollowups,
    
    // Actions
    fetchFollowups,
    createFollowup,
    updateFollowup,
    completeFollowup,
    deleteFollowup
  }
})
```

---

## Stage 4: Component Implementation (Day 4-6)

### Create Form Component

```vue
<!-- src/components/FollowupForm.vue -->
<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Customer Selection -->
      <SelectField
        name="customer_id"
        label="Customer"
        v-model="formData.customer_id"
        :options="customerOptions"
        :error="errors.customer_id"
        @blur="validateField('customer_id')"
        required
      />

      <!-- Follow-up Type -->
      <SelectField
        name="follow_up_type"
        label="Follow-up Type"
        v-model="formData.follow_up_type"
        :options="followupTypeOptions"
        :error="errors.follow_up_type"
        @blur="validateField('follow_up_type')"
        required
      />

      <!-- Follow-up Date -->
      <InputField
        type="date"
        name="follow_up_date"
        label="Follow-up Date"
        v-model="formData.follow_up_date"
        :error="errors.follow_up_date"
        @blur="validateField('follow_up_date')"
        required
      />

      <!-- Priority -->
      <SelectField
        name="priority"
        label="Priority"
        v-model="formData.priority"
        :options="priorityOptions"
        :error="errors.priority"
        @blur="validateField('priority')"
      />
    </div>

    <!-- Notes -->
    <div>
      <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
        Notes
      </label>
      <textarea
        id="notes"
        v-model="formData.notes"
        :class="textareaClasses"
        rows="3"
        placeholder="Additional notes about this follow-up..."
        @blur="validateField('notes')"
      ></textarea>
      <p v-if="errors.notes" class="mt-1 text-sm text-red-600" role="alert">
        {{ errors.notes }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="onCancel"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Creating...' : 'Create Follow-up' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { followupSchema, type FollowupFormData } from '@/types/followup.types'
import { useFollowupStore } from '@/stores/followupStore'
import { useUserSubmissionStore } from '@/stores/userSubmissionStore'
import InputField from './InputField.vue'
import SelectField from './SelectField.vue'

// Props & Emits
const emit = defineEmits<{
  success: [id: string]
  cancel: []
}>()

// Stores
const followupStore = useFollowupStore()
const userStore = useUserSubmissionStore()

// Form state
const formData = reactive<FollowupFormData>({
  customer_id: '',
  follow_up_date: '',
  follow_up_type: 'call',
  notes: '',
  priority: 'medium'
})

const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)

// Options
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

const customerOptions = computed(() =>
  userStore.submissions.map(customer => ({
    value: customer.id,
    label: `${customer.first_name} ${customer.last_name}`
  }))
)

const textareaClasses = computed(() => {
  const base = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2'
  const errorClasses = 'border-red-500 focus:ring-red-500'
  const normalClasses = 'border-gray-300 focus:ring-blue-500'
  
  return `${base} ${errors.notes ? errorClasses : normalClasses}`
})

// Validation
const validateField = async (fieldName: keyof FollowupFormData) => {
  try {
    await followupSchema.validateAt(fieldName, formData)
    errors[fieldName] = ''
  } catch (error: any) {
    errors[fieldName] = error.message
  }
}

const validateForm = async (): Promise<boolean> => {
  try {
    await followupSchema.validate(formData, { abortEarly: false })
    Object.keys(errors).forEach(key => errors[key] = '')
    return true
  } catch (error: any) {
    error.inner?.forEach((err: any) => {
      if (err.path) errors[err.path] = err.message
    })
    return false
  }
}

// Actions
const onSubmit = async () => {
  if (isSubmitting.value) return

  const isValid = await validateForm()
  if (!isValid) return

  isSubmitting.value = true

  const result = await followupStore.createFollowup({
    ...formData,
    follow_up_date: formData.follow_up_date,
    user_id: undefined // Will be set by RLS
  })

  if (result.success && result.data) {
    emit('success', result.data.id)
    // Reset form
    Object.assign(formData, {
      customer_id: '',
      follow_up_date: '',
      follow_up_type: 'call',
      notes: '',
      priority: 'medium'
    })
  }

  isSubmitting.value = false
}

const onCancel = () => {
  emit('cancel')
}

// Load customers on mount
onMounted(() => {
  if (userStore.submissions.length === 0) {
    userStore.fetchSubmissions()
  }
})
</script>
```

### Create List Component

```vue
<!-- src/components/FollowupList.vue -->
<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Follow-ups</h3>
      <button
        @click="showCreateForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Follow-up
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-red-50 p-4 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-8 w-8 text-red-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-red-800">Overdue</p>
            <p class="text-2xl font-bold text-red-900">{{ followupStore.overdueCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-yellow-50 p-4 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ClockIcon class="h-8 w-8 text-yellow-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-yellow-800">Today</p>
            <p class="text-2xl font-bold text-yellow-900">{{ followupStore.todayFollowups.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 p-4 rounded-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-8 w-8 text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-green-800">Completed</p>
            <p class="text-2xl font-bold text-green-900">{{ completedCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Form Modal -->
    <div v-if="showCreateForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h4 class="text-lg font-medium mb-4">Create Follow-up</h4>
        <FollowupForm
          @success="onCreateSuccess"
          @cancel="showCreateForm = false"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="followupStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading follow-ups...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="followupStore.error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-800">{{ followupStore.error }}</p>
    </div>

    <!-- Follow-up List -->
    <div v-else-if="followupStore.followups.length > 0" class="space-y-3">
      <div
        v-for="followup in sortedFollowups"
        :key="followup.id"
        :class="followupCardClasses(followup)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <h4 class="font-medium text-gray-900">
                {{ followup.customer?.first_name }} {{ followup.customer?.last_name }}
              </h4>
              <span :class="priorityBadgeClasses(followup.priority)">
                {{ followup.priority }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mt-1">
              {{ formatFollowupType(followup.follow_up_type) }} • 
              {{ formatDate(followup.follow_up_date) }}
            </p>
            
            <p v-if="followup.notes" class="text-sm text-gray-700 mt-2">
              {{ followup.notes }}
            </p>
          </div>

          <div class="flex items-center space-x-2 ml-4">
            <button
              v-if="followup.status === 'pending'"
              @click="completeFollowup(followup.id)"
              class="text-green-600 hover:text-green-800 focus:outline-none"
              title="Mark as completed"
            >
              <CheckCircleIcon class="h-5 w-5" />
            </button>
            
            <button
              @click="deleteFollowup(followup.id)"
              class="text-red-600 hover:text-red-800 focus:outline-none"
              title="Delete follow-up"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <ClockIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No follow-ups</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a follow-up reminder.</p>
      <button
        @click="showCreateForm = true"
        class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Add Follow-up
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFollowupStore } from '@/stores/followupStore'
import type { FollowupWithCustomer } from '@/types/followup.types'
import FollowupForm from './FollowupForm.vue'
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

// Store
const followupStore = useFollowupStore()

// Local state
const showCreateForm = ref(false)

// Computed
const sortedFollowups = computed(() => {
  return [...followupStore.followups].sort((a, b) => {
    // Sort by status (pending first), then by date
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1
    }
    return new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime()
  })
})

const completedCount = computed(() =>
  followupStore.followups.filter(f => f.status === 'completed').length
)

// Methods
const followupCardClasses = (followup: FollowupWithCustomer) => {
  const base = 'border rounded-lg p-4'
  const isOverdue = followup.status === 'pending' && new Date(followup.follow_up_date) < new Date()
  const isToday = new Date(followup.follow_up_date).toDateString() === new Date().toDateString()
  
  if (followup.status === 'completed') {
    return `${base} bg-green-50 border-green-200`
  } else if (isOverdue) {
    return `${base} bg-red-50 border-red-200`
  } else if (isToday) {
    return `${base} bg-yellow-50 border-yellow-200`
  } else {
    return `${base} bg-white border-gray-200`
  }
}

const priorityBadgeClasses = (priority: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (priority) {
    case 'high':
      return `${base} bg-red-100 text-red-800`
    case 'medium':
      return `${base} bg-yellow-100 text-yellow-800`
    case 'low':
      return `${base} bg-gray-100 text-gray-800`
    default:
      return `${base} bg-gray-100 text-gray-800`
  }
}

const formatFollowupType = (type: string) => {
  const types = {
    call: 'Phone Call',
    email: 'Email',
    meeting: 'Meeting',
    task: 'Task'
  }
  return types[type as keyof typeof types] || type
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const completeFollowup = async (id: string) => {
  await followupStore.completeFollowup(id)
}

const deleteFollowup = async (id: string) => {
  if (confirm('Are you sure you want to delete this follow-up?')) {
    await followupStore.deleteFollowup(id)
  }
}

const onCreateSuccess = () => {
  showCreateForm.value = false
}

// Load data on mount
onMounted(() => {
  followupStore.fetchFollowups()
})
</script>
```

---

## Stage 5: Route Integration (Day 6-7)

### Add New Routes

```typescript
// src/router/index.ts - Add new routes
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FollowupsView from '@/views/FollowupsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/followups',
      name: 'followups',
      component: FollowupsView,
      meta: { 
        requiresAuth: true,
        title: 'Follow-ups'
      }
    }
  ]
})

export default router
```

### Create View Component

```vue
<!-- src/views/FollowupsView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Follow-up Management</h1>
        <p class="mt-2 text-gray-600">
          Track and manage customer follow-ups to ensure no opportunities are missed.
        </p>
      </div>

      <!-- Main Content -->
      <div class="bg-white shadow rounded-lg">
        <div class="p-6">
          <FollowupList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FollowupList from '@/components/FollowupList.vue'

// Set page title
document.title = 'Follow-ups - CRM'
</script>
```

### Update Navigation

```vue
<!-- Update main navigation to include new feature -->
<!-- src/components/AppNavigation.vue (or wherever navigation is defined) -->
<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex space-x-8">
          <router-link
            to="/"
            class="inline-flex items-center px-1 pt-1 text-sm font-medium"
            :class="routeLinkClasses('home')"
          >
            Dashboard
          </router-link>
          
          <router-link
            to="/followups"
            class="inline-flex items-center px-1 pt-1 text-sm font-medium"
            :class="routeLinkClasses('followups')"
          >
            Follow-ups
            <span v-if="followupStore.overdueCount > 0" 
                  class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {{ followupStore.overdueCount }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFollowupStore } from '@/stores/followupStore'

const route = useRoute()
const followupStore = useFollowupStore()

const routeLinkClasses = (routeName: string) => {
  const isActive = route.name === routeName
  return isActive
    ? 'border-blue-500 text-blue-600 border-b-2'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2'
}
</script>
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
npx supabase gen types typescript --local > src/types/database.types.ts

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

### Common Patterns
- Always create types file for new features
- Use Pinia stores for state management
- Follow existing component patterns (InputField, SelectField)
- Implement proper error handling and loading states
- Add proper TypeScript types throughout
- Include mobile responsiveness
- Test RLS policies thoroughly

### Troubleshooting
- **Build errors**: Check TypeScript types and imports
- **Database errors**: Verify RLS policies and user authentication
- **UI issues**: Check responsive design classes and accessibility
- **Performance issues**: Review database queries and component optimization

---

This workflow ensures consistent, high-quality feature development while maintaining the codebase's architecture and business value focus.