<!--
Engagement Timeline Chart Component
Vue component for visualizing engagement patterns over time with interactive drill-down
-->
<template>
  <div class="engagement-timeline-chart">
    <!-- Chart Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Engagement Timeline
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ currentPrincipalId ? `${principalName} - ` : '' }}
          Interaction patterns and relationship health over time
        </p>
      </div>

      <!-- Chart Controls -->
      <div class="flex items-center space-x-3">
        <!-- Timeframe Selector -->
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

        <!-- View Options -->
        <div class="flex items-center space-x-2">
          <button
            @click="showTrendLine = !showTrendLine"
            :class="[
              'px-3 py-2 text-xs font-medium rounded-md transition-colors',
              showTrendLine 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            <TrendIcon class="w-4 h-4 mr-1" />
            Trend
          </button>
          
          <button
            @click="showMilestones = !showMilestones"
            :class="[
              'px-3 py-2 text-xs font-medium rounded-md transition-colors',
              showMilestones 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            <ActionIcon icon="milestone" class="w-4 h-4 mr-1" />
            Milestones
          </button>
        </div>

        <!-- Export Button -->
        <button
          @click="handleExport"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Loading engagement timeline...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
      <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Chart Container -->
    <div v-else class="relative">
      <!-- Chart Canvas -->
      <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
        <Line
          :data="chartData"
          :options="chartOptions"
          :plugins="chartPlugins"
          ref="chartRef"
        />
      </div>

      <!-- Timeline Annotations -->
      <div v-if="selectedDataPoint" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
          {{ formatDate(selectedDataPoint.date) }}
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-600 dark:text-gray-400">Interactions:</span>
            <span class="font-medium text-gray-900 dark:text-white ml-1">
              {{ selectedDataPoint.interaction_count }}
            </span>
          </div>
          <div>
            <span class="text-gray-600 dark:text-gray-400">Health Score:</span>
            <span class="font-medium text-gray-900 dark:text-white ml-1">
              {{ selectedDataPoint.engagement_score }}/10
            </span>
          </div>
          <div>
            <span class="text-gray-600 dark:text-gray-400">Trend:</span>
            <TrendIcon 
              :trend="selectedDataPoint.trend_direction"
              class="inline w-4 h-4 ml-1"
            />
          </div>
          <div v-if="selectedDataPoint.relationship_milestones.length > 0">
            <span class="text-gray-600 dark:text-gray-400">Milestones:</span>
            <span class="font-medium text-green-700 dark:text-green-300 ml-1">
              {{ selectedDataPoint.relationship_milestones.length }}
            </span>
          </div>
        </div>
        
        <!-- Milestones List -->
        <div v-if="selectedDataPoint.relationship_milestones.length > 0" class="mt-3">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="milestone in selectedDataPoint.relationship_milestones"
              :key="milestone"
              class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-300"
            >
              {{ milestone }}
            </span>
          </div>
        </div>

        <!-- Key Events -->
        <div v-if="selectedDataPoint.key_events.length > 0" class="mt-3">
          <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Events:</h5>
          <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li v-for="event in selectedDataPoint.key_events" :key="event" class="flex items-start">
              <span class="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              {{ event }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Summary Statistics -->
      <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Interactions"
          :value="summaryStats.totalInteractions"
          icon="activity"
          color="blue"
        />
        <StatCard
          title="Avg Health Score"
          :value="summaryStats.avgHealthScore"
          suffix="/10"
          icon="heart"
          color="green"
        />
        <StatCard
          title="Engagement Trend"
          :value="summaryStats.trendDirection"
          icon="trend"
          :color="getTrendColor(summaryStats.trendDirection)"
        />
        <StatCard
          title="Days Active"
          :value="summaryStats.activeDays"
          icon="calendar"
          color="purple"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type ChartOptions,
  type ChartData,
  type TooltipItem,
  type InteractionItem
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { format } from 'date-fns'
import { useEngagementStore } from '../../../stores/engagementStore'
import type { 
  EngagementTimelinePoint, 
  EngagementTimelineProps 
} from '../../../types/engagement.types'
import StatCard from '../atomic/StatCard.vue'
import TrendIcon from '../atomic/TrendIcon.vue'
import ActionIcon from '../atomic/ActionIcon.vue'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

// Props
interface Props {
  timelineData?: EngagementTimelinePoint[]
  highlightMilestones?: boolean
  showTrendLine?: boolean
  interactive?: boolean
  onTimelinePointClick?: (point: EngagementTimelinePoint) => void
  principalId?: string
}

const props = withDefaults(defineProps<Props>(), {
  timelineData: () => [],
  highlightMilestones: true,
  showTrendLine: true,
  interactive: true
})

// Emits
const emit = defineEmits<{
  timelinePointClick: [point: EngagementTimelinePoint]
  export: [data: any]
  timeframeChange: [timeframe: string]
}>()

// Store
const engagementStore = useEngagementStore()

// Reactive state
const chartRef = ref<any>(null)
const selectedTimeframe = ref<string>('last_90_days')
const showTrendLine = ref(props.showTrendLine)
const showMilestones = ref(props.highlightMilestones)
const selectedDataPoint = ref<EngagementTimelinePoint | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Current principal data
const currentPrincipalId = computed(() => props.principalId || engagementStore.currentPrincipalId)
const currentEngagement = computed(() => 
  currentPrincipalId.value ? engagementStore.getEngagementById(currentPrincipalId.value) : null
)
const principalName = computed(() => currentEngagement.value?.principal_name || 'All Principals')

// Timeline data source
const timelinePoints = computed(() => {
  if (props.timelineData.length > 0) {
    return props.timelineData
  }
  return currentEngagement.value?.engagement_timeline || []
})

// Filtered timeline data based on timeframe
const filteredTimelineData = computed(() => {
  const now = new Date()
  let cutoffDate: Date

  switch (selectedTimeframe.value) {
    case 'last_30_days':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'last_90_days':
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'last_year':
      cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      return timelinePoints.value
  }

  return timelinePoints.value.filter(point => new Date(point.date) >= cutoffDate)
})

// Chart data
const chartData = computed<ChartData<'line'>>(() => {
  const data = filteredTimelineData.value

  const datasets = [
    // Interaction count line
    {
      label: 'Interactions',
      data: data.map(point => ({
        x: point.date,
        y: point.interaction_count
      })),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      yAxisID: 'y'
    },
    // Health score line
    {
      label: 'Health Score',
      data: data.map(point => ({
        x: point.date,
        y: point.engagement_score
      })),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      yAxisID: 'y1'
    }
  ]

  // Add trend line if enabled
  if (showTrendLine.value && data.length > 1) {
    const trendData = calculateTrendLine(data)
    datasets.push({
      label: 'Trend',
      data: trendData,
      borderColor: 'rgba(156, 163, 175, 0.8)',
      backgroundColor: 'transparent',
      borderDash: [5, 5],
      tension: 0,
      pointRadius: 0,
      yAxisID: 'y1'
    })
  }

  return { datasets }
})

// Chart options
const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    title: {
      display: false
    },
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      callbacks: {
        title: (context) => {
          return format(new Date(context[0].parsed.x), 'MMM dd, yyyy')
        },
        label: (context) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          
          if (label === 'Health Score') {
            return `${label}: ${value}/10`
          } else if (label === 'Interactions') {
            return `${label}: ${value}`
          }
          return `${label}: ${value}`
        },
        afterBody: (context) => {
          const dataIndex = context[0].dataIndex
          const point = filteredTimelineData.value[dataIndex]
          
          const details = []
          if (point.relationship_milestones.length > 0) {
            details.push(`Milestones: ${point.relationship_milestones.length}`)
          }
          if (point.key_events.length > 0) {
            details.push(`Events: ${point.key_events.length}`)
          }
          
          return details
        }
      }
    }
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: getTimeUnit(),
        displayFormats: {
          day: 'MMM dd',
          week: 'MMM dd',
          month: 'MMM yyyy'
        }
      },
      title: {
        display: true,
        text: 'Date'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.2)'
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Interactions'
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.2)'
      },
      beginAtZero: true
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Health Score'
      },
      grid: {
        drawOnChartArea: false
      },
      min: 0,
      max: 10
    }
  },
  onClick: (event, elements) => {
    if (!props.interactive || elements.length === 0) return
    
    const dataIndex = elements[0].index
    const point = filteredTimelineData.value[dataIndex]
    
    selectedDataPoint.value = point
    emit('timelinePointClick', point)
    
    if (props.onTimelinePointClick) {
      props.onTimelinePointClick(point)
    }
  }
}))

// Chart plugins for milestone annotations
const chartPlugins = computed(() => {
  if (!showMilestones.value) return []

  return [{
    id: 'milestoneAnnotations',
    afterDraw: (chart: any) => {
      const ctx = chart.ctx
      const chartArea = chart.chartArea
      
      filteredTimelineData.value.forEach((point, index) => {
        if (point.relationship_milestones.length > 0) {
          const meta = chart.getDatasetMeta(0)
          const element = meta.data[index]
          
          if (element) {
            ctx.save()
            ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
            ctx.beginPath()
            ctx.arc(element.x, chartArea.top - 10, 4, 0, 2 * Math.PI)
            ctx.fill()
            ctx.restore()
          }
        }
      })
    }
  }]
})

// Summary statistics
const summaryStats = computed(() => {
  const data = filteredTimelineData.value
  
  if (data.length === 0) {
    return {
      totalInteractions: 0,
      avgHealthScore: 0,
      trendDirection: 'stable',
      activeDays: 0
    }
  }

  const totalInteractions = data.reduce((sum, point) => sum + point.interaction_count, 0)
  const avgHealthScore = Math.round(
    (data.reduce((sum, point) => sum + point.engagement_score, 0) / data.length) * 10
  ) / 10

  // Calculate trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, point) => sum + point.engagement_score, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, point) => sum + point.engagement_score, 0) / secondHalf.length
  
  let trendDirection = 'stable'
  if (secondAvg > firstAvg * 1.1) trendDirection = 'up'
  else if (secondAvg < firstAvg * 0.9) trendDirection = 'down'

  const activeDays = new Set(data.map(point => point.date.split('T')[0])).size

  return {
    totalInteractions,
    avgHealthScore,
    trendDirection,
    activeDays
  }
})

// Helper functions
function getTimeUnit() {
  switch (selectedTimeframe.value) {
    case 'last_30_days':
      return 'day'
    case 'last_90_days':
      return 'week'
    default:
      return 'month'
  }
}

function calculateTrendLine(data: EngagementTimelinePoint[]) {
  if (data.length < 2) return []

  // Simple linear regression for trend line
  const n = data.length
  const xValues = data.map((_, index) => index)
  const yValues = data.map(point => point.engagement_score)

  const sumX = xValues.reduce((sum, x) => sum + x, 0)
  const sumY = yValues.reduce((sum, y) => sum + y, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return data.map((point, index) => ({
    x: point.date,
    y: slope * index + intercept
  }))
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

function getTrendColor(trend: string): string {
  switch (trend) {
    case 'up':
      return 'green'
    case 'down':
      return 'red'
    default:
      return 'gray'
  }
}

// Event handlers
function handleTimeframeChange() {
  emit('timeframeChange', selectedTimeframe.value)
}

function handleExport() {
  const exportData = {
    timelineData: filteredTimelineData.value,
    summaryStats: summaryStats.value,
    principalName: principalName.value,
    timeframe: selectedTimeframe.value,
    exportedAt: new Date().toISOString()
  }
  
  emit('export', exportData)
}

// Watchers
watch(currentPrincipalId, (newId) => {
  selectedDataPoint.value = null
  if (newId && !engagementStore.getEngagementById(newId)) {
    isLoading.value = true
    engagementStore.loadPrincipalEngagement(newId)
      .catch((err) => {
        error.value = err.message
      })
      .finally(() => {
        isLoading.value = false
      })
  }
})

// Lifecycle
onMounted(() => {
  if (currentPrincipalId.value && !currentEngagement.value) {
    isLoading.value = true
    engagementStore.loadPrincipalEngagement(currentPrincipalId.value)
      .catch((err) => {
        error.value = err.message
      })
      .finally(() => {
        isLoading.value = false
      })
  }
})
</script>

<style scoped>
.engagement-timeline-chart {
  @apply bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.chart-container {
  @apply relative;
}

.chart-container canvas {
  @apply rounded-lg;
}
</style>