<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                {{ isEditMode ? 'Edit Organization' : 'Create Organization' }}
              </h1>
              <p class="mt-1 text-sm text-gray-600">
                {{ isEditMode 
                  ? 'Update organization information and details' 
                  : 'Add a new organization to your CRM system'
                }}
              </p>
            </div>
            
            <!-- Back Button -->
            <router-link 
              :to="backRoute"
              class="btn btn-secondary"
            >
              ← Back
            </router-link>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="animate-pulse space-y-4">
            <div class="h-8 bg-gray-300 rounded w-1/3 mx-auto"></div>
            <div class="space-y-6">
              <div class="h-64 bg-gray-300 rounded-lg"></div>
              <div class="h-48 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          <p class="text-gray-500 mt-4">Loading organization data...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-600 mb-4">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p class="text-lg font-medium">Error loading organization</p>
            <p class="text-sm">{{ error }}</p>
          </div>
          <div class="flex justify-center space-x-3">
            <button @click="loadOrganization" class="btn btn-primary">
              Try Again
            </button>
            <router-link :to="backRoute" class="btn btn-secondary">
              Go Back
            </router-link>
          </div>
        </div>
        
        <!-- Form -->
        <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <OrganizationFormComponent
            :initial-data="formData"
            :is-edit-mode="isEditMode"
            :is-multi-step="true"
            :available-parent-organizations="parentOrganizations"
            :is-submitting="isSubmitting"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrganizationStore } from '@/stores/organizationStore'
import OrganizationFormComponent from '@/components/organizations/molecular/OrganizationForm.vue'
import type { CreateOrganizationSchema, UpdateOrganizationSchema } from '@/types'

const route = useRoute()
const router = useRouter()
const organizationStore = useOrganizationStore()

// Component state
const isLoading = ref(false)
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const formData = ref<Partial<CreateOrganizationSchema>>({})

// Computed properties
const isEditMode = computed(() => route.name === 'organization-edit')

const organizationId = computed(() => {
  return isEditMode.value ? route.params.id as string : null
})

const backRoute = computed(() => {
  if (isEditMode.value && organizationId.value) {
    return `/organizations/${organizationId.value}`
  }
  return '/organizations'
})

const parentOrganizations = computed(() => {
  // Get all organizations except the current one (for edit mode)
  return organizationStore.organizations.filter(org => 
    org.id !== organizationId.value
  ).map(org => ({
    id: org.id,
    name: org.name,
    type: org.type
  }))
})

// Methods
const loadOrganization = async () => {
  if (!isEditMode.value || !organizationId.value) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const organization = await organizationStore.getOrganization(organizationId.value)
    
    // Map organization data to form data
    formData.value = {
      name: organization.name,
      type: organization.type,
      description: organization.description || undefined,
      phone: organization.phone || undefined,
      email: organization.email || undefined,
      website: organization.website || undefined,
      address_line_1: organization.address_line_1 || undefined,
      address_line_2: organization.address_line_2 || undefined,
      city: organization.city || undefined,
      state_province: organization.state_province || undefined,
      postal_code: organization.postal_code || undefined,
      country: organization.country || undefined,
      annual_revenue: organization.annual_revenue || undefined,
      employee_count: organization.employee_count || undefined,
      industry: organization.industry || undefined,
      parent_organization_id: organization.parent_organization_id || undefined
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load organization'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async (data: CreateOrganizationSchema | UpdateOrganizationSchema) => {
  isSubmitting.value = true
  
  try {
    if (isEditMode.value && organizationId.value) {
      // Update existing organization
      await organizationStore.updateOrganization(organizationId.value, data as UpdateOrganizationSchema)
      
      // Redirect to organization details
      router.push(`/organizations/${organizationId.value}`)
    } else {
      // Handle parent organization from query params
      if (route.query.parent) {
        (data as CreateOrganizationSchema).parent_organization_id = route.query.parent as string
      }
      
      // Create new organization
      const newOrganization = await organizationStore.createOrganization(data as CreateOrganizationSchema)
      
      // Redirect to new organization details
      router.push(`/organizations/${newOrganization.id}`)
    }
  } catch (err) {
    // Error handling is done in the store
    console.error('Form submission failed:', err)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push(backRoute.value)
}

// Lifecycle
onMounted(async () => {
  // Load parent organizations
  if (organizationStore.organizations.length === 0) {
    await organizationStore.fetchOrganizations()
  }
  
  // Load organization data for edit mode
  if (isEditMode.value) {
    await loadOrganization()
  } else {
    // Pre-fill parent organization if specified in query
    if (route.query.parent) {
      formData.value.parent_organization_id = route.query.parent as string
    }
  }
})
</script>