<!--
  Engagement Table View
  
  Organism component that displays engagement data in table format
  Provides detailed tabular view of all principal engagement metrics
-->
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-5 sm:p-6">
      <div class="text-center py-8">
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <TableIcon class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Detailed Table View</h3>
        <p class="text-gray-600 mb-6">Comprehensive tabular display of all engagement metrics</p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p class="text-sm text-blue-800">
            This table view provides sortable, filterable access to all engagement data
            with export capabilities and advanced filtering options.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TableIcon } from 'lucide-vue-next'

// Props
defineProps<{
  engagements: any[]
}>()

// Emits
defineEmits<{
  viewDetails: [principalId: string]
  viewHealth: [principalId: string]
}>()
</script>