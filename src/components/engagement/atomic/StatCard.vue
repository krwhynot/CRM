<!--
  Stat Card Component
  
  Atomic component that displays a single statistic with optional trend indicator
  Used in dashboards to show key metrics
-->
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600 mb-1">{{ title }}</p>
        <div class="flex items-baseline">
          <p 
            class="text-2xl font-semibold"
            :class="color || 'text-gray-900'"
          >
            {{ formattedValue }}
          </p>
          <div 
            v-if="trend !== null && trend !== undefined" 
            class="ml-2 flex items-center text-sm"
            :class="trendColorClass"
          >
            <TrendIcon :trend="trendDirection" class="w-4 h-4 mr-1" />
            <span>{{ Math.abs(trend) }}%</span>
          </div>
        </div>
      </div>
      
      <div v-if="icon" class="flex-shrink-0">
        <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
          <component 
            :is="iconComponent" 
            class="w-6 h-6"
            :class="iconColor || 'text-gray-500'"
          />
        </div>
      </div>
    </div>
    
    <div v-if="subtitle" class="mt-2">
      <p class="text-xs text-gray-500">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TrendIcon from './TrendIcon.vue'
import {
  BuildingIcon,
  UsersIcon,
  HeartIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  BarChartIcon,
  DollarSignIcon,
  ClockIcon,
  TargetIcon,
  ActivityIcon
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  title: string
  value: string | number
  icon?: string
  trend?: number | null
  color?: string
  iconColor?: string
  subtitle?: string
}>()

// Computed formatted value
const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    // Format numbers with appropriate suffixes
    if (props.value >= 1000000) {
      return (props.value / 1000000).toFixed(1) + 'M'
    } else if (props.value >= 1000) {
      return (props.value / 1000).toFixed(1) + 'K'
    } else if (props.value % 1 !== 0) {
      return props.value.toFixed(1)
    }
    return props.value.toString()
  }
  return props.value
})

// Computed trend direction
const trendDirection = computed((): 'improving' | 'declining' | 'stable' => {
  if (props.trend === null || props.trend === undefined) return 'stable'
  if (props.trend > 0) return 'improving'
  if (props.trend < 0) return 'declining'
  return 'stable'
})

// Computed trend color class
const trendColorClass = computed(() => {
  if (props.trend === null || props.trend === undefined) return 'text-gray-500'
  if (props.trend > 0) return 'text-green-600'
  if (props.trend < 0) return 'text-red-600'
  return 'text-gray-500'
})

// Computed icon component
const iconComponent = computed(() => {
  if (!props.icon) return null
  
  const iconMap: Record<string, any> = {
    BuildingIcon: BuildingIcon,
    UsersIcon: UsersIcon,
    HeartIcon: HeartIcon,
    AlertTriangleIcon: AlertTriangleIcon,
    TrendingUpIcon: TrendingUpIcon,
    BarChartIcon: BarChartIcon,
    DollarSignIcon: DollarSignIcon,
    ClockIcon: ClockIcon,
    TargetIcon: TargetIcon,
    ActivityIcon: ActivityIcon
  }
  
  return iconMap[props.icon] || BarChartIcon
})
</script>