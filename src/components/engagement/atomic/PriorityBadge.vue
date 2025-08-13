<!--
  Priority Badge Component
  
  Atomic component that displays priority levels with appropriate styling
  Shows low, medium, high, critical priority indicators
-->
<template>
  <span 
    :class="priorityClasses"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  >
    <component :is="priorityIcon" class="w-3 h-3 mr-1" />
    {{ priorityLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertTriangleIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  ArrowDownIcon
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  priority: 'low' | 'medium' | 'high' | 'critical'
}>()

// Computed priority label
const priorityLabel = computed(() => {
  return props.priority.charAt(0).toUpperCase() + props.priority.slice(1)
})

// Computed priority icon
const priorityIcon = computed(() => {
  switch (props.priority) {
    case 'critical':
      return AlertTriangleIcon
    case 'high':
      return ArrowUpIcon
    case 'medium':
      return ArrowRightIcon
    case 'low':
    default:
      return ArrowDownIcon
  }
})

// Computed priority classes
const priorityClasses = computed(() => {
  switch (props.priority) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
    default:
      return 'bg-green-100 text-green-800'
  }
})
</script>