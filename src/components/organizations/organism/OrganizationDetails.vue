<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-gray-300 rounded w-1/3 mx-auto"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div class="lg:col-span-2 space-y-6">
              <div class="h-64 bg-gray-300 rounded-lg"></div>
              <div class="h-48 bg-gray-300 rounded-lg"></div>
            </div>
            <div class="space-y-6">
              <div class="h-32 bg-gray-300 rounded-lg"></div>
              <div class="h-48 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
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
          <router-link to="/organizations" class="btn btn-secondary">
            Back to Organizations
          </router-link>
        </div>
      </div>

      <!-- Organization Details -->
      <div v-else-if="organization" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center space-x-4 mb-4 sm:mb-0">
              <OrganizationAvatar :organization="organization" size="xl" />
              <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ organization.name }}</h1>
                <div class="flex items-center space-x-3 mt-2">
                  <OrganizationTypeChip :type="organization.type" />
                  <OrganizationStatus :organization="organization" />
                </div>
                <p v-if="organization.description" class="text-gray-600 mt-2">
                  {{ organization.description }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-3">
              <button
                @click="handleAddContact"
                class="btn btn-secondary"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Contact
              </button>
              <router-link 
                :to="`/organizations/${organization.id}/edit`"
                class="btn btn-primary"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Organization
              </router-link>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Contact Information -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="organization.email">
                  <label class="text-sm font-medium text-gray-500">Email</label>
                  <div class="mt-1">
                    <a 
                      :href="`mailto:${organization.email}`"
                      class="text-primary-600 hover:text-primary-800"
                    >
                      {{ organization.email }}
                    </a>
                  </div>
                </div>
                
                <div v-if="organization.phone">
                  <label class="text-sm font-medium text-gray-500">Phone</label>
                  <div class="mt-1">
                    <a 
                      :href="`tel:${organization.phone}`"
                      class="text-primary-600 hover:text-primary-800"
                    >
                      {{ organization.phone }}
                    </a>
                  </div>
                </div>
                
                <div v-if="organization.website">
                  <label class="text-sm font-medium text-gray-500">Website</label>
                  <div class="mt-1">
                    <a 
                      :href="organization.website" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="text-primary-600 hover:text-primary-800"
                    >
                      {{ formatWebsite(organization.website) }}
                    </a>
                  </div>
                </div>
                
                <div v-if="fullAddress">
                  <label class="text-sm font-medium text-gray-500">Address</label>
                  <div class="mt-1 text-gray-900">
                    {{ fullAddress }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Business Details -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="organization.industry">
                  <label class="text-sm font-medium text-gray-500">Industry</label>
                  <div class="mt-1 text-gray-900">{{ organization.industry }}</div>
                </div>
                
                <div v-if="organization.annual_revenue">
                  <label class="text-sm font-medium text-gray-500">Annual Revenue</label>
                  <div class="mt-1 text-gray-900">{{ formatRevenue(organization.annual_revenue) }}</div>
                </div>
                
                <div v-if="organization.employee_count">
                  <label class="text-sm font-medium text-gray-500">Employees</label>
                  <div class="mt-1 text-gray-900">{{ organization.employee_count.toLocaleString() }}</div>
                </div>
                
                <div v-if="organization.parent_organization">
                  <label class="text-sm font-medium text-gray-500">Parent Organization</label>
                  <div class="mt-1">
                    <router-link
                      :to="`/organizations/${organization.parent_organization.id}`"
                      class="text-primary-600 hover:text-primary-800"
                    >
                      {{ organization.parent_organization.name }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Child Organizations -->
            <div v-if="organization.child_organizations?.length" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">
                Child Organizations ({{ organization.child_organizations.length }})
              </h2>
              <div class="space-y-3">
                <div 
                  v-for="child in organization.child_organizations"
                  :key="child.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div class="flex items-center space-x-3">
                    <OrganizationAvatar :organization="child" size="sm" />
                    <div>
                      <router-link
                        :to="`/organizations/${child.id}`"
                        class="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {{ child.name }}
                      </router-link>
                      <div class="text-sm text-gray-500">{{ child.type }}</div>
                    </div>
                  </div>
                  <OrganizationTypeChip :type="child.type" size="sm" />
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No recent activity</p>
              </div>
              <div v-else class="space-y-3">
                <div 
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  class="flex items-start space-x-3 p-3 bg-gray-50 rounded-md"
                >
                  <div class="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">{{ activity.description }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(activity.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Sidebar -->
          <div class="space-y-6">
            <!-- Quick Stats -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Contacts</span>
                  <span class="text-lg font-semibold text-gray-900">
                    {{ organization.contacts?.length || 0 }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Opportunities</span>
                  <span class="text-lg font-semibold text-gray-900">
                    {{ organization.opportunities?.length || 0 }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Products</span>
                  <span class="text-lg font-semibold text-gray-900">
                    {{ organization.products?.length || 0 }}
                  </span>
                </div>
                <div v-if="totalOpportunityValue > 0" class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Pipeline Value</span>
                  <span class="text-lg font-semibold text-emerald-600">
                    {{ formatRevenue(totalOpportunityValue) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Contact List -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Contacts</h3>
                <button 
                  @click="handleAddContact"
                  class="text-sm text-primary-600 hover:text-primary-800"
                >
                  Add Contact
                </button>
              </div>
              
              <div v-if="!organization.contacts?.length" class="text-center py-4 text-gray-500">
                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p>No contacts yet</p>
              </div>
              
              <div v-else class="space-y-3">
                <div 
                  v-for="contact in organization.contacts.slice(0, 5)"
                  :key="contact.id"
                  class="flex items-center space-x-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  @click="handleViewContact(contact.id)"
                >
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-gray-700">
                      {{ getInitials(contact.first_name, contact.last_name) }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ contact.first_name }} {{ contact.last_name }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ contact.title || contact.email }}
                    </p>
                  </div>
                  <div v-if="contact.is_primary_contact" class="flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                      Primary
                    </span>
                  </div>
                </div>
                
                <div v-if="organization.contacts.length > 5" class="text-center">
                  <router-link
                    :to="`/organizations/${organization.id}/contacts`"
                    class="text-sm text-primary-600 hover:text-primary-800"
                  >
                    View all {{ organization.contacts.length }} contacts
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Opportunities -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Opportunities</h3>
                <button 
                  @click="handleAddOpportunity"
                  class="text-sm text-primary-600 hover:text-primary-800"
                >
                  Add Opportunity
                </button>
              </div>
              
              <div v-if="!organization.opportunities?.length" class="text-center py-4 text-gray-500">
                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No opportunities yet</p>
              </div>
              
              <div v-else class="space-y-3">
                <div 
                  v-for="opportunity in organization.opportunities.slice(0, 5)"
                  :key="opportunity.id"
                  class="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  @click="handleViewOpportunity(opportunity.id)"
                >
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ opportunity.name }}
                    </p>
                    <span class="text-sm font-semibold text-emerald-600">
                      {{ formatRevenue(opportunity.estimated_value) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {{ formatStage(opportunity.stage) }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ opportunity.estimated_close_date ? formatDate(opportunity.estimated_close_date) : 'No date set' }}
                    </span>
                  </div>
                </div>
                
                <div v-if="organization.opportunities.length > 5" class="text-center">
                  <router-link
                    :to="`/organizations/${organization.id}/opportunities`"
                    class="text-sm text-primary-600 hover:text-primary-800"
                  >
                    View all {{ organization.opportunities.length }} opportunities
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Metadata -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Information</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Created</span>
                  <span class="text-gray-900">{{ organization.created_at ? formatDate(organization.created_at) : 'Unknown' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Last Updated</span>
                  <span class="text-gray-900">{{ organization.updated_at ? formatDate(organization.updated_at) : 'Unknown' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Organization ID</span>
                  <span class="text-gray-900 font-mono text-xs">{{ organization.id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrganizationStore } from '@/stores/organizationStore'
import OrganizationAvatar from '../atomic/OrganizationAvatar.vue'
import OrganizationTypeChip from '../atomic/OrganizationTypeChip.vue'
import OrganizationStatus from '../atomic/OrganizationStatus.vue'
import type { OrganizationWithRelations } from '@/services'

const route = useRoute()
const router = useRouter()
const organizationStore = useOrganizationStore()

// Component state
const organization = ref<OrganizationWithRelations | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Mock recent activity data
const recentActivity = ref([
  {
    id: '1',
    description: 'Organization profile updated',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: '2', 
    description: 'New contact added: John Smith',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: '3',
    description: 'Opportunity created: Q1 Equipment Purchase',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  }
])

// Computed properties
const fullAddress = computed(() => {
  if (!organization.value) return null
  
  const parts = [
    organization.value.address_line_1,
    organization.value.address_line_2,
    organization.value.city,
    organization.value.state_province,
    organization.value.postal_code,
    organization.value.country
  ].filter(Boolean)
  
  return parts.length > 0 ? parts.join(', ') : null
})

const totalOpportunityValue = computed(() => {
  if (!organization.value?.opportunities) return 0
  return organization.value.opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)
})

// Methods
const loadOrganization = async () => {
  const organizationId = route.params.id as string
  
  if (!organizationId) {
    error.value = 'Organization ID is required'
    isLoading.value = false
    return
  }
  
  isLoading.value = true
  error.value = null
  
  try {
    organization.value = await organizationStore.getOrganization(organizationId, {
      useCache: false,
      forceRefresh: true
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load organization'
  } finally {
    isLoading.value = false
  }
}

// Event handlers
const handleAddContact = () => {
  router.push(`/organizations/${organization.value?.id}/contacts/new`)
}

const handleAddOpportunity = () => {
  router.push(`/organizations/${organization.value?.id}/opportunities/new`)
}

const handleViewContact = (contactId: string) => {
  router.push(`/contacts/${contactId}`)
}

const handleViewOpportunity = (opportunityId: string) => {
  router.push(`/opportunities/${opportunityId}`)
}

// Utility functions
const formatWebsite = (website: string): string => {
  return website.replace(/^https?:\/\//, '').replace(/^www\./, '')
}

const formatRevenue = (revenue?: number | null): string => {
  if (!revenue) return 'N/A'
  
  if (revenue >= 1000000) {
    return `$${(revenue / 1000000).toFixed(1)}M`
  } else if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(0)}K`
  }
  return `$${revenue.toLocaleString()}`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatStage = (stage: string): string => {
  return stage.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || '??'
}

// Lifecycle
onMounted(() => {
  loadOrganization()
})
</script>

<style scoped>
/* Add any component-specific styles */
</style>