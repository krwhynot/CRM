<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Search Input -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1">
        <div class="relative">
          <svg 
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Search organizations by name, industry, email, or phone..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Quick Filter Buttons -->
      <div class="flex space-x-2">
        <button
          v-for="type in organizationTypes"
          :key="type.value"
          @click="toggleTypeFilter(type.value)"
          :class="[
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isTypeSelected(type.value)
              ? 'bg-primary-100 text-primary-800 border border-primary-200'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
          ]"
        >
          {{ type.label }}
          <span v-if="isTypeSelected(type.value)" class="ml-1">×</span>
        </button>
      </div>
    </div>
    
    <!-- Advanced Filters Toggle -->
    <div class="flex items-center justify-between mb-4">
      <button
        @click="showAdvancedFilters = !showAdvancedFilters"
        class="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <svg 
          :class="[
            'w-4 h-4 mr-1 transform transition-transform',
            showAdvancedFilters ? 'rotate-90' : ''
          ]"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        Advanced Filters
      </button>
      
      <!-- Active Filters Count -->
      <div v-if="activeFiltersCount > 0" class="text-sm text-gray-500">
        {{ activeFiltersCount }} filter{{ activeFiltersCount > 1 ? 's' : '' }} active
        <button 
          @click="clearAllFilters"
          class="ml-2 text-primary-600 hover:text-primary-800"
        >
          Clear all
        </button>
      </div>
    </div>
    
    <!-- Advanced Filters Panel -->
    <div v-if="showAdvancedFilters" class="space-y-4 p-4 bg-gray-50 rounded-md">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Industry Filter -->
        <div>
          <label class="form-label">Industry</label>
          <select
            v-model="filters.industry"
            multiple
            class="form-input h-32"
          >
            <option 
              v-for="industry in industries"
              :key="industry"
              :value="industry"
            >
              {{ industry }}
            </option>
          </select>
        </div>
        
        <!-- Parent Organization Filter -->
        <div>
          <label class="form-label">Parent Organization</label>
          <select
            v-model="filters.parentId"
            class="form-input"
          >
            <option value="">All Organizations</option>
            <option value="null">Root Organizations Only</option>
            <option 
              v-for="org in parentOrganizations"
              :key="org.id"
              :value="org.id"
            >
              {{ org.name }}
            </option>
          </select>
        </div>
        
        <!-- Revenue Range Filter -->
        <div>
          <label class="form-label">Annual Revenue</label>
          <div class="space-y-2">
            <select
              v-model="filters.revenueRange"
              class="form-input"
            >
              <option value="">Any Revenue</option>
              <option value="0-100000">Under $100K</option>
              <option value="100000-1000000">$100K - $1M</option>
              <option value="1000000-10000000">$1M - $10M</option>
              <option value="10000000-">Over $10M</option>
            </select>
          </div>
        </div>
        
        <!-- Employee Count Filter -->
        <div>
          <label class="form-label">Employee Count</label>
          <select
            v-model="filters.employeeRange"
            class="form-input"
          >
            <option value="">Any Size</option>
            <option value="0-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1,000 employees</option>
            <option value="1001-">1,000+ employees</option>
          </select>
        </div>
        
        <!-- Relationship Filters -->
        <div>
          <label class="form-label">Has Relationships</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="filters.hasContacts"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Has Contacts</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="filters.hasOpportunities"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Has Opportunities</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="filters.hasProducts"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Has Products</span>
            </label>
          </div>
        </div>
        
        <!-- Date Range Filter -->
        <div>
          <label class="form-label">Created Date</label>
          <div class="space-y-2">
            <input
              v-model="filters.createdAfter"
              type="date"
              class="form-input"
              placeholder="From date"
            />
            <input
              v-model="filters.createdBefore"
              type="date"
              class="form-input"
              placeholder="To date"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sort Controls -->
    <div class="flex items-center justify-between mt-4">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">Sort by:</label>
          <select
            v-model="sortConfig.field"
            @change="updateSort"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="industry">Industry</option>
            <option value="annual_revenue">Revenue</option>
            <option value="created_at">Date Created</option>
            <option value="updated_at">Last Updated</option>
          </select>
          
          <button
            @click="toggleSortDirection"
            class="p-1 text-gray-400 hover:text-gray-600"
            :title="`Sort ${sortConfig.direction === 'asc' ? 'descending' : 'ascending'}`"
          >
            <svg 
              :class="[
                'w-4 h-4 transform',
                sortConfig.direction === 'desc' ? 'rotate-180' : ''
              ]"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Results Summary -->
      <div class="text-sm text-gray-500">
        {{ resultsText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash-es'
import type { OrganizationType, SortDirection } from '@/types'

interface SearchFilters {
  type: OrganizationType[]
  industry: string[]
  parentId: string | null
  hasContacts: boolean
  hasProducts: boolean
  hasOpportunities: boolean
  createdAfter: string
  createdBefore: string
  revenueRange: string
  employeeRange: string
}

interface SortConfig {
  field: string
  direction: SortDirection
}

interface Props {
  totalResults?: number
  isLoading?: boolean
  parentOrganizations?: Array<{ id: string; name: string }>
}

interface Emits {
  (e: 'search', query: string): void
  (e: 'filter', filters: Partial<SearchFilters>): void
  (e: 'sort', config: SortConfig): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  totalResults: 0,
  isLoading: false,
  parentOrganizations: () => []
})

const emit = defineEmits<Emits>()

// State
const searchQuery = ref('')
const showAdvancedFilters = ref(false)

const filters = ref<SearchFilters>({
  type: [],
  industry: [],
  parentId: null,
  hasContacts: false,
  hasProducts: false,
  hasOpportunities: false,
  createdAfter: '',
  createdBefore: '',
  revenueRange: '',
  employeeRange: ''
})

const sortConfig = ref<SortConfig>({
  field: 'name',
  direction: 'asc'
})

// Configuration data
const organizationTypes = [
  { value: 'customer' as OrganizationType, label: 'Customer' },
  { value: 'principal' as OrganizationType, label: 'Principal' },
  { value: 'distributor' as OrganizationType, label: 'Distributor' },
  { value: 'prospect' as OrganizationType, label: 'Prospect' },
  { value: 'vendor' as OrganizationType, label: 'Vendor' }
]

const industries = [
  'Food Service',
  'Restaurants',
  'Hospitality',
  'Retail Food',
  'Catering',
  'Healthcare Food Service',
  'Education Food Service',
  'Corporate Dining',
  'Food Manufacturing',
  'Food Distribution'
]

// Computed properties
const activeFiltersCount = computed(() => {
  let count = 0
  
  if (filters.value.type.length > 0) count++
  if (filters.value.industry.length > 0) count++
  if (filters.value.parentId) count++
  if (filters.value.hasContacts) count++
  if (filters.value.hasProducts) count++
  if (filters.value.hasOpportunities) count++
  if (filters.value.createdAfter) count++
  if (filters.value.createdBefore) count++
  if (filters.value.revenueRange) count++
  if (filters.value.employeeRange) count++
  
  return count
})

const resultsText = computed(() => {
  if (props.isLoading) {
    return 'Searching...'
  }
  
  const count = props.totalResults
  if (count === 0) {
    return 'No organizations found'
  }
  
  return `${count} organization${count !== 1 ? 's' : ''} found`
})

// Methods
const debouncedSearch = debounce(() => {
  emit('search', searchQuery.value)
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

const toggleTypeFilter = (type: OrganizationType) => {
  const index = filters.value.type.indexOf(type)
  if (index > -1) {
    filters.value.type.splice(index, 1)
  } else {
    filters.value.type.push(type)
  }
}

const isTypeSelected = (type: OrganizationType) => {
  return filters.value.type.includes(type)
}

const clearAllFilters = () => {
  searchQuery.value = ''
  filters.value = {
    type: [],
    industry: [],
    parentId: null,
    hasContacts: false,
    hasProducts: false,
    hasOpportunities: false,
    createdAfter: '',
    createdBefore: '',
    revenueRange: '',
    employeeRange: ''
  }
  emit('clear')
}

const updateSort = () => {
  emit('sort', { ...sortConfig.value })
}

const toggleSortDirection = () => {
  sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  updateSort()
}

// Watchers
watch(
  () => filters.value,
  (newFilters) => {
    emit('filter', { ...newFilters })
  },
  { deep: true }
)

watch(
  () => sortConfig.value,
  (newConfig) => {
    emit('sort', { ...newConfig })
  },
  { deep: true }
)
</script>