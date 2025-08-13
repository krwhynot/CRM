<!--
  Health Score Distribution Chart
  
  Molecular component that displays health score distribution across all principals
  Shows breakdown by score ranges with visual representation
-->
<template>
  <div class="space-y-4">
    <!-- Chart Header -->
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-medium text-gray-900">Score Distribution</h4>
      <div class="text-xs text-gray-500">{{ totalCount }} total principals</div>
    </div>
    
    <!-- Distribution Bars -->
    <div class="space-y-3">
      <div 
        v-for="range in distributionRanges" 
        :key="range.label"
        class="flex items-center"
      >
        <div class="w-16 text-xs font-medium text-gray-600">
          {{ range.label }}
        </div>
        
        <div class="flex-1 mx-3">
          <div class="flex items-center">
            <div class="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div 
                class="h-4 rounded-full transition-all duration-500"
                :class="range.colorClass"
                :style="{ width: `${range.percentage}%` }"
              />
            </div>
            
            <div class="ml-3 w-12 text-right">
              <span class="text-sm font-medium text-gray-900">{{ range.count }}</span>
            </div>
            
            <div class="ml-2 w-8 text-right">
              <span class="text-xs text-gray-500">{{ range.percentage.toFixed(0) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary Stats -->
    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-lg font-semibold text-green-600">{{ excellentCount }}</p>
          <p class="text-xs text-gray-600">Excellent (90+)</p>
        </div>
        <div>
          <p class="text-lg font-semibold text-gray-900">{{ averageScore.toFixed(1) }}</p>
          <p class="text-xs text-gray-600">Average Score</p>
        </div>
        <div>
          <p class="text-lg font-semibold text-red-600">{{ riskCount }}</p>
          <p class="text-xs text-gray-600">At Risk (<60)</p>
        </div>
      </div>
    </div>
    
    <!-- Trend Indicator -->
    <div class="flex items-center justify-center text-sm text-gray-600 mt-2">
      <TrendIcon :trend="overallTrend" class="w-4 h-4 mr-2" />
      <span>
        Overall health is {{ overallTrendLabel }} 
        <span class="font-medium">{{ Math.abs(trendPercentage) }}%</span> vs last period
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TrendIcon from '../atomic/TrendIcon.vue'

// Props
const props = defineProps<{
  distribution: {
    excellent: number     // 90-100
    good: number         // 75-89
    average: number      // 60-74
    poor: number         // 40-59
    critical: number     // 0-39
    average_score: number
    trend_percentage?: number
  }
}>()

// Computed total count
const totalCount = computed(() => {
  return props.distribution.excellent + 
         props.distribution.good + 
         props.distribution.average + 
         props.distribution.poor + 
         props.distribution.critical
})

// Computed distribution ranges
const distributionRanges = computed(() => {
  const total = totalCount.value
  
  return [
    {
      label: '90-100',
      count: props.distribution.excellent,
      percentage: total > 0 ? (props.distribution.excellent / total) * 100 : 0,
      colorClass: 'bg-green-500'
    },
    {
      label: '75-89',
      count: props.distribution.good,
      percentage: total > 0 ? (props.distribution.good / total) * 100 : 0,
      colorClass: 'bg-blue-500'
    },
    {
      label: '60-74',
      count: props.distribution.average,
      percentage: total > 0 ? (props.distribution.average / total) * 100 : 0,
      colorClass: 'bg-yellow-500'
    },
    {
      label: '40-59',
      count: props.distribution.poor,
      percentage: total > 0 ? (props.distribution.poor / total) * 100 : 0,
      colorClass: 'bg-orange-500'
    },
    {
      label: '0-39',
      count: props.distribution.critical,
      percentage: total > 0 ? (props.distribution.critical / total) * 100 : 0,
      colorClass: 'bg-red-500'
    }
  ]
})

// Computed summary stats
const excellentCount = computed(() => props.distribution.excellent)
const averageScore = computed(() => props.distribution.average_score)
const riskCount = computed(() => props.distribution.poor + props.distribution.critical)

// Computed trend info
const trendPercentage = computed(() => props.distribution.trend_percentage || 0)
const overallTrend = computed((): 'improving' | 'declining' | 'stable' => {
  const trend = trendPercentage.value
  if (trend > 2) return 'improving'
  if (trend < -2) return 'declining'
  return 'stable'
})

const overallTrendLabel = computed(() => {
  const trend = overallTrend.value
  if (trend === 'improving') return 'improving'
  if (trend === 'declining') return 'declining'
  return 'stable'
})
</script>