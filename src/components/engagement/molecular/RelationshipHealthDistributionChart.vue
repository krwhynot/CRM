<!--
Relationship Health Distribution Chart Component
Displays health score distribution across all principals with interactive filtering
-->
<template>
  <div class="health-distribution-chart">
    <!-- Chart Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Relationship Health Distribution
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Overview of health scores across {{ totalPrincipals }} principal relationships
        </p>
      </div>

      <!-- Chart Controls -->
      <div class="flex items-center space-x-3">
        <!-- View Toggle -->
        <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            @click="chartType = 'doughnut'"
            :class="[
              'px-3 py-1 text-sm font-medium rounded-md transition-colors',
              chartType === 'doughnut' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            Donut
          </button>
          <button
            @click="chartType = 'bar'"
            :class="[
              'px-3 py-1 text-sm font-medium rounded-md transition-colors',
              chartType === 'bar' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            Bar
          </button>
        </div>

        <!-- Filter Toggle -->
        <button
          @click="showFilters = !showFilters"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0110 21v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>

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

    <!-- Filters Panel -->
    <div v-if="showFilters" class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Relationship Stage Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Relationship Stage
          </label>
          <select
            v-model="selectedStage"
            @change="applyFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Stages</option>
            <option value="initial_contact">Initial Contact</option>
            <option value="relationship_building">Relationship Building</option>
            <option value="trust_establishment">Trust Establishment</option>
            <option value="partnership_development">Partnership Development</option>
            <option value="strategic_partnership">Strategic Partnership</option>
            <option value="at_risk">At Risk</option>
            <option value="dormant">Dormant</option>
          </select>
        </div>

        <!-- Risk Level Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk Level
          </label>
          <select
            v-model="selectedRiskLevel"
            @change="applyFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk (0-25)</option>
            <option value="medium">Medium Risk (26-50)</option>
            <option value="high">High Risk (51-75)</option>
            <option value="critical">Critical Risk (76-100)</option>
          </select>
        </div>

        <!-- Time Range Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Interaction
          </label>
          <select
            v-model="selectedTimeRange"
            @change="applyFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Any Time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
          </select>
        </div>
      </div>

      <!-- Clear Filters -->
      <div class="mt-4 flex justify-end">
        <button
          @click="clearFilters"
          class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          Clear All Filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Loading health distribution...</span>
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
      <!-- Chart -->
      <div class="chart-container mb-6" style="position: relative; height: 400px; width: 100%;">
        <component
          :is="chartComponent"
          :data="chartData"
          :options="chartOptions"
          ref="chartRef"
        />
      </div>

      <!-- Health Category Breakdown -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div
          v-for="(category, key) in healthCategories"
          :key="key"
          @click="handleCategoryClick(key as HealthCategory)"
          :class="[
            'p-4 rounded-lg border-2 cursor-pointer transition-all',
            selectedCategory === key 
              ? `border-${category.color}-500 bg-${category.color}-50 dark:bg-${category.color}-900/20` 
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ category.label }}
              </h4>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ category.range }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ filteredDistribution[key as HealthCategory] }}
              </div>
              <div :class="`text-xs text-${category.color}-600 dark:text-${category.color}-400`">
                {{ getPercentage(filteredDistribution[key as HealthCategory]) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Breakdown Table -->
      <div v-if="selectedCategory" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ healthCategories[selectedCategory].label }} Principals
        </h4>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="text-left py-2 text-gray-700 dark:text-gray-300">Principal</th>
                <th class="text-left py-2 text-gray-700 dark:text-gray-300">Health Score</th>
                <th class="text-left py-2 text-gray-700 dark:text-gray-300">Risk Score</th>
                <th class="text-left py-2 text-gray-700 dark:text-gray-300">Last Interaction</th>
                <th class="text-left py-2 text-gray-700 dark:text-gray-300">Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="principal in getCategoryPrincipals(selectedCategory)"
                :key="principal.principal_id"
                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                @click="handlePrincipalClick(principal)"
              >
                <td class="py-2">
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ principal.principal_name }}
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    {{ principal.principal_type }}
                  </div>
                </td>
                <td class="py-2">
                  <HealthScoreBadge :score="principal.relationship_health.overall_health_score" />
                </td>
                <td class="py-2">
                  <PriorityBadge
                    :priority="getRiskLevel(principal.risk_score)"
                    :text="principal.risk_score.toString()"
                  />
                </td>
                <td class="py-2 text-gray-600 dark:text-gray-400">
                  {{ formatLastInteraction(principal.last_interaction_date) }}
                </td>
                <td class="py-2">
                  <TrendIcon :trend="principal.relationship_health.health_trend" class="w-4 h-4" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No results message -->
        <div v-if="getCategoryPrincipals(selectedCategory).length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No principals found in this category with current filters.
        </div>
      </div>

      <!-- Summary Statistics -->
      <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Principals"
          :value="totalPrincipals"
          icon="users"
          color="blue"
        />
        <StatCard
          title="Avg Health Score"
          :value="averageHealthScore"
          suffix="/100"
          icon="heart"
          color="green"
        />
        <StatCard
          title="At Risk"
          :value="atRiskCount"
          icon="alert"
          color="red"
        />
        <StatCard
          title="Top Performers"
          :value="topPerformerCount"
          icon="star"
          color="yellow"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { format, formatDistanceToNow } from 'date-fns'
import { useEngagementStore } from '../../../stores/engagementStore'
import type { 
  PrincipalEngagementAnalytics,
  RelationshipStage 
} from '../../../types/engagement.types'
import StatCard from '../atomic/StatCard.vue'
import HealthScoreBadge from '../atomic/HealthScoreBadge.vue'
import PriorityBadge from '../atomic/PriorityBadge.vue'
import TrendIcon from '../atomic/TrendIcon.vue'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Types
type HealthCategory = 'excellent' | 'good' | 'average' | 'poor' | 'critical'
type ChartType = 'doughnut' | 'bar'

// Props
interface Props {
  interactive?: boolean
  showFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interactive: true,
  showFilters: true
})

// Emits
const emit = defineEmits<{
  categoryClick: [category: HealthCategory, principals: PrincipalEngagementAnalytics[]]
  principalClick: [principal: PrincipalEngagementAnalytics]
  export: [data: any]
}>()

// Store
const engagementStore = useEngagementStore()

// Reactive state
const chartRef = ref<any>(null)
const chartType = ref<ChartType>('doughnut')
const showFilters = ref(false)
const selectedCategory = ref<HealthCategory | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Filters
const selectedStage = ref<RelationshipStage | ''>('')
const selectedRiskLevel = ref<string>('')
const selectedTimeRange = ref<string>('')

// Health categories configuration
const healthCategories = {
  excellent: {
    label: 'Excellent',
    range: '90-100',
    color: 'green',
    min: 90,
    max: 100
  },
  good: {
    label: 'Good',
    range: '75-89',
    color: 'blue',
    min: 75,
    max: 89
  },
  average: {
    label: 'Average',
    range: '60-74',
    color: 'yellow',
    min: 60,
    max: 74
  },
  poor: {
    label: 'Poor',
    range: '40-59',
    color: 'orange',
    min: 40,
    max: 59
  },
  critical: {
    label: 'Critical',
    range: '0-39',
    color: 'red',
    min: 0,
    max: 39
  }
} as const

// Computed properties
const allEngagements = computed(() => engagementStore.allEngagements)

// Filtered engagements based on selected filters
const filteredEngagements = computed(() => {
  let filtered = allEngagements.value

  // Filter by relationship stage
  if (selectedStage.value) {
    filtered = filtered.filter(engagement =>
      engagement.distributor_relationships.some(rel =>
        rel.relationship_stage === selectedStage.value
      )
    )
  }

  // Filter by risk level
  if (selectedRiskLevel.value) {
    const riskRanges = {
      'low': [0, 25],
      'medium': [26, 50],
      'high': [51, 75],
      'critical': [76, 100]
    }
    const [min, max] = riskRanges[selectedRiskLevel.value as keyof typeof riskRanges]
    filtered = filtered.filter(engagement =>
      engagement.risk_score >= min && engagement.risk_score <= max
    )
  }

  // Filter by time since last interaction
  if (selectedTimeRange.value) {
    const days = parseInt(selectedTimeRange.value)
    filtered = filtered.filter(engagement => {
      if (!engagement.last_interaction_date) return false
      
      const daysSinceInteraction = engagement.days_since_last_interaction || 0
      return daysSinceInteraction <= days
    })
  }

  return filtered
})

// Health distribution calculation
const filteredDistribution = computed(() => {
  const distribution = {
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0,
    critical: 0
  }

  filteredEngagements.value.forEach(engagement => {
    const score = engagement.relationship_health.overall_health_score
    
    if (score >= 90) distribution.excellent++
    else if (score >= 75) distribution.good++
    else if (score >= 60) distribution.average++
    else if (score >= 40) distribution.poor++
    else distribution.critical++
  })

  return distribution
})

// Chart component selection
const chartComponent = computed(() => {
  return chartType.value === 'doughnut' ? Doughnut : Bar
})

// Chart data
const chartData = computed(() => {
  const labels = Object.keys(healthCategories).map(
    key => healthCategories[key as HealthCategory].label
  )
  const data = Object.values(filteredDistribution.value)
  const backgroundColors = Object.keys(healthCategories).map(key => {
    const color = healthCategories[key as HealthCategory].color
    const colorMap = {
      green: 'rgba(34, 197, 94, 0.8)',
      blue: 'rgba(59, 130, 246, 0.8)',
      yellow: 'rgba(234, 179, 8, 0.8)',
      orange: 'rgba(249, 115, 22, 0.8)',
      red: 'rgba(239, 68, 68, 0.8)'
    }
    return colorMap[color as keyof typeof colorMap]
  })

  return {
    labels,
    datasets: [
      {
        label: 'Number of Principals',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }
    ]
  }
})

// Chart options
const chartOptions = computed(() => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((context.parsed * 100) / total).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
    },
    onClick: (event: any, elements: any[]) => {
      if (!props.interactive || elements.length === 0) return
      
      const index = elements[0].index
      const categoryKey = Object.keys(healthCategories)[index] as HealthCategory
      handleCategoryClick(categoryKey)
    }
  }

  if (chartType.value === 'bar') {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Principals'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Health Category'
          }
        }
      }
    }
  } else {
    return {
      ...baseOptions,
      cutout: '60%'
    }
  }
})

// Summary statistics
const totalPrincipals = computed(() => filteredEngagements.value.length)

const averageHealthScore = computed(() => {
  if (filteredEngagements.value.length === 0) return 0
  
  const sum = filteredEngagements.value.reduce(
    (total, engagement) => total + engagement.relationship_health.overall_health_score, 
    0
  )
  return Math.round(sum / filteredEngagements.value.length)
})

const atRiskCount = computed(() => 
  filteredEngagements.value.filter(engagement => engagement.risk_score >= 75).length
)

const topPerformerCount = computed(() => 
  filteredEngagements.value.filter(engagement => 
    engagement.relationship_health.overall_health_score >= 90
  ).length
)

// Helper functions
function getPercentage(count: number): string {
  if (totalPrincipals.value === 0) return '0'
  return ((count * 100) / totalPrincipals.value).toFixed(1)
}

function getCategoryPrincipals(category: HealthCategory): PrincipalEngagementAnalytics[] {
  const { min, max } = healthCategories[category]
  return filteredEngagements.value.filter(engagement => {
    const score = engagement.relationship_health.overall_health_score
    return score >= min && score <= max
  })
}

function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (riskScore >= 75) return 'critical'
  if (riskScore >= 50) return 'high'
  if (riskScore >= 25) return 'medium'
  return 'low'
}

function formatLastInteraction(dateString: string | null): string {
  if (!dateString) return 'Never'
  
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  } catch {
    return 'Unknown'
  }
}

// Event handlers
function handleCategoryClick(category: HealthCategory) {
  selectedCategory.value = selectedCategory.value === category ? null : category
  if (selectedCategory.value) {
    const principals = getCategoryPrincipals(category)
    emit('categoryClick', category, principals)
  }
}

function handlePrincipalClick(principal: PrincipalEngagementAnalytics) {
  emit('principalClick', principal)
}

function applyFilters() {
  selectedCategory.value = null
}

function clearFilters() {
  selectedStage.value = ''
  selectedRiskLevel.value = ''
  selectedTimeRange.value = ''
  selectedCategory.value = null
}

function handleExport() {
  const exportData = {
    distribution: filteredDistribution.value,
    totalPrincipals: totalPrincipals.value,
    averageHealthScore: averageHealthScore.value,
    filters: {
      stage: selectedStage.value,
      riskLevel: selectedRiskLevel.value,
      timeRange: selectedTimeRange.value
    },
    principals: filteredEngagements.value.map(engagement => ({
      id: engagement.principal_id,
      name: engagement.principal_name,
      healthScore: engagement.relationship_health.overall_health_score,
      riskScore: engagement.risk_score,
      lastInteraction: engagement.last_interaction_date
    })),
    exportedAt: new Date().toISOString()
  }
  
  emit('export', exportData)
}

// Watchers
watch([selectedStage, selectedRiskLevel, selectedTimeRange], () => {
  applyFilters()
})

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
.health-distribution-chart {
  @apply bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.chart-container {
  @apply relative;
}

.chart-container canvas {
  @apply rounded-lg;
}
</style>