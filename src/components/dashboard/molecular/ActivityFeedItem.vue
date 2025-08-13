<!--
  Activity Feed Item - Individual item in the principal-aggregated activity feed
  
  Features:
  - Time-based grouping display
  - Activity type icons
  - Principal context
  - Expandable details
  - Action buttons
-->
<template>
  <div 
    :class="[
      'relative flex items-start space-x-4 p-4 rounded-lg transition-all duration-200',
      'hover:bg-gray-50 hover:shadow-sm',
      isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100',
      'border cursor-pointer group'
    ]"
    @click="$emit('click')"
  >
    <!-- Timeline Indicator -->
    <div class="flex-shrink-0 relative">
      <!-- Activity Type Icon -->
      <div 
        :class="[
          'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
          getActivityTypeClass()
        ]"
      >
        <component :is="activityIcon" class="w-5 h-5" />
      </div>
      
      <!-- Connection Line (for grouped items) -->
      <div 
        v-if="showConnector"
        class="absolute top-10 left-1/2 transform -translate-x-px w-0.5 h-6 bg-gray-200"
      ></div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Header -->
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1 min-w-0">
          <!-- Title -->
          <h4 class="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
            {{ activity.title }}
          </h4>
          
          <!-- Context Info -->
          <div class="flex items-center space-x-2 text-xs text-gray-500 mt-1">
            <span class="font-medium text-blue-600">{{ activity.target_name }}</span>
            <span class="text-gray-300">•</span>
            <span>{{ formatTimestamp(activity.timestamp) }}</span>
            <span v-if="activity.actor" class="text-gray-300">•</span>
            <span v-if="activity.actor">by {{ activity.actor }}</span>
          </div>
        </div>

        <!-- Importance Indicator -->
        <div 
          :class="[
            'flex-shrink-0 w-2 h-2 rounded-full ml-2',
            getImportanceClass()
          ]"
          :title="`${activity.importance} importance`"
        ></div>
      </div>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ activity.description }}
      </p>

      <!-- Metadata Tags -->
      <div v-if="hasMetadata" class="flex flex-wrap gap-1 mb-3">
        <span 
          v-for="(value, key) in displayMetadata"
          :key="key"
          class="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
        >
          {{ formatMetadataTag(key, value) }}
        </span>
      </div>

      <!-- Expandable Details -->
      <div v-if="isExpanded" class="mb-3 p-3 bg-gray-50 rounded-lg">
        <div class="space-y-2 text-sm">
          <!-- Detailed Metadata -->
          <div v-for="(value, key) in detailedMetadata" :key="key" class="flex justify-between">
            <span class="font-medium text-gray-700 capitalize">{{ formatMetadataKey(key) }}:</span>
            <span class="text-gray-600">{{ formatMetadataValue(value) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- Quick Actions -->
          <button
            v-if="canScheduleFollowUp"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            @click.stop="$emit('schedule-follow-up')"
          >
            Schedule Follow-up
          </button>
          
          <button
            v-if="canViewDetails"
            class="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors"
            @click.stop="$emit('view-details')"
          >
            View Details
          </button>
          
          <!-- Expand/Collapse -->
          <button
            v-if="hasDetailedMetadata"
            class="text-xs text-gray-500 hover:text-gray-600 transition-colors"
            @click.stop="toggleExpanded"
          >
            {{ isExpanded ? 'Less' : 'More' }}
          </button>
        </div>

        <!-- Time Ago -->
        <div class="text-xs text-gray-400">
          {{ timeAgo(activity.timestamp) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ActivityFeedItem } from '@/types/interactions.types'

// Simple icon components
const InteractionIcon = { template: '<div>💬</div>' }
const OpportunityIcon = { template: '<div>💰</div>' }
const ContactIcon = { template: '<div>👤</div>' }
const DealIcon = { template: '<div>🤝</div>' }
const FollowUpIcon = { template: '<div>📅</div>' }
const DefaultIcon = { template: '<div>📋</div>' }

interface Props {
  activity: ActivityFeedItem
  isSelected?: boolean
  showConnector?: boolean
  canScheduleFollowUp?: boolean
  canViewDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  showConnector: false,
  canScheduleFollowUp: true,
  canViewDetails: true
})

defineEmits<{
  click: []
  'schedule-follow-up': []
  'view-details': []
}>()

// Local state
const isExpanded = ref(false)

// Computed properties
const activityIcon = computed(() => {
  switch (props.activity.type) {
    case 'interaction':
      return InteractionIcon
    case 'opportunity_stage_change':
      return OpportunityIcon
    case 'contact_added':
      return ContactIcon
    case 'deal_won':
      return DealIcon
    case 'follow_up_due':
      return FollowUpIcon
    default:
      return DefaultIcon
  }
})

const hasMetadata = computed(() => {
  return props.activity.metadata && Object.keys(props.activity.metadata).length > 0
})

const displayMetadata = computed(() => {
  if (!props.activity.metadata) return {}
  
  // Show only the first 3 most relevant metadata items for display
  const relevant = ['interaction_type', 'opportunity_stage', 'deal_value', 'priority']
  const filtered = Object.entries(props.activity.metadata)
    .filter(([key]) => relevant.includes(key))
    .slice(0, 3)
  
  return Object.fromEntries(filtered)
})

const detailedMetadata = computed(() => {
  if (!props.activity.metadata) return {}
  
  // Show all metadata except what's already displayed
  const displayKeys = Object.keys(displayMetadata.value)
  return Object.entries(props.activity.metadata)
    .filter(([key]) => !displayKeys.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
})

const hasDetailedMetadata = computed(() => {
  return Object.keys(detailedMetadata.value).length > 0
})

// Methods
function getActivityTypeClass() {
  const baseClasses = 'shadow-sm ring-2 ring-white'
  
  switch (props.activity.type) {
    case 'interaction':
      return `${baseClasses} bg-blue-500`
    case 'opportunity_stage_change':
      return `${baseClasses} bg-green-500`
    case 'contact_added':
      return `${baseClasses} bg-purple-500`
    case 'deal_won':
      return `${baseClasses} bg-yellow-500`
    case 'follow_up_due':
      return `${baseClasses} bg-orange-500`
    default:
      return `${baseClasses} bg-gray-500`
  }
}

function getImportanceClass() {
  switch (props.activity.importance) {
    case 'high':
      return 'bg-red-400'
    case 'medium':
      return 'bg-yellow-400'
    case 'low':
      return 'bg-gray-300'
    default:
      return 'bg-gray-300'
  }
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function timeAgo(timestamp: string) {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks}w ago`
}

function formatMetadataTag(key: string, value: any): string {
  switch (key) {
    case 'interaction_type':
      return `${value}`.charAt(0).toUpperCase() + `${value}`.slice(1)
    case 'deal_value':
      return `$${Number(value).toLocaleString()}`
    case 'opportunity_stage':
      return `Stage: ${value}`
    case 'priority':
      return `${value} priority`
    default:
      return `${key}: ${value}`
  }
}

function formatMetadataKey(key: string): string {
  return key.replace(/_/g, ' ')
}

function formatMetadataValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  return String(value)
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>