<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Organizations</h1>
            <p class="mt-1 text-sm text-gray-600">
              Manage your principals, distributors, customers, and prospects
            </p>
          </div>
          
          <!-- Header Actions -->
          <div class="mt-4 sm:mt-0 flex items-center space-x-3">
            <!-- View Mode Toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                @click="viewMode = 'table'"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <!-- Bulk Actions -->
            <div v-if="organizationStore.hasSelection" class="relative">
              <button
                @click="showBulkActions = !showBulkActions"
                class="btn btn-secondary"
              >
                Actions ({{ organizationStore.selectedOrganizations.length }})
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Bulk Actions Dropdown -->
              <div 
                v-if="showBulkActions"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
              >
                <div class="py-1">
                  <button
                    @click="handleBulkExport"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export Selected
                  </button>
                  <button
                    @click="handleBulkEdit"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Bulk Edit
                  </button>
                  <hr class="border-gray-200 my-1">
                  <button
                    @click="handleBulkDelete"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Create Button -->
            <router-link to="/organizations/new" class="btn btn-primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Organization
            </router-link>
          </div>
        </div>
        
        <!-- Search and Filters -->
        <div class="mb-6">
          <OrganizationSearch
            :total-results="organizationStore.organizationCount"
            :is-loading="organizationStore.isLoading"
            :parent-organizations="organizationStore.rootOrganizations"
            @search="handleSearch"
            @filter="handleFilter"
            @sort="handleSort"
            @clear="handleClearFilters"
          />
        </div>
        
        <!-- Metrics Dashboard -->
        <div class="mb-6" v-if="showMetrics">
          <OrganizationMetrics
            :metrics="metrics"
            :is-loading="metricsLoading"
            :error="metricsError"
            @refresh="loadMetrics"
          />
        </div>
        
        <!-- Organization List -->
        <div class="space-y-6">
          <!-- Loading State -->
          <div v-if="organizationStore.isLoading && organizations.length === 0" class="text-center py-12">
            <div class="animate-pulse space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="bg-gray-300 h-48 rounded-lg"></div>
              </div>
            </div>
            <p class="text-gray-500 mt-4">Loading organizations...</p>
          </div>
          
          <!-- Error State -->
          <div v-else-if="organizationStore.hasErrors" class="text-center py-12">
            <div class="text-red-600 mb-4">
              <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p class="text-lg font-medium">Error loading organizations</p>
              <p class="text-sm">{{ Object.values(organizationStore.errors).find(Boolean) }}</p>
            </div>
            <button 
              @click="refreshData"
              class="btn btn-primary"
            >
              Try Again
            </button>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="organizations.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 21h2m-2 0H3m2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M9 7h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
            <p class="text-gray-600 mb-6">
              {{ hasActiveFilters ? 'Try adjusting your search criteria' : 'Get started by creating your first organization' }}
            </p>
            
            <div class="flex justify-center space-x-3">
              <router-link 
                to="/organizations/new" 
                class="btn btn-primary"
              >
                Create Organization
              </router-link>
              <button 
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <!-- Organizations Grid View -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <OrganizationCard
              v-for="organization in organizations"
              :key="organization.id"
              :organization="organization"
              :selectable="true"
              :is-selected="organizationStore.isOrganizationSelected(organization.id)"
              @view="handleViewOrganization"
              @edit="handleEditOrganization"
              @delete="handleDeleteOrganization"
              @add-contact="handleAddContact"
              @view-opportunities="handleViewOpportunities"
              @toggle-selection="organizationStore.toggleOrganizationSelection"
            />
          </div>
          
          <!-- Organizations Table View -->
          <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      :checked="isAllSelected"
                      :indeterminate="isSomeSelected"
                      @change="handleSelectAll"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacts
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunities
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="organization in organizations"
                  :key="organization.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      :checked="organizationStore.isOrganizationSelected(organization.id)"
                      @change="organizationStore.toggleOrganizationSelection(organization.id)"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <OrganizationAvatar :organization="organization" size="sm" class="mr-3" />
                      <div>
                        <button
                          @click="handleViewOrganization(organization.id)"
                          class="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {{ organization.name }}
                        </button>
                        <div class="text-sm text-gray-500">
                          {{ organization.industry || 'No industry specified' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <OrganizationTypeChip :type="organization.type" size="sm" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatLocation(organization) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ organization.contacts?.length || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ organization.opportunities?.length || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatRevenue(organization.annual_revenue) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="handleViewOrganization(organization.id)"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </button>
                      <button
                        @click="handleEditOrganization(organization.id)"
                        class="text-gray-400 hover:text-gray-600"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div 
            v-if="organizations.length > 0"
            class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border"
          >
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="organizationStore.loadPreviousPage()"
                :disabled="organizationStore.pagination.page <= 1 || organizationStore.isLoading"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                @click="organizationStore.loadNextPage()"
                :disabled="!organizationStore.pagination.hasMore || organizationStore.isLoading"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing {{ (organizationStore.pagination.page - 1) * organizationStore.pagination.limit + 1 }} to {{ Math.min(organizationStore.pagination.page * organizationStore.pagination.limit, organizationStore.pagination.total) }} of {{ organizationStore.pagination.total }} results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="organizationStore.loadPreviousPage()"
                    :disabled="organizationStore.pagination.page <= 1 || organizationStore.isLoading"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  <!-- Page Numbers -->
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="organizationStore.goToPage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === organizationStore.pagination.page
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  
                  <button
                    @click="organizationStore.loadNextPage()"
                    :disabled="!organizationStore.pagination.hasMore || organizationStore.isLoading"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ bulkDeleteIds.length > 1 ? 'Delete Organizations' : 'Delete Organization' }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ bulkDeleteIds.length > 1 
                      ? `Are you sure you want to delete ${bulkDeleteIds.length} organizations? This action cannot be undone.`
                      : 'Are you sure you want to delete this organization? This action cannot be undone.'
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="confirmDelete"
              :disabled="organizationStore.loadingStates.delete === 'loading'"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <span v-if="organizationStore.loadingStates.delete === 'loading'">
                Deleting...
              </span>
              <span v-else>
                Delete
              </span>
            </button>
            <button
              @click="cancelDelete"
              :disabled="organizationStore.loadingStates.delete === 'loading'"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useOrganizationStore } from '@/stores/organizationStore'
import OrganizationCard from '../molecular/OrganizationCard.vue'
import OrganizationSearch from '../molecular/OrganizationSearch.vue'
import OrganizationMetrics from '../molecular/OrganizationMetrics.vue'
import OrganizationAvatar from '../atomic/OrganizationAvatar.vue'
import OrganizationTypeChip from '../atomic/OrganizationTypeChip.vue'
import type { OrganizationMetrics as OrganizationMetricsType } from '@/types'

const router = useRouter()
const organizationStore = useOrganizationStore()

// Component state
const viewMode = ref<'grid' | 'table'>('grid')
const showMetrics = ref(true)
const showBulkActions = ref(false)
const showDeleteModal = ref(false)
const bulkDeleteIds = ref<string[]>([])

// Metrics state
const metrics = ref<OrganizationMetricsType | null>(null)
const metricsLoading = ref(false)
const metricsError = ref<string | null>(null)

// Computed properties
const organizations = computed(() => organizationStore.filteredOrganizations)

const hasActiveFilters = computed(() => {
  return organizationStore.searchQuery.length > 0 || 
         Object.keys(organizationStore.activeFilters).some(key => {
           const value = organizationStore.activeFilters[key as keyof typeof organizationStore.activeFilters]
           return Array.isArray(value) ? value.length > 0 : Boolean(value)
         })
})

const isAllSelected = computed(() => {
  return organizations.value.length > 0 && 
         organizations.value.every(org => organizationStore.isOrganizationSelected(org.id))
})

const isSomeSelected = computed(() => {
  return organizations.value.some(org => organizationStore.isOrganizationSelected(org.id)) && 
         !isAllSelected.value
})

const visiblePages = computed(() => {
  const current = organizationStore.pagination.page
  const total = Math.ceil(organizationStore.pagination.total / organizationStore.pagination.limit)
  const range = 2 // Show 2 pages before and after current
  
  const start = Math.max(1, current - range)
  const end = Math.min(total, current + range)
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Event handlers
const handleSearch = (query: string) => {
  organizationStore.setSearchQuery(query)
}

const handleFilter = async (filters: any) => {
  await organizationStore.setFilters(filters)
}

const handleSort = async (config: any) => {
  await organizationStore.setSortConfig(config.field, config.direction)
}

const handleClearFilters = async () => {
  await organizationStore.clearFilters()
}

const clearAllFilters = async () => {
  await organizationStore.clearFilters()
}

const handleSelectAll = () => {
  if (isAllSelected.value) {
    organizationStore.deselectAllOrganizations()
  } else {
    organizationStore.selectAllOrganizations()
  }
}

const handleViewOrganization = (id: string) => {
  router.push(`/organizations/${id}`)
}

const handleEditOrganization = (id: string) => {
  router.push(`/organizations/${id}/edit`)
}

const handleDeleteOrganization = (id: string) => {
  bulkDeleteIds.value = [id]
  showDeleteModal.value = true
}

const handleAddContact = (id: string) => {
  router.push(`/organizations/${id}/contacts/new`)
}

const handleViewOpportunities = (id: string) => {
  router.push(`/organizations/${id}/opportunities`)
}

const handleBulkExport = () => {
  // TODO: Implement bulk export functionality
  console.log('Export organizations:', organizationStore.selectedOrganizations)
  showBulkActions.value = false
}

const handleBulkEdit = () => {
  // TODO: Implement bulk edit functionality
  console.log('Bulk edit organizations:', organizationStore.selectedOrganizations)
  showBulkActions.value = false
}

const handleBulkDelete = () => {
  bulkDeleteIds.value = Array.from(organizationStore.selectedIds)
  showDeleteModal.value = true
  showBulkActions.value = false
}

const confirmDelete = async () => {
  try {
    if (bulkDeleteIds.value.length === 1) {
      await organizationStore.deleteOrganization(bulkDeleteIds.value[0])
    } else {
      await organizationStore.deleteMultipleOrganizations(bulkDeleteIds.value)
    }
    cancelDelete()
  } catch (error) {
    console.error('Delete failed:', error)
    // Error is handled by the store
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  bulkDeleteIds.value = []
}

const refreshData = async () => {
  await organizationStore.refreshData()
  await loadMetrics()
}

const loadMetrics = async () => {
  // This would typically call a service to get metrics
  // For now, we'll simulate the data
  metricsLoading.value = true
  metricsError.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock metrics data
    metrics.value = {
      total_organizations: organizationStore.organizationCount,
      by_type: {
        customer: organizationStore.customerOrganizations.length,
        principal: organizationStore.principalOrganizations.length,
        distributor: organizationStore.distributorOrganizations.length,
        prospect: 0,
        vendor: 0
      },
      with_opportunities: Math.floor(organizationStore.organizationCount * 0.6),
      total_opportunity_value: 2500000,
      average_deal_size: 45000,
      conversion_rate: 23.5,
      growth_rate: 12.3,
      recent_additions: 5
    }
  } catch (error) {
    metricsError.value = 'Failed to load metrics'
  } finally {
    metricsLoading.value = false
  }
}

// Utility functions
const formatLocation = (org: any) => {
  const parts = [org.city, org.state_province, org.country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'No location'
}

const formatRevenue = (revenue?: number | null) => {
  if (!revenue) return 'N/A'
  
  if (revenue >= 1000000) {
    return `$${(revenue / 1000000).toFixed(1)}M`
  } else if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(0)}K`
  }
  return `$${revenue.toLocaleString()}`
}

// Click outside handler for bulk actions
const bulkActionsRef = ref<HTMLElement>()
onClickOutside(bulkActionsRef, () => {
  showBulkActions.value = false
})

// Lifecycle
onMounted(async () => {
  // Load organizations and metrics
  await organizationStore.fetchOrganizations()
  await loadMetrics()
})

onUnmounted(() => {
  // Clear selections when leaving the page
  organizationStore.deselectAllOrganizations()
})

// Watch for route changes to refresh data
watch(
  () => router.currentRoute.value.fullPath,
  () => {
    if (router.currentRoute.value.name === 'organizations-list') {
      refreshData()
    }
  }
)
</script>

<style scoped>
/* Add any component-specific styles */
</style>