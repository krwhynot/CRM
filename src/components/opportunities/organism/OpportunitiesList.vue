<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Opportunities</h1>
            <p class="mt-1 text-sm text-gray-600">
              Track your sales pipeline and revenue opportunities
            </p>
          </div>
          
          <!-- Header Actions -->
          <div class="mt-4 sm:mt-0 flex items-center space-x-3">
            <!-- View Mode Toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'cards'"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'cards'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                @click="viewMode = 'kanban'"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
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
              Add Opportunity
            </button>
          </div>
        </div>
        
        <!-- Pipeline Metrics -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Pipeline</p>
                <p class="text-2xl font-semibold text-gray-900">${{ totalPipelineValue.toLocaleString() }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Won This Month</p>
                <p class="text-2xl font-semibold text-gray-900">${{ monthlyWon.toLocaleString() }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Avg Deal Size</p>
                <p class="text-2xl font-semibold text-gray-900">${{ averageDealSize.toLocaleString() }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Win Rate</p>
                <p class="text-2xl font-semibold text-gray-900">{{ winRate }}%</p>
              </div>
            </div>
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
                  placeholder="Search by name, organization, or contact..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Stage Filter -->
              <div>
                <label for="stage" class="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  id="stage"
                  v-model="stageFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Stages</option>
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              
              <!-- Owner Filter -->
              <div>
                <label for="owner" class="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <select
                  id="owner"
                  v-model="ownerFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Owners</option>
                  <option value="current_user">My Opportunities</option>
                </select>
              </div>
            </div>
            
            <!-- Results Summary -->
            <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>{{ filteredOpportunities.length }} opportunities found</span>
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
        
        <!-- Opportunity List -->
        <div class="space-y-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="animate-pulse space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="bg-gray-300 h-48 rounded-lg"></div>
              </div>
            </div>
            <p class="text-gray-500 mt-4">Loading opportunities...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredOpportunities.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p class="text-gray-600 mb-6">
              {{ hasActiveFilters ? 'Try adjusting your search criteria' : 'Get started by creating your first opportunity' }}
            </p>
            
            <div class="flex justify-center space-x-3">
              <button class="btn btn-primary">
                Add Opportunity
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
          
          <!-- Opportunities Cards View -->
          <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="opportunity in paginatedOpportunities"
              :key="opportunity.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <!-- Opportunity Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    {{ opportunity.name }}
                  </h3>
                  <p class="text-sm text-gray-600">{{ opportunity.organization }}</p>
                </div>
                <span 
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStageColor(opportunity.stage)
                  ]"
                >
                  {{ formatStage(opportunity.stage) }}
                </span>
              </div>
              
              <!-- Opportunity Details -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Value:</span>
                  <span class="text-lg font-semibold text-gray-900">
                    ${{ opportunity.value.toLocaleString() }}
                  </span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Probability:</span>
                  <span class="text-sm text-gray-600">{{ opportunity.probability }}%</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Close Date:</span>
                  <span class="text-sm text-gray-600">{{ formatDate(opportunity.close_date) }}</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Contact:</span>
                  <span class="text-sm text-gray-600 truncate">{{ opportunity.contact }}</span>
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
          
          <!-- Opportunities Kanban View -->
          <div v-else-if="viewMode === 'kanban'" class="overflow-x-auto">
            <div class="flex space-x-6 min-w-max pb-4">
              <div 
                v-for="stage in pipelineStages" 
                :key="stage.key"
                class="w-80 bg-gray-100 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-medium text-gray-900">{{ stage.name }}</h3>
                  <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {{ getStageOpportunities(stage.key).length }}
                  </span>
                </div>
                
                <div class="space-y-3">
                  <div 
                    v-for="opportunity in getStageOpportunities(stage.key)"
                    :key="opportunity.id"
                    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <h4 class="text-sm font-medium text-gray-900 mb-2">{{ opportunity.name }}</h4>
                    <p class="text-xs text-gray-600 mb-3">{{ opportunity.organization }}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-lg font-semibold text-gray-900">
                        ${{ opportunity.value.toLocaleString() }}
                      </span>
                      <span class="text-xs text-gray-500">{{ opportunity.probability }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Opportunities Table View -->
          <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunity
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probability
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close Date
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="opportunity in paginatedOpportunities"
                  :key="opportunity.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ opportunity.name }}</div>
                      <div class="text-sm text-gray-500">{{ opportunity.contact }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ opportunity.organization }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStageColor(opportunity.stage)
                      ]"
                    >
                      {{ formatStage(opportunity.stage) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${{ opportunity.value.toLocaleString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ opportunity.probability }}%
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(opportunity.close_date) }}
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
            v-if="filteredOpportunities.length > itemsPerPage && viewMode !== 'kanban'"
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
                  Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredOpportunities.length) }} of {{ filteredOpportunities.length }} results
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
const viewMode = ref<'cards' | 'kanban' | 'table'>('cards')
const searchQuery = ref('')
const stageFilter = ref('')
const ownerFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const isLoading = ref(false)

// Pipeline stages for Kanban view
const pipelineStages = [
  { key: 'lead', name: 'Lead' },
  { key: 'qualified', name: 'Qualified' },
  { key: 'proposal', name: 'Proposal' },
  { key: 'negotiation', name: 'Negotiation' },
  { key: 'won', name: 'Won' },
  { key: 'lost', name: 'Lost' }
]

// Mock data - this would typically come from a store/API
const opportunities = ref([
  {
    id: '1',
    name: 'Q4 Catering Contract',
    organization: 'Downtown Conference Center',
    contact: 'Sarah Johnson',
    value: 45000,
    probability: 75,
    stage: 'negotiation',
    close_date: '2024-12-15',
    owner: 'current_user'
  },
  {
    id: '2',
    name: 'Annual Food Service Agreement',
    organization: 'Metro University',
    contact: 'Dr. Michael Chen',
    value: 120000,
    probability: 60,
    stage: 'proposal',
    close_date: '2025-01-30',
    owner: 'current_user'
  },
  {
    id: '3',
    name: 'Holiday Catering Package',
    organization: 'TechCorp Inc.',
    contact: 'Jennifer Williams',
    value: 15000,
    probability: 90,
    stage: 'qualified',
    close_date: '2024-11-20',
    owner: 'team_member'
  },
  {
    id: '4',
    name: 'Restaurant Supply Partnership',
    organization: 'The Gourmet Kitchen',
    contact: 'Chef Robert Davis',
    value: 85000,
    probability: 40,
    stage: 'lead',
    close_date: '2025-02-28',
    owner: 'current_user'
  },
  {
    id: '5',
    name: 'Weekly Meal Service',
    organization: 'Startup Hub',
    contact: 'Lisa Martinez',
    value: 25000,
    probability: 100,
    stage: 'won',
    close_date: '2024-10-01',
    owner: 'current_user'
  }
])

// Computed properties
const filteredOpportunities = computed(() => {
  let result = opportunities.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(opportunity =>
      opportunity.name.toLowerCase().includes(query) ||
      opportunity.organization.toLowerCase().includes(query) ||
      opportunity.contact.toLowerCase().includes(query)
    )
  }

  if (stageFilter.value) {
    result = result.filter(opportunity => opportunity.stage === stageFilter.value)
  }

  if (ownerFilter.value === 'current_user') {
    result = result.filter(opportunity => opportunity.owner === 'current_user')
  }

  return result
})

const paginatedOpportunities = computed(() => {
  if (viewMode.value === 'kanban') {
    return filteredOpportunities.value
  }
  
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOpportunities.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredOpportunities.value.length / itemsPerPage)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || stageFilter.value || ownerFilter.value
})

const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const range = 2 // Show 2 pages before and after current
  
  const start = Math.max(1, current - range)
  const end = Math.min(total, current + range)
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Pipeline metrics
const totalPipelineValue = computed(() => {
  return opportunities.value
    .filter(opp => opp.stage !== 'won' && opp.stage !== 'lost')
    .reduce((sum, opp) => sum + opp.value, 0)
})

const monthlyWon = computed(() => {
  // Mock calculation - in real app, filter by current month
  return opportunities.value
    .filter(opp => opp.stage === 'won')
    .reduce((sum, opp) => sum + opp.value, 0)
})

const averageDealSize = computed(() => {
  const totalValue = opportunities.value.reduce((sum, opp) => sum + opp.value, 0)
  return opportunities.value.length > 0 ? Math.round(totalValue / opportunities.value.length) : 0
})

const winRate = computed(() => {
  const closedOpps = opportunities.value.filter(opp => opp.stage === 'won' || opp.stage === 'lost')
  const wonOpps = opportunities.value.filter(opp => opp.stage === 'won')
  return closedOpps.length > 0 ? Math.round((wonOpps.length / closedOpps.length) * 100) : 0
})

// Methods
const getStageOpportunities = (stage: string) => {
  return filteredOpportunities.value.filter(opp => opp.stage === stage)
}

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'lead':
      return 'bg-gray-100 text-gray-800'
    case 'qualified':
      return 'bg-blue-100 text-blue-800'
    case 'proposal':
      return 'bg-yellow-100 text-yellow-800'
    case 'negotiation':
      return 'bg-orange-100 text-orange-800'
    case 'won':
      return 'bg-green-100 text-green-800'
    case 'lost':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatStage = (stage: string) => {
  return stage.charAt(0).toUpperCase() + stage.slice(1)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const clearFilters = () => {
  searchQuery.value = ''
  stageFilter.value = ''
  ownerFilter.value = ''
  currentPage.value = 1
}
</script>