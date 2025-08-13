<!--
  Engagement Analytics View
  
  Main view component for relationship health and engagement analytics
  Provides comprehensive visibility into principal-distributor relationships
-->
<template>
  <div class="engagement-analytics-view">
    <!-- Page Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-4">
                <li>
                  <div>
                    <router-link 
                      to="/dashboard" 
                      class="text-gray-400 hover:text-gray-500"
                    >
                      Dashboard
                    </router-link>
                  </div>
                </li>
                <li>
                  <div class="flex items-center">
                    <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <span class="ml-4 text-sm font-medium text-gray-900">Engagement Analytics</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div class="mt-2">
              <h1 class="text-2xl font-bold text-gray-900">Relationship Intelligence</h1>
              <p class="text-sm text-gray-600">
                Cross-distributor engagement aggregation and relationship health analytics
              </p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center space-x-3">
            <button
              @click="exportData"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DownloadIcon class="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button
              @click="openSettings"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <SettingsIcon class="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="border-b border-gray-200 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5 mr-2 inline" />
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="flex-1">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'">
        <EngagementAnalyticsDashboard
          :auto-refresh="autoRefreshEnabled"
          :refresh-interval="refreshIntervalMinutes * 60 * 1000"
          @principal-select="handlePrincipalSelect"
          @action-required="handleActionRequired"
          @export="handleDashboardExport"
        />
      </div>

      <!-- Individual Principal Analysis -->
      <div v-else-if="activeTab === 'individual'">
        <IndividualPrincipalAnalysis />
      </div>

      <!-- Risk Management -->
      <div v-else-if="activeTab === 'risks'">
        <RiskManagementView />
      </div>

      <!-- Growth Opportunities -->
      <div v-else-if="activeTab === 'opportunities'">
        <GrowthOpportunitiesView />
      </div>

      <!-- Relationship Trends -->
      <div v-else-if="activeTab === 'trends'">
        <RelationshipTrendsView />
      </div>

      <!-- Recommendations -->
      <div v-else-if="activeTab === 'recommendations'">
        <RecommendationsView />
      </div>

      <!-- Analytics Settings -->
      <div v-else-if="activeTab === 'settings'">
        <AnalyticsSettingsView />
      </div>
    </div>

    <!-- Global Error State -->
    <div v-if="error" class="fixed bottom-4 right-4 max-w-sm">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <AlertCircleIcon class="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-red-800">Analytics Error</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            <div class="mt-3 flex space-x-2">
              <button
                @click="retryOperation"
                class="text-sm bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded"
              >
                Retry
              </button>
              <button
                @click="clearError"
                class="text-sm text-red-600 hover:text-red-800 px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay for Global Operations -->
    <div 
      v-if="isPerformingGlobalOperation" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div>
            <p class="text-sm font-medium text-gray-900">Processing...</p>
            <p class="text-xs text-gray-600">{{ globalOperationMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <EngagementSettingsModal 
      v-if="showSettingsModal"
      @close="showSettingsModal = false"
      @settings-updated="handleSettingsUpdate"
    />

    <!-- Export Options Modal -->
    <ExportOptionsModal 
      v-if="showExportModal"
      @close="showExportModal = false"
      @export="handleExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEngagementStore } from '../../stores/engagementStore'
import EngagementAnalyticsDashboard from '../../components/engagement/organism/EngagementAnalyticsDashboard.vue'
import IndividualPrincipalAnalysis from '../../components/engagement/organism/IndividualPrincipalAnalysis.vue'
import RiskManagementView from '../../components/engagement/organism/RiskManagementView.vue'
import GrowthOpportunitiesView from '../../components/engagement/organism/GrowthOpportunitiesView.vue'
import RelationshipTrendsView from '../../components/engagement/organism/RelationshipTrendsView.vue'
import RecommendationsView from '../../components/engagement/organism/RecommendationsView.vue'
import AnalyticsSettingsView from '../../components/engagement/organism/AnalyticsSettingsView.vue'
import EngagementSettingsModal from '../../components/engagement/molecular/EngagementSettingsModal.vue'
import ExportOptionsModal from '../../components/engagement/molecular/ExportOptionsModal.vue'

// Icons
import {
  ChevronRightIcon,
  DownloadIcon,
  SettingsIcon,
  AlertCircleIcon,
  BarChart3Icon,
  UserIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  LineChartIcon,
  LightbulbIcon,
  CogIcon
} from 'lucide-vue-next'

// Router
const router = useRouter()
const route = useRoute()

// Store
const engagementStore = useEngagementStore()

// Local state
const activeTab = ref<string>('overview')
const showSettingsModal = ref(false)
const showExportModal = ref(false)
const isPerformingGlobalOperation = ref(false)
const globalOperationMessage = ref('')
const autoRefreshInterval = ref<NodeJS.Timeout | null>(null)
const autoRefreshEnabled = ref(true)
const refreshIntervalMinutes = ref(15)

// Tab configuration
const tabs = [
  {
    id: 'overview',
    name: 'Overview',
    icon: BarChart3Icon,
    description: 'Comprehensive engagement analytics dashboard'
  },
  {
    id: 'individual',
    name: 'Individual Analysis',
    icon: UserIcon,
    description: 'Deep dive into specific principal relationships'
  },
  {
    id: 'risks',
    name: 'Risk Management',
    icon: AlertTriangleIcon,
    description: 'Relationship risk assessment and mitigation'
  },
  {
    id: 'opportunities',
    name: 'Growth Opportunities',
    icon: TrendingUpIcon,
    description: 'Identify and track growth potential'
  },
  {
    id: 'trends',
    name: 'Trends',
    icon: LineChartIcon,
    description: 'Historical patterns and forecasting'
  },
  {
    id: 'recommendations',
    name: 'Recommendations',
    icon: LightbulbIcon,
    description: 'AI-powered engagement recommendations'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: CogIcon,
    description: 'Analytics configuration and preferences'
  }
]

// Computed properties from store
const {
  isLoadingAll,
  error,
  summaryStatistics,
  allEngagements
} = engagementStore

// Methods
const openSettings = () => {
  showSettingsModal.value = true
}

const exportData = () => {
  showExportModal.value = true
}

const handleExport = async (options: any) => {
  isPerformingGlobalOperation.value = true
  globalOperationMessage.value = 'Preparing export data...'
  
  try {
    // In a real implementation, this would call the export service
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const exportData = engagementStore.exportEngagementData()
    
    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `engagement-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showExportModal.value = false
  } catch (err) {
    console.error('Export failed:', err)
  } finally {
    isPerformingGlobalOperation.value = false
  }
}

const handleSettingsUpdate = (settings: any) => {
  autoRefreshEnabled.value = settings.autoRefreshEnabled
  refreshIntervalMinutes.value = settings.refreshIntervalMinutes
  
  if (settings.cacheTimeoutMinutes) {
    engagementStore.setCacheTimeout(settings.cacheTimeoutMinutes)
  }
  
  setupAutoRefresh()
  showSettingsModal.value = false
}

const setupAutoRefresh = () => {
  // Clear existing interval
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
  
  // Setup new interval if enabled
  if (autoRefreshEnabled.value) {
    const intervalMs = refreshIntervalMinutes.value * 60 * 1000
    autoRefreshInterval.value = setInterval(async () => {
      try {
        await engagementStore.refreshAllEngagements()
      } catch (err) {
        console.error('Auto-refresh failed:', err)
      }
    }, intervalMs)
  }
}

const retryOperation = async () => {
  await engagementStore.refreshAllEngagements()
}

const clearError = () => {
  // Clear error from store if available
  if (typeof engagementStore.clearError === 'function') {
    engagementStore.clearError()
  }
}

const handlePrincipalSelect = (principal: any) => {
  // Update route to show individual analysis
  router.push({ 
    query: { 
      ...route.query, 
      tab: 'individual',
      principal: principal.principal_id
    } 
  })
  activeTab.value = 'individual'
}

const handleActionRequired = (actionType: string, data: any) => {
  // Handle action requirements from dashboard
  console.log('Action required:', actionType, data)
  
  // In a real implementation, this would open appropriate action modals
  // or trigger workflows based on the action type
}

const handleDashboardExport = (exportType: string, data: any) => {
  // Handle export requests from dashboard
  console.log('Dashboard export:', exportType, data)
  
  // This could integrate with the main export functionality
  handleExport({ type: exportType, data })
}

const initializeView = async () => {
  // Set initial tab from route query
  const tabFromRoute = route.query.tab as string
  if (tabFromRoute && tabs.some(tab => tab.id === tabFromRoute)) {
    activeTab.value = tabFromRoute
  }
  
  // Load initial data if not already loaded
  if (allEngagements.length === 0) {
    await engagementStore.loadAllPrincipalsEngagement()
  }
  
  // Setup auto-refresh
  setupAutoRefresh()
}

// Watch for tab changes and update route
watch(activeTab, (newTab) => {
  router.push({ 
    query: { 
      ...route.query, 
      tab: newTab 
    } 
  })
}, { immediate: false })

// Lifecycle hooks
onMounted(() => {
  initializeView()
})

onUnmounted(() => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
  }
})

// Page title and meta
const pageTitle = computed(() => {
  const currentTab = tabs.find(tab => tab.id === activeTab.value)
  return `Engagement Analytics - ${currentTab?.name || 'Overview'}`
})

// Update document title
watch(pageTitle, (title) => {
  document.title = title
}, { immediate: true })
</script>

<style scoped>
.engagement-analytics-view {
  @apply min-h-screen bg-gray-50;
}

/* Smooth transitions for tab switching */
.tab-enter-active,
.tab-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.tab-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.tab-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Auto-refresh indicator animation */
.auto-refresh-indicator {
  @apply inline-block w-2 h-2 bg-green-400 rounded-full mr-2;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Loading animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .engagement-analytics-view {
    @apply text-sm;
  }
  
  .tab-navigation {
    @apply overflow-x-auto;
  }
  
  .tab-navigation nav {
    @apply min-w-max;
  }
}

/* Print styles */
@media print {
  .engagement-analytics-view {
    @apply text-black bg-white;
  }
  
  .tab-navigation,
  .quick-actions,
  .settings-modal,
  .export-modal {
    @apply hidden;
  }
}

/* Dark mode support (if needed in future) */
@media (prefers-color-scheme: dark) {
  .engagement-analytics-view {
    /* Dark mode styles would go here */
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .engagement-analytics-view {
    @apply border-2 border-black;
  }
  
  .tab-button {
    @apply border border-black;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .tab-enter-active,
  .tab-leave-active,
  .animate-spin,
  .auto-refresh-indicator {
    animation: none;
    transition: none;
  }
}
</style>