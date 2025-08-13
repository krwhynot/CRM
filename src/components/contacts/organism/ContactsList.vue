<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Contacts</h1>
            <p class="mt-1 text-sm text-gray-600">
              Manage your business contacts and relationships
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
            
            <!-- Create Button -->
            <button class="btn btn-primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Contact
            </button>
          </div>
        </div>
        
        <!-- Search and Filters -->
        <div class="mb-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Search -->
              <div class="lg:col-span-2">
                <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  id="search"
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search by name, email, or phone..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Organization Filter -->
              <div>
                <label for="organization" class="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <select
                  id="organization"
                  v-model="organizationFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Organizations</option>
                  <option value="customer">Customers</option>
                  <option value="principal">Principals</option>
                  <option value="distributor">Distributors</option>
                </select>
              </div>
              
              <!-- Status Filter -->
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  v-model="statusFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <!-- Results Summary -->
            <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>{{ filteredContacts.length }} contacts found</span>
              <button
                v-if="hasActiveFilters"
                @click="clearFilters"
                class="text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
        
        <!-- Contact List -->
        <div class="space-y-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="animate-pulse space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="bg-gray-300 h-48 rounded-lg"></div>
              </div>
            </div>
            <p class="text-gray-500 mt-4">Loading contacts...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredContacts.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p class="text-gray-600 mb-6">
              {{ hasActiveFilters ? 'Try adjusting your search criteria' : 'Get started by adding your first contact' }}
            </p>
            
            <div class="flex justify-center space-x-3">
              <button class="btn btn-primary">
                Add Contact
              </button>
              <button 
                v-if="hasActiveFilters"
                @click="clearFilters"
                class="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <!-- Contacts Grid View -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="contact in paginatedContacts"
              :key="contact.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start space-x-4">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 font-medium">
                      {{ getInitials(contact) }}
                    </span>
                  </div>
                </div>
                
                <!-- Contact Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    {{ contact.name }}
                  </h3>
                  <p class="text-sm text-gray-600 truncate">{{ contact.title }}</p>
                  <p class="text-sm text-gray-500 truncate">{{ contact.organization }}</p>
                </div>
              </div>
              
              <!-- Contact Details -->
              <div class="mt-4 space-y-2">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ contact.email }}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ contact.phone }}
                </div>
              </div>
              
              <!-- Actions -->
              <div class="mt-4 flex justify-end space-x-2">
                <button class="text-primary-600 hover:text-primary-900 text-sm">
                  View
                </button>
                <button class="text-gray-400 hover:text-gray-600 text-sm">
                  Edit
                </button>
              </div>
            </div>
          </div>
          
          <!-- Contacts Table View -->
          <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="contact in paginatedContacts"
                  :key="contact.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span class="text-primary-600 font-medium text-sm">
                            {{ getInitials(contact) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ contact.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ contact.title }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ contact.organization }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ contact.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ contact.phone }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button class="text-primary-600 hover:text-primary-900">
                        View
                      </button>
                      <button class="text-gray-400 hover:text-gray-600">
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
            v-if="filteredContacts.length > itemsPerPage"
            class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border"
          >
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="currentPage--"
                :disabled="currentPage <= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredContacts.length) }} of {{ filteredContacts.length }} results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="currentPage--"
                    :disabled="currentPage <= 1"
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
                    @click="currentPage = page"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  
                  <button
                    @click="currentPage++"
                    :disabled="currentPage >= totalPages"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Component state
const viewMode = ref<'grid' | 'table'>('grid')
const searchQuery = ref('')
const organizationFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const isLoading = ref(false)

// Mock data - this would typically come from a store/API
const contacts = ref([
  {
    id: '1',
    name: 'John Smith',
    title: 'Head Chef',
    organization: 'The Gourmet Kitchen',
    email: 'john@gourmetkitchen.com',
    phone: '(555) 123-4567',
    status: 'active'
  },
  {
    id: '2', 
    name: 'Sarah Johnson',
    title: 'Restaurant Manager',
    organization: 'Downtown Bistro',
    email: 'sarah@downtownbistro.com',
    phone: '(555) 234-5678',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Chen',
    title: 'Procurement Director',
    organization: 'Food Service Solutions',
    email: 'mike@foodservicesolutions.com',
    phone: '(555) 345-6789',
    status: 'inactive'
  }
])

// Computed properties
const filteredContacts = computed(() => {
  let result = contacts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone.includes(query) ||
      contact.organization.toLowerCase().includes(query)
    )
  }

  if (organizationFilter.value) {
    result = result.filter(contact => 
      contact.organization.toLowerCase().includes(organizationFilter.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    result = result.filter(contact => contact.status === statusFilter.value)
  }

  return result
})

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredContacts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredContacts.value.length / itemsPerPage)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || organizationFilter.value || statusFilter.value
})

const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const range = 2 // Show 2 pages before and after current
  
  const start = Math.max(1, current - range)
  const end = Math.min(total, current + range)
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Methods
const getInitials = (contact: any) => {
  return contact.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const clearFilters = () => {
  searchQuery.value = ''
  organizationFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}
</script>