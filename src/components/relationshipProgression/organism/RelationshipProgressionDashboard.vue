<template>
  <div class="space-y-6">
    <!-- Dashboard Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Relationship Progression</h1>
        <p class="text-gray-600 mt-1">Track partnership development and relationship milestones</p>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewMode === 'grid' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <Grid3x3 class="w-4 h-4 mr-1.5" />
            Grid
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <List class="w-4 h-4 mr-1.5" />
            List
          </button>
        </div>
        
        <!-- Filter Button -->
        <button
          @click="showFilters = !showFilters"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
            showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          ]"
        >
          <Filter class="w-4 h-4 mr-2" />
          Filters
          <ChevronDown 
            :class="[
              'w-4 h-4 ml-1 transition-transform',
              showFilters ? 'rotate-180' : ''
            ]"
          />
        </button>
        
        <!-- Refresh Button -->
        <button
          @click="refreshData"
          :disabled="loading"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw :class="['w-4 h-4', loading ? 'animate-spin' : '']" />
        </button>
      </div>
    </div>
    
    <!-- Filters Panel -->
    <div v-if="showFilters" class="bg-white border rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Stage Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Stage</label>
          <select 
            v-model="filters.stage"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Stages</option>
            <option 
              v-for="stage in RELATIONSHIP_STAGES" 
              :key="stage.value"
              :value="stage.value"
            >
              {{ stage.label }}
            </option>
          </select>
        </div>
        
        <!-- Maturity Score Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Maturity Score: {{ filters.maturityRange[0] }}-{{ filters.maturityRange[1] }}
          </label>
          <input
            v-model.number="filters.maturityRange[1]"
            type="range"
            min="0"
            max="100"
            class="w-full"
          />
        </div>
        
        <!-- Health Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Health Status</label>
          <select 
            v-model="filters.healthStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Health Levels</option>
            <option value="excellent">Excellent (90+)</option>
            <option value="good">Good (80-89)</option>
            <option value="fair">Fair (70-79)</option>
            <option value="at-risk">At Risk (60-69)</option>
            <option value="critical">Critical (<60)</option>
          </select>
        </div>
        
        <!-- Sort By -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select 
            v-model="filters.sortBy"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="maturity_desc">Maturity (High to Low)</option>
            <option value="maturity_asc">Maturity (Low to High)</option>
            <option value="updated_desc">Recently Updated</option>
            <option value="stage_asc">Stage Progression</option>
            <option value="name_asc">Organization Name</option>
          </select>
        </div>
      </div>
      
      <!-- Applied Filters Summary -->
      <div v-if="hasActiveFilters" class="flex items-center gap-2 pt-2 border-t">
        <span class="text-sm text-gray-600">Active filters:</span>
        <div class="flex items-center gap-2">
          <span 
            v-if="filters.stage"
            class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
          >
            Stage: {{ getStageLabel(filters.stage) }}
            <button @click="filters.stage = ''" class="hover:text-blue-900">
              <X class="w-3 h-3" />
            </button>
          </span>
          <span 
            v-if="filters.healthStatus"
            class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
          >
            Health: {{ filters.healthStatus }}
            <button @click="filters.healthStatus = ''" class="hover:text-green-900">
              <X class="w-3 h-3" />
            </button>
          </span>
          <button 
            @click="clearFilters"
            class="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
    
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Relationships</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.total_relationships }}</p>
          </div>
          <Users class="w-8 h-8 text-blue-500" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Avg. Maturity Score</p>
            <p class="text-2xl font-bold text-gray-900">{{ metrics.avg_maturity_score }}</p>
          </div>
          <TrendingUp class="w-8 h-8 text-green-500" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Strategic Partnerships</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metrics.by_stage?.strategic_collaboration || 0 }}
            </p>
          </div>
          <Target class="w-8 h-8 text-purple-500" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">At Risk</p>
            <p class="text-2xl font-bold text-red-600">{{ atRiskCount }}</p>
          </div>
          <AlertTriangle class="w-8 h-8 text-red-500" />
        </div>
      </div>
    </div>
    
    <!-- Stage Distribution -->
    <div class="bg-white rounded-lg border p-4">
      <h3 class="font-medium text-gray-900 mb-4">Relationship Stage Distribution</h3>
      <div class="grid grid-cols-4 gap-4">
        <div 
          v-for="stage in RELATIONSHIP_STAGES" 
          :key="stage.value"
          class="text-center"
        >
          <div class="text-2xl font-bold text-gray-900">
            {{ metrics.by_stage?.[stage.value] || 0 }}
          </div>
          <div class="text-sm text-gray-600 mt-1">{{ stage.label }}</div>
          <div class="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-500 rounded-full h-2 transition-all duration-300"
              :style="{ width: getStagePercentage(stage.value) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="bg-white rounded-lg border">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-2">
          <RefreshCw class="w-5 h-5 animate-spin text-blue-500" />
          <span class="text-gray-600">Loading relationships...</span>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-gray-900 font-medium mb-2">Failed to load relationship data</p>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <button
          @click="refreshData"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredProgressions.length === 0" class="text-center py-12">
        <Users class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-900 font-medium mb-2">
          {{ hasActiveFilters ? 'No relationships match your filters' : 'No relationship data available' }}
        </p>
        <p class="text-gray-500 mb-4">
          {{ hasActiveFilters 
              ? 'Try adjusting your filters to see more results' 
              : 'Relationship progressions will appear here as organizations are added' 
          }}
        </p>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          Clear Filters
        </button>
      </div>
      
      <!-- Grid View -->
      <div 
        v-else-if="viewMode === 'grid'" 
        class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6"
      >
        <RelationshipOverviewCard
          v-for="progression in paginatedProgressions"
          :key="progression.id"
          :progression="progression"
          :milestones-count="getMilestonesCount(progression.id)"
          :recent-activities="getRecentActivities(progression.id)"
          @view-details="handleViewDetails(progression)"
          @add-milestone="handleAddMilestone(progression)"
          @log-activity="handleLogActivity(progression)"
          @assess-health="handleAssessHealth(progression)"
          @view-analytics="handleViewAnalytics(progression)"
        />
      </div>
      
      <!-- List View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maturity
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trust Level
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Milestones
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="progression in paginatedProgressions" 
              :key="progression.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">
                      {{ progression.organization_name || 'Unknown Organization' }}
                    </div>
                    <div class="text-sm text-gray-500 capitalize">
                      {{ progression.organization_type?.replace('_', ' ') }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <RelationshipStageBadge 
                  :stage="progression.current_stage"
                  size="sm"
                />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900">
                    {{ progression.relationship_maturity_score }}
                  </span>
                  <HealthScoreIndicator
                    :score="progression.relationship_maturity_score"
                    size="xs"
                    :show-label="false"
                    :show-description="false"
                  />
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                  <Heart 
                    v-for="i in 5" 
                    :key="i"
                    :class="[
                      'w-3 h-3',
                      i <= Math.round(progression.trust_level_score / 20) 
                        ? 'text-red-400 fill-current' 
                        : 'text-gray-200'
                    ]"
                  />
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-medium text-gray-900">
                  {{ getMilestonesCount(progression.id) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatTimeAgo(progression.updated_at) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="handleViewDetails(progression)"
                    class="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleViewAnalytics(progression)"
                    class="p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
                    title="View Analytics"
                  >
                    <BarChart3 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Pagination -->
    <div 
      v-if="totalPages > 1" 
      class="flex items-center justify-between bg-white px-6 py-3 border rounded-lg"
    >
      <div class="text-sm text-gray-700">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to 
        {{ Math.min(currentPage * pageSize, filteredProgressions.length) }} of 
        {{ filteredProgressions.length }} results
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <div class="flex items-center gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-1 text-sm font-medium rounded-lg transition-colors',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useRelationshipProgressionStore } from '@/stores/relationshipProgressionStore'
import { useOrganizationStore } from '@/stores/organizationStore'
import type { RelationshipProgression, RelationshipStage } from '@/types/relationshipProgression.types'
import { RELATIONSHIP_STAGES } from '@/types/relationshipProgression.types'

// Components
import RelationshipStageBadge from '../atomic/RelationshipStageBadge.vue'
import HealthScoreIndicator from '../atomic/HealthScoreIndicator.vue'
import RelationshipOverviewCard from '../molecular/RelationshipOverviewCard.vue'

// Lucide icons
import { 
  Grid3x3, 
  List, 
  Filter, 
  ChevronDown, 
  RefreshCw, 
  X, 
  Users, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  AlertCircle, 
  Building,
  Heart,
  Eye,
  BarChart3
} from 'lucide-vue-next'

// Store instances
const progressionStore = useRelationshipProgressionStore()
const organizationStore = useOrganizationStore()

// Reactive state
const viewMode = ref<'grid' | 'list'>('grid')
const showFilters = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)

// Filters
const filters = ref({
  stage: '' as RelationshipStage | '',
  maturityRange: [0, 100] as [number, number],
  healthStatus: '',
  sortBy: 'maturity_desc'
})

// Computed properties
const loading = computed(() => progressionStore.loading)
const error = computed(() => progressionStore.error)
const progressions = computed(() => progressionStore.progressions)
const metrics = computed(() => progressionStore.progressionMetrics)

const hasActiveFilters = computed(() => {
  return filters.value.stage !== '' || 
         filters.value.healthStatus !== '' ||
         filters.value.maturityRange[1] < 100
})

const atRiskCount = computed(() => {
  return progressions.value.filter(p => {
    // Consider relationships at risk if maturity score < 60 or trust level < 40
    return p.relationship_maturity_score < 60 || p.trust_level_score < 40
  }).length
})

// Enhanced progressions with organization data
const enhancedProgressions = computed(() => {
  return progressions.value.map(progression => {
    const organization = organizationStore.organizations.find(org => org.id === progression.organization_id)
    return {
      ...progression,
      organization_name: organization?.name,
      organization_type: organization?.type
    }
  })
})

const filteredProgressions = computed(() => {
  let result = [...enhancedProgressions.value]
  
  // Apply filters
  if (filters.value.stage) {
    result = result.filter(p => p.current_stage === filters.value.stage)
  }
  
  if (filters.value.healthStatus) {
    result = result.filter(p => {
      const score = p.relationship_maturity_score
      switch (filters.value.healthStatus) {
        case 'excellent': return score >= 90
        case 'good': return score >= 80 && score < 90
        case 'fair': return score >= 70 && score < 80
        case 'at-risk': return score >= 60 && score < 70
        case 'critical': return score < 60
        default: return true
      }
    })
  }
  
  if (filters.value.maturityRange[1] < 100) {
    result = result.filter(p => p.relationship_maturity_score <= filters.value.maturityRange[1])
  }
  
  // Apply sorting
  switch (filters.value.sortBy) {
    case 'maturity_desc':
      result.sort((a, b) => b.relationship_maturity_score - a.relationship_maturity_score)
      break
    case 'maturity_asc':
      result.sort((a, b) => a.relationship_maturity_score - b.relationship_maturity_score)
      break
    case 'updated_desc':
      result.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
      break
    case 'stage_asc':
      const stageOrder = ['initial_contact', 'trust_building', 'partnership_deepening', 'strategic_collaboration']
      result.sort((a, b) => stageOrder.indexOf(a.current_stage) - stageOrder.indexOf(b.current_stage))
      break
    case 'name_asc':
      result.sort((a, b) => (a.organization_name || '').localeCompare(b.organization_name || ''))
      break
  }
  
  return result
})

const totalPages = computed(() => Math.ceil(filteredProgressions.value.length / pageSize.value))
const paginatedProgressions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProgressions.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
async function refreshData() {
  try {
    await Promise.all([
      progressionStore.fetchProgressions(),
      organizationStore.fetchOrganizations()
    ])
  } catch (error) {
    console.error('Failed to refresh data:', error)
  }
}

function clearFilters() {
  filters.value = {
    stage: '',
    maturityRange: [0, 100],
    healthStatus: '',
    sortBy: 'maturity_desc'
  }
}

function getStageLabel(stage: string) {
  return RELATIONSHIP_STAGES.find(s => s.value === stage)?.label || stage
}

function getStagePercentage(stage: RelationshipStage) {
  const total = metrics.value.total_relationships
  const stageCount = metrics.value.by_stage?.[stage] || 0
  return total > 0 ? (stageCount / total) * 100 : 0
}

function getMilestonesCount(progressionId: string) {
  return progressionStore.getMilestonesForProgression(progressionId).length
}

function getRecentActivities(progressionId: string) {
  return progressionStore.getTrustActivitiesForProgression(progressionId).slice(0, 3)
}

function formatTimeAgo(dateString: string | undefined) {
  if (!dateString) return 'Unknown'
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

// Event handlers
function handleViewDetails(progression: RelationshipProgression) {
  // Emit event or navigate to details view
  console.log('View details for:', progression.id)
}

function handleAddMilestone(progression: RelationshipProgression) {
  // Emit event or show milestone modal
  console.log('Add milestone for:', progression.id)
}

function handleLogActivity(progression: RelationshipProgression) {
  // Emit event or show activity modal
  console.log('Log activity for:', progression.id)
}

function handleAssessHealth(progression: RelationshipProgression) {
  // Emit event or show health assessment modal
  console.log('Assess health for:', progression.id)
}

function handleViewAnalytics(progression: RelationshipProgression) {
  // Emit event or navigate to analytics view
  console.log('View analytics for:', progression.id)
}

// Watch for filter changes and reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Initialize data
onMounted(async () => {
  if (progressions.value.length === 0) {
    await refreshData()
  }
})
</script>