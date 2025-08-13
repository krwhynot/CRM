<!--
  Principal Details Modal
  
  Modal component that displays detailed information about a principal
  Shows comprehensive relationship and engagement details
-->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Principal Details</h3>
          <p class="text-sm text-gray-600">ID: {{ principalId }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <div class="text-center py-8">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserIcon class="w-6 h-6 text-blue-500" />
          </div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">Detailed Principal View</h4>
          <p class="text-gray-600 mb-6">Comprehensive relationship and engagement details</p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p class="text-sm text-blue-800">
              This modal shows detailed principal information including relationship history,
              engagement patterns, health metrics, and action recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XIcon, UserIcon } from 'lucide-vue-next'

// Props
defineProps<{
  principalId: string
}>()

// Emits
defineEmits<{
  close: []
}>()
</script>