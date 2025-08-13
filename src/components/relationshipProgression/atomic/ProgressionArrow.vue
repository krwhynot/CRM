<template>
  <div 
    class="flex items-center justify-center"
    :class="containerClasses"
  >
    <component 
      :is="arrowIcon" 
      :class="[iconClasses, directionClasses]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Lucide icons
import { 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-vue-next'

interface Props {
  direction?: 'right' | 'up' | 'down' | 'flat' | 'trending-up' | 'trending-down'
  status?: 'positive' | 'negative' | 'neutral' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'right',
  status: 'neutral',
  size: 'md',
  animated: false
})

// Icon mapping
const arrowIcon = computed(() => {
  const iconMap = {
    right: ArrowRight,
    up: ArrowUp,
    down: ArrowDown,
    flat: Minus,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown
  }
  
  return iconMap[props.direction]
})

// Size classes
const sizeClasses = computed(() => {
  const configs = {
    xs: {
      container: 'w-6 h-6',
      icon: 'w-3 h-3'
    },
    sm: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4'
    },
    md: {
      container: 'w-10 h-10',
      icon: 'w-5 h-5'
    },
    lg: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6'
    }
  }
  
  return configs[props.size]
})

const containerClasses = computed(() => {
  const base = sizeClasses.value.container
  const animation = props.animated ? 'transition-all duration-300' : ''
  
  return [base, animation].filter(Boolean).join(' ')
})

const iconClasses = computed(() => sizeClasses.value.icon)

// Status-based coloring
const directionClasses = computed(() => {
  const statusColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    warning: 'text-amber-500',
    neutral: 'text-gray-400'
  }
  
  const animation = props.animated ? 'transition-colors duration-300 hover:scale-110' : ''
  
  return [statusColors[props.status], animation].filter(Boolean).join(' ')
})
</script>