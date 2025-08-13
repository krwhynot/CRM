<!--
  Engagement Settings Modal
  
  Modal component for configuring engagement analytics settings
  Allows customization of refresh intervals, cache settings, and preferences
-->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Analytics Settings</h3>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Auto Refresh -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-900">Auto Refresh</label>
            <input
              v-model="localSettings.autoRefreshEnabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <p class="text-xs text-gray-600">Automatically refresh data at regular intervals</p>
        </div>
        
        <!-- Refresh Interval -->
        <div v-if="localSettings.autoRefreshEnabled">
          <label class="block text-sm font-medium text-gray-900 mb-2">Refresh Interval</label>
          <select
            v-model="localSettings.refreshIntervalMinutes"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="5">Every 5 minutes</option>
            <option :value="10">Every 10 minutes</option>
            <option :value="15">Every 15 minutes</option>
            <option :value="30">Every 30 minutes</option>
            <option :value="60">Every hour</option>
          </select>
        </div>
        
        <!-- Cache Timeout -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">Cache Timeout</label>
          <select
            v-model="localSettings.cacheTimeoutMinutes"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="5">5 minutes</option>
            <option :value="10">10 minutes</option>
            <option :value="15">15 minutes</option>
            <option :value="30">30 minutes</option>
          </select>
        </div>
        
        <!-- Notifications -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-900">Risk Alerts</label>
            <input
              v-model="localSettings.riskAlertsEnabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <p class="text-xs text-gray-600">Receive notifications for high-risk relationships</p>
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
          @click="saveSettings"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { XIcon } from 'lucide-vue-next'

// Emits
const emit = defineEmits<{
  close: []
  settingsUpdated: [settings: any]
}>()

// Local settings
const localSettings = reactive({
  autoRefreshEnabled: true,
  refreshIntervalMinutes: 15,
  cacheTimeoutMinutes: 10,
  riskAlertsEnabled: true
})

// Methods
const saveSettings = () => {
  emit('settingsUpdated', { ...localSettings })
}
</script>