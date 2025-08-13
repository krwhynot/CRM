<!--
  Health Score Badge - Displays relationship health score with visual indicator
  
  Features:
  - Color-coded health status (excellent/good/fair/poor/critical)
  - Trending indicator (up/down/stable)
  - Animated score display
  - Tooltip with detailed breakdown
-->
<template>
  <div class="relative inline-flex items-center">
    <!-- Main Score Badge -->
    <div 
      :class="[
        'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200',
        'ring-2 ring-offset-1',
        healthStatusClasses[healthStatus],
        'hover:scale-105 hover:shadow-lg'
      ]"
      :title="tooltipText"
    >
      <!-- Score -->
      <span class="text-lg font-bold mr-2">{{ score }}</span>
      
      <!-- Status Icon -->
      <component 
        :is="statusIcon" 
        class="w-4 h-4 mr-1" 
        :class="iconClasses[healthStatus]"
      />
      
      <!-- Trending Indicator -->
      <component 
        :is="trendingIcon" 
        :class="[
          'w-3 h-3 transition-transform duration-300',
          trendingClasses[trending]
        ]"
      />
    </div>

    <!-- Detailed Tooltip (shown on hover) -->
    <div 
      v-if="showDetails"
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto"
    >
      <!-- Score Breakdown -->
      <div class="space-y-2 text-xs">
        <div class="font-medium text-gray-900 border-b pb-1">Health Score Breakdown</div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Engagement:</span>
          <span class="font-medium">{{ engagementScore }}/100</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Response Quality:</span>
          <span class="font-medium">{{ responseScore }}/100</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Progression:</span>
          <span class="font-medium">{{ progressionScore }}/100</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600">Recency:</span>
          <span class="font-medium">{{ recencyScore }}/100</span>
        </div>

        <!-- Risk Factors -->
        <div v-if="riskFactors?.length" class="pt-2 border-t">
          <div class="text-red-600 font-medium mb-1">Risk Factors:</div>
          <ul class="text-red-600 space-y-0.5">
            <li v-for="risk in riskFactors" :key="risk" class="text-xs">• {{ risk }}</li>
          </ul>
        </div>

        <!-- Strengths -->
        <div v-if="strengths?.length" class="pt-2 border-t">
          <div class="text-green-600 font-medium mb-1">Strengths:</div>
          <ul class="text-green-600 space-y-0.5">
            <li v-for="strength in strengths" :key="strength" class="text-xs">• {{ strength }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RelationshipHealthScore } from '@/stores/dashboardStore'

// Icons (using simple SVG or emoji fallbacks)
const CheckCircle = { template: '<div class="text-green-500">✓</div>' }
const ExclamationTriangle = { template: '<div class="text-yellow-500">⚠</div>' }
const XCircle = { template: '<div class="text-red-500">✗</div>' }
const TrendingUp = { template: '<div class="text-green-500">↗</div>' }
const TrendingDown = { template: '<div class="text-red-500">↘</div>' }
const Minus = { template: '<div class="text-gray-400">−</div>' }

interface Props {
  score: number
  healthStatus: RelationshipHealthScore['health_status']
  trending: RelationshipHealthScore['trending']
  engagementScore?: number
  responseScore?: number
  progressionScore?: number
  recencyScore?: number
  riskFactors?: string[]
  strengths?: string[]
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: true
})

// Style mappings based on health status
const healthStatusClasses = {
  excellent: 'bg-green-100 text-green-800 ring-green-200 border-green-300',
  good: 'bg-blue-100 text-blue-800 ring-blue-200 border-blue-300', 
  fair: 'bg-yellow-100 text-yellow-800 ring-yellow-200 border-yellow-300',
  poor: 'bg-orange-100 text-orange-800 ring-orange-200 border-orange-300',
  critical: 'bg-red-100 text-red-800 ring-red-200 border-red-300'
}

const iconClasses = {
  excellent: 'text-green-600',
  good: 'text-blue-600',
  fair: 'text-yellow-600', 
  poor: 'text-orange-600',
  critical: 'text-red-600'
}

const trendingClasses = {
  up: 'text-green-500 transform rotate-0',
  down: 'text-red-500 transform rotate-0',
  stable: 'text-gray-400 transform rotate-0'
}

// Computed properties
const statusIcon = computed(() => {
  switch (props.healthStatus) {
    case 'excellent':
    case 'good':
      return CheckCircle
    case 'fair':
      return ExclamationTriangle
    case 'poor':
    case 'critical':
      return XCircle
    default:
      return CheckCircle
  }
})

const trendingIcon = computed(() => {
  switch (props.trending) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    default:
      return Minus
  }
})

const tooltipText = computed(() => {
  return `Health Score: ${props.score}/100 (${props.healthStatus}) - Trending ${props.trending}`
})
</script>

<style scoped>
.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}

.group:hover .group-hover\\:pointer-events-auto {
  pointer-events: auto;
}
</style>