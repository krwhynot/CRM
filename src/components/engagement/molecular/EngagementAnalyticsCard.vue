<!--
  Engagement Analytics Card
  
  Molecular component that displays key engagement metrics for a principal
  Provides a comprehensive overview of relationship health and patterns
-->
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <BarChartIcon class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ principalName }}</h3>
          <p class="text-sm text-gray-500">{{ distributorCount }} distributor(s) • {{ totalInteractions }} interactions</p>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <button
          @click="refreshAnalytics"
          :disabled="isRefreshing"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh analytics"
        >
          <RefreshIcon class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
        </button>
        
        <button
          @click="$emit('viewDetails')"
          class="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Health Score -->
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center mb-2">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            :class="healthScoreColorClass"
          >
            {{ healthScore }}
          </div>
        </div>
        <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Health Score</p>
        <div class="flex items-center justify-center mt-1">
          <TrendIcon :trend="healthTrend" class="w-3 h-3 mr-1" />
          <span class="text-xs text-gray-500">{{ healthTrendLabel }}</span>
        </div>
      </div>

      <!-- Risk Score -->
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center mb-2">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            :class="riskScoreColorClass"
          >
            {{ riskScore }}
          </div>
        </div>
        <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Risk Score</p>
        <div class="flex items-center justify-center mt-1">
          <WarningIcon 
            v-if="riskScore > 70" 
            class="w-3 h-3 mr-1 text-red-500" 
          />
          <span class="text-xs text-gray-500">{{ riskScoreLabel }}</span>
        </div>
      </div>

      <!-- Engagement Frequency -->
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="text-xl font-bold text-gray-900 mb-1">
          {{ engagementFrequency }}
        </div>
        <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Per Month</p>
        <div class="flex items-center justify-center mt-1">
          <TrendIcon :trend="frequencyTrend" class="w-3 h-3 mr-1" />
          <span class="text-xs text-gray-500">{{ frequencyTrendLabel }}</span>
        </div>
      </div>

      <!-- Response Time -->
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="text-xl font-bold text-gray-900 mb-1">
          {{ averageResponseTime }}h
        </div>
        <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Avg Response</p>
        <div class="flex items-center justify-center mt-1">
          <ClockIcon class="w-3 h-3 mr-1 text-gray-400" />
          <span class="text-xs text-gray-500">{{ responseQualityLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Relationship Status -->
    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <HeartIcon class="w-5 h-5" :class="relationshipStatusColor" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">{{ relationshipStatusLabel }}</p>
          <p class="text-xs text-gray-600">{{ partnershipDepthLabel }} • {{ relationshipMaturityLabel }}</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <div v-if="daysSinceLastInteraction !== null" class="text-right">
          <p class="text-xs text-gray-600">Last contact</p>
          <p class="text-sm font-medium" :class="lastContactColorClass">
            {{ daysSinceLastInteraction }} days ago
          </p>
        </div>
      </div>
    </div>

    <!-- Risk Factors & Opportunities -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <!-- Risk Factors -->
      <div v-if="criticalRiskFactors.length > 0" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center mb-2">
          <AlertTriangleIcon class="w-4 h-4 text-red-500 mr-2" />
          <h4 class="text-sm font-medium text-red-900">Critical Risks</h4>
        </div>
        <div class="space-y-1">
          <div 
            v-for="risk in criticalRiskFactors.slice(0, 2)" 
            :key="risk.factor_type"
            class="text-xs text-red-800"
          >
            {{ risk.description }}
          </div>
          <button 
            v-if="criticalRiskFactors.length > 2"
            @click="$emit('viewRisks')"
            class="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            +{{ criticalRiskFactors.length - 2 }} more risks
          </button>
        </div>
      </div>

      <!-- Growth Opportunities -->
      <div v-if="growthOpportunities.length > 0" class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center mb-2">
          <TrendingUpIcon class="w-4 h-4 text-green-500 mr-2" />
          <h4 class="text-sm font-medium text-green-900">Growth Opportunities</h4>
        </div>
        <div class="space-y-1">
          <div 
            v-for="opportunity in growthOpportunities.slice(0, 2)" 
            :key="opportunity.opportunity_type"
            class="text-xs text-green-800"
          >
            {{ opportunity.opportunity_type.replace('_', ' ') }} ({{ opportunity.confidence }}% confidence)
          </div>
          <button 
            v-if="growthOpportunities.length > 2"
            @click="$emit('viewOpportunities')"
            class="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            +{{ growthOpportunities.length - 2 }} more opportunities
          </button>
        </div>
      </div>
    </div>

    <!-- Action Items -->
    <div v-if="nextBestActions.length > 0" class="border-t border-gray-200 pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-900">Next Best Actions</h4>
        <button 
          @click="$emit('viewActions')"
          class="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>
      </div>
      
      <div class="space-y-2">
        <div 
          v-for="action in nextBestActions.slice(0, 2)" 
          :key="action.action_type"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <ActionIcon 
              :actionType="action.action_type" 
              class="w-4 h-4 text-gray-500" 
            />
            <div>
              <p class="text-sm font-medium text-gray-900">{{ action.objective }}</p>
              <p class="text-xs text-gray-600">{{ action.suggested_timing }}</p>
            </div>
          </div>
          
          <div class="flex items-center">
            <PriorityBadge :priority="action.priority" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div 
      v-if="isRefreshing" 
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg"
    >
      <div class="flex items-center space-x-2">
        <RefreshIcon class="w-5 h-5 animate-spin text-blue-600" />
        <span class="text-sm text-gray-600">Refreshing analytics...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PrincipalEngagementAnalytics } from '../../../types/engagement.types'
import TrendIcon from '../atomic/TrendIcon.vue'
import PriorityBadge from '../atomic/PriorityBadge.vue'
import ActionIcon from '../atomic/ActionIcon.vue'

// Icons (you can replace with your preferred icon library)
import {
  BarChartIcon,
  RefreshIcon,
  HeartIcon,
  ClockIcon,
  WarningIcon,
  AlertTriangleIcon,
  TrendingUpIcon
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  analytics: PrincipalEngagementAnalytics
}>()

// Emits
defineEmits<{
  viewDetails: []
  viewRisks: []
  viewOpportunities: []
  viewActions: []
  refresh: []
}>()

// Local state
const isRefreshing = ref(false)

// Computed properties for display values
const principalName = computed(() => props.analytics.principal_name)
const distributorCount = computed(() => props.analytics.distributor_count)
const totalInteractions = computed(() => props.analytics.total_interactions)

const healthScore = computed(() => props.analytics.relationship_health.overall_health_score)
const healthTrend = computed(() => props.analytics.relationship_health.health_trend)
const riskScore = computed(() => props.analytics.risk_score)

const engagementFrequency = computed(() => 
  props.analytics.engagement_patterns.interaction_frequency.current_frequency
)
const frequencyTrend = computed(() => 
  props.analytics.engagement_patterns.interaction_frequency.frequency_trend
)

const averageResponseTime = computed(() => 
  props.analytics.engagement_patterns.response_time_patterns.average_response_time_hours
)

const daysSinceLastInteraction = computed(() => props.analytics.days_since_last_interaction)

const criticalRiskFactors = computed(() => 
  props.analytics.relationship_risk_factors.filter(risk => 
    risk.severity === 'critical' || risk.severity === 'high'
  )
)

const growthOpportunities = computed(() => 
  props.analytics.engagement_patterns.growth_opportunity_indicators.filter(opp => 
    opp.confidence > 70
  )
)

const nextBestActions = computed(() => 
  // This would come from the store in a real implementation
  []
)

// Computed styling classes
const healthScoreColorClass = computed(() => {
  const score = healthScore.value
  if (score >= 90) return 'bg-green-500 text-white'
  if (score >= 75) return 'bg-blue-500 text-white'
  if (score >= 60) return 'bg-yellow-500 text-white'
  if (score >= 40) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
})

const riskScoreColorClass = computed(() => {
  const score = riskScore.value
  if (score >= 80) return 'bg-red-500 text-white'
  if (score >= 60) return 'bg-orange-500 text-white'
  if (score >= 40) return 'bg-yellow-500 text-white'
  return 'bg-green-500 text-white'
})

const lastContactColorClass = computed(() => {
  const days = daysSinceLastInteraction.value
  if (days === null) return 'text-gray-500'
  if (days > 60) return 'text-red-600'
  if (days > 30) return 'text-orange-600'
  if (days > 14) return 'text-yellow-600'
  return 'text-green-600'
})

const relationshipStatusColor = computed(() => {
  const trustLevel = props.analytics.relationship_health.trust_level
  if (trustLevel === 'high') return 'text-green-500'
  if (trustLevel === 'medium') return 'text-yellow-500'
  return 'text-red-500'
})

// Computed labels
const healthTrendLabel = computed(() => {
  const trend = healthTrend.value
  return trend.charAt(0).toUpperCase() + trend.slice(1)
})

const riskScoreLabel = computed(() => {
  const score = riskScore.value
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
})

const frequencyTrendLabel = computed(() => {
  const trend = frequencyTrend.value
  return trend.charAt(0).toUpperCase() + trend.slice(1)
})

const responseQualityLabel = computed(() => {
  const hours = averageResponseTime.value
  if (hours <= 4) return 'Excellent'
  if (hours <= 24) return 'Good'
  if (hours <= 48) return 'Fair'
  return 'Slow'
})

const relationshipStatusLabel = computed(() => {
  const trustLevel = props.analytics.relationship_health.trust_level
  return `${trustLevel.charAt(0).toUpperCase()}${trustLevel.slice(1)} Trust Level`
})

const partnershipDepthLabel = computed(() => {
  const depth = props.analytics.relationship_health.partnership_depth
  return depth.charAt(0).toUpperCase() + depth.slice(1)
})

const relationshipMaturityLabel = computed(() => {
  const maturity = props.analytics.relationship_health.relationship_maturity
  return maturity.charAt(0).toUpperCase() + maturity.slice(1)
})

// Methods
const refreshAnalytics = async () => {
  isRefreshing.value = true
  try {
    // Emit refresh event to parent
    // In a real implementation, this would call the store
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  } finally {
    isRefreshing.value = false
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>