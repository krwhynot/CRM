<template>
  <div class="flex items-center gap-2">
    <!-- Circular progress indicator -->
    <div 
      class="relative inline-flex items-center justify-center"
      :class="sizeClasses.container"
    >
      <svg 
        class="transform -rotate-90"
        :width="dimensions.size" 
        :height="dimensions.size"
      >
        <!-- Background circle -->
        <circle
          cx="50%"
          cy="50%"
          :r="dimensions.radius"
          :stroke-width="dimensions.strokeWidth"
          stroke="currentColor"
          fill="none"
          class="text-gray-200"
        />
        <!-- Progress circle -->
        <circle
          cx="50%"
          cy="50%"
          :r="dimensions.radius"
          :stroke-width="dimensions.strokeWidth"
          :stroke="scoreConfig.color"
          fill="none"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          stroke-linecap="round"
          class="transition-all duration-500 ease-out"
        />
      </svg>
      <!-- Score text -->
      <div 
        class="absolute inset-0 flex items-center justify-center"
        :class="sizeClasses.text"
      >
        <span 
          class="font-semibold tabular-nums"
          :class="scoreConfig.textColor"
        >
          {{ Math.round(score) }}
        </span>
      </div>
    </div>
    
    <!-- Label and description -->
    <div v-if="showLabel" class="flex flex-col">
      <div class="flex items-center gap-1.5">
        <span 
          class="text-sm font-medium"
          :class="scoreConfig.textColor"
        >
          {{ scoreConfig.level }}
        </span>
        <component 
          v-if="showIcon"
          :is="scoreConfig.icon"
          class="w-4 h-4"
          :class="scoreConfig.textColor"
        />
      </div>
      <span 
        v-if="showDescription"
        class="text-xs text-gray-500"
      >
        {{ scoreConfig.description }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getHealthScoreLevel } from '@/types/relationshipProgression.types'

// Lucide icons
import { 
  TrendingUp, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  X,
  Minus
} from 'lucide-vue-next'

interface Props {
  score: number
  showLabel?: boolean
  showDescription?: boolean
  showIcon?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
  showDescription: false,
  showIcon: true,
  size: 'md',
  animated: true
})

// Size configurations
const sizeClasses = computed(() => {
  const configs = {
    xs: {
      container: 'w-8 h-8',
      text: 'text-xs'
    },
    sm: {
      container: 'w-12 h-12',
      text: 'text-sm'
    },
    md: {
      container: 'w-16 h-16',
      text: 'text-base'
    },
    lg: {
      container: 'w-20 h-20',
      text: 'text-lg'
    },
    xl: {
      container: 'w-24 h-24',
      text: 'text-xl'
    }
  }
  
  return configs[props.size]
})

// Dimensions for SVG based on size
const dimensions = computed(() => {
  const configs = {
    xs: { size: 32, radius: 12, strokeWidth: 3 },
    sm: { size: 48, radius: 18, strokeWidth: 4 },
    md: { size: 64, radius: 24, strokeWidth: 5 },
    lg: { size: 80, radius: 30, strokeWidth: 6 },
    xl: { size: 96, radius: 36, strokeWidth: 7 }
  }
  
  return configs[props.size]
})

// Score configuration with colors and icons
const scoreConfig = computed(() => {
  const healthLevel = getHealthScoreLevel(props.score)
  
  const configs = {
    Excellent: {
      ...healthLevel,
      color: '#10b981', // green-500
      textColor: 'text-green-600',
      icon: Check
    },
    Good: {
      ...healthLevel,
      color: '#3b82f6', // blue-500
      textColor: 'text-blue-600',
      icon: TrendingUp
    },
    Fair: {
      ...healthLevel,
      color: '#f59e0b', // amber-500
      textColor: 'text-amber-600',
      icon: Minus
    },
    'At Risk': {
      ...healthLevel,
      color: '#f97316', // orange-500
      textColor: 'text-orange-600',
      icon: AlertTriangle
    },
    Critical: {
      ...healthLevel,
      color: '#ef4444', // red-500
      textColor: 'text-red-600',
      icon: AlertCircle
    }
  }
  
  return configs[healthLevel.level] || configs.Fair
})

// Circle calculations
const circumference = computed(() => 2 * Math.PI * dimensions.value.radius)
const strokeDashoffset = computed(() => {
  const progress = Math.min(Math.max(props.score, 0), 100) / 100
  return circumference.value - (progress * circumference.value)
})
</script>