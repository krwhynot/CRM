<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Products</h1>
            <p class="mt-1 text-sm text-gray-600">
              Manage your product catalog and inventory
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
              Add Product
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
                  placeholder="Search by name, SKU, or description..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Category Filter -->
              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  v-model="categoryFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  <option value="proteins">Proteins</option>
                  <option value="produce">Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="pantry">Pantry</option>
                  <option value="beverages">Beverages</option>
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
                  <option value="discontinued">Discontinued</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
            
            <!-- Results Summary -->
            <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>{{ filteredProducts.length }} products found</span>
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
        
        <!-- Product List -->
        <div class="space-y-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="animate-pulse space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="bg-gray-300 h-48 rounded-lg"></div>
              </div>
            </div>
            <p class="text-gray-500 mt-4">Loading products...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p class="text-gray-600 mb-6">
              {{ hasActiveFilters ? 'Try adjusting your search criteria' : 'Get started by adding your first product' }}
            </p>
            
            <div class="flex justify-center space-x-3">
              <button class="btn btn-primary">
                Add Product
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
          
          <!-- Products Grid View -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <!-- Product Image -->
              <div class="h-48 bg-gray-100 flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              
              <div class="p-6">
                <!-- Product Info -->
                <div class="mb-4">
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    {{ product.name }}
                  </h3>
                  <p class="text-sm text-gray-600">SKU: {{ product.sku }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ product.description }}</p>
                </div>
                
                <!-- Category & Status -->
                <div class="flex items-center justify-between mb-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {{ product.category }}
                  </span>
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'discontinued' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ formatStatus(product.status) }}
                  </span>
                </div>
                
                <!-- Price & Stock -->
                <div class="flex items-center justify-between mb-4">
                  <span class="text-lg font-semibold text-gray-900">
                    ${{ product.price.toFixed(2) }}
                  </span>
                  <span class="text-sm text-gray-600">
                    Stock: {{ product.stock_quantity || 0 }}
                  </span>
                </div>
                
                <!-- Actions -->
                <div class="flex justify-end space-x-2">
                  <button class="text-primary-600 hover:text-primary-900 text-sm">
                    View
                  </button>
                  <button class="text-gray-400 hover:text-gray-600 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Products Table View -->
          <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="product in paginatedProducts"
                  :key="product.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                        <div class="text-sm text-gray-500">{{ product.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ product.sku }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {{ product.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${{ product.price.toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ product.stock_quantity || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'discontinued' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      ]"
                    >
                      {{ formatStatus(product.status) }}
                    </span>
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
            v-if="filteredProducts.length > itemsPerPage"
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
                  Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }} of {{ filteredProducts.length }} results
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
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const isLoading = ref(false)

// Mock data - this would typically come from a store/API
const products = ref([
  {
    id: '1',
    name: 'Premium Ribeye Steak',
    sku: 'BEEF-RIB-001',
    description: 'USDA Prime grade ribeye steaks, 12 oz portions',
    category: 'proteins',
    price: 24.99,
    stock_quantity: 150,
    status: 'active'
  },
  {
    id: '2',
    name: 'Organic Baby Spinach',
    sku: 'PROD-SPN-002',
    description: 'Fresh organic baby spinach leaves, 5 lb bags',
    category: 'produce',
    price: 8.49,
    stock_quantity: 75,
    status: 'active'
  },
  {
    id: '3',
    name: 'Aged Vermont Cheddar',
    sku: 'DAIRY-CHD-003',
    description: '2-year aged Vermont cheddar cheese, 5 lb wheels',
    category: 'dairy',
    price: 18.99,
    stock_quantity: 0,
    status: 'out_of_stock'
  },
  {
    id: '4',
    name: 'Extra Virgin Olive Oil',
    sku: 'PANT-OLI-004',
    description: 'Cold-pressed extra virgin olive oil, 1L bottles',
    category: 'pantry',
    price: 15.99,
    stock_quantity: 200,
    status: 'active'
  },
  {
    id: '5',
    name: 'Artisan Sourdough Bread Mix',
    sku: 'PANT-BRD-005',
    description: 'Premium sourdough bread starter mix, 2 lb bags',
    category: 'pantry',
    price: 12.99,
    stock_quantity: null,
    status: 'discontinued'
  }
])

// Computed properties
const filteredProducts = computed(() => {
  let result = products.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    )
  }

  if (categoryFilter.value) {
    result = result.filter(product => product.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(product => product.status === statusFilter.value)
  }

  return result
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || categoryFilter.value || statusFilter.value
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
const formatStatus = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'discontinued':
      return 'Discontinued'
    case 'out_of_stock':
      return 'Out of Stock'
    default:
      return status
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}
</script>