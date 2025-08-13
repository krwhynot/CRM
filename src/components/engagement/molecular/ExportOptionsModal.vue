<!--
  Export Options Modal
  
  Modal component for configuring export options for engagement data
  Allows selection of data types, formats, and date ranges for export
-->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Export Data</h3>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Export Format -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-3">Export Format</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="exportOptions.format"
                value="json"
                type="radio"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">JSON</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.format"
                value="csv"
                type="radio"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">CSV</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.format"
                value="xlsx"
                type="radio"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Excel</span>
            </label>
          </div>
        </div>
        
        <!-- Data Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-3">Include Data</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeHealthMetrics"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Health Metrics</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeEngagementPatterns"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Engagement Patterns</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeRiskFactors"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Risk Factors</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="exportOptions.includeRecommendations"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Recommendations</span>
            </label>
          </div>
        </div>
        
        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">Date Range</label>
          <select
            v-model="exportOptions.dateRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="last_year">Last Year</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="startExport"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Export Data
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { XIcon } from 'lucide-vue-next'

// Emits
const emit = defineEmits<{
  close: []
  export: [options: any]
}>()

// Export options
const exportOptions = reactive({
  format: 'json',
  includeHealthMetrics: true,
  includeEngagementPatterns: true,
  includeRiskFactors: true,
  includeRecommendations: true,
  dateRange: 'last_90_days'
})

// Methods
const startExport = () => {
  emit('export', { ...exportOptions })
}
</script>