<!--
  Principal Dashboard - Main dashboard component with health-focused analytics
  
  Features:
  - Health score overview metrics
  - Principal health cards grid
  - Activity feed with aggregation
  - Filtering and search
  - Real-time updates
  - Responsive layout
-->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Title -->
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Principal Relationships</h1>
            <div v-if="lastUpdated" class="text-sm text-gray-500">
              Last updated {{ formatLastUpdated(lastUpdated) }}
            </div>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center space-x-4">
            <!-- Refresh Button -->
            <button
              :disabled="isLoading"
              @click="handleRefresh"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              <div v-if="isLoading" class="animate-spin w-4 h-4 mr-2">⟳</div>
              <div v-else class="w-4 h-4 mr-2">🔄</div>
              Refresh
            </button>

            <!-- Time Range Selector -->
            <select
              v-model="selectedTimeRange"
              @change="handleTimeRangeChange"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
              <option value="ytd">Year to date</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Overview Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Principals -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Principals</p>
              <p class="text-3xl font-bold text-gray-900">{{ overallMetrics.total_principals }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <div class="text-blue-600 text-xl">🏢</div>
            </div>
          </div>
        </div>

        <!-- Average Health Score -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Avg Health Score</p>
              <p class="text-3xl font-bold text-gray-900">{{ averageHealthScore }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div class="text-green-600 text-xl">💚</div>
            </div>
          </div>
          <div class="mt-2 flex items-center text-sm">
            <div :class="[
              'mr-1',
              trendingPrincipals.up.length > trendingPrincipals.down.length 
                ? 'text-green-600' 
                : 'text-red-600'
            ]">
              {{ trendingPrincipals.up.length > trendingPrincipals.down.length ? '↗️' : '↘️' }}
            </div>
            <span class="text-gray-600">
              {{ trendingPrincipals.up.length }} trending up, {{ trendingPrincipals.down.length }} down
            </span>
          </div>
        </div>

        <!-- At-Risk Relationships -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">At Risk</p>
              <p class="text-3xl font-bold text-orange-600">{{ atRiskPrincipals.length }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <div class="text-orange-600 text-xl">⚠️</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            Require immediate attention
          </div>
        </div>

        <!-- Health Distribution -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="mb-4">
            <p class="text-sm font-medium text-gray-600">Health Distribution</p>
          </div>
          <div class="space-y-2">
            <div v-for="(count, status) in healthScoreDistribution" :key="status" class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div :class="['w-3 h-3 rounded-full', getHealthStatusColor(status)]"></div>
                <span class="text-sm capitalize text-gray-600">{{ status }}</span>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Health Analytics Chart -->
      <div class="mb-8">
        <HealthAnalyticsChart />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Principal Health Cards -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Principal Relationships</h2>
            
            <!-- Filters -->
            <div class="flex items-center space-x-3">
              <!-- Health Status Filter -->
              <select
                v-model="selectedHealthFilter"
                @change="handleHealthFilterChange"
                class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Health Levels</option>
                <option value="critical">Critical</option>
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>

              <!-- Sort By -->
              <select
                v-model="selectedSort"
                @change="handleSortChange"
                class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="health_score">Health Score</option>
                <option value="name">Name</option>
                <option value="last_interaction">Last Interaction</option>
                <option value="opportunities">Opportunities</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  <div class="flex-1">
                    <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div v-for="j in 4" :key="j" class="h-12 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Principal Cards Grid -->
          <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PrincipalHealthCard
              v-for="card in filteredAndSortedCards"
              :key="card.principal.id"
              :principal="card.principal"
              :health-score="card.health_score"
              :activity-summary="card.activity_summary"
              :key-metrics="card.key_metrics"
              @click="handleCardClick(card.principal.id)"
              @view-details="handleViewDetails(card.principal.id)"
              @schedule-interaction="handleScheduleInteraction(card.principal.id)"
            />
          </div>

          <!-- Empty State -->
          <div v-if="!isLoading && filteredAndSortedCards.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🤝</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No principals found</h3>
            <p class="text-gray-600 mb-4">Try adjusting your filters or check back later.</p>
            <button
              @click="handleRefresh"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        <!-- Activity Feed Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p class="text-sm text-gray-600 mt-1">Principal-focused activity stream</p>
            </div>
            
            <div class="max-h-[600px] overflow-y-auto">
              <div v-if="activityFeed.length === 0" class="p-6 text-center text-gray-500">
                <div class="text-4xl mb-2">📋</div>
                <p>No recent activity</p>
              </div>
              
              <div v-else class="p-4 space-y-2">
                <ActivityFeedItem
                  v-for="(activity, index) in activityFeed"
                  :key="activity.id"
                  :activity="activity"
                  :show-connector="index < activityFeed.length - 1"
                  @click="handleActivityClick(activity)"
                  @schedule-follow-up="handleScheduleFollowUpFromActivity(activity)"
                  @view-details="handleViewActivityDetails(activity)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import PrincipalHealthCard from '../molecular/PrincipalHealthCard.vue'
import ActivityFeedItem from '../molecular/ActivityFeedItem.vue'
import HealthAnalyticsChart from '../molecular/HealthAnalyticsChart.vue'
import type { ActivityFeedItem as ActivityFeedItemType } from '@/types/interactions.types'

// Store
const dashboardStore = useDashboardStore()

// Local state
const selectedTimeRange = ref('30d')
const selectedHealthFilter = ref('')
const selectedSort = ref('health_score')

// Computed properties from store
const {
  isLoading,
  principalOverviewCards,
  activityFeed,
  overallMetrics,
  healthScoreDistribution,
  averageHealthScore,
  atRiskPrincipals,
  trendingPrincipals,
  lastUpdated
} = dashboardStore

// Filtered and sorted data
const filteredAndSortedCards = computed(() => {
  let cards = [...principalOverviewCards]

  // Apply health filter
  if (selectedHealthFilter.value) {
    cards = cards.filter(card => card.health_score.health_status === selectedHealthFilter.value)
  }

  // Apply sorting
  cards.sort((a, b) => {
    switch (selectedSort.value) {
      case 'name':
        return a.principal.name.localeCompare(b.principal.name)
      case 'last_interaction':
        const aDate = new Date(a.health_score.last_interaction_date || 0)
        const bDate = new Date(b.health_score.last_interaction_date || 0)
        return bDate.getTime() - aDate.getTime()
      case 'opportunities':
        return b.key_metrics.active_opportunities - a.key_metrics.active_opportunities
      case 'health_score':
      default:
        return b.health_score.overall_score - a.health_score.overall_score
    }
  })

  return cards
})

// Methods
async function handleRefresh() {
  await dashboardStore.refresh()
}

function handleTimeRangeChange() {
  dashboardStore.setDateRangePreset(selectedTimeRange.value as any)
}

function handleHealthFilterChange() {
  // Filtering is handled by computed property
}

function handleSortChange() {
  // Sorting is handled by computed property
}

function handleCardClick(principalId: string) {
  // Navigate to principal detail view
  console.log('Navigate to principal:', principalId)
}

function handleViewDetails(principalId: string) {
  // Open principal details modal/page
  console.log('View details for principal:', principalId)
}

function handleScheduleInteraction(principalId: string) {
  // Open interaction scheduling modal
  console.log('Schedule interaction for principal:', principalId)
}

function handleActivityClick(activity: ActivityFeedItemType) {
  // Handle activity item click
  console.log('Activity clicked:', activity)
}

function handleScheduleFollowUpFromActivity(activity: ActivityFeedItemType) {
  // Schedule follow-up from activity
  console.log('Schedule follow-up from activity:', activity)
}

function handleViewActivityDetails(activity: ActivityFeedItemType) {
  // View activity details
  console.log('View activity details:', activity)
}

function getHealthStatusColor(status: string) {
  const colors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-orange-500',
    critical: 'bg-red-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-400'
}

function formatLastUpdated(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  dashboardStore.loadDashboardData()
})
</script>