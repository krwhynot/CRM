<!--
  Principal Health Card - Core dashboard component showing relationship health
  
  Features:
  - Relationship health score with visual indicators
  - Key activity metrics
  - Trend analysis
  - Quick action buttons
  - Responsive layout
-->
<template>
  <div 
    :class="[
      'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
      'hover:shadow-md hover:border-gray-300 transition-all duration-200',
      'group cursor-pointer'
    ]"
    @click="$emit('click')"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <!-- Principal Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-3 mb-2">
          <!-- Avatar/Icon -->
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
            {{ principalInitials }}
          </div>
          
          <!-- Name & Type -->
          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
              {{ principal.name }}
            </h3>
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <span>Principal</span>
              <span v-if="principal.industry" class="text-gray-300">•</span>
              <span v-if="principal.industry">{{ principal.industry }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Health Score Badge -->
      <HealthScoreBadge
        :score="healthScore.overall_score"
        :health-status="healthScore.health_status"
        :trending="healthScore.trending"
        :engagement-score="healthScore.engagement_score"
        :response-score="healthScore.response_quality_score"
        :progression-score="healthScore.progression_score"
        :recency-score="healthScore.recency_score"
        :risk-factors="healthScore.risk_factors"
        :strengths="healthScore.strengths"
      />
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <!-- Interactions -->
      <ActivityMetric
        label="Interactions (30d)"
        :value="activitySummary.interactions_last_30_days"
        icon="check"
        type="count"
        :trend="getInteractionTrend()"
        :performance-level="getInteractionPerformanceLevel()"
      />

      <!-- Response Rate -->
      <ActivityMetric
        label="Response Rate"
        :value="Math.round(activitySummary.response_rate * 100)"
        icon="target"
        type="percentage"
        :performance-level="getResponseRatePerformanceLevel()"
      />

      <!-- Active Opportunities -->
      <ActivityMetric
        label="Active Opportunities"
        :value="keyMetrics.active_opportunities"
        icon="target"
        type="count"
        :performance-level="getOpportunityPerformanceLevel()"
      />

      <!-- Distributors -->
      <ActivityMetric
        label="Distributors"
        :value="keyMetrics.distributor_count"
        icon="users"
        type="count"
        :performance-level="getDistributorPerformanceLevel()"
      />
    </div>

    <!-- Engagement Summary -->
    <div class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-4">
      <div class="flex items-center space-x-3">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <span class="text-sm font-medium text-gray-700">Engagement Level</span>
      </div>
      <div class="flex items-center space-x-2">
        <span :class="[
          'px-2 py-1 text-xs font-medium rounded-full',
          getEngagementLevelClasses()
        ]">
          {{ activitySummary.engagement_frequency.toUpperCase() }}
        </span>
        <span class="text-sm text-gray-500">
          {{ getLastInteractionText() }}
        </span>
      </div>
    </div>

    <!-- Communication Channels -->
    <div class="space-y-2 mb-4">
      <div class="text-sm font-medium text-gray-700 mb-2">Communication Mix</div>
      <div class="flex space-x-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          v-for="channel in activitySummary.communication_channels"
          :key="channel.type"
          :class="getChannelColor(channel.type)"
          :style="{ width: `${channel.percentage}%` }"
          class="h-full transition-all duration-300"
          :title="`${channel.type}: ${channel.count} (${channel.percentage}%)`"
        ></div>
      </div>
      <div class="flex flex-wrap gap-2 text-xs text-gray-600">
        <span 
          v-for="channel in activitySummary.communication_channels.slice(0, 3)"
          :key="channel.type"
          class="flex items-center space-x-1"
        >
          <div :class="['w-2 h-2 rounded-full', getChannelColor(channel.type)]"></div>
          <span>{{ formatChannelType(channel.type) }} ({{ channel.count }})</span>
        </span>
      </div>
    </div>

    <!-- Risk Indicators -->
    <div v-if="healthScore.risk_factors.length > 0" class="mb-4">
      <div class="flex items-center space-x-2 mb-2">
        <div class="w-4 h-4 text-orange-500">⚠️</div>
        <span class="text-sm font-medium text-orange-700">Attention Needed</span>
      </div>
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="risk in healthScore.risk_factors.slice(0, 2)"
          :key="risk"
          class="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full"
        >
          {{ risk }}
        </span>
        <span 
          v-if="healthScore.risk_factors.length > 2"
          class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
        >
          +{{ healthScore.risk_factors.length - 2 }} more
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex space-x-2 pt-4 border-t border-gray-100">
      <button
        class="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        @click.stop="$emit('view-details')"
      >
        View Details
      </button>
      <button
        class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        @click.stop="$emit('schedule-interaction')"
      >
        Schedule Call
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HealthScoreBadge from '../atomic/HealthScoreBadge.vue'
import ActivityMetric from '../atomic/ActivityMetric.vue'
import type { PrincipalOverviewCard } from '@/stores/dashboardStore'

interface Props {
  principal: PrincipalOverviewCard['principal']
  healthScore: PrincipalOverviewCard['health_score']
  activitySummary: PrincipalOverviewCard['activity_summary']
  keyMetrics: PrincipalOverviewCard['key_metrics']
}

const props = defineProps<Props>()

defineEmits<{
  click: []
  'view-details': []
  'schedule-interaction': []
}>()

// Computed properties
const principalInitials = computed(() => {
  return props.principal.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

// Performance level calculations
function getInteractionPerformanceLevel() {
  const count = props.activitySummary.interactions_last_30_days
  return count >= 8 ? 'excellent' : count >= 5 ? 'good' : count >= 2 ? 'fair' : 'poor'
}

function getResponseRatePerformanceLevel() {
  const rate = props.activitySummary.response_rate
  return rate >= 0.9 ? 'excellent' : rate >= 0.7 ? 'good' : rate >= 0.5 ? 'fair' : 'poor'
}

function getOpportunityPerformanceLevel() {
  const count = props.keyMetrics.active_opportunities
  return count >= 5 ? 'excellent' : count >= 3 ? 'good' : count >= 1 ? 'fair' : 'poor'
}

function getDistributorPerformanceLevel() {
  const count = props.keyMetrics.distributor_count
  return count >= 10 ? 'excellent' : count >= 5 ? 'good' : count >= 2 ? 'fair' : 'poor'
}

function getInteractionTrend() {
  // This would be calculated based on historical data
  return props.healthScore.trending === 'up' ? 'up' : 
         props.healthScore.trending === 'down' ? 'down' : 'stable'
}

function getEngagementLevelClasses() {
  const level = props.activitySummary.engagement_frequency
  switch (level) {
    case 'high':
      return 'bg-green-100 text-green-700'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700'
    case 'low':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getLastInteractionText() {
  const days = props.healthScore.days_since_interaction
  if (!days) return 'No recent activity'
  
  if (days <= 1) return 'Today'
  if (days <= 7) return `${days}d ago`
  if (days <= 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}m ago`
}

function getChannelColor(channelType: string) {
  const colors = {
    call: 'bg-blue-500',
    email: 'bg-green-500', 
    meeting: 'bg-purple-500',
    demo: 'bg-orange-500',
    other: 'bg-gray-400'
  }
  return colors[channelType as keyof typeof colors] || colors.other
}

function formatChannelType(type: string) {
  const formatted = {
    call: 'Calls',
    email: 'Emails',
    meeting: 'Meetings', 
    demo: 'Demos',
    other: 'Other'
  }
  return formatted[type as keyof typeof formatted] || type
}
</script>