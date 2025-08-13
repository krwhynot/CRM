<!--
  Activity Metric - Displays key activity metrics with visual indicators
  
  Features:
  - Icon + value + label layout
  - Color-coded based on performance level
  - Trend indicators
  - Compact and readable design
-->
<template>
  <div class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
    <!-- Icon -->
    <div 
      :class="[
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm',
        iconBackgroundClass
      ]"
    >
      <component :is="icon" class="w-4 h-4" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <!-- Value -->
        <div :class="['text-lg font-semibold', valueColorClass]">
          {{ formattedValue }}
        </div>
        
        <!-- Trend Indicator -->
        <div 
          v-if="trend"
          :class="[
            'flex items-center text-xs font-medium',
            trendColorClass
          ]"
        >
          <component :is="trendIcon" class="w-3 h-3 mr-0.5" />
          <span v-if="trendValue">{{ trendValue }}</span>
        </div>
      </div>
      
      <!-- Label -->
      <div class="text-sm text-gray-600 truncate">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Simple icon components
const PhoneIcon = { template: '<div>📞</div>' }
const EmailIcon = { template: '<div>✉️</div>' }
const MeetingIcon = { template: '<div>🤝</div>' }
const ClockIcon = { template: '<div>⏰</div>' }
const CheckCircleIcon = { template: '<div>✅</div>' }
const TrendUpIcon = { template: '<div class="text-green-500">↗️</div>' }
const TrendDownIcon = { template: '<div class="text-red-500">↘️</div>' }
const TrendFlatIcon = { template: '<div class="text-gray-400">→</div>' }
const UsersIcon = { template: '<div>👥</div>' }
const TargetIcon = { template: '<div>🎯</div>' }

interface Props {
  label: string
  value: number | string
  icon?: string
  type?: 'count' | 'percentage' | 'duration' | 'rate' | 'currency'
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  performanceLevel?: 'excellent' | 'good' | 'fair' | 'poor'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'count',
  performanceLevel: 'good'
})

// Icon mapping
const iconComponents = {
  phone: PhoneIcon,
  email: EmailIcon,
  meeting: MeetingIcon,
  clock: ClockIcon,
  check: CheckCircleIcon,
  users: UsersIcon,
  target: TargetIcon
}

// Computed properties
const icon = computed(() => {
  return props.icon && iconComponents[props.icon as keyof typeof iconComponents] 
    ? iconComponents[props.icon as keyof typeof iconComponents]
    : TargetIcon
})

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up': return TrendUpIcon
    case 'down': return TrendDownIcon
    default: return TrendFlatIcon
  }
})

const formattedValue = computed(() => {
  const value = props.value

  if (typeof value === 'string') return value

  switch (props.type) {
    case 'percentage':
      return `${value}%`
    case 'duration':
      if (value < 60) return `${value}min`
      const hours = Math.floor(value / 60)
      const minutes = value % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    case 'rate':
      return `${value}/10`
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    case 'count':
    default:
      return value.toLocaleString()
  }
})

const iconBackgroundClass = computed(() => {
  const baseClasses = 'transition-colors duration-200'
  
  switch (props.performanceLevel) {
    case 'excellent':
      return `${baseClasses} bg-green-100 text-green-600`
    case 'good':
      return `${baseClasses} bg-blue-100 text-blue-600`
    case 'fair':
      return `${baseClasses} bg-yellow-100 text-yellow-600`
    case 'poor':
      return `${baseClasses} bg-red-100 text-red-600`
    default:
      return `${baseClasses} bg-gray-100 text-gray-600`
  }
})

const valueColorClass = computed(() => {
  switch (props.performanceLevel) {
    case 'excellent':
      return 'text-green-700'
    case 'good':
      return 'text-blue-700'
    case 'fair':
      return 'text-yellow-700'
    case 'poor':
      return 'text-red-700'
    default:
      return 'text-gray-700'
  }
})

const trendColorClass = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-500'
  }
})
</script>