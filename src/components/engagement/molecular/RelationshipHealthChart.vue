<!--
  Relationship Health Chart
  
  Molecular component that visualizes relationship health components
  Shows breakdown of health scores with trends and improvement recommendations
-->
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Relationship Health</h3>
        <p class="text-sm text-gray-500">Component breakdown and trends</p>
      </div>
      
      <!-- Overall Health Score -->
      <div class="text-center">
        <div 
          class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2"
          :class="overallHealthColorClass"
        >
          {{ healthMetrics.overall_health_score }}
        </div>
        <p class="text-xs font-medium text-gray-600">Overall Score</p>
      </div>
    </div>

    <!-- Health Components -->
    <div class="space-y-4 mb-6">
      <!-- Communication Health -->
      <div class="health-component">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <MessageCircleIcon class="w-4 h-4 text-blue-500" />
            <span class="text-sm font-medium text-gray-900">Communication</span>
            <span class="text-xs text-gray-500">({{ Math.round(healthMetrics.communication_health.weight * 100) }}% weight)</span>
          </div>
          <div class="flex items-center space-x-2">
            <TrendIcon :trend="healthMetrics.communication_health.trend" class="w-3 h-3" />
            <span class="text-sm font-semibold text-gray-900">{{ healthMetrics.communication_health.score }}</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="getHealthBarColor(healthMetrics.communication_health.score)"
              :style="{ width: `${healthMetrics.communication_health.score}%` }"
            ></div>
          </div>
          <button 
            @click="showCommunicationDetails = !showCommunicationDetails"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {{ showCommunicationDetails ? 'Hide' : 'Details' }}
          </button>
        </div>
        
        <!-- Expandable Details -->
        <div v-if="showCommunicationDetails" class="mt-3 p-3 bg-gray-50 rounded-lg">
          <div class="space-y-1">
            <p class="text-xs font-medium text-gray-700">Key Indicators:</p>
            <ul class="text-xs text-gray-600 space-y-1">
              <li v-for="indicator in healthMetrics.communication_health.key_indicators" :key="indicator">
                • {{ indicator }}
              </li>
            </ul>
          </div>
          <div v-if="healthMetrics.communication_health.improvement_potential > 20" class="mt-2 pt-2 border-t border-gray-200">
            <p class="text-xs text-orange-600">
              <span class="font-medium">{{ healthMetrics.communication_health.improvement_potential }}% improvement potential</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Response Health -->
      <div class="health-component">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <ReplyIcon class="w-4 h-4 text-green-500" />
            <span class="text-sm font-medium text-gray-900">Response Quality</span>
            <span class="text-xs text-gray-500">({{ Math.round(healthMetrics.response_health.weight * 100) }}% weight)</span>
          </div>
          <div class="flex items-center space-x-2">
            <TrendIcon :trend="healthMetrics.response_health.trend" class="w-3 h-3" />
            <span class="text-sm font-semibold text-gray-900">{{ healthMetrics.response_health.score }}</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="getHealthBarColor(healthMetrics.response_health.score)"
              :style="{ width: `${healthMetrics.response_health.score}%` }"
            ></div>
          </div>
          <button 
            @click="showResponseDetails = !showResponseDetails"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {{ showResponseDetails ? 'Hide' : 'Details' }}
          </button>
        </div>
        
        <!-- Expandable Details -->
        <div v-if="showResponseDetails" class="mt-3 p-3 bg-gray-50 rounded-lg">
          <div class="space-y-1">
            <p class="text-xs font-medium text-gray-700">Key Indicators:</p>
            <ul class="text-xs text-gray-600 space-y-1">
              <li v-for="indicator in healthMetrics.response_health.key_indicators" :key="indicator">
                • {{ indicator }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Engagement Depth Health -->
      <div class="health-component">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <DepthIcon class="w-4 h-4 text-purple-500" />
            <span class="text-sm font-medium text-gray-900">Engagement Depth</span>
            <span class="text-xs text-gray-500">({{ Math.round(healthMetrics.engagement_depth_health.weight * 100) }}% weight)</span>
          </div>
          <div class="flex items-center space-x-2">
            <TrendIcon :trend="healthMetrics.engagement_depth_health.trend" class="w-3 h-3" />
            <span class="text-sm font-semibold text-gray-900">{{ healthMetrics.engagement_depth_health.score }}</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="getHealthBarColor(healthMetrics.engagement_depth_health.score)"
              :style="{ width: `${healthMetrics.engagement_depth_health.score}%` }"
            ></div>
          </div>
          <button 
            @click="showDepthDetails = !showDepthDetails"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {{ showDepthDetails ? 'Hide' : 'Details' }}
          </button>
        </div>
        
        <!-- Expandable Details -->
        <div v-if="showDepthDetails" class="mt-3 p-3 bg-gray-50 rounded-lg">
          <div class="space-y-1">
            <p class="text-xs font-medium text-gray-700">Key Indicators:</p>
            <ul class="text-xs text-gray-600 space-y-1">
              <li v-for="indicator in healthMetrics.engagement_depth_health.key_indicators" :key="indicator">
                • {{ indicator }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Consistency Health -->
      <div class="health-component">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <CalendarIcon class="w-4 h-4 text-orange-500" />
            <span class="text-sm font-medium text-gray-900">Consistency</span>
            <span class="text-xs text-gray-500">({{ Math.round(healthMetrics.consistency_health.weight * 100) }}% weight)</span>
          </div>
          <div class="flex items-center space-x-2">
            <TrendIcon :trend="healthMetrics.consistency_health.trend" class="w-3 h-3" />
            <span class="text-sm font-semibold text-gray-900">{{ healthMetrics.consistency_health.score }}</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="getHealthBarColor(healthMetrics.consistency_health.score)"
              :style="{ width: `${healthMetrics.consistency_health.score}%` }"
            ></div>
          </div>
          <button 
            @click="showConsistencyDetails = !showConsistencyDetails"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {{ showConsistencyDetails ? 'Hide' : 'Details' }}
          </button>
        </div>
        
        <!-- Expandable Details -->
        <div v-if="showConsistencyDetails" class="mt-3 p-3 bg-gray-50 rounded-lg">
          <div class="space-y-1">
            <p class="text-xs font-medium text-gray-700">Key Indicators:</p>
            <ul class="text-xs text-gray-600 space-y-1">
              <li v-for="indicator in healthMetrics.consistency_health.key_indicators" :key="indicator">
                • {{ indicator }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Relationship Attributes -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
      <!-- Trust Level -->
      <div class="text-center">
        <div class="flex items-center justify-center mb-2">
          <ShieldCheckIcon 
            class="w-6 h-6"
            :class="getTrustLevelColor(healthMetrics.trust_level)"
          />
        </div>
        <p class="text-sm font-medium text-gray-900">{{ getTrustLevelLabel(healthMetrics.trust_level) }}</p>
        <p class="text-xs text-gray-600">Trust Level</p>
      </div>

      <!-- Partnership Depth -->
      <div class="text-center">
        <div class="flex items-center justify-center mb-2">
          <HandshakeIcon 
            class="w-6 h-6"
            :class="getPartnershipDepthColor(healthMetrics.partnership_depth)"
          />
        </div>
        <p class="text-sm font-medium text-gray-900">{{ getPartnershipDepthLabel(healthMetrics.partnership_depth) }}</p>
        <p class="text-xs text-gray-600">Partnership Depth</p>
      </div>

      <!-- Relationship Maturity -->
      <div class="text-center">
        <div class="flex items-center justify-center mb-2">
          <ClockIcon 
            class="w-6 h-6"
            :class="getMaturityColor(healthMetrics.relationship_maturity)"
          />
        </div>
        <p class="text-sm font-medium text-gray-900">{{ getMaturityLabel(healthMetrics.relationship_maturity) }}</p>
        <p class="text-xs text-gray-600">Maturity Stage</p>
      </div>
    </div>

    <!-- Improvement Recommendations -->
    <div v-if="healthMetrics.improvement_recommendations.length > 0" class="border-t border-gray-200 pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-900">Improvement Recommendations</h4>
        <button 
          @click="showAllRecommendations = !showAllRecommendations"
          class="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {{ showAllRecommendations ? 'Show Less' : 'Show All' }}
        </button>
      </div>
      
      <div class="space-y-3">
        <div 
          v-for="(recommendation, index) in displayedRecommendations" 
          :key="index"
          class="p-3 border border-gray-200 rounded-lg"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <PriorityBadge :priority="recommendation.priority" />
                <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">{{ recommendation.category }}</span>
              </div>
              <p class="text-sm font-medium text-gray-900">{{ recommendation.recommendation }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-xs text-gray-600 mt-2">
            <div>
              <p class="font-medium">Expected Impact:</p>
              <p>{{ recommendation.expected_impact }}/100</p>
            </div>
            <div>
              <p class="font-medium">Effort Required:</p>
              <p class="capitalize">{{ recommendation.effort_required }}</p>
            </div>
          </div>
          
          <div class="mt-2 text-xs text-gray-600">
            <p class="font-medium">Timeline:</p>
            <p>{{ recommendation.timeline }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Warning and Positive Indicators -->
    <div v-if="healthMetrics.warning_flags.length > 0 || healthMetrics.positive_indicators.length > 0" class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Warning Flags -->
      <div v-if="healthMetrics.warning_flags.length > 0" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center mb-2">
          <AlertTriangleIcon class="w-4 h-4 text-red-500 mr-2" />
          <h4 class="text-sm font-medium text-red-900">Warning Flags</h4>
        </div>
        <div class="space-y-2">
          <div 
            v-for="flag in healthMetrics.warning_flags.slice(0, 3)" 
            :key="flag.flag_type"
            class="text-xs text-red-800"
          >
            <span class="font-medium">{{ flag.flag_type.replace('_', ' ') }}:</span>
            {{ flag.description }}
          </div>
        </div>
      </div>

      <!-- Positive Indicators -->
      <div v-if="healthMetrics.positive_indicators.length > 0" class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center mb-2">
          <CheckCircleIcon class="w-4 h-4 text-green-500 mr-2" />
          <h4 class="text-sm font-medium text-green-900">Positive Indicators</h4>
        </div>
        <div class="space-y-2">
          <div 
            v-for="indicator in healthMetrics.positive_indicators.slice(0, 3)" 
            :key="indicator.indicator_type"
            class="text-xs text-green-800"
          >
            <span class="font-medium">{{ indicator.indicator_type.replace('_', ' ') }}:</span>
            {{ indicator.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Health Percentile -->
    <div class="mt-4 text-center p-3 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-600">
        This relationship scores in the 
        <span class="font-semibold text-gray-900">{{ healthMetrics.health_percentile }}th percentile</span>
        compared to similar partnerships
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RelationshipHealthMetrics } from '../../../types/engagement.types'
import TrendIcon from '../atomic/TrendIcon.vue'
import PriorityBadge from '../atomic/PriorityBadge.vue'

// Icons
import {
  MessageCircleIcon,
  ReplyIcon,
  CalendarIcon,
  ShieldCheckIcon,
  HandshakeIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  LayersIcon as DepthIcon
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  healthMetrics: RelationshipHealthMetrics
}>()

// Local state
const showCommunicationDetails = ref(false)
const showResponseDetails = ref(false)
const showDepthDetails = ref(false)
const showConsistencyDetails = ref(false)
const showAllRecommendations = ref(false)

// Computed properties
const overallHealthColorClass = computed(() => {
  const score = props.healthMetrics.overall_health_score
  if (score >= 90) return 'bg-green-500 text-white'
  if (score >= 75) return 'bg-blue-500 text-white'
  if (score >= 60) return 'bg-yellow-500 text-white'
  if (score >= 40) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
})

const displayedRecommendations = computed(() => {
  return showAllRecommendations.value 
    ? props.healthMetrics.improvement_recommendations
    : props.healthMetrics.improvement_recommendations.slice(0, 3)
})

// Methods
const getHealthBarColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

const getTrustLevelColor = (level: string): string => {
  if (level === 'high') return 'text-green-500'
  if (level === 'medium') return 'text-yellow-500'
  return 'text-red-500'
}

const getTrustLevelLabel = (level: string): string => {
  return level.charAt(0).toUpperCase() + level.slice(1) + ' Trust'
}

const getPartnershipDepthColor = (depth: string): string => {
  if (depth === 'strategic') return 'text-purple-500'
  if (depth === 'transactional') return 'text-blue-500'
  return 'text-gray-500'
}

const getPartnershipDepthLabel = (depth: string): string => {
  return depth.charAt(0).toUpperCase() + depth.slice(1)
}

const getMaturityColor = (maturity: string): string => {
  if (maturity === 'mature') return 'text-green-500'
  if (maturity === 'established') return 'text-blue-500'
  if (maturity === 'developing') return 'text-yellow-500'
  return 'text-gray-500'
}

const getMaturityLabel = (maturity: string): string => {
  return maturity.charAt(0).toUpperCase() + maturity.slice(1)
}
</script>

<style scoped>
.health-component {
  @apply p-3 border border-gray-100 rounded-lg;
}

.health-component:hover {
  @apply border-gray-200 bg-gray-50;
}
</style>