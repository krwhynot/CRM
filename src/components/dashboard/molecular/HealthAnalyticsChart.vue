<!--
  Health Analytics Chart - Visual representation of relationship health trends
  
  Features:
  - Health score trends over time
  - Multiple principals comparison
  - Interactive hover states
  - Responsive SVG charts
  - Color-coded health levels
-->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Relationship Health Trends</h3>
        <p class="text-sm text-gray-600 mt-1">Health score evolution over time</p>
      </div>
      
      <!-- Chart Controls -->
      <div class="flex items-center space-x-3">
        <!-- Time Period -->
        <select
          v-model="selectedPeriod"
          @change="updateChart"
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="6m">Last 6 months</option>
        </select>

        <!-- Chart Type -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            :class="[
              'px-3 py-1 text-xs font-medium rounded-md transition-colors',
              chartType === 'trend' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="chartType = 'trend'"
          >
            Trends
          </button>
          <button
            :class="[
              'px-3 py-1 text-xs font-medium rounded-md transition-colors',
              chartType === 'distribution' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="chartType = 'distribution'"
          >
            Distribution
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="relative" :style="{ height: chartHeight + 'px' }">
      <!-- Trend Chart -->
      <div v-if="chartType === 'trend'" class="w-full h-full">
        <svg :width="chartWidth" :height="chartHeight" class="w-full h-full">
          <!-- Grid Lines -->
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <!-- Y-Axis Labels -->
          <g class="y-axis">
            <text v-for="tick in yAxisTicks" :key="tick.value" 
                  :x="40" :y="tick.y + 4" 
                  class="text-xs fill-gray-500 text-anchor-end">
              {{ tick.label }}
            </text>
          </g>

          <!-- X-Axis Labels -->
          <g class="x-axis">
            <text v-for="tick in xAxisTicks" :key="tick.label"
                  :x="tick.x" :y="chartHeight - 10"
                  class="text-xs fill-gray-500 text-anchor-middle">
              {{ tick.label }}
            </text>
          </g>

          <!-- Health Score Lines -->
          <g v-for="principal in chartData" :key="principal.id" class="principal-line">
            <path
              :d="getLinePath(principal.dataPoints)"
              :stroke="getHealthColor(principal.currentHealth)"
              stroke-width="2"
              fill="none"
              class="transition-all duration-200 hover:stroke-width-3"
            />
            
            <!-- Data Points -->
            <circle
              v-for="(point, index) in principal.dataPoints"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              :r="4"
              :fill="getHealthColor(principal.currentHealth)"
              class="transition-all duration-200 hover:r-6 cursor-pointer"
              @mouseenter="showTooltip(point, principal, $event)"
              @mouseleave="hideTooltip"
            />
          </g>
        </svg>

        <!-- Chart Legend -->
        <div class="flex flex-wrap gap-4 mt-4 px-12">
          <div v-for="principal in chartData" :key="principal.id" class="flex items-center space-x-2">
            <div 
              :class="['w-3 h-3 rounded-full', `bg-${getHealthColorClass(principal.currentHealth)}-500`]"
            ></div>
            <span class="text-sm text-gray-600">{{ principal.name }}</span>
          </div>
        </div>
      </div>

      <!-- Distribution Chart -->
      <div v-else-if="chartType === 'distribution'" class="w-full h-full flex items-end justify-center space-x-8">
        <div v-for="status in healthStatuses" :key="status.name" class="flex flex-col items-center space-y-2">
          <!-- Bar -->
          <div class="relative">
            <div 
              :class="[
                'w-12 rounded-t-lg transition-all duration-500 flex items-end justify-center text-white text-xs font-semibold',
                `bg-${status.color}-500`
              ]"
              :style="{ 
                height: (status.count / maxCount * (chartHeight - 80)) + 'px',
                minHeight: status.count > 0 ? '20px' : '0px'
              }"
            >
              <span v-if="status.count > 0" class="mb-1">{{ status.count }}</span>
            </div>
          </div>
          
          <!-- Label -->
          <div class="text-center">
            <div class="text-xs font-medium text-gray-700 capitalize">{{ status.name }}</div>
            <div class="text-xs text-gray-500">{{ status.percentage }}%</div>
          </div>
        </div>
      </div>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        :style="{ 
          left: tooltip.x + 'px', 
          top: tooltip.y + 'px',
          transform: 'translate(-50%, -100%)'
        }"
        class="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 shadow-lg"
      >
        <div class="font-semibold">{{ tooltip.principalName }}</div>
        <div>Health Score: {{ tooltip.score }}/100</div>
        <div>{{ tooltip.date }}</div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600">{{ improvingCount }}</div>
        <div class="text-xs text-gray-600">Improving</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-700">{{ stableCount }}</div>
        <div class="text-xs text-gray-600">Stable</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-red-600">{{ decliningCount }}</div>
        <div class="text-xs text-gray-600">Declining</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ChartDataPoint {
  x: number
  y: number
  score: number
  date: string
}

interface PrincipalChartData {
  id: string
  name: string
  currentHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  trend: 'up' | 'down' | 'stable'
  dataPoints: ChartDataPoint[]
}

interface HealthStatus {
  name: string
  count: number
  percentage: number
  color: string
}

interface Props {
  data?: PrincipalChartData[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  height: 300
})

// Local state
const chartType = ref<'trend' | 'distribution'>('trend')
const selectedPeriod = ref('30d')
const chartWidth = ref(600)
const chartHeight = ref(props.height)

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  principalName: '',
  score: 0,
  date: ''
})

// Mock data for demonstration
const chartData = ref<PrincipalChartData[]>([
  {
    id: '1',
    name: 'Acme Foods Corp',
    currentHealth: 'excellent',
    trend: 'up',
    dataPoints: [
      { x: 60, y: 180, score: 85, date: '2024-01-01' },
      { x: 120, y: 160, score: 88, date: '2024-01-08' },
      { x: 180, y: 140, score: 92, date: '2024-01-15' },
      { x: 240, y: 120, score: 95, date: '2024-01-22' },
      { x: 300, y: 100, score: 98, date: '2024-01-29' }
    ]
  },
  {
    id: '2',
    name: 'Metro Distribution',
    currentHealth: 'good',
    trend: 'stable',
    dataPoints: [
      { x: 60, y: 160, score: 75, date: '2024-01-01' },
      { x: 120, y: 150, score: 78, date: '2024-01-08' },
      { x: 180, y: 155, score: 76, date: '2024-01-15' },
      { x: 240, y: 145, score: 79, date: '2024-01-22' },
      { x: 300, y: 150, score: 77, date: '2024-01-29' }
    ]
  },
  {
    id: '3',
    name: 'Global Kitchens',
    currentHealth: 'fair',
    trend: 'down',
    dataPoints: [
      { x: 60, y: 140, score: 65, date: '2024-01-01' },
      { x: 120, y: 160, score: 62, date: '2024-01-08' },
      { x: 180, y: 180, score: 58, date: '2024-01-15' },
      { x: 240, y: 200, score: 54, date: '2024-01-22' },
      { x: 300, y: 220, score: 50, date: '2024-01-29' }
    ]
  }
])

// Computed properties
const yAxisTicks = computed(() => {
  const ticks = []
  for (let i = 0; i <= 5; i++) {
    const value = 100 - (i * 20)
    const y = 50 + (i * (chartHeight.value - 100) / 5)
    ticks.push({
      value,
      y,
      label: `${value}`
    })
  }
  return ticks
})

const xAxisTicks = computed(() => {
  const ticks = []
  const tickCount = 5
  for (let i = 0; i < tickCount; i++) {
    const x = 60 + (i * (chartWidth.value - 120) / (tickCount - 1))
    ticks.push({
      x,
      label: `Week ${i + 1}`
    })
  }
  return ticks
})

const healthStatuses = computed(() => {
  const statusCounts = {
    excellent: 0,
    good: 0, 
    fair: 0,
    poor: 0,
    critical: 0
  }

  chartData.value.forEach(principal => {
    statusCounts[principal.currentHealth]++
  })

  const total = chartData.value.length

  return [
    { 
      name: 'excellent', 
      count: statusCounts.excellent, 
      percentage: Math.round((statusCounts.excellent / total) * 100) || 0,
      color: 'green'
    },
    { 
      name: 'good', 
      count: statusCounts.good, 
      percentage: Math.round((statusCounts.good / total) * 100) || 0,
      color: 'blue'
    },
    { 
      name: 'fair', 
      count: statusCounts.fair, 
      percentage: Math.round((statusCounts.fair / total) * 100) || 0,
      color: 'yellow'
    },
    { 
      name: 'poor', 
      count: statusCounts.poor, 
      percentage: Math.round((statusCounts.poor / total) * 100) || 0,
      color: 'orange'
    },
    { 
      name: 'critical', 
      count: statusCounts.critical, 
      percentage: Math.round((statusCounts.critical / total) * 100) || 0,
      color: 'red'
    }
  ]
})

const maxCount = computed(() => {
  return Math.max(...healthStatuses.value.map(s => s.count))
})

const improvingCount = computed(() => {
  return chartData.value.filter(p => p.trend === 'up').length
})

const stableCount = computed(() => {
  return chartData.value.filter(p => p.trend === 'stable').length
})

const decliningCount = computed(() => {
  return chartData.value.filter(p => p.trend === 'down').length
})

// Methods
function getLinePath(points: ChartDataPoint[]): string {
  if (points.length === 0) return ''
  
  const path = points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${command} ${point.x} ${point.y}`
  }).join(' ')
  
  return path
}

function getHealthColor(health: string): string {
  const colors = {
    excellent: '#10b981',
    good: '#3b82f6',
    fair: '#f59e0b',
    poor: '#f97316',
    critical: '#ef4444'
  }
  return colors[health as keyof typeof colors] || colors.fair
}

function getHealthColorClass(health: string): string {
  const colors = {
    excellent: 'green',
    good: 'blue',
    fair: 'yellow',
    poor: 'orange',
    critical: 'red'
  }
  return colors[health as keyof typeof colors] || 'gray'
}

function showTooltip(point: ChartDataPoint, principal: PrincipalChartData, event: MouseEvent) {
  const rect = (event.target as Element).getBoundingClientRect()
  const container = (event.target as Element).closest('.relative')?.getBoundingClientRect()
  
  if (container) {
    tooltip.value = {
      visible: true,
      x: rect.left - container.left,
      y: rect.top - container.top,
      principalName: principal.name,
      score: point.score,
      date: new Date(point.date).toLocaleDateString()
    }
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

function updateChart() {
  // In a real implementation, this would fetch new data based on selectedPeriod
  console.log('Updating chart for period:', selectedPeriod.value)
}

// Lifecycle
onMounted(() => {
  // Set initial chart width based on container
  chartWidth.value = 600
})
</script>

<style scoped>
/* Custom styles for better chart presentation */
.principal-line:hover {
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.1));
}

.bg-green-500 { background-color: #10b981; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-yellow-500 { background-color: #f59e0b; }
.bg-orange-500 { background-color: #f97316; }
.bg-red-500 { background-color: #ef4444; }
</style>