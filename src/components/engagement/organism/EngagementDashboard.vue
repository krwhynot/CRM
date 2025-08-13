<!--
  Engagement Dashboard
  
  Organism component that provides comprehensive engagement analytics dashboard
  Shows principal engagement patterns, relationship health, and actionable insights
-->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Engagement Analytics</h1>
            <p class="text-sm text-gray-600 mt-1">
              Relationship health and engagement patterns across all principals
            </p>
          </div>
          
          <!-- Controls -->
          <div class="flex items-center space-x-4">
            <!-- Timeframe Selector -->
            <select 
              v-model="selectedTimeframe"
              @change="handleTimeframeChange"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="last_year">Last Year</option>
              <option value="all_time">All Time</option>
            </select>

            <!-- View Mode Toggle -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'overview'"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  viewMode === 'overview' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                Overview
              </button>
              <button
                @click="viewMode = 'detailed'"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  viewMode === 'detailed' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                Detailed
              </button>
            </div>

            <!-- Refresh Button -->
            <button
              @click="refreshAll"
              :disabled="isLoadingAll"
              class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshIcon class="w-4 h-4" :class="{ 'animate-spin': isLoadingAll }" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingAll && allEngagements.length === 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-center h-64">
        <div class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="text-gray-600">Loading engagement analytics...</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Summary Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Principals"
          :value="summaryStatistics.total_principals"
          icon="BuildingIcon"
          :trend="null"
        />
        <StatCard
          title="Avg Health Score"
          :value="summaryStatistics.average_health_score"
          icon="HeartIcon"
          :trend="null"
          :color="getHealthScoreColor(summaryStatistics.average_health_score)"
        />
        <StatCard
          title="High Risk"
          :value="summaryStatistics.high_risk_count"
          icon="AlertTriangleIcon"
          :trend="null"
          color="text-red-500"
        />
        <StatCard
          title="Growth Opportunities"
          :value="summaryStatistics.growth_opportunity_count"
          icon="TrendingUpIcon"
          :trend="null"
          color="text-green-500"
        />
      </div>

      <!-- Health Score Distribution -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Health Score Distribution</h3>
          <HealthScoreDistributionChart :distribution="healthScoreDistribution" />
        </div>
      </div>

      <!-- Alert Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Immediate Attention Required -->
        <div v-if="immediateAttentionPrincipals.length > 0" class="bg-white rounded-lg shadow-sm border-l-4 border-red-500 p-6">
          <div class="flex items-center mb-4">
            <AlertTriangleIcon class="w-5 h-5 text-red-500 mr-2" />
            <h3 class="text-lg font-semibold text-gray-900">Immediate Attention Required</h3>
          </div>
          <div class="space-y-3">
            <div 
              v-for="principal in immediateAttentionPrincipals.slice(0, 3)" 
              :key="principal.principal_id"
              class="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
              @click="viewPrincipalDetails(principal.principal_id)"
            >
              <div>
                <p class="font-medium text-gray-900">{{ principal.principal_name }}</p>
                <p class="text-sm text-red-600">
                  {{ getAttentionReason(principal) }}
                </p>
              </div>
              <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            </div>
            <button 
              v-if="immediateAttentionPrincipals.length > 3"
              @click="showAllImmediateAttention = true"
              class="w-full text-sm text-red-600 hover:text-red-700 font-medium text-center py-2"
            >
              View {{ immediateAttentionPrincipals.length - 3 }} more
            </button>
          </div>
        </div>

        <!-- High Performers -->
        <div v-if="topPerformingPrincipals.length > 0" class="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-6">
          <div class="flex items-center mb-4">
            <TrendingUpIcon class="w-5 h-5 text-green-500 mr-2" />
            <h3 class="text-lg font-semibold text-gray-900">Top Performers</h3>
          </div>
          <div class="space-y-3">
            <div 
              v-for="principal in topPerformingPrincipals.slice(0, 3)" 
              :key="principal.principal_id"
              class="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              @click="viewPrincipalDetails(principal.principal_id)"
            >
              <div>
                <p class="font-medium text-gray-900">{{ principal.principal_name }}</p>
                <p class="text-sm text-green-600">
                  Health Score: {{ principal.relationship_health.overall_health_score }}
                </p>
              </div>
              <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex flex-wrap items-center space-x-4 space-y-2">
            <!-- Search -->
            <div class="flex-1 min-w-64">
              <div class="relative">
                <SearchIcon class="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search principals..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Health Score Filter -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Health Score:</label>
              <select 
                v-model="healthScoreFilter"
                @change="applyFilters"
                class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="excellent">Excellent (90+)</option>
                <option value="good">Good (75-89)</option>
                <option value="average">Average (60-74)</option>
                <option value="poor">Poor (<60)</option>
              </select>
            </div>

            <!-- Risk Filter -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Risk Level:</label>
              <select 
                v-model="riskFilter"
                @change="applyFilters"
                class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="low">Low (0-39)</option>
                <option value="medium">Medium (40-59)</option>
                <option value="high">High (60-79)</option>
                <option value="critical">Critical (80+)</option>
              </select>
            </div>

            <!-- Clear Filters -->
            <button
              @click="clearFilters"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Principal Analytics Cards -->
      <div v-if="viewMode === 'overview'">
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <EngagementAnalyticsCard
            v-for="engagement in filteredEngagements"
            :key="engagement.principal_id"
            :analytics="engagement"
            @view-details="viewPrincipalDetails(engagement.principal_id)"
            @view-risks="showRiskDetails(engagement.principal_id)"
            @view-opportunities="showOpportunityDetails(engagement.principal_id)"
            @view-actions="showActionDetails(engagement.principal_id)"
          />
        </div>

        <!-- Load More -->
        <div v-if="hasMoreResults" class="text-center mt-8">
          <button
            @click="loadMore"
            :disabled="isLoadingMore"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {{ isLoadingMore ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>

      <!-- Detailed View -->
      <div v-else-if="viewMode === 'detailed'">
        <EngagementTableView 
          :engagements="filteredEngagements"
          @view-details="viewPrincipalDetails"
          @view-health="showHealthDetails"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredEngagements.length === 0 && !isLoadingAll" class="text-center py-12">
        <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <SearchIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No principals found</h3>
        <p class="text-gray-600">Try adjusting your search criteria or filters.</p>
      </div>
    </div>

    <!-- Principal Details Modal -->
    <PrincipalDetailsModal 
      v-if="selectedPrincipalId"
      :principal-id="selectedPrincipalId"
      @close="selectedPrincipalId = null"
    />

    <!-- Risk Details Modal -->
    <RiskDetailsModal 
      v-if="showingRiskDetails"
      :principal-id="showingRiskDetails"
      @close="showingRiskDetails = null"
    />

    <!-- Opportunity Details Modal -->
    <OpportunityDetailsModal 
      v-if="showingOpportunityDetails"
      :principal-id="showingOpportunityDetails"
      @close="showingOpportunityDetails = null"
    />

    <!-- Action Details Modal -->
    <ActionDetailsModal 
      v-if="showingActionDetails"
      :principal-id="showingActionDetails"
      @close="showingActionDetails = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useEngagementStore } from '../../../stores/engagementStore'
import EngagementAnalyticsCard from '../molecular/EngagementAnalyticsCard.vue'
import EngagementTableView from './EngagementTableView.vue'
import StatCard from '../atomic/StatCard.vue'
import HealthScoreDistributionChart from '../molecular/HealthScoreDistributionChart.vue'
import PrincipalDetailsModal from '../molecular/PrincipalDetailsModal.vue'
import RiskDetailsModal from '../molecular/RiskDetailsModal.vue'
import OpportunityDetailsModal from '../molecular/OpportunityDetailsModal.vue'
import ActionDetailsModal from '../molecular/ActionDetailsModal.vue'
import type { PrincipalEngagementAnalytics } from '../../../types/engagement.types'

// Icons
import {
  RefreshIcon,
  SearchIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  ChevronRightIcon,
  BuildingIcon,
  HeartIcon
} from 'lucide-vue-next'

// Store
const engagementStore = useEngagementStore()

// Local state
const viewMode = ref<'overview' | 'detailed'>('overview')
const selectedTimeframe = ref<'last_30_days' | 'last_90_days' | 'last_year' | 'all_time'>('last_90_days')
const searchQuery = ref('')
const healthScoreFilter = ref<string>('all')
const riskFilter = ref<string>('all')
const selectedPrincipalId = ref<string | null>(null)
const showingRiskDetails = ref<string | null>(null)
const showingOpportunityDetails = ref<string | null>(null)
const showingActionDetails = ref<string | null>(null)
const showAllImmediateAttention = ref(false)
const isLoadingMore = ref(false)
const displayLimit = ref(12)

// Computed properties from store
const {
  allEngagements,
  isLoadingAll,
  summaryStatistics,
  healthScoreDistribution,
  immediateAttentionPrincipals,
  topPerformingPrincipals,
  highRiskPrincipals,
  growthOpportunityPrincipals
} = engagementStore

// Filtered engagements based on search and filters
const filteredEngagements = computed((): PrincipalEngagementAnalytics[] => {
  let filtered = [...allEngagements]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(engagement =>
      engagement.principal_name.toLowerCase().includes(query)
    )
  }

  // Apply health score filter
  if (healthScoreFilter.value !== 'all') {
    filtered = filtered.filter(engagement => {
      const score = engagement.relationship_health.overall_health_score
      switch (healthScoreFilter.value) {
        case 'excellent': return score >= 90
        case 'good': return score >= 75 && score < 90
        case 'average': return score >= 60 && score < 75
        case 'poor': return score < 60
        default: return true
      }
    })
  }

  // Apply risk filter
  if (riskFilter.value !== 'all') {
    filtered = filtered.filter(engagement => {
      const score = engagement.risk_score
      switch (riskFilter.value) {
        case 'low': return score < 40
        case 'medium': return score >= 40 && score < 60
        case 'high': return score >= 60 && score < 80
        case 'critical': return score >= 80
        default: return true
      }
    })
  }

  // Apply display limit for overview mode
  if (viewMode.value === 'overview') {
    return filtered.slice(0, displayLimit.value)
  }

  return filtered
})

const hasMoreResults = computed(() => {
  if (viewMode.value !== 'overview') return false
  
  // Get total filtered count without display limit
  let totalFiltered = [...allEngagements]
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    totalFiltered = totalFiltered.filter(engagement =>
      engagement.principal_name.toLowerCase().includes(query)
    )
  }
  
  return totalFiltered.length > displayLimit.value
})

// Methods
const refreshAll = async () => {
  await engagementStore.refreshAllEngagements()
}

const handleTimeframeChange = () => {
  // In a real implementation, this would update the timeframe filter
  // and refresh data accordingly
  console.log('Timeframe changed to:', selectedTimeframe.value)
}

const applyFilters = () => {
  // Filters are applied reactively through computed property
}

const clearFilters = () => {
  searchQuery.value = ''
  healthScoreFilter.value = 'all'
  riskFilter.value = 'all'
}

const loadMore = async () => {
  isLoadingMore.value = true
  displayLimit.value += 12
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 500))
  isLoadingMore.value = false
}

const viewPrincipalDetails = (principalId: string) => {
  selectedPrincipalId.value = principalId
}

const showRiskDetails = (principalId: string) => {
  showingRiskDetails.value = principalId
}

const showOpportunityDetails = (principalId: string) => {
  showingOpportunityDetails.value = principalId
}

const showActionDetails = (principalId: string) => {
  showingActionDetails.value = principalId
}

const showHealthDetails = (principalId: string) => {
  // Show health details modal
  console.log('Show health details for:', principalId)
}

const getHealthScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-500'
  if (score >= 75) return 'text-blue-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

const getAttentionReason = (principal: PrincipalEngagementAnalytics): string => {
  if (principal.risk_score >= 80) return 'Critical risk level'
  if (principal.relationship_health.health_trend === 'declining') return 'Health declining'
  if (principal.days_since_last_interaction && principal.days_since_last_interaction > 45) {
    return `No contact for ${principal.days_since_last_interaction} days`
  }
  if (principal.relationship_risk_factors.some(risk => risk.severity === 'critical')) {
    return 'Critical risk factors identified'
  }
  return 'Requires attention'
}

// Lifecycle
onMounted(async () => {
  // Load all engagement data if not already loaded
  if (allEngagements.length === 0) {
    await engagementStore.loadAllPrincipalsEngagement()
  }
})

// Watch for search changes with debounce
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Search is handled reactively by computed property
    displayLimit.value = 12 // Reset display limit when searching
  }, 300)
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>