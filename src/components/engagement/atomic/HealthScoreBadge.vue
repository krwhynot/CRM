<!--
Health Score Badge Component
Displays health scores with color-coded visual indicators
-->
<template>
  <div
    :class="[
      'inline-flex items-center justify-center font-medium rounded-full',
      sizeClasses,
      colorClasses,
      animated && 'transition-all duration-200 hover:scale-105'
    ]"
    :title="tooltip"
  >
    <!-- Health Icon -->
    <svg
      v-if="showIcon"
      :class="iconSizeClasses"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        :d="healthIconPath"
      />
    </svg>
    
    <!-- Score Display -->
    <span :class="[showIcon && 'ml-1']">
      {{ displayScore }}{{ showSuffix ? '/100' : '' }}
    </span>
    
    <!-- Trend Arrow -->
    <TrendIcon
      v-if="trend && showTrend"
      :trend="trend"
      :class="['ml-1', trendIconSizeClasses]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TrendIcon from './TrendIcon.vue'

// Props
interface Props {
  score: number
  showIcon?: boolean
  showSuffix?: boolean
  showTrend?: boolean
  trend?: 'improving' | 'stable' | 'declining'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  animated?: boolean
  format?: 'number' | 'letter' | 'both'
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  showSuffix: false,
  showTrend: false,
  size: 'md',
  animated: true,
  format: 'number'
})

// Health score thresholds
const HEALTH_THRESHOLDS = {
  excellent: 90,
  good: 75,
  average: 60,
  poor: 40,
  critical: 0
} as const

type HealthCategory = 'excellent' | 'good' | 'average' | 'poor' | 'critical'

// Computed properties
const healthCategory = computed((): HealthCategory => {
  if (props.score >= HEALTH_THRESHOLDS.excellent) return 'excellent'
  if (props.score >= HEALTH_THRESHOLDS.good) return 'good'
  if (props.score >= HEALTH_THRESHOLDS.average) return 'average'
  if (props.score >= HEALTH_THRESHOLDS.poor) return 'poor'
  return 'critical'
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  }
  return sizes[props.size]
})

const iconSizeClasses = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return sizes[props.size]
})

const trendIconSizeClasses = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    excellent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    good: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    average: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    poor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return colors[healthCategory.value]
})

const healthIconPath = computed(() => {
  const icons = {
    excellent: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', // Heart
    good: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // Check circle
    average: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Info circle
    poor: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z', // Warning
    critical: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' // X circle
  }
  return icons[healthCategory.value]
})

const displayScore = computed(() => {
  const score = Math.round(props.score)
  
  if (props.format === 'letter') {
    return getLetterGrade(score)
  } else if (props.format === 'both') {
    return `${score} (${getLetterGrade(score)})`
  } else {
    return score.toString()
  }
})

const tooltip = computed(() => {
  const category = healthCategory.value
  const categoryLabels = {
    excellent: 'Excellent Health',
    good: 'Good Health',
    average: 'Average Health',
    poor: 'Poor Health',
    critical: 'Critical Health'
  }
  
  let tooltip = `${categoryLabels[category]}: ${Math.round(props.score)}/100`
  
  if (props.trend) {
    const trendLabels = {
      improving: 'Improving',
      stable: 'Stable',
      declining: 'Declining'
    }
    tooltip += ` (${trendLabels[props.trend]})`
  }
  
  return tooltip
})

// Helper functions
function getLetterGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
</style>