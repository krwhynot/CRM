<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
    <!-- Card Header -->
    <div class="p-6 pb-4">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <OrganizationAvatar 
            :organization="organization" 
            size="lg"
          />
          <div class="min-w-0 flex-1">
            <h3 
              class="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600"
              @click="handleView"
            >
              {{ organization.name }}
            </h3>
            <div class="flex items-center space-x-2 mt-1">
              <OrganizationTypeChip 
                :type="organization.type" 
                size="sm"
              />
              <OrganizationStatus 
                :organization="organization"
                v-if="showStatus"
              />
            </div>
          </div>
        </div>
        
        <!-- Actions Menu -->
        <div class="relative" v-if="showActions">
          <button
            @click="toggleActionsMenu"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="More actions"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          <!-- Actions Dropdown -->
          <div 
            v-if="showActionsMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
          >
            <div class="py-1">
              <button
                @click="handleView"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                View Details
              </button>
              <button
                @click="handleEdit"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit Organization
              </button>
              <button
                @click="handleAddContact"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Add Contact
              </button>
              <button
                @click="handleViewOpportunities"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                View Opportunities
              </button>
              <hr class="border-gray-200 my-1">
              <button
                @click="handleDelete"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete Organization
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Organization Details -->
      <div class="space-y-2">
        <!-- Contact Information -->
        <div class="flex items-center text-sm text-gray-600" v-if="organization.email || organization.phone">
          <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>
            {{ organization.email || organization.phone }}
          </span>
        </div>
        
        <!-- Location -->
        <div class="flex items-center text-sm text-gray-600" v-if="locationText">
          <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="truncate">{{ locationText }}</span>
        </div>
        
        <!-- Website -->
        <div class="flex items-center text-sm text-gray-600" v-if="organization.website">
          <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <a 
            :href="organization.website" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-primary-600 hover:text-primary-800 truncate"
          >
            {{ formatWebsite(organization.website) }}
          </a>
        </div>
      </div>
    </div>
    
    <!-- Card Footer - Metrics -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div class="grid grid-cols-3 gap-4 text-center">
        <!-- Contacts Count -->
        <div>
          <div class="text-lg font-semibold text-gray-900">
            {{ organization.contacts?.length || 0 }}
          </div>
          <div class="text-xs text-gray-500">Contacts</div>
        </div>
        
        <!-- Opportunities Count -->
        <div>
          <div class="text-lg font-semibold text-gray-900">
            {{ organization.opportunities?.length || 0 }}
          </div>
          <div class="text-xs text-gray-500">Opportunities</div>
        </div>
        
        <!-- Revenue/Value -->
        <div>
          <div class="text-lg font-semibold text-gray-900">
            {{ formatRevenue(organization.annual_revenue) }}
          </div>
          <div class="text-xs text-gray-500">Revenue</div>
        </div>
      </div>
    </div>
    
    <!-- Selection Checkbox (if selectable) -->
    <div 
      v-if="selectable"
      class="absolute top-4 left-4"
    >
      <input
        type="checkbox"
        :checked="isSelected"
        @change="handleToggleSelection"
        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import OrganizationAvatar from '../atomic/OrganizationAvatar.vue'
import OrganizationTypeChip from '../atomic/OrganizationTypeChip.vue'
import OrganizationStatus from '../atomic/OrganizationStatus.vue'
import type { OrganizationWithRelations } from '@/services'

interface Props {
  organization: OrganizationWithRelations
  showActions?: boolean
  showStatus?: boolean
  selectable?: boolean
  isSelected?: boolean
}

interface Emits {
  (e: 'view', id: string): void
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'add-contact', id: string): void
  (e: 'view-opportunities', id: string): void
  (e: 'toggle-selection', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showStatus: true,
  selectable: false,
  isSelected: false
})

const emit = defineEmits<Emits>()

// Actions menu state
const showActionsMenu = ref(false)
const actionsMenuRef = ref<HTMLElement>()

// Close actions menu when clicking outside
onClickOutside(actionsMenuRef, () => {
  showActionsMenu.value = false
})

// Computed properties
const locationText = computed(() => {
  const parts = [
    props.organization.city,
    props.organization.state_province,
    props.organization.country
  ].filter(Boolean)
  
  return parts.length > 0 ? parts.join(', ') : null
})

// Event handlers
const toggleActionsMenu = () => {
  showActionsMenu.value = !showActionsMenu.value
}

const handleView = () => {
  emit('view', props.organization.id)
  showActionsMenu.value = false
}

const handleEdit = () => {
  emit('edit', props.organization.id)
  showActionsMenu.value = false
}

const handleDelete = () => {
  emit('delete', props.organization.id)
  showActionsMenu.value = false
}

const handleAddContact = () => {
  emit('add-contact', props.organization.id)
  showActionsMenu.value = false
}

const handleViewOpportunities = () => {
  emit('view-opportunities', props.organization.id)
  showActionsMenu.value = false
}

const handleToggleSelection = () => {
  emit('toggle-selection', props.organization.id)
}

// Utility functions
const formatWebsite = (website: string): string => {
  return website.replace(/^https?:\/\//, '').replace(/^www\./, '')
}

const formatRevenue = (revenue?: number | null): string => {
  if (!revenue) return 'N/A'
  
  if (revenue >= 1000000) {
    return `$${(revenue / 1000000).toFixed(1)}M`
  } else if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(0)}K`
  }
  return `$${revenue.toLocaleString()}`
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>