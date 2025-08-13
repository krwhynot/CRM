<!--
  Trend Icon Component
  
  Atomic component that displays trend indicators (up, down, stable)
  Shows visual representation of data trends with appropriate colors
-->
<template>
  <component 
    :is="trendIcon" 
    :class="trendColorClass"
    class="inline-block"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  trend: 'improving' | 'declining' | 'stable'
}>()

// Computed icon component
const trendIcon = computed(() => {
  switch (props.trend) {
    case 'improving':
      return TrendingUpIcon
    case 'declining':
      return TrendingDownIcon
    case 'stable':
    default:
      return MinusIcon
  }
})

// Computed color classes
const trendColorClass = computed(() => {
  switch (props.trend) {
    case 'improving':
      return 'text-green-500'
    case 'declining':
      return 'text-red-500'
    case 'stable':
    default:
      return 'text-gray-400'
  }
})
</script>