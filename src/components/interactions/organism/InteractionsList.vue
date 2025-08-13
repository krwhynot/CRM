<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Interactions</h1>
            <p class="mt-1 text-sm text-gray-600">
              Log and track all customer interactions and follow-ups
            </p>
          </div>
          
          <!-- Header Actions -->
          <div class="mt-4 sm:mt-0 flex items-center space-x-3">
            <!-- View Mode Toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'timeline'"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'timeline'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'list'
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
              Log Interaction
            </button>
          </div>
        </div>
        
        <!-- Interaction Metrics -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">This Week</p>
                <p class="text-2xl font-semibold text-gray-900">{{ thisWeekInteractions }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Completed</p>
                <p class="text-2xl font-semibold text-gray-900">{{ completedInteractions }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Pending</p>
                <p class="text-2xl font-semibold text-gray-900">{{ pendingInteractions }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Avg Response</p>
                <p class="text-2xl font-semibold text-gray-900">{{ averageResponseTime }}h</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Search and Filters -->
        <div class="mb-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Search -->
              <div class="lg:col-span-2">
                <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  id="search"
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search by subject, contact, or organization..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <!-- Type Filter -->
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  id="type"
                  v-model="typeFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              
              <!-- Date Range -->
              <div>
                <label for="dateRange" class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  id="dateRange"
                  v-model="dateRangeFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
            
            <!-- Results Summary -->
            <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>{{ filteredInteractions.length }} interactions found</span>
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
        
        <!-- Interaction List -->
        <div class="space-y-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="animate-pulse space-y-4">
              <div class="space-y-3">
                <div v-for="i in 6" :key="i" class="bg-gray-300 h-20 rounded-lg"></div>
              </div>
            </div>
            <p class="text-gray-500 mt-4">Loading interactions...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredInteractions.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No interactions found</h3>
            <p class="text-gray-600 mb-6">
              {{ hasActiveFilters ? 'Try adjusting your search criteria' : 'Get started by logging your first interaction' }}
            </p>
            
            <div class="flex justify-center space-x-3">
              <button class="btn btn-primary">
                Log Interaction
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
          
          <!-- Interactions Timeline View -->
          <div v-else-if="viewMode === 'timeline'" class="space-y-6">
            <div v-for="(dayGroup, date) in groupedInteractions" :key="date" class="space-y-4">
              <!-- Date Header -->
              <div class="flex items-center">
                <div class="flex-shrink-0 w-24">
                  <span class="text-sm font-medium text-gray-900">{{ formatDateHeader(date) }}</span>
                </div>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>
              
              <!-- Day's Interactions -->
              <div class="space-y-4 ml-6">
                <div 
                  v-for="interaction in dayGroup"
                  :key="interaction.id"
                  class="relative bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <!-- Timeline Dot -->
                  <div class="absolute -left-6 top-6 w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow"></div>
                  
                  <!-- Interaction Content -->
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-3">
                      <div :class="[
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                        getTypeColor(interaction.type)
                      ]">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path v-if="interaction.type === 'call'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          <path v-else-if="interaction.type === 'email'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          <path v-else-if="interaction.type === 'meeting'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      
                      <div>
                        <h3 class="text-sm font-medium text-gray-900">{{ interaction.subject }}</h3>
                        <p class="text-sm text-gray-600">{{ interaction.contact }} • {{ interaction.organization }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                      <span class="text-xs text-gray-500">{{ formatTime(interaction.created_at) }}</span>
                      <span 
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(interaction.status)
                        ]"
                      >
                        {{ formatStatus(interaction.status) }}
                      </span>
                    </div>
                  </div>
                  
                  <p class="text-sm text-gray-700 mb-3">{{ interaction.description }}</p>
                  
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
          </div>
          
          <!-- Interactions List View -->
          <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="interaction in paginatedInteractions"
                  :key="interaction.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ interaction.subject }}</div>
                    <div class="text-sm text-gray-500 truncate">{{ interaction.description }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div :class="[
                        'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center mr-2',
                        getTypeColor(interaction.type)
                      ]">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path v-if="interaction.type === 'call'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          <path v-else-if="interaction.type === 'email'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          <path v-else-if="interaction.type === 'meeting'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <span class="text-sm text-gray-900">{{ formatType(interaction.type) }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ interaction.contact }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ interaction.organization }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(interaction.status)
                      ]"
                    >
                      {{ formatStatus(interaction.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(interaction.created_at) }}
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
            v-if="filteredInteractions.length > itemsPerPage && viewMode === 'list'"
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
                  Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredInteractions.length) }} of {{ filteredInteractions.length }} results
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
const viewMode = ref<'timeline' | 'list'>('timeline')
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const dateRangeFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 20
const isLoading = ref(false)

// Mock data - this would typically come from a store/API
const interactions = ref([
  {
    id: '1',
    subject: 'Follow-up on Q4 catering proposal',
    description: 'Discussed pricing options and menu customizations for the holiday party',
    type: 'call',
    contact: 'Sarah Johnson',
    organization: 'Downtown Conference Center',
    status: 'completed',
    created_at: '2024-11-15T14:30:00Z',
    duration: 25
  },
  {
    id: '2',
    subject: 'Introduction and capabilities overview',
    description: 'Initial meeting to discuss university dining services partnership',
    type: 'meeting',
    contact: 'Dr. Michael Chen',
    organization: 'Metro University',
    status: 'completed',
    created_at: '2024-11-14T10:00:00Z',
    duration: 60
  },
  {
    id: '3',
    subject: 'Contract renewal proposal',
    description: 'Sent updated contract terms and pricing for 2025 renewal',
    type: 'email',
    contact: 'Jennifer Williams',
    organization: 'TechCorp Inc.',
    status: 'pending',
    created_at: '2024-11-13T16:45:00Z'
  },
  {
    id: '4',
    subject: 'Menu tasting appointment',
    description: 'Scheduled tasting session for upcoming catering event',
    type: 'note',
    contact: 'Chef Robert Davis',
    organization: 'The Gourmet Kitchen',
    status: 'scheduled',
    created_at: '2024-11-12T11:20:00Z'
  },
  {
    id: '5',
    subject: 'Weekly check-in call',
    description: 'Regular status update on meal service program',
    type: 'call',
    contact: 'Lisa Martinez',
    organization: 'Startup Hub',
    status: 'completed',
    created_at: '2024-11-11T09:15:00Z',
    duration: 15
  },
  {
    id: '6',
    subject: 'Product catalog update',
    description: 'Sent latest product catalog with seasonal items',
    type: 'email',
    contact: 'Mike Thompson',
    organization: 'City Bistro',
    status: 'completed',
    created_at: '2024-11-10T13:30:00Z'
  }
])

// Computed properties
const filteredInteractions = computed(() => {
  let result = interactions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(interaction =>
      interaction.subject.toLowerCase().includes(query) ||
      interaction.contact.toLowerCase().includes(query) ||
      interaction.organization.toLowerCase().includes(query) ||
      interaction.description.toLowerCase().includes(query)
    )
  }

  if (typeFilter.value) {
    result = result.filter(interaction => interaction.type === typeFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(interaction => interaction.status === statusFilter.value)
  }

  if (dateRangeFilter.value) {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    result = result.filter(interaction => {
      const interactionDate = new Date(interaction.created_at)
      
      switch (dateRangeFilter.value) {
        case 'today':
          return interactionDate >= startOfDay
        case 'week':
          const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000)
          return interactionDate >= weekAgo
        case 'month':
          const monthAgo = new Date(startOfDay.getFullYear(), startOfDay.getMonth() - 1, startOfDay.getDate())
          return interactionDate >= monthAgo
        default:
          return true
      }
    })
  }

  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const paginatedInteractions = computed(() => {
  if (viewMode.value === 'timeline') {
    return filteredInteractions.value
  }
  
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredInteractions.value.slice(start, end)
})

const groupedInteractions = computed(() => {
  const groups: { [key: string]: any[] } = {}
  
  filteredInteractions.value.forEach(interaction => {
    const date = new Date(interaction.created_at).toISOString().split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(interaction)
  })
  
  return groups
})

const totalPages = computed(() => {
  return Math.ceil(filteredInteractions.value.length / itemsPerPage)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || typeFilter.value || statusFilter.value || dateRangeFilter.value
})

const visiblePages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const range = 2 // Show 2 pages before and after current
  
  const start = Math.max(1, current - range)
  const end = Math.min(total, current + range)
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Metrics
const thisWeekInteractions = computed(() => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return interactions.value.filter(i => new Date(i.created_at) >= weekAgo).length
})

const completedInteractions = computed(() => {
  return interactions.value.filter(i => i.status === 'completed').length
})

const pendingInteractions = computed(() => {
  return interactions.value.filter(i => i.status === 'pending').length
})

const averageResponseTime = computed(() => {
  // Mock calculation - in real app, calculate based on response times
  return 8.5
})

// Methods
const getTypeColor = (type: string) => {
  switch (type) {
    case 'call':
      return 'bg-blue-100 text-blue-600'
    case 'email':
      return 'bg-green-100 text-green-600'
    case 'meeting':
      return 'bg-purple-100 text-purple-600'
    case 'note':
      return 'bg-yellow-100 text-yellow-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDateHeader = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  
  if (d.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  statusFilter.value = ''
  dateRangeFilter.value = ''
  currentPage.value = 1
}
</script>