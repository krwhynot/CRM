<!--
Engagement Analytics Dashboard
Comprehensive dashboard combining all engagement visualizations with interactive drill-down capabilities
-->
<template>
  <div class="engagement-analytics-dashboard">
    <!-- Dashboard Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Engagement Analytics
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ dashboardSubtitle }}
        </p>
      </div>

      <!-- Dashboard Controls -->
      <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
        <!-- Principal Selector -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Principal:
          </label>
          <select
            v-model="selectedPrincipalId"
            @change="handlePrincipalChange"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Principals</option>
            <option
              v-for="principal in availablePrincipals"
              :key="principal.principal_id"
              :value="principal.principal_id"
            >
              {{ principal.principal_name }}
            </option>
          </select>
        </div>

        <!-- Time Range -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Period:
          </label>
          <select
            v-model="selectedTimeframe"
            @change="handleTimeframeChange"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="last_year">Last Year</option>
            <option value="all_time">All Time</option>
          </select>
        </div>

        <!-- Dashboard Actions -->
        <div class="flex items-center space-x-2">
          <button
            @click="refreshDashboard"
            :disabled="isRefreshing"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors flex items-center"
          >
            <svg
              class="w-4 h-4 mr-2"
              :class="{ 'animate-spin': isRefreshing }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
          
          <button
            @click="showExportModal = true"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Key Metrics Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Principals"
        :value="dashboardMetrics.totalPrincipals"
        icon="users"
        color="blue"
        :trend="dashboardMetrics.principalsTrend"
        :loading="isLoading"
      />
      <StatCard
        title="Avg Health Score"
        :value="dashboardMetrics.avgHealthScore"
        suffix="/100"
        icon="heart"
        color="green"
        :trend="dashboardMetrics.healthTrend"
        :loading="isLoading"
      />
      <StatCard
        title="High Risk"
        :value="dashboardMetrics.highRiskCount"
        icon="alert"
        color="red"
        :trend="dashboardMetrics.riskTrend"
        :loading="isLoading"
      />
      <StatCard
        title="Growth Opportunities"
        :value="dashboardMetrics.growthOpportunities"
        icon="trend-up"
        color="purple"
        :trend="dashboardMetrics.opportunitiesTrend"
        :loading="isLoading"
      />
    </div>

    <!-- Main Visualizations Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
      <!-- Health Distribution -->
      <RelationshipHealthDistributionChart
        :interactive="true"
        @category-click="handleHealthCategoryClick"
        @principal-click="handlePrincipalClick"
        @export="handleChartExport('health_distribution', $event)"
      />

      <!-- Engagement Timeline -->
      <EngagementTimelineChart
        :principal-id="selectedPrincipalId"
        :timeframe="selectedTimeframe"
        :interactive="true"
        @timeline-point-click="handleTimelinePointClick"
        @export="handleChartExport('engagement_timeline', $event)"
        @timeframe-change="handleTimeframeChange"
      />
    </div>

    <!-- Pattern Analysis -->
    <div class="mb-8">
      <EngagementPatternHeatmap
        :principal-ids="selectedPrincipalIds"
        :interactive="true"
        @cell-click="handleHeatmapCellClick"
        @export="handleChartExport('pattern_heatmap', $event)"
      />
    </div>

    <!-- Detailed Analysis Section -->
    <div v-if="selectedPrincipalId" class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <!-- Principal Details -->
      <div class="lg:col-span-2">
        <PrincipalDetailsModal
          :principal="selectedPrincipal"
          :show="!!selectedPrincipal"
          @close="clearPrincipalSelection"
          @action-click="handleRecommendedAction"
        />
      </div>

      <!-- Recommendations Panel -->
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recommendations
        </h3>
        
        <!-- Next Best Actions -->
        <div v-if="currentRecommendations.length > 0" class="space-y-4">
          <div
            v-for="recommendation in currentRecommendations.slice(0, 3)"
            :key="recommendation.category + recommendation.priority"
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ recommendation.recommendation }}
                </h4>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {{ recommendation.rationale }}
                </p>
                <div class="mt-2 flex items-center space-x-2">
                  <PriorityBadge :priority="recommendation.priority" size="sm" />
                  <span class="text-xs text-gray-500">
                    {{ recommendation.timeline }}
                  </span>
                </div>
              </div>
              <button
                @click="handleRecommendationClick(recommendation)"
                class="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
              >
                Act
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
          Select a principal to view recommendations
        </div>
      </div>
    </div>

    <!-- Risk Management & Opportunities -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Risk Management -->
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Risk Management
        </h3>

        <div v-if="highRiskPrincipals.length > 0" class="space-y-3">
          <div
            v-for="principal in highRiskPrincipals.slice(0, 5)"
            :key="principal.principal_id"
            @click="handlePrincipalClick(principal)"
            class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ principal.principal_name }}
                </h4>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ formatRiskFactors(principal.relationship_risk_factors) }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-red-600 dark:text-red-400">
                  {{ principal.risk_score }}
                </div>
                <div class="text-xs text-gray-500">
                  Risk Score
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
          No high-risk principals identified
        </div>
      </div>

      <!-- Growth Opportunities -->
      <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Growth Opportunities
        </h3>

        <div v-if="growthOpportunityPrincipals.length > 0" class="space-y-3">
          <div
            v-for="principal in growthOpportunityPrincipals.slice(0, 5)"
            :key="principal.principal_id"
            @click="handlePrincipalClick(principal)"
            class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ principal.principal_name }}
                </h4>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ formatGrowthOpportunities(principal.engagement_patterns.growth_opportunity_indicators) }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600 dark:text-green-400">
                  {{ principal.engagement_patterns.growth_opportunity_indicators.length }}
                </div>
                <div class="text-xs text-gray-500">
                  Opportunities
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
          No growth opportunities identified
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <ExportOptionsModal
      v-if="showExportModal"
      :show="showExportModal"
      :title="'Engagement Analytics Export'"
      :available-formats="['pdf', 'excel', 'csv', 'json']"
      :data-options="exportDataOptions"
      @export="handleExport"
      @close="showExportModal = false"
    />

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span class="text-gray-900 dark:text-white">Loading engagement analytics...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEngagementStore } from '../../../stores/engagementStore'
import type { 
  PrincipalEngagementAnalytics,
  EngagementRecommendation,
  RelationshipRiskFactor,
  GrowthOpportunityIndicator,
  EngagementTimelinePoint
} from '../../../types/engagement.types'

// Component imports
import StatCard from '../atomic/StatCard.vue'
import PriorityBadge from '../atomic/PriorityBadge.vue'
import RelationshipHealthDistributionChart from '../molecular/RelationshipHealthDistributionChart.vue'
import EngagementTimelineChart from '../molecular/EngagementTimelineChart.vue'
import EngagementPatternHeatmap from '../molecular/EngagementPatternHeatmap.vue'
import PrincipalDetailsModal from '../molecular/PrincipalDetailsModal.vue'
import ExportOptionsModal from '../molecular/ExportOptionsModal.vue'

// Props
interface Props {
  principalId?: string
  timeframe?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  timeframe: 'last_90_days',
  autoRefresh: false,
  refreshInterval: 300000 // 5 minutes
})

// Emits
const emit = defineEmits<{
  principalSelect: [principal: PrincipalEngagementAnalytics]
  actionRequired: [action: string, data: any]
  export: [type: string, data: any]
}>()

// Store
const engagementStore = useEngagementStore()

// Reactive state
const selectedPrincipalId = ref<string>(props.principalId || '')
const selectedTimeframe = ref<string>(props.timeframe)
const selectedPrincipalIds = ref<string[]>([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const showExportModal = ref(false)

// Auto-refresh functionality
let refreshTimer: NodeJS.Timeout | null = null

// Computed properties
const availablePrincipals = computed(() => engagementStore.allEngagements)
const selectedPrincipal = computed(() => 
  selectedPrincipalId.value ? engagementStore.getEngagementById(selectedPrincipalId.value) : null
)

const currentRecommendations = computed(() => 
  selectedPrincipalId.value ? engagementStore.currentRecommendations : []
)

const highRiskPrincipals = computed(() => engagementStore.highRiskPrincipals)
const growthOpportunityPrincipals = computed(() => engagementStore.growthOpportunityPrincipals)

const dashboardSubtitle = computed(() => {
  if (selectedPrincipal.value) {
    return `Analysis for ${selectedPrincipal.value.principal_name}`
  } else {
    const count = availablePrincipals.value.length
    return `Analyzing ${count} principal relationship${count !== 1 ? 's' : ''}`
  }
})

// Dashboard metrics
const dashboardMetrics = computed(() => {
  const stats = engagementStore.summaryStatistics
  
  return {
    totalPrincipals: stats.total_principals,
    avgHealthScore: Math.round(stats.average_health_score),
    highRiskCount: stats.high_risk_count,
    growthOpportunities: stats.growth_opportunity_count,
    // Mock trends - in a real app, these would be calculated from historical data
    principalsTrend: 'stable' as const,
    healthTrend: 'up' as const,
    riskTrend: 'down' as const,
    opportunitiesTrend: 'up' as const
  }
})

// Export data options
const exportDataOptions = computed(() => [
  { id: 'summary', label: 'Executive Summary', enabled: true },
  { id: 'health_distribution', label: 'Health Distribution', enabled: true },
  { id: 'timeline_data', label: 'Timeline Data', enabled: true },
  { id: 'pattern_analysis', label: 'Pattern Analysis', enabled: true },
  { id: 'recommendations', label: 'Recommendations', enabled: true },
  { id: 'risk_analysis', label: 'Risk Analysis', enabled: true },
  { id: 'growth_opportunities', label: 'Growth Opportunities', enabled: true },
  { id: 'raw_data', label: 'Raw Data', enabled: false }
])

// Event handlers
async function handlePrincipalChange() {
  if (selectedPrincipalId.value) {
    await engagementStore.setCurrentPrincipal(selectedPrincipalId.value)
    selectedPrincipalIds.value = [selectedPrincipalId.value]
  } else {
    engagementStore.clearCurrentEngagement()
    selectedPrincipalIds.value = []
  }
  
  emit('principalSelect', selectedPrincipal.value!)
}

function handleTimeframeChange() {
  // Trigger refresh of time-sensitive components
  refreshDashboard()
}

async function refreshDashboard() {
  isRefreshing.value = true
  try {
    if (selectedPrincipalId.value) {
      await engagementStore.loadPrincipalEngagement(selectedPrincipalId.value, {}, true)
    } else {
      await engagementStore.refreshAllEngagements()
    }
  } catch (error) {
    console.error('Failed to refresh dashboard:', error)
  } finally {
    isRefreshing.value = false
  }
}

function handleHealthCategoryClick(category: string, principals: PrincipalEngagementAnalytics[]) {
  // Could show a filtered view or modal with category details
  selectedPrincipalIds.value = principals.map(p => p.principal_id)
}

function handlePrincipalClick(principal: PrincipalEngagementAnalytics) {
  selectedPrincipalId.value = principal.principal_id
  handlePrincipalChange()
}

function handleTimelinePointClick(point: EngagementTimelinePoint) {
  // Could show detailed interaction data for that time point
  console.log('Timeline point clicked:', point)
}

function handleHeatmapCellClick(cellData: any) {
  // Could show drill-down analysis for specific principal/time period
  console.log('Heatmap cell clicked:', cellData)
}

function handleRecommendationClick(recommendation: EngagementRecommendation) {
  emit('actionRequired', 'recommendation', {
    recommendation,
    principalId: selectedPrincipalId.value
  })
}

function handleRecommendedAction(action: string) {
  emit('actionRequired', 'action', {
    action,
    principalId: selectedPrincipalId.value
  })
}

function handleChartExport(chartType: string, data: any) {
  emit('export', chartType, data)
}

async function handleExport(exportConfig: any) {
  const exportData = {
    config: exportConfig,
    dashboard: {
      timeframe: selectedTimeframe.value,
      principalId: selectedPrincipalId.value,
      metrics: dashboardMetrics.value
    },
    data: {
      summary: dashboardMetrics.value,
      principals: selectedPrincipalId.value 
        ? [selectedPrincipal.value] 
        : availablePrincipals.value,
      recommendations: currentRecommendations.value,
      highRisk: highRiskPrincipals.value,
      opportunities: growthOpportunityPrincipals.value
    },
    exportedAt: new Date().toISOString()
  }

  emit('export', 'dashboard', exportData)
  showExportModal.value = false
}

function clearPrincipalSelection() {
  selectedPrincipalId.value = ''
  selectedPrincipalIds.value = []
  engagementStore.clearCurrentEngagement()
}

// Helper functions
function formatRiskFactors(riskFactors: RelationshipRiskFactor[]): string {
  if (riskFactors.length === 0) return 'No specific risks identified'
  
  const criticalFactors = riskFactors.filter(factor => factor.severity === 'critical')
  const highFactors = riskFactors.filter(factor => factor.severity === 'high')
  
  if (criticalFactors.length > 0) {
    return `${criticalFactors.length} critical risk${criticalFactors.length > 1 ? 's' : ''}`
  } else if (highFactors.length > 0) {
    return `${highFactors.length} high risk${highFactors.length > 1 ? 's' : ''}`
  } else {
    return `${riskFactors.length} risk factor${riskFactors.length > 1 ? 's' : ''}`
  }
}

function formatGrowthOpportunities(opportunities: GrowthOpportunityIndicator[]): string {
  if (opportunities.length === 0) return 'No opportunities identified'
  
  const types = [...new Set(opportunities.map(opp => opp.opportunity_type))]
  if (types.length === 1) {
    return types[0].replace('_', ' ')
  } else {
    return `${types.length} opportunity types`
  }
}

// Auto-refresh setup
function setupAutoRefresh() {
  if (props.autoRefresh && !refreshTimer) {
    refreshTimer = setInterval(refreshDashboard, props.refreshInterval)
  }
}

function clearAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// Watchers
watch(() => props.principalId, (newId) => {
  if (newId !== selectedPrincipalId.value) {
    selectedPrincipalId.value = newId || ''
    handlePrincipalChange()
  }
})

watch(() => props.autoRefresh, (enabled) => {
  if (enabled) {
    setupAutoRefresh()
  } else {
    clearAutoRefresh()
  }
})

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  
  try {
    // Load initial data
    if (props.principalId) {
      await engagementStore.loadPrincipalEngagement(props.principalId)
      selectedPrincipalId.value = props.principalId
      selectedPrincipalIds.value = [props.principalId]
    } else {
      await engagementStore.loadAllPrincipalsEngagement()
    }
    
    // Setup auto-refresh if enabled
    if (props.autoRefresh) {
      setupAutoRefresh()
    }
  } catch (error) {
    console.error('Failed to initialize dashboard:', error)
  } finally {
    isLoading.value = false
  }
})

// Cleanup
onBeforeUnmount(() => {
  clearAutoRefresh()
})
</script>

<style scoped>
.engagement-analytics-dashboard {
  @apply space-y-6;
}
</style>