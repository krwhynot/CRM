<!--
Engagement Pattern Heatmap Component
Visualizes communication patterns, response times, and engagement quality across principals and time periods
-->
<template>
  <div class="engagement-pattern-heatmap">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Engagement Pattern Heatmap
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Communication patterns and response quality across {{ filteredPrincipals.length }} principals
        </p>
      </div>

      <!-- Controls -->
      <div class="flex items-center space-x-3">
        <!-- Pattern Type Selector -->
        <select
          v-model="selectedPattern"
          @change="updateHeatmap"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="frequency">Interaction Frequency</option>
          <option value="response_time">Response Time</option>
          <option value="engagement_quality">Engagement Quality</option>
          <option value="consistency">Consistency Score</option>
          <option value="health_trend">Health Trend</option>
        </select>

        <!-- Time Period Selector -->
        <select
          v-model="selectedPeriod"
          @change="updateHeatmap"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>

        <!-- Export Button -->
        <button
          @click="handleExport"
          class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-96">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Loading heatmap data...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center h-96 text-red-600 dark:text-red-400">
      <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Heatmap Container -->
    <div v-else class="relative">
      <!-- Legend -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ patternLabels[selectedPattern] }}:
          </span>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">Low</span>
            <div class="flex space-x-1">
              <div
                v-for="(color, index) in colorScale"
                :key="index"
                :class="`w-4 h-4 ${color}`"
              ></div>
            </div>
            <span class="text-xs text-gray-500">High</span>
          </div>
        </div>

        <!-- Pattern Stats -->
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ getPatternStats() }}
        </div>
      </div>

      <!-- Heatmap Grid -->
      <div class="overflow-x-auto">
        <div class="min-w-full">
          <!-- Time Period Headers -->
          <div class="flex mb-2">
            <div class="w-48 flex-shrink-0"></div> <!-- Principal name column -->
            <div class="flex flex-1 min-w-0">
              <div
                v-for="period in timePeriods"
                :key="period.key"
                class="flex-1 text-xs text-center text-gray-600 dark:text-gray-400 px-1 py-2 border-l border-gray-200 dark:border-gray-700"
              >
                {{ period.label }}
              </div>
            </div>
          </div>

          <!-- Heatmap Rows -->
          <div
            v-for="principal in filteredPrincipals"
            :key="principal.principal_id"
            class="flex mb-1 items-stretch"
          >
            <!-- Principal Info -->
            <div class="w-48 flex-shrink-0 flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-l-lg">
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ principal.principal_name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ getRelationshipStageText(principal) }}
                </div>
              </div>
              <HealthScoreBadge
                :score="principal.relationship_health.overall_health_score"
                size="sm"
                class="ml-2 flex-shrink-0"
              />
            </div>

            <!-- Heatmap Cells -->
            <div class="flex flex-1 min-w-0">
              <div
                v-for="period in timePeriods"
                :key="`${principal.principal_id}-${period.key}`"
                :class="[
                  'flex-1 relative cursor-pointer transition-all duration-200 border-l border-gray-200 dark:border-gray-700',
                  getHeatmapCellClass(principal, period),
                  selectedCell?.principalId === principal.principal_id && selectedCell?.period === period.key
                    ? 'ring-2 ring-blue-500 ring-inset'
                    : 'hover:ring-1 hover:ring-blue-300 hover:ring-inset'
                ]"
                @click="handleCellClick(principal, period)"
                @mouseenter="handleCellHover(principal, period, $event)"
                @mouseleave="hideTooltip"
              >
                <div class="w-full h-12 flex items-center justify-center">
                  <span class="text-xs font-medium text-white mix-blend-difference">
                    {{ getHeatmapValue(principal, period) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Cell Details -->
      <div v-if="selectedCell" class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-3">
          {{ selectedCell.principalName }} - {{ selectedCell.periodLabel }}
        </h4>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="(metric, key) in selectedCell.metrics"
            :key="key"
            class="text-center"
          >
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatMetricValue(key, metric.value) }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ metric.label }}
            </div>
            <TrendIcon
              v-if="metric.trend"
              :trend="metric.trend"
              class="mx-auto mt-1 w-4 h-4"
            />
          </div>
        </div>

        <!-- Detailed Insights -->
        <div v-if="selectedCell.insights" class="mt-4">
          <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Insights:</h5>
          <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li v-for="insight in selectedCell.insights" :key="insight" class="flex items-start">
              <span class="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              {{ insight }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Pattern Analysis -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Top Performers -->
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 class="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Top Performers
          </h4>
          <div class="space-y-2">
            <div
              v-for="principal in topPerformers"
              :key="principal.principal_id"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-900 dark:text-white truncate flex-1 mr-2">
                {{ principal.principal_name }}
              </span>
              <span class="text-green-700 dark:text-green-300 font-medium">
                {{ getPatternValue(principal) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Needs Attention -->
        <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 class="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Needs Attention
          </h4>
          <div class="space-y-2">
            <div
              v-for="principal in needsAttention"
              :key="principal.principal_id"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-900 dark:text-white truncate flex-1 mr-2">
                {{ principal.principal_name }}
              </span>
              <span class="text-red-700 dark:text-red-300 font-medium">
                {{ getPatternValue(principal) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Trending Up -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
            <TrendIcon trend="up" class="w-5 h-5 mr-2" />
            Trending Up
          </h4>
          <div class="space-y-2">
            <div
              v-for="principal in trendingUp"
              :key="principal.principal_id"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-900 dark:text-white truncate flex-1 mr-2">
                {{ principal.principal_name }}
              </span>
              <span class="text-blue-700 dark:text-blue-300 font-medium">
                {{ getPatternValue(principal) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      :style="{
        left: tooltip.x + 'px',
        top: tooltip.y + 'px'
      }"
      class="fixed z-50 bg-black text-white text-xs p-2 rounded shadow-lg pointer-events-none max-w-xs"
    >
      <div class="font-medium">{{ tooltip.title }}</div>
      <div class="text-gray-300 mt-1">{{ tooltip.content }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useEngagementStore } from '../../../stores/engagementStore'
import type { 
  PrincipalEngagementAnalytics,
  RelationshipStage 
} from '../../../types/engagement.types'
import HealthScoreBadge from '../atomic/HealthScoreBadge.vue'
import TrendIcon from '../atomic/TrendIcon.vue'

// Types
interface TimePeriod {
  key: string
  label: string
  startDate: Date
  endDate: Date
}

interface HeatmapCell {
  principalId: string
  principalName: string
  period: string
  periodLabel: string
  value: number
  metrics: Record<string, {
    value: number
    label: string
    trend?: 'up' | 'down' | 'stable'
  }>
  insights?: string[]
}

interface Tooltip {
  visible: boolean
  x: number
  y: number
  title: string
  content: string
}

type PatternType = 'frequency' | 'response_time' | 'engagement_quality' | 'consistency' | 'health_trend'
type PeriodType = 'weekly' | 'monthly' | 'quarterly'

// Props
interface Props {
  principalIds?: string[]
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  principalIds: () => [],
  interactive: true
})

// Emits
const emit = defineEmits<{
  cellClick: [data: HeatmapCell]
  export: [data: any]
}>()

// Store
const engagementStore = useEngagementStore()

// Reactive state
const selectedPattern = ref<PatternType>('frequency')
const selectedPeriod = ref<PeriodType>('monthly')
const selectedCell = ref<HeatmapCell | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Tooltip state
const tooltip = ref<Tooltip>({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  content: ''
})

// Pattern configuration
const patternLabels = {
  frequency: 'Interaction Frequency',
  response_time: 'Avg Response Time (hrs)',
  engagement_quality: 'Engagement Quality Score',
  consistency: 'Consistency Score',
  health_trend: 'Health Score Change'
}

const colorScale = [
  'bg-gray-200 dark:bg-gray-700',
  'bg-blue-200 dark:bg-blue-800',
  'bg-blue-400 dark:bg-blue-600',
  'bg-blue-600 dark:bg-blue-500',
  'bg-blue-800 dark:bg-blue-400'
]

// Computed properties
const allEngagements = computed(() => engagementStore.allEngagements)

const filteredPrincipals = computed(() => {
  if (props.principalIds.length > 0) {
    return allEngagements.value.filter(engagement =>
      props.principalIds.includes(engagement.principal_id)
    )
  }
  return allEngagements.value
})

// Generate time periods based on selection
const timePeriods = computed((): TimePeriod[] => {
  const now = new Date()
  const periods: TimePeriod[] = []

  if (selectedPeriod.value === 'weekly') {
    // Last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const endDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      periods.push({
        key: `week-${i}`,
        label: `W${Math.floor((now.getTime() - endDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`,
        startDate,
        endDate
      })
    }
  } else if (selectedPeriod.value === 'monthly') {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      periods.push({
        key: `month-${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        startDate,
        endDate
      })
    }
  } else {
    // Last 4 quarters
    for (let i = 3; i >= 0; i--) {
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - i * 3, 1)
      const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0)
      periods.push({
        key: `quarter-${quarterStart.getFullYear()}-${Math.floor(quarterStart.getMonth() / 3)}`,
        label: `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear().toString().slice(-2)}`,
        startDate: quarterStart,
        endDate: quarterEnd
      })
    }
  }

  return periods
})

// Performance analysis
const topPerformers = computed(() => {
  return filteredPrincipals.value
    .slice()
    .sort((a, b) => getPatternValue(b) - getPatternValue(a))
    .slice(0, 5)
})

const needsAttention = computed(() => {
  return filteredPrincipals.value
    .slice()
    .sort((a, b) => getPatternValue(a) - getPatternValue(b))
    .slice(0, 5)
})

const trendingUp = computed(() => {
  return filteredPrincipals.value
    .filter(principal => principal.relationship_health.health_trend === 'improving')
    .slice(0, 5)
})

// Helper functions
function getPatternValue(principal: PrincipalEngagementAnalytics): number {
  switch (selectedPattern.value) {
    case 'frequency':
      return principal.engagement_patterns.interaction_frequency.current_frequency
    case 'response_time':
      return principal.engagement_patterns.response_time_patterns.average_response_time_hours
    case 'engagement_quality':
      return principal.engagement_patterns.engagement_depth
    case 'consistency':
      return principal.engagement_patterns.consistency_score
    case 'health_trend':
      return principal.relationship_health.overall_health_score
    default:
      return 0
  }
}

function getHeatmapValue(principal: PrincipalEngagementAnalytics, period: TimePeriod): string {
  const value = getPatternValue(principal)
  
  switch (selectedPattern.value) {
    case 'frequency':
      return Math.round(value).toString()
    case 'response_time':
      return Math.round(value).toString()
    case 'engagement_quality':
    case 'consistency':
      return Math.round(value).toString()
    case 'health_trend':
      return Math.round(value).toString()
    default:
      return '0'
  }
}

function getHeatmapCellClass(principal: PrincipalEngagementAnalytics, period: TimePeriod): string {
  const value = getPatternValue(principal)
  const maxValue = Math.max(...filteredPrincipals.value.map(p => getPatternValue(p)))
  const minValue = Math.min(...filteredPrincipals.value.map(p => getPatternValue(p)))
  
  const normalized = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0
  const colorIndex = Math.min(Math.floor(normalized * colorScale.length), colorScale.length - 1)
  
  return colorScale[colorIndex]
}

function getRelationshipStageText(principal: PrincipalEngagementAnalytics): string {
  const stages = principal.distributor_relationships.map(rel => rel.relationship_stage)
  const uniqueStages = [...new Set(stages)]
  
  if (uniqueStages.length === 1) {
    return formatRelationshipStage(uniqueStages[0])
  } else {
    return `${uniqueStages.length} stages`
  }
}

function formatRelationshipStage(stage: RelationshipStage): string {
  return stage.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getPatternStats(): string {
  const values = filteredPrincipals.value.map(p => getPatternValue(p))
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  
  return `Avg: ${avg.toFixed(1)} | Range: ${min.toFixed(1)} - ${max.toFixed(1)}`
}

function formatMetricValue(key: string, value: number): string {
  switch (key) {
    case 'frequency':
      return value.toFixed(0)
    case 'response_time':
      return value.toFixed(1) + 'h'
    case 'percentage':
      return value.toFixed(1) + '%'
    default:
      return value.toFixed(1)
  }
}

// Event handlers
function handleCellClick(principal: PrincipalEngagementAnalytics, period: TimePeriod) {
  if (!props.interactive) return

  const cellData: HeatmapCell = {
    principalId: principal.principal_id,
    principalName: principal.principal_name,
    period: period.key,
    periodLabel: period.label,
    value: getPatternValue(principal),
    metrics: {
      frequency: {
        value: principal.engagement_patterns.interaction_frequency.current_frequency,
        label: 'Interactions/month'
      },
      response_time: {
        value: principal.engagement_patterns.response_time_patterns.average_response_time_hours,
        label: 'Avg Response Time'
      },
      quality: {
        value: principal.engagement_patterns.engagement_depth,
        label: 'Quality Score'
      },
      health: {
        value: principal.relationship_health.overall_health_score,
        label: 'Health Score',
        trend: principal.relationship_health.health_trend
      }
    },
    insights: generateInsights(principal)
  }

  selectedCell.value = selectedCell.value?.principalId === principal.principal_id &&
                      selectedCell.value?.period === period.key ? null : cellData

  if (selectedCell.value) {
    emit('cellClick', cellData)
  }
}

function handleCellHover(principal: PrincipalEngagementAnalytics, period: TimePeriod, event: MouseEvent) {
  tooltip.value = {
    visible: true,
    x: event.clientX + 10,
    y: event.clientY - 10,
    title: `${principal.principal_name} - ${period.label}`,
    content: `${patternLabels[selectedPattern.value]}: ${getHeatmapValue(principal, period)}`
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

function generateInsights(principal: PrincipalEngagementAnalytics): string[] {
  const insights: string[] = []

  if (principal.relationship_health.health_trend === 'improving') {
    insights.push('Health score is improving')
  } else if (principal.relationship_health.health_trend === 'declining') {
    insights.push('Health score is declining - needs attention')
  }

  if (principal.risk_score >= 75) {
    insights.push('High risk relationship')
  }

  if (principal.days_since_last_interaction && principal.days_since_last_interaction > 30) {
    insights.push('No recent interactions')
  }

  if (principal.engagement_patterns.growth_opportunity_indicators.length > 0) {
    insights.push('Growth opportunities identified')
  }

  return insights
}

function updateHeatmap() {
  selectedCell.value = null
}

function handleExport() {
  const exportData = {
    pattern: selectedPattern.value,
    period: selectedPeriod.value,
    heatmapData: filteredPrincipals.value.map(principal => ({
      principalId: principal.principal_id,
      principalName: principal.principal_name,
      patternValue: getPatternValue(principal),
      healthScore: principal.relationship_health.overall_health_score,
      riskScore: principal.risk_score,
      timePeriods: timePeriods.value.map(period => ({
        period: period.key,
        label: period.label,
        value: getHeatmapValue(principal, period)
      }))
    })),
    summary: {
      topPerformers: topPerformers.value.map(p => ({
        name: p.principal_name,
        value: getPatternValue(p)
      })),
      needsAttention: needsAttention.value.map(p => ({
        name: p.principal_name,
        value: getPatternValue(p)
      }))
    },
    exportedAt: new Date().toISOString()
  }

  emit('export', exportData)
}

// Lifecycle
onMounted(async () => {
  if (allEngagements.value.length === 0) {
    isLoading.value = true
    try {
      await engagementStore.loadAllPrincipalsEngagement()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load engagement data'
    } finally {
      isLoading.value = false
    }
  }
})
</script>

<style scoped>
.engagement-pattern-heatmap {
  @apply bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.heatmap-cell {
  min-height: 3rem;
}
</style>