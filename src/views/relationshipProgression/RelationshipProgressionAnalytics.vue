<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <router-link 
            to="/relationships/progression" 
            class="hover:text-gray-700 transition-colors"
          >
            Relationship Progression
          </router-link>
          <ChevronRight class="w-4 h-4" />
          <router-link 
            :to="{ 
              name: 'relationship-progression-details', 
              params: { id: progressionId } 
            }"
            class="hover:text-gray-700 transition-colors"
          >
            {{ organizationName }}
          </router-link>
          <ChevronRight class="w-4 h-4" />
          <span class="font-medium text-gray-900">Analytics</span>
        </nav>
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Relationship Analytics
            </h1>
            <p class="text-gray-600 mt-1">
              Deep insights into {{ organizationName }} relationship progression
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <select 
              v-model="timeRange"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 6 months</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>
            
            <button
              @click="exportAnalytics"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-2">
          <RefreshCw class="w-5 h-5 animate-spin text-blue-500" />
          <span class="text-gray-600">Loading analytics...</span>
        </div>
      </div>
      
      <!-- Main Analytics Content -->
      <div v-else-if="progression" class="space-y-8">
        <!-- Key Performance Indicators -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Current Stage</p>
                <RelationshipStageBadge 
                  :stage="progression.current_stage"
                  size="md"
                />
              </div>
              <ProgressionArrow
                :from-stage="previousStage"
                :to-stage="progression.current_stage"
                :progression-date="progression.last_progression_update"
                size="md"
              />
            </div>
          </div>
          
          <div class="bg-white rounded-lg border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Progression Rate</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ progressionRate }}%
                </p>
                <p class="text-xs text-gray-500 mt-1">vs. average</p>
              </div>
              <TrendingUp 
                :class="[
                  'w-8 h-8',
                  progressionRate > 0 ? 'text-green-500' : 'text-red-500'
                ]"
              />
            </div>
          </div>
          
          <div class="bg-white rounded-lg border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Trust Momentum</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ trustMomentum > 0 ? '+' : '' }}{{ trustMomentum }}
                </p>
                <p class="text-xs text-gray-500 mt-1">30-day change</p>
              </div>
              <Heart 
                :class="[
                  'w-8 h-8',
                  trustMomentum > 0 ? 'text-red-500 fill-current' : 'text-gray-400'
                ]"
              />
            </div>
          </div>
          
          <div class="bg-white rounded-lg border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Activity Frequency</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ activityFrequency }}
                </p>
                <p class="text-xs text-gray-500 mt-1">per month</p>
              </div>
              <Activity class="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
        
        <!-- Charts and Visualizations -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Maturity Score Trend -->
          <div class="bg-white rounded-lg border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Maturity Score Trend
            </h3>
            
            <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div class="text-center">
                <BarChart3 class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-600">Chart visualization would go here</p>
                <p class="text-sm text-gray-500">Integration with charting library needed</p>
              </div>
            </div>
            
            <!-- Score Summary -->
            <div class="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-lg font-semibold text-gray-900">
                  {{ progression.relationship_maturity_score }}
                </p>
                <p class="text-xs text-gray-500">Current</p>
              </div>
              <div>
                <p class="text-lg font-semibold text-green-600">
                  +{{ Math.max(0, progression.relationship_maturity_score - 65) }}
                </p>
                <p class="text-xs text-gray-500">Change</p>
              </div>
              <div>
                <p class="text-lg font-semibold text-blue-600">85</p>
                <p class="text-xs text-gray-500">Target</p>
              </div>
            </div>
          </div>
          
          <!-- Trust Activities Impact -->
          <div class="bg-white rounded-lg border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Trust Activities Impact
            </h3>
            
            <div class="space-y-3">
              <div 
                v-for="activity in topActivities" 
                :key="activity.id"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <TrustActivityTypeIcon
                    :activity-type="activity.activity_type"
                    :impact-level="activity.impact_on_trust"
                    size="xs"
                    variant="subtle"
                  />
                  <span class="text-sm text-gray-900">{{ activity.title }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full"
                      :class="getImpactColor(activity.impact_on_trust)"
                      :style="{ width: `${Math.abs(activity.impact_on_trust) * 20}%` }"
                    />
                  </div>
                  <span class="text-xs text-gray-600 w-8 text-right">
                    {{ activity.impact_on_trust > 0 ? '+' : '' }}{{ activity.impact_on_trust }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Milestones Achievement Timeline -->
        <div class="bg-white rounded-lg border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Milestone Achievement Timeline
          </h3>
          
          <div class="relative">
            <!-- Timeline visualization -->
            <div class="flex items-center justify-between mb-6">
              <div 
                v-for="(stage, index) in stageProgression" 
                :key="stage.value"
                class="flex-1 relative"
              >
                <div class="flex items-center">
                  <div 
                    :class="[
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      stage.achieved 
                        ? 'bg-green-500 border-green-500' 
                        : 'bg-white border-gray-300'
                    ]"
                  >
                    <Check 
                      v-if="stage.achieved"
                      class="w-2.5 h-2.5 text-white" 
                    />
                  </div>
                  <div 
                    v-if="index < stageProgression.length - 1"
                    :class="[
                      'flex-1 h-0.5 ml-2',
                      stage.achieved && stageProgression[index + 1]?.achieved 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    ]"
                  />
                </div>
                <div class="mt-2 text-xs text-gray-600 text-center">
                  {{ stage.label }}
                </div>
                <div v-if="stage.date" class="text-xs text-gray-400 text-center">
                  {{ formatDate(stage.date) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Milestone Cards -->
          <div class="space-y-4">
            <MilestoneCard
              v-for="milestone in sortedMilestones"
              :key="milestone.id"
              :milestone="milestone"
              :compact="true"
            />
          </div>
        </div>
        
        <!-- Recommendations -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb class="w-5 h-5 text-blue-600" />
            Recommendations
          </h3>
          
          <div class="space-y-3">
            <div 
              v-for="recommendation in recommendations"
              :key="recommendation.id"
              class="bg-white rounded-md p-4 border border-blue-200"
            >
              <div class="flex items-start gap-3">
                <div 
                  :class="[
                    'w-2 h-2 rounded-full mt-2',
                    recommendation.priority === 'high' ? 'bg-red-500' :
                    recommendation.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  ]"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">
                    {{ recommendation.title }}
                  </p>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ recommendation.description }}
                  </p>
                </div>
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
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { useRelationshipProgressionStore } from '@/stores/relationshipProgressionStore'
import { useOrganizationStore } from '@/stores/organizationStore'
import { RELATIONSHIP_STAGES } from '@/types/relationshipProgression.types'

// Components
import RelationshipStageBadge from '@/components/relationshipProgression/atomic/RelationshipStageBadge.vue'
import ProgressionArrow from '@/components/relationshipProgression/atomic/ProgressionArrow.vue'
import TrustActivityTypeIcon from '@/components/relationshipProgression/atomic/TrustActivityTypeIcon.vue'
import MilestoneCard from '@/components/relationshipProgression/molecular/MilestoneCard.vue'

// Lucide icons
import { 
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Heart,
  Activity,
  BarChart3,
  Check,
  Lightbulb
} from 'lucide-vue-next'

const route = useRoute()
const progressionStore = useRelationshipProgressionStore()
const organizationStore = useOrganizationStore()

// Reactive state
const loading = ref(false)
const timeRange = ref('90')

// Route params
const progressionId = computed(() => route.params.id as string)

// Computed data
const progression = computed(() => {
  return progressionStore.progressions.find(p => p.id === progressionId.value)
})

const organization = computed(() => {
  if (!progression.value) return null
  return organizationStore.organizations.find(org => org.id === progression.value!.organization_id)
})

const organizationName = computed(() => {
  return organization.value?.name || 'Unknown Organization'
})

const milestones = computed(() => {
  return progressionStore.getMilestonesForProgression(progressionId.value)
})

const trustActivities = computed(() => {
  return progressionStore.getTrustActivitiesForProgression(progressionId.value)
})

const sortedMilestones = computed(() => {
  return [...milestones.value].sort((a, b) => 
    new Date(b.achieved_date).getTime() - new Date(a.achieved_date).getTime()
  )
})

const topActivities = computed(() => {
  return [...trustActivities.value]
    .sort((a, b) => Math.abs(b.impact_on_trust) - Math.abs(a.impact_on_trust))
    .slice(0, 5)
})

// Analytics calculations
const previousStage = computed(() => {
  const currentStageIndex = RELATIONSHIP_STAGES.findIndex(s => s.value === progression.value?.current_stage)
  return currentStageIndex > 0 ? RELATIONSHIP_STAGES[currentStageIndex - 1].value : null
})

const progressionRate = computed(() => {
  // Calculate progression rate vs average (mock calculation)
  const currentStageIndex = RELATIONSHIP_STAGES.findIndex(s => s.value === progression.value?.current_stage)
  const expectedRate = (currentStageIndex + 1) * 25 // 25% per stage
  const actualRate = progression.value?.relationship_maturity_score || 0
  return Math.round(((actualRate - expectedRate) / expectedRate) * 100)
})

const trustMomentum = computed(() => {
  // Calculate 30-day trust momentum (mock calculation)
  const recentActivities = trustActivities.value.filter(activity => {
    const activityDate = new Date(activity.activity_date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return activityDate >= thirtyDaysAgo
  })
  
  return recentActivities.reduce((sum, activity) => sum + activity.impact_on_trust, 0)
})

const activityFrequency = computed(() => {
  // Calculate monthly activity frequency
  const monthlyActivities = trustActivities.value.length / 3 // Assume 3 months of data
  return Math.round(monthlyActivities * 10) / 10
})

const stageProgression = computed(() => {
  return RELATIONSHIP_STAGES.map(stage => {
    const currentStageIndex = RELATIONSHIP_STAGES.findIndex(s => s.value === progression.value?.current_stage)
    const stageIndex = RELATIONSHIP_STAGES.findIndex(s => s.value === stage.value)
    
    return {
      ...stage,
      achieved: stageIndex <= currentStageIndex,
      date: stageIndex <= currentStageIndex ? progression.value?.last_progression_update : undefined
    }
  })
})

const recommendations = computed(() => {
  const recs = []
  
  if (progression.value?.relationship_maturity_score < 70) {
    recs.push({
      id: 'maturity-low',
      priority: 'high',
      title: 'Focus on Trust Building Activities',
      description: 'The relationship maturity score is below optimal. Consider increasing face-to-face meetings and collaborative activities.'
    })
  }
  
  if (trustActivities.value.length < 5) {
    recs.push({
      id: 'activity-low',
      priority: 'medium',
      title: 'Increase Activity Frequency',
      description: 'More frequent trust-building activities could accelerate relationship progression.'
    })
  }
  
  if (progression.value?.contacts_engaged_count < 3) {
    recs.push({
      id: 'contacts-low',
      priority: 'medium',
      title: 'Expand Stakeholder Network',
      description: 'Engaging with more contacts within the organization could strengthen the relationship.'
    })
  }
  
  return recs
})

// Methods
function getImpactColor(impact: number) {
  if (impact > 2) return 'bg-green-500'
  if (impact > 0) return 'bg-blue-500'
  if (impact < -2) return 'bg-red-500'
  if (impact < 0) return 'bg-orange-500'
  return 'bg-gray-500'
}

function formatDate(dateString: string) {
  return format(new Date(dateString), 'MMM yyyy')
}

function exportAnalytics() {
  // TODO: Implement analytics export functionality
  console.log('Exporting analytics for:', progressionId.value)
}

// Initialize data
onMounted(async () => {
  if (!progression.value) {
    loading.value = true
    await progressionStore.fetchProgressions()
    await organizationStore.fetchOrganizations()
    loading.value = false
  }
})
</script>