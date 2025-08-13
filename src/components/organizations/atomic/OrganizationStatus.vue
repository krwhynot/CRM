<template>
  <div class="flex items-center">
    <div 
      :class="statusDotClasses"
      class="w-2 h-2 rounded-full mr-2"
    ></div>
    <span 
      :class="statusTextClasses"
      class="text-sm font-medium"
    >
      {{ statusLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Organization } from '@/types'

interface Props {
  organization: Organization
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

// Determine organization status based on business logic
const organizationStatus = computed(() => {
  const org = props.organization
  
  // Organization is inactive if soft-deleted
  if (org.deleted_at) {
    return 'archived'
  }
  
  // Check for recent activity (within last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const lastUpdate = org.updated_at ? new Date(org.updated_at) : new Date()
  
  if (lastUpdate < ninetyDaysAgo) {
    return 'inactive'
  }
  
  return 'active'
})

// Status configuration
const statusConfig = computed(() => {
  const configs = {
    active: {
      label: 'Active',
      dotClasses: 'bg-emerald-400',
      textClasses: 'text-emerald-700'
    },
    inactive: {
      label: 'Inactive',
      dotClasses: 'bg-amber-400',
      textClasses: 'text-amber-700'
    },
    archived: {
      label: 'Archived',
      dotClasses: 'bg-gray-400',
      textClasses: 'text-gray-700'
    }
  }
  
  return configs[organizationStatus.value]
})

const statusLabel = computed(() => statusConfig.value.label)
const statusDotClasses = computed(() => statusConfig.value.dotClasses)
const statusTextClasses = computed(() => statusConfig.value.textClasses)
</script>